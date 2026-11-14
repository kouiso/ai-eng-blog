---
title: "LLM の応答をストリーミングで1文字ずつ表示する【Agent SDK、includePartialMessages】"
slug: "claude-agent-sdk-streaming"
description: "Agent SDK の includePartialMessages を true にし、届いた文字から書き出します。stream_event の届く順番と、最初の文字が出るまでの時間を実測しました。"
tags: ["LLM API", "Claude Agent SDK", "TypeScript"]
main_keyword: "LLM API"
target_query: "llm ストリーミング"
course_step: 1
cost_estimate: "記事のコードは読者自身の Claude プランの利用枠から引かれます。Pro は月払いで月20ドルです。API キーは使いません。"
run_environment: "Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS（Darwin arm64）（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-11"
prev: "claude-p-script-first-call"
next: "llm-api-cost-estimate-js-tiktoken"
sources:
  - url: "https://code.claude.com/docs/en/agent-sdk/streaming-output"
    title: "Stream responses in real-time (Agent SDK)"
    accessed: 2026-11-11
  - url: "https://platform.claude.com/docs/en/build-with-claude/streaming"
    title: "Streaming messages (Claude API)"
    accessed: 2026-11-11
  - url: "https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts"
    title: "@anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts"
    accessed: 2026-11-11
  - url: "https://code.claude.com/docs/en/authentication"
    title: "Authentication (Claude Code)"
    accessed: 2026-11-11
  - url: "https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan"
    title: "Use the Claude Agent SDK with your Claude plan"
    accessed: 2026-11-11
  - url: "https://claude.com/pricing"
    title: "Claude の料金プラン"
    accessed: 2026-11-11
  - url: "https://nodejs.org/docs/v22.23.4/api/typescript.html"
    title: "Node.js v22.23.4 Modules: TypeScript"
    accessed: 2026-11-11
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-13
---

Agent SDK の `query()` は、ふつうは書き終わった応答をまとめて返します。`includePartialMessages: true` を足すと、途中の文字も届きます（出典1）。

届いた文字をその場で画面に書き出すコードの条件分岐は、3つです。この環境で記事と同じ設定のまま5回測ると、最初の文字が出るまで1,655〜2,445ミリ秒でした。thinking のブロックが先に届く実行では、もっと遅れます。

使うのは自分の Claude プランのログインで、API キーは要りません。初めて呼ぶ手順は[前の記事](/posts/claude-p-script-first-call)です。

## 前提は Node.js 22.18.0 以上と、プランでログインした Claude Code

用意するものは2つです。

- Node.js 22.18.0 以上。この版から `.ts` のファイルを `node` でそのまま動かせます（出典7）。検証は 22.23.4 で行いました。
- Claude の Pro、Max、Ultra のどれかでログインした Claude Code。Pro は月払いで月20ドルです（出典6）。

`query()` が返すメッセージの種類と、SDK の入れ方は省きます。

環境変数 `ANTHROPIC_API_KEY` があると、Claude Code はそのキーを使うかを聞きます。承認すると、プランより API キーが優先されます（出典4）。プランで試すなら、外れていることを先に確かめてください。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

`set` と出たら、`unset ANTHROPIC_API_KEY` で外してから進めてください（出典4）。

## SDK は 0.3.322 に固定して入れる

作業用のフォルダを作り、SDK を入れます。記事と同じ版で試せるよう、`--save-exact` で 0.3.322 に固定します。

```bash
mkdir stream-demo
cd stream-demo
npm init -y
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322
```

```text

added 105 packages, and audited 106 packages in 15s

36 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

## includePartialMessages を true にして text_delta を書き出す

1本目は、届いた文字を待たずに書き出すコードです。`stream.ts` として保存します。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "HTTP のストリーミングとは何かを、日本語で300字程度で説明してください。",
  options: {
    model: "haiku",
    tools: [],
    maxTurns: 1,
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    includePartialMessages: true,
  },
})) {
  if (message.type === "stream_event") {
    const event = message.event;
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      process.stdout.write(event.delta.text);
    }
  } else if (message.type === "result") {
    process.stdout.write(`\n[result/${message.subtype}] num_turns=${message.num_turns}\n`);
  }
}
```

`model`、`tools`、`maxTurns`、`settingSources` の指定は次のとおりです。ツールを渡さず、1ターンで答えさせ、手元の設定を読ませません。

