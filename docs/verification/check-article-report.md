# check-article.py を30本に通した結果（issue #81 の修正後）

`python3 scripts/check-article.py --all` を、確定で落ちていた記事を直したあとのコードで出し直した結果です。前の報告（issue #42 当時）では確定が 42+141+18=201 行ありましたが、今回の出力で `[FAIL` の行は 0 件で、終了コードは 0 です。

直し方の方針は issue #81 と、その直下の裁定のコメントのとおりです。

- C25（60字超）: 文を「。」で2つに分けるか、短い言い回しに直しました。frontmatter の `run_environment` と `cost_estimate` の値も同じルールで数えるので、列挙を「。」の文に分けました。出典の題名（RFC、ECMAScript、論文題）は、URL で特定できる形に短くしました。`sources` の表の題名との対応は本文の表のほうに残っています。
- C17（同じ語尾の3連続）: 連続する文の中の1文を、「です」「ます」「ました」「ません」「ください」「のです」など別の語尾に替えて切りました。語尾の形だけを変え、内容は変えていません。
- C30〜C32（記号）: 0 件のままです。
- OUTPUT（記事の ```text と実行ログの照合）: 2通りで直しました。`$` のコマンドをコピー用に並べていた ```text ブロックは、```bash（コマンド）と ```text（実行の出力）に分け、記事側の `check-code-and-outputs.py` もその形に合わせました。実行の出力ではないもの（作業フォルダのファイルの木、BM25/RRF の式、処理の流れの図）は `scripts/check-article-exceptions.json` に理由つきで例外登録しました（13件）。mcp-server-streamable-http の AbortError の1行は、クライアントの30回ループを回し直して `logs/…/run/53.log` に実測の行として残し、本文の文字列をログに合わせました。実行ログの再生成が要る直しは、必ず実行し直してログを作っています（手でログに書き足しはしていません）。

確定の検査に落ちる記事は 0 本です。残るのは候補（C16、C28）だけで、どちらも機械の出した候補を全部読んで判定を各記事の `logs/<slug>/lint/judgments.md` の「2026-11-24 の再判定」に書きました。C16 は手順や結果の説明が続く箇所（30〜50字は読みやすい文の帯）、C28 は語の中の「や」（やすい・増やし・やり方、など）で、どちらも修正なしと判定しています。C26 の候補は全記事で 0 件です。

## 検査の読み方

- C17: 並びに入れる文は、地の文と箇条書きの文です。見出しと表のセルは並びに入れません。語尾は2通りで見ます。末尾3字の一致と、文末の形の一致です。形（でしょう、ましょう、ません、ました、でした、です、ます）はそれぞれ別の語尾で、「です」「ます」「ました」が混ざる並びは同じ語尾と数えません。形はデータです。guides/03-anti-ai.md の409行（ましょう、でしょう、です、ません）と193行（です の3連続）に載っている形に、ます、ました、でした を足しました。この3つはガイドの行にはなく、丁寧体の基本形として足したものです（7つのうち4つがガイドの行、3つが追加）。重なる窓は1つの区間にまとめます。
- C25: 地の文、箇条書き、見出し、表の中の文、インラインコード（1字ずつ）、frontmatter の文字列の値（tags などの一覧の要素、main_keyword、target_query、sources の title など、引用符つきの値すべて）を数えます。数えないのは、表のセルの中身、または frontmatter の値が、ちょうど URL 1つ（URL に使える ASCII の文字だけで、全体が URL）のものです（文ではなく、URL は句読点で切れません。出典の表と sources の url に URL を置く規約があります）。URL と語が混じるもの（「URL（英語のページ）」「URL、URL」）は全体を数えます。数えなかったものの件数は記事ごとに出します（30本で 668 件。表のセルと frontmatter の値で 334 件ずつ）。60字を超えるものは `[SKIP C25-URL]` として行番号つきで一覧に出します（表のセル 138 件、frontmatter の url 138 件、計 276 件）。一覧は `python3 scripts/check-article.py --all | grep SKIP` で出ます。この報告の下の一覧には入れていません（`[FAIL` の行だけです）。
- C30 から C32: コードブロックとインラインコードの中の記号は数えません（guides/03-anti-ai.md 372行「コードは原文のままが正しい」）。C31 の記号は checklist C31 に合わせて `—` と `─`（`──` は連続）だけで、`―`（U+2015）は数えません。
- OUTPUT: 記事の ```text ブロックすべてを run ログの出力部分と照合します。promptfoo の記事の古い書式のログ（`$ コマンド` と、`----` だけの行が2本で囲んだ出力）は、書式が一意に決まるので読めるようにしました（ログ自体は触っていません）。ファイル構成の図と数式のように実行の出力ではない text ブロックは失敗として出ます。例外に載せるかどうかは #44 で決めます。


## 修正後の出力の全文

`python3 scripts/check-article.py --all` の出力を、最後の SUMMARY まで1行も切らずに載せます。

```text
== ai-agent-custom-tools-agent-sdk
  prose: 文 252、数えなかったコードブロックの行 124
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 20件
    [SKIP C25-URL] ai-agent-custom-tools-agent-sdk.md:27 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] ai-agent-custom-tools-agent-sdk.md:33 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] ai-agent-custom-tools-agent-sdk.md:349 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] ai-agent-custom-tools-agent-sdk.md:351 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
  outputs: ```text 5件、ログに一致 4件、例外 1件、ログ 13本（出力部分 13か所）
    例外: 「tool("get_product", 説明, zod の入力定義, 処理)  」 理由: ツールを作ってエージェントに渡すまでの呼び出しの流れを示す図（書き方の見本）。実行の出力ではない。
[候補 C16] ai-agent-custom-tools-agent-sdk.md:297-301 30〜50字の文が5文続く
[候補 C16] ai-agent-custom-tools-agent-sdk.md:307-311 30〜50字の文が7文続く
SUMMARY ai-agent-custom-tools-agent-sdk: 確定 0 {} / 候補 2 {"C16": 2}
== ai-agent-max-turns-budget-limit
  prose: 文 288、数えなかったコードブロックの行 183
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 18件
    [SKIP C25-URL] ai-agent-max-turns-budget-limit.md:27 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] ai-agent-max-turns-budget-limit.md:463 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
  outputs: ```text 9件、ログに一致 9件、例外 0件、ログ 33本（出力部分 33か所）
