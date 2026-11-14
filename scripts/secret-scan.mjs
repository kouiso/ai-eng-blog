#!/usr/bin/env node
// push の前に、変更したファイルだけを正規表現で調べる秘密情報のスキャン。
// このリポジトリでは GitHub Advanced Security が有効でなく、GitHub の secret scanning
// （run_secret_scanning）が使えないため、その代わりに使う（CLAUDE.md の秘密情報のルール）。
//
// 使い方: node scripts/secret-scan.mjs [比較の基準]
//   基準を省略すると、追跡しているリモートのブランチ（@{upstream}）と比べる。
//   追跡先の無いブランチでは origin/develop、origin/main の順に基準を探す。基準に使えるのは
//   HEAD と共通の祖先（merge-base）を持つものだけ。どれも使えなければ、追跡している全ファイルと
//   未追跡のファイルを調べる（その旨を1行で出す）。引数で渡した基準が使えなければ1行で示して終了コード 2。
//   どのフォルダから呼んでも、リポジトリのルートを基準に読む。
//   「基準から HEAD までにコミットした変更」と「まだコミットしていない変更」の両方を調べる。
// 見つかれば終了コード 1。値そのものは出さず、ファイル名、行番号、種類だけを出す。
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PATTERNS = [
	["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY( BLOCK)?-----/],
	["Anthropic API key", /\bsk-ant-[A-Za-z0-9_-]{20,}/],
	["OpenAI API key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/],
	["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})/],
	["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
	["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
	["Slack token", /\bxox[abposr]-[A-Za-z0-9-]{10,}/],
	["Stripe secret key", /\b(?:sk|rk)_live_[A-Za-z0-9]{20,}/],
	["EmDash personal access token", /\bec_pat_[A-Za-z0-9_-]{16,}/],
	["JWT", /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
	["Cloudflare account ID in an API path", /\/accounts\/[0-9a-f]{32}\b/],
	["Turnstile secret key", /\b0x4[A-Za-z0-9_-]{30,}/],
	[
		"assigned secret",
		/\b(?:api[_-]?key|secret(?:[_-]?key)?|token|password|passwd|client[_-]?secret)\b\s*[:=]\s*["']?[A-Za-z0-9+/_\-.]{24,}/i,
	],
];

// 公開されているテスト用の値。誤検出として外す
const ALLOWED = [
	"1x0000000000000000000000000000000AA", // Turnstile のテスト用シークレット（常に通る）
	"2x0000000000000000000000000000000AA", // Turnstile のテスト用シークレット（常に落ちる）
	"XXXX.DUMMY.TOKEN.XXXX",
];

const SKIP = [/^package-lock\.json$/, /^docs\/tech-writing-pack\//, /(^|\/)node_modules\//, /\.(png|jpe?g|gif|webp|ico|zip|pdf|woff2?)$/i];

// 失敗の理由が分かるよう、git の標準エラー出力はそのまま流す。基準の候補を探る間だけ黙らせる
function gitIn(cwd, args, { quiet = false } = {}) {
	return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", quiet ? "ignore" : "inherit"] });
}

// ルートより下のフォルダから呼ばれても、git の出力（ルートからの相対パス）を読み違えない
let root;
try {
	root = gitIn(process.cwd(), ["rev-parse", "--show-toplevel"], { quiet: true }).trim();
} catch {
	console.error("secret-scan: git のリポジトリの中で実行してください。");
	process.exit(2);
}

function git(...args) {
	return gitIn(root, args);
}

// 基準に使えるのは、コミットとして存在し、かつ HEAD と共通の祖先を持つものだけ。
// `基準...HEAD` の比べ方は共通の祖先が無いと失敗するため、存在の確認だけでは足りない
function usableAsBase(candidate) {
	try {
		gitIn(root, ["rev-parse", "--verify", "--quiet", `${candidate}^{commit}`], { quiet: true });
		gitIn(root, ["merge-base", candidate, "HEAD"], { quiet: true });
		return true;
	} catch {
		return false;
	}
}

const requested = process.argv[2];
const base = (requested ? [requested] : ["@{upstream}", "origin/develop", "origin/main"]).find(usableAsBase) ?? null;
if (base === null && requested) {
	console.error(`secret-scan: 基準 ${requested} が無いか、HEAD と共通の祖先がありません。別の基準を渡すか、引数なしで流すと全ファイルを調べます。`);
	process.exit(2);
}
if (base === null) {
	console.error("secret-scan: HEAD と共通の祖先を持つ基準が見つからないので、追跡している全ファイルを調べます。");
}
let changed;
try {
	changed =
		base === null
			? [...git("ls-files").split("\n"), ...git("ls-files", "--others", "--exclude-standard").split("\n")]
			: [
					...git("diff", "--name-only", "--diff-filter=ACMR", `${base}...HEAD`).split("\n"),
					...git("diff", "--name-only", "--diff-filter=ACMR", "HEAD").split("\n"),
					...git("ls-files", "--others", "--exclude-standard").split("\n"),
				];
} catch {
	console.error("secret-scan: 変更したファイルの一覧を git から取れませんでした（上の git のメッセージを見てください）。");
	process.exit(2);
}
const files = new Set(changed.filter(Boolean));

const findings = [];
let scanned = 0;
for (const file of files) {
	const path = join(root, file);
	if (SKIP.some((re) => re.test(file)) || !existsSync(path)) continue;
	scanned++;
	const lines = readFileSync(path, "utf8").split("\n");
	lines.forEach((raw, index) => {
		const line = ALLOWED.reduce((text, allowed) => text.replaceAll(allowed, ""), raw);
		for (const [kind, pattern] of PATTERNS) {
			if (pattern.test(line)) findings.push(`${file}:${index + 1}: ${kind}`);
		}
	});
}

console.log(`secret-scan: base ${base ?? "(none, all files)"}, ${scanned} file(s) scanned, ${findings.length} finding(s)`);
for (const finding of findings) console.log(`  ${finding}`);
process.exit(findings.length > 0 ? 1 : 0);
