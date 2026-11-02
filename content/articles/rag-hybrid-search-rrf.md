---
title: "BM25 とベクトル検索を RRF で合わせるハイブリッド検索【TypeScript】"
slug: "rag-hybrid-search-rrf"
description: "BM25 とベクトル検索の結果を、順位の逆数を足す RRF で1つに合わせる方法を TypeScript で書きます。架空の FAQ 10件で実行した結果を載せます。合わせて正しい文書が1位になる質問と、片方の検索が当てた文書が上位から外れる質問の両方です。"
tags: ["RAG", "ハイブリッド検索", "RRF", "TypeScript"]
main_keyword: "RAG"
target_query: null
course_step: 3
cost_estimate: "記事のコードは手元で動き、API を呼ばないので無料です。埋め込みモデルは Hugging Face からログインせずにダウンロードできます。検索結果を Claude に渡して回答させると、トークン数に応じた API の料金がかかります。"
run_environment: "Node.js 22.22.0、npm 10.9.4。@huggingface/transformers 4.3.2。埋め込みモデルは Xenova/multilingual-e5-small（q8）。型の確認は TypeScript 7.0.2。"
verified_at: "2026-10-31"
prev: "rag-answer-with-citations-claude"
next: "ai-agent-tool-use-loop-typescript"
sources:
  - url: "https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf"
    title: "Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods"
    accessed: 2026-10-31
  - url: "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion"
    title: "Reciprocal rank fusion"
    accessed: 2026-10-31
  - url: "https://www.anthropic.com/news/contextual-retrieval"
    title: "Introducing Contextual Retrieval"
    accessed: 2026-10-31
  - url: "https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/search/similarities/BM25Similarity.html"
    title: "BM25Similarity (Lucene 10.3.1 core API)"
    accessed: 2026-10-31
  - url: "https://huggingface.co/intfloat/multilingual-e5-small"
    title: "intfloat/multilingual-e5-small"
    accessed: 2026-10-31
  - url: "https://huggingface.co/Xenova/multilingual-e5-small"
    title: "Xenova/multilingual-e5-small"
    accessed: 2026-10-31
  - url: "https://huggingface.co/docs/transformers.js/api/pipelines"
    title: "Transformers.js pipelines"
    accessed: 2026-10-31
  - url: "https://huggingface.co/docs/transformers.js/guides/dtypes"
    title: "Using quantized models (dtypes)"
    accessed: 2026-10-31
  - url: "https://nodejs.org/docs/latest-v22.x/api/typescript.html"
    title: "Node.js v22 Modules: TypeScript"
    accessed: 2026-10-31
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter"
    title: "Intl.Segmenter() constructor"
    accessed: 2026-10-31
  - url: "https://tc39.es/ecma402/#sec-createsegmentdataobject"
    title: "ECMAScript Internationalization API Specification 19.7.1 CreateSegmentDataObject"
    accessed: 2026-10-31
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort"
    title: "Array.prototype.sort()"
    accessed: 2026-10-31
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map"
    title: "Map"
    accessed: 2026-10-31
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing"
    accessed: 2026-10-31
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-10-31
---

BM25 とベクトル検索の結果は、スコアを足さずに順位で合わせます。RRF は、文書ごとに `1 / (60 + 順位)` を足して並べ直す計算です。TypeScript では、型の定義を含めて15行のファイル1つで書けます。

語の一致で探す BM25 と、意味の近さで探すベクトル検索を組み合わせた検索を、この記事ではハイブリッド検索と呼びます。

架空のネットショップの FAQ 10件に質問を投げ、実際に出た順位とスコアを載せます。合わせたことで正しい文書が1位になった質問もあれば、片方の検索だけが当てた文書が上位3件から消えた質問もあります。

対象は、TypeScript で何か作ったことがあり、RAG の検索を自分で組んでいる人です。記事のコマンドの実行時間は、モデルのダウンロードを含めて合計46秒でした。

講座の[前の記事](/posts/rag-answer-with-citations-claude)は、回答の生成です。検索結果を Claude に渡し、出典つきで回答させました。この記事は、その検索結果を作る側を扱います。

## RRF は2つの順位表から順位の逆数を足して並べ直す

RRF（Reciprocal Rank Fusion）は、複数の検索の順位表を1つに合わせる方法です（出典1）。文書 `d` の点数は、順位表ごとの `1 / (k + 順位)` の合計です（出典1）。

```text
RRF の点数(d) = Σ 1 / (k + 順位(d))
```

