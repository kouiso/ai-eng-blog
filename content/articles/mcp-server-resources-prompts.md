---
title: "MCP サーバーで Resources と Prompts を公開する【ツール以外の2つの機能】"
slug: "mcp-server-resources-prompts"
description: "MCP サーバーに、ツール以外の Resources と Prompts を登録します。使うのは公式 SDK v1.32.2 と TypeScript です。SDK のクライアントで一覧と取得を確かめ、ツールと違うエラーの返り方も実行結果付きで書いています。"
tags: ["MCPサーバー", "TypeScript", "Claude Code"]
main_keyword: "MCPサーバー"
target_query: null
course_step: 5
cost_estimate: "記事の手順は LLM の API を呼ばないので無料です。Claude Code の会話で Resources と Prompts を使うには、Claude Code を使える有料のプランか Console のアカウントが要ります。"
run_environment: "Node.js 22.22.0、npm 10.9.4、SDK 1.32.2、zod 4.6.7、Linux x86_64（Inspector の確認は 2.13.0、型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-10"
prev: "mcp-inspector-debug"
next: "mcp-connection-closed-fix"
sources:
  - url: "https://modelcontextprotocol.io/specification/2025-11-25/server"
    title: "MCP Specification 2025-11-25 Server Features Overview"
    accessed: 2026-11-02
  - url: "https://modelcontextprotocol.io/specification/2025-11-25/server/resources"
    title: "MCP Specification 2025-11-25 Resources"
    accessed: 2026-11-10
  - url: "https://modelcontextprotocol.io/specification/2025-11-25/server/prompts"
    title: "MCP Specification 2025-11-25 Prompts"
    accessed: 2026-11-02
  - url: "https://modelcontextprotocol.io/specification/2025-11-25/schema"
    title: "MCP Specification 2025-11-25 Schema Reference"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x"
    title: "typescript-sdk v1.x README"
    accessed: 2026-11-10
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md"
    title: "typescript-sdk v1.x docs/server.md"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/mcp.ts"
    title: "typescript-sdk v1.x src/server/mcp.ts"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts"
    title: "typescript-sdk v1.x src/shared/protocol.ts"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts"
    title: "typescript-sdk v1.x src/types.ts"
    accessed: 2026-11-02
  - url: "https://www.npmjs.com/package/@modelcontextprotocol/sdk"
    title: "@modelcontextprotocol/sdk (npm)"
    accessed: 2026-11-10
  - url: "https://nodejs.org/api/typescript.html"
    title: "Node.js Modules: TypeScript"
    accessed: 2026-11-02
  - url: "https://code.claude.com/docs/en/mcp"
    title: "Connect Claude Code to tools via MCP"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/setup"
    title: "Claude Code Advanced setup"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md"
    title: "MCP Inspector CLI Client README"
    accessed: 2026-11-02
  - url: "https://modelcontextprotocol.io/specification/2025-11-25/server/tools"
    title: "MCP Specification 2025-11-25 Tools"
    accessed: 2026-11-02
  - url: "https://modelcontextprotocol.io/specification/2026-07-28/server"
    title: "MCP Specification 2026-07-28 Server Features Overview"
    accessed: 2026-11-10
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map"
    title: "Map (MDN)"
    accessed: 2026-11-02
  - url: "https://docs.npmjs.com/cli/v10/commands/npm-exec"
    title: "npm-exec (npm Docs v10)"
    accessed: 2026-11-02
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-10
---

MCP サーバーが公開できる機能は、ツールのほかに Resources と Prompts の2つがあります（出典1）。Resources は、クライアントが URI を指定して読み取るデータです（出典2）。Prompts は、ユーザーが選んで使うメッセージのひな形を指します（出典3）。この記事で作るのは、文章のルールを返す Resource と、見直しを頼む Prompt です。

完成したサーバーに SDK のクライアントから読み取りを頼むと、結果は次の1行で返ります。

```text
read: [{"uri":"guide://glossary/prompt","mimeType":"text/plain","text":"ユーザーが選んで使う、メッセージのひな形。"}]
```

