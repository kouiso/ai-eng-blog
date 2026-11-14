---
title: "AI エージェントに渡すファイル操作ツールを安全に作る【パスの制限と許可リスト】"
slug: "ai-agent-safe-file-tool"
description: "AI エージェントのファイル操作ツールが、作業フォルダの外を読まないようにする TypeScript の関数を作ります。パスは path.relative と realpath で確かめ、拡張子とツール名は許可リストで絞ります。危ない入力を関数に直接渡した実行結果つきです。"
tags: ["AIエージェント", "TypeScript", "tool use"]
main_keyword: "AIエージェント"
target_query: null
course_step: 4
cost_estimate: "記事のコードは API を呼ばないので無料です。モデルにつないで動かすと、ツールの定義と結果の文字列も入力トークンとして料金がかかります。"
run_environment: "Node.js 22.22.0、npm 10.9.4、依存パッケージなし（型の確認は TypeScript 7.0.2）、Linux x86_64"
verified_at: "2026-11-10"
prev: "ai-agent-max-turns-budget-limit"
next: "ai-agent-vs-workflow"
sources:
  - url: "https://nodejs.org/docs/v22.22.0/api/path.html"
    title: "Node.js v22.22.0 Path"
    accessed: 2026-10-31
  - url: "https://nodejs.org/docs/v22.22.0/api/fs.html"
    title: "Node.js v22.22.0 File system"
    accessed: 2026-10-31
  - url: "https://nodejs.org/docs/v22.22.0/api/typescript.html"
    title: "Node.js v22.22.0 Modules: TypeScript"
    accessed: 2026-10-31
  - url: "https://community.owasp.org/attacks/Path_Traversal"
    title: "Path Traversal (OWASP Foundation)"
    accessed: 2026-10-31
  - url: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/"
    title: "LLM06:2025 Excessive Agency (OWASP Gen AI Security Project)"
    accessed: 2026-10-31
  - url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls"
    title: "Handle tool calls"
    accessed: 2026-10-31
  - url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools"
    title: "Define tools"
    accessed: 2026-10-31
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing"
    accessed: 2026-10-31
  - url: "https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/create-symbolic-links"
    title: "Create symbolic links (Microsoft Learn)"
    accessed: 2026-11-10
  - url: "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-createsymboliclinkw"
    title: "CreateSymbolicLinkW function (Microsoft Learn)"
    accessed: 2026-11-10
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-10
---


AI エージェントのファイル操作ツールは、モデルが渡したパスをそのまま開くと作業フォルダの外まで読みます。防ぐ手立ては、`realpath` で実体に直したパスを `path.relative` で中か外か判定することです。そのうえで、拡張子、書き込み先、ツール名を許可リストで絞ります。

対象は、tool use で AI エージェントを作り始めた人です。この記事のコードは API を呼ばず、危ない入力をツールの関数に直接渡して確かめます。モデルにつなぐループのコードは、この記事には載せていません。モデルにツールを渡す流れは、[自作ツールを Agent SDK に渡す記事](/posts/ai-agent-custom-tools-agent-sdk)で扱います。

この記事は[前の記事](/posts/ai-agent-max-turns-budget-limit)の続きです。講座の前の回では、エージェントのループを最大ターン数とトークン予算で止める予定にしています。今回は、そのループから呼ばれるツールの関数に検査を入れます。

## モデルが渡すパスは、実体の場所と種類を確かめてから開く

ツールに届くパスは、モデルが作った文字列です。ツールの結果には外から来た文章が入り、そこに仕込まれた指示でモデルが誘導されることがあります（出典6）。OWASP は、この種の弱点を Excessive Agency と呼んでいます（出典5）。予想外の出力か、操作された出力に従って、害のある操作が実行される弱点です（出典5）。

この記事の関数は、次の表の検査をすべて通ったパスを開き、1つでも通らなければ断ります。

