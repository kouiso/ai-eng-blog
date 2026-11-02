// 記事には載せない確認用。見本の回答が無いテストケースを足すと、空文字として採点され不合格になることを確かめる。
import { grade } from "../graders.ts";

console.log(grade("", { type: "exact", expected: "negative" }));
console.log(grade("", { type: "contains", keywords: ["30日"] }));
console.log(grade("", { type: "regex", pattern: "(?<!\\d)3件" }));
