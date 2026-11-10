# sources: mcp-inspector-debug

アクセス日はすべて 2026-11-10（2026-11-02 に初めて読み、2026-11-10 に全件を取り直して読み直した）。GitHub の文書は `raw.githubusercontent.com/modelcontextprotocol/inspector/main/<path>` を curl で取得して読んだ（HTTP 200）。modelcontextprotocol.io、nodejs.org、docs.npmjs.com、code.claude.com は curl で HTML を取得し、本文を取り出して読んだ（どれも HTTP 200）。npm のパッケージは `npm view` で確かめた。行番号は `content/articles/mcp-inspector-debug.md`（463行）のもの。

| # | 題名 | URL | 確かめた事実 | 記事の根拠にした行 |
|---|---|---|---|---|
| 1 | MCP Inspector（Model Context Protocol のドキュメント） | https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector （`/docs/tools/inspector` からリダイレクト） | Inspector は MCP サーバーのテストとデバッグのための reference developer tool。Web は `npx @modelcontextprotocol/inspector`、CLI は `--cli`、TUI は `--tui`。Web は per-launch の API トークン付きの URL を表示し、ブラウザで開く（`MCP_AUTO_OPEN_ENABLED=false` で止まる）。モードのフラグはコマンドラインの先頭でだけ認識され、最初のそれ以外の語以降はクライアントに渡る。このページには「LLM を通さずに呼べる」という記述は無い。Quickstart の Node の要件は 2026-11-10 の時点でも「22.19.0 or newer」のままで、README と移行ガイドの 2.14 以降の要件より古い（記事の Node の要件は出典1を引かず、出典4と出典6で書いた） | 58、208、386、417 |
| 2 | modelcontextprotocol/inspector README | https://github.com/modelcontextprotocol/inspector | 1つのパッケージで4つの使い方（Web、CLI、TUI、mcpdo（experimental、connect once then run many commands））。Web が既定。秘密情報（OAuth トークン、OAuth client secret、stdio の `env:` の値）を、使えれば OS のキーチェーンに保存する。v1 系は `v1/main` でセキュリティ修正のみ、`@v1-latest`。ライセンスは Apache-2.0 と MIT（と文書の CC-BY-4.0）。2026-11-10 の README は「Requires Node `^22.23.4 \|\| ^24.22.1 \|\| >=26.12.1`」 | 70〜75、83、415、434 |
| 3 | MCP Inspector CLI Client README | https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md | `--cli` のあとにサーバーのコマンド、`--method` で `tools/list`、`tools/call`、`resources/list`、`prompts/list` など。`--tool-name`、`--tool-arg <key=value>`（値は JSON として読まれ `count=1` は数値になる）、`--tool-args-json`（そのまま渡し `"012"` は文字列のまま）。`--quiet` の表で「A stdio server's own stderr」は Dropped（それ以外に stderr の行を消す方法があるかは書かれていないので、記事は「`--quiet` を付けると出なくなる」とだけ書いた）。終了コードの表（0〜11 と 130）と、失敗時に stderr に出る1行の ErrorEnvelope（`code` は失敗の種類の決まった名前）。0 成功、1 使い方の誤りか予期しないエラー、3 認証が必要、4 サーバーに届かない（DNS、接続拒否、タイムアウト、fetch failed）、5 ツールが isError を返したかツールが無い | 58、208、245、255、299、303、325、335、442 |
| 4 | Migrating from Inspector v1 to v2 | https://github.com/modelcontextprotocol/inspector/blob/main/docs/v1-to-v2-migration.md | v1 は Node >=22.7.5。v2 は 2.13 まで >=22.19.0、2.14 からは `^22.23.4 \|\| ^24.22.1 \|\| >=26.12.1`（「that was v2's floor through v2.13. Since v2.14 …」）。npm は engines の不一致を警告するだけでインストールを止めない（`engine-strict` を設定しない限り）。v1 は 6274 の画面と 6277 の MCP プロキシ、v2 は 6274 の1つの Web サーバー。v1 の認証トークンの環境変数は `MCP_PROXY_AUTH_TOKEN`。v1 の CLI の終了コードは 0 と 1 | 81、87、325 |
| 5 | MCP Inspector Environment variables | https://github.com/modelcontextprotocol/inspector/blob/main/docs/environment-variables.md | `MCP_INSPECTOR_API_TOKEN` の既定は起動ごとのランダムなトークン。`HOST` の既定は `127.0.0.1`、`CLIENT_PORT` の既定は 6274 | 417 |
| 6 | @modelcontextprotocol/inspector（npm） | https://www.npmjs.com/package/@modelcontextprotocol/inspector | `npm view` の結果（2026-11-10）: dist-tags の latest 2.14.0（2026-11-05T00:17:31Z 公開）、v1-latest 1.0.4。latest の engines は `^22.23.4 \|\| ^24.22.1 \|\| >=26.12.1`。`npm view @modelcontextprotocol/inspector@2.13.0 engines` は `>=22.19.0`（2.13.0 の公開は 2026-10-28）。2.0.0 の公開日時 2026-07-28T07:33:59Z | 81、83、87 |
| 7 | npm-exec（npm Docs v10） | https://docs.npmjs.com/cli/v10/commands/npm-exec | 指定のないパッケージ名はローカルのプロジェクトにある版と照合する。ローカルの依存に無いときは npm のキャッシュのフォルダに入れて PATH に足す | 142 |
| 8 | Node.js Modules: TypeScript | https://nodejs.org/api/typescript.html | v22.18.0（と v23.6.0）で type stripping が既定で有効。型の検査はしない（no type checking is performed） | 105 |
| 9 | MCP Specification 2025-11-25 Tools | https://modelcontextprotocol.io/specification/2025-11-25/server/tools | クライアントは `tools/list` を送ってツールを知る。応答の各ツールは name、title、description、inputSchema を持つ。入力の検証エラーはツールの実行エラーとして `isError: true` の結果で返す | 247、301 |
| 10 | @modelcontextprotocol/sdk（npm） | https://www.npmjs.com/package/@modelcontextprotocol/sdk | `npm view` の結果（2026-11-10）: latest 1.32.2（2026-10-23 公開） | 97 |
| 11 | Claude Code Advanced setup | https://code.claude.com/docs/en/setup | 「Claude Code requires a Pro, Max, Ultra, Team, Enterprise, or Console account. The free claude.ai plan does not include Claude Code access. You can also use Claude Code with a third-party API provider like Amazon Bedrock, Google Cloud's Agent Platform, or Microsoft Foundry.」 | 436、frontmatter 9行目 |
| 12 | MCP Inspector Where secrets are stored | https://github.com/modelcontextprotocol/inspector/blob/main/docs/secret-storage.md | 保存先は `MCP_INSPECTOR_SECRET_STORE` の指定、使えれば OS のキーチェーン、どちらでもなければ代わりの保存先（コンテナで volume が無ければ memory、それ以外は file）の順に選ぶ。「When the store is selected …, every client prints a warning on stderr if it falls back from the keychain, including the keychain error, and another if the file is unencrypted, has loose permissions, or cannot be read. Either warning is followed by a link to this guide.」。警告が出る条件はキーチェーンが無いときに限らない（ファイルが暗号化されない、権限が緩い、読めないときにも出る） | 415 |

