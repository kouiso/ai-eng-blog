import { query } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const Inquiry = z.object({
  category: z.enum(["billing", "bug", "feature_request", "other"]),
  priority: z.int().min(1).max(3).describe("1 が最も急ぎ"),
  summary: z.string(),
  due_date: z.string().nullable().describe("期限の日付。無ければ null"),
});

const schema = z.toJSONSchema(Inquiry, { target: "draft-7" });

for await (const message of query({
  prompt: "次の問い合わせを分類してください。\n\n件名: 画面が真っ白\nログインすると画面が真っ白になります。",
  options: {
    model: "haiku",
    tools: [],
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    outputFormat: { type: "json_schema", schema },
  },
})) {
  if (message.type === "result" && message.subtype === "success" && !message.is_error) {
    const parsed = Inquiry.safeParse(message.structured_output);
    if (parsed.success) {
      const inquiry: z.infer<typeof Inquiry> = parsed.data;
      console.log(`${inquiry.category} / 優先度 ${inquiry.priority} / 期限 ${inquiry.due_date ?? "なし"}`);
      console.log(inquiry.summary);
    } else {
      console.log(z.prettifyError(parsed.error));
    }
  }
}