| 検査 | 断る入力の例 | 使う関数 |
|---|---|---|
| 1. 絶対パスを断る | `/etc/hostname` | `path.isAbsolute` |
| 2. 作業フォルダの中かを判定する | `../outside/private.txt`、`../workspace-old/memo.txt` | `path.resolve`、`path.relative` |
| 3. シンボリックリンク（以下、リンク）の先も同じ判定にかける | `notes/shortcut.txt`（外を指すリンク） | `realpath` |
| 4. 許可リストで絞る | `.env`、30,000 バイトのファイル、`delete_file` というツール名 | `path.extname`、`stat`、`Map` |

守りの本体は2と3です。1と4は、モデルに直し方を伝える役と、作業フォルダの中にある読ませたくないファイルを除く役を受け持ちます。

## 動かした環境と準備

動かした環境は Linux x86_64 の Node.js 22.22.0 と npm 10.9.4 です。依存パッケージは使いません。Node.js 22.18.0 以上は、`.ts` のファイルの型を取り除いてそのまま実行します（出典3）。実行時に型の検査はしないので（出典3）、型は別に TypeScript 7.0.2 の `tsc` で確かめました。

Node.js のバージョンを確かめてください。

```bash
node -v
```

```text
v22.22.0
```

記事用のフォルダ `safe-file-tool` を作って移動します。

```bash
mkdir safe-file-tool
cd safe-file-tool
```

`package.json` を次の内容で置きます。`"type": "module"` は、`.ts` で `import` を使うための指定です（出典3）。

```json
{
  "name": "safe-file-tool",
  "private": true,
  "type": "module"
}
```

### setup.ts が作る見本の配置

攻撃に使う見本のファイルは、スクリプトで作ります。次のファイルを `setup.ts` として保存してください。

```ts
import { mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";

// 前回の実行で作ったものを消してから、見本のファイルを作り直します。
for (const dir of ["workspace", "workspace-old", "outside"]) {
  rmSync(dir, { recursive: true, force: true });
}
mkdirSync("workspace/notes", { recursive: true });
mkdirSync("workspace/out");
mkdirSync("workspace-old");
mkdirSync("outside");

writeFileSync("workspace/notes/todo.md", "# TODO\n- 請求書を送る\n");
writeFileSync("workspace/notes/big.md", "a".repeat(30_000));
writeFileSync("workspace/.env", "SAMPLE_KEY=dummy-value\n");
writeFileSync("workspace-old/memo.txt", "隣のフォルダのメモです\n");
writeFileSync("outside/private.txt", "作業フォルダの外のファイルです\n");

// 作業フォルダの中に、外を指すリンクを2つ置きます。
symlinkSync("../../outside/private.txt", "workspace/notes/shortcut.txt");
symlinkSync("../../outside/report.md", "workspace/out/report.md");

console.log("見本のファイルを作りました");
```

`setup.ts` は、`symlinkSync` でリンクを作ります。Windows では、リンクを作る権利を既定で持つのは Administrators グループです（出典9）。昇格していないプロセスから作るには、開発者モードを有効にしておく必要があります（出典10）。Windows で試すときは、管理者として開いたターミナルで実行してください。この記事のコードは Linux でしか動かしていません。

実行します。

```bash
node setup.ts
```

```text
見本のファイルを作りました
```

できあがる配置は次のとおりです。`->` は、リンクが指す先を表します。エージェントに渡す作業フォルダは `workspace` です。`workspace-old` と `outside` は、その外にあります。

```text
safe-file-tool/
  workspace/
    .env
    notes/todo.md
    notes/big.md          30,000 バイト
    notes/shortcut.txt    -> ../../outside/private.txt
    out/report.md         -> ../../outside/report.md（リンクの先はまだ無い）
  workspace-old/memo.txt
  outside/private.txt
```

`workspace-old` は、名前の先頭が `workspace` と同じ隣のフォルダです。文字列の比較の落とし穴を見せるために置きました。

