# selection: llm-eval-harness-fixtures

選んだ日: 2026-11-02

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-02 に `ls keywords` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。この記事を書いたのは、ワークフローの指示（CSV なしで書き進め、G10 を NG にして下書きで止める）によるもので、テーマは `content/plan.md` の #26 に従った。人気度の比較（CSV の検索ボリューム、Google トレンド、Search Console）は、比べる候補の一覧が無いので行っていない。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-11-02）。値は表示もしていないし、どこにも残していない。

この記事のコードは API を呼ばない。採点する回答は手で書いた見本（`code/answers.ts`）で、採点関数は標準の機能だけの TypeScript。`needs_api_key: false`。

## 既存記事との重なり（G06）

`content/articles/*.md` の frontmatter（title、main_keyword、target_query）を全件（この記事のほか15本）読んだ（2026-11-02）。`main_keyword: "LLM 評価"`（course_step 6）の記事は、この記事が1本目。

| slug | main_keyword | 答える検索意図 | 重なり |
|---|---|---|---|
| `mcp-server-typescript-stdio`、`mcp-server-streamable-http`、`mcp-inspector-debug`、`mcp-server-resources-prompts`、`mcp-connection-closed-fix` | MCPサーバー | MCP サーバーの作り方、調べ方、つながらないときの直し方 | なし |
| `llm-api-cost-estimate-js-tiktoken`、`llm-api-429-retry-sdk-mock` | LLM API | 料金の見積もり、429・529 のリトライ | なし |
| `zod-validate-llm-json-output` | 構造化出力 | LLM の出力 JSON の形を zod で検証する | なし。あちらは JSON の形（型、必須項目）が合っているかを検証し、合否はスキーマで決まる。この記事は回答の中身が期待どおりかをテストケースごとの採点の指定で判定し、合格率を出す。本文では、JSON を返すアプリなら形の検証にあちらを使う、とリンクでつないだ |
| `zod-to-json-schema-tool-definition`、`llm-json-parse-error-fix` | 構造化出力 | ツール定義の作り方、JSON.parse の失敗 | なし |
| `rag-bm25-search-typescript`、`rag-chunking-japanese-text`、`rag-local-embeddings-transformers-js`、`rag-hybrid-search-rrf` | RAG | 検索部分の作り方 | なし（検索の良し悪しを測る記事は計画の #28 で、まだ無い） |
| `ai-agent-safe-file-tool` | AIエージェント | ファイル操作ツールの安全な作り方 | なし |

2026-11-10 の読み直し（3版目のゲート判定のため）: `content/articles/*.md` の frontmatter を全件読み直した（この記事のほか20本）。2026-11-02 から増えたのは `ai-agent-max-turns-budget-limit`、`ai-agent-vs-workflow`、`claude-agent-sdk-first-agent`（AIエージェント）、`rag-retrieval-eval-recall-mrr`、`llm-eval-dataset-from-logs`（LLM 評価）。LLM 評価の2本は、RAG の検索器を Recall@k と MRR で測る記事と、ログからテストケースを選んで JSONL にする記事で、LLM の回答を完全一致、部分一致、正規表現で採点するこの記事とは答える検索意図が違う。重なりは無い。`keywords/` は `README.md` だけで CSV は無く、`ANTHROPIC_API_KEY` は `unset` のまま（どちらも 2026-11-10 に確認）。

`target_query` はどの記事も null なので、検索語での突き合わせはできない。上の判断は記事の中身で行った。計画の #27（LLM-as-a-Judge）、#29（promptfoo）とは、`content/plan.md` の「重なりを避けるために決めたこと」のとおり、自作のコードでの採点と、LLM や既製のツールでの採点に分けている。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 6）とキー不要（○）は `content/plan.md` の #26 の判定をそのまま使った。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-llm-eval.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: 完全一致、部分一致、正規表現で回答を自動採点する仕組みを作る記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。

## 2026-11-15 追記: target_query をラッコの語に替えた

- 旧 `llm 自動評価`（`keywords/google-suggest-llm-eval.csv`）から、新 `llm 自動 評価`（`keywords/LLM 評価.csv`）に替えた。
- 理由: CLAUDE.md の表のとおり、ラッコの CSV に合う語があればそちらを使う。同じ意図の語がラッコの CSV にあった。違いは「自動」と「評価」の間の空白だけ。
- ラッコの書き出しの検索数の列は、無料プランではすべての行が `null` で、人気度は比べていない。
- タイトルに「評価」が無かったので、タイトルの「自動で採点する」を「自動で評価する」に替えた（`content/plan.md` の表も同じに直した）。
- 一致する行がラッコの CSV に1つあることを、2026-11-15 にスクリプトで確かめた。30本の一覧と選び方は `docs/decisions/keyword-selection.md`。CSV の行や値はこのリポジトリに写していない（`keywords/README.md`）。

