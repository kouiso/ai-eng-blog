# sources: mcp-connection-closed-fix

アクセス日はすべて 2026-11-02。GitHub のソースは `raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/v1.x/<path>` を curl で取得して読んだ（4ファイルとも HTTP 200）。v1.x ブランチのソースと、`npm install` で入れた 1.32.2 の `dist/esm`（`client/stdio.js` の `DEFAULT_INHERITED_ENV_VARS`、`getDefaultEnvironment`、`env` の重ね方、`stderr` の既定値、`close` の扱い。`types.js` の `ConnectionClosed = -32000`、`RequestTimeout = -32001`。`shared/protocol.js` の `'Connection closed'`）が同じ内容であることも確かめた。modelcontextprotocol.io、jsonrpc.org、nodejs.org、code.claude.com は curl で HTML を取得し（HTTP 200）、本文を取り出して読んだ。npm のページは curl では HTTP 403 だったので、`npm view` で確かめた。行番号は `content/articles/mcp-connection-closed-fix.md`（485行）のもの。

| # | 題名 | URL | 確かめた事実 | 記事の根拠にした行 |
|---|---|---|---|---|
| 1 | MCP Specification 2025-11-25 Transports | https://modelcontextprotocol.io/specification/2025-11-25/basic/transports | stdio では client が server を subprocess として起動する。メッセージは改行で区切り、埋め込みの改行を含まない。server は stderr に UTF-8 のログを書いてよい（MAY）。client は stderr を capture、forward、ignore してよい（MAY）。server は stdout に有効な MCP メッセージ以外を書いてはならない（MUST NOT） | 76、82、170、411 |
| 2 | MCP Specification 2025-11-25 Lifecycle | https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle | 初期化のフェーズは client と server の最初のやり取りでなければならない（MUST）。initialize の要求の例（protocolVersion 2025-11-25、capabilities、clientInfo） | 411 |
| 3 | typescript-sdk v1.x src/client/stdio.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/stdio.ts | `DEFAULT_INHERITED_ENV_VARS` は win32 以外で `HOME`、`LOGNAME`、`PATH`、`SHELL`、`TERM`、`USER` の6つ、win32 で `APPDATA`、`PATH` などの12個。spawn の env は `{...getDefaultEnvironment(), ...this._serverParams.env}`。`stderr` の既定は `'inherit'`（親の stderr に出る）。`'pipe'` のとき PassThrough のストリームを start の前に即座に返し、子プロセスの早い時点のエラー出力を失わないようにしている（コメント）。`cwd` を省くと現在の作業フォルダを引き継ぐ。`on('close', _code => ...)` で終了コードを使わずに `onclose` を呼ぶ。`on('error')` で start の Promise を reject する。`processReadBuffer` は1メッセージごとの読み取りエラーを `onerror` に渡してループを続ける | 76、80、205、256、283、338、441、445 |
| 4 | typescript-sdk v1.x src/shared/protocol.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts | `_onclose` で `McpError.fromError(ErrorCode.ConnectionClosed, 'Connection closed')` を作り、待っていた応答のハンドラーすべてに渡す。`DEFAULT_REQUEST_TIMEOUT_MSEC = 60000`。タイムアウトで `RequestTimeout`、`'Request timed out'` | 58、76、443 |
| 5 | typescript-sdk v1.x src/types.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts | `ConnectionClosed = -32000`、`RequestTimeout = -32001`。`McpError` のメッセージは `MCP error ${code}: ${message}` | 78、443 |
| 6 | JSON-RPC 2.0 Specification | https://www.jsonrpc.org/specification | -32000 to -32099 は「Server error」で、Reserved for implementation-defined server-errors | 78 |
| 7 | Connect Claude Code to tools via MCP | https://code.claude.com/docs/en/mcp | `claude mcp add --env AIRTABLE_API_KEY=YOUR_KEY ...` の例。`-e` または `--env` で環境変数を設定する。`claude mcp list` は失敗したときに理由を状態の行に付け足す（`claude mcp get` では Issue: の行）。`MCP_TIMEOUT` でサーバーの起動のタイムアウトを設定する | 170、299、361、443 |
| 8 | Claude Code Advanced setup | https://code.claude.com/docs/en/setup | 「Claude Code requires a Pro, Max, Ultra, Team, Enterprise, or Console account. The free claude.ai plan does not include Claude Code access.」 | 451 |
| 9 | Node.js Modules: TypeScript | https://nodejs.org/api/typescript.html | v22.18.0（と v23.6.0）で type stripping が既定で有効。型の検査はしない（no type checking is performed） | 98 |
| 10 | Node.js Child process | https://nodejs.org/api/child_process.html | `'error'` イベントは、プロセスを spawn できなかったときなどに出る | 441 |
| 11 | @modelcontextprotocol/sdk（npm） | https://www.npmjs.com/package/@modelcontextprotocol/sdk | `npm view` の結果: version 1.32.2、dist-tags.latest 1.32.2、engines `{ node: '>=18' }` | 90 |
| 12 | typescript-sdk v1.x src/server/stdio.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/stdio.ts | `StdioServerTransport.start()` が `this._stdin.on('data', ...)` を登録する。`connect()` が `start()` を自動で呼ぶ（エラーメッセージの文面） | 407 |

