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
