// 記事には載せない確認用（2026-11-10 に追加）。BM25 のスコアを、一致した語ごとの寄与に分けて出す。
// bm25.ts と同じ式（k1 = 1.2、b = 0.75）で語ごとに計算し、合計が createSearch のスコアと同じかも出す。
// 使い方: node bm25-terms.ts <質問...>
import { createSearch } from "./bm25.ts";
import { docs } from "./docs.ts";
import { tokenize } from "./tokenize.ts";

const k1 = 1.2;
const b = 0.75;
const toks = docs.map((d) => tokenize(d.text));
const avgdl = toks.reduce((s, t) => s + t.length, 0) / docs.length;
const df = (term: string) => toks.filter((t) => t.includes(term)).length;
const search = createSearch(docs);

for (const q of process.argv.slice(2)) {
  const terms = [...new Set(tokenize(q))];
  console.log(`# ${q} terms=[${terms.join(",")}]`);
  for (const term of terms) {
    const n = df(term);
    const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
    console.log(`  term ${term} df=${n} idf=${idf.toFixed(4)}`);
  }
  const scores = new Map(search(q, docs.length).map((h) => [h.doc.id, h.score]));
  docs.forEach((d, i) => {
    const parts: string[] = [];
    let sum = 0;
    for (const term of terms) {
      const f = toks[i].filter((t) => t === term).length;
      if (f === 0) continue;
      const n = df(term);
      const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
      const norm = k1 * (1 - b + (b * toks[i].length) / avgdl);
      const c = (idf * f) / (f + norm);
      sum += c;
      parts.push(`${term}:${c.toFixed(4)}`);
    }
    if (parts.length) {
      const s = scores.get(d.id) ?? 0;
      console.log(`  ${d.id} len=${toks[i].length} sum=${sum.toFixed(4)} createSearch=${s.toFixed(4)} [${parts.join(" ")}]`);
    }
  });
}
