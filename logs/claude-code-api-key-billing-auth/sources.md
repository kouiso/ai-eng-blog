# sources: claude-code-api-key-billing-auth

アクセス日はすべて 2026-11-11。番号は原稿の出典の表（331〜345行目）と同じ。下の表の実行ログは、2026-11-11 に `strictMcpConfig` を足して動かし直した `run/14.log`〜`26.log`（足す前の `run/01.log`〜`13.log` と出力は同じで、npm の所要秒数だけ違う）。Claude Code のドキュメントは、ページの URL の末尾に `.md` を付けた Markdown 版も取得して読んだ（中身は同じページ）。

| # | URL | 題名 | 確かめた事実 | 根拠にした原稿の行 |
|---|---|---|---|---|
| 1 | https://code.claude.com/docs/en/authentication | Authentication | 「Authentication precedence」の一覧で、`ANTHROPIC_API_KEY` は3番目、`/login` の Subscription OAuth credentials は7番目（最後）。3番目の説明に「In interactive mode, you are prompted once to approve or decline the key, and your choice is remembered」「In non-interactive mode (`-p`), the key is always used when present」。「`apiKeyHelper`, `ANTHROPIC_API_KEY`, and `ANTHROPIC_AUTH_TOKEN` apply to the CLI and the surfaces that wrap it, including the VS Code extension, the Agent SDK, and GitHub Actions」。「Run `unset ANTHROPIC_API_KEY` to fall back to your subscription」 | 55、96、100、104〜106、229 |
| 2 | https://code.claude.com/docs/en/errors | Error reference | 「Invalid API key」の節。表示は `Invalid API key · Fix external API key`、意味は「The `ANTHROPIC_API_KEY` environment variable or `apiKeyHelper` script returned a key the API rejected」。対処に「Tools like direnv, dotenv shell plugins, and IDE terminals can load a stale key from a `.env` file in your project」 | 130、233 |
| 3 | https://code.claude.com/docs/en/cli-reference | CLI reference | `claude auth status` は「Show authentication status as JSON」、`authMethod` は `none`、`claude.ai`、`oauth_token`、`api_key`、`api_key_helper`、`third_party` のどれか。`--tools ""` で組み込みツールを全部外す。`--settings` は JSON 文字列を受け取り、settings の同じキーを上書きする | 83、85 |
| 4 | https://code.claude.com/docs/en/agent-sdk/typescript | Agent SDK reference - TypeScript | `ApiKeySource` の表（`ANTHROPIC_API_KEY`、`apiKeyHelper`、`/login managed key`、`none`。`none` は「No API key. The session authenticates another way, such as a claude.ai login, a bearer token, or a cloud provider」）。Options の `env` は既定が `process.env`、「When set, this replaces the subprocess environment instead of merging with `process.env`, so pass `{ ...process.env, YOUR_VAR: 'value' }` to keep inherited variables like `PATH`」。`SDKAssistantMessageError` に `authentication_failed` | 87〜94、215、237、266、297 |
| 5 | https://code.claude.com/docs/en/settings-reference | All settings | `env` の節「How `env` values interact with your shell」に「A value here overwrites the same variable exported in your shell」 | 313 |
| 6 | https://code.claude.com/docs/en/legal-and-compliance | Legal and compliance | 「Authentication and credential use」の節。API キーで認証した分は「the resulting usage is billed to the key owner」 | 57、130、323 |
| 7 | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | Use the Claude Agent SDK with your Claude plan | 「Update June 15, 2026」の段落で「Claude Agent SDK, `claude -p`, and third-party app usage still draw from your subscription limits」 | 319 |
| 8 | https://platform.claude.com/docs/en/about-claude/pricing | Pricing | Claude Haiku 5.5（プロンプトが100,000トークン以下）は入力 $0.10 / MTok、出力 $0.50 / MTok。料金はトークン単価で決まる | 138、323、325 |
| 9 | https://nodejs.org/docs/v22.23.4/api/cli.html | Node.js v22.23.4 Command-line API | `--env-file=file` は「Loads environment variables from a file relative to the current directory, making them available to applications on process.env」。v22.21.0 で experimental が外れた | 237 |
| 10 | https://nodejs.org/docs/v22.23.4/api/typescript.html | Node.js v22.23.4 Modules: TypeScript | History に「v22.18.0 Type stripping is enabled by default」 | 142 |
| 11 | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 0.3.322 の型定義 | HTTP 200 で取得し、手元に入れた `node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts` と同じ記述を確かめた。結果メッセージのコメント「subtype "success" carries the final assistant text in result — or, with is_error true, the error text when the turn ended on an API error」。`env` のコメント「not merged with `process.env`. Spread `process.env` yourself if the subprocess still needs inherited variables like `PATH`, `HOME`, or `ANTHROPIC_API_KEY`」 | 219 |

## 実行ログを根拠にした文

| 原稿の行 | 根拠 |
|---|---|
| 65、72、80 | `run/14.log`（`unset`）、`run/15.log`（`"authMethod": "claude.ai",`）。どちらもモデルを呼ばないコマンド |
| 85（後半） | `run/16.log:9-10`（環境変数のキーを置くと `authMethod` が `api_key`、`apiKeySource` の行も出た）。出典3は `authMethod` の値の一覧までで、`apiKeySource` の語は出典3に無い |
| 108 | `run/19.log`、`run/21.log`。確認なしで `apiKeySource: ANTHROPIC_API_KEY` になった |
| 121〜132 | `run/16.log`（`api_key`、`ANTHROPIC_API_KEY`、`⚠` の警告、`Invalid API key · Fix external API key`、`exit=1`） |
| 136 | `run/23.log`（`"total_cost_usd":0,"input_tokens":0,"output_tokens":0`、`is_error:true`） |
| 189 | `run/18.log`、`run/22.log`、`run/25.log`（`apiKeySource: none` の3回とも結果は `2`） |
| 192〜213 | `run/18.log`、`run/19.log` |
| 219 | `run/19.log` の `result: success is_error=true`（型定義のコメントと一致） |
| 247〜262 | `run/20.log`、`run/21.log` |
| 304〜309 | `run/22.log`（`.env` を読ませても `apiKeySource: none`） |
| 315 | `run/24.log`（`--settings` の `env` に置いたダミーのキーで `Invalid API key`、`exit=1`） |

## 本文に書いていないが確かめたこと

- `/status`（対話の画面）は、この検証では開いていない。原稿でも `/status` の手順は書かず、`claude auth status` だけを使った。
- `claude auth status` の JSON には、メールアドレス、組織の名前と ID、プランの種類も入る（キーの名前だけを見た。値はログに残していない）。原稿で `grep` で2行に絞った理由。
