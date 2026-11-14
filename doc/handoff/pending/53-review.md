REVIEW | reviewer: general-purpose subagent, Opus 5.5 medium | authored no commit on this PR | head cde8378d7970bff3de28ab4cb4b290295e62b6f2 | axes: pass line, design, scope, tests, body vs diff, evidence | verdict PASS | must 0 want 2 nit 3

This is round 3 of 3. I judged it against the product manager's ruling for #53:
- **Failure:** a break inside a number, a date, or a Latin word or identifier that would fit in its column.
- **Moved to #75, not a failure here:** a date inside a cell that also has other text, breaking at a hyphen.
- **Acceptable:** identifiers, package names and paths breaking after `-` or `/`; Japanese text wrapping between characters; long URLs wrapping.

What I looked at:
- The PR body, all comments, both earlier reviews (BLOCK on 8acf702, FAIL on e8988e7), #26, #75 and #76.
- `git diff origin/develop...cde8378`: 3 files. The merge commit 56a73a8 only brings in develop.
- In `node_modules`: `emdash/src/components/Table.astro:131`, where a cell gets `style="text-align: …"` only when `cell.textAlign` is set, and `normalizeAlignment` in `@emdash-cms/admin/dist/portable-text-table.js:351`, which keeps only left / center / right / justify.
- Evidence: `53-cde8378.png`, `53-cde8378-full-mcp-server-resources-prompts-{390,1440}.png`, the 390 crops, and `measure-cde8378.json`, which lists every non-URL ASCII token that spans more than one line, on 3 articles at both widths.
- I re-ran `npm test`.

## Earlier musts, checked on this head

- **FAIL must 1 (Latin words break although they fit): fixed.** `td` now uses `overflow-wrap: normal` (`src/pages/posts/[slug].astro:423-426`). Only `td a` and the URL marker get `anywhere` (:407-411).
  - At 1440, `measure-cde8378.json` lists no non-URL breaks on two of the three articles. On the third, the only one is `install-metadata.js`, which breaks after the hyphen.
  - At 390, the only non-URL breaks are:
    - `error-e1020`, after the hyphen
    - `Xenova/multilingual-e5-small` and `src/pipelines/feature-extraction.js`, after `-` or `/`
    - `2025-11-25` and `2026-07-28`, inside title cells such as "MCP Specification 2025-11-25 Server Features Overview" (crop `390-t2-start`). These belong to #75.
  - Every one is allowed by the ruling. The earlier examples (`Elasticsea/rch`, `@modelcontextprotocol/sd/k`, `Array.prototype.findInd/ex()`) are gone.
- **FAIL must 2 (crops instead of full pages): fixed.**
  - Full-page 390 and 1440 captures of the article with the sources table are pushed to `notes/ai-eng-blog`: `evidence/53-cde8378-full-mcp-server-resources-prompts-390.png` (780×47536) and `evidence/53-cde8378-full-mcp-server-resources-prompts-1440.png` (2880×28542).
  - The composite `53-cde8378.png` shows the head inside the image and includes the 390 table scrolled to its end.
- **BLOCK on 8acf702: still holds.**
  - At 1440, every table is 670/670 in its container.
  - At 390, the page is 390/390 on all 3 articles, so there is no page-level horizontal scroll.
  - The sources tables scroll inside themselves (417–425 / 384) and inside the wrapper (384 / 316). ENDCHECK reports `fullyVisible: true` for the 確認日 column on all 3, so nothing is cut.
- **FAIL want 3 (selector too broad):** narrowed to `text-align: left`. See want 1 for what is left.
- **FAIL want 4 and want 5 (body):** addressed. The body explains the typecheck history and describes the residuals in line with the ruling.
- **FAIL nit 6:** addressed. `NUMERIC_CELL` now accepts `[v^~]?`, and a test covers it.

## Judge items from the ruling

- **The URL marker works in the served HTML: yes, shown indirectly.** I could not fetch the HTML myself, because the local server was no longer running. These facts show the marker reaches the page:
  - `td` is `overflow-wrap: normal`.
  - The sources-table URLs are plain text, not `<a>`.
  - The only selector that can give them `anywhere` is `td[style*="text-align: justify"]`.
  - At 390 those URLs break every ~8 characters, in the middle of segments between slashes (for example `/speci` / `ficatio` / `n/202`). That can only happen if `style="text-align: justify;"` is on the cell in the server-rendered HTML. No client script touches these cells.
  - The body's counts (18 justify, 38 left) agree with this.
