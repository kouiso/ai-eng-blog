import { readdir } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const notesDir = process.env.NOTES_DIR;
if (!notesDir) {
  throw new Error("環境変数 NOTES_DIR が設定されていません");
}

const server = new McpServer({ name: "notes", version: "0.1.0" });

server.registerTool(
  "count_notes",
  {
    title: "メモの数を数える",
    description: "NOTES_DIR にある .md ファイルの数を返す。",
  },
  async () => {
    const files = await readdir(notesDir);
    const count = files.filter((name) => name.endsWith(".md")).length;
    return { content: [{ type: "text", text: `メモ: ${count} 件` }] };
  },
);

await server.connect(new StdioServerTransport());
console.error("notes MCP server started (stdio)");
