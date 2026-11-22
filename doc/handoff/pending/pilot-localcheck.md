LOCAL-CHECK（2026-11-14。先頭のコミット 2ee501ce73640ca1fbc63ffc0e851f92aae29002、ブランチ content/81-claude-p-script-first-call。Node.js v24.22.3、`npm ci` のあと）

- `npm run check`: 通過（4手順。typecheck、test は 15 ファイル 168 件すべて成功、build、`secret-scan -- origin/develop` は 8 ファイル検出 0 件）
- `npm run check:samples`: 通過（7手順。samples の test は 11 件と 14 件、どちらも fail 0）
- `node scripts/secret-scan.mjs origin/develop`: 検出 0 件
- `python3 scripts/check-article.py claude-p-script-first-call`: 確定 0 件、候補 0 件（OUTPUT は text 13 件がログに一致、例外 0 件。`[SKIP C25-URL]` は URL だけの値 20 件）
- `ai-smell-lint.py`: `✅ 致命なし`（use 0、mention 0）、`writing-lint.py`: FATAL 0 / DENSITY超過 0 / SHOULD 0
- 実行後に `node_modules`（root と `samples/*`）を削除
