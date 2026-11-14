---
title: "AI エージェントに自作ツールを渡す【Agent SDK の tool() とツール呼び出しの流れ】"
slug: "ai-agent-custom-tools-agent-sdk"
description: "Claude Agent SDK の tool() と zod で、自作ツールを2つ作ります。createSdkMcpServer でまとめてエージェントに渡します。組み込みのツールを外して動かし、ツール呼び出しの往復を見ます。isError で返した失敗の届き方も、実行結果で示します。"
tags: ["AIエージェント", "Claude Agent SDK", "TypeScript", "zod"]
main_keyword: "AIエージェント"
target_query: "ai エージェント ツール 呼び出し"
course_step: 4
cost_estimate: "記事のコードは読者自身の Claude プランの利用枠から引かれます。Pro は月払いで月20ドルです。npm のパッケージは無料です。"
run_environment: "Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、zod 4.6.7、macOS arm64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-11"
prev: "rag-hybrid-search-rrf"
next: "claude-agent-sdk-first-agent"
sources:
  - url: "https://code.claude.com/docs/en/agent-sdk/custom-tools"
    title: "Give Claude custom tools"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/agent-sdk/mcp"
    title: "Connect to external tools with MCP"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/agent-sdk/agent-loop"
    title: "How the agent loop works"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/agent-sdk/typescript"
    title: "Agent SDK reference - TypeScript"
    accessed: 2026-11-11
  - url: "https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts"
    title: "@anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/authentication"
    title: "Authentication (Claude Code)"
    accessed: 2026-11-11
  - url: "https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan"
    title: "Use the Claude Agent SDK with your Claude plan"
    accessed: 2026-11-11
  - url: "https://claude.com/pricing"
    title: "Claude の料金プラン"
    accessed: 2026-11-11
  - url: "https://nodejs.org/docs/v22.23.4/api/typescript.html"
    title: "Node.js v22.23.4 Modules: TypeScript"
    accessed: 2026-11-11
  - url: "https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk"
    title: "@anthropic-ai/claude-agent-sdk（npm）"
    accessed: 2026-11-11
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-13
---

Claude Agent SDK では、自分で書いた関数をエージェントのツールにできます。`tool()` で1つずつ定義し、`createSdkMcpServer()` で束ねます（出典1）。それを `query()` に渡します（出典1）。

この記事では、商品を調べるツールと合計を計算するツールの2つを作りました。組み込みのツールを外して動かすと、モデルは自作の2つだけを4回呼び、注文の合計金額を答えました。

自分の Claude プランでログインしていれば、API キーは要りません。init メッセージの `apiKeySource` は `"none"` でした。

講座の[前の記事](/posts/rag-hybrid-search-rrf)は、RAG のハイブリッド検索です。この記事から、講座はエージェントの回に入ります。

## 自作ツールは tool() で作り、MCP サーバーにまとめて渡す

流れは3段です。どの段も、SDK の関数を1回呼ぶだけで済みます。

```text
tool("get_product", 説明, zod の入力定義, 処理)   … ツールを1つ作る
        ↓
createSdkMcpServer({ name: "shop", tools: [...] })   … 同じプロセスで動く MCP サーバーにまとめる
        ↓
query({ options: { mcpServers: { shop: ... } } })   … エージェントに渡す
        ↓
モデルから見えるツール名は mcp__shop__get_product
```

`createSdkMcpServer()` が作るのは、同じプロセスの中で動く MCP サーバーです（出典5）。別のプロセスを立てる必要はありません。

ツールの名前は `mcp__` とサーバーの名前とツールの名前をつないだ形になります（出典2）。権限の設定には、この長い名前を書きます。

## 動かすのに要る Node.js、プラン、ログイン

用意するのは Node.js、Claude のプラン、そのプランでログインした Claude Code の3つです。

- Node.js 22.18.0 以上。この版から、`.ts` のファイルを `node` でそのまま動かせます（出典9）。検証は 22.23.4 で行いました。
- Claude の Pro、Max、Ultra のどれか（出典6）。Pro は月払いで月20ドルです（出典8）。
- `claude auth login` でプランのアカウントにログインした Claude Code（出典6）

環境変数 `ANTHROPIC_API_KEY` は、プランのログインより先に使われます（出典6）。プランで試すなら、先に外れていることを確かめます。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

`set` と出たら、`unset ANTHROPIC_API_KEY` で外してから進めてください（出典6）。

プランでログインして Agent SDK を使うと、プランの利用枠から引かれます（出典7）。

## npm install で SDK と zod を入れる

入れるのは SDK と zod の2つです。記事と同じ版で試せるよう、`--save-exact` で版を固定します。

