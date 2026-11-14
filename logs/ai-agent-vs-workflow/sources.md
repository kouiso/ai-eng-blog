# sources: ai-agent-vs-workflow

アクセス日はすべて 2026-11-10。番号は記事の出典の表と同じ（2026-11-11 に Legal and compliance の行を本文から消したので外し、7〜12 を 6〜11 に繰り上げた）。「記事のどの文の根拠か」の行番号は、2026-11-11 の点検後の修正を入れた原稿 `content/articles/ai-agent-vs-workflow.md`（438行）で（出典n）を引いている行。

| # | 題名 | URL | 確かめた事実（原文の要旨） | 記事のどの文の根拠か |
|---|---|---|---|---|
| 1 | Building effective agents（Anthropic、2024-12-19） | https://www.anthropic.com/engineering/building-effective-agents | ワークフローとエージェントの両方を「we categorize all these variations as agentic systems」と呼び、そのうえで区別する。ワークフローは「LLMs and tools are orchestrated through predefined code paths」。エージェントは「LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks」。「finding the simplest solution possible, and only increasing complexity when needed. This might mean not building agentic systems at all. Agentic systems often trade latency and cost for better task performance」（主語は agentic systems で、ワークフローとエージェントの両方を含む。比べている相手は最も単純な方法）。「workflows offer predictability and consistency for well-defined tasks」。prompt chaining（ワークフローの1つ）は「the task can be easily and cleanly decomposed into fixed subtasks」に向き、「The main goal is to trade off latency for higher accuracy」。途中の手順に「programmatic checks (see "gate”…)」を足せる。エージェントは「open-ended problems where it's difficult or impossible to predict the required number of steps」に使う。「stopping conditions (such as a maximum number of iterations)」。2026-11-10 に curl で本文を取り直し、上の文がそのままあることを確かめた | 55、63、74、75、77、239、348、394、410、411、412 |
| 2 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | ツールが無ければ text でしか答えられない（Without tools, Claude can only respond with text）。ResultMessage のあとにも trailing system events が届くので最後まで回す。`maxTurns` の上限に達すると `error_max_turns`。`maxBudgetUsd` も停止条件。組み込みツールの表（Glob、Read）。`allowedTools` は列挙したツールを確認なしで実行。ターンをまたいで変わらない部分は自動で prompt cache される。single-shot の `query()` はエラーの結果のあとに例外を投げる | 235、237、346、348、398、412、414 |
| 3 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | Options の表。`tools`（ツール名の配列）、`maxTurns`（Maximum agentic turns）、`systemPrompt`（文字列でカスタムのプロンプト）、`model`（Claude model alias or full model name） | 235、241 |
| 4 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `total_cost_usd` のコメント「An estimate, not a billing statement」。`apiKeySource` の `'none'` は「no API key in use - e.g. claude.ai OAuth login…」。`spawnClaudeCodeProcess` のコメント「Custom function to spawn the Claude Code process… When provided, this function is called instead of the default local spawn」（既定は手元でプロセスを起動する）。curl で HTTP 200 と、2つの文字列の存在を確かめた。2026-11-11 に 0.3.322 を入れて `sdk.d.ts` の `settingSources` のコメントを読んだ。「When omitted, all sources are loaded (matches CLI defaults).」「Pass `[]` to disable filesystem settings (SDK isolation mode).」「Must include `'project'` to load CLAUDE.md files.」。`strictMcpConfig?: boolean` があることも確かめた（コードのコメントだけで使い、本文では引いていない） | 107、235、257、396 |
| 5 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「when you're signed in with your Claude plan, the Claude Agent SDK and `claude -p` still draw from your subscription limits」。ページ冒頭に「Update June 15, 2026: We’ve paused the previously-announced changes to Claude Agent SDK usage. For now, nothing has changed」の注記があり、利用枠の扱いは将来変わりうる（2026-11-11 に context-mode の fetch で取り直して確かめた。本文105行目の断定は今も正しい） | 105 |
| 6 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | Pro、Max、Ultra は claude.ai のアカウントでログインし、Claude for Teams と Enterprise は管理者に招待された claude.ai のアカウントでログインする。認証の優先順位の7番目「Subscription OAuth credentials from `/login`. This is the default for Claude Pro, Max, Ultra, Team, and Enterprise users.」。`ANTHROPIC_API_KEY`（3番目）はサブスクリプションの OAuth（7番目）より先。`-p` では存在すれば常に使う。`unset ANTHROPIC_API_KEY` でサブスクリプションに戻る。2026-11-10 に `authentication.md` を curl で取り直して確かめた | 86、87、91、101 |
| 7 | Claude の料金プラン | https://claude.com/pricing | Pro は月払いで「$20 if billed monthly」。個人向けの比較表の行「Claude Code No Yes Yes Yes」（Free は No）。Team の項目に「Claude Code and Claude Cowork」、Team と Enterprise の比較表の行「Claude Code Yes Yes Yes」。2026-11-10 に curl で取り直して確かめた | 86、frontmatter `cost_estimate` |
| 8 | Modules: TypeScript (Node.js) | https://nodejs.org/api/typescript.html | History「v23.6.0, v22.18.0 Type stripping is enabled by default」。型の構文を空白に置き換えて実行し、型の検査はしない | 85、89 |
| 9 | @anthropic-ai/claude-agent-sdk (npm) | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | `npm view @anthropic-ai/claude-agent-sdk dist-tags.latest` が `0.3.322`（2026-11-10） | 111 |
| 10 | Model configuration (Claude Code) | https://code.claude.com/docs/en/model-config | `haiku` は別名で、Anthropic API では Haiku 5.5 に解決される | 241 |
| 11 | Prompt caching | https://platform.claude.com/docs/en/build-with-claude/prompt-caching | usage の `cache_creation_input_tokens`（キャッシュに書き込んだ分）、`cache_read_input_tokens`（キャッシュから読んだ分）、`input_tokens`（キャッシュを通らなかった分。最後のブレークポイントより後ろ）の定義。「To calculate total input tokens: total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens」。2026-11-10 に `prompt-caching.md` を curl で取得して確かめた | 286 |

