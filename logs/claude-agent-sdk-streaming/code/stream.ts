import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "HTTP のストリーミングとは何かを、日本語で300字程度で説明してください。",
  options: {
    model: "haiku",
    tools: [],
    maxTurns: 1,
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    includePartialMessages: true,
  },
})) {
  if (message.type === "stream_event") {
    const event = message.event;
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      process.stdout.write(event.delta.text);
    }
  } else if (message.type === "result") {
    process.stdout.write(`\n[result/${message.subtype}] num_turns=${message.num_turns}\n`);
  }
}
