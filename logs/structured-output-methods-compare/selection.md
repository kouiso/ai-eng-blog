# selection: structured-output-methods-compare

選んだ日: 2026-11-11

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-11 に `ls keywords/` で確認）。ラッコキーワードの CSV はまだ届いていない。

（この節は CSV が届く前の記述。下の「2026-11-11 追記: target_query を決めた」で置き換わっている。今は `target_query` が入り、G10 は OK。）そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。テーマ、仮タイトル、slug は `content/plan.md` の #10 と、メインの指示（`.omc/plan-only-rewrite-brief.md` と、この記事を担当させた指示）に従った。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-11。`run/02.log` にも同じ結果）。値は表示もしていないし、どこにも残していない。

`content/plan.md` #10 は、もとは「3つのやり方を実際に呼んで結果を比べる記事なのでキーが要る」として × だった。2026-11-11 のオーナーの指示（`.omc/plan-only-rewrite-brief.md` に原文）で、API キーを使わず、オーナーの月額の Claude プランで動く形に書き直すことになった。そのため3つのやり方は、どれも Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）の `query()` の上で比べている。

- (a) プロンプトで JSON を指示し、`JSON.parse` で読む
- (b) 取り出したい形を入力スキーマにした自作ツール（`tool()` と `createSdkMcpServer()`）を呼ばせる
- (c) `outputFormat`（`type: "json_schema"`）

Messages API（`@anthropic-ai/sdk`）を呼ぶコードは無い。init メッセージの `apiKeySource` は `"none"`（`run/06.log`、`run/11.log` の最終行）。`needs_api_key: false`。

## 既存記事との重なり（G06）

2026-11-11 に `ls content/articles` で24本（この記事を除く。#6 と #16 の下書きができる前）を確かめ、frontmatter の `title`、`main_keyword`、`target_query`（すべて null）を読んだ。本文を `outputFormat`、`structured_output`、`createSdkMcpServer`、`構造化出力` で `grep -l -i` すると6本が当たったので、その6本は見出しも読んだ。

| slug | 答える検索意図 | 重なり |
|---|---|---|
| `zod-validate-llm-json-output` | LLM の出力 JSON の形を zod で検証する | なし。この記事は `safeParse` を採点に使うだけで、エラーの読み方は書かない。リンクで任せる |
| `zod-to-json-schema-tool-definition` | zod から JSON Schema を作ってツール定義に使う | なし。この記事は `z.toJSONSchema` を使うだけで、変換の書き方は書かない。`target: "draft-7"` を渡す理由は2文で触れ、詳しい理由は #6 に任せる |
| `llm-json-parse-error-fix` | `JSON.parse` が失敗する原因と直し方 | なし。この記事の (a) は、失敗したら数えるだけで直さない。直し方はリンクで任せる。講座の1つ前の記事で、`next` がこの記事の slug になっている |
| `llm-as-a-judge-claude` | LLM-as-a-Judge で採点する | なし。あちらは `outputFormat` を採点の道具に使う記事。この記事は3つのやり方の比べ方と選び方を扱う |
| `llm-eval-harness-fixtures` | 回答を完全一致などで採点する | なし。本文に「構造化出力」の語が出るだけ |
| `rag-bm25-search-typescript` | BM25 で検索部分を作る | なし。`prev` がこの記事の slug になっているだけ |

計画上の隣の記事とは、指示に従って分けた。

- #6（`claude-agent-sdk-structured-output`、`outputFormat` の解説）: `outputFormat` の仕組みとエラーの扱いを詳しく書かず、リンクで任せる。書き始めの時点では原稿が無かったが、判定の途中で並行の作業から下書きができた。あちらは「zod でスキーマを書くなら target を draft-7 にする」の節とコネクタの話を持つので、この記事の draft-7 の話は2段落に縮め、理由はあちらに任せた
- #7（`zod-validate-llm-json-output`）: zod の説明をせず、リンクで任せる
- #16（`ai-agent-custom-tools-agent-sdk`、自作ツールの解説）: `tool()` と `createSdkMcpServer()` の中身を説明せず、リンクで任せる。これも判定の途中で下書きができた。あちらは `strictMcpConfig` とコネクタを扱うので、この記事は (b) の見積もりが何倍になったかの数字だけを残し、指定の意味はあちらに任せた
- #17（`claude-agent-sdk-first-agent`）: `query()` のメッセージの読み方を繰り返さない
- #18（`ai-agent-max-turns-budget-limit`）: `maxTurns` は3つのやり方の上限として入れるだけで、止まったときの結果は扱わない
- #27（`llm-as-a-judge-claude`）: 採点の考え方は扱わない

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 2）は `content/plan.md` の #10 をそのまま使った。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-structured-output.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: プロンプト指示、自作ツール、outputFormat の3つを比べる記事で、プロンプトでの指示も扱います。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
