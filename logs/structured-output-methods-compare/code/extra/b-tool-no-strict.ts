// 記事には載せない確認用。b-tool.ts と同じ呼び方で、strictMcpConfig だけを外して3件動かす。
// common.ts の run() を使わずに query() を直接呼ぶのは、strictMcpConfig を外すため。
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { cases, Reservation, SYSTEM_PROMPT } from "../cases.ts";

for (const c of cases.slice(0, 3)) {
  const save = tool(
    "save_reservation",
    "問い合わせから取り出した予約の情報を保存する",
    Reservation.shape,
    async () => ({ content: [{ type: "text", text: "保存しました" }] }),
    { alwaysLoad: true },
  );
  const server = createSdkMcpServer({ name: "booking", tools: [save] });
  let mcpServerCount = 0;
  for await (const m of query({
    prompt: `${c.text}\n\n予約の情報を save_reservation で保存してください。`,
    options: {
      model: "haiku",
      tools: [],
      settingSources: [],
      systemPrompt: SYSTEM_PROMPT,
      mcpServers: { booking: server },
      allowedTools: ["mcp__booking__save_reservation"],
      maxTurns: 3,
    },
  })) {
    if (m.type === "system" && m.subtype === "init") mcpServerCount = m.mcp_servers.length;
    if (m.type === "result") {
      const cacheWrite = Object.values(m.modelUsage).reduce((n, u) => n + u.cacheCreationInputTokens, 0);
      console.log(
        `no-strict init.mcp_servers=${mcpServerCount} turns=${m.num_turns} ` +
          `cacheCreationInputTokens=${cacheWrite} total_cost_usd=${m.total_cost_usd.toFixed(5)}`,
      );
      break;
    }
  }
}
