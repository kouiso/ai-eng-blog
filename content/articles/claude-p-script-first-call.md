---
title: "LLM API の呼び出しを月額プランで初めて試す【claude -p をスクリプトから使う、JSON で受け取る】"
slug: "claude-p-script-first-call"
description: "LLM API の呼び出しは、claude -p なら最初の1回から API キーなしで済みます。料金は自分の Claude プランの利用枠から引かれます。JSON で答えを受け取り、シェルと Node.js から使うまでを実行結果つきで示します。"
tags: ["LLM API", "Claude Code", "TypeScript"]
main_keyword: "LLM API"
target_query: "llm api 呼び出し"
course_step: 1
cost_estimate: "記事のコードは読者自身の Claude プランの利用枠から引かれます。Pro は月払いで月20ドルです。total_cost_usd は定価で換算した見積もりで、プランでの請求額とは別の数字です。"
run_environment: "macOS arm64。Node.js 22.23.4。npm 10.9.9。Claude Code 2.1.322。jq 1.7.1 と 1.8.1。TypeScript 7.0.2（型の確認のみ）"
verified_at: "2026-11-11"
prev: null
next: "claude-agent-sdk-streaming"
sources:
  - url: "https://code.claude.com/docs/en/headless"
    title: "Run Claude Code programmatically"
    accessed: 2026-11-14
  - url: "https://code.claude.com/docs/en/cli-reference"
    title: "CLI reference (Claude Code)"
    accessed: 2026-11-14
  - url: "https://code.claude.com/docs/en/model-config"
    title: "Model configuration (Claude Code)"
    accessed: 2026-11-14
  - url: "https://code.claude.com/docs/en/authentication"
    title: "Authentication (Claude Code)"
    accessed: 2026-11-14
  - url: "https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan"
    title: "Use the Claude Agent SDK with your Claude plan"
    accessed: 2026-11-14
  - url: "https://claude.com/pricing"
    title: "Claude の料金プラン"
    accessed: 2026-11-14
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing (Claude API)"
    accessed: 2026-11-14
  - url: "https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts"
    title: "@anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts"
    accessed: 2026-11-14
  - url: "https://nodejs.org/docs/v22.23.0/api/typescript.html"
    title: "Node.js v22.23.0 Modules: TypeScript"
    accessed: 2026-11-14
  - url: "https://nodejs.org/docs/v22.23.0/api/child_process.html"
    title: "Node.js v22.23.0 Child process"
    accessed: 2026-11-14
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-14
---

LLM API の呼び出しは、`claude -p` なら最初の1回から API キーなしで済みます。`claude -p` は、スクリプトから質問を送って答えを受け取る Claude Code のコマンドです。料金は、自分の Claude プランの利用枠から引かれます（出典5）。

`--output-format json` を付けたときに答えが入る場所は、`result` です（出典1）。この記事では、シェルと Node.js から1問ずつ投げて、返った JSON を読むところまで動かしました。

所要時間は、Claude Code にログイン済みなら15分ほどです。

## 用意するのは Pro 以上のプランと、ログイン済みの Claude Code

次のものを用意します。

- Claude の Pro、Max、Ultra のどれか。Free には Claude Code が含まれません（出典6）。Pro は月払いで月20ドルです（出典6）。
- そのプランでログインした Claude Code
- Node.js 22.18.0 以上。`.ts` のファイルを `node` で直接動かすためです（出典9）。
- JSON を読む `jq`。シェルの例で使います。

Claude の API を直接呼ぶ書き方は、この記事では使いません。Claude の API は、使ったトークン数に応じて料金がかかります（出典7）。

環境変数 `ANTHROPIC_API_KEY` があると、`-p` では常にそのキーが使われます（出典4）。最初に、外れていることを確かめてください。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

`set` と出たら、`unset ANTHROPIC_API_KEY` で外してください（出典4）。検証に使った版は次のとおりです。

```bash
claude --version
```

```text
2.1.322 (Claude Code)
```

```bash
node -v
```

```text
v22.23.4
```

## 最初の1回は、6つのフラグで JSON が返る

作業用のフォルダを先に作ります。Node.js の節でも同じフォルダを使うので、`type` を `module` にしておきます。

```bash
mkdir claude-script
cd claude-script
npm init -y
npm pkg set type=module
```

