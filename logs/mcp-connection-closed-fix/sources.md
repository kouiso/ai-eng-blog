# sources: mcp-connection-closed-fix

アクセス日は、出典3、7、9 が 2026-11-10、ほかは 2026-11-02。行番号は `content/articles/mcp-connection-closed-fix.md`（502行、2026-11-10 の版）のもの。

2026-11-02 の取得: GitHub のソースは `raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/v1.x/<path>` を curl で取得して読んだ（4ファイルとも HTTP 200）。v1.x ブランチのソースと、`npm install` で入れた 1.32.2 の `dist/esm`（`client/stdio.js` の `DEFAULT_INHERITED_ENV_VARS`、`getDefaultEnvironment`、`env` の重ね方、`stderr` の既定値、`close` の扱い。`types.js` の `ConnectionClosed = -32000`、`RequestTimeout = -32001`。`shared/protocol.js` の `'Connection closed'`）が同じ内容であることも確かめた。modelcontextprotocol.io、jsonrpc.org、nodejs.org、code.claude.com は curl で HTML を取得し（HTTP 200）、本文を取り出して読んだ。npm のページは curl では HTTP 403 だったので、`npm view` で確かめた。

2026-11-10 の取り直し（記事を直したときに、新しく書いた文の根拠を確かめるため）:

- 出典3: `raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/v1.x/src/client/stdio.ts` を curl で取得（HTTP 200）。`env?: Record<string, string>`、`stderr` の既定が `"inherit"`、`cwd` を省くと現在の作業フォルダを引き継ぐ、`DEFAULT_INHERITED_ENV_VARS` と `getDefaultEnvironment` が 2026-11-02 と同じであることを確かめた。
- 出典7: `https://code.claude.com/docs/en/mcp` を curl で取得（HTTP 200）。`--` が Claude の自分のオプションとサーバーを起動するコマンドと引数を分け、`--` より後ろはそのままサーバーに渡ること。環境変数は `--env` でサーバーの名前の後ろ、`--` の前に書くこと。`-e` は `--env` の短い形。`claude mcp list` が失敗した理由を状態の行に付け足すこと。`MCP_TIMEOUT` でサーバーの起動のタイムアウトを設定すること。
- 出典9: `https://nodejs.org/api/typescript.md`（`typescript.html` と同じページの Markdown 版）を curl で取得（HTTP 200）。冒頭の変更履歴で「Type stripping is enabled by default.」の版が `v23.6.0` と `v22.18.0`。「no type checking is performed」。

