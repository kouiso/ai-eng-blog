# code: rag-local-embeddings-transformers-js

記事 `content/articles/rag-local-embeddings-transformers-js.md` に載せたコードと1文字も違わないファイル。2026-11-10 に、記事のコードブロックとの一致を `../lint/check-code-and-outputs.py` で確かめた（結果は `../lint/check-code-and-outputs.txt`、ALL OK）。

| ファイル | 記事での位置 |
|---|---|
| `package.json` | 「使うバージョンと準備」（`@huggingface/transformers` を 4.3.2 に固定、`^` なし） |
| `embed.ts`、`show-vector.ts` | 「モデルを読み込んで1文を384次元のベクトルにする」 |
| `count-tokens.ts` | 「512トークンを超えた部分はエラーを出さずに切り捨てられる」（2026-11-10 に追加） |
| `docs.ts`、`vector-search.ts`、`search.ts` | 「FAQ 8件をベクトルにして検索する」。`docs.ts` の FAQ 8件は `logs/rag-bm25-search-typescript/code/docs.ts` と同じ文（`export const docs` から `];` までを diff で一致を確認）。架空のネットショップの文で、手で書いたもの |
| `extra/run.sh` | 記事には載せない。記事のコマンドを実行して `../run/NN.log` を書くロガー（`logs/rag-bm25-search-typescript/code/extra/run.sh` に npm の版、実行時間、ログを標準出力に出す行を足し、ICU の行を外したもの）。シンボリックリンク経由だとログの書き先がずれるので、実体のパスで呼んだ |
| `extra/offline-all.sh` | 記事には載せない確認用。ネットワークの無い名前空間（`unshare -rn`）で、モデルをダウンロードしたあとの作業フォルダから記事の `node` コマンドを実行し直す。2026-10-31 は4つ（`run/17.log`）。2026-11-10 に `count-tokens.ts` を足して5つにし（`run/43.log`）、同じスクリプトを `unshare` なしで CUDA のライブラリを入れたフォルダでも実行した（`run/51.log`） |
| `extra/tsconfig.typecheck.json` | 記事には載せない確認用。`logs/rag-bm25-search-typescript/code/extra/tsconfig.typecheck.json` と同じ。これで `tsc` 7.0.2 を実行すると、`node_modules` の中の .d.ts（`@huggingface/tokenizers` と `@huggingface/transformers` の型定義）でエラーが出た（`run/20.log`）。記事のファイルのエラーは0件 |
| `extra/tsconfig.typecheck-skiplib.json` | 上に `"skipLibCheck": true` を足したもの。ライブラリの .d.ts の検査だけを外し、記事の `*.ts` は `strict` で検査する。`tsc_exit=0`（`run/21.log`） |

`node_modules` とモデルのキャッシュはこのフォルダに置いていない。

## 実行ログ（`../run/`）

### 2026-11-10（本文の根拠。記事の手順をやり直したもの）

記事の直し（依存の入れ直しの手順を `rm -rf node_modules` から始める形にした、`count-tokens.ts` を足した）に合わせて、scratchpad の新しい使い捨てフォルダで記事の手順を最初からやり直した。終わったあとフォルダは消した。置き方とロガーは下の 2026-10-31 と同じ。`tsc` の前に、`extra/tsconfig.typecheck*.json` を作業フォルダへ `cp` した（`include` が設定ファイルのフォルダから見たパスのため。この `cp` はロガーの外）。

| ログ | コマンド |
|---|---|
| 26.log | `mkdir local-embeddings`。記事の `cd local-embeddings` は、ロガーの外のシェルで実行した |
| 27.log | `package.json` を置く |
| 28.log、29.log | `npm install`（added 46 packages）、`du -sh node_modules`（745M） |
| 30.log〜32.log | `rm -rf node_modules`、`ONNXRUNTIME_NODE_INSTALL=skip npm install`（`bash -c` で包んだ。`package-lock.json` が残っているので added 48 packages）、`du -sh node_modules`（502M） |
| 33.log | `embed.ts`、`show-vector.ts` を置く |
| 34.log | `node show-vector.ts "返金はいつ？"`（初回。モデルのダウンロードを含む、3287 ms） |
| 35.log | `du -sh node_modules/@huggingface/transformers/.cache`（130M） |
| 36.log | `node show-vector.ts "返金はいつ？"`（2回目、1686 ms） |
| 37.log | `docs.ts`、`vector-search.ts`、`search.ts` を置く |
| 38.log〜40.log | `node search.ts` に「返金はいつ？」「家に届くまで何日？」「宿題を手伝って」と `8` |
| 41.log、42.log | `count-tokens.ts` を置く、`node count-tokens.ts` |
| 43.log | `unshare -rn bash ../code/extra/offline-all.sh`（ネットワークの無い環境で記事の `node` コマンド5つ） |
| 44.log | キャッシュに保存されたファイルと大きさ |
| 45.log〜47.log | 別のフォルダ `local-embeddings-full` を作り記事の7ファイルを置く、ふつうの `npm install`、`du -sh node_modules`（745M） |
| 48.log | 2つのフォルダの `onnxruntime-node/bin/napi-v6/linux/x64` のファイルの大きさ（CUDA のライブラリは full だけ） |
| 49.log、50.log | full のフォルダで `node_modules` を消さずに `ONNXRUNTIME_NODE_INSTALL=skip npm install`、そのあとも CUDA のライブラリが残ることと `du`（763M） |
| 51.log | full のフォルダで `bash ../code/extra/offline-all.sh`（ネットワークあり。記事の `node` コマンド5つの出力が skip のフォルダと同じ） |
| 52.log | full のフォルダの `node_modules` で大きい順の4つ（最大は onnxruntime-node） |
| 53.log | `uname -sm` と `npm ls @huggingface/transformers onnxruntime-node` |
| 54.log〜56.log | `npm install --no-save typescript@7.0.2 @types/node@22.20.5`、`tsc`（skipLibCheck なし、あり） |

### 2026-10-31（初版の経緯。本文の根拠には使っていない）

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
