import { docs } from "./docs.ts";
import { verify, type Answer } from "./verify.ts";

// 検証の動きを見るための、手で作った誤った回答です。
const chunks = [docs[0], docs[7]];
const sample: Answer = {
  answerable: true,
  answer: "返品は到着から14日以内です。",
  citations: [
    { chunk: 1, quote: "返品は、商品の到着から14日以内に受け付けます。" },
    { chunk: 3, quote: "送料は全国一律550円です。" },
  ],
};

console.log(verify(sample, chunks));
