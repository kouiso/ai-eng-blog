import { query, type Options, type SDKResultMessage } from "@anthropic-ai/claude-agent-sdk";

// 3つのスクリプトで共通に使う設定。ツールは読むだけの Glob と Read に絞る
export const baseOptions: Options = {
  model: "haiku",
  tools: ["Glob", "Read"],
  allowedTools: ["Glob", "Read"],
  systemPrompt: "あなたは作業フォルダのファイルを調べて質問に答えるアシスタントです。",
  settingSources: [],
  strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
};

export const task =
  "docs フォルダの .md ファイルを Glob のパターン docs/*.md で探し、1ファイルずつ Read で読んで、" +
  "ファイル名と1行目の見出しを1行ずつ答えてください。";

export function printResult(result: SDKResultMessage): void {
  console.log(`subtype: ${result.subtype}`);
  console.log(`num_turns: ${result.num_turns}`);
  console.log(`terminal_reason: ${result.terminal_reason}`);
  console.log(`total_cost_usd: ${result.total_cost_usd}`);
  if (result.subtype === "success") {
    console.log(`result: ${result.result}`);
  } else {
    console.log(`errors: ${result.errors.join(" / ")}`);
  }
}

// エージェントを1回動かす。上限で止まったときに for await が投げる例外もここで受け止める
export async function runAgent(options: Options): Promise<void> {
  // 1回の応答が複数のメッセージに分かれて届くので、message.id が変わったら次の応答と数える
  let response = 0;
  let lastId = "";
  try {
    for await (const message of query({ prompt: task, options })) {
      if (message.type === "system" && message.subtype === "init") {
        console.log(`init: ${message.model} / apiKeySource ${message.apiKeySource} / Claude Code ${message.claude_code_version}`);
      }
      if (message.type === "assistant") {
        if (message.message.id !== lastId) {
          response += 1;
          lastId = message.message.id;
        }
        for (const block of message.message.content) {
          if (block.type === "tool_use") {
            console.log(`応答${response}: ${block.name} を呼ぶ`);
          }
        }
      }
      if (message.type === "result") {
        printResult(message);
      }
    }
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    console.log(`catch: ${text}`);
  }
}
