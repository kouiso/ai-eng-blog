// 記事には載せない確認用。embed() の返すベクトルの次元数と長さ（L2 ノルム）を出す。
import { embed } from "./embed.ts";

const vectors = await embed(["query: 利用限度額", "passage: 送料は全国一律550円です。"]);
for (const v of vectors) {
  const norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  console.log("次元数", v.length, "長さ", norm.toFixed(6));
}
