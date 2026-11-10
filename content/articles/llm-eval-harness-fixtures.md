---
title: "LLM の回答を自動で採点する仕組みを作る【完全一致、部分一致、正規表現】"
slug: "llm-eval-harness-fixtures"
description: "LLM の回答を、完全一致、部分一致、正規表現の3つの方法で採点する TypeScript のプログラムを作ります。採点するのは手で書いた見本の回答なので、API キーは要りません。合格率が基準を下回ると、終了コード 1 で終わります。"
tags: ["LLM 評価", "TypeScript"]
main_keyword: "LLM 評価"
target_query: null
course_step: 6
prev: "mcp-connection-closed-fix"
next: "llm-as-a-judge-claude"
sources:
  - url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"
    title: "Define success criteria and build evaluations"
    accessed: 2026-11-02
  - url: "https://nodejs.org/docs/latest-v22.x/api/typescript.html"
    title: "Node.js v22 Modules: TypeScript"
    accessed: 2026-11-10
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize"
    title: "String.prototype.normalize() - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes"
    title: "String.prototype.includes() - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test"
    title: "RegExp.prototype.test() - JavaScript | MDN"
    accessed: 2026-11-10
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookbehind_assertion"
    title: "Lookbehind assertion - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion"
    title: "Input boundary assertion - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://nodejs.org/docs/latest-v22.x/api/process.html"
    title: "Node.js v22 Process"
    accessed: 2026-11-02
  - url: "https://docs.github.com/en/actions/how-tos/create-and-publish-actions/set-exit-codes"
    title: "Setting exit codes for actions - GitHub Docs"
    accessed: 2026-11-02
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing"
    accessed: 2026-11-02
cost_estimate: "記事のコードは API を呼ばないので無料です。見本の代わりにモデルの回答を採点すると、回答を作らせる分の API の料金がかかります。"
run_environment: "Node.js 22.22.0、npm 10.9.4、依存パッケージなし、Linux x86_64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-10"
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-10
---

プロンプトを1行直すたびに LLM の回答を目で読み直していると、テストケースの件数だけ読む量が増えます。この記事で作るのは、回答を完全一致、部分一致、正規表現の3つの方法で採点する TypeScript のプログラムです。合格率が基準を下回ると終了コード 1 で終わるので、変更で回答が悪くなったことに実行1回で気づけます。

採点するのは、手で書いた見本の回答です。モデルの実際の出力ではないので、API キーは要りません。モデルを呼ぶ処理を足すときは、`answers.ts` の中身をモデルの回答に置き換えます。

対象は、LLM を組み込んだアプリを作り始めて、回答の良し悪しを数字で見たくなった人です。書き写すコードは6ファイルで102行、依存パッケージはありません。

[前の記事](/posts/mcp-connection-closed-fix)は、MCP サーバーの回でした。この記事から、講座は LLM の評価に入ります。

## 採点の方法は期待する答えの形で決まる

3つの採点方法は、どれも回答の文字列を決まった規則で調べるので、モデルを呼びません。どれを使うかは、テストケースで期待する答えがどんな形かで決めます。

| 期待する答えの形 | 採点の方法 | この記事の例 |
|---|---|---|
| 決まった1語のラベル | 完全一致 | 感情の分類（positive、negative、neutral） |
| 必ず触れてほしい語がある文章 | 部分一致 | 返品の条件（「30日」と「レシート」） |
| 数字の境目か書式を確かめたい | 正規表現 | 注文の件数、YYYY-MM-DD の日付 |

Anthropic の評価の作り方のページは、コードでの採点を最も速く、最も信頼できる方法に挙げています（出典1）。ただし、規則で割り切れない複雑な判断には向きません（出典1）。文章のトーンのように規則で決められない観点は、講座の次の記事で扱う LLM による採点に回します。

## 動かした環境と作るファイル

動かしたのは Node.js 22.22.0 と npm 10.9.4 で、OS は Linux（x86_64）です。Node.js 22 系で `.ts` を `node` のまま実行するには、22.18.0 以降が要ります（出典2）。

Node.js 22 系は 22.18.0 から、型の記述を取り除いて `.ts` を実行します（出典2）。型の検査はしません（出典2）。手元では、TypeScript 7.0.2 の `tsc` でも型の誤りが無いことを確かめました。

