import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "char-count", version: "0.1.0" });

server.registerTool(
  "count_chars",
  {
    title: "文字数を数える",
    description: "文章の文字数（見た目の1文字を1と数える）と行数を返す。",
    inputSchema: {
      text: z.string().min(1).max(10_000).describe("数えたい文章"),
    },
  },
  async ({ text }) => {
    const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
    const chars = [...segmenter.segment(text)].length;
    const lines = text.split("\n").length;
    return {
      content: [{ type: "text", text: `文字数: ${chars} / 行数: ${lines}` }],
    };
  },
);

await server.connect(new StdioServerTransport());
console.error("char-count MCP server started (stdio)");
