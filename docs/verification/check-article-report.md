# check-article.py を30本に通した結果（issue #42）

`python3 scripts/check-article.py --all` の結果です。数字は、スクリプトと試験を入れたコミット 9bf4815982b4437e886b382c5aa71eb826315633 で出しました。この報告を足すコミットは、その子で、この報告のファイルだけを変えます（つまり、この報告を足すコミットの親で出した結果です）。各記事の `logs/<slug>/lint/` にある自前のスクリプトと並べています。
スクリプトは30本が通るように調整していません。出た結果をそのまま載せます。記事の直しと、出力ブロックの例外の登録（`scripts/check-article-exceptions.json`、今は空）は、この PR の範囲に入れていません（#44 以降）。

自前の列は、各記事の `prose-check.py` を実行した出力から読んだ件数です（書式が記事ごとに違うので、読み取れなかったところは `-`）。自前の `check-code-and-outputs.py` は30本とも OK で、終了コードは 0 でした。

| 記事 | C25 自前 | C25 新 | C17 自前 | C17 新 | C30-32 新 | OUTPUT 新 | C16 候補 | C26 候補 | C28 候補 |
|---|---|---|---|---|---|---|---|---|---|
| ai-agent-custom-tools-agent-sdk | 0 | 1 | 0 | 7 | 0 | 1 | 2 | 0 | 0 |
| ai-agent-max-turns-budget-limit | 0 | 2 | 0 | 0 | 0 | 0 | 4 | 0 | 0 |
| ai-agent-safe-file-tool | 1 | 2 | 0 | 1 | 0 | 1 | 3 | 0 | 0 |
| ai-agent-vs-workflow | 0 | 1 | 0 | 6 | 0 | 0 | 3 | 0 | 2 |
| claude-agent-sdk-first-agent | 1 | 2 | 0 | 6 | 0 | 0 | 1 | 0 | 3 |
| claude-agent-sdk-streaming | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| claude-agent-sdk-structured-output | 1 | 2 | 0 | 6 | 0 | 0 | 2 | 0 | 2 |
| claude-code-api-key-billing-auth | 0 | 2 | 0 | 2 | 0 | 0 | 3 | 0 | 0 |
| claude-p-script-first-call | 0 | 1 | 0 | 10 | 0 | 0 | 1 | 0 | 0 |
| llm-api-429-retry-sdk-mock | 1 | 1 | 0 | 9 | 0 | 1 | 2 | 0 | 1 |
| llm-api-cost-estimate-js-tiktoken | 0 | 0 | 0 | 0 | 0 | 1 | 5 | 0 | 0 |
| llm-as-a-judge-claude | 0 | 2 | 0 | 2 | 0 | 0 | 3 | 0 | 1 |
| llm-eval-dataset-from-logs | 0 | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 1 |
| llm-eval-harness-fixtures | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 0 | 0 |
| llm-json-parse-error-fix | 0 | 1 | 0 | 0 | 0 | 0 | 4 | 0 | 0 |
| mcp-connection-closed-fix | 0 | 1 | 0 | 0 | 0 | 1 | 6 | 0 | 0 |
| mcp-inspector-debug | 0 | 2 | 0 | 0 | 0 | 1 | 4 | 0 | 0 |
| mcp-server-resources-prompts | 0 | 2 | 0 | 0 | 0 | 1 | 6 | 0 | 0 |
| mcp-server-streamable-http | 0 | 0 | 0 | 15 | 0 | 4 | 8 | 0 | 4 |
| mcp-server-typescript-stdio | 1 | 1 | 0 | 11 | 0 | 2 | 5 | 0 | 0 |
| promptfoo-llm-eval-intro | 0 | 1 | - | 6 | 0 | 0 | 0 | 0 | 1 |
| rag-answer-with-citations-claude | 0 | 1 | 0 | 3 | 0 | 0 | 2 | 0 | 0 |
| rag-bm25-search-typescript | 1 | 2 | 0 | 8 | 0 | 2 | 1 | 0 | 1 |
| rag-chunking-japanese-text | 1 | 1 | 0 | 7 | 0 | 0 | 4 | 0 | 1 |
| rag-hybrid-search-rrf | 0 | 2 | 0 | 6 | 0 | 1 | 6 | 0 | 1 |
| rag-local-embeddings-transformers-js | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 |
| rag-retrieval-eval-recall-mrr | 0 | 0 | 0 | 5 | 0 | 0 | 5 | 0 | 5 |
| structured-output-methods-compare | 0 | 2 | 0 | 10 | 0 | 0 | 2 | 0 | 10 |
| zod-to-json-schema-tool-definition | 2 | 3 | 0 | 10 | 0 | 1 | 4 | 0 | 1 |
| zod-validate-llm-json-output | 3 | 3 | 0 | 10 | 0 | 0 | 3 | 0 | 2 |
| 合計 | | 42 | | 141 | 0 | 18 | 97 | 0 | 36 |

