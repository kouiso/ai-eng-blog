# code: claude-p-script-first-call

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `blocks/01-check-key.sh`〜`blocks/15-ask.sh` | 記事の bash のコードブロック15個。中身は記事と1文字も違わない（`lint/check-code-and-outputs.py` で確認）。番号は記事に出る順で、`run/NN.log` の番号と同じ |
| `exec-file.ts` | 記事の `exec-file.ts`（標準入力を閉じない、うまくいかない書き方の例） |
| `ask.ts` | 記事の `ask.ts`（`spawn` と `stdin.end()` で呼ぶ関数） |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`）でできたものを写した。依存パッケージは無い（`node:child_process` だけを使う） |
| `extra/run-all.sh` | `blocks/*.sh` を順に実行して `run/01.log`〜`15.log` を残すスクリプト（記事には載せない） |
| `extra/measure-isolation.sh` | 3つのフラグ（`--setting-sources ""`、`--strict-mcp-config`、`--tools ""`）の有無で送ったトークン数を比べるスクリプト（記事には載せない。`run/16.log`） |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/17.log`。記事には載せない） |

## 実行のしかた（2026-11-11）

- マシンは macOS（Darwin arm64）。Node.js 22.23.4、npm 10.9.9、Claude Code 2.1.322、jq 1.8.1。
- 作業フォルダはリポジトリの外のスクラッチの領域に作り、終わったあとに消した。ログでは絶対パスを `<work>`（型の確認は `<tc>`）に置き換えた。
- `claude` は、Claude Code の本体（npm の `@anthropic-ai/claude-code` の `bin/claude`）を指すシンボリックリンクだけを置いたフォルダを `PATH` の先頭に入れて呼んだ。検証したマシンのシェルには `claude` を包む関数とラッパーのスクリプトがあり、読者の環境と挙動が変わるため。
- `run-all.sh` は `env -i` で環境変数を空にしてから、`HOME`、`USER`、`LANG`、`TERM`、`PATH`、`CLAUDE_CONFIG_DIR` だけを渡して動かした。`CLAUDE_CONFIG_DIR` は、このマシンで Claude Code がログイン情報を置いている設定フォルダの場所。値は記録していない。読者の環境では既定の場所が使われるので、渡す必要は無い。
- 各ブロックは `bash` で、標準入力を `/dev/null` にして実行した（端末で打つ読者も、標準入力には何も入れない）。
- モデルを呼んだログ（05、09、11、13、14、15、16）は、オーナー自身の Claude プランでログイン済みの Claude Code で動かした。`ANTHROPIC_API_KEY` は unset で、`run/09.log` の init の `apiKeySource` は `"none"`。
- ログには、アカウント名、メールアドレス、セッションの ID、認証情報を出していない。`answer.json` と `bare.json` には `session_id` と `uuid` が入るが、どちらもスクラッチの領域に置いたまま消し、記事とログには `jq` で取り出したフィールドだけを写した。

## ブロック10の再実行（接続の守りを足した版）

`blocks/10-bare.sh` に `--strict-mcp-config` を足したので、このブロックだけを同じ手順（`env -i`、標準入力は `/dev/null`、スクラッチの領域、終わったあとに削除）でやり直し、`run/10.log` を新しい出力に置き換えた。足す前の出力は `run/10-before-strict-guard.log` に残した。ログの見出しの時刻は UTC なので日付が 2026-11-12 になっているが、このマシンの日付は 2026-11-11（`verified_at` と同じ）。`jq` は `jq-1.7.1-apple` で動かした（ほかのログは 1.8.1）。出力は足す前と同じ（終了コード1、`is_error: true`、`Not logged in · Please run /login`）。`--bare` はログインを読まないので、モデルは呼ばれていない。

## 1回目の実行の失敗（記録）

最初に `run-all.sh` を動かしたときは、`env -i` で `CLAUDE_CONFIG_DIR` まで消していた。そのため Claude Code が別の設定フォルダを見に行き、モデルを呼ぶブロックがすべて `Failed to authenticate. API Error: 401 ...` で失敗した。`CLAUDE_CONFIG_DIR` を渡して全ブロックをやり直し、`run/01.log`〜`15.log` をその結果で上書きした。記事に載せたのはやり直したほうの出力。

## 補足のログ

- `run/16.log`: `measure-isolation.sh` の出力。フラグなしで 94,062、`--setting-sources ""` だけで 18,173、3つとも付けて 3,776 トークン。作業フォルダに「答えの最後に必ず「にゃん」と付けてください。」という CLAUDE.md を置いて測ったが、この回はフラグなしでも答えに「にゃん」は付かなかった（`has_nyan=False`）。記録に残していない試し打ちでは付いたことがあるが、再現しないので、記事では CLAUDE.md が答えを変えるとは書いていない。書いたのはトークン数だけ。
- `run/17.log`: `ask.ts` と `exec-file.ts` の型の確認。TypeScript 7.0.2、`@types/node` 22.20.5、`strict`。`tsc_exit=0`。
- `run/18.log`: `claude --help` のうち、記事で使うフラグの説明の行。
