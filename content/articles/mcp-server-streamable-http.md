---
title: "MCP サーバーを Streamable HTTP で動かす【TypeScript SDK、リモート接続の準備】"
slug: "mcp-server-streamable-http"
description: "公式 SDK v1.32.2 で、文字数のツールを Streamable HTTP のサーバーとして動かします。SDK のクライアント、curl、Claude Code から呼んだ実際の出力と、つまずく2か所を載せています。"
tags: ["MCPサーバー", "TypeScript", "Streamable HTTP"]
main_keyword: "MCPサーバー"
target_query: null
course_step: 5
cost_estimate: "記事の手順は LLM の API を呼ばないので無料です。Claude にツールを呼ばせる操作には、Claude Code を使える有料のアカウントが要ります。"
run_environment: "Node.js 22.22.0、SDK 1.32.2、Claude Code 2.1.316"
verified_at: "2026-11-02"
prev: "mcp-server-typescript-stdio"
next: "mcp-inspector-debug"
sources:
  - url: "https://modelcontextprotocol.io/specification/2025-11-25/basic/transports"
    title: "MCP Specification 2025-11-25 Transports"
    accessed: 2026-11-02
  - url: "https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle"
    title: "MCP Specification 2025-11-25 Lifecycle"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x"
    title: "modelcontextprotocol/typescript-sdk (v1.x branch) README"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md"
    title: "typescript-sdk v1.x docs/server.md"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/express.ts"
    title: "typescript-sdk v1.x src/server/express.ts"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/middleware/hostHeaderValidation.ts"
    title: "typescript-sdk v1.x hostHeaderValidation.ts"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/webStandardStreamableHttp.ts"
    title: "typescript-sdk v1.x src/server/webStandardStreamableHttp.ts"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/examples/server/simpleStatelessStreamableHttp.ts"
    title: "typescript-sdk v1.x simpleStatelessStreamableHttp.ts"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/streamableHttp.ts"
    title: "typescript-sdk v1.x src/client/streamableHttp.ts"
    accessed: 2026-11-02
  - url: "https://www.npmjs.com/package/@modelcontextprotocol/sdk"
    title: "@modelcontextprotocol/sdk (npm)"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events"
    title: "Using server-sent events (MDN)"
    accessed: 2026-11-02
  - url: "https://code.claude.com/docs/en/mcp"
    title: "Connect Claude Code to tools via MCP"
    accessed: 2026-11-02
  - url: "https://code.claude.com/docs/en/setup"
    title: "Claude Code Advanced setup"
    accessed: 2026-11-02
  - url: "https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp"
    title: "Get started with custom connectors using remote MCP"
    accessed: 2026-11-02
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-02
---

HTTP で受ける MCP サーバーは、SDK の Streamable HTTP のトランスポートで作ります。前の記事の文字数のツールを、手元の `http://127.0.0.1:3000/mcp` から呼べるようにします。SDK のクライアントから呼ぶと、結果は stdio のときと同じ1行で返ります。

```text
ok: {"content":[{"type":"text","text":"文字数: 15 / 行数: 2 / UTF-8: 50 バイト"}]}
```

講座の[前の記事](/posts/mcp-server-typescript-stdio)は stdio の回です。同じツールを stdio で作り、Claude Code にもつなぎました。ツールの中身の説明は、そちらに任せます。

確かめたのは、SDK のクライアント、curl、`claude mcp` で呼ぶところまでです。サーバーはインターネットに公開していません。claude.ai からつなぐ操作も、Claude にツールを呼ばせる操作も実行していません。

対象は、stdio の MCP サーバーを1つ作ったことがある人です。書き写すコードは4ファイルで、合わせて121行あります。時間がかかるのは `npm install` で、2026-11-02 の実測では3秒でした。

## Streamable HTTP は1つの URL に POST で JSON-RPC を送る方式

Streamable HTTP は、MCP の仕様が定める2つの標準のトランスポートの1つです（出典1）。もう1つは stdio です（出典1）。サーバーは独立したプロセスとして動き、複数のクライアントの接続を受けられます（出典1）。

サーバーは、POST と GET を受ける1つの URL を用意します（出典1）。仕様はこの URL を MCP エンドポイントと呼びます。クライアントは JSON-RPC のメッセージを1つずつ、新しい POST で送ります（出典1）。

