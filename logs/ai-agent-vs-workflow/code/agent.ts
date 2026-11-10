import { query } from "@anthropic-ai/claude-agent-sdk";

const LABELS = ["返金", "不具合", "その他"];
const started = Date.now();

// workflow.ts と同じ仕事を、ツールを渡した query() 1回に任せる
for await (const msg of query({
  prompt:
    "tickets フォルダの問い合わせをすべて読み、1件ごとに「ファイル名: 返金」「ファイル名: 不具合」「ファイル名: その他」の形で1行ずつ答えてください。" +
    "返金の問い合わせには、次の行に返信の書き出しを1文だけ添えてください。",
  options: { model: "haiku", tools: ["Glob", "Read"], allowedTools: ["Glob", "Read"], maxTurns: 10 },
})) {
  if (msg.type === "system" && msg.subtype === "init") console.log(`apiKeySource: ${msg.apiKeySource}`);
  if (msg.type === "assistant") {
    for (const block of msg.message.content) {
      // 作業フォルダの絶対パスは「.」に置き換えて表示する
      if (block.type === "tool_use") console.log(`ツール: ${block.name} ${JSON.stringify(block.input).replaceAll(process.cwd(), ".")}`);
    }
  }
  if (msg.type === "result") {
    if (msg.subtype === "success") {
      console.log(`答え:\n${msg.result.replaceAll(process.cwd(), ".")}`);
      // 答えの形を確かめられるのは、すべてが終わったこの時点だけ
      const ok = msg.result.split("\n").filter((line) => LABELS.includes(line.split(": ")[1] ?? ""));
      console.log(`形が合った行: ${ok.length}件`);
    }
    console.log(`num_turns=${msg.num_turns}、total_cost_usd（見積もり）: ${msg.total_cost_usd.toFixed(6)}、かかった時間: ${Date.now() - started}ms`);
  }
}
