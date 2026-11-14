---
title: "MCP サーバーにつながらない（Connection closed）原因と直し方"
slug: "mcp-connection-closed-fix"
description: "MCP の Connection closed は、サーバーのプロセスが応答の前に終了したことを表します。終了の理由はサーバーの stderr に出ます。SDK 1.32.2 のクライアントで stderr を表示し、手元で再現した3つの原因を直します。"
tags: ["MCPサーバー", "TypeScript", "Claude Code"]
main_keyword: "MCPサーバー"
target_query: "mcp connection closed"
course_step: 5
prev: "mcp-server-resources-prompts"
next: "llm-eval-harness-fixtures"
sources:
  - url: "https://modelcontextprotocol.io/specification/2025-11-25/basic/transports"
    title: "MCP Specification 2025-11-25 Transports"
    accessed: 2026-11-02
  - url: "https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle"
    title: "MCP Specification 2025-11-25 Lifecycle"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/stdio.ts"
    title: "typescript-sdk v1.x src/client/stdio.ts"
    accessed: 2026-11-10
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts"
    title: "typescript-sdk v1.x src/shared/protocol.ts"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts"
    title: "typescript-sdk v1.x src/types.ts"
    accessed: 2026-11-02
  - url: "https://www.jsonrpc.org/specification"
    title: "JSON-RPC 2.0 Specification"
    accessed: 2026-11-02
  - url: "https://code.claude.com/docs/en/mcp"
    title: "Connect Claude Code to tools via MCP"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/setup"
    title: "Claude Code Advanced setup"
    accessed: 2026-11-02
  - url: "https://nodejs.org/api/typescript.html"
    title: "Node.js Modules: TypeScript"
    accessed: 2026-11-10
  - url: "https://nodejs.org/api/child_process.html"
    title: "Node.js Child process"
    accessed: 2026-11-02
  - url: "https://www.npmjs.com/package/@modelcontextprotocol/sdk"
    title: "@modelcontextprotocol/sdk (npm)"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/stdio.ts"
    title: "typescript-sdk v1.x src/server/stdio.ts"
    accessed: 2026-11-02
cost_estimate: "記事の手順は LLM の API を呼ばないので無料です。Claude にツールを呼ばせるには、Claude Code を使える有料のアカウントが要ります。"
run_environment: "Node.js 22.22.0、npm 10.9.4、SDK 1.32.2、Claude Code 2.1.322、Linux x86_64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-10"
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-11
---

MCP サーバーに `Connection closed` でつながらないとき、サーバーのプロセスはもう終了しています。SDK のクライアントは、プロセスが終わると待っていた要求をこのエラーで打ち切ります（出典4）。終了した理由を知る手がかりは、サーバーが stderr に書いた行です。

この記事では、その行を表示する確認用のクライアントを TypeScript で作ります。自分のサーバーの起動コマンドを渡せば、そのサーバーの stderr も読めます。手元で再現した原因は3つで、どれも stderr を読めば見分けられました。

| stderr に出た行 | 手元で再現した原因 | 直し方 |
|---|---|---|
| サーバー自身が投げたエラー | 文面にあるもの（この記事では環境変数）が足りない | 文面が求めるものを渡す |
| `Cannot find module` | 起動するファイルのパスが違う | 絶対パスで登録する |
| エラーの行が無い | サーバーが接続を始めずに終わった | `server.connect()` を呼ぶ |

対象は、TypeScript で stdio の MCP サーバーを作り、つなごうとしている人です。つなぐ側は Claude Code か、公式 SDK のクライアントを想定しています。書き写すコードは3ファイルで71行です。

講座の前の記事は、Resources と Prompts の回でした。[前の記事](/posts/mcp-server-resources-prompts)から続けて読めます。この記事は、作ったサーバーにつながらないときに読む回です。

## Connection closed はサーバーのプロセスが終わったという知らせ

このエラーの文面を組み立てているのは、クライアント側の SDK です。サーバーから届いた言葉は、ひとつも入っていません。

