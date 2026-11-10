// 記事には載せない。results.jsonl の cost（定価換算の見積もり）を合計し、costBasis を表示する。
import { readFileSync } from "node:fs";

type Row = {
  cost?: number;
  metadata?: { modelUsage?: Record<string, { costUSD?: number; costBasis?: string }> };
};

const rows: Row[] = readFileSync("results.jsonl", "utf8")
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map((line) => JSON.parse(line));

const total = rows.reduce((sum, r) => sum + (r.cost ?? 0), 0);
const bases = new Set(
  rows.flatMap((r) => Object.entries(r.metadata?.modelUsage ?? {}).map(([m, u]) => `${m}:${u.costBasis}`)),
);
console.log(`rows=${rows.length} total_cost_usd=${total.toFixed(8)} costBasis=${[...bases].join(",")}`);
