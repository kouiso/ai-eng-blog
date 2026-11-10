---
title: "LLM-as-a-Judge で回答を採点する【Claude Agent SDK に基準と JSON スキーマを渡す】"
slug: "llm-as-a-judge-claude"
description: "採点基準を規則として書き、Claude Agent SDK に JSON スキーマと一緒に渡します。返ってきた点と理由を、人の点と比べます。5件の見本の回答では、規則を書いた基準で人の点と5件とも一致しました。"
tags: ["LLM 評価", "Claude Agent SDK", "TypeScript"]
main_keyword: "LLM 評価"
target_query: null
course_step: 6
cost_estimate: "記事のコードは読者自身の Claude プランの利用枠から引かれます。Pro は月払いで月20ドルです。SDK が出す total_cost_usd は定価で換算した見積もりで、プランでの請求額とは別の数字です。"
run_environment: "Node.js 22.22.0、npm 10.9.4、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、Linux x86_64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-10"
prev: "llm-eval-harness-fixtures"
next: "rag-retrieval-eval-recall-mrr"
sources:
  - url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"
    title: "Define success criteria and build evaluations"
    accessed: 2026-11-10
  - url: "https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts"
    title: "@anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts"
    title: "Modifying system prompts"
    accessed: 2026-11-10
  - url: "https://code.claude.com/docs/en/agent-sdk/quickstart"
    title: "Quickstart (Agent SDK)"
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
  - url: "https://code.claude.com/docs/en/agent-sdk/structured-outputs"
    title: "Get structured output from agents"
    accessed: 2026-11-10
  - url: "https://nodejs.org/docs/v22.22.0/api/typescript.html"
    title: "Node.js v22.22.0 Modules: TypeScript"
    accessed: 2026-11-10
  - url: "https://registry.npmjs.org/@anthropic-ai/claude-agent-sdk"
    title: "@anthropic-ai/claude-agent-sdk（npm registry）"
    accessed: 2026-11-10
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing (Claude API)"
    accessed: 2026-11-10
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-10
---

LLM-as-a-Judge は、採点基準を書いたプロンプトをモデルに渡して、別の回答に点を付けさせるやり方です。この記事では、Claude Agent SDK の `query()` に採点基準と JSON スキーマを渡します。受け取るのは、点と理由の2つです。

5件の見本の回答で試すと、規則を書いた採点基準では、5回動かして5回とも人の点と5件が一致しました。「1〜5で採点して」と書いただけの基準では、一致は回によって1〜3件でした。

コードは TypeScript で、自分の Claude プランでログインした Claude Code の上で動きます。API キーは要りません。

[前の記事](/posts/llm-eval-harness-fixtures)では、文字列の照合で回答を採点しました。使ったのは、完全一致、部分一致、正規表現です。今回は、その3つでは決められない観点を Claude に任せます。

## 文字列で決められない観点だけをモデルに採点させる

採点の方法は、速くて確実なものから選びます。Anthropic の評価のページは、コードでの採点を最も速く確実な方法としています（出典1）。

モデルによる採点は、速く柔軟で、複雑な判断にも使える方法です（出典1）。同じページは、まず信頼できるかを確かめてから広げるよう書いています（出典1）。

例にするのは、通販のサポートの回答です。質問は「返品はいつまでできますか」です。店の決まりとして、期限は商品の到着から30日以内、対象は未開封の商品、送料はお客様の負担、の3点を参考情報に書きました。

回答に「30日」が入っているかは、正規表現で確かめられます。参考情報に無いことを書き足していないかは、文字列の照合では決められません。返金の日数、問い合わせの窓口のように、書き足される中身を前もって並べておけないからです。

モデルに任せるのは、こうした観点だけにします。

## プランで動かすのは、自分で試す範囲に限る

Agent SDK を Claude プランのログインで使うと、プランの利用枠から引かれます（出典7）。プランの利用枠は、Claude Code と Agent SDK を個人がふつうに使う前提で決まっています（出典6）。

ほかの人に使わせるアプリかサービスに採点を組み込む場合は、話が変わります。そのときは、Claude Console で発行した API キーで認証します（出典6）。利用者に代わって、プランの認証情報で通信を中継することは禁止されています（出典6）。

この記事のコードは、自分のマシンで自分の評価を動かすためのものとして読んでください。

## 用意するのは Node.js、Claude のプラン、ログイン済みの Claude Code

動かすには、次の環境が要ります。

