import { baseOptions, runAgent } from "./run-agent.ts";

// node turns-limit.ts 2 のように、maxTurns をコマンドの引数で渡す
const maxTurns = Number(process.argv[2]);
console.log(`maxTurns: ${maxTurns}`);
await runAgent({ ...baseOptions, maxTurns });
