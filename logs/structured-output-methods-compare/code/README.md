# code: structured-output-methods-compare

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `cases.ts` | 共通の部分。zod のスキーマ、システムプロンプト、10件の問い合わせと正解 |
| `common.ts` | 共通の部分。3つのやり方が同じオプションで `query()` を呼ぶための `run()` |
| `a-prompt.ts` | (a) プロンプト指示と `JSON.parse` |
| `b-tool.ts` | (b) 自作ツール（`tool()` と `createSdkMcpServer()`） |
| `c-output-format.ts` | (c) `outputFormat` |
| `compare.ts` | 3つのやり方を10件ずつ動かして数える |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`、`npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 zod@4.6.7`）でできたものを写した。依存は `^` なし |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `run/NN.log` に残すスクリプト（記事には載せない） |
| `extra/b-tool-no-strict.ts` | `strictMcpConfig` を外したときの (b) を3件動かす確認用（`run/08.log`。記事には載せず、本文の数字の根拠） |
| `extra/c-no-target.ts` | `z.toJSONSchema` に `target` を渡さないときのエラーを見る確認用（`run/09.log`。記事には載せず、本文の「起動の時点で例外を投げた」の根拠） |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/10.log`。記事には載せない） |

作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` はここに置いていない。

モデルを呼ぶ実行（`run/06.log`、`08.log`、`09.log`、`11.log`）は、オーナー自身の Claude プランでログイン済みの環境で動かした（`ANTHROPIC_API_KEY` は unset、init の `apiKeySource` が `"none"` だと確かめられているのは `run/06.log` と `run/11.log` だけ。`08.log` と `09.log` は `apiKeySource` を出力していない）。ログにはアカウント名、メールアドレス、セッションの ID、認証情報を出していない（コードがそれらを表示しない）。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>`、ホームフォルダは `~` に置き換えた。

`run/11.log` は `compare.ts` の2回目の実行で、記事の「2回目」の数字の根拠。
