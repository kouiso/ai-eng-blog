---
title: "構造化出力のやり方を比べる【プロンプト指示、自作ツール、outputFormat】"
slug: "structured-output-methods-compare"
description: "同じ予約の抽出を、Claude Agent SDK に3通りのやり方で10件ずつ解かせました。やり方はプロンプト指示、自作ツール、outputFormat です。正解の数、ターン、トークン、コードの行数の実測から選び方を決めます。"
tags: ["構造化出力", "Claude Agent SDK", "TypeScript"]
main_keyword: "構造化出力"
target_query: "構造化出力 プロンプト"
course_step: 2
cost_estimate: "記事のコードは読者自身の Claude プランの利用枠から引かれます。SDK の total_cost_usd は定価で換算した見積もりで、30回の呼び出しを1回通して0.006ドル相当でした。プランでの請求額とは別の数字です。"
run_environment: "Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、zod 4.6.7、macOS arm64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-11"
prev: "llm-json-parse-error-fix"
next: "rag-bm25-search-typescript"
sources:
  - url: "https://code.claude.com/docs/en/agent-sdk/structured-outputs"
    title: "Get structured output from agents (Agent SDK)"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/agent-sdk/custom-tools"
    title: "Give Claude custom tools (Agent SDK)"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/agent-sdk/typescript"
    title: "Agent SDK reference - TypeScript"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/mcp"
    title: "Connect Claude Code to tools via MCP"
    accessed: 2026-11-11
  - url: "https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts"
    title: "@anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts"
    accessed: 2026-11-11
  - url: "https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan"
    title: "Use the Claude Agent SDK with your Claude plan"
    accessed: 2026-11-11
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing (Claude API)"
    accessed: 2026-11-11
  - url: "https://nodejs.org/docs/v22.23.4/api/typescript.html"
    title: "Node.js v22.23.4 Modules: TypeScript"
    accessed: 2026-11-11
  - url: "https://zod.dev/json-schema"
    title: "JSON Schema（Zod）"
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

迷ったら `outputFormat` を選んでください。問い合わせの文から予約の情報を取り出す作業を、3通りのやり方で10件ずつ解かせた結論です。

3通りとも、2回の通しで20件すべてが正解でした。差が出たのは、1件にかかるターンの数、トークン、書くコードの行数です。

比べたのは次の3つで、どれも Claude Agent SDK の `query()` の上で動かしました。

- (a) プロンプトで JSON の形を指示し、返った文字列を `JSON.parse` で読む
- (b) 取り出したい形を入力スキーマにした自作ツールを、モデルに呼ばせる
- (c) `outputFormat` に JSON Schema を渡し、SDK に形を守らせる

返った文字列が `JSON.parse` で読めないこともあります。[前の記事](/posts/llm-json-parse-error-fix)に、直し方があります。講座では、この記事の1つ前の回です。

## 比較表

10件を1回通した結果を、2回分並べました。数字は、記事の `compare.ts` の出力から写しています。

| 観点 | (a) プロンプト指示 | (b) 自作ツール | (c) outputFormat |
|---|---|---|---|
| 正解（1回目、2回目） | 10/10、10/10 | 10/10、10/10 | 10/10、10/10 |
| 1件のターン数 | 1 | 2 | 2 |
| 10件の total_cost_usd | 0.00076、0.00067 | 0.00355、0.00367 | 0.00164、0.00188 |
| 1件の平均の所要時間 | 1435 ms、1358 ms | 2559 ms、2661 ms | 1487 ms、1433 ms |
| 10件の出力トークン | 1103、940 | 3764、4147 | 1815、1807 |
| やり方のファイルの行数 | 15 | 25 | 14 |
| 形が合わないとき | 自分で検出して数える | 自分で検出して数える | SDK が出し直させる（出典1） |

安いのは (a) で、(c) の半分以下でした。(b) は (a) の約5倍の見積もりで、時間もいちばんかかります。

(c) は、形を守らせる仕事を SDK が引き受けます（出典1）。コードも3つの中でいちばん短く、14行で済みました。

## 動かすのに要る Node.js とプラン

用意するのは、Node.js 22.18.0 以上と Claude Code です。Claude Code には、Claude のプランでログインしておきます。Node.js 22.18.0 からは、`.ts` のファイルを `node` で直接動かせます（出典8）。検証は 22.23.4 で行いました。

プランで試すときは、環境変数 `ANTHROPIC_API_KEY` が外れていることを先に確かめます。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