[候補 C16] ai-agent-max-turns-budget-limit.md:76-81 30〜50字の文が7文続く
[候補 C16] ai-agent-max-turns-budget-limit.md:157-226 30〜50字の文が7文続く
[候補 C16] ai-agent-max-turns-budget-limit.md:297-301 30〜50字の文が6文続く
[候補 C16] ai-agent-max-turns-budget-limit.md:442-451 30〜50字の文が6文続く
SUMMARY ai-agent-max-turns-budget-limit: 確定 0 {} / 候補 4 {"C16": 4}
== ai-agent-safe-file-tool
  prose: 文 249、数えなかったコードブロックの行 296
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 20件
    [SKIP C25-URL] ai-agent-safe-file-tool.md:30 79字 https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls
    [SKIP C25-URL] ai-agent-safe-file-tool.md:33 74字 https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
    [SKIP C25-URL] ai-agent-safe-file-tool.md:39 151字 https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/create-symbolic-links
    [SKIP C25-URL] ai-agent-safe-file-tool.md:42 90字 https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-createsymboliclinkw
    [SKIP C25-URL] ai-agent-safe-file-tool.md:578 79字 https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls
    [SKIP C25-URL] ai-agent-safe-file-tool.md:579 74字 https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
    [SKIP C25-URL] ai-agent-safe-file-tool.md:581 151字 https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/create-symbolic-links
    [SKIP C25-URL] ai-agent-safe-file-tool.md:582 90字 https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-createsymboliclinkw
  outputs: ```text 9件、ログに一致 8件、例外 1件、ログ 13本（出力部分 13か所）
    例外: 「safe-file-tool/」 理由: 作業フォルダの配置を示すファイルの木。実行の出力ではない。
[候補 C16] ai-agent-safe-file-tool.md:233-326 30〜50字の文が6文続く
[候補 C16] ai-agent-safe-file-tool.md:408-410 30〜50字の文が5文続く
[候補 C16] ai-agent-safe-file-tool.md:422-445 30〜50字の文が9文続く
SUMMARY ai-agent-safe-file-tool: 確定 0 {} / 候補 3 {"C16": 3}
== ai-agent-vs-workflow
  prose: 文 314、数えなかったコードブロックの行 156
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 22件
    [SKIP C25-URL] ai-agent-vs-workflow.md:15 63字 https://www.anthropic.com/engineering/building-effective-agents
    [SKIP C25-URL] ai-agent-vs-workflow.md:24 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] ai-agent-vs-workflow.md:27 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] ai-agent-vs-workflow.md:45 68字 https://platform.claude.com/docs/en/build-with-claude/prompt-caching
    [SKIP C25-URL] ai-agent-vs-workflow.md:424 63字 https://www.anthropic.com/engineering/building-effective-agents
    [SKIP C25-URL] ai-agent-vs-workflow.md:427 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] ai-agent-vs-workflow.md:428 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] ai-agent-vs-workflow.md:434 68字 https://platform.claude.com/docs/en/build-with-claude/prompt-caching
  outputs: ```text 7件、ログに一致 7件、例外 0件、ログ 35本（出力部分 35か所）
[候補 C16] ai-agent-vs-workflow.md:148-235 30〜50字の文が10文続く
[候補 C16] ai-agent-vs-workflow.md:257-263 30〜50字の文が6文続く
[候補 C16] ai-agent-vs-workflow.md:408-411 30〜50字の文が5文続く
[候補 C28] ai-agent-vs-workflow.md:77 「予測しやすく結果のそろうワークフ」
[候補 C28] ai-agent-vs-workflow.md:404 「件数を増やしたときの差は測っていま」
SUMMARY ai-agent-vs-workflow: 確定 0 {} / 候補 5 {"C16": 3, "C28": 2}
== claude-agent-sdk-first-agent
  prose: 文 218、数えなかったコードブロックの行 114
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 20件
    [SKIP C25-URL] claude-agent-sdk-first-agent.md:27 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] claude-agent-sdk-first-agent.md:33 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] claude-agent-sdk-first-agent.md:342 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] claude-agent-sdk-first-agent.md:344 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
  outputs: ```text 6件、ログに一致 6件、例外 0件、ログ 26本（出力部分 26か所）
[候補 C16] claude-agent-sdk-first-agent.md:322-330 30〜50字の文が6文続く
[候補 C28] claude-agent-sdk-first-agent.md:180 「ユーザーやプロジェクトの設定がすべ」
[候補 C28] claude-agent-sdk-first-agent.md:310 「このやり取りを自分で書きます（」
[候補 C28] claude-agent-sdk-first-agent.md:322 「などで桁をそろえると読みやすくなります」
SUMMARY claude-agent-sdk-first-agent: 確定 0 {} / 候補 4 {"C16": 1, "C28": 3}
== claude-agent-sdk-streaming
  prose: 文 170、数えなかったコードブロックの行 99
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 14件
    [SKIP C25-URL] claude-agent-sdk-streaming.md:18 63字 https://platform.claude.com/docs/en/build-with-claude/streaming
    [SKIP C25-URL] claude-agent-sdk-streaming.md:21 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] claude-agent-sdk-streaming.md:27 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] claude-agent-sdk-streaming.md:285 63字 https://platform.claude.com/docs/en/build-with-claude/streaming
    [SKIP C25-URL] claude-agent-sdk-streaming.md:286 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] claude-agent-sdk-streaming.md:288 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
  outputs: ```text 4件、ログに一致 4件、例外 0件、ログ 17本（出力部分 17か所）
SUMMARY claude-agent-sdk-streaming: 確定 0 {} / 候補 0 {}
== claude-agent-sdk-structured-output
  prose: 文 196、数えなかったコードブロックの行 161
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 18件
    [SKIP C25-URL] claude-agent-sdk-structured-output.md:21 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] claude-agent-sdk-structured-output.md:33 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] claude-agent-sdk-structured-output.md:394 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] claude-agent-sdk-structured-output.md:398 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
  outputs: ```text 8件、ログに一致 8件、例外 0件、ログ 33本（出力部分 33か所）
[候補 C16] claude-agent-sdk-structured-output.md:362-368 30〜50字の文が6文続く
[候補 C16] claude-agent-sdk-structured-output.md:372-380 30〜50字の文が5文続く
[候補 C28] claude-agent-sdk-structured-output.md:188 「このやり取りの分です」
[候補 C28] claude-agent-sdk-structured-output.md:260 「モデルはそこで出し直しをやめました」
SUMMARY claude-agent-sdk-structured-output: 確定 0 {} / 候補 4 {"C16": 2, "C28": 2}
== claude-code-api-key-billing-auth
  prose: 文 213、数えなかったコードブロックの行 93
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 22件
    [SKIP C25-URL] claude-code-api-key-billing-auth.md:33 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] claude-code-api-key-billing-auth.md:45 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] claude-code-api-key-billing-auth.md:341 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] claude-code-api-key-billing-auth.md:345 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
  outputs: ```text 9件、ログに一致 9件、例外 0件、ログ 26本（出力部分 26か所）
