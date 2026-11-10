---
title: "promptfoo で LLM のプロンプトを評価する【設定ファイル1つから、Claude プランで動かす】"
slug: "promptfoo-llm-eval-intro"
description: "promptfoo の設定ファイル1つに、プロンプト、モデル、テストケースと採点の条件を書いて評価を実行します。問い合わせを分類する2つのプロンプトを、自分の Claude プランで比べます。不合格の理由の読み方と終了コードを、実行結果つきで示します。"
tags: ["LLM 評価", "promptfoo", "Claude Agent SDK", "TypeScript"]
main_keyword: "LLM 評価"
target_query: null
course_step: 6
cost_estimate: "promptfoo は MIT ライセンスで無料です。評価でモデルを呼ぶ分は、読者自身の Claude プランの利用枠から引かれます（Pro は月払いで月20ドル）。結果に出る cost は定価で換算した見積もりで、プランでの請求額とは別の数字です。"
run_environment: "Node.js 22.22.0、npm 10.9.4、promptfoo 0.125.1、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、Linux x86_64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-10"
prev: "rag-retrieval-eval-recall-mrr"
next: "llm-eval-dataset-from-logs"
sources:
  - url: "https://github.com/promptfoo/promptfoo"
    title: "promptfoo（GitHub）"
    accessed: 2026-11-10
  - url: "https://www.npmjs.com/package/promptfoo"
    title: "promptfoo（npm）"
    accessed: 2026-11-10
  - url: "https://www.promptfoo.dev/docs/providers/claude-agent-sdk/"
    title: "Claude Agent SDK (promptfoo)"
    accessed: 2026-11-10
  - url: "https://www.promptfoo.dev/docs/configuration/reference/"
    title: "Reference (promptfoo)"
    accessed: 2026-11-10
  - url: "https://www.promptfoo.dev/docs/configuration/prompts/"
    title: "Prompts (promptfoo)"
    accessed: 2026-11-10
  - url: "https://www.promptfoo.dev/docs/configuration/expected-outputs/"
    title: "Assertions and metrics (promptfoo)"
    accessed: 2026-11-10
  - url: "https://www.promptfoo.dev/docs/usage/command-line/"
    title: "Command line (promptfoo)"
    accessed: 2026-11-10
  - url: "https://www.promptfoo.dev/docs/configuration/outputs/"
    title: "Output formats (promptfoo)"
    accessed: 2026-11-10
  - url: "https://github.com/promptfoo/promptfoo/blob/0.125.1/src/providers/claude-agent-sdk.ts"
    title: "promptfoo 0.125.1 の src/providers/claude-agent-sdk.ts"
    accessed: 2026-11-10
  - url: "https://www.promptfoo.dev/docs/configuration/telemetry/"
    title: "Telemetry (promptfoo)"
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
  - url: "https://nodejs.org/docs/v22.22.0/api/typescript.html"
    title: "Node.js v22.22.0 Modules: TypeScript"
    accessed: 2026-11-10
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-10
---

promptfoo は、LLM を使うアプリを評価するための CLI です（出典1）。プロンプト、モデル、テストケースを YAML の設定ファイル1つに書くと、出力を自動で採点します。

この記事では、問い合わせを分類する2つのプロンプトを、自分の Claude プランで比べます。API キーは使いません。

実際に動かすと、答えの形を指定しなかったプロンプトは3件とも不合格でした。分類そのものは3件とも合っていて、落ちた理由はラベルの前後に付いた記号と説明の文です。

[前の記事](/posts/rag-retrieval-eval-recall-mrr)は、RAG の検索を測る回です。採点の方法は[採点の記事](/posts/llm-eval-harness-fixtures)で扱っています。モデルに採点させる方法は[別の記事](/posts/llm-as-a-judge-claude)にあります。この記事は promptfoo の設定の書き方と、結果の読み方に絞ります。

## 用意するのは Node.js 22.22.0 以上と、Claude Code が使えるプラン