Agent SDK の `query()` は、ログインしたプランの利用枠から引かれます（出典6）。

### インストールは2パッケージ

SDK と zod を、記事と同じ版に固定して入れます。

```bash
mkdir structured-compare
cd structured-compare
npm init -y
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 zod@4.6.7
```

```text

added 3 packages, and audited 4 packages in 2s

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

0.3.322 は、2026-11-11 の時点で npm の最新版です（出典10）。

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

## 比べた作業は、問い合わせから予約の4項目を取り出すこと

題材は、飲食店に届く予約の問い合わせです。名前、来店日、人数、昼か夜かの4項目を取り出させます。

`cases.ts` には、3つのやり方が共有するものを置きました。正解かどうかを確かめる zod のスキーマ、システムプロンプト、10件の問い合わせと正解です。

```ts
import { z } from "zod";

export const Reservation = z.object({
  name: z.string().describe("予約者の名前"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("来店日。YYYY-MM-DD"),
  people: z.number().int().min(1).describe("人数の合計"),
  course: z.enum(["lunch", "dinner"]).describe("昼なら lunch、夜なら dinner"),
});
export type Reservation = z.infer<typeof Reservation>;

export const SYSTEM_PROMPT =
  "問い合わせの文から予約の情報を取り出します。年が書かれていなければ2026年とします。";

export const cases: { text: string; expected: Reservation }[] = [
  { text: "11月20日の夜、4名で予約したいです。山田です。", expected: { name: "山田", date: "2026-11-20", people: 4, course: "dinner" } },
  { text: "佐藤と申します。12/3 のランチを2人でお願いします。", expected: { name: "佐藤", date: "2026-12-03", people: 2, course: "lunch" } },
  { text: "2026年12月5日、大人2名と子ども1名でディナーを予約できますか。鈴木", expected: { name: "鈴木", date: "2026-12-05", people: 3, course: "dinner" } },
  { text: "高橋です！11月28日のお昼に五名で伺いたいです。", expected: { name: "高橋", date: "2026-11-28", people: 5, course: "lunch" } },
  { text: "予約希望: 田中 / 2026-12-10 / 夜 / 6人", expected: { name: "田中", date: "2026-12-10", people: 6, course: "dinner" } },
  { text: "伊藤です。十二月一日の夜に1人で行きます。カウンター席が希望です。", expected: { name: "伊藤", date: "2026-12-01", people: 1, course: "dinner" } },
  { text: "12月24日、ランチで8名。幹事は渡辺です。アレルギーは無しです。", expected: { name: "渡辺", date: "2026-12-24", people: 8, course: "lunch" } },
  { text: "中村です。11月22日の18時から、3名でお願いします。", expected: { name: "中村", date: "2026-11-22", people: 3, course: "dinner" } },
  { text: "小林といいます。12月15日12時、夫婦2人と友人2人の計4人です。", expected: { name: "小林", date: "2026-12-15", people: 4, course: "lunch" } },
  { text: "加藤です。12月8日の夜、2名で予約したいのですが、9日に変更になるかもしれません。ひとまず8日で。", expected: { name: "加藤", date: "2026-12-08", people: 2, course: "dinner" } },
];
```

日付の書き方、漢数字、人数の足し算、時刻からの昼夜の判断を混ぜました。10件目は、8日と9日の2つの日付が出てくる文です。

zod のスキーマの説明は省きます。書き方は[zod の記事](/posts/zod-validate-llm-json-output)にあります。`safeParse` のエラーの読み方も、そちらにあります。

### 3つのやり方は同じオプションで呼ぶ

`common.ts` の `run()` は、`query()` を呼んで結果のメッセージを1つ返します。モデル、システムプロンプト、ツールを外す指定は、3つのやり方で同じにしました。

```ts
import { query, type Options, type SDKResultMessage } from "@anthropic-ai/claude-agent-sdk";
import { SYSTEM_PROMPT } from "./cases.ts";

export const apiKeySources = new Set<string>();

export async function run(prompt: string, options: Options): Promise<SDKResultMessage> {
  for await (const m of query({
    prompt,
    options: {
      model: "haiku",
      tools: [],
      settingSources: [],
      strictMcpConfig: true,
      systemPrompt: SYSTEM_PROMPT,
      ...options,
    },
  })) {
    if (m.type === "system" && m.subtype === "init") apiKeySources.add(m.apiKeySource);
    if (m.type === "result") return m;
  }
  throw new Error("result が届きませんでした");
}
```

`strictMcpConfig: true` を外すと、(b) の見積もりが数十倍から数百倍に増えました。数字は (b) の節に載せます。

init の `apiKeySource` は、API キーを使ったかどうかを確かめるために集めています。

## (a) プロンプト指示は1ターンで安いが、形の保証は無い

(a) のコードは `a-prompt.ts` です。問い合わせの後ろに JSON の形を書き足して頼みます。返った `result` の文字列を `JSON.parse` にかけます。

```ts
import { run } from "./common.ts";

export async function extractByPrompt(text: string) {
  const prompt = `${text}

次の形の JSON だけを返してください。説明やコードフェンスは付けません。
{"name": 文字列, "date": "YYYY-MM-DD", "people": 整数, "course": "lunch" か "dinner"}`;
  const result = await run(prompt, { maxTurns: 1 });
  if (result.subtype !== "success") return { result, error: result.subtype };
  try {
    return { result, value: JSON.parse(result.result) as unknown };
  } catch (e) {
    return { result, error: `JSON.parse: ${(e as Error).message}` };
  }
}
```

`JSON.parse` が失敗しても、直さずに失敗として数えます。コードフェンスが付いた文字列を読む方法は、前の記事にあります。

今回の20件では、`JSON.parse` は一度も失敗しませんでした。ただ、形が合う保証はモデルの従い方しだいです。人数が文字列で返っても、気づくのは自分の検証のコードです。

## (b) 自作ツールは2ターンかかり、strictMcpConfig を外すと高くつく

(b) のコードは `b-tool.ts` です。取り出したい4項目を引数に持つツールを作り、モデルに呼ばせます。ツールの処理では、受け取った引数を変数に入れておきます。

```ts
import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { Reservation } from "./cases.ts";
import { run } from "./common.ts";

export async function extractByTool(text: string) {
  let saved: unknown;
  const save = tool(
    "save_reservation",
    "問い合わせから取り出した予約の情報を保存する",
    Reservation.shape,
    async (args) => {
      saved = args;
      return { content: [{ type: "text", text: "保存しました" }] };
    },
    { alwaysLoad: true },
  );
  const server = createSdkMcpServer({ name: "booking", tools: [save] });
  const result = await run(`${text}\n\n予約の情報を save_reservation で保存してください。`, {
    mcpServers: { booking: server },
    allowedTools: ["mcp__booking__save_reservation"],
    maxTurns: 3,
  });
  if (saved === undefined) return { result, error: `ツールが呼ばれなかった（${result.subtype}）` };
  return { result, value: saved };
}
```

`tool()` に zod のスキーマを渡し、`createSdkMcpServer()` で包みます（出典2）。包んだものは `mcpServers` に渡します（出典2）。`allowedTools` に書くツールの名前は決まった形です（出典2）。今回の名前は `mcp__booking__save_reservation` です。

`alwaysLoad: true` は、ツールの定義を最初から読み込ませる指定です（出典2）。ツール検索が既定で有効なので、付けないと後から読み込まれます（出典2）。

ツールの処理が返した内容は、ツールの結果としてモデルに戻ります（出典2）。`compare.ts` の出力では、(b) はどの件も `turns=2` でした。出力トークンは (c) の約2倍で、3つの中でいちばん遅い結果でした。

### strictMcpConfig を外すと、1件が数十倍から数百倍の見積もりになった

同じ (b) から `strictMcpConfig` を外して、3件動かしたときの数字です。

| 件 | init の mcp_servers | キャッシュの書き込み | total_cost_usd |
|---|---|---|---|
| 1 | 25 | 164969 | 0.16560 |
| 2 | 1 | 250098 | 0.25069 |
| 3 | 1 | 221432 | 0.22252 |

付けたときの (b) は、10件の合計で 0.00355 でした。1件あたりに直すと、表の3件は約470倍から710倍です。

倍率は、動かすたびに大きく変わりました。コードを仕上げる前の通しでも、外した (b) を3件動かしています。そのときの total_cost_usd は 0.01462、0.20685、0.01105 でした。

同じ通しの付けたときの (b) は、10件で 0.00513 です。1件あたりに直すと、約20倍から400倍でした。2回の通しの6件を合わせると、約20倍から710倍です。

渡したサーバーは `booking` の1つですが、表の1件目の init には25個のサーバーが並びました。claude.ai のコネクタは、ログインしていると Claude Code でも使えます（出典4）。

ただ、init のサーバーの数とキャッシュの書き込みは並びません。2件目と3件目は init が1個なのに、1件目より多く書き込んでいます。なぜ並ばないのかは、ログからはわかりません。

`strictMcpConfig: true` を付けると、claude.ai のコネクタは読まれません（出典3）。付けたときのキャッシュの書き込みは、10件で1519トークンでした。この指定の意味は、この記事では扱いません。

## (c) outputFormat は短く書けて、合わなければ SDK が出し直させる

(c) のコードは `c-output-format.ts` です。zod のスキーマを JSON Schema に直して `outputFormat` に渡します。答えは結果の `structured_output` に入ります（出典1）。

```ts
import { z } from "zod";
import { Reservation } from "./cases.ts";
import { run } from "./common.ts";

export async function extractByOutputFormat(text: string) {
  const result = await run(text, {
    outputFormat: { type: "json_schema", schema: z.toJSONSchema(Reservation, { target: "draft-7" }) },
    maxTurns: 3,
  });
  if (result.subtype !== "success" || result.is_error || result.structured_output === undefined) {
    return { result, error: result.subtype };
  }
  return { result, value: result.structured_output };
}
```

SDK は、出力がスキーマに合わなければモデルに出し直させます（出典1）。上限まで合わないときは、結果がエラーになります（出典1）。`subtype` の値は `error_max_structured_output_retries` です。

`outputFormat` の仕組みとエラーの扱いの説明は省きます。[別の記事](/posts/claude-agent-sdk-structured-output)に任せます。

(c) も1件に2ターンかかりました。`outputFormat` を付けると、`StructuredOutput` というツールが足されます（出典1）。モデルはそのツールを呼んで答えを返すので、中身は (b) とよく似ています（出典1）。

それでも (c) は (b) の半分ほどの見積もりでした。出力トークンも (b) の半分ほどです。

`z.toJSONSchema()` には `{ target: "draft-7" }` を渡しています。SDK の検証は JSON Schema の draft-07 です（出典1）。zod の既定の出力は draft 2020-12 なので、そのままでは受け付けられません（出典9）。

試しに `target` を外すと、Claude Code の起動の時点で `query()` が例外を投げました。くわしい理由は outputFormat の記事にあります。

## compare.ts で、10件を3通りに解かせる

`compare.ts` は、3つのやり方に同じ10件を順に渡します。返った値を `Reservation.safeParse` にかけ、正解と比べて数えます。

```ts
import { cases, Reservation } from "./cases.ts";
import { apiKeySources } from "./common.ts";
import { extractByPrompt } from "./a-prompt.ts";
import { extractByTool } from "./b-tool.ts";
import { extractByOutputFormat } from "./c-output-format.ts";

const methods = {
  "a-prompt": extractByPrompt,
  "b-tool": extractByTool,
  "c-output-format": extractByOutputFormat,
};

for (const [name, extract] of Object.entries(methods)) {
  const sum = { parsed: 0, valid: 0, correct: 0, turns: 0, input: 0, cacheWrite: 0, cacheRead: 0, output: 0, cost: 0, ms: 0 };
  for (const [i, c] of cases.entries()) {
    const { result, value, error } = await extract(c.text);
    const check = Reservation.safeParse(value);
    const correct = check.success && JSON.stringify(check.data) === JSON.stringify(c.expected);
    if (value !== undefined) sum.parsed++;
    if (check.success) sum.valid++;
    if (correct) sum.correct++;
    sum.turns += result.num_turns;
    for (const u of Object.values(result.modelUsage)) {
      sum.input += u.inputTokens;
      sum.cacheWrite += u.cacheCreationInputTokens;
      sum.cacheRead += u.cacheReadInputTokens;
      sum.output += u.outputTokens;
    }
    sum.cost += result.total_cost_usd;
    sum.ms += result.duration_ms;
    const mark = correct ? "OK" : check.success ? "WRONG" : "INVALID";
    console.log(`${name} #${i + 1} ${mark} turns=${result.num_turns} ${error ?? JSON.stringify(value)}`);
  }
  console.log(
    `== ${name}: 取り出せた ${sum.parsed}/10、スキーマに合う ${sum.valid}/10、正解 ${sum.correct}/10、` +
      `ターン ${sum.turns}、入力 ${sum.input}、キャッシュ書き込み ${sum.cacheWrite}、` +
      `キャッシュ読み込み ${sum.cacheRead}、出力 ${sum.output}、` +
      `total_cost_usd ${sum.cost.toFixed(5)}、平均 ${Math.round(sum.ms / 10)} ms`,
  );
}
console.log(`apiKeySource: ${[...apiKeySources].join(", ")}`);
```

トークンは `modelUsage` から足しています。結果の `usage` は、メインのループの分しか持ちません（出典5）。型定義のコメントも `modelUsage` を勧めています（出典5）。

```bash
node compare.ts
```

```text
a-prompt #1 OK turns=1 {"name":"山田","date":"2026-11-20","people":4,"course":"dinner"}
a-prompt #2 OK turns=1 {"name":"佐藤","date":"2026-12-03","people":2,"course":"lunch"}
a-prompt #3 OK turns=1 {"name":"鈴木","date":"2026-12-05","people":3,"course":"dinner"}
a-prompt #4 OK turns=1 {"name":"高橋","date":"2026-11-28","people":5,"course":"lunch"}
a-prompt #5 OK turns=1 {"name":"田中","date":"2026-12-10","people":6,"course":"dinner"}
a-prompt #6 OK turns=1 {"name":"伊藤","date":"2026-12-01","people":1,"course":"dinner"}
a-prompt #7 OK turns=1 {"name":"渡辺","date":"2026-12-24","people":8,"course":"lunch"}
a-prompt #8 OK turns=1 {"name":"中村","date":"2026-11-22","people":3,"course":"dinner"}
a-prompt #9 OK turns=1 {"name":"小林","date":"2026-12-15","people":4,"course":"lunch"}
a-prompt #10 OK turns=1 {"name":"加藤","date":"2026-12-08","people":2,"course":"dinner"}
== a-prompt: 取り出せた 10/10、スキーマに合う 10/10、正解 10/10、ターン 10、入力 1306、キャッシュ書き込み 0、キャッシュ読み込み 7410、出力 1103、total_cost_usd 0.00076、平均 1435 ms
b-tool #1 OK turns=2 {"name":"山田","date":"2026-11-20","people":4,"course":"dinner"}
b-tool #2 OK turns=2 {"name":"佐藤","date":"2026-12-03","people":2,"course":"lunch"}
b-tool #3 OK turns=2 {"name":"鈴木","date":"2026-12-05","people":3,"course":"dinner"}
b-tool #4 OK turns=2 {"name":"高橋","date":"2026-11-28","people":5,"course":"lunch"}
b-tool #5 OK turns=2 {"name":"田中","date":"2026-12-10","people":6,"course":"dinner"}
b-tool #6 OK turns=2 {"name":"伊藤","date":"2026-12-01","people":1,"course":"dinner"}
b-tool #7 OK turns=2 {"name":"渡辺","date":"2026-12-24","people":8,"course":"lunch"}
b-tool #8 OK turns=2 {"name":"中村","date":"2026-11-22","people":3,"course":"dinner"}
b-tool #9 OK turns=2 {"name":"小林","date":"2026-12-15","people":4,"course":"lunch"}
b-tool #10 OK turns=2 {"name":"加藤","date":"2026-12-08","people":2,"course":"dinner"}
== b-tool: 取り出せた 10/10、スキーマに合う 10/10、正解 10/10、ターン 20、入力 10938、キャッシュ書き込み 1519、キャッシュ読み込み 27464、出力 3764、total_cost_usd 0.00355、平均 2559 ms
c-output-format #1 OK turns=2 {"name":"山田","date":"2026-11-20","people":4,"course":"dinner"}
c-output-format #2 OK turns=2 {"name":"佐藤","date":"2026-12-03","people":2,"course":"lunch"}
c-output-format #3 OK turns=2 {"name":"鈴木","date":"2026-12-05","people":3,"course":"dinner"}
c-output-format #4 OK turns=2 {"name":"高橋","date":"2026-11-28","people":5,"course":"lunch"}
c-output-format #5 OK turns=2 {"name":"田中","date":"2026-12-10","people":6,"course":"dinner"}
c-output-format #6 OK turns=2 {"name":"伊藤","date":"2026-12-01","people":1,"course":"dinner"}
c-output-format #7 OK turns=2 {"name":"渡辺","date":"2026-12-24","people":8,"course":"lunch"}
c-output-format #8 OK turns=2 {"name":"中村","date":"2026-11-22","people":3,"course":"dinner"}
c-output-format #9 OK turns=2 {"name":"小林","date":"2026-12-15","people":4,"course":"lunch"}
c-output-format #10 OK turns=2 {"name":"加藤","date":"2026-12-08","people":2,"course":"dinner"}
== c-output-format: 取り出せた 10/10、スキーマに合う 10/10、正解 10/10、ターン 20、入力 5991、キャッシュ書き込み 0、キャッシュ読み込み 13590、出力 1815、total_cost_usd 0.00164、平均 1487 ms
apiKeySource: none
```

最後の行の `none` は、API キーを使っていないという意味です。3つのやり方の30回とも、プランのログインで動きました。

同じ `node compare.ts` をもう一度動かした2回目も、3つとも10/10でした。比較表の2つ目の数字が、その回の値です。

### 形が合っても、中身が正しいとは限らない

記事のコードを仕上げる前の通しで、(a) が1件だけ間違えました。7件目の名前を「ランチ会（幹事：渡辺）」と返しています。

この答えはスキーマに合うので、`safeParse` は通ります。名前の欄が文字列であることしか決めていないためです。

3つのやり方が保証するのは、返る値の形までです。中身が正しいかどうかは、正解と比べる仕組みを別に持たないとわかりません。

その通しのコードは、トークンの数え方が今と違う版でした。正解かどうかを判定する行は、今のコードと同じです。

### 行数の差は、ツールを組み立てる分

3つのやり方のファイルの行数を数えました。

```bash
wc -l a-prompt.ts b-tool.ts c-output-format.ts
```

```text
      15 a-prompt.ts
      25 b-tool.ts
      14 c-output-format.ts
      54 total
```

(b) が10行ほど長いのは、ツールを組み立てる分です。`tool()` と `createSdkMcpServer()` の呼び出しが入ります。(a) と (c) はほぼ同じ長さでした。

## 選び方

結論は、迷ったら (c) です。条件によっては (a) か (b) が勝つので、場面ごとに分けて言い切ります。

- 形が崩れたら困る処理（データベースに入れる、別の関数に渡す）は (c) を使います。SDK が合わない出力を出し直させるので、自分で再試行を書かずに済みます（出典1）。
- 大量に回して見積もりを抑えたい用途で、自分で検証と再試行を書けるなら (a) です。今回は (c) の半分以下の見積もりでした。
- 取り出したあとに、同じ流れで別の処理をさせたいなら (b) です。ツールの処理の中に、保存の処理も書けます。`strictMcpConfig: true` は忘れずに付けてください。

どれを選んでも、7件目のような中身の誤りは防げません。正解つきの見本を何件か持って、ときどき流し直す運用は残ります。

あなたの抽出では、形の保証と1件あたりの見積もりの、どちらを先に取りますか。

## 料金はプランの利用枠から引かれる

この記事のコードは、プランのログインで動かすとプランの利用枠から引かれます（出典6）。

`total_cost_usd` は定価で換算した見積もりです。型定義のコメントには「An estimate, not a billing statement」とあります（出典5）。比較表の金額は、やり方どうしを比べるための目安として読んでください。

コードではモデルを別名の `haiku` で指定しており、ログにモデル ID は出ていません。

API キーで使う場合、Haiku 5.5 の入力は100万トークンあたり0.10ドルです（出典7）。出力は0.50ドル、キャッシュの読み込みは0.01ドルです（出典7）。どれも10万トークン以下のプロンプトでの単価です（出典7）。

(a) の1回目のトークン数にこの単価を掛けると0.00076ドルで、比較表の値と合います。

## 出典

本文の（出典n）は、この表の番号です。確認日は、どれもページを読んだ日です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Get structured output from agents (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/structured-outputs | 2026-11-11 |
| 2 | Give Claude custom tools (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/custom-tools | 2026-11-11 |
| 3 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | 2026-11-11 |
| 4 | Connect Claude Code to tools via MCP | https://code.claude.com/docs/en/mcp | 2026-11-11 |
| 5 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-11 |
| 6 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-11 |
| 7 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | 2026-11-11 |
| 8 | Node.js v22.23.4 Modules: TypeScript | https://nodejs.org/docs/v22.23.4/api/typescript.html | 2026-11-11 |
| 9 | JSON Schema（Zod） | https://zod.dev/json-schema | 2026-11-11 |
| 10 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-11 |

AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。
