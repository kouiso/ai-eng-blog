import { describe, expect, it } from "vitest";
import { normalizePortableTextTable } from "@emdash-cms/admin/portable-text-table";
import { linkifyUrlTableCells, markBreakableNumberRuns, markNumericTableCells, markTableCells } from "../src/utils/table-cell";

const cell = (text: string, extra: Record<string, unknown> = {}) => ({
	_type: "tableCell",
	_key: text,
	content: [{ _type: "span", _key: "s", text }],
	...extra,
});
const table = (...texts: string[]) => ({
	_type: "table",
	_key: "t",
	rows: [{ _type: "tableRow", _key: "r", cells: texts.map((t) => cell(t)) }],
});
const aligned = (blocks: unknown[] | undefined) =>
	// biome-ignore lint/suspicious/noExplicitAny: テスト用に構造を直接読む
	(blocks as any[])[0].rows[0].cells.map((c: any) => c.textAlign);

describe("markNumericTableCells", () => {
	it("番号・日付・バージョンのセルに left、URL のセルに justify を付ける", () => {
		const out = markNumericTableCells([table("12", "@scope/sdk", "https://example.com/a-1", "2026-10-31", "1.12.0")]);
		expect(aligned(out)).toEqual(["left", undefined, "justify", "left", "left"]);
	});

	it("バージョン表記（v1.2.0、^1.4.0）も番号として扱う", () => {
		const out = markNumericTableCells([table("v1.2.0", "^1.4.0", "~2.0", "v", "version 1")]);
		expect(aligned(out)).toEqual(["left", "left", "left", undefined, undefined]);
	});

	it("https:// で始まる 1 語のセルには URL 用の目印（justify）を付ける", () => {
		const out = markNumericTableCells([
			table("https://docs.example.com/a/b-1", "http://x.test", "see https://x.test", "https://x.test is", "ftp://x.test"),
		]);
		expect(aligned(out)).toEqual(["justify", "justify", undefined, undefined, undefined]);
	});

	it("元のデータを書き換えず、表以外のブロックはそのまま返す", () => {
		const para = { _type: "block", _key: "p", children: [] };
		const src = [para, table("2026-10-31")];
		const out = markNumericTableCells(src);
		expect(out?.[0]).toBe(para);
		expect(aligned(src.slice(1))).toEqual([undefined]);
		expect(aligned(out?.slice(1))).toEqual(["left"]);
	});

	it("textAlign が既にあるセルと、形が違う表は触らない", () => {
		const center = { ...table("1"), rows: [{ _type: "tableRow", _key: "r", cells: [cell("1", { textAlign: "center" })] }] };
		expect(aligned(markNumericTableCells([center]))).toEqual(["center"]);
		const odd = { _type: "table", rows: "x" };
		expect(markNumericTableCells([odd])).toEqual([odd]);
		expect(markNumericTableCells(undefined)).toBeUndefined();
	});
});

describe("linkifyUrlTableCells", () => {
	// biome-ignore lint/suspicious/noExplicitAny: テスト用に構造を直接読む
	const cellsOf = (blocks: unknown[] | undefined) => (blocks as any[])[0].rows[0].cells;
	const linkDefs = (blocks: unknown[] | undefined) => cellsOf(blocks).map((c: Record<string, unknown>) => c.markDefs);
	const spanMarks = (blocks: unknown[] | undefined) =>
		cellsOf(blocks)[0].content.map((s: { marks?: string[] }) => s.marks);

	it("URL だけのセルに link の目印を足し、セルの文字と span は変えない", () => {
		const out = linkifyUrlTableCells([table("https://example.com/a-1", "see https://x.test", "題名")]);
		const defs = linkDefs(out);
		expect(defs[0]).toEqual([{ _type: "link", _key: "auto-link-0", href: "https://example.com/a-1", blank: true }]);
		expect(defs[1]).toBeUndefined();
		expect(defs[2]).toBeUndefined();
		expect(spanMarks(out)).toEqual([["auto-link-0"]]);
		// セルの文字はそのまま（読者が写す文字列が変わらない）
		expect(cellsOf(out)[0].content[0].text).toBe("https://example.com/a-1");
	});

	it("原稿で [URL](URL) や <URL> と書いてリンクの目印を持つセルには目印を足さず、そのリンクを別タブにする", () => {
		const authored = {
			_type: "tableCell",
			_key: "c",
			markDefs: [{ _type: "link", _key: "m1", href: "https://example.com/b" }],
			content: [{ _type: "span", _key: "s", text: "https://example.com/b", marks: ["m1"] }],
		};
		const out = linkifyUrlTableCells([{ _type: "table", _key: "t", rows: [{ _type: "tableRow", _key: "r", cells: [authored] }] }]);
		// 目印を2つ付けると <a> が入れ子になり、見えるリンクが別タブで開かない
		expect(linkDefs(out)[0]).toEqual([{ _type: "link", _key: "m1", href: "https://example.com/b", blank: true }]);
		expect(spanMarks(out)).toEqual([["m1"]]);
		expect(authored.markDefs[0]).not.toHaveProperty("blank");
	});

	it("元のデータを書き換えず、付けた目印は EmDash の表の正規化を通る", () => {
		const src = table("https://example.com/a-1");
		const out = linkifyUrlTableCells([src]);
		expect((src.rows[0].cells[0] as Record<string, unknown>).markDefs).toBeUndefined();
		const result = normalizePortableTextTable(out?.[0], { path: "test", createKey: () => "k" });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const cell = result.table.rows[0].cells[0];
		expect(cell.markDefs?.[0]?._type).toBe("link");
		expect(cell.content[0].marks).toContain("auto-link-0");
	});
});

