# selection: zod-validate-llm-json-output

選んだ日: 2026-10-31

## 読んだ CSV

- `keywords/` にあるのは `README.md` だけで、ラッコキーワードの CSV は1つも届いていない（2026-10-31 に `ls keywords` で確認）。
- write-article スキルの手順1-1 は「CSV が1つも無ければ、その時点で止めて『CSV 待ち』と報告する」と定めている。今回は、`content/plan.md` の30本計画を進めるワークフローの指示（CSV が届いていないこと、`target_query` を null に保つこと、G10 を NG にすることを明示した指示）で、CSV なしで書き進めた。
- `target_query` は null。CSV に無いキーワードは作っていない。検索ボリュームによる絞り込み（手順1-2-4）も実施できていない。
- ゲート G10 は NG。CSV が届くまで `status: draft` のまま止める。

## 絞り込み

| 順 | 条件 | 結果 |
|---|---|---|
| 1 | 既存記事との重なり | `content/articles/` の frontmatter（`title`、`main_keyword`、`target_query`）を全件読んだ（2026-10-31 時点で、この記事のほかに `mcp-server-typescript-stdio.md`、`llm-api-cost-estimate-js-tiktoken.md`、`llm-api-429-retry-sdk-mock.md`）。順に MCP サーバーの自作（やり方）、料金の見積もり（やり方）、429・529 のリトライ（エラー）。main_keyword はそれぞれ「MCPサーバー」「LLM API」「LLM API」で、「構造化出力」の記事は無い。LLM の出力 JSON を zod で検証する方法（やり方）に答える記事は無く、表記ゆれの範囲でも重ならない |
| 2 | `ANTHROPIC_API_KEY` | `unset`（2026-10-31 に `test -n "$ANTHROPIC_API_KEY" && echo set \|\| echo unset` で確認）。この記事のコードは zod だけで動き、API を呼ばない（`run/14.log` でネットワークの無い名前空間でも全コマンドが exit=0）。検証する JSON は手で作った見本で、本文にそう明記した。`needs_api_key: false` |
| 3 | 講座の順番 | course_step 2（構造化出力）。`content/plan.md` の計画表 #7 で、キー不要 ○ の記事 |
| 4 | 検索ボリューム | CSV が無いので未実施 |

外した候補と理由:

- course_step 2 の #6（`claude-agent-sdk-structured-output`）と #10（`structured-output-methods-compare`）: モデルが返した JSON を見せる記事で、動かすには Claude のログインが要る。この記事は LLM を呼ばないので前提から外した。
- テーマはワークフローの指示で決まっている。CSV が届いたら `target_query` を CSV の行から選び直し、合う行が無ければ差し替える（`plan.md` の前提）。
- 計画上の重なりの決め事（`plan.md`「重なりを避けるために決めたこと」）: この記事（#7）は「形が合っているか」、#9 `llm-json-parse-error-fix` は「JSON として読めるか」に答える。この記事は JSON として読めない文字列を扱わない（本文183行目）。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-structured-output.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: LLM が返した JSON を zod の safeParse で検証する記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
