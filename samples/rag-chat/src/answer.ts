import { query } from "@anthropic-ai/claude-agent-sdk";
import type { SearchHit } from "./bm25.ts";

export function formatContext(hits: SearchHit[]): string {
  return hits
    .map((h, i) => `<chunk index="${i + 1}" source="${h.chunk.id}">\n${h.chunk.text}\n</chunk>`)
    .join("\n\n");
}

export const SYSTEM_PROMPT =
  "あなたは資料に基づいて答えるアシスタントです。<chunk> タグの内容だけを根拠に日本語で答え、" +
  "使ったチャンクの source を文末に示してください。資料に答えがなければ「資料にはありません」と答えてください。";

export interface AnswerResult {
  text: string;
  numTurns: number;
  /** SDK が出す定価換算の見積もり。請求額ではない。 */
  totalCostUsd: number;
  /** 起動メッセージ（system init）の値。init が来なかったときは undefined。 */
  claudeCodeVersion?: string;
  apiKeySource?: string;
}

/** Claude Code にログインしていないときに投げる。cli.ts はこれを受けて検索結果だけ出して終わる。 */
export class NotLoggedInError extends Error {
  constructor() {
    super("Claude Code にログインしていません");
    this.name = "NotLoggedInError";
  }
}

// テストで差し替えられるよう、query() の使う部分だけを型にしておく。
export type QueryFn = (params: { prompt: string; options: Record<string, unknown> }) => AsyncIterable<unknown>;

interface LooseMessage {
  type?: string;
  subtype?: string;
  error?: string;
  claude_code_version?: string;
  apiKeySource?: string;
  is_error?: boolean;
  result?: string;
  num_turns?: number;
  total_cost_usd?: number;
}

export async function answerWithClaude(
  run: QueryFn,
  model: string,
  question: string,
  hits: SearchHit[],
): Promise<AnswerResult> {
  const stream = run({
    prompt: `資料:\n${formatContext(hits)}\n\n質問: ${question}`,
    options: {
      model,
      systemPrompt: SYSTEM_PROMPT,
      tools: [], // 資料はプロンプトに入れてあるので、ファイルを読むツールなどは要らない
      settingSources: [], // 手元の設定ファイルを読まない
      strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    },
  });

  let loginFailed = false;
  let init: LooseMessage | undefined;
  for await (const raw of stream) {
    const message = raw as LooseMessage;
    // ログインが無いと、assistant メッセージの error が "authentication_failed" になる。
    if (message.type === "assistant" && message.error === "authentication_failed") {
      loginFailed = true;
      continue;
    }
    if (message.type === "system" && message.subtype === "init") init = message;
    if (message.type !== "result") continue;
    if (loginFailed) throw new NotLoggedInError();
    if (message.subtype !== "success" || message.is_error) {
      const detail = message.result ? ` / ${message.result}` : "";
      throw new Error(`回答を受け取れませんでした（subtype: ${message.subtype}${detail}）`);
    }
    return {
      text: message.result ?? "",
      numTurns: message.num_turns ?? 0,
      totalCostUsd: message.total_cost_usd ?? 0,
      claudeCodeVersion: init?.claude_code_version,
      apiKeySource: init?.apiKeySource,
    };
  }
  if (loginFailed) throw new NotLoggedInError();
  throw new Error("result メッセージを受け取れませんでした");
}

/** 本番の経路。Claude Agent SDK の query() をそのまま使う。 */
// QueryFn は query() の引数と戻り値を緩く型付けしたもの（テストで差し替えやすくするため）なので、
// 本物の query() に渡すところだけ型を合わせるキャストが要る。
export const runWithAgentSdk: QueryFn = (params) =>
  query(params as unknown as Parameters<typeof query>[0]);
