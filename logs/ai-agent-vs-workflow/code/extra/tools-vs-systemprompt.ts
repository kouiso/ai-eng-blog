// 記事には載せない確認用。workflow.ts の手順1と同じ分類を、tools と systemPrompt を1つずつ外して4通りに投げる。
// 入力の合計（input + cache_creation + cache_read）はキャッシュの当たり外れに左右されないので、これで2つの影響を分けて比べる
import { readFile } from "node:fs/promises";
import { query, type Options } from "@anthropic-ai/claude-agent-sdk";
const INSTRUCTION = "問い合わせを「返金」「不具合」「その他」のどれか1語だけで答えてください。";
const body = await readFile("tickets/001.txt", "utf8");
const cases = [
  { name: "A tools: [] と systemPrompt を指定（workflow.ts と同じ）", tools: true, system: true },
  { name: "B tools だけ指定なし", tools: false, system: true },
  { name: "C systemPrompt だけ指定なし", tools: true, system: false },
  { name: "D どちらも指定なし", tools: false, system: false },
];
for (const c of cases) {
  const options: Options = { model: "haiku", maxTurns: 1, settingSources: [], strictMcpConfig: true }; // 手元の設定ファイルと CLAUDE.md、claude.ai のコネクタのツールを読み込まない
  if (c.tools) options.tools = [];
  if (c.system) options.systemPrompt = INSTRUCTION;
  const prompt = c.system ? body : `次の${INSTRUCTION}\n${body}`;
  for await (const msg of query({ prompt, options })) {
    if (msg.type === "system" && msg.subtype === "init") console.log(`${c.name}: apiKeySource=${msg.apiKeySource}、tools の数=${msg.tools.length}`);
    if (msg.type === "result" && msg.subtype === "success") {
      const u = msg.usage;
      const all = u.input_tokens + u.cache_creation_input_tokens + u.cache_read_input_tokens;
      console.log(`  答え=${msg.result.trim()}、入力の合計=${all}（input=${u.input_tokens}、cache_creation=${u.cache_creation_input_tokens}、cache_read=${u.cache_read_input_tokens}）、total_cost_usd（見積もり）=${msg.total_cost_usd.toFixed(6)}`);
    }
  }
}