作業フォルダ `llm-eval` を作って移ります。

```bash
mkdir llm-eval
cd llm-eval
```

できあがる作業フォルダの形は、次のとおりです。

```text
llm-eval/
  package.json
  graders.ts
  cases.ts
  answers.ts
  run-eval.ts
  compare.ts
```

`package.json` を置きます。依存パッケージは書いていません。`"type": "module"` は、`import` と `export` を使うための指定です（出典2）。

```json
{
  "name": "llm-eval",
  "version": "0.1.0",
  "private": true,
  "type": "module"
}
```

## graders.ts の grade 関数が3つの採点方法を切り替える

採点関数 `grade` は、回答の文字列と採点の指定を受け取り、合否と理由を返します。指定の種類は `exact`、`contains`、`regex` の3つで、分岐は `switch` 文です。

`graders.ts` を置きます。

```ts
export type Grader =
  | { type: "exact"; expected: string }
  | { type: "contains"; keywords: string[] }
  | { type: "regex"; pattern: string };

export type GradeResult = { pass: boolean; reason: string };

export function normalize(text: string): string {
  return text.normalize("NFKC").trim().toLowerCase();
}

export function grade(answer: string, grader: Grader): GradeResult {
  const text = normalize(answer);
  switch (grader.type) {
    case "exact": {
      const expected = normalize(grader.expected);
      return text === expected
        ? { pass: true, reason: "完全一致" }
        : { pass: false, reason: `期待した答え "${expected}" と違う` };
    }
    case "contains": {
      const missing = grader.keywords.filter((k) => !text.includes(normalize(k)));
      return missing.length === 0
        ? { pass: true, reason: "キーワードをすべて含む" }
        : { pass: false, reason: `足りないキーワード: ${missing.join(", ")}` };
    }
    case "regex": {
      const matched = new RegExp(grader.pattern).test(text);
      return matched
        ? { pass: true, reason: `/${grader.pattern}/ に合う` }
        : { pass: false, reason: `/${grader.pattern}/ に合わない` };
    }
  }
}
```

### 比べる前に normalize で表記の揺れをそろえる

3つの採点方法とも、比べる相手は `normalize` に通したあとの回答です。`normalize` は、前後の空白を除き、英字を小文字にし、Unicode の NFKC 正規化をかけます。

NFKC は、見た目が違っても同じ文字として扱ってよい文字を、1つの形にそろえる正規化です（出典3）。手元で確かめると、全角の「３０日」は「30日」になりました。`includes` は大文字と小文字を区別します（出典4）。`normalize` を通さずに比べると、見本の回答の「Negative」も「３０日」も不合格になりました。

正規表現も、`normalize` を通したあとの文字列にかけます。そのため、パターンの中の数字と英字は半角の小文字で書きます。

### 正規表現のパターンは文字列で持たせる

`regex` の指定は、パターンを文字列で持たせました。テストケースを JSON に書き出せる形にしておくためです。

文字列のパターンは、採点のたびに `new RegExp` で正規表現のオブジェクトに直してから使います。`test()` は、一致する箇所があれば true を、無ければ false を返します（出典5）。

## テストケースと見本の回答を分けた2つのファイル

テストケースは、質問と採点の指定の組です。回答は別のファイルに分けました。回答は実行のたびに入れ替わり、テストケースは入れ替わらないからです。

`cases.ts` を置きます。5件のうち、完全一致が2件、部分一致が1件、正規表現が2件です。

```ts
import type { Grader } from "./graders.ts";

export type EvalCase = { id: string; question: string; grader: Grader };

export const cases: EvalCase[] = [
  {
    id: "sentiment-1",
    question: "次のレビューの感情を positive、negative、neutral のどれか1語で答えてください。「届いた翌日に動かなくなりました。」",
    grader: { type: "exact", expected: "negative" },
  },
  {
    id: "sentiment-2",
    question: "次のレビューの感情を positive、negative、neutral のどれか1語で答えてください。「色は写真のとおりでした。」",
    grader: { type: "exact", expected: "neutral" },
  },
  {
    id: "refund",
    question: "購入した商品は何日以内なら返品できますか。返品に必要なものも答えてください。",
    grader: { type: "contains", keywords: ["30日", "レシート"] },
  },
  {
    id: "order-count",
    question: "「本日の注文は3件、うち1件はキャンセルです。」注文は何件ですか。",
    grader: { type: "regex", pattern: "(?<!\\d)3件" },
  },
  {
    id: "delivery-date",
    question: "「納品日は2026年11月20日です。」から日付を YYYY-MM-DD の形で抜き出し、日付だけを返してください。",
    grader: { type: "regex", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
  },
];
```

