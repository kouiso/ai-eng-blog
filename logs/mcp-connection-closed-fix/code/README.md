# code: mcp-connection-closed-fix

記事に載せたコードを、記事に書いた形のまま置いている。

| ファイル | 記事の中での扱い |
|---|---|
| `package.json` | 記事の json ブロックそのまま（版は `^` なしで固定） |
| `server.ts` | 記事の server.ts の全文。原因3では、この中の `await server.connect(new StdioServerTransport());` の1行を消したものを実行した（`extra/run-all.sh` が `grep -v` で作る） |
| `check.ts` | 記事の check.ts の全文（変更前）。起動するコマンドと引数を `node check.ts` の引数から取り、接続してツールの一覧を取る。`run/04.log` で実行 |
| `after/check.ts` | 原因1の「変更後」。`check.ts` の `transport` の1行を、シェルの環境変数を `env` に写す4行と `env` を渡す1行に置き換えただけ。`run/05.log` 以降で実行 |
| `extra/run-all.sh` | 記事の bash のコードブロックを記事の順に実行し、`run/NN.log` に残すスクリプト。Claude Code のコマンドは HOME を使い捨てのフォルダにして実行した |
| `extra/other-errors.mjs` | 記事に載せない確認。コマンドが無いとき、応答が無いときの SDK の文面（`run/15.log`） |
| `extra/tsconfig.typecheck.json` | 記事に載せない確認。TypeScript 7.0.2 で server.ts と check.ts（変更後）の型を確かめる設定（`run/17.log`） |
| `extra/direct-env.ts`、`extra/tsconfig.direct.json` | 記事に載せない確認。変更後の check.ts で `process.env` をそのまま `env` に渡すと型の検査で止まること（`run/17.log`） |
| `extra/other.ts`、`extra/envneed.ts`、`extra/config-server.ts` | 記事に載せない確認。変更後の check.ts を server.ts とは別のサーバーに使う（`run/19.log`）。other.ts はツールが `hello` だけのサーバー、envneed.ts は環境変数 `FOO` が無いと起動時に投げるサーバー、config-server.ts は無い `config.json` を読んで起動時に投げるサーバー |
| `extra/envdump.ts` | 記事に載せない確認。Claude Code がサーバーに渡した環境変数の名前を、シェルの名前と比べる（`run/20.log`。値は出さない） |

実行の仕方: `bash extra/run-all.sh <作業場所の親フォルダ> <run ログの出力先>`。2026-11-10 に Node.js 22.22.0、npm 10.9.4、Claude Code 2.1.322、Linux x86_64 で実行した。作業場所は実行後に消している。

| ログ | 中身 |
|---|---|
| 01 | `node -v`（環境の記録。記事には載せていない） |
| 02〜12 | 記事の bash のブロック10個（11 と 12 は initialize のブロックを直す前と後に実行したもの） |
| 13 | Claude Code が `export` した変数をサーバーに渡すか |
| 14 | `claude mcp` の add、list、remove がネットワークなし、環境変数 PATH と HOME だけで動くか |
| 15、16 | Connection closed 以外の文面（SDK、Claude Code） |
| 17 | 型の確認（変更後の check.ts は通る、`process.env` をそのまま渡すと止まる） |
| 18 | `npm install --no-save` のあとも package.json が記事のままか |
| 19 | 変更後の check.ts を別のサーバーに使う（`node other.ts --flag`、`sh -c "exec node other.ts x"`、`FOO=1` で envneed.ts、config-server.ts） |
| 20 | Claude Code がサーバーに渡した環境変数の名前とシェルの名前の差 |