## 出典の URL ではなく実行ログを根拠にした文

| 記事の行 | 文の内容 | 根拠 |
|---|---|---|
| 60、64〜66 | 手元で再現した原因は3つで、stderr で見分けられた | `run/04.log`、`06.log`、`09.log` |
| 68 | 書き写すコードは3ファイルで63行 | `code/package.json` 10行、`code/server.ts` 26行、`code/after/check.ts` 27行（`wc -l`） |
| 82 | `claude mcp list` は stderr を出さず、理由は `CONNECTION_CLOSED: Connection closed` だけ | `run/07.log` |
| 90、98 | Node.js 22.22.0、npm 10.9.4、Linux x86_64、TypeScript 7.0.2 で型を確かめた | 全ログの見出し、`run/16.log`（`Version 7.0.2`、`typecheck ok`） |
| 246〜248 | 環境変数を設定したのにサーバーが7行目で投げたエラーで終わる | `run/04.log` |
| 295 | `メモ: 2 件` と起動のログ | `run/05.log` |
| 301 | Claude Code 2.1.316 では、`-e` なしでも `export` した変数が届いた（前は Connection closed、後は Connected） | `run/12.log` |
| 334 | `servr.ts` で `Cannot find module` | `run/06.log` |
| 359 | 相対パスの登録が、作業フォルダでは Connected、ホームフォルダでは Connection closed | `run/07.log` |
| 381 | 絶対パスで登録し直すとホームフォルダからも Connected。`claude mcp remove notes -s user` で登録を消せる | `run/08.log`、`run/12.log`（`Removed MCP server notes from user config`） |
| 405、407 | connect の行を消すと、stderr は起動のログだけで Connection closed。プロセスは終了コード 0 | `run/09.log`、`run/10.log`（パイプの終了コードは最後の `node` のもの） |
| 417〜428 | initialize を送ると、直す前は起動のログだけ、直した後は応答の JSON | `run/10.log`、`run/11.log` |
| 438〜439、443 | `spawn nodee ENOENT`、`ENOENT: Executable not found in $PATH: "nodee"`、`MCP error -32001: Request timed out` まで60秒 | `run/14.log`、`run/15.log`（`code/extra/other-errors.mjs`） |
| 445 | stdout にログを書いても SDK 1.32.2 のクライアントでは接続が切れない | パイロット `mcp-server-typescript-stdio` の本文の stdout の節（そちらのログが根拠）と、出典3の `processReadBuffer` |
| 445 | Inspector の CLI に出た場合の読み方は Inspector の記事にある | `content/articles/mcp-inspector-debug.md` 375〜379行目（2026-11-02 に読んだ） |
| 449 | `claude mcp` の add、list、remove がネットワークに出られない状態と、環境変数が PATH と HOME だけの状態で動いた | `run/13.log` |
