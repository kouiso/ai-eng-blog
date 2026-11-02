# sources: rag-retrieval-eval-recall-mrr

アクセス日はすべて 2026-11-02。ページは `curl` で取得してタグを外したテキストを読み（Elasticsearch、Anthropic の2ページ、Node.js、Hugging Face、MDN の各ページ、Pricing）、Elasticsearch のページは WebFetch でも読んだ。frontmatter の `sources` と、本文末尾の出典の表は、この表と同じ11件・同じ順番。

| # | 題名 | URL | 確かめた事実（原文の要旨） | 根拠にした本文の文（行番号は 579 行の版） |
|---|---|---|---|---|
| 1 | Ranking evaluation（Elasticsearch） | https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-rank-eval | Recall at K: "the fraction of relevant documents in those first k results relative to all possible relevant results"。"A recall at 10 (R@10) value of 0.5 then means 4 out of 8 relevant documents ... were retrieved in the 10 top hits"。"R@k is a set-based metric and does not take into account the position of the relevant documents within the top k results, so a ranking of ten results that contains one relevant result in position 10 is equally as good as a ranking of ten results that contains one relevant result in position 1"。Precision at K: "the fraction of relevant documents in those first k results"。MRR: "For every query in the test suite, this metric calculates the reciprocal of the rank of the first relevant document. For example, finding the first relevant result in position 3 means the reciprocal rank is 1/3. The reciprocal rank for each query is averaged across all queries"。mean_reciprocal_rank の `k`: "Sets the maximum number of documents retrieved per query." | 67行目（Recall@k の定義、4/8 の例、順番を見ない、10位と1位が同じ値）、69行目（MRR の定義、3位なら 1/3）、133行目（k で割ると Precision@k）、414行目（Elasticsearch の MRR の `k`） |
| 2 | Introducing Contextual Retrieval（Anthropic） | https://www.anthropic.com/news/contextual-retrieval | "We use 1 minus recall@20 as our evaluation metric, which measures the percentage of relevant documents that fail to be retrieved within the top 20 chunks." | 76行目（1 から Recall@20 を引いた値を指標にしている、上位20件に入らなかった正解の割合） |
| 3 | Define success criteria and build evaluations | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | "Be task-specific: Design evals that mirror your real-world task distribution."、"Prioritize volume over quality: More questions with slightly lower signal automated grading is better than fewer questions with high-quality human hand-graded evals." | 199行目（実際の利用で来る質問の分布に合わせる、手で採点する少数より自動で採点できる多数） |
| 4 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | History: "v22.18.0 Type stripping is enabled by default."。"Node.js will replace inline type annotations with whitespace, and no type checking is performed."。Determining module system: "To use import and export syntax, add "type": "module" to the nearest parent package.json." | 82行目（22.18.0 以上は型を取り除いて実行、型の検査はしない）、91行目（`import` と `export` を使うので `"type": "module"`） |
| 5 | Array.prototype.findIndex()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex | Return value: "The index of the first element in the array that passes the test. Otherwise, -1." | 135行目（条件に合う要素が無いと -1） |
| 6 | Array.prototype.indexOf()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf | Return value: "The first index of searchElement in the array; -1 if not found." | 416行目（見つからないと -1） |
| 7 | Logical OR (\|\|)（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR | "If x can be converted to true, returns x; else, returns y."、falsy の例に 0 | 416行目（`||` は0を偽として右側を返す） |
| 8 | intfloat/multilingual-e5-small（Hugging Face） | https://huggingface.co/intfloat/multilingual-e5-small | 使い方のコードのコメント: "Each input text should start with "query: " or "passage: ", even for non-English texts." | 306行目（質問の頭に `query: `、文書の頭に `passage: ` を付ける前提） |
| 9 | Array.prototype.sort()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort | "Since version 10 (or ECMAScript 2019), the specification dictates that Array.prototype.sort is stable."、同じ値の要素は sort の前と同じ順に残る | 460行目（`sort` は同じ値の要素の順を保つ） |
| 10 | Map（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map | "The Map object holds key-value pairs and remembers the original insertion order of the keys." | 460行目（`Map` はキーを入れた順を覚えている） |
| 11 | Pricing（Claude Platform Docs） | https://platform.claude.com/docs/en/about-claude/pricing | Model pricing の表（列は Input、Output、5m writes、1h writes、Hits and refreshes）で Claude Haiku 5.5 は "$0.10 / MTok for prompts up to 100,000 tokens"、Output "$0.50 / MTok"。100,000 トークンを超えるプロンプトは $0.50 / $2.50 | 544行目（100万トークンあたり入力 0.10 ドル、出力 0.50 ドル、10万トークン以下のとき） |

