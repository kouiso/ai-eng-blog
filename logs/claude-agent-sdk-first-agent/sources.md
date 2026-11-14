# sources: claude-agent-sdk-first-agent

アクセス日はすべて 2026-11-10。原稿の frontmatter の `sources` と、本文末尾の出典の表（番号も同じ）に同じ URL と日付を入れた。行番号は `content/articles/claude-agent-sdk-first-agent.md`（353行）の版。2026-11-11 の修正ラウンドで、利用規約の注意書きの節（旧 87〜93行目）を消し、そこだけで引いていた旧5番（Legal and compliance）を外して、旧6〜11番を5〜10番に振り直した。実行ログは `strictMcpConfig: true` を足して実行し直した `run/15.log`〜`26.log` に替えた。

| # | 題名 | URL | 確かめた事実 | 根拠にした本文の行 |
|---|---|---|---|---|
| 1 | Agent SDK overview | https://code.claude.com/docs/en/agent-sdk/overview | Agent SDK は Claude Code と同じツール、エージェントループ、コンテキスト管理を Python と TypeScript から使えるライブラリ。比較表で Client SDK は「You write the tool loop yourself」 | 52（SDK の定義）、312（Messages API の SDK ではループを自分で書く） |
| 2 | Quickstart (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/quickstart | 前提は Node.js 18.14+。ただしこれは `npx tsx agent.ts` で動かす前提の記述で、記事の `node hello.ts` には足りない（`run/12.log`）ので、本文の Node.js の前提には使っていない（2026-11-10 の修正で 67行目の出典を出典10に付け替えた。2026-11-11 の振り直しで今は 64行目の出典9）。`npm pkg set type=module` でトップレベル await。TypeScript と Python の SDK は Claude Code のネイティブの本体を同梱し、TypeScript は npm の optional dependencies で入る。`npm ci --omit=optional` では本体が入らない。「The SDK handles the orchestration, tool execution, context management, and retries」 | 68、106、133、135、328 |
| 3 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | 中心の5種類（SystemMessage、AssistantMessage、UserMessage、StreamEvent、ResultMessage）と、ループに要らない観測用のイベント（rate-limit status など）も届くこと。TypeScript では本文が `message.message.content`。`result` は `success` のときだけ。UserMessage はツール実行のあとに結果を載せて届く。ターンの数え方（ツールを呼んだターン + 最後の文章のターン。本文では扱わず、`content/plan.md` のとおり #18 に任せた）。`allowedTools` は自動承認、`dontAsk` は確認が要る呼び出しを断り、使いどころは「Headless agents with nobody to approve calls」。上限で `error_max_turns`、単発の `query()` は error の result のあとで例外を投げる（これも本文では扱わず #18 に任せた）。`maxTurns` の説明 | 177、204、206、281、282、284、310 |
| 4 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | Pro、Max、Ultra は claude.ai のアカウントでログイン。`claude auth login`。認証の優先順位で `ANTHROPIC_API_KEY`（3番目）がサブスクリプションの OAuth（7番目）より先。`-p` では API キーがあれば必ず使う。「Run `unset ANTHROPIC_API_KEY` to fall back to your subscription, and check `/status` to confirm which method is active」。`ANTHROPIC_API_KEY` は Agent SDK にも効く | 66、68、72、82、214 |
| 5 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「when you're signed in with your Claude plan, the Claude Agent SDK and `claude -p` still draw from your subscription limits」 | 220、frontmatter の `cost_estimate` |
| 6 | Claude の料金プラン | https://claude.com/pricing | Pro は月払いで月20ドル（年払いは月17ドル相当）。Free は比較表で Claude Code が「No」、Pro、Max、Ultra は「Yes」 | 65、frontmatter の `cost_estimate` |
| 7 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `SDKSystemMessage.apiKeySource` のコメント（'ANTHROPIC_API_KEY'、'none' は claude.ai OAuth、bearer token、third-party cloud provider でも出る）。`total_cost_usd` のコメント「An estimate, not a billing statement」。`tools` の `[]` は組み込みツールをすべて無効にし、`tools` は使えるツールの基本の集合を決める。`settingSources` は省くと全部読み込み、`[]` で読まない、CLAUDE.md は 'project' が要る。`strictMcpConfig?: boolean`（手元の 0.3.322 の 2416行目。コードの `strictMcpConfig: true` の名前を確かめた。本文では出典を付けず、コードの行コメントだけ）。curl で取得し、上の文字列があることを grep で確かめた。手元に入れたパッケージ（`node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts`）とも同じ | 176、178、180、210、212、218、280 |
| 8 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | Claude Haiku 5.5（10万トークン以下のプロンプト）は Base input $0.10 / MTok、Output $0.50 / MTok | 222 |
| 9 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | History に「v22.18.0 Type stripping is enabled by default」「v22.18.0 Type stripping no longer emits an experimental warning」。記事は `.ts` を `node` で直接動かすので、前提の Node.js はこの 22.18.0 以上 | 64、182 |
| 10 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | `npm view @anthropic-ai/claude-agent-sdk version` が `0.3.322`、公開日時 `2026-11-10T01:57:38.316Z`、engines は `node >=18.14.0`（npm のレジストリから取得）。optionalDependencies は `claude-agent-sdk-` に続けて `linux-x64`、`win32-x64`、`darwin-x64`、`linux-arm64`、`win32-arm64`、`darwin-arm64`、`linux-x64-musl`、`linux-arm64-musl` の8つ（`run/14.log`。Mac で入れたときの `darwin-arm64` は `run/20.log`、`npm view @anthropic-ai/claude-agent-sdk@0.3.322 optionalDependencies`） | 106、133 |

## 実行ログを根拠にした文（出典を付けていない断定）

| 本文の行 | 文 | 根拠 |
|---|---|---|
| 54 | init メッセージの `apiKeySource` が `"none"` でした | `run/21.log` |
| 56 | 2本で67行 | `wc -l code/hello.ts code/agent.ts` が 29 + 38 = 67 |
| 64 | 検証は 22.23.4 | `run/15.log` |
| 70 | 検証環境はプランでログイン済みの Mac。ログインの操作は実行していない | `run/15.log`〜`26.log` の見出しの行（Darwin arm64）。`claude auth login` は実行していない |
| 121 | Apple シリコンの Mac では `claude-agent-sdk-darwin-arm64` も入る | `run/20.log`（Darwin arm64） |
| 133 | x64 の Linux では `linux-x64`、x64 の Windows では `win32-x64` | `run/14.log`（optionalDependencies）。Linux x64 で入れたときの `ls` は `run/06.log` |
| 182 | Node.js 20.20.0 では `ERR_UNKNOWN_FILE_EXTENSION` が出て `hello.ts` が動かない | `run/26.log`（v20.20.0、新しい `hello.ts`、exit=1）。同じフォルダで v22.23.4 なら動く（`run/21.log`、exit=0） |
| 97〜103、113〜118、128〜130 | インストールの結果、`npm pkg get` の結果、`ls` の結果 | `run/18.log`、`run/19.log`、`run/20.log` |
| 175 | `haiku` で `claude-haiku-5-5` が使われた | `run/21.log` の init の行 |
| 196 | 4つのメッセージが届いた | `run/21.log`（`result:` の行はメッセージではなく、result の中身を表示した行） |
| 204 | `[rate_limit_event]` は中心の5種類に入っていない | `run/21.log` の `[rate_limit_event]` と、出典3の5種類の一覧を照らし合わせた |
| 218 | `total_cost_usd=0.0002985` | `run/21.log` の result の行 |
| 306 | 答えが3つのファイルの最も早い締め切りと合っている | `run/22.log` で作ったファイル（2026-11-14、2026-11-20、2026-11-17）と `run/23.log` の result |
| 314 | `num_turns=5` は、この実行で数えたターンの数 | `run/23.log` の result の行 |
| 320 | 2回目は順番と回数が同じで、Glob の引数が `tasks/*.md` から `tasks/**/*.md` に変わった | `run/23.log` と `run/25.log` の比較（答えの文面は2回とも同じ） |
| 324 | 見積もりは `0.00073444` | `run/23.log` の result の行 |
