# selection: llm-as-a-judge-claude

選んだ日: 2026-11-10

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-10 に `ls keywords` で確認）。スキル手順1の1により本来は「CSV 待ち」で止める。今回はワークフローの指示で、CSV なしで下書きまで書き進める。そのため `target_query` は null、ゲート G10 は NG、`status` は draft のままにする。CSV に無いキーワードは作っていない。

## 選んだテーマ

`content/plan.md` の #27（course_step 6「LLM 評価」）。slug `llm-as-a-judge-claude`、仮タイトル「LLM-as-a-Judge で回答を採点する【Claude Agent SDK に採点基準と JSON スキーマを渡す】」。検索キーワードの行が無いので、人気度は比べていない（CSV の検索ボリューム、Google トレンド、Search Console のどれも使っていない）。

## 重なりの確認（手順1の2の1）

`content/articles/*.md` の20本の frontmatter（`title`、`main_keyword`、`target_query`）を全件読んだ。`target_query` はすべて null。

- `llm-eval-harness-fixtures`（#26）: 完全一致、部分一致、正規表現の採点関数をコードで書く記事。モデルに採点させる話は無い。この記事はその3つで決められない観点を扱うので、検索意図が違う。#26 の `next` はこの slug。
- `rag-retrieval-eval-recall-mrr`（#28）: 検索結果を Recall@k と MRR で測る記事。回答の採点はしない。`prev` はこの slug。
- `llm-eval-dataset-from-logs`（#30）: テストケースを作る記事。採点はしない。
- `claude-agent-sdk-first-agent`（#17）、`ai-agent-max-turns-budget-limit`（#18）: Agent SDK の導入と上限の記事。採点基準と `outputFormat` は扱わない。
- 計画上の #6 `claude-agent-sdk-structured-output`（2026-11-11 に旧 slug `claude-structured-outputs-json` から差し替え。原稿は draft）: Agent SDK の `outputFormat` と JSON Schema で JSON を返す記事。この記事は `outputFormat` を使うが、Structured Outputs の説明はせず #6 にリンクする（`content/plan.md` の「重なりを避けるために決めたこと」）。2026-11-10 の最初の版は、`StructuredOutput` ツールの注入、出し直し、`error_max_structured_output_retries`、success で `structured_output` が無い場合を H3 2つで説明していて、この取り決めを守れていなかった（レビューの指摘）。その2つの H3 を外し、本文にリンクを置いた（2026-11-11 の版の213行目、`/posts/claude-agent-sdk-structured-output`）。本文に残した Structured Outputs まわりの記述は、`outputFormat` を渡すと `structured_output` に値が入ること（211行目）、`judge()` が値の無い結果を例外にすること（215行目）、`structured_output` の型が `unknown` で SDK が検証していること（217行目）の3つで、どれも `judge.ts` のコードの説明。
- 計画上の #29 `promptfoo-llm-eval-intro`（未作成）: promptfoo の設定の記事。採点の考え方はこの記事に任せる側。

## ANTHROPIC_API_KEY（手順1の2の2）

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-10、`run/02.log` にも同じ結果）。

この記事のコードは Claude Agent SDK だけで、Messages API（`@anthropic-ai/sdk`）を呼ばない。`content/plan.md` の「キー不要」の列は「プラン」で、判定の理由は「中身は採点基準の書き方と採点結果の受け取り方で、呼び出し口は問わない」。スキルの「Claude プランで動かす記事（Agent SDK、claude -p）」の1に当たるので、オーナーの Claude プランで動かして検証した。`needs_api_key: false`。

## 講座の順番（手順1の2の3）

course_step 6 の2本目。前は #26 `llm-eval-harness-fixtures`、次は #28 `rag-retrieval-eval-recall-mrr`（`content/plan.md` の並び）。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-eval.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: Claude に採点基準と JSON スキーマを渡して採点させる手順を示す記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
