# code: rag-retrieval-eval-recall-mrr

記事 `content/articles/rag-retrieval-eval-recall-mrr.md` に載せたコードと1文字も違わないファイル。2026-11-02 に、記事のコードブロックとの一致を `../lint/check-code-and-outputs.py` で確かめた（結果は `../lint/check-code-and-outputs.txt`、ALL OK）。

| ファイル | 記事での位置 |
|---|---|
| `package.json` | 「使うバージョンと準備」。依存は `@huggingface/transformers` 4.3.2 だけで、`^` を付けずに固定 |
| `metrics.ts`、`check-metrics.ts` | 「2つの指標は metrics.ts の3つの関数で書ける」 |
| `cases.ts` | 「評価用の質問は、検索器を動かす前に正解と組にして書く」。15問の質問と正解の id は手で書いたもの。検索器を1回も動かす前に書き、その時点の sha256 を `../run/cases-written-at.txt` に残した（2026-11-02 15:48:40 +0000） |
| `tokenize.ts`、`bm25.ts`、`docs.ts`、`embed.ts`、`vector-search.ts`、`rrf.ts` | 「採点する3つの検索器は RAG の回の6ファイルをそのまま使う」。`logs/rag-hybrid-search-rrf/code/` の同名ファイルを `cp` で写したもので、1文字も違わない（`../run/20.log`） |
| `eval.ts` | 「eval.ts は3つの検索器に同じ15問を投げて平均を出す」以降の実行 |
| `extra/run.sh` | 記事には載せない。記事のコマンドを実行して `../run/NN.log` を書くロガー（`logs/rag-hybrid-search-rrf/code/extra/run.sh` を写し、3〜4行目のパスの注記だけを変えたもの） |
| `extra/show-ranked.ts` | 記事には載せない確認用。`eval.ts` と同じ3つの検索器で、質問ごとの上位5件の id とスコアを出す（`../run/13.log`）。本文の点数（0.03252、0.03227、0.03226）と、下限0のときの `cancel` と `shipping-fee` の同点の根拠 |
| `extra/explain.ts` | 記事には載せない確認用。`logs/rag-hybrid-search-rrf/code/extra/explain.ts` に1行目の注記を足したもの。質問の語と、それが一致した文書を出す（`../run/21.log`）。本文の「返金はいつ？」は「は」だけが一致、「カードが使えない」の `payment` は「が」「使」「え」が一致、の根拠 |
| `extra/tsconfig.typecheck.json`、`extra/tsconfig.typecheck-skiplib.json` | 記事には載せない確認用。`logs/rag-hybrid-search-rrf/code/extra/` の同名ファイルの写し。Node.js の型ストリップは型を調べないので、`tsc` 7.0.2 と `@types/node` 22.20.5 を `--no-save` で入れて型を調べた。前者（`../run/14.log`）は `node_modules/@huggingface/` の型定義の中の12件のエラーで `tsc_exit=1`（記事のファイルと `extra` のファイルのエラーは0件）。後者は `skipLibCheck` を足したもので `tsc_exit=0`（`../run/15.log`） |
| `extra/offline-all.sh` | 記事には載せない確認用。ネットワークの無い名前空間（`unshare -rn`）で記事の `node` コマンド5つを実行し直した（`../run/16.log`）。記事では `| tail -n 4` を付ける2つのコマンドは、`tail` を付けずに全部の出力を記録した |
| `extra/env-check.sh` | 記事には載せない確認用。`logs/rag-hybrid-search-rrf/code/extra/env-check.sh` の写し。Hugging Face のトークンの環境変数が設定されていないことを、値を出さずに `set`／`unset` だけで記録した（`../run/17.log`） |

`node_modules` とダウンロードしたモデルはこのフォルダに置いていない（作業フォルダで入れ、作業のあと作業フォルダごと消した）。

## 実行ログ（`../run/`）

実行はすべて scratchpad の使い捨てフォルダで行い、終わったあと消した。作業フォルダの1つ上に、このフォルダへのシンボリックリンク `code` を置き、ファイルは `cp ../code/<file> .` で置いた（記事では読者がファイルを書いて保存する手順）。記事の手順と同じ順に実行した。

`cases.ts` を書いたあと、ログを取る前に、別の使い捨てフォルダで `check-metrics.ts` と `eval.ts` を試しに実行している（ログは残していない。その後 `eval.ts` に2つ目の引数 `minBm25` を足した）。`cases.ts` はその試しの前に書き終えていて、以後は変えていない（`../run/cases-written-at.txt` の sha256 と一致することを `../lint/check-code-and-outputs.txt` で確かめた）。記事の出力はすべて下のログから写した。

| ログ | コマンド |
|---|---|
| 01.log | `mkdir retrieval-eval`。記事の `cd retrieval-eval` は、ロガーの外で作業フォルダを指定して実行した。1回目の呼び出しで作業フォルダの指定を誤り（存在しないフォルダを指定して exit 1）、同じ番号で実行し直して上書きした |
| 02.log | `package.json` を置く |
| 03.log | `npm install` |
| 04.log | `du -sh node_modules`（745M） |
| 05.log | `metrics.ts`、`check-metrics.ts` を置く |
| 06.log | `node check-metrics.ts` |
| 07.log | `cases.ts`、`tokenize.ts`、`bm25.ts`、`docs.ts`、`embed.ts`、`vector-search.ts`、`rrf.ts`、`eval.ts` を置く |
| 08.log | `node eval.ts`（初回。モデルのダウンロードを含む） |
| 09.log | `du -sh node_modules/@huggingface/transformers/.cache`（130M） |
| 10.log、11.log | `node eval.ts 1`、`node eval.ts 5`（全部の出力） |
| 12.log | `node eval.ts 3 0` |
| 13.log | `node show-ranked.ts …`（上位5件とスコアの確認） |
| 14.log、15.log | `npx tsc -p …`（型チェック。14 は skipLibCheck なし、15 は skipLibCheck あり） |
| 16.log | `unshare -rn bash offline-all.sh`（ネットワークの無い環境で記事の `node` コマンド5つ） |
| 17.log | `bash ../code/extra/env-check.sh`（トークンの環境変数が unset） |
| 18.log、19.log | `node eval.ts 1 \| tail -n 4`、`node eval.ts 5 \| tail -n 4`（記事に載せた形。`bash -c` で実行） |
| 20.log | リポジトリのルートで `uname -sm` と、6ファイルの `cmp`（run.sh を使わずに書いた記録） |
| 21.log | `node explain.ts …`（一致した語の確認） |
| cases-written-at.txt | `cases.ts` を書き終えた時刻と sha256 |

14.log の `exit: 0` は `bash -c` の最後の `echo` の終了コードで、`tsc` の終了コードは出力の `tsc_exit=1` のほう。