```text
Wrote to <work>/claude-script/package.json:

{
  "name": "claude-script",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}



```

`<work>` は作業フォルダの絶対パスで、ログを残すときに置き換えました。1問投げて、答えの JSON を `answer.json` に保存します。

```bash
claude -p "TypeScript の型注釈とは何かを、日本語の1文で答えてください。" \
  --model haiku \
  --output-format json \
  --setting-sources "" \
  --strict-mcp-config \
  --tools "" \
  > answer.json
```

画面には何も出ません。各フラグの役割は次のとおりです。

- `-p` は、1回答えて終了するモードです（出典1）。
- `--model haiku` は、使うモデルを別名で選びます（出典3）。
- `--output-format json` は、答えと付随する情報を JSON で返す指定です（出典1）。
- `--setting-sources ""` は、手元の設定ファイルを1つも読み込みません（出典2）。
- `--strict-mcp-config` は、MCP サーバーの設定を読まない指定です（出典2）。`--mcp-config` で渡した設定が使われます。何も渡していないので、MCP サーバーは使いません。
- `--tools ""` は、組み込みのツールをすべて外す指定です（出典2）。

答えの文章は `result` に入っています。

```bash
jq -r '.result' answer.json
```

```text
TypeScriptの型注釈とは、変数・関数の引数や戻り値などに「この値はどの型である」と明示的に書き添える構文で、コンパイル時に型の整合性を検査するために使われます。
```

成否を判定するときに読むフィールドも、同じ JSON に入っています。

```bash
jq '{type, subtype, is_error, num_turns, total_cost_usd}' answer.json
```

```text
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "num_turns": 1,
  "total_cost_usd": 0.0006710900000000001
}
```

`is_error` が `false` なら、`result` は答えの文章です。`true` のときの `result` には、失敗の理由が入ります（出典1）。

### この環境では、3つのフラグで送るトークンが94,062から3,776に減った

後ろの3つのフラグは、手元の設定と道具を読み込ませないためのものです。`claude -p` は、何も指定しないとフックや CLAUDE.md などを読み込みます（出典1）。

同じ質問を、フラグを変えて1回ずつ、計3回送りました。この環境での1回ずつの測定です。数字は、入力と2種類のキャッシュのトークン数を足したものです。

| フラグ | 送ったトークン | total_cost_usd |
|---|---|---|
| 3つとも付けない | 94,062 | 0.01681166 |
| `--setting-sources ""` だけ | 18,173 | 0.00147332 |
| 3つとも付ける | 3,776 | 0.00063319 |

1問に答えさせる用途なら、3つとも付けた形で足ります。付けない場合の数字は、手元の設定と MCP サーバーの数で変わります。

## total_cost_usd は、定価で換算した見積もり

`total_cost_usd` は、使ったトークンを API の定価で掛け算した数字です。モデルごとの内訳を見ると、そう書いてあります。

```bash
jq '.modelUsage | map_values({costUSD, costBasis})' answer.json
```

```text
{
  "claude-haiku-5-5": {
    "costUSD": 0.0006710900000000001,
    "costBasis": "list"
  }
}
```

`costBasis` の `list` は、定価で換算したという意味です。公式のページも、この数字は手元での見積もりで、実際の請求とずれることがあると書いています（出典1）。SDK の型定義の説明は「An estimate, not a billing statement」です（出典8）。プランでログインして動かした分は、プランの利用枠から引かれます（出典5）。

API キーで同じ量を使ったときの目安としては使えます。Haiku 5.5 の定価は、入力が100万トークンあたり0.10ドル、出力が0.50ドルです（出典7）。入力の単価は、10万トークン以下のプロンプトのものです（出典7）。

### apiKeySource が none なら、API キーは使われていない

プランで動いているかは、`stream-json` の形式で確かめられます。最初に届く init イベントを見ます（出典1）。

```bash
claude -p "1+1 の答えを数字だけで答えてください。" \
  --model haiku \
  --output-format stream-json --verbose \
  --setting-sources "" --strict-mcp-config --tools "" \
  | jq -c 'select(.type == "system" and .subtype == "init") | {apiKeySource, model}'
```

```text
{"apiKeySource":"none","model":"claude-haiku-5-5"}
```

