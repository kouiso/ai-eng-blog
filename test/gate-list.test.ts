import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// scripts/gate-list.py（全記事の公開前ゲートの一覧。issue #17、#44）の試験。python3 が要る。無ければ落ちる（飛ばさない）。
const script = resolve(__dirname, "../scripts/gate-list.py");
const fixtures = resolve(__dirname, "fixtures/gate-list");

function run(args: string[], root = fixtures) {
	const r = spawnSync("python3", [script, "--root", root, ...args], { encoding: "utf8" });
	if (r.error) throw r.error;
	return { code: r.status, out: r.stdout, err: r.stderr };
}

describe("gate-list.py", () => {
	it("形の合った gate.md を一覧にし、全部 OK の記事だけを合格にする", () => {
		const r = run(["ok", "ng"]);
		expect(r.code, r.err).toBe(0);
		expect(r.out).toContain("| ok | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 合格 |");
		expect(r.out).toContain("| ng | OK | OK | OK | OK | OK | OK | NG | OK | OK | OK | OK | 不合格 |");
		expect(r.out).toContain("2本のうち、G01〜G11 がすべて OK の記事: 1本、NG は無いが未判定がある記事: 0本、NG がある記事: 1本");
		expect(r.out).toContain("G07 1、");
	});

	it("NG が無く未判定だけがある記事は「未判定あり」にし、まとめにも数える", () => {
		const r = run(["ok", "ng", "pending"]);
		expect(r.code, r.err).toBe(0);
		expect(r.out).toContain("| pending | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 未判定 | 未判定あり |");
		expect(r.out).toContain("3本のうち、G01〜G11 がすべて OK の記事: 1本、NG は無いが未判定がある記事: 1本、NG がある記事: 1本");
	});

	it("コードフェンスの中の見出し・gate: の行・## は無いものとして読む", () => {
		for (const slug of ["fence-heading", "fence-after", "fence-gate"]) {
			const r = run([slug]);
			expect(r.code, `${slug}: ${r.err}`).toBe(0);
			expect(r.out).toContain(`| ${slug} | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 合格 |`);
		}
	});

	it("リストの項目の中のフェンス、混ぜた字・info つき・全角空白つきの行ではフェンスを閉じない、``` の info に ` があればフェンスではない", () => {
		for (const slug of ["fence-list-item", "fence-mixed-char", "fence-closer-info", "fence-info-backtick", "fence-fullwidth-close"]) {
			const r = run([slug]);
			expect(r.code, `${slug}: ${r.err}`).toBe(0);
			expect(r.out).toContain(`| ${slug} | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 合格 |`);
		}
	});

	it("引用・番号つきリストの中のフェンス、4つの閉じ、info の ` つきの ~~~、見出しの後ろの全角空白を正しく読む", () => {
		for (const slug of ["fence-quote", "fence-list-ordered", "fence-tilde-info-backtick", "fence-longer-closer", "heading-fullwidth-trailing"]) {
			const r = run([slug]);
			expect(r.code, `${slug}: ${r.err}`).toBe(0);
			expect(r.out).toContain(`| ${slug} | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 合格 |`);
		}
	});

	it("入れ物（リストの項目・引用）が終われば、閉じていないフェンスもそこで終わる", () => {
		for (const slug of ["fence-list-ended", "fence-quote-ended", "fence-list-ended-by-heading", "fence-quote-ended-by-heading"]) {
			const r = run([slug]);
			expect(r.code, `${slug}: ${r.err}`).toBe(0);
			expect(r.out).toContain(`| ${slug} | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 合格 |`);
		}
	});

	it("リストの項目の字下げより浅い行でフェンスは終わり、その行の gate: は節の外のものとして数える", () => {
		const r = run(["fence-list-dedent"]);
		expect(r.code).toBe(1);
		expect(r.err).toContain("節の外にもあります");
	});

	it("`` の2つ並びはフェンスではないので、後ろの ## を見つけて落とす", () => {
		const r = run(["fence-two-backticks"]);
		expect(r.code).toBe(1);
		expect(r.err).toContain("ファイルの最後に置きます");
	});

	it("--tsv でタブ区切りに出し、まとめの行は標準エラーに出す", () => {
		const r = run(["--tsv", "ok"]);
		expect(r.code).toBe(0);
		const lines = r.out.trimEnd().split("\n");
		expect(lines[0]).toBe(["slug", "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "合否"].join("\t"));
		expect(lines).toHaveLength(2);
		expect(r.err).toContain("1本のうち");
	});

	it("表の最後の行の判定と機械で読む行が合っていれば通す（「OK（注記あり）」は OK）", () => {
		const r = run(["table-ok"]);
		expect(r.code, r.err).toBe(0);
	});

	it("CRLF と BOM、見出しと行の末尾の空白があっても読める", () => {
		const r = run(["crlf-bom"]);
		expect(r.code, r.err).toBe(0);
		expect(r.out).toContain("| crlf-bom | OK |");
	});

	it("同じ記事を2回指定しても1本と数える", () => {
		expect(run(["ok", "ok"]).out).toContain("1本のうち");
	});

	it.each([
		["no-section", "「## 機械で読む合否」の節がありません"],
		["bad-verdict", "G05 の判定「OK（注記あり）」は OK・NG・未判定 のどれでもありません"],
		["missing-gate", "G10 がありません"],
		["two-lines", "「gate:」の行が 2 行あります"],
		["not-last", "節はファイルの最後に置きます"],
		["table-mismatch", "G07 が表の最後の行では NG、機械で読む行では OK です"],
		["does-not-exist", "がありません"],
	])("%s は読めないとして終了コード 1", (slug, message) => {
		const r = run(["ok", slug]);
		expect(r.code).toBe(1);
		expect(r.err).toContain(`[ERROR] ${slug}: `);
		expect(r.err).toContain(message);
		// 読めた記事の行は出し続ける
		expect(r.out).toContain("| ok |");
	});

	it.each(["fence-a1-yaml-list", "fence-a2-diff", "fence-a4-tab", "fence-a5-nested", "fence-a7-ordered"])(
		"%s: リストの項目の中のフェンスにある「- 」「1. 」やタブの行で早く閉じず、隠れない表の NG を見つける",
		(slug) => {
			const r = run([slug]);
			expect(r.code).toBe(1);
			expect(r.err).toContain(`[ERROR] ${slug}: G03 が表の最後の行では NG、機械で読む行では OK です`);
		},
	);

	it.each(["fence-quote-unindented-closer", "fence-list-unindented-closer"])(
		"%s: 引用・リストのフェンスは字下げしない ``` で閉じず、後ろの偽の節ではなく本当の節（G01=NG）を読む",
		(slug) => {
			const r = run([slug]);
			expect(r.code, r.err).toBe(0);
			expect(r.out).toContain(`| ${slug} | NG | OK |`);
			expect(r.out).toContain("不合格");
		},
	);

	it("リストの項目の続きの行で開いたフェンスは、項目が終わるところで閉じ、後ろの節を読む", () => {
		const r = run(["fence-list-continuation"]);
		expect(r.code, r.err).toBe(0);
		expect(r.out).toContain("| fence-list-continuation | OK |");
	});

	// CommonMark のパーサー（micromark）でコードブロックの行を数えた結果と同じになることを確かめる。
	// どれも後ろの偽の節（gate: がすべて OK）がコードの中に入り、本当の節の G01=NG を読むのが正しい。
	it.each([
		"fence-cm-quote-fence-stale-item",
		"fence-cm-quote-fence-stale-item-unclosed",
		"fence-cm-nested-misindented-closer",
		"fence-cm-nested-misindented-closer-no-fake",
		"fence-cm-marker-misindented-closer",
		"fence-cm-hr",
		"fence-cm-ordered2-in-para",
		// 1行目が --- の gate.md。記事の frontmatter として外さず、横線として読む
		"fence-cm-leading-hr",
	])("%s: CommonMark のパーサーが決めたコードブロックに従い、本当の節の G01=NG を読む", (slug) => {
		const r = run([slug]);
		expect(r.code, r.err).toBe(0);
		expect(r.out).toContain(`| ${slug} | NG | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 不合格 |`);
	});

	it("node を動かせないときは、手で読む方法に切りかえず、理由を出して終了コード 1", () => {
		// PATH から node だけを消すため、python3 は先に絶対パスで探しておく
		const python = spawnSync("sh", ["-c", "command -v python3"], { encoding: "utf8" }).stdout.trim();
		const r = spawnSync(python, [script, "--root", fixtures, "ok"], { encoding: "utf8", env: { ...process.env, PATH: "/nonexistent" } });
		expect(r.status).toBe(1);
		expect(r.stderr).toContain("node を動かせません");
		expect(r.stdout).not.toContain("合格");
	});

	it("リポジトリの全記事の gate.md に、読める合否の行がある", () => {
		const r = run(["--tsv"], resolve(__dirname, ".."));
		expect(r.code, r.err).toBe(0);
		const rows = r.out.split("\n").filter((l) => l.includes("\t") && !l.startsWith("slug\t"));
		expect(rows.length).toBe(30);
		// 記事1本ごとに node を1回起こすので、30本で数秒かかる。遅い CI でも落ちないよう時間の上限を広げる
	}, 60_000);
});
