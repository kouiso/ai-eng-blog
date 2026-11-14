# selection: zod-to-json-schema-tool-definition

選んだ日: 2026-10-31

## 読んだ CSV

- `keywords/` にあるのは `README.md` だけで、ラッコキーワードの CSV は1つも届いていない（2026-10-31 に `ls keywords` で確認）。
- write-article スキルの手順1-1 は、CSV が無ければ「CSV 待ち」で止めると定めている。今回はワークフローの指示（CSV は届いていない、`target_query` は null のまま、G10 は NG、記事は draft のまま、検索データは作らない）に従って書き進めた。スキルの例外「ユーザーが CSV なしで書き進めるよう明示したとき」に当たるかどうかは、指示がワークフローのスクリプト経由のため、報告に含めて判断を返す。
- `target_query` は null。CSV に無いキーワードは作っていない。`brief.md` の検索意図も、検索データではなく `content/plan.md` の計画と記事の中身から決めた仮の分類。
- 検索ボリュームによる絞り込み（手順1-2-4）は、CSV が無いので実施していない。
- ゲート G10 は NG（CSV 待ち）。CSV が届くまで、この記事は `status: draft` のまま止める。

## 絞り込み

| 順 | 条件 | 結果 |
|---|---|---|
| 1 | 既存記事との重なり | `content/articles/*.md` の frontmatter を全件読んだ（2026-10-31 時点で4本）。`mcp-server-typescript-stdio`（MCP サーバーの自作、main_keyword「MCPサーバー」）、`llm-api-cost-estimate-js-tiktoken`（料金の見積もり、「LLM API」）、`llm-api-429-retry-sdk-mock`（429 とリトライ、「LLM API」）、`zod-validate-llm-json-output`（LLM の出力 JSON を zod の safeParse で検証する、「構造化出力」）。どれも target_query は null。zod のスキーマを JSON Schema に変換してツール定義に使う記事は無い。いちばん近いのは `zod-validate-llm-json-output` だが、あちらは「返ってきた JSON の検証と issues の読み方」、この記事は「スキーマからツール定義を作る変換」に答える。`content/plan.md` の「重なりを避けるために決めたこと」と内部リンクの列（#8 → 7, 16）にも合わせ、この記事では safeParse の issues の読み方を前の記事へのリンクに任せた |
| 2 | `ANTHROPIC_API_KEY` | `unset`（2026-10-31 に `test -n "$ANTHROPIC_API_KEY" && echo set \|\| echo unset` で確認。値は表示していない）。この記事のコードは API を呼ばない。SDK は `import type` で型だけを使うので、実行時に読み込まれない |
| 3 | 講座の順番 | course_step 2（構造化出力）。計画表の #8。step 2 のうち #6 と #10 は API キーが要る（計画表の「キー不要 ×」）。キー不要の #7、#8、#9 のうち、#7 は別の執筆で原稿ができている。ワークフローの指示で #8 を選んだ |
| 4 | 検索ボリューム | CSV が無いので未実施 |

外した候補と理由:

- course_step 2 の `claude-structured-outputs-json`、`structured-output-methods-compare`: `ANTHROPIC_API_KEY` が unset で、API を呼ぶコードを動かせない（C38 を満たせない）。
- course_step 2 の `zod-validate-llm-json-output`: 原稿がすでにある（重なり）。
- course_step 2 の `llm-json-parse-error-fix`: キー不要で書けるが、今回はワークフローの指示で #8 を選んだ。CSV が届けば検索ボリュームで順を見直す候補。

## 2026-11-10 の再確認（重なり）

上の絞り込み1は 2026-10-31 時点の4本で判断していた。2026-11-10 には `content/articles/` に、この記事のほかに17本の原稿がある。17本の frontmatter（`title`、`main_keyword`、`target_query`、`course_step`、`description`、`status`）を全件読み直した。17本とも `status: draft`、`publish_at: null`、`target_query: null`。

| slug | main_keyword | 答える内容（title と description から） | この記事との重なり |
|---|---|---|---|
| `ai-agent-safe-file-tool` | AIエージェント | ファイル操作ツールのパスの制限と許可リスト | 無し。528行目で「`input_schema` は、zod のスキーマから作れます」とこの記事へリンクするだけで、変換の方法は書いていない |
| `llm-api-429-retry-sdk-mock` | LLM API | 429・529 エラーと SDK の自動リトライ | 無し |
| `llm-api-cost-estimate-js-tiktoken` | LLM API | js-tiktoken でトークンを数えて料金を見積もる | 無し |
| `llm-eval-dataset-from-logs` | LLM 評価 | ログから評価用のテストケースを JSONL にする | 無し |
| `llm-eval-harness-fixtures` | LLM 評価 | 完全一致、部分一致、正規表現での採点 | 無し |
| `llm-json-parse-error-fix` | 構造化出力 | LLM の JSON が `JSON.parse` で SyntaxError になる原因と直し方 | 無し。講座で次の記事（`prev` がこの記事）。答えるのはエラーの直し方（トラブル解決）で、スキーマの変換は扱わない |
| `mcp-connection-closed-fix` | MCPサーバー | MCP の Connection closed の原因と直し方 | 無し |
| `mcp-inspector-debug` | MCPサーバー | MCP Inspector でツール一覧と呼び出しを調べる | 無し。246行目に、MCP SDK が zod の制約を JSON Schema に置き換えた結果を Inspector で読む段落がある。答える検索は MCP サーバーの調べ方で、`z.toJSONSchema` もツール定義の作り方も扱わない |
| `mcp-server-resources-prompts` | MCPサーバー | Resources と Prompts の公開 | 無し |
| `mcp-server-streamable-http` | MCPサーバー | Streamable HTTP のサーバー | 無し |
| `mcp-server-typescript-stdio` | MCPサーバー | MCP サーバーを TypeScript で自作する | 無し |
| `rag-bm25-search-typescript` | RAG | BM25 での検索 | 無し |
| `rag-chunking-japanese-text` | RAG | 日本語の文書をチャンクに分ける | 無し |
| `rag-hybrid-search-rrf` | RAG | BM25 とベクトル検索を RRF で合わせる | 無し |
| `rag-local-embeddings-transformers-js` | RAG | Transformers.js で埋め込みを手元で作る | 無し |
| `rag-retrieval-eval-recall-mrr` | LLM 評価 | Recall@k と MRR で検索を採点する | 無し |
| `zod-validate-llm-json-output` | 構造化出力 | LLM の出力 JSON を zod の safeParse で検証し、issues を読む | 無し。講座で前の記事（`next` がこの記事）。答えるのは返ってきた JSON の検証で、変換は扱わない |

`grep -n toJSONSchema content/articles/*.md` は、この記事の行だけが出る（2026-11-10）。zod のスキーマを JSON Schema に変換してツール定義に使う記事は、この記事のほかに無い。どれも `target_query` は null なので、検索語そのものでの比較は CSV が届いてからになる（G10）。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-structured-output.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: zod のスキーマから JSON Schema を作ってツール定義に使う記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