`apiKeySource` は、通信に使った認証の出どころです（出典8）。環境変数の API キーを使ったときは、その変数名が入ります（出典8）。claude.ai のログインでは `none` です（出典8）。別名の `haiku` は、`model` の欄で `claude-haiku-5-5` に変わりました。

`none` 以外が出たら、API キーで動いています。

## スクリプト向けの --bare は、プランのログインを読まない

スクリプトや CI で動かすときに `--bare` を付ける例が、公式のページに載っています（出典1）。フックや CLAUDE.md を読まずに速く起動するフラグです（出典1）。

ところが `--bare` は、claude.ai のログイン情報を読みません（出典1）。プランで試すと失敗します。

```bash
claude -p "こんにちは" --bare --strict-mcp-config --output-format json > bare.json
echo "exit=$?"
jq '{subtype, is_error, result}' bare.json
```

```text
exit=1
{
  "subtype": "success",
  "is_error": true,
  "result": "Not logged in · Please run /login"
}
```

終了コードは1で、`result` にはログインしていないという文が入りました。`subtype` は `success` のままです。成否は `subtype` で決めず、`is_error` か終了コードで判定してください。プランで読み込みを減らすなら、`--bare` の代わりに前の節の3つのフラグを使います。

## --model は haiku から始めて、足りなければ sonnet

`--model` に渡せるのは、`haiku` や `sonnet` のような別名です（出典3）。モデルの完全な名前も使えます（出典3）。Claude の API では、それぞれ最新の Haiku、Sonnet、Opus を指します（出典3）。同じ質問を2つのモデルに順に送るループが、次のコードです。

```bash
for model in haiku sonnet; do
  claude -p "TypeScript の型注釈とは何かを、日本語の1文で答えてください。" \
    --model "$model" --output-format json \
    --setting-sources "" --strict-mcp-config --tools "" \
    | jq -r '"\(.modelUsage | keys[0]) total_cost_usd=\(.total_cost_usd)"'
done
```

```text
claude-haiku-5-5 total_cost_usd=0.00008206
claude-sonnet-5-5 total_cost_usd=0.0101209
```

Haiku の数字は、同じ質問を送った最初の実行より小さくなりました。理由は確かめていません。モデルどうしの比較には、料金表の単価のほうが確実です。Sonnet 5.5 の入力は100万トークンあたり2ドルで、Haiku 5.5 の20倍です（出典7）。

1文の定義か分類のような短い仕事は、Haiku で足ります。答えの質が足りないと感じたときに、`sonnet` に替えてください。

## 標準入力で渡したデータは、プロンプトと一緒に読まれる

`claude -p` は標準入力を読みます（出典1）。ログかファイルの中身をパイプで渡し、何をしてほしいかは `-p` の引数に書く形です。まず、渡すエラーログを作ります。

```bash
cat > error.log <<'EOF'
TypeError: Cannot read properties of undefined (reading 'map')
    at renderList (src/list.ts:12:18)
EOF
```

```bash
cat error.log | claude -p "標準入力で渡したエラーログの原因を、日本語の1文で説明してください。" \
  --model haiku --output-format json \
  --setting-sources "" --strict-mcp-config --tools "" \
  | jq -r '.result'
```

```text
`src/list.ts` の12行目で、`undefined` の値に対して `.map()` を呼び出そうとしたため、配列であるはずの変数やプロパティが未定義のまま渡されていることが原因です。
```

答えは、ログに書かれた行番号と `map` を拾っています。`--tools ""` でツールを外しているので、Claude は `src/list.ts` を開いていません。読んだのは、標準入力の2行だけです。

## Node.js からは spawn で呼び、標準入力を閉じる

Node.js から呼ぶときも、渡す引数はシェルと同じです。ただし、子プロセスの標準入力の扱いで1つ詰まります。

### execFile のままだと、3秒待たされる

先に、うまくいかない書き方を載せます。ファイル名は `exec-file.ts` です。

```ts
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
```

```bash
node exec-file.ts
```

```text
result: 2
stderr: Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
elapsed_seconds=7.9
```

答えは返りましたが、標準エラーに警告が出ました。標準入力にデータが来るのを3秒待ってから進んだ、という内容です。`spawn` の子プロセスは、既定で標準入力がパイプでつながります（出典10）。`execFile` でも、標準入力は閉じられないまま残りました。そのパイプを誰も閉じないので、`claude` は入力を待ちます。

### 標準入力を閉じる関数にまとめる

