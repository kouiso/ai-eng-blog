import { baseOptions, runAgent } from "./run-agent.ts";

// node budget-limit.ts 0.002 のように、maxBudgetUsd（米ドル）をコマンドの引数で渡す
const maxBudgetUsd = Number(process.argv[2]);
console.log(`maxBudgetUsd: ${maxBudgetUsd}`);
await runAgent({ ...baseOptions, maxBudgetUsd });