確定の検査に1件以上落ちた記事は 29 本、落ちなかった記事は 1 本（rag-local-embeddings-transformers-js）です。C17 に落ちた記事は 21 本です。終了コードは 1 です。

## 検査の読み方

- C17: 並びに入れる文は、地の文と箇条書きの文です。見出しと表のセルは並びに入れません。語尾は2通りで見ます。末尾3字の一致と、文末の形の一致です。形（でしょう、ましょう、ません、ました、でした、です、ます）はそれぞれ別の語尾で、「です」「ます」「ました」が混ざる並びは同じ語尾と数えません。形はデータです。guides/03-anti-ai.md の409行（ましょう、でしょう、です、ません）と193行（です の3連続）に載っている形に、ます、ました、でした を足しました。この3つはガイドの行にはなく、丁寧体の基本形として足したものです（7つのうち4つがガイドの行、3つが追加）。重なる窓は1つの区間にまとめます。
- C25: 地の文、箇条書き、見出し、表の中の文、インラインコード（1字ずつ）、frontmatter の文字列の値（tags などの一覧の要素、main_keyword、target_query、sources の title など、引用符つきの値すべて）を数えます。数えないのは、表のセルの中身、または frontmatter の値が、ちょうど URL 1つ（URL に使える ASCII の文字だけで、全体が URL）のものです（文ではなく、URL は句読点で切れません。出典の表と sources の url に URL を置く規約があります）。URL と語が混じるもの（「URL（英語のページ）」「URL、URL」）は全体を数えます。数えなかったものの件数は記事ごとに出します（30本で 668 件。表のセルと frontmatter の値で 334 件ずつ）。60字を超えるものは `[SKIP C25-URL]` として行番号つきで一覧に出します（表のセル 138 件、frontmatter の url 138 件、計 276 件）。一覧は `python3 scripts/check-article.py --all | grep SKIP` で出ます。この報告の下の一覧には入れていません（`[FAIL` の行だけです）。
- C30 から C32: コードブロックとインラインコードの中の記号は数えません（guides/03-anti-ai.md 372行「コードは原文のままが正しい」）。C31 の記号は checklist C31 に合わせて `—` と `─`（`──` は連続）だけで、`―`（U+2015）は数えません。
- OUTPUT: 記事の ```text ブロックすべてを run ログの出力部分と照合します。promptfoo の記事の古い書式のログ（`$ コマンド` と、`----` だけの行が2本で囲んだ出力）は、書式が一意に決まるので読めるようにしました（ログ自体は触っていません）。ファイル構成の図と数式のように実行の出力ではない text ブロックは失敗として出ます。例外に載せるかどうかは #44 で決めます。

## 新しいスクリプトで落ちた箇所（確定）

`python3 scripts/check-article.py --all` の `[FAIL ...]` の行を、出力の順のまま、1行も切らずに載せます（201 行）。

```text
[FAIL C25] ai-agent-custom-tools-agent-sdk.md:10 136字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、zod 4.6.7、macOS arm64（型の確認は TypeScript 7.0.2）
[FAIL C17] ai-agent-custom-tools-agent-sdk.md:52-52 語尾「ます」が3文連続（1窓）
[FAIL C17] ai-agent-custom-tools-agent-sdk.md:140-233 語尾「ます」が6文連続（4窓）
[FAIL C17] ai-agent-custom-tools-agent-sdk.md:235-237 語尾「ます」が4文連続（2窓）
[FAIL C17] ai-agent-custom-tools-agent-sdk.md:245-259 語尾「ます」が3文連続（1窓）
[FAIL C17] ai-agent-custom-tools-agent-sdk.md:303-303 語尾「ます」が3文連続（1窓）
[FAIL C17] ai-agent-custom-tools-agent-sdk.md:307-309 語尾「です」が3文連続（1窓）
[FAIL C17] ai-agent-custom-tools-agent-sdk.md:313-313 語尾「ます」が3文連続（1窓）
[FAIL OUTPUT] ai-agent-custom-tools-agent-sdk.md:64 出力ブロック（7行、先頭「tool("get_product", 説明, zod の入力定義, 処理)   … ツールを1つ作」）がどの run ログにも無い
[FAIL C25] ai-agent-max-turns-budget-limit.md:9 61字 [fm] SDK の total_cost_usd は手元で計算した見積もりで、結果を載せた11回の合計は約0.0076ドルでした。
[FAIL C25] ai-agent-max-turns-budget-limit.md:10 147字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、モデル claude-haiku-5-5、macOS arm64（型の確認は TypeScript 7.0.2）
[FAIL C25] ai-agent-safe-file-tool.md:10 73字 [fm] Node.js 22.22.0、npm 10.9.4、依存パッケージなし（型の確認は TypeScript 7.0.2）、Linux x86_64
[FAIL C25] ai-agent-safe-file-tool.md:55 84字 [prose] モデルにツールを渡す流れは、[自作ツールを Agent SDK に渡す記事](/posts/ai-agent-custom-tools-agent-sdk)で扱います。
[FAIL C17] ai-agent-safe-file-tool.md:561-565 語尾「いるか」が5文連続（3窓）
[FAIL OUTPUT] ai-agent-safe-file-tool.md:148 出力ブロック（9行、先頭「safe-file-tool/」）がどの run ログにも無い
[FAIL C25] ai-agent-vs-workflow.md:10 126字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS arm64（型の確認は TypeScript 7.0.2）
[FAIL C17] ai-agent-vs-workflow.md:55-57 語尾「ます」が5文連続（3窓）
[FAIL C17] ai-agent-vs-workflow.md:168-168 語尾「ます」が3文連続（1窓）
[FAIL C17] ai-agent-vs-workflow.md:239-241 語尾「ます」が3文連続（1窓）
[FAIL C17] ai-agent-vs-workflow.md:276-278 語尾「ます」が3文連続（1窓）
[FAIL C17] ai-agent-vs-workflow.md:402-404 語尾「です」が3文連続（1窓）
[FAIL C17] ai-agent-vs-workflow.md:410-414 語尾「ます」が6文連続（4窓）
[FAIL C25] claude-agent-sdk-first-agent.md:10 126字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS arm64（型の確認は TypeScript 7.0.2）
[FAIL C25] claude-agent-sdk-first-agent.md:72 93字 [prose] 環境変数 [`ANTHROPIC_API_KEY`](/posts/claude-code-api-key-billing-auth) は、プランのログインより先に使われます（出典4）。
[FAIL C17] claude-agent-sdk-first-agent.md:133-133 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-agent-sdk-first-agent.md:176-178 語尾「です」が3文連続（1窓）
[FAIL C17] claude-agent-sdk-first-agent.md:180-182 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-agent-sdk-first-agent.md:222-226 語尾「です」が3文連続（1窓）
[FAIL C17] claude-agent-sdk-first-agent.md:226-280 語尾「ます」が5文連続（3窓）
[FAIL C17] claude-agent-sdk-first-agent.md:304-310 語尾「ます」が5文連続（3窓）
[FAIL C25] claude-agent-sdk-streaming.md:10 134字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS（Darwin arm64）（型の確認は TypeScript 7.0.2）
[FAIL C17] claude-agent-sdk-streaming.md:56-58 語尾「ます」が3文連続（1窓）
[FAIL C25] claude-agent-sdk-structured-output.md:10 136字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、zod 4.6.7、macOS arm64（型の確認は TypeScript 7.0.2）
[FAIL C25] claude-agent-sdk-structured-output.md:274 73字 [prose] 公式の表は [`claude -p`](/posts/claude-p-script-first-call) の説明として書いています（出典4）。
[FAIL C17] claude-agent-sdk-structured-output.md:180-182 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-agent-sdk-structured-output.md:194-196 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-agent-sdk-structured-output.md:289-293 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-agent-sdk-structured-output.md:356-362 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-agent-sdk-structured-output.md:368-374 語尾「ます」が4文連続（2窓）
[FAIL C17] claude-agent-sdk-structured-output.md:384-388 語尾「です」が3文連続（1窓）
[FAIL C25] claude-code-api-key-billing-auth.md:9 61字 [fm] 有効なキーで動いた分はキーの持ち主に従量で請求され、Haiku 5.5 なら入力は100万トークンあたり0.10ドルです。
[FAIL C25] claude-code-api-key-billing-auth.md:10 146字 [fm] Node.js 22.23.4、npm 10.9.9、Claude Code 2.1.322、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS arm64（型の確認は TypeScript 7.0.2）
[FAIL C17] claude-code-api-key-billing-auth.md:96-100 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-code-api-key-billing-auth.md:102-106 語尾「ます」が4文連続（2窓）
[FAIL C25] claude-p-script-first-call.md:10 108字 [fm] macOS（Darwin arm64）、Node.js 22.23.4、npm 10.9.9、Claude Code 2.1.322、jq 1.7.1 から 1.8.1（型の確認は TypeScript 7.0.2）
[FAIL C17] claude-p-script-first-call.md:52-54 語尾「ます」が4文連続（2窓）
[FAIL C17] claude-p-script-first-call.md:65-67 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-p-script-first-call.md:138-143 語尾「です」が5文連続（3窓）
[FAIL C17] claude-p-script-first-call.md:226-232 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-p-script-first-call.md:251-255 語尾「ます」が5文連続（3窓）
[FAIL C17] claude-p-script-first-call.md:277-297 語尾「ます」が4文連続（2窓）
[FAIL C17] claude-p-script-first-call.md:301-305 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-p-script-first-call.md:337-341 語尾「ます」が4文連続（2窓）
[FAIL C17] claude-p-script-first-call.md:411-413 語尾「ます」が3文連続（1窓）
[FAIL C17] claude-p-script-first-call.md:420-422 語尾「ます」が4文連続（2窓）
[FAIL C25] llm-api-429-retry-sdk-mock.md:363 87字 [prose] [ストリーミング](/posts/claude-agent-sdk-streaming)で 200 が返ったあとのエラーは、SDK の自動リトライとは別の扱いです（出典1）。
[FAIL C17] llm-api-429-retry-sdk-mock.md:148-154 語尾「ます」が3文連続（1窓）
[FAIL C17] llm-api-429-retry-sdk-mock.md:163-163 語尾「ます」が3文連続（1窓）
[FAIL C17] llm-api-429-retry-sdk-mock.md:167-171 語尾「ます」が4文連続（2窓）
[FAIL C17] llm-api-429-retry-sdk-mock.md:177-197 語尾「ます」が5文連続（3窓）
[FAIL C17] llm-api-429-retry-sdk-mock.md:253-275 語尾「ます」が5文連続（3窓）
[FAIL C17] llm-api-429-retry-sdk-mock.md:304-321 語尾「ます」が3文連続（1窓）
[FAIL C17] llm-api-429-retry-sdk-mock.md:333-333 語尾「ます」が4文連続（2窓）
[FAIL C17] llm-api-429-retry-sdk-mock.md:337-337 語尾「です」が3文連続（1窓）
[FAIL C17] llm-api-429-retry-sdk-mock.md:361-363 語尾「ます」が5文連続（3窓）
[FAIL OUTPUT] llm-api-429-retry-sdk-mock.md:287 出力ブロック（14行、先頭「$ node client.ts rate-limit」）がどの run ログにも無い
[FAIL OUTPUT] llm-api-cost-estimate-js-tiktoken.md:88 出力ブロック（1行、先頭「料金（ドル）= (入力トークン数 × 入力単価 + 出力トークン数 × 出力単価) ÷ 1,000,」）がどの run ログにも無い
[FAIL C25] llm-as-a-judge-claude.md:10 133字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS（Darwin arm64）、型の確認は TypeScript 7.0.2
[FAIL C25] llm-as-a-judge-claude.md:208 61字 [prose] - `systemPrompt` に文字列を渡すと、SDK はその文字列だけをシステムプロンプトとして送ります（出典3）。
[FAIL C17] llm-as-a-judge-claude.md:61-65 語尾「ます」が3文連続（1窓）
[FAIL C17] llm-as-a-judge-claude.md:357-359 語尾「です」が3文連続（1窓）
[FAIL C25] llm-eval-dataset-from-logs.md:37 70字 [fm] RFC 8259 The JavaScript Object Notation (JSON) Data Interchange Format
[FAIL C25] llm-eval-dataset-from-logs.md:46 73字 [fm] Node.js 22.22.0、npm 10.9.4、依存パッケージなし、Linux x86_64（型の確認は TypeScript 7.0.2）
[FAIL C25] llm-eval-harness-fixtures.md:43 73字 [fm] Node.js 22.22.0、npm 10.9.4、依存パッケージなし、Linux x86_64（型の確認は TypeScript 7.0.2）
[FAIL OUTPUT] llm-eval-harness-fixtures.md:87 出力ブロック（7行、先頭「llm-eval/」）がどの run ログにも無い
[FAIL C25] llm-json-parse-error-fix.md:31 70字 [fm] RFC 8259 The JavaScript Object Notation (JSON) Data Interchange Format
[FAIL C25] mcp-connection-closed-fix.md:49 94字 [fm] Node.js 22.22.0、npm 10.9.4、SDK 1.32.2、Claude Code 2.1.322、Linux x86_64（型の確認は TypeScript 7.0.2）
[FAIL OUTPUT] mcp-connection-closed-fix.md:112 出力ブロック（7行、先頭「notes-mcp/」）がどの run ログにも無い
[FAIL C25] mcp-inspector-debug.md:9 103字 [fm] Claude Code は、Pro、Max などのプランか Console のアカウント、または Amazon Bedrock、Microsoft Foundry などの API の提供元を通して使えます。
[FAIL C25] mcp-inspector-debug.md:10 105字 [fm] Node.js 22.22.0、npm 10.9.4、MCP Inspector 2.13.0、SDK 1.32.2、zod 4.6.7、Linux x86_64（型の確認は TypeScript 7.0.2）
[FAIL OUTPUT] mcp-inspector-debug.md:109 出力ブロック（3行、先頭「inspector-demo/」）がどの run ログにも無い
[FAIL C25] mcp-server-resources-prompts.md:9 87字 [fm] Claude Code の会話で Resources と Prompts を使うには、Claude Code を使える有料のプランか Console のアカウントが要ります。
[FAIL C25] mcp-server-resources-prompts.md:10 106字 [fm] Node.js 22.22.0、npm 10.9.4、SDK 1.32.2、zod 4.6.7、Linux x86_64（Inspector の確認は 2.13.0、型の確認は TypeScript 7.0.2）
[FAIL OUTPUT] mcp-server-resources-prompts.md:129 出力ブロック（4行、先頭「writing-helper-mcp/」）がどの run ログにも無い
[FAIL C17] mcp-server-streamable-http.md:73-73 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-streamable-http.md:87-91 語尾「ます」が5文連続（3窓）
[FAIL C17] mcp-server-streamable-http.md:141-148 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-streamable-http.md:208-282 語尾「です」が4文連続（2窓）
[FAIL C17] mcp-server-streamable-http.md:282-282 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-streamable-http.md:292-292 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-streamable-http.md:294-298 語尾「ます」が4文連続（2窓）
[FAIL C17] mcp-server-streamable-http.md:407-407 語尾「です」が3文連続（1窓）
[FAIL C17] mcp-server-streamable-http.md:411-424 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-streamable-http.md:460-462 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-streamable-http.md:493-493 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-streamable-http.md:521-525 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-streamable-http.md:589-589 語尾「ます」が4文連続（2窓）
[FAIL C17] mcp-server-streamable-http.md:595-597 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-streamable-http.md:601-603 語尾「ます」が3文連続（1窓）
[FAIL OUTPUT] mcp-server-streamable-http.md:128 出力ブロック（6行、先頭「char-count-http/」）がどの run ログにも無い
[FAIL OUTPUT] mcp-server-streamable-http.md:357 出力ブロック（1行、先頭「client error: SSE stream disconnected: AbortError:」）がどの run ログにも無い
[FAIL OUTPUT] mcp-server-streamable-http.md:497 出力ブロック（21行、先頭「$ claude mcp add --transport http --scope user cha」）がどの run ログにも無い
[FAIL OUTPUT] mcp-server-streamable-http.md:564 出力ブロック（1行、先頭「Stateless transport cannot be reused across reques」）がどの run ログにも無い
[FAIL C25] mcp-server-typescript-stdio.md:226 77字 [prose] `inputSchema` には [zod のスキーマ](/posts/zod-to-json-schema-tool-definition)を書きます。
[FAIL C17] mcp-server-typescript-stdio.md:67-67 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-typescript-stdio.md:75-79 語尾「です」が3文連続（1窓）
[FAIL C17] mcp-server-typescript-stdio.md:85-89 語尾「です」が3文連続（1窓）
[FAIL C17] mcp-server-typescript-stdio.md:89-100 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-typescript-stdio.md:193-226 語尾「ます」が4文連続（2窓）
[FAIL C17] mcp-server-typescript-stdio.md:232-236 語尾「ます」が4文連続（2窓）
[FAIL C17] mcp-server-typescript-stdio.md:236-258 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-typescript-stdio.md:258-262 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-typescript-stdio.md:300-312 語尾「です」が3文連続（1窓）
[FAIL C17] mcp-server-typescript-stdio.md:318-322 語尾「ます」が3文連続（1窓）
[FAIL C17] mcp-server-typescript-stdio.md:358-362 語尾「ます」が5文連続（3窓）
[FAIL OUTPUT] mcp-server-typescript-stdio.md:110 出力ブロック（7行、先頭「char-count-mcp/」）がどの run ログにも無い
[FAIL OUTPUT] mcp-server-typescript-stdio.md:332 出力ブロック（23行、先頭「$ claude mcp add char-count --scope user --transpo」）がどの run ログにも無い
[FAIL C25] promptfoo-llm-eval-intro.md:10 144字 [fm] Node.js 22.23.4、npm 10.9.9、promptfoo 0.125.1、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS arm64（型の確認は TypeScript 7.0.2）
[FAIL C17] promptfoo-llm-eval-intro.md:73-77 語尾「ます」が4文連続（2窓）
[FAIL C17] promptfoo-llm-eval-intro.md:229-231 語尾「ます」が3文連続（1窓）
[FAIL C17] promptfoo-llm-eval-intro.md:241-245 語尾「ます」が3文連続（1窓）
[FAIL C17] promptfoo-llm-eval-intro.md:301-303 語尾「ます」が3文連続（1窓）
[FAIL C17] promptfoo-llm-eval-intro.md:317-355 語尾「ます」が4文連続（2窓）
[FAIL C17] promptfoo-llm-eval-intro.md:392-398 語尾「ます」が5文連続（3窓）
[FAIL C25] rag-answer-with-citations-claude.md:10 133字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS（Darwin arm64）、型の確認は TypeScript 7.0.2
[FAIL C17] rag-answer-with-citations-claude.md:49-51 語尾「ます」が4文連続（2窓）
[FAIL C17] rag-answer-with-citations-claude.md:101-118 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-answer-with-citations-claude.md:221-225 語尾「ます」が5文連続（3窓）
[FAIL C25] rag-bm25-search-typescript.md:34 80字 [fm] ECMAScript Internationalization API Specification 19.7.1 CreateSegmentDataObject
[FAIL C25] rag-bm25-search-typescript.md:397 89字 [prose] 作ったプロンプトを Claude に送ると、[トークン数に応じた料金](/posts/llm-api-cost-estimate-js-tiktoken)がかかります（出典9）。
[FAIL C17] rag-bm25-search-typescript.md:49-49 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-bm25-search-typescript.md:53-57 語尾「です」が3文連続（1窓）
[FAIL C17] rag-bm25-search-typescript.md:86-124 語尾「ます」が11文連続（9窓）
[FAIL C17] rag-bm25-search-typescript.md:124-126 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-bm25-search-typescript.md:211-213 語尾「ます」が4文連続（2窓）
[FAIL C17] rag-bm25-search-typescript.md:296-300 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-bm25-search-typescript.md:322-328 語尾「です」が4文連続（2窓）
[FAIL C17] rag-bm25-search-typescript.md:334-356 語尾「ます」が3文連続（1窓）
[FAIL OUTPUT] rag-bm25-search-typescript.md:61 出力ブロック（2行、先頭「重み = idf × tf / (tf + k1 × (1 - b + b × dl / avgdl」）がどの run ログにも無い
[FAIL OUTPUT] rag-bm25-search-typescript.md:324 出力ブロック（1行、先頭「1.281 × 2 / (2 + 1.2 × (0.25 + 0.75 × 22 / 27.375)」）がどの run ログにも無い
[FAIL C25] rag-chunking-japanese-text.md:449 86字 [prose] Voyage AI の埋め込み API は、[トークン数で料金が決まります](/posts/llm-api-cost-estimate-js-tiktoken)（出典8）。
[FAIL C17] rag-chunking-japanese-text.md:48-56 語尾「です」が5文連続（3窓）
[FAIL C17] rag-chunking-japanese-text.md:58-62 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-chunking-japanese-text.md:92-111 語尾「ます」が5文連続（3窓）
[FAIL C17] rag-chunking-japanese-text.md:237-241 語尾「ます」が4文連続（2窓）
[FAIL C17] rag-chunking-japanese-text.md:278-328 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-chunking-japanese-text.md:391-395 語尾「ます」が4文連続（2窓）
[FAIL C17] rag-chunking-japanese-text.md:410-414 語尾「ます」が3文連続（1窓）
[FAIL C25] rag-hybrid-search-rrf.md:16 81字 [fm] Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods
[FAIL C25] rag-hybrid-search-rrf.md:46 80字 [fm] ECMAScript Internationalization API Specification 19.7.1 CreateSegmentDataObject
[FAIL C17] rag-hybrid-search-rrf.md:82-94 語尾「です」が3文連続（1窓）
[FAIL C17] rag-hybrid-search-rrf.md:102-111 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-hybrid-search-rrf.md:241-266 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-hybrid-search-rrf.md:268-292 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-hybrid-search-rrf.md:294-329 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-hybrid-search-rrf.md:473-503 語尾「ます」が5文連続（3窓）
[FAIL OUTPUT] rag-hybrid-search-rrf.md:78 出力ブロック（1行、先頭「RRF の点数(d) = Σ 1 / (k + 順位(d))」）がどの run ログにも無い
[FAIL C17] rag-retrieval-eval-recall-mrr.md:84-91 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-retrieval-eval-recall-mrr.md:112-133 語尾「ます」が4文連続（2窓）
[FAIL C17] rag-retrieval-eval-recall-mrr.md:203-220 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-retrieval-eval-recall-mrr.md:331-410 語尾「ます」が3文連続（1窓）
[FAIL C17] rag-retrieval-eval-recall-mrr.md:468-472 語尾「ます」が4文連続（2窓）
[FAIL C25] structured-output-methods-compare.md:9 62字 [fm] SDK の total_cost_usd は定価で換算した見積もりで、30回の呼び出しを1回通して0.006ドル相当でした。
[FAIL C25] structured-output-methods-compare.md:10 136字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、zod 4.6.7、macOS arm64（型の確認は TypeScript 7.0.2）
[FAIL C17] structured-output-methods-compare.md:86-100 語尾「ます」が3文連続（1窓）
[FAIL C17] structured-output-methods-compare.md:172-176 語尾「ます」が4文連続（2窓）
[FAIL C17] structured-output-methods-compare.md:209-229 語尾「ます」が4文連続（2窓）
[FAIL C17] structured-output-methods-compare.md:231-235 語尾「です」が3文連続（1窓）
[FAIL C17] structured-output-methods-compare.md:235-265 語尾「ます」が4文連続（2窓）
[FAIL C17] structured-output-methods-compare.md:265-267 語尾「です」が3文連続（1窓）
[FAIL C17] structured-output-methods-compare.md:295-314 語尾「ます」が4文連続（2窓）
[FAIL C17] structured-output-methods-compare.md:324-374 語尾「ます」が4文連続（2窓）
[FAIL C17] structured-output-methods-compare.md:450-452 語尾「ます」が3文連続（1窓）
[FAIL C17] structured-output-methods-compare.md:468-468 語尾「です」が3文連続（1窓）
[FAIL C25] zod-to-json-schema-tool-definition.md:2 61字 [fm] zod のスキーマから JSON Schema を作ってツール定義に使う【zod v4 の z.toJSONSchema】
[FAIL C25] zod-to-json-schema-tool-definition.md:46 70字 [fm] anthropic-sdk-typescript sdk-v1.3.0 src/resources/messages/messages.ts
[FAIL C25] zod-to-json-schema-tool-definition.md:416 86字 [prose] ツール定義の名前、説明、スキーマは、[入力トークンとして料金に数えられます](/posts/llm-api-cost-estimate-js-tiktoken)（出典6）。
[FAIL C17] zod-to-json-schema-tool-definition.md:61-63 語尾「ます」が3文連続（1窓）
[FAIL C17] zod-to-json-schema-tool-definition.md:77-79 語尾「ます」が5文連続（3窓）
[FAIL C17] zod-to-json-schema-tool-definition.md:110-121 語尾「ます」が3文連続（1窓）
[FAIL C17] zod-to-json-schema-tool-definition.md:186-202 語尾「ます」が3文連続（1窓）
[FAIL C17] zod-to-json-schema-tool-definition.md:206-235 語尾「ます」が6文連続（4窓）
[FAIL C17] zod-to-json-schema-tool-definition.md:248-250 語尾「ます」が3文連続（1窓）
[FAIL C17] zod-to-json-schema-tool-definition.md:306-306 語尾「ます」が3文連続（1窓）
[FAIL C17] zod-to-json-schema-tool-definition.md:310-310 語尾「ます」が3文連続（1窓）
[FAIL C17] zod-to-json-schema-tool-definition.md:377-379 語尾「ます」が3文連続（1窓）
[FAIL C17] zod-to-json-schema-tool-definition.md:410-410 語尾「ます」が3文連続（1窓）
[FAIL OUTPUT] zod-to-json-schema-tool-definition.md:98 出力ブロック（9行、先頭「zod-tool-schema/」）がどの run ログにも無い
[FAIL C25] zod-validate-llm-json-output.md:53 65字 [prose] 講座の前の記事では、Agent SDK の outputFormat で Claude に JSON を返させる方法を扱いました。
[FAIL C25] zod-validate-llm-json-output.md:53 64字 [prose] [前の記事](/posts/claude-agent-sdk-structured-output)から読むと流れがつながります。
[FAIL C25] zod-validate-llm-json-output.md:451 84字 [prose] 再依頼の文を実際にモデルへ送ると、[トークン数に応じた料金](/posts/llm-api-cost-estimate-js-tiktoken)がかかります（出典9）。
[FAIL C17] zod-validate-llm-json-output.md:49-49 語尾「ます」が3文連続（1窓）
[FAIL C17] zod-validate-llm-json-output.md:67-69 語尾「ます」が3文連続（1窓）
[FAIL C17] zod-validate-llm-json-output.md:84-86 語尾「ます」が5文連続（3窓）
[FAIL C17] zod-validate-llm-json-output.md:86-88 語尾「ます」が4文連続（2窓）
[FAIL C17] zod-validate-llm-json-output.md:96-116 語尾「ます」が4文連続（2窓）
[FAIL C17] zod-validate-llm-json-output.md:134-149 語尾「ます」が4文連続（2窓）
[FAIL C17] zod-validate-llm-json-output.md:185-200 語尾「ます」が3文連続（1窓）
[FAIL C17] zod-validate-llm-json-output.md:296-335 語尾「ます」が8文連続（6窓）
[FAIL C17] zod-validate-llm-json-output.md:339-397 語尾「ます」が7文連続（5窓）
[FAIL C17] zod-validate-llm-json-output.md:412-433 語尾「ます」が4文連続（2窓）
```

## 参考: 候補（C16、C26、C28）

候補は数だけ上の表に出しています。行ごとの一覧は `python3 scripts/check-article.py <slug>` で出ます。

## 自前のスクリプトから落としたもの

自前のスクリプトにあって、checklist とガイドの行に結びつかないため、新しいスクリプトに入れなかった検査です。

- 禁止語の一覧（`PATS` の「徹底解説」「完全ガイド」「次は」「ここから」「ここまで」「でしょう」「かもしれ」「まとめ」「地図」「仕様書」「ではなく」「じゃない」「整理」など）: ai-smell-lint.py の担当で、C25 から C32 の行ではありません。
- 全角コロン `：` 単独の検出: checklist C32 は `：` + 半角スペースです。
- C19 の常体の検出、「落ちる」「回す」の転用動詞の数: C19 と C29 は別の作業単位、転用動詞は writing-lint.py の担当です。
- 文長の min/max/short/long の集計: C16 の候補は、30〜50字の文が5文以上続く区間（guides/03 4節）に置き換えました。
