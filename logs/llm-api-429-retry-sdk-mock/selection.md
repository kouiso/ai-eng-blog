# selection: llm-api-429-retry-sdk-mock

選んだ日: 2026-10-31（重なりの確認は 2026-11-10 に全件でやり直した）

## 読んだ CSV

- `keywords/` にあるのは `README.md` だけで、ラッコキーワードの CSV は1つも届いていない（2026-10-31 に `ls keywords` で確認）。
- write-article スキルの手順1-1 は「CSV が1つも無ければ、その時点で止めて『CSV 待ち』と報告する」と定めている。今回は、`content/plan.md` の30本計画を進めるワークフローの指示（CSV が届いていないこと、`target_query` を null に保つこと、G10 を NG にすることを明示した指示）で、CSV なしで書き進めた。
- `target_query` は null。CSV に無いキーワードは作っていない。検索ボリュームによる絞り込み（手順1-2-4）も実施できていない。
- ゲート G10 は NG。CSV が届くまで `status: draft` のまま止める。

## 絞り込み

| 順 | 条件 | 結果 |
|---|---|---|
| 1 | 既存記事との重なり | 2026-11-10 に `content/articles/` の18ファイル（この記事を含む）の frontmatter の `title`、`main_keyword`、`target_query` を全件読み直した（2026-10-31 の判定は3ファイルの時点のもので、古くなっていた）。`target_query` は18ファイルすべて null で、語の一致では比べられないので、title と main_keyword で検索意図を比べた。同じ `main_keyword: "LLM API"` は `llm-api-cost-estimate-js-tiktoken`（料金をリクエスト前に見積もる、やり方）だけ。エラーを直す型の記事は `llm-json-parse-error-fix`（JSON.parse の失敗、構造化出力）と `mcp-connection-closed-fix`（MCP の Connection closed）で、どちらも 429・529 とリトライの検索には答えない。本文も `grep -lE "429|529|リトライ|maxRetries|retry-after|レート制限|rate_limit|overloaded"` で全件にかけ、当たったのはこの記事、`llm-api-cost-estimate-js-tiktoken`（この記事への next リンクの1行だけ）、`rag-hybrid-search-rrf`（BM25 のスコア `1.529` の数字）の3本。`grep -i retry` で当たる `zod-validate-llm-json-output` の `retry-message.ts` は、zod の検証エラーをモデルに返して直させるファイルの名前で、HTTP のリトライの話ではない。429・529 のエラーとリトライ（エラー）に答える記事はほかに無く、表記ゆれの範囲でも重ならない |
| 2 | `ANTHROPIC_API_KEY` | `unset`（2026-10-31 に `test -n` で確認）。この記事は SDK の `baseURL` を手元のモックサーバーに向け、ダミーの文字列をキーに渡すので、API を呼ばない（`run/11.log` でループバックだけの環境でも同じ結果になることを確かめた）。`needs_api_key: false` |
| 3 | 講座の順番 | course_step 1（LLM API）。`content/plan.md` の計画表 #4 で、キー不要 ○ の記事 |
| 4 | 検索ボリューム | CSV が無いので未実施 |

外した候補と理由:

- course_step 1 の #1、#2、#5（`plan.md`）: 応答を受け取るところまで動かすには有効なキーが要る。`ANTHROPIC_API_KEY` が unset なので外した。
- テーマはワークフローの指示で決まっており、CSV が届いたら `target_query` を CSV の行から選び直し、合う行が無ければ差し替える（`plan.md` の前提）。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-api.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: 429 と 529 のエラーの意味と、SDK の自動リトライの確かめ方を扱う記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
