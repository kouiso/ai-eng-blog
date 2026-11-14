# selection: llm-eval-harness-fixtures

選んだ日: 2026-11-02

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-02 に `ls keywords` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。この記事を書いたのは、ワークフローの指示（CSV なしで書き進め、G10 を NG にして下書きで止める）によるもので、テーマは `content/plan.md` の #26 に従った。人気度の比較（CSV の検索ボリューム、Google トレンド、Search Console）は、比べる候補の一覧が無いので行っていない。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-02）。値は表示もしていないし、どこにも残していない。

この記事のコードは API を呼ばない。採点する回答は手で書いた見本（`code/answers.ts`）で、採点関数は標準の機能だけの TypeScript。`needs_api_key: false`。

## 既存記事との重なり（G06）

`content/articles/*.md` の frontmatter（title、main_keyword、target_query）を全件（この記事のほか15本）読んだ（2026-11-02）。`main_keyword: "LLM 評価"`（course_step 6）の記事は、この記事が1本目。

| slug | main_keyword | 答える検索意図 | 重なり |
|---|---|---|---|
| `mcp-server-typescript-stdio`、`mcp-server-streamable-http`、`mcp-inspector-debug`、`mcp-server-resources-prompts`、`mcp-connection-closed-fix` | MCPサーバー | MCP サーバーの作り方、調べ方、つながらないときの直し方 | なし |
| `llm-api-cost-estimate-js-tiktoken`、`llm-api-429-retry-sdk-mock` | LLM API | 料金の見積もり、429・529 のリトライ | なし |
| `zod-validate-llm-json-output` | 構造化出力 | LLM の出力 JSON の形を zod で検証する | なし。あちらは JSON の形（型、必須項目）が合っているかを検証し、合否はスキーマで決まる。この記事は回答の中身が期待どおりかをテストケースごとの採点の指定で判定し、合格率を出す。本文では、JSON を返すアプリなら形の検証にあちらを使う、とリンクでつないだ |
| `zod-to-json-schema-tool-definition`、`llm-json-parse-error-fix` | 構造化出力 | ツール定義の作り方、JSON.parse の失敗 | なし |
| `rag-bm25-search-typescript`、`rag-chunking-japanese-text`、`rag-local-embeddings-transformers-js`、`rag-hybrid-search-rrf` | RAG | 検索部分の作り方 | なし（検索の良し悪しを測る記事は計画の #28 で、まだ無い） |
| `ai-agent-safe-file-tool` | AIエージェント | ファイル操作ツールの安全な作り方 | なし |

2026-11-10 の読み直し（3版目のゲート判定のため）: `content/articles/*.md` の frontmatter を全件読み直した（この記事のほか20本）。2026-11-02 から増えたのは `ai-agent-max-turns-budget-limit`、`ai-agent-vs-workflow`、`claude-agent-sdk-first-agent`（AIエージェント）、`rag-retrieval-eval-recall-mrr`、`llm-eval-dataset-from-logs`（LLM 評価）。LLM 評価の2本は、RAG の検索器を Recall@k と MRR で測る記事と、ログからテストケースを選んで JSONL にする記事で、LLM の回答を完全一致、部分一致、正規表現で採点するこの記事とは答える検索意図が違う。重なりは無い。`keywords/` は `README.md` だけで CSV は無く、`ANTHROPIC_API_KEY` は `unset` のまま（どちらも 2026-11-10 に確認）。

`target_query` はどの記事も null なので、検索語での突き合わせはできない。上の判断は記事の中身で行った。計画の #27（LLM-as-a-Judge）、#29（promptfoo）とは、`content/plan.md` の「重なりを避けるために決めたこと」のとおり、自作のコードでの採点と、LLM や既製のツールでの採点に分けている。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 6）とキー不要（○）は `content/plan.md` の #26 の判定をそのまま使った。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-eval.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: 完全一致、部分一致、正規表現で回答を自動採点する仕組みを作る記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
