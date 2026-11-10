# sources: ai-agent-vs-workflow

アクセス日はすべて 2026-11-10。番号は記事の出典の表と同じ。行番号は `content/articles/ai-agent-vs-workflow.md`（396行）の行。

| # | 題名 | URL | 確かめた事実（原文の要旨） | 記事のどの文の根拠か |
|---|---|---|---|---|
| 1 | Building effective agents（Anthropic、2024-12-19） | https://www.anthropic.com/engineering/building-effective-agents | ワークフローは「LLMs and tools are orchestrated through predefined code paths」。エージェントは「LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks」。「finding the simplest solution possible, and only increasing complexity when needed」。「Agentic systems often trade latency and cost for better task performance」。prompt chaining は「the task can be easily and cleanly decomposed into fixed subtasks」に向く。途中の手順に「programmatic checks (see "gate”…)」を足せる。エージェントは「open-ended problems where it's difficult or impossible to predict the required number of steps」に使う。「stopping conditions (such as a maximum number of iterations)」 | 55、63、65〜66、74〜75、77、234、354、368〜370 |
| 2 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | ツールが無ければ text でしか答えられない（Without tools, Claude can only respond with text）。ResultMessage のあとにも trailing system events が届くので最後まで回す。ターンの定義（one pass through the loop…）。`maxTurns` の上限に達すると `error_max_turns`。`maxBudgetUsd` も停止条件。組み込みツールの表（Glob、Read）。`allowedTools` は列挙したツールを確認なしで実行。ターンをまたいで変わらない部分は自動で prompt cache される。single-shot の `query()` はエラーの結果のあとに例外を投げる | 230、232、315、317、358、370、372 |
| 3 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | Options の表。`tools`（ツール名の配列）、`maxTurns`（Maximum agentic turns）、`systemPrompt`（文字列でカスタムのプロンプト）、`model`（Claude model alias or full model name） | 230、236 |
| 4 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `total_cost_usd` のコメント「An estimate, not a billing statement」。`apiKeySource` の `'none'` は「no API key in use - e.g. claude.ai OAuth login…」。`spawnClaudeCodeProcess` のコメント「Custom function to spawn the Claude Code process… When provided, this function is called instead of the default local spawn」（既定は手元でプロセスを起動する）。curl で HTTP 200 と、2つの文字列の存在を確かめた | 109、252、356 |
| 5 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「when you're signed in with your Claude plan, the Claude Agent SDK and `claude -p` still draw from your subscription limits」 | 105 |
| 6 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | Usage policy。「Advertised usage limits for Pro, Max, and Ultra plans assume ordinary, individual usage of Claude Code and the Agent SDK」。Agent SDK で製品やサービスを作る開発者は Claude Console などの API キーで認証する。claude.ai のログインを自分のアプリで提供すること、利用者に代わって Free、Pro、Max、Ultra の認証情報で通信を中継することは認めない | 105、107 |
| 7 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | Pro、Max、Ultra は claude.ai のアカウントでログインする。認証の優先順位で `ANTHROPIC_API_KEY`（3番目）はサブスクリプションの OAuth（7番目）より先。`-p` では存在すれば常に使う。`unset ANTHROPIC_API_KEY` でサブスクリプションに戻る | 87、91、101 |
| 8 | Claude の料金プラン | https://claude.com/pricing | Pro は月払いで「$20 if billed monthly」。Claude Code は Pro に含まれ、Free には含まれない | 86、frontmatter `cost_estimate` |
| 9 | Modules: TypeScript (Node.js) | https://nodejs.org/api/typescript.html | History「v23.6.0, v22.18.0 Type stripping is enabled by default」。型の構文を空白に置き換えて実行し、型の検査はしない | 85、89 |
| 10 | @anthropic-ai/claude-agent-sdk (npm) | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | `npm view @anthropic-ai/claude-agent-sdk dist-tags.latest` が `0.3.322`（2026-11-10） | 113 |
| 11 | Model configuration (Claude Code) | https://code.claude.com/docs/en/model-config | `haiku` は別名で、Anthropic API では Haiku 5.5 に解決される | 236 |

## 実行ログを根拠にした文

一次情報の代わりに、この記事で実際に動かした結果を根拠にした文。

| 行 | 内容 | ログ |
|---|---|---|
| 89 | `tsc` で型を確かめてエラー0件 | `run/09.log`（`Version 7.0.2`、`tsc_exit=0`） |
| 252 | 呼び出しは分類3回と返信1回の4回 | `run/07.log` |
| 256〜258 | 1回目は 003.txt の答えが鉤括弧つきで止まり、2回目は通った | `run/07.log`、`run/10.log` |
| 276〜278 | `tools` と `systemPrompt` を指定しないと、ツール39個、cache_creation 13,212、cache_read 25,805、費用の見積もり 0.003156 | `run/12.log`（`code/extra/default-options.ts`） |
| 338〜340 | Glob と Read の順、num_turns 5、2回目の Glob の引数、2回目の答えのファイル名が絶対パス | `run/08.log`、`run/11.log` |
| 348〜352 | 比較の表 | `run/07.log`、`run/10.log`、`run/08.log`、`run/11.log` |
| 356 | `query()` 1回で 6,714ms | `run/13.log`（`code/extra/timing.ts`） |
| 358 | エージェント版の 8,181ms と cache_creation 2,262 | `run/08.log` |