## 2026-11-15 追記（#87。外した候補）

上の追記で替えたときの SKILL の「logs/<slug>/ の中身」の selection.md（外した候補）の記録が抜けていた。PR #93 のレビュー（2026-11-15）でそう指摘された。その分をここに足す。`target_query` は変えない。読んだのは `keywords/LLM 評価.csv`（ラッコ）と `keywords/google-suggest-llm-eval.csv`（サジェスト）で、2026-11-15 にスクリプトで読み直した。ラッコの語は利用規約の都合で語そのものを書かず、意味だけを書く（`keywords/README.md`）。サジェストの語は種と順番も書く。順番は検索回数ではない。

| 外した候補 | 外した理由 |
|---|---|
| サジェストの `llm 自動評価`（種「llm 自動評価」の 1 番目。以前の `target_query`） | 意図は今の語と同じで、違いは空白の有無だけ。CLAUDE.md の表では先にラッコの CSV を使う。だからラッコの CSV にある今の表記を選んだ |
| サジェストの `llm 評価指標`、`llm 評価`、`llm 評価方法`（種「LLM 評価」の 1〜3 番目）、`llm 評価 ツール`、`llm 評価 手法`（種「LLM 評価 」の 5、7 番目。種の末尾に空白がある）、種「LLM評価」の空白の無い書き方の語。ラッコの CSV にある評価の指標や方法、観点、基準を探す語も同じ | 評価のやり方や指標、道具を全般に探す広い語。講座6のキーワード単体に近く、guides/01 の「具体的なロングテールを狙う」に合わない |
| サジェストの `llm 評価駆動開発`（種「LLM 評価」の 5 番目）。ラッコの CSV にある評価駆動開発の語も同じ | 開発の進め方を探す語で、採点の仕組みの作り方より広い |
| LLM の回答や出力、品質の評価や、数で測る評価を全般に指すラッコの語 | 評価のやり方を限らない語で、人の手や LLM での評価も含む。自動で採点する今の語より広い（`docs/decisions/keyword-selection.md` の「選び方」の2） |
| 評価に使う関数を指すラッコの語 | タイトルに「関数」が無い。替えるとタイトルとの合い方が悪くなる（同じ「選び方」の3） |
| サジェストの `llm テストケース作成`、`llm テストケース`（種「llm テストケース」の 1、2 番目） | テストケースを作る語。`llm-eval-dataset-from-logs` の以前の `target_query` で、あちらの記事と意図が重なる（G06） |
| サジェストの `llm 評価 データセット`（種「LLM 評価 」の 9 番目） | `llm-eval-dataset-from-logs` の今の `target_query`（G06） |
| サジェストの種「llm as a judge」の 1〜10 番目の語。LLM に採点させる評価や LLM 自身に評価させる語、ルーブリックでの評価を指すラッコの語も同じ | LLM に採点させる方法の語で、`llm-as-a-judge-claude` の範囲（G06）。この記事はコードで採点し、LLM を呼ばない |
| サジェストの種「promptfoo」の 1〜10 番目の語。評価のライブラリやフレームワーク、既製のツールの名前を含むラッコの語も同じ | 既製の道具を探す語。この記事は依存パッケージなしの自作のコードで採点する。既製のツールは `promptfoo-llm-eval-intro` の範囲（G06） |
| サジェストの種「rag 評価」の 1〜7 番目の語 | RAG の検索の評価を探す語。`rag-retrieval-eval-recall-mrr` の範囲（G06） |
| 人の手での評価を指すラッコの語 | 人が採点する方法の語。自動で採点するこの記事とは逆 |
| モデルの性能や精度の比べ方、ランキング、ベンチマーク、日本語や国産のモデルの評価を指すラッコの語 | 出来合いのモデルを比べたい語。自分のアプリの回答を採点する記事とは意図が違う |
| エージェントの評価や、本番で動かしながらの評価を指すラッコの語 | 評価する対象や時点が違う。この記事は手元で回答の見本を採点する |
| 要約、小説、文章、ハルシネーションなど、決まった用途の出力の評価を指すラッコの語 | 用途を決めた評価の語。この記事は用途を限らず、完全一致、部分一致、正規表現で採点する仕組みを作る |
| 本や論文、求人、評価のサイトを探すラッコの語 | 読み物や仕事を探す語で、作り方の記事とは型が違う |

ラッコの CSV で `docs/decisions/keyword-selection.md` の「選び方」の1〜3をすべて満たす語は今の語の1つだけだった。人気度は比べていない。ラッコの「月間検索数」はすべての行で null だった。この変更では Google トレンドでの比較も実行していない（`docs/decisions/keyword-selection.md` の「選び方」）。
