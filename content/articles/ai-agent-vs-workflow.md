---
title: "AI エージェントとワークフローの違い【決まった手順なら LLM を順に呼ぶだけでいい】"
slug: "ai-agent-vs-workflow"
description: "AI エージェントとワークフローの違いは、次の手順を LLM が決めるか、コードが決めるかです。Claude Agent SDK で同じ仕分けを2通りに書いて動かし、呼び出し回数、時間、止め方を実測で比べます。"
tags: ["AIエージェント", "Claude Agent SDK", "TypeScript"]
main_keyword: "AIエージェント"
target_query: null
course_step: 4
cost_estimate: "記事のコードは読者自身の Claude プランの利用枠から引かれます。Pro は月払いで月20ドルです。SDK が出す total_cost_usd は見積もりで、請求額とは別の数字です。"
run_environment: "Node.js 22.22.0、npm 10.9.4、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、Linux x86_64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-10"
prev: "ai-agent-safe-file-tool"
next: "mcp-server-typescript-stdio"
sources:
  - url: "https://www.anthropic.com/engineering/building-effective-agents"
    title: "Building effective agents"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/agent-sdk/agent-loop"
    title: "How the agent loop works"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/agent-sdk/typescript"
    title: "Agent SDK reference - TypeScript"
    accessed: 2026-11-10
  - url: "https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts"
    title: "@anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts"
    accessed: 2026-11-10
  - url: "https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan"
    title: "Use the Claude Agent SDK with your Claude plan"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/legal-and-compliance"
    title: "Legal and compliance (Claude Code)"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/authentication"
    title: "Authentication (Claude Code)"
    accessed: 2026-11-10
  - url: "https://claude.com/pricing"
    title: "Claude の料金プラン"
    accessed: 2026-11-10
  - url: "https://nodejs.org/api/typescript.html"
    title: "Modules: TypeScript (Node.js)"
    accessed: 2026-11-10
  - url: "https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk"
    title: "@anthropic-ai/claude-agent-sdk (npm)"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/model-config"
    title: "Model configuration (Claude Code)"
    accessed: 2026-11-10
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-10
---

AI エージェントとワークフローの違いは、次に何をするかを決める側にあります。ワークフローでは、LLM を呼ぶ順番をあらかじめコードに書きます。エージェントでは、LLM が自分でツールを選び、何回呼ぶかも決めます（出典1）。

手順が先に決まっている処理なら、LLM を順に呼ぶワークフローで足ります。この記事では、問い合わせ3件の仕分けを Claude Agent SDK で2通りに書き、実際に動かして比べます。

前の記事は[ファイル操作ツールの作り方](/posts/ai-agent-safe-file-tool)です。講座では、この記事が AI エージェントの回の最後に当たります。

## 次の手順を決めるのが、コードか LLM か

Anthropic の「Building effective agents」は、2つを次のように分けています（出典1）。

- ワークフローは、LLM とツールを、あらかじめ書いたコードの道筋で動かす仕組みです。
- エージェントは、LLM が自分の進め方とツールの使い方を決め、やり方の主導権を持つ仕組みです。

同じ記事の説明を、この記事のコードに当てはめて表にしました。

| 観点 | ワークフロー | エージェント |
|---|---|---|
| 次の手順を決める側 | コード | LLM |
| LLM を呼ぶ回数 | コードを読めば分かる | 動かすまで分からない |
| 向いている処理 | 決まった小さな手順にきれいに分けられる処理（出典1） | 必要な手数を前もって読めない処理（出典1） |
| 途中で止める方法 | 手順の間にコードの確認を挟む（出典1） | 反復回数の上限を停止条件として付ける（出典1） |

Anthropic は、まず最も単純な方法を探し、必要になったときに限って複雑にするよう勧めています（出典1）。エージェントは、遅延とコストを払って性能を取ることが多い、とも書いています（出典1）。

