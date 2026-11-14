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

## 2026-11-14 追記: target_query を `llm api 呼び出し` に決めた

- 読んだ CSV は `keywords/LLM API.csv`（ラッコキーワードのサジェストの書き出し。2026-11-14）。ラッコキーワードの無料プランで書き出したので、検索数の列は null で、人気度は比べていない。
- `target_query` は、CSV の「キーワード」（サジェストの CSV は `suggestion`）の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-14 にスクリプトで確かめた。
- 選んだ理由: 最初の1回の呼び出しを扱う記事なので、「呼び出し」を含む語が読者の探し方に最も近い。以前の `llm api 月額` は、月額プランの範囲という切り口に寄りすぎていて、記事の入口の検索としては狭かったため置き換えた。講座1（LLM API）に属する。
- 公開後に Search Console の実測で見直す。CSV の行や件数は、ラッコの利用規約の都合でこのリポジトリには写していない（`keywords/README.md`）。

## 2026-11-14 追記（#87 の1。#81 の作業での C01〜C04 の判定し直し）

- 目的: `target_query` が `llm api 呼び出し` に変わった（#83）ので、SKILL.md:117（人気度）と SKILL.md:409（外した候補）の手順を、この記事で実際にやったか記録する。G10 の判定は変えない（#81 の裁定2。G10 の行には #83 を出典にした注記を残した）。
- G06（既存記事との重なり）: 2026-11-14 に `content/articles/*.md` の `target_query` を全件読んだ（30件）。`llm api 呼び出し` と同じ検索意図の記事は無い。語が近いのは `ai エージェント ツール 呼び出し`（`ai-agent-custom-tools-agent-sdk`）だけで、あちらは Agent SDK のカスタムツールの呼び出しの話、この記事は `claude -p` で LLM に1問送る話で、意図が違う。`llm ストリーミング`、`llm api 429`、`claude code api 従量課金` とも、答える問いが違う。

### 人気度の比較（SKILL.md:117。Google トレンドで候補を比べる）

実施できなかった。

- 2026-11-14 に、このクラウドの実行環境から `https://trends.google.com/trends/explore?q=llm%20api&geo=JP` を `curl` で1回取りに行ったところ、HTTP 429 が返った（取得できなかった）。
- 2回目の取得は、実行環境の許可の仕組みに止められた。ブラウザのふりをして制限を避ける方法は取っていない。ほかに、このセッションから Google トレンドの値を読める手段はない。
- 検索数の列も無い。ラッコキーワードの書き出し（`keywords/LLM API.csv`。2026-11-14）は無料プランなので「月間検索数」が null で、しかもこの CSV はオーナーの端末にだけある（`keywords/README.md`、#83）。この作業の環境には置かれていない。
- そのため、`llm api 呼び出し` が候補の中で検索の多い語かどうかは、この記事ではまだ裏付けていない。人気度の比較は、オーナーの端末で Google トレンド（日本、過去12か月）を開ける人が行う項目として残す。公開後は Search Console の実測で見直す。

### 外した候補（SKILL.md:409）

#83 の選定で見たラッコの候補の一覧は、この作業の環境に無いので、そこから外した語は再現できない。次は、この環境で読める `keywords/google-suggest-llm-api.csv`（Google のサジェスト。2026-11-14 取得）と、これまでの `target_query` から、`llm api 呼び出し` の代わりに選ぶ案として検討し、外した語と理由。

| 外した語 | 理由 |
|---|---|
| `llm api 月額`（以前の `target_query`） | 月額のプランという切り口に寄りすぎ、最初の呼び出しを探す人の入口として狭い（#83 の理由）。「月額」は、いまもタイトルに残している |
| `llm api 無料`、`llm api 無料枠`、`llm api 安い`、`llm api コスパ` | 無料にできる範囲や安さを問う検索意図。この記事のコードはプランの利用枠を使うので、「無料」とは書けない |
| `llm api キー`（`llm apiキー`） | この記事は API キーを使わない。キーが使われてしまった場合の話は `claude-code-api-key-billing-auth` の検索意図 |
| `llm api 料金`、`llm api 比較`、`llm api 料金 比較` | 料金表や比較の検索意図で、やり方の記事とは型が違う（`llm-api-cost-estimate-js-tiktoken` とも近い） |
| `llm apiとは` | 概念を知りたい検索意図で、手順とコードを求める読者の記事とは型が違う |
| `llm api`（単体） | 講座1のキーワードそのもので、guides/01 の「ビッグキーワードを避けて、具体的なロングテールを狙う」に反する |

選んだ理由（#83 の理由と同じ）: 最初の1回の呼び出しを扱う記事で、「呼び出し」を含む語が読者の探し方に最も近い。

### 本文を `llm api 呼び出し` に合わせた箇所（2026-11-14）

- タイトル先頭を「LLM API の呼び出しを月額プランで初めて試す」にした（キーワードの前方配置、guides/01 §3）。
- リード1文目を「LLM API の呼び出しは、最初の1回から API キーなしで済みます。」にした（52行目）。description も同じ形に合わせた。
- 前提の節に、Claude の API を直接呼ぶ書き方は扱わないことと、その料金がトークン数に応じることを1段落（67行目、出典7）で書いた。`claude -p` が「API」そのものではないことを、API の呼び出しを探して来た読者に先に伝えるため。
- 事実は変えていない。コードと出力ブロックは1文字も変えていない。