## 素朴な実装は ../ とリンクで作業フォルダの外を読む

先に、守りの無い実装と、よく見かける守り方を動かします。次のファイルを `naive-tool.ts` として保存してください。

```ts
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
```

`try-naive.ts` は、両方の関数に同じ入力を順に渡すファイルです。次の内容で保存します。

```ts
import { readNaive, readWithPrefixCheck } from "./naive-tool.ts";

const inputs = [
  "notes/todo.md",
  "../outside/private.txt",
  "../workspace-old/memo.txt",
  "notes/shortcut.txt",
];

for (const read of [readNaive, readWithPrefixCheck]) {
  console.log(`[${read.name}]`);
  for (const input of inputs) {
    try {
      const text = await read(input);
      console.log(`  ${input} -> 読めた: ${text.split("\n")[0]}`);
    } catch (error) {
      console.log(`  ${input} -> 拒否: ${(error as Error).message}`);
    }
  }
}
```

実行します。

```bash
node try-naive.ts
```

```text
[readNaive]
  notes/todo.md -> 読めた: # TODO
  ../outside/private.txt -> 読めた: 作業フォルダの外のファイルです
  ../workspace-old/memo.txt -> 読めた: 隣のフォルダのメモです
  notes/shortcut.txt -> 読めた: 作業フォルダの外のファイルです
[readWithPrefixCheck]
  notes/todo.md -> 読めた: # TODO
  ../outside/private.txt -> 拒否: 作業フォルダの外です
  ../workspace-old/memo.txt -> 読めた: 隣のフォルダのメモです
  notes/shortcut.txt -> 読めた: 作業フォルダの外のファイルです
```

`readNaive` は4つとも読みました。`path.join` はつないだパスを正規化するので（出典1）、`..` が作業フォルダを1段上がります。OWASP が Path Traversal と呼ぶ攻撃の形です（出典4）。

`readWithPrefixCheck` は、`../outside/private.txt` を断りました。残りの2つは通しています。`workspace-old/memo.txt` の絶対パスが、文字列では `workspace` で始まるからです。`notes/shortcut.txt` は、文字列の上では作業フォルダの中にあるリンクです。リンクの先は、ファイルシステムに問い合わせないと分かりません。

## path.relative と realpath で作業フォルダの中かを確かめる

判定には、2つの絶対パスの関係を返す `path.relative` を使います。次のファイルを `safe-file-tools.ts` として保存してください。

```ts
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
```

`isInside` の中心は `path.relative(root, target)` です。`target` が `root` の外にあれば、結果は `..` で始まります（出典1）。2つが同じパスなら、空の文字列が返ります（出典1）。

`startsWith("..")` で比べると、中にある `..memo.md` も外と判定されてしまいました。そこで、`..` そのものか、`..` の直後に区切り文字が続く場合を外とみなしています。

最後の `path.isAbsolute(rel)` は、Windows のための条件です。別のドライブを指すと、`path.relative` は絶対パスを返します。

```bash
node -e 'console.log(require("node:path").win32.relative("C:\\work", "D:\\secret.txt"))'
```

```text
D:\secret.txt
```

`readTextFile` は、文字列の判定を通ったパスを `realpath` にかけます。`realpath` が返すのは、`.` と `..` とリンクをたどった正規の絶対パスです（出典2）。その結果にも、`isInside` と拡張子の判定をかけます。

入力に対する `path.isAbsolute` の判定は、モデルに直し方を伝えるために置きました。Node.js の説明は、この関数を Path Traversal の対策に使うのは安全でないとしています（出典1）。外に出ないことを保証しているのは、`isInside` のほうです。

### 危ない入力を渡した読み込みと書き込みの結果

読み込みと書き込みに危ない入力を渡すファイルを、`try-safe.ts` として保存します。