手順を書き出せる処理を、わざわざエージェントにする理由はほとんど見当たりません。

## 動かすのに要るのは Node.js、Claude のプラン、ログイン

この記事のコードは、Claude Agent SDK の `query()` を使います。用意するものは次のとおりで、どれも欠かせません。

- Node.js は 22.18.0 以上が必要です。`.ts` のファイルを `node` で直接動かすためです（出典9）。検証は 22.22.0 で行いました。
- Claude のプランは、Pro、Max、Ultra のどれかが必要です。Free には Claude Code が含まれません（出典8）。Pro は月払いで月20ドルです（出典8）。
- Claude Code に、そのプランのアカウントでログインしておく必要があります（出典7）。

Node.js は、型の注釈を空白に置き換えて実行します。型の検査はしません（出典9）。検証では別に `tsc` で型を確かめ、エラーは0件でした。

環境変数 `ANTHROPIC_API_KEY` が入っていると、プランのログインより先にそちらが使われます（出典7）。プランで試すなら、先に入っていないことを確かめます。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

`set` と出たら、`unset ANTHROPIC_API_KEY` を実行してから進めてください（出典7）。

### プランで動かすのは、自分で試す範囲に限る

プランでログインしていれば、Agent SDK の利用はプランの利用枠から引かれます（出典5）。プランの利用枠は、Claude Code と Agent SDK を個人がふつうに使う前提で決まっています（出典6）。

ほかの人に使わせる製品かサービスに組み込むなら、Claude Console の API キーで認証します（出典6）。自分のアプリで claude.ai のログインを提供することは認められていません（出典6）。利用者に代わってプランの認証情報で通信を中継することも同じです（出典6）。

SDK の結果にある `total_cost_usd` は、費用の見積もりです。型定義のコメントにも「An estimate, not a billing statement」とあります（出典4）。この記事に出てくる金額は比較のための目安で、プランの請求額とは別の数字です。

### インストールは npm の1回で済む

SDK は 0.3.322 に固定して入れます。2026-11-10 の時点で、npm の最新版です（出典10）。

```bash
mkdir vs-workflow
cd vs-workflow
npm init -y
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322
```

```text

added 105 packages, and audited 106 packages in 6s

36 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

```bash
npm pkg get type dependencies
```

```text
{
  "type": "module",
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "0.3.322"
  }
}
```

`query()` から届くメッセージの種類は、Agent SDK の入門で扱いました。詳しくは[入門記事](/posts/claude-agent-sdk-first-agent)にあります。

## 仕分ける問い合わせは3件のテキストファイル

題材は、サポートに届いた問い合わせを「返金」「不具合」「その他」に分ける処理です。1件を1ファイルにして、`tickets` フォルダに置きます。

```bash
mkdir tickets
echo "注文番号 A-1024 のマウスを返品したので、代金を返してください。" > tickets/001.txt
echo "アプリにログインすると、画面が真っ白のまま動きません。" > tickets/002.txt
echo "請求書の宛名を、個人名から会社名に変えられますか。" > tickets/003.txt
ls tickets
```

```text
001.txt
002.txt
003.txt
```

正解は、001 が返金、002 が不具合、003 がその他です。

## ワークフローは、ツールなしの query() をコードから順に呼ぶ

ワークフロー版では、問い合わせ1件ごとに LLM を1回か2回呼びます。どのファイルをどの順に読み、いつ LLM を呼ぶかは、すべて `for` の中のコードが決めます。

```ts
import { readdir, readFile } from "node:fs/promises";
import { query } from "@anthropic-ai/claude-agent-sdk";

const LABELS = ["返金", "不具合", "その他"];
let apiKeySource = "";