確かめた範囲は、SDK のクライアントから一覧と取得の要求を送るところまでです。Claude Code の会話で Resources と Prompts を使う操作は、この記事では実行していません。

対象は、MCP サーバーにツールを1つ作ったことがある人です。書き写すファイルは3つで、合わせて117行あります。いちばん待つのは、Inspector を初めて `npx` で動かすときです。2026-11-10 の実測では、パッケージのダウンロードを含めて12秒でした。`npm install` は3秒です。

[前の記事](/posts/mcp-inspector-debug)では、Inspector でツールを調べました。ツールの作り方は[自作の記事](/posts/mcp-server-typescript-stdio)にあります。

## Resources と Prompts は使う人がツールと違う

MCP の仕様が3つの機能を分ける基準は、「誰が使うか」です（出典1）。

| 機能 | 使う人 | 仕様に挙がっている例 |
|---|---|---|
| Tools | モデル | API への POST、ファイルの書き込み |
| Resources | アプリ | ファイルの中身、git の履歴 |
| Prompts | ユーザー | スラッシュコマンド、メニューの項目 |

ツールは、呼ぶかどうかをモデルが決めます（出典1）。Resource の場合、会話への取り込み方を決めるのはクライアントのアプリです（出典2）。仕様は、ユーザーが一覧から選ぶ画面を例に挙げています（出典2）。モデルの選択に合わせてアプリが自動で添える実装も、同じく例にあります（出典2）。Prompt は、ユーザーが自分で選んで使う前提の機能です（出典3）。

手元の資料を会話に添えたいだけなら、ツールより Resource が向いています。Claude Code なら、ユーザーが `@` で選んで添えられるからです（出典12）。Resources を一覧して読むツールも、Claude Code がモデルに自動で用意します（出典12）。モデルが自分で読むときも、読む先は同じ Resource です。2026-07-28 の仕様でも、この3つの分け方は変わっていません（出典16）。

## 前提となる環境

必要なのは、Node.js 22.18.0 以上と npm です。22.18.0 からは、型の記述を取り除いて `.ts` を実行する機能を既定で使えます（出典11）。この機能は型を検査しません（出典11）。手元では、TypeScript 7.0.2 の `tsc` でも型を確かめました。

```bash
node -v
```

```text
v22.22.0
```

この記事のコードは、Node.js 22.22.0 と npm 10.9.4 で動かしました。パッケージの版は次のとおりです。

| パッケージ | バージョン |
|---|---|
| `@modelcontextprotocol/sdk` | 1.32.2 |
| `zod` | 4.6.7 |

SDK の版は 1.32.2 で、2026-11-10 の latest です（出典10）。v1 系はメンテナンスの系列で、MCP の仕様は 2025-11-25 の版までを実装しています（出典5）。2026-07-28 の仕様に対応しているのは、現在の安定版の v2 です（出典5）。v1 系で対応する予定はありません（出典5）。

v2 は、別の名前のパッケージで出ています（出典5）。そのため、`@modelcontextprotocol/sdk` の latest は v1 系のままです（出典10）。v1 系にも、v2 のリリース（2026-07-27）から少なくとも6か月はバグとセキュリティの修正が出ます（出典5）。この記事は、講座の記事と特典サンプルで版をそろえるため、v1 系の 1.32.2 を使います。2026-07-28 の仕様の機能を使うときは、README から v2 の移行ガイドを読んでください（出典5）。

作り終えたときのファイル構成は次の形です。`node_modules/` は `npm install` が作ります。

```text
writing-helper-mcp/
  package.json
  server.ts
  check.ts
```

## 1. 準備は package.json と npm install の2つ

作業フォルダ `writing-helper-mcp` を作り、その中に移ります。

```bash
mkdir writing-helper-mcp
cd writing-helper-mcp
```

作業フォルダに置く `package.json` は次のとおりです。依存の版には `^` を付けず、記事と同じ版を入れます。

