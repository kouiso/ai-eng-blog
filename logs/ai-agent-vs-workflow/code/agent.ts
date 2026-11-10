import { query } from "@anthropic-ai/claude-agent-sdk";

const started = Date.now();

// ツールを渡した query() を1回だけ呼ぶ。何をどの順に読むかはモデルが決める
for await (const msg of query({
  prompt: "tickets フォルダの問い合わせをすべて読み、返金を求めているものをファイル名つきで挙げてください。",
  options: { model: "haiku", tools: ["Glob", "Read"], allowedTools: ["Glob", "Read"], maxTurns: 10 },
})) {
  if (msg.type === "system" && msg.subtype === "init") {
    console.log(`apiKeySource: ${msg.apiKeySource}`);
  }
  if (msg.type === "assistant") {
    for (const block of msg.message.content) {
      if (block.type === "tool_use") {
        // 作業フォルダの絶対パスは「.」に置き換えて表示する
        console.log(`ツール: ${block.name} ${JSON.stringify(block.input).replaceAll(process.cwd(), ".")}`);
      }
    }
  }
  if (msg.type === "result") {
    if (msg.subtype === "success") console.log(`答え: ${msg.result}`);
    console.log(`num_turns=${msg.num_turns}、cache_creation=${msg.usage.cache_creation_input_tokens}`);
    console.log(`total_cost_usd（見積もり）: ${msg.total_cost_usd.toFixed(6)}、かかった時間: ${Date.now() - started}ms`);
  }
}
