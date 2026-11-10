import { mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";

// 前回の実行で作ったものを消してから、見本のファイルを作り直します。
for (const dir of ["workspace", "workspace-old", "outside"]) {
  rmSync(dir, { recursive: true, force: true });
}
mkdirSync("workspace/notes", { recursive: true });
mkdirSync("workspace/out");
mkdirSync("workspace-old");
mkdirSync("outside");

writeFileSync("workspace/notes/todo.md", "# TODO\n- 請求書を送る\n");
writeFileSync("workspace/notes/big.md", "a".repeat(30_000));
writeFileSync("workspace/.env", "SAMPLE_KEY=dummy-value\n");
writeFileSync("workspace-old/memo.txt", "隣のフォルダのメモです\n");
writeFileSync("outside/private.txt", "作業フォルダの外のファイルです\n");

// 作業フォルダの中に、外を指すリンクを2つ置きます。
symlinkSync("../../outside/private.txt", "workspace/notes/shortcut.txt");
symlinkSync("../../outside/report.md", "workspace/out/report.md");

console.log("見本のファイルを作りました");