SDK の docs/server.md は、リモートには Streamable HTTP を勧めます（出典4）。同じページによれば、動かし方はステートレスとステートフルの2通りです（出典4）。ステートレスはセッションを追わない形で、API のような単純なサーバーに向くと書かれています（出典4）。

この記事のサーバーはステートレスです。仕様でも、セッション ID を割り当てるかどうかはサーバーが選べます（出典1）。ツールを1つ呼ぶだけなら、リクエストの間で覚えておくものがありません。

## 前提となる環境

必要なのは Node.js です。SDK 1.32.2 は Node.js 18 以上を指定しています（出典10）。この記事のコードは、Node.js 22.22.0 と npm 10.9.4 で動かしました。手順5では Claude Code 2.1.316 も使います。

| パッケージ | バージョン |
|---|---|
| `@modelcontextprotocol/sdk` | 1.32.2 |
| `zod` | 4.6.7 |
| `typescript`（開発用） | 7.0.2 |
| `@types/node`（開発用） | 22.20.5 |
| `@types/express`（開発用） | 5.0.6 |

SDK は v1 系の 1.32.2 を使います。v1.x ブランチの README によれば、v1 系はメンテナンスを続ける系列です（出典3）。対応する MCP の仕様は 2025-11-25 のものまでです（出典3）。修正は v2 系が出た 2026-07-27 から、少なくとも6か月続きます（出典3）。v1 系を選んだ理由は前の記事と同じで、特典サンプルとバージョンをそろえるためです。

Express は自分で入れる必要がありません。SDK 1.32.2 が `express` を依存に持っていて、手元では 5.3.0 が入りました。`@types/express` だけは自分で入れます。外して試すと、`req` と `res` の型が決まらず、`tsc` が7件のエラーを出しました。

### 作り終えたときのファイル構成

できあがる作業フォルダは、次の形になります。

```text
char-count-http/
  package.json
  tsconfig.json
  src/
    server.ts
    check.ts
```

`dist/` と `node_modules/` は、ビルドと `npm install` が作るフォルダです。

## 1. 準備は設定ファイル2つと npm install

最初に、作業フォルダ `char-count-http` と、その中の `src/` を作ります。

```bash
mkdir -p char-count-http/src
cd char-count-http
```

作業フォルダに `package.json` を置きます。依存のバージョンに `^` を付けず、記事と同じバージョンを入れます。

```json
{
  "name": "char-count-http",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "check": "node dist/check.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.32.2",
    "zod": "4.6.7"
  },
  "devDependencies": {
    "@types/express": "5.0.6",
    "@types/node": "22.20.5",
    "typescript": "7.0.2"
  }
}
```

`tsconfig.json` は前の記事と同じ内容です。`src/` の `.ts` を、`dist/` に `.js` として書き出します。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"],
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

2つのファイルを置いたら、依存を入れます。

```bash
npm install
```

