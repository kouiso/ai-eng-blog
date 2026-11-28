#!/usr/bin/env node
// 原稿をローカルの EmDash に下書きとして作り、描画された記事ページを読んで、Markdown が書いたとおりの形で出ているかを確かめる。
// 予約の前に、write-article の手順10で流す（落ちた記事は予約しない）。
//
// 使い方（README と docs/verification/local-mcp.md の手順でローカルの wrangler dev を起動し、管理者と API トークンを作ってから）:
//   EMDASH_TOKEN=<ローカル DB だけで使うトークン> node scripts/render-check.mjs <slug> [<slug> …]
//   EMDASH_TOKEN=<…> node scripts/render-check.mjs --all
//   --url http://localhost:8787   # 既定。localhost / 127.0.0.1 / [::1] 以外は拒む
//
// 確かめること（1つでも落ちたら終了コード 1）:
//   1. 本文に描画された <table> の数が、原稿のパイプの表の数と同じ
//   2. 段落・リスト項目・見出し・表のセルに、Markdown の記号（表の行、見出しの #、**、[..](..)、``` など）がそのまま見えていない
//   3. 表のセルのインラインコードとリンクが、原稿と同じ数だけ <code> と <a> になっている
//   4. URL だけが書かれた表のセルが、その URL を別タブで開く <a> になっている（#76）
//
// ローカル DB の中では記事を公開して描画を読む。公開ページを読む以外に下書きの描画を見る口が無いため。
// 本番の EmDash に向けると記事が公開されてしまうので、ローカルの URL 以外では動かさない。
import { readdirSync, readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { codeBlocks } from "./code-blocks.mjs";
import { bodyOf, inventory, splitCells } from "./markdown-inventory.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));

/** ローカルの wrangler dev 以外の URL を拒む */
export function assertLocalUrl(url) {
	const u = new URL(url);
	if (!["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)) {
		throw new Error(`render-check: ${u.origin} はローカルの URL ではありません。記事を公開してしまうので、localhost か 127.0.0.1 だけで動かします`);
	}
	return u.origin;
}

/** frontmatter の1行の値を読む。原稿はダブルクオートの文字列と JSON 形の一覧で書いてある（それ以外は null） */
export function frontmatterOf(text) {
	const m = text.match(/^---\n([\s\S]*?)\n---\n/);
	const fm = {};
	if (!m) return fm;
	for (const line of m[1].split("\n")) {
		const kv = line.match(/^([a-z_]+):\s*(.*)$/);
		if (!kv) continue;
		const raw = kv[2].trim();
		if (raw.startsWith('"') || raw.startsWith("[")) {
			try {
				fm[kv[1]] = JSON.parse(raw);
			} catch {
				fm[kv[1]] = null;
			}
		}
	}
	return fm;
}

/** 原稿の本文にあるパイプの表の数（scripts/markdown-inventory.mjs と同じ数え方） */
export function expectedTables(markdown) {
	return inventory(bodyOf(markdown)).counts["表（パイプの表）"] ?? 0;
}

/** 原稿の表のセルのうち、インラインコードとリンク（[..](..)）を含むセルの数と、裸の URL か <URL> だけのセルの数（見出し行も数える） */
export function expectedCells(markdown) {
	const c = inventory(bodyOf(markdown)).counts;
	let bareUrl = 0;
	const code = new Set(codeBlocks(markdown).flatMap((b) => Array.from({ length: b.end - b.start + 1 }, (_x, k) => b.start + k)));
	markdown.split("\n").forEach((line, i) => {
		if (code.has(i + 1) || !/^\s*\|.*\|\s*$/.test(line)) return;
		// 裸の URL と、<URL> の自動リンク。どちらも描画のときにリンクになる
		for (const cell of splitCells(line)) if (/^(?:https?:\/\/\S+|<https?:\/\/[^\s<>]+>)$/.test(cell.trim())) bareUrl++;
	});
	return { code: c["表のセル: インラインコード"] ?? 0, link: c["表のセル: リンク"] ?? 0, bareUrl };
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", "#x27": "'", nbsp: " " };
function textOf(html) {
	return html
		.replace(/<[^>]+>/g, "")
		.replace(/&(amp|lt|gt|quot|#39|#x27|nbsp);/g, (_m, e) => ENTITIES[e])
		.replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(Number(d)))
		.trim();
}

// 描画のあとに残っていたら、Markdown が変換されなかったとわかる記号。コードの中は除いてから当てる。
// 行頭の記号（表の行、#、```、>、箇条書き）がブロックになるのは段落の中だけ。見出しやセルの「1. 準備」は書いたとおりの文字なので、
// 行頭の記号は p（表の行は li も）にだけ当て、インラインの記法（**、リンク）はどのブロックにも当てる
const RAW_PATTERNS = [
	["表の行", /^\|.*\|$/m, ["p", "li"]],
	["見出しの #", /^#{1,6}\s/m, ["p"]],
	["コードの ```", /^```/m, ["p"]],
	["引用の >", /^>\s/m, ["p"]],
	["箇条書きの記号", /^(?:[-*+]|\d+\.)\s/m, ["p"]],
	["太字の **", /\*\*\S/, null],
	["リンクの [..](..)", /\[[^\]\n]+\]\([^)\s]+\)/, null],
];

/** 記事ページの HTML から本文（data-prose の箱）を読み、表の数、記号の残り、URL のセルを数える */
export function inspectHtml(html) {
	const start = html.indexOf("data-prose");
	if (start < 0) throw new Error("render-check: 記事の本文（data-prose）が見つかりません");
	const end = html.indexOf("</article>", start);
	const prose = html.slice(start, end < 0 ? undefined : end);
	const tables = (prose.match(/<table[\s>]/g) ?? []).length;
	const noCode = prose.replace(/<pre[\s\S]*?<\/pre>/g, "").replace(/<code[\s\S]*?<\/code>/g, "");
	const raw = [];
	for (const m of noCode.matchAll(/<(p|li|h[1-6]|td|th)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
		const text = textOf(m[2]);
		for (const [label, re, tags] of RAW_PATTERNS) {
			if ((tags === null || tags.includes(m[1])) && re.test(text)) raw.push({ tag: m[1], label, text: text.slice(0, 80) });
		}
	}
	const urlCells = [];
	let codeCells = 0;
	let linkCells = 0;
	for (const m of prose.matchAll(/<(td|th)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
		const text = textOf(m[2]);
		if (/<code[\s>]/.test(m[2])) codeCells++;
		if (/<a\s/.test(m[2])) linkCells++;
		if (!/^https?:\/\/\S+$/.test(text)) continue;
		const anchors = [...m[2].matchAll(/<a\s([^>]*)>/g)].map(([, attrs]) => {
			const attr = (name) => textOf(attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "");
			const rel = attr("rel").split(/\s+/);
			return { href: attr("href"), blank: attr("target") === "_blank" && rel.includes("noopener") && rel.includes("noreferrer") };
		});
		// 原稿で [URL](URL) と書いたセルは EmDash のリンクのまま、裸の URL のセルは描画のときに別タブのリンクにする（#76）
		urlCells.push({ url: text, linked: anchors.some((a) => a.href === text), blank: anchors.some((a) => a.href === text && a.blank) });
	}
	// <a> の入れ子。HTML では許されず、ブラウザは外側の <a> を閉じてから内側を読む
	let depth = 0;
	let nestedLinks = 0;
	for (const t of prose.matchAll(/<(\/?)a[\s>]/g)) {
		if (t[1]) depth = Math.max(0, depth - 1);
		else if (depth++ > 0) nestedLinks++;
	}
	return { tables, raw, urlCells, codeCells, linkCells, nestedLinks };
}

/** 原稿と描画を比べ、落ちた理由の一覧を返す（空なら合格） */
export function compare(markdown, html) {
	const want = expectedTables(markdown);
	const cells = expectedCells(markdown);
	const got = inspectHtml(html);
	const problems = [];
	if (got.tables !== want) problems.push(`表の数: 原稿 ${want}、描画 ${got.tables}`);
	if (got.codeCells !== cells.code) problems.push(`コードを含むセル: 原稿 ${cells.code}、描画 ${got.codeCells}`);
	// 描画のリンクのセルは、原稿のリンクのセルと、描画のときにリンクにする裸の URL のセルの和になる
	if (got.linkCells !== cells.link + cells.bareUrl) {
		problems.push(`リンクを含むセル: 原稿のリンク ${cells.link} と URL だけ ${cells.bareUrl}、描画 ${got.linkCells}`);
	}
	for (const r of got.raw) problems.push(`記号がそのまま見える <${r.tag}>（${r.label}）: ${r.text}`);
	for (const c of got.urlCells.filter((c) => !c.linked)) problems.push(`URL のセルがリンクになっていない: ${c.url}`);
	// 出典は書き方（裸、[URL](URL)、<URL>）によらず別タブで開く（#76）
	for (const c of got.urlCells.filter((c) => c.linked && !c.blank)) problems.push(`URL のセルのリンクが別タブで開かない: ${c.url}`);
	if (got.nestedLinks) problems.push(`<a> の中に <a> がある（${got.nestedLinks}か所。ブラウザは外側を空にするので、見えるリンクの属性が変わる）`);
	return { want, got, problems };
}

async function mcp(origin, token, name, args) {
	const r = await fetch(`${origin}/_emdash/api/mcp`, {
		method: "POST",
		headers: { Authorization: `Bearer ${token}`, Accept: "application/json, text/event-stream", "Content-Type": "application/json" },
		body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
	});
	const body = await r.text();
	if (!r.ok) throw new Error(`render-check: MCP ${name} が HTTP ${r.status} を返しました`);
	const line = body.split("\n").find((l) => l.startsWith("data:"));
	const res = JSON.parse(line ? line.slice(5) : body);
	if (res.error) throw new Error(`render-check: MCP ${name}: ${res.error.message}`);
	const text = (res.result.content ?? []).map((c) => c.text).join("\n");
	let data;
	try {
		data = JSON.parse(text);
	} catch {
		// エラーの文面は JSON ではなく文字列で返るので、そのまま使う
		data = text;
	}
	return { isError: Boolean(res.result.isError), data };
}

/** タグを term の slug に直す。講座の6語は seed/seed.json の slug、英数字だけのタグは小文字とハイフンにする。それ以外は付けない */
function tagSlugs(tags, seedTerms) {
	const out = [];
	for (const label of tags ?? []) {
		const seeded = seedTerms.find((t) => t.label === label);
		const slug = seeded ? seeded.slug : /^[\x20-\x7e]+$/.test(label) ? label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null;
		if (slug) out.push({ slug, label });
		else console.log(`  （タグ「${label}」は term の slug を決められないので付けない。描画の確かめには影響しない）`);
	}
	return out;
}

async function ensureTerms(origin, token, terms) {
	const { data } = await mcp(origin, token, "taxonomy_list_terms", { taxonomy: "tag" });
	const have = new Set((data.items ?? []).map((t) => t.slug));
	for (const t of terms) {
		if (have.has(t.slug)) continue;
		const r = await mcp(origin, token, "taxonomy_create_term", { taxonomy: "tag", slug: t.slug, label: t.label });
		if (r.isError) throw new Error(`render-check: タグ ${t.slug} を作れませんでした: ${JSON.stringify(r.data)}`);
		have.add(t.slug);
	}
}

/** 原稿1本をローカル DB に作り（あれば中身を差し替え）、ローカル DB の中で公開する */
async function upsert(origin, token, slug, text, seedTerms) {
	const fm = frontmatterOf(text);
	const terms = tagSlugs(fm.tags, seedTerms);
	await ensureTerms(origin, token, terms);
	const data = {
		title: fm.title,
		excerpt: fm.description,
		content: bodyOf(text),
		cost_estimate: fm.cost_estimate,
		run_environment: fm.run_environment,
		verified_at: fm.verified_at,
	};
	const taxonomies = { tag: terms.map((t) => t.slug) };
	const got = await mcp(origin, token, "content_get", { collection: "posts", id: slug });
	if (got.isError) {
		const created = await mcp(origin, token, "content_create", { collection: "posts", slug, data, taxonomies });
		if (created.isError) throw new Error(`render-check: ${slug} を作れませんでした: ${JSON.stringify(created.data)}`);
	} else {
		const upd = await mcp(origin, token, "content_update", { collection: "posts", id: slug, _rev: got.data._rev, data, taxonomies });
		if (upd.isError) throw new Error(`render-check: ${slug} を更新できませんでした: ${JSON.stringify(upd.data)}`);
	}
	// publish には直前の _rev が要る
	const cur = await mcp(origin, token, "content_get", { collection: "posts", id: slug });
	const pub = await mcp(origin, token, "content_publish", { collection: "posts", id: slug, _rev: cur.data._rev });
	if (pub.isError) throw new Error(`render-check: ${slug} をローカル DB で公開できませんでした: ${JSON.stringify(pub.data)}`);
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
	const origin = assertLocalUrl(url);
	const bearer = process.env.EMDASH_TOKEN;
	if (!bearer) {
		console.error("render-check: EMDASH_TOKEN が空です。ローカル DB の管理画面で作った API トークンを渡してください（docs/verification/local-mcp.md の手順4）");
		return 2;
	}
	const dir = join(root, "content/articles");
	const targets = all ? readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).sort() : slugs;
	if (targets.length === 0) {
		console.error("render-check: slug か --all を指定してください");
		return 2;
	}
	const seed = JSON.parse(readFileSync(join(root, "seed/seed.json"), "utf8"));
	const seedTerms = seed.taxonomies.find((t) => t.name === "tag")?.terms ?? [];
	let failed = 0;
	for (const slug of targets) {
		try {
			const text = readFileSync(join(dir, `${slug}.md`), "utf8");
			await upsert(origin, bearer, slug, text, seedTerms);
			const r = await fetch(`${origin}/posts/${encodeURIComponent(slug)}`);
			if (r.status !== 200) throw new Error(`記事ページが HTTP ${r.status}`);
			const { want, got, problems } = compare(text, await r.text());
			const linked = got.urlCells.filter((c) => c.linked).length;
			const blank = got.urlCells.filter((c) => c.blank).length;
			const summary = `表 ${got.tables}/${want}、コードのセル ${got.codeCells}、リンクのセル ${got.linkCells}、記号の残り ${got.raw.length}、URL のセル ${linked}/${got.urlCells.length}（別タブ ${blank}）`;
			if (problems.length) {
				failed++;
				console.log(`[FAIL] ${slug}: ${summary}`);
				for (const p of problems) console.log(`  - ${p}`);
			} else {
				console.log(`[OK] ${slug}: ${summary}`);
			}
		} catch (e) {
			// 1本の失敗（MCP のエラー、ページが無いなど）で残りの記事を止めない
			failed++;
			console.log(`[FAIL] ${slug}: ${e instanceof Error ? e.message : e}`);
		}
	}
	console.log(`\nrender-check: ${targets.length} 本、合格 ${targets.length - failed}、不合格 ${failed}`);
	return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
	main(process.argv.slice(2)).then(
		(code) => process.exit(code),
		(e) => {
			console.error(e instanceof Error ? e.message : e);
			process.exit(2);
		},
	);
}
