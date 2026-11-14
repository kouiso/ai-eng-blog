// 記事に載せない確認用。judge.ts と同じオプションで1件を採点し、init のモデルとツールの一覧、
// 届いたツール呼び出しの名前、result の num_turns と subtype を表示する（記事の本文の根拠）。
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

for await (const message of query({
  prompt: input,
  options: {
    model: "haiku",
    systemPrompt: rubric,
    tools: [],
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    outputFormat: { type: "json_schema", schema },
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
