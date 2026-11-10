// 記事には載せない確認用。表の5行目（JSON が無い出力）、extractJson が元の文字列をそのまま返すこと、後ろの文の括弧で範囲がずれることを確かめる。
import { extractJson, parseLlmJson } from "../extract-json.ts";

const cases = {
  noJson: "申し訳ありませんが、この依頼にはお答えできません。",
  leadingSpace: "  \n分類できませんでした。",
  trailingBracket: '{"category": "billing", "priority": 1}\n以上です（参考 [1]）。',
};

for (const [name, text] of Object.entries(cases)) {
  const extracted = extractJson(text);
  console.log(`${name}: 元の文字列のまま=${extracted === text} 切り出した範囲=${JSON.stringify(extracted)}`);
  try {
    console.log(`${name}:`, parseLlmJson(text));
  } catch (error) {
    console.log(`${name}: ${String(error)}`);
  }
}
