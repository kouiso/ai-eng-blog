// 記事に載せない確認（run/19）。ツールが hello だけの、server.ts とは別のサーバー。引数を stderr に書く。
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
const server = new McpServer({ name: "other", version: "1.0.0" });
server.registerTool("hello", { description: "hi" }, async () => ({ content: [{ type: "text", text: "hi" }] }));
await server.connect(new StdioServerTransport());
console.error("other started, args=" + process.argv.slice(2).join(" "));
