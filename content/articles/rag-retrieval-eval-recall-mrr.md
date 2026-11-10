---
title: "RAG の検索の良し悪しを数字で測る【Recall@k と MRR を TypeScript で】"
slug: "rag-retrieval-eval-recall-mrr"
description: "RAG の検索器を Recall@k と MRR の2つの指標で採点する TypeScript のプログラムを作ります。手で書いた15問で BM25、ベクトル検索、ハイブリッド検索を比べた実行結果と、差がついた3問の中身を載せます。"
tags: ["LLM 評価", "RAG", "TypeScript"]
main_keyword: "LLM 評価"
target_query: null
course_step: 6
cost_estimate: "記事のコードは手元で動き、API を呼ばないので無料です。埋め込みモデルは Hugging Face からログインせずにダウンロードできます。検索結果を Claude に渡して回答させると、トークン数に応じた API の料金がかかります。"
run_environment: "Node.js 22.22.0、npm 10.9.4、Linux x86_64。@huggingface/transformers 4.3.2。埋め込みモデルは Xenova/multilingual-e5-small（q8）。型の確認は TypeScript 7.0.2。"
verified_at: "2026-11-10"
prev: "llm-as-a-judge-claude"
next: "promptfoo-llm-eval-intro"
sources:
  - url: "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-rank-eval"
    title: "Ranking evaluation"
    accessed: 2026-11-02
  - url: "https://www.anthropic.com/news/contextual-retrieval"
    title: "Introducing Contextual Retrieval"
    accessed: 2026-11-02
  - url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"
    title: "Define success criteria and build evaluations"
    accessed: 2026-11-02
  - url: "https://nodejs.org/docs/latest-v22.x/api/typescript.html"
    title: "Node.js v22 Modules: TypeScript"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex"
    title: "Array.prototype.findIndex() - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf"
    title: "Array.prototype.indexOf() - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR"
    title: "Logical OR (||) - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://huggingface.co/intfloat/multilingual-e5-small"
    title: "intfloat/multilingual-e5-small"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort"
    title: "Array.prototype.sort() - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map"
    title: "Map - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing"
    accessed: 2026-11-02
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-10
---

RAG の検索が良くなったかどうかは、Recall@k と MRR の2つの数字で判定できます。用意するのは、質問と正解の文書の組です。Recall@k は、上位 k 件に正解の文書が入った割合を表します。MRR は、最初の正解の順位の逆数を、質問ごとに求めて平均した値です。

この記事では、2つの指標を TypeScript の関数にします。採点するのは、講座で作った BM25、ベクトル検索、ハイブリッド検索の3つです。15問で採点した結果は、ベクトル検索が MRR 0.967 で最も高く、ハイブリッド検索は 0.900 でした。ただし、差がついたのは15問のうち3問だけです。

対象は、TypeScript で RAG の検索を組んでいて、設定を変えた効果を数字で確かめたい人です。記事のコマンドの実行時間は、`npm install` とモデルのダウンロードを含めて合計27秒でした。

講座の1つ前の回は[前の記事](/posts/llm-as-a-judge-claude)です。この記事で採点するのは、モデルが回答を作る前の段階にある検索の結果です。

## Recall@k は取りこぼしを、MRR は最初の正解の順位を見る

2つの指標は、どちらも「質問ごとに、どの文書が正解か」を先に決めておけば計算できます。

Recall@k は、上位 k 件に入った正解の文書の数を、その質問の正解の文書の数で割った値です（出典1）。正解が8件ある質問で上位10件に4件入れば、Recall@10 は 0.5 です（出典1）。上位 k 件の中での順番は見ません（出典1）。10位に正解が1件ある結果も、1位に1件ある結果も同じ値になります（出典1）。

MRR は、質問ごとに最初の正解の順位の逆数を求め、全部の質問で平均した値です（出典1）。最初の正解が3位なら、その質問の値は 1/3 です（出典1）。