promptfoo 0.125.1 は、Node.js 22.22.0 以上を要求します（出典2）。検証も 22.22.0 で行いました。

モデルを呼ぶ部分は、promptfoo の Claude Agent SDK のプロバイダーに任せます（出典3）。プランで動かすために要るものは次の2つです。

- プランは Claude の Pro、Max、Ultra のどれかです。Free には Claude Code が含まれません（出典14）。Pro は月払いで月20ドルです（出典14）。
- Claude Code には、そのプランのアカウントでログインしておきます（出典11）。

SDK 単体の動かし方は[別の記事](/posts/claude-agent-sdk-first-agent)です。ログインの操作は、この記事の検証では実行していません。

環境変数 `ANTHROPIC_API_KEY` があると、プランのログインより先に使われます（出典11）。先に外れていることを確かめます。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

`set` と出たら、`unset ANTHROPIC_API_KEY` で外してください（出典11）。

### プランで動かしてよいのは、自分で試す範囲です

プランでログインして Agent SDK を使うと、プランの利用枠から引かれます（出典13）。利用枠は、Claude Code と Agent SDK を個人がふつうに使う前提で決まっています（出典12）。

ほかの人に使わせる製品かサービスで動かすなら、Claude Console の API キーで認証します（出典12）。利用者に代わって、プランの認証情報で通信を中継することは禁止です（出典12）。

この記事の設定は、自分のマシンで自分のプロンプトを試すためのものとして読んでください。

## npm install で promptfoo と Agent SDK を入れる

Agent SDK とその CLI は、promptfoo の標準のインストールに含まれません（出典3）。2つを並べて入れ、記事と同じ版になるよう `--save-exact` で固定します。

```bash
mkdir promptfoo-intro
cd promptfoo-intro
npm init -y > /dev/null
npm pkg set type=module
npm install --save-exact promptfoo@0.125.1 @anthropic-ai/claude-agent-sdk@0.3.322
```

```text
npm warn deprecated @modelcontextprotocol/server-filesystem@2026.8.31: Date-based versions are no longer published. This package has resumed semantic versioning at 1.0.0: install the latest version.
npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead

added 576 packages, and audited 577 packages in 36s

111 packages are looking for funding
  run `npm fund` for details

8 vulnerabilities (3 moderate, 5 high)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

0.125.1 は、2026-11-10 の時点で npm の最新版です（出典2）。`type` を `module` にすると、`.ts` のファイルで `import` を書けます（出典16）。

```bash
npm pkg get type dependencies
```

```text
{
  "type": "module",
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "0.3.322",
    "promptfoo": "0.125.1"
  }
}
```

### `npm audit fix --force` は実行しない

警告の8件は、promptfoo が依存するパッケージから出ています。`npm audit` の出力には、直し方として次の行がありました。

```text
fix available via `npm audit fix --force`
Will install promptfoo@0.5.1, which is a breaking change
```

`--force` を付けると、promptfoo が 0.5.1 まで戻ります。この記事の設定は 0.125.1 のプロバイダーを使うので、実行しません。

## promptfooconfig.yaml に prompts、providers、tests を書く

評価の中身は、次の設定ファイル1つです。`promptfooconfig.yaml` という名前で保存すると、`eval` が自動で読みます（出典7）。

```yaml
description: 問い合わせを分類するプロンプトを2通り比べる

prompts:
  - label: 形の指定なし
    raw: |
      次の問い合わせを billing、bug、other のどれかに分類してください。

      問い合わせ: {{inquiry}}
  - label: 形の指定あり
    raw: |
      次の問い合わせを billing、bug、other のどれかに分類してください。
      答えはラベルの英単語1つだけを小文字で返し、ほかの文字は書かないでください。

      問い合わせ: {{inquiry}}