## 出典ではなく実行ログを根拠にした文

| 本文の文 | 根拠 |
|---|---|
| 57行目 MRR 0.967 と 0.900、差がついたのは3問、452行目 残りの12問は同じ順位 | `run/08.log`（1行ずつの順位と平均） |
| 59行目 合計36秒 | `run/03.log` 24378 ms、`06` 78 ms、`08` 4192 ms、`18` 2296 ms、`19` 2474 ms、`12` 2151 ms の合計 35569 ms（`mkdir` と `cd` は数 ms） |
| 80行目 Node.js 22.22.0、npm 10.9.4、Linux x86_64 | `run/*.log` の見出し（`node: v22.22.0`、`npm: 10.9.4`）、`run/20.log`（`uname -sm` が `Linux x86_64`） |
| 82行目 TypeScript 7.0.2 の `tsc` で確かめた | `run/14.log`（`Version 7.0.2`。記事のファイルのエラーは0件、`node_modules/@huggingface/` の型定義の12件で `tsc_exit=1`）、`run/15.log`（`skipLibCheck` を足して `tsc_exit=0`） |
| 108行目 インストールは24秒、745MB | `run/03.log`（24378 ms）、`run/04.log`（`745M node_modules`） |
| 155〜164行目 check-metrics の値 | `run/06.log` |
| 197行目 `cases.ts` は検索器を動かす前に書き終えた | `run/cases-written-at.txt`（2026-11-02 15:48:40 +0000 に書いた時点の sha256）。最初に検索器を動かしたのは、その後の試しの実行（ログなし、`code/README.md`）と `run/08.log`（2026-11-02 15:51:34 +0000）。`lint/check-code-and-outputs.txt` で sha256 が変わっていないことを確かめた |
| 203行目 6ファイルはハイブリッド検索の記事のものと1文字も違わない | `run/20.log`（`cmp` で6ファイルとも identical）。ハイブリッド検索の記事のコードと `logs/rag-hybrid-search-rrf/code/` の一致は、その記事の `lint/check-code-and-outputs.txt`（ALL OK） |
| 446行目 初回4.2秒、130MB、2回目から2.2〜2.5秒 | `run/08.log`（4192 ms）、`run/09.log`（`130M`）、`run/10`〜`12`、`18`、`19.log`（2151〜2474 ms） |
| 456行目 「返金はいつ？」で BM25 は内容の語が1つも一致しない、534行目 「は」だけが一致した5件 | `run/21.log`（質問の語は「返金」「は」「いつ」で、10件とも一致は「は」だけ）、`run/13.log`（下限 0.1 で BM25 は空、下限 0 で5件のスコアは 0.028〜0.032） |
| 457、460行目 「E1021 が出た」 | `run/13.log`（BM25 の1位は `error-e1020`、ハイブリッド検索は `error-e1020` と `error-e1021` がどちらも 0.03252 で、`error-e1020` が先） |
| 458、462行目 「カードが使えない」 | `run/21.log`（`payment` に一致した語は「が」「使」「え」）、`run/13.log`（BM25 の1位 `payment`、ハイブリッド検索の `payment` 0.03227、`error-e1020` 0.03226） |
| 464行目 1問で約 0.033、差の 0.067 は2問分 | `run/08.log` の平均から計算（0.5 ÷ 15 = 0.0333、0.967 − 0.900 = 0.067） |
| 476〜496行目 Recall@1、Recall@5 | `run/18.log`、`run/19.log`（全体は `run/10.log`、`run/11.log`） |
| 508〜534行目 下限 0 の結果、`cancel` が 1/62 で `shipping-fee` と同点で6位 | `run/12.log`、`run/13.log`（下限 0 のハイブリッド検索の上位5件の5位が `shipping-fee`(0.01613)、ベクトル検索の2位が `cancel`）。同点で BM25 の順が先に来るのは、出典9・10 と `rrf.ts` のコード（BM25 の順位表から先に `Map` に入れる） |
| 540行目 トークンを設定しない状態でダウンロード、ネットワークの無い環境で5つとも成功 | `run/17.log`（`HF_TOKEN unset`、`HUGGING_FACE_HUB_TOKEN unset`）、`run/08.log`（ダウンロードを含む初回の実行が exit 0）、`run/16.log`（`network: EAI_AGAIN` のあと5つとも `exit=0`。出力がオンラインの実行と同じことは `lint/check-code-and-outputs.txt`） |
| 542行目 745MB、130MB | `run/04.log`、`run/09.log` |
