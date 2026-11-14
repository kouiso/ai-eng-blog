# 30本の記事計画（パイロット1本 + 29本）

作成日: 2026-10-31

## この表の前提

- 読者と講座の順番は `CLAUDE.md` と `.claude/skills/write-article/SKILL.md` の「読者」「入門ステップ講座の順番」に合わせています。各ステップ5本ずつで、ステップ5はパイロットを含めて5本です。
- ラッコキーワードの CSV はまだ届いていません。最初の回は、Google のサジェストを集めた CSV（`keywords/google-suggest-*.csv`）で `target_query` を選びました（オーナーの裁定 2026-11-11）。30本のうち28本に付け、合う行が無かった2本（`ai-agent-safe-file-tool`、`llm-json-parse-error-fix`）は null、ゲート G10 は NG のままです。どの記事も `status: draft` です。下の「検索意図」の列は記事の中身から決めた分類で、検索データではありません。公開後は Search Console の実測で `target_query` を見直します。
- `ANTHROPIC_API_KEY` は使いません。オーナーの裁定（2026-11-11。費用を月額のプランの範囲に収める趣旨）により、すべての記事のコードをオーナーの Claude プランで Claude Agent SDK か `claude -p` から動かします。キーが入るのを待つ記事はありません。ログインのトークンを取り出して Messages API を直接呼ぶことはしません（https://code.claude.com/docs/en/legal-and-compliance 、2026-11-11 確認）。
- 2026-11-10 に、オーナー自身の Claude プランで Claude Agent SDK と `claude -p` を動かせることを確かめ、「キー不要」の列に「プラン」を足しました（判定基準は下の「プラン（Agent SDK、claude -p）の判定基準」）。
- 重なりの判定は guides/01 §1（検索意図の4タイプ）と §5（内部リンク）に沿っています。同じ検索意図に答える記事は2本作らず、隣り合う記事は内部リンクでつなぎます。

## キー不要（○）の判定基準

記事の中のコードブロックを、LLM の API キーも有料サービスも使わずに、すべて実際に動かせる場合だけ ○ にしました。

- モデルの出力の形をしたデータを使う記事は、手で作った見本であることを本文に明記する前提で ○ にしています。実際のモデルの出力として載せることはしません。
- Claude のトークン数をオフラインで正確に数える方法はありません。`@anthropic-ai/tokenizer` の README は「Claude 3 以降では正確ではない」と書いています（https://github.com/anthropics/anthropic-tokenizer-typescript 、2026-10-31 確認）。そのため、トークン数の記事は OpenAI のトークナイザー（js-tiktoken、語彙ファイルを同梱）で数える内容にしています。
- ローカルの埋め込みモデルは、Hugging Face から無料でダウンロードできることを確かめました（2026-10-31、`Xenova/multilingual-e5-small` の config.json が HTTP 200）。
- 本来の書き方なら API を呼ぶ記事を、○ にするために無理に作り替えることはしていません。

## プラン（Agent SDK、claude -p）の判定基準

読者に見せるコードが Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）か `claude -p` で、それでもその記事の検索意図に答えられる場合だけ「プラン」にしました。コードはオーナーの Claude プランで実際に動かし、記事の frontmatter は `needs_api_key: false` にします。書き方の決まりは `.claude/skills/write-article/SKILL.md` の「Claude プランで動かす記事（Agent SDK、claude -p）」です。

- 以前は、検索意図が Messages API（`@anthropic-ai/sdk`）そのものに向いている記事を × にしていました。2026-11-11 のオーナーの裁定で、その7本（1、2、5、6、10、14、16）は、同じ問いに Agent SDK か `claude -p` で答える記事に差し替えました。Messages API の書き方を見せる記事は書きません。
- 「プラン」の記事は本文で、実行した分が読者自身の Claude プランの利用枠から引かれることを書きます（根拠は https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan 、2026-11-10 確認）。利用規約についての注意書きは本文に足しません（オーナーの裁定 2026-11-11）。コードには `strictMcpConfig: true`（`claude -p` は `--strict-mcp-config`）を付け、claude.ai のコネクタを読み込ませません。

