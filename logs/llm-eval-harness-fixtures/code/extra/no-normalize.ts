// 記事には載せない確認用。normalize を通さずに比べると、見本の回答がどうなるかを出す。
import { answers } from "../answers.ts";

console.log('"Negative" === "negative":', answers["sentiment-1"] === "negative");
console.log('refund の回答 includes("30日"):', answers.refund.includes("30日"));
console.log('"３０日".normalize("NFKC"):', "３０日".normalize("NFKC"));
