---
title: "RAG で検索結果を渡して出典つきで回答させる【Claude Agent SDK、出典の番号を検証する】"
slug: "rag-answer-with-citations-claude"
description: "BM25 で取り出した資料に番号を振って Claude に渡し、回答と出典の番号と引用文を JSON で受け取ります。出典が渡した資料に本当にあるかをコードで確かめ、答えが無い質問では答えられないと返させます。"
tags: ["RAG", "Claude Agent SDK", "TypeScript"]
main_keyword: "RAG"
target_query: "rag 出典"
course_step: 3
cost_estimate: "記事のコードは読者自身の Claude プランの利用枠から引かれます。Pro は月払いで月20ドルです。SDK が出す total_cost_usd は定価で換算した見積もりで、プランでの請求額とは別の数字です。"
run_environment: "Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS（Darwin arm64）、型の確認は TypeScript 7.0.2"
verified_at: "2026-11-11"
prev: "rag-local-embeddings-transformers-js"
next: "rag-hybrid-search-rrf"
sources:
  - url: "https://www.anthropic.com/news/contextual-retrieval"
    title: "Introducing Contextual Retrieval"
    accessed: 2026-11-11
  - url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations"
    title: "Reduce hallucinations"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/agent-sdk/structured-outputs"
    title: "Get structured output from agents"
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
  - url: "https://nodejs.org/docs/latest-v22.x/api/typescript.html"
    title: "Node.js v22 Modules: TypeScript"
    accessed: 2026-11-11
  - url: "https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk"
    title: "@anthropic-ai/claude-agent-sdk（npm）"
    accessed: 2026-11-11
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-11
---

RAG の回答に出典を付けるなら、資料に番号を振ってモデルに渡します。回答と一緒に、出典の番号と引用文を JSON で返させます。返ってきた出典は、渡した資料と突き合わせてコードで確かめます。

モデルは Claude Agent SDK の `query()` で呼びます。自分の Claude プランでログインしていれば、API キーは要りません。実行したときの init メッセージの `apiKeySource` は `"none"` でした。

同じ質問を5回ずつ動かしました。答えのある質問は、5回とも資料1の一文を出典にしています。答えの無い質問は5回とも「答えられない」を返し、出典は空でした。10回とも、出典の検証を通っています。

検索には、[BM25 の記事](/posts/rag-bm25-search-typescript)の検索器を使います。[前回](/posts/rag-local-embeddings-transformers-js)はベクトル検索でした。

## 動かすのに要る Node.js、プラン、ログイン

用意するのは Node.js と Claude のプラン、そのプランでログインした Claude Code です。

- Node.js 22.18.0 以上（出典8）。`.ts` のファイルを `node` で直接動かすためです。検証は 22.23.4 で行いました。
- Claude の Pro、Max、Ultra のどれか（出典5）。Pro は月払いで月20ドルです（出典7）。
- プランのアカウントでログインした Claude Code（出典5）

`ANTHROPIC_API_KEY` が入っていると、ログインより API キーが優先されます（出典5）。プランで試すなら、先に外れていることを確かめます。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

`set` と出たら、`unset ANTHROPIC_API_KEY` で外してから進めてください（出典5）。

## SDK を入れて、BM25 の検索器の3ファイルを置く

依存は SDK の1つです。記事と同じ版で試せるよう、`--save-exact` で 0.3.322 に固定します。

```bash
mkdir rag-citations
cd rag-citations
npm init -y
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322
```

```text

added 105 packages, and audited 106 packages in 11s

36 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

0.3.322 は、2026-11-11 の時点で npm の最新版です（出典9）。

[BM25 の記事](/posts/rag-bm25-search-typescript)の3ファイルを使います。1文字も変えていません。語の分け方とスコアの式は、そちらで説明しています。

`tokenize.ts` は、日本語の文を語に分けます。

```ts
const segmenter = new Intl.Segmenter("ja", { granularity: "word" });

export function tokenize(text: string): string[] {
  const normalized = text.normalize("NFKC").toLowerCase();
  const tokens: string[] = [];
  for (const { segment, isWordLike } of segmenter.segment(normalized)) {
    if (isWordLike) tokens.push(segment);
  }
  return tokens;
}
```

`bm25.ts` は、質問に近い文書をスコアの高い順に返します。

```ts
import { tokenize } from "./tokenize.ts";

export type Doc = { id: string; text: string };
export type Hit = { doc: Doc; score: number };

