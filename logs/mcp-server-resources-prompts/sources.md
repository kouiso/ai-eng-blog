# sources: mcp-server-resources-prompts

アクセス日はすべて 2026-11-02。番号は原稿の出典の表（431〜450行目）と同じ。行番号は `content/articles/mcp-server-resources-prompts.md` の最後の版（452行）。

取得の方法: modelcontextprotocol.io のページは URL の末尾に `.md` を付けて Markdown で、code.claude.com のページも同じく `.md` で取得して読んだ。github.com と npmjs.com のページは、この環境から curl すると HTTP 403 になる（2026-11-02 に確認）。そのため GitHub のファイルは同じブランチの raw.githubusercontent.com から取得して読み、npm は `npm view` でレジストリから確かめた。typescript-sdk の `v1.x` ブランチの先頭は、タグ `1.32.2` と同じコミット（`3b73021`、`git ls-remote` で確認）なので、読んだソースは記事で使った 1.32.2 そのもの。

| # | 題名 | URL | 確かめた事実 | 原稿の根拠にした文 |
|---|---|---|---|---|
| 1 | MCP Specification 2025-11-25 Server Features Overview | https://modelcontextprotocol.io/specification/2025-11-25/server | サーバーの機能は Prompts、Resources、Tools の3つ。control の表: Prompts は User-controlled（例 Slash commands, menu options）、Resources は Application-controlled（例 File contents, git history）、Tools は Model-controlled（例 API POST requests, file writing） | 76行目（3つある）、92行目と94〜98行目の表、100行目（ツールはモデルが決める） |
| 2 | MCP Specification 2025-11-25 Resources | https://modelcontextprotocol.io/specification/2025-11-25/server/resources | Resource は URI で一意に識別される。application-driven で、UI で一覧から選ばせる例がある。`resources/read` の結果の `contents` は `uri`、`mimeType`、`text`（または `blob`）。Resource Templates は RFC 6570 の URI テンプレート。独自スキームは RFC 3986 に沿うこと（MUST）。`https://` はクライアントが直接読めるときだけ使い（SHOULD）、サーバーが代わりにダウンロードする場合も別のスキームを勧める。Resource not found は `-32002`（SHOULD）。Servers MUST validate all resource URIs | 76行目、100行目（アプリが決める、一覧から選ぶ画面）、178行目、256行目（contents の要素）、258行目（スキーム）、262行目（テンプレート）、266行目（URI の検証）、268行目（-32002）、376行目 |
| 3 | MCP Specification 2025-11-25 Prompts | https://modelcontextprotocol.io/specification/2025-11-25/server/prompts | Prompts は user-controlled で、スラッシュコマンドの例。`prompts/get` の結果は `role` と `content` を持つ `messages`。埋め込み Resource は `type: "resource"` で、valid な URI と MIME タイプと `text` か `blob` を MUST で含む。必須の引数が無いときは `-32602` | 76行目、100行目（ユーザーが選ぶ前提）、276行目、378行目 |
| 4 | MCP Specification 2025-11-25 Schema Reference | https://modelcontextprotocol.io/specification/2025-11-25/schema | `GetPromptRequestParams` の `arguments?: { [key: string]: string }`（値は文字列） | 272行目 |
| 5 | typescript-sdk v1.x README | https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x | v1.x はメンテナンスの系列で、MCP の仕様 2025-11-25 までを実装している | 123行目 |
| 6 | typescript-sdk v1.x docs/server.md | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md | `registerResource(name, uri, metadata, callback)` の形。`ResourceTemplate` のテンプレートの変数は読み取りのコールバックに渡る。`registerPrompt` の `argsSchema` に zod で引数を書く | 256行目、262行目、274行目 |
| 7 | typescript-sdk v1.x src/server/mcp.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/mcp.ts | `resources/list` はテンプレートの `listCallback` が返す Resource を一覧に足す（`listCallback` が無いテンプレートは飛ばす）。テンプレートは `resources/templates/list` に出る。どのテンプレートにも合わない URI は `McpError(ErrorCode.InvalidParams, "Resource ... not found")`（-32602）。登録時に `registerCapabilities` で `resources: { listChanged: true }`、`prompts: { listChanged: true }` を宣言する。`promptArgumentsFromSchema` は `argsSchema` から `name`、`description`、`required`（optional でなければ true）を作る | 264行目、274行目、366行目（capabilities）、374行目（SDK の -32602） |
| 8 | typescript-sdk v1.x src/shared/protocol.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts | ハンドラーが投げた値の `code` が安全な整数ならそれを、無ければ `ErrorCode.InternalError`（-32603）を送り、`message` は `error.message` を送る（857〜858行目）。クライアントは受け取ったエラーから `McpError.fromError(code, message, data)` を作る（963行目） | 268行目（-32603）、380行目（前置きが2回） |
| 9 | typescript-sdk v1.x src/types.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts | `McpError` のコンストラクターは `super(\`MCP error ${code}: ${message}\`)` で、メッセージの頭に前置きを足す | 380行目 |
| 10 | @modelcontextprotocol/sdk（npm） | https://www.npmjs.com/package/@modelcontextprotocol/sdk | `npm view @modelcontextprotocol/sdk version dist-tags` の結果、version と latest が 1.32.2 | 123行目 |
| 11 | Node.js Modules: TypeScript | https://nodejs.org/api/typescript.html | v22.18.0 で type stripping が既定で有効。型の検査はしない。`.ts` のモジュールの種類は `.js` と同じく決まり、`import` と `export` を使うには `"type": "module"` を足す | 106行目、158行目 |
| 12 | Connect Claude Code to tools via MCP | https://code.claude.com/docs/en/mcp | 「Use MCP resources」: `@` で Resources がファイルと並んで候補に出る。形は `@server:protocol://resource/path`。参照した Resource は添付として取り込まれる。「Use MCP prompts as commands」: `/` で `/servername:promptname (MCP)` として出る。`/mcp__servername__promptname` でも実行できる。引数は空白区切りで、Claude Code は空白で分けるので各引数は1トークン | 264行目、407〜413行目 |
| 13 | Claude Code Advanced setup | https://code.claude.com/docs/en/setup | Claude Code requires a Pro, Max, Ultra, Team, Enterprise, or Console account. The free claude.ai plan does not include Claude Code access | 419行目 |
| 14 | MCP Inspector CLI Client README | https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md | `--method` に `resources/read`、`prompts/get` などを指定できる。`--uri`（resources/read）、`--prompt-name`、`--prompt-args <key=value>` | 384行目、403行目 |
| 15 | MCP Specification 2025-11-25 Tools | https://modelcontextprotocol.io/specification/2025-11-25/server/tools | Tool Execution Errors は `isError: true` の結果で返し、Input validation errors を含む | 372行目 |
| 16 | MCP Specification 2026-07-28 Server Features Overview | https://modelcontextprotocol.io/specification/2026-07-28/server | 2026-07-28 の版も、Prompts（User-controlled）、Resources（Application-controlled）、Tools（Model-controlled）の同じ表 | 102行目 |
| 17 | Map（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map | 「Objects vs. Maps」の表の Accidental Keys: Map は既定のキーを持たない。Object はプロトタイプを持つので、自分のキーとぶつかる既定のキーを含む（本文は mdn/content リポジトリの同じページの Markdown で読んだ） | 266行目 |
| 18 | npm-exec（npm Docs v10） | https://docs.npmjs.com/cli/v10/commands/npm-exec | npx はインストールの前に確認を求め、`-y`（`--yes`）で確認を省ける | 384行目 |

