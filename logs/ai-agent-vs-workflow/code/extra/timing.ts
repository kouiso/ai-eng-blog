// 記事には載せない確認用。workflow.ts の手順1と同じ query() を1回呼び、
// 呼び出し全体の時間と、結果の duration_ms、duration_api_ms を並べる
import { readFile } from "node:fs/promises";
import { query } from "@anthropic-ai/claude-agent-sdk";

const body = await readFile("tickets/001.txt", "utf8");
const started = Date.now();
for await (const msg of query({
  prompt: body,
  options: { model: "haiku", tools: [], maxTurns: 1, systemPrompt: "問い合わせを「返金」「不具合」「その他」のどれか1語だけで答えてください。" },
})) {
  if (msg.type === "result" && msg.subtype === "success") {
    console.log(`答え: ${msg.result.trim()}`);
    console.log(`duration_ms=${msg.duration_ms}、duration_api_ms=${msg.duration_api_ms}`);
  }
}
console.log(`query() 全体: ${Date.now() - started}ms`);
