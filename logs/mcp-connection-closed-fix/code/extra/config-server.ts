// 記事に載せない確認（run/19）。無い設定ファイル config.json を読んで、環境変数とは別の理由で起動に失敗する。
import { readFileSync } from "node:fs";
const config = JSON.parse(readFileSync("config.json", "utf8"));
console.error(config);
