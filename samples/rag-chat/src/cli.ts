import { fileURLToPath } from "node:url";
import { answerWithClaude, formatContext, NotLoggedInError, runWithAgentSdk, type QueryFn } from "./answer.ts";
import { buildBm25Index } from "./bm25.ts";
import { loadMarkdownChunks } from "./loadDocs.ts";

const DEFAULT_QUESTION = "このサンプルは日本語の文章をどうやって検索していますか？";

function parseTopK(raw: string | undefined): number {
  const value = Number(raw ?? "3");
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`RAG_TOP_K は 1 以上の整数で指定してください（受け取った値: ${raw}）`);
  }
  return value;
}

// テストでモデルの呼び出し（run）と表示（log）を差し替えられるよう、main に渡せる形にしてある。
export async function main(
  run: QueryFn = runWithAgentSdk,
  args: string[] = process.argv.slice(2),
  log: (line: string) => void = console.log,
): Promise<void> {
  const question = args.join(" ").trim() || DEFAULT_QUESTION;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
  const topK = parseTopK(process.env.RAG_TOP_K);
  const docsDir = process.env.RAG_DOCS_DIR || fileURLToPath(new URL("../docs", import.meta.url));

  const chunks = await loadMarkdownChunks(docsDir);
  const hits = buildBm25Index(chunks).search(question, topK);

  log(`質問: ${question}`);
  log(`読み込んだチャンク数: ${chunks.length} / 取り出した件数: ${hits.length} (top-k=${topK})\n`);
  for (const [i, hit] of hits.entries()) {
    log(`[${i + 1}] ${hit.chunk.id}  score=${hit.score.toFixed(3)}  見出し: ${hit.chunk.heading}`);
  }

  if (hits.length === 0) {
    log("\n関係するチャンクが見つかりませんでした。質問の言葉を変えて試してください。");
    return;
  }

  let result;
  try {
    result = await answerWithClaude(run, model, question, hits);
  } catch (error) {
    if (!(error instanceof NotLoggedInError)) throw error;
    log("\n--- Claude に渡す予定のコンテキスト ---");
    log(formatContext(hits));
    log(
      "\nClaude Code にログインしていないため、Claude への問い合わせは行わずに終了します。ログインするには `claude` を起動して `/login` を実行してください（検索部分は上のとおり動いています）。",
    );
    return;
  }
  log(`\n--- 回答 (${model}) ---`);
  log(result.text || "(テキストの回答がありませんでした)");
  log(`\nAgent SDK: claude_code_version=${result.claudeCodeVersion ?? "不明"} apiKeySource=${result.apiKeySource ?? "不明"}`);
  log(`ターン数: ${result.numTurns} / total_cost_usd（見積もり）: ${result.totalCostUsd}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
