# code: claude-agent-sdk-first-agent

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `hello.ts` | 1本目のコード（記事の `hello.ts`） |
| `agent.ts` | 2本目のコード（記事の `agent.ts`） |
| `setup-tasks.sh` | 2本目の前に `tasks/` を作るコマンドのブロック（実行は `bash -c` にこの中身をそのまま渡した） |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`、`npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322`）でできたものを写した。依存は `^` なしの `0.3.322` |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `run/NN.log` に残すスクリプト（記事には載せない） |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/10.log`。記事には載せない） |
| `extra/run-node-versions.sh` | 前提の Node.js の版を確かめるスクリプト（記事には載せない）。記事の手順で作業フォルダを作り、記事の `node hello.ts` を Node.js 20.20.0（`run/12.log`）と 22.22.0（`run/13.log`）で動かし、プラットフォームごとの本体のパッケージ名を npm のレジストリから取る（`run/14.log`） |

実行は 2026-11-10。作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` はここに置いていない。

モデルを呼ぶ `run/07.log`、`run/09.log`、`run/11.log` は、オーナー自身の Claude プランでログイン済みの環境で動かした（`ANTHROPIC_API_KEY` は unset、init の `apiKeySource` は `"none"`）。ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない（コードがそれらを表示しない）。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>` に置き換えた。

`run/11.log` は `agent.ts` の2回目の実行で、記事の「同じコードでも、ツールの引数と答えの文面は変わる」の根拠。`run/10.log` は `tsc 7.0.2`（`@types/node 22.20.5`、`strict`）での型の確認で、`tsc_exit=0`。

`run/12.log`〜`14.log` は 2026-11-10 の再判定で足した。`run/12.log` は Node.js 20.20.0 で `ERR_UNKNOWN_FILE_EXTENSION`、`exit=1`（22.18.0 より前の版では `node hello.ts` が動かないことの根拠）。`run/13.log` は同じフォルダで Node.js 22.22.0 に替えた実行で `exit=0`、init の `apiKeySource` は `none`。`run/14.log` は `npm view @anthropic-ai/claude-agent-sdk@0.3.322 optionalDependencies` の結果で、本体のパッケージ名がプラットフォームごとに8つあることの根拠。記事に載せた実行結果は `run/01.log`〜`11.log` のままで、12〜14 は記事に写していない。
