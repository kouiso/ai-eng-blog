# sources: rag-hybrid-search-rrf

アクセス日はすべて 2026-10-31。番号は記事の出典の表と同じ。frontmatter の `sources` も同じ14件、同じ URL と日付。

## 出典ごとに確かめたこと

| # | 題名 | URL | 確かめた事実 | 記事のどの文の根拠か |
|---|---|---|---|---|
| 1 | Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods（SIGIR 2009） | https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf | PDF を curl で取得し pdftotext で読んだ（`plg.uwaterloo.ca/~gvcormac/…` からのリダイレクト先）。RRF は複数の IR システムの順位を組み合わせる方法。`RRFscore(d ∈ D) = Σ_{r∈R} 1/(k + r(d))`。「k = 60 was fixed during a pilot investigation and not altered during subsequent validation」。「k = 60 was near-optimal, but that the choice was not critical」。SIGIR'09 | RRF の定義、式、k=60 を予備実験で決めて変えていないこと、60 は最適に近いが選び方は結果を大きく左右しなかったこと、出典の表の注記「RRF を提案した SIGIR 2009 の論文」 |
| 2 | Reciprocal rank fusion（Elasticsearch） | https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion | 式（`score += 1.0 / ( k + rank( result(q), d ) )`、rank は1から数える）。「RRF requires no tuning, and the different relevance indicators do not have to be related to each other」。`rank_constant` は既定 60、「A higher value indicates that lower ranked documents have more influence」 | `k` を `rank_constant` と呼ぶこと、既定値 60、調整が要らないこと、指標どうしが関係していなくてよいこと、順位を1から数えること、`k` を大きくすると下の順位の影響が増えること |
| 3 | Introducing Contextual Retrieval（Anthropic） | https://www.anthropic.com/news/contextual-retrieval | 「Combine and deduplicate results from (3) and (4) using rank fusion techniques」（3 が BM25、4 が埋め込み）。BM25 は「particularly effective for queries that include unique identifiers or technical terms」。「embedding models … can miss crucial exact matches」（例 TS-999） | Anthropic も BM25 と埋め込みの結果を rank fusion で合わせる手順を示していること、識別子か技術用語を含む質問は BM25 の得意な場面であること、埋め込みは完全な一致を取りこぼすことがあること |
| 4 | BM25Similarity（Lucene 10.3.1 core API） | https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/search/similarities/BM25Similarity.html | 既定のコンストラクタは `k1 = 1.2`、`b = 0.75`。IDF は `log(1 + (docCount - docFreq + 0.5)/(docFreq + 0.5))` | `k1` 1.2 と `b` 0.75 が Lucene の既定値と同じこと、`idf` の式が Lucene の実装と同じ形であること |
| 5 | intfloat/multilingual-e5-small（Hugging Face） | https://huggingface.co/intfloat/multilingual-e5-small | モデルカード（`raw/main/README.md` を curl で取得）。`license: mit`。「This model has 12 layers and the embedding size is 384.」。「Each input text should start with "query: " or "passage: "」。FAQ 1「Yes, this is how the model is trained, otherwise you will see a performance degradation.」。FAQ 3「Why does the cosine similarity scores distribute around 0.7 to 1.0?」「what matters is the relative order of the scores instead of the absolute values」 | 12層、384次元、ライセンス MIT、`query: ` と `passage: ` を付ける前提で学習されていること、付けないと性能が下がること、類似度が 0.7〜1.0 に集まり、大事なのは値の大きさより順番であること |
| 6 | Xenova/multilingual-e5-small（Hugging Face） | https://huggingface.co/Xenova/multilingual-e5-small | README（curl で取得）。`base_model: intfloat/multilingual-e5-small`、`library_name: transformers.js`。「https://huggingface.co/intfloat/multilingual-e5-small with ONNX weights to be compatible with Transformers.js.」 | `Xenova/multilingual-e5-small` が元のモデルを ONNX の形式にしたものであること、Transformers.js がこの形式を読み込むこと |
| 7 | Transformers.js pipelines | https://huggingface.co/docs/transformers.js/api/pipelines | FeatureExtractionPipeline の例 `extractor('…', { pooling: 'mean', normalize: true })`。`pooling` は「The pooling method to use.」（`'mean'` を含む）。`normalize` は「Whether to normalize the embeddings in the last dimension.」。「You can convert this Tensor to a nested JavaScript array using `.tolist()`」 | `pooling: "mean"` がプーリングの方法に平均を選ぶ指定であること、`normalize: true` がベクトルを正規化すること、`tolist()` で JavaScript の配列になること |
| 8 | Using quantized models（dtypes） | https://huggingface.co/docs/transformers.js/guides/dtypes | 「8-bit (`"q8"`, `"int8"`, `"uint8"`)」。`dtype` で量子化の種類を選ぶ | `dtype: "q8"` が8ビットに量子化した重みを選ぶ指定であること |
| 9 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | History「v22.18.0 Type stripping is enabled by default.」。「no type checking is performed」。import の拡張子は必須。型の import には `type` が要る。`import`/`export` には `"type": "module"` | Node.js 22.18.0 以上が `.ts` をそのまま実行すること、型を調べないこと、拡張子と `type` の決まり、`"type": "module"` を入れる理由 |
| 10 | Intl.Segmenter() constructor（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter | `granularity: "word"` は「Split the input into segments at word boundaries, as determined by the locale.」 | `Intl.Segmenter` がロケールの規則で単語の境目を決め、`granularity: "word"` でその境目で分けること |
| 11 | ECMAScript Internationalization API Specification 19.7.1 CreateSegmentDataObject | https://tc39.es/ecma402/#sec-createsegmentdataobject | 仕様の HTML を curl で取得。「Let isWordLike be a Boolean indicating whether the segment in string is "word-like" according to locale」 | `isWordLike` が区切りが単語らしいかを表すこと |
| 12 | Array.prototype.sort()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort | 「Since version 10 (or ECMAScript 2019), the specification dictates that `Array.prototype.sort` is stable.」。同じ値の要素は並べ替えの前の順を保つ | `sort` が ECMAScript 2019 から安定ソートで、同じ値の要素が元の順を保つこと |
| 13 | Map（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map | 「remembers the original insertion order of the keys」「Iteration happens in insertion order」 | `Map` がキーを入れた順に取り出せること |
| 14 | Pricing（Claude） | https://platform.claude.com/docs/en/about-claude/pricing | 「Claude Haiku 5.5 (for prompts up to 100,000 tokens) $0.10 / MTok … $0.50 / MTok」。10万トークン超は別の単価 | 検索結果を Claude に渡すと料金がかかること、Haiku 5.5 の入力 $0.10、出力 $0.50（100万トークンあたり、10万トークン以下のプロンプト） |

