# code: zod-to-json-schema-tool-definition

記事 `content/articles/zod-to-json-schema-tool-definition.md` に載せたコードと、1文字も違わないファイルです（`lint/check-code-and-outputs.txt` で照合）。

| ファイル | 記事の中の場所 |
|---|---|
| `package.json`、`tsconfig.json` | 手順1 |
| `src/schema.ts` | 手順2 |
| `src/tool.ts` | 手順3 |
| `src/check-input.ts` | 手順4 |
| `src/compare-io.ts` | 「io の指定を省くと limit が必須の項目になる」 |
| `src/date-error.ts` | 「z.date() のような変換できない型は例外になる」 |

## 実行のしかた

`extra/run.sh` が、記事のコマンドを1つずつ作業フォルダで実行し、`run/NN.log` に日時、作業フォルダ、`node -v`、`npm -v`、コマンド、終了コード、標準出力と標準エラーを書きます。作業フォルダの絶対パスは `/path/to` に置き換えています。

記事の手順との対応は次のとおりです。

1. `run/01.log`: `mkdir -p zod-tool-schema/src`（記事の `cd zod-tool-schema` は、以後のコマンドをそのフォルダで実行する形で再現した。ログの `cwd:` の行）
2. このフォルダの `package.json`、`tsconfig.json`、`src/*.ts` を作業フォルダにコピー（記事でファイルを保存する操作に当たる）
3. `run/02.log`: `npm install`
4. `run/03.log`: `npm run typecheck`
5. `run/04.log`〜`07.log`: `node src/tool.ts`、`node src/compare-io.ts`、`node src/check-input.ts`、`node src/date-error.ts`

記事の外の確認は次の3つです。

- `run/08.log`: `src/tool.ts` の最後の `return` を `return json;` に変えた版で `npm run typecheck`（差分は `extra/return-json.diff`）。記事の手順3に載せた型エラーはこのログから写した。
- `run/09.log`: 元の `src/tool.ts` に戻して `npm run typecheck`（エラーなし）。
- `run/10.log`: `extra/email-pattern.mjs`。変換した `email` の `pattern` が `z.regexes.email.source` と同じ文字列かを比べた（`true`）。

`node_modules/` はコミットしない（ルートの `.gitignore`）。依存のバージョンは `package.json` で `^` なしに固定している。

環境の記録は次の2つです。

- `run/11.log`: `npm ls --depth=0`（入ったバージョンが `package.json` と同じことの確認）
- `run/12.log`: `npx tsc -v`（`Version 7.0.2`）

## 2026-11-10 の再実行（run/13〜24）

記事の前提の文（Node.js の版）を直したときに、同じ `extra/run.sh` で、空の作業フォルダから同じ手順をもう一度通しました。番号の対応は次のとおりです。

| 2026-10-31 | 2026-11-10 | コマンド |
|---|---|---|
| `run/01` | `run/13` | `mkdir -p zod-tool-schema/src` |
| `run/02` | `run/14` | `npm install`（所要時間が 3s から 2s に変わった。記事の出力は `run/14` に合わせた） |
| `run/03` | `run/15` | `npm run typecheck` |
| `run/04`〜`07` | `run/16`〜`19` | `node src/tool.ts`、`node src/compare-io.ts`、`node src/check-input.ts`、`node src/date-error.ts` |
| `run/08` | `run/20` | `return json;` に変えた版で `npm run typecheck`（終了コード 1） |
| `run/09` | `run/21` | 元に戻して `npm run typecheck` |
| `run/10` | `run/22` | `extra/email-pattern.mjs` の実行（2026-11-10 は作業フォルダに `extra/` を置いて `node extra/email-pattern.mjs`。結果は `true`） |
| `run/11` | `run/23` | `npm ls --depth=0` |
| `run/12` | `run/24` | `npx tsc -v`（`Version 7.0.2`） |

`lint/check-code-and-outputs.py` は、2026-11-10 からは `run/13`〜`21` と照合しています。
