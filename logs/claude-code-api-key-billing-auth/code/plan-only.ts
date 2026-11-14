import { query } from "@anthropic-ai/claude-agent-sdk";

try {
  for await (const message of query({
    prompt: "1+1は？数字だけで答えてください。",
    options: {
      model: "haiku",
      tools: [],
      maxTurns: 1,
      settingSources: [],
      strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
      env: { ...process.env, ANTHROPIC_API_KEY: undefined },
    },
  })) {
    if (message.type === "system" && message.subtype === "init") {
      console.log(`apiKeySource: ${message.apiKeySource}`);
    } else if (message.type === "result") {
      console.log(`result: ${message.subtype} is_error=${message.is_error}`);
      if (message.subtype === "success") console.log(message.result);
    }
  }
} catch (err) {
  console.log(`thrown: ${(err as Error).message}`);
}
