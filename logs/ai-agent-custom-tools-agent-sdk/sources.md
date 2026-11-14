# sources: ai-agent-custom-tools-agent-sdk

アクセス日はすべて 2026-11-11。原稿の frontmatter の `sources` と、本文末尾の出典の表（番号も同じ）に同じ URL と日付を入れた。行番号は `content/articles/ai-agent-custom-tools-agent-sdk.md`（360行）の版。code.claude.com のページは、同じパスに `.md` を付けた Markdown 版を取得して読んだ。

| # | 題名 | URL | 確かめた事実 | 根拠にした本文の行 |
|---|---|---|---|---|
| 1 | Give Claude custom tools | https://code.claude.com/docs/en/agent-sdk/custom-tools | `tool()` に名前、説明、入力スキーマ、処理を渡し、`createSdkMcpServer` で包んで `mcpServers` で渡す。`.describe()` の説明はモデルに届く。戻り値は `content`（必須）と `isError`（任意、失敗をモデルに伝える）。「Call a custom tool」で、`allowedTools` には `mcp__{server_name}__{tool_name}` の完全な名前を書き、キーに `.` や空白があれば `_` に置き換える。`mcp__weather__*` のワイルドカード。「Configure allowed tools」の表で、`tools: []` は組み込みをすべて外し MCP ツールだけになる、`allowedTools` は事前承認で、外したツールは権限の流れに回る。「Handle errors」で、処理が例外を投げてもループは止まらず、例外のメッセージがエラーの結果になる。`isError: true` を返すとモデルが読む文面を自分で書ける | 52、230、234、237、243、245、247、257、258、261、263、313、315 |
| 2 | Connect to external tools with MCP | https://code.claude.com/docs/en/agent-sdk/mcp | 「Tool naming convention」で `mcp__<server-name>__<tool-name>`、サーバー名は `mcpServers` のキー、`my.server` は `mcp__my_server__list_issues`。「MCP tool search」で、ツールの定義を最初から渡さず要るものだけ読み込む仕組みは既定で有効 | 76、255、309、315、321 |
| 3 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | `dontAsk` は事前承認されていない、確認が要る呼び出しをすべて断る。ツール実行のあとに結果を載せた user メッセージが届く | 259、263、291 |
| 4 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | Options の表の `strictMcpConfig`: 「Use only the servers passed in `mcpServers` and ignore project `.mcp.json`, user settings, plugin-provided MCP servers, and claude.ai connectors」 | 256、265 |
| 5 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | npm で入れた同じ版の `sdk.d.ts` を読み、unpkg の同じファイルとバイト単位で一致することを確かめた。`createSdkMcpServer` の JSDoc「define custom tools that run in the same process」と「A tool ... whose input schema cannot be converted to JSON Schema is left out of the server's tool list, with one warning」。`tool<Schema extends AnyZodRawShape>(name, description, inputSchema, handler: (args: InferShape<Schema>, ...))`。`SdkMcpToolDefinition` のコメント「Supports both Zod 3 and Zod 4 schemas」。Options の `settingSources`（省くと設定を読む）。init の `tools: string[]` と `apiKeySource` の意味 | 74、124、233、235、239、267 |
| 6 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | Pro、Max、Ultra は claude.ai のアカウントでログイン。`claude auth login`。認証の優先順位で `ANTHROPIC_API_KEY` がサブスクリプションより先。「Run `unset ANTHROPIC_API_KEY` to fall back to your subscription」 | 85、86、88、98 |
| 7 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「when you're signed in with your Claude plan, the Claude Agent SDK and claude -p still draw from your subscription limits」 | 100、329 |
| 8 | Claude の料金プラン | https://claude.com/pricing | Pro は「$20 if billed monthly」 | 85 |
| 9 | Node.js v22.23.4 Modules: TypeScript | https://nodejs.org/docs/v22.23.4/api/typescript.html | History の表で v22.18.0「Type stripping is enabled by default」 | 84 |
| 10 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-11 に `npm view @anthropic-ai/claude-agent-sdk version` が 0.3.322。`npm view @anthropic-ai/claude-agent-sdk@0.3.322 peerDependencies --json` に `"zod": "^4.0.0"`（`dependencies` は空）。npm のページと同じレジストリの情報を CLI で読んだ | 124 |

## 本文の実測の根拠（出典ではなく run/ のログ）

| 本文の行 | 根拠 |
|---|---|
| 54、56、278〜288、291、293、297、299 | `run/06.log`（init の `apiKeySource=none`、tools は自作の2つ、ツール呼び出し4回、消しゴムだけ `is_error=true` で文字列、合計660円、`num_turns=5`） |
| 303 | `run/07.log`（ツールの行は `run/06.log` と1文字も違わない。最後の文だけ違う。`lint/check-code-and-outputs.txt` の比較） |
| 319、321、323 | `run/08.log`（`tools: []` の行だけを消した版。組み込みが25個、最初の呼び出しが ToolSearch、`num_turns=6`）。1回だけの実行。`num_turns=5` は `run/06.log`、`run/07.log` |
| 124 | `run/13.log`（`npm view` の peerDependencies の zod が `^4.0.0`。確認時点の最新版は 0.3.323） |
| 325 | `run/11.log`（試作の1回目、`other_mcp_tools_hidden=756`）、`run/09.log` と `run/12.log`（`strictMcpConfig` の行を消した版を計4回、どれも `other_mcp_tools_hidden=0`） |
| 106〜138 | `run/03.log`〜`run/05.log`（install の出力は `run/04.log`、`npm pkg get` は `run/05.log`）。90〜96 は `run/02.log` |
| 64〜72 の流れの図 | コードそのもの（`code/shop-agent.ts`）。図は実行していない |
