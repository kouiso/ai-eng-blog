# sources: ai-agent-max-turns-budget-limit

アクセス日はすべて 2026-11-10。ドキュメントは `curl` で Markdown 版（`<URL>.md`）か HTML を取得して読んだ（取得したファイルは作業用のフォルダに置き、記事を書き終えたあとで消した）。行番号は `content/articles/ai-agent-max-turns-budget-limit.md` の 476 行の版（2版目）。出典1、4、5 は、2版目を直すときに同じ日にもう一度取得して、下の該当箇所を読み直した。

| # | 題名 | URL | 確かめた事実 | 根拠にした原稿の行 |
|---|---|---|---|---|
| 1 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | 「Turns and messages」: ターンは Claude の出力1回と、そのツール呼び出しの実行。ツール呼び出しの無い出力でループが終わる。2つのファイルを読む Read を1ターンで呼ぶ例。`maxTurns` はツールを呼んだターンに、最後のテキストだけの応答の1回を足して数える。足りないと `error_max_turns` で最終の応答が無い。「Turns and budget」: `maxTurns` と `maxBudgetUsd` の既定値は No limit、上限で `error_max_turns` か `error_max_budget_usd` の ResultMessage。「Budget headroom」: 上限との比較はモデルの応答が届いたあと。上限に届いた応答は完了して `total_cost_usd` に入る。超える分は応答1回分まで（と、動いているサブエージェントの分）。「Handle the result」: `result` は `success` のときだけあり、エラーの subtype では無い。1回きりの `query()` はエラーの result を渡したあとで例外を投げる。これは意図した動きで、続けたいなら try で囲む。TypeScript の例のコメント「connection or process failures yield no result message」。SDK は呼び出しごとに AssistantMessage を出す（Turn 2 の説明） | 52（ツールを呼ばない返答までループ、2つの上限が数えるもの）、65（既定は上限なし）、71（`result` の欄に回答は入らない）、166（ターンの定義、同時の呼び出し、最後の回答の1ターン）、237（ツールごとに別のメッセージ）、307（比較は応答のあと、応答1回分まで超える）、362（0.0008 の回は、回答の応答が届いたあとで上限との比較が行われた）、392（result のあとで例外、意図された動き、try で囲む）、434（result が届かない失敗は接続とプロセスの失敗） |
| 2 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | Options の表: `tools` はツール名の配列（Tool configuration）、`allowedTools` は確認なしで許可するツール、`systemPrompt` に文字列を渡すとカスタムのプロンプト、`settingSources` に `[]` を渡すとユーザー、プロジェクト、ローカルの設定を読まない、`maxBudgetUsd` は手元での見積もり額がこの値に届いたら止める（Stop the query when the client-side cost estimate reaches this USD value）、`maxTurns` は最大のターン数。SDKResultMessage の型と `terminal_reason` の値（`max_turns`、`budget_exhausted` を含む） | 232〜235（`baseOptions` の各項目）、444（`maxBudgetUsd` が比べるのは見積もり） |
| 3 | Track cost and usage | https://code.claude.com/docs/en/agent-sdk/cost-tracking | 1ターンで複数のツールを使うと、そのターンのメッセージはすべて同じ ID を持つ（When Claude uses multiple tools in one turn, all messages in that turn share the same ID）。`total_cost_usd` と `costUSD` は手元での見積もりで、ビルド時に同梱した料金表から計算し、実際の請求額とずれることがある | 237（同じ応答のメッセージは ID が同じ）、442（手元で計算する見積もり、同梱した料金表、請求額と一致するとは限らない） |
| 4 | Quickstart (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/quickstart | 前提は Node.js 18.14 以上。TypeScript と Python の SDK はネイティブの Claude Code の本体を同梱するので、多くの場合 Claude Code を別に入れなくてよい。`"type": "module"` にするとトップレベルの `await` を使える。「Setup」の注記: 事前の承認が無い限り、サードパーティの開発者が自分の製品で claude.ai のログインや利用枠を提供することは認めない。Agent SDK で作ったエージェントも含む（"Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK."） | 84（Node.js 18.14 以上、本体を同梱）、92（Agent SDK で作ったエージェントも claude.ai のログインの禁止に含まれる）、141（`"type": "module"` とトップレベルの `await`） |
| 5 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | 「Usage policy」: Pro、Max、Ultra の利用枠は Claude Code と Agent SDK の個人の通常の利用を前提にしている。「Authentication and credential use」: Agent SDK を使って製品やサービスを作る開発者は Claude Console などの API キーで認証する。サードパーティの開発者が自分のアプリで Claude.ai のログインを提供すること、利用者に代わって Free、Pro、Max、Ultra のプランの認証情報で通信を中継することは認めない（"Anthropic does not permit third-party developers to offer Claude.ai login into their own applications, or to route requests through Free, Pro, Max, or Ultra plan credentials on behalf of their users."） | 90（個人がふつうに使う前提の量）、92（他人に使わせるなら API キー、中継の禁止、自分のアプリに claude.ai のログインを付けることの禁止） |
| 6 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | Claude プランでログインしているとき、Agent SDK と `claude -p` の利用はプランの利用枠から引かれる（2026-10-07 と 2026-06-15 の更新の記述） | 90、440（プランの利用枠から引かれる） |
| 7 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 「Authentication precedence」: `ANTHROPIC_API_KEY` は3番目、`/login` のサブスクリプションの認証情報は7番目。環境変数のキーは Agent SDK にも適用される | 86（`ANTHROPIC_API_KEY` がプランより先に使われる） |
| 8 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | Claude Haiku 5.5（プロンプトが10万トークン以下）は Base Input $0.10 / MTok、Output $0.50 / MTok | 446 |
| 9 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | History: v22.18.0 で type stripping が既定で有効。import では拡張子が必須（`import './file.ts'`） | 141 |
| 10 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-10 の時点の最新版が 0.3.322（npm のレジストリ `https://registry.npmjs.org/@anthropic-ai/claude-agent-sdk` の `dist-tags.latest` が `0.3.322`、公開は 2026-11-10T01:57:38Z）。engines は `node >=18.14.0` | 84 |

## 実行ログを根拠にした文（出典ではなく run/ のログ）

| 原稿の行 | 文の中身 | ログ |
|---|---|---|
| 54 | 上限で result が届き、例外が投げられ、`try` が無いと終了コード 1 | `run/04.log`〜`08.log` |
| 62〜69 | 表の `subtype`、`terminal_reason`、`errors` の文 | `run/04.log`（`maxTurns`）、`run/06.log`（`maxBudgetUsd`） |
| 77 | init に `claude-haiku-5-5` と出た | `run/04.log` ほか |
| 79〜82 | 環境の版 | `run/01.log`、`run/02.log`、`run/10.log`（`npm ls`）、init の行（Claude Code 2.1.322） |
| 273 | 応答2で Read を3つ同時に呼び、`error_max_turns`、`apiKeySource` が `none` | `run/04.log` |
| 299 | 応答4回で成功、`node turns-limit.ts 3` を3回動かすと3回とも応答3回で成功 | `run/05.log`、`run/12.log` |
| 303 | `num_turns` は応答3回でも4回でも 5、`maxTurns` で止まると上限より1多い | `run/05.log`、`run/12.log`、`run/04.log`（2 → 3）、`run/08.log`（1 → 2） |
| 341 | 0.0005 の上限で約 0.00065、約30%多い。0.0008 でも上限を超えてから止まった | `run/06.log`（0.0006513999999999999）、`run/07.log`（0.00086785） |
| 362 | 0.0005 の回はファイルを読み終えた時点で止まった。0.0008 の回は回答の応答まで生成され、その料金も合計に入った（合計 0.00086785 が、同じ Glob と Read 3つの形で回答まで返した 0.0021 の回の 0.00085736 より多い）。result は `error_max_budget_usd` で、`result` の欄に回答は入らない。`runAgent` は `tool_use` のブロックしか表示しない | `run/06.log`、`run/07.log`、`run/13.log`。回答の text が届いてから `error_max_budget_usd` になることは、記事に載せない確認用の `code/extra/show-blocks.ts` で text のブロックも表示した `run/14.log` で確かめた（0.0008 で3回。Glob と Read 3つの形になった1回目と3回目は、どちらも応答3の text のあとに `error_max_budget_usd`、`result` の欄なし。2回目は Read を3回に分けて呼び、回答の前に止まった） |
| 364 | 成功時の最高は 0.00105244、0.0021 なら最後まで答える | `run/05.log`、`run/13.log` |
| 424 | result は表示され、「ループのあとの行」は出ず、標準エラーに例外の文 | `run/08.log`、`run/09.log` |
| 442 | 結果を載せた6回の合計は約0.0044ドル | `run/04.log`〜`08.log`、`run/13.log` の `total_cost_usd` の合計 0.00435928 |
| 444 | プランで動かしても `maxBudgetUsd` が上限として働く | `run/06.log`、`run/07.log`（`apiKeySource none` で `error_max_budget_usd`） |