## 実行ログを根拠にした文

一次情報の代わりに、この記事で実際に動かした結果を根拠にした文。記事に載せた出力と数字は、すべての `query()` に `settingSources: []` と `strictMcpConfig: true` を足したあとの3回目の実行 `run/23〜35`（2026-11-12 01:10〜01:11 UTC、ローカル日付 2026-11-11、macOS arm64）から写した。行は 2026-11-11 の点検後の修正を入れた原稿（438行）。

| 行 | 内容 | ログ |
|---|---|---|
| 85 | 検証は Node.js 22.23.4 | `run/23.log` などのヘッダ `node: v22.23.4` |
| 89 | `tsc` で型を確かめてエラー0件 | `run/32.log`（`Version 7.0.2`、`tsc_exit=0`） |
| 257 | 呼び出しは分類3回と返信1回の4回 | `run/28.log` |
| 259〜261 | 1回目は 002.txt の答えが鉤括弧つきで止まった | `run/28.log` |
| 263、278 | 2回目は3件とも括弧なしで通ったが、002.txt を「その他」、003.txt を「返金」と取り違え、003.txt に返信案が付いた（呼び出し5回） | `run/29.log` |
| 282〜297 | `tools: []` の有無と、指示を `systemPrompt` と `prompt` の先頭のどちらに書くかの4通り（各1回）の、ツールの数（0 と 25）、入力の合計（677、15,252、680、15,254）、4通りとも入力のほとんどが `cache_read`。指示を `prompt` に移していることは `code/extra/tools-vs-systemprompt.ts:15-16` | `run/33.log`（`code/extra/tools-vs-systemprompt.ts`） |
| 297 | 問い合わせと指示は合わせて72字（`tickets/001.txt` の35字と指示の37字。python の `len` で数えた） | `code/extra/tools-vs-systemprompt.ts:5`、`code/setup-tickets.sh` |
| 299 | 費用の見積もりは入力の合計がほぼ同じ2通りで約15倍違う（A 0.000139、C 0.000009）。前の日の Linux の1回（`settingSources` を付ける前）では大小の向きが逆（A 0.000319 < C 0.000407、B 0.003029 < D 0.003148） | `run/33.log`、`run/22.log` |
| 352〜371 | エージェント版の出力（2回目）と、3件とも正しいラベル、返信の書き出しは 001.txt だけ | `run/31.log` |
| 373 | エージェント版の1回目もツールの呼び出し4回、num_turns 5、返信の書き出しの文面が2回で違う | `run/30.log`、`run/31.log` |
| 379〜392 | 比較の表（呼んだ回数、時間、費用の見積もり、途中で止まった問い合わせ、正しいラベルの件数）と、上限の10ターンに届かなかったこと | ワークフロー `run/28.log`、`run/29.log`。エージェント `run/30.log`、`run/31.log` |
| 396 | `query()` 1回の測定で 2,234ms。ワークフロー版の実測 9,438ms と 12,246ms | `run/34.log`（`code/extra/timing.ts`）、`run/28.log`、`run/29.log` |
| 398 | エージェント版の 5,628ms と 7,313ms | `run/30.log`、`run/31.log` |
| 400 | 費用の見積もりは1回目はワークフロー版、2回目はエージェント版が小さい。ラベルはエージェント版が2回とも3件正しい | `run/28〜31.log` |

`run/01〜22`（2026-11-10、Linux x86_64、`settingSources` と `strictMcpConfig` を付ける前の版）は経緯の記録として残してある。記事から引いているのは 299 行目の `run/22.log` だけ。`run/35.log`（`tools` と `systemPrompt` を同時に外した確認 `code/extra/default-options.ts`）も記事からは引いていない。
