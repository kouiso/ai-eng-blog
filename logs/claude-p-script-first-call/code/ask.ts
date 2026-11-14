import { spawn } from "node:child_process";

type ClaudeResult = {
  type: "result";
  subtype: string;
  is_error: boolean;
  result: string;
  num_turns: number;
  total_cost_usd: number;
};

function askClaude(prompt: string, input = ""): Promise<ClaudeResult> {
  const args = [
    "-p", prompt,
    "--model", "haiku",
    "--output-format", "json",
    "--setting-sources", "",
    "--strict-mcp-config",
    "--tools", "",
  ];
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args);
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (stdout.trim() === "") {
        reject(new Error(`claude exited with ${code}: ${stderr.trim()}`));
        return;
      }
      const result = JSON.parse(stdout) as ClaudeResult;
      if (result.is_error) {
        reject(new Error(`claude returned an error: ${result.result}`));
        return;
      }
      resolve(result);
    });
    child.stdin.end(input);
  });
}

const started = Date.now();
const answer = await askClaude("TypeScript の型注釈とは何かを、日本語の1文で答えてください。");
console.log(`answer: ${answer.result}`);
console.log(`subtype=${answer.subtype} num_turns=${answer.num_turns} total_cost_usd=${answer.total_cost_usd}`);

const log = "TypeError: Cannot read properties of undefined (reading 'map')\n    at renderList (src/list.ts:12:18)\n";
const cause = await askClaude("標準入力で渡したエラーログの原因を、日本語の1文で説明してください。", log);
console.log(`cause: ${cause.result}`);
console.log(`elapsed_seconds=${((Date.now() - started) / 1000).toFixed(1)}`);
