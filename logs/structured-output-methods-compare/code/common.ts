import { query, type Options, type SDKResultMessage } from "@anthropic-ai/claude-agent-sdk";
import { SYSTEM_PROMPT } from "./cases.ts";

export const apiKeySources = new Set<string>();

export async function run(prompt: string, options: Options): Promise<SDKResultMessage> {
  for await (const m of query({
    prompt,
    options: {
      model: "haiku",
      tools: [],
      settingSources: [],
      strictMcpConfig: true,
      systemPrompt: SYSTEM_PROMPT,
      ...options,
    },
  })) {
    if (m.type === "system" && m.subtype === "init") apiKeySources.add(m.apiKeySource);
    if (m.type === "result") return m;
  }
  throw new Error("result が届きませんでした");
}
