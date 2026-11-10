// 記事に載せない確認用。重複を除いたあとのカテゴリごとの件数（build-cases.ts の出力と同じ）から、
// Math.max(1, …) がある場合と無い場合の件数を比べる。
const TOTAL = 5;
const counts: Record<string, number> = { shipping: 6, refund: 3, account: 2, payment: 1 };
const sum = Object.values(counts).reduce((a, b) => a + b, 0);
let withMin = 0;
let withoutMin = 0;
for (const [category, n] of Object.entries(counts)) {
  const raw = (TOTAL * n) / sum;
  const a = Math.max(1, Math.round(raw));
  const b = Math.round(raw);
  withMin += a;
  withoutMin += b;
  console.log(`${category}: ${n}件 → 割合どおり ${raw.toFixed(3)}、最低1件あり ${a}件、なし ${b}件`);
}
console.log(`合計: 最低1件あり ${withMin}件、なし ${withoutMin}件（目標 ${TOTAL}件）`);
