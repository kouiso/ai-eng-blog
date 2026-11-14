# selection: llm-api-cost-estimate-js-tiktoken

選んだ日: 2026-10-31

## 読んだ CSV

- `keywords/` にあるのは `README.md` だけで、ラッコキーワードの CSV は1つも届いていない（`ls -la keywords` で確認、2026-10-31）。
- write-article スキルの手順1-1 は「CSV が1つも無ければ、その時点で止めて『CSV 待ち』と報告する」と定めている。今回は、ワークフローの指示（CSV は届いていない、`target_query` は null のまま、G10 は NG、記事は draft のまま）に従って書き進めた。スキルの例外「ユーザーが CSV なしで書き進めるよう明示したとき」に当たるかどうかは、指示がワークフローのスクリプト経由のため、報告に含めて判断を返す。
- `target_query` は null。CSV に無いキーワードは作っていない（`brief.md` の検索語の話も、検索データではなく記事の中身から決めた仮の分類）。
- 検索ボリュームによる絞り込み（手順1-2-4）は、CSV が無いので実施していない。
- ゲート G10 は NG（CSV 待ち）。CSV が届くまで、この記事は `status: draft` のまま止める。

## 絞り込み

| 順 | 条件 | 結果 |
|---|---|---|
| 1 | 既存記事との重なり | `content/articles/*.md` の frontmatter を全件読んだ。既存は `mcp-server-typescript-stdio`（title「MCP サーバーを TypeScript で自作する手順【SDK v1.32.2、Claude Code に接続まで】」、main_keyword「MCPサーバー」、target_query null）の1本だけ。料金の見積もりとトークン数に答える記事は無い。`content/plan.md` の30本の計画でも、料金の見積もりを扱うのはこの #3 だけ |
| 2 | `ANTHROPIC_API_KEY` | `unset`（2026-10-31 に `test -n "$ANTHROPIC_API_KEY" && echo set \|\| echo unset` で確認。値は表示していない）。この記事のコードは LLM の API を呼ばない。js-tiktoken は語彙を同梱しており、ネットワークを切っても動くことを `run/09.log` で確かめた |
| 3 | 講座の順番 | course_step 1（LLM API）。計画表の #3。#1・#2・#5 は API キーが要る（計画表の「キー不要 ×」）ので、step 1 の中でキー不要の #3 と #4 が先に書ける。ワークフローの指示で #3 を選んだ |
| 4 | 検索ボリューム | CSV が無いので未実施 |

外した候補と理由:

- course_step 1 の `claude-api-typescript-first-call`、`claude-agent-sdk-streaming`、`claude-code-api-key-billing-auth`: API キーで動く版は `ANTHROPIC_API_KEY` が unset で動かせず（C38 を満たせない）、外した。2026-11-11 に Agent SDK 版（プランのログインで動かす）へ置き換わっている。
- course_step 1 の `llm-api-429-retry-sdk-mock`: キー不要で書けるが、今回はワークフローの指示で #3 を選んだ。CSV が届けば検索ボリュームで順を見直す候補。

## Claude を対象にしない理由

Claude のトークン数は、オフラインで正確に数える方法が無い。`@anthropic-ai/tokenizer` の README は「Claude 3 以降では正確ではなく、大まかな近似」と書いている（https://github.com/anthropics/anthropic-tokenizer-typescript 、2026-10-31 確認。中身は raw.githubusercontent.com から取得）。Claude の正確な数は count_tokens API で得られるが、API キーが要る。そのため記事は OpenAI のトークナイザー（js-tiktoken）で数える内容にし、Claude が対象外であることを本文に書いた。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-api.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: リクエスト前にトークン数を数えて料金を見積もる方法を扱う記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
