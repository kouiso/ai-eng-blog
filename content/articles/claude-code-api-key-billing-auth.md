---
title: "LLM API が従量課金になる原因と直し方【Agent SDK、claude -p、Invalid API key】"
slug: "claude-code-api-key-billing-auth"
description: "原因は環境変数 ANTHROPIC_API_KEY です。Agent SDK と claude -p は、プランのログインより先にこのキーを使います。apiKeySource での見分け方、無効なダミーのキーでの再現、外し方を示します。"
tags: ["LLM API", "Claude Agent SDK", "Claude Code", "TypeScript"]
main_keyword: "LLM API"
target_query: "claude code api 従量課金"
course_step: 1
cost_estimate: "プランで動かした分は、読者自身の Claude プランの利用枠から引かれます。無効なダミーのキーで再現した呼び出しは、結果のトークン数と total_cost_usd が 0 でした。有効なキーで動いた分はキーの持ち主に従量で請求され、Haiku 5.5 なら入力は100万トークンあたり0.10ドルです。"
run_environment: "Node.js 22.23.4、npm 10.9.9、Claude Code 2.1.322、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS arm64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-11"
prev: "llm-api-429-retry-sdk-mock"
next: "claude-agent-sdk-structured-output"
sources:
  - url: "https://code.claude.com/docs/en/authentication"
    title: "Authentication (Claude Code)"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/errors"
    title: "Error reference (Claude Code)"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/cli-reference"
    title: "CLI reference (Claude Code)"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/agent-sdk/typescript"
    title: "Agent SDK reference - TypeScript"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/settings-reference"
    title: "All settings (Claude Code)"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/legal-and-compliance"
    title: "Legal and compliance (Claude Code)"
    accessed: 2026-11-11
  - url: "https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan"
    title: "Use the Claude Agent SDK with your Claude plan"
    accessed: 2026-11-11
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing (Claude API)"
    accessed: 2026-11-11
  - url: "https://nodejs.org/docs/v22.23.4/api/cli.html"
    title: "Node.js v22.23.4 Command-line API"
    accessed: 2026-11-11
  - url: "https://nodejs.org/docs/v22.23.4/api/typescript.html"
    title: "Node.js v22.23.4 Modules: TypeScript"
    accessed: 2026-11-11
  - url: "https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts"
    title: "@anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts"
    accessed: 2026-11-11
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-11
---

原因は、環境変数 `ANTHROPIC_API_KEY` です。この変数があると、プランのログインより先にキーが使われます（出典1）。Agent SDK でも `claude -p` でも同じです。

キーで動いた分は、月額のプランの外で、キーの持ち主に従量で請求されます（出典6）。どちらで動いているかは `apiKeySource` を見ればわかり、変数を外せば直ります。

[前の記事](/posts/llm-api-429-retry-sdk-mock)は、429 エラーとリトライの回です。

この記事は、`claude -p` と Agent SDK を一度は動かした人に向けて書いています。スクリプトから呼ぶ方法は[講座の1本目](/posts/claude-p-script-first-call)です。

## apiKeySource が none なら、プランで動いている

確かめるコマンドは2つです。どちらもモデルを呼ばないので、プランの利用枠も減りません。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

```bash
claude auth status | grep -E '"(authMethod|apiKeySource)"'
```

```text
  "authMethod": "claude.ai",
```

`claude auth status` は、認証の状態を JSON で表示するコマンドです（出典3）。JSON にはメールアドレスも入るので、`grep` で2行だけに絞りました。

`authMethod` が `claude.ai` なら、プランのログインで動いています（出典3）。環境変数のキーを置くと `api_key` になり、`apiKeySource` の行も出ました（実行結果は下の再現）。

Agent SDK なら、最初に届く init メッセージの `apiKeySource` が手がかりです。値の意味は次の表のとおりです（出典4）。

| apiKeySource | 使われているもの |
|---|---|
| `ANTHROPIC_API_KEY` | 環境変数 `ANTHROPIC_API_KEY` のキー |
| `apiKeyHelper` | 設定の `apiKeyHelper` のコマンドが返したキー |
| `/login managed key` | Claude Console のアカウントでログインしたときに保存されたキー |
| `none` | API キーは使っていない。claude.ai のログインなど |

プランで動かしたいなら、`none` 以外はすべて外します。`unset ANTHROPIC_API_KEY` を実行すれば、プランのログインに戻ります（出典1）。

## キーがあると、ログインより先に使われる

Claude Code が使う認証には順番があります。公式の一覧で、`ANTHROPIC_API_KEY` は3番目です（出典1）。`/login` のプランのログインは7番目で、一覧の最後です（出典1）。

キーがあるときの動きは、モードによって少し違います。

- 対話のモードでは、キーを使うかを最初に1回だけ聞かれ、答えが記憶されます（出典1）。
- `claude -p` では、キーがあれば聞かずに必ず使います（出典1）。
- Agent SDK も、同じ環境変数を読みます（出典1）。

