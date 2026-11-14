import { query } from "@anthropic-ai/claude-agent-sdk";
import { createSearch } from "./bm25.ts";
import { docs } from "./docs.ts";
import { verify, type Answer } from "./verify.ts";

const schema = {
  type: "object",
  properties: {
    answerable: { type: "boolean" },
    answer: { type: "string" },
    citations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          chunk: { type: "integer" },
          quote: { type: "string" },
        },
        required: ["chunk", "quote"],
        additionalProperties: false,
      },
    },
  },
  required: ["answerable", "answer", "citations"],
  additionalProperties: false,
};

const systemPrompt = `ネットショップの問い合わせに、渡された資料だけを使って答えてください。
citations には、答えに使った資料の番号と、その資料からそのまま写した一文を入れてください。
資料に答えが無いときは、answerable を false にし、citations を空にしてください。`;

const question = process.argv[2] ?? "";
const chunks = createSearch(docs)(question)
  .filter((hit) => hit.score >= 0.1)
  .map((hit) => hit.doc);

if (chunks.length === 0) {
  console.log("資料が見つからないので、モデルを呼ばずに「わかりません」と返します。");
  process.exit(0);
}

const prompt = `${chunks
  .map((doc, i) => `<chunk number="${i + 1}">\n${doc.text}\n</chunk>`)
  .join("\n")}

質問: ${question}`;

for await (const message of query({
  prompt,
  options: {
    model: "haiku",
    systemPrompt,
    tools: [],
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    outputFormat: { type: "json_schema", schema },
  },
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(`apiKeySource: ${message.apiKeySource} tools: ${message.tools.join(",")}`);
  }
  if (message.type !== "result") continue;
  if (message.subtype !== "success" || message.is_error || !message.structured_output) {
    throw new Error(`回答を受け取れませんでした（subtype: ${message.subtype}）`);
  }
  const answer = message.structured_output as Answer;
  console.log(`渡した資料: ${chunks.map((doc, i) => `${i + 1}=${doc.id}`).join(" ")}`);
  console.log(JSON.stringify(answer, null, 2));
  const problems = verify(answer, chunks);
  console.log(problems.length === 0 ? "検証: OK" : `検証: NG ${problems.join(" / ")}`);
  console.log(`num_turns=${message.num_turns} total_cost_usd=${message.total_cost_usd}`);
}
