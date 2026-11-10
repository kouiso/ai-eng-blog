---
title: "MCP Inspector で MCP サーバーを調べる【ツール一覧と呼び出しを画面と CLI で】"
slug: "mcp-inspector-debug"
description: "MCP Inspector 2.13.0 の CLI と画面で、自作の MCP サーバーのツールを調べます。数字だけの引数が数値で送られる落とし穴と、終了コードの読み方も実行結果付きで書いています。"
tags: ["MCPサーバー", "MCP Inspector", "TypeScript"]
main_keyword: "MCPサーバー"
target_query: null
course_step: 5
cost_estimate: "記事の手順は LLM の API を呼ばないので無料です。Claude にツールを呼ばせるには、Claude Code を使える有料のプランか Console のアカウントが要ります。"
run_environment: "Node.js 22.22.0、npm 10.9.4、MCP Inspector 2.13.0、SDK 1.32.2、zod 4.6.7、Linux x86_64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-02"
prev: "mcp-server-streamable-http"
next: "mcp-server-resources-prompts"
sources:
  - url: "https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector"
    title: "MCP Inspector (Model Context Protocol Documentation)"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/inspector"
    title: "modelcontextprotocol/inspector README"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md"
    title: "MCP Inspector CLI Client README"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/inspector/blob/main/docs/v1-to-v2-migration.md"
    title: "Migrating from Inspector v1 to v2"
    accessed: 2026-11-02
  - url: "https://github.com/modelcontextprotocol/inspector/blob/main/docs/environment-variables.md"
    title: "MCP Inspector Environment variables"
    accessed: 2026-11-02
  - url: "https://www.npmjs.com/package/@modelcontextprotocol/inspector"
    title: "@modelcontextprotocol/inspector (npm)"
    accessed: 2026-11-02
  - url: "https://docs.npmjs.com/cli/v10/commands/npm-exec"
    title: "npm-exec (npm Docs v10)"
    accessed: 2026-11-02
  - url: "https://nodejs.org/api/typescript.html"
    title: "Node.js Modules: TypeScript"
    accessed: 2026-11-02
  - url: "https://modelcontextprotocol.io/specification/2025-11-25/server/tools"
    title: "MCP Specification 2025-11-25 Tools"
    accessed: 2026-11-02
  - url: "https://www.npmjs.com/package/@modelcontextprotocol/sdk"
    title: "@modelcontextprotocol/sdk (npm)"
    accessed: 2026-11-02
  - url: "https://code.claude.com/docs/en/setup"
    title: "Claude Code Advanced setup"
    accessed: 2026-11-02
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-02
---

MCP Inspector は、LLM を通さずに MCP サーバーのツールを呼べる公式の開発ツールです（出典1）。CLI モードなら、ツールの一覧も呼び出しの結果も、1行のコマンドで JSON として返ります。成否を表すのは終了コードです（出典3）。この記事では、2.13.0 の CLI と画面の両方で、文字数を数えるツールを持つサーバーを調べます。

CLI で `--tool-arg text=2026` と書くと、`2026` は数値として送られます。文字列を受け取るツールは、入力のエラーを返しました。手元で引っかかったこの落とし穴の直し方も、実行結果付きで書いています。

確かめた範囲は、Linux の端末で CLI のコマンドを打つところと、画面をブラウザで操作するところまでです。画面の操作には、ヘッドレスの Chromium と Playwright を使いました。

対象は、MCP サーバーを TypeScript で書き始めた人です。書き写すファイルは2つで、合わせて40行あります。いちばん待つのは `npm install` で、2026-11-02 の実測では13秒でした。

講座の[前の記事](/posts/mcp-server-streamable-http)は、HTTP で動かす回です。この記事では、stdio 方式のサーバーを調べます。サーバーの作り方は、[自作の記事](/posts/mcp-server-typescript-stdio)に書きました。

## MCP Inspector は MCP サーバーを直接呼ぶ公式の開発ツール

MCP Inspector は、MCP サーバーのテストとデバッグに使う公式のツールです（出典1）。パッケージは `@modelcontextprotocol/inspector` の1つです（出典2）。使い方は、次の4つに分かれます（出典2）。