## 出典の URL ではなく実行ログを根拠にした文

実行ログはすべて 2026-11-10 の実行（`run/01.log`〜`14.log`）。

| 記事の行 | 文の内容 | 根拠 |
|---|---|---|
| 58 | 手元では API キーを使わず、LLM も通さずに、自作のサーバーのツールを呼べた | `run/05.log`〜`09.log`（Inspector の CLI がサーバーを起動して `tools/list` と `tools/call` の結果を返した）。この環境の `ANTHROPIC_API_KEY` は unset（`selection.md`）で、記事のコードに LLM の API を呼ぶ処理は無い（`code/server.ts`） |
| 64 | `npm install` が9秒、書き写すファイルが40行 | `run/03.log`（`in 9s`）、`wc -l code/package.json code/server.ts`（13行と27行） |
| 87 | 手元の 22.22.0 は 2.14.0 の条件に届かない | `run/*.log` の見出し `node: v22.22.0`。2.14.0 の engines（出典6）の 22 系は 22.23.4 以上 |
| 204 | 2.13.0 と出れば `node_modules` の Inspector | `run/04.log` |
| 245、249 | 起動ログが結果の JSON の前に出る、zod の制約が `minLength`、`maxLength`、`description` に出る | `run/05.log` |
| 251 | `--method` を省くと `Method is required.`、終了コード1 | `run/14.log` |
| 273、299、301、321 | `MCPサーバー` は7文字、`text=2026` は数値で送られて isError と終了コード5、`--tool-args-json` なら4文字 | `run/06.log`、`07.log`、`08.log` |
| 350 | `tool_not_found` で終了コード5 | `run/09.log` |
| 382 | ファイル名の誤りは `Connection closed` と終了コード1、原因は上の `Cannot find module` | `run/10.log` |
| 415 | 手元の環境ではキーチェーンが使えず、保存先が `~/.mcp-inspector/secrets.json` で暗号化されない | `run/11.log`（`zbus error` と `File (unencrypted) at ~/.mcp-inspector/secrets.json — fell back from the OS keychain`） |
| 419〜430 | 画面の操作（スイッチ、`Connected`、`Tools`、`count_chars`、`Execute Tool`、`Results` の `文字数: 4 / 行数: 1`、Protocol と Console、`Read-only session`）、Ctrl+C で止まる | `run/12.log`（`lint/check-web-ui.txt` で全項目 PASS）、`run/11.log` の note（止めたあとの healthz が 000） |
| 105 | TypeScript 7.0.2 の `tsc` で型を確かめた | `run/13.log` |
