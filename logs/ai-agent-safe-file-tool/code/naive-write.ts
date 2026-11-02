import { readFile, writeFile } from "node:fs/promises";

// flag を付けない writeFile は、既にあるリンクをたどって先のファイルに書きます。
await writeFile("workspace/out/report.md", "# 要約\n");
console.log(await readFile("outside/report.md", "utf8"));
