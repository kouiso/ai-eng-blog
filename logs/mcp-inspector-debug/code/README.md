# code/

記事 `content/articles/mcp-inspector-debug.md` に載せたコードを、記事の形のまま置いています。

| ファイル | 記事の中の位置 |
|---|---|
| `package.json` | 「1. 調べるサーバーは server.ts の1ファイル」 |
| `server.ts` | 同上 |

記事と1文字も違わないことは `../lint/check-code-and-outputs.py` で確かめています（結果は `../lint/check-code-and-outputs.txt`、ALL OK）。`node_modules` はルートの `.gitignore` で除外されるので、ここには置いていません。

`extra/` は記事に載せない確認用です。

- `run-all.sh`: 作業場所に記事どおり `inspector-demo` フォルダを作り、上の2ファイルを置いて、記事の bash のコードブロックを1つずつそのまま `bash -c` で実行し、`../run/01.log`〜`11.log` を書きます。画面のコマンド（11）は、端末と同じくプロセスグループごと起動し、`extra/web-ui-check.mjs` で画面を操作してから（12）、Ctrl+C と同じ SIGINT で止めます。13 は型の確認、14 は `--method` を省いたときの確認です。作業場所の絶対パスは `/path/to`、ホームフォルダは `~`、Inspector の API トークン（64桁の16進）は `***` に置き換えてから保存します。作業場所にはセッションの一時フォルダを使い、終わったら消しました。11 で Inspector が作る `~/.mcp-inspector` は、実行前に無かったことを確かめたうえで消しています（`../run/11.log` の note）。
- `web-ui-check.mjs`: 記事の「5. 画面で調べるときは --cli を外して起動する」の操作を、ヘッドレスの Chromium（Playwright 1.63.0）で記事と同じ順に行い、画面に出た文字をアクセシビリティツリーの形で `../run/12.log` に書きます。トークンは起動時の出力から読み、ログには書きません。
- `tsconfig.typecheck.json`: `server.ts` の型を TypeScript 7.0.2 で確かめる設定です（`../run/13.log`）。Node.js は型を検査せずに `.ts` を実行するので、別に確かめました。