2026-11-10 にこの環境で確かめたこと（Agent SDK 0.3.322、Claude Code 2.1.322、Node.js 22.22.0、`ANTHROPIC_API_KEY` は unset）。

- `query()` に `model: "haiku"` を渡すと `result` が `"ok"`、`subtype` が `success`。init メッセージの `apiKeySource` は `"none"` で、API キーを使っていない。`claude -p --output-format json` も同じく `"result":"ok"` を返した。
- 結果の `total_cost_usd` と `modelUsage[].costUSD` は定価で換算した見積もりで、`costBasis` は `"list"`。SDK の型定義のコメントも「An estimate, not a billing statement」と書いている。プランで動かした場合の請求額ではない。
- 既定のままだと Claude Code のシステムプロンプトとツール定義が付き、`cache_creation_input_tokens` が 42,461 だった。`tools: []` と短い `systemPrompt` を渡すと 4,947 に減った。
- `maxTurns: 1` でツールが要る依頼をすると `subtype: "error_max_turns"`、`maxBudgetUsd: 0.0005` では `subtype: "error_max_budget_usd"` の結果が返る。どちらも結果を返したあとに、`for await` のループが「Claude Code returned an error result」の例外を投げる。予算の判定はターンの後なので、`total_cost_usd` は 0.00118963 と上限を超えていた。
- `outputFormat`（`type: "json_schema"`）を渡すと、結果の `structured_output` にスキーマどおりのオブジェクトが入った。
- promptfoo 0.125.1 の `anthropic:claude-agent-sdk` プロバイダーは、`apiKeyRequired: false` を付けると API キーなしで評価を最後まで実行し、`equals` のアサーションが PASS になった。

## 計画表

