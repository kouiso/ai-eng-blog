import { cases, Reservation } from "./cases.ts";
import { apiKeySources } from "./common.ts";
import { extractByPrompt } from "./a-prompt.ts";
import { extractByTool } from "./b-tool.ts";
import { extractByOutputFormat } from "./c-output-format.ts";

const methods = {
  "a-prompt": extractByPrompt,
  "b-tool": extractByTool,
  "c-output-format": extractByOutputFormat,
};

for (const [name, extract] of Object.entries(methods)) {
  const sum = { parsed: 0, valid: 0, correct: 0, turns: 0, input: 0, cacheWrite: 0, cacheRead: 0, output: 0, cost: 0, ms: 0 };
  for (const [i, c] of cases.entries()) {
    const { result, value, error } = await extract(c.text);
    const check = Reservation.safeParse(value);
    const correct = check.success && JSON.stringify(check.data) === JSON.stringify(c.expected);
    if (value !== undefined) sum.parsed++;
    if (check.success) sum.valid++;
    if (correct) sum.correct++;
    sum.turns += result.num_turns;
    for (const u of Object.values(result.modelUsage)) {
      sum.input += u.inputTokens;
      sum.cacheWrite += u.cacheCreationInputTokens;
      sum.cacheRead += u.cacheReadInputTokens;
      sum.output += u.outputTokens;
    }
    sum.cost += result.total_cost_usd;
    sum.ms += result.duration_ms;
    const mark = correct ? "OK" : check.success ? "WRONG" : "INVALID";
    console.log(`${name} #${i + 1} ${mark} turns=${result.num_turns} ${error ?? JSON.stringify(value)}`);
  }
  console.log(
    `== ${name}: 取り出せた ${sum.parsed}/10、スキーマに合う ${sum.valid}/10、正解 ${sum.correct}/10、` +
      `ターン ${sum.turns}、入力 ${sum.input}、キャッシュ書き込み ${sum.cacheWrite}、` +
      `キャッシュ読み込み ${sum.cacheRead}、出力 ${sum.output}、` +
      `total_cost_usd ${sum.cost.toFixed(5)}、平均 ${Math.round(sum.ms / 10)} ms`,
  );
}
console.log(`apiKeySource: ${[...apiKeySources].join(", ")}`);
