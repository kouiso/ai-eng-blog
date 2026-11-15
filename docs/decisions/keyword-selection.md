# 記事30本の検索語（2026-11-15）

記事30本の `target_query` を、ラッコキーワードの書き出しの CSV と Google のサジェストの CSV から選び直しました。オーナーの依頼「キーワード選定はできるならやっちゃって欲しい」（2026-11-15）を受けた作業です。

## 結論

- 30本すべての `target_query` が、`keywords/` のどれかの CSV の行と1文字も違わない（G10）。
- 2本を、サジェストの語からラッコの語へ替えた。残り28本は据え置き。
- 30本のうち14本がラッコの CSV の語、16本がサジェストの CSV だけにある語になった。
- 替えた2本のうち `llm-eval-harness-fixtures` は、タイトルに「評価」を入れた。
- 検索数では比べていない。ラッコの書き出しの「月間検索数」の列は、無料プランでは6つの CSV のすべての行が `null` だった。

## 選び方

CLAUDE.md の「どこに何を置くか」の表のとおり、先にラッコの CSV を見て、合う語が無い記事だけサジェストの CSV の語を使う。

「合う」は次の3つをすべて満たすこととした。

1. 記事が答える検索意図と同じ意図の語である。
2. 今の語より広い語ではない（SKILL の手順1の2の4「具体的なロングテールを狙う」）。
3. 替えてもタイトルとの合い方が今より悪くならない（checklist の C02）。タイトルを直さないと合わなくなる語には替えない。

ラッコの CSV には検索数が無いので、ラッコの語に替えても人気の裏付けは増えない。だから広い語へ替えることはしなかった。公開したあとは Search Console の実測で選び直す。

替えた2本では Google トレンドでの比較（SKILL の手順1の2の4）を使わなかった。どちらも同じ意図の候補が1つしか無く、替えたのは空白の有無だけの表記の違いだったため。

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
| `llm-eval-dataset-from-logs` | `llm 評価 データセット` | ラッコ `LLM 評価.csv` | 種「LLM 評価」の 9 番目 | 据え置き（#83 でラッコから選んだ語） |
| `llm-eval-harness-fixtures` | `llm 自動 評価` | ラッコ `LLM 評価.csv` | サジェストの CSV に無い | 変更。同じ意図の語がラッコにあったので、ラッコの表記に替えた（旧 `llm 自動評価`）。タイトルに「評価」を入れた。旧の語の「評価」も旧のタイトルに無かった（旧のタイトルは「採点」）。だからこのタイトルの直しは、前からあった C02 の抜けを埋めたことにもなる |
| `llm-json-parse-error-fix` | `llm json 出力` | サジェスト `google-suggest-structured-output.csv` | 種「llm json 出力」の 1 番目 | 据え置き（#83 の判断）。ラッコの近い語は JSON の出し方を探す語で、`structured-output-methods-compare` と意図が重なる |
| `mcp-connection-closed-fix` | `mcp connection closed` | サジェスト `google-suggest-mcp-server.csv` | 種「mcp connection closed」の 1 番目 | 据え置き。ラッコの近い語はエラー全般の広い語。このエラー文で探す人に合わせる |
| `mcp-inspector-debug` | `mcp inspector 使い方` | サジェスト `google-suggest-mcp-server.csv` | 種「mcp inspector」の 2 番目 | 据え置き。ラッコにデバッグの語があり意図は近いが、替えるとタイトルの「MCP Inspector」と合わなくなる |
| `mcp-server-resources-prompts` | `mcp server resources and prompts` | サジェスト `google-suggest-mcp-server.csv` | 種「mcp resources prompts」の 4 番目 | 据え置き。ラッコの近い語は Resources か Prompts のどちらか1つだけを指す。両方を扱う記事に替えると片方を落とした語になる |
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