1行目の `import type` は省けません。`type` が無いと、Node.js はその `import` を値の読み込みとして扱います（出典2）。その結果、実行時にエラーになります（出典2）。

`answers.ts` に置くのは、テストケースの `id` ごとの見本の回答です。どれも手で書いた文字列です。

```ts
// 手で書いた見本の回答。モデルが実際に出力したものではない。
export const answers: Record<string, string> = {
  "sentiment-1": "Negative",
  "sentiment-2": "neutral です。",
  refund: "購入から３０日以内なら返品できます。レシートをお持ちください。",
  "order-count": "注文は3件です。",
  "delivery-date": "納品日は 2026-11-20 です。",
};
```

見本には、合格する回答と不合格になる回答を混ぜました。採点関数が不合格を出せることも、確かめておく必要があるからです。

## 合格率が基準を下回ったら終了コード 1 で終わる

`run-eval.ts` は、テストケースを順に採点し、1件ずつ結果を表示します。最後に合格率を出し、基準の80%に届かなければ終了コードを 1 にする作りです。

```ts
import { answers } from "./answers.ts";
import { cases } from "./cases.ts";
import { grade } from "./graders.ts";

const THRESHOLD = 0.8;

let passed = 0;
for (const c of cases) {
  const answer = answers[c.id] ?? "";
  const result = grade(answer, c.grader);
  if (result.pass) passed++;
  console.log(`${result.pass ? "PASS" : "FAIL"} ${c.id} [${c.grader.type}] ${result.reason}`);
  if (!result.pass) console.log(`     回答: ${JSON.stringify(answer)}`);
}

const rate = passed / cases.length;
console.log(`合格 ${passed}/${cases.length} (${Math.round(rate * 100)}%)、基準 ${THRESHOLD * 100}%`);
if (rate < THRESHOLD) process.exitCode = 1;
```

不合格のときだけ、回答を `JSON.stringify` で表示します。回答が引用符でくくられ、中の改行は `\n` と表示されます。どこまでが回答かを1行で読めるのが、`JSON.stringify` を使う理由です。見本の回答が無いテストケースは、空の文字列として採点します。手元で空の文字列を3つの方法のどれで採点しても、不合格でした。

`process.exitCode` に入れた値は、プロセスが正常に終わったときの終了コードになります（出典8）。

実行して、終了コードも表示します。

```bash
node run-eval.ts; echo "終了コード: $?"
```

```text
PASS sentiment-1 [exact] 完全一致
FAIL sentiment-2 [exact] 期待した答え "neutral" と違う
     回答: "neutral です。"
PASS refund [contains] キーワードをすべて含む
PASS order-count [regex] /(?<!\d)3件/ に合う
FAIL delivery-date [regex] /^\d{4}-\d{2}-\d{2}$/ に合わない
     回答: "納品日は 2026-11-20 です。"
合格 3/5 (60%)、基準 80%
終了コード: 1
```

5件中3件が合格で、60% は基準の80%に届きません。終了コードは 1 です。GitHub Actions のアクションは、0 以外の終了コードを失敗として扱います（出典9）。

### 形の指定に合わない回答はプロンプトの側で直す

不合格の2件は、どちらも答えの中身は合っています。`sentiment-2` は「neutral」の後ろに「です」と句点が付きました。`delivery-date` は、日付の前後に文が付いています。

この2件を合格にしたくなっても、採点を部分一致に緩めることはしません。質問は「1語で」「日付だけを」と形を指定していて、余計な文字が付いた回答は、受け取る側のコードで扱えないからです。直すのはプロンプトの側で、形の指定を強めるか、構造化出力で JSON を返させます。

