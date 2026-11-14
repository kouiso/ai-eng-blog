function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

const NUMERIC_CELL = /^[v^~]?\d[\d.\-/: ]*$/;
const URL_CELL = /^https?:\/\/\S+$/;

function cellText(cell: Record<string, unknown>): string {
	const content = Array.isArray(cell.content) ? cell.content : [];
	return content
		.map((span: unknown) => (isRecord(span) && typeof span.text === "string" ? span.text : ""))
		.join("")
		.trim();
}

/**
 * 表のセルには class を付けられないので、描画側が style 属性として出す textAlign を目印に使う。
 * - 番号・日付・バージョン（2026-10-31、1.12.0、v1.2.0、^1.4.0 など）: textAlign "left"。
 *   [slug].astro の CSS がこのセルだけ折り返さない。
 * - URL（https:// で始まる 1 語のセル）: textAlign "start"。CSS がこのセルだけ途中で折ってよいことにする。
 * どちらも、作者が textAlign を付けたセルには付けない。
 */
export function markNumericTableCells(blocks: readonly unknown[] | undefined): unknown[] | undefined {
	if (!blocks) return undefined;
	return blocks.map((block) => {
		if (!isRecord(block) || block._type !== "table" || !Array.isArray(block.rows)) return block;
		const rows = block.rows.map((row: unknown) => {
			if (!isRecord(row) || !Array.isArray(row.cells)) return row;
			const cells = row.cells.map((cell: unknown) => {
				if (!isRecord(cell) || cell.textAlign) return cell;
				const text = cellText(cell);
				if (NUMERIC_CELL.test(text)) return { ...cell, textAlign: "left" };
				if (URL_CELL.test(text)) return { ...cell, textAlign: "start" };
				return cell;
			});
			return { ...row, cells };
		});
		return { ...block, rows };
	});
}
