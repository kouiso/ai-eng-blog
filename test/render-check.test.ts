import { describe, expect, it } from "vitest";
import { assertLocalUrl, compare, expectedCells, expectedTables, frontmatterOf, inspectHtml } from "../scripts/render-check.mjs";

const md = [
	"---",
	'title: "題"',
	'tags: ["LLM API", "TypeScript"]',
	"course_step: 1",
	"---",
	"## 見出し",
	"",
	"| 番号 | URL |",
	"|---|---|",
	"| 1 | https://example.com/a |",
	"",
	"```text",
	"| コードの中の表は数えない |",
	"```",
].join("\n");

// 記事ページ（src/pages/posts/[slug].astro）と同じ形の箱に本文を入れる
const page = (prose: string) =>
	`<html><body><article class="card article"><h1>題</h1><div class="prose" data-prose data-astro-cid-x>${prose}</div><nav class="chips"></nav></article><aside><p>| 箱の外は見ない |</p></aside></body></html>`;
const linkedCell = '<td><a href="https://example.com/a" target="_blank" rel="noopener noreferrer">https://example.com/a</a></td>';
const goodTable = `<table><tbody><tr><th>番号</th><th>URL</th></tr><tr><td>1</td>${linkedCell}</tr></tbody></table>`;

describe("render-check", () => {
	it("原稿のパイプの表を数える（コードブロックの中は数えない）", () => {
		expect(expectedTables(md)).toBe(1);
	});

	it("frontmatter のダブルクオートの値と JSON 形の一覧を読む", () => {
		expect(frontmatterOf(md)).toEqual({ title: "題", tags: ["LLM API", "TypeScript"] });
	});

	it("書いたとおりに描画されていれば、落ちた理由は0件", () => {
		const r = compare(md, page(`<h2>見出し</h2>${goodTable}<pre><code>| コードの中の表は数えない |</code></pre>`));
		expect(r.problems).toEqual([]);
		expect(r.got).toMatchObject({ tables: 1, codeCells: 0, linkCells: 0, raw: [], urlCells: [{ url: "https://example.com/a", linked: true }] });
	});

	it("表が段落のまま出たら（EmDash 1.4.0 の症状）、表の数と記号の残りで落ちる", () => {
		const r = compare(md, page("<h2>見出し</h2><p>| 番号 | URL |\n|---|---|\n| 1 | https://example.com/a |</p>"));
		expect(r.problems).toContain("表の数: 原稿 1、描画 0");
		expect(r.got.raw.map((x) => x.label)).toContain("表の行");
	});

	it("セルのインラインコードとリンクが <code> と <a> になっていなければ落ちる", () => {
		const cellMd = ["| コマンド | 記事 |", "|---|---|", "| `npm i` | [前の記事](/posts/a) |"].join("\n");
		expect(expectedCells(cellMd)).toEqual({ code: 1, link: 1 });
		const ok = compare(cellMd, page('<table><tr><th>コマンド</th><th>記事</th></tr><tr><td><code>npm i</code></td><td><a href="/posts/a">前の記事</a></td></tr></table>'));
		expect(ok.problems).toEqual([]);
		const ng = compare(cellMd, page("<table><tr><th>コマンド</th><th>記事</th></tr><tr><td>`npm i`</td><td>前の記事</td></tr></table>"));
		expect(ng.problems).toEqual(["コードを含むセル: 原稿 1、描画 0", "リンクを含むセル: 原稿 1、描画 0"]);
	});

	it("URL だけのセルがリンクになっていなければ落ちる", () => {
		const r = compare(md, page("<table><tbody><tr><td>1</td><td>https://example.com/a</td></tr></tbody></table>"));
		expect(r.problems).toEqual(["URL のセルがリンクになっていない: https://example.com/a"]);
	});

	it("別タブで開く印（target と rel）が無いリンクは、リンクになっていないと数える", () => {
		const r = compare(md, page('<table><tbody><tr><td><a href="https://example.com/a">https://example.com/a</a></td></tr></tbody></table>'));
		expect(r.got.urlCells).toEqual([{ url: "https://example.com/a", linked: false }]);
	});

	it.each([
		["見出しの #", "<p>## 見出し</p>"],
		["太字の **", "<li>とても **大事**</li>"],
		["リンクの [..](..)", "<td>[出典](https://example.com)</td>"],
		["コードの ```", "<p>```ts</p>"],
		["引用の >", "<p>&gt; 引用</p>"],
		["箇条書きの記号", "<p>- 項目</p>"],
	])("%s が残った段落を見つける", (label, html) => {
		expect(inspectHtml(page(html)).raw.map((x) => x.label)).toContain(label);
	});

	it("見出しやセルの「1. 準備」は書いたとおりの文字なので落とさない。コードの中も見ない", () => {
		const r = inspectHtml(page("<h2>1. 準備は npm install</h2><table><tr><td>1. 絶対パスを断る</td></tr></table><p>使い方は <code>**x**</code> です</p>"));
		expect(r.raw).toEqual([]);
	});

	it("本文の箱（data-prose）が無いページは、確かめられないので投げる", () => {
		expect(() => inspectHtml("<html><body><p>404</p></body></html>")).toThrow(/data-prose/);
	});

	it.each(["http://localhost:8787", "http://127.0.0.1:8787/", "http://[::1]:8787"])("ローカルの URL（%s）は通す", (url) => {
		expect(() => assertLocalUrl(url)).not.toThrow();
	});

	it.each(["https://ai-eng-blog.kouiso.workers.dev", "http://localhost.example.com:8787"])("ローカル以外の URL（%s）は拒む", (url) => {
		expect(() => assertLocalUrl(url)).toThrow(/ローカルの URL ではありません/);
	});
});
