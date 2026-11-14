# sources: llm-as-a-judge-claude

アクセス日はすべて 2026-11-10。2026-11-11 に、本文から消した利用条件の節だけが引いていた Legal and compliance（旧出典6）を外し、旧7〜12を6〜11に付け直した。行番号は 2026-11-11 の版（389行）に直した。原稿の frontmatter の `sources` と、本文末尾の出典の表（番号も同じ）に同じ URL と日付を入れた。

| # | 題名 | URL | 確かめた事実 | 根拠にした本文の行 |
|---|---|---|---|---|
| 1 | Define success criteria and build evaluations | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | 「Grade your evaluations」の節。「Code-based grading: Fastest and most reliable, extremely scalable, but also lacks nuance」「LLM-based grading: Fast and flexible, scalable and suitable for complex judgment. Test to ensure reliability first, then scale.」。「Tips for LLM-based grading」の「Have detailed, clear rubrics」「Be empirical or specific: ... output only ‘correct’ or ‘incorrect’, or to judge from a scale of 1–5」「Encourage reasoning: Use a grader model with thinking on, so that it reasons before it produces an evaluation score」。例のコードのコメント「Generally best practice to evaluate with a different model from the one used to generate the evaluated output」 | 65、67、150、363、365 |
| 2 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `tools` の説明「`[]` (empty array) - Disable all built-in tools」。`settingSources` の説明「Pass `[]` to disable filesystem settings (SDK isolation mode). Must include 'project' to load CLAUDE.md files.」。init の `apiKeySource` の説明「'none' (no API key in use - e.g. claude.ai OAuth login, a bearer token, or a third-party cloud provider)」。結果の `structured_output?: unknown`。`total_cost_usd` の説明「An estimate, not a billing statement.」。result の error の subtype に `error_max_structured_output_retries`。unpkg の URL は HTTP 200。中身は npm で入れた同じ版の `node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts` で読んだ | 209、210、217、288、357。288行目は「none は API キーを使っていないという意味で、claude.ai のログインのほか bearer トークン、クラウド事業者経由でも none になる」と書き、プランで動いた証拠とは書いていない |
| 3 | Modifying system prompts | https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts | 「Custom string: a prompt you write yourself. The SDK sends only what you provide.」「You can provide a custom string as systemPrompt to replace the default entirely」。CLAUDE.md は「It is not loaded if you pass an empty settingSources array.」 | 208、210 |
| 4 | Quickstart (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/quickstart | 前提「Node.js 18.14+」（TypeScript を `npx tsx` で動かす前提の数字で、この記事の `node grade.ts` には足りないので、前提の版の根拠には使っていない）。`npm pkg set type=module` で「lets your agent script use top-level await」。「Both the TypeScript and Python SDKs bundle a native Claude Code binary, so most installs need no separate Claude Code install.」 | 115 |
| 5 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | Pro、Max、Ultra は claude.ai のアカウントでログイン。認証の優先順位で `ANTHROPIC_API_KEY`（3番目）がサブスクリプションの OAuth（7番目）より先。「Run `unset ANTHROPIC_API_KEY` to fall back to your subscription」。`ANTHROPIC_API_KEY` は Agent SDK にも効く | 81、83、93 |
| 6 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「the Claude Agent SDK and `claude -p` still draw from your subscription limits」 | 355 |
| 7 | Claude の料金プラン | https://claude.com/pricing | Pro は「$20 if billed monthly」。比較表で Claude Code は Free が「No」、Pro と Max が「Yes」 | 80、355 |
| 8 | Get structured output from agents | https://code.claude.com/docs/en/agent-sdk/structured-outputs | `outputFormat`（`type: "json_schema"`、`schema`）を渡すと result に `structured_output`。「the SDK validates the output against it, re-prompting on mismatch」。「The SDK supports standard JSON Schema features including all basic types ..., enum, const, required」。`outputFormat` を設定すると `StructuredOutput` というツールを Claude Code が足し、エージェントはそれを呼んで答えを返す。「Read the validated data from structured_output on the result message rather than from a tool_use block」。subtype `error_max_structured_output_retries`。「A result can also end with subtype success but no structured_output value ... Treat that case as a failure as well.」。「A single-shot query() throws after yielding an error result」 | 211、217。`StructuredOutput` ツールの注入、出し直し、`error_max_structured_output_retries`、success で `structured_output` が無い場合の説明は、`content/plan.md` の取り決め（27 は Structured Outputs の説明をせず 6 にリンクする）に合わせて本文から外した |
| 9 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | History「v22.18.0 Type stripping is enabled by default.」。「file extensions are mandatory in import statements and import() expressions: import './file.ts', not import './file'」 | 79（前提の Node.js 22.18.0 以上）、265 |
| 10 | @anthropic-ai/claude-agent-sdk（npm registry） | https://registry.npmjs.org/@anthropic-ai/claude-agent-sdk | `npm view` で `dist-tags.latest = '0.3.322'`、`claudeCodeVersion = '2.1.322'`、0.3.322 の公開は 2026-11-10T01:57:38Z。npmjs.com のパッケージのページは WebFetch で HTTP 403 だったので、同じ情報を返す registry の URL を出典にした | 115 |
| 11 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | 「Claude Haiku 5.5 (for prompts up to 100,000 tokens)」の行で Base input $0.10 / MTok、Output $0.50 / MTok。10万トークンを超えるプロンプトは別の単価 | 359 |

## 実行ログを根拠にした本文の記述（出典の表には入れない）

| 本文の行 | 記述 | 根拠のログ |
|---|---|---|
| 57、286、290〜294、333〜341 | 規則を書いた基準で5件とも一致、5回とも点が同じ | `run/34.log`〜`38.log`（どれも `人の採点との一致: 5/5`、exit=0） |
| 57、320〜351 | 2行の基準の一致は2〜3件、表の点、b の理由の引用、d が5回とも3点で c が2点 | `run/39.log`〜`43.log`（`2/5` が4回、`3/5` が1回、exit=1）。b の理由の引用は `run/39.log` |
| 207 | `model: "haiku"` で init に `claude-haiku-5-5` | `run/44.log` の `init model=claude-haiku-5-5`（`mcp_tools=0 mcp_servers=0`） |
| 290〜294 | もう一度動かすと点は5件とも同じ、a の理由の書き出しが違う | `run/34.log` と `run/35.log`（書き出し）、`run/34.log`〜`38.log`（点） |
| 298〜307 | 変更前の c は3回とも2点、その2行の抜き出し | `run/31.log`〜`33.log`（どれも c は2点、exit=1）。抜き出しは `run/31.log` |
| 286、288 | `apiKeySource=none` | `run/34.log` の各行 |
| 357 | `total_cost_usd の合計（見積もり）: 0.0018` | `run/34.log` |

2026-11-11 に `judge.ts` へ `strictMcpConfig: true` を足したので、この表の根拠はすべて取り直した `run/26.log`〜`46.log` に替えた。直す前のコードのログ `run/01.log`〜`25.log` と、ログを残していない実行は、本文の根拠に使っていない。
