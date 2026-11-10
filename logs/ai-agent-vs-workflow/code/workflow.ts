import { readdir, readFile } from "node:fs/promises";
import { query } from "@anthropic-ai/claude-agent-sdk";

const LABELS = ["返金", "不具合", "その他"];
let apiKeySource = "";

// ツールなし、1ターンだけの query() を「LLM を1回呼ぶ関数」として使う
async function ask(systemPrompt: string, prompt: string) {
  let text = "";
  let cache = 0;
  let cost = 0;
  for await (const msg of query({
    prompt,
    options: { model: "haiku", tools: [], maxTurns: 1, systemPrompt },
  })) {
    if (msg.type === "system" && msg.subtype === "init") apiKeySource = msg.apiKeySource;
    if (msg.type === "result" && msg.subtype === "success") {
      text = msg.result.trim();
      cache = msg.usage.cache_creation_input_tokens;
      cost = msg.total_cost_usd;
    }
  }
  return { text, cache, cost };
}

const started = Date.now();
let calls = 0;
let total = 0;

for (const file of (await readdir("tickets")).sort()) {
  const body = await readFile(`tickets/${file}`, "utf8");

  // 手順1: 分類させる
  const label = await ask("問い合わせを「返金」「不具合」「その他」のどれか1語だけで答えてください。", body);
  calls++;
  total += label.cost;

  // 手順2: 答えをコードで確かめる
  if (!LABELS.includes(label.text)) {
    console.log(`${file}: 想定外の答え「${label.text}」なので、この問い合わせは止めます`);
    continue;
  }
  console.log(`${file}: ${label.text}（cache_creation=${label.cache}）`);

  // 手順3: 返金のときだけ返信の書き出しを作らせる
  if (label.text !== "返金") continue;
  const reply = await ask("カスタマーサポートとして、この問い合わせへの返信の書き出しを1文だけ書いてください。", body);
  calls++;
  total += reply.cost;
  console.log(`  返信案: ${reply.text}`);
}

console.log(`LLM を呼んだ回数: ${calls}`);
console.log(`total_cost_usd の合計（見積もり）: ${total.toFixed(6)}`);
console.log(`かかった時間: ${Date.now() - started}ms、apiKeySource: ${apiKeySource}`);
