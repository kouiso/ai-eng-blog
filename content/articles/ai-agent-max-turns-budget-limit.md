---
title: "AI エージェントが止まらないのを防ぐ【Claude Agent SDK の maxTurns と maxBudgetUsd】"
slug: "ai-agent-max-turns-budget-limit"
description: "Claude Agent SDK の maxTurns と maxBudgetUsd で、エージェントを止めます。止まったときに届く result と、そのあとの例外の受け止め方を、実行結果つきで示します。"
tags: ["AIエージェント", "Claude Agent SDK", "TypeScript"]
main_keyword: "AIエージェント"
target_query: null
course_step: 4
cost_estimate: "記事のコードは読者自身の Claude プランの利用枠から引かれます。SDK の total_cost_usd は手元で計算した見積もりで、結果を載せた6回の合計は約0.0044ドルでした。"
run_environment: "Node.js 22.22.0、npm 10.9.4、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、モデル claude-haiku-5-5、Linux x86_64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-10"
prev: "claude-agent-sdk-first-agent"
next: "ai-agent-safe-file-tool"
sources:
  - url: "https://code.claude.com/docs/en/agent-sdk/agent-loop"
    title: "How the agent loop works"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/agent-sdk/typescript"
    title: "Agent SDK reference - TypeScript"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/agent-sdk/cost-tracking"
    title: "Track cost and usage"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/agent-sdk/quickstart"
    title: "Quickstart (Agent SDK)"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/legal-and-compliance"
    title: "Legal and compliance (Claude Code)"
    accessed: 2026-11-10
  - url: "https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan"
    title: "Use the Claude Agent SDK with your Claude plan"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/authentication"
    title: "Authentication (Claude Code)"
    accessed: 2026-11-10
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing (Claude API)"
    accessed: 2026-11-10
  - url: "https://nodejs.org/docs/v22.22.0/api/typescript.html"
    title: "Node.js v22.22.0 Modules: TypeScript"
    accessed: 2026-11-10
  - url: "https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk"
    title: "@anthropic-ai/claude-agent-sdk（npm）"
    accessed: 2026-11-10
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-10
---

Agent SDK のエージェントは、Claude がツールを呼ばない返答を出すまでループを続けます（出典1）。止める手段は、`query()` に渡す2つの上限です。`maxTurns` は応答の回数、`maxBudgetUsd` は米ドルでの見積もり額を数えます（出典1）。

上限に達したときに届くのは、失敗を示す result です。そのあと、`for await` のループが例外を投げます。`try` で囲まなければ、プロセスは終了コード 1 で止まりました。どれも、自分の Claude プランで実際に動かして確かめた結果です。

この記事は[前の記事](/posts/claude-agent-sdk-first-agent)の続きです。`query()` を一度動かした人を対象にしています。Messages API でループを自作する場合の上限の足し方は、別の記事で扱います。リンク先は[自作ループの記事](/posts/ai-agent-tool-use-loop-typescript)です。

## 上限は2つあり、止まると result のあとに例外が来る

先に、2つの上限で止めたときに届くものを表に並べます。値は、この記事の実行ログからそのまま写しました。

| 項目 | `maxTurns` | `maxBudgetUsd` |
|---|---|---|
| 数えるもの | Claude の応答の回数 | `total_cost_usd` の見積もり額（米ドル） |
| 渡さないとき | 上限なし（出典1） | 上限なし（出典1） |
| `subtype` | `error_max_turns` | `error_max_budget_usd` |
| `terminal_reason` | `max_turns` | `budget_exhausted` |
| `errors` の文 | `Reached maximum number of turns (2)` | `Reached maximum budget ($0.0005)` |
| そのあと | `for await` が例外を投げる | `for await` が例外を投げる |

どちらで止まっても、`result` の欄に最後の回答は入りません（出典1）。読むのは `subtype` と `errors` です。例外は result を受け取ったあとに来るので、result を読んでから `catch` で後始末をします。