ストリーミングのために足したのは `includePartialMessages: true` の1行です。これで `type` が `"stream_event"` のメッセージが届くようになります（出典3）。

文字を取り出す条件は、外側から順に次の3段です（出典1）。

1. `message.type` が `"stream_event"` のメッセージを選びます
2. その `event.type` が `"content_block_delta"` かを確かめます
3. 最後に `event.delta.type` が `"text_delta"` なら、文字の差分です

3つとも満たしたとき、`event.delta.text` に新しく届いた文字が入っています。届くのは差分なので、前の分とつなぐのは自分の仕事です（出典1）。

書き出しに `console.log` を使うと、差分ごとに改行が入ります。`process.stdout.write` は改行を足さないので、文章がそのままつながって出ます。

```bash
node stream.ts
```

```text
HTTPストリーミングとは、データを一括でまとめて送るのではなく、準備ができた部分から順次少しずつ送受信する仕組みです。通常のHTTPでは、サーバーが応答全体を生成してから一度に返しますが、ストリーミングでは「Transfer-Encoding: chunked」などを使い、データを小さな塊（チャンク）に分けて送ります。受信側はレスポンス全体の完了を待たずに、届いた部分から処理や表示を始められます。動画配信、大きなファイルのダウンロード、ChatGPTのようなAIの逐次的な文字出力、Server-Sent Events（SSE）などで利用されており、応答の体感速度を高めたり、メモリ使用量を抑えたりする効果があります。
[result/success] num_turns=1
```

ログに残した出力では、全文が1行です。実際には、届いた差分を届いた順に書き足した結果です。何回に分かれて届いたかは、次の `timing.ts` で数えます。

## 届く順番と時刻を timing.ts で確かめる

画面で伸びて見えるだけでは、何がいつ届いたかはわかりません。2本目は、届いたメッセージを開始からのミリ秒つきで1行ずつ表示します。

`text_delta` は数十個届くので、1個ずつは表示しません。最初と最後の時刻、個数、字数を出します。`timing.ts` として保存します。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

const start = performance.now();
const ms = () => String(Math.round(performance.now() - start)).padStart(5);
let streamed = "";
const deltaTimes: string[] = [];

for await (const message of query({
  prompt: "HTTP のストリーミングとは何かを、日本語で300字程度で説明してください。",
  options: {
    model: "haiku",
    tools: [],
    maxTurns: 1,
    settingSources: [],
    strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない
    includePartialMessages: true,
  },
})) {
  if (message.type === "stream_event") {
    const event = message.event;
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      if (deltaTimes.length === 0) console.log(`${ms()} 最初の text_delta`);
      streamed += event.delta.text;
      deltaTimes.push(ms());
    } else if (event.type === "content_block_delta") {
      console.log(`${ms()} stream_event ${event.delta.type}`);
    } else if (event.type === "content_block_start") {
      console.log(`${ms()} stream_event content_block_start ${event.content_block.type}`);
    } else {
      console.log(`${ms()} stream_event ${event.type}`);
    }
  } else if (message.type === "assistant") {
    if (deltaTimes.length > 0) {
      console.log(`${deltaTimes.at(-1)} 最後の text_delta（${deltaTimes.length}個、計${streamed.length}字）`);
    }
    for (const block of message.message.content) {
      const size = block.type === "text" ? ` ${block.text.length}字` : "";
      console.log(`${ms()} assistant ${block.type}${size} id=...${message.message.id.slice(-4)}`);
    }
  } else if (message.type === "result") {
    console.log(`${ms()} result/${message.subtype}`);
    if (message.subtype === "success") {
      console.log(`text_delta をつないだ文字列と result は同じか: ${streamed === message.result}`);
    }
  } else if (message.type === "system" && message.subtype === "init") {
    console.log(`${ms()} system/init apiKeySource=${message.apiKeySource}`);
  }
}
```

```bash
node timing.ts
```

```text
  977 system/init apiKeySource=none
 1742 stream_event message_start
 1743 stream_event content_block_start text
 1743 最初の text_delta
 3229 最後の text_delta（73個、計341字）
 3243 assistant text 341字 id=...grae
 3243 stream_event content_block_stop
 3247 stream_event message_delta
 3247 stream_event message_stop
 3253 result/success
