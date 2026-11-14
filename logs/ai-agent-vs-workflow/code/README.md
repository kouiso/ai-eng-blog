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
| `extra/agent-v1.ts` | 書き直す前のエージェント版（`run/08.log`、`run/11.log`）。記事からは外した。2026-11-11 にほかのファイルとそろえて `settingSources: []` と `strictMcpConfig: true` を足したが、記事に使わないので動かし直していない（`run/08.log`、`run/11.log` は足す前の版の実行） |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/09.log`、`run/20.log`、`run/32.log`。記事には載せない） |
| `extra/default-options.ts` | `tools` と `systemPrompt` を同時に外した確認（`run/12.log`、3回目は `run/35.log`）。2つの影響を分けられないので、記事からは外した |
| `extra/tools-vs-systemprompt.ts` | `tools` と `systemPrompt` を1つずつ外した4通りの確認（`run/22.log`、3回目は `run/33.log`。記事には数字だけ載せる） |
| `extra/run-round3.sh` | 3回目の実行（`run/23〜35`、2026-11-11、macOS arm64）。記事の出力と数字はこの実行のもの。すべての `query()` に `settingSources: []` と `strictMcpConfig: true` を足したあと、記事の手順どおりに作業フォルダを作り直し、`workflow.ts` と `agent.ts` を2回ずつ、型の確認、`tools-vs-systemprompt.ts`、`timing.ts`、`default-options.ts` を実行した。`NPM_CONFIG_USERCONFIG=/dev/null` を環境変数で渡した |
| `extra/timing.ts` | `query()` 1回の時間の確認用（`run/13.log`、3回目は `run/34.log`。記事には数字だけ載せる） |

実行は 2026-11-10。作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` はここに置いていない。

モデルを呼ぶ `run/07.log`、`run/08.log`、`run/10.log`〜`run/13.log`、`run/19.log`、`run/21.log`、`run/22.log` は、オーナー自身の Claude プランでログイン済みの環境で動かした（`ANTHROPIC_API_KEY` は unset、init の `apiKeySource` は `none`）。ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない（コードがそれらを表示しない）。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>` に置き換えた。`agent.ts` はツールの引数と答えの中の作業フォルダのパスを自分で `.` に置き換えて表示する。`run/11.log` の答えの文中に出た絶対パスは、スクリプトの sed で `<work>` に置き換わっている（記事には `run/11.log` の出力を載せていない）。

`run/19.log` では、LLM が最初の `Glob` の `path` に、Claude Code がこの実行のために作った一時フォルダの絶対パスを渡した。そのパスには実行ごとの ID（UUID の形）が入っていたので、保存したあとに `"<Claude Code の一時フォルダ>"` に置き換えた（置き換えたのはこの1か所だけで、ほかの出力は変えていない）。

`run/10.log` と `run/11.log` は1回目の実行の中の2回目で、記事の「1回目の実行では、手順2が 003.txt を止めた」と比較の表（ワークフロー 2回目）の根拠。`run/09.log` と `run/20.log` は `tsc 7.0.2`（`@types/node 22.20.5`、`strict`）での型の確認で、どちらも `tsc_exit=0`。`run/12.log` と `run/13.log` は `run-extra.sh` で2回実行し、2回目の結果で上書きした（記事の数字は上書き後のもの）。`run/14〜18` は2回目の実行の準備で、コマンドは記事のコマンド（`run/02〜06`）と同じ（`lint/check-code-and-outputs.txt` の最後の行）。

## 2026-11-11 の3回目の実行（run/23〜35）

すべての `query()` に `settingSources: []`（手元の設定ファイルと CLAUDE.md を読まない）と `strictMcpConfig: true`（claude.ai のコネクタのツールを読まない）を足し、記事の手順どおりに作業フォルダを作り直して動かした。実行は macOS arm64、Node.js 22.23.4、npm 10.9.9。`ANTHROPIC_API_KEY` は unset、init の `apiKeySource` はすべて `none`。ホームフォルダのパスは `~`、作業フォルダは `<work>`、型の確認用のフォルダは `<tc>` に置き換えるようにスクリプトに書いた（置き換えが必要な出力は出なかった）。記事の出力と数字は、この実行のログから写した（`lint/check-code-and-outputs.txt`）。

最初に `strictMcpConfig: true` だけを足して動かしたときは、記事のコードが `settingSources` を指定していなかったので、執筆に使ったマシンの設定フォルダの CLAUDE.md と設定まで読み込まれた（`tools: []` の分類1回の入力の合計が 35,800）。その出力には設定フォルダの指示の文が混ざっていたので、そのときのログ（同じ run/23〜35 の番号）は消し、`settingSources: []` を足してから同じ番号で取り直した。取り直したログに、その指示の文が入っていないことは確かめた。`run/22.log` 以前（Linux x86_64）の数字は、この記事にはもう使っていない。
