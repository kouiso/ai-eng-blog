// 記事には載せない確認用。strictMcpConfig の有無で、init に出る MCP サーバーの数と、
// thinking のブロックが届くかを、記事と同じプロンプトとオプションで3回ずつ数える。
// 名前は出さず、数だけを出す。
import { query } from "@anthropic-ai/claude-agent-sdk";

async function once(strict: boolean) {
  const start = performance.now();
  let mcp = -1;
  let tools = -1;
  let apiKeySource = "";
  let thinking = false;
  let firstText = -1;
  for await (const message of query({
    prompt: "HTTP のストリーミングとは何かを、日本語で300字程度で説明してください。",
    options: {
      model: "haiku",
      tools: [],
      maxTurns: 1,
      settingSources: [],
      ...(strict ? { strictMcpConfig: true } : {}),
      includePartialMessages: true,
    },
  })) {
    if (message.type === "system" && message.subtype === "init") {
      mcp = message.mcp_servers.length;
      tools = message.tools.length;
      apiKeySource = message.apiKeySource;
    } else if (message.type === "stream_event" && message.event.type === "content_block_start") {
      if (message.event.content_block.type === "thinking") thinking = true;
      if (message.event.content_block.type === "text" && firstText < 0) {
        firstText = Math.round(performance.now() - start);
      }
    }
  }
  console.log(
    `strictMcpConfig=${strict} apiKeySource=${apiKeySource} mcp_servers=${mcp} tools=${tools} thinking=${thinking} first_text_ms=${firstText}`,
  );
}

for (let i = 0; i < 3; i++) {
  await once(true);
  await once(false);
}