| # | ステップ | メインキーワード | slug | 仮タイトル | 検索意図 | キー不要 | 判定の理由 | 主な内部リンク先 |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | LLM API | `claude-p-script-first-call` | LLM API を月額プランで初めて呼ぶ【claude -p をスクリプトから使う、JSON で受け取る】 | やり方 | プラン | `claude -p --output-format json` はプランのログインで動く。スクリプトから呼んで JSON の結果を読むところまで示せる | 2, 5, 17 |
| 2 | 1 | LLM API | `claude-agent-sdk-streaming` | LLM の応答をストリーミングで1文字ずつ表示する【Agent SDK、includePartialMessages】 | やり方 | プラン | Agent SDK の `includePartialMessages` で部分メッセージのイベントを受け取る。プランのログインで動かす | 1, 17 |
| 3 | 1 | LLM API | `llm-api-cost-estimate-js-tiktoken` | OpenAI API の料金をリクエスト前に見積もる【js-tiktoken でトークンを数える】 | やり方 | ○ | js-tiktoken は語彙を同梱しオフラインで動く。料金表は公式ページを読むだけ。Claude のトークン数は数えられないことを明記する | 1 |
| 4 | 1 | LLM API | `llm-api-429-retry-sdk-mock` | LLM API の 429・529 エラーとリトライ【SDK の自動リトライを手元のモックで確かめる】 | エラー | ○ | SDK の `baseURL` を手元の HTTP サーバーに向け、ダミーの文字列をキーに渡す。リクエストは外に出ない | 2, 5 |
| 5 | 1 | LLM API | `claude-code-api-key-billing-auth` | LLM API が従量課金になる原因と直し方【Agent SDK、claude -p、Invalid API key】 | エラー | プラン | init メッセージの `apiKeySource` で、どの認証で動いているかを確かめられる。ダミーの無効なキーでエラーを再現し、請求は発生しない | 1, 17 |
| 6 | 2 | 構造化出力 | `claude-agent-sdk-structured-output` | Claude で JSON を確実に返す【Agent SDK の outputFormat と JSON Schema】 | やり方 | プラン | `outputFormat`（`type: "json_schema"`）で結果の `structured_output` にスキーマどおりのオブジェクトが入ることを確かめた | 7, 10 |
| 7 | 2 | 構造化出力 | `zod-validate-llm-json-output` | LLM の出力 JSON を zod で検証する【safeParse のエラーの読み方】 | やり方 | ○ | 検証するのはモデルの出力の形をした手作りの見本。zod だけで動く | 6, 8, 9 |
| 8 | 2 | 構造化出力 | `zod-to-json-schema-tool-definition` | zod のスキーマから JSON Schema を作ってツール定義に使う【zod v4 の z.toJSONSchema】 | やり方 | ○ | スキーマの変換と出力の確認だけで、API は呼ばない | 7, 16 |
| 9 | 2 | 構造化出力 | `llm-json-parse-error-fix` | LLM の返した JSON が JSON.parse で落ちる原因と直し方【コードフェンス、途中で切れる】 | エラー | ○ | 失敗する文字列は手作りの見本。直す関数はただの TypeScript | 7 |
| 10 | 2 | 構造化出力 | `structured-output-methods-compare` | 構造化出力のやり方を比べる【プロンプト指示、自作ツール、outputFormat】 | 比較 | プラン | 3つのやり方を Agent SDK でそれぞれ呼び、結果を比べる。プランのログインで動かす | 6, 7 |
| 11 | 3 | RAG | `rag-bm25-search-typescript` | RAG の検索部分を BM25 で作る【TypeScript、API キーなしで動く】 | やり方 | ○ | 検索は手元の計算だけ。生成は扱わない | 12, 15, 28 |
| 12 | 3 | RAG | `rag-chunking-japanese-text` | RAG 用に日本語の文書をチャンクに分ける【文字数、見出し、重なり】 | やり方 | ○ | 文字列を分ける処理だけで、外部サービスを使わない | 11, 13 |
| 13 | 3 | RAG | `rag-local-embeddings-transformers-js` | 埋め込みを手元で作ってベクトル検索する【Transformers.js、API キー不要】 | やり方 | ○ | 埋め込みモデルは Hugging Face から無料で落としてローカルで動かす。ダウンロードできることは確認済み | 11, 15 |
| 14 | 3 | RAG | `rag-answer-with-citations-claude` | RAG で検索結果を渡して出典つきで回答させる【Claude Agent SDK、出典の番号を検証する】 | やり方 | プラン | 検索結果を Agent SDK に渡し、`outputFormat` で出典の ID つきの回答を受け取って、渡した ID と照合する。Messages API の Citations は使わない | 11, 6 |
| 15 | 3 | RAG | `rag-hybrid-search-rrf` | RAG のハイブリッド検索を TypeScript で作る【BM25 とベクトル検索を RRF で合わせる】 | やり方 | ○ | 11 と 13 の結果を順位で合わせる計算だけ | 11, 13, 28 |
| 16 | 4 | AIエージェント | `ai-agent-custom-tools-agent-sdk` | AI エージェントに自作ツールを渡す【Agent SDK の tool() とツール呼び出しの流れ】 | やり方 | プラン | `tool()` で作ったツールを Agent SDK に渡し、モデルがツールを選んで呼ぶ流れをメッセージで追う。プランのログインで動かす | 8, 17, 18 |
| 17 | 4 | AIエージェント | `claude-agent-sdk-first-agent` | Claude Agent SDK で最初のエージェントを動かす【TypeScript、Claude プランで試す】 | やり方 | プラン | 記事の主題が Agent SDK そのもの。`query()` はプランのログインで動き、`apiKeySource` が `"none"` になることを確かめた | 16, 18 |
| 18 | 4 | AIエージェント | `ai-agent-max-turns-budget-limit` | AI エージェントを上限で止める【Claude Agent SDK の maxTurns と maxBudgetUsd】 | やり方 | プラン | 本物のループを Agent SDK で回し、`error_max_turns` と `error_max_budget_usd` で止まることと、そのあと例外が投げられることを示す（どちらも確かめた）。ツールの渡し方は 16 にリンクで任せる | 17, 16 |
| 19 | 4 | AIエージェント | `ai-agent-safe-file-tool` | AI エージェントに渡すファイル操作ツールを安全に作る【パスの制限と許可リスト】 | やり方 | ○ | ツール関数に危ない入力を直接渡して確かめる。モデルにつなぐ部分は 16 へのリンクに任せ、この記事にはコードを置かない | 16, 21 |
| 20 | 4 | AIエージェント | `ai-agent-vs-workflow` | AI エージェントとワークフローの違い【決まった手順なら LLM を順に呼ぶだけでいい】 | 概念 | プラン | 概念の記事で、Messages API の書き方は検索意図に入らない。ワークフローは `tools: []` と `maxTurns: 1` の `query()` をコードで順に呼び、エージェントはツールを渡した `query()` 1回で見せる | 16, 17 |
| 21 | 5 | MCPサーバー | `mcp-server-typescript-stdio`（パイロット、作成済み） | MCP サーバーを TypeScript で自作する手順【SDK v1.32.2、Claude Code に接続まで】 | やり方 | ○ | 作成済み。stdio、ツール1つ、SDK のクライアントでの確認、`claude mcp add`、stdout のログの落とし穴を扱う | 22, 23, 24, 25 |
| 22 | 5 | MCPサーバー | `mcp-server-streamable-http` | MCP サーバーを Streamable HTTP で動かす【TypeScript SDK、リモート接続の準備】 | やり方 | ○ | localhost のサーバーに SDK のクライアントからつなぐだけ。claude.ai からの接続は言及にとどめコードは置かない | 21, 23 |
| 23 | 5 | MCPサーバー | `mcp-inspector-debug` | MCP Inspector で MCP サーバーを調べる【ツール一覧と呼び出しを画面と CLI で】 | やり方 | ○ | Inspector は npx で手元で動く。CLI モードで結果を記録できる | 21, 25 |
| 24 | 5 | MCPサーバー | `mcp-server-resources-prompts` | MCP サーバーで Resources と Prompts を公開する【ツール以外の2つの機能】 | やり方 | ○ | SDK のクライアントで一覧と取得を確かめる。モデルは使わない | 21 |
| 25 | 5 | MCPサーバー | `mcp-connection-closed-fix` | MCP サーバーにつながらない（Connection closed）原因と直し方 | エラー | ○ | 失敗の再現も直したあとの確認も SDK のクライアントで行う。stdout にログを書く原因は 21 にあるのでリンクで済ませる | 21, 23 |
| 26 | 6 | LLM 評価 | `llm-eval-harness-fixtures` | LLM の回答を自動で採点する仕組みを作る【完全一致、部分一致、正規表現】 | やり方 | ○ | 採点するのは手作りの見本の回答で、採点の処理だけを動かす。実際のモデルの出力とは書かない | 27, 30 |
| 27 | 6 | LLM 評価 | `llm-as-a-judge-claude` | LLM-as-a-Judge で回答を採点する【Claude Agent SDK に基準と JSON スキーマを渡す】 | やり方 | プラン | 中身は採点基準の書き方と採点結果の受け取り方で、呼び出し口は問わない。`tools: []`、短い `systemPrompt`、`outputFormat` で採点結果を `structured_output` に受け取れることを確かめた。Structured Outputs の API の説明は 6 に任せる | 26, 29 |
| 28 | 6 | LLM 評価 | `rag-retrieval-eval-recall-mrr` | LLM 評価で RAG の検索を採点する【Recall@k と MRR を TypeScript で】 | やり方 | ○ | 11・15 の検索器と、手で作った質問と正解の組で計算する | 11, 15, 26 |
| 29 | 6 | LLM 評価 | `promptfoo-llm-eval-intro` | promptfoo で LLM のプロンプトを評価する【設定ファイル1つから、Claude プランで動かす】 | やり方 | プラン | 記事の中身は promptfoo の設定（prompts、providers、tests、assert）。公式の `anthropic:claude-agent-sdk` プロバイダーに `apiKeyRequired: false` を付けて、モデルを呼ぶ評価が通ることを確かめた | 26, 27 |
| 30 | 6 | LLM 評価 | `llm-eval-dataset-from-logs` | LLM 評価用のテストケースを作る【ログから選んで JSONL にする】 | やり方 | ○ | 手作りのログの見本から重複を除き、件数を揃えて書き出す処理だけ | 26, 28 |

