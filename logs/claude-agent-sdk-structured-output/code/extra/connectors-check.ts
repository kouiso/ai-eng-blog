// classify.ts と同じ options（strictMcpConfig: true）で、init の tools のうち mcp__ で始まるものの数と、MCP サーバーの数だけを出す（名前は出さない）。
// run/14〜16 は settings の1行を外した版で動かした。run/31〜33 はこの版（strictMcpConfig: true）。
import { query } from "@anthropic-ai/claude-agent-sdk";
const schema = { type: "object", properties: { category: { type: "string" } }, required: ["category"], additionalProperties: false };
for await (const message of query({
  prompt: "問い合わせ「請求が2回引き落とされた」を分類してください。",
  options: { model: "haiku", tools: [], settingSources: [], strictMcpConfig: true, outputFormat: { type: "json_schema", schema } },
})) {
  if (message.type === "system" && message.subtype === "init") {
    const mcp = message.tools.filter((t) => t.startsWith("mcp__")).length;
    console.log(`[system/init] apiKeySource=${message.apiKeySource} tools=${message.tools.length} mcp_tools=${mcp} mcp_servers=${message.mcp_servers.length} has_StructuredOutput=${message.tools.includes("StructuredOutput")}`);
  } else if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "tool_use") console.log(`[assistant/tool_use] ${block.name.startsWith("mcp__") ? "mcp__<connector>" : block.name}`);
    }
  } else if (message.type === "result") {
    console.log(`[result/${message.subtype}] is_error=${message.is_error} num_turns=${message.num_turns} total_cost_usd=${message.total_cost_usd}`);
  }
}
