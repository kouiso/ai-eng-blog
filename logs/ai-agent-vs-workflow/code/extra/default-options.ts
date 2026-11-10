// 記事には載せない確認用。workflow.ts の手順1と同じ問い合わせを、tools と systemPrompt を指定せずに1回だけ投げる
import { readFile } from "node:fs/promises";
import { query } from "@anthropic-ai/claude-agent-sdk";

const body = await readFile("tickets/001.txt", "utf8");
for await (const msg of query({
  prompt: `次の問い合わせを「返金」「不具合」「その他」のどれか1語だけで答えてください。\n${body}`,
  options: { model: "haiku", maxTurns: 1 },
})) {
  if (msg.type === "system" && msg.subtype === "init") console.log(`apiKeySource: ${msg.apiKeySource}、tools の数: ${msg.tools.length}`);
  if (msg.type === "result" && msg.subtype === "success") {
    console.log(`答え: ${msg.result.trim()}`);
    console.log(`cache_creation=${msg.usage.cache_creation_input_tokens}、cache_read=${msg.usage.cache_read_input_tokens}、total_cost_usd（見積もり）: ${msg.total_cost_usd.toFixed(6)}`);
  }
}