- Node.js 22.18.0 以上。この記事では `.ts` のファイルをそのまま `node` で動かすためです（出典10）。検証は 22.22.0 で行いました。
- Claude の Pro、Max、Ultra のどれか。Free のプランには Claude Code が含まれません（出典8）。
- そのプランのアカウントでログインした Claude Code（出典5）

環境変数 `ANTHROPIC_API_KEY` があると、プランのログインより先に使われます（出典5）。プランで試す前に、外れていることを確かめます。

```bash
test -n "$ANTHROPIC_API_KEY" && echo set || echo unset
```

```text
unset
```

`set` と出たら、`unset ANTHROPIC_API_KEY` で外してください（出典5）。

作業フォルダを作り、SDK を入れます。記事と同じ版で試せるよう、`--save-exact` で 0.3.322 に固定しました。

```bash
mkdir llm-judge
cd llm-judge
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

0.3.322 は、2026-11-10 の時点の npm の最新版です（出典11）。SDK は Claude Code の本体を同梱しているので、別に入れる必要はありません（出典4）。`type` を `module` にしたのは、トップレベルで `await` を書くためです（出典4）。

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

## 採点基準は、1点から順に当てはめる規則で書く

採点基準は、作業フォルダに `rubric.md` として保存します。この文章が、そのままモデルへのシステムプロンプトになります。

```markdown
あなたは、カスタマーサポートの回答を採点する担当です。
ユーザーのメッセージには、質問、参考情報、採点する回答が入っています。
回答を参考情報とだけ照らし合わせ、次の規則で1〜5の点を付けてください。
規則は1点から順に当てはめ、最初に当てはまった点にします。

1点: 参考情報と食い違うことを書いている（期限の日数が違う、など）
2点: 参考情報に書かれていないことを、事実として書いている
3点: 返品の期限を書いていない
4点: 期限は正しいが、未開封の商品に限るという条件が抜けている
5点: 期限と未開封の条件を両方とも正しく書き、参考情報に無いことを書いていない

reason には、当てはまった規則と、その根拠になる回答の文を書いてください。
言い回しの丁寧さと文の長さは、点に含めません。
```

点ごとの条件は、参考情報と照らせば人が見ても同じ答えになる形にしました。公式のページも、詳しくはっきりした採点基準を書くよう勧めています（出典1）。答えを「正しい」と「誤り」の2つか、1〜5の点に絞ることも勧めています（出典1）。

規則に順番を付けたのは、1つの回答が2つの規則に当てはまるときのためです。期限も条件も正しいのに、返金の日数を書き足した回答を考えてみてください。5点の条件の3つのうち2つを満たしつつ、2点の条件にも当てはまる回答です。

順番が無いと、どちらの点にするかをモデルが毎回選ぶことになります。重い誤りから先に見ると決めておけば、点は1つに決まります。

`reason` に規則と回答の文を書かせるのは、あとで人が点を確かめるためです。丁寧さと文の長さを点から外したのは、この採点で見たいのが中身だけだからです。

## judge.ts は採点基準を渡し、structured_output で点を受け取る

採点の呼び出しは、`judge.ts` の1つの関数に入れます。採点基準と、質問、参考情報、回答を並べた文字列を受け取り、点と理由を返します。

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

export type Verdict = { reason: string; score: number };

const schema = {
  type: "object",
  properties: {
    reason: { type: "string" },
    score: { type: "integer", enum: [1, 2, 3, 4, 5] },
  },
  required: ["reason", "score"],
  additionalProperties: false,
};

export async function judge(rubric: string, input: string) {
  let apiKeySource = "";
  for await (const message of query({
    prompt: input,
    options: {
      model: "haiku",
      systemPrompt: rubric,
      tools: [],
      settingSources: [],
      outputFormat: { type: "json_schema", schema },
    },
  })) {
    if (message.type === "system" && message.subtype === "init") {
      apiKeySource = message.apiKeySource;
    }
    if (message.type === "result") {
      if (message.subtype === "success" && message.structured_output) {
        const verdict = message.structured_output as Verdict;
        return { verdict, apiKeySource, costUsd: message.total_cost_usd };
      }
      throw new Error(`採点結果がありません（subtype: ${message.subtype}）`);
    }
  }
  throw new Error("result のメッセージが届きませんでした");
}
```

`query()` に渡したオプションの役割は、次のとおりです。

- `model: "haiku"` はモデルの別名です。実行すると、init のメッセージに `claude-haiku-5-5` と出ました。
- `systemPrompt` に文字列を渡すと、SDK はその文字列だけをシステムプロンプトとして送ります（出典3）。
- `tools: []` は、組み込みのツールをすべて外す指定です（出典2）。
- `settingSources: []` では、手元の設定と CLAUDE.md を読みません（出典2、出典3）。
- `outputFormat` は、返す値の形を決める JSON スキーマです（出典9）。結果の `structured_output` に、その形の値が入ります（出典9）。

