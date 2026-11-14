#!/usr/bin/env node
// content/articles/*.md の本文（frontmatter を除く）で使っている Markdown の書き方を数える。
// EmDash の MCP `content_create` が Markdown を Portable Text に変換する関数
// （emdash/client の markdownToPortableText）に各記事を通し、変換されずに記号が残る箇所も数える。
//
// 使い方:
//   node scripts/markdown-inventory.mjs                 # 書き方ごとの集計（Markdown の表）
//   node scripts/markdown-inventory.mjs --per-article   # 記事ごとの内訳も出す
//   node scripts/markdown-inventory.mjs --json          # JSON で出す
//   node scripts/markdown-inventory.mjs --dir <フォルダ> # 記事のフォルダを変える（既定 content/articles）
//
// 数え方: 行ごとの正規表現で数える。コードブロックの中身は書き方として数えない（コードブロックは1個と数える）。
// インラインの記法は、インラインコードを伏せたあとの文字列で数える。CommonMark の完全な解析ではないので、
// 数は目安（個数の桁が合っていれば判断には足りる）。変換の確認は --json の simulate 部分を見る。
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

/** frontmatter を取り除いた本文を返す */
export function bodyOf(text) {
	const m = text.match(/^---\n[\s\S]*?\n---\n/);
	return m ? text.slice(m[0].length) : text;
}

/** パイプの表の1行をセルに分ける（`\|` はセルの区切りにしない。インラインコードの中の `|` は区切りとして扱う CommonMark/GFM の挙動に合わせる） */
function splitCells(line) {
	const s = line.trim().replace(/^\|/, "").replace(/\|$/, "");
	const cells = [];
	let cur = "";
	for (let i = 0; i < s.length; i++) {
		if (s[i] === "\\" && s[i + 1] === "|") {
			cur += "\\|";
			i++;
		} else if (s[i] === "|") {
			cells.push(cur);
			cur = "";
		} else cur += s[i];
	}
	cells.push(cur);
	return cells;
}