## 出典ではなく実行ログを根拠にした文

| 原稿の行 | 文 | 根拠 |
|---|---|---|
| 86 | 117行、`npm install` が2秒 | `wc -l`（package.json 10、server.ts 73、check.ts 34）、`run/03.log` の `in 2s` |
| 113、116、120〜121 | Node.js 22.22.0、npm 10.9.4、SDK 1.32.2、zod 4.6.7 | `run/01.log`、各ログの見出し、`code/package.json` |
| 106 | TypeScript 7.0.2 の `tsc` でも型を確かめた | `run/11.log`（`Version 7.0.2`、exit=0） |
| 264 | `list` を `undefined` にすると一覧は `guide://style` だけ | `run/08.log` |
| 266 | オブジェクトの表で `guide://glossary/constructor` を読むと失敗、`text` が無くクライアントの検証でエラー | `run/06.log`（`invalid_union`、`path: ["contents", 0]`）。Map の版は `run/07.log` で `-32002` |
| 268 | 普通の `Error` だと `-32603` | `run/05.log` |
| 366〜380 | capabilities、一覧、取得、3つの失敗の結果と前置きが2回 | `run/04.log` |
| 384〜401 | Inspector の CLI の `resources/read` の結果 | `run/09.log` |
| 403 | `text` だけを渡すとルールと依頼文の2つのメッセージ | `run/10.log` |
| 123 | 特典サンプルと版をそろえる | `samples/mcp-server/package.json` の 21〜22行目（`@modelcontextprotocol/sdk` 1.32.2、`zod` 4.6.7） |