| 指標 | 1問の値 | 見ているもの |
|---|---|---|
| Recall@k | 上位 k 件に入った正解の数 ÷ 正解の数 | 答えの書いてある文書を取りこぼしていないか |
| MRR | 1 ÷ 最初の正解の順位 | 正解がどれだけ上に来たか |

Anthropic は、検索の改良を比べるときに、1 から Recall@20 を引いた値を指標にしています（出典2）。上位20件に入らなかった正解の文書の割合です（出典2）。RAG で上位 k 件をモデルに渡すなら、Recall@k は答えの書いてある文書がモデルに届いた割合になります。

## 使うバージョンと準備

動かした環境は Node.js 22.22.0 と npm 10.9.4 で、OS は Linux（x86_64）です。依存パッケージは `@huggingface/transformers` 4.3.2 の1つです。ベクトル検索の埋め込みを作るために使います。

Node.js 22.18.0 以上は、`.ts` のファイルを型を取り除いてそのまま実行します（出典4）。型の検査はしません（出典4）。TypeScript 7.0.2 の `tsc` で型を調べると、記事のファイルにエラーは出ませんでした。ただし、`node_modules/@huggingface/` の下の型定義では、12件のエラーが出ます。`skipLibCheck` を有効にした設定では、`tsc` の終了コードが0になりました。

作業フォルダを作って移動します。

```bash
mkdir retrieval-eval
cd retrieval-eval
```

`package.json` を置きます。`import` と `export` を使うので、`"type": "module"` を入れます（出典4）。依存のバージョンは、`^` を付けずに 4.3.2 で固定しました。

```json
{
  "name": "retrieval-eval",
  "private": true,
  "type": "module",
  "dependencies": {
    "@huggingface/transformers": "4.3.2"
  }
}
```

```bash
npm install
```

インストールは17秒で終わり、`node_modules` は 745MB になりました。

## 2つの指標は metrics.ts の3つの関数で書ける

指標の関数は、検索器が返した文書の id の配列と、正解の id の配列を受け取ります。検索器の中身は見ないので、どの検索器にも同じ関数が使えます。

```ts
export function recallAtK(ranked: string[], relevant: string[], k: number): number {
  const top = new Set(ranked.slice(0, k));
  const found = relevant.filter((id) => top.has(id)).length;
  return found / relevant.length;
}

export function reciprocalRank(ranked: string[], relevant: string[]): number {
  const i = ranked.findIndex((id) => relevant.includes(id));
  return i === -1 ? 0 : 1 / (i + 1);
}

export function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
```

このファイルを `metrics.ts` として保存します。

`recallAtK` は、上位 k 件の id を `Set` に入れ、正解のうちいくつがその中にあるかを数えます。割る数は、正解の文書の数です。k で割ると、上位 k 件に占める正解の割合を表す Precision@k という別の指標です（出典1）。

`reciprocalRank` は、配列の先頭から最初の正解を探し、その順位の逆数を返します。`findIndex` の戻り値は、条件に合う要素が無いと -1 です（出典5）。そのときは0を返すので、検索結果に正解が1件も無い質問は、0 として平均に入ります。

`check-metrics.ts` を置いて、手で計算できる例と関数の値を比べてください。

```ts
import { recallAtK, reciprocalRank } from "./metrics.ts";

const ranked = ["delivery", "cancel", "returns", "points"];
const relevant = ["returns", "points"];

console.log("Recall@1:", recallAtK(ranked, relevant, 1));
console.log("Recall@3:", recallAtK(ranked, relevant, 3));
console.log("Recall@4:", recallAtK(ranked, relevant, 4));
console.log("RR      :", reciprocalRank(ranked, relevant).toFixed(3));
```

```bash
node check-metrics.ts
```

```text
Recall@1: 0
Recall@3: 0.5
Recall@4: 1
RR      : 0.333
```

