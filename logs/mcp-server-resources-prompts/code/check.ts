import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "check-client", version: "0.0.0" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: ["server.ts"] }));

console.log("capabilities:", JSON.stringify(client.getServerCapabilities()));

const { resources } = await client.listResources();
console.log("resources:", resources.map((r) => r.uri));

const { resourceTemplates } = await client.listResourceTemplates();
console.log("templates:", resourceTemplates.map((t) => t.uriTemplate));

const term = await client.readResource({ uri: "guide://glossary/prompt" });
console.log("read:", JSON.stringify(term.contents));

const { prompts } = await client.listPrompts();
console.log("prompt args:", JSON.stringify(prompts[0].arguments));

const prompt = await client.getPrompt({
  name: "review-text",
  arguments: { text: "MCP サーバーを作った。とても便利だ。", focus: "文体" },
});
console.log("messages:", JSON.stringify(prompt.messages, null, 2));

for (const uri of ["guide://glossary/agent", "memo://today"]) {
  await client.readResource({ uri }).catch((e) => console.log("error:", e.code, e.message));
}
await client
  .getPrompt({ name: "review-text", arguments: {} })
  .catch((e) => console.log("error:", e.code, e.message));

await client.close();