```text
added 108 packages, and audited 109 packages in 3s

36 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

## 2. サーバーはリクエストごとに作り直す

`src/server.ts` は69行です。`createServer` の中身は、前の記事のツールの登録と同じです。違うのは、その下の HTTP の受け口です。

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { z } from "zod";

function createServer() {
  const server = new McpServer({ name: "char-count", version: "0.1.0" });
  server.registerTool(
    "count_chars",
    {
      title: "文字数を数える",
      description: "日本語の文章の文字数・行数・UTF-8 のバイト数を返す。文字数は見た目の1文字を1と数え、改行も1文字に含める。行数は改行（LF）で区切った数で、末尾が改行なら最後の空の行も1行と数える。",
      inputSchema: {
        text: z.string().min(1).max(10_000).describe("数えたい文章"),
      },
    },
    async ({ text }) => {
      const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
      const chars = [...segmenter.segment(text)].length;
      const lines = text.split("\n").length;
      const bytes = Buffer.byteLength(text, "utf8");
      return {
        content: [{ type: "text", text: `文字数: ${chars} / 行数: ${lines} / UTF-8: ${bytes} バイト` }],
      };
    },
  );
  return server;
}

const ALLOWED_ORIGINS: string[] = [];

const app = createMcpExpressApp();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin !== undefined && !ALLOWED_ORIGINS.includes(origin)) {
    res.status(403).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: `Invalid Origin: ${origin}` },
      id: null,
    });
    return;
  }
  next();
});

app.post("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.all("/mcp", (_req, res) => {
  res.status(405).set("Allow", "POST").json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
});

const PORT = 3000;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`char-count MCP server: http://127.0.0.1:${PORT}/mcp`);
});
```

いちばん大事なのは `app.post` の中です。POST が届くたびに、`McpServer` とトランスポートを新しく作ります。SDK のステートレスの例も、同じ作り方をしています（出典8）。1つを使い回すと、2回目のリクエストから失敗します。

`sessionIdGenerator: undefined` が、ステートレスにする指定です（出典8）。応答を送り終えて接続が閉じたら、`close` でトランスポートとサーバーを片づけます。

`createMcpExpressApp()` は、SDK が用意する Express のアプリの作り方です（出典5）。中で `express.json()` を入れるので、`req.body` に JSON が入ります（出典5）。もう1つ、Host ヘッダーの検査も入ります（出典5）。許す名前は `localhost`、`127.0.0.1`、`[::1]` の3つです（出典6）。

`createMcpExpressApp()` 自身は、待ち受けを始めません（出典5）。そのため `app.listen` に `"127.0.0.1"` を渡しました。仕様は、手元で動かすサーバーが 127.0.0.1 だけで待ち受けることを勧めています（出典1）。

Origin の検査は、ミドルウェアとして自分で書きました。仕様は、すべての接続で Origin ヘッダーを確かめるよう求めています（出典1）。不正な Origin には 403 を返すことも、仕様の決まりです（出典1）。

SDK のトランスポートにも `allowedOrigins` という指定があります。ただし 1.32.2 では非推奨で、外のミドルウェアを使うよう書かれています（出典7）。この記事では `ALLOWED_ORIGINS` を空にしたので、Origin の付いたリクエストはすべて断ります。

`app.all` は、POST 以外を 405 で断る受け口です。仕様では、GET には SSE で応じるか、405 を返す決まりです（出典1）。SDK のステートレスの例も、GET と DELETE に 405 を返します（出典8）。

## 3. SDK のクライアントで呼ぶと結果は stdio と同じ

確かめるには、ターミナルを2つ使います。1つ目でサーバーを動かしたまま、2つ目で SDK のクライアントを動かします。API キーは要りません。

`src/check.ts` は、前の記事の確認用のプログラムをもとにしました。トランスポートを `StreamableHTTPClientTransport` に替え、URL を渡します。空文字を渡す呼び出しは省き、代わりに最後の行でセッション ID を表示する形です。

```ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(new URL("http://127.0.0.1:3000/mcp"));
const client = new Client({ name: "check-client", version: "0.0.0" });
client.onerror = (error) => console.error("client error:", error.message);
await client.connect(transport);

const { tools } = await client.listTools();
console.log("tools:", tools.map((t) => t.name));

const ok = await client.callTool({
  name: "count_chars",
  arguments: { text: "MCPサーバーを作る👨‍👩‍👧\n2行目" },
});
console.log("ok:", JSON.stringify(ok));
console.log("session:", transport.sessionId);

await client.close();
```

1つ目のターミナルで、ビルドしてからサーバーを起動します。

```bash
npm run build
npm start
```

```text
> char-count-http@0.1.0 start
> node dist/server.js

char-count MCP server: http://127.0.0.1:3000/mcp
```

2つ目のターミナルでは、同じ作業フォルダに移ってから次のコマンドを打ちます。

```bash
npm run check
```

```text
> char-count-http@0.1.0 check
> node dist/check.js

tools: [ 'count_chars' ]
ok: {"content":[{"type":"text","text":"文字数: 15 / 行数: 2 / UTF-8: 50 バイト"}]}
session: undefined
```

`ok:` の行は、前の記事の stdio のサーバーと1文字も違いません。トランスポートを替えても、ツールの結果は変わりません。`session: undefined` は、サーバーがセッション ID を返さなかったことを示します。ステートレスにした結果のとおりです。

同じクライアントを30回続けて動かすと、4回で最後に次の1行が増えました。

```text
client error: SSE stream disconnected: AbortError: This operation was aborted
```

30回とも `ok:` の行は出ていました。`close()` は読みかけの通信を打ち切り、その打ち切りが SSE の切断として報告されます（出典9）。ツールの結果とは関係が無いので、この行は気にしなくて構いません。

サーバーを止めるときは、1つ目のターミナルで Ctrl+C を押します。

## 4. curl で送ると SSE の形で返る

SDK を通さずに送ると、HTTP の上で何が返るかが見えます。2つ目のターミナルから、ツールの呼び出しを curl で送りました。コマンドは bash の書き方です。

```bash
curl -sS -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"count_chars","arguments":{"text":"こんにちは"}}}' \
  -w "\nstatus: %{http_code} %{content_type}\n"
