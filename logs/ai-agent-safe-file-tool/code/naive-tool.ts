import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("workspace");

// モデルが渡したパスを、作業フォルダにつなげてそのまま読みます。
export async function readNaive(input: string): Promise<string> {
  return readFile(path.join(ROOT, input), "utf8");
}

// よく見かける守り方です。パスの先頭が作業フォルダと同じなら読みます。
export async function readWithPrefixCheck(input: string): Promise<string> {
  const target = path.resolve(ROOT, input);
  if (!target.startsWith(ROOT)) {
    throw new Error("作業フォルダの外です");
  }
  return readFile(target, "utf8");
}
