# code: ai-agent-vs-workflow

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `workflow.ts` | ワークフロー版のコード（記事の `workflow.ts`） |
| `agent.ts` | エージェント版のコード（記事の `agent.ts`）。2026-11-10 のレビューのあとに、ワークフロー版と同じ仕事（3件の分類と返金への返信の書き出し）をさせる形に書き直した版 |
| `setup-tickets.sh` | 問い合わせ3件を作るコマンドのブロック（実行は `bash -c` にこの中身をそのまま渡した） |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`、`npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322`）でできたものを写した。依存は `^` なしの `0.3.322` |
| `extra/run-all.sh` | 1回目の実行（`run/01〜13`）。記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `run/NN.log` に残すスクリプト（記事には載せない）。エージェント版は書き直す前の `extra/agent-v1.ts` を `agent.ts` として置く |
| `extra/run-extra.sh` | `run-all.sh` の 01〜11 のあと、同じ作業フォルダで 12 と 13 だけを実行したスクリプト。中身は `run-all.sh` の最後の2手順と同じ |
| `extra/run-round2.sh` | 2回目の実行（`run/14〜22`）。新しい作業フォルダを記事の手順どおりに作り直し、書き直した `agent.ts` を2回、型の確認、`extra/tools-vs-systemprompt.ts` を実行する |
| `extra/agent-v1.ts` | 書き直す前のエージェント版（`run/08.log`、`run/11.log`）。記事からは外した |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/09.log`、`run/20.log`。記事には載せない） |
| `extra/default-options.ts` | `tools` と `systemPrompt` を同時に外した確認（`run/12.log`）。2つの影響を分けられないので、記事からは外した |
| `extra/tools-vs-systemprompt.ts` | `tools` と `systemPrompt` を1つずつ外した4通りの確認（`run/22.log`。記事には数字だけ載せる） |
| `extra/timing.ts` | `query()` 1回の時間の確認用（`run/13.log`。記事には数字だけ載せる） |

実行は 2026-11-10。作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` はここに置いていない。

モデルを呼ぶ `run/07.log`、`run/08.log`、`run/10.log`〜`run/13.log`、`run/19.log`、`run/21.log`、`run/22.log` は、オーナー自身の Claude プランでログイン済みの環境で動かした（`ANTHROPIC_API_KEY` は unset、init の `apiKeySource` は `none`）。ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない（コードがそれらを表示しない）。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>` に置き換えた。`agent.ts` はツールの引数と答えの中の作業フォルダのパスを自分で `.` に置き換えて表示する。`run/11.log` の答えの文中に出た絶対パスは、スクリプトの sed で `<work>` に置き換わっている（記事には `run/11.log` の出力を載せていない）。

`run/19.log` では、LLM が最初の `Glob` の `path` に、Claude Code がこの実行のために作った一時フォルダの絶対パスを渡した。そのパスには実行ごとの ID（UUID の形）が入っていたので、保存したあとに `"<Claude Code の一時フォルダ>"` に置き換えた（置き換えたのはこの1か所だけで、ほかの出力は変えていない）。

`run/10.log` と `run/11.log` は1回目の実行の中の2回目で、記事の「1回目の実行では、手順2が 003.txt を止めた」と比較の表（ワークフロー 2回目）の根拠。`run/09.log` と `run/20.log` は `tsc 7.0.2`（`@types/node 22.20.5`、`strict`）での型の確認で、どちらも `tsc_exit=0`。`run/12.log` と `run/13.log` は `run-extra.sh` で2回実行し、2回目の結果で上書きした（記事の数字は上書き後のもの）。`run/14〜18` は2回目の実行の準備で、コマンドは記事のコマンド（`run/02〜06`）と同じ（`lint/check-code-and-outputs.txt` の最後の行）。
