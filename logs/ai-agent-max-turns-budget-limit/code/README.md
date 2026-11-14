# code: ai-agent-max-turns-budget-limit

記事に載せたコードを、記事に書いた形のまま置いています。1文字でも違うものを動かしていないことは `../lint/check-code-and-outputs.txt` で確かめました。

| ファイル | 記事での役割 |
|---|---|
| `package.json` | 記事の `npm init -y`、`npm pkg set type=module`、`npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322` で作られるもの（`run/02.log` の `cat package.json` の出力と同じ） |
| `setup.ts` | `docs/` に見本のメモを3つ作る |
| `run-agent.ts` | 3つのスクリプトの共通部分（`baseOptions`、`task`、`printResult`、`runAgent`） |
| `turns-limit.ts` | 引数を `maxTurns` に渡して動かす |
| `budget-limit.ts` | 引数を `maxBudgetUsd` に渡して動かす |
| `no-catch.ts` | `try` を付けずに `maxTurns: 1` で動かし、例外でプロセスが終わることを見せる |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、`run/01.log`〜`12.log` を書く |
| `extra/run-headroom.sh` | `run-all.sh` のあとに足した実行。作業フォルダを同じ手順で作り直し、`node budget-limit.ts 0.0021` を `run/13.log` に書く |
| `extra/show-blocks.ts` | 記事には載せない確認用（2026-11-10、2版目）。記事の `run-agent.ts` から `baseOptions` と `task` を読み、`maxBudgetUsd` を渡して、assistant メッセージのブロックを `tool_use` 以外（text、thinking）も表示する。上限で止まった回に、回答の text が届いてから result が来るかを見る |
| `extra/run-show-blocks.sh` | 作業フォルダを記事の手順で作り直し、`show-blocks.ts` を 0.0008 で3回、0.0005 で1回動かして `run/14.log` に書く |
| `extra/tsconfig.typecheck.json` | 型の確認（`run/11.log`、`run/27.log`、TypeScript 7.0.2）に使った設定。記事には載せていない |
| `extra/run-strict.sh` | 3版目（2026-11-11）。`run-agent.ts` に `strictMcpConfig: true` を足したあと、記事の手順どおりに作業フォルダを作り直し、記事のコマンドと確認用の実行を `run/15.log`〜`29.log` に書く。`maxBudgetUsd` の3つの値は引数で渡す |
| `extra/run-one.sh` | 3版目。`run-strict.sh` が作った作業フォルダでコマンドを1つ実行し、`run/30.log`〜`33.log` に書く（応答の数を見る `turns-limit.ts 10` の繰り返しと、`maxBudgetUsd` の値の選び直し） |

2版目までの実行（`run/01.log`〜`14.log`）は 2026-11-10、Node.js 22.22.0、npm 10.9.4、Linux x86_64。3版目の実行（`run/15.log`〜`33.log`）は 2026-11-11、Node.js 22.23.4、npm 10.9.9、macOS arm64（ログの `os:` は `Darwin arm64`）で、`strictMcpConfig: true` を足した今の `run-agent.ts` を動かした。どちらも `ANTHROPIC_API_KEY` を外した状態（スクリプトの冒頭で `unset`）。認証はオーナー自身の Claude プランでログインした Claude Code に任せ、init メッセージの `apiKeySource` は `none` でした。

```bash
bash extra/run-all.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ>
bash extra/run-headroom.sh <作業場所の親フォルダ> <run ログの出力先>
bash extra/run-show-blocks.sh <作業場所の親フォルダ> <run ログの出力先>
# 3版目
NPM_CONFIG_USERCONFIG=/dev/null bash extra/run-strict.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ> 0.0005 0.0008 0.0021
bash extra/run-one.sh <作業場所の親フォルダ> <run ログの出力先> 30 "for i in 1 2 3 4 5; do node turns-limit.ts 10; done"
bash extra/run-one.sh <作業場所の親フォルダ> <run ログの出力先> 31 "node show-blocks.ts 0.0007; node show-blocks.ts 0.0007; node show-blocks.ts 0.0007; node show-blocks.ts 0.00066; node show-blocks.ts 0.00066; node show-blocks.ts 0.00066"
bash extra/run-one.sh <作業場所の親フォルダ> <run ログの出力先> 32 "for i in 1 2 3 4 5 6 7 8 9 10; do node turns-limit.ts 10; done"
bash extra/run-one.sh <作業場所の親フォルダ> <run ログの出力先> 33 "node budget-limit.ts 0.00066; node budget-limit.ts 0.00066; node budget-limit.ts 0.00066"
```

3版目の `run-strict.sh` は、2版目と同じ 0.0005、0.0008、0.0021 で動かした。0.0008 は `run/22.log` で `success` になり、回答のあとで止まる例にならなかったので、`run/31.log` で値を試し、記事の2つ目の値を 0.00066 に変えた（`run/33.log`。記事に載せたのはその1回目）。経緯は `../sources.md` の末尾。tsc のフォルダには `typescript@7.0.2` と `@types/node@22` を入れた。

ログに残すとき、作業場所のパスは `<work>`、このフォルダは `<code>`、tsc のフォルダは `<tc>` に置き換えています。ログイン中のアカウント名、メールアドレス、セッションの ID、認証情報は、どのスクリプトも表示しません（init の行に出すのはモデル名、`apiKeySource`、Claude Code の版だけ）。
