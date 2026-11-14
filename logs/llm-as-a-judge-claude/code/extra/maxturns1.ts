// 記事に載せない確認用。inspect.ts に maxTurns: 1 だけを足し、StructuredOutput の呼び出しで
// 上限に達するかを見る。for await が投げる例外も表示する。
import { readFileSync } from "node:fs";
import { query } from "@anthropic-ai/claude-agent-sdk";

const rubric = readFileSync("rubric.md", "utf8");
const input =
  "質問:\n返品はいつまでできますか。\n\n参考情報:\n返品は商品の到着から30日以内に受け付けます。未開封の商品に限ります。返品の送料はお客様の負担です。\n\n採点する回答:\n未開封の商品なら返品できます。";
const schema = {
  type: "object",
  properties: {
    reason: { type: "string" },
    score: { type: "integer", enum: [1, 2, 3, 4, 5] },
  },
  required: ["reason", "score"],
  additionalProperties: false,
};

try {
for await (const message of query({
  prompt: input,
  options: {
    model: "haiku",
    systemPrompt: rubric,
    tools: [],
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    outputFormat: { type: "json_schema", schema },
    maxTurns: 1,
  },
})) {
  if (message.type === "system" && message.subtype === "init") {
    // MCP のツール名はアカウントのコネクタ名を含むので、名前は出さず数だけ出す
    const builtin = message.tools.filter((t) => !t.startsWith("mcp__"));
    console.log(`init model=${message.model} apiKeySource=${message.apiKeySource} tools=${JSON.stringify(builtin)} mcp_tools=${message.tools.length - builtin.length} mcp_servers=${message.mcp_servers.length}`);
  } else if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "tool_use") console.log(`assistant tool_use name=${block.name}`);
      if (block.type === "text") console.log(`assistant text=${JSON.stringify(block.text)}`);
    }
  } else if (message.type === "result") {
    console.log(`result subtype=${message.subtype} num_turns=${message.num_turns} total_cost_usd=${message.total_cost_usd}`);
    if (message.subtype === "success") {
      console.log(`result text=${JSON.stringify(message.result)}`);
      console.log(`structured_output=${JSON.stringify(message.structured_output)}`);
    }
  }
}
} catch (error) {
  console.log(`caught: ${error instanceof Error ? error.message : String(error)}`);
}