## 一次情報ではなく実行ログと計算を根拠にした文

| 記事の文 | 根拠 |
|---|---|
| 15行のファイル1つ（`rrf.ts`） | `wc -l code/rrf.ts` で15行 |
| 実行時間は合計46秒、インストール25秒、初回4秒、2回目から2.5〜3.2秒 | `run/03.log`（25003 ms）、`run/06.log`（4236 ms）、`run/08`〜`13.log`（2506〜3176 ms）の elapsed の合計 45.7 秒 |
| `node_modules` 745MB、モデル 130MB、保存先 | `run/04.log`、`run/07.log` |
| 各質問の順位、スコア、合わせた点数 | `run/06`、`08`〜`13.log`（記事の出力はログから写した。`lint/check-code-and-outputs.txt`） |
| 一致した語（「利用」「限度」「額」、「5」「営業」「日」、「が」「出」「た」、「の」「が」、「は」）、「が」を含む文書は10件中4件、「届く」「遅い」がどの文書にも無いこと | `run/14.log`（`code/extra/explain.ts`） |
| ベクトルが384次元で長さ 1.000000 | `run/19.log`（`code/extra/check-norm.ts`） |
| Hugging Face のトークンを設定せずにダウンロードできたこと | `run/18.log`（`HF_TOKEN`、`HUGGING_FACE_HUB_TOKEN` とも unset。値は出していない）と `run/06.log`（そのままダウンロードして exit 0） |
| ネットワークの無い環境で `node` のコマンドが7つとも成功 | `run/17.log`（`unshare -rn`、外への fetch は `EAI_AGAIN`） |
| 順位ごとの点数（1/61 ≈ 0.01639 など）、1位と5位の差 0.001、両方に出れば 0.03 超（最小 2/65 ≈ 0.03077）、`1/61 + 1/62` ≈ 0.03252、`1/65 + 1/63` ≈ 0.03126 | 手計算。ログの出力の値と一致 |
| 正規化したベクトル（長さ1）どうしの内積がコサイン類似度と同じ値 | コサイン類似度の定義（内積を長さの積で割る）からの計算 |
| 型の確認 | `run/15.log`（skipLibCheck なしでは `node_modules` の型定義の誤りで `tsc_exit=1`。記事のファイル由来のエラーは0件）、`run/16.log`（skipLibCheck ありで `tsc_exit=0`） |

## 参考にしたが出典にしていないもの

- WebSearch の結果（issoh.co.jp、techsy.io、dev.to、buttondown.com）。上位記事の傾向を見るためだけに使った（`brief.md`）。記事の断定の根拠にはしていない。
