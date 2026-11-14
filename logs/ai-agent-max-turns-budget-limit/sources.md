# sources: ai-agent-max-turns-budget-limit

アクセス日はすべて 2026-11-10。ドキュメントは `curl` で Markdown 版（`<URL>.md`）か HTML を取得して読んだ（取得したファイルは作業用のフォルダに置き、記事を書き終えたあとで消した）。行番号は `content/articles/ai-agent-max-turns-budget-limit.md` の 468 行の版（3版目、2026-11-11）。出典1、4 は、2版目を直すときに同じ日にもう一度取得して、下の該当箇所を読み直した。

3版目（2026-11-11）で、利用条件についての段落（2版目の88〜92行）を消した。そこでしか引いていなかった Legal and compliance（2版目の出典5）は表から外し、出典6〜10 を 5〜9 に繰り上げた。出典4 の行からも、消した段落の根拠だった「Setup」の注記を外した。

| # | 題名 | URL | 確かめた事実 | 根拠にした原稿の行 |
|---|---|---|---|---|
| 1 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | 「Turns and messages」: ターンは Claude の出力1回と、そのツール呼び出しの実行。ツール呼び出しの無い出力でループが終わる。2つのファイルを読む Read を1ターンで呼ぶ例。`maxTurns` はツールを呼んだターンに、最後のテキストだけの応答の1回を足して数える。足りないと `error_max_turns` で最終の応答が無い。「Turns and budget」: `maxTurns` と `maxBudgetUsd` の既定値は No limit、上限で `error_max_turns` か `error_max_budget_usd` の ResultMessage。「Budget headroom」: 上限との比較はモデルの応答が届いたあと。上限に届いた応答は完了して `total_cost_usd` に入る。超える分は応答1回分まで（と、動いているサブエージェントの分）。「Handle the result」: `result` は `success` のときだけあり、エラーの subtype では無い。1回きりの `query()` はエラーの result を渡したあとで例外を投げる。これは意図した動きで、続けたいなら try で囲む。TypeScript の例のコメント「connection or process failures yield no result message」。SDK は呼び出しごとに AssistantMessage を出す（Turn 2 の説明） | 49（ツールを呼ばない返答までループ、2つの上限が数えるもの）、62（既定は上限なし）、68（`result` の欄に回答は入らない）、157（ターンの定義、同時の呼び出し、最後の回答の1ターン）、229（ツールごとに別のメッセージ）、301（比較は応答のあと、応答1回分まで超える）、354（0.00066 の回は、回答の応答が届いたあとで上限との比較が行われた）、384（result のあとで例外、意図された動き、try で囲む）、426（result が届かない失敗は接続とプロセスの失敗） |
| 2 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | Options の表: `tools` はツール名の配列（Tool configuration）、`allowedTools` は確認なしで許可するツール、`systemPrompt` に文字列を渡すとカスタムのプロンプト、`settingSources` に `[]` を渡すとユーザー、プロジェクト、ローカルの設定を読まない、`maxBudgetUsd` は手元での見積もり額がこの値に届いたら止める（Stop the query when the client-side cost estimate reaches this USD value）、`maxTurns` は最大のターン数。SDKResultMessage の型と `terminal_reason` の値（`max_turns`、`budget_exhausted` を含む） | 224〜227（`baseOptions` の各項目）、436（`maxBudgetUsd` が比べるのは見積もり） |
| 3 | Track cost and usage | https://code.claude.com/docs/en/agent-sdk/cost-tracking | 1ターンで複数のツールを使うと、そのターンのメッセージはすべて同じ ID を持つ（When Claude uses multiple tools in one turn, all messages in that turn share the same ID）。`total_cost_usd` と `costUSD` は手元での見積もりで、ビルド時に同梱した料金表から計算し、実際の請求額とずれることがある | 229（同じ応答のメッセージは ID が同じ）、434（手元で計算する見積もり、同梱した料金表、請求額と一致するとは限らない） |
| 4 | Quickstart (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/quickstart | 前提は Node.js 18.14 以上。TypeScript と Python の SDK はネイティブの Claude Code の本体を同梱するので、多くの場合 Claude Code を別に入れなくてよい。`"type": "module"` にするとトップレベルの `await` を使える | 81（Node.js 18.14 以上、本体を同梱）、132（`"type": "module"` とトップレベルの `await`） |
| 5 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | Claude プランでログインしているとき、Agent SDK と `claude -p` の利用はプランの利用枠から引かれる（2026-10-07 と 2026-06-15 の更新の記述） | 432（プランの利用枠から引かれる） |
| 6 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 「Authentication precedence」: `ANTHROPIC_API_KEY` は3番目、`/login` のサブスクリプションの認証情報は7番目。環境変数のキーは Agent SDK にも適用される | 83（`ANTHROPIC_API_KEY` がプランより先に使われる） |
| 7 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | Claude Haiku 5.5（プロンプトが10万トークン以下）は Base Input $0.10 / MTok、Output $0.50 / MTok | 438 |
| 8 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | History: v22.18.0 で type stripping が既定で有効。import では拡張子が必須（`import './file.ts'`）。3版目は Node.js 22.23.4 で動かしたが、引いている事実（22.18.0 からの既定と拡張子）は 22.18.0 以降の版に共通 | 132 |
| 9 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-10 の時点の最新版が 0.3.322（npm のレジストリ `https://registry.npmjs.org/@anthropic-ai/claude-agent-sdk` の `dist-tags.latest` が `0.3.322`、公開は 2026-11-10T01:57:38Z）。engines は `node >=18.14.0` | 81 |

## 実行ログを根拠にした文（出典ではなく run/ のログ）

3版目（2026-11-11）は `strictMcpConfig: true` を足したコードで動かし直した `run/15.log`〜`33.log` を根拠にしている。`run/01.log`〜`14.log` は2版目（足す前のコード、Linux x86_64）の記録として残してある。

| 原稿の行 | 文の中身 | ログ |
|---|---|---|
| 51 | 上限で result が届き、例外が投げられ、`try` が無いと終了コード 1 | `run/19.log`〜`24.log`、`run/33.log` |
| 59〜66 | 表の `subtype`、`terminal_reason`、`errors` の文 | `run/19.log`（`maxTurns`）、`run/21.log`（`maxBudgetUsd`） |
| 74 | init に `claude-haiku-5-5` と出た | `run/19.log` ほか |
| 76〜79 | 環境の版 | `run/15.log`、`run/16.log`、`run/26.log`（`npm ls`）、init の行（Claude Code 2.1.322） |
| 171 | `strictMcpConfig` が入れた SDK の型にある | `run/17.log`（`sdk.d.ts` の2416行目 `strictMcpConfig?: boolean;`） |
| 265 | 応答2で Read を3つ同時に呼び、`error_max_turns`、`apiKeySource` が `none` | `run/19.log` |
| 291 | 3回応答して成功。`node turns-limit.ts 10` を合わせて16回、`node turns-limit.ts 3` を3回動かし、19回とも応答3回 | `run/20.log`（1回）、`run/30.log`（5回）、`run/32.log`（10回）、`run/28.log`（3回）。どのログも、`tool_use` を表示した応答が応答1と応答2だけで、そのあと `success` |
| 293 | 0.0005 の実行では応答2で Read を1つだけ呼んだ | `run/21.log` |
| 297 | 応答3回の実行の `num_turns` は 5、`maxTurns` で止まると上限より1多い | `run/20.log`、`run/28.log`、`run/19.log`（2 → 3）、`run/24.log`（1 → 2） |
| 333 | 0.0005 の上限で約 0.00065、約30%多い。0.0005 は4回とも止まった（この環境で2回、前の環境で2回） | `run/21.log`（0.0006517000000000001）、`run/29.log`、`run/06.log`、`run/14.log` |
| 333 | （同じ段落）0.0005 の回は応答2で Read を1つ呼んだところで止まった | `run/21.log` |
| 335 | 完走27回の見積もりは最低 0.00050667、最高 0.0007558 | `run/15.log`〜`33.log` の `success` 27回。ログごとの回数は 20:1、22:1、23:1、28:3、29:3、30:5、31:2、32:10、33:1（合計27）。最大は `run/22.log` の 0.0007558、最小は `run/28.log`、`30.log`、`32.log` の 0.00050667 |
| 361〜380 | 0.00066 を6回動かし、5回止まり1回 `success`。確認用の3回のうち、回答の文が届いてから止まったのは2回 | 表の6行は `run/31.log`（確認用 `show-blocks.ts` の0.00066 を3回、`error_max_budget_usd` 0.0006696、0.00079582、0.00078842。1回目は text なし、2回目と3回目は応答3の text のあと）と `run/33.log`（`budget-limit.ts` 3回、0.00079436、`success` 0.00064186、0.00068975）。0.00066 の止まった回の合計は、すべて上限より多い |
| 382 | 見積もりは回ごとに違い、違う理由はログから特定できていない | `run/28.log`、`run/29.log`（20秒しか離れていない回で 0.00050667 と 0.00068 前後）。原因は未確認として本文に書いた |
| 337 | 0.0021 なら最後まで答える（この環境で1回、前の環境で1回） | `run/23.log`（この環境）、`run/13.log`（前の環境） |
| 416 | result は表示され、「ループのあとの行」は出ず、標準エラーに例外の文 | `run/24.log`、`run/25.log` |
| 434 | 結果を載せた6回の合計は約0.0040ドル | `run/19.log`、`20.log`、`21.log`、`23.log`、`24.log`、`run/33.log` の1回目の `total_cost_usd` の合計 0.00397414 |
| 436 | プランで動かしても `maxBudgetUsd` が上限として働く | `run/21.log`、`run/33.log`（`apiKeySource none` で `error_max_budget_usd`） |

## 2版目から変えた値（3版目、2026-11-11）

- `maxBudgetUsd` の2つ目の値を 0.0008 から 0.00066 に変えた。`strictMcpConfig: true` を足したコードでは、0.0008 は `run/22.log` で `success`（0.0007558）になり、回答のあとで止まる例にならなかった。`run/31.log` で 0.0007 と 0.00066 を3回ずつ試し、0.00066 は3回とも `error_max_budget_usd`、0.0007 は3回中2回が `success` だった。
- 0.0021 の根拠の文を「最も高かった 0.00105244 の約2倍」から「成功した実行の最高 0.0007558 の2倍より多い」に変えた。
- `maxTurns` の節で、2版目は応答4回の実行（`run/05.log`）を見せていた。3版目のコードでは19回とも応答3回だったので、見出しと文を実行結果に合わせて直し、Read の呼び方が回で変わる例として `run/21.log` を引いた。
