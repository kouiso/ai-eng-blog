# check-article.py を30本に通した結果（issue #42）

`python3 scripts/check-article.py --all` の結果です。各記事の `logs/<slug>/lint/` にある自前のスクリプトと並べています。
スクリプトは30本が通るように調整していません。出た結果をそのまま載せます。記事の直しと、出力ブロックの例外の登録（`scripts/check-article-exceptions.json`、今は空）は、この PR の範囲に入れていません（#44 以降）。

自前の列は、各記事の `prose-check.py` と `check-code-and-outputs.py` を、記事が持つ引数の形で実行した出力から読んだ件数です。自前の `prose-check.py` は記事ごとに書式が違うので、読み取れなかったところは `-` にしています。自前の `check-code-and-outputs.py` は30本とも ALL OK（`ai-agent-vs-workflow` は別の文言で OK）で、終了コード 0 でした。

| 記事 | C25 自前 | C25 新 | C17 自前 | C17 新 | C30-32 新 | 出力 自前 | OUTPUT 新 | C16 候補 | C26 候補 | C28 候補 |
|---|---|---|---|---|---|---|---|---|---|---|
| ai-agent-custom-tools-agent-sdk | 0 | 1 | 0 | 2 | 0 | OK | 1 | 2 | 0 | 0 |
| ai-agent-max-turns-budget-limit | 0 | 2 | 0 | 0 | 0 | OK | 0 | 4 | 0 | 0 |
| ai-agent-safe-file-tool | 1 | 2 | 0 | 1 | 0 | OK | 1 | 3 | 0 | 0 |
| ai-agent-vs-workflow | 0 | 1 | 0 | 1 | 0 | OK | 0 | 3 | 0 | 2 |
| claude-agent-sdk-first-agent | 1 | 2 | 0 | 2 | 1 | OK | 0 | 1 | 0 | 3 |
| claude-agent-sdk-streaming | 0 | 1 | 0 | 0 | 0 | OK | 0 | 0 | 0 | 0 |
| claude-agent-sdk-structured-output | 1 | 2 | 0 | 1 | 0 | OK | 0 | 2 | 0 | 2 |
| claude-code-api-key-billing-auth | 0 | 2 | 0 | 0 | 0 | OK | 0 | 3 | 0 | 0 |
| claude-p-script-first-call | 0 | 1 | 0 | 1 | 0 | OK | 0 | 1 | 0 | 0 |
| llm-api-429-retry-sdk-mock | 1 | 1 | 0 | 1 | 0 | OK | 1 | 2 | 0 | 1 |
| llm-api-cost-estimate-js-tiktoken | 0 | 0 | 0 | 0 | 0 | OK | 1 | 5 | 0 | 0 |
| llm-as-a-judge-claude | 0 | 2 | 0 | 1 | 0 | OK | 0 | 3 | 0 | 1 |
| llm-eval-dataset-from-logs | 0 | 2 | 0 | 0 | 0 | OK | 0 | 2 | 0 | 1 |
| llm-eval-harness-fixtures | 0 | 1 | 0 | 0 | 0 | OK | 1 | 1 | 0 | 0 |
| llm-json-parse-error-fix | 0 | 1 | 0 | 0 | 0 | OK | 0 | 4 | 0 | 0 |
| mcp-connection-closed-fix | 0 | 1 | 0 | 0 | 0 | OK | 1 | 6 | 0 | 0 |
| mcp-inspector-debug | 0 | 2 | 0 | 0 | 1 | OK | 1 | 4 | 0 | 0 |
| mcp-server-resources-prompts | 0 | 2 | 0 | 0 | 0 | OK | 1 | 6 | 0 | 0 |
| mcp-server-streamable-http | 0 | 0 | 0 | 2 | 0 | OK | 4 | 8 | 0 | 4 |
| mcp-server-typescript-stdio | 1 | 1 | 0 | 3 | 0 | OK | 2 | 5 | 0 | 0 |
| promptfoo-llm-eval-intro | 0 | 1 | - | 0 | 0 | OK | 34 | 0 | 0 | 1 |
| rag-answer-with-citations-claude | 0 | 1 | 0 | 0 | 0 | OK | 0 | 2 | 0 | 0 |
| rag-bm25-search-typescript | 1 | 2 | 0 | 2 | 0 | OK | 2 | 1 | 0 | 1 |
| rag-chunking-japanese-text | 1 | 1 | 0 | 1 | 0 | OK | 0 | 4 | 0 | 1 |
| rag-hybrid-search-rrf | 0 | 2 | 0 | 1 | 0 | OK | 1 | 6 | 0 | 1 |
| rag-local-embeddings-transformers-js | 0 | 0 | 0 | 0 | 0 | OK | 0 | 5 | 0 | 0 |
| rag-retrieval-eval-recall-mrr | 0 | 0 | 0 | 0 | 0 | OK | 0 | 5 | 0 | 5 |
| structured-output-methods-compare | 0 | 2 | 0 | 3 | 0 | OK | 0 | 2 | 0 | 10 |
| zod-to-json-schema-tool-definition | 2 | 3 | 0 | 0 | 0 | OK | 1 | 4 | 0 | 1 |
| zod-validate-llm-json-output | 3 | 3 | 0 | 0 | 0 | OK | 0 | 3 | 0 | 2 |
| 合計 | | 42 | | 22 | 2 | | 52 | 97 | 0 | 36 |

