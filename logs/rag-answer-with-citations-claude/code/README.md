# code: rag-answer-with-citations-claude

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。記事のコードブロックとの一致は `../lint/check-code-and-outputs.py` で確かめた（結果は `../lint/check-code-and-outputs.txt`、ALL OK）。

| ファイル | 記事での扱い |
|---|---|
| `tokenize.ts`、`bm25.ts`、`docs.ts` | `logs/rag-bm25-search-typescript/code/` の同名のファイルを1文字も変えずに写したもの（一致は `check-code-and-outputs.txt` で確認） |
| `verify.ts` | 出典の番号と引用文を確かめる関数 |
| `check-sample.ts` | 手で作った誤りの見本を `verify` に渡す確認用のコード（記事に載せている） |
| `ask.ts` | 検索、Agent SDK の `query()`、検証を1つにしたコード |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`、`npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322`）でできたものを写した。依存は `^` なしの `0.3.322` |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `../run/NN.log` に残すスクリプト（記事には載せない）。`logs/claude-agent-sdk-first-agent/code/extra/run-all.sh` を写し、コマンドを差し替えた |
| `extra/rerun-strict.sh` | `ask.ts` に `strictMcpConfig: true` を足したあとの再実行。`run-all.sh` と同じ手順で作業フォルダを作り直し、`../run/19.log`〜`35.log` に残す（記事には載せない） |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/18.log`、`run/35.log`。記事には載せない） |

実行は 2026-11-11、macOS（Darwin arm64）、Node.js 22.23.4、npm 10.9.9。作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` はここに置いていない。

2026-11-11 に `ask.ts` の `options` へ `strictMcpConfig: true`（claude.ai のコネクタのツールを読み込まない設定。名前は同じ版の `sdk.d.ts` の `strictMcpConfig?: boolean` で確かめた）を足し、`extra/rerun-strict.sh` で取り直した。記事の出力と数字は `run/19.log`〜`35.log` から写している。`run/01.log`〜`18.log` は足す前の版の記録として残した。`check-sample.ts` と `run/06.log` は、コードが変わっていないので取り直していない。再実行では `NPM_CONFIG_USERCONFIG=/dev/null`（手元の `~/.npmrc` を読まない、npm の既定の設定）で動かしたので、`npm install` の出力が `run/04.log`（2 packages）と `run/22.log`（105 packages）で違う。記事には `run/22.log` を載せた。

モデルを呼ぶ `run/07.log`、`run/08.log`、`run/10.log`〜`17.log`、`run/24.log`、`run/25.log`、`run/27.log`〜`34.log` は、オーナー自身の Claude プランでログイン済みの環境で動かした（`ANTHROPIC_API_KEY` は unset、init の `apiKeySource` は `"none"`）。ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない（コードがそれらを表示しない）。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>` に置き換えた。

## run/ の中身

| ログ | コマンド | 記事 |
|---|---|---|
| 01 | `node -v` | 載せない（検証の版の根拠） |
| 02 | `ANTHROPIC_API_KEY` の有無 | 載せる |
| 03、04 | `npm init -y`、`npm pkg set type=module`、`npm install --save-exact ...` | 以前は載せていた。いまは 21、22 に差し替え |
| 05 | `ls *.ts`（ファイルを置いたことの確認） | 載せない |
| 06 | `node check-sample.ts` | 載せる |
| 07、08、09 | `node ask.ts` の3つの質問（`strictMcpConfig` を足す前） | 以前は載せていた。いまは 24、25、26 に差し替え |
| 10〜13、14〜17 | 07、08 と同じ質問を4回ずつ（`strictMcpConfig` を足す前） | 載せない（足す前の集計。下の旧表） |
| 18 | `tsc` 7.0.2（`@types/node` 22.20.5、`strict`）での型の確認（足す前） | 載せない。`tsc_exit=0` |
| 19 | `node -v` | 載せない（検証の版の根拠） |
| 20 | `ANTHROPIC_API_KEY` の有無 | 載せない（出力は 02 と同じ `unset`。記事は 02 のまま） |
| 21、22 | `npm init -y`、`npm pkg set type=module`、`npm install --save-exact ...` | 載せる（コマンドは1つのブロック、出力は 22） |
| 23 | `ls *.ts` | 載せない |
| 24 | `node ask.ts "返品できる期間は？"` | 載せる |
| 25 | `node ask.ts "返品した商品の送料は？"` | 載せる |
| 26 | `node ask.ts "返金はいつ？"` | 載せる |
| 27〜30 | 24 と同じ質問を4回 | 載せない（5回の集計に使う） |
| 31〜34 | 25 と同じ質問を4回 | 載せない（5回の集計に使う） |
| 35 | `tsc` 7.0.2（`@types/node` 22.20.5、`strict`）での型の確認 | 載せない。`tsc_exit=0` |

