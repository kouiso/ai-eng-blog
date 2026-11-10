import { runTool } from "./tools.ts";

// モデルが返す tool_use ブロックの形を手で作った見本です。
const toolUses = [
  { id: "toolu_01", name: "read_file", input: { path: "notes/todo.md" } },
  { id: "toolu_02", name: "read_file", input: { path: "../outside/private.txt" } },
  { id: "toolu_03", name: "read_file", input: { file: "notes/todo.md" } },
  { id: "toolu_04", name: "delete_file", input: { path: "notes/todo.md" } },
];

for (const toolUse of toolUses) {
  const result = await runTool(toolUse.name, toolUse.input);
  console.log(JSON.stringify({ type: "tool_result", tool_use_id: toolUse.id, ...result }));
}