`spawn` で起動して、渡すデータを書いたら `stdin.end()` で閉じる、という手順にしました。渡すデータが無いときは、空のまま閉じます。ファイル名は `ask.ts` です。

```ts
import { spawn } from "node:child_process";

type ClaudeResult = {
  type: "result";
  subtype: string;
  is_error: boolean;
  result: string;
  num_turns: number;
  total_cost_usd: number;
};

function askClaude(prompt: string, input = ""): Promise<ClaudeResult> {
  const args = [
    "-p", prompt,
    "--model", "haiku",
    "--output-format", "json",
    "--setting-sources", "",
    "--strict-mcp-config",
    "--tools", "",
  ];
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args);
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (stdout.trim() === "") {
        reject(new Error(`claude exited with ${code}: ${stderr.trim()}`));
        return;
      }
      const result = JSON.parse(stdout) as ClaudeResult;
      if (result.is_error) {
        reject(new Error(`claude returned an error: ${result.result}`));
        return;
      }
      resolve(result);
    });
    child.stdin.end(input);
  });
}

const started = Date.now();
const answer = await askClaude("TypeScript の型注釈とは何かを、日本語の1文で答えてください。");
console.log(`answer: ${answer.result}`);
console.log(`subtype=${answer.subtype} num_turns=${answer.num_turns} total_cost_usd=${answer.total_cost_usd}`);

const log = "TypeError: Cannot read properties of undefined (reading 'map')\n    at renderList (src/list.ts:12:18)\n";
const cause = await askClaude("標準入力で渡したエラーログの原因を、日本語の1文で説明してください。", log);
console.log(`cause: ${cause.result}`);
console.log(`elapsed_seconds=${((Date.now() - started) / 1000).toFixed(1)}`);
```

```bash
node ask.ts
```

```text
answer: TypeScriptの型注釈とは、変数・関数の引数や戻り値などに「この値はこの型である」と明示的に書き添える構文で、コンパイル時に型の整合性を検査するために使われます。
subtype=success num_turns=1 total_cost_usd=0.00007506
cause: `src/list.ts` の 12 行目で、`undefined` の値に対して `.map` を呼び出そうとしたため、配列であることを前提としたデータが実際には `undefined` になっていたことが原因です。
elapsed_seconds=7.9
```

2回呼んで、警告は出ていません。

`askClaude` は、失敗を2段に分けて見分けます。

- 標準出力が空なら、`claude` が起動できなかったか、引数が間違っているかのどちらかです。不正なフラグのエラーは標準エラーに出ます（出典1）。
- 標準出力に JSON があっても、`is_error` が `true` なら失敗です。認証が無いときなどは、終了コードが0以外になり、理由が `result` に入ります（出典1）。

終了コードで判定すると、失敗の理由を読み損ねます。JSON を先に読んで、`is_error` で分けるほうが確実です。

## スクリプトから呼ぶときに残る判断

この記事のコードで書いたのは、フラグの並びと、JSON の読み方の2つでした。どのモデルを使うか、手元の設定をどこまで切るかは、呼ぶ側が決めます。

`json` の形式では、答えは最後に1回で返ります。届いた順に表示したいなら、使うのは `stream-json` の形式です（出典1）。TypeScript から型つきでメッセージを受け取るなら、Agent SDK が向いています。

あなたのスクリプトで、Claude に読ませたいログは何でしょうか。

## 出典

本文の（出典n）は、この表の番号です。確認日は、どれもページを読んだ日です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Run Claude Code programmatically | https://code.claude.com/docs/en/headless | 2026-11-14 |
| 2 | CLI reference (Claude Code) | https://code.claude.com/docs/en/cli-reference | 2026-11-14 |
| 3 | Model configuration (Claude Code) | https://code.claude.com/docs/en/model-config | 2026-11-14 |
| 4 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-14 |
| 5 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-14 |
| 6 | Claude の料金プラン | https://claude.com/pricing | 2026-11-14 |
| 7 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | 2026-11-14 |
| 8 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-14 |
| 9 | Node.js v22.23.0 Modules: TypeScript | https://nodejs.org/docs/v22.23.0/api/typescript.html | 2026-11-14 |
| 10 | Node.js v22.23.0 Child process | https://nodejs.org/docs/v22.23.0/api/child_process.html | 2026-11-14 |

AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。
