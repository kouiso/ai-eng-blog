import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("使い方: node check.ts <コマンド> [引数...]");
  process.exit(2);
}

const transport = new StdioClientTransport({ command, args, stderr: "pipe" });
let serverStderr = "";
transport.stderr?.on("data", (chunk) => {
  serverStderr += chunk.toString();
});

const client = new Client({ name: "check-client", version: "0.0.0" });
try {
  await client.connect(transport);
  console.log("ok:", JSON.stringify(client.getServerVersion()));
  if (client.getServerCapabilities()?.tools) {
    const { tools } = await client.listTools();
    console.log("tools:", tools.map((tool) => tool.name).join(", "));
  }
} catch (error) {
  console.log("failed:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await client.close();
  console.log("--- server stderr ---");
  console.log(serverStderr.trim() || "(empty)");
}