```bash
mkdir custom-tools
cd custom-tools
npm init -y
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 zod@4.6.7
```

```text

added 3 packages, and audited 4 packages in 37s

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

0.3.322 は、2026-11-11 の時点で npm の最新版です（出典10）。SDK の peer dependency は zod `^4.0.0`、つまり 4.x です（出典10）。`npm view` の出力は `run/13.log` に残しました。型定義のコメントは Zod 3 と Zod 4 の両方に対応すると書きます（出典5）。この記事は 4.6.7 で動かしました。

```bash
npm pkg get type dependencies
```

```text
{
  "type": "module",
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "0.3.322",
    "zod": "4.6.7"
  }
}
```

## zod の入力定義と処理を tool() にまとめる

コードは `shop-agent.ts` の1ファイルです。保存先は、上で作った `custom-tools` フォルダです。前半でツールを2つ作り、後半でエージェントを動かします。

```ts
import { createSdkMcpServer, query, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const products: Record<string, { price: number; stock: number }> = {
  ノート: { price: 180, stock: 12 },
  ボールペン: { price: 120, stock: 2 },
};

const getProduct = tool(
  "get_product",
  "商品名から、税抜きの単価と在庫数を調べる",
  { name: z.string().describe("商品名。例: ノート") },
  async ({ name }) => {
    const product = products[name];
    if (!product) {
      return {
        content: [
          {
            type: "text",
            text: `「${name}」は取り扱っていません。扱っている商品: ${Object.keys(products).join("、")}`,
          },
        ],
        isError: true,
      };
    }
    return { content: [{ type: "text", text: JSON.stringify({ name, ...product }) }] };
  },
);

const calculateTotal = tool(
  "calculate_total",
  "単価と数量の一覧から、税込み（10%）の合計金額を計算する",
  {
    lines: z.array(
      z.object({ unitPrice: z.number().int(), quantity: z.number().int().positive() }),
    ),
  },
  async ({ lines }) => {
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const total = Math.floor(subtotal * 1.1);
    return { content: [{ type: "text", text: JSON.stringify({ subtotal, total }) }] };
  },
);

const shopServer = createSdkMcpServer({
  name: "shop",
  version: "1.0.0",
  tools: [getProduct, calculateTotal],
});

for await (const message of query({
  prompt:
    "ノートを2冊、ボールペンを3本、消しゴムを1個買いたいです。在庫を確かめて、買える分だけの税込みの合計金額を、表や太字を使わずに3文以内で答えてください。",
  options: {
    model: "haiku",
    mcpServers: { shop: shopServer },
    strictMcpConfig: true,
    tools: [],
    allowedTools: ["mcp__shop__get_product", "mcp__shop__calculate_total"],
    permissionMode: "dontAsk",
    maxTurns: 10,
    settingSources: [],
  },
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(`[system/init] apiKeySource=${message.apiKeySource} tools=${message.tools.join(",")}`);
  } else if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "text") console.log(`[assistant/text] ${block.text}`);
      if (block.type === "tool_use") {
        console.log(`[assistant/tool_use] ${block.name} ${JSON.stringify(block.input)}`);
      }
    }
  } else if (message.type === "user" && Array.isArray(message.message.content)) {
    for (const block of message.message.content) {
      if (block.type === "tool_result") {
        console.log(`[user/tool_result] is_error=${block.is_error ?? false} ${JSON.stringify(block.content)}`);
      }
    }
  } else if (message.type === "result") {
    console.log(`[result/${message.subtype}] num_turns=${message.num_turns}`);
  }
}
```

`tool()` には、名前、説明、入力の定義、処理の4つを順に渡します（出典1）。

- 名前と説明は、モデルがツールを選ぶときに読みます。
- 入力の定義は、`z.object()` で包まずに、項目名と zod の型を並べたオブジェクトで書きます（出典5）。
- `.describe()` を付けると、その項目の説明もモデルに届きます（出典1）。
- 処理の引数 `{ name }` には、入力の定義から推論された型が付きます（出典5）。

処理が返すのは、`content` に結果のブロックを並べたオブジェクトです（出典1）。`get_product` は、商品の情報を JSON の文字列にして1つの `text` ブロックで返しています。

zod の定義は、SDK が JSON Schema に変換してモデルに渡します。JSON Schema に変換できない定義を持つツールは、警告を出してツールの一覧から外されます（出典5）。zod のスキーマから JSON Schema を作る方法は、講座の構造化出力の回にあります。[zod の記事](/posts/zod-to-json-schema-tool-definition)で扱いました。

### 処理の失敗は isError: true で返す

`get_product` は、扱っていない商品名を受け取ると `isError: true` を付けて返します。`isError` は、ツールの呼び出しが失敗したことをモデルに伝える印です（出典1）。

処理の中で例外を投げても、エージェントのループは止まりません（出典1）。SDK の MCP サーバーが例外を受け止めて、例外のメッセージをそのままエラーの結果にします（出典1）。

自分で `isError` を返す利点は、モデルが読む文面を選べることです（出典1）。この記事では、扱っている商品の一覧も添えました。モデルが別の名前で調べ直すか、買えないと答えるかを決める材料になります。

## tools: [] と allowedTools で、使えるツールを自作の2つに絞る

`query()` のオプションは、見せるツールと、確認なしで動かしてよいツールを分けて決めます。

| オプション | この記事の値 | 決めること |
|---|---|---|
| `mcpServers` | `{ shop: shopServer }` | 渡す MCP サーバー。キーの `shop` がツール名に入る（出典2） |
| `strictMcpConfig` | `true` | `mcpServers` で渡したサーバーだけを使う（出典4） |
| `tools` | `[]` | 組み込みのツールをすべて外す（出典1） |
| `allowedTools` | 自作の2つの完全な名前 | 確認なしで実行してよいツール（出典1） |
| `permissionMode` | `"dontAsk"` | 確認が要る呼び出しはすべて断る（出典3） |

`tools` は、モデルに見せる組み込みのツールを決めます。`[]` にすると組み込みのツールは1つも残らず、モデルは MCP のツールしか使えません（出典1）。

`allowedTools` は、見せたツールのうち、確認なしで実行してよいものの一覧です（出典1）。ここで外したツールは使えるようにはならず、権限の確認に回ります。`dontAsk` と組み合わせると、その確認は断る扱いになります（出典3）。

`strictMcpConfig: true` を付けると、ほかの場所の MCP サーバーを読みません（出典4）。読まなくなるのは、`.mcp.json`、ユーザーの設定、プラグイン、claude.ai のコネクタです（出典4）。手元に入れた MCP サーバーのツールが、このエージェントに混ざらなくなります。

`settingSources: []` は、手元の設定ファイルと CLAUDE.md を読まない指定です（出典5）。`maxTurns: 10` はループが止まらないときの上限として入れました。

## 実行すると tool_use と tool_result が4往復する

ノート2冊、ボールペン3本、消しゴム1個の注文を頼みました。ボールペンは在庫が2本しかなく、消しゴムは扱っていない設定です。

```bash
node shop-agent.ts
```

```text
[system/init] apiKeySource=none tools=mcp__shop__calculate_total,mcp__shop__get_product
[assistant/tool_use] mcp__shop__get_product {"name":"ノート"}
[user/tool_result] is_error=false [{"type":"text","text":"{\"name\":\"ノート\",\"price\":180,\"stock\":12}"}]
[assistant/tool_use] mcp__shop__get_product {"name":"ボールペン"}
[user/tool_result] is_error=false [{"type":"text","text":"{\"name\":\"ボールペン\",\"price\":120,\"stock\":2}"}]
[assistant/tool_use] mcp__shop__get_product {"name":"消しゴム"}
[user/tool_result] is_error=true "「消しゴム」は取り扱っていません。扱っている商品: ノート、ボールペン"
[assistant/tool_use] mcp__shop__calculate_total {"lines":[{"unitPrice":180,"quantity":2},{"unitPrice":120,"quantity":2}]}
[user/tool_result] is_error=false [{"type":"text","text":"{\"subtotal\":600,\"total\":660}"}]
[assistant/text] ノートは2冊とも在庫があり、ボールペンは在庫が2本のため3本のうち2本だけ買えます。消しゴムは取り扱いがないため買えません。買える分(ノート2冊とボールペン2本)の税込み合計は660円です。
[result/success] num_turns=5
```

モデルは `get_product` を3回呼び、そのあと `calculate_total` を1回呼びました。呼ぶたびに、`tool_use` を載せた `assistant` が届きます（出典3）。続いて、`tool_result` を載せた `user` が届きます（出典3）。

答えの660円は、ノート2冊の360円とボールペン2本の240円を足した600円に、10%を加えた額です。在庫の2本に合わせて数量を減らしたのはモデルの判断で、`calculate_total` には2本で渡しています。

### 失敗した呼び出しは is_error=true で届く

消しゴムの行だけ、`tool_result` の `is_error` が `true` でした。処理で付けた `isError: true` は、届いたブロックでは `is_error` という名前です。

文面は、処理で書いた「扱っている商品」の一覧そのままです。モデルはこれを読んで、消しゴムを買えないものとして答えに書きました。成功した呼び出しの `content` は配列でしたが、この失敗の行は文字列で届いています。結果を読むコードでは、両方の形を受けられるようにしておきます。

### 2回目も、呼ぶ順番と回数は同じだった

同じコードをもう一度動かすと、ツールを呼ぶ順番、引数、回数は1回目と同じでした。最後の文の言い回しだけが変わり、660円という金額は同じです。

どのツールをどの引数で呼ぶかは、毎回モデルが決めます。2回そろったのは、この注文が単純だったからと考えています。テストで確かめるなら、文面ではなく `calculate_total` に渡った数量と、返った合計を比べます。

## ツール名は mcp__shop__get_product の形になる

MCP のツールの名前は `mcp__<サーバー名>__<ツール名>` です（出典2）。サーバー名は、`mcpServers` に書いたキーです（出典2）。

この記事では、キーが `shop`、ツール名が `get_product` です。完全な名前は `mcp__shop__get_product` になりました。init メッセージの `tools` にも、この形で2つ並んでいます。

`allowedTools` に書くのも、この完全な名前です（出典1）。`get_product` だけを書いても、自作ツールの許可にはなりません。

サーバーのツールをまとめて許可するなら、`mcp__shop__*` のように `*` を使えます（出典1）。キーに `.` か空白が入ると、ツール名の中では `_` に置き換わります（出典1）。`my.server` というキーなら、ツール名は `mcp__my_server__` で始まります（出典2）。

## tools: [] を外すと、組み込みのツールが25個並んだ

`tools: []` で何が変わるかを見るため、その1行だけを消して同じ注文を頼みました。init の `tools` には、自作の2つの前に、組み込みのツールが25個並びました。Bash、Read、Write、WebFetch などです。

ToolSearch も、組み込みのツールの1つです。`tools: []` で組み込みを全部外すと呼べなくなり、自作の2つの定義は最初から渡ります。外さなかった1回の実行（`run/08.log`）では、最初に ToolSearch が呼ばれました。自作の2つの定義は、これで読み込まれました。`get_product` を呼んだのは、そのあとです。MCP のツールの定義を最初からは渡さず、要るときに読み込む仕組みは、既定で有効です（出典2）。この実行では、そのぶん1ターン増え、`num_turns` は5から6になりました。5だったのは、`tools: []` を付けた2回（`run/06.log`、`run/07.log`）です。

この実行で呼ばれた組み込みのツールは ToolSearch だけです。`allowedTools` に入れていないのに、断られず結果が返りました。Bash や Write のような確認が要るツールは、`dontAsk` なら断られる設定です。この実行では呼ばれず、断られる場面は見ていません。使わないツールの定義がモデルに渡ることは変わりません。この注文では、`tools: []` で外したほうが1ターン少なく済みました。自作ツールだけで足りる仕事なら、組み込みのツールは外しておきます。

`strictMcpConfig` が無い試作の1回目では、コネクタのツールが756個並びました。あとで `strictMcpConfig` の行を消した版を4回動かしました。ほかの MCP のツールは、4回とも0個でした。ログは `run/09.log` と `run/12.log` です。5回中1回だけ並んだ原因は確かめていません。並ぶ可能性があるので、`strictMcpConfig: true` で最初から外しました。

## 料金はプランの利用枠から引かれる

プランでログインして動かした分は、プランの利用枠から引かれます（出典7）。この記事のコードを1回動かすと、`result` の `num_turns` は5でした。

npm のパッケージは無料で、ツールの処理も手元の計算だけです。外部の API には通信しません。

## 自作ツールを渡すときに決めること

コードで書いたのは、ツールの名前と説明、入力の定義、処理、失敗の返し方でした。呼ぶかどうかと呼ぶ順番は、モデルが決めています。

残る判断は、処理の中で何を許すかです。この記事のツールは、読むか計算するかだけで、外の状態を変えません。

あなたのエージェントでは、失敗した呼び出しのあとにモデルへ何を伝えますか。

## 出典

本文の（出典n）は、この表の番号です。確認日は、どれもページを読んだ日です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Give Claude custom tools | https://code.claude.com/docs/en/agent-sdk/custom-tools | 2026-11-11 |
| 2 | Connect to external tools with MCP | https://code.claude.com/docs/en/agent-sdk/mcp | 2026-11-11 |
| 3 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | 2026-11-11 |
| 4 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | 2026-11-11 |
| 5 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-11 |
| 6 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-11 |
| 7 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-11 |
| 8 | Claude の料金プラン | https://claude.com/pricing | 2026-11-11 |
| 9 | Node.js v22.23.4 Modules: TypeScript | https://nodejs.org/docs/v22.23.4/api/typescript.html | 2026-11-11 |
| 10 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-11 |

AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。
