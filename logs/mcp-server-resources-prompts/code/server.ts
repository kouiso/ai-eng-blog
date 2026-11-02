import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const styleGuide = "# 文章のルール\n- ですます調にそろえる\n- 1文は60字以内にする\n- 太字は使わない";

const glossary = new Map([
  ["resource", "クライアントが URI を指定して読み取るデータ。"],
  ["prompt", "ユーザーが選んで使う、メッセージのひな形。"],
  ["tool", "モデルが自分で選んで呼び出す関数。"],
]);

const server = new McpServer({ name: "writing-helper", version: "0.1.0" });

server.registerResource(
  "style-guide",
  "guide://style",
  { title: "文章のルール", description: "記事を書くときに守るルール", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "text/markdown", text: styleGuide }],
  }),
);

server.registerResource(
  "glossary-term",
  new ResourceTemplate("guide://glossary/{term}", {
    list: async () => ({
      resources: [...glossary.keys()].map((term) => ({ uri: `guide://glossary/${term}`, name: term })),
    }),
  }),
  { title: "用語の説明", mimeType: "text/plain" },
  async (uri, { term }) => {
    const text = glossary.get(String(term));
    if (text === undefined) {
      throw new McpError(-32002, "Resource not found", { uri: uri.href });
    }
    return { contents: [{ uri: uri.href, mimeType: "text/plain", text }] };
  },
);

server.registerPrompt(
  "review-text",
  {
    title: "文章をルールで見直す",
    description: "文章のルールに照らして、直す箇所を挙げてもらう",
    argsSchema: {
      text: z.string().min(1).describe("見直したい文章"),
      focus: z.string().optional().describe("特に見てほしい点"),
    },
  },
  ({ text, focus }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "resource",
          resource: { uri: "guide://style", mimeType: "text/markdown", text: styleGuide },
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `上のルールに照らして、次の文章の直す箇所を挙げてください。${focus ? `特に「${focus}」を見てください。` : ""}\n\n${text}`,
        },
      },
    ],
  }),
);

await server.connect(new StdioServerTransport());
console.error("writing-helper MCP server started (stdio)");
