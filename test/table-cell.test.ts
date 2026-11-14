import { describe, expect, it } from "vitest";
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
	it("番号・日付・バージョンのセルだけに目印を付ける", () => {
		const out = markNumericTableCells([table("12", "@scope/sdk", "https://example.com/a-1", "2026-10-31", "1.12.0")]);
		expect(aligned(out)).toEqual(["left", undefined, undefined, "left", "left"]);
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
