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

`content/articles/*.md` の frontmatter（title、main_keyword、target_query）を全件読んだ（2026-11-10、この記事のほか19本。`ls content/articles/` で20ファイル）。`target_query` はどれも null なので、検索語での突き合わせはできない。判断は記事の中身で行った。本文を `maxTurns`、`maxBudgetUsd`、`claude-agent-sdk`、`Agent SDK`、`error_max_turns` で grep し、当たったのは `claude-agent-sdk-first-agent` だけだった。

| slug | main_keyword | 答える検索意図 | 重なり |
|---|---|---|---|
| `claude-agent-sdk-first-agent` | AIエージェント | Agent SDK の導入と、`query()` のメッセージの読み分け | なし。plan #17。この記事の1つ前。本文で `maxTurns` に触れるのは、`maxTurns: 1`（160、187行目）と `maxTurns: 10`（263行目）を上限として入れたこと、上限に達すると `error_max_turns` になり例外が投げられること（328行目）の1段落だけで、止まったときの結果の中身、ターンの数え方、`maxBudgetUsd`、例外の受け止め方は書いていない。末尾（364行目）で「上限で止める回」としてこの記事へリンクしている。行番号は 2026-11-10 に読んだ版のもの（その記事は別のワークフローが並行して直しているので、行番号は動くことがある）。`content/plan.md` の重なりの決めごと（17 は導入とメッセージの読み方、18 は上限と止まったときの結果と例外）と同じ分け方 |
| `ai-agent-safe-file-tool` | AIエージェント | エージェントのファイル操作ツールの安全性 | なし。講座でこの記事の次。上限の話は無い |
| `llm-api-429-retry-sdk-mock` | LLM API | 429・529 のエラーとリトライ | なし。リトライの回数の話で、エージェントのループの上限ではない |
| `llm-api-cost-estimate-js-tiktoken` | LLM API | リクエスト前の料金の見積もり | なし。トークンを数える見積もりで、実行中に金額で止める話ではない |
| ほかの16本（`zod-*`、`llm-json-parse-error-fix`、`rag-*`、`mcp-*`、`llm-eval-*`） | 構造化出力、RAG、MCPサーバー、LLM 評価 | それぞれ別の主題 | なし（grep で0件） |

`ai-agent-tool-use-loop-typescript`（plan #16、自作ループ。上限の数を自作ループに足す回）は原稿がまだ無い。plan の決めごとどおり、この記事は自作ループに上限を足す書き方を扱わず、リンクだけにした。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 4）とキー不要の判定（プラン）は `content/plan.md` の #18 をそのまま使った。
