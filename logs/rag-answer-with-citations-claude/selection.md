# selection: rag-answer-with-citations-claude

選んだ日: 2026-11-11

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-11 に `ls keywords/` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。テーマ、slug、仮タイトル、検索意図（やり方）は、メインのセッションの指示（`content/plan.md` の #14 を、オーナーの Claude プランで動く Agent SDK の記事として書き直す）に従った。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-11。`run/02.log` にも同じ結果）。値は表示もしていないし、どこにも残していない。

`content/plan.md` #14 の「キー不要」は、作った時点では ×（「回答の生成に API を呼ぶ」）だった。2026-11-11 のオーナーの指示で、API キーを使わず月額のプランで動く形に書き直すことになった（指示の原文はメインのセッションの brief `.omc/plan-only-rewrite-brief.md` の「Owner ruling」）。この記事の検索意図は「検索結果を渡して出典つきで回答させる」RAG の組み方で、Messages API の Citations 機能の書き方そのものを求める記事には作り替えていない。回答の生成は Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）の `query()` だけで行い、Messages API（`@anthropic-ai/sdk`）を呼ぶコードは無い。オーナー自身の Claude プランでログインした環境で実際に動かし、init メッセージの `apiKeySource` は `"none"` だった（`run/07.log`、`run/08.log`、`run/10.log`〜`17.log`）。`needs_api_key: false`。

## 既存記事との重なり（G06）

2026-11-11 に `ls content/articles` で24本（`.gitkeep` を除く23本。この記事は未作成の時点）を確かめ、全件の frontmatter の `title` を読んだ。本文を `structured_output`、`outputFormat`、`引用`、`出典つき`、`citations` で `grep` し、当たった記事の該当行を読んだ。

| slug | 答える検索意図 | 重なり |
|---|---|---|
| `rag-bm25-search-typescript`（#11） | RAG の検索部分を BM25 で作る | なし。この記事は #11 の `tokenize.ts`、`bm25.ts`、`docs.ts` を1文字も変えずに使い、検索の仕組みの説明は #11 にリンクして繰り返さない。#11 の `context.ts` はプロンプトの文字列を作るところで終わり、モデルは呼ばない。この記事はその先（回答の生成、出典の番号の検証、答えが無いときの扱い）だけを扱う |
| `rag-chunking-japanese-text`（#12） | 文書のチャンク分け | なし |
| `rag-local-embeddings-transformers-js`（#13） | 埋め込みのベクトル検索 | なし。426行目でこの記事を「次の記事」として予告している |
| `rag-hybrid-search-rrf`（#15） | BM25 とベクトル検索を RRF で合わせる | なし。72行目でこの記事を「回答を作る回」として前の記事に置いている |
| `rag-retrieval-eval-recall-mrr`（#28） | 検索の良し悪しを Recall@k と MRR で測る | なし。あちらは検索の採点、この記事は回答の出典の検証。関連記事としてリンクする |
| `llm-as-a-judge-claude`（#27） | LLM-as-a-Judge で採点する | なし。`outputFormat` を使う点は同じだが、あちらは採点基準と人の点との比較。この記事は `outputFormat` の説明をせず、#6 にリンクする |
| `claude-agent-sdk-first-agent`（#17） | Agent SDK の導入と `query()` のメッセージの読み方 | なし。メッセージの種類の読み分けは繰り返さず、`apiKeySource` を1行で表示するだけにした |
| `ai-agent-max-turns-budget-limit`（#18） | `maxTurns` と `maxBudgetUsd` で止める | なし。この記事はどちらのオプションも使わない |
| `zod-validate-llm-json-output`（#7） | LLM の出力 JSON の形を zod で検証する | なし。`structured_output` の語が出るのは関連の言及だけ。この記事の検証は形（スキーマ）ではなく、出典の番号と引用文が渡した資料にあるか |
| ほかの14本（LLM API、構造化出力の残り、AI エージェントの残り、MCP、評価の残り） | タイトルどおり | なし（RAG の回答の生成を扱う記事は無い） |

#6（`claude-agent-sdk-structured-output`）は、2026-11-11 の時点で別のサブエージェントが並行して書いている（`logs/claude-agent-sdk-structured-output/` はあるが原稿はまだ無い）。この記事は `outputFormat` の仕組みを説明せず、#6 へリンクするだけにした（`content/plan.md` の「重なりを避けるために決めたこと」の #27 と同じ扱い）。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 3）は `content/plan.md` の #14 をそのまま使った。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-rag.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: 検索結果を番号つきで渡し、出典の番号を検証する記事で、この検索に答えます。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
