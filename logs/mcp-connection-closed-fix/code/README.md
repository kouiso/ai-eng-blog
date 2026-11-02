# code: mcp-connection-closed-fix

記事に載せたコードを、記事に書いた形のまま置いている。

| ファイル | 記事の中での扱い |
|---|---|
| `package.json` | 記事の json ブロックそのまま（版は `^` なしで固定） |
| `server.ts` | 記事の server.ts の全文。原因3では、この中の `await server.connect(new StdioServerTransport());` の1行を消したものを実行した（`extra/run-all.sh` が `grep -v` で作る） |
| `check.ts` | 記事の check.ts の全文（変更前）。`run/04.log` で実行 |
| `after/check.ts` | 原因1の「変更後」。`check.ts` に `env` の1行を足しただけ。`run/05.log` 以降で実行 |
| `extra/run-all.sh` | 記事の bash のコードブロックを記事の順に実行し、`run/NN.log` に残すスクリプト。Claude Code のコマンドは HOME を使い捨てのフォルダにして実行した |
| `extra/other-errors.mjs` | 記事に載せない確認。コマンドが無いとき、応答が無いときの SDK の文面（`run/14.log`） |
| `extra/tsconfig.typecheck.json` | 記事に載せない確認。TypeScript 7.0.2 で server.ts と check.ts（変更後）の型を確かめる設定（`run/16.log`） |

実行の仕方: `bash extra/run-all.sh <作業場所の親フォルダ> <run ログの出力先>`。2026-11-02 に Node.js 22.22.0、npm 10.9.4、Claude Code 2.1.316、Linux x86_64 で実行した。作業場所は実行後に消している。

| ログ | 中身 |
|---|---|
| 01 | `node -v`（環境の記録。記事には載せていない） |
| 02〜11 | 記事の bash のブロック9個（10 と 11 は initialize のブロックを直す前と後に実行したもの） |
| 12 | Claude Code が `export` した変数をサーバーに渡すか |
| 13 | `claude mcp` の add、list、remove がネットワークなし、環境変数 PATH と HOME だけで動くか |
| 14、15 | Connection closed 以外の文面（SDK、Claude Code） |
| 16 | 型の確認 |
| 17 | `npm install --no-save` のあとも package.json が記事のままか |