[候補 C16] claude-code-api-key-billing-auth.md:55-57 30〜50字の文が5文続く
[候補 C16] claude-code-api-key-billing-auth.md:132-138 30〜50字の文が5文続く
[候補 C16] claude-code-api-key-billing-auth.md:225-231 30〜50字の文が5文続く
SUMMARY claude-code-api-key-billing-auth: 確定 0 {} / 候補 3 {"C16": 3}
== claude-p-script-first-call
  prose: 文 227、数えなかったコードブロックの行 161
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 20件
    [SKIP C25-URL] claude-p-script-first-call.md:27 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] claude-p-script-first-call.md:36 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] claude-p-script-first-call.md:438 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] claude-p-script-first-call.md:441 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
  outputs: ```text 13件、ログに一致 13件、例外 0件、ログ 19本（出力部分 19か所）
SUMMARY claude-p-script-first-call: 確定 0 {} / 候補 0 {}
== llm-api-429-retry-sdk-mock
  prose: 文 227、数えなかったコードブロックの行 161
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 16件
    [SKIP C25-URL] llm-api-429-retry-sdk-mock.md:21 70字 https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript
    [SKIP C25-URL] llm-api-429-retry-sdk-mock.md:24 84字 https://github.com/anthropics/anthropic-sdk-typescript/blob/sdk-v1.3.0/src/client.ts
    [SKIP C25-URL] llm-api-429-retry-sdk-mock.md:27 88字 https://github.com/anthropics/anthropic-sdk-typescript/blob/sdk-v1.3.0/src/core/error.ts
    [SKIP C25-URL] llm-api-429-retry-sdk-mock.md:414 70字 https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript
    [SKIP C25-URL] llm-api-429-retry-sdk-mock.md:415 84字 https://github.com/anthropics/anthropic-sdk-typescript/blob/sdk-v1.3.0/src/client.ts
    [SKIP C25-URL] llm-api-429-retry-sdk-mock.md:416 88字 https://github.com/anthropics/anthropic-sdk-typescript/blob/sdk-v1.3.0/src/core/error.ts
  outputs: ```text 9件、ログに一致 9件、例外 0件、ログ 13本（出力部分 13か所）
[候補 C16] llm-api-429-retry-sdk-mock.md:167-175 30〜50字の文が7文続く
[候補 C16] llm-api-429-retry-sdk-mock.md:380-386 30〜50字の文が8文続く
[候補 C28] llm-api-429-retry-sdk-mock.md:386 「通信量を少しずつ増やすよう勧めています（出典」
SUMMARY llm-api-429-retry-sdk-mock: 確定 0 {} / 候補 3 {"C16": 2, "C28": 1}
== llm-api-cost-estimate-js-tiktoken
  prose: 文 250、数えなかったコードブロックの行 94
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 24件
    [SKIP C25-URL] llm-api-cost-estimate-js-tiktoken.md:39 62字 https://github.com/openai/tiktoken/blob/main/tiktoken/model.py
    [SKIP C25-URL] llm-api-cost-estimate-js-tiktoken.md:48 68字 https://platform.claude.com/docs/en/build-with-claude/token-counting
    [SKIP C25-URL] llm-api-cost-estimate-js-tiktoken.md:317 62字 https://github.com/openai/tiktoken/blob/main/tiktoken/model.py
    [SKIP C25-URL] llm-api-cost-estimate-js-tiktoken.md:320 68字 https://platform.claude.com/docs/en/build-with-claude/token-counting
  outputs: ```text 6件、ログに一致 5件、例外 1件、ログ 17本（出力部分 17か所）
    例外: 「料金（ドル）= (入力トークン数 × 入力単価 + 出力トークン数 × 出力単価」 理由: 料金の計算式。実行の出力ではない。
[候補 C16] llm-api-cost-estimate-js-tiktoken.md:82-84 30〜50字の文が7文続く
[候補 C16] llm-api-cost-estimate-js-tiktoken.md:243-245 30〜50字の文が5文続く
[候補 C16] llm-api-cost-estimate-js-tiktoken.md:249-273 30〜50字の文が7文続く
[候補 C16] llm-api-cost-estimate-js-tiktoken.md:275-281 30〜50字の文が10文続く
[候補 C16] llm-api-cost-estimate-js-tiktoken.md:291-297 30〜50字の文が7文続く
SUMMARY llm-api-cost-estimate-js-tiktoken: 確定 0 {} / 候補 5 {"C16": 5}
== llm-as-a-judge-claude
  prose: 文 270、数えなかったコードブロックの行 131
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 22件
    [SKIP C25-URL] llm-as-a-judge-claude.md:15 67字 https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    [SKIP C25-URL] llm-as-a-judge-claude.md:18 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] llm-as-a-judge-claude.md:21 66字 https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts
    [SKIP C25-URL] llm-as-a-judge-claude.md:30 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] llm-as-a-judge-claude.md:375 67字 https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    [SKIP C25-URL] llm-as-a-judge-claude.md:376 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] llm-as-a-judge-claude.md:377 66字 https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts
    [SKIP C25-URL] llm-as-a-judge-claude.md:380 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
  outputs: ```text 5件、ログに一致 5件、例外 0件、ログ 46本（出力部分 46か所）
[候補 C16] llm-as-a-judge-claude.md:132-154 30〜50字の文が9文続く
[候補 C16] llm-as-a-judge-claude.md:156-205 30〜50字の文が5文続く
[候補 C16] llm-as-a-judge-claude.md:363-367 30〜50字の文が6文続く
[候補 C28] llm-as-a-judge-claude.md:55 「別の回答に点を付けさせるやり方です」
SUMMARY llm-as-a-judge-claude: 確定 0 {} / 候補 4 {"C16": 3, "C28": 1}
== llm-eval-dataset-from-logs
  prose: 文 245、数えなかったコードブロックの行 139
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 22件
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:12 67字 https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:21 91字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:24 97字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:27 91字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:30 92字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:42 66字 https://pubs.opengroup.org/onlinepubs/9799919799/utilities/wc.html
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:384 67字 https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:387 91字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:388 97字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:389 91字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:390 92字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    [SKIP C25-URL] llm-eval-dataset-from-logs.md:394 66字 https://pubs.opengroup.org/onlinepubs/9799919799/utilities/wc.html
  outputs: ```text 4件、ログに一致 4件、例外 0件、ログ 12本（出力部分 12か所）
[候補 C16] llm-eval-dataset-from-logs.md:247-249 30〜50字の文が5文続く
[候補 C16] llm-eval-dataset-from-logs.md:362-374 30〜50字の文が10文続く
[候補 C28] llm-eval-dataset-from-logs.md:249 「で配ったときに0件になりやすいのです」
SUMMARY llm-eval-dataset-from-logs: 確定 0 {} / 候補 3 {"C16": 2, "C28": 1}
== llm-eval-harness-fixtures
  prose: 文 213、数えなかったコードブロックの行 124
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 20件
    [SKIP C25-URL] llm-eval-harness-fixtures.md:12 67字 https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    [SKIP C25-URL] llm-eval-harness-fixtures.md:18 97字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    [SKIP C25-URL] llm-eval-harness-fixtures.md:21 96字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
    [SKIP C25-URL] llm-eval-harness-fixtures.md:24 92字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test
    [SKIP C25-URL] llm-eval-harness-fixtures.md:27 106字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookbehind_assertion
    [SKIP C25-URL] llm-eval-harness-fixtures.md:30 110字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion
    [SKIP C25-URL] llm-eval-harness-fixtures.md:36 84字 https://docs.github.com/en/actions/how-tos/create-and-publish-actions/set-exit-codes
    [SKIP C25-URL] llm-eval-harness-fixtures.md:331 67字 https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    [SKIP C25-URL] llm-eval-harness-fixtures.md:333 97字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    [SKIP C25-URL] llm-eval-harness-fixtures.md:334 96字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
    [SKIP C25-URL] llm-eval-harness-fixtures.md:335 92字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test
    [SKIP C25-URL] llm-eval-harness-fixtures.md:336 106字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookbehind_assertion
    [SKIP C25-URL] llm-eval-harness-fixtures.md:337 110字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion
    [SKIP C25-URL] llm-eval-harness-fixtures.md:339 84字 https://docs.github.com/en/actions/how-tos/create-and-publish-actions/set-exit-codes
  outputs: ```text 3件、ログに一致 2件、例外 1件、ログ 11本（出力部分 11か所）
    例外: 「llm-eval/」 理由: 作業フォルダの構成を示すファイルの木。実行の出力ではない。