検索結果の4件のうち、正解は3位の `returns` と4位の `points` です。上位1件には正解が無いので Recall@1 は0、上位3件には2件中1件なので 0.5 です。4件まで見ると、2件とも入って1になります。

`reciprocalRank` は、最初の正解の `returns` だけを見て 1/3 を返します。4位の `points` は値に入りません。正解を全部拾えているかは Recall@k で、最初の正解が上にあるかは MRR で見る分担です。

## 評価用の質問は、検索器を動かす前に正解と組にして書く

評価用の質問は、正解の文書の id と組にして配列に書きます。検索する文書は、架空のネットショップの FAQ 10件です。[ハイブリッド検索の記事](/posts/rag-hybrid-search-rrf)と同じ文書を使います。

```ts
// 手で書いた評価用の質問と、答えが書いてある文書の id です。
export type EvalCase = { query: string; relevant: string[] };

export const cases: EvalCase[] = [
  { query: "返品は何日以内ならできますか", relevant: ["returns"] },
  { query: "返金はいつ？", relevant: ["cancel"] },
  { query: "キャンセルしたらお金は戻る？", relevant: ["cancel"] },
  { query: "支払いに使えるものは？", relevant: ["payment"] },
  { query: "PayPay で払える？", relevant: ["payment"] },
  { query: "送料はいくら？", relevant: ["shipping-fee"] },
  { query: "注文してから何日で発送される？", relevant: ["delivery"] },
  { query: "離島に届くまで何日かかる？", relevant: ["delivery"] },
  { query: "パスワードを忘れた", relevant: ["password"] },
  { query: "ログインできない", relevant: ["login", "password"] },
  { query: "E1021 が出た", relevant: ["error-e1021"] },
  { query: "カードの期限切れで決済できない", relevant: ["error-e1020"] },
  { query: "カードが使えない", relevant: ["error-e1020", "error-e1021"] },
  { query: "返品した注文のポイントはどうなる？", relevant: ["points"] },
  { query: "ポイントの有効期限は？", relevant: ["points"] },
];
```

このファイルを `cases.ts` として保存します。

15問の中には、文書の語をそのまま使った質問と、言い換えた質問を混ぜました。「送料はいくら？」は、文書の「送料」と同じ語を使った質問です。「返金はいつ？」の答えは、「払い戻し」と書いた `cancel` にあります。「ログインできない」と「カードが使えない」の2問は、正解を2件にしました。どちらの文書にも答えの一部が書いてあるからです。

`cases.ts` は、3つの検索器を1回も動かさないうちに書き終えました。結果を見てから質問を足すと、検索器がうまく答えられる質問ばかりが残りやすくなるからです。

Anthropic の評価の作り方のページは、実際の利用で来る質問の分布に合わせて評価を作るよう勧めています（出典3）。手で採点する少数の質問よりも、自動で採点できる多くの質問のほうがよいとも書いています（出典3）。自分のアプリで作るなら、利用者が実際に打った質問から選んでください。

## 採点する3つの検索器は RAG の回の6ファイルをそのまま使う

採点する検索器は、講座の RAG の回で作ったものです。BM25 は[BM25 の記事](/posts/rag-bm25-search-typescript)で作りました。RRF の説明は[ハイブリッド検索の記事](/posts/rag-hybrid-search-rrf)にあります。次の6ファイルは、ハイブリッド検索の記事のものと1文字も違いません。仕組みの説明はそれぞれの記事に任せ、ここにはコードを載せます。

`tokenize.ts` は、日本語の文を `Intl.Segmenter` で語に分けます。

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

`bm25.ts` は、BM25 のスコアの高い順に文書を返します。

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