`delivery-date` の正規表現は、`^` で先頭を、`$` で末尾を指定しています（出典7）。かける相手は `normalize` を通したあとの回答です。前後の空白と改行は取り除かれ、全角の数字は半角になります。手元では「 2026-11-20」も「２０２６-１１-２０」も合格でした。日付の後ろに句点を付けた回答は、不合格です。ただし、この正規表現が見ているのは形だけで、「2026-11-21」と答えても合格になります。日付の値まで確かめたいテストケースには、完全一致を使ってください。

## 部分一致は「13件」の答えも3件として通す

部分一致は、指定した語が回答のどこかに含まれていれば合格です（出典4）。その手軽さのせいで、間違った回答を合格にすることがあります。

注文の件数を部分一致の「3件」で採点した場合と、正規表現で採点した場合を `compare.ts` で比べます。回答は「13件」と間違えた見本です。

```ts
import { grade } from "./graders.ts";

const answer = "注文は13件です。";
console.log("contains:", grade(answer, { type: "contains", keywords: ["3件"] }));
console.log("regex:   ", grade(answer, { type: "regex", pattern: "(?<!\\d)3件" }));
```

```bash
node compare.ts
```

```text
contains: { pass: true, reason: 'キーワードをすべて含む' }
regex:    { pass: false, reason: '/(?<!\\d)3件/ に合わない' }
```

部分一致は、「13件」の中にある「3件」を見つけて合格にしました。正規表現は不合格です。

`(?<!\d)` は否定の後読みで、すぐ左が数字でないときだけ一致します（出典6）。「13件」の「3」の左には「1」があるので、一致しません。数字をキーワードにするテストケースでは、部分一致を使わずに正規表現で境目を指定してください。

## 料金がかかる操作とかからない操作

この記事のコードは API を呼ばないので、料金はかかりません。外への通信が失敗する環境でも、`run-eval.ts` と `compare.ts` は同じ結果を出しました。

料金がかかるのは、見本の代わりにモデルに回答を作らせる操作です。テストケース1件ごとに1回、モデルへのリクエストが増えます。Claude Haiku 5.5 は、100万トークンで入力 0.10 ドル、出力 0.50 ドルです（出典10）。この単価は、プロンプトが10万トークン以下の場合です（出典10）。この記事ではモデルを呼んでいないので、1回あたりの金額は計っていません。

## 自分のアプリで使い始める前に確かめること

採点のプログラムを自分のテストケースで動かす前に、次の4つをすべて確かめてください。

- 期待する答えが1語のラベルなら、完全一致で採点している
- 数字をキーワードにするテストケースは、部分一致を使わずに正規表現で境目を指定している
- 見本の回答に、不合格になるものを少なくとも1件入れて、FAIL が出ることを確かめた
- 基準の合格率を決め、下回ったときに終了コードが 1 になることを確かめた

回答を JSON で返させるアプリなら、文字列で比べる前に形を検証する方法も使えます。検証のコードは[zod の記事](/posts/zod-validate-llm-json-output)にあります。

基準の80%は、この記事のために決めた値です。あなたのアプリでは、何件に1件の不合格までなら許せますか。

講座の次の記事では、完全一致でも正規表現でも決められない観点を、Claude に採点させます。[次の記事](/posts/llm-as-a-judge-claude)に進んでください。

## 出典

確認日は、出典2と出典5が 2026-11-10、ほかは 2026-11-02 です。本文の（出典1）などの番号は、この表の番号を指します。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Define success criteria and build evaluations | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | 2026-11-02 |
| 2 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | 2026-11-10 |
| 3 | String.prototype.normalize()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize | 2026-11-02 |
| 4 | String.prototype.includes()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes | 2026-11-02 |
| 5 | RegExp.prototype.test()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test | 2026-11-10 |
| 6 | Lookbehind assertion（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookbehind_assertion | 2026-11-02 |
| 7 | Input boundary assertion（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion | 2026-11-02 |
| 8 | Node.js v22 Process | https://nodejs.org/docs/latest-v22.x/api/process.html | 2026-11-02 |
| 9 | Setting exit codes for actions（GitHub Docs） | https://docs.github.com/en/actions/how-tos/create-and-publish-actions/set-exit-codes | 2026-11-02 |
| 10 | Pricing | https://platform.claude.com/docs/en/about-claude/pricing | 2026-11-02 |

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
