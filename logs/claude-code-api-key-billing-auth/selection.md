# selection: claude-code-api-key-billing-auth

選んだ日: 2026-11-11

## 読んだ CSV

（この段落は最初の版のもの。今は下の「2026-11-11 追記」のとおり、サジェストの CSV から `target_query` を決め、G10 は OK。）最初は `keywords/` に `README.md` しか無く、CSV は1つも無かった（2026-11-11 に `ls keywords/` で確認）。

テーマ、仮タイトル、slug は、メインエージェントの指示（`.omc/plan-only-rewrite-brief.md` と、2026-11-11 に更新中の `content/plan.md` #5）に従った。オーナーの裁定（2026-11-11。費用を月額のプランの範囲に収める趣旨、`.omc/plan-only-rewrite-brief.md` に原文）で、旧 #5 `claude-api-authentication-error`（Messages API の認証エラー）を、Agent SDK と `claude -p` の認証の記事に差し替えたもの。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。サジェストの CSV に検索ボリュームが無いため（下の追記を参照）。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-11。`run/01.log` にも同じ結果）。

この記事のコードは Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）と `claude -p`、`claude auth status` だけで、Messages API（`@anthropic-ai/sdk`）を直接呼ぶコードは無い。オーナー自身の Claude プランでログインした環境で動かした（`run/05.log`、`run/09.log`、`run/12.log` の init の `apiKeySource` は `none`）。`needs_api_key: false`。

使ったキーは、無効なダミーの文字列 `sk-ant-invalid-demo` だけ（記事の主題である認証エラーを、請求なしで再現するため。メインエージェントの指示で許可されている）。本物のキーはどこにも書いていない。

## 既存記事との重なり（G06）

2026-11-11 に `content/articles/*.md` の `title` を全件読んだ（この記事のほか29本。最初の版では28本と書いていた。2026-11-11 の修正時に `ls` で数え直した。並行で書かれている新しい原稿 `claude-p-script-first-call`、`claude-agent-sdk-streaming`、`claude-agent-sdk-structured-output`、`ai-agent-custom-tools-agent-sdk`、`rag-answer-with-citations-claude` を含む）。

本文の `ANTHROPIC_API_KEY`、`apiKeySource`、`Invalid API key`、`auth status`、`--env-file` の出現数を全件で数えた。`Invalid API key`、`auth status`、`--env-file` が出る記事は、この記事のほかに0本。`ANTHROPIC_API_KEY` と `apiKeySource` は10本に出る。どれも前提の確認（キーを外しておく）か、init の値が `none` だったことの1〜2段落で、エラーを直す記事ではない。

見出しで重なりを確かめた（`grep -n -E '^#{2,3} .*(キー|認証|apiKeySource|課金)'`）。

| slug | 重なりそうな見出し | 判定 |
|---|---|---|
| `claude-agent-sdk-first-agent`（#17） | 221行目「apiKeySource が none なら、API キーは使われていない」 | 重ならない。あちらはやり方の記事で、`none` の意味を1節で説明するだけ。この記事はエラーの記事で、`none` 以外になったときの見分け方、Invalid API key の再現、キーの出どころ別の直し方を扱う。#17 へは61行目でリンク |
| `claude-p-script-first-call`（#1） | 219行目「apiKeySource が none なら、API キーは使われていない」 | 同上。#1 は `claude -p` をスクリプトから呼ぶやり方の記事。61行目でリンク |
| `ai-agent-max-turns-budget-limit`（#18） | なし | `for await` が結果のあとに例外を投げる動きは #18 の範囲なので、この記事では215行目の1文にとどめ、リンクで任せた |
| `promptfoo-llm-eval-intro`（#29） | 431行目「ほかの人に使わせるなら API キーで動かす」 | 重ならない。評価ツールの設定の記事。この行の見出しは、利用条件の注意書きを足さない裁定（2026-11-11）の前の版のもの。 |

`content/plan.md` の「重なりを避けるために決めたこと」に、#5 についての決めごとは無い（2026-11-11 の差分も読んだ）。#17・#18・#27 の決めごとには触れていない（`outputFormat` は使っていない。`maxTurns: 1` はオプションとして渡すだけで、上限の説明はしない）。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-api.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: API キーがあると従量課金になる原因と直し方を、Claude Code と SDK で示す記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
