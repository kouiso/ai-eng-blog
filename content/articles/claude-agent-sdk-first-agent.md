---
title: "Claude Agent SDK で最初のエージェントを動かす【TypeScript、Claude プランで試す】"
slug: "claude-agent-sdk-first-agent"
description: "Claude Agent SDK の query() を、自分の Claude プランで API キーなしに動かします。init、assistant、user、result のメッセージの読み分け方を、実行結果つきで示します。"
tags: ["AIエージェント", "Claude Agent SDK", "TypeScript"]
main_keyword: "AIエージェント"
target_query: null
course_step: 4
cost_estimate: "記事のコードは読者自身の Claude プランの利用枠から引かれます。Pro は月払いで月20ドルです。SDK が出す total_cost_usd は定価で換算した見積もりで、プランでの請求額とは別の数字です。"
run_environment: "Node.js 22.22.0、npm 10.9.4、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、Linux x86_64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-10"
prev: "ai-agent-tool-use-loop-typescript"
next: "ai-agent-max-turns-budget-limit"
sources:
  - url: "https://code.claude.com/docs/en/agent-sdk/overview"
    title: "Agent SDK overview"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/agent-sdk/quickstart"
    title: "Quickstart (Agent SDK)"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/agent-sdk/agent-loop"
    title: "How the agent loop works"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/authentication"
    title: "Authentication (Claude Code)"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/legal-and-compliance"
    title: "Legal and compliance (Claude Code)"
    accessed: 2026-11-10
  - url: "https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan"
    title: "Use the Claude Agent SDK with your Claude plan"
    accessed: 2026-11-10
  - url: "https://claude.com/pricing"
    title: "Claude の料金プラン"
    accessed: 2026-11-10
  - url: "https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts"
    title: "@anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts"
    accessed: 2026-11-10
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing (Claude API)"
    accessed: 2026-11-10
  - url: "https://nodejs.org/docs/v22.22.0/api/typescript.html"
    title: "Node.js v22.22.0 Modules: TypeScript"
    accessed: 2026-11-10
  - url: "https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk"
    title: "@anthropic-ai/claude-agent-sdk（npm）"
    accessed: 2026-11-10
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-10
---

Agent SDK は、Claude Code のツールとループを自分のコードで動かす SDK です（出典1）。`query()` に指示を渡せば、エージェントが動きます。

自分の Claude プランでログインしていれば、API キーは要りません。実際に動かすと、最初に届く init メッセージの `apiKeySource` が `"none"` でした。

この記事では、プランのログインで2本のエージェントを動かし、流れてくるメッセージの種類を読み分けます。コードは TypeScript で、2本で65行です。

ループの自作は[前の記事](/posts/ai-agent-tool-use-loop-typescript)です。講座では、この記事の1つ前に当たります。Agent SDK は、そのループとツールの実行をまるごと引き受けます。自分で書くのは、どのツールを渡すかの指定と、届いたメッセージの読み方です。

## 動かすのに要る Node.js、プラン、ログイン

用意するのは Node.js、Claude のプラン、そのプランでログインした Claude Code です。

- Node.js 18.14 以上（出典2）。検証は 22.22.0 で行いました。
- Claude の Pro、Max、Ultra のどれか。Free には Claude Code が含まれません（出典7）。Pro は月払いで月20ドルです（出典7）。
- `claude auth login` でプランのアカウントにログインした Claude Code（出典4）

SDK は Claude Code の本体を npm の依存として同梱しています（出典2）。ログインの手順は Claude Code の公式の手順に従ってください（出典4）。

検証に使った環境は、Claude プランでログイン済みの Claude Code が入った Linux でした。ログインの操作そのものは、この記事の検証では実行していません。

環境変数 `ANTHROPIC_API_KEY` は、プランのログインより先に使われます（出典4）。プランで試すなら、先に外れていることを確かめます。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

`set` と出たら、`unset ANTHROPIC_API_KEY` で外してから進めてください（出典4）。

### プランで動かしてよいのは、自分で試す範囲です

プランのログインで Agent SDK を使うと、プランの利用枠から引かれます（出典6）。プランの利用枠は、Claude Code と Agent SDK を個人がふつうに使う前提で決まっています（出典5）。

