import { createSdkMcpServer, query, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const products: Record<string, { price: number; stock: number }> = {
  ノート: { price: 180, stock: 12 },
  ボールペン: { price: 120, stock: 2 },
};

const getProduct = tool(
  "get_product",
  "商品名から、税抜きの単価と在庫数を調べる",
  { name: z.string().describe("商品名。例: ノート") },
  async ({ name }) => {
    const product = products[name];
    if (!product) {
      return {
        content: [
          {
            type: "text",
            text: `「${name}」は取り扱っていません。扱っている商品: ${Object.keys(products).join("、")}`,
          },
        ],
        isError: true,
      };
    }
    return { content: [{ type: "text", text: JSON.stringify({ name, ...product }) }] };
  },
);

const calculateTotal = tool(
  "calculate_total",
  "単価と数量の一覧から、税込み（10%）の合計金額を計算する",
  {
    lines: z.array(
      z.object({ unitPrice: z.number().int(), quantity: z.number().int().positive() }),
    ),
  },
  async ({ lines }) => {
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const total = Math.floor(subtotal * 1.1);
    return { content: [{ type: "text", text: JSON.stringify({ subtotal, total }) }] };
  },
);

const shopServer = createSdkMcpServer({
  name: "shop",
  version: "1.0.0",
  tools: [getProduct, calculateTotal],
});

for await (const message of query({
  prompt:
    "ノートを2冊、ボールペンを3本、消しゴムを1個買いたいです。在庫を確かめて、買える分だけの税込みの合計金額を、表や太字を使わずに3文以内で答えてください。",
  options: {
    model: "haiku",
    mcpServers: { shop: shopServer },
    strictMcpConfig: true,
    tools: [],
    allowedTools: ["mcp__shop__get_product", "mcp__shop__calculate_total"],
    permissionMode: "dontAsk",
    maxTurns: 10,
    settingSources: [],
  },
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(`[system/init] apiKeySource=${message.apiKeySource} tools=${message.tools.join(",")}`);
  } else if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "text") console.log(`[assistant/text] ${block.text}`);
      if (block.type === "tool_use") {
        console.log(`[assistant/tool_use] ${block.name} ${JSON.stringify(block.input)}`);
      }
    }
  } else if (message.type === "user" && Array.isArray(message.message.content)) {
    for (const block of message.message.content) {
      if (block.type === "tool_result") {
        console.log(`[user/tool_result] is_error=${block.is_error ?? false} ${JSON.stringify(block.content)}`);
      }
    }
  } else if (message.type === "result") {
    console.log(`[result/${message.subtype}] num_turns=${message.num_turns}`);
  }
}