```json
{
  "name": "writing-helper-mcp",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.32.2",
    "zod": "4.6.7"
  }
}
```

`.ts` で `import` を書くには、`"type": "module"` の指定が必要です（出典11）。

ファイルを置いたら、依存を入れます。

```bash
npm install
```

```text

added 95 packages, and audited 96 packages in 3s

36 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

## 2. Resource は URI を決めて registerResource で登録する

Resource は、URI でひとつに決まるデータです（出典2）。作業フォルダに `server.ts` を置きます。登録するのは、Resource が2つと Prompt が1つです。ツールはありません。

```ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const styleGuide = "# 文章のルール\n- ですます調にそろえる\n- 1文は60字以内にする\n- 太字は使わない";

const glossary = new Map([
  ["resource", "クライアントが URI を指定して読み取るデータ。"],
  ["prompt", "ユーザーが選んで使う、メッセージのひな形。"],
  ["tool", "モデルが自分で選んで呼び出す関数。"],
]);

const server = new McpServer({ name: "writing-helper", version: "0.1.0" });

server.registerResource(
  "style-guide",
  "guide://style",
  { title: "文章のルール", description: "記事を書くときに守るルール", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "text/markdown", text: styleGuide }],
  }),
);

server.registerResource(
  "glossary-term",
  new ResourceTemplate("guide://glossary/{term}", {
    list: async () => ({
      resources: [...glossary.keys()].map((term) => ({ uri: `guide://glossary/${term}`, name: term })),
    }),
  }),
  { title: "用語の説明", mimeType: "text/plain" },
  async (uri, { term }) => {
    const text = glossary.get(String(term));
    if (text === undefined) {
      throw new McpError(-32002, "Resource not found", { uri: uri.href });
    }
    return { contents: [{ uri: uri.href, mimeType: "text/plain", text }] };
  },
);

server.registerPrompt(
  "review-text",
  {
    title: "文章をルールで見直す",
    description: "文章のルールに照らして、直す箇所を挙げてもらう",
    argsSchema: {
      text: z.string().min(1).describe("見直したい文章"),
      focus: z.string().optional().describe("特に見てほしい点"),
    },
  },
  ({ text, focus }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "resource",
          resource: { uri: "guide://style", mimeType: "text/markdown", text: styleGuide },
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `上のルールに照らして、次の文章の直す箇所を挙げてください。${focus ? `特に「${focus}」を見てください。` : ""}\n\n${text}`,
        },
      },
    ],
  }),
);

await server.connect(new StdioServerTransport());
console.error("writing-helper MCP server started (stdio)");
```

`registerResource` には、名前、URI、表示用の情報、読み取りの関数の4つを渡します（出典6）。読み取りの関数は、`contents` の配列を返します（出典2）。要素に入れるのは、`uri`、`mimeType`、本文の `text` です（出典2）。

`guide://` は、自分で決めたスキームです。仕様は、RFC 3986 に沿っていれば独自のスキームを使ってよいとしています（出典2）。仕様は、`https://` をクライアントがウェブから直接読める資料に使うよう勧めています（出典2）。サーバーが代わりにダウンロードして渡す資料も、別のスキームにしてください（出典2）。

### URI に変数がある Resource は ResourceTemplate で書く

2つ目の `guide://glossary/{term}` は、変数を含む URI テンプレートです（出典2）。SDK は、URI から取り出した `term` の値を読み取りの関数に渡します（出典6）。

`list` に渡した関数が返す URI は、`resources/list` の一覧に入ります（出典7）。`list` を `undefined` にして試すと、一覧に出たのは `guide://style` だけでした。テンプレートそのものは、`resources/templates/list` の側に出ます。Claude Code は、`@` を打つと Resources を候補に出します（出典12）。選んでほしい用語は、`list` で一覧に入れておきました。

