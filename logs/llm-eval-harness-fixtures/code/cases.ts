import type { Grader } from "./graders.ts";

export type EvalCase = { id: string; question: string; grader: Grader };

export const cases: EvalCase[] = [
  {
    id: "sentiment-1",
    question: "次のレビューの感情を positive、negative、neutral のどれか1語で答えてください。「届いた翌日に動かなくなりました。」",
    grader: { type: "exact", expected: "negative" },
  },
  {
    id: "sentiment-2",
    question: "次のレビューの感情を positive、negative、neutral のどれか1語で答えてください。「色は写真のとおりでした。」",
    grader: { type: "exact", expected: "neutral" },
  },
  {
    id: "refund",
    question: "購入した商品は何日以内なら返品できますか。返品に必要なものも答えてください。",
    grader: { type: "contains", keywords: ["30日", "レシート"] },
  },
  {
    id: "order-count",
    question: "「本日の注文は3件、うち1件はキャンセルです。」注文は何件ですか。",
    grader: { type: "regex", pattern: "(?<!\\d)3件" },
  },
  {
    id: "delivery-date",
    question: "「納品日は2026年11月20日です。」から日付を YYYY-MM-DD の形で抜き出し、日付だけを返してください。",
    grader: { type: "regex", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
  },
];
