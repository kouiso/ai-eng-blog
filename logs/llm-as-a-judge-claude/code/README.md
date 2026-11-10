# code: llm-as-a-judge-claude

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `rubric.md` | 規則を書いた採点基準（記事の `rubric.md`） |
| `rubric-vague.md` | 2行だけの採点基準（記事の `rubric-vague.md`） |
| `judge.ts` | 採点を呼ぶ関数（記事の `judge.ts`） |
| `grade.ts` | 5件を採点して人の点と比べるコード（記事の `grade.ts`。c の回答を書き換えたあとの形） |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`、`npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322`）でできたものを写した。依存は `^` なしの `0.3.322` |
| `extra/grade-first.ts` | c の回答を書き換える前の `grade.ts`。`grade.ts` と違うのは c の行だけで、記事の diff の「変更前」。`run/06.log`〜`08.log` はこれを `grade.ts` の名前で動かした |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `run/01.log`〜`12.log` に残すスクリプト（記事には載せない） |
| `extra/run-inspect.sh` | `run-all.sh` のあとに、同じ作業フォルダで確認用の2本を動かして `run/13.log`、`run/14.log` に残すスクリプト（記事には載せない） |
| `extra/inspect.ts` | `judge.ts` と同じオプションで1件を採点し、init のモデルとツールの一覧、ツール呼び出しの名前、`num_turns` を表示する（`run/13.log`。記事の 217、227〜229 行目の根拠） |
| `extra/maxturns1.ts` | `inspect.ts` に `maxTurns: 1` を足したもの（`run/14.log`）。`subtype` は `success`、`num_turns=2` で、上限 1 でも止まらなかった。記事には書いていない |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/12.log`。記事には載せない） |

実行は 2026-11-10。作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` はここに置いていない。

モデルを呼ぶ `run/06.log`〜`11.log`、`run/13.log`、`run/14.log` は、オーナー自身の Claude プランでログイン済みの環境で動かした（`ANTHROPIC_API_KEY` は unset、init の `apiKeySource` は `"none"`）。ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない（コードがそれらを表示しない）。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>` に置き換えた。

`run/12.log` は `tsc 7.0.2`（`@types/node 22.19.1`、`strict`、`allowImportingTsExtensions`）での `judge.ts` と `grade.ts` の型の確認で、`tsc_exit=0`。

## 残していない実行（正直に書いておく）

`run/` に残したのは、最後に通した `run-all.sh` と `run-inspect.sh` の実行だけ。その前に、次の実行をした。

- 記録なしの試し（スクラッチの作業フォルダで直接 `node grade.ts`）。変更前の c は2点、変更後の5件は5/5、2行の基準は2/5だった。
- `run-all.sh` の最初の版（変更前の `grade.ts` を1回だけ動かす版）の通しの実行。そのときの変更前の c は3点（人の点と一致）だった。その後、変更前を3回動かす版に `run-all.sh` を直して通し直し、`run/` を上書きした。

つまり変更前の c は、残っていない実行を含めると2点の回と3点の回があった。記事は残っている `run/06.log`〜`08.log`（3回とも2点）だけを根拠にしていて、「毎回2点になる」とは書いていない。規則2と規則3のどちらにも読める回答だったので点が揺れたと考えられるが、記録が無いので記事には書かない。