用語の表を `Map` にしたのは、URI の変数に何が来ても表の外を引かないためです。オブジェクトは、プロトタイプから既定のキーを受け継ぎます（出典17）。表をオブジェクトにした版で `guide://glossary/constructor` を読むと、失敗しました。返った内容に `text` が無く、クライアントの検証でエラーになりました。仕様も、サーバーはすべての URI を検証するよう求めています（出典2）。

表に無い用語では、`McpError` をコード `-32002` で投げます。仕様が、Resource が見つからないときに勧めているコードです（出典2）。普通の `Error` を投げた版も試したところ、コードは `-32603`（内部エラー）でした。SDK は、投げられた値に数値の `code` が無ければ `-32603` を送ります（出典8）。

## 3. Prompt の引数は文字列で受け取る

`prompts/get` の引数は、名前と文字列の値の組で届きます（出典4）。数を受け取りたい引数も、`z.string()` で受けて関数の中で数に変換してください。

`registerPrompt` の `argsSchema` には、引数を zod で書きます（出典6）。`prompts/list` の引数の一覧は、SDK が `argsSchema` から作る仕組みです（出典7）。`.describe()` の文字列は説明に入ります。`.optional()` を付けた引数は、`required` が `false` です（出典7）。

返すのは、`role` と `content` を持つメッセージの並びです（出典3）。1つ目のメッセージには、`type: "resource"` で文章のルールを埋め込みました（出典3）。埋め込む Resource には、URI と MIME タイプが要ります（出典3）。本文は `text` か `blob` のどちらかで入れます（出典3）。

ルールの文面は、`styleGuide` の1か所にしか書いていません。Resource の `guide://style` と Prompt の両方が、同じ文字列を返します。ルールを直すときは、この1か所を書き換えれば済みます。

`prompts/get` の結果は、メッセージの並びだけです。このサーバーはモデルを呼びません。この記事の手順で API キーが要らないのは、そのためです。

## 4. SDK のクライアントで一覧と取得を確かめる

確認用のクライアントは `check.ts` の1ファイルです。`server.ts` を子プロセスとして起動し、一覧と取得の要求を順に送ります。

```ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "check-client", version: "0.0.0" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: ["server.ts"] }));

console.log("capabilities:", JSON.stringify(client.getServerCapabilities()));

const { resources } = await client.listResources();
console.log("resources:", resources.map((r) => r.uri));

const { resourceTemplates } = await client.listResourceTemplates();
console.log("templates:", resourceTemplates.map((t) => t.uriTemplate));

const term = await client.readResource({ uri: "guide://glossary/prompt" });
console.log("read:", JSON.stringify(term.contents));

const { prompts } = await client.listPrompts();
console.log("prompt args:", JSON.stringify(prompts[0].arguments));

const prompt = await client.getPrompt({
  name: "review-text",
  arguments: { text: "MCP サーバーを作った。とても便利だ。", focus: "文体" },
});
console.log("messages:", JSON.stringify(prompt.messages, null, 2));

for (const uri of ["guide://glossary/agent", "memo://today"]) {
  await client.readResource({ uri }).catch((e) => console.log("error:", e.code, e.message));
}
await client
  .getPrompt({ name: "review-text", arguments: {} })
  .catch((e) => console.log("error:", e.code, e.message));

await client.close();
```

`node` で `check.ts` をそのまま実行します。

```bash
node check.ts
```

```text
writing-helper MCP server started (stdio)
capabilities: {"prompts":{"listChanged":true},"resources":{"listChanged":true}}
resources: [
  'guide://style',
  'guide://glossary/resource',
  'guide://glossary/prompt',
  'guide://glossary/tool'
]
templates: [ 'guide://glossary/{term}' ]
read: [{"uri":"guide://glossary/prompt","mimeType":"text/plain","text":"ユーザーが選んで使う、メッセージのひな形。"}]
prompt args: [{"name":"text","description":"見直したい文章","required":true},{"name":"focus","description":"特に見てほしい点","required":false}]
messages: [
  {
    "role": "user",
    "content": {
      "type": "resource",
      "resource": {
        "uri": "guide://style",
        "mimeType": "text/markdown",
        "text": "# 文章のルール\n- ですます調にそろえる\n- 1文は60字以内にする\n- 太字は使わない"
      }
    }
  },
  {
    "role": "user",
    "content": {
      "type": "text",
      "text": "上のルールに照らして、次の文章の直す箇所を挙げてください。特に「文体」を見てください。\n\nMCP サーバーを作った。とても便利だ。"
    }
  }
]
error: -32002 MCP error -32002: MCP error -32002: Resource not found
error: -32602 MCP error -32602: MCP error -32602: Resource memo://today not found
error: -32602 MCP error -32602: MCP error -32602: Invalid arguments for prompt review-text: Invalid input: expected string, received undefined at text
```

