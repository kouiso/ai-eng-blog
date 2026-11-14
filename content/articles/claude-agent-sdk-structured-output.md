---
title: "Claude で JSON を確実に返す【Agent SDK の outputFormat と JSON Schema】"
slug: "claude-agent-sdk-structured-output"
description: "query() に JSON Schema を渡し、structured_output で答えを受け取ります。スキーマを満たせないときの結果と、zod で型を付ける手順も、自分の Claude プランで動かして示します。"
tags: ["構造化出力", "Claude Agent SDK", "TypeScript"]
main_keyword: "構造化出力"
target_query: "claude 構造化出力"
course_step: 2
cost_estimate: "記事のコードは読者自身の Claude プランの利用枠から引かれます。Pro は月払いで月20ドルです。SDK が出す total_cost_usd は定価で換算した見積もりで、プランでの請求額とは別の数字です。"
run_environment: "Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、zod 4.6.7、macOS arm64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-11"
prev: "claude-code-api-key-billing-auth"
next: "zod-validate-llm-json-output"
sources:
  - url: "https://code.claude.com/docs/en/agent-sdk/structured-outputs"
    title: "Get structured output from agents"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/agent-sdk/troubleshooting"
    title: "Troubleshooting (Agent SDK)"
    accessed: 2026-11-11
  - url: "https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts"
    title: "@anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/env-vars"
    title: "Environment variables (Claude Code)"
    accessed: 2026-11-11
  - url: "https://zod.dev/json-schema"
    title: "JSON Schema | Zod"
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
  - url: "https://nodejs.org/docs/v22.22.0/api/typescript.html"
    title: "Node.js v22.22.0 Modules: TypeScript"
    accessed: 2026-11-11
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-13
---

決めた形の JSON を受け取るなら、Agent SDK の `outputFormat` を使います。

渡すのは JSON Schema です。答えは、結果の `structured_output` に入ります（出典1）。SDK がスキーマで検証した値です（出典1）。

自分の Claude プランで3本のコードを動かしました。スキーマを満たせないときの2通りの終わり方と、zod で型を付ける手順も扱います。

1つ前は[課金の記事](/posts/claude-code-api-key-billing-auth)です。この記事から、講座の2つ目のテーマの構造化出力に入ります。

## 動かすのに要る Node.js、プラン、ログイン

前提は、Node.js、Claude のプラン、そのプランでログインした Claude Code の3つです。

- Node.js 22.18.0 以上（出典9）。`.ts` のファイルを `node` で直接動かすためです。検証は 22.23.4 で行いました。
- Claude の Pro、Max、Ultra のどれか。料金表で Claude Code が入っているのは Pro からです（出典8）。
- プランのアカウントでログインした Claude Code（出典6）

環境変数 `ANTHROPIC_API_KEY` があると、プランのログインより先にそちらが使われます（出典6）。先に外れていることを確かめます。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

`set` と出たら、`unset ANTHROPIC_API_KEY` で外してから進めてください（出典6）。

## npm install 1回で SDK と zod が入る

SDK と zod を、記事と同じ版に固定して入れます。zod を使うのは、3本目のコードだけです。

```bash
mkdir structured-output
cd structured-output
npm init -y
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 zod@4.6.7
```

```text

added 105 packages, and audited 106 packages in 15s

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
    "@anthropic-ai/claude-agent-sdk": "0.3.322",
    "zod": "4.6.7"
  }
}
```

## outputFormat に JSON Schema を渡すと structured_output に入る

1本目は、問い合わせの文を4つの項目に分けるコードです。種類、優先度、要約、期限を、スキーマで決めた形で受け取ります。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

const schema = {
  type: "object",
  properties: {
    category: { type: "string", enum: ["billing", "bug", "feature_request", "other"] },
    priority: { type: "integer", minimum: 1, maximum: 3, description: "1 が最も急ぎ" },
    summary: { type: "string" },
    due_date: { type: ["string", "null"], description: "期限の日付。無ければ null" },
  },
  required: ["category", "priority", "summary", "due_date"],
  additionalProperties: false,
};

const inquiry = `件名: 請求額がおかしい
先月の請求が2回引き落とされています。2026年11月20日の締め日までに返金してください。`;

