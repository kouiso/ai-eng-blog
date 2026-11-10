import { parseLlmJson } from "./extract-json.ts";

// Messages API の応答のうち、ここで使う2つのフィールドだけを型にしています。
type MessageLike = {
  stop_reason: string;
  content: { type: string; text?: string }[];
};

function readJson(message: MessageLike): unknown {
  // 最後まで書き終えた応答（end_turn）だけを JSON として読みます。
  if (message.stop_reason !== "end_turn") {
    throw new Error(`stop_reason が ${message.stop_reason} の応答は、JSON として読みません。`);
  }
  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("");
  return parseLlmJson(text);
}

// 応答の形を手で作った見本です。
const cut: MessageLike = {
  stop_reason: "max_tokens",
  content: [{ type: "text", text: '{"category": "billing", "summary": "請求額が二重に' }],
};
const refused: MessageLike = {
  stop_reason: "refusal",
  content: [{ type: "text", text: "申し訳ありませんが、この依頼にはお答えできません。" }],
};
const done: MessageLike = {
  stop_reason: "end_turn",
  content: [{ type: "text", text: '```json\n{"category": "billing", "priority": 1}\n```' }],
};

for (const message of [cut, refused, done]) {
  try {
    console.log(message.stop_reason, readJson(message));
  } catch (error) {
    console.log(message.stop_reason, String(error));
  }
}
