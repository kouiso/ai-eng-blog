// 記事には載せない確認用。delivery-date の正規表現は形しか見ないので、違う日付でも合格になることを確かめる。
import { grade } from "../graders.ts";

const pattern = "^\\d{4}-\\d{2}-\\d{2}$";
console.log("2026-11-20:", grade("2026-11-20", { type: "regex", pattern }));
console.log("2026-11-21:", grade("2026-11-21", { type: "regex", pattern }));