スキーマでは、`score` を `enum` で1〜5の整数に限りました。採点基準に無い点を、一致の数え方に混ぜないためです。JSON スキーマで返す値の形を決める仕組みは、この記事では説明しません。[構造化出力の記事](/posts/claude-structured-outputs-json)で扱います。

`judge()` が点を返すのは、2つの条件がそろったときだけです。`result` が成功であることと、`structured_output` に値が入っていることです。それ以外は例外にして、点の無い採点を人の点との比較に入れないようにしました。

`structured_output` の型は `unknown` です（出典2）。値は SDK がスキーマで検証しているので（出典9）、`as Verdict` で型を付けました。アプリの中で型をもう一度確かめたいときは、zod で読み直せます。[zod の記事](/posts/zod-validate-llm-json-output)に手順があります。

## grade.ts で5件を採点し、人の点と比べる

採点する回答は、人が手で書いた5件の見本です。モデルが作った回答とは違い、正しい点を先に人が決めておけます。

```ts
import { readFileSync } from "node:fs";
import { judge } from "./judge.ts";

const rubric = readFileSync(process.argv[2] ?? "rubric.md", "utf8");

const question = "返品はいつまでできますか。";
const reference =
  "返品は商品の到着から30日以内に受け付けます。未開封の商品に限ります。返品の送料はお客様の負担です。";

const cases = [
  { id: "a", expected: 5, answer: "商品の到着から30日以内で、未開封のものに限り返品できます。" },
  { id: "b", expected: 4, answer: "商品の到着から30日以内なら返品できます。" },
  { id: "c", expected: 3, answer: "未開封の商品なら返品できます。" },
  {
    id: "d",
    expected: 2,
    answer: "到着から30日以内の未開封品なら返品できます。返金は5営業日以内に振り込みます。",
  },
  { id: "e", expected: 1, answer: "購入から2週間以内なら返品できます。" },
];

let agreed = 0;
let costUsd = 0;
for (const c of cases) {
  const input = `質問:\n${question}\n\n参考情報:\n${reference}\n\n採点する回答:\n${c.answer}`;
  const result = await judge(rubric, input);
  costUsd += result.costUsd;
  const ok = result.verdict.score === c.expected;
  if (ok) agreed++;
  console.log(
    `${c.id} 人=${c.expected} 判定=${result.verdict.score} ${ok ? "一致" : "不一致"} apiKeySource=${result.apiKeySource}`,
  );
  console.log(`  reason: ${result.verdict.reason}`);
}
console.log(`人の採点との一致: ${agreed}/${cases.length}`);
console.log(`total_cost_usd の合計（見積もり）: ${costUsd.toFixed(4)}`);
process.exitCode = agreed === cases.length ? 0 : 1;
```

`expected` は、`rubric.md` の規則で人が付けた点です。a から e まで、5点から1点を1件ずつ用意しました。判定が人の点と1件でも違えば、終了コード 1 で終わります。

`import` のパスの `.ts` は省けません（出典10）。`.ts` のファイルをそのまま `node` で動かせるのは、Node.js 22.18.0 以降です（出典10）。

```bash
node grade.ts rubric.md
```