```

```text
event: message
data: {"result":{"content":[{"type":"text","text":"文字数: 5 / 行数: 1 / UTF-8: 15 バイト"}]},"jsonrpc":"2.0","id":1}


status: 200 text/event-stream
```

応答は `text/event-stream`、つまり SSE（Server-Sent Events）の形です。SSE では、1つのメッセージを `event` と `data` のような欄の行に分けて送ります（出典11）。JSON-RPC の応答は、`data:` の行に入っています。

仕様では、サーバーは SSE か `application/json` のどちらで返してもかまいません（出典1）。SDK のトランスポートは、指定しなければ SSE で返します（出典7）。

この curl は、初期化を飛ばしていきなりツールを呼んでいます。仕様では、初期化をクライアントとサーバーの最初のやり取りにする決まりです（出典2）。手元の 1.32.2 のステートレスのサーバーは、それでも結果を返しました。中身を覗くための送り方として使ってください。

### Accept に text/event-stream が無いと 406

`Accept` ヘッダーを外すと、サーバーは 406 で断ります。

```bash
curl -sS -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"count_chars","arguments":{"text":"こんにちは"}}}' \
  -w "\nstatus: %{http_code} %{content_type}\n"
```

```text
{"jsonrpc":"2.0","error":{"code":-32000,"message":"Not Acceptable: Client must accept both application/json and text/event-stream"},"id":null}
status: 406 application/json
```

POST の `Accept` には、2つの形式を両方書く決まりです（出典1）。`application/json` と `text/event-stream` です。HTTP のクライアントを自分で書くと、この1行を忘れがちです。406 が返ったら、まず `Accept` を見てください。

### GET には 405 が返る

GET を送ると、`app.all` の受け口が 405 を返します。

```bash
curl -sS http://127.0.0.1:3000/mcp -w "\nstatus: %{http_code} %{content_type}\n"
```

```text
{"jsonrpc":"2.0","error":{"code":-32000,"message":"Method not allowed."},"id":null}
status: 405 application/json; charset=utf-8
```

## Origin と Host の検査で外のページからの呼び出しを断る

127.0.0.1 で待ち受けても、外のウェブサイトから手元のサーバーを操作される恐れがあります（出典1）。仕様はその手口として、DNS リバインディングを挙げています（出典1）。攻撃者のドメインの名前を 127.0.0.1 に向け、手元のサーバーにリクエストを送らせる手口です（出典6）。

SDK の Host の検査は、この手口を防ぐためのものです（出典6）。Origin の検査も、仕様が同じ攻撃への対策として求めています（出典1）。外のページからのリクエストに見せるため、curl で2つのヘッダーを付けて送りました。

```bash
curl -sS -X POST http://127.0.0.1:3000/mcp \
  -H "Origin: https://evil.example" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  -w "\nstatus: %{http_code} %{content_type}\n"
```

```text
{"jsonrpc":"2.0","error":{"code":-32000,"message":"Invalid Origin: https://evil.example"},"id":null}
status: 403 application/json; charset=utf-8
```

```bash
curl -sS -X POST http://127.0.0.1:3000/mcp \
  -H "Host: evil.example:3000" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  -w "\nstatus: %{http_code} %{content_type}\n"
```

```text
{"jsonrpc":"2.0","error":{"code":-32000,"message":"Invalid Host: evil.example"},"id":null}
status: 403 application/json; charset=utf-8
```

Origin は、自分で書いたミドルウェアが断りました。Host は `createMcpExpressApp()` の検査が断っています。手順3と手順4の成功からわかるとおり、SDK のクライアントと curl は Origin を付けていません。そのため、手順3の確認では Origin の検査が働いているかわかりません。書いたら、この curl で 403 が返ることまで確かめてください。

自分のブラウザのページから呼ぶ場合は、そのページの Origin を `ALLOWED_ORIGINS` に足します。

## 5. Claude Code には --transport http で登録する

手元で動くサーバーは、そのまま Claude Code に登録できます。HTTP のサーバーは、`claude mcp add --transport http` で足します（出典12）。後ろに名前と URL を続けます。サーバーを起動したまま、2つ目のターミナルで実行しました。

設定は使い捨てのフォルダに書き、ログインはしていません。出力の中のパスは置き換えました。

```text
$ claude mcp add --transport http --scope user char-count-http http://127.0.0.1:3000/mcp
Added HTTP MCP server char-count-http with URL: http://127.0.0.1:3000/mcp to user config
File modified: /path/to/tmp-home/.claude.json

