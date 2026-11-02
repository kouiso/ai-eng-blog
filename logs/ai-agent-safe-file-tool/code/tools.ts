import { readTextFile, ToolInputError, writeTextFile } from "./safe-file-tools.ts";

type ToolInput = Record<string, unknown>;
type ToolResult = { content: string; is_error: boolean };

function requireString(input: ToolInput, key: string): string {
  const value = input[key];
  if (typeof value !== "string") {
    throw new ToolInputError(`${key} に文字列を指定してください。`);
  }
  return value;
}

// モデルに使わせるツールの許可リストです。ここに無い名前は実行しません。
const handlers = new Map<string, (input: ToolInput) => Promise<string>>([
  ["read_file", (input) => readTextFile(requireString(input, "path"))],
  [
    "write_file",
    async (input) => {
      await writeTextFile(requireString(input, "path"), requireString(input, "content"));
      return "書き込みました。";
    },
  ],
]);

export async function runTool(name: string, input: ToolInput): Promise<ToolResult> {
  const handler = handlers.get(name);
  if (!handler) {
    return { content: `${name} というツールはありません。使えるのは ${[...handlers.keys()].join("、")} です。`, is_error: true };
  }
  try {
    return { content: await handler(input), is_error: false };
  } catch (error) {
    if (error instanceof ToolInputError) {
      return { content: error.message, is_error: true };
    }
    // 想定していないエラーは中身をモデルに見せず、ログにだけ残します。
    console.error(error);
    return { content: "ツールの実行に失敗しました。", is_error: true };
  }
}