```text
a 人=5 判定=5 一致 apiKeySource=none
  reason: 該当した規則: 5点。回答の「商品の到着から30日以内で、未開封のものに限り返品できます」は、参考情報の「商品の到着から30日以内に受け付けます。未開封の商品に限ります。」と一致しています。期限(30日)と未開封の条件の両方を正しく書いており、参考情報にない内容は含まれていません。送料の負担は書かれていませんが、採点規則では求められていないため減点の対象になりません。
b 人=4 判定=4 一致 apiKeySource=none
  reason: 当てはまる規則は4点です。回答の「商品の到着から30日以内なら返品できます。」は、参考情報の「商品の到着から30日以内に受け付けます」と期限が一致しており、1点（食い違い）にも、3点（期限の記載なし）にも当てはまりません。また、参考情報に無い事実も書いていないため2点にも当たりません。一方で、参考情報にある「未開封の商品に限ります」という条件が回答には含まれていないため、5点の条件（期限と未開封の条件の両方）を満たしません。よって4点です。
c 人=3 判定=3 一致 apiKeySource=none
  reason: 規則3が当てはまります。回答「未開封の商品なら返品できます。」は、参考情報にある「商品の到着から30日以内」という返品の期限を書いていません。規則1(食い違い)と規則2(参考情報に無い事実の記載)には当てはまらず、未開封の条件は正しく書かれているものの、期限が抜けているため規則4・5にも該当しません。規則は1から順に当てはめるので、点数は3です。
d 人=2 判定=2 一致 apiKeySource=none
  reason: 規則1（参考情報と食い違う記述）には当たりません。期限「到着から30日以内」と「未開封品」の条件はどちらも参考情報と一致しています。しかし規則2に当たります。回答の「返金は5営業日以内に振り込みます。」は、参考情報のどこにも書かれていない返金期間を事実として述べています。規則は上から順に当てはめるため、規則1に当たらない時点で、規則2に当たる本回答の点は2点になります。
e 人=1 判定=1 一致 apiKeySource=none
  reason: 規則1に該当します。参考情報では返品は「商品の到着から30日以内」ですが、回答は「購入から2週間以内なら返品できます」と書いており、期限の起算点と日数が参考情報と食い違っています。根拠となる文は「購入から2週間以内なら返品できます。」です。このため、規則2以降は確認せず1点としました。
人の採点との一致: 5/5
total_cost_usd の合計（見積もり）: 0.0026
```

5件とも、人の点と同じでした。どの `reason` も、当てはまった規則と根拠の文を挙げています。

`apiKeySource=none` は、API キーを使っていないという意味です（出典2）。`none` になるのは、claude.ai のログインのときに限りません（出典2）。bearer トークンで動いたときと、クラウド事業者経由で動いたときも `none` になります（出典2）。この値だけでは、プランで動いたとまでは言えません。プランで動いたと言える根拠は、前提の節の準備です。`ANTHROPIC_API_KEY` を外し、プランのアカウントで Claude Code にログインしました。

### 5回動かすと、点は同じで文面が変わる

同じコマンドをさらに4回動かしました。5回とも、5件の点は1回目と同じでした。違ったのは `reason` の文面です。a の理由の書き出しは、1回目が「該当した規則: 5点」、2回目が「規則5に当てはまります」でした。

判定を比べるなら、点の数字で比べます。`reason` の文字列は、人が読んで確かめるために残しておくものです。

## 人の点と食い違ったら、先に reason を読む

最初に書いた c の回答は、ログを残した6回のどれでも、人の点と食い違いました。ログを残していない通しの実行では、人の点と同じ3点の回も1回ありました。次の2行は、ログを残した1回目の出力にある c の行です。

```text
c 人=3 判定=2 不一致 apiKeySource=none
  reason: 規則1は当てはまりません。回答は参考情報と食い違うことを書いていません。規則2に当てはまります。回答の「返品はお問い合わせフォームから受け付けています」は、参考情報に書かれていないことを事実として述べています。規則は上から順に適用するため、規則2で2点としました。なお、返品の期限（到着から30日以内）も未開封の条件も書かれていないため、規則3の要素もありますが、先に当てはまる規則2が優先されます。
```

人は「期限を書いていないので3点」と付けていました。判定は2点で、理由は「お問い合わせフォーム」が参考情報に無いことです。

参考情報を読み直すと、判定のほうが規則に合っています。この回答は、規則2の「参考情報に書かれていないことを書いている」と、規則3の「期限を書いていない」の両方に当たります。規則を1点から順に当てはめれば、先に当たる規則2の2点です。

直したのは見本の回答のほうです。期限だけが抜けた回答に書き換えました。

```diff
-  { id: "c", expected: 3, answer: "返品はお問い合わせフォームから受け付けています。" },
+  { id: "c", expected: 3, answer: "未開封の商品なら返品できます。" },
```

書き換えたあとの出力は、上の5/5の結果です。c は3点と判定されました。

食い違いが出たら、採点基準を書き換える前に `reason` を読んでください。人の点のほうが規則を読み違えていることがあります。この5件では、1件がそうでした。

## 「1〜5で採点して」だけの基準では、5件中3件までしか合わない

規則の有無で点がどう変わるかを見るため、2行だけの採点基準でも同じ5件を採点しました。ファイル名は `rubric-vague.md` です。

```markdown
あなたは、カスタマーサポートの回答を採点する担当です。
回答の良さを1〜5の点で採点してください。
```

```bash
node grade.ts rubric-vague.md
```

どちらの基準も5回ずつ動かし、ログを残しました。出力は `reason` が長いので、判定の点だけを実行した順に次の表へ写しました。規則を書いた基準の1回目は、前の節の出力です。