stdio 方式では、クライアントがサーバーを子プロセスとして起動します（出典1）。子プロセスが終わると接続を閉じるのが、SDK 1.32.2 のクライアントの動きです（出典3）。閉じたときに、応答を待っていた要求をすべてエラーで終わらせます（出典4）。そのエラーの文面が `Connection closed` です（出典4）。

`-32000` は、SDK が ConnectionClosed に割り当てた番号です（出典5）。JSON-RPC 2.0 は、-32000 から -32099 を実装ごとに決めるエラーの範囲にしています（出典6）。

つまり、この1行からわかるのはプロセスが終わったことだけです。SDK は子プロセスの終了コードを受け取りますが、使わずに捨てています（出典3）。残る手がかりは、サーバーの stderr だけです。

MCP の仕様は、サーバーが stderr にログを書くことを認めています（出典1）。クライアントは stderr を拾っても、転送しても、無視してもかまいません（出典1）。手元で試した `claude mcp list` も、stderr の中身は出しませんでした。理由の欄に出たのは `CONNECTION_CLOSED: Connection closed` だけです。

## 原因は確認用のクライアントで stderr を表示すれば読める

stderr を読む道具として、SDK のクライアントで小さな確認用のプログラムを書きます。LLM を通さずにサーバーを起動するので、API キーは要りません。

### 前提となる環境

動かしたのは Node.js 22.22.0 と npm 10.9.4 で、OS は Linux（x86_64）です。SDK 1.32.2 が求める Node.js は 18 以上です（出典11）。

| パッケージ | バージョン |
|---|---|
| `@modelcontextprotocol/sdk` | 1.32.2 |
| `zod` | 4.6.7 |
| Claude Code（原因1と原因2の確認で使う） | 2.1.322 |

この記事では、`.ts` のファイルを `node` でそのまま実行します。Node.js は、`.ts` の型を取り除いてから動かします（出典9）。フラグなしで動くのは、22 系では 22.18.0 から、23 系以降では 23.6.0 からです（出典9）。23.0.0 から 23.5.0 は、22.18.0 より新しくてもフラグが要ります（出典9）。22 系なら 22.18.0 以上、それより新しい系列なら 23.6.0 以上を使ってください。型の検査はしないので（出典9）、手元では TypeScript 7.0.2 の `tsc` でも型を確かめました。

### 作業フォルダとメモのファイル

作業フォルダ `notes-mcp` と、サーバーが数えるメモのフォルダ `notes` を作ります。

```bash
mkdir -p notes-mcp/notes
cd notes-mcp
touch notes/todo.md notes/idea.md
```

できあがる作業フォルダは、次の形です。

```text
notes-mcp/
  package.json
  server.ts
  check.ts
  notes/
    todo.md
    idea.md
```

`package.json` を置きます。版に `^` を付けていないのは、記事と同じ版を入れるためです。

```json
{
  "name": "notes-mcp",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.32.2",
    "zod": "4.6.7"
  }
}
```

### 環境変数を読んで起動するサーバー

`server.ts` は、環境変数 `NOTES_DIR` に書かれたフォルダのメモを数えるサーバーです。設定が無いときは、起動の時点でエラーを投げて終わります。

```ts
import { readdir } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const notesDir = process.env.NOTES_DIR;
if (!notesDir) {
  throw new Error("環境変数 NOTES_DIR が設定されていません");
}

const server = new McpServer({ name: "notes", version: "0.1.0" });

server.registerTool(
  "count_notes",
  {
    title: "メモの数を数える",
    description: "NOTES_DIR にある .md ファイルの数を返す。",
  },
  async () => {
    const files = await readdir(notesDir);
    const count = files.filter((name) => name.endsWith(".md")).length;
    return { content: [{ type: "text", text: `メモ: ${count} 件` }] };
  },
);

await server.connect(new StdioServerTransport());
console.error("notes MCP server started (stdio)");
```

Claude Code の公式ページにも、API キーを環境変数で渡して登録する例があります（出典7）。設定が欠けたときにそうしたサーバーがどう終わるかを、この1ファイルで再現しました。起動のログは `console.error` で書いています。stdout には、MCP のメッセージ以外を書いてはいけないからです（出典1）。

### stderr を表示する check.ts