const mask = (s) => s.replace(/`[^`]*`/g, "\u0001");

/** 1本分の本文から、書き方ごとの個数を数える */
export function inventory(body) {
	const c = {};
	const langs = {};
	const add = (k, n = 1) => {
		c[k] = (c[k] ?? 0) + n;
	};
	const lines = body.split("\n");
	let fence = null; // { marker, indented }
	let prevKind = "blank"; // blank | para | list | table | other
	let paraLines = 0;
	const endPara = () => {
		if (paraLines > 1) add("段落: 複数行（1段落を改行で折ってある）");
		paraLines = 0;
	};
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (fence) {
			if (line.trim().startsWith(fence.marker)) fence = null;
			continue;
		}
		const fm = line.match(/^(\s*)(```+|~~~+)\s*([^\s`]*)/);
		if (fm) {
			endPara();
			fence = { marker: fm[2] };
			add("コードブロック（```）");
			if (fm[1].length > 0) add("コードブロック: リストの中（インデントあり）");
			const lang = fm[3] || "(言語なし)";
			langs[lang] = (langs[lang] ?? 0) + 1;
			prevKind = "other";
			continue;
		}
		if (line.trim() === "") {
			endPara();
			prevKind = "blank";
			continue;
		}
		let text = line;
		let inlineTarget = true;
		let m;
		if ((m = line.match(/^(#{1,6})\s+(.+)$/))) {
			endPara();
			add(`見出し h${m[1].length}`);
			text = m[2];
			prevKind = "other";
		} else if (/^\s*\|.*\|\s*$/.test(line)) {
			endPara();
			const cells = splitCells(line);
			if (cells.every((x) => /^\s*:?-{3,}:?\s*$/.test(x))) {
				add("表（パイプの表）");
				if (cells.some((x) => /^\s*:.*:\s*$|^\s*:-|-:\s*$/.test(x))) add("表: 列の寄せ指定（:---）");
				prevKind = "table";
				continue;
			}
			add("表の行（見出し行を含む）");
			for (const cell of cells) {
				if (/\[[^\]]+\]\([^)]+\)/.test(mask(cell))) add("表のセル: リンク");
				if (/`[^`]+`/.test(cell)) add("表のセル: インラインコード");
				if (/https?:\/\/[^\s|]+/.test(mask(cell).replace(/\[[^\]]*\]\([^)]*\)/g, ""))) add("表のセル: 裸の URL");
				if (/\*\*.+?\*\*/.test(mask(cell))) add("表のセル: 強調（**）");
				if (/<br\s*\/?>/i.test(cell)) add("表のセル: <br>");
			}
			if (/\\\|/.test(line)) add("表: エスケープしたパイプ（\\|）を含む行");
			text = cells.join(" ");
			prevKind = "table";
		} else if (/^\s*>/.test(line)) {
			endPara();
			add("引用（>）");
			text = line.replace(/^\s*>\s?/, "");
			prevKind = "other";
		} else if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line) && prevKind !== "para") {
			endPara();
			add("水平線");
			prevKind = "other";
			continue;
		} else if ((m = line.match(/^(\s*)([-*+])\s+(.*)$/))) {
			endPara();
			const nested = m[1].length >= 2;
			add(nested ? "箇条書き: 入れ子" : "箇条書き");
			if (/^\[[ xX]\]\s/.test(m[3])) add("タスクリスト");
			text = m[3];
			prevKind = "list";
		} else if ((m = line.match(/^(\s*)\d+[.)]\s+(.*)$/))) {
			endPara();
			add(m[1].length >= 2 ? "番号付きリスト: 入れ子" : "番号付きリスト");
			text = m[2];
			prevKind = "list";
		} else if (/^\s*!\[[^\]]*\]\([^)]+\)\s*$/.test(line)) {
			endPara();
			add("画像（単独の行）");
			prevKind = "other";
			continue;
		} else if (/^\s*<[a-zA-Z/!]/.test(line)) {
			endPara();
			add("HTML（行頭のタグ・コメント）");
			prevKind = "other";
			inlineTarget = false;
		} else if (/^\s{2,}\S/.test(line) && prevKind === "list") {
			add("リスト項目の続き行（インデントした段落）");
			text = line.trim();
		} else {
			if (prevKind !== "para") add("段落");
			paraLines++;
			prevKind = "para";
		}
		if (!inlineTarget) continue;
		// インライン
		const t = text;
		const nc = mask(t);
		add("インラインコード", (t.match(/`[^`]+`/g) ?? []).length);
		add("強調 **", (nc.match(/\*\*[^*]+?\*\*/g) ?? []).length);
		add("斜体 *x*", (nc.replace(/\*\*[^*]+?\*\*/g, "").match(/(?<![\w*])\*[^*\s][^*]*?\*(?![\w*])/g) ?? []).length);
		add("斜体 _x_", (nc.match(/(?<![\w])_[^_\s][^_]*?_(?![\w])/g) ?? []).length);
		add("打ち消し ~~", (nc.match(/~~[^~]+?~~/g) ?? []).length);
		add("リンク [text](url)", (nc.match(/(?<!!)\[[^\]]+\]\([^)]+\)/g) ?? []).length);
		add("リンク: 文字にインラインコードを含む", (t.match(/(?<!!)\[[^\]]*`[^\]]*\]\([^)]+\)/g) ?? []).length);
		add("リンク: 内部（/ で始まる）", (nc.match(/(?<!!)\[[^\]]+\]\(\/[^)]*\)/g) ?? []).length);
		add("画像（行の途中）", (nc.match(/!\[[^\]]*\]\([^)]+\)/g) ?? []).length);
		add("自動リンク <https://…>", (nc.match(/<https?:\/\/[^>]+>/g) ?? []).length);
		add("脚注 [^n]", (nc.match(/\[\^[^\]]+\]/g) ?? []).length);
		add("インライン HTML", (nc.match(/<\/?[a-zA-Z][^>]*>/g) ?? []).filter((x) => !/^<https?:/.test(x)).length);
		add("バックスラッシュのエスケープ（\\*、\\_ など）", (nc.match(/\\[*_`#\[\]()<>|~]/g) ?? []).length);
		add("snake_case などの語中の _（_x_ 変換の誤爆候補）", (nc.match(/\w_\w+_\w|\w_\w+_(?!\w)|(?<!\w)_\w+_\w/g) ?? []).length);
	}
	endPara();
	for (const k of Object.keys(c)) if (c[k] === 0) delete c[k];
	return { counts: c, langs };
}

/** emdash/client の markdownToPortableText に通して、変換されずに記号が残る箇所を数える */
export async function simulate(body) {
	const { markdownToPortableText } = await import("emdash/client");
	const blocks = markdownToPortableText(body);
	const r = {};
	const add = (k) => (r[k] = (r[k] ?? 0) + 1);
	for (const b of blocks) {
		if (b._type === "table") {
			for (const row of b.rows ?? [])
				for (const cell of row.cells ?? []) {
					const defs = [...(cell.markDefs ?? []), ...(b.markDefs ?? [])];
					if ((cell.content ?? []).some((x) => (x.marks ?? []).includes("code"))) add("表のセル: code マークあり");
					if (defs.some((d) => d._type === "link")) add("表のセル: リンクあり");
				}
		}
		add(`block:${b._type}${b.listItem ? `:${b.listItem}` : ""}${b.style && b.style !== "normal" ? `:${b.style}` : ""}`);
		if (b._type !== "block") continue;
		const txt = (b.children ?? []).map((s) => s.text ?? "").join("");
		const plain = (b.children ?? []).filter((s) => !(s.marks ?? []).includes("code")).map((s) => s.text ?? "").join("");
		if (/^\s*\|/.test(txt)) add("残り: 表の行が段落のまま");
		if (/\*\*/.test(plain)) add("残り: ** が文字として残る");
		if (/`/.test(plain)) add("残り: ` が文字として残る");
		if (/\[[^\]]+\]\([^)]+\)/.test(plain)) add("残り: [text](url) が文字として残る");
		if (/^\s*(?:-{3,}|\*{3,})\s*$/.test(txt)) add("残り: 水平線が段落のまま");
		if (/^\s*<[a-zA-Z/!]/.test(txt)) add("残り: HTML が文字として残る");
		if ((b.children ?? []).some((s) => (s.marks ?? []).includes("em"))) add("斜体 em の変換先");
	}
	return r;
}