[候補 C16] llm-eval-harness-fixtures.md:220-247 30〜50字の文が8文続く
SUMMARY llm-eval-harness-fixtures: 確定 0 {} / 候補 1 {"C16": 1}
== llm-json-parse-error-fix
  prose: 文 208、数えなかったコードブロックの行 114
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 12件
    [SKIP C25-URL] llm-json-parse-error-fix.md:15 91字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
    [SKIP C25-URL] llm-json-parse-error-fix.md:21 75字 https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons
    [SKIP C25-URL] llm-json-parse-error-fix.md:24 72字 https://platform.claude.com/docs/en/build-with-claude/structured-outputs
    [SKIP C25-URL] llm-json-parse-error-fix.md:341 91字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
    [SKIP C25-URL] llm-json-parse-error-fix.md:343 75字 https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons
    [SKIP C25-URL] llm-json-parse-error-fix.md:344 72字 https://platform.claude.com/docs/en/build-with-claude/structured-outputs
  outputs: ```text 5件、ログに一致 5件、例外 0件、ログ 10本（出力部分 10か所）
[候補 C16] llm-json-parse-error-fix.md:40-44 30〜50字の文が7文続く
[候補 C16] llm-json-parse-error-fix.md:140-167 30〜50字の文が10文続く
[候補 C16] llm-json-parse-error-fix.md:197-199 30〜50字の文が6文続く
[候補 C16] llm-json-parse-error-fix.md:281-298 30〜50字の文が5文続く
SUMMARY llm-json-parse-error-fix: 確定 0 {} / 候補 4 {"C16": 4}
== mcp-connection-closed-fix
  prose: 文 332、数えなかったコードブロックの行 160
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 24件
    [SKIP C25-URL] mcp-connection-closed-fix.md:12 73字 https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
    [SKIP C25-URL] mcp-connection-closed-fix.md:15 72字 https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle
    [SKIP C25-URL] mcp-connection-closed-fix.md:18 84字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/stdio.ts
    [SKIP C25-URL] mcp-connection-closed-fix.md:21 87字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts
    [SKIP C25-URL] mcp-connection-closed-fix.md:24 77字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts
    [SKIP C25-URL] mcp-connection-closed-fix.md:45 84字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/stdio.ts
    [SKIP C25-URL] mcp-connection-closed-fix.md:487 73字 https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
    [SKIP C25-URL] mcp-connection-closed-fix.md:488 72字 https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle
    [SKIP C25-URL] mcp-connection-closed-fix.md:489 84字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/stdio.ts
    [SKIP C25-URL] mcp-connection-closed-fix.md:490 87字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts
    [SKIP C25-URL] mcp-connection-closed-fix.md:491 77字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts
    [SKIP C25-URL] mcp-connection-closed-fix.md:498 84字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/stdio.ts
  outputs: ```text 11件、ログに一致 10件、例外 1件、ログ 20本（出力部分 20か所）
    例外: 「notes-mcp/」 理由: 作業フォルダの構成を示すファイルの木。実行の出力ではない。
[候補 C16] mcp-connection-closed-fix.md:58-68 30〜50字の文が7文続く
[候補 C16] mcp-connection-closed-fix.md:76-78 30〜50字の文が5文続く
[候補 C16] mcp-connection-closed-fix.md:231-253 30〜50字の文が5文続く
[候補 C16] mcp-connection-closed-fix.md:323-325 30〜50字の文が5文続く
[候補 C16] mcp-connection-closed-fix.md:364-378 30〜50字の文が6文続く
[候補 C16] mcp-connection-closed-fix.md:424-428 30〜50字の文が6文続く
SUMMARY mcp-connection-closed-fix: 確定 0 {} / 候補 6 {"C16": 6}
== mcp-inspector-debug
  prose: 文 289、数えなかったコードブロックの行 166
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 24件
    [SKIP C25-URL] mcp-inspector-debug.md:15 63字 https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector
    [SKIP C25-URL] mcp-inspector-debug.md:21 81字 https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md
    [SKIP C25-URL] mcp-inspector-debug.md:24 86字 https://github.com/modelcontextprotocol/inspector/blob/main/docs/v1-to-v2-migration.md
    [SKIP C25-URL] mcp-inspector-debug.md:27 89字 https://github.com/modelcontextprotocol/inspector/blob/main/docs/environment-variables.md
    [SKIP C25-URL] mcp-inspector-debug.md:30 61字 https://www.npmjs.com/package/@modelcontextprotocol/inspector
    [SKIP C25-URL] mcp-inspector-debug.md:39 69字 https://modelcontextprotocol.io/specification/2025-11-25/server/tools
    [SKIP C25-URL] mcp-inspector-debug.md:48 82字 https://github.com/modelcontextprotocol/inspector/blob/main/docs/secret-storage.md
    [SKIP C25-URL] mcp-inspector-debug.md:450 63字 https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector
    [SKIP C25-URL] mcp-inspector-debug.md:452 81字 https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md
    [SKIP C25-URL] mcp-inspector-debug.md:453 86字 https://github.com/modelcontextprotocol/inspector/blob/main/docs/v1-to-v2-migration.md
    [SKIP C25-URL] mcp-inspector-debug.md:454 89字 https://github.com/modelcontextprotocol/inspector/blob/main/docs/environment-variables.md
    [SKIP C25-URL] mcp-inspector-debug.md:455 61字 https://www.npmjs.com/package/@modelcontextprotocol/inspector
    [SKIP C25-URL] mcp-inspector-debug.md:458 69字 https://modelcontextprotocol.io/specification/2025-11-25/server/tools
    [SKIP C25-URL] mcp-inspector-debug.md:461 82字 https://github.com/modelcontextprotocol/inspector/blob/main/docs/secret-storage.md
  outputs: ```text 11件、ログに一致 10件、例外 1件、ログ 14本（出力部分 14か所）
    例外: 「inspector-demo/」 理由: 作業フォルダの構成を示すファイルの木。実行の出力ではない。
[候補 C16] mcp-inspector-debug.md:245-249 30〜50字の文が9文続く
[候補 C16] mcp-inspector-debug.md:277-303 30〜50字の文が10文続く
[候補 C16] mcp-inspector-debug.md:415-417 30〜50字の文が5文続く
[候補 C16] mcp-inspector-debug.md:428-430 30〜50字の文が5文続く
SUMMARY mcp-inspector-debug: 確定 0 {} / 候補 4 {"C16": 4}
== mcp-server-resources-prompts
  prose: 文 316、数えなかったコードブロックの行 180
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 36件
    [SKIP C25-URL] mcp-server-resources-prompts.md:15 63字 https://modelcontextprotocol.io/specification/2025-11-25/server
    [SKIP C25-URL] mcp-server-resources-prompts.md:18 73字 https://modelcontextprotocol.io/specification/2025-11-25/server/resources
    [SKIP C25-URL] mcp-server-resources-prompts.md:21 71字 https://modelcontextprotocol.io/specification/2025-11-25/server/prompts
    [SKIP C25-URL] mcp-server-resources-prompts.md:24 63字 https://modelcontextprotocol.io/specification/2025-11-25/schema
    [SKIP C25-URL] mcp-server-resources-prompts.md:27 64字 https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
    [SKIP C25-URL] mcp-server-resources-prompts.md:30 79字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md
    [SKIP C25-URL] mcp-server-resources-prompts.md:33 82字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/mcp.ts
    [SKIP C25-URL] mcp-server-resources-prompts.md:36 87字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts
    [SKIP C25-URL] mcp-server-resources-prompts.md:39 77字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts
    [SKIP C25-URL] mcp-server-resources-prompts.md:54 81字 https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md
    [SKIP C25-URL] mcp-server-resources-prompts.md:57 69字 https://modelcontextprotocol.io/specification/2025-11-25/server/tools
    [SKIP C25-URL] mcp-server-resources-prompts.md:60 63字 https://modelcontextprotocol.io/specification/2026-07-28/server
    [SKIP C25-URL] mcp-server-resources-prompts.md:63 84字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    [SKIP C25-URL] mcp-server-resources-prompts.md:433 63字 https://modelcontextprotocol.io/specification/2025-11-25/server
    [SKIP C25-URL] mcp-server-resources-prompts.md:434 73字 https://modelcontextprotocol.io/specification/2025-11-25/server/resources
    [SKIP C25-URL] mcp-server-resources-prompts.md:435 71字 https://modelcontextprotocol.io/specification/2025-11-25/server/prompts
    [SKIP C25-URL] mcp-server-resources-prompts.md:436 63字 https://modelcontextprotocol.io/specification/2025-11-25/schema
    [SKIP C25-URL] mcp-server-resources-prompts.md:437 64字 https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
    [SKIP C25-URL] mcp-server-resources-prompts.md:438 79字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md
    [SKIP C25-URL] mcp-server-resources-prompts.md:439 82字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/mcp.ts
    [SKIP C25-URL] mcp-server-resources-prompts.md:440 87字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts
    [SKIP C25-URL] mcp-server-resources-prompts.md:441 77字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts
    [SKIP C25-URL] mcp-server-resources-prompts.md:446 81字 https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md
    [SKIP C25-URL] mcp-server-resources-prompts.md:447 69字 https://modelcontextprotocol.io/specification/2025-11-25/server/tools
    [SKIP C25-URL] mcp-server-resources-prompts.md:448 63字 https://modelcontextprotocol.io/specification/2026-07-28/server
    [SKIP C25-URL] mcp-server-resources-prompts.md:449 84字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  outputs: ```text 6件、ログに一致 5件、例外 1件、ログ 11本（出力部分 11か所）
    例外: 「writing-helper-mcp/」 理由: 作業フォルダの構成を示すファイルの木。実行の出力ではない。
