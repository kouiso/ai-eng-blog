LOCAL-CHECK | head e30bacb220bd9387b96deda292ccd36d8214b522 (numbers produced on 9bf4815982b4437e886b382c5aa71eb826315633, the parent; e30bacb changes only docs/verification/check-article-report.md) | Node v24.22.3 | 2026-11-14T13:10Z

- `npm test`: exit 0, 11 files, 149 tests passed (33 -> 40 in test/check-article.test.ts)
- `npm run typecheck`: exit 0, 0 errors
- `python3 scripts/check-article.py --all`: exit 1 (by design). 29 of 30 articles fail >=1 hard check (only rag-local-embeddings-transformers-js passes). C25 42, C17 141, C30-32 0, OUTPUT 18; candidates C16 97, C26 0, C28 36. Same totals as round 2.
- `[SKIP C25-URL]`: 276 lines over 60 chars (138 table cells + 138 frontmatter url values); 668 URL-only values skipped in all (334 + 334).
- `node scripts/secret-scan.mjs origin/develop`: 56 files, 0 findings
- Rulings kept: C25 skips only a value that is exactly one URL (ASCII RFC 3986 characters, whole-value match); C30-32 exclude inline code; C17 follows the pack lint; PR may merge with most articles failing.
