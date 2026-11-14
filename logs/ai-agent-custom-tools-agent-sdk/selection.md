# selection: ai-agent-custom-tools-agent-sdk

選んだ日: 2026-11-11

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-11 に `ls keywords/` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。この記事は、メインエージェントからの依頼（`.omc/plan-only-rewrite-brief.md` と、計画表 #16 をこの slug、仮タイトル、内容で書く指示）で書いた。

人気度（検索ボリューム、Google トレンド、Search Console）は比べていない。比べる候補の一覧が CSV に無いため。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-11。`run/02.log` にも同じ結果）。値は表示もしていないし、どこにも残していない。

この記事のコードは Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）と zod だけで、Messages API（`@anthropic-ai/sdk`）を直接呼ぶコードは無い。オーナーの判断（依頼の brief に原文あり。API キーは使わず月額のプランで動かす）と、スキルの「Claude プランで動かす記事（Agent SDK、claude -p）」に従い、オーナー自身の Claude プランでログインした環境で実際に動かした（init の `apiKeySource` は `"none"`、`run/06.log`）。`needs_api_key: false`。

計画表 #16 の元の内容（Messages API で tool use のループを自作する）は、Messages API の書き方が検索意図の中心だった。この記事はそれを Agent SDK で言い換えたものではなく、検索意図を「エージェントに自作ツールを渡す」に置き換えた記事として書いた。Agent SDK の `tool()` と `createSdkMcpServer()` が、その意図に対する公式の答えになっている（`sources.md` の出典1）。

## 既存記事との重なり（G06）

2026-11-11 に `ls content/articles` で、この記事のほか27本を確かめた（並行して書かれている記事を含む）。全件の `title` を読み、本文を `createSdkMcpServer` と `mcp__` で `grep -l` した。

- `createSdkMcpServer` を使う記事は、この記事だけ。
- `mcp__` を含むのは、この記事のほかに `mcp-server-resources-prompts`（413行目。Claude Code でプロンプトを `/mcp__servername__promptname` で呼べることを1文で書くだけ）。ツール名の決まりと `allowedTools` の書き方は扱っていない。重なりなし。

`isError` か `is_error` を含む記事は、この記事のほかに6本あった。どれも答える検索意図が違う。

| slug | 答える検索意図 | 重なり |
|---|---|---|
| `claude-agent-sdk-first-agent`（#17） | Agent SDK の導入と `query()` のメッセージの読み方 | なし。あちらは組み込みの Glob と Read を使い、自作ツールは作らない。この記事はメッセージの種類の説明をあちらに任せた（78、358行目でリンク） |
| `ai-agent-max-turns-budget-limit`（#18） | `maxTurns`・`maxBudgetUsd` で止める | なし。この記事は `maxTurns: 10` を安全のための上限として入れるだけで、止まったときの結果と例外は書かない（267行目でリンク） |
| `ai-agent-safe-file-tool`（#19） | ファイル操作ツール関数の安全な作り方 | なし。この記事のツールは読むか計算するだけで、パスの検査は書かない（337行目でリンク） |
| `mcp-server-typescript-stdio`（#21） | 別プロセスの MCP サーバーを stdio で作る | なし。この記事は同じプロセスで動く SDK の MCP サーバーだけを扱う（337行目でリンク） |
| `mcp-inspector-debug`、`mcp-server-resources-prompts` | MCP サーバーの調べ方、Resources と Prompts | なし |
| `zod-to-json-schema-tool-definition`（#8） | zod から JSON Schema を作る | なし。この記事は変換の中身を書かず、239行目でリンクする |
| `claude-code-api-key-billing-auth`、`claude-p-script-first-call`、`rag-answer-with-citations-claude`、`claude-agent-sdk-streaming` | API キーの課金、`claude -p`、RAG の回答、ストリーミング | なし。自作ツールの定義を扱っていない |
| `ai-agent-vs-workflow`（#20） | エージェントとワークフローの違い | なし。組み込みツールを使う比較の記事 |

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 4）は `content/plan.md` の #16 をそのまま使った。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-ai-agent.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: 自作ツールを渡してツール呼び出しの往復を実行結果で見せる記事で、この検索の疑問に答えます。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
