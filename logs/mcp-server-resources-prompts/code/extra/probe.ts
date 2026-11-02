// 記事に載せない確認用。指定したサーバーのファイルを起動し、URI を1つずつ読んで結果かエラーを表示する。
// 使い方: node probe.ts <サーバーの .ts> <URI> [<URI> ...]
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const [serverFile, ...uris] = process.argv.slice(2);
const client = new Client({ name: "probe-client", version: "0.0.0" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: [serverFile] }));
for (const uri of uris) {
  await client
    .readResource({ uri })
    .then((r) => console.log("read:", uri, JSON.stringify(r.contents)))
    .catch((e) => console.log("error:", uri, e.code, e.message));
}
await client.close();