両方を入れておくのが、この記事の結論です。回数の上限は、ツールを呼び続けて終わらない状態を止めます。金額の上限は、応答が少なくても1回ごとの額が大きい場合に止めます。

## 動かした環境とプランで試す前提

検証した環境は次のとおりです。モデルは `haiku` を指定し、init メッセージには `claude-haiku-5-5` と出ました。

- Node.js 22.22.0、npm 10.9.4、Linux x86_64
- `@anthropic-ai/claude-agent-sdk` 0.3.322
- SDK に同梱の Claude Code 2.1.322
- 環境変数 `ANTHROPIC_API_KEY` は未設定

0.3.322 は、2026-11-10 の時点で npm の最新版です（出典10）。SDK の動作に必要な Node.js は 18.14 以上です（出典4）。SDK は Claude Code の本体を同梱しているので、別に入れる必要はありません（出典4）。プランでのログインの手順は、前の記事にあります。

`ANTHROPIC_API_KEY` が設定されていると、プランより先に API キーが使われます（出典7）。プランで試すなら、外してから実行してください。

### プランで動かしてよいのは、自分で試す範囲です

プランでログインしていれば、Agent SDK の利用はプランの利用枠から引かれます（出典6）。その利用枠は、Claude Code と Agent SDK を個人がふつうに使う前提の量です（出典5）。

ほかの人に使わせるアプリかサービスに組み込むなら、認証の方法が変わってきます。使うのは、Claude Console で発行した API キーです（出典5）。利用者に代わってプランの認証情報で通信を中継することは、禁止されています（出典5）。

### 作業フォルダと見本のメモを作る

Node.js の版を確かめてから、作業フォルダに SDK を入れます。SDK の版は、`--save-exact` で 0.3.322 に固定しました。

```bash
node -v
```

```text
v22.22.0
```

```bash
mkdir agent-limits
cd agent-limits
npm init -y > /dev/null
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322
cat package.json
```

```text

added 105 packages, and audited 106 packages in 6s

36 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
{
  "name": "agent-limits",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "0.3.322"
  }
}
```

`"type": "module"` にしておくと、トップレベルで `await` を書けます（出典4）。`.ts` のファイルは、`node` にそのまま渡せば動きます。Node.js 22.18.0 から、型の注釈を外して動かす機能が既定で有効です（出典9）。ほかの `.ts` を読み込むときは、`./run-agent.ts` のように拡張子まで書きます（出典9）。

エージェントに読ませるメモを3つ用意します。作る処理は `setup.ts` に書きました。

```ts
import { mkdirSync, writeFileSync } from "node:fs";

// エージェントに読ませる見本のメモを docs/ に3つ作る
mkdirSync("docs", { recursive: true });
writeFileSync("docs/cancel.md", "# 予約の取り消し\n\n前日の18時までなら無料で取り消せます。\n");
writeFileSync("docs/payment.md", "# 支払い方法\n\nクレジットカードと銀行振込に対応しています。\n");
writeFileSync("docs/parking.md", "# 駐車場\n\n建物の裏に5台分あります。\n");
console.log("docs/ に3つのファイルを作りました");
```

```bash
node setup.ts
```

```text
docs/ に3つのファイルを作りました
```

## maxTurns は「ツールを呼んだ応答の数と、最後の返答の1回」で決める

1ターンは、Claude の応答1回と、その応答が呼んだツールの実行です（出典1）。1回の応答で複数のツールを同時に呼んでも、1ターンです。ツールを呼ばない最後の回答にも、1ターン要ります（出典1）。

3つのスクリプトで共通に使う部分は、`run-agent.ts` に置きました。

