import { grade } from "./graders.ts";

const answer = "注文は13件です。";
console.log("contains:", grade(answer, { type: "contains", keywords: ["3件"] }));
console.log("regex:   ", grade(answer, { type: "regex", pattern: "(?<!\\d)3件" }));
