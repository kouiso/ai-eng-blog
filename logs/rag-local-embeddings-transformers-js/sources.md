# sources: rag-local-embeddings-transformers-js

アクセス日はすべて 2026-10-31。frontmatter の `sources` と、本文末尾の出典の表（番号も同じ）と一致させている。行番号は `content/articles/rag-local-embeddings-transformers-js.md`（376行の版）。

## 一次情報

| # | URL | 題名 | 確かめたこと | 根拠にした本文の文 |
|---|---|---|---|---|
| 1 | https://platform.claude.com/docs/en/build-with-claude/embeddings （`.md` 版を取得） | Embeddings | 冒頭の説明 "Text embeddings are numerical representations of text that let you measure semantic similarity."。"Anthropic does not offer its own embedding model. One embeddings provider ... is Voyage AI by MongoDB."。"Voyage AI embeddings are normalized to length 1, which means that: Cosine similarity is equivalent to dot-product similarity" | 77行目（埋め込みの定義）、79行目（長さ1ならコサイン類似度＝内積）、337行目（Anthropic は自社の埋め込みモデルを出していない、Voyage AI を挙げる） |
| 2 | https://huggingface.co/intfloat/multilingual-e5-small （README.md の raw を取得） | intfloat/multilingual-e5-small | "the embedding size is 384"。"It supports 100 languages"。`license: mit`。使い方のコードは average_pool のあと F.normalize。FAQ 1 "Do I need to add the prefix "query: " and "passage: "? Yes ... otherwise you will see a performance degradation"、"Use "query: " and "passage: " correspondingly for asymmetric tasks such as passage retrieval"。FAQ 3 "Why does the cosine similarity scores distribute around 0.7 to 1.0? ... we use a low temperature 0.01 for InfoNCE contrastive loss ... what matters is the relative order of the scores instead of the absolute values"。Limitations "Long texts will be truncated to at most 512 tokens." | 79行目（コサイン類似度）、83行目（100言語、384次元、MIT）、157行目（平均→正規化）、173行目（接頭辞、付けないと性能が下がる）、319行目（0.7〜1.0、温度0.01、値より順位）、350行目（512トークン） |
| 3 | https://huggingface.co/Xenova/multilingual-e5-small/tree/main/onnx （Hub API `/api/models/Xenova/multilingual-e5-small/tree/main/onnx` と README も取得） | Xenova/multilingual-e5-small (onnx) | README "intfloat/multilingual-e5-small with ONNX weights to be compatible with Transformers.js"。ファイルの大きさ `onnx/model_quantized.onnx` 118,308,185 バイト、`onnx/model.onnx` 470,268,533 バイト（470,268,533 / 118,308,185 ≈ 3.97） | 83行目（ONNX に変換したモデル、リポジトリ名）、199行目（118,308,185 バイト）、201行目（470,268,533 バイト、およそ4倍） |
| 4 | https://huggingface.co/docs/transformers.js/api/pipelines | Transformers.js pipelines | FeatureExtractionPipeline "extracts the hidden states from the base transformer for use as features"。FeatureExtractionPipelineOptions の `pooling`（'none' \| 'mean' \| ... 、既定 "none"）、`normalize`（既定 false、"Whether to normalize the embeddings in the last dimension"）。pooling なしの例は dims [1, 8, 384]、mean と normalize ありは [1, 384]。`.tolist()` で入れ子の配列に変換 | 151行目（feature-extraction）、153行目（pooling: mean、normalize: true）、155行目（既定は何もしない、pooling を省くとトークンの数だけ、tolist） |
| 5 | https://huggingface.co/docs/transformers.js/guides/dtypes | Using quantized models (dtypes) | `dtype` で量子化を選ぶ。"8-bit ("q8", "int8", "uint8")"、"full-precision ("fp32")" | 151行目（q8 は8ビットに量子化したファイル） |
| 6 | https://github.com/huggingface/transformers.js/blob/4.3.2/packages/transformers/src/utils/dtypes.js （raw を取得し、インストールした 4.3.2 の同じファイルと `cmp` で一致を確認） | transformers.js 4.3.2 src/utils/dtypes.js | `DEFAULT_DEVICE_DTYPE = DATA_TYPES.fp32`、`DEFAULT_DEVICE_DTYPE_MAPPING` は `wasm` だけ `q8`（"If not specified, will default to fp32"）。`DEFAULT_DTYPE_SUFFIX_MAPPING` で fp32 は ''（`model.onnx`）、q8 は '_quantized'（`model_quantized.onnx`） | 151行目（q8 でファイルを選ぶ）、201行目（省くと fp32 の model.onnx、q8 が既定なのは WebAssembly のときだけ） |
| 7 | https://huggingface.co/docs/transformers.js/api/env | Transformers.js env | `cacheDir`: "By default, it is .cache relative to the library's installed location when a file system is available (e.g., Node.js)"。`useFSCache`: "By default, it is true if available"。`allowRemoteModels`: "Whether to allow loading of remote files, defaults to true"。例 `env.cacheDir = '/path/to/cache/directory/'` | 189行目（保存先は .cache）、203行目（env.cacheDir で変えられる）、329行目（ファイルシステムのキャッシュを既定で使う、allowRemoteModels を false） |
| 8 | https://registry.npmjs.org/@huggingface/transformers （`npm view` と curl で取得） | @huggingface/transformers (npm registry) | dist-tags `latest: 4.3.2`（2026-10-27 公開）、4.3.2 の依存に `onnxruntime-node: 1.30.0` | 87行目（2026-10-31 時点で latest は 4.3.2） |
| 9 | https://github.com/microsoft/onnxruntime/blob/v1.30.0/js/node/script/install-metadata.js （raw を取得し、インストールした onnxruntime-node 1.30.0 の同じファイルと `cmp` で一致を確認） | onnxruntime v1.30.0 install-metadata.js | `requirements` で `'linux/x64': ['cuda12']`、win32 と darwin は空。`linux/x64:cuda12` のマニフェストは `libonnxruntime_providers_cuda.so` ほか3ファイル。パッケージ `Microsoft.ML.OnnxRuntime.Gpu.Linux`、フィードは `https://api.nuget.org/v3/index.json` | 124行目（Linux x64 で追加のファイル、CUDA 12 用、NuGet、macOS と Windows では取ってこない） |
| 10 | https://github.com/microsoft/onnxruntime/blob/v1.30.0/js/node/script/install.js | onnxruntime v1.30.0 install.js | コメント "Some files (eg. the CUDA EP binaries) are not bundled ... downloaded from the Nuget feed"。`--onnxruntime-node-install=skip` "Skip the installation of the files that are not bundled"、"Alternatively, use environment variable "ONNXRUNTIME_NODE_INSTALL""。`INSTALL_FLAG === false` で `process.exit(0)` | 126行目（GPU を使わないなら止められる、環境変数に skip） |
| 11 | https://nodejs.org/docs/latest-v22.x/api/typescript.html （`.md` 版を取得） | Node.js v22 Modules: TypeScript | v22.18.0 "Type stripping is enabled by default"。"no type checking is performed"。"the `type` keyword is necessary to correctly strip type imports. Without the `type` keyword, Node.js will treat the import as a value import, which will result in a runtime error." | 89行目（22.18.0 以上で .ts を実行、型は調べない）、257行目（import type が無いと失敗） |
| 12 | https://huggingface.co/docs/hub/rate-limits | Hub Rate limits | Resolvers は "URLs that contain a /resolve/ segment ... to download model/dataset files from HF"。"All values are defined over 5-minute windows"。"current rate limits (in September '25)": Anonymous user (per IP address) の Resolvers 3,000 | 335行目（ログインしていない利用者にもダウンロードを許す、IP ごとに5分で3,000回、2025年9月時点） |
| 13 | https://docs.voyageai.com/docs/pricing | Pricing (Voyage AI) | voyage-4-lite は "Price per million tokens" $0.02、"Number of free tokens" 200 million、"The first 200 million tokens for ... voyage-4-lite ... are free for every account" | 339行目（$0.02、最初の2億トークンは無料） |