text_delta をつないだ文字列と result は同じか: true
```

1行目の `apiKeySource=none` は、API キーを使っていないという意味です（出典3）。プランのログインで動いたことを、ここで確かめられます。

### 文字は1,486ミリ秒のあいだに73回に分かれて届いた

最初の `text_delta` から最後の `text_delta` までは1,486ミリ秒でした。その間に73個の差分が届き、つなぐと341字になりました。

1回に届くのは1文字とは限らず、平均すると5字ほどです。それでも平均で約20ミリ秒に1回は伸びるので、画面では1文字ずつ出ているように見えます。

同じ `timing.ts` をもう一度動かすと、最初の文字は1,655ミリ秒、最後は2,948ミリ秒でした。差分は63個で、計293字です。届く個数と時刻は、実行のたびに変わります。

同じプロンプトとオプションでさらに3回測ると、最初の文字は1,924、2,445、2,068ミリ秒でした。

### thinking のブロックが先に届く実行もある

今回の2回は、どちらも `message_start` の直後に `text` のブロックが開きました。どちらのコードも thinking を指定していません。

ただ、`strictMcpConfig` を足す前に動かした2回は、先に `thinking` のブロックが届きました。届くかどうかが実行で変わる理由は、わかっていません。

このブロックの中身は `thinking_delta` と `signature_delta` です（出典2）。その2回では、最初の文字は2,994ミリ秒と4,082ミリ秒でした。どちらも `thinking` のブロックが閉じた直後です。

`thinking_delta` は別の種類なので、`stream.ts` の条件を通りません（出典2）。考えている間に「考え中」と出したいなら、`content_block_start` を見ます。`content_block.type` が `thinking` のときが、表示を切り替える合図です（出典2）。

### assistant は、ブロックが閉じる直前に完成品として届く

`includePartialMessages` を付けても、`assistant` は届きます（出典1）。届くのは、ブロック1つが書き終わった時点です。

公式のページには、ブロックごとに `assistant` が1つ届き、`id` は共通だとあります（出典1）。今回はブロックが `text` の1つなので、`assistant` も1つでした。

届く位置は、そのブロックの `content_block_stop` の直前です（出典1）。ログでも、`assistant text` は `content_block_stop` の1行前でした。時刻はどちらも3,243ミリ秒です。

`result` は、ターンの最後に1つだけ届きます（出典3）。今回の実行では、`text_delta` をつないだ341字と `result` の文字列が一致しました。

## ストリーミングで縮むのは、最初の文字が出るまでの待ち時間

`includePartialMessages` を付けても、応答が完成する時刻は早くなりません。変わるのは、読む人が最初の文字を目にする時刻です。

1回目の実行では、最初の文字が1,743ミリ秒、全文の `assistant` が3,243ミリ秒でした。付けない実行は測っていません。

出典1では、付けないときの `assistant` は、ブロックを書き終えてから届きます。そのとおりなら、画面に出るのが1回目は約1.5秒、2回目は約1.3秒遅れる計算です。

測ったのは341字と293字の答えの2回で、長い答えは測っていません。

使い分けは次のようにしています。

- 画面に出す文字は `stream_event` の `text_delta` から取る
- 保存、検証、次の処理に渡す文字列は `result` から取る

`result` は、`subtype` が `success` のときにしか文字列を持ちません（出典3）。途中で止まった応答の差分を、そのまま保存しない用心です。

あなたのアプリでは、最初の文字が出るまでの待ち（この環境では1.7〜4.1秒）をどう見せますか。

## 料金はプランの利用枠から引かれる

記事のコードは、プランのログインで動かすと、プランの利用枠から引かれます（出典5）。

Pro は月払いで月20ドルです（出典6）。今回のコードは `total_cost_usd` を表示していません。使った量の目安は `result` で読めます。

## 出典

本文の（出典n）は、この表の番号です。確認日は、どれもページを読んだ日です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Stream responses in real-time (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/streaming-output | 2026-11-11 |
| 2 | Streaming messages (Claude API) | https://platform.claude.com/docs/en/build-with-claude/streaming | 2026-11-11 |
| 3 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-11 |
| 4 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-11 |
| 5 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-11 |
| 6 | Claude の料金プラン | https://claude.com/pricing | 2026-11-11 |
| 7 | Node.js v22.23.4 Modules: TypeScript | https://nodejs.org/docs/v22.23.4/api/typescript.html | 2026-11-11 |

AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。