1行目は、サーバーが stderr に書いた起動のログです。`capabilities:` の行には、`prompts` と `resources` の2つが出ました。どちらも、登録したときに SDK が自動で宣言した機能です（出典7）。ツールを1つも登録していないので、`tools` は出ていません。

`resources:` の一覧の先頭は、固定の `guide://style` です。続く3つは、`list` が返した用語の URI でした。`prompt args:` の行で、`focus` だけが `"required":false` です。`messages:` には、`server.ts` で組み立てた2つのメッセージがそのまま入っています。

### 失敗はツールと違って例外で届く

最後の3行は、失敗する要求を送った結果です。ツールの入力エラーは、`isError: true` の付いた結果で返ります（出典15）。Resources と Prompts の失敗は、JSON-RPC のエラーで返ります。`readResource` と `getPrompt` は、そのとき例外を投げました。`check.ts` の `.catch` は、この例外を受けるために付けました。

3行のうち最初の `-32002` は、`server.ts` が表に無い `agent` に対して投げたコードです。2つ目は、どのテンプレートにも合わない `memo://today` を読んだ結果でした。こちらは SDK が自分で返したエラーで、コードは `-32602` です（出典7）。

仕様が見つからないときに勧めるのは `-32002` です（出典2）。SDK 1.32.2 の返すコードは、この推奨と食い違っています。「見つからない」をコードの `-32002` だけで判定すると、2つ目の失敗を取りこぼします。見分けるときは、`message` も合わせて読んでください。

3つ目は、必須の `text` を渡さずに Prompt を取得した結果です。必須の引数が無いときは `-32602` を返す、と仕様にあります（出典3）。

どの行を見ても、`MCP error` の前置きは2回です。SDK の `McpError` は、作るときにメッセージの頭へこの前置きを足します（出典9）。サーバーが送るメッセージには前置きが入っていて、受け取ったクライアントがもう1回足すからです（出典8）。

### Inspector の CLI でも同じ要求を送れる

前の記事の MCP Inspector の CLI でも、`resources/read` を送れます（出典14）。`-y` は、パッケージのダウンロードを確かめずに進める指定です（出典18）。

```bash
npx -y @modelcontextprotocol/inspector@2.13.0 --cli node server.ts --method resources/read --uri guide://style
```

```text
writing-helper MCP server started (stdio)
{
  "contents": [
    {
      "uri": "guide://style",
      "mimeType": "text/markdown",
      "text": "# 文章のルール\n- ですます調にそろえる\n- 1文は60字以内にする\n- 太字は使わない"
    }
  ]
}
```

Prompt を取得するときは、`--method prompts/get` を使います（出典14）。名前は `--prompt-name` で、引数は `--prompt-args` で渡します（出典14）。手元で `text` だけを渡して試すと、ルールと依頼文の2つのメッセージが返りました。

## Claude Code では Resources を @ で、Prompts を / で呼び出す

Claude Code では、Resources と Prompts を会話の入力欄から使います（出典12）。登録の手順は[自作の記事](/posts/mcp-server-typescript-stdio)と同じです。この節の操作は、Claude Code で実行していません。

入力欄で `@` を打つと、Resources がファイルと並んで候補に出ます（出典12）。指定する形は `@server:protocol://resource/path` です（出典12）。登録名が `writing-helper` なら `@writing-helper:guide://style` です。参照した Resource は、会話に添付されます（出典12）。