// ツールなし、1ターンだけの query() を「LLM を1回呼ぶ関数」として使う
async function ask(systemPrompt: string, prompt: string) {
  let text = "";
  let cache = 0;
  let cost = 0;
  for await (const msg of query({
    prompt,
    options: { model: "haiku", tools: [], maxTurns: 1, systemPrompt },
  })) {
    if (msg.type === "system" && msg.subtype === "init") apiKeySource = msg.apiKeySource;
    if (msg.type === "result" && msg.subtype === "success") {
      text = msg.result.trim();
      cache = msg.usage.cache_creation_input_tokens;
      cost = msg.total_cost_usd;
    }
  }
  return { text, cache, cost };
}

const started = Date.now();
let calls = 0;
let total = 0;

for (const file of (await readdir("tickets")).sort()) {
  const body = await readFile(`tickets/${file}`, "utf8");

  // 手順1: 分類させる
  const label = await ask("問い合わせを「返金」「不具合」「その他」のどれか1語だけで答えてください。", body);
  calls++;
  total += label.cost;

  // 手順2: 答えをコードで確かめる
  if (!LABELS.includes(label.text)) {
    console.log(`${file}: 想定外の答え「${label.text}」なので、この問い合わせは止めます`);
    continue;
  }
  console.log(`${file}: ${label.text}（cache_creation=${label.cache}）`);

  // 手順3: 返金のときだけ返信の書き出しを作らせる
  if (label.text !== "返金") continue;
  const reply = await ask("カスタマーサポートとして、この問い合わせへの返信の書き出しを1文だけ書いてください。", body);
  calls++;
  total += reply.cost;
  console.log(`  返信案: ${reply.text}`);
}

console.log(`LLM を呼んだ回数: ${calls}`);
console.log(`total_cost_usd の合計（見積もり）: ${total.toFixed(6)}`);
console.log(`かかった時間: ${Date.now() - started}ms、apiKeySource: ${apiKeySource}`);
```

`ask()` は、`query()` を LLM の呼び出し1回として使うための関数です。`tools: []` で、組み込みのツールを1つも渡しません。`maxTurns: 1` で、ループの上限を1ターンにします（出典3）。ツールが無い LLM は、文章で答えることしかできません（出典2）。

`for await` を最後まで回しているのは、結果のメッセージの後にも届くイベントがあるためです（出典2）。途中で抜けず、届いた `result` を変数に残します。

手順2は、LLM の答えが3つのラベルのどれかと一致するかを確かめるコードです。Anthropic は、手順の途中に置くこうした確認を gate と呼んでいます（出典1）。手順3は、分類が返金だった問い合わせに限って返信の書き出しを作らせます。

`model` にはモデルの別名を渡せます（出典3）。`"haiku"` は、Anthropic の API では Haiku 5.5 を指す別名です（出典11）。実行すると次の結果になりました。

```bash
node workflow.ts
```

```text
001.txt: 返金（cache_creation=1485）
  返信案: ご返品いただいたマウス（注文番号 A-1024）につきまして、返金のご依頼を承りました。
002.txt: 不具合（cache_creation=1480）
003.txt: 想定外の答え「「その他」」なので、この問い合わせは止めます
LLM を呼んだ回数: 4
total_cost_usd の合計（見積もり）: 0.001992
かかった時間: 23153ms、apiKeySource: none
```

`apiKeySource` が `none` なので、API キーは使っていません（出典4）。LLM を呼んだのは、分類の3回と返信の1回で、合わせて4回です。この回数は、ファイルの数と分類の結果から、動かす前に計算できます。

### 1回目の実行では、手順2が 003.txt を止めた

003.txt では、LLM が答えを鉤括弧でくくって返しました。答えの文字列がラベルと一致しないので、手順2のコードがこの問い合わせを止めています。

同じコードをもう一度動かすと、003.txt は括弧なしで返り、手順2を通りました。

```text
001.txt: 返金（cache_creation=927）
  返信案: ご返品いただいたマウス（注文番号 A-1024）の返金のご依頼、承りました。