```ts
import { readTextFile, writeTextFile } from "./safe-file-tools.ts";

const reads = [
  "notes/todo.md",
  "../outside/private.txt",
  "../workspace-old/memo.txt",
  "/etc/hostname",
  "notes/shortcut.txt",
  ".env",
  "notes/big.md",
  "notes/nothing.md",
];

console.log("[readTextFile]");
for (const input of reads) {
  try {
    const text = await readTextFile(input);
    console.log(`  ${input} -> 読めた: ${text.split("\n")[0]}`);
  } catch (error) {
    console.log(`  ${input} -> 拒否: ${(error as Error).message}`);
  }
}

const writes = ["out/summary.md", "out/summary.md", "notes/todo.md", "out/report.md"];

console.log("[writeTextFile]");
for (const input of writes) {
  try {
    await writeTextFile(input, "# 要約\n");
    console.log(`  ${input} -> 書けた`);
  } catch (error) {
    console.log(`  ${input} -> 拒否: ${(error as Error).message}`);
  }
}
```

実行してください。

```bash
node try-safe.ts
```

```text
[readTextFile]
  notes/todo.md -> 読めた: # TODO
  ../outside/private.txt -> 拒否: 作業フォルダの外は読めません。
  ../workspace-old/memo.txt -> 拒否: 作業フォルダの外は読めません。
  /etc/hostname -> 拒否: notes/todo.md のように、作業フォルダからの相対パスで指定してください。
  notes/shortcut.txt -> 拒否: リンクの先が作業フォルダの外か、許可していない種類のファイルです。
  .env -> 拒否: 扱えるのは .md、.txt のファイルだけです。
  notes/big.md -> 拒否: 20000 バイトを超えるファイルは読めません（30000 バイト）。
  notes/nothing.md -> 拒否: notes/nothing.md はありません。
[writeTextFile]
  out/summary.md -> 書けた
  out/summary.md -> 拒否: out/summary.md は既にあります。別の名前にしてください。
  notes/todo.md -> 拒否: 書き込めるのは out/ の下だけです。
  out/report.md -> 拒否: out/report.md は既にあります。別の名前にしてください。
```

`try-safe.ts` は、実行すると `out/summary.md` を作ります。そのため2回目の実行では、最初の書き込みも「既にあります」と断られます。記事と同じ結果を見るには、先に `node setup.ts` で見本を作り直してください。

読み込みで通ったのは、`notes/todo.md` の1つです。素朴な実装で読めた3つの外のファイルは、文字列の判定かリンクの判定で断られました。

存在しないファイルへの返事も見てください。`realpath` は、存在しないパスに ENOENT のエラーを投げます（出典2）。そのエラーの `path` には、絶対パスが入ります（出典2）。`toToolError` はパスを含まない文に置き換えるので、モデルにフォルダの構成が伝わりません。

## 拡張子と大きさの許可リストで、作業フォルダの中の .env も断る

作業フォルダの中にも、読ませたくないファイルはあります。`.env` を断ったのは、拡張子の許可リストに無いからです。`path.extname` は、`.index` のようにドットで始まる名前には空の文字列を返します（出典1）。

大きさの上限は、料金とモデルの入力の量を抑えるために設けました。ツールの結果の文字列は、次のリクエストの入力トークンとして数えられます（出典8）。この記事では、上限を 20,000 バイトにしています。扱う文書の大きさに合わせて決めてください。

## 書き込みは out/ の下に限り、既にある名前には書かない

書き込み先のフォルダと拡張子の両方を、許可リストで絞りました。フォルダは `out/` の下に限り、拡張子は読み込みと同じ `.md` と `.txt` です。

`writeTextFile` は、親フォルダを `realpath` で実体に直してから書きます。書くときの `"wx"` は、パスが既にあると失敗するフラグです（出典2）。POSIX では、パスがリンクなら、リンクの先が無くても失敗します（出典2）。`out/report.md` を断れた理由は、この動きにあります。

フラグを付けない `writeFile` で、同じリンクに書いた場合を確かめました。次のファイルを `naive-write.ts` として保存し、実行してください。

