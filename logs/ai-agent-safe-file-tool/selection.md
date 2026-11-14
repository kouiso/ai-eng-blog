# selection: ai-agent-safe-file-tool

選んだ日: 2026-10-31

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-10-31 と 2026-11-10 に `ls keywords/` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。この記事を書いたのは、ワークフローの指示（CSV なしで書き進め、G10 を NG にして下書きで止める）によるもので、テーマ、タイトル、slug は `content/plan.md` の #19 に従った。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-10-31。2026-11-10 にもう一度確かめても `unset`）。値は表示もしていないし、どこにも残していない。

この記事のコードは API を呼ばない。ツールの関数に危ない入力を直接渡して確かめ、モデルが返す `tool_use` は手で作った見本で置き換えた。モデルにツールを渡すコードは講座 #16（`ai-agent-custom-tools-agent-sdk`）に任せ、この記事には置いていない（`content/plan.md` #19 の判定理由と同じ）。`needs_api_key: false`。

## 既存記事との重なり（G06）

`content/articles/*.md` の frontmatter（title、main_keyword、target_query）を全件読んだ。最初は 2026-10-31（この記事のほか9本）。2026-11-10 に読み直した（この記事のほか17本。`ls content/articles/` で18ファイル）。あとから増えた8本は表の下の8行で、title と description を読んだうえで、本文を `realpath`、`path.relative`、`Traversal`、`許可リスト`、`is_error` で grep して重なりを確かめた。

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
| `mcp-server-streamable-http` | MCPサーバー | MCP サーバーを Streamable HTTP で動かす（2026-11-02 更新） | なし。grep で当たったのは 549行目の「Origin と Host の許可リスト」で、HTTP の受け口の設定の話。ツールの関数の中でパスを確かめる内容は無い |
| `mcp-inspector-debug` | MCPサーバー | MCP Inspector でサーバーのツールを調べる | なし。grep で当たったのは 292行目の `tool_is_error`（Inspector の出力）で、ツールのエラーの返し方を作る話ではない |
| `mcp-server-resources-prompts` | MCPサーバー | MCP サーバーで Resources と Prompts を公開する | なし |
| `mcp-connection-closed-fix` | MCPサーバー | Connection closed の原因と直し方 | なし |
| `rag-hybrid-search-rrf` | RAG | BM25 とベクトル検索を RRF で合わせる | なし |
| `rag-retrieval-eval-recall-mrr` | LLM 評価 | 検索の良し悪しを Recall@k と MRR で測る | なし |
| `llm-eval-harness-fixtures` | LLM 評価 | 回答を完全一致、部分一致、正規表現で採点する | なし |
| `llm-eval-dataset-from-logs` | LLM 評価 | ログから評価用のテストケースを作る | なし |

`main_keyword: "AIエージェント"`（course_step 4）の記事は、2026-11-10 の時点でもこの記事のほかに1本も無い。`target_query` はどの記事も null なので、検索語での突き合わせはできない。上の判断は記事の中身で行った。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 4）とキー不要（○）は `content/plan.md` の #19 の判定をそのまま使った。course_step 4 の5本のうち、キー不要は #19 だけ（plan.md の「本数のまとめ」）。

## 2026-11-11 追記: target_query は null のまま

- Google のサジェストを集めた CSV（`keywords/google-suggest-*.csv`）を 2026-11-11 に読んだ。この記事が答える検索に合う行は無かった。近い行はあったが、記事の中身より広い検索だったので当てはめていない。
- `target_query` は null のまま、G10 は NG のままにする。合う行が見つかるまで下書きで止める。