002.txt: 不具合（cache_creation=926）
003.txt: その他（cache_creation=922）
LLM を呼んだ回数: 4
total_cost_usd の合計（見積もり）: 0.001351
かかった時間: 27702ms、apiKeySource: none
```

LLM の答えの形は、同じ指示でも実行ごとに揺れます。ワークフローなら、その揺れを次の手順に渡す前にコードで受け止められます。

括弧を取り除いてから比べれば、1回目の 003.txt も通ります。あなたなら括弧を外して通しますか。それとも止めて、人の確認に回しますか。

### tools を指定しないと、1回ごとに39個のツールの定義が付く

`tools` を指定しないと、`query()` には Claude Code の組み込みのツールが付きます。手順1と同じ分類を、`tools` と `systemPrompt` の両方を指定せずに1回だけ投げて確かめました。

init のメッセージにあるツールの数は39個でした。`cache_creation_input_tokens` は 13,212 でした。`cache_read_input_tokens` は 25,805 です。分類1回の `total_cost_usd` は 0.003156 です。上のワークフローの4回分の合計 0.001992 を、1回で超えています。

LLM を部品として呼ぶ手順では、`tools: []` と短い `systemPrompt` を必ず渡してください。

## エージェントは、ツールを渡した query() を1回呼ぶ

エージェント版のコードには、ファイル名も読む順番も書きません。渡すのはやってほしいことと、使ってよいツールです。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

const started = Date.now();

// ツールを渡した query() を1回だけ呼ぶ。何をどの順に読むかはモデルが決める
for await (const msg of query({
  prompt: "tickets フォルダの問い合わせをすべて読み、返金を求めているものをファイル名つきで挙げてください。",
  options: { model: "haiku", tools: ["Glob", "Read"], allowedTools: ["Glob", "Read"], maxTurns: 10 },
})) {
  if (msg.type === "system" && msg.subtype === "init") {
    console.log(`apiKeySource: ${msg.apiKeySource}`);
  }
  if (msg.type === "assistant") {
    for (const block of msg.message.content) {
      if (block.type === "tool_use") {
        // 作業フォルダの絶対パスは「.」に置き換えて表示する
        console.log(`ツール: ${block.name} ${JSON.stringify(block.input).replaceAll(process.cwd(), ".")}`);
      }
    }
  }
  if (msg.type === "result") {
    if (msg.subtype === "success") console.log(`答え: ${msg.result}`);
    console.log(`num_turns=${msg.num_turns}、cache_creation=${msg.usage.cache_creation_input_tokens}`);
    console.log(`total_cost_usd（見積もり）: ${msg.total_cost_usd.toFixed(6)}、かかった時間: ${Date.now() - started}ms`);
  }
}
```

`tools` に渡したのは、ファイルを探す `Glob` と、読む `Read` の2つです（出典2）。`allowedTools` に同じ2つを並べると、確認なしで実行されます（出典2）。書き込みと実行のツールは渡していません。

`maxTurns: 10` は停止条件です。ターンは、LLM が出力し、ツールを呼んだならその結果を受け取るまでの1往復です（出典2）。10往復で終わらなければ、`error_max_turns` の結果で止まります（出典2）。

```bash
node agent.ts
```

```text
apiKeySource: none
ツール: Glob {"pattern":"**/*","path":"./tickets"}
ツール: Read {"file_path":"./tickets/001.txt"}
ツール: Read {"file_path":"./tickets/002.txt"}
ツール: Read {"file_path":"./tickets/003.txt"}
答え: `tickets` フォルダには3件の問い合わせがあり、返金を求めているのは1件です。

- **001.txt**: 注文番号 A-1024 のマウスを返品したので、代金を返してください。

残りの2件は返金の依頼ではありません。002.txt はログイン後に画面が真っ白になる不具合の報告、003.txt は請求書の宛名変更の相談です。
num_turns=5、cache_creation=2262
total_cost_usd（見積もり）: 0.001101、かかった時間: 8181ms
```