- Web は、ブラウザで開く画面です。何も付けずに起動したときの既定です。
- CLI は、`--cli` を付けて1回呼んで終わるコマンドです。
- TUI は、`--tui` を付けて端末の中で操作する画面です。
- mcpdo は、1度つないだ接続に続けてコマンドを送る試験的なコマンドです。

この記事で使うのは CLI と Web の2つで、覚える順番は CLI が先です。結果がテキストで残り、サーバーを直すたびに同じコマンドを打ち直せるからです。画面は、やり取りのメッセージを目で追いたいときに開きます。

### v2 では 6277 番のプロキシが無くなった

Inspector の v2.0.0 は、2026-07-28 に npm で公開されました（出典6）。v1 は画面を 6274 番で、MCP のプロキシを 6277 番で動かしていました（出典4）。v2 が動かす Web のサーバーは、6274 番の1つです（出典4）。6277 番のポートか `MCP_PROXY_AUTH_TOKEN` が出てくる説明は、v1 のものです（出典4）。

v1 はセキュリティの修正だけを受ける系列で、`@v1-latest` で入れられます（出典2）。2026-11-02 に `npm view` で確かめた latest は 2.13.0 でした（出典6）。

## 前提となる環境

必要なのは、Node.js 22.19.0 以上と npm です（出典4）。npm は Node.js の版が合わないときに警告を出しますが、インストールは止めません（出典4）。先に版を見ておきます。

```bash
node -v
```

```text
v22.22.0
```

この記事のコードは、Node.js 22.22.0 と npm 10.9.4 で動かしました。SDK は、2026-11-02 の latest の 1.32.2 です（出典10）。パッケージの版は次のとおりです。

| パッケージ | バージョン |
|---|---|
| `@modelcontextprotocol/inspector`（開発用） | 2.13.0 |
| `@modelcontextprotocol/sdk` | 1.32.2 |
| `zod` | 4.6.7 |

`server.ts` は、TypeScript のまま `node` で実行します。Node.js は 22.18.0 から、型の記述を取り除いて `.ts` を実行する機能が既定で有効です（出典8）。この機能は型を検査しません（出典8）。そのため手元では、TypeScript 7.0.2 の `tsc` でも型を確かめました。

作り終えたときのファイル構成は、次の形です。`node_modules/` は `npm install` が作ります。

```text
inspector-demo/
  package.json
  server.ts
```

## 1. 調べるサーバーは server.ts の1ファイル

作業フォルダ `inspector-demo` を作り、その中に移ります。

```bash
mkdir inspector-demo
cd inspector-demo
```

作業フォルダに置く `package.json` は次のとおりです。依存の版には `^` を付けず、記事と同じ版を入れます。

```json
{
  "name": "inspector-demo",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.32.2",
    "zod": "4.6.7"
  },
  "devDependencies": {
    "@modelcontextprotocol/inspector": "2.13.0"
  }
}
```

Inspector も `devDependencies` に入れました。`npx` は、プロジェクトの依存に入っているパッケージを使います（出典7）。依存に無いときは、npm のキャッシュにダウンロードしてから実行します（出典7）。版を固定したのは、記事と同じ版の Inspector で動かすためです。

同じフォルダに `server.ts` を置きます。公開するツールは、文章の文字数と行数を返す `count_chars` の1つです。

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "char-count", version: "0.1.0" });

server.registerTool(
  "count_chars",
  {
    title: "文字数を数える",
    description: "文章の文字数（見た目の1文字を1と数える）と行数を返す。",
    inputSchema: {
      text: z.string().min(1).max(10_000).describe("数えたい文章"),
    },
  },
  async ({ text }) => {
    const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
    const chars = [...segmenter.segment(text)].length;
    const lines = text.split("\n").length;
    return {
      content: [{ type: "text", text: `文字数: ${chars} / 行数: ${lines}` }],
    };
  },
);

await server.connect(new StdioServerTransport());
console.error("char-count MCP server started (stdio)");
```

`registerTool` の書き方と文字数の数え方は、上で挙げた自作の記事と同じです。最後の行は、起動のログを stderr に書いています。この行が Inspector のどこに出るかは、手順2で確かめました。

ファイルを置いたら、依存を入れます。

```bash
npm install
```

```text

added 197 packages, and audited 198 packages in 13s

85 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

入った Inspector の版を確かめます。

```bash
npx @modelcontextprotocol/inspector --version
```