$ claude mcp list
Checking MCP server health…

char-count-http: http://127.0.0.1:3000/mcp (HTTP) - √ Connected

$ claude mcp get char-count-http
char-count-http:
  Scope: User config (available in all your projects)
  Status: √ Connected
  Type: http
  URL: http://127.0.0.1:3000/mcp

To remove this server, run: claude mcp remove char-count-http -s user

$ claude mcp remove char-count-http -s user
Removed MCP server char-count-http from user config
File modified: /path/to/tmp-home/.claude.json
```

`√ Connected` と出たので、Claude Code はこの URL のサーバーにつながっています。stdio と違い、Claude Code はサーバーを起動しません。サーバーを止めると、ツールは使えなくなります。

## トランスポートを使い回すと2回目から 500 になる

リクエストごとに作り直すのが面倒で、サーバーとトランスポートを1つにまとめたくなります。次のように `app.post` の外で作ると、2回目のリクエストから失敗します。悪い例として、手順2の `app.post` をこの形に書き換えて試しました。

```ts
const server = createServer();
const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);

app.post("/mcp", async (req, res) => {
  await transport.handleRequest(req, res, req.body);
});
```

ビルドしてサーバーを起動し直し、`npm run check` を実行した出力です。

```text
> char-count-http@0.1.0 check
> node dist/check.js

client error: Streamable HTTP error: Error POSTing to endpoint: 
file:///path/to/char-count-http/node_modules/@modelcontextprotocol/sdk/dist/esm/client/streamableHttp.js:378
                throw new StreamableHTTPError(response.status, `Error POSTing to endpoint: ${this._unfollowedRedirect(response, this._url) ?? text}`);
                      ^

