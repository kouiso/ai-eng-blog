# selection: mcp-server-streamable-http

選んだ日: 2026-11-02

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-02 に `ls -la keywords/` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。この記事を書いたのは、ワークフローの指示（CSV なしで書き進め、G10 を NG にして下書きで止める）によるもので、テーマ、タイトル、slug は `content/plan.md` の #22 に従った。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-02）。値は表示もしていないし、どこにも残していない。

この記事のコードは LLM の API を呼ばない。手元（127.0.0.1）で動かす MCP サーバーに、MCP の TypeScript SDK のクライアント、curl、Claude Code の `claude mcp` コマンドからつなぐだけで、どれもモデルを使わない。claude.ai のカスタムコネクタからの接続は、出典を付けて条件を書くだけにし、コードも操作も載せていない（`content/plan.md` #22 の判定理由と同じ）。`needs_api_key: false`。

## 既存記事との重なり（G06）

`content/articles/*.md` の frontmatter（title、main_keyword、target_query）を全件読んだ（2026-11-02、この記事のほか11本）。

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
| `ai-agent-safe-file-tool` | AIエージェント | エージェントのファイル操作ツールを安全に作る | なし |
| `mcp-server-typescript-stdio` | MCPサーバー | MCP サーバーの作り方（stdio、ツール1つ、SDK のクライアントでの確認、Claude Code への接続、stdout のログの落とし穴） | なし。あちらは stdio（クライアントがサーバーを子プロセスとして起動する方式）で作る記事。この記事は同じツール `count_chars` を Streamable HTTP（HTTP の1つの URL で受ける方式）で公開する記事で、答える検索は「HTTP で動かす方法」。ツールの中身（`Intl.Segmenter` で数える理由、入力エラーの返り方）と stdout のログの話は繰り返さず、前の記事へのリンクにした |

`target_query` はどの記事も null なので、検索語での突き合わせはできない。上の判断は記事の中身で行った。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 5）とキー不要（○）は `content/plan.md` の #22 の判定をそのまま使った。course_step 5 の5本はどれもキー不要で、#21（パイロット）は作成済み、この記事が #22。