ほかの人に使わせるアプリかサービスに組み込むなら、話が変わります。そのときは Claude Console で発行した API キーで認証します（出典5）。

自分のアプリで claude.ai のログインを提供することは、許可なしには認められていません（出典1）。利用者に代わってプランの認証情報で通信を中継することも禁止です（出典5）。この記事のコードは、自分のマシンで自分が試すためのものとして読んでください。

## npm install 1回で、Claude Code の本体も一緒に入る

SDK を入れるのは最後の `npm install` です。記事と同じ版で試せるよう、`--save-exact` で 0.3.322 に固定します。

```bash
mkdir first-agent
cd first-agent
npm init -y
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322
```

```text

added 105 packages, and audited 106 packages in 6s

36 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

0.3.322 は、2026-11-10 の時点で npm の最新版です（出典11）。`type` を `module` にすると、トップレベルで `await` を書けます（出典2）。

```bash
npm pkg get type dependencies
```

```text
{
  "type": "module",
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "0.3.322"
  }
}
```

入ったパッケージを見ると、SDK の隣に `claude-agent-sdk-linux-x64` があります。

```bash
ls node_modules/@anthropic-ai
```

```text
claude-agent-sdk
claude-agent-sdk-linux-x64
sdk
```

この `linux-x64` が、プラットフォームごとに配られる Claude Code の本体です。npm の optional dependencies として入ります（出典2）。

`npm ci --omit=optional` のように optional を飛ばすと、本体が入りません（出典2）。CI で動かないときは、まずこのフォルダの有無を見てください。

## 1本目は init、assistant、result の順に届く

1本目は、ツールを持たせずに1問だけ答えさせるコードです。届いたメッセージを、種類ごとに1行ずつ表示します。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "TypeScript の型注釈とは何かを、日本語の1文で答えてください。",
  options: {
    model: "haiku",
    tools: [],
    maxTurns: 1,
    settingSources: [],
  },
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log(
      `[system/init] model=${message.model} apiKeySource=${message.apiKeySource} claude_code_version=${message.claude_code_version}`,
    );
  } else if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "text") console.log(`[assistant/text] ${block.text}`);
    }
  } else if (message.type === "result") {
    console.log(
      `[result/${message.subtype}] num_turns=${message.num_turns} total_cost_usd=${message.total_cost_usd}`,
    );
    if (message.subtype === "success") console.log(`result: ${message.result}`);
  } else {
    console.log(`[${message.type}${"subtype" in message ? `/${message.subtype}` : ""}]`);
  }
}
```

`hello.ts` として保存します。オプションの意味は次のとおりです。

- `model: "haiku"` は、モデルの別名です。実行すると `claude-haiku-5-5` が使われました。
- `tools: []` は、組み込みのツールをすべて外す指定です（出典8）。
- `maxTurns: 1` は、ターン数の上限です（出典3）。
- `settingSources: []` は、手元の設定と CLAUDE.md を読まない指定です（出典8）。

省いた場合は、`~/.claude/settings.json` などの設定がすべて読まれます（出典8）。手元の設定で結果が変わらないよう、この記事では空にしています。

Node.js 22.18.0 以降は、`.ts` のファイルをそのまま `node` で実行できます（出典10）。

```bash
node hello.ts
```

```text
[active_goal]
[autocompact_state]
[system/init] model=claude-haiku-5-5 apiKeySource=none claude_code_version=2.1.322
[rate_limit_event]
[assistant/text] TypeScriptの型注釈とは、変数・関数の引数・戻り値などに「この値はどの型か」を明示的に書き加える構文（例：`let name: string = "太郎";`）であり、コンパイラがその型に基づいて値の使い方を検査できるようにするものです。
[system/post_turn_summary]
[result/success] num_turns=1 total_cost_usd=0.00036766
result: TypeScriptの型注釈とは、変数・関数の引数・戻り値などに「この値はどの型か」を明示的に書き加える構文（例：`let name: string = "太郎";`）であり、コンパイラがその型に基づいて値の使い方を検査できるようにするものです。
```

1問の質問に、7つのメッセージが届きました。このうち読むのは、次の表の種類です。

| メッセージ | 中に入っているもの |
|---|---|
| `system` の `init` | 使うモデル、認証の出どころ、ツールの一覧 |
| `assistant` | モデルの応答。文章かツールの呼び出し |
| `result` | 最終の答え、ターン数、費用の見積もり |

