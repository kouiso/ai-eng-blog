import { readFileSync } from "node:fs";

type Row = {
  success: boolean;
  prompt: { label: string };
  vars: Record<string, string>;
  response?: { output?: string };
  gradingResult?: {
    componentResults?: {
      pass: boolean;
      reason: string;
      assertion?: { metric?: string };
    }[];
  };
};

const rows: Row[] = readFileSync("results.jsonl", "utf8")
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map((line) => JSON.parse(line));

for (const row of rows.filter((r) => !r.success)) {
  console.log(`--- ${row.prompt.label} / ${row.vars.inquiry}`);
  for (const result of row.gradingResult?.componentResults ?? []) {
    if (!result.pass) {
      console.log(`不合格の metric: ${result.assertion?.metric} (${result.reason})`);
    }
  }
  console.log(`出力: ${JSON.stringify(row.response?.output ?? "")}`);
}

const passed = rows.filter((r) => r.success).length;
console.log(`合格 ${passed} / ${rows.length}`);
