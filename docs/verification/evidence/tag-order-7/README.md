# 講座のタグページの並びを、記事を入れた状態で確かめる（#7、2026-11-27）

`npm run build` のあと `npx wrangler dev --local --persist-to <スクラッチ> --var EMDASH_SITE_URL:http://localhost:8788` の新しいローカル DB に、原稿30本を slug の abc 順に作って公開した（ローカル DB の中だけ。`docs/verification/local-mcp.md` の手順）。公開日の順は abc 順で、講座の順番とは違う。Playwright（Chromium、deviceScaleFactor 1）で講座の6語のタグページを幅 390px と 1440px で開いた。

| ファイル | 何を示すか |
|---|---|
| `tag-llm-api-390.png` | `/tag/llm-api` の幅 390px（ページ全体）。番号 01〜05 が講座の順番で付き、ページ送りは出ない |
| `tag-llm-api-1440.png` | 同じページの幅 1440px |

画像は llm-api の2枚だけを置いた。ほかの5語は下の表の並びを Playwright で読んだ値で確かめた。

## 並び（6語 × 2つの幅、12回とも同じ並び。どれも HTTP 200、ページ送り無し、横スクロール無し）

| タグ | 画面の並び（番号: slug） | `src/utils/course.ts` の順番 | 公開日の順（abc 順） |
|---|---|---|---|
| llm-api | 01 claude-p-script-first-call、02 claude-agent-sdk-streaming、03 llm-api-cost-estimate-js-tiktoken、04 llm-api-429-retry-sdk-mock、05 claude-code-api-key-billing-auth | 同じ | claude-agent-sdk-streaming が最初、claude-p-script-first-call は3番目 |
| structured-output | 01 claude-agent-sdk-structured-output、02 zod-validate-llm-json-output、03 zod-to-json-schema-tool-definition、04 llm-json-parse-error-fix、05 structured-output-methods-compare | 同じ | |
| rag | 01 rag-bm25-search-typescript、02 rag-chunking-japanese-text、03 rag-local-embeddings-transformers-js、04 rag-answer-with-citations-claude、05 rag-hybrid-search-rrf、06 rag-retrieval-eval-recall-mrr | 01〜05 は同じ。06 は rag の計画に無い（llm-eval の3番）記事で、末尾に出る | |
| ai-agent | 01 ai-agent-custom-tools-agent-sdk、02 claude-agent-sdk-first-agent、03 ai-agent-max-turns-budget-limit、04 ai-agent-safe-file-tool、05 ai-agent-vs-workflow | 同じ | |
| mcp-server | 01 mcp-server-typescript-stdio、02 mcp-server-streamable-http、03 mcp-inspector-debug、04 mcp-server-resources-prompts、05 mcp-connection-closed-fix | 同じ | |
| llm-eval | 01 llm-eval-harness-fixtures、02 llm-as-a-judge-claude、03 rag-retrieval-eval-recall-mrr、04 promptfoo-llm-eval-intro、05 llm-eval-dataset-from-logs | 同じ | |

講座のタグで 100 本を超えたときの「次へ」を出さないことと警告は、記事が30本しか無いので画面では試せない。`test/course-tag-order.test.ts` の `tagPager` の試験で確かめている。