`check.ts` は、引数で渡したコマンドでサーバーを起動し、接続してからツールの一覧を取ります。失敗したら、エラーの文面とサーバーの stderr を並べて表示します。

```ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("使い方: node check.ts <コマンド> [引数...]");
  process.exit(2);
}

const transport = new StdioClientTransport({ command, args, stderr: "pipe" });
let serverStderr = "";
transport.stderr?.on("data", (chunk) => {
  serverStderr += chunk.toString();
});

const client = new Client({ name: "check-client", version: "0.0.0" });
try {
  await client.connect(transport);
  console.log("ok:", JSON.stringify(client.getServerVersion()));
  if (client.getServerCapabilities()?.tools) {
    const { tools } = await client.listTools();
    console.log("tools:", tools.map((tool) => tool.name).join(", "));
  }
} catch (error) {
  console.log("failed:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await client.close();
  console.log("--- server stderr ---");
  console.log(serverStderr.trim() || "(empty)");
}
```

要になるのは `stderr: "pipe"` の指定です。既定の `"inherit"` では、サーバーの stderr は親の画面に流れるだけです（出典3）。`"pipe"` にすると、SDK は stderr のストリームを接続の前から渡します（出典3）。起動直後に終わったサーバーの出力を取りこぼさないための作りです（出典3）。

`command` と `args` には、`check.ts` に渡した引数をそのまま使います。1つ目がサーバーを起動するコマンドで、残りはそのコマンドの引数です。`claude mcp add` では、`--` より後ろがサーバーを起動するコマンドです（出典7）。その並びを `node check.ts` の後ろに書けば、登録したサーバーを同じコマンドで起動できます。

接続に成功したときの表示は、サーバーの名前と版です。ツールを持つサーバーなら、その名前の一覧も出ます。ツールは呼ばないので、ツールの名前を `check.ts` に書く必要はありません。

次のコマンドで依存を入れてください。

```bash
npm install
```

```text
added 95 packages, and audited 96 packages in 2s

36 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

`check.ts` に `node server.ts` を渡して実行します。`NOTES_DIR` には、`notes` の絶対パスを入れました。

```bash
NOTES_DIR="$PWD/notes" node check.ts node server.ts
```

```text
failed: MCP error -32000: Connection closed
--- server stderr ---
file:///path/to/notes-mcp/server.ts:7
  throw new Error("環境変数 NOTES_DIR が設定されていません");
        ^

Error: 環境変数 NOTES_DIR が設定されていません
    at file:///path/to/notes-mcp/server.ts:7:9
    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:665:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)

