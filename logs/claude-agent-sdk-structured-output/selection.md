# selection: claude-agent-sdk-structured-output

選んだ日: 2026-11-11

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-11 に `ls keywords/` で確認）。キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。

テーマ、slug、仮タイトル、検索意図は、`content/plan.md` の #6（47行目。2026-11-11 にプランで動かす記事へ書き換えられた行）と、メインのセッションの依頼（`.omc/plan-only-rewrite-brief.md`）に従った。人気度は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-11。`run/02.log`）。値は表示もしていないし、どこにも残していない。

オーナーの裁定（2026-11-11、`.omc/plan-only-rewrite-brief.md` の「Owner ruling」に原文あり）で、記事のコードは月額の Claude プランで動く Agent SDK か `claude -p` にする。この記事のコードは Agent SDK（`@anthropic-ai/claude-agent-sdk`）と zod だけで、Messages API（`@anthropic-ai/sdk`）を直接呼ぶコードは無い。`needs_api_key: false`。init の `apiKeySource` は `none`（`run/06.log`）。

## 既存記事との重なり（G06）

2026-11-11 に `content/articles/*.md`（この記事のほか29本）の frontmatter の `title`、`main_keyword` を全件読んだ（`target_query` は全件 null）。本文を `outputFormat`、`structured_output`、`json-schema` で `grep -i` し、当たった4本は該当箇所を読んだ。

| slug | 答える検索意図 | 重なり |
|---|---|---|
| `zod-validate-llm-json-output`（#7） | 受け取った JSON を zod で検証し、safeParse のエラーを読む | なし。この記事は safeParse を1回呼ぶだけで、`issues` の読み方は #7 にリンクして任せた（389行目） |
| `zod-to-json-schema-tool-definition`（#8） | zod から JSON Schema を作ってツール定義に使う | なし。この記事は `z.toJSONSchema()` の細かい読み方を書かず、#8 にリンクした（322行目）。足したのは、Agent SDK が draft-07 を求めるので `target: "draft-7"` が要ること（#8 は既定の 2020-12 を説明している。同記事300行目）と、省いたときのエラー（`run/10.log`）だけ |
| `llm-json-parse-error-fix`（#9） | JSON.parse の SyntaxError | なし |
| `llm-as-a-judge-claude`（#27） | LLM-as-a-Judge の採点 | なし。#27 は `outputFormat` を採点の道具として使い、説明は構造化出力の記事に任せている（223行目。ただしリンク先は旧 slug `claude-structured-outputs-json` のまま） |
| `rag-answer-with-citations-claude`（#14） | 出典つきの回答 | なし。352行目でこの記事にリンクし、`outputFormat` の説明を任せている |
| `claude-code-api-key-billing-auth`（#5） | API キーの従量課金になる原因 | なし。`next` がこの記事 |
| `claude-p-script-first-call`（#1） | `claude -p` で初めて呼ぶ | なし。`--json-schema` を扱っていない（grep 0件） |
| `claude-agent-sdk-first-agent`（#17） | `query()` の導入とメッセージの読み方 | なし。この記事は init と result の読み方を説明し直さず、`outputFormat` に関わる `StructuredOutput` と `structured_output` だけを書いた |
| `ai-agent-max-turns-budget-limit`（#18） | `maxTurns`・`maxBudgetUsd` で止める | なし。`error_max_turns` は本文に出てこない（`run/17.log` の観察を書いた段落は 2026-11-11 の2回目の直しで消した） |
| `structured-output-methods-compare`（#10） | 構造化出力のやり方の比較 | 選んだ時点では原稿が無かった。2026-11-11 の2回目の直しの時点では `content/articles/structured-output-methods-compare.md` があり、`status: draft`。比べる話は #10 に任せ、この記事は1節（370〜376行目）でリンクするだけにした |
| その他20本 | RAG、MCP、評価、ストリーミングなど | なし（題名と main_keyword で判断） |

## 外した候補

CSV が無いので、候補の一覧そのものが無い。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-structured-output.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: Claude に outputFormat と JSON Schema を渡して JSON を確実に返させる記事で、この検索に答えます。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
