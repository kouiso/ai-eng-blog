import { query } from "@anthropic-ai/claude-agent-sdk";
import { baseOptions, printResult, task } from "./run-agent.ts";

// try/catch を付けずに maxTurns: 1 で動かすと、result を受け取ったあとで例外が投げられる
for await (const message of query({ prompt: task, options: { ...baseOptions, maxTurns: 1 } })) {
  if (message.type === "result") {
    printResult(message);
  }
}
console.log("ループのあとの行");
