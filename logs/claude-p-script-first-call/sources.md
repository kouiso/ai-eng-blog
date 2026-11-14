# sources: claude-p-script-first-call

アクセス日はすべて 2026-11-14。2026-11-11 に読んだ10ページを、2026-11-14 に全部開き直し（`curl` で取得し、HTML から本文を取り出して、該当する文を読んだ）、本文の断定を支える文があることを確かめた。行番号は原稿 `content/articles/claude-p-script-first-call.md` の最終版（445行）。

| # | 題名 | URL | 確かめた事実 | 記事で使った箇所 |
|---|---|---|---|---|
| 1 | Run Claude Code programmatically | https://code.claude.com/docs/en/headless | `-p` で非対話に動く。`--output-format` は text、json（"structured JSON with result, session ID, and metadata"）、stream-json（"newline-delimited JSON for real-time streaming"）。json では `total_cost_usd` が入り、"Both figures are client-side estimates and can differ from your actual bill"。成功で終了コード0、失敗で0以外。不正なフラグは標準エラー、"When a failure happens inside the run, such as missing authentication, Claude Code prints the failure as the result on stdout"。"Non-interactive mode reads stdin"。2026-11-14 の版では "Add --bare to reduce startup time by skipping auto-discovery of hooks, skills, custom commands, subagents, installed plugins, MCP servers, auto memory, and CLAUDE.md. Without it, claude -p discovers and loads them as an interactive session would"。"In CI or other scripted environments, add --bare so Claude Code starts without loading the host’s hooks, plugins, auto memory, or CLAUDE.md"。"In bare mode, Claude Code never reads OAuth credentials or the system keychain"、"bare mode doesn’t use your subscription login"。system/init イベントがセッションの情報を持つ | 54、142、144、175、179、208、214、234、236、279、415、416、424行目 |
| 2 | CLI reference (Claude Code) | https://code.claude.com/docs/en/cli-reference | `--setting-sources`: "Comma-separated list of setting sources to load (user, project, local)"。`--strict-mcp-config`: 2026-11-14 の文面は "Skip the MCP servers configured in places such as .mcp.json, ~/.claude.json, or a plugin, and load the ones you pass with --mcp-config"（2026-11-11 に読んだ文面は "Only use MCP servers from --mcp-config, ignoring all other MCP configurations"。本文の「MCP サーバーの設定を読まない」はどちらとも矛盾しない）。`--tools`: "Restrict which built-in tools Claude can use. Use "" to disable all"（手元の `claude --help` でも同じ、`run/18.log`） | 145、146、147行目 |
| 3 | Model configuration (Claude Code) | https://code.claude.com/docs/en/model-config | 別名 `sonnet`、`opus`、`haiku` があり、"A model alias" と "A model name"（Anthropic API では "a full model name"）のどちらも指定できる。Anthropic API では opus、sonnet、haiku がそれぞれ Opus 5.5、Sonnet 5.5、Haiku 5.5 | 143、257行目 |
| 4 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | "If you have an active Claude subscription but also have ANTHROPIC_API_KEY set in your environment, Claude Code uses the API key once you approve it"、"Run unset ANTHROPIC_API_KEY to fall back to your subscription"。対話モードでは承認を聞かれるが、"In non-interactive mode (-p), the key is always used when present" | 69、79行目 |
| 5 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | "when you’re signed in with your Claude plan, the Claude Agent SDK and `claude -p` still draw from your subscription limits"（"Update October 7, 2026" の段落。2026-11-14 に再確認。"Update June 15, 2026" の段落にも同じ趣旨の文がある） | 52、208行目 |
| 6 | Claude の料金プラン | https://claude.com/pricing | Pro は "$20 if billed monthly"。比較表の Claude Code の行は Free が No、Pro・Max・Ultra が Yes。"Claude Code is included in all paid plans" | 62行目、frontmatter の cost_estimate |
| 7 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | Haiku 5.5 は入力 $0.10 / MTok（"for prompts up to 100,000 tokens"）、出力 $0.50 / MTok、キャッシュの読み出し（Hits and refreshes）$0.01 / MTok。Sonnet 5.5 は入力 $2 / MTok、出力 $10 / MTok。料金表は Input、Output を $ / MTok の単価で載せ、使ったトークン数に単価を掛ける worked example がある（67行目の「トークン数に応じて料金がかかる」の根拠） | 67、210、273行目（273行目はキャッシュの読み出しが通常の入力より安い単価であること、Sonnet 5.5 の入力単価） |
| 8 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `total_cost_usd` のコメント "An estimate, not a billing statement"。init の `apiKeySource` のコメント "'ANTHROPIC_API_KEY' (environment variable), 'apiKeyHelper' ..., '/login managed key' ..., or 'none' (no API key in use - e.g. claude.ai OAuth login, ...)"。`claude -p` の stream-json の init は SDK と同じメッセージの形で、`run/09.log` で `apiKeySource` が出ることを確かめた | 208、228行目 |
| 9 | Node.js v22.23.0 Modules: TypeScript | https://nodejs.org/docs/v22.23.0/api/typescript.html | 履歴の表に "v22.18.0 Type stripping is enabled by default" | 64行目 |
| 10 | Node.js v22.23.0 Child process | https://nodejs.org/docs/v22.23.0/api/child_process.html | `spawn` の `options.stdio` の既定は `['pipe', 'pipe', 'pipe']` で、子の標準入力は `subprocess.stdin` につながる | 339行目 |

