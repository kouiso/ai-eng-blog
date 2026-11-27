#!/usr/bin/env node
// 記事ページの表で、番号・日付・数字の並びが途中で折れていないか、ページ全体が横にはみ出していないかを、
// 幅 1440px と 390px のブラウザで測る（#9、#75）。scripts/render-check.mjs は HTML の形だけを見るので、
// CSS の変更で日付が「2026-」「10-31」に折れても気づけない。この折れは描画して測るしかない。
//
// 使い方（render-check.mjs で記事をローカル DB に作ったあと。読むだけなので本番の URL にも使える）:
//   node scripts/wrap-check.mjs <slug> [<slug> …]
//   node scripts/wrap-check.mjs --all
//   --url http://localhost:8787   # 既定
// 初めて使う環境では `npx playwright install chromium` でブラウザを入れる。
//
// 確かめること（幅ごと。1つでも落ちたら終了コード 1）:
//   1. 番号・日付・バージョンだけのセル（src/utils/table-cell.ts の NUMERIC_CELL）が1行
//   2. 文と混ざったセルの中の日付・数字の並び（同じく BREAKABLE_NUMBER_RUN）が1行で、目印（u）で包まれている
//   3. ページ全体の横幅が画面の幅を超えない（表の中の横スクロールはよい）
// URL の列は途中で折れてよい（#9）ので数えない。
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
export const WIDTHS = [1440, 390];
// src/utils/table-cell.ts と同じ形。ページの中で使うので文字列で渡す
export const NUMERIC_CELL = "^[v^~]?\\d[\\d.\\-/: ]*$";
export const BREAKABLE_NUMBER_RUN = "\\d[\\d\\-/.:]*[-/][\\d\\-/.:]*";

/** ページの中で動かす測り方。本文の表の、折れたセル、折れた並び、包まれていない並び、はみ出しを返す */
export function measurePage({ numericCell, breakableRun }) {
	const numeric = new RegExp(numericCell);
	const run = new RegExp(breakableRun, "g");
	// 要素の中の文字が何行に並んでいるか（文字の矩形の上端の種類で数える）
	const lines = (el) => {
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		const tops = new Set();
		for (let n = walker.nextNode(); n; n = walker.nextNode()) {
			if (!n.textContent.trim()) continue;
			const range = document.createRange();
			range.selectNodeContents(n);
			for (const r of range.getClientRects()) if (r.width > 0) tops.add(Math.round(r.top));
		}
		return tops.size;
	};
	const cells = [...document.querySelectorAll("[data-prose] td")];
	const numericCells = cells.filter((td) => numeric.test(td.textContent.trim()));
	const runs = [...document.querySelectorAll("[data-prose] td u")];
	const unwrapped = [];
	for (const td of cells) {
		const text = td.textContent.trim();
		if (numeric.test(text) || /^https?:\/\//.test(text)) continue;
		const rest = td.cloneNode(true);
		for (const e of rest.querySelectorAll("u, code, a")) e.remove();
		unwrapped.push(...(rest.textContent.match(run) ?? []));
	}
	return {
		numericCells: numericCells.length,
		brokenCells: numericCells.filter((td) => lines(td) > 1).map((td) => td.textContent.trim()),
		runs: runs.length,
		brokenRuns: runs.filter((u) => lines(u) > 1).map((u) => u.textContent),
		unwrapped,
		overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
		hasProse: Boolean(document.querySelector("[data-prose]")),
	};
}

/** 測った結果から、落ちた理由の一覧を返す（空なら合格） */
export function problemsOf(m) {
	const out = [];
	if (!m.hasProse) out.push("記事の本文（data-prose）が無い");
	for (const t of m.brokenCells) out.push(`番号・日付のセルが折れた: ${t}`);
	for (const t of m.brokenRuns) out.push(`日付・数字の並びが折れた: ${t}`);
	for (const t of m.unwrapped) out.push(`日付・数字の並びが目印で包まれていない: ${t}`);
	if (m.overflow) out.push("ページ全体が横にはみ出した");
	return out;
}

async function main(argv) {
	let url = "http://localhost:8787";
	const slugs = [];
	let all = false;
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--url") url = argv[++i];
		else if (argv[i] === "--all") all = true;
		else slugs.push(argv[i]);
	}
	const origin = new URL(url).origin;
	const targets = all
		? readdirSync(join(root, "content/articles")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).sort()
		: slugs;
	if (targets.length === 0) {
		console.error("wrap-check: slug か --all を指定してください");
		return 2;
	}
	const { chromium } = await import("playwright");
	let browser;
	try {
		browser = await chromium.launch();
	} catch (e) {
		console.error(`wrap-check: ブラウザを起動できません。npx playwright install chromium で入れてください（${e instanceof Error ? e.message.split("\n")[0] : e}）`);
		return 2;
	}
	let failed = 0;
	try {
		for (const width of WIDTHS) {
			const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
			for (const slug of targets) {
				try {
					const res = await page.goto(`${origin}/posts/${encodeURIComponent(slug)}`, { waitUntil: "networkidle" });
					if (!res || res.status() !== 200) throw new Error(`記事ページが HTTP ${res ? res.status() : "応答なし"}`);
					const m = await page.evaluate(measurePage, { numericCell: NUMERIC_CELL, breakableRun: BREAKABLE_NUMBER_RUN });
					const problems = problemsOf(m);
					const summary = `番号・日付のセル ${m.numericCells - m.brokenCells.length}/${m.numericCells} が1行、並び ${m.runs - m.brokenRuns.length}/${m.runs} が1行、はみ出し ${m.overflow ? "あり" : "なし"}`;
					if (problems.length) {
						failed++;
						console.log(`[FAIL] ${slug} @${width}: ${summary}`);
						for (const p of problems) console.log(`  - ${p}`);
					} else {
						console.log(`[OK] ${slug} @${width}: ${summary}`);
					}
				} catch (e) {
					// 1本の失敗で残りを止めない
					failed++;
					console.log(`[FAIL] ${slug} @${width}: ${e instanceof Error ? e.message.split("\n")[0] : e}`);
				}
			}
			await page.close();
		}
	} finally {
		await browser.close();
	}
	console.log(`\nwrap-check: ${targets.length} 本 × 幅 ${WIDTHS.join("・")}、不合格 ${failed}`);
	return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main(process.argv.slice(2)).then(
		(code) => process.exit(code),
		(e) => {
			console.error(e instanceof Error ? e.message : e);
			process.exit(2);
		},
	);
}
