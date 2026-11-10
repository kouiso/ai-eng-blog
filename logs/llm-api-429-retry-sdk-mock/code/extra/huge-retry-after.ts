import { createServer } from "node:http";
import Anthropic from "@anthropic-ai/sdk";

// retry-after: 2147484 秒 = 2147484000 ms は 2^31 - 1 ms（2147483647）を超える。
// SDK 1.3.0 がこの値を捨てて既定の待ち時間（最初は 0.5 秒から最大25%引いた値）に切り替えるかを、サーバーが受け取った間隔で見る。
let n = 0;
let firstAt = 0;
const server = createServer((req, res) => {
  n++;
  if (n === 1) firstAt = Date.now();
  console.log(`huge-retry-after #${n} +${Date.now() - firstAt}ms`);
  if (n === 1) {
    res.writeHead(429, { "content-type": "application/json", "retry-after": "2147484" });
    res.end(JSON.stringify({ type: "error", error: { type: "rate_limit_error", message: "mock" }, request_id: "req_mock" }));
    return;
  }
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ id: "msg_mock", type: "message", role: "assistant", model: "claude-opus-5-5", content: [{ type: "text", text: "mock: ok" }], stop_reason: "end_turn", stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } }));
}).listen(4011, "127.0.0.1");

const client = new Anthropic({ apiKey: "dummy-key-not-sent-anywhere", baseURL: "http://127.0.0.1:4011", maxRetries: 2 });
const startedAt = Date.now();
const message = await client.messages.create(
  { model: "claude-opus-5-5", max_tokens: 64, messages: [{ role: "user", content: "こんにちは" }] },
  { signal: AbortSignal.timeout(10_000) },
);
console.log(`ok (${Date.now() - startedAt}ms):`, message.content[0]);
server.close();
