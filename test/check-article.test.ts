import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// scripts/check-article.py（記事ごとの検査。issue #42）の試験。
// 標準ライブラリだけの Python なので python3 が要る。無ければ試験は落ちる（飛ばさない）。
const script = resolve(__dirname, "../scripts/check-article.py");
const root = resolve(__dirname, "fixtures/check-article");
const exceptions = resolve(root, "exceptions.json");

function check(only: "prose" | "outputs", slug: string) {
	const r = spawnSync("python3", [script, "--root", root, "--exceptions", exceptions, "--only", only, slug], { encoding: "utf8" });
	if (r.error) throw r.error;
	return { code: r.status, out: r.stdout };
}

describe("python3", () => {
	it("使える（無ければこの試験が落ちる）", () => {
		const r = spawnSync("python3", ["--version"], { encoding: "utf8" });
		expect(r.error).toBeUndefined();
		expect(r.status).toBe(0);
	});
});

describe("確定の検査は、通る記事と落ちる記事で試す", () => {
	it("通る記事は prose も outputs も exit 0", () => {
		for (const only of ["prose", "outputs"] as const) {
			const r = check(only, "ok");
			expect(r.code, r.out).toBe(0);
			expect(r.out).toContain("確定 0");
		}
	});

	it.each([
		["C17", "c17", "同じ語尾が3回以上連続（checklist C17）"],
		["C25", "c25", "60字超（checklist C25）"],
		["C30", "c30", "`**` が残っている（checklist C30）"],
		["C31", "c31", "em-dash（checklist C31）"],
		["C32", "c32", "`：`+半角スペースと `／`（checklist C32）"],
	])("%s: %s で exit 1", (id, slug) => {
		const r = check("prose", slug);
		expect(r.code, r.out).toBe(1);
		expect(r.out).toContain(`[FAIL ${id}]`);
	});

	it("C17 は語尾3字が違っても、名指しの4語尾（です）の一致で落ちる", () => {
		const r = check("prose", "c17-four");
		expect(r.code, r.out).toBe(1);
		expect(r.out).toContain("語尾「です」");
	});

	it("C25 は60字までは通り、61字から落ちる", () => {
		expect(check("prose", "c25-60").code).toBe(0);
		expect(check("prose", "c25-61").code).toBe(1);
	});

	it.each([
		["frontmatter", "c25-fm"],
		["表の中の文", "c25-cell"],
		["見出し", "c25-heading"],
	])("C25 は %s も数える", (_label, slug) => {
		const r = check("prose", slug);
		expect(r.code, r.out).toBe(1);
		expect(r.out).toContain("[FAIL C25]");
	});

	it("C17 は見出しと表のセルを並びに入れない", () => {
		const r = check("prose", "c17-nonprose");
		expect(r.code, r.out).toBe(0);
		expect(r.out).not.toContain("[FAIL C17]");
	});

	it("C17 は箇条書きの文を並びに入れる", () => {
		const r = check("prose", "c17-list");
		expect(r.code, r.out).toBe(1);
		expect(r.out).toContain("[FAIL C17]");
	});

	it("C17 は「ます」の3連続も数え、です、ます、でした が混ざる並びは数えない", () => {
		expect(check("prose", "c17-masu").out).toContain("語尾「ます」");
		const r = check("prose", "c17-mixed");
		expect(r.code, r.out).toBe(0);
		expect(r.out).not.toContain("[FAIL C17]");
	});

	it("C30 から C32 は、コードブロックとインラインコードの中の記号を数えない", () => {
		const r = check("prose", "c30-32-code");
		expect(r.code, r.out).toBe(0);
		expect(r.out).toContain("確定 0");
	});

	it("C25 は、セル全体が URL 1つだけのセルを数えず、60字超のものを行つきで一覧に出す", () => {
		const r = check("prose", "c25-url-cell");
		expect(r.code, r.out).toBe(0);
		expect(r.out).toContain("セル全体が URL 1つ）: 1件");
		expect(r.out).toMatch(/\[SKIP C25-URL\] c25-url-cell\.md:10 /);
	});

	it("C25 は、URL と語が混じるセルを全体で数える", () => {
		const r = check("prose", "c25-url-words");
		expect(r.code, r.out).toBe(1);
		expect(r.out).toContain("[FAIL C25]");
	});

	it("C32 は `： ` と `／` を別々に数える", () => {
		expect(check("prose", "c32").out.match(/\[FAIL C32\]/g)).toHaveLength(2);
	});
});

describe("候補の検査は一覧に出すだけで exit 0", () => {
	it.each([
		["C16", "c16"],
		["C26", "c26"],
		["C28", "c28"],
	])("%s", (id, slug) => {
		const r = check("prose", slug);
		expect(r.code, r.out).toBe(0);
		expect(r.out).toContain(`[候補 ${id}]`);
		expect(r.out).not.toContain("[FAIL");
	});
});

describe("出力ブロックと run ログの照合", () => {
	it("一致しないブロックは落ちる", () => {
		const r = check("outputs", "out-unmatched");
		expect(r.code).toBe(1);
		expect(r.out).toContain("[FAIL OUTPUT]");
	});

	it("出力の見出しが無いログ（書式に沿わないログ）は落ちる", () => {
		const r = check("outputs", "out-nonconform");
		expect(r.code).toBe(1);
		expect(r.out).toContain("書式に沿っていない");
	});

	it("run ディレクトリが無い記事は落ちる（飛ばさない）", () => {
		const r = check("outputs", "out-norun");
		expect(r.code).toBe(1);
		expect(r.out).toContain("run ディレクトリが無い");
	});

	it("連続した抜き出しは通り、離れた行を拾った抜き出しは落ちる", () => {
		expect(check("outputs", "out-excerpt").code).toBe(0);
		expect(check("outputs", "out-noncontiguous").code).toBe(1);
	});

	it("古い書式（`$ コマンド` と `----` で囲んだ出力）のログも読む", () => {
		const r = check("outputs", "out-legacy");
		expect(r.code, r.out).toBe(0);
	});

	it("古い書式でも `----` が2本でないログは書式違反のまま", () => {
		const r = check("outputs", "out-legacy-bad");
		expect(r.code).toBe(1);
		expect(r.out).toContain("書式に沿っていない");
	});

	it("出力の途中の `--- server stderr ---` を含むブロックも通る", () => {
		const r = check("outputs", "out-inner-header");
		expect(r.code, r.out).toBe(0);
	});

	it("例外は理由つきで数えて表示し、通る", () => {
		const r = check("outputs", "out-exc-ok");
		expect(r.code, r.out).toBe(0);
		expect(r.out).toContain("例外 1件");
		expect(r.out).toContain("ファイル構成の図");
	});

	it("理由の無い例外は落ちる", () => {
		const r = check("outputs", "out-exc-noreason");
		expect(r.code).toBe(1);
		expect(r.out).toContain("reason");
	});

	it("どのブロックにも当たらない古い例外は落ちる", () => {
		const r = check("outputs", "out-exc-stale");
		expect(r.code).toBe(1);
		expect(r.out).toContain("古い");
	});
});

describe("使い方", () => {
	it("記事が無ければ exit 2", () => {
		const r = check("prose", "no-such-article");
		expect(r.code).toBe(2);
	});
});
