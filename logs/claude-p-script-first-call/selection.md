# selection: claude-p-script-first-call

選んだ日: 2026-11-11

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-11 に `ls keywords/` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。テーマ、タイトル、slug、検索意図は、メインエージェントの指示（オーナーの裁定 2026-11-11。費用を月額のプランの範囲に収める趣旨を受けた書き直し）と、`content/plan.md` の #1（書き直し後の行。2026-11-11 の時点で `claude-p-script-first-call`、やり方、プラン、内部リンク先 2、5、17）に従った。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-11。`run/01.log`）。値は表示もしていないし、どこにも残していない。

記事のコードは `claude -p`（シェルから直接と、Node.js の `child_process` 経由）だけで、Messages API（`@anthropic-ai/sdk`）を呼ぶコードは無い。オーナー自身の Claude プランでログインした Claude Code で実際に動かした（init の `apiKeySource` は `"none"`、`run/09.log`）。`needs_api_key: false`。

## 既存記事との重なり（G06）

2026-11-11 に `content/articles/*.md` の frontmatter の `title` を全件読み、本文を `claude -p` で `grep -c` した。書き始めの時点（23本）では `claude -p` を含む記事は0本だった。

書いている途中に、並行して書かれた原稿が増えた（`git status` で確認。`claude-agent-sdk-streaming`、`claude-code-api-key-billing-auth`、`claude-agent-sdk-structured-output`、`ai-agent-custom-tools-agent-sdk`、`rag-answer-with-citations-claude`）。このうち隣り合う2本は見出しと本文の該当行を読んだ。

| slug | 答える検索意図 | 重なり |
|---|---|---|
| `claude-agent-sdk-first-agent`（#17） | Agent SDK の導入と `query()` のメッセージの読み分け | なし。この記事は Agent SDK のコードを載せず、422行目でリンクするだけ。`apiKeySource` は 210〜228行目で `claude -p` の `stream-json` から1回読むだけで、メッセージの種類の読み分けはしない |
| `claude-agent-sdk-streaming`（#2） | Agent SDK の `includePartialMessages` でストリーミング表示 | なし。この記事は `json` の形式で結果をまとめて受け取る。ストリーミングは 422行目で形式の名前に触れ、443行目で次の記事として渡す |
| `claude-code-api-key-billing-auth`（#5） | ANTHROPIC_API_KEY で従量課金になる原因と直し方（エラー） | 一部が近い。あちらは `apiKeySource` の値の表、無効なキーでの再現、キーの外し方、「subtype だけ見ると、認証の失敗を見逃す」（211行目）を扱う。この記事の `apiKeySource` は「プランで動いたかの確認」の1ブロックで、`none` 以外のときは 228行目で #5 にリンクして任せた。`--bare` の節（230行目〜）の `is_error` の話は、`--bare` がプランのログインを読まないことの結果として1段落だけ書いた。キーの外し方は書いていない |
| `ai-agent-max-turns-budget-limit`（#18） | `maxTurns`・`maxBudgetUsd` | なし。この記事は上限を扱わない |
| `llm-as-a-judge-claude`（#27） | 採点 | なし。この記事は `outputFormat` も `--json-schema` も使わない |
| ほかの18本 | RAG、MCP、zod、評価、tiktoken、429 | なし。`claude -p` を含まない |

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 1、講座の1本目）とキー不要の判定は `content/plan.md` の #1 をそのまま使った。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-api.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: claude -p を使い、月額プランの範囲で LLM を呼ぶ最初の1回を扱う記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
