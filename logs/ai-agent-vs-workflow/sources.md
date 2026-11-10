# sources: ai-agent-vs-workflow

アクセス日はすべて 2026-11-10。番号は記事の出典の表と同じ。行番号は `content/articles/ai-agent-vs-workflow.md`（420行）の行。

| # | 題名 | URL | 確かめた事実（原文の要旨） | 記事のどの文の根拠か |
|---|---|---|---|---|
| 1 | Building effective agents（Anthropic、2024-12-19） | https://www.anthropic.com/engineering/building-effective-agents | ワークフローとエージェントの両方を「we categorize all these variations as agentic systems」と呼び、そのうえで区別する。ワークフローは「LLMs and tools are orchestrated through predefined code paths」。エージェントは「LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks」。「finding the simplest solution possible, and only increasing complexity when needed. This might mean not building agentic systems at all. Agentic systems often trade latency and cost for better task performance」（主語は agentic systems で、ワークフローとエージェントの両方を含む。比べている相手は最も単純な方法）。「workflows offer predictability and consistency for well-defined tasks」。prompt chaining（ワークフローの1つ）は「the task can be easily and cleanly decomposed into fixed subtasks」に向き、「The main goal is to trade off latency for higher accuracy」。途中の手順に「programmatic checks (see "gate”…)」を足せる。エージェントは「open-ended problems where it's difficult or impossible to predict the required number of steps」に使う。「stopping conditions (such as a maximum number of iterations)」。2026-11-10 に curl で本文を取り直し、上の文がそのままあることを確かめた | 58、66、77〜78、80（agentic systems、単純な方法から始める、ワークフローは予測しやすい）、237、332、377（prompt chaining は遅延と引き換えに精度を上げる）、391〜393 |
| 2 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | ツールが無ければ text でしか答えられない（Without tools, Claude can only respond with text）。ResultMessage のあとにも trailing system events が届くので最後まで回す。`maxTurns` の上限に達すると `error_max_turns`。`maxBudgetUsd` も停止条件。組み込みツールの表（Glob、Read）。`allowedTools` は列挙したツールを確認なしで実行。ターンをまたいで変わらない部分は自動で prompt cache される。single-shot の `query()` はエラーの結果のあとに例外を投げる | 233、235、330、332、381、393、395 |
| 3 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | Options の表。`tools`（ツール名の配列）、`maxTurns`（Maximum agentic turns）、`systemPrompt`（文字列でカスタムのプロンプト）、`model`（Claude model alias or full model name） | 233、239 |
| 4 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `total_cost_usd` のコメント「An estimate, not a billing statement」。`apiKeySource` の `'none'` は「no API key in use - e.g. claude.ai OAuth login…」。`spawnClaudeCodeProcess` のコメント「Custom function to spawn the Claude Code process… When provided, this function is called instead of the default local spawn」（既定は手元でプロセスを起動する）。curl で HTTP 200 と、2つの文字列の存在を確かめた | 112、255、379 |
| 5 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「when you're signed in with your Claude plan, the Claude Agent SDK and `claude -p` still draw from your subscription limits」 | 108 |
| 6 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | Usage policy。「Advertised usage limits for Pro, Max, and Ultra plans assume ordinary, individual usage of Claude Code and the Agent SDK」。Agent SDK で製品やサービスを作る開発者は Claude Console などの API キーで認証する。claude.ai のログインを自分のアプリで提供すること、利用者に代わって Free、Pro、Max、Ultra の認証情報で通信を中継することは認めない | 108、110 |
| 7 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | Pro、Max、Ultra は claude.ai のアカウントでログインし、Claude for Teams と Enterprise は管理者に招待された claude.ai のアカウントでログインする。認証の優先順位の7番目「Subscription OAuth credentials from `/login`. This is the default for Claude Pro, Max, Ultra, Team, and Enterprise users.」。`ANTHROPIC_API_KEY`（3番目）はサブスクリプションの OAuth（7番目）より先。`-p` では存在すれば常に使う。`unset ANTHROPIC_API_KEY` でサブスクリプションに戻る。2026-11-10 に `authentication.md` を curl で取り直して確かめた | 89（プランは Pro、Max、Ultra、Team、Enterprise のどれか）、90、94、104 |
| 8 | Claude の料金プラン | https://claude.com/pricing | Pro は月払いで「$20 if billed monthly」。個人向けの比較表の行「Claude Code No Yes Yes Yes」（Free は No）。Team の項目に「Claude Code and Claude Cowork」、Team と Enterprise の比較表の行「Claude Code Yes Yes Yes」。2026-11-10 に curl で取り直して確かめた | 89（Free には含まれない、Pro は月20ドル）、frontmatter `cost_estimate` |
| 9 | Modules: TypeScript (Node.js) | https://nodejs.org/api/typescript.html | History「v23.6.0, v22.18.0 Type stripping is enabled by default」。型の構文を空白に置き換えて実行し、型の検査はしない | 88、92 |
| 10 | @anthropic-ai/claude-agent-sdk (npm) | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | `npm view @anthropic-ai/claude-agent-sdk dist-tags.latest` が `0.3.322`（2026-11-10） | 116 |
| 11 | Model configuration (Claude Code) | https://code.claude.com/docs/en/model-config | `haiku` は別名で、Anthropic API では Haiku 5.5 に解決される | 239 |
| 12 | Prompt caching | https://platform.claude.com/docs/en/build-with-claude/prompt-caching | usage の `cache_creation_input_tokens`（キャッシュに書き込んだ分）、`cache_read_input_tokens`（キャッシュから読んだ分）、`input_tokens`（キャッシュを通らなかった分。最後のブレークポイントより後ろ）の定義。「To calculate total input tokens: total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens」。2026-11-10 に `prompt-caching.md` を curl で取得して確かめた | 281 |

