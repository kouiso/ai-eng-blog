# selection: ai-agent-safe-file-tool

選んだ日: 2026-10-31

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-10-31 に `ls keywords/` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。この記事を書いたのは、ワークフローの指示（CSV なしで書き進め、G10 を NG にして下書きで止める）によるもので、テーマ、タイトル、slug は `content/plan.md` の #19 に従った。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-10-31）。値は表示もしていないし、どこにも残していない。

この記事のコードは API を呼ばない。ツールの関数に危ない入力を直接渡して確かめ、モデルが返す `tool_use` は手で作った見本で置き換えた。モデルにつなぐループのコードは講座 #16（`ai-agent-tool-use-loop-typescript`）に任せ、この記事には置いていない（`content/plan.md` #19 の判定理由と同じ）。`needs_api_key: false`。

## 既存記事との重なり（G06）

`content/articles/*.md` の frontmatter（title、main_keyword、target_query）を全件読んだ（2026-10-31、この記事のほか9本）。

| slug | main_keyword | 答える検索意図 | 重なり |
|---|---|---|---|
| `llm-api-cost-estimate-js-tiktoken` | LLM API | リクエスト前の料金の見積もり | なし |
| `llm-api-429-retry-sdk-mock` | LLM API | 429・529 のエラーとリトライ | なし |
| `zod-validate-llm-json-output` | 構造化出力 | LLM の出力 JSON の形の検証 | なし |
| `zod-to-json-schema-tool-definition` | 構造化出力 | zod のスキーマから JSON Schema を作ってツール定義に使う | なし。あちらはツールの入力の型（`input_schema`）を作る記事で、この記事はツールの関数の中でパスを確かめる記事。この記事からは `input_schema` の作り方としてリンクするだけで、同じ内容は書いていない |
| `llm-json-parse-error-fix` | 構造化出力 | JSON.parse の SyntaxError の原因と直し方 | なし |
| `rag-bm25-search-typescript` | RAG | BM25 で検索部分を作る | なし |
| `rag-chunking-japanese-text` | RAG | 日本語の文書のチャンク分け | なし |
| `rag-local-embeddings-transformers-js` | RAG | 手元の埋め込みでベクトル検索 | なし |
| `mcp-server-typescript-stdio` | MCPサーバー | MCP サーバーの作り方（stdio、ツール1つ、Claude Code への接続） | なし。`content/plan.md` の「重なりを避けるために決めたこと」のとおり、この記事は MCP の話をせず、ツールの関数の安全性だけを扱う。MCP サーバーの記事へはリンク1本だけ |

`main_keyword: "AIエージェント"`（course_step 4）の記事は、まだ1本も無い。`target_query` はどの記事も null なので、検索語での突き合わせはできない。上の判断は記事の中身で行った。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 4）とキー不要（○）は `content/plan.md` の #19 の判定をそのまま使った。course_step 4 の5本のうち、キー不要は #19 だけ（plan.md の「本数のまとめ」）。
