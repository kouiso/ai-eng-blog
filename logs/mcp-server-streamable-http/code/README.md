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
| `extra/more-runs.sh` | `all-runs.sh` に続けて `run/35.log`〜`50.log` を取る台本。手順3のクライアントを30回（35、36）、`@types/express` を外す・戻す型チェック（37、38）、悪い例2のまま30回（39〜43）、ブラウザのプリフライトを curl でまねる確認（44〜50） |
| `extra/server.cors-check.ts`、`extra/cors.diff` | ブラウザからの呼び出しの確認に使った変種（`src/server.ts` の `ALLOWED_ORIGINS` を `["http://localhost:5173"]` にしただけ）と差分。`run/44.log` |

2026-11-10 の取り直しでは、作業場所に `code/` を写し、`extra/run.sh` のログの書き先だけを作業場所の `run/` に変えて `all-runs.sh` と `more-runs.sh` を続けて実行した。できた50本のログを、そのままこのフォルダの `run/` に写した（`run.sh` の書き先の行のほかは、ここにある台本と同じ）。`@types/express` の確認（37、38）は、同じ中身（`package.json`、`tsconfig.json`、`src/` を `code/` から写したもの）の別の作業フォルダ `char-count-http-notypes` で行った。

作業場所は Claude の一時フォルダ（scratchpad）に作り、記録を取り終えたら消した。`node_modules` はリポジトリに入っていない。

この記事の `run/` は 2026-11-02 にすべて取り直し、2026-11-10 にもう一度すべて取り直した（2026-11-02 の版はコミット `29c1a8e` にある）。同じ slug の途中で止まった以前の作業（2026-10-31、原稿なし）の記録は、このフォルダには残していない。