## 実行ログを根拠にした文

一次情報の代わりに、この記事で実際に動かした結果を根拠にした文。1回目の実行は `run/01〜13`（2026-11-10 07:33〜07:37 UTC）、エージェント版を書き直したあとの2回目の実行は `run/14〜22`（同日 08:23〜08:24 UTC）。

| 行 | 内容 | ログ |
|---|---|---|
| 92 | `tsc` で型を確かめてエラー0件 | `run/09.log`（1回目の版）、`run/20.log`（書き直した `agent.ts` を含む。`Version 7.0.2`、`tsc_exit=0`） |
| 255 | 呼び出しは分類3回と返信1回の4回 | `run/07.log` |
| 259〜261 | 1回目は 003.txt の答えが鉤括弧つきで止まり、2回目は通った | `run/07.log`、`run/10.log` |
| 283〜290 | `tools` と `systemPrompt` を1つずつ外した4通りの、ツールの数、入力の合計、費用の見積もり | `run/22.log`（`code/extra/tools-vs-systemprompt.ts`） |
| 340〜355 | エージェント版の出力（2回目）と、3件とも正しいラベル、返信の書き出しは 001.txt だけ | `run/21.log` |
| 357 | エージェント版の1回目は、最初の Glob で Claude Code の一時フォルダを探し、ツール5回、num_turns 6。返信の書き出しに「返信の書き出し: 」の前置き | `run/19.log` |
| 367〜375 | 比較の表（途中で止まった問い合わせの行を含む）と、上限の10ターンに届かなかったこと | ワークフロー `run/07.log`、`run/10.log`。エージェント `run/19.log`、`run/21.log` |
| 379 | `query()` 1回で 6,714ms | `run/13.log`（`code/extra/timing.ts`） |
| 381 | エージェント版の 9,166ms と 9,769ms | `run/21.log`、`run/19.log` |

`run/08.log`、`run/11.log`（書き直す前のエージェント版 `code/extra/agent-v1.ts`）と `run/12.log`（`tools` と `systemPrompt` を同時に外した確認 `code/extra/default-options.ts`）は、記事からは引いていない。`run/12.log` は2つの指定を同時に外していて、どちらの影響かを分けられないので、`run/22.log` の4通りに置き換えた。
