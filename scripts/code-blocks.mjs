#!/usr/bin/env node
// 記事の Markdown からコードブロックを取り出し、JSON で出す（scripts/check-article.py が呼ぶ）。
//
// 使い方: node scripts/code-blocks.mjs <記事.md>
// 出力: [{ "start": 開く行, "end": 終わりの行, "lang": 情報文字列の最初の語（字下げしたコードは ""）, "value": 中身 }]
//   行番号は frontmatter を含めたファイルの行番号。value は字下げや引用の目印を外した中身（最後の改行は含まない）。
//
// フェンスの見分けは CommonMark のパーサー（mdast-util-from-markdown）に任せる。字下げ、箇条書きと引用の中、
// 段落の途中の行、閉じないままの終わりなどを手で読むと、取りこぼしと読み違いが続いたため（PR #102 のレビュー）。
// frontmatter は本文ではないので、パーサーに渡す前に外し、行番号だけ足して戻す。
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { fromMarkdown } from "mdast-util-from-markdown";

/** frontmatter（1行目の --- から次の --- まで）を外した本文と、外した行数を返す */
export function splitFrontmatter(text) {
	const lines = text.split("\n");
	if (lines[0] !== "---") return { body: text, offset: 0 };
	const end = lines.indexOf("---", 1);
	if (end < 0) return { body: text, offset: 0 };
	return { body: lines.slice(end + 1).join("\n"), offset: end + 1 };
}

/** 記事の Markdown のコードブロックを、出てくる順に返す */
export function codeBlocks(text) {
	const { body, offset } = splitFrontmatter(text.replace(/\r\n/g, "\n"));
	const out = [];
	const walk = (node) => {
		if (node.type === "code") {
			out.push({
				start: node.position.start.line + offset,
				end: node.position.end.line + offset,
				lang: node.lang ?? "",
				value: node.value,
			});
			return;
		}
		for (const child of node.children ?? []) walk(child);
	};
	walk(fromMarkdown(body));
	return out;
}

// ほかのスクリプトから import されたときは動かさない（直接起動したときだけ JSON を出す）。
// import.meta.url は実体のパスなので、起動したパスもシンボリックリンクを解いてから比べる（macOS の /tmp など）
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href && process.argv[2]) {
	process.stdout.write(`${JSON.stringify(codeBlocks(readFileSync(process.argv[2], "utf8")))}\n`);
}
