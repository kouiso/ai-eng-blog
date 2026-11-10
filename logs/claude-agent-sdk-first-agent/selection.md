# selection: claude-agent-sdk-first-agent

選んだ日: 2026-11-10

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-10 に `ls keywords/` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。この記事を書いたのは、ワークフローの指示（CSV なしで書き進め、G10 を NG にして下書きで止める）によるもので、テーマ、タイトル、slug は `content/plan.md` の #17 に従った。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-10。`run/02.log` にも同じ結果）。値は表示もしていないし、どこにも残していない。

この記事のコードは Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）だけで、Messages API（`@anthropic-ai/sdk`）を直接呼ぶコードは無い。`content/plan.md` #17 の「キー不要」は「プラン」で、スキルの「Claude プランで動かす記事（Agent SDK、claude -p）」に従い、オーナー自身の Claude プランでログインした環境で実際に動かした（init メッセージの `apiKeySource` は `"none"`、`run/07.log`）。`needs_api_key: false`。

検索意図の中心は Agent SDK そのもの（`query()` の動かし方とメッセージの読み方）で、Messages API の書き方を求める記事を作り替えたものではない（スキルの「Claude プランで動かす記事」の1）。

## 既存記事との重なり（G06）

最初の判定（2026-11-10 07:29 ごろ）では、`content/articles/*.md` の frontmatter を全件読み（この記事のほか18本）、本文を `agent sdk`、`claude-agent-sdk`、`apiKeySource`、`query()` で `grep -ni` して0件だった。

その後に原稿が増えたので、2026-11-10 08:13 ごろに読み直した（再判定）。`ls content/articles` は23本で、この記事のほか22本。`grep -l -i 'claude-agent-sdk\|agent sdk' content/articles/*.md` は、この記事のほか4本（`ai-agent-max-turns-budget-limit`、`ai-agent-vs-workflow`、`llm-as-a-judge-claude`、`promptfoo-llm-eval-intro`）を返した。4本とも frontmatter の `title`、`main_keyword`、`target_query`（4本とも null）と見出しを読み、下の表に足した。最初の判定の「Agent SDK を扱う記事はまだ無い」は、この時点では誤り。

| slug | main_keyword | 答える検索意図 | 重なり |
|---|---|---|---|
| `llm-api-cost-estimate-js-tiktoken` | LLM API | リクエスト前の料金の見積もり | なし |
| `llm-api-429-retry-sdk-mock` | LLM API | 429・529 のエラーとリトライ | なし |
| `zod-validate-llm-json-output` | 構造化出力 | LLM の出力 JSON の形の検証 | なし |
| `zod-to-json-schema-tool-definition` | 構造化出力 | zod のスキーマから JSON Schema を作ってツール定義に使う | なし |
| `llm-json-parse-error-fix` | 構造化出力 | JSON.parse の SyntaxError の原因と直し方 | なし |
| `rag-bm25-search-typescript` | RAG | BM25 で検索部分を作る | なし |
| `rag-chunking-japanese-text` | RAG | 日本語の文書のチャンク分け | なし |
| `rag-local-embeddings-transformers-js` | RAG | 手元の埋め込みでベクトル検索 | なし |
| `rag-hybrid-search-rrf` | RAG | BM25 とベクトル検索を RRF で合わせる | なし |
| `ai-agent-safe-file-tool` | AIエージェント | エージェントに渡すファイル操作ツールを安全に作る | なし。あちらは自作のツール関数の中でパスを確かめる記事。この記事は SDK の組み込みツール（Glob、Read）を `tools` と `allowedTools` で絞るだけで、パスの検査は書かない。関連記事としてリンクする |
| `mcp-server-typescript-stdio` | MCPサーバー | MCP サーバーの作り方 | なし |
| `mcp-server-streamable-http` | MCPサーバー | Streamable HTTP で動かす | なし |
| `mcp-inspector-debug` | MCPサーバー | MCP Inspector で調べる | なし |
| `mcp-server-resources-prompts` | MCPサーバー | Resources と Prompts を公開する | なし |
| `mcp-connection-closed-fix` | MCPサーバー | Connection closed の原因と直し方 | なし |
| `llm-eval-harness-fixtures` | LLM 評価 | 回答を完全一致、部分一致、正規表現で採点する | なし |
| `rag-retrieval-eval-recall-mrr` | LLM 評価 | 検索の良し悪しを Recall@k と MRR で測る | なし |
| `llm-eval-dataset-from-logs` | LLM 評価 | ログから評価用のテストケースを作る | なし |
| `ai-agent-max-turns-budget-limit` | AIエージェント | Agent SDK の `maxTurns`・`maxBudgetUsd` で止める、止まったときの結果と例外 | 最初の版は重なっていた。この記事の 326〜328行目が、ターンの数え方、`error_max_turns`、`for await` の例外を書いていて、あちらの見出し（58、164、388行目）と同じ内容だった。`content/plan.md` の「重なりを避けるために決めたこと」（#17 は導入とメッセージの読み方、#18 は上限と止まったときの結果と例外だけ）に合わせて、326〜328行目からその3点を外し、次の記事に回すと書いた。再判定では重なりなし |
| `ai-agent-vs-workflow` | AIエージェント | エージェントとワークフローの違い（比較） | なし。比較の記事で、`query()` のメッセージの種類は 146行目でこの記事にリンクして任せている。2本目のエージェント（Glob と Read で3つのファイルを読む、`num_turns` 5）は題材が似ているが、あちらはワークフローとの速さと費用の比較に使い、この記事は `tool_use` と `tool_result` の読み分けに使う |
| `llm-as-a-judge-claude` | LLM 評価 | LLM-as-a-Judge で回答を採点する | なし。Agent SDK は採点の道具として使うだけで、`apiKeySource` は 312行目の1文で触れる程度。メッセージの種類の読み分けを扱う見出しは無い |
| `promptfoo-llm-eval-intro` | LLM 評価 | promptfoo でプロンプトを評価する | なし。Agent SDK は 87行目と 427行目でこの記事にリンクするだけ |

計画上の隣の記事とは、`content/plan.md` の「重なりを避けるために決めたこと」（94行目）のとおり分けた。#16（`ai-agent-tool-use-loop-typescript`、自作ループ）は再判定の時点でも原稿が無い（`ls` で確認）。#18（`ai-agent-max-turns-budget-limit`）は 07:32 に原稿ができていた。この記事は導入と `query()` のメッセージの読み方だけを扱う。`maxTurns` はオプションの紹介（187行目）と安全のための上限（328行目）で使うだけにし、ターンの数え方、止まったときの結果と例外は #18 に任せた（326、328、364行目）。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 4）とキー不要の判定は `content/plan.md` の #17 をそのまま使った。
