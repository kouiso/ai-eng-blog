import { run } from "./common.ts";

export async function extractByPrompt(text: string) {
  const prompt = `${text}

次の形の JSON だけを返してください。説明やコードフェンスは付けません。
{"name": 文字列, "date": "YYYY-MM-DD", "people": 整数, "course": "lunch" か "dinner"}`;
  const result = await run(prompt, { maxTurns: 1 });
  if (result.subtype !== "success") return { result, error: result.subtype };
  try {
    return { result, value: JSON.parse(result.result) as unknown };
  } catch (e) {
    return { result, error: `JSON.parse: ${(e as Error).message}` };
  }
}