| # | 題名 | URL | アクセス日 | 確かめた事実 | 記事の根拠にした行 |
|---|---|---|---|---|---|
| 1 | MCP Specification 2025-11-25 Transports | https://modelcontextprotocol.io/specification/2025-11-25/basic/transports | 2026-11-02 | stdio では client が server を subprocess として起動する。メッセージは改行で区切り、埋め込みの改行を含まない。server は stderr に UTF-8 のログを書いてよい（MAY）。client は stderr を capture、forward、ignore してよい（MAY）。server は stdout に有効な MCP メッセージ以外を書いてはならない（MUST NOT） | 76、82、170、428 |
| 2 | MCP Specification 2025-11-25 Lifecycle | https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle | 2026-11-02 | 初期化のフェーズは client と server の最初のやり取りでなければならない（MUST）。initialize の要求の例（protocolVersion 2025-11-25、capabilities、clientInfo） | 428 |
| 3 | typescript-sdk v1.x src/client/stdio.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/stdio.ts | 2026-11-10 | `DEFAULT_INHERITED_ENV_VARS` は win32 以外で `HOME`、`LOGNAME`、`PATH`、`SHELL`、`TERM`、`USER` の6つ、win32 で `APPDATA`、`PATH` などの12個。spawn の env は `{...getDefaultEnvironment(), ...this._serverParams.env}`。`env` の型は `Record<string, string>`。`stderr` の既定は `'inherit'`（親の stderr に出る）。`'pipe'` のとき PassThrough のストリームを start の前に即座に返し、子プロセスの早い時点のエラー出力を失わないようにしている（コメント）。`cwd` を省くと現在の作業フォルダを引き継ぐ。`on('close', _code => ...)` で終了コードを使わずに `onclose` を呼ぶ。`on('error')` で start の Promise を reject する。`processReadBuffer` は1メッセージごとの読み取りエラーを `onerror` に渡してループを続ける | 76、80、210、265、287、289、362、458、462 |
| 4 | typescript-sdk v1.x src/shared/protocol.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts | 2026-11-02 | `_onclose` で `McpError.fromError(ErrorCode.ConnectionClosed, 'Connection closed')` を作り、待っていた応答のハンドラーすべてに渡す。`DEFAULT_REQUEST_TIMEOUT_MSEC = 60000`。タイムアウトで `RequestTimeout`、`'Request timed out'` | 58、76、460 |
| 5 | typescript-sdk v1.x src/types.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts | 2026-11-02 | `ConnectionClosed = -32000`、`RequestTimeout = -32001`。`McpError` のメッセージは `MCP error ${code}: ${message}` | 78、460 |
| 6 | JSON-RPC 2.0 Specification | https://www.jsonrpc.org/specification | 2026-11-02 | -32000 to -32099 は「Server error」で、Reserved for implementation-defined server-errors | 78 |
| 7 | Connect Claude Code to tools via MCP | https://code.claude.com/docs/en/mcp | 2026-11-10 | `claude mcp add --env AIRTABLE_API_KEY=YOUR_KEY ...` の例。`--` より後ろがサーバーを起動するコマンドと引数で、そのまま渡る。`--env`（短い形は `-e`）はサーバーの名前の後ろ、`--` の前に書く。`claude mcp list` は失敗したときに理由を状態の行に付け足す（`claude mcp get` では Issue: の行）。`MCP_TIMEOUT` でサーバーの起動のタイムアウトを設定する | 170、212、306、378、460 |
| 8 | Claude Code Advanced setup | https://code.claude.com/docs/en/setup | 2026-11-02 | 「Claude Code requires a Pro, Max, Ultra, Team, Enterprise, or Console account. The free claude.ai plan does not include Claude Code access.」 | 468 |
| 9 | Node.js Modules: TypeScript | https://nodejs.org/api/typescript.html | 2026-11-10 | type stripping が既定で有効になったのは v23.6.0 と v22.18.0（変更履歴）。つまり 23.0.0〜23.5.0 はフラグが要る。型の検査はしない（no type checking is performed） | 98 |
| 10 | Node.js Child process | https://nodejs.org/api/child_process.html | 2026-11-02 | `'error'` イベントは、プロセスを spawn できなかったときなどに出る | 458 |
| 11 | @modelcontextprotocol/sdk（npm） | https://www.npmjs.com/package/@modelcontextprotocol/sdk | 2026-11-02 | `npm view` の結果: version 1.32.2、dist-tags.latest 1.32.2、engines `{ node: '>=18' }` | 90 |
| 12 | typescript-sdk v1.x src/server/stdio.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/stdio.ts | 2026-11-02 | `StdioServerTransport.start()` が `this._stdin.on('data', ...)` を登録する。`connect()` が `start()` を自動で呼ぶ（エラーメッセージの文面） | 424 |

## 出典の URL ではなく実行ログを根拠にした文

実行はすべて 2026-11-10（`code/extra/run-all.sh`）。