公式のページは、この3つを含む5種類を中心の種類として挙げています（出典3）。レート制限の状態のように、ループを動かすのに要らないイベントも届きます（出典3）。`[active_goal]` などの残り4つは、中心の5種類に入っていないので、読み飛ばしてかまいません。

`assistant` の本文は `message.message.content` にあります（出典3）。`result` の文字列は、`subtype` が `success` のときにしかありません（出典3）。読む前に `subtype` を確かめます。

### apiKeySource が none なら、API キーは使われていない

`apiKeySource` は、通信に使った認証の出どころです（出典8）。`ANTHROPIC_API_KEY` から読んだなら、その名前がそのまま入ります（出典8）。

`"none"` は、API キーを使っていないという意味です（出典8）。claude.ai のログインでも Bearer トークンでも、`"none"` になります（出典8）。クラウドのプロバイダーで認証したときも同じです（出典8）。

プランで動いているかを確かめるなら、Claude Code で `/status` を開きます（出典4）。今どの認証が使われているかが表示されます。

### total_cost_usd は請求額の見積もり

`total_cost_usd=0.00036766` は、定価で換算した見積もりです。型定義のコメントには「An estimate, not a billing statement」とあります（出典8）。

プランのログインで動かした分は、プランの利用枠から引かれます（出典6）。SDK の数字は、使った量の目安として読んでください。

API キーで使う場合、Haiku 5.5 の入力は100万トークンあたり0.10ドルです（出典9）。これは10万トークン以下のプロンプトの単価で、出力は100万トークンあたり0.50ドルです（出典9）。

## ツールを渡すと、tool_use と tool_result が交互に届く

2本目は、フォルダの中のファイルを読んで答えるエージェントです。先に、読ませるファイルを3つ作ります。

```bash
mkdir tasks
printf '# 請求書を送る\n締め切り: 2026-11-14\n' > tasks/invoice.md
printf '# ブログ記事の下書き\n締め切り: 2026-11-20\n' > tasks/blog.md
printf '# PR をレビューする\n締め切り: 2026-11-17\n' > tasks/review.md
```

コードは `agent.ts` として保存します。今度はツールの呼び出しと、その結果も表示します。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

const prompt =
  "tasks フォルダの .md ファイルをすべて読み、締め切りが最も早いタスクの名前と締め切りを1行で答えてください。";