export function createSearch(docs: Doc[], k1 = 1.2, b = 0.75) {
  const tfs = docs.map((doc) => {
    const tf = new Map<string, number>();
    for (const term of tokenize(doc.text)) {
      tf.set(term, (tf.get(term) ?? 0) + 1);
    }
    return tf;
  });
  const lengths = docs.map((doc) => tokenize(doc.text).length);
  const avgdl = lengths.reduce((sum, n) => sum + n, 0) / docs.length;

  const df = new Map<string, number>();
  for (const tf of tfs) {
    for (const term of tf.keys()) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const idf = (term: string) => {
    const n = df.get(term) ?? 0;
    return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
  };

  return (query: string, topK = 3): Hit[] => {
    const terms = new Set(tokenize(query));
    const hits = docs.map((doc, i) => {
      let score = 0;
      for (const term of terms) {
        const f = tfs[i].get(term) ?? 0;
        if (f === 0) continue;
        const norm = k1 * (1 - b + (b * lengths[i]) / avgdl);
        score += (idf(term) * f) / (f + norm);
      }
      return { doc, score };
    });
    return hits
      .filter((hit) => hit.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, topK);
  };
}
```

`docs.ts` は、架空のネットショップのよくある質問8件です。

```ts
import type { Doc } from "./bm25.ts";

// 架空のネットショップのよくある質問です。
export const docs: Doc[] = [
  { id: "returns", text: "返品は、商品の到着から30日以内に受け付けます。返品できるのは未開封の商品だけです。" },
  { id: "cancel", text: "注文をキャンセルした場合、代金の払い戻しは5営業日以内にクレジットカード会社を通じて行います。" },
  { id: "payment", text: "支払い方法は、クレジットカード、コンビニ払い、PayPayが使えます。" },
  { id: "shipping-fee", text: "送料は全国一律550円です。5,000円以上の注文は送料無料になります。" },
  { id: "delivery", text: "注文から発送までは2営業日です。離島への配送には、さらに3日かかります。" },
  { id: "password", text: "パスワードを忘れた場合は、ログイン画面の再設定のリンクから新しいパスワードを登録してください。" },
  { id: "login", text: "ログインできないときは、メールアドレスの入力ミスがないか、ブラウザのCookieが有効かを確かめてください。" },
  {
    id: "points",
    text: "ポイントは、購入金額の1%を発送の翌日に付与します。返品した注文のポイントは取り消します。ポイントの有効期限は最後の購入から1年です。返品の手続き中はポイントを使えません。期限が切れたポイントは戻せません。ポイントは1ポイント1円として、次の注文の支払いに使えます。返品の対象外の商品でも、ポイントは付与します。",
  },
];
```

## verify.ts は、出典の番号と引用文を渡した資料と突き合わせる

モデルが返した出典は、そのまま信じずにコードで確かめます。問題として返すのは、次のどれかに当たったときです。

- 答えがあるのに、出典が1件も無い
- 答えられないと言いながら、出典が付いている
- 出典の番号の資料を渡していない。または、引用文がその資料に無い

```ts
import type { Doc } from "./bm25.ts";

export type Citation = { chunk: number; quote: string };
export type Answer = { answerable: boolean; answer: string; citations: Citation[] };

export function verify(answer: Answer, chunks: Doc[]): string[] {
  const problems: string[] = [];
  if (answer.answerable && answer.citations.length === 0) {
    problems.push("回答があるのに出典がありません");
  }
  if (!answer.answerable && answer.citations.length > 0) {
    problems.push("回答できないのに出典があります");
  }
  for (const { chunk, quote } of answer.citations) {
    const doc = chunks[chunk - 1];
    if (!doc) {
      problems.push(`資料${chunk}は渡していません`);
    } else if (!doc.text.includes(quote)) {
      problems.push(`資料${chunk}に「${quote}」はありません`);
    }
  }
  return problems;
}
```

`verify.ts` として保存します。引用文は `includes` で、資料の文字列にそのまま含まれるかを見ます。1文字でも書き換えた引用は通しません。ただし、空の引用文は `includes` が true を返すので、検証を通ります。短い引用も、資料に含まれていれば通ります。

番号は1から振るので、`chunks[chunk - 1]` で資料を引きます。0 や渡していない番号では `undefined` が返り、問題として数えます。

Anthropic の手引きも、主張ごとに引用を添えさせる方法を挙げています（出典2）。裏付けの引用が見つからない主張は取り下げさせる、という使い方です（出典2）。

動きを見るために、誤った回答を手で作って渡します。モデルが出した回答とは別物です。

```ts
import { docs } from "./docs.ts";
import { verify, type Answer } from "./verify.ts";

// 検証の動きを見るための、手で作った誤った回答です。
const chunks = [docs[0], docs[7]];
const sample: Answer = {
  answerable: true,
  answer: "返品は到着から14日以内です。",
  citations: [
    { chunk: 1, quote: "返品は、商品の到着から14日以内に受け付けます。" },
    { chunk: 3, quote: "送料は全国一律550円です。" },
  ],
};

console.log(verify(sample, chunks));
```

```bash
node check-sample.ts
```

```text
[ '資料1に「返品は、商品の到着から14日以内に受け付けます。」はありません', '資料3は渡していません' ]
```

1件目は、資料の「30日」を「14日」に書き換えた引用です。資料1にこの文は無いので、問題として返りました。2件目は、渡していない資料3を指しています。

## ask.ts は、番号を付けた資料と JSON スキーマを渡す

RAG は、知識ベースから取り出した情報を、ユーザーのプロンプトに足す方法です（出典1）。`ask.ts` は、検索とモデルの呼び出しと検証を1つにしたコードです。質問はコマンドの引数で受け取ります。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";
import { createSearch } from "./bm25.ts";
import { docs } from "./docs.ts";
import { verify, type Answer } from "./verify.ts";

const schema = {
  type: "object",
  properties: {
    answerable: { type: "boolean" },
    answer: { type: "string" },
    citations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          chunk: { type: "integer" },
          quote: { type: "string" },
        },
        required: ["chunk", "quote"],
        additionalProperties: false,
      },
    },
  },
  required: ["answerable", "answer", "citations"],
  additionalProperties: false,
};

const systemPrompt = `ネットショップの問い合わせに、渡された資料だけを使って答えてください。
citations には、答えに使った資料の番号と、その資料からそのまま写した一文を入れてください。
資料に答えが無いときは、answerable を false にし、citations を空にしてください。`;

const question = process.argv[2] ?? "";
const chunks = createSearch(docs)(question)
  .filter((hit) => hit.score >= 0.1)
  .map((hit) => hit.doc);

if (chunks.length === 0) {
  console.log("資料が見つからないので、モデルを呼ばずに「わかりません」と返します。");
  process.exit(0);
}

const prompt = `${chunks
  .map((doc, i) => `<chunk number="${i + 1}">\n${doc.text}\n</chunk>`)
  .join("\n")}

質問: ${question}`;

for await (const message of query({
  prompt,
  options: {
    model: "haiku",
    systemPrompt,
    tools: [],
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    outputFormat: { type: "json_schema", schema },
  },
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(`apiKeySource: ${message.apiKeySource} tools: ${message.tools.join(",")}`);
  }
  if (message.type !== "result") continue;
  if (message.subtype !== "success" || message.is_error || !message.structured_output) {
    throw new Error(`回答を受け取れませんでした（subtype: ${message.subtype}）`);
  }
  const answer = message.structured_output as Answer;
  console.log(`渡した資料: ${chunks.map((doc, i) => `${i + 1}=${doc.id}`).join(" ")}`);
  console.log(JSON.stringify(answer, null, 2));
  const problems = verify(answer, chunks);
  console.log(problems.length === 0 ? "検証: OK" : `検証: NG ${problems.join(" / ")}`);
  console.log(`num_turns=${message.num_turns} total_cost_usd=${message.total_cost_usd}`);
}
```

出典つきで答えさせるために入れた部分は、次のとおりです。

- 資料は `<chunk number="1">` のように番号を付けて並べます。モデルはこの番号で出典を指します。
- `hit.score >= 0.1` の下限は、BM25 の記事で決めた値です。助詞だけが一致した文書を資料から外します。
- 資料が1件も残らないときは、モデルを呼ばずに終わります。呼んでも答えは出ず、プランの利用枠が減るからです。
- `systemPrompt` に文字列を渡すと、その文字列がシステムプロンプトになります（出典4）。指示は3行にしました。
- `tools: []` は、組み込みのツールをすべて外す指定です（出典4）。資料はプロンプトに入っているので、ファイルを読むツールは要りません。
- `settingSources: []` にすると、手元の設定ファイルを読みません（出典4）。

`outputFormat` にスキーマを渡すと、結果は `structured_output` に入ります（出典3）。詳細は[構造化出力の回](/posts/claude-agent-sdk-structured-output)です。

結果を読む前に、次の条件がすべてそろっているかを確かめます。

- `subtype` が `success` である
- `is_error` が `true` でない
- `structured_output` がある

公式のページも、この3つで失敗を見分けるよう求めています（出典3）。

`structured_output` の型は `unknown` です（出典4）。値はスキーマで検証されているので（出典3）、`as Answer` で型を付けました。

## 答えのある質問では、資料1の一文が出典に付いた

「返品できる期間は？」と聞くと、BM25 は `returns` と `points` の2件を資料に選びます。

```bash
node ask.ts "返品できる期間は？"
```

```text
apiKeySource: none tools: StructuredOutput
渡した資料: 1=returns 2=points
{
  "answerable": true,
  "answer": "返品できる期間は、商品の到着から30日以内です。なお、返品できるのは未開封の商品だけです。",
  "citations": [
    {
      "chunk": 1,
      "quote": "返品は、商品の到着から30日以内に受け付けます。"
    }
  ]
}
検証: OK
num_turns=2 total_cost_usd=0.0006670999999999999
```

答えの「30日以内」は資料1の `returns` にあり、引用文も資料1の文と1文字も違いません。検証の結果は OK です。

`tools` の一覧には `StructuredOutput` が1つだけ出ています。`outputFormat` を渡すと SDK が足すツールで、モデルはこれを呼んで答えを返します（出典3）。`tools: []` にしても、このツールは一覧に残りました。

`total_cost_usd` は、定価で換算した見積もりです（出典4）。

## 答えが資料に無い質問では、answerable が false になる

どの資料にも答えが書かれていない質問を投げます。

```bash
node ask.ts "返品した商品の送料は？"
```

```text
apiKeySource: none tools: StructuredOutput
渡した資料: 1=returns 2=points 3=shipping-fee
{
  "answerable": false,
  "answer": "資料には、返品した商品の送料をどう扱うか（返金されるか、返送料を誰が負担するか）についての記載がありません。資料にあるのは、送料が全国一律であることと、注文金額によって送料が無料になることだけです。返品時の送料については、ショップに直接お問い合わせください。",
  "citations": []
}
検証: OK
num_turns=2 total_cost_usd=0.0007195000000000001
```

渡した資料は、返品の条件、ポイント、送料の3件でした。送料の資料には「全国一律550円」とあり、550円と答えてしまいそうな並びです。モデルは答えられないほうを選び、出典を空にしました。検証も OK です。

ただ、`answer` の最後の一文は「返品時の送料については、ショップに直接お問い合わせください」です。この一文は、どの資料にも書いてありません。同じ質問を動かした5回すべてで、問い合わせを案内する一文が付いていました。`verify.ts` は出典の番号と引用文しか見ないので、この一文は素通りします。回答の文の中身が資料と合っているかまでは、このコードでは確かめられません。

## 資料が1件も見つからない質問は、モデルを呼ばずに返す

「返金はいつ？」は、BM25 の記事で答えの文書を取り出せなかった質問です。

```bash
node ask.ts "返金はいつ？"
```

```text
資料が見つからないので、モデルを呼ばずに「わかりません」と返します。
```

下限の 0.1 を超える資料が無いので、モデルを呼ばずに終わりました。答えは `cancel` の文書にあるので、取り出せない原因は検索の側にあります。

## 5回ずつ動かすと、10回とも検証を通った

2つの質問を、記事に載せた実行と合わせて5回ずつ動かしました。

| 質問 | answerable | 出典 | 検証 |
|---|---|---|---|
| 返品できる期間は？ | 5回とも true | 5回とも資料1。引用文は5回とも1文 | 5回とも OK |
| 返品した商品の送料は？ | 5回とも false | 5回とも空 | 5回とも OK |

`total_cost_usd` は、10回で 0.00009305 から 0.0007195 の範囲でした。

5回では、誤った出典が出る割合までは測れません。検証で NG が出た回答を捨てるか、聞き直すかは、アプリの側で決めることになります。

あなたのアプリでは、出典の検証を通らなかった回答を、利用者に見せますか。

## 料金はプランの利用枠から引かれる

プランのログインで動かした分は、プランの利用枠から引かれます（出典6）。SDK の `total_cost_usd` は、使った量の目安です。型定義のコメントも「An estimate, not a billing statement」としています（出典4）。

検索と `verify.ts` は手元の計算です。`check-sample.ts` と、資料が見つからずにモデルを呼ばない実行も、利用枠を使いません。

## 確認すること

自分のデータで出典つきの回答を組むときは、次の4つをすべて確かめます。

- 資料に番号を振り、その番号で出典を返させているか
- 出典の番号と引用文が渡した資料にあるかを、コードで突き合わせているか
- 答えが無いときに `answerable` を false にし、出典を空にするよう指示したか
- 資料が1件も無いときに、モデルを呼ばずに返しているか

検索の当たり外れは、Recall@k と MRR で数えられます。

## 出典

本文の（出典n）は、この表の番号です。確認日は、どれもページを読んだ日です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Introducing Contextual Retrieval（Anthropic） | https://www.anthropic.com/news/contextual-retrieval | 2026-11-11 |
| 2 | Reduce hallucinations | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations | 2026-11-11 |
| 3 | Get structured output from agents | https://code.claude.com/docs/en/agent-sdk/structured-outputs | 2026-11-11 |
| 4 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-11 |
| 5 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-11 |
| 6 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-11 |
| 7 | Claude の料金プラン | https://claude.com/pricing | 2026-11-11 |
| 8 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | 2026-11-11 |
| 9 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-11 |

AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。
