// 記事には載せない確認用。delivery-date の正規表現に、前後に空白・改行・句点が付いた回答と全角の数字の回答をかける。
import { grade } from "../graders.ts";

const pattern = "^\\d{4}-\\d{2}-\\d{2}$";
for (const answer of [" 2026-11-20", "2026-11-20\n", "２０２６-１１-２０", "2026-11-20。"]) {
  console.log(JSON.stringify(answer), grade(answer, { type: "regex", pattern }).pass);
}
