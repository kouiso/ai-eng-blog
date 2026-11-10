// 記事には載せない確認用。eval.ts と同じ3つの検索器で、指定した質問の上位5件の id とスコアを出す。
// 使い方: node show-ranked.ts <BM25の下限> <質問...>
import { createSearch } from "./bm25.ts";
import { docs } from "./docs.ts";
import { rrf } from "./rrf.ts";
import { createVectorSearch } from "./vector-search.ts";

const minBm25 = Number(process.argv[2]);
const queries = process.argv.slice(3);
const bm25 = createSearch(docs);
const vector = await createVectorSearch(docs);
for (const q of queries) {
  const b = bm25(q, 5).filter((hit) => hit.score >= minBm25);
  const v = await vector(q, 5);
  const h = rrf([b.map((x) => x.doc.id), v.map((x) => x.doc.id)]).slice(0, 5);
  console.log(`# ${q}`);
  console.log("bm25  :", b.map((x) => `${x.doc.id}(${x.score.toFixed(3)})`).join(" "));
  console.log("vector:", v.map((x) => `${x.doc.id}(${x.score.toFixed(3)})`).join(" "));
  console.log("hybrid:", h.map((x) => `${x.id}(${x.score.toFixed(5)})`).join(" "));
}
