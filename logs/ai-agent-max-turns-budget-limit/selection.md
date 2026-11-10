# selection: ai-agent-max-turns-budget-limit

選んだ日: 2026-11-10

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-10 に `ls keywords/` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。この記事を書いたのは、ワークフローの指示（CSV なしで書き進め、G10 を NG にして下書きで止める）によるもので、テーマ、タイトル、slug は `content/plan.md` の #18 に従った。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-10）。値は表示もしていないし、どこにも残していない。`run/*.log` の4行目にも、実行のたびに `set` か `unset` だけを書いている（すべて `unset`）。

この記事のコードは Claude Agent SDK（`@anthropic-ai/claude-agent-sdk` 0.3.322）だけを使い、Messages API（`@anthropic-ai/sdk`）は呼ばない。スキルの「Claude プランで動かす記事（Agent SDK、claude -p）」に従い、オーナーの Claude プランでログインした Claude Code で動かした。init メッセージの `apiKeySource` は全実行で `none`（`run/04.log`〜`08.log`、`12.log`、`13.log`）。検索意図は Agent SDK の `maxTurns` と `maxBudgetUsd` そのもので、Messages API の書き方を作り替えた記事ではない（`content/plan.md` #18 の判定「プラン」）。`needs_api_key: false`。

## 既存記事との重なり（G06）

2026-11-10 の2回目の確認（レビューの指摘を受けて取り直した）。最初の確認は、この記事のほか19本（`ls content/articles/` で20ファイル）を読んだ時点のもので、そのあとに記事が増えていた。今は `ls content/articles/` で23ファイル、この記事のほか22本ある。22本すべての frontmatter（title、main_keyword、target_query）を読んだ。`target_query` はどれも null なので、検索語での突き合わせはできない。判断は記事の中身で行った。

本文を `grep -cE 'maxTurns|maxBudgetUsd|error_max_turns|error_max_budget_usd|claude-agent-sdk|Agent SDK|total_cost_usd'` で数えると、当たったのは `ai-agent-vs-workflow`（37行）、`claude-agent-sdk-first-agent`（42行）、`llm-as-a-judge-claude`（25行）、`promptfoo-llm-eval-intro`（27行）の4本で、ほかの18本は0行だった。上限そのもの（`maxTurns|maxBudgetUsd|error_max_turns`）で `grep -ln` をかけると、当たるのは `ai-agent-vs-workflow` と `claude-agent-sdk-first-agent` の2本（この記事を除く）。

| slug | main_keyword | 答える検索意図 | 重なり |
|---|---|---|---|
| `claude-agent-sdk-first-agent` | AIエージェント | Agent SDK の導入と、`query()` のメッセージの読み分け | なし。plan #17。この記事の1つ前。本文で上限に触れるのは、`maxTurns: 1`（160、187行目）と `maxTurns: 10`（263、328行目）を入れたことと、上限で止まったときの結果と例外をこの記事に回すと書いた328行目だけ。止まったときの結果の中身、ターンの数え方、`maxBudgetUsd`、例外の受け止め方は書いていない。364行目で「上限で止める回」としてこの記事へリンクしている。`content/plan.md` の重なりの決めごと（17 は導入とメッセージの読み方、18 は上限と止まったときの結果と例外）と同じ分け方 |
| `ai-agent-vs-workflow` | AIエージェント | AI エージェントとワークフローの違い（次の手順を LLM が決めるかコードが決めるか）と、どちらを選ぶか | なし。検索意図は比較で、この記事は上限の渡し方と止まったときの扱い（やり方）。`maxTurns` が出るのは、ワークフロー側の `query()` を1回の呼び出しにする `maxTurns: 1`（186、230行目）、エージェント側の停止条件の `maxTurns: 10`（294、317行目。10往復で終わらなければ `error_max_turns` で止まる、の1文）、選び方の箇条書きの「`maxTurns` と `maxBudgetUsd` の少なくとも一方を渡します」（370行目）。止まったあとの結果と例外の扱いは書かず、372行目で `/posts/ai-agent-max-turns-budget-limit` へのリンクに任せている。`maxBudgetUsd` の超え方、ターンの数え方、上限の値の決め方は書いていない |
| `llm-as-a-judge-claude` | LLM 評価 | LLM-as-a-Judge で回答を採点する | なし。Agent SDK を採点に使う記事で、`maxTurns`、`maxBudgetUsd` は0行。`error_max_structured_output_retries` の結果のあとに例外が来ることを書き、例外の読み方は239行目でこの記事へのリンクに任せている |
| `promptfoo-llm-eval-intro` | LLM 評価 | promptfoo でプロンプトを評価する | なし。Agent SDK の名前と `total_cost_usd` が出るのは promptfoo の Claude プランでの動かし方と料金の話で、上限は0行 |
| `ai-agent-safe-file-tool` | AIエージェント | エージェントのファイル操作ツールの安全性 | なし。講座でこの記事の次。上限の話は無い（grep で0行） |
| `llm-api-429-retry-sdk-mock` | LLM API | 429・529 のエラーとリトライ | なし。リトライの回数の話で、エージェントのループの上限ではない（grep で0行） |
| `llm-api-cost-estimate-js-tiktoken` | LLM API | リクエスト前の料金の見積もり | なし。トークンを数える見積もりで、実行中に金額で止める話は無い（grep で0行） |
| ほかの15本（`zod-*` 2本、`llm-json-parse-error-fix`、`rag-*` 5本、`mcp-*` 5本、`llm-eval-*` 2本） | 構造化出力、RAG、LLM 評価、MCPサーバー | それぞれ別の主題 | なし（grep で0行） |

`ai-agent-tool-use-loop-typescript`（plan #16、自作ループ。上限の数を自作ループに足す回）は、2回目の確認の時点でも原稿が無い（`ls content/articles/` に無い）。plan の決めごとどおり、この記事は自作ループに上限を足す書き方を扱わず、リンクだけにした。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 4）とキー不要の判定（プラン）は `content/plan.md` の #18 をそのまま使った。