```text
2.13.0
```

2.13.0 と出れば、`npx` が起動したのは `node_modules` の Inspector です。

## 2. tools/list でクライアントに渡るツールの定義が見える

CLI では、`--cli` のあとにサーバーを起動するコマンドを書きます（出典3）。呼ぶメソッドは `--method` で選びます（出典3）。モードのフラグ `--cli` は、パッケージ名の直後に書いてください（出典1）。

```bash
npx @modelcontextprotocol/inspector --cli node server.ts --method tools/list
```

```text
char-count MCP server started (stdio)
{
  "tools": [
    {
      "name": "count_chars",
      "title": "文字数を数える",
      "description": "文章の文字数（見た目の1文字を1と数える）と行数を返す。",
      "inputSchema": {
        "type": "object",
        "properties": {
          "text": {
            "type": "string",
            "minLength": 1,
            "maxLength": 10000,
            "description": "数えたい文章"
          }
        },
        "required": [
          "text"
        ],
        "$schema": "http://json-schema.org/draft-07/schema#"
      },
      "execution": {
        "taskSupport": "forbidden"
      }
    }
  ]
}
```

1行目は、サーバーが stderr に書いた起動のログです。CLI は、stdio のサーバーが stderr に書いた行をそのまま表示します（出典3）。この行が消えるのは、`--quiet` を付けたときだけです（出典3）。

その下の JSON が、`tools/list` への応答です。クライアントは `tools/list` を送って、サーバーのツールを知ります（出典9）。Claude Code のようなクライアントが受け取るツールの定義も、この形です（出典9）。

zod で書いた制約は、JSON Schema の言葉に置き換わっていました。`.min(1)` は `minLength: 1` になりました。`.max(10_000)` は `maxLength: 10000` です。`.describe()` の文字列は `description` に入りました。説明の書き漏れと制約の付け忘れは、この出力を読めば見つかります。

`--method` は省けません。省くと `Method is required.` のエラーで終わり、終了コードは1でした。

## 3. tools/call の引数は --tool-arg で渡す

ツールを呼ぶときは、`--method tools/call` と `--tool-name` を付けます（出典3）。引数は `--tool-arg キー=値` の形で渡します（出典3）。

```bash
npx @modelcontextprotocol/inspector --cli node server.ts --method tools/call --tool-name count_chars --tool-arg text=MCPサーバー
```

```text
char-count MCP server started (stdio)
{
  "content": [
    {
      "type": "text",
      "text": "文字数: 7 / 行数: 1"
    }
  ]
}
```

`MCPサーバー` は7文字なので、結果は正しい値です。

### 数字だけの文字列は --tool-args-json で渡す

年の `2026` を数えさせると、ツールはエラーを返しました。2行目の `echo $?` は、直前のコマンドの終了コードを表示します。

```bash
npx @modelcontextprotocol/inspector --cli node server.ts --method tools/call --tool-name count_chars --tool-arg text=2026
echo $?
```

```text
char-count MCP server started (stdio)
{
  "content": [
    {
      "type": "text",
      "text": "MCP error -32602: Input validation error: Invalid arguments for tool count_chars: Invalid input: expected string, received number at text"
    }
  ],
  "isError": true
}
{"error":{"code":"tool_is_error","message":"Tool 'count_chars' returned isError:true."}}
5
```

`--tool-arg` の値は、JSON として読んでから送る決まりです（出典3）。`count=1` が数値になる例が、CLI の README にあります（出典3）。`2026` も数値として送られ、`z.string()` の検証を通りませんでした。

エラーは例外にならず、`isError: true` の付いた結果で返っています。入力の検証エラーをこの形で返すのは、MCP の仕様どおりです（出典9）。最後の2行には、CLI が足した1行の JSON と、終了コードの5が出ました。

直し方は、`--tool-args-json` で引数を JSON のまま渡すことです。この形の値は書いたまま届き、`"012"` も文字列のままです（出典3）。

```bash
npx @modelcontextprotocol/inspector --cli node server.ts --method tools/call --tool-name count_chars --tool-args-json '{"text":"2026"}'
```

```text
char-count MCP server started (stdio)
{
  "content": [
    {
      "type": "text",
      "text": "文字数: 4 / 行数: 1"
    }
  ]
}
```

