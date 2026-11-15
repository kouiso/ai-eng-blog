# 記事30本の検索語（2026-11-15）

記事30本の `target_query` を、ラッコキーワードの書き出しの CSV と Google のサジェストの CSV から選び直しました。オーナーの依頼「キーワード選定はできるならやっちゃって欲しい」（2026-11-15）を受けた作業です。

## 結論

- 30本すべての `target_query` が、`keywords/` のどれかの CSV の行と1文字も違わない（G10）。
- 2本を、サジェストの語からラッコの語へ替えた。残り28本は据え置き。
- 30本のうち14本がラッコの CSV の語、16本がサジェストの CSV だけにある語になった。
- 替えた2本のうち `llm-eval-harness-fixtures` は、タイトルに「評価」を入れた。
- 検索数では比べていない。ラッコの書き出しの「月間検索数」の列は、無料プランでは6つの CSV のすべての行が `null` だった。
- 人気度は 2026-11-15 に Google トレンド（日本、過去12か月）で比べた（#87）。対象は #87 の対象の4本と 2026-11-15 に語を替えた2本の6本だ。ほかの24本はトレンドで比べていない。今の語より平均の高い候補が5本で見つかった。どれも下の「選び方」や SKILL の手順1の2の1〜3 で外した語だった。だから `target_query` は替えていない。選び直すかどうかは公開したあとに Search Console の実測で決める。

## 選び方

CLAUDE.md の「どこに何を置くか」の表のとおり、先にラッコの CSV を見て、合う語が無い記事だけサジェストの CSV の語を使う。

「合う」は次の3つをすべて満たすこととした。

1. 記事が答える検索意図と同じ意図の語である。
2. 今の語より広い語ではない（SKILL の手順1の2の4「具体的なロングテールを狙う」）。
3. 替えてもタイトルとの合い方が今より悪くならない（checklist の C02）。タイトルを直さないと合わなくなる語には替えない。

ラッコの CSV には検索数が無い。ラッコの語に替えても人気の裏付けは増えない。だから広い語へ替えることはしなかった。公開したあとは Search Console の実測で選び直す。

替えた2本ではラッコの CSV の語を上の「選び方」の1〜3で絞った。3つをすべて満たす語はどちらの記事でも1つだった。その語を選んだ。以前の語との違いは空白の有無だけだ。Google トレンドでの比較（SKILL の手順1の2の4）は選んだあとの 2026-11-15 に行った。結果は下の「Google トレンドでの比較」にある。

- `llm-eval-harness-fixtures` で選び方の1〜3をすべて満たすラッコの語は1つだけだった。回答や出力の評価を全般に指す語もあった。評価のやり方を限らない語だ。今の語より広い。だから選び方の2で外した。評価に使う関数を指す語もあった。タイトルに「関数」が無い。替えるとタイトルとの合い方が悪くなる。だから選び方の3で外した（`logs/llm-eval-harness-fixtures/selection.md` の「2026-11-15 追記（#87。外した候補）」）。
- `ai-agent-vs-workflow` ではエージェントとワークフローの違いを問う語がラッコの CSV に1つしか無かった。ワークフローを全般に指す語は今の語より広い。だから選び方の2で外した。ワークフロー型のエージェントと自律型のエージェントの違いを問うラッコの語もあった（書き方の違う2つ）。これはエージェントの2つの種類を比べる語だ。この記事のタイトルはエージェントとワークフローを比べる。意図が違うので選ばなかった（`logs/ai-agent-vs-workflow/selection.md` の「2026-11-15 追記（#87。外した候補）」）。

## Google トレンドでの比較（2026-11-15）

#87 の対象の4本（`ai-agent-safe-file-tool`、`claude-p-script-first-call`、`llm-eval-dataset-from-logs`、`llm-json-parse-error-fix`）と 2026-11-15 に語を替えた2本（`ai-agent-vs-workflow`、`llm-eval-harness-fixtures`）について今の `target_query` と外した候補を5語まで並べて Google トレンドを開いた（#87）。ほかの24本はトレンドで比べていない。

