// 記事に載せない確認用。重複を見分けるキーの作り方を変えると、残る件数がどう変わるかを数える。
import { readFileSync } from "node:fs";

const questions: string[] = [];
for (const line of readFileSync("logs.jsonl", "utf8").split("\n")) {
  if (line.trim() === "") continue;
  try {
    questions.push(JSON.parse(line).question);
  } catch {
    // 8行目の壊れた行は build-cases.ts と同じくとばす
  }
}

const variants: Record<string, (t: string) => string> = {
  "記事のキー（NFKC、空白をすべて除く、小文字）": (t) => t.normalize("NFKC").replace(/\s+/g, "").toLowerCase(),
  "空白を1つにまとめるだけ（NFKC、trim、小文字）": (t) => t.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase(),
  "NFKC なし（空白をすべて除く、小文字）": (t) => t.replace(/\s+/g, "").toLowerCase(),
  "そのまま比べる": (t) => t,
};
console.log(`読めた質問 ${questions.length}件`);
for (const [name, key] of Object.entries(variants)) {
  console.log(`${name}: ${new Set(questions.map(key)).size}件`);
}
console.log(`"？".normalize("NFKC") => ${JSON.stringify("？".normalize("NFKC"))}`);
console.log(`"\\u3000".normalize("NFKC") => ${JSON.stringify("　".normalize("NFKC"))}`);
console.log(`/\\s/.test("\\u3000") => ${/\s/.test("　")}`);
