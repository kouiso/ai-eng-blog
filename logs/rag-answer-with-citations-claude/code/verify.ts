import type { Doc } from "./bm25.ts";

export type Citation = { chunk: number; quote: string };
export type Answer = { answerable: boolean; answer: string; citations: Citation[] };

export function verify(answer: Answer, chunks: Doc[]): string[] {
  const problems: string[] = [];
  if (answer.answerable && answer.citations.length === 0) {
    problems.push("回答があるのに出典がありません");
  }
  if (!answer.answerable && answer.citations.length > 0) {
    problems.push("回答できないのに出典があります");
  }
  for (const { chunk, quote } of answer.citations) {
    const doc = chunks[chunk - 1];
    if (!doc) {
      problems.push(`資料${chunk}は渡していません`);
    } else if (!doc.text.includes(quote)) {
      problems.push(`資料${chunk}に「${quote}」はありません`);
    }
  }
  return problems;
}
