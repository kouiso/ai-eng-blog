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
| `extra/tsconfig.typecheck.json` | 型の確認（`run/11.log`、TypeScript 7.0.2）に使った設定。記事には載せていない |

実行は 2026-11-10、Node.js 22.22.0、npm 10.9.4、Linux x86_64、`ANTHROPIC_API_KEY` を外した状態（両スクリプトの冒頭で `unset`）。認証はオーナー自身の Claude プランでログインした Claude Code に任せ、init メッセージの `apiKeySource` は `none` でした。

```bash
bash extra/run-all.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ>
bash extra/run-headroom.sh <作業場所の親フォルダ> <run ログの出力先>
```

ログに残すとき、作業場所のパスは `<work>`、このフォルダは `<code>`、tsc のフォルダは `<tc>` に置き換えています。ログイン中のアカウント名、メールアドレス、セッションの ID、認証情報は、どのスクリプトも表示しません（init の行に出すのはモデル名、`apiKeySource`、Claude Code の版だけ）。
