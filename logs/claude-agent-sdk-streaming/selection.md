# selection: claude-agent-sdk-streaming

選んだ日: 2026-11-11

## 読んだ CSV

`keywords/` に CSV は1つも無い（2026-11-11 に `ls keywords/` で確認。README.md だけ）。キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。

テーマ、slug、仮タイトル、検索意図は、メインエージェントの指示（`content/plan.md` の #2 を、オーナーの裁定に合わせて Claude プランで動く形に書き直すもの）に従った。指示の slug は `claude-agent-sdk-streaming`、仮タイトルは「LLM の応答をストリーミングで1文字ずつ表示する【Claude Agent SDK の includePartialMessages】」、検索意図はやり方。

タイトルは仮タイトルの68字から、C25（60字超の文）を満たすため「Claude」と「の」を削って59字にした（「LLM の応答をストリーミングで1文字ずつ表示する【Agent SDK、includePartialMessages】」）。キーワード（LLM、ストリーミング、1文字ずつ表示、includePartialMessages）は残した。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-11、`run/02.log`）。値は表示もしていないし、どこにも残していない。

オーナーの裁定（2026-11-11、`.omc/plan-only-rewrite-brief.md` に原文）により、この記事のコードは Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）だけで書き、オーナー自身の Claude プランのログインで動かした（init の `apiKeySource` は `none`、`run/06.log`、`run/07.log`）。Messages API（`@anthropic-ai/sdk`）を直接呼ぶコードは無い。`needs_api_key: false`。

`content/plan.md` #2 の判定（× 、「ストリームのイベントは本物の API からしか得られない」）は、裁定より前のもの。Agent SDK の `includePartialMessages` は、Messages API のストリームのイベント（`message_start`、`content_block_delta` など）をそのまま `stream_event` に包んで渡す（型定義 sdk.d.ts の `SDKPartialAssistantMessage`、公式の streaming-output のページ）。そのため、イベントの形はプランのログインでも本物の API のイベントとして観察できた（`run/06.log`）。

## 既存記事との重なり（G06）

2026-11-11 に `ls content/articles` で26本（この記事のほか25本）。`grep -l -i 'includePartialMessages\|stream_event\|text_delta' content/articles/*.md` は、この記事だけを返した。ストリーミングの表示を扱う記事は、ほかに無い。

計画上の隣の記事と、指示で名指しされた記事との分担は次のとおり。

| slug | 答える検索意図 | 重なり |
|---|---|---|
| `claude-agent-sdk-first-agent`（#17） | Agent SDK の導入と `query()` のメッセージ（init、assistant、user、result）の読み方 | なし。この記事はメッセージの種類と SDK の入れ方の説明を省き、59行目で #17 にリンクして任せた。足したのは `includePartialMessages` と `stream_event` だけ。`total_cost_usd` の読み方も #17 にリンクした（284行目） |
| `ai-agent-max-turns-budget-limit`（#18） | `maxTurns`、`maxBudgetUsd` で止める | なし。この記事の `maxTurns: 1` はオプションの指定として使うだけで、止まったときの結果や例外には触れていない |
| `llm-as-a-judge-claude`（#27） | 採点基準と `outputFormat` | なし。この記事は `outputFormat` を使わない |
| `claude-p-script-first-call`（#1、指示で名指し） | `claude -p` で初めて呼ぶ | なし。最初の確認では原稿が無く、最後の確認（同じ日）では別の作業が書いた下書きがあった。この記事は `claude -p` を扱わない。前の記事として50行目でリンクした |
| `llm-api-cost-estimate-js-tiktoken`（#3） | リクエスト前の料金の見積もり | なし。講座の次の記事として301行目でリンクした |
| `mcp-server-streamable-http` | MCP の Streamable HTTP のトランスポート | なし。名前に stream を含むが、MCP の通信方式の記事で、LLM の応答の表示は扱わない |

## 外した候補

CSV が無いので、候補の一覧そのものが無い。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-api.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: 応答を1文字ずつ表示するストリーミングの設定と待ち時間の変化を扱う記事で、この検索に答えます。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