StreamableHTTPError: Streamable HTTP error: Error POSTing to endpoint: 
    at StreamableHTTPClientTransport.send (file:///path/to/char-count-http/node_modules/@modelcontextprotocol/sdk/dist/esm/client/streamableHttp.js:378:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Client.notification (file:///path/to/char-count-http/node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:907:9)
    at async Client.connect (file:///path/to/char-count-http/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js:303:13)
    at async file:///path/to/char-count-http/dist/check.js:6:1 {
  code: 500
}

Node.js v22.22.0
```

`connect` の中の2回目の POST が、500 で失敗しています。1回目の初期化は通り、続く通知の POST で失敗した形です。そのあと curl で送っても、500 と空の本文が返り続けました。

原因は、SDK のステートレスのトランスポートが2回目の処理を拒むことです。2回目の処理では、次の文言の例外を投げます（出典7）。

```text
Stateless transport cannot be reused across requests. Create a new transport per request.
```

ソースの注記によれば、使い回すと別々のクライアントのメッセージ ID がぶつかるためです（出典7）。

厄介なのは、この例外の文言がサーバーにもクライアントにも出ないことです。サーバーのターミナルには起動のログしか残らず、クライアントに届く本文も空でした。500 の空の本文を見たら、トランスポートの作り方を疑ってください。

手順2の形に戻してビルドし直すと、`npm run check` の出力は手順3と同じになりました。

## GET に 405 を返さないとクライアントがエラーを報告する

`app.all` の受け口は、消しても `npm run check` は成功します。ただし、出力にエラーの行が増えます。悪い例として、手順2のコードから `app.all` のブロックを消して試しました。

```text
> char-count-http@0.1.0 check
> node dist/check.js

client error: Streamable HTTP error: Failed to open SSE stream: Not Found
client error: Streamable HTTP error: Failed to open SSE stream: Not Found
tools: [ 'count_chars' ]
ok: {"content":[{"type":"text","text":"文字数: 15 / 行数: 2 / UTF-8: 50 バイト"}]}
session: undefined
client error: SSE stream disconnected: AbortError: This operation was aborted
```

SDK のクライアントは、初期化のあとに GET で SSE を開こうとします（出典9）。受け口が無いと、Express は GET に 404 を返します。クライアントは、405 を「SSE が無いサーバー」の印として黙って受け入れます（出典9）。404 のような失敗は、`Failed to open SSE stream` として報告されます（出典9）。

ツールの結果は正しく返っているので、見逃しやすい行です。仕様どおり 405 を返せば、この行は出ません。最後の行は、手順3で書いた30回中4回の行と同じものです。

## claude.ai からつなぐには公開 URL と認証が要る

claude.ai のカスタムコネクタは、手元のサーバーにつながりません（出典14）。Claude は、Anthropic のクラウドからリモートの MCP サーバーにつなぎます（出典14）。サーバーは、Anthropic の IP アドレスからインターネット越しに届く場所に置く必要があります（出典14）。

この記事のサーバーを公開するときは、少なくとも次の3つを足します。

- 公開する URL。Anthropic の IP アドレスから届く場所にサーバーを置きます（出典14）
- 認証。仕様はすべての接続で認証を実装するよう勧めています（出典1）。SDK の docs/server.md には、Bearer トークンで認証する例があります（出典4）
- Origin と Host の許可リスト。公開するページの Origin は `ALLOWED_ORIGINS` に足します。Host の名前は `allowedHosts` に渡します（出典5）

カスタムコネクタは、無料のプランでも1つまで足せます（出典14）。この記事では公開も接続もしていないので、3つとも未確認の項目です。

## 料金がかからない範囲

手順1から5までと2つの悪い例の確認は、LLM の API を呼ばないので無料です。`claude mcp` の4つのコマンドも、ログインしない状態で動きました。

料金が要るのは、Claude Code の会話で Claude にツールを呼ばせる操作です。Claude Code を使うには、有料のプランか Console のアカウントが要ります（出典13）。無料の claude.ai のプランには、Claude Code が含まれていません（出典13）。サーバーを公開するなら、置き場所の料金は選ぶサービスで決まります。この記事はどちらも実行していないので、金額は載せていません。

## まとめ

書き足したのは、作り直す `app.post`、Origin の検査、405 の受け口の3つです。どれも、手元のクライアントで成功しただけでは抜けに気づけない行です。

講座の[次の記事](/posts/mcp-inspector-debug)は MCP Inspector の回です。サーバーのツールの一覧と呼び出しを、画面で確かめます。

あなたのサーバーを公開するとき、Origin の許可リストにはどのページを入れますか。

## 出典

確認日は、どれも 2026-11-02 です。本文の（出典1）などの番号は、この表の番号を指します。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | MCP Specification 2025-11-25 Transports | https://modelcontextprotocol.io/specification/2025-11-25/basic/transports | 2026-11-02 |
| 2 | MCP Specification 2025-11-25 Lifecycle | https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle | 2026-11-02 |
| 3 | typescript-sdk v1.x README | https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x | 2026-11-02 |
| 4 | typescript-sdk v1.x docs/server.md | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md | 2026-11-02 |
| 5 | typescript-sdk v1.x src/server/express.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/express.ts | 2026-11-02 |
| 6 | typescript-sdk v1.x hostHeaderValidation.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/middleware/hostHeaderValidation.ts | 2026-11-02 |
| 7 | typescript-sdk v1.x src/server/webStandardStreamableHttp.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/webStandardStreamableHttp.ts | 2026-11-02 |
| 8 | typescript-sdk v1.x simpleStatelessStreamableHttp.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/examples/server/simpleStatelessStreamableHttp.ts | 2026-11-02 |
| 9 | typescript-sdk v1.x src/client/streamableHttp.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/streamableHttp.ts | 2026-11-02 |
| 10 | @modelcontextprotocol/sdk（npm） | https://www.npmjs.com/package/@modelcontextprotocol/sdk | 2026-11-02 |
| 11 | Using server-sent events（MDN） | https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events | 2026-11-02 |
| 12 | Connect Claude Code to tools via MCP | https://code.claude.com/docs/en/mcp | 2026-11-02 |
| 13 | Claude Code Advanced setup | https://code.claude.com/docs/en/setup | 2026-11-02 |
| 14 | Get started with custom connectors using remote MCP | https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp | 2026-11-02 |

AI 支援で執筆しました。コードは 2026-11-02 に実際に実行して確認しています。
