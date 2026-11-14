# sources: claude-p-script-first-call

アクセス日はすべて 2026-11-11。ページは fetch して HTML から本文を取り出し、該当する文を読んだ。行番号は原稿 `content/articles/claude-p-script-first-call.md` の最終版。

| # | 題名 | URL | 確かめた事実 | 記事で使った箇所 |
|---|---|---|---|---|
| 1 | Run Claude Code programmatically | https://code.claude.com/docs/en/headless | `-p` で非対話に動く。`--output-format` は text、json（"structured JSON with result, session ID, and metadata"）、stream-json（"newline-delimited JSON for real-time streaming"）。json では `total_cost_usd` が入り、"Both figures are client-side estimates and can differ from your actual bill"。成功で終了コード0、失敗で0以外。不正なフラグは標準エラー、"When a failure happens inside the run, such as missing authentication, Claude Code prints the failure as the result on stdout"。"Non-interactive mode reads stdin"。"In CI or other scripted environments, add --bare so Claude Code starts without loading the host’s hooks, plugins, auto memory, or CLAUDE.md"。"In bare mode, Claude Code never reads OAuth credentials or the system keychain"、"bare mode doesn’t use your subscription login"。system/init イベントがセッションの情報を持つ | 54、140、142、173、177、206、212、232、234、277、413、414、422行目 |
| 2 | CLI reference (Claude Code) | https://code.claude.com/docs/en/cli-reference | `--setting-sources`: "Comma-separated list of setting sources to load (user, project, local)"。`--strict-mcp-config`: "Only use MCP servers from --mcp-config, ignoring all other MCP configurations"。`--tools` は組み込みツールの指定（手元の `claude --help` では "Use "" to disable all tools"、`run/18.log`） | 143〜145行目 |
| 3 | Model configuration (Claude Code) | https://code.claude.com/docs/en/model-config | 別名 `sonnet`、`opus`、`haiku` があり、"Model name" も使える。Anthropic API では opus、sonnet、haiku がそれぞれ Opus 5.5、Sonnet 5.5、Haiku 5.5 | 141、255行目 |
| 4 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | "If you have an active Claude subscription but also have ANTHROPIC_API_KEY set in your environment, Claude Code uses the API key once you approve it"、"Run unset ANTHROPIC_API_KEY to fall back to your subscription" | 67、77行目 |
| 5 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | "when you’re signed in with your Claude plan, the Claude Agent SDK and `claude -p` still draw from your subscription limits"（Update October 7, 2026 の段落） | 52、206行目 |
| 6 | Claude の料金プラン | https://claude.com/pricing | Pro は "$20 if billed monthly"。比較表の Claude Code の行は Free が No、Pro・Max・Ultra が Yes | 62行目、frontmatter の cost_estimate |
| 7 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | Haiku 5.5 は入力 $0.10 / MTok（"for prompts up to 100,000 tokens"）、出力 $0.50 / MTok、キャッシュの読み出し（Hits and refreshes）$0.01 / MTok。Sonnet 5.5 は入力 $2 / MTok、出力 $10 / MTok | 208、271行目（271行目はキャッシュの読み出しが通常の入力より安い単価であること、Sonnet 5.5 の入力単価） |
| 8 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `total_cost_usd` のコメント "An estimate, not a billing statement"。init の `apiKeySource` のコメント "'ANTHROPIC_API_KEY' (environment variable), 'apiKeyHelper' ..., '/login managed key' ..., or 'none' (no API key in use - e.g. claude.ai OAuth login, ...)"。`claude -p` の stream-json の init は SDK と同じメッセージの形で、`run/09.log` で `apiKeySource` が出ることを確かめた | 206、226行目 |
| 9 | Node.js v22.23.0 Modules: TypeScript | https://nodejs.org/docs/v22.23.0/api/typescript.html | 履歴の表に "v22.18.0 Type stripping is enabled by default" | 64行目 |
| 10 | Node.js v22.23.0 Child process | https://nodejs.org/docs/v22.23.0/api/child_process.html | `spawn` の `options.stdio` の既定は `['pipe', 'pipe', 'pipe']` で、子の標準入力は `subprocess.stdin` につながる | 337行目 |

## 出典ではなく実行ログを根拠にした文

| 原稿の行 | 文 | 根拠 |
|---|---|---|
| 175〜187 | フラグを変えた3回のトークン数と total_cost_usd | `run/16.log`（`code/extra/measure-isolation.sh`）。表の total_cost_usd は小数第8位までに丸めた |
| 199〜206 | `costBasis` が `list` | `run/08.log` |
| 226 | 別名の `haiku` が `claude-haiku-5-5` になった | `run/09.log` |
| 246〜251 | `--bare` で終了コード1、`subtype` が `success`、`is_error` が `true` | `run/10.log` |
| 271 | Haiku の数字が最初の実行より小さい | `run/11.log` の 0.00008206 と `run/07.log` の 0.0006710900000000001。理由はキャッシュと断定せず、キャッシュの読み出しが安いことだけを出典7で書いた |
| 297 | `--tools ""` なので `src/list.ts` を開いていない | `--tools ""` で組み込みツールをすべて外すこと（`run/18.log` の `claude --help`、出典2） |
| 337 | `execFile` で警告が出て3秒待つ。標準入力が閉じられないまま残る | `run/14.log`。警告の文面は claude 自身が出したもの |
| 409 | 2回呼んで警告なし（所要時間の比較は載せていない） | `run/15.log`、`run/14.log` |
| 56 | 所要時間15分ほど | 見積もり。`run/01.log`（2026-11-11T11:04:46Z）から `run/15.log`（2026-11-11T11:05:28Z）の開始までが42秒で、15 の実行（7.9秒）を足しても1分に収まる。残りは読者がファイルを保存し、出力を読む時間として見積もった |
