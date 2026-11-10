import { readFileSync } from "node:fs";

const text = readFileSync("cases.jsonl", "utf8");
const lines = text.split("\n").filter((line) => line !== "");
const cases = lines.map((line) => JSON.parse(line));
const ids = new Set(cases.map((c) => c.id));

console.log(`${lines.length}行、${cases.length}件、id の重複 ${cases.length - ids.size}件`);
console.log(`ファイルの末尾が改行: ${text.endsWith("\n")}`);
for (const c of cases) {
  console.log(`${c.id} [${c.feedback ?? "-"}] ${c.question}`);
}