[候補 C16] mcp-server-resources-prompts.md:76-84 30〜50字の文が5文続く
[候補 C16] mcp-server-resources-prompts.md:100-102 30〜50字の文が6文続く
[候補 C16] mcp-server-resources-prompts.md:266-268 30〜50字の文が5文続く
[候補 C16] mcp-server-resources-prompts.md:268-274 30〜50字の文が8文続く
[候補 C16] mcp-server-resources-prompts.md:282-368 30〜50字の文が5文続く
[候補 C16] mcp-server-resources-prompts.md:376-382 30〜50字の文が10文続く
SUMMARY mcp-server-resources-prompts: 確定 0 {} / 候補 6 {"C16": 6}
== mcp-server-streamable-http
  prose: 文 359、数えなかったコードブロックの行 253
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 34件
    [SKIP C25-URL] mcp-server-streamable-http.md:15 73字 https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
    [SKIP C25-URL] mcp-server-streamable-http.md:18 72字 https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle
    [SKIP C25-URL] mcp-server-streamable-http.md:21 64字 https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
    [SKIP C25-URL] mcp-server-streamable-http.md:24 79字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md
    [SKIP C25-URL] mcp-server-streamable-http.md:27 86字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/express.ts
    [SKIP C25-URL] mcp-server-streamable-http.md:30 110字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/middleware/hostHeaderValidation.ts
    [SKIP C25-URL] mcp-server-streamable-http.md:33 104字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/webStandardStreamableHttp.ts
    [SKIP C25-URL] mcp-server-streamable-http.md:36 117字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/examples/server/simpleStatelessStreamableHttp.ts
    [SKIP C25-URL] mcp-server-streamable-http.md:39 93字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/streamableHttp.ts
    [SKIP C25-URL] mcp-server-streamable-http.md:45 92字 https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    [SKIP C25-URL] mcp-server-streamable-http.md:54 99字 https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp
    [SKIP C25-URL] mcp-server-streamable-http.md:57 66字 https://modelcontextprotocol.io/specification/2026-07-28/changelog
    [SKIP C25-URL] mcp-server-streamable-http.md:60 89字 https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http
    [SKIP C25-URL] mcp-server-streamable-http.md:63 61字 https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
    [SKIP C25-URL] mcp-server-streamable-http.md:641 73字 https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
    [SKIP C25-URL] mcp-server-streamable-http.md:642 72字 https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle
    [SKIP C25-URL] mcp-server-streamable-http.md:643 64字 https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
    [SKIP C25-URL] mcp-server-streamable-http.md:644 79字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md
    [SKIP C25-URL] mcp-server-streamable-http.md:645 86字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/express.ts
    [SKIP C25-URL] mcp-server-streamable-http.md:646 110字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/middleware/hostHeaderValidation.ts
    [SKIP C25-URL] mcp-server-streamable-http.md:647 104字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/webStandardStreamableHttp.ts
    [SKIP C25-URL] mcp-server-streamable-http.md:648 117字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/examples/server/simpleStatelessStreamableHttp.ts
    [SKIP C25-URL] mcp-server-streamable-http.md:649 93字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/streamableHttp.ts
    [SKIP C25-URL] mcp-server-streamable-http.md:651 92字 https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    [SKIP C25-URL] mcp-server-streamable-http.md:654 99字 https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp
    [SKIP C25-URL] mcp-server-streamable-http.md:655 66字 https://modelcontextprotocol.io/specification/2026-07-28/changelog
    [SKIP C25-URL] mcp-server-streamable-http.md:656 89字 https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http
    [SKIP C25-URL] mcp-server-streamable-http.md:657 61字 https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
  outputs: ```text 19件、ログに一致 18件、例外 1件、ログ 53本（出力部分 53か所）
    例外: 「char-count-http/」 理由: 作業フォルダの構成を示すファイルの木。実行の出力ではない。
[候補 C16] mcp-server-streamable-http.md:118-120 30〜50字の文が7文続く
[候補 C16] mcp-server-streamable-http.md:286-292 30〜50字の文が9文続く
[候補 C16] mcp-server-streamable-http.md:389-411 30〜50字の文が7文続く
[候補 C16] mcp-server-streamable-http.md:462-487 30〜50字の文が6文続く
[候補 C16] mcp-server-streamable-http.md:543-594 30〜50字の文が15文続く
[候補 C16] mcp-server-streamable-http.md:621-627 30〜50字の文が5文続く
[候補 C16] mcp-server-streamable-http.md:627-637 30〜50字の文が7文続く
[候補 C28] mcp-server-streamable-http.md:100 「で始まる初期化のやり取りも」
[候補 C28] mcp-server-streamable-http.md:389 「アントとサーバーの最初のやり取りにする決まりです（」
[候補 C28] mcp-server-streamable-http.md:389 「この初期化のやり取りそのものが無くなり」
[候補 C28] mcp-server-streamable-http.md:609 「見逃しやすい行です」
SUMMARY mcp-server-streamable-http: 確定 0 {} / 候補 11 {"C16": 7, "C28": 4}
== mcp-server-typescript-stdio
  prose: 文 275、数えなかったコードブロックの行 150
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 30件
    [SKIP C25-URL] mcp-server-typescript-stdio.md:15 69字 https://modelcontextprotocol.io/specification/2025-11-25/server/tools
    [SKIP C25-URL] mcp-server-typescript-stdio.md:18 73字 https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
    [SKIP C25-URL] mcp-server-typescript-stdio.md:21 64字 https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
    [SKIP C25-URL] mcp-server-typescript-stdio.md:24 79字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md
    [SKIP C25-URL] mcp-server-typescript-stdio.md:27 84字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/stdio.ts
    [SKIP C25-URL] mcp-server-typescript-stdio.md:45 105字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
    [SKIP C25-URL] mcp-server-typescript-stdio.md:51 82字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/mcp.ts
    [SKIP C25-URL] mcp-server-typescript-stdio.md:54 94字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length
    [SKIP C25-URL] mcp-server-typescript-stdio.md:429 69字 https://modelcontextprotocol.io/specification/2025-11-25/server/tools
    [SKIP C25-URL] mcp-server-typescript-stdio.md:430 73字 https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
    [SKIP C25-URL] mcp-server-typescript-stdio.md:431 64字 https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
    [SKIP C25-URL] mcp-server-typescript-stdio.md:432 79字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md
    [SKIP C25-URL] mcp-server-typescript-stdio.md:433 84字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/stdio.ts
    [SKIP C25-URL] mcp-server-typescript-stdio.md:439 105字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
    [SKIP C25-URL] mcp-server-typescript-stdio.md:441 82字 https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/mcp.ts
    [SKIP C25-URL] mcp-server-typescript-stdio.md:442 94字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length
  outputs: ```text 10件、ログに一致 9件、例外 1件、ログ 21本（出力部分 42か所）
    例外: 「char-count-mcp/」 理由: 作業フォルダの構成を示すファイルの木。実行の出力ではない。