Node.js v22.22.0
```

1行目は、いつもの `Connection closed` です。その下の stderr に、サーバーが7行目で投げたエラーが出ました。出力の中のパスは `/path/to` に置き換えています。

コマンドの先頭で `NOTES_DIR` を設定したのに、サーバーは「設定されていません」と言って終わっています。これが1つ目の原因です。

## 原因1 サーバー自身が投げたエラーは文面が原因を指す

サーバーが自分で投げたエラーなら、何が足りないかは stderr の文面に書かれています。この記事の例で足りないのは、環境変数 `NOTES_DIR` でした。

環境変数とは別の理由で投げたエラーも、同じように stderr に出ました。手元で試したのは、無い設定ファイル `config.json` を読むサーバーです。stderr に出たのは `ENOENT: no such file or directory` の行です。無いと言われたのは `config.json` でした。この場合に用意するのは、設定ファイルのほうです。

環境変数が足りなくなった原因は、SDK のクライアント側にあります。SDK のクライアントは、親のプロセスの環境変数をすべてはサーバーに渡しません。決まった変数だけを選んで渡します。

Linux と macOS で渡るのは、6つの変数です（出典3）。名前は `HOME`、`LOGNAME`、`PATH`、`SHELL`、`TERM`、`USER` です。Windows では、`APPDATA` と `PATH` を含む12個が渡ります（出典3）。`NOTES_DIR` はどちらにも入っていないので、シェルで設定してもサーバーには届きません。

### SDK のクライアントは env に書いた変数を足して渡す

直すには、`StdioClientTransport` の `env` に渡したい変数を書きます。`check.ts` では、シェルの環境変数をすべて `env` に写すことにしました。`transport` を作る行を、次のように変えます。

変更前です。

```ts
const transport = new StdioClientTransport({ command, args, stderr: "pipe" });
```

変更後です。`env` を作る4行を足し、`StdioClientTransport` に `env` を渡しました。

```ts
const env: Record<string, string> = {};
for (const [key, value] of Object.entries(process.env)) {
  if (value !== undefined) env[key] = value;
}
const transport = new StdioClientTransport({ command, args, env, stderr: "pipe" });
```

`env` の型は `Record<string, string>` です（出典3）。手元で `process.env` をそのまま渡すと、`tsc` が型のエラーを出しました。値の型が `string | undefined` で、`string` に代入できないというエラーです。そのため、値が文字列のものだけを写しました。

SDK は、既定で渡す変数に `env` の中身を重ねてからサーバーを起動します（出典3）。同じコマンドで、もう一度実行します。

```bash
NOTES_DIR="$PWD/notes" node check.ts node server.ts
```

```text
ok: {"name":"notes","version":"0.1.0"}
tools: count_notes
--- server stderr ---
notes MCP server started (stdio)
```

`tools:` の行に、`server.ts` が登録した `count_notes` が出ました。シェルで設定した `NOTES_DIR` が、今度はサーバーに届いています。自分で書いた SDK のクライアントでも、直し方は同じです。サーバーが求める変数を、`env` に書いて渡してください。

### Claude Code では -e で登録に書く

Claude Code では、`claude mcp add` の `-e` で環境変数を渡します（出典7）。`-e` を書く位置は、サーバーの名前より後ろ、`--` より前です（出典7）。作業フォルダで登録して、つながるかを確かめます。

```bash
claude mcp add notes --scope user -e NOTES_DIR="$PWD/notes" -- node server.ts
claude mcp list
```

```text
Added stdio MCP server notes with command: node server.ts to user config
File modified: ~/.claude.json
Checking MCP server health…

notes: node server.ts - √ Connected
```

`Connected` と出たので、`-e` で渡した `NOTES_DIR` はサーバーに届いています。設定は使い捨てのフォルダに書いたので、出力の中のパスは置き換えました。

シェルで `export` した変数も、Claude Code 2.1.322 ではサーバーに届きました。`-e` を付けずに登録し、`export` の前と後で `claude mcp list` を比べた結果です。前は `Connection closed`、後は `Connected` と出ました。ただ、この届き方は claude を起動したシェルの設定しだいです。登録に `-e` で書いておけば、どのシェルから起動しても同じ値が渡ります。

直した `check.ts` も、シェルの環境変数をサーバーに渡します。Claude Code 2.1.322 で、シェルとサーバーの変数の名前を比べました。違ったのは、Claude Code 自身の変数だけです。登録の `-e` に書いた変数は、`check.ts` を実行するコマンドの前に書いて渡します。

## 原因2 Cannot find module は起動するファイルのパスの誤り

`Cannot find module` は、`node` が起動するファイルを見つけられなかったという意味です。ファイル名の書き間違いを、`check.ts` の引数で再現しました。

```bash
NOTES_DIR="$PWD/notes" node check.ts node servr.ts
```

```text
failed: MCP error -32000: Connection closed
--- server stderr ---
node:internal/modules/cjs/loader:1386
  throw err;
  ^

Error: Cannot find module '/path/to/notes-mcp/servr.ts'
    at Function._resolveFilename (node:internal/modules/cjs/loader:1383:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1025:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1030:22)
    at Function._load (node:internal/modules/cjs/loader:1192:37)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v22.22.0
```

`node` は、探したファイルの絶対パスを表示しています。表示されたファイル名が `servr.ts` なので、書き間違いだとわかります。

### 相対パスの登録はフォルダによって結果が変わる

書き間違いより気づきにくいのが、相対パスでの登録です。SDK のクライアントは、`cwd` を指定しなければ自分の作業フォルダでサーバーを起動します（出典3）。相対パスは、その作業フォルダから探されます。

原因1では、作業フォルダで `node server.ts` を登録し、`Connected` を確かめました。同じ登録のまま、ホームフォルダで `claude mcp list` を実行します。

```bash
(cd ~ && claude mcp list)
```

```text
Checking MCP server health…

