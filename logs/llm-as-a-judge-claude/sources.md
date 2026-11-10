# sources: llm-as-a-judge-claude

アクセス日はすべて 2026-11-10。原稿の frontmatter の `sources` と、本文末尾の出典の表（番号も同じ）に同じ URL と日付を入れた。行番号は `content/articles/llm-as-a-judge-claude.md`（412行）の版。

| # | 題名 | URL | 確かめた事実 | 根拠にした本文の行 |
|---|---|---|---|---|
| 1 | Define success criteria and build evaluations | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | 「Grade your evaluations」の節。「Code-based grading: Fastest and most reliable, extremely scalable, but also lacks nuance」「LLM-based grading: Fast and flexible, scalable and suitable for complex judgment. Test to ensure reliability first, then scale.」。「Tips for LLM-based grading」の「Have detailed, clear rubrics」「Be empirical or specific: ... output only ‘correct’ or ‘incorrect’, or to judge from a scale of 1–5」「Encourage reasoning: Use a grader model with thinking on, so that it reasons before it produces an evaluation score」。例のコードのコメント「Generally best practice to evaluate with a different model from the one used to generate the evaluated output」 | 68、70、161、385、387 |
| 2 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `tools` の説明「`[]` (empty array) - Disable all built-in tools」。`settingSources` の説明「Pass `[]` to disable filesystem settings (SDK isolation mode). Must include 'project' to load CLAUDE.md files.」。init の `apiKeySource` の説明「'none' (no API key in use - e.g. claude.ai OAuth login, a bearer token, or a third-party cloud provider)」。結果の `structured_output?: unknown`。`total_cost_usd` の説明「An estimate, not a billing statement.」。result の error の subtype に `error_max_structured_output_retries`。unpkg の URL は HTTP 200。中身は npm で入れた同じ版の `node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts` で読んだ | 219、220、241、312、379 |
| 3 | Modifying system prompts | https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts | 「Custom string: a prompt you write yourself. The SDK sends only what you provide.」「You can provide a custom string as systemPrompt to replace the default entirely」。CLAUDE.md は「It is not loaded if you pass an empty settingSources array.」 | 218、220 |
| 4 | Quickstart (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/quickstart | 前提「Node.js 18.14+」。`npm pkg set type=module` で「lets your agent script use top-level await」。「Both the TypeScript and Python SDKs bundle a native Claude Code binary, so most installs need no separate Claude Code install.」 | 90、126 |
| 5 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | Pro、Max、Ultra は claude.ai のアカウントでログイン。認証の優先順位で `ANTHROPIC_API_KEY`（3番目）がサブスクリプションの OAuth（7番目）より先。「Run `unset ANTHROPIC_API_KEY` to fall back to your subscription」。`ANTHROPIC_API_KEY` は Agent SDK にも効く | 92、94、104 |
| 6 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | Usage policy の Acceptable use「Advertised usage limits for Pro, Max, and Ultra plans assume ordinary, individual usage of Claude Code and the Agent SDK」。Authentication and credential use「Developers building products or services ... including those using the Agent SDK, should use API key authentication through Claude Console」「Anthropic does not permit third-party developers to offer Claude.ai login into their own applications, or to route requests through Free, Pro, Max, or Ultra plan credentials on behalf of their users」 | 80、82 |
| 7 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「the Claude Agent SDK and `claude -p` still draw from your subscription limits」 | 80、377 |
| 8 | Claude の料金プラン | https://claude.com/pricing | Pro は「$20 if billed monthly」。比較表で Claude Code は Free が「No」、Pro と Max が「Yes」 | 91、377 |
| 9 | Get structured output from agents | https://code.claude.com/docs/en/agent-sdk/structured-outputs | `outputFormat`（`type: "json_schema"`、`schema`）を渡すと result に `structured_output`。「the SDK validates the output against it, re-prompting on mismatch」。「The SDK supports standard JSON Schema features including all basic types ..., enum, const, required」。`outputFormat` を設定すると `StructuredOutput` というツールを Claude Code が足し、エージェントはそれを呼んで答えを返す。「Read the validated data from structured_output on the result message rather than from a tool_use block」。subtype `error_max_structured_output_retries`。「A result can also end with subtype success but no structured_output value ... Treat that case as a failure as well.」。「A single-shot query() throws after yielding an error result」 | 221、223、227、231、235、237 |
| 10 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | History「v22.18.0 Type stripping is enabled by default.」。「file extensions are mandatory in import statements and import() expressions: import './file.ts', not import './file'」 | 289 |
| 11 | @anthropic-ai/claude-agent-sdk（npm registry） | https://registry.npmjs.org/@anthropic-ai/claude-agent-sdk | `npm view` で `dist-tags.latest = '0.3.322'`、`claudeCodeVersion = '2.1.322'`、0.3.322 の公開は 2026-11-10T01:57:38Z。npmjs.com のパッケージのページは WebFetch で HTTP 403 だったので、同じ情報を返す registry の URL を出典にした | 126 |
| 12 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | 「Claude Haiku 5.5 (for prompts up to 100,000 tokens)」の行で Base input $0.10 / MTok、Output $0.50 / MTok。10万トークンを超えるプロンプトは別の単価 | 381 |

## 実行ログを根拠にした本文の記述（出典の表には入れない）

| 本文の行 | 記述 | 根拠のログ |
|---|---|---|
| 60、310 | 規則を書いた基準で5件とも一致 | `run/09.log`（`人の採点との一致: 5/5`、exit=0） |
| 60、344〜373 | 2行の基準では一致2件、表の点、b の理由の引用、d が3点で c が2点 | `run/11.log`（`人の採点との一致: 2/5`、exit=1） |
| 217 | `model: "haiku"` で init に `claude-haiku-5-5` | `run/13.log` の `init model=claude-haiku-5-5` |
| 227〜229 | ツールの一覧は `["StructuredOutput"]` だけ、`tool_use` は1回、`num_turns` は2 | `run/13.log`（`extra/inspect.ts`、記事に載せない確認） |
| 314〜318 | もう一度動かすと点は5件とも同じ、a の理由の書き出しが違う | `run/09.log` と `run/10.log` |
| 320〜340 | 変更前の c は3回とも2点、その2行の抜き出し | `run/06.log`、`run/07.log`、`run/08.log` |
| 312 | `apiKeySource=none` | `run/09.log` の各行 |
| 379 | `total_cost_usd の合計（見積もり）: 0.0026` | `run/09.log` |
