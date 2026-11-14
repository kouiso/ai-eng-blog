import { query } from "@anthropic-ai/claude-agent-sdk";

const start = performance.now();
const ms = () => String(Math.round(performance.now() - start)).padStart(5);
let streamed = "";
const deltaTimes: string[] = [];

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
      if (deltaTimes.length === 0) console.log(`${ms()} 最初の text_delta`);
      streamed += event.delta.text;
      deltaTimes.push(ms());
    } else if (event.type === "content_block_delta") {
      console.log(`${ms()} stream_event ${event.delta.type}`);
    } else if (event.type === "content_block_start") {
      console.log(`${ms()} stream_event content_block_start ${event.content_block.type}`);
    } else {
      console.log(`${ms()} stream_event ${event.type}`);
    }
  } else if (message.type === "assistant") {
    if (deltaTimes.length > 0) {
      console.log(`${deltaTimes.at(-1)} 最後の text_delta（${deltaTimes.length}個、計${streamed.length}字）`);
    }
    for (const block of message.message.content) {
      const size = block.type === "text" ? ` ${block.text.length}字` : "";
      console.log(`${ms()} assistant ${block.type}${size} id=...${message.message.id.slice(-4)}`);
    }
  } else if (message.type === "result") {
    console.log(`${ms()} result/${message.subtype}`);
    if (message.subtype === "success") {
      console.log(`text_delta をつないだ文字列と result は同じか: ${streamed === message.result}`);
    }
  } else if (message.type === "system" && message.subtype === "init") {
    console.log(`${ms()} system/init apiKeySource=${message.apiKeySource}`);
  }
}