for await (const message of query({
  prompt: `次の問い合わせを分類してください。\n\n${inquiry}`,
  options: {
    model: "haiku",
    tools: [],
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    outputFormat: { type: "json_schema", schema },
  },
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(`[system/init] apiKeySource=${message.apiKeySource} tools=${JSON.stringify(message.tools)}`);
  } else if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "tool_use") console.log(`[assistant/tool_use] ${block.name}`);
    }
  } else if (message.type === "result") {
    console.log(`[result/${message.subtype}] is_error=${message.is_error} num_turns=${message.num_turns}`);
    if (message.subtype === "success" && !message.is_error && message.structured_output) {
      console.log(message.structured_output);
    }
  }
}
```

`classify.ts` として保存し、`node` で動かします。

```bash
node classify.ts
```

```text
[system/init] apiKeySource=none tools=["StructuredOutput"]
[assistant/tool_use] StructuredOutput
[result/success] is_error=false num_turns=2
{
  category: 'billing',
  priority: 1,
  summary: '先月の請求が2回引き落とされたとの報告。2026年11月20日の締め日までに返金を求めている。',
  due_date: '2026-11-20'
}
```

`apiKeySource=none` は、API キーを使っていないという意味です（出典3）。`structured_output` には、スキーマどおりの4項目が入りました。

`outputFormat` の `type` に書ける値は `"json_schema"` の1つだけです（出典3）。`schema` には JSON Schema のオブジェクトをそのまま渡します（出典1）。`enum`、`required`、入れ子のオブジェクトも使えます（出典1）。

`structured_output` を読む前に、3つの条件を確かめます。`subtype` が `success`、`is_error` が `false`、値があることです（出典1）。公式のページも、この3つで成功を判定しています（出典1）。

### StructuredOutput というツールが1つ増える

`tools: []` を渡しても、init の一覧には `StructuredOutput` がありました。`outputFormat` を渡すと、Claude Code がこのツールを足します（出典1）。

モデルは答えをこのツールの引数として渡します（出典1）。`num_turns=2` になったのは、このやり取りの分です。答えを `tool_use` から拾うのは避けて、`structured_output` から読んでください（出典1）。

ツールの呼び出しを画面に出すアプリなら、`StructuredOutput` は外して表示します（出典1）。ログに出すときも同じです。

## スキーマを満たせないときは、2通りの終わり方がある

スキーマを満たす値が作れないと、SDK は不一致をモデルに返して作り直させます（出典1）。わざと満たせないスキーマを渡すと、終わり方を確かめられます。

`priority` を「5以上かつ3以下」にしたスキーマで試します。この条件を満たす整数はありません。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

const schema = {
  type: "object",
  properties: {
    priority: { type: "integer", minimum: 5, maximum: 3 },
  },
  required: ["priority"],
  additionalProperties: false,
};

try {
  for await (const message of query({
    prompt: "問い合わせ「請求が2回引き落とされた」に優先度を付けてください。",
    options: {
      model: "haiku",
      tools: [],
      settingSources: [],
      strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
      outputFormat: { type: "json_schema", schema },
    },
  })) {
    if (message.type === "user" && Array.isArray(message.message.content)) {
      for (const block of message.message.content) {
        if (block.type === "tool_result" && block.is_error) {
          console.log(`[user/tool_result] ${JSON.stringify(block.content)}`);
        }
      }
    } else if (message.type === "result") {
      console.log(`[result/${message.subtype}] is_error=${message.is_error} num_turns=${message.num_turns}`);
      if (message.subtype === "success" && !message.is_error && message.structured_output) {
        console.log(message.structured_output);
      } else if (message.subtype === "error_max_structured_output_retries") {
        console.log(`errors: ${JSON.stringify(message.errors)}`);
      } else {
        console.log("structured_output がありません");
      }
    }
  }
} catch (error) {
  console.log(`caught: ${error}`);
}
```

`impossible.ts` として保存します。`result` の分け方は、公式のページの書き方に合わせました（出典1）。

### success なのに structured_output が無い

既定の設定のまま動かした結果です。

```bash
node impossible.ts
```

```text
[user/tool_result] "Output does not match required schema: /priority: must be >= 5"
[user/tool_result] "Output does not match required schema: /priority: must be <= 3"
[result/success] is_error=false num_turns=4
structured_output がありません
```

この回は、2回出した値が2回とも合わず、モデルはそこで出し直しをやめました。`subtype` は `success` のままで、`structured_output` は空です。

不一致の回数は、回によって変わりました。この記事のコードで3回動かすと、不一致は3回とも2回で、`num_turns=4` でした。

コネクタを外す設定の書き方だけが違う前の版では、3回とも不一致が3回で、`num_turns=5` でした。回数が違った理由は確かめていません。

変わらなかったのは、6回とも結果が `success` で、値が無かったことです。

公式のトラブルシューティングも、この形を取り上げています（出典2）。原因の候補の1つは、矛盾した制約を持つスキーマです（出典2）。`subtype` だけで成功を判定すると、この結果を通してしまいます。

### 試す回数を使い切ると error_max_structured_output_retries になる

試す回数の上限は、環境変数 `MAX_STRUCTURED_OUTPUT_RETRIES` で決まります。公式の表では、既定は5回で、最初の1回と4回の再試行です（出典4）。既定のままで5回まで試す動きは、この環境では確かめていません。

公式の表は [`claude -p`](/posts/claude-p-script-first-call) の説明として書いています（出典4）。SDK でも同じ上限になるかを、1にして確かめました。

```bash
MAX_STRUCTURED_OUTPUT_RETRIES=1 node impossible.ts
```

```text
[user/tool_result] "Output does not match required schema: /priority: must be >= 5"
[result/error_max_structured_output_retries] is_error=true num_turns=2
errors: ["Failed to provide valid structured output after 1 attempts — last StructuredOutput error: Output does not match required schema: /priority: must be >= 5"]
caught: Error: Claude Code returned an error result: Failed to provide valid structured output after 1 attempts — last StructuredOutput error: Output does not match required schema: /priority: must be >= 5
```