`docs.ts` は、検索する FAQ 10件です。

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
  { id: "error-e1020", text: "決済画面でエラーコード E1020 が出た場合は、カードの有効期限が切れていないかを確かめてください。" },
  { id: "error-e1021", text: "エラーコード E1021 は、カードの利用限度額を超えたことを表します。別のカードか、コンビニ払いを選んでください。" },
  {
    id: "points",
    text: "ポイントは、購入金額の1%を発送の翌日に付与します。返品した注文のポイントは取り消します。ポイントの有効期限は最後の購入から1年です。返品の手続き中はポイントを使えません。期限が切れたポイントは戻せません。ポイントは1ポイント1円として、次の注文の支払いに使えます。返品の対象外の商品でも、ポイントは付与します。",
  },
];
```

`embed.ts` は、`Xenova/multilingual-e5-small` で文をベクトルにします。手順は[埋め込み](/posts/rag-local-embeddings-transformers-js)の記事です。

```ts
import { pipeline } from "@huggingface/transformers";

const extractor = await pipeline("feature-extraction", "Xenova/multilingual-e5-small", {
  dtype: "q8",
});

export async function embed(texts: string[]): Promise<number[][]> {
  const output = await extractor(texts, { pooling: "mean", normalize: true });
  return output.tolist();
}
```

`vector-search.ts` は、質問のベクトルとの内積が大きい順に文書を返します。E5 のモデルは、質問の頭に `query: ` を、文書の頭に `passage: ` を付ける前提です（出典8）。

```ts
import type { Doc, Hit } from "./bm25.ts";
import { embed } from "./embed.ts";

function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

export async function createVectorSearch(docs: Doc[]) {
  const vectors = await embed(docs.map((doc) => `passage: ${doc.text}`));

  return async (query: string, topK = 3): Promise<Hit[]> => {
    const [q] = await embed([`query: ${query}`]);
    return docs
      .map((doc, i) => ({ doc, score: dot(q, vectors[i]) }))
      .sort((x, y) => y.score - x.score)
      .slice(0, topK);
  };
}
```

`rrf.ts` は、2つの順位表を、順位の逆数の合計で1つに合わせます。

```ts
export type Fused = { id: string; score: number; ranks: (number | null)[] };

export function rrf(lists: string[][], k = 60): Fused[] {
  const rows = new Map<string, Fused>();
  lists.forEach((ids, listIndex) => {
    ids.forEach((id, i) => {
      const rank = i + 1;
      const row = rows.get(id) ?? { id, score: 0, ranks: lists.map(() => null) };
      row.score += 1 / (k + rank);
      row.ranks[listIndex] = rank;
      rows.set(id, row);
    });
  });
  return [...rows.values()].sort((x, y) => y.score - x.score);
}
```

## eval.ts は3つの検索器に同じ15問を投げて平均を出す

`eval.ts` は、15問を3つの検索器に順に投げ、質問ごとの順位と、指標の平均を表示します。

```ts
import { createSearch } from "./bm25.ts";
import { cases } from "./cases.ts";
import { docs } from "./docs.ts";
import { mean, recallAtK, reciprocalRank } from "./metrics.ts";
import { rrf } from "./rrf.ts";
import { createVectorSearch } from "./vector-search.ts";

const k = Number(process.argv[2] ?? "3");
const minBm25 = Number(process.argv[3] ?? "0.1");
const depth = 5;

const bm25 = createSearch(docs);
const vector = await createVectorSearch(docs);

const bm25Ids = async (q: string) =>
  bm25(q, depth).filter((hit) => hit.score >= minBm25).map((hit) => hit.doc.id);
const vectorIds = async (q: string) => (await vector(q, depth)).map((hit) => hit.doc.id);

const retrievers: Record<string, (q: string) => Promise<string[]>> = {
  bm25: bm25Ids,
  vector: vectorIds,
  hybrid: async (q) =>
    rrf([await bm25Ids(q), await vectorIds(q)]).slice(0, depth).map((row) => row.id),
};

const names = Object.keys(retrievers);
const recalls: Record<string, number[]> = {};
const rrs: Record<string, number[]> = {};
for (const name of names) {
  recalls[name] = [];
  rrs[name] = [];
}

