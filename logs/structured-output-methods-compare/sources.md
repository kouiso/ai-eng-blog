# sources: structured-output-methods-compare

どれも 2026-11-11 に取得して読んだ。code.claude.com のページは、末尾に `.md` を付けた URL で Markdown を取得した（本文と同じ内容）。記事の出典の表の番号と、この表の番号は同じ。

| # | 題名 | URL | アクセス日 | 確かめた事実 | 記事のどの文の根拠か |
|---|---|---|---|---|---|
| 1 | Get structured output from agents (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/structured-outputs | 2026-11-11 | `outputFormat` に JSON Schema を渡すと、結果の `structured_output` に検証済みのデータが入る。合わなければ SDK が出し直させ、上限まで合わなければ `error_max_structured_output_retries` になる。SDK は JSON Schema の draft-07 で検証し、新しい版を宣言したスキーマは拒否される。zod は既定で draft 2020-12 なので `target: "draft-7"` を渡す。`outputFormat` を付けると、Claude Code が `StructuredOutput` というツールをセッションに足し、エージェントはそれを呼んで答えを返す | (c) の節、比較表の「合わないときの扱い」、draft-7 の落とし穴、(b) と (c) の仕組みが近いという段落 |
| 2 | Give Claude custom tools (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/custom-tools | 2026-11-11 | `tool()` で名前、説明、入力スキーマ、処理を定義し、`createSdkMcpServer()` で包んで `mcpServers` に渡す。サーバーはアプリの同じプロセスの中で動く。`allowedTools` には `mcp__{server_name}__{tool_name}` の名前を書く。ツール検索が既定で有効で、SDK の MCP ツールは後から読み込まれる。`alwaysLoad: true` で最初から読み込ませられる | (b) の節 |
| 3 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | 2026-11-11 | `strictMcpConfig` は既定が `false`。`true` にすると `mcpServers` に渡したサーバーだけを使い、`.mcp.json`、ユーザー設定、プラグインの MCP サーバー、claude.ai のコネクタを無視する | (b) の strictMcpConfig の段落、`common.ts` の説明 |
| 4 | Connect Claude Code to tools via MCP | https://code.claude.com/docs/en/mcp | 2026-11-11 | claude.ai のアカウントで Claude Code にログインしていると、claude.ai で追加した MCP サーバー（コネクタ）が自動で Claude Code で使える | (b) の strictMcpConfig の段落 |
| 5 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-11 | `total_cost_usd` のコメント「An estimate, not a billing statement」。`SDKResultError` の `subtype` に `error_max_structured_output_retries` がある。`tool()` の第5引数に `alwaysLoad`。`strictMcpConfig` のコメント。`JsonSchemaOutputFormat` は `type: 'json_schema'` と `schema`。結果の `usage` のコメントに「MAIN AGENT LOOP ONLY」と「Prefer modelUsage for token/cost accounting」 | 料金の段落、(b)、(c) |
| 6 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-11 | Claude プランでログインしていれば、Agent SDK と `claude -p` の利用はプランの利用枠から引かれる | 前提の節の `query()` の文、料金の段落 |
| 7 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | 2026-11-11 | Claude Haiku 5.5（10万トークン以下のプロンプト）は入力 0.10ドル、1時間のキャッシュ書き込み 0.20ドル、キャッシュの読み込み 0.01ドル、出力 0.50ドル（どれも100万トークンあたり） | 料金の段落 |
| 8 | Node.js v22.23.4 Modules: TypeScript | https://nodejs.org/docs/v22.23.4/api/typescript.html | 2026-11-11 | 型の除去（type stripping）が既定で有効。履歴に v22.18.0 の行がある | 前提の節（Node.js 22.18.0 以上） |
| 9 | JSON Schema（Zod） | https://zod.dev/json-schema | 2026-11-11 | `z.toJSONSchema()` の `target` に `"draft-7"` と `"draft-2020-12"` などがあり、既定は draft 2020-12 | draft-7 の落とし穴 |
| 10 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-11 | 2026-11-11 の最新版は 0.3.322（`npm view @anthropic-ai/claude-agent-sdk version` でも 0.3.322） | セットアップの節 |
