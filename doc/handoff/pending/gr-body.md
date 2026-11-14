Refs #81

## 変えたもの

- `docs/decisions/gate-readings.md`: https://github.com/kouiso/ai-eng-blog/issues/81#issuecomment-6878197474 の裁定8件と、ゲートではない運用の決まり3件（レビューは3回まで、ローカルのチェック、書く AI の提出前チェック4点）を1か所に集めた。各項目に出典のコメントと、根拠のファイルと行を付けた。
- `.claude/skills/write-article/SKILL.md`: 「書く AI と点検する AI」に、この文書への参照を1行（1回目から変更なし）。

1回目のレビューの must 3件（食い違いの解き方、C25、C17）は、コメントの文面どおりに直した。G07 の暫定の扱い（#33 が入るまで `SKILL.md:279` を書いたとおりに適用、手順10の6は実行しない）、G10 の注記（#83 を引く）も反映した。

## チェック

- 2026-11-14、ヘッド 59acb1b（origin/develop をマージ済み）、Node 24.22.3、`npm ci` のあと:
  - `npm run check`: 4手順すべて通過（typecheck 0 errors、test 15 files / 168 tests passed、build complete、secret-scan 2 files / 0 findings）
  - `npm run check:samples`: 7手順すべて通過（項目10のとおり、PR ごとに両方通す）
- `python3 docs/tech-writing-pack/scripts/ai-smell-lint.py docs/decisions/gate-readings.md`: FATAL 0、warn 0
- `.github/workflows/check.yml`（#78）が同じ `npm run check` と `npm run check:samples` を流すことを確かめた。

LOCAL-CHECK: ヘッド 59acb1b、`npm run check` と `npm run check:samples` 通過、secret-scan は origin/develop との差分 2 files を調べて 0 findings。

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01Cv4a6Hqi9gpNzM1cEZDAYQ
