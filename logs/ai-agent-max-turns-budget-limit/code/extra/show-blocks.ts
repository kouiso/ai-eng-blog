import { query } from "@anthropic-ai/claude-agent-sdk";
import { baseOptions, task } from "./run-agent.ts";

// 記事には載せない確認用。記事の baseOptions と task のまま maxBudgetUsd を渡し、
// assistant メッセージのブロックを tool_use 以外（text、thinking）も表示する。
// 上限で止まった回に、回答の text が届いてから result が来るかを見る
const maxBudgetUsd = Number(process.argv[2]);
console.log(`maxBudgetUsd: ${maxBudgetUsd}`);
let response = 0;
let lastId = "";
try {
  for await (const message of query({ prompt: task, options: { ...baseOptions, maxBudgetUsd } })) {
    if (message.type === "system" && message.subtype === "init") {
      console.log(`init: ${message.model} / apiKeySource ${message.apiKeySource} / Claude Code ${message.claude_code_version}`);
    }
    if (message.type === "assistant") {
      if (message.message.id !== lastId) {
        response += 1;
        lastId = message.message.id;
      }
      for (const block of message.message.content) {
        if (block.type === "tool_use") {
          console.log(`応答${response}: tool_use ${block.name}`);
        } else if (block.type === "text") {
          console.log(`応答${response}: text ${JSON.stringify(block.text)}`);
        } else {
          console.log(`応答${response}: ${block.type}`);
        }
      }
    }
    if (message.type === "result") {
      const hasResult = message.subtype === "success" ? `result ${JSON.stringify(message.result)}` : "result の欄なし";
      console.log(`RESULT ${message.subtype} / num_turns ${message.num_turns} / total_cost_usd ${message.total_cost_usd} / ${hasResult}`);
    }
  }
} catch (error) {
  console.log(`catch: ${error instanceof Error ? error.message : String(error)}`);
}
