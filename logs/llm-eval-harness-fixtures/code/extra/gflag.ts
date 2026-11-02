// 記事には載せない確認用。g フラグ付きの正規表現を使い回すと、同じ文字列でも test() の結果が変わることを確かめる。
const re = /3件/g;
const text = "注文は3件です。";
console.log("1回目:", re.test(text), "lastIndex =", re.lastIndex);
console.log("2回目:", re.test(text), "lastIndex =", re.lastIndex);
console.log("3回目:", re.test(text), "lastIndex =", re.lastIndex);
