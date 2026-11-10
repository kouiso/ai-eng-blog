# code: rag-hybrid-search-rrf

記事 `content/articles/rag-hybrid-search-rrf.md` に載せたコードと1文字も違わないファイル。2026-10-31 に、記事のコードブロックとの一致を `../lint/check-code-and-outputs.py` で確かめた（結果は `../lint/check-code-and-outputs.txt`、ALL OK）。

| ファイル | 記事での位置 |
|---|---|
| `package.json` | 「使うバージョンと準備」。依存は `@huggingface/transformers` 4.3.2 だけで、`^` を付けずに固定 |
| `tokenize.ts`、`bm25.ts` | 「BM25 の検索は語の一致でスコアを付ける」。`logs/rag-bm25-search-typescript/code/` の同名ファイルと同じ内容 |
| `docs.ts` | 同上。`logs/rag-bm25-search-typescript/code/docs.ts` の FAQ 8件に、`error-e1020` と `error-e1021` の2件を足したもの。どれも架空のネットショップの文で、手で書いたもの |
| `embed.ts`、`vector-search.ts` | 「ベクトル検索は multilingual-e5-small の埋め込みで並べる」。`vector-search.ts` は型 `Doc`、`Hit` を `bm25.ts` から読み込む |
| `rrf.ts` | 「RRF の関数は文書の ID と順位しか見ない」 |
| `hybrid.ts` | 「2つの検索を合わせて上位3件を出す」以降の実行 |
| `extra/run.sh` | 記事には載せない。記事のコマンドを実行して `../run/NN.log` を書くロガー（`logs/rag-local-embeddings-transformers-js/code/extra/run.sh` を写し、空白を含む引数を `""` でくくって記録するようにしたもの。シンボリックリンク越しでもログの置き場所を正しく決めるため `cd -P` にした） |
| `extra/explain.ts` | 記事には載せない確認用。質問の語と、それが一致した文書、文書の語の数を出す（`run/14.log`）。本文の「一致したのは…」「『が』を含む文書は10件中4件」の根拠 |
| `extra/tsconfig.typecheck.json`、`extra/tsconfig.typecheck-skiplib.json` | 記事には載せない確認用。Node.js の型ストリップは型を調べないので、`tsc` 7.0.2 と `@types/node` 22.20.5 を `--no-save` で入れて型を調べた。前者（`run/15.log`）は `node_modules/@huggingface/` の型定義の中の12件のエラーで `tsc_exit=1`（記事のファイルのエラーは0件）。後者は `skipLibCheck` を足したもので `tsc_exit=0`（`run/16.log`） |
| `extra/offline-all.sh` | 記事には載せない確認用。ネットワークの無い名前空間（`unshare -rn`）で記事の `node` コマンド7つを実行し直した（`run/17.log`） |
| `extra/env-check.sh` | 記事には載せない確認用。Hugging Face のトークンの環境変数が設定されていないことを、値を出さずに `set`／`unset` だけで記録した（`run/18.log`） |
| `extra/check-norm.ts` | 記事には載せない確認用。`embed` の返すベクトルの次元数と長さを出した（`run/19.log`） |

`node_modules` とダウンロードしたモデルはこのフォルダに置いていない（作業フォルダで入れ、作業のあと作業フォルダごと消した）。

## 実行ログ（`../run/`）

実行はすべて scratchpad の使い捨てフォルダで行い、終わったあと消した。作業フォルダの1つ上に、このフォルダへのシンボリックリンク `code` を置き、ファイルは `cp ../code/<file> .` で置いた（記事では読者がファイルを書いて保存する手順）。記事の手順と同じ順に実行した。`npm install` の前に、このフォルダのファイルを作るための試しの実行を別の使い捨てフォルダで行っている（ログは残していない。記事の出力はすべて下のログから写した）。

| ログ | コマンド |
|---|---|
| 01.log | `mkdir hybrid-search`。記事の `cd hybrid-search` は、ロガーの外で作業フォルダを指定して実行した |
| 02.log | `package.json` を置く |
| 03.log | `npm install` |
| 04.log | `du -sh node_modules`（745M） |
| 05.log | `tokenize.ts`、`bm25.ts`、`docs.ts`、`embed.ts`、`vector-search.ts`、`rrf.ts`、`hybrid.ts` を置く |
| 06.log | `node hybrid.ts 利用限度額`（初回。モデルのダウンロードを含む） |
| 07.log | `du -sh node_modules/@huggingface/transformers/.cache`（130M） |
| 08.log〜13.log | `node hybrid.ts` に「5営業日」「"E1021 が出た"」「届くのが遅い」「届くのが遅い 0.1 1」「返金はいつ？」「返金はいつ？ 0」 |
| 14.log | `node explain.ts …`（一致した語の確認） |
| 15.log、16.log | `npx tsc -p …`（型チェック。15 は skipLibCheck なし、16 は skipLibCheck あり） |
| 17.log | `unshare -rn bash offline-all.sh`（ネットワークの無い環境で記事の `node` コマンド7つ） |
| 18.log | `bash ../code/extra/env-check.sh`（トークンの環境変数が unset） |
| 19.log | `node check-norm.ts`（次元数と長さ） |

15.log の `exit: 0` は `bash -c` の最後の `echo` の終了コードで、`tsc` の終了コードは出力の `tsc_exit=1` のほう。