- 開いたページは `https://trends.google.com/trends/explore?geo=JP&date=today%2012-m&q=<5語をカンマでつないだもの>`（日本、過去12か月）。ブラウザで記事ごとに1回だけ開いた。グラフの期間は 2025-11-09 の週から 2026-11-15 の週までだった。URL の `date` は Trends で外れたが、期間の欄は既定の過去12か月だった。
- アクセスは 2026-11-15 の 16:10〜16:13（日本時間）。
- 読んだのはグラフの凡例の「平均」。同じページの5語の中で比べた 0〜100 の値だ。検索回数ではない。0 同士は差が無いものとして扱う。
- 語ごとの値は各記事の `logs/<slug>/selection.md` の「2026-11-15 追記（#87。Google トレンドでの比較）」にある。ラッコだけにある語はここでも意味だけを書く。

| 記事 | 今の語の平均 | 今の語より高かった候補（平均） | 判断 |
|---|---|---|---|
| `ai-agent-safe-file-tool` | 0 | AI エージェントの権限を探すラッコの語（1）、セキュリティを探すラッコの語（7）、`ai エージェント 安全`（3）、`ai エージェント ツール`（23） | 据え置き。4つとも広い語か、出来合いの製品を探す語で外した |
| `claude-p-script-first-call` | 0 | `llm api 無料`（2）、`llm api 料金`（7）、`llm apiとは`（5） | 据え置き。無料の語は記事のコードがプランの利用枠を使うので合わない。料金と「とは」は型が違う |
| `llm-eval-dataset-from-logs` | 0 | `rag 評価データセット`（2） | 据え置き。RAG の検索の評価は `rag-retrieval-eval-recall-mrr` の範囲 |
| `llm-json-parse-error-fix` | 0 | `構造化出力 json`（2）、LLM API と JSON を組み合わせたラッコの語（3） | 据え置き。前者は `structured-output-methods-compare` と重なり（G06）、後者は API を直接呼ぶ語（SKILL の手順1の2の2） |
| `ai-agent-vs-workflow` | 0 | AI エージェントとワークフローを組み合わせただけのラッコの語（3）、自律型のエージェントを指すラッコの語（7） | 据え置き。前者は広い語（選び方の2）、後者は問いが違う |
| `llm-eval-harness-fixtures` | 3 | 無し | 据え置き。5語の中で今の語が一番高い |

SKILL の手順1の2の4 で高い語を選ぶのは同じ条件のときだけだ。高かった候補はどれもそれより前の手順や「選び方」で外した語だった。だから6本とも `target_query` は替えない。今の語が候補より検索の少ない語だと分かった5本は公開したあとに Search Console の実測で選び直すかを決める。

## 記事ごとの結果

「サジェストの順位」は、サジェストの CSV でその語が出た種と順番。検索回数ではない。ラッコの CSV の行や値は、利用規約の都合でここに写していない（`keywords/README.md`）。外したラッコの語も、語そのものは書かずに意味だけを書いた。