スクリプトと Agent SDK は、確認の画面を出しません。この記事の検証でも、聞かれずにキーが使われました。別のアプリのために入れたキーが残っていると、気づかないまま従量課金で動きます。

## 無効なダミーのキーで Invalid API key を再現する

本物のキーを使わなくても、キーが優先されることは確かめられます。`sk-ant-invalid-demo` は、検証のために作った無効な文字列です。

```bash
ANTHROPIC_API_KEY=sk-ant-invalid-demo claude auth status | grep -E '"(authMethod|apiKeySource)"'
ANTHROPIC_API_KEY=sk-ant-invalid-demo claude -p "1+1は？数字だけで答えてください。" --model haiku --tools "" --strict-mcp-config # claude.ai のコネクタのツールを読み込まない
echo "exit=$?"
```

```text
  "authMethod": "api_key",
  "apiKeySource": "ANTHROPIC_API_KEY"
⚠ claude.ai connectors are disabled because ANTHROPIC_API_KEY or another auth source is set and takes precedence over your claude.ai login · Unset it to load your organization's connectors
Invalid API key · Fix external API key
exit=1
```

ログイン済みの環境でも、キーを置いた瞬間に `authMethod` が `api_key` へ切り替わりました。`claude -p` は API に拒否され、終了コード 1 で終わっています。

`Invalid API key` の行は、API がキーを受け付けなかったときの表示です（出典2）。今回はキーが無効なので、ここで止まりました。有効なキーなら応答が返り、その分がキーの持ち主に請求されます（出典6）。

`⚠` で始まる警告も手がかりになります。ログインより別の認証が優先されている、という意味の文面でした。

### 再現した呼び出しのトークン数は0

同じ呼び出しを `--output-format json` で受け取り、結果の数値も確かめました。`total_cost_usd` も、入力と出力のトークン数も 0 です。

API キーの料金は、トークン数に単価を掛けて決まります（出典8）。0 トークンの呼び出しなので、このダミーのキーで試す分には料金の心配がありません。

## Agent SDK では init の apiKeySource に出る

Agent SDK のコードでも、同じことを確かめます。`.ts` を `node` で直接動かすので、Node.js は 22.18.0 以上が必要です（出典10）。

```bash
mkdir key-check
cd key-check
npm init -y > /dev/null
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322
```

```text

added 2 packages, and audited 3 packages in 8s

found 0 vulnerabilities
```

次のコードを `check-auth.ts` として保存します。init の `apiKeySource` と、結果の `subtype`、`is_error` を表示します。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

