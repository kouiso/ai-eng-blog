import { query } from "@anthropic-ai/claude-agent-sdk";

const prompt =
  "tasks フォルダの .md ファイルをすべて読み、締め切りが最も早いタスクの名前と締め切りを1行で答えてください。";

for await (const message of query({
  prompt,
  options: {
    model: "haiku",
    tools: ["Glob", "Read"],
    allowedTools: ["Glob", "Read"],
    permissionMode: "dontAsk",
    maxTurns: 10,
    settingSources: [],
  },
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "text") {
        console.log(`[assistant/text] ${block.text}`);
      } else if (block.type === "tool_use") {
        console.log(`[assistant/tool_use] ${block.name} ${JSON.stringify(block.input)}`);
      }
    }
  } else if (message.type === "user" && Array.isArray(message.message.content)) {
    for (const block of message.message.content) {
      if (block.type === "tool_result") {
        console.log(`[user/tool_result] ${JSON.stringify(block.content).slice(0, 60)}`);
      }
    }
  } else if (message.type === "result") {
    console.log(
      `[result/${message.subtype}] num_turns=${message.num_turns} total_cost_usd=${message.total_cost_usd}`,
    );
    if (message.subtype === "success") console.log(`result: ${message.result}`);
  }
}
