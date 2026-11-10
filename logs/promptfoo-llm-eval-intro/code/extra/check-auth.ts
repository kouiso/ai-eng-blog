// 記事には載せない。promptfoo のプロバイダーと同じ SDK とログインで、init の apiKeySource を確かめる。
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Reply with exactly the word: ok",
  options: { model: "haiku", tools: [], maxTurns: 1, settingSources: [] },
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(
      `init: model=${message.model} apiKeySource=${message.apiKeySource} claude_code_version=${message.claude_code_version}`,
    );
  } else if (message.type === "result") {
    console.log(`result: subtype=${message.subtype}`);
  }
}
