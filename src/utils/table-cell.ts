function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

const NUMERIC_CELL = /^[v^~]?\d[\d.\-/: ]*$/;
const URL_CELL = /^https?:\/\/\S+$/;
// 折れる可能性のある日付・数字の並び（2025-11-25、10/31 など）。`-` と `/` は途中で折れる文字なので、
// そのどちらかを1つ以上含む数字の並びを対象にする。`.` や `:` だけの並び（1.12.0、10:30）は折れないので対象外。
const BREAKABLE_NUMBER_RUN = /\d[\d\-/.:]*[-/][\d\-/.:]*/g;

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

function mapCells<T extends readonly unknown[] | undefined>(
	blocks: T,
	fn: (cell: Record<string, unknown>, index: number) => Record<string, unknown>,
): T {
	if (!blocks) return blocks;
	let index = 0;
	return blocks.map((block) => {
		if (!isRecord(block) || block._type !== "table" || !Array.isArray(block.rows)) return block;
		const rows = block.rows.map((row: unknown) => {
			if (!isRecord(row) || !Array.isArray(row.cells)) return row;
			return { ...row, cells: row.cells.map((cell: unknown) => (isRecord(cell) ? fn(cell, index++) : cell)) };
		});
		return { ...block, rows };
	}) as unknown as T;
}

/**
 * URL だけが書かれたセルを、描画のときにリンクにする（issue #76）。原稿の文字は変えず、
 * cell.markDefs に link の目印を足し、セルの span 全部にその目印を付ける。
 * EmDash の表の正規化は link 以外の markDefs を捨てるので、リンクに使えるのはこの形だけ。
 * リンクなので CSS の `td a` が効き、URL の途中で折ってよい。出典は別タブで開けるよう blank にする。
 */
export function linkifyUrlTableCells<T extends readonly unknown[] | undefined>(blocks: T): T {
	return mapCells(blocks, (cell, index) => {
		const text = cellText(cell);
		if (!URL_CELL.test(text)) return cell;
		const key = `auto-link-${index}`;
		const markDef = { _type: "link", _key: key, href: text, blank: true };
		const content = (Array.isArray(cell.content) ? cell.content : []).map((span: unknown) => {
			if (!isRecord(span) || span._type !== "span" || typeof span.text !== "string" || !span.text) return span;
			const marks = Array.isArray(span.marks) ? span.marks : [];
			if (marks.includes(key)) return span;
			return { ...span, marks: [...marks, key] };
		});
		const markDefs = Array.isArray(cell.markDefs) ? cell.markDefs : [];
		return { ...cell, content, markDefs: [...markDefs, markDef] };
	});
}

/**
 * 文と混ざったセルの中の日付・数字の並びを underline の目印で包む（issue #75）。
 * 原稿の文字は変えない。目印には underline を使う。markdown からは underline が出ない
 * （斜体は em、取り消し線は strike-through に分かれる）ので、書いた内容とぶつからない。
 * 描画では `<u>` になるので、[slug].astro の CSS で線を消して white-space: nowrap にする。
 * URL だけのセル（linkifyUrlTableCells がリンクにするもの）と、番号だけのセル
 * （markNumericTableCells がセルごと折らないもの）は対象外。表の見出しのセルも `th` で
 * 折らないので対象外。
 */
export function markBreakableNumberRuns<T extends readonly unknown[] | undefined>(blocks: T): T {
	let serial = 0;
	return mapCells(blocks, (cell) => {
		if (cell.isHeader === true) return cell;
		const text = cellText(cell);
		if (!text || URL_CELL.test(text) || NUMERIC_CELL.test(text)) return cell;
		const content = Array.isArray(cell.content) ? cell.content : [];
		let changed = false;
		const next: unknown[] = [];
		for (const span of content) {
			if (!isRecord(span) || span._type !== "span" || typeof span.text !== "string") {
				next.push(span);
				continue;
			}
			const marks = Array.isArray(span.marks) ? span.marks : [];
			const base = typeof span._key === "string" && span._key ? span._key : `n${serial++}`;
			let last = 0;
			let part = 0;
			for (const m of span.text.matchAll(BREAKABLE_NUMBER_RUN)) {
				const at = m.index;
				if (at > last) next.push({ ...span, _key: `${base}-n${part++}`, text: span.text.slice(last, at) });
				next.push({ ...span, _key: `${base}-n${part++}`, text: m[0], marks: [...marks, "underline"] });
				last = at + m[0].length;
				changed = true;
			}
			if (last === 0) {
				next.push(span);
			} else if (last < span.text.length) {
				next.push({ ...span, _key: `${base}-n${part++}`, text: span.text.slice(last) });
			}
		}
		return changed ? { ...cell, content: next } : cell;
	});
}

/** 記事ページが描画前に呼ぶ、表のセルへの目印づけをまとめたもの。原稿の文字は変えない。 */
export function markTableCells<T extends readonly unknown[] | undefined>(blocks: T): T {
	return linkifyUrlTableCells(markBreakableNumberRuns(markNumericTableCells(blocks)));
}