今度は4文字と返りました。文字列の引数を CLI で渡すときは、最初から `--tool-args-json` を使うことにしています。サーバーの不具合と、CLI での渡し方の誤りを取り違えずに済むからです。

## 4. 終了コードを見れば失敗の種類がわかる

v2 の CLI は、失敗の種類ごとに決まった終了コードで終わります（出典3）。v1 の終了コードは0と1の2つだけでした（出典4）。この記事に関係するのは、次の5つです（出典3）。

| 終了コード | 意味 |
|---|---|
| 0 | 成功 |
| 1 | 使い方の誤りか、予期しないエラー |
| 3 | サーバーが認証を求めた |
| 4 | サーバーに届かない（名前を引けない、接続を拒まれた、時間切れ） |
| 5 | ツールが `isError: true` を返したか、ツールが見つからない |

失敗したときは、標準エラーに1行の JSON も出ます（出典3）。その `code` が、失敗の種類を表す決まった名前です（出典3）。

ツールの名前を1文字間違えて呼んでみました。

```bash
npx @modelcontextprotocol/inspector --cli node server.ts --method tools/call --tool-name count_char --tool-arg text=MCP
echo $?
```

```text
char-count MCP server started (stdio)
{"error":{"code":"tool_not_found","message":"Tool 'count_char' not found on server."}}
5
```

`code` は `tool_not_found` で、終了コードは5でした。入力のエラーと同じ5なので、見分けるときは `code` を読みます。

サーバーのファイル名を間違えたときの出力も載せます。出力の中のパスは `/path/to` に置き換えました。

```bash
npx @modelcontextprotocol/inspector --cli node servr.ts --method tools/list
echo $?
```

```text
node:internal/modules/cjs/loader:1386
  throw err;
  ^

Error: Cannot find module '/path/to/inspector-demo/servr.ts'
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
{"error":{"code":"error","message":"Connection closed"}}
1
```

最後の JSON にあるのは `Connection closed` の一言で、終了コードは1です。原因は、その上にある Node.js のエラー `Cannot find module` のほうに書かれています。終了コードが1で終わったら、JSON の行より上を読んでください。ほかの原因は[つながらないときの記事](/posts/mcp-connection-closed-fix)で扱います。

## 5. 画面で調べるときは --cli を外して起動する

`--cli` を付けずに起動すると、Web の画面が開きます（出典1）。サーバーのコマンドを後ろに書くところは、CLI と同じです。

```bash
npx @modelcontextprotocol/inspector node server.ts
```

手元の出力は次のとおりです。ホームフォルダのパスは `~` に、トークンは `***` に置き換えました。

```text
Starting MCP inspector...

[mcp-inspector] The OS keychain is not available, so secrets will be kept in: File (unencrypted) at ~/.mcp-inspector/secrets.json — fell back from the OS keychain.
[mcp-inspector] Keychain error: zbus error: Failed to connect to address `unix:path=/run/user/0/bus`: No such file or directory (os error 2)
[mcp-inspector] Set MCP_INSPECTOR_SECRET_STORE=keyring|file|memory to choose explicitly.
[mcp-inspector] Secrets are stored unencrypted (file mode 0600). Set MCP_INSPECTOR_SECRET_KEY or MCP_INSPECTOR_SECRET_KEY_FILE to encrypt them.
[mcp-inspector] How the secret store is chosen, and how to secure it: https://github.com/modelcontextprotocol/inspector/blob/main/docs/secret-storage.md

MCP Inspector Web is up and running at:
   http://127.0.0.1:6274?MCP_INSPECTOR_API_TOKEN=***

   Sandbox (MCP Apps): http://127.0.0.1:6275/sandbox

   Auth token: ***

   Secrets: File (unencrypted) at ~/.mcp-inspector/secrets.json — fell back from the OS keychain

Opening browser...
```

`[mcp-inspector]` で始まる5行は、OS のキーチェーンが無い環境でだけ出る警告です。Inspector は、サーバーに渡す環境変数の値と OAuth のトークンを秘密情報として保存します（出典2）。保存先は OS のキーチェーンです（出典2）。無ければ、`~/.mcp-inspector/secrets.json` に暗号化せずに書きます（出典2）。API キーを環境変数で渡すサーバーを調べるときは、この保存先を知っておいてください。

