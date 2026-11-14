import { query } from "@anthropic-ai/claude-agent-sdk";

const schema = {
  type: "object",
  properties: {
    category: { type: "string", enum: ["billing", "bug", "feature_request", "other"] },
    priority: { type: "integer", minimum: 1, maximum: 3 },
    summary: { type: "string" },
    due_date: { type: ["string", "null"] },
  },
  required: ["category", "priority", "summary", "due_date"],
  additionalProperties: false,
};

const inquiry = `件名: 請求額がおかしい
先月の請求が2回引き落とされています。11月20日の締め日までに返金してください。`;

for await (const message of query({
  prompt: `次の問い合わせを分類してください。\n\n${inquiry}`,
  options: {
    model: "haiku",
    tools: [],
    settingSources: [], maxTurns: 1,
    outputFormat: { type: "json_schema", schema },
  },
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(`[init] apiKeySource=${message.apiKeySource} tools=${JSON.stringify(message.tools)}`);
  } else if (message.type === "assistant") {
    for (const b of message.message.content) {
      if (b.type === "tool_use") console.log(`[tool_use] ${b.name} ${JSON.stringify(b.input)}`);
      if (b.type === "text") console.log(`[text] ${b.text}`);
    }
  } else if (message.type === "user" && Array.isArray(message.message.content)) {
    for (const b of message.message.content) if (b.type === "tool_result") console.log(`[tool_result] is_error=${b.is_error} ${JSON.stringify(b.content).slice(0,200)}`);
  } else if (message.type === "result") {
    console.log(`[result/${message.subtype}] is_error=${message.is_error} num_turns=${message.num_turns} cost=${message.total_cost_usd}`);
    if (message.subtype === "success") { console.log("result:", JSON.stringify(message.result)); console.log("structured_output:", JSON.stringify(message.structured_output)); }
    else console.log("errors:", JSON.stringify((message as any).errors), "terminal_reason:", (message as any).terminal_reason);
  } else console.log(`[${message.type}${"subtype" in message ? "/"+message.subtype : ""}]`);
}