notes: node server.ts - × Failed to connect — CONNECTION_CLOSED: Connection closed
```

括弧の中は、ホームフォルダに移ってから実行し、終わると元のフォルダに戻ります。同じ登録が、ホームフォルダでは `Connection closed` で失敗しました。相対パスの `server.ts` を探す起点は、claude を実行したフォルダでした。

`claude mcp list` は、失敗した理由を状態の後ろに付けて表示します（出典7）。ただし、stderr の `Cannot find module` までは出ません。

直すには、絶対パスで登録し直します。`"$PWD/server.ts"` は、シェルが作業フォルダの絶対パスに展開します。

```bash
claude mcp remove notes -s user
claude mcp add notes --scope user -e NOTES_DIR="$PWD/notes" -- node "$PWD/server.ts"
(cd ~ && claude mcp list)
```

```text
Removed MCP server notes from user config
File modified: ~/.claude.json
Added stdio MCP server notes with command: node /path/to/notes-mcp/server.ts to user config
File modified: ~/.claude.json
Checking MCP server health…

notes: node /path/to/notes-mcp/server.ts - √ Connected
```

ホームフォルダから実行しても、`Connected` と出るようになりました。試し終えたら、`claude mcp remove notes -s user` で登録を消せます。

## 原因3 エラーの行が無ければサーバーが接続を始めていない

エラーの行が1つも無いまま切れたら、疑う先はサーバーのコードです。接続を始める前に、ファイルの最後まで実行し終えています。

再現のために、`server.ts` から次の1行を消して保存しました。

```ts
await server.connect(new StdioServerTransport());
```

そのうえで、原因1で直した `check.ts` を同じコマンドで実行します。

```bash
NOTES_DIR="$PWD/notes" node check.ts node server.ts
```

```text
failed: MCP error -32000: Connection closed
--- server stderr ---
notes MCP server started (stdio)
```

stderr に出たのは、起動のログの1行です。ログを書く行は `connect` の後ろにあるので、接続しなくても表示されます。このログだけを見て、接続できたと判断するのは早すぎます。

`connect` を呼ばないと、サーバーは標準入力を読み始めません（出典12）。手元では、プロセスはエラーを出さずに終了コード 0 で終わりました。エラーを投げていないので、stderr にエラーの行は残りません。

### サーバーだけを起動して initialize を送る

クライアントを通さずに、サーバーへ直接メッセージを送る確かめ方もあります。stdio のメッセージは、改行で区切った1行の JSON-RPC です（出典1）。最初に送るのは `initialize` の要求と決まっています（出典2）。`echo` でその1行を標準入力に流します。

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"manual","version":"0.0.0"}}}' | NOTES_DIR="$PWD/notes" node server.ts
```

`connect` の行を消したままの `server.ts` では、起動のログしか出ません。

```text
notes MCP server started (stdio)
```

`connect` の行を戻して保存し、同じコマンドを実行しました。今度は、`initialize` への応答が stdout に1行で返ります。

```text
notes MCP server started (stdio)
{"result":{"protocolVersion":"2025-11-25","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"notes","version":"0.1.0"}},"jsonrpc":"2.0","id":1}
```

応答が返ったら、サーバーのコードは正しく動いています。それでもつながらないなら、調べる先はクライアントの設定です。見る場所は、原因1の環境変数と、原因2のパスです。

## Connection closed 以外の文面は別の原因を指す

似た場面で出ても、文面が違えば原因も違います。手元で出た2つの文面を、SDK 1.32.2 と Claude Code 2.1.322 の表示で並べます。

| 状況 | SDK のクライアントの文面 | Claude Code の表示 |
|---|---|---|
| 起動するコマンドが無い | `spawn nodee ENOENT` | `ENOENT: Executable not found in $PATH: "nodee"` |
| 起動したが initialize に答えない | `MCP error -32001: Request timed out` | 未確認 |

