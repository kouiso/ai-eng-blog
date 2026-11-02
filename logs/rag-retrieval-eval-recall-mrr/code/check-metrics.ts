import { recallAtK, reciprocalRank } from "./metrics.ts";

const ranked = ["delivery", "cancel", "returns", "points"];
const relevant = ["returns", "points"];

console.log("Recall@1:", recallAtK(ranked, relevant, 1));
console.log("Recall@3:", recallAtK(ranked, relevant, 3));
console.log("Recall@4:", recallAtK(ranked, relevant, 4));
console.log("RR      :", reciprocalRank(ranked, relevant).toFixed(3));