providers:
  - id: anthropic:claude-agent-sdk
    config:
      apiKeyRequired: false
      model: haiku
      max_turns: 1
      custom_system_prompt: あなたは問い合わせの窓口で、届いた文を分類します。

defaultTest:
  assert:
    - type: regex
      value: '^(billing|bug|other)$'
      metric: ラベル1語

tests:
  - vars:
      inquiry: 先月の請求額が2回引き落とされています。
    assert:
      - type: icontains
        value: billing
        metric: 分類が合う
  - vars:
      inquiry: 保存ボタンを押すと画面が真っ白になります。
    assert:
      - type: icontains
        value: bug
        metric: 分類が合う
  - vars:
      inquiry: 御社のロゴを講演のスライドに使ってもよいですか。
    assert:
      - type: icontains
        value: other
        metric: 分類が合う
```

上から順に、4つの項目が並んでいます。

| 項目 | 書いたこと |
|---|---|
| `prompts` | 比べる2つのプロンプト（`label` は結果の表に出る名前） |
| `providers` | 呼ぶモデルと、その呼び方 |
| `defaultTest` | すべてのテストケースに足す採点の条件 |
| `tests` | 問い合わせの文と、そのテストケースに固有の採点の条件 |

### `{{inquiry}}` に tests の vars が入る

プロンプトの `{{inquiry}}` は Nunjucks のテンプレートの書き方です（出典5）。テストケースの `vars` にある `inquiry` の値が、ここに入ります（出典4）。

1つのテストケースは、すべてのプロンプトとプロバイダーに渡されます（出典4）。テストケースが3つでプロンプトが2つなので、モデルを呼ぶ回数は6回です。

### `apiKeyRequired: false` で、API キーの確認を飛ばす

プロバイダーの ID は `anthropic:claude-agent-sdk` です（出典3）。promptfoo は、ふつうは呼ぶ前に Anthropic の API キーがあるかを確かめます（出典3）。

`apiKeyRequired: false` は、この確認を飛ばす指定です（出典3）。認証は、SDK が自分で行います（出典3）。プランのログインで動かすときは、この1行が要ります。

ほかの3行の意味は次のとおりです。

- `model: haiku` は、モデルの別名です。実行すると `claude-haiku-5-5` が使われました。
- `max_turns: 1` は、ターン数の上限です（出典3）。分類は1往復で終わるので、1にしました。
- `custom_system_prompt` は、既定のシステムプロンプトを置き換えます（出典3）。

この行を書かないと、Claude Code のシステムプロンプトがそのまま付きます（出典9）。評価する条件を自分のアプリに近づけるため、短いシステムプロンプトに差し替えました。

ツールは何も渡していません。このプロバイダーは、既定ではツールなしで一時フォルダの中で動きます（出典3）。

### 形の検査と中身の検査を、別の metric に分けた

採点の条件は `assert` に書きます。`regex` は正規表現に合うかを調べます（出典6）。`icontains` は、大文字と小文字を区別せずに文字列を含むかの検査です（出典6）。

`defaultTest` の `regex` で、出力が3つのラベルのどれか1語ちょうどかを見ます。各テストケースの `icontains` は、正しいラベルを含むかを確かめます。

条件が2つあるテストケースは、両方とも合格したときに合格です（出典6）。`metric` に名前を付けておくと、どちらで落ちたかを結果から読めます（出典6）。

`icontains` は部分一致なので、「debug」と答えても `bug` に合格します。部分一致の通し方は[採点の記事](/posts/llm-eval-harness-fixtures)で試しました。

## npx promptfoo eval の表で、形を指定しないプロンプトが3件とも FAIL になる

評価は `eval` の1コマンドで動きます。`--no-share` は共有用の URL を作らない指定で、`-o` は結果を書き出すファイルです（出典7）。

```bash
npx promptfoo eval --no-share -o results.jsonl
echo $?
```

```text
Starting evaluation eval-Z3g-2026-11-10T07:59:24
Running 6 test cases (up to 4 at a time)...