console.log(names.map((name) => name.padEnd(8)).join(""), "質問");
for (const c of cases) {
  const cells: string[] = [];
  for (const name of names) {
    const ranked = await retrievers[name](c.query);
    recalls[name].push(recallAtK(ranked, c.relevant, k));
    rrs[name].push(reciprocalRank(ranked, c.relevant));
    const ranks = c.relevant.map((id) => ranked.indexOf(id) + 1 || "-");
    cells.push(ranks.join(",").padEnd(8));
  }
  console.log(cells.join(""), c.query);
}

console.log(`\n${cases.length}問の平均`);
for (const name of names) {
  const recall = mean(recalls[name]).toFixed(3);
  const mrr = mean(rrs[name]).toFixed(3);
  console.log(`${name.padEnd(8)}Recall@${k} ${recall}  MRR ${mrr}`);
}
```

このファイルを `eval.ts` として保存します。

1つ目の引数が Recall@k の k で、既定は3です。ハイブリッド検索の記事で、モデルに渡す件数を上位3件にしたからです。2つ目の引数で、BM25 の結果に置くスコアの下限を決めます。既定の 0.1 には、ハイブリッド検索の記事の既定値をそのまま使いました。

3つの検索器は、どれも上位5件（`depth`）までの id を返します。ハイブリッド検索は、BM25 とベクトル検索の5件ずつを RRF で合わせ、上位5件を返します。MRR も5件の中で最初の正解を探すので、厳密には上位5件までで数えた MRR です。Elasticsearch の MRR にも、1問あたりに見る件数を決める `k` があります（出典1）。

1行ごとの表示は、正解の文書が何位だったかです。`indexOf` は、見つからないと -1 を返します（出典6）。1を足すと0になり、`||` は0を偽として右側の `"-"` を返します（出典7）。上位5件に入らなかった正解が `-` の表示になるのは、このためです。

```bash
node eval.ts
```

```text
bm25    vector  hybrid   質問
1       1       1        返品は何日以内ならできますか
-       2       2        返金はいつ？
1       1       1        キャンセルしたらお金は戻る？
1       1       1        支払いに使えるものは？
1       1       1        PayPay で払える？
1       1       1        送料はいくら？
1       1       1        注文してから何日で発送される？
1       1       1        離島に届くまで何日かかる？
1       1       1        パスワードを忘れた
1,2     1,2     1,2      ログインできない
2       1       2        E1021 が出た
1       1       1        カードの期限切れで決済できない
2,4     2,1     2,3      カードが使えない
1       1       1        返品した注文のポイントはどうなる？
1       1       1        ポイントの有効期限は？

