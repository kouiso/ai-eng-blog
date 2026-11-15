# selection: llm-eval-dataset-from-logs

選んだ日: 2026-11-02（2026-11-10 に既存記事との重なりと CSV の有無を確かめ直した）

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-02 と 2026-11-10 に `ls keywords` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。この記事を書いたのは、ワークフローの指示（CSV なしで書き進め、G10 を NG にして下書きで止める）によるもので、テーマ、slug、タイトル、記事の型は `content/plan.md` の #30 とワークフローの指示に従った。人気度の比較（CSV の検索ボリューム、Google トレンド、Search Console）は、比べる候補の一覧が無いので行っていない。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-02、2026-11-10）。値は表示もしていないし、どこにも残していない。

この記事のコードは API を呼ばない。読み込むログは手で作った見本（`code/logs.jsonl`）で、処理は Node.js の標準の機能（`node:fs`、`String.prototype.normalize`、`Array.prototype.sort` など）だけの TypeScript。`needs_api_key: false`。

## 既存記事との重なり（G06）

`content/articles/*.md` の frontmatter（title、main_keyword、target_query）を全件読んだ（2026-11-02 はこの記事のほか17本、2026-11-10 に読み直したときは20本）。`main_keyword: "LLM 評価"`（course_step 6）の記事は、`llm-eval-harness-fixtures` と `rag-retrieval-eval-recall-mrr` の2本。

| slug | main_keyword | 答える検索意図 | 重なり |
|---|---|---|---|
| `llm-eval-harness-fixtures` | LLM 評価 | 回答をコードで採点する方法（完全一致、部分一致、正規表現）と合格率 | なし。あちらはテストケースが手元にある前提で、回答の採点に答える。この記事は、採点の前に要るテストケースの質問を、ログから選んで JSONL のファイルにすることに答える。期待する答えと採点の指定は、この記事ではあちらに任せ、本文でリンクした |
| `rag-retrieval-eval-recall-mrr` | LLM 評価 | RAG の検索の良し悪しを Recall@k と MRR で測る | なし。あちらは質問と正解の文書の組がある前提で、検索の結果に点を付ける。この記事は評価にかける質問をログから選ぶ側。本文では、検索の評価に要る正解の文書の id はこの記事のログに無く、その組はこの手順では作れないと書いて、測り方をあちらにリンクした（2026-11-10 に直した。前の版は同じ手順で作れると確かめずに書いていた） |
| `zod-validate-llm-json-output` | 構造化出力 | LLM の出力 JSON の形を zod で検証する | なし。この記事ではログの行の欄の検証を扱わず、そこだけあちらにリンクした |
| `zod-to-json-schema-tool-definition`、`llm-json-parse-error-fix` | 構造化出力 | ツール定義の作り方、JSON.parse の失敗の直し方 | なし。`llm-json-parse-error-fix` はモデルの返した文字列が JSON として読めない原因を直す記事で、この記事の「切れた行をとばす」とは対象（モデルの出力とログのファイル）と目的（直す、とばす）が違う |
| `llm-api-cost-estimate-js-tiktoken`、`llm-api-429-retry-sdk-mock` | LLM API | 料金の見積もり、429・529 のリトライ | なし |
| `rag-bm25-search-typescript`、`rag-chunking-japanese-text`、`rag-local-embeddings-transformers-js`、`rag-hybrid-search-rrf` | RAG | 検索部分の作り方 | なし |
| `ai-agent-safe-file-tool`、`ai-agent-max-turns-budget-limit`、`ai-agent-vs-workflow`、`claude-agent-sdk-first-agent` | AIエージェント | ファイル操作ツールの安全な作り方、エージェントの止め方、ワークフローとの違い、Agent SDK の最初の一歩 | なし（後ろの3本は 2026-11-10 に読み直したときに増えていた） |
| `mcp-server-typescript-stdio`、`mcp-server-streamable-http`、`mcp-inspector-debug`、`mcp-server-resources-prompts`、`mcp-connection-closed-fix` | MCPサーバー | MCP サーバーの作り方、調べ方、つながらないときの直し方 | なし |

`target_query` はどの記事も null なので、検索語での突き合わせはできない。上の判断は記事の中身で行った。#29（promptfoo）とは、既製のツールでの評価と、評価にかけるデータの用意とで分かれる。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 6）とキー不要（○）は `content/plan.md` の #30 の判定をそのまま使った。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-eval.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: ログから選んだ質問を JSONL のテストケースにする手順を示す記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。

