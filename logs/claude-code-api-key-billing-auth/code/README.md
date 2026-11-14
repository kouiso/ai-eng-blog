# code: claude-code-api-key-billing-auth

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `check-env.sh` | `test -n "$ANTHROPIC_API_KEY" ...` のブロック（`run/14.log`） |
| `auth-status.sh` | `claude auth status | grep ...` のブロック（`run/15.log`） |
| `repro-cli.sh` | ダミーのキーで `claude auth status` と `claude -p` を動かすブロック（`run/16.log`） |
| `setup.sh` | `mkdir key-check` から `npm install` までのブロック（`run/17.log`） |
| `check-auth.ts` | 記事の `check-auth.ts`（`run/18.log`、`run/19.log`、`run/21.log`） |
| `make-env.sh` | `.env` を作って `grep` するブロック（`run/20.log`） |
| `plan-only.ts` | 記事の `plan-only.ts`（`run/22.log`） |
| `package.json` | `setup.sh` の手順でできたものを写した。依存は `^` なしの `0.3.322` |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `run/NN.log` に残すスクリプト（記事には載せない） |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/26.log`。記事には載せない） |

実行は 2026-11-11（PST。UTC では 2026-11-12 01:01〜01:02）。`query()` に `strictMcpConfig: true`、`claude -p` に `--strict-mcp-config` を付けたあとの版で、ログは `run/14.log`〜`26.log`（`extra/run-all.sh` の4つ目の引数に 13 を渡した）。付ける前の 2026-11-11（UTC 11:07〜11:09）の実行は `run/01.log`〜`13.log` に残している。出力は npm の所要秒数のほかは同じ。macOS arm64、Node.js 22.23.4、npm 10.9.9、Claude Code 2.1.322、Agent SDK 0.3.322（同梱の Claude Code 2.1.322）。

## 実行の条件

- `extra/run-all.sh` は `env -i` で環境変数を空にしたシェルから動かした。渡したのは `HOME`、`USER`、`PATH`、`LANG`、`TERM`、`CLAUDE_CONFIG_DIR`（ログイン済みの Claude Code の設定の場所）だけ。執筆に使ったセッションの環境変数（セッションの ID など）は子のプロセスに渡していない。読者が新しいターミナルで打つのと同じ条件にするため。
- `PATH` の `claude` は、npm で入れた Claude Code 2.1.322 の本体を指す。執筆した環境にある別の起動用スクリプトは `PATH` から外した。
- 各コマンドの標準入力は `/dev/null`。`claude -p` は標準入力がパイプのとき3秒待つので、端末から打ったときと同じく待たないようにした。コマンドの文字列は記事と同じ。
- 認証は、ログイン済みの Claude Code に任せた。認証情報やトークンを取り出してコードに渡していない。
- 使ったキーは無効なダミーの文字列 `sk-ant-invalid-demo` だけ。本物のキーはどこにも書いていない。
- ログには、アカウント名、メールアドレス、組織名、セッションの ID、認証情報を出していない（`claude auth status` は `grep` で `authMethod` と `apiKeySource` の行だけにした）。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>`、ホームは `~` に置き換えた。

## 記事に載せない確認用の実行

- `run/23.log`: ダミーのキーで `claude -p --output-format json` を動かし、`type`、`subtype`、`is_error`、`result`、`total_cost_usd`、入力と出力のトークン数だけを取り出した。`total_cost_usd` と両方のトークン数が 0（記事の「再現した呼び出しのトークン数は0」の根拠）。
- `run/24.log`: `claude -p` の `--settings` で、`env` にダミーのキーを置いた設定を渡した。`Invalid API key`、`exit=1`（記事の「Claude Code の設定の env に書いてある」の根拠）。settings のファイルは書き換えていない。
- `run/25.log`: `plan-only.ts` を `.env` なしで動かし、`apiKeySource: none`。
- `run/26.log`: `tsc 7.0.2`（`@types/node 22.20.5`、`strict`）で `check-auth.ts` と `plan-only.ts` の型を確かめた。`tsc_exit=0`。

`node_modules` はここに置いていない。作業フォルダはスクラッチの領域に作り、終わったあとに消した。
