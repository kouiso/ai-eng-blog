# code: zod-validate-llm-json-output

記事 `content/articles/zod-validate-llm-json-output.md` に載せたコードと1文字も違わないファイル。2026-11-10 に、記事のコードブロックとの一致を `../lint/check-code-and-outputs.py` で確かめた（結果は `../lint/check-code-and-outputs.txt`、ALL OK）。

| ファイル | 記事での位置 |
|---|---|
| `package.json` | 「使うバージョンと準備」 |
| `schema.ts`、`samples.ts`、`check.ts` | 「スキーマと見本の JSON」 |
| `lowercase-enum.ts` | 「大文字と小文字の違いは z.enum の前にそろえる」（2026-11-10 に追加） |
| `retry-message.ts` | 「prettifyError でモデルへの再依頼の文を作る」 |
| `pretty-ja.ts` | 「メッセージを日本語にする」 |
| `strip.ts` | 「z.object は余分なキーを黙って消す」 |
| `extra/tsconfig.typecheck.json` | 記事には載せない確認用。Node.js の型ストリップは型を調べないので、`tsc` 7.0.2 と `@types/node` 22.20.5 を `--no-save` で入れて型を調べた（`run/14.log`） |
| `extra/offline-all.sh` | 記事には載せない確認用。ネットワークの無い名前空間（`unshare -rn`）で記事の `node` コマンドを全部実行し直した（`run/15.log`） |
| `extra/run-all.sh` | 記事には載せない確認用。記事の手順の順に全コマンドを実行して `run/01.log`〜`15.log` を書く。使い方は `run-all.sh <作業場所の親フォルダ> <run ログの出力先>` |

依存は `^` なしの完全固定（`zod` 4.6.7）。`node_modules` はこのフォルダに置いていない。`samples.ts` の JSON は、モデルの出力の形をまねて手で作った見本で、実際のモデルの出力ではない。

## 実行ログ（`../run/`）

2026-11-10 に `extra/run-all.sh` で全手順を新しい作業フォルダでやり直し、`run/` を 01〜15 で上書きした。実行は scratchpad の使い捨てフォルダで行い、終わったあと消した。ログのコマンドに出る `(code)` は、このフォルダ（書き写す代わりに cp した元）を指す。記事の手順と同じ順に実行した。

| ログ | コマンド |
|---|---|
| 01.log | `mkdir zod-llm-check`。記事の `cd zod-llm-check` は、スクリプトの中の `cd` で行った |
| 02.log | `package.json` を置く |
| 03.log | `npm install` |
| 04.log | `schema.ts`、`samples.ts`、`check.ts` を置く |
| 05.log〜09.log | `node check.ts ok`、`wrong-type`、`bad-enum`、`extra-key`、`many` |
| 10.log | `lowercase-enum.ts` を置いて `node lowercase-enum.ts` |
| 11.log | `retry-message.ts` を置いて `node retry-message.ts` |
| 12.log | `pretty-ja.ts` を置いて `node pretty-ja.ts` |
| 13.log | `strip.ts` を置いて `node strip.ts` |
| 14.log | `typescript@7.0.2` と `@types/node@22.20.5` を `--no-save` で入れて `npx tsc -p tsconfig.typecheck.json`（型チェック、`tsc_exit=0`。`lowercase-enum.ts` を含む全 `.ts`） |
| 15.log | `unshare -rn ./offline-all.sh`（ネットワークの無い環境で全 `node` コマンド） |

2026-10-31 の版では、最初の試行で型チェックを `@types/node` なしで実行して `process` が見つからず失敗した（確認用の設定の不足で、記事のコードは変えていない）。その後の 01〜14 は、2026-11-10 の 01〜15 で上書きした。
