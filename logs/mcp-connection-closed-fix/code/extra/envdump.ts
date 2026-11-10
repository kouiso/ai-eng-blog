// 記事に載せない確認（run/20）。受け取った環境変数の名前（値は書かない）を DUMP_TO のファイルに書き、other.ts を起動する。
import { writeFileSync } from "node:fs";
writeFileSync(process.env.DUMP_TO ?? "/dev/null", Object.keys(process.env).sort().join("\n"));
await import("./other.ts");
