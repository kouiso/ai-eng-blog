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
