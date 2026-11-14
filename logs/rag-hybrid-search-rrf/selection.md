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

2026-11-10 にやり直した。2026-10-31 の判定は `content/articles/` に8本しか無かった時点のもので、古くなっていた（そのときの表は、`rag-local-embeddings-transformers-js` について「原稿はまだ無い」と書いていたが、今は原稿がある）。

2026-11-10 に `content/articles/*.md` の18ファイル（この記事を含む）の frontmatter（`title`、`main_keyword`、`target_query`）を全件読み直した。`target_query` は18ファイルすべて null なので、語の一致では比べられない。title、main_keyword、description で検索意図を比べた。本文も `grep -c -i 'rrf\|ハイブリッド\|Reciprocal'` で全件にかけ、当たったのはこの記事（29件）と `rag-retrieval-eval-recall-mrr`（28件）だけだった。

| slug | main_keyword | 答える検索意図 | 重なり |
|---|---|---|---|
| `ai-agent-safe-file-tool` | AIエージェント | エージェントに渡すファイル操作ツールを安全に作る | なし |
| `llm-api-429-retry-sdk-mock` | LLM API | 429・529 エラーとリトライ | なし |
| `llm-api-cost-estimate-js-tiktoken` | LLM API | API の料金をリクエスト前に見積もる | なし |
| `llm-eval-dataset-from-logs` | LLM 評価 | 評価用のテストケースをログから作る | なし |
| `llm-eval-harness-fixtures` | LLM 評価 | LLM の回答を完全一致などで自動採点する | なし |
| `llm-json-parse-error-fix` | 構造化出力 | JSON.parse で失敗する原因と直し方 | なし |
| `mcp-connection-closed-fix` | MCPサーバー | MCP サーバーにつながらない（Connection closed） | なし |
| `mcp-inspector-debug` | MCPサーバー | MCP Inspector で MCP サーバーを調べる | なし |
| `mcp-server-resources-prompts` | MCPサーバー | Resources と Prompts を公開する | なし |
| `mcp-server-streamable-http` | MCPサーバー | Streamable HTTP で動かす | なし |
| `mcp-server-typescript-stdio` | MCPサーバー | MCP サーバーの自作 | なし |
| `rag-bm25-search-typescript` | RAG | RAG の検索部分を BM25 で作る | 部分的に関係。BM25 だけの検索の作り方に答える記事で、2つの検索の結果を合わせる方法（RRF）は扱っていない（本文に RRF、ハイブリッドの語が0件）。この記事は BM25 の式の説明を繰り返さず、その記事へリンクする |
| `rag-chunking-japanese-text` | RAG | 日本語の文書をチャンクに分ける | なし |
| `rag-local-embeddings-transformers-js` | RAG | 埋め込みを手元で作ってベクトル検索する（draft、2026-11-10 に frontmatter と見出しを確認） | 部分的に関係。ベクトル検索だけの作り方に答える記事で、BM25 と合わせる話は無い（本文に RRF、ハイブリッドの語が0件）。この記事は埋め込みの手順を繰り返さずにリンクする |
| `rag-retrieval-eval-recall-mrr` | LLM 評価 | RAG の検索器を Recall@k と MRR で採点する（draft） | 部分的に関係。この記事の6ファイルをそのまま使い、BM25、ベクトル検索、ハイブリッド検索を採点して比べる。答えるのは「検索の良し悪しを数字で測る方法」で、ハイブリッド検索の作り方と RRF の説明はこの記事へのリンクに任せている（その記事の203行目）。検索意図は重ならない |
| `zod-to-json-schema-tool-definition` | 構造化出力 | zod から JSON Schema を作る | なし |
| `zod-validate-llm-json-output` | 構造化出力 | LLM の出力 JSON を zod で検証する | なし |

BM25 とベクトル検索の結果を RRF で1つに合わせる方法（やり方）に答える記事は、この記事のほかに無い。表記ゆれの範囲でも重ならない。`content/plan.md` の「重なりを避けるために決めたこと」とも食い違わない（#15 は #11 と #13 の結果を順位で合わせる記事）。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-rag.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: BM25 とベクトル検索を RRF で合わせるハイブリッド検索の記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
