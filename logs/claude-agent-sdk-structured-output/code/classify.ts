import { query } from "@anthropic-ai/claude-agent-sdk";

const schema = {
  type: "object",
  properties: {
    category: { type: "string", enum: ["billing", "bug", "feature_request", "other"] },
    priority: { type: "integer", minimum: 1, maximum: 3, description: "1 が最も急ぎ" },
    summary: { type: "string" },
    due_date: { type: ["string", "null"], description: "期限の日付。無ければ null" },
  },
  required: ["category", "priority", "summary", "due_date"],
  additionalProperties: false,
};

const inquiry = `件名: 請求額がおかしい
先月の請求が2回引き落とされています。2026年11月20日の締め日までに返金してください。`;

for await (const message of query({
  prompt: `次の問い合わせを分類してください。\n\n${inquiry}`,
  options: {
    model: "haiku",
    tools: [],
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    outputFormat: { type: "json_schema", schema },
  },
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(`[system/init] apiKeySource=${message.apiKeySource} tools=${JSON.stringify(message.tools)}`);
  } else if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "tool_use") console.log(`[assistant/tool_use] ${block.name}`);
    }
  } else if (message.type === "result") {
    console.log(`[result/${message.subtype}] is_error=${message.is_error} num_turns=${message.num_turns}`);
    if (message.subtype === "success" && !message.is_error && message.structured_output) {
      console.log(message.structured_output);
    }
  }
}