15問の平均
bm25    Recall@3 0.900  MRR 0.867
vector  Recall@3 1.000  MRR 0.967
hybrid  Recall@3 1.000  MRR 0.900
```

初回の実行は、モデルのダウンロードを含めて3.5秒でした。モデルの保存先は `node_modules/@huggingface/transformers/.cache` です。大きさは 130MB で、2回目からは1.9〜2.7秒で終わりました。

## 差がついたのは15問のうち3問だけ

MRR の平均は、ベクトル検索が 0.967、ハイブリッド検索が 0.900、BM25 が 0.867 です。Recall@3 は、ベクトル検索とハイブリッド検索がどちらも 1.000 で並びました。上位3件に正解が入ったかだけを見る Recall@3 では区別がつかず、MRR で初めて差が出た形です。

1行ずつ見ると、順位が違う質問は「返金はいつ？」「E1021 が出た」「カードが使えない」の3問です。残りの12問は、3つとも同じ順位でした。

| 質問 | 起きたこと |
|---|---|
| 返金はいつ？ | BM25 は内容の語が1つも一致せず、下限の 0.1 で結果が空になった |
| E1021 が出た | BM25 の1位は「が」「出」「た」が一致した `error-e1020` で、正解はハイブリッド検索でも2位だった |
| カードが使えない | BM25 とハイブリッド検索の1位は支払い方法の `payment` だった |

「E1021 が出た」は、`tokenize` で「e1021」「が」「出」「た」の4語に分かれます。`error-e1020` の本文では、「が出た場合」の「が」「出」「た」の3語が質問と一致しました。「出」を含む文書は `error-e1020` だけです。そのため「出」の `idf`（含む文書が少ない語ほど大きい重み）は、「e1021」と同じ 1.992 です。正解の `error-e1021` と一致したのは、「e1021」と「た」の2語でした。BM25 のスコアは 1.296 で、`error-e1020` の 1.928 より低くなります。

「E1021 が出た」のハイブリッド検索では、2つのエラーコードの文書が同点でした。点数はどちらも 0.03252 です。同点のときの順は、`rrf` に先に渡した BM25 の順位表で決まります。`Map` はキーを入れた順を覚えていて（出典10）、`sort` は同じ値の要素の順を保つからです（出典9）。

「カードが使えない」では、BM25 が `payment` を1位にしました。`payment` の「使えます」から分かれた「使」「え」と、「が」が一致したからです。ハイブリッド検索でも1位は `payment` で、点数は 0.03227 です。2位の `error-e1020` の 0.03226 との差は、0.00001 でした。一致した語と点数は、記事に載せない確認用のスクリプトで出しました。

1問の最初の正解が1位から2位に下がると、その質問の値は1から 0.5 になります。15問で平均すると、MRR の下がり幅は 0.5 ÷ 15 で約 0.033 です。ベクトル検索とハイブリッド検索の差の 0.067 は、2問分にあたります。

この15問の結果だけで、ハイブリッド検索をやめてベクトル検索に切り替えることはしません。12問は3つの検索器を区別できず、判定は3問の順位で決まっています。切り替えを決める前に、利用者が実際に打った質問を足して測り直します。

## k を小さくすると Recall@k の差が開く

k を変えて、Recall@k の平均を比べます。`tail -n 4` で、末尾の平均の4行だけを表示します。`tail` が無い環境では、`node eval.ts 1` の出力の最後の4行を見てください。

```bash
node eval.ts 1 | tail -n 4
```

```text
15問の平均
bm25    Recall@1 0.767  MRR 0.867
vector  Recall@1 0.867  MRR 0.967
hybrid  Recall@1 0.767  MRR 0.900
```

```bash
node eval.ts 5 | tail -n 4
```

```text
15問の平均
bm25    Recall@5 0.933  MRR 0.867
vector  Recall@5 1.000  MRR 0.967
hybrid  Recall@5 1.000  MRR 0.900
```

Recall@1 では、ベクトル検索の 0.867 に対して、BM25 とハイブリッド検索は 0.767 で並びました。正解が2件ある質問は、上位1件にどちらか1件しか入らないので、Recall@1 が 0.5 を超えません。この評価用の質問では、Recall@1 は 1.000 に届かない値です。

Recall@5 では、BM25 が 0.933 に上がりました。「カードが使えない」の2件目の正解が、BM25 の4位にあるからです。MRR は、どの k でも同じ値です。`eval.ts` の MRR は、k に関係なく上位5件までを見ます。

k は、モデルに渡す件数に合わせて選びます。上位3件を渡すなら Recall@3、上位1件しか使わない作りなら Recall@1 が、見るべき値です。

## 設定を変えたら同じ15問で測り直す

検索の設定を変えたときに良くなったかどうかは、同じ15問で測り直して比べます。BM25 の下限を、ハイブリッド検索の記事と同じ既定の 0.1 から 0 に変えて測ります。

```bash
node eval.ts 3 0
```

```text
bm25    vector  hybrid   質問
1       1       1        返品は何日以内ならできますか
-       2       -        返金はいつ？
1       1       1        キャンセルしたらお金は戻る？
1       1       1        支払いに使えるものは？
1       1       1        PayPay で払える？
1       1       1        送料はいくら？
1       1       1        注文してから何日で発送される？
1       1       1        離島に届くまで何日かかる？
1       1       1        パスワードを忘れた
1,2     1,2     1,2      ログインできない
2       1       2        E1021 が出た
1       1       1        カードの期限切れで決済できない
2,4     2,1     2,3      カードが使えない
1       1       1        返品した注文のポイントはどうなる？
1       1       1        ポイントの有効期限は？

