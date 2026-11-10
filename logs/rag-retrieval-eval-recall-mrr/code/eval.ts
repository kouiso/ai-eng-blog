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
