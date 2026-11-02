# code/

記事 `content/articles/llm-eval-harness-fixtures.md` に載せたコードを、記事の形のまま置いています。

| ファイル | 記事の中の位置 |
|---|---|
| `package.json` | 「動かした環境と作るファイル」 |
| `graders.ts` | 「graders.ts に置く3つの採点関数」 |
| `cases.ts`、`answers.ts` | 「テストケースと見本の回答を分けた2つのファイル」 |
| `run-eval.ts` | 「合格率が基準を下回ったら終了コード 1 で終わる」 |
| `compare.ts` | 「部分一致は「13件」の答えも3件として通す」 |

記事と1文字も違わないことは `../lint/check-code-and-outputs.py` で確かめています（結果は `../lint/check-code-and-outputs.txt`）。依存パッケージは無いので `npm install` はしません。`answers.ts` の回答は手で書いた見本で、モデルの出力ではありません。

`extra/` は記事に載せない確認用です。

- `run-all.sh`: 作業場所に記事どおり `llm-eval` フォルダを作り、上のファイルを置いて、記事の順に `node` コマンドを実行し、`../run/01.log`〜`09.log` を書きます。作業場所には、セッションの一時フォルダを使い、終わったら消しました。ログの中の作業場所のパスは `<work>`、このフォルダのパスは `<code>` に置き換えています。
- `no-normalize.ts`: `normalize` を通さずに比べると見本の回答が不合格になることを確かめます（`../run/04.log`）。
- `gflag.ts`: `g` フラグ付きの正規表現を使い回すと `test()` の結果が入れ替わることを確かめます（`../run/05.log`）。
- `missing-answer.ts`: 空の文字列が3つの採点関数のどれでも不合格になることを確かめます（`../run/06.log`）。
- `format-only.ts`: `delivery-date` の正規表現が違う日付も合格にすることを確かめます（`../run/09.log`）。
- `tsconfig.typecheck.json`: TypeScript 7.0.2 と `@types/node` 22.20.5 で型を確かめる設定です（`../run/07.log`）。記事の作業フォルダとは別のフォルダに `--no-save` で入れました。Node.js は型を検査せずに `.ts` を実行するので、別に確かめています。

`../run/08.log` は、ネットワークの無い名前空間（`unshare -rn`）で記事の `node` コマンド2つを動かした記録です。外への `fetch` が失敗する環境でも、出力は `02.log`、`03.log` と同じでした。`../run/10.log` は OS とアーキテクチャの確認（`uname -sm`）で、`run-all.sh` の外で手で実行しました。

`02.log` の末尾の `--- exit=0` は、コマンドの最後の `echo` の終了コードです。`node run-eval.ts` 自身の終了コードは、出力の `終了コード: 1` の行に出ています。