## 実行ログを根拠にした文

| 本文 | 根拠 |
|---|---|
| 63〜69行目、278〜284行目「返金はいつ？」の結果（returns 0.852、cancel 0.832、points 0.823） | `run/10.log` |
| 81行目、284行目「BM25 の検索では『返金はいつ？』の答えの文書が上位3件に入らなかった、『は』だけが一致」 | 講座の記事 `content/articles/rag-bm25-search-typescript.md`（「語が一致しない質問では答えの文書が出てこない」の節）と、その記事のログ `logs/rag-bm25-search-typescript/run/09.log`、`15.log` |
| 87行目、frontmatter `run_environment`（Linux x64、Node.js 22.22.0、npm 10.9.4、4.3.2） | `run/*.log` の見出し `node: v22.22.0`、`npm: 10.9.4`、`run/25.log`（`Linux x86_64`、`@huggingface/transformers@4.3.2`、`onnxruntime-node@1.30.0`） |
| 89行目「型の確認は別に tsc 7.0.2」 | `run/19.log`〜`21.log`（`run/20.log` は skipLibCheck なしで、エラーはすべて `node_modules` の .d.ts。`run/21.log` は skipLibCheck ありで `tsc_exit=0`） |
| 118〜122行目「745M」「46個のパッケージ」「いちばん大きいのは onnxruntime-node」 | `run/03.log`（added 46 packages）、`run/04.log`（745M）、`run/24.log`（548M の onnxruntime-node が最大） |
| 124行目「CUDA のライブラリは1ファイルで 272,054,000 バイト」 | `run/22.log` |
| 132行目「484M」「CPU での検索の結果は同じ値」 | `run/14.log`、`run/15.log`、`run/16.log`（`run/10.log` と同じ出力） |
| 179〜185行目 show-vector の出力 | `run/06.log` |
| 195〜199行目「130M」「保存されたのは4ファイル」 | `run/07.log`、`run/18.log` |
| 203行目「初回が4.3秒、2回目が2.6秒」 | `run/06.log`（elapsed 4340 ms、ダウンロードを含む。作業フォルダは新しく作ったもので `.cache` は空だった）、`run/08.log`（elapsed 2576 ms） |
| 290〜296行目「家に届くまで何日？」の結果、「届く」は FAQ に出てこない | `run/11.log`、`code/docs.ts` に「届」の字が無い（目視と grep） |
| 306〜323行目「宿題を手伝って」の結果、差 0.018、0.04〜0.06 | `run/12.log`（0.797 − 0.779 = 0.018、0.832 − 0.797 = 0.035、0.859 − 0.797 = 0.062） |
| 327行目「ネットワークの無い環境で4つとも成功、スコアも同じ」 | `run/17.log`（`unshare -rn`、`network: EAI_AGAIN`、exit=0 が4回、出力は `run/06`、`10`、`11`、`12` と同じ） |
| 333行目「アカウントもトークンも使わなかった」「取得したファイルは4つ」 | 実行した環境に `HF_TOKEN` は無い（`env` に該当なし、値は表示していない）。`run/18.log` |
| 341行目「node_modules が 745M、モデルが 130M」 | `run/04.log`、`run/07.log` |
