function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

const NUMERIC_CELL = /^\d[\d.\-/: ]*$/;

function cellText(cell: Record<string, unknown>): string {
	const content = Array.isArray(cell.content) ? cell.content : [];
	return content
		.map((span: unknown) => (isRecord(span) && typeof span.text === "string" ? span.text : ""))
		.join("")
		.trim();
}

/**
 * 表の中の番号・日付・バージョン（2026-10-31、1.12.0 など）のセルに textAlign: "left" を付ける。
 * 表のセルには class を付けられないので、描画側が style 属性として出すこの値を
 * [slug].astro の CSS が目印にして、そのセルだけ折り返さない。
 */
export function markNumericTableCells(blocks: readonly unknown[] | undefined): unknown[] | undefined {
	if (!blocks) return undefined;
	return blocks.map((block) => {
		if (!isRecord(block) || block._type !== "table" || !Array.isArray(block.rows)) return block;
		const rows = block.rows.map((row: unknown) => {
			if (!isRecord(row) || !Array.isArray(row.cells)) return row;
			const cells = row.cells.map((cell: unknown) =>
				isRecord(cell) && !cell.textAlign && NUMERIC_CELL.test(cellText(cell))
					? { ...cell, textAlign: "left" }
					: cell,
			);
			return { ...row, cells };
		});
		return { ...block, rows };
	});
}