- **The numeric selector matches only the code's marker: almost.** It no longer matches center or right. It still matches a cell where the author chose `left`. See want 1.
- **Tests prove fail-before and pass-after: yes.**
  - `npm test`: 11 files, 115 passed.
  - Before: on develop, `test/table-cell.test.ts` fails because `src/utils/table-cell.ts` does not exist.
  - I also changed the URL marker to `"start"`, the kind of value the normalizer drops. 3 of the 6 tests failed, including "left と justify が描画前に残る", which runs EmDash's real `normalizePortableTextTable`. After I restored the file, all 6 passed. So that test does guard the marker surviving EmDash's normalizer.
- **No page-level overflow at 390, and tables scroll with nothing cut: yes.** See the BLOCK item above.
- **URL column ~8 characters wide at 390, with very tall rows (URLs over 6–20 lines):** under the ruling, URL wrapping is acceptable, so this is not a failure for this PR. It is a readability problem. Carry it to #76 as a want (want 2).

## want

1. **want, design and body vs diff: the selectors also match alignment an author set.** `src/pages/posts/[slug].astro:409` and `:429`.
   - `td[style*="text-align: left"]` also matches a cell where the author chose "left" in the editor. EmDash's table editor does offer left/center/right/justify, so a long text cell aligned left by the author gets `nowrap` and widens the table. The table then scrolls inside its wrapper, so nothing breaks or is cut.
   - In the same way, `td[style*="text-align: justify"]` gives `overflow-wrap: anywhere` to a cell the author justified. Latin words in such a cell could break mid-word.
   - The code cannot tell its own marker from an author's choice: EmDash keeps only these four values, and cells cannot carry a class. No current article has author-set alignment, so this is not a defect today.
   - **Fix:** say it in the body's 残っていること section, for example "作者が left / justify を付けたセルも同じ扱いになる". Revisit it when #76 turns URL cells into links, because the `td a` rule then makes the justify marker unnecessary.
2. **want, carry to #76: URL column readability at 390.**
   - The URL column shrinks to its 8ch `min-width` (:424), because `anywhere` reduces the URLs' min-content width to almost nothing. The 題名 column takes the remaining width.
   - When #76 renders URL cells as links, give URL cells or `td a` a larger floor (for example `min-width: 16ch`; the table already scrolls inside its wrapper), and re-shoot at 390.
   - The body describes the symptom but does not name #76. Add "#76 で扱う" to that line.

## nit

3. **nit, evidence:** the two full-page captures show the head only in their file names. The page itself reads "local check". The composite image shows the head inside the image, which is enough. The pending LOCAL-CHECK links the 390 full page but not the 1440 one. Link both.
4. **nit, body vs diff:** the body does not mention `td { min-width: 8ch }` (:424). That rule is what sets the URL column width in want 2.
5. **nit, code:** in `src/utils/table-cell.ts`, line 21 is a blank line inside the JSDoc block, without the leading ` *`. The function name `markNumericTableCells` no longer matches what it does, since it now marks URL cells too. A name such as `markTableCellsForWrap` would fit.

## 0件 axes

- **Pass line:** 0件.
  - Under the ruling, no number, date-only cell, or Latin word or identifier breaks where it would fit.
  - `package.json` and `package-lock.json` have no changes, so there are no dependency bumps.
  - No secrets. The LOCAL-CHECK secret-scan reports 3 files and 0 findings.
  - build, typecheck (0 errors), test (115/115) and `wrangler deploy --dry-run` all exit 0, according to `localcheck.txt`. I re-ran `npm test` myself.
  - This PR has no GitHub CI checks, only CodeRabbit (neutral).
- **Scope:** 0件. The PR changes only the table CSS in `[slug].astro`, the new `table-cell.ts` and its test. All of that is within #26. The merge commit brings in develop only.
- **Tests:** 0件. See the fail-before and pass-after check above. The CSS has no unit test; screenshots and measurements cover it.
- **Body vs diff:** apart from wants 1 and 2 and nit 4, the body matches the diff.
  - `Closes #26` and `Refs #9` are present.
  - The residuals (#75 dates, hyphen and slash breaks, tall URL rows, script-made table blocks) are stated, as a partial-fix merge requires.

---
_Generated by [Claude Code](https://claude.ai/code)_
