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
| `extra/run-recheck.sh` | 2026-11-10 にレビューの指摘（2行の基準の結果が1回分だけ、変更前の c の結果の書き方）を受けて足したスクリプト。新しい作業フォルダで記事の手順どおりに SDK を入れ直し（`run/15.log`）、変更前の `grade.ts` を3回（`run/16.log`〜`18.log`）、記事の `grade.ts` と `rubric.md` を3回（`run/19.log`〜`21.log`）、`rubric-vague.md` を4回（`run/22.log`〜`25.log`）動かす（記事には載せない） |
| `extra/inspect.ts` | `judge.ts` と同じオプションで1件を採点し、init のモデルとツールの一覧、ツール呼び出しの名前、`num_turns` を表示する（`run/13.log`。記事の 217 行目の根拠。ツールの一覧の話は Structured Outputs の説明に当たるので、直したあとの本文からは外した） |
| `extra/maxturns1.ts` | `inspect.ts` に `maxTurns: 1` を足したもの（`run/14.log`）。`subtype` は `success`、`num_turns=2` で、上限 1 でも止まらなかった。記事には書いていない |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/12.log`。記事には載せない） |

実行は 2026-11-10。作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` はここに置いていない。

モデルを呼ぶ `run/06.log`〜`11.log`、`run/13.log`、`run/14.log`、`run/16.log`〜`25.log` は、オーナー自身の Claude プランでログイン済みの環境で動かした（`ANTHROPIC_API_KEY` は unset、init の `apiKeySource` は `"none"`）。ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない（コードがそれらを表示しない）。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>` に置き換えた。

`run/12.log` は `tsc 7.0.2`（`@types/node 22.19.1`、`strict`、`allowImportingTsExtensions`）での `judge.ts` と `grade.ts` の型の確認で、`tsc_exit=0`。

## 残していない実行（正直に書いておく）

`run/` に残したのは、最後に通した `run-all.sh` と `run-inspect.sh` の実行（`run/01.log`〜`14.log`）と、そのあとに足した `run-recheck.sh` の実行（`run/15.log`〜`25.log`）だけ。ほかに、次の実行をした。

- 記録なしの試し（スクラッチの作業フォルダで直接 `node grade.ts`）。変更前の c は2点、変更後の5件は5/5、2行の基準は2/5だった。
- `run-all.sh` の最初の版（変更前の `grade.ts` を1回だけ動かす版）の通しの実行。そのときの変更前の c は3点（人の点と一致）だった。その後、変更前を3回動かす版に `run-all.sh` を直して通し直し、`run/` を上書きした。
- 2026-11-10 のレビューでの再実行（この記事の執筆とは別のエージェントが、同じ環境で記事のコードそのものを SDK 0.3.322 を入れ直して動かした。apiKeySource=none）。`node grade.ts rubric-vague.md` を3回動かして3回とも `人の採点との一致: 3/5`、d の点は 2、3、2、b の点は 3、4、3。`extra/grade-first.ts` を3回動かして3回とも c=2（4/5）。`rubric.md` で1回動かして 5/5。この出力は `run/` に無い。

つまり変更前の c は、残っていない実行を含めると2点の回と3点の回があった。ログを残した6回（`run/06.log`〜`08.log`、`run/16.log`〜`18.log`）はすべて2点。記事には「ログを残した6回のどれでも食い違った」「ログを残していない通しの実行では3点の回も1回あった」の両方を書いた（直す前の版は「3回動かして3回とも」と書き、3点の回を書いていなかった。レビューの指摘で直した）。

2行の基準も同じで、ログを残した5回（`run/11.log`、`run/22.log`〜`25.log`）は一致が2、1、2、2、2件、レビューでの3回は3件ずつだった。記事にはログを残していない3回の結果も、そうだと分かる形で書いた（一致は回によって1〜3件、d が c より上は8回のうち6回）。
