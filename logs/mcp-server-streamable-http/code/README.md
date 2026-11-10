# code: mcp-server-streamable-http

記事 `content/articles/mcp-server-streamable-http.md` に載せたコードと、実行の記録に使った補助のファイル。

## 記事に載せたもの（記事のコードブロックと1文字も違わない。`lint/check-code-and-outputs.py` で確認）

| ファイル | 記事での位置 |
|---|---|
| `package.json` | 手順1（依存のバージョンは `^` なしで固定） |
| `tsconfig.json` | 手順1（`logs/mcp-server-typescript-stdio/code/tsconfig.json` と同じ内容） |
| `src/server.ts` | 手順2 |
| `src/check.ts` | 手順3 |
| `extra/reuse-snippet.ts` | 「トランスポートを使い回すと2回目から 500 になる」の悪い例 |

## 記事に載せていないもの

| ファイル | 用途 |
|---|---|
| `extra/server.reuse.ts`、`extra/reuse.diff` | 悪い例1の全体（`src/server.ts` の `app.post` を `reuse-snippet.ts` に置き換えたもの）と差分。`run/17.log` で作業フォルダに置いた |
| `extra/server.no-405.ts`、`extra/no-405.diff` | 悪い例2の全体（`src/server.ts` から `app.all` のブロックを消したもの）と差分。`run/24.log` |
| `extra/reuse-cause.mjs` | ステートレスのトランスポートが2回目に投げる例外の文言を確かめる（`run/23.log`） |
| `extra/run.sh` | 記事のコマンドを作業フォルダで実行し、`run/<番号>.log` に1回分を書く。絶対パスは `/path/to` に置き換える |
| `extra/stop-server.sh` | バックグラウンドの `npm start` に SIGINT（Ctrl+C と同じ）を送って止める |
| `extra/all-runs.sh` | `run/01.log`〜`34.log` を、空の作業場所で記事の手順の順に取り直す台本 |

`run/35.log`、`36.log`（30回続けて `check.js` を動かした記録）と `run/37.log`、`38.log`（`@types/express` を外したときの `tsc`）は、`all-runs.sh` のあとで `run.sh` を直接呼んで取った。37 と 38 は、別に用意した同じ中身の作業フォルダ（`package.json` と `src/` が `code/` と同じことを `diff` で確認）で実行した。

作業場所は Claude の一時フォルダ（scratchpad）に作り、記録を取り終えたら消した。`node_modules` はリポジトリに入っていない。

この記事の `logs/` は 2026-11-02 にすべて取り直した。同じ slug の途中で止まった以前の作業（2026-10-31、原稿なし）の記録は、このフォルダには残していない。