LLM は、まず `Glob` でファイルの一覧を取り、3件を `Read` で1件ずつ読みました。ツールを4回呼んだあとに答えを書き、`num_turns` は5でした。この順番はコードのどこにも書いていません。

同じコードの2回目では、`Glob` の引数が変わりました。引数は `{"pattern":"tickets/**/*","path":"."}` でした。ターン数は同じ5でしたが、答えの中のファイル名は絶対パスで書かれていました。

エージェントの手順と答えの形は、実行するたびに変わります。

## 測ってみると、この3件ではエージェントのほうが速くて安かった

2つの書き方を、それぞれ2回ずつ動かした結果です。

| 観点 | ワークフロー 1回目 | ワークフロー 2回目 | エージェント 1回目 | エージェント 2回目 |
|---|---|---|---|---|
| `query()` を呼んだ回数 | 4 | 4 | 1 | 1 |
| かかった時間 | 23,153ms | 27,702ms | 8,181ms | 8,459ms |
| `total_cost_usd`（見積もり） | 0.001992 | 0.001351 | 0.001101 | 0.000931 |

遅延とコストを払うのはエージェントのほうだ、という Anthropic の説明と逆の結果です（出典1）。ワークフロー側は、`query()` を4回呼んでいます。

`query()` は、既定では手元で Claude Code のプロセスを起動して動きます（出典4）。分類を1回だけ投げて測ると、`query()` 1回で 6,714ms かかりました。ワークフロー版はこれを4回くり返すので、20秒を超えます。

エージェント版は、5ターンの往復を含めても `query()` 1回で 8,181ms でした。ターンをまたいで変わらない部分はキャッシュされます（出典2）。`cache_creation` も 2,262 の1回分です。

速さと安さで選ぶなら、この結果からはエージェントになります。それでも、この仕分けはワークフローで書きます。LLM を呼ぶ回数が動かす前に決まり、手順2で答えの形を確かめられるからです。

この比較は、3件の問い合わせを2回ずつ動かしたときの数字です。件数を増やしたときの差は測っていません。

## 手順を保証したいならワークフロー、手順が読めないならエージェント

どちらを選ぶかは、手順を先に書き出せるかどうかで決まります。速さとコストは、`query()` の呼び方でも変わるので、決め手にしないでください。

- 手順を書き出せて、各手順の答えをコードで確かめたい処理は、ワークフローで書きます（出典1）。
- 何を何回読むかが動かすまで分からない処理は、エージェントで書きます（出典1）。問い合わせがどのフォルダにあるか分からない場合が当たります。
- エージェントには停止条件を付けます。`maxTurns` と `maxBudgetUsd` の少なくとも一方を渡します（出典1、出典2）。

上限で止まると、結果のメッセージのあとに例外が投げられます（出典2）。扱い方は[止め方の記事](/posts/ai-agent-max-turns-budget-limit)です。

エージェントの中で回るループは、自分でも書けます。書き方は[ループの記事](/posts/ai-agent-tool-use-loop-typescript)にあります。

講座の続きは MCP サーバーの回です。[MCP サーバーの自作](/posts/mcp-server-typescript-stdio)から始めます。

## 出典

本文の（出典n）は、次の表の番号です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Building effective agents | https://www.anthropic.com/engineering/building-effective-agents | 2026-11-10 |
| 2 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | 2026-11-10 |
| 3 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | 2026-11-10 |
| 4 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-10 |
| 5 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-10 |
| 6 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | 2026-11-10 |
| 7 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-10 |
| 8 | Claude の料金プラン | https://claude.com/pricing | 2026-11-10 |
| 9 | Modules: TypeScript (Node.js) | https://nodejs.org/api/typescript.html | 2026-11-10 |
| 10 | @anthropic-ai/claude-agent-sdk (npm) | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-10 |
| 11 | Model configuration (Claude Code) | https://code.claude.com/docs/en/model-config | 2026-11-10 |

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