┌──────────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────────────────────┐
│ inquiry                      │ sessionId                    │ [anthropic:claude-agent-sdk] │ [anthropic:claude-agent-sdk] │
│                              │                              │ 形の指定なし                 │ 形の指定あり                 │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ 先月の請求額が2回引き落とさ… │ <session-id>                 │ [FAIL] billing               │ [PASS] billing               │
│                              │                              │ この問い合わせは、請求額(二… │                              │
│                              │                              │ billing に分類します。       │                              │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ 保存ボタンを押すと画面が真…  │ <session-id>                 │ [FAIL] bug                   │ [PASS] bug                   │
│                              │                              │ この問い合わせは、保存操作…  │                              │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ 御社のロゴを講演のスライド…  │ <session-id>                 │ [FAIL] **分類: other**       │ [PASS] other                 │
│                              │                              │ ロゴの利用許諾に関する質問…  │                              │
│                              │                              │ に分類します。               │                              │
└──────────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────────────────────┘
✓ Eval complete (ID: eval-Z3g-2026-11-10T07:59:24)

» View results: promptfoo view
» Feedback: https://promptfoo.dev/feedback

Total Tokens: 17,489
  Provider: 17,489 (16,050 prompt, 1,439 completion, 1,138 reasoning)

Results:
  ✓ 3 passed (50.00%)
  ✗ 3 failed (50.00%)
  0 errors (0%)
Duration: 10s (concurrency: 4)

Writing output to results.jsonl
100
```

表の1行が1つのテストケースで、右の2列がプロンプトです。各マスの先頭に `[PASS]` か `[FAIL]` が付き、続けて出力が表示されます。

`sessionId` の列には、呼び出しごとの Agent SDK のセッションの ID が出ます（出典9）。記事では `<session-id>` に置き換えています。

「形の指定あり」は3件とも合格し、「形の指定なし」は3件とも不合格でした。左の列の出力も、正しいラベルは3件とも含んでいます。落ちたのは、ラベルの前後に記号や説明の文が付いたからです。

### 不合格が1件でもあれば、終了コードは 100

最後の `100` は `echo $?` の表示で、`eval` の終了コードです。不合格のテストケースが1件でもあると、`eval` は 100 で終わります（出典7）。それ以外のエラーは 1 です（出典7）。

CI で `eval` を動かせば、プロンプトを直した変更が評価を通るかを、終了コードで判定できます。100 以外にするには `PROMPTFOO_FAILED_TEST_EXIT_CODE` を使います（出典7）。

## 不合格の理由は results.jsonl から読む

表のマスは途中で切れるので、出力の全文は読めません。`-o results.jsonl` で書き出したファイルは、1行に1件の結果が入った JSONL です（出典8）。

各行の `success`、`score`、`gradingResult` が、その行の結果です（出典8）。条件ごとの結果は `gradingResult.componentResults` にあります（出典8）。不合格の行を選んで表示するコードを書きます。

```ts
import { readFileSync } from "node:fs";

type Row = {
  success: boolean;
  prompt: { label: string };
  vars: Record<string, string>;
  response?: { output?: string };
  gradingResult?: {
    componentResults?: {
      pass: boolean;
      reason: string;
      assertion?: { metric?: string };
    }[];
  };
};

const rows: Row[] = readFileSync("results.jsonl", "utf8")
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map((line) => JSON.parse(line));

for (const row of rows.filter((r) => !r.success)) {
  console.log(`--- ${row.prompt.label} / ${row.vars.inquiry}`);
  for (const result of row.gradingResult?.componentResults ?? []) {
    if (!result.pass) {
      console.log(`不合格の metric: ${result.assertion?.metric} (${result.reason})`);
    }
  }
  console.log(`出力: ${JSON.stringify(row.response?.output ?? "")}`);
}

const passed = rows.filter((r) => r.success).length;
console.log(`合格 ${passed} / ${rows.length}`);
```

`show-failures.ts` として保存します。`response.output` は、出典8の JSONL の例に出てきます。`prompt.label` と `vars` の2つは、出典8の説明にありません。0.125.1 が書き出した `results.jsonl` を開いて、名前を確かめました。

Node.js 22.18.0 以降は、`.ts` のファイルをそのまま `node` で実行できます（出典16）。

```bash
node show-failures.ts
```

```text
--- 形の指定なし / 先月の請求額が2回引き落とされています。
不合格の metric: ラベル1語 (Expected output to match regex "^(billing|bug|other)$")
出力: "billing\n\nこの問い合わせは、請求額(二重引き落とし)に関する内容のため billing に分類します。"
--- 形の指定なし / 保存ボタンを押すと画面が真っ白になります。
不合格の metric: ラベル1語 (Expected output to match regex "^(billing|bug|other)$")
出力: "bug\n\nこの問い合わせは、保存操作で画面が真っ白になるという不具合の報告なので「bug」に分類されます。料金や請求に関する内容は含まれていません。"
--- 形の指定なし / 御社のロゴを講演のスライドに使ってもよいですか。
不合格の metric: ラベル1語 (Expected output to match regex "^(billing|bug|other)$")
出力: "**分類: other**\n\nロゴの利用許諾に関する質問で、請求(billing)にも不具合(bug)にも当たらないため、other に分類します。"
合格 3 / 6
```

落ちた条件は、3件とも「ラベル1語」です。「分類が合う」は3件とも通っていて、モデルの分類は正しいとわかります。

3件目は、Markdown の太字の記号と「分類:」まで付きました。この出力をそのまま受け取ると、アプリのコードは `other` を取り出せません。

採点を緩めない理由は[採点の記事](/posts/llm-eval-harness-fixtures)にあります。promptfoo の側で役に立ったのは、metric を分けておいたことです。「分類が合う」が通って「ラベル1語」だけが落ちたので、直す先はプロンプトの形の指定に絞れます。この設定では「形の指定あり」がその直し方です。

### 2回目も合格の数は同じで、出力の文面は変わった

同じ設定のまま、もう1回 `eval` を動かしました。合格は同じ3件で、終了コードも 100 でした。

違ったのは「形の指定なし」の出力の文面です。2回目の `show-failures.ts` では、2件目の出力の途中に太字の記号が出ました。

```text
出力: "bug\n\nこの問い合わせは「保存ボタンを押すと画面が真っ白になる」という現象の報告で、アプリケーションの不具合(クラッシュや描画の失敗)にあたるため、**bug** に分類します。課金に関する内容や、ほかの種類の問い合わせではありません。"
```

2回で同じ合否になっても、出力の文字列そのものは毎回変わります。文面の揺れまで比べたいときは、`show-failures.ts` の出力を実行ごとに残しておきます。

## 1回の評価で、プランの利用枠から6回分が引かれる

モデルを呼ぶ6回分は、プランの利用枠から引かれます（出典13）。promptfoo 自体は MIT ライセンスで、無料で使えます（出典1）。

このプロバイダーは、ふつうは応答をキャッシュします（出典3）。ただし `apiKeyRequired: false` のときは、キャッシュを読まず、書きもしません（出典9）。

2回の実行のトークン数は 17,489 と 17,201 で、2回目もモデルを6回呼んでいました。設定を変えずに `eval` を繰り返すと、そのたびに利用枠が減ります。

### システムプロンプトを差し替えると、トークン数はほぼ半分になった

`custom_system_prompt` の1行を消した設定でも、同じ6件を動かしました。トークン数は次のとおりです。

| 設定 | Total Tokens | うち prompt |
|---|---|---|
| `custom_system_prompt` あり（1回目） | 17,489 | 16,050 |
| `custom_system_prompt` なし | 31,477 | 29,913 |

1行を消すと、prompt のトークン数は 16,050 から 29,913 に増えました。増えた分は、既定で付く Claude Code のシステムプロンプトです（出典9）。

合否は、どちらの設定でも同じ3件でした。評価したいのが自分のアプリのプロンプトなら、システムプロンプトもアプリと同じものに差し替えておくのが筋です。

### results.jsonl の cost は定価で換算した見積もり

2回目の `results.jsonl` の `cost` を6件分足すと、0.00236732 ドルでした。モデルごとの内訳には、`costBasis` が `list` と入っています。

この数字は SDK の `total_cost_usd` と同じ見積もりです。型定義のコメントには「An estimate, not a billing statement」とあります（出典15）。プランで動かしたときの請求額としては読まず、使った量の目安にします。

同じ環境で `query()` を1回動かすと、init の `apiKeySource` は `none` でした。`none` は API キーを使っていないという意味です（出典15）。動かし方は[別の記事](/posts/claude-agent-sdk-first-agent)です。

promptfoo は、コマンドを実行した記録を既定で送ります（出典10）。プロンプト、モデルの出力、テストケースは含まれません（出典10）。止めるときは `PROMPTFOO_DISABLE_TELEMETRY=1` を設定します（出典10）。

## ほかの人に使わせるなら API キーで動かす

評価を製品の開発に組み込むなら、Claude Console の API キーで認証します（出典12）。チームの CI で動かす評価も、この記事では製品の開発の側に数えます。

プランの利用枠は、個人がふつうに使う前提で決まっています（出典12）。製品かサービスを作る開発者は API キーで認証する、とも書かれています（出典12）。

このプロバイダーは、`ANTHROPIC_API_KEY` か設定の `apiKey` でキーを受け取ります（出典3）。キーで動かす場合は、`apiKeyRequired: false` の行は要りません。

この記事で比べたのは、形の指定を1文足すかどうかの1点です。あなたのプロンプトでは、どんな形の崩れを不合格にしますか。

## 出典

本文の（出典n）は、この表の番号です。確認日は、どれもページを読んだ日です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | promptfoo（GitHub） | https://github.com/promptfoo/promptfoo | 2026-11-10 |
| 2 | promptfoo（npm） | https://www.npmjs.com/package/promptfoo | 2026-11-10 |
| 3 | Claude Agent SDK (promptfoo) | https://www.promptfoo.dev/docs/providers/claude-agent-sdk/ | 2026-11-10 |
| 4 | Reference (promptfoo) | https://www.promptfoo.dev/docs/configuration/reference/ | 2026-11-10 |
| 5 | Prompts (promptfoo) | https://www.promptfoo.dev/docs/configuration/prompts/ | 2026-11-10 |
| 6 | Assertions and metrics (promptfoo) | https://www.promptfoo.dev/docs/configuration/expected-outputs/ | 2026-11-10 |
| 7 | Command line (promptfoo) | https://www.promptfoo.dev/docs/usage/command-line/ | 2026-11-10 |
| 8 | Output formats (promptfoo) | https://www.promptfoo.dev/docs/configuration/outputs/ | 2026-11-10 |
| 9 | promptfoo 0.125.1 の src/providers/claude-agent-sdk.ts | https://github.com/promptfoo/promptfoo/blob/0.125.1/src/providers/claude-agent-sdk.ts | 2026-11-10 |
| 10 | Telemetry (promptfoo) | https://www.promptfoo.dev/docs/configuration/telemetry/ | 2026-11-10 |
| 11 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-10 |
| 12 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | 2026-11-10 |
| 13 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-10 |
| 14 | Claude の料金プラン | https://claude.com/pricing | 2026-11-10 |
| 15 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-10 |
| 16 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | 2026-11-10 |

テストケースを手で3件書くのは、最初の1回で済ませたいところです。[次の記事](/posts/llm-eval-dataset-from-logs)は、ログから選ぶ回です。選んだテストケースを JSONL に書き出すところまで扱います。

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