[候補 C16] mcp-server-typescript-stdio.md:79-89 30〜50字の文が12文続く
[候補 C16] mcp-server-typescript-stdio.md:89-102 30〜50字の文が8文続く
[候補 C16] mcp-server-typescript-stdio.md:228-232 30〜50字の文が5文続く
[候補 C16] mcp-server-typescript-stdio.md:318-322 30〜50字の文が5文続く
[候補 C16] mcp-server-typescript-stdio.md:401-410 30〜50字の文が8文続く
SUMMARY mcp-server-typescript-stdio: 確定 0 {} / 候補 5 {"C16": 5}
== promptfoo-llm-eval-intro
  prose: 文 296、数えなかったコードブロックの行 163
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 30件
    [SKIP C25-URL] promptfoo-llm-eval-intro.md:30 62字 https://www.promptfoo.dev/docs/configuration/expected-outputs/
    [SKIP C25-URL] promptfoo-llm-eval-intro.md:39 85字 https://github.com/promptfoo/promptfoo/blob/0.125.1/src/providers/claude-agent-sdk.ts
    [SKIP C25-URL] promptfoo-llm-eval-intro.md:48 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] promptfoo-llm-eval-intro.md:54 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] promptfoo-llm-eval-intro.md:444 62字 https://www.promptfoo.dev/docs/configuration/expected-outputs/
    [SKIP C25-URL] promptfoo-llm-eval-intro.md:447 85字 https://github.com/promptfoo/promptfoo/blob/0.125.1/src/providers/claude-agent-sdk.ts
    [SKIP C25-URL] promptfoo-llm-eval-intro.md:450 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] promptfoo-llm-eval-intro.md:452 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
  outputs: ```text 7件、ログに一致 7件、例外 0件、ログ 27本（出力部分 27か所）
[候補 C28] promptfoo-llm-eval-intro.md:305 「ラベルの前後に記号や説明の文が付いたからです」
SUMMARY promptfoo-llm-eval-intro: 確定 0 {} / 候補 1 {"C28": 1}
== rag-answer-with-citations-claude
  prose: 文 219、数えなかったコードブロックの行 222
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 18件
    [SKIP C25-URL] rag-answer-with-citations-claude.md:18 97字 https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
    [SKIP C25-URL] rag-answer-with-citations-claude.md:24 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] rag-answer-with-citations-claude.md:30 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] rag-answer-with-citations-claude.md:465 97字 https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
    [SKIP C25-URL] rag-answer-with-citations-claude.md:467 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] rag-answer-with-citations-claude.md:469 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
  outputs: ```text 6件、ログに一致 6件、例外 0件、ログ 35本（出力部分 35か所）
