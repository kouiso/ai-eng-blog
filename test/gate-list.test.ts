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
		expect(r.out).toContain("2本のうち、G01〜G11 がすべて OK の記事: 1本");
		expect(r.out).toContain("G07 1、");
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

	it("リポジトリの全記事の gate.md に、読める合否の行がある", () => {
		const r = run(["--tsv"], resolve(__dirname, ".."));
		expect(r.code, r.err).toBe(0);
		const rows = r.out.split("\n").filter((l) => l.includes("\t") && !l.startsWith("slug\t"));
		expect(rows.length).toBe(30);
	});
});
