# code/

記事 `content/articles/mcp-server-resources-prompts.md` に載せたコードを、記事の形のまま置いています。

| ファイル | 記事の中の位置 |
|---|---|
| `package.json` | 「1. 準備は package.json と npm install の2つ」 |
| `server.ts` | 「2. Resource は URI を決めて registerResource で登録する」 |
| `check.ts` | 「4. SDK のクライアントで一覧と取得を確かめる」 |

記事と1文字も違わないことは `../lint/check-code-and-outputs.py` で確かめています（結果は `../lint/check-code-and-outputs.txt`、ALL OK）。`node_modules` はルートの `.gitignore` で除外されるので、ここには置いていません。

`extra/` は記事に載せない確認用です。

- `run-all.sh`: 作業場所に記事どおり `writing-helper-mcp` フォルダを作り、上の3ファイルを置いて、記事の bash のコードブロックを1つずつそのまま `bash -c` で実行し、`../run/01.log`〜`04.log` と `09.log` を書きます。05〜08、10、11 は本文の文の根拠にした確認です。作業場所の絶対パスは `/path/to`、ホームフォルダは `~` に置き換えてから保存します。作業場所にはセッションの一時フォルダを使い、終わったら消しました。
- `make-variants.py`: 記事の `server.ts` から、1か所だけ変えた版を3つ作ります。普通の `Error` を投げる版（`../run/05.log`）、用語の表を普通のオブジェクトにした版（`../run/06.log`）、`ResourceTemplate` の `list` を `undefined` にした版（`../run/08.log`）です。置き換える文字列が見つからなければ止まります。
- `probe.ts`: 指定したサーバーのファイルを起動し、URI を1つずつ読んで結果かエラーを表示します（`../run/05.log`〜`07.log`）。
- `list-only.ts`: 指定したサーバーのファイルを起動し、`resources/list` と `resources/templates/list` の URI だけを表示します（`../run/08.log`）。
- `tsconfig.typecheck.json`: `server.ts` と `check.ts` の型を TypeScript 7.0.2 で確かめる設定です（`../run/11.log`）。Node.js は型を検査せずに `.ts` を実行するので、別に確かめました。

| ログ | 中身 |
|---|---|
| `01.log` | `node -v`（記事） |
| `02.log` | 作業フォルダを作る（記事） |
| `03.log` | `npm install`（記事） |
| `04.log` | `node check.ts`（記事） |
| `05.log` | 普通の `Error` を投げた版で表に無い用語を読む（`-32603`） |
| `06.log` | 表を普通のオブジェクトにした版で `constructor` を読む（クライアントの検証エラー） |
| `07.log` | 記事の `Map` の版で `constructor` を読む（`-32002`） |
| `08.log` | `list: undefined` の版の一覧 |
| `09.log` | Inspector 2.13.0 の CLI で `resources/read`（記事） |
| `10.log` | Inspector 2.13.0 の CLI で `prompts/get`（`text` だけを渡す） |
| `11.log` | TypeScript 7.0.2 での型の確認 |