async function main() {
	const args = process.argv.slice(2);
	const dirIdx = args.indexOf("--dir");
	const dir = dirIdx >= 0 ? args[dirIdx + 1] : join(root, "content/articles");
	const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
	const per = {};
	const totals = {};
	const usedBy = {};
	const langTotals = {};
	const simTotals = {};
	const simUsedBy = {};
	for (const f of files) {
		const body = bodyOf(readFileSync(join(dir, f), "utf8"));
		const { counts, langs } = inventory(body);
		per[f] = { counts, langs };
		for (const [k, v] of Object.entries(counts)) {
			totals[k] = (totals[k] ?? 0) + v;
			usedBy[k] = (usedBy[k] ?? 0) + 1;
		}
		for (const [k, v] of Object.entries(langs)) langTotals[k] = (langTotals[k] ?? 0) + v;
		let sim = null;
		try {
			sim = await simulate(body);
		} catch (e) {
			sim = { "simulate 失敗": String(e.message ?? e) };
		}
		per[f].simulate = sim;
		for (const [k, v] of Object.entries(sim)) {
			simTotals[k] = (simTotals[k] ?? 0) + v;
			simUsedBy[k] = (simUsedBy[k] ?? 0) + 1;
		}
	}
	if (args.includes("--json")) {
		console.log(JSON.stringify({ articles: files.length, totals, usedBy, langTotals, simTotals, simUsedBy, per }, null, 2));
		return;
	}
	const rows = (t, u) =>
		Object.keys(t)
			.sort((a, b) => u[b] - u[a] || t[b] - t[a] || a.localeCompare(b))
			.map((k) => `| ${k} | ${u[k]} | ${t[k]} |`)
			.join("\n");
	console.log(`記事 ${files.length} 本（${dir}）\n`);
	console.log("| 書き方 | 使っている記事数 | 出現数の合計 |\n|---|---|---|");
	console.log(rows(totals, usedBy));
	console.log("\nコードブロックの言語\n\n| 言語 | 個数 |\n|---|---|");
	for (const [k, v] of Object.entries(langTotals).sort((a, b) => b[1] - a[1])) console.log(`| ${k} | ${v} |`);
	console.log("\nmarkdownToPortableText（emdash/client）に通した結果\n\n| 結果 | 記事数 | 合計 |\n|---|---|---|");
	console.log(rows(simTotals, simUsedBy));
	if (args.includes("--per-article")) {
		console.log("\n記事ごとの表の数と、表の行が段落のまま残る数\n\n| 記事 | 表 | 表の行 | 段落のまま残った表の行 |\n|---|---|---|---|");
		for (const f of files) {
			const x = per[f];
			console.log(`| ${f} | ${x.counts["表（パイプの表）"] ?? 0} | ${x.counts["表の行（見出し行を含む）"] ?? 0} | ${x.simulate["残り: 表の行が段落のまま"] ?? 0} |`);
		}
	}
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
