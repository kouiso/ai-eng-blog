# selection: promptfoo-llm-eval-intro

選んだ日: 2026-11-10

## 読んだ CSV

- `keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-10 に `ls -la keywords/` で確認）。
- スキル手順1の1に従えば「CSV 待ち」で止める場面。今回は、ワークフローの指示（この記事を CSV なしで書き進める）に従って先へ進めた。そのため `target_query: null`、ゲート G10 は NG、`status: draft` のまま。
- CSV に無いキーワードを `target_query`、`brief.md`、この `selection.md` に作って書いていない。

## 選んだテーマ

`content/plan.md` の計画表 #29（course_step 6「LLM 評価」）。slug は `promptfoo-llm-eval-intro`、仮タイトルは「promptfoo で LLM のプロンプトを評価する【設定ファイル1つから、Claude プランで動かす】」。キー不要の列は「プラン」。

人気度は比べていない。CSV（検索ボリューム）も Search Console のデータも無く、Google トレンドもこの環境では見ていない。CSV が届いたら、この記事に合う行があるかを選び直す。

## 外した候補と理由

| 候補 | 外した理由 |
|---|---|
| 自作の採点（完全一致、部分一致、正規表現） | 既存の `llm-eval-harness-fixtures`（#26）が答えている。この記事は既製ツールの promptfoo を使う側に限り、採点の方法の説明は #26 にリンクする（plan.md「重なりを避けるために決めたこと」） |
| モデルに採点させる（LLM-as-a-Judge、`llm-rubric`） | #27 `llm-as-a-judge-claude` の担当。この記事では `llm-rubric` を設定に入れない |
| Messages API で評価を回す（`anthropic:messages` プロバイダー） | Messages API を呼ぶので `ANTHROPIC_API_KEY` が要る。unset のあいだは動かせない |

## 既存記事との重なりの確認

`content/articles/*.md` の frontmatter（`title`、`main_keyword`、`target_query`）を全件読んだ（この記事のほか22本。書いている途中に、別の作業で `llm-as-a-judge-claude.md` が増えたので読み直した）。`grep -rl promptfoo content/articles/` は、前後リンクとして slug を書いている `rag-retrieval-eval-recall-mrr` と `llm-eval-dataset-from-logs` の2本だけで、promptfoo の使い方を書いた記事は無い。LLM 評価の既存記事は `llm-eval-harness-fixtures`（自作の採点）、`llm-as-a-judge-claude`（Agent SDK でモデルに採点させる。promptfoo には触れていない）、`rag-retrieval-eval-recall-mrr`（検索の指標）、`llm-eval-dataset-from-logs`（テストケースの作り方）で、どれも promptfoo の設定とは検索意図が違う。

## ANTHROPIC_API_KEY

`unset`（2026-11-10、`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset`。`run/01.log`）。モデルを呼ぶコードはオーナー自身の Claude プランで動かした（スキル「Claude プランで動かす記事（Agent SDK、claude -p）」）。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-eval.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: promptfoo を設定ファイル1つで動かす入門記事で、この検索の導入にあたります。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
