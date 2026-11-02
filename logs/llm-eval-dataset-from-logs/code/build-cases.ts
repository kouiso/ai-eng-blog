import { readFileSync, writeFileSync } from "node:fs";

type LogRecord = {
  ts: string;
  category: string;
  question: string;
  answer: string;
  feedback: "good" | "bad" | null;
};

type EvalCase = {
  id: string;
  category: string;
  question: string;
  logged_answer: string;
  feedback: LogRecord["feedback"];
  source_ts: string;
};

const TOTAL = 5;
const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;

const mask = (text: string) => text.replace(EMAIL, "<email>");
const dedupKey = (text: string) =>
  text.normalize("NFKC").replace(/\s+/g, "").toLowerCase();

const records: LogRecord[] = [];
const lines = readFileSync("logs.jsonl", "utf8").split("\n");
lines.forEach((line, i) => {
  if (line.trim() === "") return;
  try {
    records.push(JSON.parse(line));
  } catch {
    console.log(`読めない行をとばしました: ${i + 1}行目`);
  }
});

// bad の評価が付いたログを先に、同じ扱いなら新しいログを先に並べる
records.sort(
  (a, b) =>
    Number(b.feedback === "bad") - Number(a.feedback === "bad") ||
    b.ts.localeCompare(a.ts),
);

const seen = new Set<string>();
const unique = records.filter((r) => {
  const key = dedupKey(mask(r.question));
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
console.log(`読めたログ ${records.length}件、重複を除いて ${unique.length}件`);

const byCategory = new Map<string, LogRecord[]>();
for (const r of unique) {
  byCategory.set(r.category, [...(byCategory.get(r.category) ?? []), r]);
}

const cases: EvalCase[] = [];
for (const [category, items] of byCategory) {
  const quota = Math.max(1, Math.round((TOTAL * items.length) / unique.length));
  const picked = items.slice(0, quota);
  console.log(`${category}: ${items.length}件から ${picked.length}件`);
  picked.forEach((r, i) => {
    cases.push({
      id: `${category}-${String(i + 1).padStart(3, "0")}`,
      category,
      question: mask(r.question),
      logged_answer: mask(r.answer),
      feedback: r.feedback,
      source_ts: r.ts,
    });
  });
}

writeFileSync("cases.jsonl", cases.map((c) => JSON.stringify(c)).join("\n") + "\n");
console.log(`cases.jsonl に ${cases.length}件を書き出しました`);