Prompts は、`/` を打つと一覧に出ます（出典12）。表示は `/servername:promptname (MCP)` の形です（出典12）。`/mcp__servername__promptname` と打っても実行できます（出典12）。引数はコマンドの後ろに空白で区切って書きます（出典12）。

Claude Code は引数を空白で分けるので、1つの引数に空白は入れられません（出典12）。`review-text` の `text` に「MCP サーバーを作った」を渡すと、空白の位置で2つに分かれます。Claude Code から使う Prompt の引数は、空白を含まない1語で済む形にしておくのが安全です。この記事の `review-text` は、SDK のクライアントから呼ぶ前提で `text` に文章を受けています。

## 料金がかからない範囲

この記事の手順は、どれも LLM の API を呼ばないので、API の料金はかかりません。

料金が要るのは、Claude Code の会話で Resources と Prompts を使う操作です。Claude Code を使うには、有料のプランか Console のアカウントが要ります（出典13）。有料のプランは、Pro、Max、Ultra、Team、Enterprise の5つです（出典13）。この記事は、その操作をしていません。

## 機能を足す前に誰が使うかを決める

サーバーに機能を足すときは、最初に使う人を決めてください。モデルに選ばせるならツール、アプリが添える資料なら Resource、ユーザーが選ぶ依頼文なら Prompt です。あなたのサーバーのツールの中に、本当はユーザーが選ぶべきものはありますか。

[次の記事](/posts/mcp-connection-closed-fix)では、つながらない原因を切り分けます。

## 出典

確認日は、出典2、5、10、12、16 が 2026-11-10、ほかは 2026-11-02 です。本文の（出典1）などの番号は、この表の番号を指します。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | MCP Specification 2025-11-25 Server Features Overview | https://modelcontextprotocol.io/specification/2025-11-25/server | 2026-11-02 |
| 2 | MCP Specification 2025-11-25 Resources | https://modelcontextprotocol.io/specification/2025-11-25/server/resources | 2026-11-10 |
| 3 | MCP Specification 2025-11-25 Prompts | https://modelcontextprotocol.io/specification/2025-11-25/server/prompts | 2026-11-02 |
| 4 | MCP Specification 2025-11-25 Schema Reference | https://modelcontextprotocol.io/specification/2025-11-25/schema | 2026-11-02 |
| 5 | typescript-sdk v1.x README | https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x | 2026-11-10 |
| 6 | typescript-sdk v1.x docs/server.md | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md | 2026-11-02 |
| 7 | typescript-sdk v1.x src/server/mcp.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/mcp.ts | 2026-11-02 |
| 8 | typescript-sdk v1.x src/shared/protocol.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/shared/protocol.ts | 2026-11-02 |
| 9 | typescript-sdk v1.x src/types.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts | 2026-11-02 |
| 10 | @modelcontextprotocol/sdk（npm） | https://www.npmjs.com/package/@modelcontextprotocol/sdk | 2026-11-10 |
| 11 | Node.js Modules: TypeScript | https://nodejs.org/api/typescript.html | 2026-11-02 |
| 12 | Connect Claude Code to tools via MCP | https://code.claude.com/docs/en/mcp | 2026-11-10 |
| 13 | Claude Code Advanced setup | https://code.claude.com/docs/en/setup | 2026-11-02 |
| 14 | MCP Inspector CLI Client README | https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md | 2026-11-02 |
| 15 | MCP Specification 2025-11-25 Tools | https://modelcontextprotocol.io/specification/2025-11-25/server/tools | 2026-11-02 |
| 16 | MCP Specification 2026-07-28 Server Features Overview | https://modelcontextprotocol.io/specification/2026-07-28/server | 2026-11-10 |
| 17 | Map（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map | 2026-11-02 |
| 18 | npm-exec（npm Docs v10） | https://docs.npmjs.com/cli/v10/commands/npm-exec | 2026-11-02 |

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
