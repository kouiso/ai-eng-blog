# code: promptfoo-llm-eval-intro

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `promptfooconfig.yaml` | 記事の設定ファイル（yaml のブロック） |
| `show-failures.ts` | 記事の `show-failures.ts` |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`、`npm install --save-exact promptfoo@0.125.1 @anthropic-ai/claude-agent-sdk@0.3.322`）でできたものを写した（`run/11.log`）。依存は `^` なし |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `run/01.log`〜`11.log` に残すスクリプト（記事には載せない） |
| `extra/run-extra.sh` | `run-all.sh` のあとに同じ作業フォルダで補助の確認を2つ実行し、`run/12.log`、`13.log` に残す（記事には載せない） |
| `extra/run-fix.sh` | 2026-11-11 に設定へ `strict_mcp_config: true` を足したあと、記事の手順を空の作業フォルダからやり直して `run/14.log`〜`23.log` に残す（記事には載せない）。記事の出力と数値は今はこのログから写している |
| `extra/promptfooconfig.no-system-prompt.yaml` | 記事の設定から `custom_system_prompt` の1行だけを消したもの。記事の「システムプロンプトを差し替えると」の表の2行目（`run/22.log`。前の実行は `run/08.log`） |
| `extra/sum-cost.ts` | `results.jsonl` の `cost` を合計し、`costBasis` を表示する（`run/21.log`。記事の 0.00133430 ドルの根拠。前の実行は `run/12.log`） |
| `extra/check-auth.ts` | 同じ SDK とログインで `query()` を1回動かし、init の `apiKeySource` を表示する（`run/23.log`。init の `tools` と `mcp_servers` の数も表示する。スキルの「Claude プランで動かす記事」4の記録。前の実行は `run/13.log`） |
| `extra/tsconfig.typecheck.json` | `show-failures.ts` の型の確認用（`run/26.log`（前の実行は `run/10.log`）。TypeScript 7.0.2、`@types/node` 22.20.5、`strict`。記事には載せない） |

## 実行について

- 2026-11-11 17:04〜17:05（UTC-8）に、macOS arm64、Node.js 22.23.4、npm 10.9.9 の端末で `run-fix.sh` を空の作業フォルダから動かし、`run/14.log`〜`23.log` を残した。設定は `strict_mcp_config: true` を足した版。`ANTHROPIC_API_KEY` は unset（各ログの4行目）、init の `apiKeySource` は `none`、`tools=0 mcp_servers=0`（`run/23.log`）。`run/01.log`〜`13.log` は前の実行（2026-11-10、Linux x86_64、Node.js 22.22.0）のログとして消さずに残した。`run-fix.sh` は `run/09.log`〜`11.log`（`npm audit`、型の確認、`package.json`）に当たる手順を動かさなかったので、同じ端末で `extra/run-fix2.sh` が `run/24.log`〜`27.log` に取り直した（各ログに `uname: Darwin arm64`。記事の `npm audit` の2行は `run/25.log`、型の確認は `run/26.log`）。モデルは呼んでいない。`strict_mcp_config` の行を足したあとの入力が前の実行（16,663）より小さい（8,185）理由は、この行のせいかどうか確かめていない。`show-failures.ts` と記事の手順のコマンドを変えていないため。
- 前の実行の記述（`run/01.log`〜`13.log`、2026-11-10）。今の記事の根拠は上の `run/14.log`〜`27.log`。実行は 2026-11-10。今のログは、同日 08:38〜08:39 UTC に `run-all.sh` と `run-extra.sh` で空の作業フォルダから全部やり直したもの（前の版のログは上書きした）。作業フォルダはスクラッチの領域に作り、終わったあとに消した。`node_modules` と `results.jsonl` はここに置いていない（`results.jsonl` には呼び出しごとのセッションの ID が入るため）。
- 前の実行の記述。モデルを呼ぶ `run/04.log`、`06.log`、`08.log`、`13.log` は、オーナー自身の Claude プランでログイン済みの環境で動かした。`ANTHROPIC_API_KEY` は unset（各ログの4行目）、init の `apiKeySource` は `none`（`run/13.log`）。
- ログは `run-all.sh` の `clean` を通して保存した。通したのは3つの置き換えだけで、ほかは出力のまま。
  1. ANSI の色コードを外した（promptfoo の表は色付きで出る）
  2. 作業フォルダの絶対パスを `<work>`、型の確認用のフォルダを `<tc>`、その親を `<base>` に置き換えた
  3. UUID の形の文字列（promptfoo の表の `sessionId` 列）を `<session-id>` に置き換え、表の桁がずれないよう元の長さまで空白で埋めた
- ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない。
- 記事の「2回目も合格の数は同じで」は `run/06.log`（2回目の eval）と `run/07.log`（2回目の `show-failures.ts`）。`run/05.log` は1回目の `show-failures.ts`。
- `run/09.log` は前の実行の `npm audit` の末尾12行。今の記事に載せた2行は `run/25.log` から写した。

## 補足

- 書き始める前の試し（同じ設定で、ラベルの名前が違う版）を、同じ日に別のフォルダで数回動かした。その出力は記事にもログにも使っていない。ラベルの名前を変えたあとで `run-all.sh` を最初から動かし直し、記事の出力はすべてその実行のログから写した。
- このリポジトリの環境では `*.log` を Read ツールと `cat` で開けない設定になっている。そのため `run-all.sh` は保存と同時に同じ内容を標準出力にも出し（`tee`）、その表示から記事に写した。写した結果が1文字も違わないことは `lint/check-code-and-outputs.py` で確かめた（`lint/check-code-and-outputs.txt` が ALL OK）。