確定の検査に1件以上落ちた記事は 28 本、落ちなかった記事は 2 本です（終了コード 1）。

## 新しいスクリプトの読み方で、自前と変わったところ

- C17: 自前は語尾3字の一致だけでした。新しいほうは、語尾3字の一致に加えて、guides/03 が名指しする4語尾（ましょう、でしょう、です、ません）の一致も数えます。重なる窓は1つの区間にまとめて数えます。
- C25: 新しいほうは title、description、cost_estimate、run_environment と sources の title も数えます。表のセルと見出しも数えます。自前は記事ごとに数え方が違い、同じ記事で自前が 0 件、新しいほうが 1 から 3 件になる例が多くあります。URL だけの表のセルは文ではないので数えず、件数を出します（自前も同じ扱いです。checklist とガイドに無い除外にあたるかどうかは、マネージャーの判断待ちです）。
- C30: `**` をインラインコードの中でも数えます。当たるのは2件で、`***` でマスクした例と、glob の `tasks/**/*.md` です。どちらも本当の太字残りではないので、人が見て判断します。自前は2件とも 0 件でした。
- OUTPUT: 自前は記事ごとに決め打ちの一覧（ファイル名とコマンド）を照合していました。新しいほうは、記事の ```text ブロックすべてを run ログの出力部分と照合します。ファイル構成の図と数式のように、実行の出力ではない text ブロックも当たります。これらは例外の一覧（理由つき）に載せるかどうかを、#44 で決めます。

## 新しいスクリプトで落ちた箇所（確定）

```text
[FAIL C25] ai-agent-custom-tools-agent-sdk.md:10 136字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、zod 4.6.7、macOS arm64（型の確認は Ty
[FAIL C17] ai-agent-custom-tools-agent-sdk.md:231-233 語尾「きます」が3文連続（1窓）
[FAIL C17] ai-agent-custom-tools-agent-sdk.md:307-309 語尾「です」が3文連続（1窓）
[FAIL OUTPUT] ai-agent-custom-tools-agent-sdk.md:64 出力ブロック（7行、先頭「tool("get_product", 説明, zod の入力定義, 処理)   … ツールを1つ作」）がどの run ログにも無い
[FAIL C25] ai-agent-max-turns-budget-limit.md:9 61字 [fm] SDK の total_cost_usd は手元で計算した見積もりで、結果を載せた11回の合計は約0.0076ドルでした。
[FAIL C25] ai-agent-max-turns-budget-limit.md:10 147字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、モデル claude-haiku-5-5、macOS arm
[FAIL C25] ai-agent-safe-file-tool.md:10 73字 [fm] Node.js 22.22.0、npm 10.9.4、依存パッケージなし（型の確認は TypeScript 7.0.2）、Linux x86_64
[FAIL C25] ai-agent-safe-file-tool.md:55 84字 [prose] モデルにツールを渡す流れは、[自作ツールを Agent SDK に渡す記事](/posts/ai-agent-custom-tools-agent-sdk)で扱います。
[FAIL C17] ai-agent-safe-file-tool.md:561-565 語尾「いるか」が5文連続（3窓）
[FAIL OUTPUT] ai-agent-safe-file-tool.md:148 出力ブロック（9行、先頭「safe-file-tool/」）がどの run ログにも無い
[FAIL C25] ai-agent-vs-workflow.md:10 126字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS arm64（型の確認は TypeScript 7.0.2）
[FAIL C17] ai-agent-vs-workflow.md:402-404 語尾「です」が3文連続（1窓）
[FAIL C25] claude-agent-sdk-first-agent.md:10 126字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS arm64（型の確認は TypeScript 7.0.
[FAIL C25] claude-agent-sdk-first-agent.md:72 93字 [prose] 環境変数 [`ANTHROPIC_API_KEY`](/posts/claude-code-api-key-billing-auth) は、プランのログインより先に使われます（出典4）。
[FAIL C17] claude-agent-sdk-first-agent.md:176-178 語尾「です」が3文連続（1窓）
[FAIL C17] claude-agent-sdk-first-agent.md:222-226 語尾「です」が3文連続（1窓）
[FAIL C30] claude-agent-sdk-first-agent.md:318 `**` が残っている: 同じ `agent.ts` をもう一度動かすと、ツールを呼ぶ順番と回数は1回目と同じでした。違ったのは Glob の引数です。1回目は `{
[FAIL C25] claude-agent-sdk-streaming.md:10 134字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS（Darwin arm64）（型の確認は TypeScrip
[FAIL C25] claude-agent-sdk-structured-output.md:10 136字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、zod 4.6.7、macOS arm64（型の確認は
[FAIL C25] claude-agent-sdk-structured-output.md:274 73字 [prose] 公式の表は [`claude -p`](/posts/claude-p-script-first-call) の説明として書いています（出典4）。
[FAIL C17] claude-agent-sdk-structured-output.md:384-388 語尾「です」が3文連続（1窓）
[FAIL C25] claude-code-api-key-billing-auth.md:9 61字 [fm] 有効なキーで動いた分はキーの持ち主に従量で請求され、Haiku 5.5 なら入力は100万トークンあたり0.10ドルです。
[FAIL C25] claude-code-api-key-billing-auth.md:10 146字 [fm] Node.js 22.23.4、npm 10.9.9、Claude Code 2.1.322、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS arm
[FAIL C25] claude-p-script-first-call.md:10 108字 [fm] macOS（Darwin arm64）、Node.js 22.23.4、npm 10.9.9、Claude Code 2.1.322、jq 1.7.1 から 1.8.1（型の確認は TypeScript 7.0.2）
[FAIL C17] claude-p-script-first-call.md:138-143 語尾「です」が5文連続（3窓）
[FAIL C25] llm-api-429-retry-sdk-mock.md:363 87字 [prose] [ストリーミング](/posts/claude-agent-sdk-streaming)で 200 が返ったあとのエラーは、SDK の自動リトライとは別の扱いです（出典1）。
[FAIL C17] llm-api-429-retry-sdk-mock.md:337-337 語尾「です」が3文連続（1窓）
[FAIL OUTPUT] llm-api-429-retry-sdk-mock.md:287 出力ブロック（14行、先頭「$ node client.ts rate-limit」）がどの run ログにも無い
[FAIL OUTPUT] llm-api-cost-estimate-js-tiktoken.md:88 出力ブロック（1行、先頭「料金（ドル）= (入力トークン数 × 入力単価 + 出力トークン数 × 出力単価) ÷ 1,000,」）がどの run ログにも無い
[FAIL C25] llm-as-a-judge-claude.md:10 133字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS（Darwin arm64）、型の確認は TypeScript 7.0
[FAIL C25] llm-as-a-judge-claude.md:208 61字 [prose] - `systemPrompt` に文字列を渡すと、SDK はその文字列だけをシステムプロンプトとして送ります（出典3）。
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
[FAIL C30] mcp-inspector-debug.md:392 `**` が残っている: 手元の出力は次のとおりです。ホームフォルダのパスは `~` に、トークンは `***` に置き換えました。
[FAIL OUTPUT] mcp-inspector-debug.md:109 出力ブロック（3行、先頭「inspector-demo/」）がどの run ログにも無い
[FAIL C25] mcp-server-resources-prompts.md:9 87字 [fm] Claude Code の会話で Resources と Prompts を使うには、Claude Code を使える有料のプランか Console のアカウントが要ります。
[FAIL C25] mcp-server-resources-prompts.md:10 106字 [fm] Node.js 22.22.0、npm 10.9.4、SDK 1.32.2、zod 4.6.7、Linux x86_64（Inspector の確認は 2.13.0、型の確認は TypeScript 7.0.2）
[FAIL OUTPUT] mcp-server-resources-prompts.md:129 出力ブロック（4行、先頭「writing-helper-mcp/」）がどの run ログにも無い
[FAIL C17] mcp-server-streamable-http.md:208-282 語尾「です」が4文連続（2窓）
[FAIL C17] mcp-server-streamable-http.md:407-407 語尾「です」が3文連続（1窓）
[FAIL OUTPUT] mcp-server-streamable-http.md:128 出力ブロック（6行、先頭「char-count-http/」）がどの run ログにも無い
[FAIL OUTPUT] mcp-server-streamable-http.md:357 出力ブロック（1行、先頭「client error: SSE stream disconnected: AbortError:」）がどの run ログにも無い
[FAIL OUTPUT] mcp-server-streamable-http.md:497 出力ブロック（21行、先頭「$ claude mcp add --transport http --scope user cha」）がどの run ログにも無い
[FAIL OUTPUT] mcp-server-streamable-http.md:564 出力ブロック（1行、先頭「Stateless transport cannot be reused across reques」）がどの run ログにも無い
[FAIL C25] mcp-server-typescript-stdio.md:226 77字 [prose] `inputSchema` には [zod のスキーマ](/posts/zod-to-json-schema-tool-definition)を書きます。
[FAIL C17] mcp-server-typescript-stdio.md:75-79 語尾「です」が3文連続（1窓）
[FAIL C17] mcp-server-typescript-stdio.md:85-89 語尾「です」が3文連続（1窓）
[FAIL C17] mcp-server-typescript-stdio.md:300-312 語尾「です」が3文連続（1窓）
[FAIL OUTPUT] mcp-server-typescript-stdio.md:110 出力ブロック（7行、先頭「char-count-mcp/」）がどの run ログにも無い
[FAIL OUTPUT] mcp-server-typescript-stdio.md:332 出力ブロック（23行、先頭「$ claude mcp add char-count --scope user --transpo」）がどの run ログにも無い
[FAIL C25] promptfoo-llm-eval-intro.md:10 144字 [fm] Node.js 22.23.4、npm 10.9.9、promptfoo 0.125.1、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS arm64（型の確認は T
[FAIL OUTPUT] run/01.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/02.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/03.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/04.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/05.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/06.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/07.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/08.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/09.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/10.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/11.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/12.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/13.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/14.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/15.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/16.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/17.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/18.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/19.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/20.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/21.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/22.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/23.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/24.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/25.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/26.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] run/27.log 出力部分の見出し（`--- stdout+stderr ---` など）が無く、書式に沿っていない
[FAIL OUTPUT] promptfoo-llm-eval-intro.md:92 出力ブロック（1行、先頭「unset」）がどの run ログにも無い
[FAIL OUTPUT] promptfoo-llm-eval-intro.md:110 出力ブロック（14行、先頭「npm warn deprecated @modelcontextprotocol/server-f」）がどの run ログにも無い
[FAIL OUTPUT] promptfoo-llm-eval-intro.md:133 出力ブロック（7行、先頭「{」）がどの run ログにも無い
[FAIL OUTPUT] promptfoo-llm-eval-intro.md:147 出力ブロック（2行、先頭「fix available via `npm audit fix --force`」）がどの run ログにも無い
[FAIL OUTPUT] promptfoo-llm-eval-intro.md:262 出力ブロック（36行、先頭「Starting evaluation eval-GIb-2026-11-12T01:05:19」）がどの run ログにも無い
[FAIL OUTPUT] promptfoo-llm-eval-intro.md:363 出力ブロック（10行、先頭「--- 形の指定なし / 先月の請求額が2回引き落とされています。」）がどの run ログにも無い
[FAIL OUTPUT] promptfoo-llm-eval-intro.md:388 出力ブロック（1行、先頭「出力: "**分類: bug**\n\n理由: 「保存ボタンを押すと画面が真っ白になる」は、機能が想」）がどの run ログにも無い
[FAIL C25] rag-answer-with-citations-claude.md:10 133字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS（Darwin arm64）、型の確認は Typ
[FAIL C25] rag-bm25-search-typescript.md:34 80字 [fm] ECMAScript Internationalization API Specification 19.7.1 CreateSegmentDataObject
[FAIL C25] rag-bm25-search-typescript.md:397 89字 [prose] 作ったプロンプトを Claude に送ると、[トークン数に応じた料金](/posts/llm-api-cost-estimate-js-tiktoken)がかかります（出典9）。
[FAIL C17] rag-bm25-search-typescript.md:53-57 語尾「です」が3文連続（1窓）
[FAIL C17] rag-bm25-search-typescript.md:322-328 語尾「です」が4文連続（2窓）
[FAIL OUTPUT] rag-bm25-search-typescript.md:61 出力ブロック（2行、先頭「重み = idf × tf / (tf + k1 × (1 - b + b × dl / avgdl」）がどの run ログにも無い
[FAIL OUTPUT] rag-bm25-search-typescript.md:324 出力ブロック（1行、先頭「1.281 × 2 / (2 + 1.2 × (0.25 + 0.75 × 22 / 27.375)」）がどの run ログにも無い
[FAIL C25] rag-chunking-japanese-text.md:449 86字 [prose] Voyage AI の埋め込み API は、[トークン数で料金が決まります](/posts/llm-api-cost-estimate-js-tiktoken)（出典8）。
[FAIL C17] rag-chunking-japanese-text.md:48-56 語尾「です」が5文連続（3窓）
[FAIL C25] rag-hybrid-search-rrf.md:16 81字 [fm] Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods
[FAIL C25] rag-hybrid-search-rrf.md:46 80字 [fm] ECMAScript Internationalization API Specification 19.7.1 CreateSegmentDataObject
[FAIL C17] rag-hybrid-search-rrf.md:82-94 語尾「です」が3文連続（1窓）
[FAIL OUTPUT] rag-hybrid-search-rrf.md:78 出力ブロック（1行、先頭「RRF の点数(d) = Σ 1 / (k + 順位(d))」）がどの run ログにも無い
[FAIL C25] structured-output-methods-compare.md:9 62字 [fm] SDK の total_cost_usd は定価で換算した見積もりで、30回の呼び出しを1回通して0.006ドル相当でした。
[FAIL C25] structured-output-methods-compare.md:10 136字 [fm] Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、zod 4.6.7、macOS arm64（型の確認は 
[FAIL C17] structured-output-methods-compare.md:231-235 語尾「です」が3文連続（1窓）
[FAIL C17] structured-output-methods-compare.md:265-267 語尾「です」が3文連続（1窓）
[FAIL C17] structured-output-methods-compare.md:468-468 語尾「です」が3文連続（1窓）
[FAIL C25] zod-to-json-schema-tool-definition.md:2 61字 [fm] zod のスキーマから JSON Schema を作ってツール定義に使う【zod v4 の z.toJSONSchema】
[FAIL C25] zod-to-json-schema-tool-definition.md:46 70字 [fm] anthropic-sdk-typescript sdk-v1.3.0 src/resources/messages/messages.ts
[FAIL C25] zod-to-json-schema-tool-definition.md:416 86字 [prose] ツール定義の名前、説明、スキーマは、[入力トークンとして料金に数えられます](/posts/llm-api-cost-estimate-js-tiktoken)（出典6）。
[FAIL OUTPUT] zod-to-json-schema-tool-definition.md:98 出力ブロック（9行、先頭「zod-tool-schema/」）がどの run ログにも無い
[FAIL C25] zod-validate-llm-json-output.md:53 65字 [prose] 講座の前の記事では、Agent SDK の outputFormat で Claude に JSON を返させる方法を扱いました。
[FAIL C25] zod-validate-llm-json-output.md:53 64字 [prose] [前の記事](/posts/claude-agent-sdk-structured-output)から読むと流れがつながります。
[FAIL C25] zod-validate-llm-json-output.md:451 84字 [prose] 再依頼の文を実際にモデルへ送ると、[トークン数に応じた料金](/posts/llm-api-cost-estimate-js-tiktoken)がかかります（出典9）。
```

## 参考: 候補（C16、C26、C28）

候補は数だけ上の表に出しています。行ごとの一覧は `python3 scripts/check-article.py <slug>` で出ます。

## 自前のスクリプトから落としたもの

自前のスクリプトにあって、checklist とガイドの行に結びつかないため、新しいスクリプトに入れなかった検査です。

- 禁止語の一覧（`PATS` の「徹底解説」「完全ガイド」「次は」「ここから」「ここまで」「でしょう」「かもしれ」「まとめ」「地図」「仕様書」「ではなく」「じゃない」「整理」など）: ai-smell-lint.py の担当で、C25 から C32 の行ではありません。
- 全角コロン `：` 単独の検出: checklist C32 は `：` + 半角スペースです。
- C19 の常体の検出、「落ちる」「回す」の転用動詞の数: C19 と C29 は別の作業単位、転用動詞は writing-lint.py の担当です。
- 文長の min/max/short/long の集計: C16 の候補は、30〜50字の文が5文以上続く区間（guides/03 4節「30〜50字の文がずっと続く」）に置き換えました。
