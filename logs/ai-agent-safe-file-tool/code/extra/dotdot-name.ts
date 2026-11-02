// isInside が「..」で始まる名前のファイル（..memo.md）を外と取り違えないことの確認用（記事には載せない）。
import path from "node:path";

const root = path.resolve("workspace");
const rel = path.relative(root, path.join(root, "..memo.md"));
console.log(JSON.stringify(rel), rel.startsWith(".."), rel === ".." || rel.startsWith(`..${path.sep}`));