| 記事 | target_query | 一致した CSV | サジェストの順位 | 判断 |
|---|---|---|---|---|
| `ai-agent-custom-tools-agent-sdk` | `ai エージェント ツール 呼び出し` | サジェスト `google-suggest-ai-agent.csv` | 種「ai エージェント ツール」の 9 番目 | 据え置き。ラッコの近い語はツールとは何かを探す語で、作り方の記事と意図が違う |
| `ai-agent-max-turns-budget-limit` | `ai エージェント 上限` | サジェスト `google-suggest-ai-agent.csv` | 種「ai エージェント 上限」の 1 番目 | 据え置き。ラッコに回数や上限の語が無い（近い語は無制限やループの意味で、意図が違う） |
| `ai-agent-safe-file-tool` | `aiエージェント ファイル操作` | ラッコ `AIエージェント.csv` | サジェストの CSV に無い | 据え置き（#83 でラッコから選んだ語） |
| `ai-agent-vs-workflow` | `aiエージェント ワークフロー 違い` | ラッコ `AIエージェント.csv` | サジェストの CSV に無い | 変更。同じ意図の語がラッコにあったので、ラッコの表記に替えた（旧 `ai エージェント ワークフロー 違い`） |
| `claude-agent-sdk-first-agent` | `claude agent sdk 使い方` | サジェスト `google-suggest-ai-agent.csv` | 種「claude agent sdk」の 7 番目 | 据え置き。ラッコの近い語は SDK に限らないエージェントの作り方で、タイトルの「Claude Agent SDK」と合わない |
| `claude-agent-sdk-streaming` | `llm ストリーミング` | サジェスト `google-suggest-llm-api.csv` | 種「llm ストリーミング」の 1 番目 | 据え置き。ラッコの近い語は API を直接呼ぶ書き方が中心で、Agent SDK の記事と合わない（SKILL の手順1の2の2） |
| `claude-agent-sdk-structured-output` | `claude 構造化出力` | ラッコ `構造化出力.csv` | 種「構造化出力 Claude」の 1 番目 | 据え置き（ラッコとサジェストの両方にある） |
| `claude-code-api-key-billing-auth` | `claude code api 従量課金` | サジェスト `google-suggest-llm-api.csv` | 種「claude api 従量課金」の 2 番目 | 据え置き。ラッコの料金の語は料金の一覧を探す語で、キーの語は API キーの取り方や要るかどうかを探す語。どちらも Claude Code の課金の切り替えと意図が違う |
| `claude-p-script-first-call` | `llm api 呼び出し` | ラッコ `LLM API.csv` | サジェストの CSV に無い | 据え置き（#83 でラッコから選んだ語） |
| `llm-api-429-retry-sdk-mock` | `llm api 429` | ラッコ `LLM API.csv` | 種「llm api 429」の 1 番目 | 据え置き（ラッコとサジェストの両方にある） |
| `llm-api-cost-estimate-js-tiktoken` | `openai api トークン 料金` | サジェスト `google-suggest-llm-api.csv` | 種「openai api トークン 料金」の 1 番目 | 据え置き。ラッコの料金やトークンの語は広く、タイトルの「OpenAI API の料金」と合わない |
| `llm-as-a-judge-claude` | `llm as a judge やり方` | サジェスト `google-suggest-llm-eval.csv` | 種「llm as a judge」の 4 番目 | 据え置き。ラッコの近い語は API を直接呼ぶ語で、Agent SDK の記事と合わない |
| `llm-eval-dataset-from-logs` | `llm 評価 データセット` | ラッコ `LLM 評価.csv` | 種「LLM 評価 」の 9 番目 | 据え置き（#83 でラッコから選んだ語） |
| `llm-eval-harness-fixtures` | `llm 自動 評価` | ラッコ `LLM 評価.csv` | サジェストの CSV に無い | 変更。同じ意図の語がラッコにあったので、ラッコの表記に替えた（旧 `llm 自動評価`）。タイトルに「評価」を入れた。旧の語の「評価」も旧のタイトルに無かった（旧のタイトルは「採点」）。だからこのタイトルの直しで、前からあった C02 の抜けも埋まった |
| `llm-json-parse-error-fix` | `llm json 出力` | サジェスト `google-suggest-structured-output.csv` | 種「llm json 出力」の 1 番目 | 据え置き（#83 の判断）。ラッコの近い語は JSON の出し方を探す語で、`structured-output-methods-compare` と意図が重なる |
| `mcp-connection-closed-fix` | `mcp connection closed` | サジェスト `google-suggest-mcp-server.csv` | 種「mcp connection closed」の 1 番目 | 据え置き。ラッコの近い語はエラー全般の広い語。このエラー文で探す人に合わせる |
| `mcp-inspector-debug` | `mcp inspector 使い方` | サジェスト `google-suggest-mcp-server.csv` | 種「mcp inspector」の 2 番目 | 据え置き。ラッコにデバッグの語があり意図は近いが、替えるとタイトルの「MCP Inspector」と合わなくなる |
| `mcp-server-resources-prompts` | `mcp server resources and prompts` | サジェスト `google-suggest-mcp-server.csv` | 種「mcp resources prompts」の 4 番目 | 据え置き。ラッコの近い語は Resources か Prompts のどちらか1つだけを指す。この記事は両方を扱う。だからその語に替えると片方を落とした語になる |
| `mcp-server-streamable-http` | `mcp streamable http typescript` | サジェスト `google-suggest-mcp-server.csv` | 種「mcp streamable http」の 7 番目 | 据え置き。ラッコの近い語は HTTP 全般の広い語で、Streamable HTTP の方式を探す人に合わない（ラッコに streamable の語は無い） |
| `mcp-server-typescript-stdio` | `mcpサーバー 作り方 typescript` | ラッコ `MCPサーバー.csv` | 種「MCPサーバー TypeScript」の 2 番目 | 据え置き（ラッコとサジェストの両方にある） |
| `promptfoo-llm-eval-intro` | `promptfoo とは` | サジェスト `google-suggest-llm-eval.csv` | 種「promptfoo」の 2 番目 | 据え置き。ラッコの近い語は評価ツールを比べたい人の語で、promptfoo の入門と意図が違う |
| `rag-answer-with-citations-claude` | `rag 出典` | サジェスト `google-suggest-rag.csv` | 種「rag 出典」の 1 番目 | 据え置き。ラッコの近い語は RAG と Claude だけの広い語で、出典を付ける記事の中身と合わない |
| `rag-bm25-search-typescript` | `rag bm25` | ラッコ `RAG.csv` | 種「rag bm25」の 1 番目 | 据え置き（ラッコとサジェストの両方にある） |
| `rag-chunking-japanese-text` | `rag チャンク分割` | ラッコ `RAG.csv` | 種「rag チャンク」の 5 番目 | 据え置き（ラッコとサジェストの両方にある） |
| `rag-hybrid-search-rrf` | `rag ハイブリッド検索` | ラッコ `RAG.csv` | 種「rag ハイブリッド検索」の 1 番目 | 据え置き（ラッコとサジェストの両方にある） |
| `rag-local-embeddings-transformers-js` | `rag ベクトル検索` | ラッコ `RAG.csv` | 種「rag ベクトル検索」の 1 番目 | 据え置き（ラッコとサジェストの両方にある） |
| `rag-retrieval-eval-recall-mrr` | `rag 評価指標` | ラッコ `RAG.csv` | 種「rag 評価」の 1 番目 | 据え置き（ラッコとサジェストの両方にある） |
| `structured-output-methods-compare` | `構造化出力 プロンプト` | ラッコ `構造化出力.csv` | 種「構造化出力」の 8 番目 | 据え置き（ラッコとサジェストの両方にある） |
| `zod-to-json-schema-tool-definition` | `zod json schema` | サジェスト `google-suggest-structured-output.csv` | 種「zod json schema」の 1 番目 | 据え置き。ラッコの近い語は API の機能を探す語で、zod から作る記事と意図が違う |
| `zod-validate-llm-json-output` | `zod schema llm` | サジェスト `google-suggest-structured-output.csv` | 種「zod llm」の 6 番目 | 据え置き。ラッコに zod の語が無い |

## 確かめ方

`keywords/` の CSV（ラッコは UTF-16 のタブ区切り、サジェストは UTF-8 のカンマ区切り）を読み、30本の frontmatter の `target_query` が、ラッコの「キーワード」の列かサジェストの `suggestion` の列のどれかの行と完全に一致することをスクリプトで数えた（一致しない記事 0本、2026-11-15）。CSV は手元にだけあり、このリポジトリには入れていない。
