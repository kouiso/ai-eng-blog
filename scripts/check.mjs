// 使い方: node scripts/check.mjs [root|samples]
//   root    型・テスト・ビルド・secret-scan を順に流す（npm run check）
//   samples samples/ の各アプリで npm ci と、ログインも API キーも要らない確認を流す（npm run check:samples）
// 1つでも落ちたらそこで止まり、落ちた手順の名前と終了コードを最後に1行で示す。
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

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
		steps.push({ name: `${t.dir === "." ? "" : `${t.dir}: `}npm run ${s}`, cwd: t.dir, args: ["run", s] });
	}
}

let n = 0;
for (const step of steps) {
	n += 1;
	console.log(`\n[check ${n}/${steps.length}] ${step.name}`);
	const r = spawnSync(npm, step.args, { cwd: path.join(repoRoot, step.cwd), stdio: "inherit" });
	if (r.status !== 0) {
		const code = r.status ?? (r.signal ? `signal ${r.signal}` : "起動失敗");
		console.error(`\ncheck: 失敗した手順 [${n}/${steps.length}] ${step.name}（終了コード ${code}）。ここで止めました。`);
		process.exit(typeof r.status === "number" && r.status > 0 ? r.status : 1);
	}
}
console.log(`\ncheck: ${mode} の ${steps.length} 手順がすべて通りました。`);
