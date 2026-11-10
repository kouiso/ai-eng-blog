import { readFile, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("workspace");
const WRITE_DIR = "out";
const ALLOWED_EXTENSIONS = new Set([".md", ".txt"]);
const MAX_BYTES = 20_000;

// モデルにそのまま返してよい、理由のわかるエラーです。
export class ToolInputError extends Error {}

function isInside(root: string, target: string): boolean {
  const rel = path.relative(root, target);
  if (rel === "") {
    return true;
  }
  return rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
}

function hasAllowedExtension(file: string): boolean {
  return ALLOWED_EXTENSIONS.has(path.extname(file).toLowerCase());
}

function checkInput(input: string): void {
  if (path.isAbsolute(input)) {
    throw new ToolInputError("notes/todo.md のように、作業フォルダからの相対パスで指定してください。");
  }
  if (!hasAllowedExtension(input)) {
    throw new ToolInputError(`扱えるのは ${[...ALLOWED_EXTENSIONS].join("、")} のファイルだけです。`);
  }
}

// fs のエラーの文には絶対パスが入るので、パスを含まない文に置き換えます。
function toToolError(error: unknown, input: string): unknown {
  if (error instanceof ToolInputError) return error;
  const code = (error as { code?: string }).code;
  if (code === "ENOENT") return new ToolInputError(`${input} はありません。`);
  if (code === "EEXIST") return new ToolInputError(`${input} は既にあります。別の名前にしてください。`);
  if (code === "EISDIR") return new ToolInputError(`${input} はフォルダです。`);
  return error;
}

export async function readTextFile(input: string): Promise<string> {
  checkInput(input);
  const root = await realpath(ROOT);
  const target = path.resolve(root, input);
  if (!isInside(root, target)) {
    throw new ToolInputError("作業フォルダの外は読めません。");
  }
  try {
    // リンクをたどった先でも、同じ2つを確かめます。
    const real = await realpath(target);
    if (!isInside(root, real) || !hasAllowedExtension(real)) {
      throw new ToolInputError("リンクの先が作業フォルダの外か、許可していない種類のファイルです。");
    }
    const { size } = await stat(real);
    if (size > MAX_BYTES) {
      throw new ToolInputError(`${MAX_BYTES} バイトを超えるファイルは読めません（${size} バイト）。`);
    }
    return await readFile(real, "utf8");
  } catch (error) {
    throw toToolError(error, input);
  }
}

export async function writeTextFile(input: string, content: string): Promise<void> {
  checkInput(input);
  const root = await realpath(ROOT);
  const writeRoot = path.join(root, WRITE_DIR);
  const target = path.resolve(root, input);
  if (!isInside(writeRoot, target)) {
    throw new ToolInputError(`書き込めるのは ${WRITE_DIR}/ の下だけです。`);
  }
  try {
    const parent = await realpath(path.dirname(target));
    if (!isInside(await realpath(writeRoot), parent)) {
      throw new ToolInputError(`書き込めるのは ${WRITE_DIR}/ の下だけです。`);
    }
    // "wx" は、同じ名前のファイルかリンクが既にあると失敗します。
    await writeFile(path.join(parent, path.basename(target)), content, { flag: "wx" });
  } catch (error) {
    throw toToolError(error, input);
  }
}
