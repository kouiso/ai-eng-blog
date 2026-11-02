# selection: rag-hybrid-search-rrf

選んだ日: 2026-10-31

## 読んだ CSV

- `keywords/` にあるのは `README.md` だけで、CSV は1つも無い（2026-10-31 に `ls keywords/` で確認）。
- ラッコキーワードの CSV がまだ届いていないので、CSV の行からキーワードを選べない。
- ワークフローの指示（CSV が届くまで `target_query` は null、G10 は NG、記事は下書きのまま）に従い、`target_query: null` にした。CSV に無い語を `target_query`、`brief.md`、この `selection.md` に作って書くことはしていない。

## 選んだもの

- テーマ: BM25 とベクトル検索の結果を RRF で合わせるハイブリッド検索（`content/plan.md` の #15、slug `rag-hybrid-search-rrf`）。テーマ、タイトル、講座の位置（`course_step: 3`）、検索意図（やり方）は、ワークフローの指示と `content/plan.md` で与えられたもの。
- `target_query`: null（上の理由）。
- 人気度: CSV に検索ボリュームが無い（CSV そのものが無い）。Google トレンドでの比較もしていない。比べる候補のキーワードが CSV から決まらないので、人気度の大小関係は書けない。CSV が届いたら、guides/01 §2 のとおりメインキーワード単体（「RAG」）を避け、ロングテールの行から選び直す。

## ANTHROPIC_API_KEY

- `test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-10-31）。
- この記事のコードは LLM の API を呼ばない（BM25 は手元の計算、埋め込みは Hugging Face から落としたモデルを手元で動かす、RRF は順位の計算だけ）。`needs_api_key: false`。キーが無くても記事のコードはすべて実行できた（`run/`）。

## 既存記事との重なり（G06）

2026-10-31 に `content/articles/*.md` の frontmatter（`title`、`main_keyword`、`target_query`）を全件読んだ。

| slug | main_keyword | 答える検索意図 | 重なり |
|---|---|---|---|
| `llm-api-429-retry-sdk-mock` | LLM API | 429・529 エラーとリトライ | なし |
| `llm-api-cost-estimate-js-tiktoken` | LLM API | API の料金をリクエスト前に見積もる | なし |
| `llm-json-parse-error-fix` | 構造化出力 | JSON.parse で失敗する原因と直し方 | なし |
| `mcp-server-typescript-stdio` | MCPサーバー | MCP サーバーの自作 | なし |
| `rag-bm25-search-typescript` | RAG | RAG の検索部分を BM25 で作る | 部分的に関係。BM25 だけの検索の作り方に答える記事で、2つの検索の結果を合わせる方法（RRF）は扱っていない。この記事は BM25 の式の説明を繰り返さず、その記事へリンクする |
| `rag-chunking-japanese-text` | RAG | 日本語の文書をチャンクに分ける | なし |
| `zod-to-json-schema-tool-definition` | 構造化出力 | zod から JSON Schema を作る | なし |
| `zod-validate-llm-json-output` | 構造化出力 | LLM の出力 JSON を zod で検証する | なし |

`target_query` はどれも null。`content/articles/` には無いが、`logs/rag-local-embeddings-transformers-js/` に、ローカルの埋め込みでベクトル検索を作る記事（plan #13）のログがある（原稿はまだ無い）。その記事はベクトル検索だけの作り方に答える。この記事は埋め込みの手順を繰り返さずにリンクし、2つの検索の合わせ方に絞った。`content/plan.md` の「重なりを避けるために決めたこと」とも食い違わない（#15 は #11 と #13 の結果を順位で合わせる記事）。