for await (const message of query({
  prompt,
  options: {
    model: "haiku",
    tools: ["Glob", "Read"],
    allowedTools: ["Glob", "Read"],
    permissionMode: "dontAsk",
    maxTurns: 10,
    settingSources: [],
  },
})) {
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "text") {
        console.log(`[assistant/text] ${block.text}`);
      } else if (block.type === "tool_use") {
        console.log(`[assistant/tool_use] ${block.name} ${JSON.stringify(block.input)}`);
      }
    }
  } else if (message.type === "user" && Array.isArray(message.message.content)) {
    for (const block of message.message.content) {
      if (block.type === "tool_result") {
        console.log(`[user/tool_result] ${JSON.stringify(block.content).slice(0, 60)}`);
      }
    }
  } else if (message.type === "result") {
    console.log(
      `[result/${message.subtype}] num_turns=${message.num_turns} total_cost_usd=${message.total_cost_usd}`,
    );
    if (message.subtype === "success") console.log(`result: ${message.result}`);
  }
}
```

`tools`、`allowedTools`、`permissionMode` は、それぞれ役割が違います。

- `tools` は、モデルに見せるツールそのものを決めます（出典8）。ここに無いツールは呼べません。
- `allowedTools` は、確認なしで実行してよいツールの一覧です（出典3）。
- `permissionMode: "dontAsk"` にすると、確認が要る呼び出しはすべて断られます（出典3）。

公式のページは、`dontAsk` の使いどころを、承認する人がいないエージェントとしています（出典3）。読み取りのツールしか見せず、それ以外は聞かずに断る組み合わせが、手元で試すには安全です。

自作のツール関数の守り方は[別の記事](/posts/ai-agent-safe-file-tool)にあります。

```bash
node agent.ts
```

```text
[assistant/tool_use] Glob {"pattern":"**/tasks/**/*.md","path":"<work>/first-agent"}
[user/tool_result] "tasks/blog.md\ntasks/review.md\ntasks/invoice.md"
[assistant/tool_use] Read {"file_path":"<work>/first-agent/tasks/blog.md"}
[user/tool_result] "1\t# ブログ記事の下書き\n2\t締め切り: 2026-11-20\n3\t"
[assistant/tool_use] Read {"file_path":"<work>/first-agent/tasks/review.md"}
[user/tool_result] "1\t# PR をレビューする\n2\t締め切り: 2026-11-17\n3\t"
[assistant/tool_use] Read {"file_path":"<work>/first-agent/tasks/invoice.md"}
[user/tool_result] "1\t# 請求書を送る\n2\t締め切り: 2026-11-14\n3\t"
[assistant/text] 締め切りが最も早いのは「請求書を送る」で、締め切りは2026-11-14です。
[result/success] num_turns=5 total_cost_usd=0.00083577
result: 締め切りが最も早いのは「請求書を送る」で、締め切りは2026-11-14です。
```

`<work>` は作業フォルダの絶対パスで、ログを残すときに置き換えました。答えの「請求書を送る」と 2026-11-14 は、3つのファイルの中で最も早い締め切りと合っています。

### 1回のツール呼び出しが、assistant と user の1組になる

モデルがツールを呼ぶと、`assistant` のメッセージに `tool_use` のブロックが入ります。SDK がツールを実行し、結果を `user` のメッセージの `tool_result` で返します（出典3）。

Messages API の SDK で自作するループでは、このやり取りを自分で書きます（出典1）。Agent SDK では、届いた `user` を読めば済みます。

`num_turns=5` は、Glob の1回と Read の3回、最後に文章で答えた1回の合計です。公式の数え方も、ツールを呼んだターンに最後の文章のターンを足します（出典3）。

`maxTurns: 10` は、ループが止まらなくなったときの上限として入れました。上限に達すると、`result` の `subtype` が `error_max_turns` になります（出典3）。その場合、`for await` のループが例外を投げます（出典3）。

### 同じコードでも、ツールの引数と答えの文面は変わる

同じ `agent.ts` をもう一度動かすと、ツールを呼ぶ順番と回数は1回目と同じでした。違ったのは Glob の引数です。2回目は `{"pattern":"**/tasks/**/*.md"}` で、`path` がありません。最後の文の言い回しも少し変わりました。

どのツールをどの引数で呼ぶかは、毎回モデルが決めます。出力の文字列をそのまま比べるテストは、このコードには向きません。答えの中身を確かめたいなら、`result` から締め切りの日付を取り出して比べるほうが確実です。

見積もりは `0.00083577` のような桁の多い小数です。画面に出すときは `toFixed(4)` などで桁をそろえると読みやすくなります。

## SDK に任せたあとに残る判断

2本のコードで自分が書いたのは、オプションとメッセージの読み分けだけでした。ツールの実行、結果の受け渡し、ターンの管理は SDK が行います（出典2）。

残る判断は、どのツールを見せ、どこまでを確認なしで許すかです。この記事では Glob と Read の2つに絞り、それ以外は断る設定にしました。

あなたのエージェントには、どのツールまでを確認なしで渡しますか。

## 出典

本文の（出典n）は、この表の番号です。確認日は、どれもページを読んだ日です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Agent SDK overview | https://code.claude.com/docs/en/agent-sdk/overview | 2026-11-10 |
| 2 | Quickstart (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/quickstart | 2026-11-10 |
| 3 | How the agent loop works | https://code.claude.com/docs/en/agent-sdk/agent-loop | 2026-11-10 |
| 4 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-10 |
| 5 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | 2026-11-10 |
| 6 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-10 |
| 7 | Claude の料金プラン | https://claude.com/pricing | 2026-11-10 |
| 8 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-10 |
| 9 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | 2026-11-10 |
| 10 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | 2026-11-10 |
| 11 | @anthropic-ai/claude-agent-sdk（npm） | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk | 2026-11-10 |

[次の記事](/posts/ai-agent-max-turns-budget-limit)は、上限で止める回です。`maxTurns` と `maxBudgetUsd` で止めたときの結果と例外を扱います。

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
