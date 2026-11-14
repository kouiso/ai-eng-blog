import { execFile } from "node:child_process";

const started = Date.now();
const args = [
  "-p", "1+1 の答えを数字だけで答えてください。",
  "--model", "haiku",
  "--output-format", "json",
  "--setting-sources", "",
  "--strict-mcp-config",
  "--tools", "",
];
execFile("claude", args, (error, stdout, stderr) => {
  if (error) throw error;
  console.log(`result: ${JSON.parse(stdout).result}`);
  console.log(`stderr: ${stderr.trim()}`);
  console.log(`elapsed_seconds=${((Date.now() - started) / 1000).toFixed(1)}`);
});
