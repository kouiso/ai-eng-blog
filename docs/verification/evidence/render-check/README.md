# 原稿30本の描画の確認（render-check、2026-11-27）

`npm run build` のあと `npx wrangler dev --local --var EMDASH_SITE_URL:http://localhost:8787` の新しいローカル DB に、develop（835426e）の原稿30本を `scripts/render-check.mjs --all` で作って描画した。手順は `docs/verification/local-mcp.md` の「予約の前の描画の確認」。画像は Playwright（Chromium、deviceScaleFactor 1）で撮った表の部分。

| ファイル | 何を示すか |
|---|---|
| `pilot-sources-table-1440.png` | 試しの1本（`claude-p-script-first-call`）の出典の表、幅 1440px。表として出て、番号と確認日は1行、URL のセルはリンク |
| `pilot-sources-table-390.png` | 同じ表、幅 390px |
| `mixed-date-table-1440.png` | `mcp-server-resources-prompts` の出典の表、幅 1440px。題名の中の日付（`2025-11-25`）が途中で折れない（#75） |
| `mixed-date-table-390.png` | 同じ表、幅 390px（上から 1800px まで）。日付は1行のまま、URL の列だけが折れる |

## 数えた結果（30本、幅 1440px と 390px の両方）

- `render-check --all`: 30本とも `[OK]`。表は原稿69・描画69、コードを含むセル151、記号の残り0、URL だけのセル334がすべて別タブで開くリンク
- 番号・日付・バージョンだけのセル751個が、どれも1行で出た（折れたセル0）
- 文と混ざったセルの中の日付・数字の並び28個が、どれも1行で出た。包まれていない並びは0
- ページ全体の横スクロールは0本（scrollWidth が画面の幅と同じ）
