# code: rag-local-embeddings-transformers-js

記事 `content/articles/rag-local-embeddings-transformers-js.md` に載せたコードと1文字も違わないファイル。2026-10-31 に、記事のコードブロックとの一致を `../lint/check-code-and-outputs.py` で確かめた（結果は `../lint/check-code-and-outputs.txt`、ALL OK）。

| ファイル | 記事での位置 |
|---|---|
| `package.json` | 「使うバージョンと準備」（`@huggingface/transformers` を 4.3.2 に固定、`^` なし） |
| `embed.ts`、`show-vector.ts` | 「モデルを読み込んで1文を384次元のベクトルにする」 |
| `docs.ts`、`vector-search.ts`、`search.ts` | 「FAQ 8件をベクトルにして検索する」。`docs.ts` の FAQ 8件は `logs/rag-bm25-search-typescript/code/docs.ts` と同じ文（`export const docs` から `];` までを diff で一致を確認）。架空のネットショップの文で、手で書いたもの |
| `extra/run.sh` | 記事には載せない。記事のコマンドを実行して `../run/NN.log` を書くロガー（`logs/rag-bm25-search-typescript/code/extra/run.sh` に npm の版、実行時間、ログを標準出力に出す行を足し、ICU の行を外したもの）。シンボリックリンク経由だとログの書き先がずれるので、実体のパスで呼んだ |
| `extra/offline-all.sh` | 記事には載せない確認用。ネットワークの無い名前空間（`unshare -rn`）で、モデルをダウンロードしたあとの作業フォルダから記事の `node` コマンド4つを実行し直した（`run/17.log`） |
| `extra/tsconfig.typecheck.json` | 記事には載せない確認用。`logs/rag-bm25-search-typescript/code/extra/tsconfig.typecheck.json` と同じ。これで `tsc` 7.0.2 を実行すると、`node_modules` の中の .d.ts（`@huggingface/tokenizers` と `@huggingface/transformers` の型定義）でエラーが出た（`run/20.log`）。記事のファイルのエラーは0件 |
| `extra/tsconfig.typecheck-skiplib.json` | 上に `"skipLibCheck": true` を足したもの。ライブラリの .d.ts の検査だけを外し、記事の `*.ts` は `strict` で検査する。`tsc_exit=0`（`run/21.log`） |

`node_modules` とモデルのキャッシュはこのフォルダに置いていない。

## 実行ログ（`../run/`）

実行はすべて scratchpad の使い捨てフォルダで行い、終わったあと消した。作業フォルダの1つ上に、このフォルダへのシンボリックリンク `code` を置き、ファイルは `cp ../code/<file> .` で置いた（記事では読者がファイルを書いて保存する手順）。記事の手順と同じ順に実行した。ログのコマンド行は、シェルが引用符を外したあとの引数で記録される（例 `node search.ts 宿題を手伝って 8`）。

| ログ | コマンド |
|---|---|
| 01.log | `mkdir local-embeddings`。記事の `cd local-embeddings` は、ロガーの外のシェルで実行した |
| 02.log | `package.json` を置く |
| 03.log、04.log | `npm install`、`du -sh node_modules` |
| 05.log | `embed.ts`、`show-vector.ts` を置く |
| 06.log | `node show-vector.ts "返金はいつ？"`（初回。モデルのダウンロードを含む） |
| 07.log | `du -sh node_modules/@huggingface/transformers/.cache` |
| 08.log | `node show-vector.ts "返金はいつ？"`（2回目。時間の比較用） |
| 09.log | `docs.ts`、`vector-search.ts`、`search.ts` を置く |
| 10.log〜12.log | `node search.ts` に「返金はいつ？」「家に届くまで何日？」「宿題を手伝って」と `8` |
| 13.log | 別のフォルダ `local-embeddings-skip` を作り、記事の6ファイルを置く |
| 14.log | `ONNXRUNTIME_NODE_INSTALL=skip npm install`（環境変数の代入をロガーに渡すため `bash -c` で包んだ。ログのコマンド行は `bash -c ONNXRUNTIME_NODE_INSTALL=skip npm install`） |
| 15.log、16.log | skip で入れたフォルダで `du -sh node_modules`、`node search.ts "返金はいつ？"` |
| 17.log | `unshare -rn bash offline-all.sh`（ネットワークの無い環境で記事の `node` コマンド4つ） |
| 18.log | キャッシュに保存されたファイルと大きさ（`find ... -printf '%s %P\n'`） |
| 19.log〜21.log | `npm install --no-save typescript@7.0.2 @types/node@22.20.5`、`tsc`（skipLibCheck なし、あり） |
| 22.log | 2つのフォルダの `onnxruntime-node/bin/napi-v6/linux/x64` のファイルの大きさ |
| 23.log、24.log | `node_modules` の中で大きい順の4つ（skip あり、なし。24 は 19 で typescript を入れたあと） |
| 25.log | `uname -sm` と `npm ls @huggingface/transformers onnxruntime-node` |