論文は `k = 60` を予備実験で決め、その後の検証でも変えていません（出典1）。60 は最適に近いものの、値の選び方は結果を大きく左右しなかったと報告しています（出典1）。Elasticsearch では、この式の `k` を `rank_constant` と呼びます（出典2）。既定値は、同じく 60 です（出典2）。

`k` が 60 のとき、順位ごとの点数は次のとおりです。

| 順位 | 1つの順位表から足す点数 |
|---|---|
| 1位 | 1 / 61 ≈ 0.01639 |
| 2位 | 1 / 62 ≈ 0.01613 |
| 3位 | 1 / 63 ≈ 0.01587 |
| 5位 | 1 / 65 ≈ 0.01538 |
| 表に無い | 0 |

1位と5位の差は 0.001 ほどです。2つの順位表の両方に出た文書は、0.03 を超えます。どちらか一方の1位よりも、両方の中位が上に来やすい計算です。

Elasticsearch のドキュメントによると、RRF は調整が要りません（出典2）。合わせる指標どうしが関係していなくてもかまいません（出典2）。Anthropic も、BM25 と埋め込みの結果を rank fusion で合わせる手順を示しています（出典3）。

## 使うバージョンと準備

動かした環境は Node.js 22.22.0 と npm 10.9.4 です。依存パッケージは、埋め込みを作る `@huggingface/transformers` 4.3.2 の1つです。

Node.js 22.18.0 以上は、`.ts` のファイルを型を外してそのまま実行します（出典9）。型は調べないので（出典9）、型の確認は別に TypeScript 7.0.2 の `tsc` で行いました。`import` にはファイルの拡張子を書き、型だけを読み込むときは `type` を付けます（出典9）。

作業フォルダを作って移動します。

```bash
mkdir hybrid-search
cd hybrid-search
```

`package.json` を置きます。`import` と `export` を使うので、`"type": "module"` を入れます（出典9）。依存のバージョンは `^` を付けずに固定します。

```json
{
  "name": "hybrid-search",
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

インストールは25秒で終わり、`node_modules` は 745MB になりました。

## BM25 の検索は語の一致でスコアを付ける

BM25 の側は、日本語を語に分ける `tokenize.ts` と、スコアを付ける `bm25.ts` の2つです。式の意味は[BM25 の記事](/posts/rag-bm25-search-typescript)にあります。

`Intl.Segmenter` は、ロケールの規則で単語の境目を決めます（出典10）。`granularity: "word"` を指定すると、その境目で分けます（出典10）。区切りが単語らしいかを表す `isWordLike` を使い、句読点と空白を外します（出典11）。この記事では、区切りの1つ1つを語と呼びます。

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

このファイルを `tokenize.ts` として保存します。次の `bm25.ts` は、`k1` を 1.2、`b` を 0.75 にしています。どちらも Lucene の既定値と同じです（出典4）。`idf` の式も Lucene の実装と同じ形です（出典4）。

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

このファイルを `bm25.ts` として保存します。返す関数は、スコアが0より大きい文書を高い順に `topK` 件まで返します。質問と1語も一致しない文書は、BM25 の順位表に載りません。

検索する文書は `docs.ts` に置きます。BM25 の記事の FAQ 8件に、エラーコードを説明する2件を足しました。`E1020` と `E1021` は1文字違いで、意味が違うコードです。

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

## ベクトル検索は multilingual-e5-small の埋め込みで並べる

ベクトル検索の側は、`embed.ts` と `vector-search.ts` の2つです。前者が文をベクトルにし、後者が質問に近い順に並べます。手元で埋め込みを作る手順は、講座で先に扱いました。[その記事](/posts/rag-local-embeddings-transformers-js)が詳しいです。

モデルは `Xenova/multilingual-e5-small` を使います。`intfloat/multilingual-e5-small` を ONNX の形式にしたものです（出典6）。Transformers.js は、この形式のモデルを読み込みます（出典6）。元のモデルは12層で、ベクトルの次元は384です（出典5）。ライセンスは MIT です（出典5）。

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

このファイルを `embed.ts` として保存します。`dtype: "q8"` は8ビットに量子化した重みを選ぶ指定です（出典8）。`pooling: "mean"` は、プーリングの方法に平均を選ぶ指定です（出典7）。`normalize: true` を付けると、できたベクトルを正規化します（出典7）。`tolist()` を呼ぶと、結果が JavaScript の配列になります（出典7）。

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

このファイルを `vector-search.ts` として保存します。E5 のモデルは、質問の頭に `query: ` を付ける前提で学習されています（出典5）。文書の頭には `passage: ` を付けます（出典5）。付けないと性能が下がると、モデルのページに書かれています（出典5）。

確認用のスクリプトで測ると、`embed` の返すベクトルは384次元で、長さは 1.000000 でした。長さ1のベクトルどうしなので、内積はコサイン類似度と同じ値です。ベクトル検索は全文書にスコアを付けるので、文書が5件以上あれば上位5件は必ず埋まります。

## RRF の関数は文書の ID と順位しか見ない

`rrf.ts` は、ID の配列を順位表ごとに受け取り、合わせた点数の高い順に返します。

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

このファイルを `rrf.ts` として保存します。配列の位置に1を足したものが順位です。Elasticsearch の説明も、順位を1から数えています（出典2）。`ranks` には順位表ごとの順位を残し、載っていない順位表は `null` にします。結果を見たときに、どちらの検索で何位だったかを確かめるためです。

引数には BM25 のスコアもコサイン類似度も入りません。スコアの目盛りが違う検索でも、順位にすれば同じ式で足せます。

## 2つの検索を合わせて上位3件を出す

`hybrid.ts` は、質問を2つの検索に投げ、それぞれ上位5件を RRF で合わせます。

```ts
import { createSearch, type Hit } from "./bm25.ts";
import { docs } from "./docs.ts";
import { rrf } from "./rrf.ts";
import { createVectorSearch } from "./vector-search.ts";