| 記事の行 | 文の内容 | 根拠 |
|---|---|---|
| 60、64〜66 | 手元で再現した原因は3つで、stderr で見分けられた。自分のサーバーの起動コマンドを渡せば stderr を読める | `run/04.log`、`07.log`、`10.log`。別のサーバー（別のコマンドと引数、別のツール名）でも動いたのは `run/19.log` |
| 68 | 書き写すコードは3ファイルで71行 | `code/package.json` 10行、`code/server.ts` 26行、`code/after/check.ts` 35行（`wc -l`） |
| 82 | `claude mcp list` は stderr を出さず、理由は `CONNECTION_CLOSED: Connection closed` だけ | `run/08.log` |
| 90、98 | Node.js 22.22.0、npm 10.9.4、Linux x86_64、TypeScript 7.0.2 で型を確かめた | 全ログの見出し、`run/17.log`（`Version 7.0.2`、`typecheck ok`） |
| 212、214 | 引数の並びをそのまま起動に使う。ツールの名前を書かずに一覧を取る | `run/19.log`（`node other.ts --flag` と `sh -c "exec node other.ts x"` で、引数がサーバーに届き、`tools: hello` が出た） |
| 253〜255 | 環境変数を設定したのにサーバーが7行目で投げたエラーで終わる | `run/04.log` |
| 261 | 無い `config.json` を読むサーバーでは、stderr に `ENOENT: no such file or directory` の行が出た | `run/19.log` の4つ目（`node check.ts node config-server.ts`） |
| 287 | `process.env` をそのまま `env` に渡すと、`tsc` が `string \| undefined` を `string` に代入できないというエラーを出した | `run/17.log`（`direct-env.ts(15,61): error TS2322`、`direct-env exit=1`） |
| 295〜302 | 変更後の check.ts で `ok:` と `tools: count_notes`、起動のログ | `run/05.log` |
| 308〜321 | 作業フォルダで `-e` 付きで登録すると `Connected` | `run/06.log` |
| 323 | Claude Code 2.1.322 では、`-e` なしでも `export` した変数が届いた（前は Connection closed、後は Connected） | `run/13.log` |
| 325 | シェルとサーバーの環境変数の名前で違ったのは、Claude Code 自身の変数だけ | `run/20.log`（シェルにだけあったのは `CLAUDE_CODE_CHILD_SESSION`、サーバーにだけあったのは `CLAUDE_PROJECT_DIR`） |
| 358 | `servr.ts` で `Cannot find module` | `run/07.log` |
| 364〜376 | 作業フォルダで Connected だった相対パスの登録が、ホームフォルダでは Connection closed | `run/06.log`、`run/08.log` |
| 398 | 絶対パスで登録し直すとホームフォルダからも Connected。`claude mcp remove notes -s user` で登録を消せる | `run/09.log`、`run/13.log`（`Removed MCP server notes from user config`） |
| 422、424 | connect の行を消すと、stderr は起動のログだけで Connection closed。プロセスは終了コード 0 | `run/10.log`、`run/11.log`（パイプの終了コードは最後の `node` のもの） |
| 434〜445 | initialize を送ると、直す前は起動のログだけ、直した後は応答の JSON | `run/11.log`、`run/12.log` |
| 455〜456、460 | `spawn nodee ENOENT`、`ENOENT: Executable not found in $PATH: "nodee"`、`MCP error -32001: Request timed out` まで60秒 | `run/15.log`、`run/16.log`（`code/extra/other-errors.mjs`） |
| 462 | stdout にログを書いても SDK 1.32.2 のクライアントでは接続が切れない | パイロット `mcp-server-typescript-stdio` の本文の stdout の節（360行目の H2「stdout にログを書くと SDK のクライアントは行を捨てる」。そちらのログが根拠）と、出典3の `processReadBuffer` |
| 462 | Inspector の CLI に `Connection closed` が出たときの読み方は Inspector の記事にある | `content/articles/mcp-inspector-debug.md` 378、382行目（`Connection closed` の1例と、その読み方。2026-11-10 に読んだ） |
| 466 | `claude mcp` の add、list、remove がネットワークに出られない状態と、環境変数が PATH と HOME だけの状態で動いた | `run/14.log` |
