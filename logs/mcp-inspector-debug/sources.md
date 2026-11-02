# sources: mcp-inspector-debug

アクセス日はすべて 2026-11-02。GitHub の文書は `raw.githubusercontent.com/modelcontextprotocol/inspector/main/<path>` を curl で取得して読んだ（HTTP 200）。modelcontextprotocol.io、nodejs.org、docs.npmjs.com、code.claude.com は curl で HTML を取得し、本文を取り出して読んだ。npm のパッケージは `npm view` で確かめた。行番号は `content/articles/mcp-inspector-debug.md`（459行）のもの。

| # | 題名 | URL | 確かめた事実 | 記事の根拠にした行 |
|---|---|---|---|---|
| 1 | MCP Inspector（Model Context Protocol のドキュメント） | https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector （`/docs/tools/inspector` からリダイレクト） | Inspector は MCP サーバーのテストとデバッグのための reference developer tool。Web は `npx @modelcontextprotocol/inspector`、CLI は `--cli`、TUI は `--tui`。Node 22.19.0 以上。Web は per-launch の API トークン付きの URL を表示し、ブラウザで開く（`MCP_AUTO_OPEN_ENABLED=false` で止まる）。モードのフラグはコマンドラインの先頭でだけ認識され、最初のそれ以外の語以降はクライアントに渡る | 55、67、205、383、414 |
| 2 | modelcontextprotocol/inspector README | https://github.com/modelcontextprotocol/inspector | 1つのパッケージで4つの使い方（Web、CLI、TUI、mcpdo（experimental、connect once then run many commands））。Web が既定。秘密情報（OAuth トークン、OAuth client secret、stdio の `env:` の値）は OS のキーチェーンに、キーチェーンが無い環境では `~/.mcp-inspector/secrets.json` に暗号化せずに保存。v1 系は `v1/main` でセキュリティ修正のみ、`@v1-latest`。ライセンスは Apache-2.0 と MIT（と文書の CC-BY-4.0） | 67〜72、80、412、431 |
| 3 | MCP Inspector CLI Client README | https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md | `--cli` のあとにサーバーのコマンド、`--method` で `tools/list`、`tools/call`、`resources/list`、`prompts/list` など。`--tool-name`、`--tool-arg <key=value>`（値は JSON として読まれ `count=1` は数値になる）、`--tool-args-json`（そのまま渡し `"012"` は文字列のまま）。`--quiet` で stdio サーバーの stderr を落とす（落とさなければ表示される）。終了コード 0〜11 と、失敗時に stderr に出る1行の ErrorEnvelope（`code` は失敗の種類の決まった名前）。0 成功、1 使い方の誤りか予期しないエラー、3 認証が必要、4 サーバーに届かない（DNS、接続拒否、タイムアウト、fetch failed）、5 ツールが isError を返したかツールが無い | 55、205、242、252、296、300、322〜332、439 |
| 4 | Migrating from Inspector v1 to v2 | https://github.com/modelcontextprotocol/inspector/blob/main/docs/v1-to-v2-migration.md | v1 は Node >=22.7.5、v2 は >=22.19.0。npm は engines の不一致を警告するだけでインストールを止めない（`engine-strict` を設定しない限り）、`node -v` を先に見る。v1 は 6274 の画面と 6277 の MCP プロキシ、v2 は 6274 の1つ。v1 の認証トークンの環境変数は `MCP_PROXY_AUTH_TOKEN`。v1 の CLI の終了コードは 0 と 1 | 78、84、322 |
| 5 | MCP Inspector Environment variables | https://github.com/modelcontextprotocol/inspector/blob/main/docs/environment-variables.md | `MCP_INSPECTOR_API_TOKEN` の既定は起動ごとのランダムなトークン。`HOST` の既定は `127.0.0.1`、`CLIENT_PORT` の既定は 6274 | 414 |
| 6 | @modelcontextprotocol/inspector（npm） | https://www.npmjs.com/package/@modelcontextprotocol/inspector | `npm view` の結果: latest 2.13.0（2026-10-28 公開）、v1-latest 1.0.3、engines node >=22.19.0、2.0.0 の公開日時 2026-07-28T07:33:59Z | 78、80 |
| 7 | npm-exec（npm Docs v10） | https://docs.npmjs.com/cli/v10/commands/npm-exec | 要求したパッケージがプロジェクトのローカルの依存に無いときは、npm のキャッシュのフォルダに入れて PATH に足す（ローカルにあればそれを使う） | 139 |
| 8 | Node.js Modules: TypeScript | https://nodejs.org/api/typescript.html | v22.18.0（と v23.6.0）で type stripping が既定で有効。型の検査はしない | 102 |
| 9 | MCP Specification 2025-11-25 Tools | https://modelcontextprotocol.io/specification/2025-11-25/server/tools | クライアントは `tools/list` を送ってツールを知る。応答の各ツールは name、title、description、inputSchema を持つ。入力の検証エラーはツールの実行エラーとして `isError: true` の結果で返す | 244、298 |
| 10 | @modelcontextprotocol/sdk（npm） | https://www.npmjs.com/package/@modelcontextprotocol/sdk | `npm view` の結果: latest 1.32.2 | 94 |
| 11 | Claude Code Advanced setup | https://code.claude.com/docs/en/setup | 「Claude Code requires a Pro, Max, Ultra, Team, Enterprise, or Console account. The free claude.ai plan does not include Claude Code access.」 | 433 |

## 出典の URL ではなく実行ログを根拠にした文

| 記事の行 | 文の内容 | 根拠 |
|---|---|---|
| 61 | `npm install` が13秒、書き写すファイルが40行 | `run/03.log`、`wc -l code/package.json code/server.ts`（13行と27行） |
| 201 | 2.13.0 と出れば `node_modules` の Inspector | `run/04.log` |
| 242、246 | 起動ログが1行目、zod の制約が `minLength`、`maxLength`、`description` に出る | `run/05.log` |
| 248 | `--method` を省くと `Method is required.`、終了コード1 | `run/14.log` |
| 270、296、298、318 | `MCPサーバー` は7文字、`text=2026` は数値で送られて isError と終了コード5、`--tool-args-json` なら4文字 | `run/06.log`、`07.log`、`08.log` |
| 347 | `tool_not_found` で終了コード5 | `run/09.log` |
| 379 | ファイル名の誤りは `Connection closed` と終了コード1、原因は上の `Cannot find module` | `run/10.log` |
| 412 | キーチェーンが無い環境で出る5行の警告 | `run/11.log`（この環境は OS のキーチェーンが無く、`zbus error` が出た） |
| 416〜427 | 画面の操作（スイッチ、`Connected`、`Tools`、`count_chars`、`Execute Tool`、`Results` の `文字数: 4 / 行数: 1`、Protocol と Console、`Read-only session`）、Ctrl+C で止まる | `run/12.log`（`lint/check-web-ui.txt` で全項目 PASS）、`run/11.log` の note（止めたあとの healthz が 000） |
| 102 | TypeScript 7.0.2 の `tsc` で型を確かめた | `run/13.log` |
