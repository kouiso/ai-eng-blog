import { query } from "@anthropic-ai/claude-agent-sdk";

export type Verdict = { reason: string; score: number };

const schema = {
  type: "object",
  properties: {
    reason: { type: "string" },
    score: { type: "integer", enum: [1, 2, 3, 4, 5] },
  },
  required: ["reason", "score"],
  additionalProperties: false,
};

export async function judge(rubric: string, input: string) {
  let apiKeySource = "";
  for await (const message of query({
    prompt: input,
    options: {
      model: "haiku",
      systemPrompt: rubric,
      tools: [],
      settingSources: [],
      outputFormat: { type: "json_schema", schema },
    },
  })) {
    if (message.type === "system" && message.subtype === "init") {
      apiKeySource = message.apiKeySource;
    }
    if (message.type === "result") {
      if (message.subtype === "success" && message.structured_output) {
        const verdict = message.structured_output as Verdict;
        return { verdict, apiKeySource, costUsd: message.total_cost_usd };
      }
      throw new Error(`採点結果がありません（subtype: ${message.subtype}）`);
    }
  }
  throw new Error("result のメッセージが届きませんでした");
}
