import { describe, expect, it } from "vitest";
import { normalizePortableTextTable } from "@emdash-cms/admin/portable-text-table";
import { markNumericTableCells } from "../src/utils/table-cell";

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
