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
 * - URL（https:// で始まる 1 語のセル）: textAlign "justify"。CSS がこのセルだけ途中で折ってよいことにする。

 * textAlign には、EmDash の表の正規化（@emdash-cms/admin の normalizeAlignment）が通す
 * left / center / right / justify しか使えない（それ以外は描画前に捨てられる）。
 * URL に空白は無いので justify でも見た目は変わらない。
 * どちらも、作者が textAlign を付けたセルには付けない。
 */
export function markNumericTableCells<T extends readonly unknown[] | undefined>(blocks: T): T {
	if (!blocks) return blocks;
	// セルに textAlign を足すだけで、ブロックの形は変えない。入力と同じ型として返す。
	return blocks.map((block) => {
		if (!isRecord(block) || block._type !== "table" || !Array.isArray(block.rows)) return block;
		const rows = block.rows.map((row: unknown) => {
			if (!isRecord(row) || !Array.isArray(row.cells)) return row;
			const cells = row.cells.map((cell: unknown) => {
				if (!isRecord(cell) || cell.textAlign) return cell;
				const text = cellText(cell);
				if (NUMERIC_CELL.test(text)) return { ...cell, textAlign: "left" };
				if (URL_CELL.test(text)) return { ...cell, textAlign: "justify" };
				return cell;
			});
			return { ...row, cells };
		});
		return { ...block, rows };
	}) as unknown as T;
}
