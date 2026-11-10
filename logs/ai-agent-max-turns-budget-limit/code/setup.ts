import { mkdirSync, writeFileSync } from "node:fs";

// エージェントに読ませる見本のメモを docs/ に3つ作る
mkdirSync("docs", { recursive: true });
writeFileSync("docs/cancel.md", "# 予約の取り消し\n\n前日の18時までなら無料で取り消せます。\n");
writeFileSync("docs/payment.md", "# 支払い方法\n\nクレジットカードと銀行振込に対応しています。\n");
writeFileSync("docs/parking.md", "# 駐車場\n\n建物の裏に5台分あります。\n");
console.log("docs/ に3つのファイルを作りました");