URL には、起動のたびに作られるトークンが付いています（出典1）。Inspector はこの URL をブラウザで開きます（出典1）。開かなかったときは、表示された URL を自分で開いてください。画面のサーバーは、既定で `127.0.0.1` の 6274 番で待ち受けます（出典5）。

手元の環境には画面が無いので、表示された URL をヘッドレスの Chromium で開きました。次の4つを順に操作すると、ツールの結果が画面に出ます。ボタンの名前は、そのとき画面に出ていたものです。

1. `node` のスイッチを入れると、表示が `Connected` に変わります。
2. 上に出る `Tools` を選び、一覧の `count_chars` を押してください。
3. `text` の欄に `2026` と入れて、`Execute Tool` を押します。
4. `Results` の欄に出る結果は、`文字数: 4 / 行数: 1` です。

画面の入力欄は、`2026` を文字列のまま送りました。CLI の `--tool-arg` で同じ値を渡したときとは、結果が違います。

画面の右側には、やり取りの記録が出ます。`Protocol` の欄には、送ったメッセージが時刻とかかった時間付きで並びました。並んだのは `initialize`、`tools/list`、`tools/call` などです。サーバーの stderr の行は、`Console` に切り替えると出ていました。

画面の上には `Read-only session` の表示も出ます。コマンドでサーバーを渡して起動すると、画面ではサーバーの一覧を編集できず、変更も保存されません。止めるときは、起動した端末で Ctrl+C を押します。

## 料金がかからない範囲

この記事の手順は、どれも LLM の API を呼ばないので、API の料金はかかりません。Inspector はオープンソースで、ライセンスは Apache-2.0 と MIT です（出典2）。

料金が要るのは、調べたサーバーを Claude Code に登録し、会話で Claude にツールを呼ばせる操作です。Claude Code を使うには、有料のプランか Console のアカウントが要ります（出典11）。有料のプランは、Pro、Max、Ultra、Team、Enterprise の5つです（出典11）。この記事は、その操作をしていません。

## Claude Code につなぐ前に Inspector で確かめる

直したサーバーは、Claude Code に登録し直す前に CLI で1回呼んでください。終了コードが0で、結果の JSON が思ったとおりなら、サーバーの側の確認は済みです。あなたのサーバーのツールに、数字だけの文字列を受け取る引数はいくつありますか。

講座の次の記事では、ツール以外の機能である Resources と Prompts を公開します。`resources/list` と `prompts/list` も、CLI で呼べます（出典3）。[次の記事](/posts/mcp-server-resources-prompts)でも、この手順を使ってください。

## 出典

確認日は、どれも 2026-11-02 です。本文の（出典1）などの番号は、この表の番号を指します。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | MCP Inspector（Model Context Protocol のドキュメント） | https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector | 2026-11-02 |
| 2 | modelcontextprotocol/inspector README | https://github.com/modelcontextprotocol/inspector | 2026-11-02 |
| 3 | MCP Inspector CLI Client README | https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md | 2026-11-02 |
| 4 | Migrating from Inspector v1 to v2 | https://github.com/modelcontextprotocol/inspector/blob/main/docs/v1-to-v2-migration.md | 2026-11-02 |
| 5 | MCP Inspector Environment variables | https://github.com/modelcontextprotocol/inspector/blob/main/docs/environment-variables.md | 2026-11-02 |
| 6 | @modelcontextprotocol/inspector（npm） | https://www.npmjs.com/package/@modelcontextprotocol/inspector | 2026-11-02 |
| 7 | npm-exec（npm Docs v10） | https://docs.npmjs.com/cli/v10/commands/npm-exec | 2026-11-02 |
| 8 | Node.js Modules: TypeScript | https://nodejs.org/api/typescript.html | 2026-11-02 |
| 9 | MCP Specification 2025-11-25 Tools | https://modelcontextprotocol.io/specification/2025-11-25/server/tools | 2026-11-02 |
| 10 | @modelcontextprotocol/sdk（npm） | https://www.npmjs.com/package/@modelcontextprotocol/sdk | 2026-11-02 |
| 11 | Claude Code Advanced setup | https://code.claude.com/docs/en/setup | 2026-11-02 |

AI 支援で執筆しました。コードは 2026-11-02 に実際に実行して確認しています。
