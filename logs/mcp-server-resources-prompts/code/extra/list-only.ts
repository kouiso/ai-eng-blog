// 記事に載せない確認用。指定したサーバーのファイルを起動し、resources/list と resources/templates/list の URI だけを表示する。
// 使い方: node list-only.ts <サーバーの .ts>
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "list-client", version: "0.0.0" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: [process.argv[2]] }));
console.log("resources:", (await client.listResources()).resources.map((r) => r.uri));
console.log("templates:", (await client.listResourceTemplates()).resourceTemplates.map((t) => t.uriTemplate));
await client.close();
