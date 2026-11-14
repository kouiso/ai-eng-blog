# selection: rag-local-embeddings-transformers-js

選んだ日: 2026-10-31

## 読んだ CSV

- `keywords/` にあるのは `README.md` だけで、ラッコキーワードの CSV は1つも届いていない（2026-10-31 に `ls keywords` で確認）。
- write-article スキルの手順1-1 は「CSV が1つも無ければ、その時点で止めて『CSV 待ち』と報告する」と定めている。今回は、`content/plan.md` の30本計画を進めるワークフローの指示（CSV が届いていないこと、`target_query` を null に保つこと、G10 を NG にすることを明示した指示）で、CSV なしで書き進めた。
- `target_query` は null。CSV に無いキーワードは作っていない。検索ボリュームによる絞り込み（手順1-2-4）も実施できていない。
- ゲート G10 は NG。CSV が届くまで `status: draft` のまま止める。

## 絞り込み

| 順 | 条件 | 結果 |
|---|---|---|
| 1 | 既存記事との重なり | `content/articles/` の frontmatter（`title`、`main_keyword`、`target_query`）を全件読んだ（2026-10-31 時点で、この記事のほかに8本: `llm-api-429-retry-sdk-mock`、`llm-api-cost-estimate-js-tiktoken`、`llm-json-parse-error-fix`、`mcp-server-typescript-stdio`、`rag-bm25-search-typescript`、`rag-chunking-japanese-text`、`zod-to-json-schema-tool-definition`、`zod-validate-llm-json-output`）。main_keyword「RAG」は `rag-bm25-search-typescript`（BM25 で語の一致から検索する）と `rag-chunking-japanese-text`（文書をチャンクに分ける）の2本。埋め込みモデルで文をベクトルにして検索する方法（やり方）に答える記事は無く、表記ゆれの範囲でも重ならない。8本の `target_query` はすべて null |
| 2 | `ANTHROPIC_API_KEY` | `unset`（2026-10-31 に `test -n "$ANTHROPIC_API_KEY" && echo set \|\| echo unset` で確認）。この記事のコードは Transformers.js と Hugging Face から無料でダウンロードできる埋め込みモデルだけで動き、LLM の API を呼ばない（`run/17.log` でネットワークの無い名前空間でも記事の `node` コマンド4つが exit=0）。`needs_api_key: false` |
| 3 | 講座の順番 | course_step 3（RAG）。`content/plan.md` の計画表 #13 で、キー不要 ○ の記事。#11、#12 は原稿がある |
| 4 | 検索ボリューム | CSV が無いので未実施 |

外した候補と理由:

- course_step 1 と 2 の残り（#1、#2、#5、#6、#10）は API を呼んで応答を見せる記事で、有効なキーが要る。`ANTHROPIC_API_KEY` が unset なので外した。
- course_step 3 の #14（`rag-answer-with-citations-claude`）は回答の生成に API を呼ぶので外した。#15（ハイブリッド検索）は #11 と #13 の結果を合わせる記事で、#13 が先に要る。
- テーマはワークフローの指示で決まっている。CSV が届いたら `target_query` を CSV の行から選び直し、合う行が無ければ差し替える（`plan.md` の前提）。
- 計画上の重なりの決め事（`plan.md`「重なりを避けるために決めたこと」）: この記事（#13）は埋め込みで検索する部分だけを扱う。BM25 との組み合わせ（#15）、検索の良し悪しを数字で測る話（#28）、回答の生成（#14）には踏み込まない。BM25 の記事とは同じ FAQ 8件を使い、結果を比べられるようにした。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-rag.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: 埋め込みを手元で作ってベクトル検索する手順を示す記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
