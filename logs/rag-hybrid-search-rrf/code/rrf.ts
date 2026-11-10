export type Fused = { id: string; score: number; ranks: (number | null)[] };

export function rrf(lists: string[][], k = 60): Fused[] {
  const rows = new Map<string, Fused>();
  lists.forEach((ids, listIndex) => {
    ids.forEach((id, i) => {
      const rank = i + 1;
      const row = rows.get(id) ?? { id, score: 0, ranks: lists.map(() => null) };
      row.score += 1 / (k + rank);
      row.ranks[listIndex] = rank;
      rows.set(id, row);
    });
  });
  return [...rows.values()].sort((x, y) => y.score - x.score);
}
