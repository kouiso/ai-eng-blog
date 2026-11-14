PR body changes (round 3)

1. Replace the sentence about the C17 ending forms. New text: "The seven ending forms are data. Four come from guides/03-anti-ai.md (line 409: ましょう, でしょう, です, ません; line 193: です x3). ます, ました, でした were added on top as the basic polite forms; they are not in the guide."
2. C25: "Skips only a table cell or a frontmatter value that is exactly one URL (ASCII RFC 3986 characters, whole-value match). `URL（英語のページ）` and `URL、URL` are counted. Every other frontmatter string (tags items, main_keyword, target_query, sources fields) is counted. Skipped values are counted per article, and those over 60 chars are listed as `[SKIP C25-URL]` (276 lines: 138 table cells, 138 frontmatter urls; `check-article.py --all | grep SKIP`)."
3. C31: "`―` (U+2015) is no longer counted; the symbols are `—` and `─` (`──` as a run), as in checklist C31."
4. Report: "FAIL lines are no longer cut (201 lines, whole). The report states the commit its numbers come from: 9bf4815982b4437e886b382c5aa71eb826315633."
5. Tests: 149 total (check-article.test.ts 40). New fixtures: c25-url-ja, c25-url-two, c25-fm-tags, c25-fm-tags-block, c25-fm-target, c25-fm-url, c17-mashita.
6. Replace the evidence block with 77-localcheck-c.md (head e30bacb; totals C25 42, C17 141, C30-32 0, OUTPUT 18, C16 97, C26 0, C28 36; 29 of 30 fail).
