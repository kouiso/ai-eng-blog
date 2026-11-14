import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { Reservation } from "./cases.ts";
import { run } from "./common.ts";

export async function extractByTool(text: string) {
  let saved: unknown;
  const save = tool(
    "save_reservation",
    "問い合わせから取り出した予約の情報を保存する",
    Reservation.shape,
    async (args) => {
      saved = args;
      return { content: [{ type: "text", text: "保存しました" }] };
    },
    { alwaysLoad: true },
  );
  const server = createSdkMcpServer({ name: "booking", tools: [save] });
  const result = await run(`${text}\n\n予約の情報を save_reservation で保存してください。`, {
    mcpServers: { booking: server },
    allowedTools: ["mcp__booking__save_reservation"],
    maxTurns: 3,
  });
  if (saved === undefined) return { result, error: `ツールが呼ばれなかった（${result.subtype}）` };
  return { result, value: saved };
}
