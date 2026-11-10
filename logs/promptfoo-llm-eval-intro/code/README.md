# code: promptfoo-llm-eval-intro

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `promptfooconfig.yaml` | 記事の設定ファイル（yaml のブロック） |
| `show-failures.ts` | 記事の `show-failures.ts` |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`、`npm install --save-exact promptfoo@0.125.1 @anthropic-ai/claude-agent-sdk@0.3.322`）でできたものを写した（`run/11.log`）。依存は `^` なし |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `run/01.log`〜`11.log` に残すスクリプト（記事には載せない） |
| `extra/run-extra.sh` | `run-all.sh` のあとに同じ作業フォルダで補助の確認を2つ実行し、`run/12.log`、`13.log` に残す（記事には載せない） |
| `extra/promptfooconfig.no-system-prompt.yaml` | 記事の設定から `custom_system_prompt` の1行だけを消したもの。記事の「システムプロンプトを差し替えると」の表の2行目（`run/08.log`） |
| `extra/sum-cost.ts` | `results.jsonl` の `cost` を合計し、`costBasis` を表示する（`run/12.log`。記事の 0.00236732 ドルの根拠） |
| `extra/check-auth.ts` | 同じ SDK とログインで `query()` を1回動かし、init の `apiKeySource` を表示する（`run/13.log`。スキルの「Claude プランで動かす記事」4の記録） |
| `extra/tsconfig.typecheck.json` | `show-failures.ts` の型の確認用（`run/10.log`。TypeScript 7.0.2、`@types/node` 22.20.5、`strict`。記事には載せない） |

## 実行について

- 実行は 2026-11-10。作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` と `results.jsonl` はここに置いていない（`results.jsonl` には呼び出しごとのセッションの ID が入るため）。
- モデルを呼ぶ `run/04.log`、`06.log`、`08.log`、`13.log` は、オーナー自身の Claude プランでログイン済みの環境で動かした。`ANTHROPIC_API_KEY` は unset（各ログの4行目）、init の `apiKeySource` は `none`（`run/13.log`）。
- ログは `run-all.sh` の `clean` を通して保存した。通したのは3つの置き換えだけで、ほかは出力のまま。
  1. ANSI の色コードを外した（promptfoo の表は色付きで出る）
  2. 作業フォルダの絶対パスを `<work>`、型の確認用のフォルダを `<tc>`、その親を `<base>` に置き換えた
  3. UUID の形の文字列（promptfoo の表の `sessionId` 列）を `<session-id>` に置き換え、表の桁がずれないよう元の長さまで空白で埋めた
- ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない。
- 記事の「2回目も合格の数は同じで」は `run/06.log`（2回目の eval）と `run/07.log`（2回目の `show-failures.ts`）。`run/05.log` は1回目の `show-failures.ts`。
- `run/09.log` は `npm audit` の末尾12行。記事の「`npm audit fix --force` は実行しない」に載せた2行はここから写した。

## 補足

- 書き始める前の試し（同じ設定で、ラベルの名前が違う版）を、同じ日に別のフォルダで数回動かした。その出力は記事にもログにも使っていない。ラベルの名前を変えたあとで `run-all.sh` を最初から動かし直し、記事の出力はすべてその実行のログから写した。
- このリポジトリの環境では `*.log` を Read ツールと `cat` で開けない設定になっている。そのため `run-all.sh` は保存と同時に同じ内容を標準出力にも出し（`tee`）、その表示から記事に写した。写した結果が1文字も違わないことは `lint/check-code-and-outputs.py` で確かめた（`lint/check-code-and-outputs.txt` が ALL OK）。
