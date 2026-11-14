import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "TypeScript の型注釈とは何かを、日本語の1文で答えてください。",
  options: {
    model: "haiku",
    tools: [],
    maxTurns: 1,
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
  },
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(
      `[system/init] model=${message.model} apiKeySource=${message.apiKeySource} claude_code_version=${message.claude_code_version}`,
    );
  } else if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "text") console.log(`[assistant/text] ${block.text}`);
    }
  } else if (message.type === "result") {
    console.log(
      `[result/${message.subtype}] num_turns=${message.num_turns} total_cost_usd=${message.total_cost_usd}`,
    );
    if (message.subtype === "success") console.log(`result: ${message.result}`);
  } else {
    console.log(`[${message.type}${"subtype" in message ? `/${message.subtype}` : ""}]`);
  }
}