## 2026-11-14 追記: target_query を `llm 評価 データセット` に決めた

- 読んだ CSV は `keywords/LLM 評価.csv`（ラッコキーワードのサジェストの書き出し。2026-11-14）。ラッコキーワードの無料プランで書き出したので、検索数の列は null で、人気度は比べていない。
- `target_query` は、CSV の「キーワード」（サジェストの CSV は `suggestion`）の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-14 にスクリプトで確かめた。
- 選んだ理由: ログから評価用のデータを作る手順を扱う記事なので、「データセット」を含む語が読者の探し方に最も近い。以前の `llm テストケース作成` より、講座6（LLM 評価）の親の語に近いため置き換えた。
- 公開後に Search Console の実測で見直す。CSV の行や件数は、ラッコの利用規約の都合でこのリポジトリには写していない（`keywords/README.md`）。

## 2026-11-15 追記（#87 の1。人気度と外した候補）

#83 で `target_query` を `llm 評価 データセット` に変えた。そのときの SKILL.md:117（人気度）と SKILL.md:409（外した候補）の記録が抜けていた。その分をここに足す。`target_query` と G10 の判定は変えない。

### 人気度（SKILL.md:117）

比べていない。

- ラッコの書き出しの「月間検索数」は6つの CSV のすべての行で null だった。無料プランで書き出したためだ。2026-11-15 にスクリプトで確かめた。サジェストの CSV にも検索数の列は無い。
- 検索数が無いときは Google トレンドで候補を比べるのが SKILL.md:117 の手順だ。この変更ではトレンドでの比較を実行していない。
- 別の記事で前にトレンドを取りに行ったときは HTTP 429 が返り、取れなかった（`logs/claude-p-script-first-call/selection.md` の62〜68行目）。
- 残ったこの手順は #87 で開いたままにしておく。
- そのため `llm 評価 データセット` が候補の中で検索の多い語かどうかは裏付けが無い。公開後に Search Console の実測で見直す。

### 外した候補（SKILL.md:409）

読んだのは `keywords/LLM 評価.csv`（ラッコ）と `keywords/google-suggest-llm-eval.csv`（サジェスト）。ラッコの語は利用規約の都合で語そのものを書かず、意味だけを書く（`keywords/README.md`）。サジェストの語は種と順番も書く。順番は検索回数ではない。

| 外した候補 | 外した理由 |
|---|---|
| サジェストの `llm テストケース作成`（種「llm テストケース」の 1 番目。以前の `target_query`） | 意図は近いが、講座6の語の「評価」を含まない。#83 で、講座6（LLM 評価）の親の語に近い今の語に置き換えた |
| サジェストの `llm テストケース`（同じ種の 2 番目） | 上と同じ理由に加え、作り方を問わない広い語 |
| サジェストの `rag 評価用データセット`、`rag 評価データセット`（種「rag 評価」の 4、5 番目） | RAG の検索を評価するデータを探す語。この記事の手順では質問と正解の文書の組は作れない（原稿356行目）。検索の評価は `rag-retrieval-eval-recall-mrr` の範囲 |
| サジェストの `llm 評価`、`llm 評価指標`、`llm 評価方法`、`llm 評価 ツール`（種「LLM 評価」の語） | 評価のやり方や指標、道具を全般に探す広い語。講座6のキーワード単体に近く、guides/01 の「具体的なロングテールを狙う」に合わない |
| サジェストの `llm 評価駆動開発`（種「LLM 評価」の語） | 開発の進め方を探す語で、評価用のデータの作り方より広い |
| サジェストの `llm 自動評価`（種「llm 自動評価」の 1 番目） | `llm-eval-harness-fixtures` の以前の `target_query` で、採点の仕組みを作るあちらの記事と意図が重なる（G06） |
| モデルの性能の比べ方やランキング、ベンチマークを探すラッコの語 | 出来合いのモデルを比べたい語で、自分のアプリのテストケースを作る記事とは意図が違う |
| 今の語と空白の位置だけが違うラッコの語 | 意図は同じ。サジェストの CSV にも出る今の表記を選んだ |

選んだ理由は 2026-11-14 の追記と同じ。この記事はログから評価用のデータを作る手順を扱う。だから「データセット」を含む語が読者の探し方に最も近い。