describe("markBreakableNumberRuns", () => {
	// biome-ignore lint/suspicious/noExplicitAny: テスト用に構造を直接読む
	const cellsOf = (blocks: unknown[] | undefined) => (blocks as any[])[0].rows[0].cells;
	const texts = (blocks: unknown[] | undefined) => cellsOf(blocks)[0].content.map((s: { text: string }) => s.text);
	const marks = (blocks: unknown[] | undefined) =>
		cellsOf(blocks)[0].content.map((s: { marks?: string[] }) => s.marks);

	it("文と混ざったセルの日付だけを underline の目印で包み、前後の文字は変えない", () => {
		const out = markBreakableNumberRuns([table("MCP Specification 2025-11-25 Transports")]);
		expect(texts(out)).toEqual(["MCP Specification ", "2025-11-25", " Transports"]);
		expect(marks(out)).toEqual([undefined, ["underline"], undefined]);
	});

	it("番号だけ・URL だけ・見出しのセルは触らない", () => {
		const out = markBreakableNumberRuns([
			table("2026-10-31", "https://example.com/a-1", "文だけのセル"),
		]);
		for (const c of cellsOf(out)) {
			expect(c.content).toHaveLength(1);
		}
		const header = { ...table("項目 2025-11-25"), rows: [{ _type: "tableRow", _key: "r", cells: [cell("項目 2025-11-25", { isHeader: true })] }] };
		expect(cellsOf(markBreakableNumberRuns([header]))[0].content).toHaveLength(1);
	});

	it("`-` や `/` の無い数字の並びは包まない（折れないため）", () => {
		const out = markBreakableNumberRuns([table("バージョン 1.12.0 と 10:30")]);
		expect(texts(out)).toEqual(["バージョン 1.12.0 と 10:30"]);
	});

	it("span の既存の目印（code など）は残し、元のデータを書き換えない", () => {
		const coded = {
			_type: "tableCell",
			_key: "c",
			content: [{ _type: "span", _key: "s", text: "fix in 2025-11-25 build", marks: ["code"] }],
		};
		const src = { ...table("x"), rows: [{ _type: "tableRow", _key: "r", cells: [coded] }] };
		const out = markBreakableNumberRuns([src]);
		expect(marks(out)).toEqual([["code"], ["code", "underline"], ["code"]]);
		expect(src.rows[0].cells[0].content).toHaveLength(1);
	});
	it("複数の並びがあっても全部包む", () => {
		const out = markBreakableNumberRuns([table("公開 2025-11-25 と確認 2026-10-31")]);
		expect(texts(out)).toEqual(["公開 ", "2025-11-25", " と確認 ", "2026-10-31"]);
	});

	it("付けた目印は EmDash の表の正規化を通る", () => {
		const out = markBreakableNumberRuns([table("MCP Specification 2025-11-25 Transports")]);
		const result = normalizePortableTextTable(out?.[0], { path: "test", createKey: () => "k" });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const spans = result.table.rows[0].cells[0].content;
		expect(spans[1].text).toBe("2025-11-25");
		expect(spans[1].marks).toContain("underline");
	});
});

describe("markTableCells", () => {
	it("3つの目印づけをまとめて行い、目印は全部正規化を通る", () => {
		const out = markTableCells([table("https://example.com/a-1", "2026-10-31", "Spec 2025-11-25")]);
		const result = normalizePortableTextTable(out?.[0], { path: "test", createKey: () => "k" });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const cells = result.table.rows[0].cells;
		expect(cells[0].markDefs?.[0]?._type).toBe("link");
		expect(cells[0].textAlign).toBe("justify");
		expect(cells[1].textAlign).toBe("left");
		expect(cells[2].content.some((s) => s.marks?.includes("underline"))).toBe(true);
	});
});

describe("目印の値が EmDash の表の正規化を通る", () => {
	// node_modules/@emdash-cms/admin/dist/portable-text-table.js の normalizeAlignment は
	// left / center / right / justify 以外を捨てる。捨てられると CSS の目印が効かない。
	it("left と justify が描画前に残る", () => {
		const marked = markNumericTableCells([table("2026-10-31", "https://example.com/a")]);
		const result = normalizePortableTextTable(marked?.[0], { path: "test", createKey: () => "k" });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.table.rows[0].cells.map((c) => c.textAlign)).toEqual(["left", "justify"]);
	});
});