| 回答 | 人の点 | 規則を書いた基準（5回） | 2行の基準（5回） |
|---|---|---|---|
| a | 5 | 5, 5, 5, 5, 5 | 5, 4, 5, 5, 5 |
| b | 4 | 4, 4, 4, 4, 4 | 3, 3, 3, 3, 3 |
| c | 3 | 3, 3, 3, 3, 3 | 2, 2, 2, 2, 2 |
| d | 2 | 2, 2, 2, 2, 2 | 3, 3, 3, 3, 3 |
| e | 1 | 1, 1, 1, 1, 1 | 1, 1, 1, 1, 1 |

2行の基準の出力の最後は、4回が「人の採点との一致: 2/5」、1回が「人の採点との一致: 1/5」でした。終了コードは5回とも 1 です。

一致の件数は、動かすたびに変わります。ログを残していない別の3回（同じ日、同じ SDK の版）では、2行の基準の一致は3回とも3件でした。この5件の見本で一致が4件以上になった回は、2行の基準では1回もありません。

`reason` を読むと、2行の基準のモデルは自分で観点を足しています。b の理由には「返品送料はお客様負担という情報も省略されています」とあり、送料が無いことも減点しました。質問は期限を聞いているだけなので、人の規則では送料を見ません。

d は、参考情報に無い返金の日数を書き足した回答です。ログを残した5回では、d はどれも3点で、期限が抜けただけの c の2点より上でした。ログを残していない3回で d が c より上になったのは、1回です。合わせて8回のうち6回で、根拠の無いことを書いた回答を、書かなかった回答より高く採点しました。

サポートの回答としては、この順番は逆です。採点基準を書かずに渡すと、この5件では、モデルが自分の考える良い回答に向けて点を付けました。何を見たいかは、規則に書いて渡すしかありません。

## 料金はプランの利用枠から引かれる

この記事のコードの実行は、読者自身の Claude プランの利用枠から引かれます（出典7）。Pro は月払いで月20ドルです（出典8）。

出力の `total_cost_usd の合計（見積もり）: 0.0026` は、SDK が定価で換算した見積もりです。型定義のコメントには「An estimate, not a billing statement」とあります（出典2）。プランで動かした分の請求額とは別の数字です。

API キーで使う場合、Haiku 5.5 は100万トークンあたり入力0.10ドル、出力0.50ドルです（出典12）。これはプロンプトが10万トークン以下のときの単価です（出典12）。

## 採点を任せる前に決めておくこと

Anthropic の例のコードには、回答を作ったモデルとは別のモデルで評価するのがよいという注記があります（出典1）。この記事の見本は人が書いたものなので、採点には Haiku 5.5 を使いました。

公式は、採点の前に考えさせるため、thinking を有効にしたモデルを勧めています（出典1）。この記事では thinking を指定せず、規則と根拠を `reason` に書かせました。thinking を有効にしたときに点が変わるかは、まだ確かめていません。

あなたのアプリの回答で、いま人が目で見て点を付けている観点はどれでしょうか。その観点は、1点から順に当てはめる規則に書き直せるでしょうか。

## 出典

本文の（出典n）は、この表の番号です。確認日は、どれもページを読んだ日です。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Define success criteria and build evaluations | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | 2026-11-10 |
| 2 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | 2026-11-10 |
| 3 | Modifying system prompts | https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts | 2026-11-10 |
| 4 | Quickstart (Agent SDK) | https://code.claude.com/docs/en/agent-sdk/quickstart | 2026-11-10 |
| 5 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | 2026-11-10 |
| 6 | Legal and compliance (Claude Code) | https://code.claude.com/docs/en/legal-and-compliance | 2026-11-10 |
| 7 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 2026-11-10 |
| 8 | Claude の料金プラン | https://claude.com/pricing | 2026-11-10 |
| 9 | Get structured output from agents | https://code.claude.com/docs/en/agent-sdk/structured-outputs | 2026-11-10 |
| 10 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | 2026-11-10 |
| 11 | @anthropic-ai/claude-agent-sdk（npm registry） | https://registry.npmjs.org/@anthropic-ai/claude-agent-sdk | 2026-11-10 |
| 12 | Pricing (Claude API) | https://platform.claude.com/docs/en/about-claude/pricing | 2026-11-10 |

講座の次の記事では、回答を作る前の段階にある検索の結果を、Recall@k と MRR で測ります。[次の記事](/posts/rag-retrieval-eval-recall-mrr)に進んでください。

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