```ts
import { query, type Options, type SDKResultMessage } from "@anthropic-ai/claude-agent-sdk";

// 3つのスクリプトで共通に使う設定。ツールは読むだけの Glob と Read に絞る
export const baseOptions: Options = {
  model: "haiku",
  tools: ["Glob", "Read"],
  allowedTools: ["Glob", "Read"],
  systemPrompt: "あなたは作業フォルダのファイルを調べて質問に答えるアシスタントです。",
  settingSources: [],
};

export const task =
  "docs フォルダの .md ファイルを Glob のパターン docs/*.md で探し、1ファイルずつ Read で読んで、" +
  "ファイル名と1行目の見出しを1行ずつ答えてください。";

export function printResult(result: SDKResultMessage): void {
  console.log(`subtype: ${result.subtype}`);
  console.log(`num_turns: ${result.num_turns}`);
  console.log(`terminal_reason: ${result.terminal_reason}`);
  console.log(`total_cost_usd: ${result.total_cost_usd}`);
  if (result.subtype === "success") {
    console.log(`result: ${result.result}`);
  } else {
    console.log(`errors: ${result.errors.join(" / ")}`);
  }
}

// エージェントを1回動かす。上限で止まったときに for await が投げる例外もここで受け止める
export async function runAgent(options: Options): Promise<void> {
  // 1回の応答が複数のメッセージに分かれて届くので、message.id が変わったら次の応答と数える
  let response = 0;
  let lastId = "";
  try {
    for await (const message of query({ prompt: task, options })) {
      if (message.type === "system" && message.subtype === "init") {
        console.log(`init: ${message.model} / apiKeySource ${message.apiKeySource} / Claude Code ${message.claude_code_version}`);
      }
      if (message.type === "assistant") {
        if (message.message.id !== lastId) {
          response += 1;
          lastId = message.message.id;
        }
        for (const block of message.message.content) {
          if (block.type === "tool_use") {
            console.log(`応答${response}: ${block.name} を呼ぶ`);
          }
        }
      }
      if (message.type === "result") {
        printResult(message);
      }
    }
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    console.log(`catch: ${text}`);
  }
}
```

`baseOptions` の各項目は、次のように選びました。

- `tools` に、使えるツールの名前を並べます（出典2）。渡したのは、ファイルを読む Glob と Read の2つです。
- `allowedTools` に挙げたツールは、確認なしで実行されます（出典2）。
- `systemPrompt` に文字列を渡すと、その文がシステムプロンプトになります（出典2）。
- `settingSources: []` は、ユーザー、プロジェクト、ローカルの設定を読まない指定です（出典2）。記事と同じ条件で動かすために入れました。

応答の数え方にも理由があります。1回の応答で呼んだツールは、ツールごとに別のメッセージで届きます（出典1）。同じ応答のメッセージは、どれも ID が同じです（出典3）。`message.id` が変わった回数が、応答の回数です。

`turns-limit.ts` は、コマンドの引数を `maxTurns` に渡します。

```ts
import { baseOptions, runAgent } from "./run-agent.ts";

// node turns-limit.ts 2 のように、maxTurns をコマンドの引数で渡す
const maxTurns = Number(process.argv[2]);
console.log(`maxTurns: ${maxTurns}`);
await runAgent({ ...baseOptions, maxTurns });
```

### maxTurns: 2 だと、最後の回答の前で止まる

上限を2にして動かします。

```bash
node turns-limit.ts 2
```

```text
maxTurns: 2
init: claude-haiku-5-5 / apiKeySource none / Claude Code 2.1.322
応答1: Glob を呼ぶ
応答2: Read を呼ぶ
応答2: Read を呼ぶ
応答2: Read を呼ぶ
subtype: error_max_turns
num_turns: 3
terminal_reason: max_turns
total_cost_usd: 0.00069775
errors: Reached maximum number of turns (2)
catch: Claude Code returned an error result: Reached maximum number of turns (2)
```

応答1で Glob、応答2で Read を3つ同時に呼びました。ファイルは3つとも読めています。それでも回答の応答に使うターンが残らず、`error_max_turns` で止まりました。`apiKeySource` が `none` なので、API キーは使っていません。

### 同じ依頼でも、必要な応答の数は回によって変わる

上限を10にすると、最後まで答えました。

```bash
node turns-limit.ts 10
```

