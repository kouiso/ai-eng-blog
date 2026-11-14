// 使い方: node scripts/check.mjs [root|samples]
//   root    型・テスト・ビルド・secret-scan を順に流す（npm run check）
//   samples samples/ の各アプリで npm ci と、ログインも API キーも要らない確認を流す（npm run check:samples）
// 1つでも落ちたらそこで止まり、落ちた手順の名前と終了コードを最後に1行で示す。
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// npm_execpath があれば node で npm の JS を直接起動する（Windows でも shell なしで動く）。無ければ npm を shell 経由で探す
function runNpm(args, cwd) {
	const opts = { cwd, stdio: "inherit" };
	if (process.env.npm_execpath) return spawnSync(process.execPath, [process.env.npm_execpath, ...args], opts);
	return spawnSync("npm", args, { ...opts, shell: process.platform === "win32" });
}

// secret-scan の基準。ブランチの upstream が自分の HEAD だと 0 ファイルで通ってしまうので、origin/develop があればそれと比べる
function secretScanBase() {
	const r = spawnSync("git", ["rev-parse", "--verify", "--quiet", "origin/develop^{commit}"], { cwd: repoRoot, stdio: "ignore" });
	return r.status === 0 ? ["origin/develop"] : [];
}

const targets = {
	root: [{ dir: ".", scripts: ["typecheck", "test", "build", "secret-scan"] }],
	// rag-chat は LLM を呼ぶ部分（npm start）を流さない。mcp-server の e2e はローカルで完結する
	samples: [
		{ dir: "samples/mcp-server", install: true, scripts: ["typecheck", "test", "e2e"] },
		{ dir: "samples/rag-chat", install: true, scripts: ["typecheck", "test"] },
	],
};

const mode = process.argv[2] ?? "root";
if (!targets[mode]) {
	console.error(`check: 不明な引数 "${mode}"。root か samples を指定してください。`);
	process.exit(2);
}

const steps = [];
for (const t of targets[mode]) {
	if (t.install) steps.push({ name: `${t.dir}: npm ci`, cwd: t.dir, args: ["ci"] });
	for (const s of t.scripts) {
		const extra = s === "secret-scan" ? secretScanBase() : [];
		steps.push({
			name: `${t.dir === "." ? "" : `${t.dir}: `}npm run ${s}${extra.length ? ` -- ${extra[0]}` : ""}`,
			cwd: t.dir,
			args: ["run", s, ...(extra.length ? ["--", ...extra] : [])],
		});
	}
}

let n = 0;
for (const step of steps) {
	n += 1;
	console.log(`\n[check ${n}/${steps.length}] ${step.name}`);
	const r = runNpm(step.args, path.join(repoRoot, step.cwd));
	if (r.status !== 0) {
		if (r.error) console.error(`check: 起動に失敗しました: ${r.error.message}`);
		const code = r.status ?? (r.signal ? `signal ${r.signal}` : "起動失敗");
		console.error(`\ncheck: 失敗した手順 [${n}/${steps.length}] ${step.name}（終了コード ${code}）。ここで止めました。`);
		process.exit(typeof r.status === "number" && r.status > 0 ? r.status : 1);
	}
}
console.log(`\ncheck: ${mode} の ${steps.length} 手順がすべて通りました。`);