## 公開の順番

読者が上から読む順に、1日1本ずつ公開します。並びは講座の順番（1 LLM API → 2 構造化出力 → 3 RAG → 4 AIエージェント → 5 MCPサーバー → 6 LLM 評価）です。同じステップの中では、各記事の frontmatter の `prev` と `next`、本文の「前の記事」「次の記事」のリンクがつながる順にしました。先に出る記事が、あとに出る記事を読んでいないと分からない作りにはなっていません。

1番の `claude-p-script-first-call` は、API キーなしで初めて LLM を呼ぶ入口の記事で、公開のパイロットです。この1本を公開まで通してから、2番以降に進みます。上の計画表の 21（`mcp-server-typescript-stdio`）は、最初に書いた記事という意味のパイロットです。

| 順番 | ステップ | slug | この位置にした理由 |
|---|---|---|---|
| 1 | 1 | `claude-p-script-first-call` | 講座の入口。月額プランのログインだけで初めて呼ぶ。`prev` が無い |
| 2 | 1 | `claude-agent-sdk-streaming` | 1番の呼び方を前提に、応答を少しずつ表示する |
| 3 | 1 | `llm-api-cost-estimate-js-tiktoken` | 呼べるようになったあとで、料金を先に見積もる |
| 4 | 1 | `llm-api-429-retry-sdk-mock` | 本文が3番を「前の記事」として受ける |
| 5 | 1 | `claude-code-api-key-billing-auth` | `claude -p` と Agent SDK を一度動かした人向けと本文にある。1番と2番のあとに置く |
| 6 | 2 | `claude-agent-sdk-structured-output` | 構造化出力の入口。`outputFormat` で JSON を返させる |
| 7 | 2 | `zod-validate-llm-json-output` | 本文が6番を「前の記事」として受け、返った JSON を検証する |
| 8 | 2 | `zod-to-json-schema-tool-definition` | 7番の zod のスキーマを JSON Schema に変える |
| 9 | 2 | `llm-json-parse-error-fix` | 本文が8番を「前の記事」として受ける。形の検証は7番に任せる |
| 10 | 2 | `structured-output-methods-compare` | 6番から9番で見たやり方を比べる。比べる記事なので最後に置く |
| 11 | 3 | `rag-bm25-search-typescript` | RAG の入口。キーなしで検索部分を作る |
| 12 | 3 | `rag-chunking-japanese-text` | 本文が11番の検索を前提に、文書を分ける |
| 13 | 3 | `rag-local-embeddings-transformers-js` | 11番の BM25 と同じ FAQ でベクトル検索を作る |
| 14 | 3 | `rag-answer-with-citations-claude` | 11番の検索器で取った結果を Claude に渡して答えさせる |
| 15 | 3 | `rag-hybrid-search-rrf` | 11番と13番の2つの検索を合わせる。両方が先に要る |
| 16 | 4 | `ai-agent-custom-tools-agent-sdk` | `query()` はステップ1から3で使っている。本文は `query()` の詳しい説明を17番に任せている |
| 17 | 4 | `claude-agent-sdk-first-agent` | 本文が16番を「前の記事」として受け、`query()` のメッセージの読み方を扱う |
| 18 | 4 | `ai-agent-max-turns-budget-limit` | 本文が17番を「前の記事」として受け、ループの止め方を足す |
| 19 | 4 | `ai-agent-safe-file-tool` | 16番のツールの渡し方と18番の上限を前提に、ツール関数を守る |
| 20 | 4 | `ai-agent-vs-workflow` | 16番から19番を受けて、エージェントとワークフローの違いをまとめる |
| 21 | 5 | `mcp-server-typescript-stdio` | MCP の入口。ほかの MCP の記事がすべてこの記事のサーバーを使う |
| 22 | 5 | `mcp-server-streamable-http` | 本文が21番を「前の記事」として受け、HTTP で動かす |
| 23 | 5 | `mcp-inspector-debug` | 21番のサーバーを Inspector で調べる |
| 24 | 5 | `mcp-server-resources-prompts` | 23番で調べ方を知ってから、ツール以外の機能を足す |
| 25 | 5 | `mcp-connection-closed-fix` | 21番と23番を前提に、つながらないときの直し方を扱う |
| 26 | 6 | `llm-eval-harness-fixtures` | 評価の入口。手作りの見本で採点の処理を作る |
| 27 | 6 | `llm-as-a-judge-claude` | 本文が26番を「前の記事」として受け、決まった形で採点できない観点を扱う |
| 28 | 6 | `rag-retrieval-eval-recall-mrr` | 11番と15番の検索器を測る。回答の採点は26番に任せる |
| 29 | 6 | `promptfoo-llm-eval-intro` | 26番と27番の採点の考え方を、既製のツールで回す |
| 30 | 6 | `llm-eval-dataset-from-logs` | 29番で手で書いたテストケースを、ログから作る。`next` が無い |

