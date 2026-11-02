// 記事には載せない確認用。ステートレスのトランスポートで handleRequest を2回呼び、2回目に投げられる例外の文言を出す。
// server.reuse.ts のサーバーは、この例外を 500 の空の本文に変えて返し、サーバーの画面には何も出さない（run のログ）。
// 文言そのものを確かめるため、Node.js 用のトランスポートの中身である Web 標準版を直接呼ぶ。
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
const request = () =>
  new Request("http://127.0.0.1:3000/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
  });
const first = await transport.handleRequest(request());
console.log("1st:", first.status);
try {
  await transport.handleRequest(request());
  console.log("2nd: no error");
} catch (error) {
  console.log("2nd threw:", error.message);
}
