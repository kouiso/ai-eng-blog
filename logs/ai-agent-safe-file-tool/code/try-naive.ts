import { readNaive, readWithPrefixCheck } from "./naive-tool.ts";

const inputs = [
  "notes/todo.md",
  "../outside/private.txt",
  "../workspace-old/memo.txt",
  "notes/shortcut.txt",
];

for (const read of [readNaive, readWithPrefixCheck]) {
  console.log(`[${read.name}]`);
  for (const input of inputs) {
    try {
      const text = await read(input);
      console.log(`  ${input} -> 読めた: ${text.split("\n")[0]}`);
    } catch (error) {
      console.log(`  ${input} -> 拒否: ${(error as Error).message}`);
    }
  }
}