[候補 C16] rag-answer-with-citations-claude.md:49-51 30〜50字の文が6文続く
[候補 C16] rag-answer-with-citations-claude.md:410-428 30〜50字の文が7文続く
SUMMARY rag-answer-with-citations-claude: 確定 0 {} / 候補 2 {"C16": 2}
== rag-bm25-search-typescript
  prose: 文 223、数えなかったコードブロックの行 154
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 18件
    [SKIP C25-URL] rag-bm25-search-typescript.md:18 72字 https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf
    [SKIP C25-URL] rag-bm25-search-typescript.md:21 100字 https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/search/similarities/BM25Similarity.html
    [SKIP C25-URL] rag-bm25-search-typescript.md:24 77字 https://www.elastic.co/docs/reference/elasticsearch/index-settings/similarity
    [SKIP C25-URL] rag-bm25-search-typescript.md:30 105字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
    [SKIP C25-URL] rag-bm25-search-typescript.md:36 97字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    [SKIP C25-URL] rag-bm25-search-typescript.md:417 72字 https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf
    [SKIP C25-URL] rag-bm25-search-typescript.md:418 100字 https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/search/similarities/BM25Similarity.html
    [SKIP C25-URL] rag-bm25-search-typescript.md:419 77字 https://www.elastic.co/docs/reference/elasticsearch/index-settings/similarity
    [SKIP C25-URL] rag-bm25-search-typescript.md:421 105字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
    [SKIP C25-URL] rag-bm25-search-typescript.md:423 97字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
  outputs: ```text 11件、ログに一致 9件、例外 2件、ログ 17本（出力部分 17か所）
    例外: 「重み = idf × tf / (tf + k1 × (1 - b + b × 」 理由: BM25 の重みの式。実行の出力ではない。
    例外: 「1.281 × 2 / (2 + 1.2 × (0.25 + 0.75 × 22」 理由: 式への数値の代入の例（式）。実行の出力ではない。
[候補 C16] rag-bm25-search-typescript.md:213-217 30〜50字の文が5文続く
[候補 C28] rag-bm25-search-typescript.md:159 「依存を増やさないためにこの記事では」
SUMMARY rag-bm25-search-typescript: 確定 0 {} / 候補 2 {"C16": 1, "C28": 1}
== rag-chunking-japanese-text
  prose: 文 238、数えなかったコードブロックの行 230
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 16件
    [SKIP C25-URL] rag-chunking-japanese-text.md:18 88字 https://docs.langchain.com/oss/javascript/integrations/splitters/recursive_text_splitter
    [SKIP C25-URL] rag-chunking-japanese-text.md:24 105字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
    [SKIP C25-URL] rag-chunking-japanese-text.md:33 64字 https://platform.claude.com/docs/en/build-with-claude/embeddings
    [SKIP C25-URL] rag-chunking-japanese-text.md:477 88字 https://docs.langchain.com/oss/javascript/integrations/splitters/recursive_text_splitter
    [SKIP C25-URL] rag-chunking-japanese-text.md:479 105字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
    [SKIP C25-URL] rag-chunking-japanese-text.md:482 64字 https://platform.claude.com/docs/en/build-with-claude/embeddings
  outputs: ```text 6件、ログに一致 6件、例外 0件、ログ 14本（出力部分 14か所）
[候補 C16] rag-chunking-japanese-text.md:76-86 30〜50字の文が8文続く
[候補 C16] rag-chunking-japanese-text.md:241-272 30〜50字の文が5文続く
[候補 C16] rag-chunking-japanese-text.md:278-330 30〜50字の文が5文続く
[候補 C16] rag-chunking-japanese-text.md:464-468 30〜50字の文が5文続く
[候補 C28] rag-chunking-japanese-text.md:199 「を1つ増やし」
SUMMARY rag-chunking-japanese-text: 確定 0 {} / 候補 5 {"C16": 4, "C28": 1}
== rag-hybrid-search-rrf
  prose: 文 337、数えなかったコードブロックの行 205
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 28件
    [SKIP C25-URL] rag-hybrid-search-rrf.md:18 84字 https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion
    [SKIP C25-URL] rag-hybrid-search-rrf.md:24 100字 https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/search/similarities/BM25Similarity.html
    [SKIP C25-URL] rag-hybrid-search-rrf.md:42 105字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
    [SKIP C25-URL] rag-hybrid-search-rrf.md:48 91字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    [SKIP C25-URL] rag-hybrid-search-rrf.md:51 84字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    [SKIP C25-URL] rag-hybrid-search-rrf.md:533 84字 https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion
    [SKIP C25-URL] rag-hybrid-search-rrf.md:535 100字 https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/search/similarities/BM25Similarity.html
    [SKIP C25-URL] rag-hybrid-search-rrf.md:541 105字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
    [SKIP C25-URL] rag-hybrid-search-rrf.md:543 91字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    [SKIP C25-URL] rag-hybrid-search-rrf.md:544 84字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  outputs: ```text 9件、ログに一致 8件、例外 1件、ログ 23本（出力部分 23か所）
    例外: 「RRF の点数(d) = Σ 1 / (k + 順位(d))」 理由: RRF の点数の式。実行の出力ではない。
[候補 C16] rag-hybrid-search-rrf.md:94-96 30〜50字の文が5文続く
[候補 C16] rag-hybrid-search-rrf.md:241-266 30〜50字の文が8文続く
[候補 C16] rag-hybrid-search-rrf.md:345-347 30〜50字の文が5文続く
[候補 C16] rag-hybrid-search-rrf.md:395-413 30〜50字の文が8文続く
[候補 C16] rag-hybrid-search-rrf.md:505-507 30〜50字の文が5文続く
[候補 C16] rag-hybrid-search-rrf.md:515-523 30〜50字の文が5文続く
[候補 C28] rag-hybrid-search-rrf.md:94 「両方の中位が上に来やすい計算です」
SUMMARY rag-hybrid-search-rrf: 確定 0 {} / 候補 7 {"C16": 6, "C28": 1}
== rag-local-embeddings-transformers-js
  prose: 文 290、数えなかったコードブロックの行 141
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 34件
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:15 64字 https://platform.claude.com/docs/en/build-with-claude/embeddings
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:21 66字 https://huggingface.co/Xenova/multilingual-e5-small/tree/main/onnx
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:30 99字 https://github.com/huggingface/transformers.js/blob/4.3.2/packages/transformers/src/utils/dtypes.js
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:39 88字 https://github.com/microsoft/onnxruntime/blob/v1.30.0/js/node/script/install-metadata.js
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:42 79字 https://github.com/microsoft/onnxruntime/blob/v1.30.0/js/node/script/install.js
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:60 115字 https://github.com/huggingface/transformers.js/blob/4.3.2/packages/transformers/src/pipelines/feature-extraction.js
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:432 64字 https://platform.claude.com/docs/en/build-with-claude/embeddings
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:434 66字 https://huggingface.co/Xenova/multilingual-e5-small/tree/main/onnx
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:437 99字 https://github.com/huggingface/transformers.js/blob/4.3.2/packages/transformers/src/utils/dtypes.js
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:440 88字 https://github.com/microsoft/onnxruntime/blob/v1.30.0/js/node/script/install-metadata.js
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:441 79字 https://github.com/microsoft/onnxruntime/blob/v1.30.0/js/node/script/install.js
    [SKIP C25-URL] rag-local-embeddings-transformers-js.md:447 115字 https://github.com/huggingface/transformers.js/blob/4.3.2/packages/transformers/src/pipelines/feature-extraction.js
  outputs: ```text 9件、ログに一致 9件、例外 0件、ログ 56本（出力部分 56か所）
