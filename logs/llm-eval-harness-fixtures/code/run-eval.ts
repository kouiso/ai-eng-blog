import { answers } from "./answers.ts";
import { cases } from "./cases.ts";
import { grade } from "./graders.ts";

const THRESHOLD = 0.8;

let passed = 0;
for (const c of cases) {
  const answer = answers[c.id] ?? "";
  const result = grade(answer, c.grader);
  if (result.pass) passed++;
  console.log(`${result.pass ? "PASS" : "FAIL"} ${c.id} [${c.grader.type}] ${result.reason}`);
  if (!result.pass) console.log(`     回答: ${JSON.stringify(answer)}`);
}

const rate = passed / cases.length;
console.log(`合格 ${passed}/${cases.length} (${Math.round(rate * 100)}%)、基準 ${THRESHOLD * 100}%`);
if (rate < THRESHOLD) process.exitCode = 1;