try {
  for await (const message of query({
    prompt: "1+1は？数字だけで答えてください。",
    options: {
      model: "haiku",
      tools: [],
      maxTurns: 1,
      settingSources: [],
      strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    },
  })) {
    if (message.type === "system" && message.subtype === "init") {
      console.log(`apiKeySource: ${message.apiKeySource}`);
    } else if (message.type === "assistant" && message.error) {
      console.log(`assistant error: ${message.error}`);
    } else if (message.type === "result") {
      console.log(`result: ${message.subtype} is_error=${message.is_error}`);
      if (message.subtype === "success") console.log(message.result);
    }
  }
} catch (err) {
  console.log(`thrown: ${(err as Error).message}`);
}
```

キーの無い状態で動かすと、`apiKeySource` は `none` でした。出力の最後の `2` はモデルの答えで、目印にすぎません。判定に使うのは `apiKeySource` と `is_error` です。この環境で `none` だった3回は、どれも `2` でした。

```bash
node check-auth.ts
```

```text
apiKeySource: none
result: success is_error=false
2
```

同じコードを、ダミーのキーを付けて動かします。

```bash
ANTHROPIC_API_KEY=sk-ant-invalid-demo node check-auth.ts
```

```text
apiKeySource: ANTHROPIC_API_KEY
assistant error: authentication_failed
result: success is_error=true
Invalid API key · Fix external API key
thrown: Claude Code returned an error result: Invalid API key · Fix external API key
```

`apiKeySource` が `ANTHROPIC_API_KEY` に変わりました。`assistant` のメッセージには `authentication_failed` が付いています（出典4）。

### subtype だけ見ると、認証の失敗を見逃す

結果の `subtype` は `success` のままでした。型定義のコメントでは、API のエラーで終わったターンも `success` になります（出典11）。そのときは `is_error` が `true` になり、`result` にエラーの文面が入ります（出典11）。

成功を判定するなら、`subtype` と一緒に `is_error` も見てください。結果のあとに `for await` が例外を投げる動きもあります。

## キーの出どころ別の直し方

外し方は、キーがどこから来ているかで変わります。シェル、`.env`、設定ファイルの3か所を順に疑ってください。

### シェルに export してある

`test -n` が `set` を返したら、シェルにキーがあります。今のシェルからは `unset ANTHROPIC_API_KEY` で外せます（出典1）。

新しいターミナルでまた `set` になるなら、起動ファイルが原因です。`~/.zshrc` か `~/.bashrc` に `export` の行が残っているはずです。その行を消してから、ターミナルを開き直してください。

公式のエラーの手引きは、direnv が `.env` からキーを読み込む例を挙げています（出典2）。IDE のターミナルも同じ例に入っています（出典2）。自分で設定した覚えが無くても、作業フォルダの `.env` は疑ってかかるべきです。

### Node.js が .env を読み込んでいる

Node.js の `--env-file` は、ファイルの中身を `process.env` に入れます（出典9）。Agent SDK は、既定で `process.env` を Claude Code に渡します（出典4）。

別のアプリ用の `.env` にキーが書いてある状態を、ダミーのキーで作りました。

```bash
printf 'ANTHROPIC_API_KEY=sk-ant-invalid-demo\n' > .env
grep -n "ANTHROPIC_API_KEY" .env
```

```text
1:ANTHROPIC_API_KEY=sk-ant-invalid-demo
```

```bash
node --env-file=.env check-auth.ts
```

```text
apiKeySource: ANTHROPIC_API_KEY
assistant error: authentication_failed
result: success is_error=true
Invalid API key · Fix external API key
thrown: Claude Code returned an error result: Invalid API key · Fix external API key
```

シェルにはキーが無いのに、`.env` のキーが使われました。

### コードの env オプションでキーを外す

`.env` を消せないなら、`query()` の `env` オプションでキーだけを外します。`env` を渡した場合、`process.env` の代わりにその中身が使われる仕様です（出典4）。

次のコードを `plan-only.ts` として保存します。`check-auth.ts` と違うのは2点です。`options` に `env` を足し、`assistant` の分岐を省きました。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

try {
  for await (const message of query({
    prompt: "1+1は？数字だけで答えてください。",
    options: {
      model: "haiku",
      tools: [],
      maxTurns: 1,
      settingSources: [],
      strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
      env: { ...process.env, ANTHROPIC_API_KEY: undefined },
    },
  })) {
    if (message.type === "system" && message.subtype === "init") {
      console.log(`apiKeySource: ${message.apiKeySource}`);
    } else if (message.type === "result") {
      console.log(`result: ${message.subtype} is_error=${message.is_error}`);
      if (message.subtype === "success") console.log(message.result);
    }
  }
} catch (err) {
  console.log(`thrown: ${(err as Error).message}`);
}
```

`...process.env` を残すのは、`PATH` などの変数を渡し続けるためです（出典4）。

```bash
node --env-file=.env plan-only.ts
```

```text
apiKeySource: none
result: success is_error=false
2
```

同じ `.env` を読ませても、`apiKeySource` は `none` に戻りました。

### Claude Code の設定の env に書いてある

`~/.claude/settings.json` などの設定ファイルは、`env` で環境変数を設定できます。シェルに同じ変数があっても、設定の値が勝ちます（出典5）。

検証では、`claude -p` の `--settings` でダミーのキーを渡しました。結果は同じ `Invalid API key` でした。シェルと `.env` が空なのに直らないときは、設定ファイルの `env` を開いてください。

## 料金はどちらで動いたかで変わる

プランのログインで動かした Agent SDK と `claude -p` は、プランの利用枠から引かれます（出典7）。

### キーで動いた分の料金

API キーで動いた分は、キーの持ち主に請求されます（出典6）。単価はモデルごとに決まっていて、Haiku 5.5 の入力は100万トークンあたり0.10ドルです（出典8）。

これは10万トークン以下のプロンプトの単価で、出力は100万トークンあたり0.50ドルです（出典8）。

自分のアプリのために入れたキーが、手元の実験にまで使われていませんか。あなたのシェルの起動ファイルには、今どのキーが書いてありますか。

## 出典

本文の（出典n）は、この表の番号です。確認日は、どれもページを読んだ日です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-11 |
| 2 | Error reference (Claude Code) | https://code.claude.com/docs/en/errors | 2026-11-11 |
| 3 | CLI reference (Claude Code) | https://code.claude.com/docs/en/cli-reference | 2026-11-11 |
| 4 | Agent SDK reference - TypeScript | https://code.claude.com/docs/en/agent-sdk/typescript | 2026-11-11 |
| 5 | All settings (Claude Code) | https://code.claude.com/docs/en/settings-reference | 2026-11-11 |
| 6 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | 2026-11-11 |
| 7 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-11 |
| 8 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | 2026-11-11 |
| 9 | Node.js v22.23.4 Command-line API | https://nodejs.org/docs/v22.23.4/api/cli.html | 2026-11-11 |
| 10 | Node.js v22.23.4 Modules: TypeScript | https://nodejs.org/docs/v22.23.4/api/typescript.html | 2026-11-11 |
| 11 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-11 |

AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。