15問の平均
bm25    Recall@3 0.900  MRR 0.867
vector  Recall@3 1.000  MRR 0.967
hybrid  Recall@3 0.933  MRR 0.867
```

ハイブリッド検索の Recall@3 は、1.000 から 0.933 に下がりました。MRR も 0.900 から 0.867 に下がっています。原因は「返金はいつ？」の1問で、ハイブリッド検索の上位5件から `cancel` が消えたことです。

下限が0だと、BM25 は「は」だけが一致した5件を返します。`cancel` はベクトル検索の2位なので、点数は 1/62 です。BM25 の2位の `shipping-fee` も 1/62 で、2つは同点になります。同点では BM25 の順が先に来るので、`cancel` は6位になり、上位5件から外れました。

ハイブリッド検索の記事では、下限を外したときの違いを1つの質問で比べています。15問の Recall@3 でも、下限が 0.1 のほうが高い結果になりました。差は1問分なので、質問を増やしても同じ向きになるかは、増やしたあとで測り直します。

## 料金がかからない範囲

記事のコードは手元で動き、API を呼ばないので無料です。埋め込みモデルは、Hugging Face のトークンを設定しない状態でダウンロードできました。ダウンロードのあとは、ネットワークの無い環境でも記事の `node` のコマンドが5つとも成功しました。

ダウンロードにはネットワークが、置き場所にはディスクの空きが要ります。`node_modules` が 745MB、モデルが 130MB でした。

料金がかかるのは、検索結果を Claude に渡して回答させる操作です。Claude Haiku 5.5 は、100万トークンあたり入力 0.10 ドル、出力 0.50 ドルです（出典11）。この単価は、プロンプトが10万トークン以下のときに使われます（出典11）。検索の採点だけならモデルを呼ばないので、質問を何問に増やしても料金は変わりません。

## 確認すること

自分の検索器を Recall@k と MRR で測るときは、次の4つをすべて確かめます。

- 評価用の質問と正解の文書を、検索器を動かす前に書いた
- 正解が複数ある質問は、正解の id をすべて入れた
- Recall@k の k を、モデルに渡す件数に合わせた
- 平均だけでなく1問ずつの順位を見て、差がどの質問から来たかを確かめた

差がつく質問を足すなら、あなたのアプリの質問ログからどんな質問を選びますか。

回答の採点は[自動採点の記事](/posts/llm-eval-harness-fixtures)で扱いました。

講座の続きは[次の記事](/posts/promptfoo-llm-eval-intro)です。

## 出典

確認日は、どれも 2026-11-02 です。本文の（出典1）〜（出典11）は、この表の番号を指します。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Ranking evaluation（Elasticsearch） | https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-rank-eval | 2026-11-02 |
| 2 | Introducing Contextual Retrieval（Anthropic） | https://www.anthropic.com/news/contextual-retrieval | 2026-11-02 |
| 3 | Define success criteria and build evaluations | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | 2026-11-02 |
| 4 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | 2026-11-02 |
| 5 | Array.prototype.findIndex()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex | 2026-11-02 |
| 6 | Array.prototype.indexOf()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf | 2026-11-02 |
| 7 | Logical OR (\|\|)（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR | 2026-11-02 |
| 8 | intfloat/multilingual-e5-small（Hugging Face） | https://huggingface.co/intfloat/multilingual-e5-small | 2026-11-02 |
| 9 | Array.prototype.sort()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort | 2026-11-02 |
| 10 | Map（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map | 2026-11-02 |
| 11 | Pricing | https://platform.claude.com/docs/en/about-claude/pricing | 2026-11-02 |

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
