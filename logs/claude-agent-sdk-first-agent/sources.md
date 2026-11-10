# sources: claude-agent-sdk-first-agent

アクセス日はすべて 2026-11-10。原稿の frontmatter の `sources` と、本文末尾の出典の表（番号も同じ）に同じ URL と日付を入れた。行番号は `content/articles/claude-agent-sdk-first-agent.md`（366行）の版。

| # | 題名 | URL | 確かめた事実 | 根拠にした本文の行 |
|---|---|---|---|---|
| 1 | Agent SDK overview | https://code.claude.com/docs/en/agent-sdk/overview | Agent SDK は Claude Code と同じツール、エージェントループ、コンテキスト管理を Python と TypeScript から使えるライブラリ。注記「Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK」。比較表で Client SDK は「You write the tool loop yourself」 | 55（SDK の定義）、93（claude.ai のログインの提供は許可なしに認められない）、324（Messages API の SDK ではループを自分で書く） |
| 2 | Quickstart (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/quickstart | 前提は Node.js 18.14+。`npm pkg set type=module` でトップレベル await。TypeScript と Python の SDK は Claude Code のネイティブの本体を同梱し、TypeScript は npm の optional dependencies で入る。`npm ci --omit=optional` では本体が入らない。「The SDK handles the orchestration, tool execution, context management, and retries」 | 67、71、117、144、146、340 |
| 3 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | 中心の5種類（SystemMessage、AssistantMessage、UserMessage、StreamEvent、ResultMessage）と、ループに要らない観測用のイベント（rate-limit status など）も届くこと。TypeScript では本文が `message.message.content`。`result` は `success` のときだけ。UserMessage はツール実行のあとに結果を載せて届く。ターンの数え方（ツールを呼んだターン + 最後の文章のターン）。`allowedTools` は自動承認、`dontAsk` は確認が要る呼び出しを断り、使いどころは「Headless agents with nobody to approve calls」。上限で `error_max_turns`、単発の `query()` は error の result のあとで例外を投げる。`maxTurns` の説明 | 187、217、219、293、294、296、322、326、328 |
| 4 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | Pro、Max、Ultra は claude.ai のアカウントでログイン。`claude auth login`。認証の優先順位で `ANTHROPIC_API_KEY`（3番目）がサブスクリプションの OAuth（7番目）より先。`-p` では API キーがあれば必ず使う。「Run `unset ANTHROPIC_API_KEY` to fall back to your subscription, and check `/status` to confirm which method is active」。`ANTHROPIC_API_KEY` は Agent SDK にも効く | 69、71、75、85、227 |
| 5 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | Usage policy の Acceptable use「Advertised usage limits for Pro, Max, and Ultra plans assume ordinary, individual usage of Claude Code and the Agent SDK」。Authentication and credential use「Developers building products or services ... including those using the Agent SDK, should use API key authentication through Claude Console」「not permit ... to route requests through Free, Pro, Max, or Ultra plan credentials on behalf of their users」 | 89、91、93 |
| 6 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「when you're signed in with your Claude plan, the Claude Agent SDK and `claude -p` still draw from your subscription limits」 | 89、233、frontmatter の `cost_estimate` |
| 7 | Claude の料金プラン | https://claude.com/pricing | Pro は月払いで月20ドル（年払いは月17ドル相当）。Free は比較表で Claude Code が「No」、Pro、Max、Ultra は「Yes」 | 68、frontmatter の `cost_estimate` |
| 8 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `SDKSystemMessage.apiKeySource` のコメント（'ANTHROPIC_API_KEY'、'none' は claude.ai OAuth、bearer token、third-party cloud provider でも出る）。`total_cost_usd` のコメント「An estimate, not a billing statement」。`tools` の `[]` は組み込みツールをすべて無効にし、`tools` は使えるツールの基本の集合を決める。`settingSources` は省くと全部読み込み、`[]` で読まない、CLAUDE.md は 'project' が要る。curl で取得し、上の文字列があることを grep で確かめた。手元に入れたパッケージ（`node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts`）とも同じ | 186、188、190、223、225、231、292 |
| 9 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | Claude Haiku 5.5（10万トークン以下のプロンプト）は Base input $0.10 / MTok、Output $0.50 / MTok | 235 |
| 10 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | History に「v22.18.0 Type stripping is enabled by default」「v22.18.0 Type stripping no longer emits an experimental warning」 | 192 |
| 11 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | `npm view @anthropic-ai/claude-agent-sdk version` が `0.3.322`、公開日時 `2026-11-10T01:57:38.316Z`、engines は `node >=18.14.0`（npm のレジストリから取得） | 117 |

## 実行ログを根拠にした文（出典を付けていない断定）

| 本文の行 | 文 | 根拠 |
|---|---|---|
| 57 | init メッセージの `apiKeySource` が `"none"` でした | `run/07.log` |
| 59 | 2本で65行 | `wc -l code/hello.ts code/agent.ts` が 28 + 37 = 65 |
| 67 | 検証は 22.22.0 | `run/01.log` |
| 73 | 検証環境はプランでログイン済み。ログインの操作は実行していない | 検証はワークフローの指示どおりオーナーの Claude プランでログイン済みの環境で行った。`claude auth login` は実行していない |
| 109〜114、124〜129、139〜141 | インストールの結果、`npm pkg get` の結果、`ls` の結果 | `run/04.log`、`run/05.log`、`run/06.log` |
| 185 | `haiku` で `claude-haiku-5-5` が使われた | `run/07.log` の init の行 |
| 209 | 7つのメッセージが届いた | `run/07.log`（`result:` の行はメッセージではなく、result の中身を表示した行） |
| 217 | 残り4つは中心の5種類に入っていない | `run/07.log` の `[active_goal]`、`[autocompact_state]`、`[rate_limit_event]`、`[system/post_turn_summary]` と、出典3の5種類の一覧を照らし合わせた |
| 318 | 答えが3つのファイルの最も早い締め切りと合っている | `run/08.log` で作ったファイル（2026-11-14、2026-11-20、2026-11-17）と `run/09.log` の result |
| 326 | `num_turns=5` は Glob 1 + Read 3 + 最後の文章 1 | `run/09.log` |
| 332 | 2回目は順番と回数が同じで、Glob の引数に `path` が無く、言い回しが違った | `run/09.log` と `run/11.log` の比較 |
