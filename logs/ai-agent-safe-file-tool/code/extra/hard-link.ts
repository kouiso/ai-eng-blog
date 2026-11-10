// 記事の「この関数で防げないこと」の確認用（記事には載せない）。
// 作業フォルダの中に、外のファイルへのハードリンクを置くと readTextFile が読めてしまうことを確かめる。
import { linkSync } from "node:fs";
import { readTextFile } from "../safe-file-tools.ts";

linkSync("outside/private.txt", "workspace/notes/hard.txt");
console.log(await readTextFile("notes/hard.txt"));