## 本数のまとめ

| ステップ | 本数 | キー不要 ○ | プラン | キーが要る × |
|---|---|---|---|---|
| 1 LLM API | 5 | 2 | 3 | 0 |
| 2 構造化出力 | 5 | 3 | 2 | 0 |
| 3 RAG | 5 | 4 | 1 | 0 |
| 4 AIエージェント | 5 | 1 | 4 | 0 |
| 5 MCPサーバー | 5（パイロット含む） | 5 | 0 | 0 |
| 6 LLM 評価 | 5 | 3 | 2 | 0 |
| 合計 | 30 | 18（新規17 + パイロット） | 12 | 0 |

プランの12本（1、2、5、6、10、14、16、17、18、20、27、29）は、読者に見せるコードが Agent SDK か `claude -p` で、オーナーの Claude プランで動かします。× の記事はありません。1、2、5、6、10、14、16 は、以前は Messages API の記事として × でしたが、2026-11-11 の裁定で Agent SDK か `claude -p` の記事に差し替えました。

## 重なりを避けるために決めたこと

- 7（zod での検証）と 9（JSON.parse の失敗）は、前者が「形が合っているか」、後者が「JSON として読めるか」に答えます。お互いにリンクし、同じ例を使い回しません。
- 11（BM25 を作る）と 28（検索を測る）は、作る記事と測る記事に分けます。28 は 11 の検索器をそのまま使います。
- 19（エージェントのファイル操作ツール）は MCP の話をせず、ツール関数の安全性だけを扱います。MCP のツールは 21 以降に任せます。
- 25（つながらない）は、パイロット 21 の「stdout にログを書くと SDK のクライアントは行を捨てる」の節を繰り返しません。
- 26（自作の採点）と 29（promptfoo）は、自分で書くか既製のツールを使うかで分けます。
- 17（Agent SDK を動かす）と 18（止める）は、17 が導入と `query()` のメッセージの読み方、18 が `maxTurns`・`maxBudgetUsd` と止まったときの結果と例外だけを扱います。16（自作ツール）は `tool()` でツールを作って渡し、呼び出しの流れを追うところまでにして、上限は 18 にリンクします。
- 27（LLM-as-a-Judge）は `outputFormat` を使いますが、Structured Outputs の説明はせず 6 にリンクします。29（promptfoo）は採点の考え方を繰り返さず、26 と 27 にリンクします。
