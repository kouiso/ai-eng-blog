export function recallAtK(ranked: string[], relevant: string[], k: number): number {
  const top = new Set(ranked.slice(0, k));
  const found = relevant.filter((id) => top.has(id)).length;
  return found / relevant.length;
}

export function reciprocalRank(ranked: string[], relevant: string[]): number {
  const i = ranked.findIndex((id) => relevant.includes(id));
  return i === -1 ? 0 : 1 / (i + 1);
}

export function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
