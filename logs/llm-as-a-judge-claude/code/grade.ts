import { readFileSync } from "node:fs";
import { judge } from "./judge.ts";

const rubric = readFileSync(process.argv[2] ?? "rubric.md", "utf8");

const question = "返品はいつまでできますか。";
const reference =
  "返品は商品の到着から30日以内に受け付けます。未開封の商品に限ります。返品の送料はお客様の負担です。";

const cases = [
  { id: "a", expected: 5, answer: "商品の到着から30日以内で、未開封のものに限り返品できます。" },
  { id: "b", expected: 4, answer: "商品の到着から30日以内なら返品できます。" },
  { id: "c", expected: 3, answer: "未開封の商品なら返品できます。" },
  {
    id: "d",
    expected: 2,
    answer: "到着から30日以内の未開封品なら返品できます。返金は5営業日以内に振り込みます。",
  },
  { id: "e", expected: 1, answer: "購入から2週間以内なら返品できます。" },
];

let agreed = 0;
let costUsd = 0;
for (const c of cases) {
  const input = `質問:\n${question}\n\n参考情報:\n${reference}\n\n採点する回答:\n${c.answer}`;
  const result = await judge(rubric, input);
  costUsd += result.costUsd;
  const ok = result.verdict.score === c.expected;
  if (ok) agreed++;
  console.log(
    `${c.id} 人=${c.expected} 判定=${result.verdict.score} ${ok ? "一致" : "不一致"} apiKeySource=${result.apiKeySource}`,
  );
  console.log(`  reason: ${result.verdict.reason}`);
}
console.log(`人の採点との一致: ${agreed}/${cases.length}`);
console.log(`total_cost_usd の合計（見積もり）: ${costUsd.toFixed(4)}`);
process.exitCode = agreed === cases.length ? 0 : 1;