```text
maxTurns: 10
init: claude-haiku-5-5 / apiKeySource none / Claude Code 2.1.322
応答1: Glob を呼ぶ
応答2: Read を呼ぶ
応答3: Read を呼ぶ
応答3: Read を呼ぶ
subtype: success
num_turns: 5
terminal_reason: completed
total_cost_usd: 0.00105244
result: - payment.md: # 支払い方法
- parking.md: # 駐車場
- cancel.md: # 予約の取り消し
```

今度は Read を応答2と応答3に分けて呼び、最後の回答を含めて4回応答しました。同じ依頼を `node turns-limit.ts 3` で3回動かすと、3回とも応答3回で終わっています。4回かかったこの実行は、`maxTurns: 3` なら回答の前で止まっていた計算です。

上限は、成功したときの応答の数ちょうどに合わせないでください。何回か動かして最も多かった応答の数を見て、余裕を足します。この記事では、最多の4回に余裕を足して10にしました。

`num_turns` は、応答の数を数えるのには使えません。応答3回の実行も4回の実行も、`num_turns` は 5 でした。`maxTurns` で止まった実行では、上限より1多い値でした。応答の数は、上のコードのように `message.id` で数えます。

## maxBudgetUsd は、上限を超えた応答のあとで止まる

金額の上限と見積もり額を比べるのは、応答が届いたあとです（出典1）。上限に届いた応答は最後まで処理され、その分も合計に入ります。そのため、合計は応答1回分まで上限を超えます（出典1）。

`budget-limit.ts` の引数は、`maxBudgetUsd` の値です。

```ts
import { baseOptions, runAgent } from "./run-agent.ts";

// node budget-limit.ts 0.002 のように、maxBudgetUsd（米ドル）をコマンドの引数で渡す
const maxBudgetUsd = Number(process.argv[2]);
console.log(`maxBudgetUsd: ${maxBudgetUsd}`);
await runAgent({ ...baseOptions, maxBudgetUsd });
```

上限を 0.0005 ドルにして動かします。

```bash
node budget-limit.ts 0.0005
```

```text
maxBudgetUsd: 0.0005
init: claude-haiku-5-5 / apiKeySource none / Claude Code 2.1.322
応答1: Glob を呼ぶ
応答2: Read を呼ぶ
応答2: Read を呼ぶ
応答2: Read を呼ぶ
subtype: error_max_budget_usd
num_turns: 4
terminal_reason: budget_exhausted
total_cost_usd: 0.0006513999999999999
errors: Reached maximum budget ($0.0005)
catch: Claude Code returned an error result: Reached maximum budget ($0.0005)
```

止まったときの合計は約 0.00065 ドルで、上限より約30%多い額です。上限を 0.0008 ドルに上げても、合計は上限を超えてから止まりました。

```bash
node budget-limit.ts 0.0008
```

```text
maxBudgetUsd: 0.0008
init: claude-haiku-5-5 / apiKeySource none / Claude Code 2.1.322
応答1: Glob を呼ぶ
応答2: Read を呼ぶ
応答2: Read を呼ぶ
応答2: Read を呼ぶ
subtype: error_max_budget_usd
num_turns: 5
terminal_reason: budget_exhausted
total_cost_usd: 0.00086785
errors: Reached maximum budget ($0.0008)
catch: Claude Code returned an error result: Reached maximum budget ($0.0008)
```

2回とも、ファイルを読み終えた時点で止まり、回答は返っていません。この依頼の成功時の見積もりは、最も高かった実行で 0.00105244 ドルでした。その約2倍の 0.0021 ドルなら、最後まで答えます。

```bash
node budget-limit.ts 0.0021
```

```text
maxBudgetUsd: 0.0021
init: claude-haiku-5-5 / apiKeySource none / Claude Code 2.1.322
応答1: Glob を呼ぶ
応答2: Read を呼ぶ
応答2: Read を呼ぶ
応答2: Read を呼ぶ
subtype: success
num_turns: 5
terminal_reason: completed
total_cost_usd: 0.00085736
result: docs フォルダには .md ファイルが 3 つあり、1 行目の見出しは次のとおりです。

- payment.md: # 支払い方法
- parking.md: # 駐車場
- cancel.md: # 予約の取り消し
```

