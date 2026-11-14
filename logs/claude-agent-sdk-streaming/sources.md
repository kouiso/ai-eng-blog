# sources: claude-agent-sdk-streaming

アクセス日はすべて 2026-11-11。行番号は `content/articles/claude-agent-sdk-streaming.md`（294行）。2026-11-11 の直しで、利用の条件を書いていた段落と、その根拠だった Legal and compliance（旧出典5）を消し、旧6〜8を5〜7に詰めた。

| # | 題名 / URL | 確かめた事実 | 根拠にした文 |
|---|---|---|---|
| 1 | Stream responses in real-time (Agent SDK) / https://code.claude.com/docs/en/agent-sdk/streaming-output （本文は同じページの `.md` 版も読んだ） | 既定では、各コンテンツブロックが書き終わったあとに完全な AssistantMessage を返す。`includePartialMessages`（TypeScript）を true にすると、API の生のイベントを持つ StreamEvent も返す。文字を取るには、型が StreamEvent か、`event.type` が `content_block_delta` か、`delta.type` が `text_delta` かの3段で確かめる。イベントは蓄積済みの文字ではなく差分で、つなぐのは自分。AssistantMessage は空でないブロックごとに1つで、同じ message ID を共有し、そのブロックの `content_block_stop` より前に届く | 43、125、131、245、247、249 |
| 2 | Streaming messages (Claude API) / https://platform.claude.com/docs/en/build-with-claude/streaming | ストリームの流れ（`message_start`、ブロックごとの `content_block_start`・`content_block_delta`・`content_block_stop`、`message_delta`、`message_stop`）。thinking を使うと `thinking_delta` で考えた内容が届き、`signature_delta` も届く。thinking のブロックは `content_block_start` の `content_block.type` が `thinking` で始まる | 239、241 |
| 3 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts / https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `includePartialMessages` のコメント「When true, `SDKPartialAssistantMessage` events will be emitted during streaming.」。`SDKPartialAssistantMessage` は `type: 'stream_event'` と `event: BetaRawMessageStreamEvent`。`ApiKeySource` のコメントで `'none'` は「no API key in use - e.g. claude.ai OAuth login…」。`SDKResultMessage` のコメント「The CLI emits exactly one result message per turn, after that turn's assistant, user and stream_event messages」。`result: string` は `SDKResultSuccess`（subtype `success`）にだけある。unpkg の内容は、作業フォルダに入れた 0.3.322 の sdk.d.ts と1バイトも違わないことを確かめた（585,906 バイト） | 123、221、251、268 |
| 4 | Authentication (Claude Code) / https://code.claude.com/docs/en/authentication （`.md` 版を読んだ） | 「If you have an active Claude subscription but also have `ANTHROPIC_API_KEY` set in your environment, Claude Code uses the API key once you approve it.」「Run `unset ANTHROPIC_API_KEY` to fall back to your subscription」。キーがあると、使うかを Claude Code が聞く（「you approve the key when Claude Code asks whether to use it」）。`ANTHROPIC_API_KEY` は Agent SDK にも効く | 58、68 |
| 5 | Use the Claude Agent SDK with your Claude plan / https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「when you're signed in with your Claude plan, the Claude Agent SDK and claude -p still draw from your subscription limits」（2026-06-15 の更新で、予告していた変更は止めたとある） | 274 |
| 6 | Claude の料金プラン / https://claude.com/pricing | Pro は「$20 if billed monthly」。Max は月100ドルから。ページに Claude Code の記載がある | 54、276 |
| 7 | Node.js v22.23.4 Modules: TypeScript / https://nodejs.org/docs/v22.23.4/api/typescript.html | 版の履歴に「v22.18.0 Type stripping is enabled by default.」 | 53 |

## 出典ではなく実行ログを根拠にした文

`strictMcpConfig: true` を足したコードで撮り直した `run/09.log`〜`17.log` を根拠にしている。`run/01.log`〜`08.log` は足す前のコードの記録で、記事の数字の根拠には使っていない。

| 文（行） | 根拠 |
|---|---|
| 45 最初の文字が1,743ミリ秒、全文が3,243ミリ秒 | `run/14.log` の `1743 最初の text_delta`、`3243 assistant text 341字` |
| 53 検証は 22.23.4 | `run/09.log` |
| 83〜89 npm install の出力 | `run/12.log` |
| 140〜141 stream.ts の出力 | `run/13.log` |
| 208〜218 timing.ts の出力 | `run/14.log` |
| 221 `apiKeySource=none` | `run/14.log` 1行目（意味は出典3） |
| 223、225 1,486ミリ秒、73個、341字 | `run/14.log`（3229 − 1743 = 1486） |
| 227 平均5字、約20ミリ秒に1回 | `run/14.log` から計算（341 ÷ 73 ≒ 4.7字、1486 ÷ 72間隔 ≒ 21ミリ秒） |
| 229 2回目は1,655、2,948、63個、293字 | `run/15.log` |
| 233 今回の2回は message_start の直後に text のブロック | `run/14.log`（1742 → 1743）、`run/15.log`（1655 → 1655）。`run/17.log` の6回もすべて `thinking=false` |
| 241 今回は assistant が1つ | `run/14.log` の `assistant text 341字 id=...grae` の1行だけ |
| 243 assistant text が content_block_stop の1行前、どちらも3,243ミリ秒 | `run/14.log` |
| 245 341字と result が一致 | `run/14.log` 最終行 `true` |
| 251 差は約1.5秒、2回目は約1.3秒 | `run/14.log`（3243 − 1743 = 1500）、`run/15.log`（2957 − 1655 = 1302） |
| 262 最初の文字が出るまで約1.7秒 | `run/14.log` の `1743 最初の text_delta` |
| コードの `strictMcpConfig: true` のコメント（コネクタを読み込まない） | `run/17.log`: `strictMcpConfig=true` の3回は init の `mcp_servers=0`、付けない3回は `mcp_servers=24`（名前は出さず数だけ）。オプションの説明は作業フォルダの 0.3.322 の `sdk.d.ts` 2410〜2416行「Only use MCP servers passed via the `mcpServers` option … ignoring all other MCP configurations」 |
