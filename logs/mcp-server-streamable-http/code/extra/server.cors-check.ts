import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { z } from "zod";

function createServer() {
  const server = new McpServer({ name: "char-count", version: "0.1.0" });
  server.registerTool(
    "count_chars",
    {
      title: "文字数を数える",
      description: "日本語の文章の文字数・行数・UTF-8 のバイト数を返す。文字数は見た目の1文字を1と数え、改行も1文字に含める。行数は改行（LF）で区切った数で、末尾が改行なら最後の空の行も1行と数える。",
      inputSchema: {
        text: z.string().min(1).max(10_000).describe("数えたい文章"),
      },
    },
    async ({ text }) => {
      const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
      const chars = [...segmenter.segment(text)].length;
      const lines = text.split("\n").length;
      const bytes = Buffer.byteLength(text, "utf8");
      return {
        content: [{ type: "text", text: `文字数: ${chars} / 行数: ${lines} / UTF-8: ${bytes} バイト` }],
      };
    },
  );
  return server;
}

const ALLOWED_ORIGINS: string[] = ["http://localhost:5173"];

const app = createMcpExpressApp();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin !== undefined && !ALLOWED_ORIGINS.includes(origin)) {
    res.status(403).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: `Invalid Origin: ${origin}` },
      id: null,
    });
    return;
  }
  next();
});

app.post("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.all("/mcp", (_req, res) => {
  res.status(405).set("Allow", "POST").json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
});

const PORT = 3000;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`char-count MCP server: http://127.0.0.1:${PORT}/mcp`);
});
