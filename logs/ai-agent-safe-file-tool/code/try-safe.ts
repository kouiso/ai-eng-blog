import { readTextFile, writeTextFile } from "./safe-file-tools.ts";

const reads = [
  "notes/todo.md",
  "../outside/private.txt",
  "../workspace-old/memo.txt",
  "/etc/hostname",
  "notes/shortcut.txt",
  ".env",
  "notes/big.md",
  "notes/nothing.md",
];

console.log("[readTextFile]");
for (const input of reads) {
  try {
    const text = await readTextFile(input);
    console.log(`  ${input} -> 読めた: ${text.split("\n")[0]}`);
  } catch (error) {
    console.log(`  ${input} -> 拒否: ${(error as Error).message}`);
  }
}

const writes = ["out/summary.md", "out/summary.md", "notes/todo.md", "out/report.md"];

console.log("[writeTextFile]");
for (const input of writes) {
  try {
    await writeTextFile(input, "# 要約\n");
    console.log(`  ${input} -> 書けた`);
  } catch (error) {
    console.log(`  ${input} -> 拒否: ${(error as Error).message}`);
  }
}
