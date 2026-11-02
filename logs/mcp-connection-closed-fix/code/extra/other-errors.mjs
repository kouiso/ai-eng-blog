// 記事に載せない確認。Connection closed 以外の2つの失敗で、SDK 1.32.2 の connect() が何を投げるかを見る。
// 1) 起動するコマンドが無い 2) プロセスは動いているが initialize に応答しない（既定の60秒を待つ）
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function attempt(label, params) {
  const client = new Client({ name: "probe", version: "0.0.0" });
  const started = Date.now();
  try {
    await client.connect(new StdioClientTransport({ ...params, stderr: "pipe" }));
    console.log(`${label}: connected`);
  } catch (error) {
    const seconds = Math.round((Date.now() - started) / 1000);
    console.log(`${label}: ${error.message} (${seconds}s)`);
  } finally {
    await client.close();
  }
}

await attempt("command not found", { command: "nodee", args: ["server.ts"] });
await attempt("no response", { command: process.execPath, args: ["-e", "setInterval(() => {}, 1000)"] });
