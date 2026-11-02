// 記事には載せない確認用。logs/rag-hybrid-search-rrf/code/extra/explain.ts を写したもの（この行のほかは変えていない）。質問の語と、それが一致した文書を出す。
import { tokenize } from "./tokenize.ts";
import { docs } from "./docs.ts";
for (const q of process.argv.slice(2)) {
  const qt = new Set(tokenize(q));
  console.log("###", q, [...qt]);
  for (const d of docs) {
    const dt = tokenize(d.text);
    const m = [...qt].filter((t) => dt.includes(t));
    if (m.length) console.log("  ", d.id, m.join(","), "len", dt.length);
  }
}
