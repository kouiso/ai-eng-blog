import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(new URL("http://127.0.0.1:3000/mcp"));
const client = new Client({ name: "check-client", version: "0.0.0" });
client.onerror = (error) => console.error("client error:", error.message);
await client.connect(transport);

const { tools } = await client.listTools();
console.log("tools:", tools.map((t) => t.name));

const ok = await client.callTool({
  name: "count_chars",
  arguments: { text: "MCPサーバーを作る👨‍👩‍👧\n2行目" },
});
console.log("ok:", JSON.stringify(ok));
console.log("session:", transport.sessionId);

await client.close();
