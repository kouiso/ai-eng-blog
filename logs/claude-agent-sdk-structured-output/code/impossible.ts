import { query } from "@anthropic-ai/claude-agent-sdk";

const schema = {
  type: "object",
  properties: {
    priority: { type: "integer", minimum: 5, maximum: 3 },
  },
  required: ["priority"],
  additionalProperties: false,
};

try {
  for await (const message of query({
    prompt: "問い合わせ「請求が2回引き落とされた」に優先度を付けてください。",
    options: {
      model: "haiku",
      tools: [],
      settingSources: [],
      strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
      outputFormat: { type: "json_schema", schema },
    },
  })) {
    if (message.type === "user" && Array.isArray(message.message.content)) {
      for (const block of message.message.content) {
        if (block.type === "tool_result" && block.is_error) {
          console.log(`[user/tool_result] ${JSON.stringify(block.content)}`);
        }
      }
    } else if (message.type === "result") {
      console.log(`[result/${message.subtype}] is_error=${message.is_error} num_turns=${message.num_turns}`);
      if (message.subtype === "success" && !message.is_error && message.structured_output) {
        console.log(message.structured_output);
      } else if (message.subtype === "error_max_structured_output_retries") {
        console.log(`errors: ${JSON.stringify(message.errors)}`);
      } else {
        console.log("structured_output がありません");
      }
    }
  }
} catch (error) {
  console.log(`caught: ${error}`);
}