コマンドが無いときは、プロセスそのものが作られません。Node.js は、子プロセスを作れなかったときに `error` イベントを出します（出典10）。SDK のクライアントは、そのエラーをそのまま `connect()` の失敗として返します（出典3）。表の `nodee` は、`node` を書き間違えて再現したものです。

答えないときの `-32001` は、SDK の RequestTimeout の番号です（出典5）。SDK は、応答を既定で60秒待ちます（出典4）。手元でも、失敗の表示まで60秒かかりました。Claude Code では、サーバーの起動を待つ時間を環境変数 `MCP_TIMEOUT` で変えられます（出典7）。

stdout にログを書いた場合は、SDK 1.32.2 のクライアントでは接続が切れませんでした。SDK は JSON として読めない行でエラーを報告し、次の行を読み続けます（出典3）。この動きは、講座で stdio の MCP サーバーを作った回に実行して確かめています。[サーバーを作る回](/posts/mcp-server-typescript-stdio)の stdout の節です。MCP Inspector の CLI で出た `Connection closed` の読み方は、別の記事にあります。[MCP Inspector で調べる記事](/posts/mcp-inspector-debug)を見てください。

## 料金がかからない範囲

この記事の手順は、どれも LLM の API を呼ばないので、API の料金はかかりません。`claude mcp` の3つのコマンドは、ネットワークに出られない状態でも動きました。3つは `add`、`list`、`remove` です。プロキシの向き先を使えないポートにして、環境変数を `PATH` と `HOME` だけにして試しました。

料金が要るのは、Claude Code の会話で Claude にツールを呼ばせる操作です。Claude Code を使うには、有料のプランか Console のアカウントが要ります（出典8）。無料の claude.ai のプランには、Claude Code が含まれていません（出典8）。この記事はその操作をしていないので、金額も載せていません。

## つながらないときに確かめる順番

`Connection closed` が出たら、次の順に確かめてください。

1. サーバーの stderr を表示します。Claude Code なら、登録の `--` より後ろを `node check.ts` の後ろに並べてください。`-e` の変数は、そのコマンドの前に書きます。自分で書いた SDK のクライアントなら、`stderr: "pipe"` を足して stderr を読みます。
2. stderr にサーバー自身のエラーがあれば、文面が求めるものを用意してください。環境変数なら、`env` か `-e` で渡します。
3. `Cannot find module` があれば、パスを絶対パスに直してください。
4. エラーの行が無ければ、`initialize` の1行を `echo` で送り、応答が返るかを見ます。

どの原因でも、手がかりはサーバーの stderr にありました。あなたのサーバーは、起動に必要な環境変数をいくつ読んでいますか。

## 出典

確認日は、出典3、7、9 が 2026-11-10、ほかは 2026-11-02 です。本文の（出典1）から（出典12）までの番号は、この表の番号を指します。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | MCP Specification 2025-11-25 Transports | https://modelcontextprotocol.io/specification/2025-11-25/basic/transports | 2026-11-02 |
| 2 | MCP Specification 2025-11-25 Lifecycle | https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle | 2026-11-02 |
| 3 | typescript-sdk v1.x src/client/stdio.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/stdio.ts | 2026-11-10 |
| 4 | typescript-sdk v1.x src/shared/protocol.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts | 2026-11-02 |
| 5 | typescript-sdk v1.x src/types.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts | 2026-11-02 |
| 6 | JSON-RPC 2.0 Specification | https://www.jsonrpc.org/specification | 2026-11-02 |
| 7 | Connect Claude Code to tools via MCP | https://code.claude.com/docs/en/mcp | 2026-11-10 |
| 8 | Claude Code Advanced setup | https://code.claude.com/docs/en/setup | 2026-11-02 |
| 9 | Node.js Modules: TypeScript | https://nodejs.org/api/typescript.html | 2026-11-10 |
| 10 | Node.js Child process | https://nodejs.org/api/child_process.html | 2026-11-02 |
| 11 | @modelcontextprotocol/sdk（npm） | https://www.npmjs.com/package/@modelcontextprotocol/sdk | 2026-11-02 |
| 12 | typescript-sdk v1.x src/server/stdio.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/stdio.ts | 2026-11-02 |

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
