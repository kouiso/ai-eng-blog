# selection: rag-retrieval-eval-recall-mrr

選んだ日: 2026-11-02

## 読んだ CSV

- `keywords/` にあるのは `README.md` だけで、ラッコキーワードの CSV は1つも届いていない（2026-11-02 に `ls keywords` で確認）。
- write-article スキルの手順1-1 は「CSV が1つも無ければ、その時点で止めて『CSV 待ち』と報告する」と定めている。今回は、`content/plan.md` の30本計画を進めるワークフローの指示（CSV が届いていないこと、`target_query` を null に保つこと、G10 を NG にすること、検索データを作らないことを明示した指示）で、CSV なしで書き進めた。
- `target_query` は null。CSV に無いキーワードは作っていない。検索ボリュームと Google トレンドによる人気度の比較（手順1-2-4）も実施していない（比べる候補の語が CSV から得られないため）。
- ゲート G10 は NG。CSV が届くまで `status: draft` のまま止める。

## 絞り込み

| 順 | 条件 | 結果 |
|---|---|---|
| 1 | 既存記事との重なり | `content/articles/` の frontmatter（`title`、`main_keyword`、`target_query`）を全件読んだ（2026-11-02 時点で、この記事を除き17本: `ai-agent-safe-file-tool`、`llm-api-429-retry-sdk-mock`、`llm-api-cost-estimate-js-tiktoken`、`llm-eval-dataset-from-logs`、`llm-eval-harness-fixtures`、`llm-json-parse-error-fix`、`mcp-connection-closed-fix`、`mcp-inspector-debug`、`mcp-server-resources-prompts`、`mcp-server-streamable-http`、`mcp-server-typescript-stdio`、`rag-bm25-search-typescript`、`rag-chunking-japanese-text`、`rag-hybrid-search-rrf`、`rag-local-embeddings-transformers-js`、`zod-to-json-schema-tool-definition`、`zod-validate-llm-json-output`）。17本の `target_query` はすべて null。main_keyword「LLM 評価」の記事は2本。`llm-eval-harness-fixtures` は LLM の回答を完全一致、部分一致、正規表現で採点する記事。`llm-eval-dataset-from-logs`（作業中の原稿、2026-11-02 に frontmatter を確認）はログからテストケースを選んで JSONL にする記事で、検索の評価指標は扱わない。この記事は回答の前の検索結果を Recall@k と MRR で採点する記事で、答える検索意図（RAG の検索の良し悪しを数字で測る方法）が違う。RAG の3本（`rag-bm25-search-typescript`、`rag-local-embeddings-transformers-js`、`rag-hybrid-search-rrf`）は検索器を作る記事で、指標で測る話は扱っていない（`rag-bm25-search-typescript` の selection.md にも、#28 は扱わないと書かれている）。表記ゆれの範囲でも重ならない |
| 2 | `ANTHROPIC_API_KEY` | `unset`（2026-11-02 に `test -n "$ANTHROPIC_API_KEY" && echo set \|\| echo unset` で確認）。この記事のコードは BM25、手元の埋め込みモデル、RRF、指標の計算だけで、LLM の API を呼ばない（`run/16.log` でネットワークの無い名前空間でも記事の `node` コマンド5つが exit=0）。`needs_api_key: false` |
| 3 | 講座の順番 | course_step 6（LLM 評価）。`content/plan.md` の計画表 #28 で、キー不要 ○ の記事 |
| 4 | 人気度 | CSV が無いので未実施 |

外した候補と理由:

- テーマはワークフローの指示（slug、タイトル、course_step、検索意図、キー不要の理由）で決まっている。
- course_step 6 の #27（`llm-as-a-judge-claude`）と #29（`promptfoo-llm-eval-intro`）は、モデルを呼ぶのでキーが要る（`plan.md`）。`ANTHROPIC_API_KEY` が unset なので書けない。
- 計画上の重なりの決め事（`plan.md`「重なりを避けるために決めたこと」）: 「11（BM25 を作る）と 28（検索を測る）は、作る記事と測る記事に分けます。28 は 11 の検索器をそのまま使います。」に従い、この記事は検索器の作り方を説明せず、BM25 とハイブリッド検索の記事の6ファイルをそのまま使って測るところに絞った。
- CSV が届いたら `target_query` を CSV の行から選び直し、合う行が無ければ差し替える（`plan.md` の前提）。

## 2026-11-10 の再確認

原稿を直したときに、`content/articles/` の frontmatter（`title`、`main_keyword`、`target_query`）を全件読み直した（この記事のほか21本）。2026-11-02 のあとに増えた記事のうち、main_keyword が「LLM 評価」なのは `llm-as-a-judge-claude`（LLM に回答を採点させる）で、検索の結果を Recall@k と MRR で測る方法に答える記事は、ほかに無い。`keywords/` には CSV が無く（README.md だけ）、`target_query` は null のまま。`ANTHROPIC_API_KEY` は 2026-11-10 に確かめて unset（この記事は API を呼ばない）。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-eval.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: Recall@k と MRR で RAG の検索を採点する記事で、評価指標の検索に答えます。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