const query = process.argv[2] ?? "";
const minBm25 = Number(process.argv[3] ?? "0.1");
const k = Number(process.argv[4] ?? "60");
const windowSize = 5;

const bm25 = createSearch(docs);
const vector = await createVectorSearch(docs);

const bm25Hits = bm25(query, windowSize).filter((hit) => hit.score >= minBm25);
const vectorHits = await vector(query, windowSize);

const show = (hits: Hit[]) =>
  hits.map((hit) => `${hit.doc.id}(${hit.score.toFixed(3)})`).join(" ");
console.log("BM25  :", show(bm25Hits));
console.log("vector:", show(vectorHits));

const fused = rrf([bm25Hits.map((hit) => hit.doc.id), vectorHits.map((hit) => hit.doc.id)], k);
for (const row of fused.slice(0, 3)) {
  const ranks = row.ranks.map((rank) => rank ?? "-").join(" / ");
  console.log(row.score.toFixed(5), row.id, `(順位 ${ranks})`);
}
```

このファイルを `hybrid.ts` として保存します。2つ目の引数は、BM25 の結果に置く下限です。既定の 0.1 は、BM25 の記事で助詞だけが一致した文書を外すために決めた値です。3つ目の引数で `k` を変えられます。

出力の `順位 1 / 2` は、BM25 で1位、ベクトル検索で2位だったことを表します。`-` はその検索の上位5件に入らなかった印です。

```bash
node hybrid.ts 利用限度額
```

```text
BM25  : error-e1021(2.685)
vector: payment(0.837) error-e1021(0.833) shipping-fee(0.822) login(0.810) error-e1020(0.810)
0.03252 error-e1021 (順位 1 / 2)
0.01639 payment (順位 - / 1)
0.01587 shipping-fee (順位 - / 3)
```

利用限度額を説明しているのは `error-e1021` です。ベクトル検索は支払い方法の `payment` を1位にしました。BM25 は「利用」「限度」「額」の3語が一致した `error-e1021` だけを返しています。合わせた結果は、両方に載った `error-e1021` が 0.03252 で1位です。

初回の実行では、モデルのダウンロードも含めて4秒かかりました。保存先は `node_modules/@huggingface/transformers/.cache` です。大きさは 130MB でした。2回目からは2.5〜3.2秒で終わりました。

出力のスコアを見ると、BM25 の 2.685 に対して、コサイン類似度は 0.810〜0.837 の幅に並んでいます。E5 のモデルのページも、類似度は0.7〜1.0に集まると書いています（出典5）。大事なのは値の大きさより順番だ、という説明です（出典5）。この2つをそのまま足すと、BM25 の差がほぼ全部を決めます。

```bash
node hybrid.ts 5営業日
```

```text
BM25  : cancel(2.395) delivery(1.529) returns(0.565)
vector: shipping-fee(0.857) cancel(0.856) delivery(0.848) points(0.821) returns(0.816)
0.03252 cancel (順位 1 / 2)
0.03200 delivery (順位 2 / 3)
0.03126 returns (順位 3 / 5)
```

「5営業日」が書いてあるのは、払い戻しの `cancel` です。ベクトル検索は送料の `shipping-fee` を1位にし、`cancel` は 0.001 差の2位でした。BM25 では `cancel` が「5」「営業」「日」の3語で1位です。合わせた結果も `cancel` が1位になりました。

エラーコードのような識別子か技術用語を含む質問は、BM25 の得意な場面です（出典3）。埋め込みの検索は、こうした完全な一致を取りこぼすことがあります（出典3）。この2つの質問では、BM25 の1位がベクトル検索の1位の誤りを正しました。

## 同じ点数になった2件は BM25 を先に渡した順に並ぶ

2つの検索が1位と2位を入れ替えて返すと、合わせた点数はぴったり同じになります。

```bash
node hybrid.ts "E1021 が出た"
```

```text
BM25  : error-e1020(1.928) error-e1021(1.296) login(0.578) payment(0.537) points(0.442)
vector: error-e1021(0.878) error-e1020(0.863) password(0.819) login(0.819) points(0.818)
0.03252 error-e1020 (順位 1 / 2)
0.03252 error-e1021 (順位 2 / 1)
0.03150 login (順位 3 / 4)
```

答えは `error-e1021` です。この質問では、BM25 が1文字違いの `error-e1020` を1位にしました。

一致した語を、記事に載せない確認用のスクリプトで数えました。`error-e1020` に一致したのは「が」「出」「た」の3語です。`error-e1021` は「e1021」と「た」の2語でした。「た」は両方に一致しています。BM25 は語ごとに重みを足すので、「が」と「出」の2語がエラーコードの1語を上回りました。

ベクトル検索は `error-e1021` を1位にしました。合わせた点数はどちらも `1/61 + 1/62` で 0.03252 です。

`Array.prototype.sort` は、ECMAScript 2019 から安定ソートです（出典12）。安定ソートでは、同じ値の要素が元の順を保ちます（出典12）。`Map` は、キーを入れた順に取り出せます（出典13）。`rrf` には BM25 の順位表から先に渡したので、同点では BM25 の1位が上に来ます。この質問では、それが誤りのほうでした。

同点のときに語の一致と意味の近さのどちらを先に置くか、あなたのデータではどちらが当たりますか。

## 片方の検索だけが当てた文書は上位3件から消える

RRF は両方の順位表に載った文書を押し上げます。そのため、一方の検索だけが1位にした文書は、もう一方の雑音より下に並ぶことがあります。

```bash
node hybrid.ts 届くのが遅い
```

```text
BM25  : login(0.673) error-e1020(0.641) payment(0.537) points(0.333) returns(0.109)
vector: delivery(0.858) shipping-fee(0.847) returns(0.838) points(0.837) cancel(0.837)
0.03126 returns (順位 5 / 3)
0.03125 points (順位 4 / 4)
0.01639 login (順位 1 / -)
```

届くまでの日数を書いた `delivery` を、ベクトル検索は1位にしました。ところが合わせた上位3件に `delivery` はありません。

BM25 の側では、「届く」も「遅い」も、どの文書にも出てきません。一致したのは「の」と「が」だけで、上位5件はすべて助詞の一致です。

下限の 0.1 は、BM25 の記事で「は」だけが一致した文書のスコアを見て決めた値です。「は」は全文書に出ますが、「が」を含む文書は10件中4件です。含む文書が少ない語ほど `idf` は大きくなります。「の」と「が」が一致した `login` は、0.673 でした。

計算すると差の理由がわかります。`returns` は BM25 の5位とベクトル検索の3位で、`1/65 + 1/63` ≈ 0.03126 です。`delivery` はベクトル検索の1位だけなので、`1/61` ≈ 0.01639 にとどまります。`login` と同点で、BM25 を先に渡したぶん `login` が上に出ました。

`k` を1にすると、1位の重みが大きくなります。

```bash
node hybrid.ts 届くのが遅い 0.1 1
```

```text
BM25  : login(0.673) error-e1020(0.641) payment(0.537) points(0.333) returns(0.109)
vector: delivery(0.858) shipping-fee(0.847) returns(0.838) points(0.837) cancel(0.837)
0.50000 login (順位 1 / -)
0.50000 delivery (順位 - / 1)
0.41667 returns (順位 5 / 3)
```

`delivery` は 0.5 で上位に戻りました。同時に、助詞だけで一致した `login` も 0.5 に上がっています。`k` を大きくすると、下の順位の文書の影響が増えます（出典2）。小さくすれば逆に、各順位表の1位の影響が増えます。

`k` を下げても、雑音の1位まで一緒に上がります。この記事では `k` を60のままにします。手を入れるべきなのは、助詞だけで一致した結果を BM25 の順位表に入れてしまう側です。

## BM25 の下限を外すと助詞だけの一致が1位になる

下限は、合わせる前の BM25 の順位表から雑音を除くために置いています。外したときの違いを、同じ質問で比べます。

```bash
node hybrid.ts 返金はいつ？
```

```text
BM25  : 
vector: returns(0.849) cancel(0.829) points(0.822) payment(0.816) delivery(0.804)
0.01639 returns (順位 - / 1)
0.01613 cancel (順位 - / 2)
0.01587 points (順位 - / 3)
```

```bash
node hybrid.ts 返金はいつ？ 0
```

```text
BM25  : points(0.032) shipping-fee(0.032) delivery(0.031) returns(0.031) payment(0.028)
vector: returns(0.849) cancel(0.829) points(0.822) payment(0.816) delivery(0.804)
0.03227 points (順位 1 / 3)
0.03202 returns (順位 4 / 1)
0.03126 delivery (順位 3 / 5)
```

答えは `cancel` の「払い戻しは5営業日以内」にあります。下限が 0.1 なら BM25 の順位表は空になり、ベクトル検索の順のまま `cancel` が2位に入ります。

下限を0にすると、BM25 は「は」だけが一致した5件を返しました。10件すべてに「は」が出るので、スコアは0.03前後です。それでも RRF は順位しか見ないため、0.032 の1位にも 1/61 を足します。結果は `points` が1位になり、`cancel` は上位3件から外れました。

BM25 のスコアの絶対値は、RRF に渡した時点で消えます。弱い一致を順位表から外せるのは、合わせる前の BM25 の側だけです。下限の値は、文書の数と長さで変わるので、自分のデータの実行結果を見て決めてください。

## 料金がかからない範囲

記事の手順は手元で動き、API を呼ばないので無料です。埋め込みモデルは、Hugging Face のトークンを設定しない状態でダウンロードできました。ダウンロードのあとは、ネットワークの無い環境でも記事の `node` のコマンドが7つとも成功しました。

モデルのダウンロードにはネットワークが要り、置き場所にはディスクの空きが要ります。`node_modules` が 745MB、モデルが 130MB でした。

合わせた検索結果を Claude に渡すと、トークン数に応じた料金がかかります（出典14）。Claude Haiku 5.5 は、100万トークンあたり入力 $0.10、出力 $0.50 です（出典14）。この単価は、プロンプトが10万トークン以下のときのものです（出典14）。

## 確認すること

自分の文書でハイブリッド検索を組むときは、次の4つをすべて確かめます。

- BM25 とベクトル検索の順位表を、合わせる前にそれぞれ出して見ているか
- 助詞だけの一致が BM25 の順位表に入らないよう、下限を自分のデータで決めたか
- 片方の検索だけが1位にした文書が、合わせた結果で何位になったかを確かめたか
- 同点のとき、どちらの検索の順を優先するかを決めてあるか

講座は次の記事から AI エージェントに入り、モデルがツールを選んで呼ぶループを TypeScript で書きます。[次の記事](/posts/ai-agent-tool-use-loop-typescript)に進んでください。

## 出典

確認日は、どれも 2026-10-31 です。本文の（出典1）〜（出典14）は、この表の番号を指します。出典1は、RRF を提案した SIGIR 2009 の論文です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | RRF の論文（SIGIR 2009） | https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf | 2026-10-31 |
| 2 | Reciprocal rank fusion（Elasticsearch） | https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion | 2026-10-31 |
| 3 | Introducing Contextual Retrieval（Anthropic） | https://www.anthropic.com/news/contextual-retrieval | 2026-10-31 |
| 4 | BM25Similarity（Lucene 10.3.1 core API） | https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/search/similarities/BM25Similarity.html | 2026-10-31 |
| 5 | intfloat/multilingual-e5-small（Hugging Face） | https://huggingface.co/intfloat/multilingual-e5-small | 2026-10-31 |
| 6 | Xenova/multilingual-e5-small（Hugging Face） | https://huggingface.co/Xenova/multilingual-e5-small | 2026-10-31 |
| 7 | Transformers.js pipelines | https://huggingface.co/docs/transformers.js/api/pipelines | 2026-10-31 |
| 8 | Using quantized models（dtypes） | https://huggingface.co/docs/transformers.js/guides/dtypes | 2026-10-31 |
| 9 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | 2026-10-31 |
| 10 | Intl.Segmenter() constructor（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter | 2026-10-31 |
| 11 | ECMAScript Internationalization API Specification 19.7.1 | https://tc39.es/ecma402/#sec-createsegmentdataobject | 2026-10-31 |
| 12 | Array.prototype.sort()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort | 2026-10-31 |
| 13 | Map（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map | 2026-10-31 |
| 14 | Pricing | https://platform.claude.com/docs/en/about-claude/pricing | 2026-10-31 |

AI 支援で執筆しました。コードは 2026-10-31 に実際に実行して確認しています。