## 5回ずつの集計（記事の「5回ずつ動かすと、10回とも検証を通った」の根拠。`strictMcpConfig: true` あり）

| ログ | 質問 | answerable | 出典（資料の番号: 引用文の数） | 検証 | total_cost_usd |
|---|---|---|---|---|---|
| 24 | 返品できる期間は？ | true | 1: 1文 | OK | 0.0006670999999999999 |
| 27 | 返品できる期間は？ | true | 1: 1文 | OK | 0.00023995 |
| 28 | 返品できる期間は？ | true | 1: 1文 | OK | 0.00009305000000000001 |
| 29 | 返品できる期間は？ | true | 1: 1文 | OK | 0.00024995 |
| 30 | 返品できる期間は？ | true | 1: 1文 | OK | 0.00009305000000000001 |
| 25 | 返品した商品の送料は？ | false | なし | OK | 0.0007195000000000001 |
| 31 | 返品した商品の送料は？ | false | なし | OK | 0.00038051000000000003 |
| 32 | 返品した商品の送料は？ | false | なし | OK | 0.00044601 |
| 33 | 返品した商品の送料は？ | false | なし | OK | 0.00045401 |
| 34 | 返品した商品の送料は？ | false | なし | OK | 0.00044651 |

10件とも `apiKeySource: none`、`tools: StructuredOutput`、`num_turns=2`、終了コード 0。`total_cost_usd` の最小は 28 と 30 の 0.00009305000000000001、最大は 25 の 0.0007195000000000001。記事の本文では浮動小数点の端数を落として 0.00009305 と 0.0007195 と書いた。

### 旧表（`strictMcpConfig` を足す前の 07〜17。記事では使っていない）

| ログ | 質問 | answerable | 出典（資料の番号: 引用文の数） | 検証 | total_cost_usd |
|---|---|---|---|---|---|
| 07 | 返品できる期間は？ | true | 1: 1文 | OK | 0.000315 |
| 10 | 返品できる期間は？ | true | 1: 2文 | OK | 0.00033283 |
| 11 | 返品できる期間は？ | true | 1: 1文 | OK | 0.00031783 |
| 12 | 返品できる期間は？ | true | 1: 1文 | OK | 0.00028383 |
| 13 | 返品できる期間は？ | true | 1: 1文 | OK | 0.00009293 |
| 08 | 返品した商品の送料は？ | false | なし | OK | 0.00055956 |
| 14 | 返品した商品の送料は？ | false | なし | OK | 0.00043289 |
| 15 | 返品した商品の送料は？ | false | なし | OK | 0.00053839 |
| 16 | 返品した商品の送料は？ | false | なし | OK | 0.00045039000000000006 |
| 17 | 返品した商品の送料は？ | false | なし | OK | 0.00052539 |

10件とも `apiKeySource: none`、`tools: StructuredOutput`、`num_turns=2`、終了コード 0。`total_cost_usd` の最小は 13 の 0.00009293、最大は 08 の 0.00055956。

## 記事に載せていない試し実行と、説明できていない観測

`run/` を取る前に、同じコード（`apiKeySource` の行に `tools` を足す前の版）を scratchpad で試した。試し実行のうち1回だけ、「返品した商品の送料は？」で `total_cost_usd=0.567573` が出た（同じ質問の前後の試し実行は 0.0004〜0.0007 の範囲）。そのときは出力を保存しておらず、`modelUsage` も表示していなかったので、どのモデルのどのトークンで増えたかは分からない。直後に `modelUsage` と `usage` を表示する確認用の版で同じ質問を3回動かすと、3回とも `claude-haiku-5-5` だけが使われ、0.00043587〜0.00057737 だった。`run/` の10回にも同じような値は出ていない。原因は未確定のまま残っている（記事では `total_cost_usd` の範囲を `run/` の10回の値だけで書いた）。`strictMcpConfig: true` を足したあとの `run/24.log`、`25.log`、`27.log`〜`34.log` の10回も、0.00009305000000000001〜0.0007195000000000001 の範囲で、同じような値は出ていない。このログだけでは、その1回の原因は確かめられない。
