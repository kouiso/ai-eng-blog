# コードブロックのコピーのボタン（#28、2026-11-27）

`npm run build` のあと `npx wrangler dev --local --persist-to <スクラッチ> --var EMDASH_SITE_URL:http://localhost:8787` の新しいローカル DB に原稿30本を作って公開し（ローカル DB の中だけ。`docs/verification/local-mcp.md` の手順）、Playwright（Chromium、クリップボードの読み書きを許可）で確かめた。

| ファイル | 何を示すか |
|---|---|
| `code-block-copied-390.png` | 幅 390px。`claude-p-script-first-call` の4つ目のコードブロック（`text`）でボタンを押した直後。ボタンが「コピーしました」に変わる |
| `code-block-copied-1440.png` | 同じ所の幅 1440px |
| `copy-390.webm` | 幅 390px で、ボタンを押す → 「コピーしました」→ 2秒で「コピー」に戻るまでの動画 |

## 結果

- 30本のすべてのコードブロック 592個で、ボタンを押してクリップボードを読み、原稿（`content/articles/*.md`）のフェンスの中身（`scripts/code-blocks.mjs` で取り出した値）と比べた。**592個とも1文字も違わなかった**。どの記事も、原稿のコードブロックの数と、描画された `pre` の数と、見えるボタンの数が同じだった。
- キーボード: ボタンにフォーカスが来て、Enter でも Space でも写せた。押すと `role="status"`・`aria-live="polite"` の要素に「コードをコピーしました」が入る（読み上げに伝わる）。2秒後にボタンの文字が「コピー」に戻った。
- JS を切ったページでは、見えるボタンは0個（押せないボタンを出さない）。
- 幅 390px と 1440px で、ページ全体の横スクロールは無い（scrollWidth が画面の幅と同じ）。
