# sources: rag-answer-with-citations-claude

アクセス日はすべて 2026-11-11。原稿の frontmatter の `sources` と、本文末尾の出典の表（番号も同じ）に同じ URL と日付を入れた。行番号は `content/articles/rag-answer-with-citations-claude.md`（478行）の版。2026-11-11 の直し（利用条件の注意書きの節を削除、`ask.ts` に `strictMcpConfig: true`、再実行の出力に差し替え）のあとで数え直した。旧出典6（Legal and compliance）は本文で引かなくなったので外し、7〜10 を 6〜9 に詰めた。ページは `fetch` で取得し、下の英文の原文があることを確かめた（ページの本文はリポジトリに置いていない）。

| # | 題名 | URL | 確かめた事実 | 根拠にした本文の行 |
|---|---|---|---|---|
| 1 | Introducing Contextual Retrieval | https://www.anthropic.com/news/contextual-retrieval | 「RAG is a method that retrieves relevant information from a knowledge base and appends it to the user's prompt」 | 261 |
| 2 | Reduce hallucinations | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations | 「Verify with citations: Make Claude's response auditable by having it cite quotes and sources for each of its claims.」「If it can't find a quote, it must retract the claim.」 | 227 |
| 3 | Get structured output from agents | https://code.claude.com/docs/en/agent-sdk/structured-outputs | 「the SDK validates the output against it, re-prompting on mismatch」。結果の `structured_output` に検証済みの値が入る（コード例のコメント「The result message contains structured_output with validated data」）。「your message stream carries a tool call named `StructuredOutput` that you never defined. Claude Code adds this tool to the session, and the agent calls it to return its answer. The system init message lists it in the `tools` array」。「Treat a result as a failure when the result's `is_error` is `true` or `structured_output` is absent」と、`subtype` の表（`success`、`error_max_structured_output_retries`） | 347、355、357、386 |
| 4 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 手元に入れた同じ版の `node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts` を読んだ。`tools` のコメント「`[]` (empty array) - Disable all built-in tools」。`systemPrompt` のコメント「`string` - Use a custom system prompt」。`settingSources` のコメント「Pass `[]` to disable filesystem settings (SDK isolation mode)」。`structured_output?: unknown`。`total_cost_usd` のコメント「An estimate, not a billing statement.」 | 343、344、345、357、388、445 |
| 5 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 「Claude Pro, Max, or Ultra subscription: log in with your claude.ai account」。「If you have an active Claude subscription but also have `ANTHROPIC_API_KEY` set in your environment, Claude Code uses the API key once you approve it」「Run `unset ANTHROPIC_API_KEY` to fall back to your subscription」。「`apiKeyHelper`, `ANTHROPIC_API_KEY`, and `ANTHROPIC_AUTH_TOKEN` apply to the CLI and the surfaces that wrap it, including ... the Agent SDK」 | 62、63、67、77 |
| 6 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「when you're signed in with your Claude plan, the Claude Agent SDK and `claude -p` still draw from your subscription limits」（2026-10-07 の更新の注記） | 445、frontmatter の `cost_estimate` |
| 7 | Claude の料金プラン | https://claude.com/pricing | Pro「$17 Per month with annual subscription discount ... $20 if billed monthly」 | 62、frontmatter の `cost_estimate` |
| 8 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | History に「v22.18.0 Type stripping is enabled by default.」。記事は `.ts` を `node` で直接動かすので、前提の Node.js は 22.18.0 以上 | 61 |
| 9 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-11 に `npm view @anthropic-ai/claude-agent-sdk version` が `0.3.322`（npm のレジストリから取得） | 101 |

## 実行ログを根拠にした文（出典を付けていない断定）

| 本文の行 | 文 | 根拠 |
|---|---|---|
| 51 | init メッセージの `apiKeySource` は `"none"` | `run/24.log`、`run/25.log`、`run/27.log`〜`34.log`（10件すべて `apiKeySource: none`。`strictMcpConfig: true` を足す前の `run/07.log`、`08.log`、`10.log`〜`17.log` も同じ） |
| 53、428〜437 | 5回ずつ動かした結果と、10回とも検証 OK、`total_cost_usd` の範囲 | `run/24.log`、`run/27.log`〜`30.log`（返品できる期間）、`run/25.log`、`run/31.log`〜`34.log`（返品した商品の送料）。数え方は `code/README.md` の表 |
| 61 | 検証は 22.23.4 | `run/01.log`、`run/19.log` |
| 103 | 3ファイルは BM25 の記事のコードと1文字も違わない | `lint/check-code-and-outputs.txt`（`tokenize.ts`、`bm25.ts`、`docs.ts` を `logs/rag-bm25-search-typescript/code/` と比べて OK） |
| 257 | 手作りの誤りの見本で、2件とも問題として返る | `run/06.log` |
| 361 | BM25 は `returns` と `points` の2件を選ぶ | `run/24.log` の「渡した資料」の行 |
| 384 | 引用文が資料1の文と1文字も違わない | `run/24.log` の `quote` と `code/docs.ts` の `returns` の文 |
| 386 | `tools` の一覧に `StructuredOutput` だけが出て、`tools: []` でも残る | `run/24.log` の1行目（`tools: StructuredOutput`） |
| 410、412 | 渡した資料が3件、`answer` の最後の一文が資料に無い | `run/25.log` と `code/docs.ts` |
| 416、426 | 「返金はいつ？」では資料が見つからずモデルを呼ばない。答えは `cancel` にある | `run/26.log`。答えの文書が上位に出ないことは `logs/rag-bm25-search-typescript/run/` の「返金はいつ？」の実行と、その記事の本文 |
| 447 | 検索、`verify.ts`、`check-sample.ts`、資料が見つからない実行はモデルを呼ばない | コード（`bm25.ts`、`verify.ts`、`check-sample.ts` は `query` を import しない。`ask.ts` は資料が0件なら `process.exit(0)` で `query()` の前に終わる）と `run/06.log`、`run/26.log`（`apiKeySource` の行が出ない） |
