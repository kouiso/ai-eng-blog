# code: claude-agent-sdk-streaming

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `stream.ts` | 1本目のコード（記事の `stream.ts`） |
| `timing.ts` | 2本目のコード（記事の `timing.ts`） |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`、`npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322`）でできたものを写した。依存は `^` なしの `0.3.322` |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `run/NN.log` に残すスクリプト（記事には載せない）。4つ目の引数でログの番号をずらせる |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/08.log`、`run/16.log`。記事には載せない） |
| `extra/compare-strict.ts` | `strictMcpConfig` の有無で init の MCP サーバーの数と thinking のブロックの有無を3回ずつ数える確認用（`run/17.log`。記事には載せない） |

実行は 2026-11-11、macOS（Darwin arm64）、Node.js v22.23.4、npm 10.9.9。作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` はここに置いていない。

この Mac の `~/.npmrc` には `legacy-peer-deps=true` が入っていて、そのままだと SDK の peer dependency（`@anthropic-ai/sdk` など）が入らない（試しに入れると `added 2 packages` だった）。読者の既定の npm と同じ結果にするため、`run-all.sh` は `NPM_CONFIG_USERCONFIG=/dev/null` で `~/.npmrc` を読ませずに実行した。`run/04.log` の `added 105 packages` はその結果で、#17（Linux）の記録と同じ数。

モデルを呼ぶ `run/05.log`〜`07.log` は、オーナー自身の Claude プランでログイン済みの環境で動かした（`ANTHROPIC_API_KEY` は unset、`run/06.log` と `run/07.log` の init の `apiKeySource` は `none`）。`stream.ts` は init を表示しないので、`run/05.log` には `apiKeySource` が出ない。同じ手順で同じ環境の続けての実行。ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない（コードがそれらを表示しない）。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>` に置き換えた。

`run/07.log` は `timing.ts` の2回目の実行で、記事の「同じ `timing.ts` をもう一度動かすと」の根拠。`run/08.log` は `tsc 7.0.2`（`@types/node 22.20.5`、`strict`）での型の確認で、`tsc_exit=0`。`event.delta.type` の絞り込みと `message.message.id` が型の上でも通ることを確かめた。

記事に載せなかった試し: `thinking: { type: "disabled" }` を渡しても、2026-11-11 の実行では `thinking` のブロックが届いた（ログは残していない。記事にも書いていない）。記事のコードはこのオプションを使わない。

## 2026-11-11 の撮り直し（run/09〜17）

`stream.ts` と `timing.ts` の `query()` に `strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない` を足したので、`run-all.sh <work> <run> <tc> 8` で記事の手順を最初からやり直し、`run/09.log`〜`16.log` に残した（09〜16 は 01〜08 と同じ順番のコマンド）。`run/01.log`〜`08.log` は足す前のコードの記録で、記事の数字の根拠には使っていない。`ANTHROPIC_API_KEY` は unset、`run/14.log` と `run/15.log` の init の `apiKeySource` は `none`。`run/16.log` の型の確認は `tsc_exit=0` で、`strictMcpConfig` が 0.3.322 の型に通ることも確かめた。ログの `date:` は UTC で `2026-11-12T01:0x`、手元の日付（`date +%F`）は 2026-11-11。

`run/17.log` は `extra/compare-strict.ts` の実行で、記事と同じプロンプトとオプションを、`strictMcpConfig` を付けた3回と付けない3回で交互に動かした。付けた3回は init の `mcp_servers=0`、付けない3回は `mcp_servers=24`（名前は出さず数だけ）。6回とも `thinking=false` だった。1回目の撮影（`run/06.log`、`07.log`）では thinking のブロックが届いていたが、付けない3回でも届かなかったので、thinking が消えたのは `strictMcpConfig` のせいとは言えない。記事の thinking の節は、今回のログで見えたこと（text のブロックだけ）と出典2の説明だけで書き直した。