1回失敗した時点で、`subtype` が変わりました（出典3）。値は `error_max_structured_output_retries` です。`errors` には、最後の不一致の理由が入ります。

結果を返したあとに、`for await` のループが例外を投げました。公式のページも、1回きりの `query()` は失敗の結果のあとで例外を投げると書いています（出典1）。`try` で囲んでおかないと、プロセスごと止まります。

### 失敗を減らすのはスキーマの側

スキーマが深く入れ子になり、必須の項目が多いほど、満たすのは難しくなります（出典1）。文から読み取れないことがある項目は、任意にしておくのが公式のすすめです（出典1）。

1本目の `due_date` は、必須のまま `null` を許しました。期限の無い問い合わせでも、項目そのものは必ず返ってきます。

`"format": "email"` のような `format` は、注記として扱われます（出典1）。SDK の検証では確かめられません（出典1）。メールアドレスの形まで確かめたいなら、受け取ったあとで自分のコードで調べます。

## zod でスキーマを書くなら target を draft-7 にする

スキーマは zod で書き、`z.toJSONSchema()` で変換することもできます（出典1）。

この記事で押さえるのは、変換の第2引数の `target: "draft-7"` です。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const Inquiry = z.object({
  category: z.enum(["billing", "bug", "feature_request", "other"]),
  priority: z.int().min(1).max(3).describe("1 が最も急ぎ"),
  summary: z.string(),
  due_date: z.string().nullable().describe("期限の日付。無ければ null"),
});

const schema = z.toJSONSchema(Inquiry, { target: "draft-7" });

for await (const message of query({
  prompt: "次の問い合わせを分類してください。\n\n件名: 画面が真っ白\nログインすると画面が真っ白になります。",
  options: {
    model: "haiku",
    tools: [],
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    outputFormat: { type: "json_schema", schema },
  },
})) {
  if (message.type === "result" && message.subtype === "success" && !message.is_error) {
    const parsed = Inquiry.safeParse(message.structured_output);
    if (parsed.success) {
      const inquiry: z.infer<typeof Inquiry> = parsed.data;
      console.log(`${inquiry.category} / 優先度 ${inquiry.priority} / 期限 ${inquiry.due_date ?? "なし"}`);
      console.log(inquiry.summary);
    } else {
      console.log(z.prettifyError(parsed.error));
    }
  }
}
```

`classify-zod.ts` として保存します。

```bash
node classify-zod.ts
```

```text
bug / 優先度 2 / 期限 なし
ログイン後に画面が真っ白になる不具合の報告。
```

### target を省くと、起動した時点で止まる

SDK がスキーマの検証に使うのは、JSON Schema の draft-07 です（出典1）。zod は何も指定しないと Draft 2020-12 で書き出します（出典5）。

第2引数を外した版は、起動の時点で止まりました（出典1）。表示されたエラーのうち、原因の行を抜き出します。

```text
Error: Claude Code process exited with code 1. stderr: Error: --json-schema is not a valid JSON Schema: no schema with key or ref "https://json-schema.org/draft/2020-12/schema"
```

エラーの中の `$schema` の URL が、Draft 2020-12 を指しています。公式のページも、新しい版を宣言したスキーマは受け付けないと書いています（出典1）。

### structured_output は safeParse で読み直す

型定義では、`structured_output` は `unknown` です（出典3）。そのままではプロパティを読めないので、`safeParse` を通して型を付けました。

`structured_output` は、SDK がスキーマで検証した値です（出典1）。それでも読み直すのは、`z.infer` の型をアプリの中で使い回せるからです。失敗したときは `issues` を読みます。

## プロンプトで JSON を頼む書き方との違い

プロンプトに「JSON で答えて」と書くだけの方法もあります。その場合、答えは文字列で届き、形が合っているかは自分で確かめます。

`outputFormat` を使うと、形の確認と作り直しを SDK が受け持ちます（出典1）。

あなたのアプリでは、どの項目を必須にして、どの項目を任意にしますか。

## 料金はプランの利用枠から引かれる

この記事のコードは、プランでログインした Claude Code を通して動きます。使った分は、プランの利用枠から引かれます（出典7）。

結果の `total_cost_usd` は、定価で換算した見積もりです。型定義のコメントには「An estimate, not a billing statement」とあります（出典3）。プランで動かしたときの請求額としては読めません。

Pro は月払いで月20ドルです（出典8）。

## 出典

本文の（出典n）は、この表の番号です。確認日は、どれもページを読んだ日です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Get structured output from agents | https://code.claude.com/docs/en/agent-sdk/structured-outputs | 2026-11-11 |
| 2 | Troubleshooting (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/troubleshooting | 2026-11-11 |
| 3 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-11 |
| 4 | Environment variables (Claude Code) | https://code.claude.com/docs/en/env-vars | 2026-11-11 |
| 5 | JSON Schema（Zod） | https://zod.dev/json-schema | 2026-11-11 |
| 6 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-11 |
| 7 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-11 |
| 8 | Claude の料金プラン | https://claude.com/pricing | 2026-11-11 |
| 9 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | 2026-11-11 |

AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。
