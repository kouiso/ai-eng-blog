import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [process.argv[2] ?? "server.ts"],
  env: { NOTES_DIR: process.env.NOTES_DIR ?? "" },
  stderr: "pipe",
});
let serverStderr = "";
transport.stderr?.on("data", (chunk) => {
  serverStderr += chunk.toString();
});

const client = new Client({ name: "check-client", version: "0.0.0" });
try {
  await client.connect(transport);
  const result = await client.callTool({ name: "count_notes", arguments: {} });
  console.log("ok:", JSON.stringify(result));
} catch (error) {
  console.log("failed:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await client.close();
  console.log("--- server stderr ---");
  console.log(serverStderr.trim() || "(empty)");
}