```ts
import { readFile, writeFile } from "node:fs/promises";

// flag を付けない writeFile は、既にあるリンクをたどって先のファイルに書きます。
await writeFile("workspace/out/report.md", "# 要約\n");
console.log(await readFile("outside/report.md", "utf8"));
```

```bash
node naive-write.ts
```

```text
# 要約

```

作業フォルダの外に `outside/report.md` ができ、書いた内容が入っていました。`writeFile` の既定のフラグは `"w"` で（出典2）、ファイルが無ければ作ります（出典2）。リンクの先が無くても、外にファイルが作られるのはこのためです。

## ツール名も許可リストにして、エラーは is_error で返す

モデルが返す `tool_use` には、ツールの名前と入力が入っています（出典6）。名前を許可リストで引き、結果を `tool_result` の形にする関数を、`tools.ts` として保存します。

```ts
import { readTextFile, ToolInputError, writeTextFile } from "./safe-file-tools.ts";

type ToolInput = Record<string, unknown>;
type ToolResult = { content: string; is_error: boolean };

function requireString(input: ToolInput, key: string): string {
  const value = input[key];
  if (typeof value !== "string") {
    throw new ToolInputError(`${key} に文字列を指定してください。`);
  }
  return value;
}

// モデルに使わせるツールの許可リストです。ここに無い名前は実行しません。
const handlers = new Map<string, (input: ToolInput) => Promise<string>>([
  ["read_file", (input) => readTextFile(requireString(input, "path"))],
  [
    "write_file",
    async (input) => {
      await writeTextFile(requireString(input, "path"), requireString(input, "content"));
      return "書き込みました。";
    },
  ],
]);

export async function runTool(name: string, input: ToolInput): Promise<ToolResult> {
  const handler = handlers.get(name);
  if (!handler) {
    return { content: `${name} というツールはありません。使えるのは ${[...handlers.keys()].join("、")} です。`, is_error: true };
  }
  try {
    return { content: await handler(input), is_error: false };
  } catch (error) {
    if (error instanceof ToolInputError) {
      return { content: error.message, is_error: true };
    }
    // 想定していないエラーは中身をモデルに見せず、ログにだけ残します。
    console.error(error);
    return { content: "ツールの実行に失敗しました。", is_error: true };
  }
}
```

`Map` を使ったのは、ふつうのオブジェクトだと `toString` という名前でも関数が引けるからです。

```bash
node -e 'const h = { read_file() {} }; console.log(typeof h["toString"])'
```

```text
function
```

`tool_use` の形を真似た見本を、`runTool` に渡して試します。見本は手で作ったもので、モデルの実際の出力とは違います。次のファイルを `try-tools.ts` として保存してください。

```ts
import { runTool } from "./tools.ts";

// モデルが返す tool_use ブロックの形を手で作った見本です。
const toolUses = [
  { id: "toolu_01", name: "read_file", input: { path: "notes/todo.md" } },
  { id: "toolu_02", name: "read_file", input: { path: "../outside/private.txt" } },
  { id: "toolu_03", name: "read_file", input: { file: "notes/todo.md" } },
  { id: "toolu_04", name: "delete_file", input: { path: "notes/todo.md" } },
];

for (const toolUse of toolUses) {
  const result = await runTool(toolUse.name, toolUse.input);
  console.log(JSON.stringify({ type: "tool_result", tool_use_id: toolUse.id, ...result }));
}
```

実行してください。

```bash
node try-tools.ts
```

```text
{"type":"tool_result","tool_use_id":"toolu_01","content":"# TODO\n- 請求書を送る\n","is_error":false}
{"type":"tool_result","tool_use_id":"toolu_02","content":"作業フォルダの外は読めません。","is_error":true}
{"type":"tool_result","tool_use_id":"toolu_03","content":"path に文字列を指定してください。","is_error":true}
{"type":"tool_result","tool_use_id":"toolu_04","content":"delete_file というツールはありません。使えるのは read_file、write_file です。","is_error":true}
```