金額の上限は、払ってもよい額から応答1回分を引いた値にします。超える分は止められないからです。

## 上限で止まると、for await のループが例外を投げる

1回きりの `query()` が例外を投げるのは、失敗の result を渡したあとです（出典1）。これは意図された動きで、続けたいならループを `try` で囲みます（出典1）。

囲まないとどうなるかを、`no-catch.ts` で確かめます。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";
import { baseOptions, printResult, task } from "./run-agent.ts";

// try/catch を付けずに maxTurns: 1 で動かすと、result を受け取ったあとで例外が投げられる
for await (const message of query({ prompt: task, options: { ...baseOptions, maxTurns: 1 } })) {
  if (message.type === "result") {
    printResult(message);
  }
}
console.log("ループのあとの行");
```

標準エラーは長いため、ファイルに逃がして終了コードを表示する形にしました。

```bash
node no-catch.ts 2> stderr.txt; echo "exit=$?"
```

```text
subtype: error_max_turns
num_turns: 2
terminal_reason: max_turns
total_cost_usd: 0.00023248000000000002
errors: Reached maximum number of turns (1)
exit=1
```

result は届き、表示もされました。その直後に例外でプロセスが終わり、「ループのあとの行」は出ていません。標準エラーには、例外の文が残っています。

```bash
grep -n "^Error:" stderr.txt
```

```text
5:Error: Claude Code returned an error result: Reached maximum number of turns (1)
```

`runAgent` は、同じ例外を `catch` で受けて1行表示します。そのあとも処理は止まりません。`catch` には、result が届かない失敗も入ります。接続の失敗と、プロセスの失敗です（出典1）。result を受け取ったかどうかで、上限で止まったのか別の失敗なのかを分けられます。

上限で止まった作業を、上限を上げて再開しますか。それとも、そこで打ち切って人に結果を返しますか。

## 料金はプランの利用枠から引かれる

この記事のコードは、プランのログインで動かしました。その場合、Agent SDK の利用はプランの利用枠から引かれます（出典6）。

`total_cost_usd` は、SDK が手元で計算する見積もりです（出典3）。SDK に同梱した料金表から計算するので、請求額と一致するとは限りません（出典3）。プランで動かしたときの請求額でもありません。結果を載せた6回の実行の合計は、約0.0044ドルの見積もりでした。

`maxBudgetUsd` が比べる相手も、この見積もりです（出典2）。プランで動かしても上限として働くことは、上の実行で確かめました。

API キーで動かす場合は、料金ページの単価で請求されます（出典8）。Haiku 5.5 の単価は、100万トークンあたり入力 0.10 ドル、出力 0.50 ドルです（出典8）。この値はプロンプトが10万トークン以下の場合の料金です（出典8）。

## 上限を入れたエージェントで確かめること

自分のエージェントに上限を入れたら、次の4つをすべて確かめてください。

- 同じ依頼を数回動かし、最も多かった応答の数に余裕を足して `maxTurns` を決めた
- 払ってもよい額から応答1回分を引いて `maxBudgetUsd` を決めた
- `for await` のループを `try` で囲み、`catch` のあとも処理が続く
- `result` を読む前に `subtype` が `success` かを確かめている

[次の記事](/posts/ai-agent-safe-file-tool)では、ファイル操作ツールを安全に作ります。エージェントに作業フォルダの外を読ませない方法です。

## 出典

本文の（出典n）は、この表の番号を指します。確認日はどれも 2026-11-10 です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | 2026-11-10 |
| 2 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | 2026-11-10 |
| 3 | Track cost and usage | https://code.claude.com/docs/en/agent-sdk/cost-tracking | 2026-11-10 |
| 4 | Quickstart (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/quickstart | 2026-11-10 |
| 5 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | 2026-11-10 |
| 6 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-10 |
| 7 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-10 |
| 8 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | 2026-11-10 |
| 9 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | 2026-11-10 |
| 10 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-10 |

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