## 出典ではなく実行ログを根拠にした文

| 原稿の行 | 文 | 根拠 |
|---|---|---|
| 177〜189 | フラグを変えた3回のトークン数と total_cost_usd | `run/16.log`（`code/extra/measure-isolation.sh`）。表の total_cost_usd は小数第8位までに丸めた |
| 208 | `costBasis` が `list` | `run/08.log` |
| 228 | 別名の `haiku` が `claude-haiku-5-5` になった | `run/09.log` |
| 253 | `--bare` で終了コード1、`subtype` が `success`、`is_error` が `true` | `run/10.log` |
| 273 | Haiku の数字が最初の実行より小さい | `run/11.log` の 0.00008206 と `run/07.log` の 0.0006710900000000001。理由はキャッシュと断定せず、キャッシュの読み出しが安いことだけを出典7で書いた |
| 299 | `--tools ""` なので `src/list.ts` を開いていない | `--tools ""` で組み込みツールをすべて外すこと（`run/18.log` の `claude --help`、出典2） |
| 339 | `execFile` で警告が出て3秒待つ。標準入力が閉じられないまま残る | `run/14.log`。警告の文面は claude 自身が出したもの |
| 411 | 2回呼んで警告なし（所要時間の比較は載せていない） | `run/15.log`、`run/14.log` |
| 56 | 所要時間15分ほど | 見積もり。`run/01.log`（2026-11-11T11:04:46Z）から `run/15.log`（2026-11-11T11:05:28Z）の開始までが42秒で、15 の実行（7.9秒）を足しても1分に収まる。残りは読者がファイルを保存し、出力を読む時間として見積もった |

## 本文と frontmatter に書いたツールの版と、記録した行（2026-11-14 に全件つけ直した）

| 版 | 書いた場所 | 記録した行 |
|---|---|---|
| Claude Code 2.1.322 | 本文 86行目の出力、frontmatter の `run_environment` | `run/02.log` の出力、`run/01.log`〜`15.log` の見出しの `claude:` の行 |
| Node.js 22.23.4（`v22.23.4`） | 本文 94行目の出力、`run_environment` | `run/03.log` の出力、各ログの見出しの `node:` の行 |
| npm 10.9.9 | `run_environment` | `run/01.log`〜`15.log` の見出しの `npm:` の行 |
| jq 1.7.1 と 1.8.1 | `run_environment` | `run/10.log` の見出しが `jq-1.7.1-apple`、ほかの `run/01.log`〜`15.log` の見出しが `jq-1.8.1` |
| TypeScript 7.0.2 | `run_environment`（型の確認のみ） | `run/17.log` の `Version 7.0.2` |
| macOS arm64 | `run_environment` | 各ログの見出しの `os: Darwin arm64` |
| Haiku 5.5、Sonnet 5.5 | 本文 210行目（Haiku 5.5）と 273行目（Sonnet 5.5）の単価 | モデル名は `run/09.log`（`claude-haiku-5-5`）と `run/11.log`（`claude-sonnet-5-5`）。5.5 の呼び方は出典3と出典7の表 |
| Node.js 22.18.0 以上 | 本文 64行目 | ログではなく出典9の履歴の表（"v22.18.0 Type stripping is enabled by default"。2026-11-14 に確認）。動かした版は 22.23.4 で、22.18.0 そのものでは動かしていない（本文は「以上」と書いているだけ） |
| `@anthropic-ai/claude-agent-sdk` 0.3.322、Node.js v22.23.0 | 出典表の題名と URL（本文 441、442、443行目、frontmatter） | 動かした版ではなく、読んだページの版。URL に固定した版で、`run/` のログに SDK は出てこない（記事のコードは SDK を使わない） |