`tool_use_id` には、対応する `tool_use` の `id` を入れます（出典6）。実行に失敗したときは、`is_error` を `true` にしてエラーの文を返します（出典6）。エラーの文には、何が起きて次に何を試せばよいかを書くのが公式の勧めです（出典6）。`ToolInputError` の文に直し方まで書いたのは、この案内に合わせたためです。想定外のエラーは中身を伏せて、手元のログに残します。

ツールの定義の `description` には、相対パスで指定すること、扱える拡張子、書き込める場所も書いてください。公式の案内も、ツールの説明に制限と注意点まで書くよう求めています（出典7）。`input_schema` は、zod のスキーマから作れます。[zod の記事](/posts/zod-to-json-schema-tool-definition)を見てください。

## この関数で防げないこと

`readTextFile` は、パスを確かめてから開くまでの間にリンクを差し替えられると、差し替え後の先を開きます。ハードリンクも防げません。`realpath` の結果は1つに決まらず、ハードリンクを通すと同じファイルが別のパスで見えます（出典2）。

確認用のスクリプトで、作業フォルダの中に外のファイルへのハードリンクを置いて試しました。`readTextFile` は、外のファイルの中身をそのまま返しています。

関数の検査とは別に、OS のアクセス権でも読めるファイルは制限されます（出典4）。読ませたくないファイルがあるマシンでは、そのファイルを読めないユーザーでエージェントを動かしてください。

書き込みまで任せるなら、既にある名前を断る今の形と、`out/` の中は上書きを許す形の、どちらを選びますか。

## 料金がかからない範囲

記事のコードは Node.js の標準の機能で書いてあり、API を呼ばないので無料です。npm からパッケージを入れる手順もありません。

モデルにつないで動かすと、料金がかかります。ツールの定義と `tool_result` のブロックは、リクエストの入力トークンに数えられます（出典8）。Claude Haiku 5.5 なら、100万トークンあたり入力 $0.10、出力 $0.50 です（出典8）。この単価は、プロンプトが10万トークン以下のときのものです（出典8）。

## 確認すること

AI エージェントにファイル操作のツールを渡す前に、次の項目をすべて確かめます。

- 入力のパスを作業フォルダの絶対パスにつなぎ、`path.relative` で中かを判定しているか
- `realpath` でリンクをたどった先にも、同じ判定をかけているか
- 拡張子と大きさを許可リストで絞っているか
- 書き込みを決まったフォルダに限り、`"wx"` で既にある名前を断っているか
- ツール名を `Map` の許可リストで引き、エラーを `is_error` で返しているか

## 出典

確認日は、表の右端の列に書きました。本文の（出典1）〜（出典10）は、この表の番号を指します。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Node.js v22.22.0 Path | https://nodejs.org/docs/v22.22.0/api/path.html | 2026-10-31 |
| 2 | Node.js v22.22.0 File system | https://nodejs.org/docs/v22.22.0/api/fs.html | 2026-10-31 |
| 3 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | 2026-10-31 |
| 4 | Path Traversal（OWASP Foundation） | https://community.owasp.org/attacks/Path_Traversal | 2026-10-31 |
| 5 | LLM06:2025 Excessive Agency（OWASP Gen AI Security Project） | https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | 2026-10-31 |
| 6 | Handle tool calls | https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls | 2026-10-31 |
| 7 | Define tools | https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools | 2026-10-31 |
| 8 | Pricing | https://platform.claude.com/docs/en/about-claude/pricing | 2026-10-31 |
| 9 | Create symbolic links（Microsoft Learn） | https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/create-symbolic-links | 2026-11-10 |
| 10 | CreateSymbolicLinkW function（Microsoft Learn） | https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-createsymboliclinkw | 2026-11-10 |

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