[候補 C16] rag-local-embeddings-transformers-js.md:175-193 30〜50字の文が8文続く
[候補 C16] rag-local-embeddings-transformers-js.md:221-223 30〜50字の文が7文続く
[候補 C16] rag-local-embeddings-transformers-js.md:341-343 30〜50字の文が5文続く
[候補 C16] rag-local-embeddings-transformers-js.md:407-409 30〜50字の文が5文続く
[候補 C16] rag-local-embeddings-transformers-js.md:413-420 30〜50字の文が5文続く
SUMMARY rag-local-embeddings-transformers-js: 確定 0 {} / 候補 5 {"C16": 5}
== rag-retrieval-eval-recall-mrr
  prose: 文 286、数えなかったコードブロックの行 281
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 22件
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:15 78字 https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-rank-eval
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:21 67字 https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:27 96字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:30 94字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:33 86字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:39 91字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:42 84字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:567 78字 https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-rank-eval
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:569 67字 https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:571 96字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:572 94字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:573 86字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:575 91字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    [SKIP C25-URL] rag-retrieval-eval-recall-mrr.md:576 84字 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  outputs: ```text 5件、ログに一致 5件、例外 0件、ログ 22本（出力部分 22か所）
[候補 C16] rag-retrieval-eval-recall-mrr.md:91-131 30〜50字の文が5文続く
[候補 C16] rag-retrieval-eval-recall-mrr.md:135-162 30〜50字の文が6文続く
[候補 C16] rag-retrieval-eval-recall-mrr.md:331-414 30〜50字の文が10文続く
[候補 C16] rag-retrieval-eval-recall-mrr.md:464-468 30〜50字の文が11文続く
[候補 C16] rag-retrieval-eval-recall-mrr.md:504-538 30〜50字の文が12文続く
[候補 C28] rag-retrieval-eval-recall-mrr.md:197 「えられる質問ばかりが残りやすくなるからです」
[候補 C28] rag-retrieval-eval-recall-mrr.md:468 「ハイブリッド検索をやめてベクトル検索に切り替」
[候補 C28] rag-retrieval-eval-recall-mrr.md:538 「質問を増やしても同じ向きになるかは」
[候補 C28] rag-retrieval-eval-recall-mrr.md:538 「増やしたあとで測り直します」
[候補 C28] rag-retrieval-eval-recall-mrr.md:546 「質問を何問に増やしても料金は変わりません」
SUMMARY rag-retrieval-eval-recall-mrr: 確定 0 {} / 候補 10 {"C16": 5, "C28": 5}
== structured-output-methods-compare
  prose: 文 291、数えなかったコードブロックの行 204
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 20件
    [SKIP C25-URL] structured-output-methods-compare.md:27 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] structured-output-methods-compare.md:30 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
    [SKIP C25-URL] structured-output-methods-compare.md:482 65字 https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts
    [SKIP C25-URL] structured-output-methods-compare.md:483 94字 https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
  outputs: ```text 5件、ログに一致 5件、例外 0件、ログ 11本（出力部分 11か所）
[候補 C16] structured-output-methods-compare.md:58-62 30〜50字の文が5文続く
[候補 C16] structured-output-methods-compare.md:265-281 30〜50字の文が10文続く
[候補 C28] structured-output-methods-compare.md:2 「構造化出力のやり方を比べる【プロンプト」
[候補 C28] structured-output-methods-compare.md:4 「に3通りのやり方で10件ずつ解かせま」
[候補 C28] structured-output-methods-compare.md:52 「3通りのやり方で10件ずつ解かせた」
[候補 C28] structured-output-methods-compare.md:140 「3つのやり方が共有するものを置き」
[候補 C28] structured-output-methods-compare.md:174 「3つのやり方は同じオプションで呼」
[候補 C28] structured-output-methods-compare.md:176 「3つのやり方で同じにしました」
[候補 C28] structured-output-methods-compare.md:328 「3つのやり方に同じ10件を順に渡」
[候補 C28] structured-output-methods-compare.md:417 「3つのやり方の30回とも」
[候補 C28] structured-output-methods-compare.md:427 「3つのやり方が保証するのは」
[候補 C28] structured-output-methods-compare.md:433 「3つのやり方のファイルの行数を数」
SUMMARY structured-output-methods-compare: 確定 0 {} / 候補 12 {"C16": 2, "C28": 10}
== zod-to-json-schema-tool-definition
  prose: 文 267、数えなかったコードブロックの行 172
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 26件
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:27 74字 https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:30 70字 https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:33 72字 https://platform.claude.com/docs/en/build-with-claude/structured-outputs
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:36 77字 https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:39 94字 https://github.com/anthropics/anthropic-sdk-typescript/blob/sdk-v1.3.0/src/helpers/beta/zod.ts
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:45 105字 https://github.com/anthropics/anthropic-sdk-typescript/blob/sdk-v1.3.0/src/resources/messages/messages.ts
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:434 74字 https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:435 70字 https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:436 72字 https://platform.claude.com/docs/en/build-with-claude/structured-outputs
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:437 77字 https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:438 94字 https://github.com/anthropics/anthropic-sdk-typescript/blob/sdk-v1.3.0/src/helpers/beta/zod.ts
    [SKIP C25-URL] zod-to-json-schema-tool-definition.md:440 105字 https://github.com/anthropics/anthropic-sdk-typescript/blob/sdk-v1.3.0/src/resources/messages/messages.ts
  outputs: ```text 7件、ログに一致 6件、例外 1件、ログ 24本（出力部分 24か所）
    例外: 「zod-tool-schema/」 理由: 作業フォルダの構成を示すファイルの木。実行の出力ではない。
[候補 C16] zod-to-json-schema-tool-definition.md:235-239 30〜50字の文が7文続く
[候補 C16] zod-to-json-schema-tool-definition.md:306-330 30〜50字の文が7文続く
[候補 C16] zod-to-json-schema-tool-definition.md:375-379 30〜50字の文が7文続く
[候補 C16] zod-to-json-schema-tool-definition.md:410-416 30〜50字の文が6文続く
[候補 C28] zod-to-json-schema-tool-definition.md:75 「2025年11月で保守をやめたと書いています（出典」
SUMMARY zod-to-json-schema-tool-definition: 確定 0 {} / 候補 5 {"C16": 4, "C28": 1}
== zod-validate-llm-json-output
  prose: 文 241、数えなかったコードブロックの行 184
  C25 で数えなかった URL だけの値（表のセル、frontmatter の値。全体が URL 1つ）: 18件
    [SKIP C25-URL] zod-validate-llm-json-output.md:27 80字 https://github.com/colinhacks/zod/blob/v4.6.7/packages/zod/src/v4/core/errors.ts
    [SKIP C25-URL] zod-validate-llm-json-output.md:33 72字 https://platform.claude.com/docs/en/build-with-claude/structured-outputs
    [SKIP C25-URL] zod-validate-llm-json-output.md:474 80字 https://github.com/colinhacks/zod/blob/v4.6.7/packages/zod/src/v4/core/errors.ts
    [SKIP C25-URL] zod-validate-llm-json-output.md:476 72字 https://platform.claude.com/docs/en/build-with-claude/structured-outputs
  outputs: ```text 10件、ログに一致 10件、例外 0件、ログ 15本（出力部分 15か所）
[候補 C16] zod-validate-llm-json-output.md:242-261 30〜50字の文が6文続く
[候補 C16] zod-validate-llm-json-output.md:296-337 30〜50字の文が10文続く
[候補 C16] zod-validate-llm-json-output.md:445-449 30〜50字の文が5文続く
[候補 C28] zod-validate-llm-json-output.md:343 「で読みやすい文字列に直します（出」
[候補 C28] zod-validate-llm-json-output.md:412 「英語の文はそのまま検索しやすいので」
SUMMARY zod-validate-llm-json-output: 確定 0 {} / 候補 5 {"C16": 3, "C28": 2}
```
