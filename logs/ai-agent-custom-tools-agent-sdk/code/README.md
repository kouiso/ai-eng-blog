# code: ai-agent-custom-tools-agent-sdk

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `shop-agent.ts` | 記事のコード（`shop-agent.ts`）。記事のコードブロックと1文字も違わないことを `lint/check-code-and-outputs.txt` で確かめた |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`、`npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 zod@4.6.7`）でできたものを写した。依存は `^` なし |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `run/NN.log` に残すスクリプト（記事には載せない） |
| `extra/redact-mcp-tools.py` | `run/09.log`、`run/11.log`、`run/12.log` の出力から、`mcp__shop__` 以外の MCP ツール名を消して件数だけを残すフィルター（記事には載せない） |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/10.log`。記事には載せない） |

実行は 2026-11-11、macOS arm64、Node.js 22.23.4。作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` はここに置いていない。

モデルを呼ぶ `run/06.log`〜`09.log`、`11.log`、`12.log` は、オーナー自身の Claude プランでログイン済みの環境で動かした（`ANTHROPIC_API_KEY` は unset、init の `apiKeySource` は `"none"`）。ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない（コードがそれらを表示しない）。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>`、このフォルダは `<code>` に置き換えた。

| ログ | 中身 |
|---|---|
| `run/01.log`〜`05.log` | `node -v`、`ANTHROPIC_API_KEY` の確認、`npm init` と `npm pkg set`、`npm install`、`npm pkg get` |
| `run/06.log` | `node shop-agent.ts`。記事に載せた実行結果 |
| `run/07.log` | 同じコードの2回目。記事の「2回目も、呼ぶ順番と回数は同じだった」の根拠 |
| `run/08.log` | `tools: []` の行だけを消した `shop-agent-builtins.ts`（`diff` の出力つき）。組み込みのツールが25個並び、最初に ToolSearch を呼んだ |
| `run/09.log` | `strictMcpConfig: true` の行だけを消した `shop-agent-no-strict.ts`（`diff` の出力つき）。`redact-mcp-tools.py` を通した。ほかの MCP ツールは0個 |
| `run/10.log` | `tsc 7.0.2`（`@types/node 22.20.5`、`strict`）での型の確認。`tsc_exit=0` |
| `run/11.log` | 試作の1回目（`run/01`〜`10` より前）。`strictMcpConfig` の行が無く、prompt の末尾と result の表示が記事の版と違う（ヘッダーに差分を書いた）。実行時の出力を `redact-mcp-tools.py` に通して保存した。claude.ai のコネクタのツールが756個並んだ。時刻は記録していない |
| `run/12.log` | `shop-agent-no-strict.ts` を3回続けて動かし、init の行だけを残したもの。3回ともほかの MCP ツールは0個 |
| `run/13.log` | `npm view` で peerDependencies の zod（`^4.0.0`）と、確認時点の最新版を見たもの。モデルは呼んでいない。手動で保存した |

`run/11.log`、`run/12.log`、`run/13.log` は `run-all.sh` で作っていない（`run-all.sh` の `log_run` は 01〜10 まで）。`run/11.log` は試作の実行を手で動かしたときの出力（コネクタのツール名を含む）を、フィルターに通してから保存した。フィルターを通す前の出力はリポジトリに置いていない。
