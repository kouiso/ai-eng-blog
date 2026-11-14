---
title: "LLM 評価用のテストケースを作る【ログから選んで JSONL にする】"
slug: "llm-eval-dataset-from-logs"
description: "ログから LLM 評価用のテストケースを選び、JSONL に書き出すスクリプトを TypeScript で作ります。重複した質問をまとめ、カテゴリの割合に合わせて件数を決めます。スクリプトはモデルを呼ばないので、API キーは要りません。"
tags: ["LLM 評価", "TypeScript"]
main_keyword: "LLM 評価"
target_query: "llm テストケース作成"
course_step: 6
prev: "promptfoo-llm-eval-intro"
next: null
sources:
  - url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"
    title: "Define success criteria and build evaluations"
    accessed: 2026-11-02
  - url: "https://jsonlines.org/"
    title: "JSON Lines"
    accessed: 2026-11-02
  - url: "https://nodejs.org/docs/latest-v22.x/api/typescript.html"
    title: "Node.js v22 Modules: TypeScript"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse"
    title: "JSON.parse() - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize"
    title: "String.prototype.normalize() - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort"
    title: "Array.prototype.sort() - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random"
    title: "Math.random() - JavaScript | MDN"
    accessed: 2026-11-02
  - url: "https://www.rfc-editor.org/rfc/rfc2606.txt"
    title: "RFC 2606 Reserved Top Level DNS Names"
    accessed: 2026-11-02
  - url: "https://www.rfc-editor.org/rfc/rfc8259.txt"
    title: "RFC 8259 The JavaScript Object Notation (JSON) Data Interchange Format"
    accessed: 2026-11-02
  - url: "https://platform.claude.com/docs/en/about-claude/pricing"
    title: "Pricing"
    accessed: 2026-11-02
  - url: "https://pubs.opengroup.org/onlinepubs/9799919799/utilities/wc.html"
    title: "wc (The Open Group Base Specifications Issue 8)"
    accessed: 2026-11-02
cost_estimate: "記事のコードは API を呼ばないので無料です。書き出したテストケースでモデルに回答を作らせると、その分の API の料金がかかります。"
run_environment: "Node.js 22.22.0、npm 10.9.4、依存パッケージなし、Linux x86_64（型の確認は TypeScript 7.0.2）"
verified_at: "2026-11-10"
ai_assisted: true
needs_api_key: false
status: draft
publish_at: null
updated: 2026-11-11
---

評価用のテストケースをログから手で写すと、同じ質問が何度も入り、問い合わせの多いカテゴリばかりが並びます。作るのは、ログの JSONL から重複した質問を除いてテストケースを選ぶ TypeScript のスクリプトです。件数はカテゴリの割合に合わせて決め、結果は `cases.jsonl` に書き出します。同じログからは何度実行しても同じテストケースが選ばれるので、Git で差分を見られます。

読み込むのは、通販サイトの問い合わせ窓口を想定して手で作ったログの見本です。実際のアプリのログでも、モデルの出力でもありません。スクリプトはモデルを呼ばないので、API キーは要りません。

対象は、LLM を組み込んだアプリを動かし始めて、評価に使う質問を集めたくなった人です。書き写すのは4ファイルで111行、依存パッケージはありません。

講座の[前の記事](/posts/promptfoo-llm-eval-intro)を読まなくても、コードは動きます。

## テストケースはログの質問の割合に合わせて選ぶ

テストケースの質問は、実際にアプリへ届いた質問から選ぶのがいちばん確実です。Anthropic の評価の作り方のページが勧めるのも、実際のタスクの分布に合わせた評価です（出典1）。同じ箇所で、端のケース（エッジケース）も忘れないようにと書いています（出典1）。

ログをそのまま全件使うと、件数が多すぎるうえに同じ質問が重なるのが難点です。そこでスクリプトは、ログを次の順に処理します。

1. 1行ずつ JSON として読み、読めない行はとばす
2. フィードバックが `bad` のログを先に、同じ扱いなら新しいログを先に並べる
3. 表記の揺れをそろえたキーで、重複した質問を1件にまとめる
4. カテゴリごとの件数を、全体の割合に合わせて決める（どのカテゴリも最低1件）
5. メールアドレスを伏せて、`cases.jsonl` に書き出す

`bad` のログを先に並べるのは、ユーザーが不満を示した質問ほど、テストケースとして残す価値が高いと判断したからです。

## 動かした環境と作業フォルダ

動かしたのは Node.js 22.22.0 と npm 10.9.4 で、OS は Linux（x86_64）です。Node.js は 22.18.0 から、型の記述を取り除いて `.ts` のファイルをそのまま実行します（出典3）。型の検査はしません（出典3）。そのため、TypeScript 7.0.2 の `tsc` でも型の誤りが無いことを確かめました。

作業フォルダ `eval-dataset` を作って移ります。

```bash
mkdir eval-dataset
cd eval-dataset
```

`package.json` を置きます。`"type": "module"` は、`.ts` のファイルで `import` を使うための指定です（出典3）。

```json
{
  "name": "eval-dataset",
  "version": "0.1.0",
  "private": true,
  "type": "module"
}
```

## 見本のログ logs.jsonl は1行に1件の JSON

JSON Lines（JSONL）は、1行に1つの JSON の値を書く形式です（出典2）。文字コードは UTF-8、行の区切りは `\n` と決まっていて、拡張子には `.jsonl` が使えます（出典2）。空の行は JSON の値として認められていません（出典2）。

公式のページは、JSONL をログのファイルに向いた形式だと紹介しています（出典2）。ファイルの末尾へ1行を足せば1件を書き足せるのが、この形式の手軽さです。

`logs.jsonl` を置きます。1行が問い合わせ1件です。`feedback` は、ユーザーが回答に付けたフィードバック（`good`、`bad`、無しの `null`）です。

```json
{"ts":"2026-10-01T09:00:00+09:00","category":"shipping","question":"注文した商品はいつ届きますか？","answer":"通常は注文の翌日から3日以内に発送します。","feedback":"good"}
{"ts":"2026-10-02T09:00:00+09:00","category":"shipping","question":"配送先の住所を注文後に変えられますか？","answer":"発送前ならマイページから変更できます。","feedback":null}
{"ts":"2026-10-03T09:00:00+09:00","category":"refund","question":"返品は何日以内ならできますか？","answer":"購入から14日以内です。","feedback":"bad"}
{"ts":"2026-10-04T09:00:00+09:00","category":"shipping","question":"注文した商品はいつ届きますか?","answer":"注文から3日以内に発送します。","feedback":null}
{"ts":"2026-10-05T09:00:00+09:00","category":"account","question":"パスワードを忘れました。","answer":"ログイン画面の「パスワードを忘れた方」から再設定できます。","feedback":"good"}
{"ts":"2026-10-06T09:00:00+09:00","category":"shipping","question":"海外にも発送できますか？","answer":"現在は国内のみ発送しています。","feedback":null}
{"ts":"2026-10-07T09:00:00+09:00","category":"payment","question":"支払い方法を教えてください。","answer":"クレジットカード、コンビニ払い、代金引換が使えます。\n代金引換の手数料は330円です。","feedback":"good"}
{"ts":"2026-10-08T09:00:00+09:00","category":"shipping","question":"送料はいくらですか
{"ts":"2026-10-09T09:00:00+09:00","category":"refund","question":"返品の送料は誰が負担しますか？","answer":"不良品の場合は当店が負担します。","feedback":null}
{"ts":"2026-10-10T09:00:00+09:00","category":"shipping","question":"  注文した商品は　いつ届きますか？ ","answer":"在庫があれば当日に発送します。","feedback":"bad"}
{"ts":"2026-10-11T09:00:00+09:00","category":"account","question":"登録したメールアドレス taro@example.com を変更したいです。","answer":"マイページの「登録情報」から変更できます。","feedback":null}
{"ts":"2026-10-12T09:00:00+09:00","category":"shipping","question":"置き配はできますか？","answer":"できます。注文時に置き場所を指定してください。","feedback":"good"}
{"ts":"2026-10-13T09:00:00+09:00","category":"refund","question":"返品は何日以内ならできますか？","answer":"購入から30日以内です。","feedback":null}
{"ts":"2026-10-14T09:00:00+09:00","category":"shipping","question":"配達の時間帯を指定できますか？","answer":"午前、14〜16時、16〜18時、18〜21時から選べます。","feedback":null}
{"ts":"2026-10-15T09:00:00+09:00","category":"refund","question":"届いた商品が壊れていました。交換できますか？","answer":"交換できます。注文番号を添えてお問い合わせください。","feedback":null}
{"ts":"2026-10-16T09:00:00+09:00","category":"shipping","question":"注文をキャンセルしたら送料はかかりますか？","answer":"発送前のキャンセルなら送料はかかりません。","feedback":null}
```

見本には、テストケースを作るときに扱いに困る行を4種類混ぜました。

- 8行目は、書き込みの途中で切れた行です
- 1、4、10行目は同じ質問で、疑問符の全角と半角、空白の入り方だけが違います。3行目と13行目は、文字まで同じ質問です
- 11行目の質問には、メールアドレスが入っています
- 7行目の回答は2行で、改行を `\n` で書いています

メールアドレスのドメインの `example.com` は、例に使うために予約されたドメインです（出典8）。

## build-cases.ts はログを読んでテストケースを選ぶ

`build-cases.ts` を置きます。上に挙げた5つの処理を、この順に書いたファイルです。

```ts
import { readFileSync, writeFileSync } from "node:fs";

type LogRecord = {
  ts: string;
  category: string;
  question: string;
  answer: string;
  feedback: "good" | "bad" | null;
};

type EvalCase = {
  id: string;
  category: string;
  question: string;
  logged_answer: string;
  feedback: LogRecord["feedback"];
  source_ts: string;
};

const TOTAL = 5;
const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;

const mask = (text: string) => text.replace(EMAIL, "<email>");
const dedupKey = (text: string) =>
  text.normalize("NFKC").replace(/\s+/g, "").toLowerCase();

const records: LogRecord[] = [];
const lines = readFileSync("logs.jsonl", "utf8").split("\n");
lines.forEach((line, i) => {
  if (line.trim() === "") return;
  try {
    records.push(JSON.parse(line));
  } catch {
    console.log(`読めない行をとばしました: ${i + 1}行目`);
  }
});

// feedback が bad のログを先に、同じ扱いなら新しいログを先に並べる
records.sort(
  (a, b) =>
    Number(b.feedback === "bad") - Number(a.feedback === "bad") ||
    b.ts.localeCompare(a.ts),
);

const seen = new Set<string>();
const unique = records.filter((r) => {
  const key = dedupKey(mask(r.question));
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
console.log(`読めたログ ${records.length}件、重複を除いて ${unique.length}件`);

const byCategory = new Map<string, LogRecord[]>();
for (const r of unique) {
  byCategory.set(r.category, [...(byCategory.get(r.category) ?? []), r]);
}

const cases: EvalCase[] = [];
for (const [category, items] of byCategory) {
  const quota = Math.max(1, Math.round((TOTAL * items.length) / unique.length));
  const picked = items.slice(0, quota);
  console.log(`${category}: ${items.length}件から ${picked.length}件`);
  picked.forEach((r, i) => {
    cases.push({
      id: `${category}-${String(i + 1).padStart(3, "0")}`,
      category,
      question: mask(r.question),
      logged_answer: mask(r.answer),
      feedback: r.feedback,
      source_ts: r.ts,
    });
  });
}

writeFileSync("cases.jsonl", cases.map((c) => JSON.stringify(c)).join("\n") + "\n");
console.log(`cases.jsonl に ${cases.length}件を書き出しました`);
```

### 切れた行は try と catch で1行だけとばす

`JSON.parse` は、読めない文字列を渡されると `SyntaxError` を投げます（出典4）。1行ずつ `try` で囲んでいるので、8行目が切れていても残りの15行は読み込めました。

ファイル全体を1つの JSON の配列で持っていたら、閉じかっこが1つ欠けただけで全件が読めなくなります。ログを JSONL で書く利点は、壊れた範囲が1行で済むところです。

ただし `try` でとばせるのは、JSON として読めない行だけです。`question` の欄が無い行は JSON としては正しいので、そのまま読み込まれます。手元で試すと、`mask` の中で `TypeError` になり、スクリプトは終了コード 1 で止まりました。欄と型の検証は[zod の記事](/posts/zod-validate-llm-json-output)にあります。

### 重複は NFKC と空白の除去でそろえたキーで見分ける

重複の判定に使うのは、`dedupKey` で作ったキーです。`dedupKey` は、Unicode の NFKC 正規化をかけ、空白をすべて取り除き、英字を小文字にします。

NFKC は、互換分解のあとに正準合成をする正規化です（出典5）。手元で確かめると、全角の疑問符は半角の「?」に、全角の空白は半角の空白になりました。

最初に書いたキーは、空白を取り除かずに1つにまとめるだけでした。その形では、10行目の「商品は　いつ」と1行目の「商品はいつ」が別の質問になります。重複を除いた件数も、12件のはずが13件でした。見本の質問で試すと、空白をすべて取り除いても、別の質問どうしが同じキーになることはありませんでした。そこで、キーからは空白をすべて取り除いています。

書き出すのは、キーではなく元の質問の文字列です。MDN は、互換の正規化をかけた文字列は検索には向くものの、表示には向かない場合があると書いています（出典5）。ユーザーが打った空白も入力の一部なので、テストケースにはそのまま残しました。

### どの1件を残すかは並べ替えの順で決まる

重複した質問のうち残るのは、並べ替えたあとで最初に出てくる1件です。並べ替えでは、`feedback` が `bad` のログを先に、同じ扱いなら `ts` の新しいログを先に置きます。比較の関数が負の値を返すと、`a` が `b` より前に並ぶ決まりです（出典6）。

1、4、10行目の重複で残るのは、`bad` の付いた10行目です。3行目と13行目では、新しいのは13行目でも、`bad` の付いた3行目が先に並んで残ります。見本の店では返品の期限を30日としているので、取り違えた回答の3行目を残すほうが評価には役立ちます。

選び方に `Math.random` を使わなかったのは、乱数の種を利用者が指定できないからです（出典7）。乱数で選ぶと、同じログから実行するたびに違うテストケースができ、前回との差分を Git で追えません。`Array.prototype.sort` は ECMAScript 2019 から安定ソートです（出典6）。比較の結果が同じ2件は、元の順のまま並びます。

### 件数はカテゴリの割合で配り、どのカテゴリも最低1件にする

重複を除いた12件のうち、`shipping` は6件、`refund` は3件です。`account` は2件、`payment` は1件でした。目標の件数 `TOTAL` は5件にしました。各カテゴリの件数は、5件を件数の割合で配って四捨五入した値です。

割合どおりに配ると、`payment` は0.417件で、四捨五入すると0件になります。そのまま使えば、支払いについての質問がテストケースから消えます。件数の少ないカテゴリほど、割合で配ったときに0件になりやすいのです。そこで `Math.max(1, …)` で、どのカテゴリにも最低1件を残しました。

代わりに、合計は目標の5件を1件超えて6件になります。最低1件の分だけ合計が増えるのは、この配り方を選んだ代償です。目標の件数を守ることと、どのカテゴリも残すことのどちらを優先するかは、ログの内訳しだいで変わります。

### メールアドレスは書き出す前に伏せる

`mask` は、メールアドレスの形をした部分を `<email>` に置き換えます。Git で差分を見る運用ではテストケースのファイルがリポジトリに入るので、書き出す前に伏せる作りにしました。

この正規表現が見つけるのは、メールアドレスの形をした文字列だけです。氏名、住所、電話番号は、そのまま書き出されます。自分のアプリのログで使うときは、書き出した `cases.jsonl` を目でも確かめてください。

## 書き出した cases.jsonl は6件になる

スクリプトを実行します。

```bash
node build-cases.ts
```

```text
読めない行をとばしました: 8行目
読めたログ 15件、重複を除いて 12件
shipping: 6件から 3件
refund: 3件から 1件
account: 2件から 1件
payment: 1件から 1件
cases.jsonl に 6件を書き出しました
```

16行のうち、読めたのは15件です。重複を除くと12件になり、そこから6件を選びました。書き出したファイルの中身を表示します。

```bash
cat cases.jsonl
```

```text
{"id":"shipping-001","category":"shipping","question":"  注文した商品は　いつ届きますか？ ","logged_answer":"在庫があれば当日に発送します。","feedback":"bad","source_ts":"2026-10-10T09:00:00+09:00"}
{"id":"shipping-002","category":"shipping","question":"注文をキャンセルしたら送料はかかりますか？","logged_answer":"発送前のキャンセルなら送料はかかりません。","feedback":null,"source_ts":"2026-10-16T09:00:00+09:00"}
{"id":"shipping-003","category":"shipping","question":"配達の時間帯を指定できますか？","logged_answer":"午前、14〜16時、16〜18時、18〜21時から選べます。","feedback":null,"source_ts":"2026-10-14T09:00:00+09:00"}
{"id":"refund-001","category":"refund","question":"返品は何日以内ならできますか？","logged_answer":"購入から14日以内です。","feedback":"bad","source_ts":"2026-10-03T09:00:00+09:00"}
{"id":"account-001","category":"account","question":"登録したメールアドレス <email> を変更したいです。","logged_answer":"マイページの「登録情報」から変更できます。","feedback":null,"source_ts":"2026-10-11T09:00:00+09:00"}
{"id":"payment-001","category":"payment","question":"支払い方法を教えてください。","logged_answer":"クレジットカード、コンビニ払い、代金引換が使えます。\n代金引換の手数料は330円です。","feedback":"good","source_ts":"2026-10-07T09:00:00+09:00"}
```

`source_ts` には、元のログの日時を残しました。テストケースが不合格になったとき、どの問い合わせから来た質問かをログでたどるためです。

### 改行を含む回答も1行に収まる

`payment-001` の回答は2行の文章ですが、ファイルの中では1行です。JSON の文字列の中では、改行などの制御文字はエスケープしなければならないと決まっています（出典9）。`JSON.stringify` も改行を `\n` の2文字で書き出すので、1件が2行に分かれることはありません。

読み返して、1行ずつ JSON として読めるかを確かめる `check-cases.ts` を置きます。

```ts
import { readFileSync } from "node:fs";

const text = readFileSync("cases.jsonl", "utf8");
const lines = text.split("\n").filter((line) => line !== "");
const cases = lines.map((line) => JSON.parse(line));
const ids = new Set(cases.map((c) => c.id));

console.log(`${lines.length}行、${cases.length}件、id の重複 ${cases.length - ids.size}件`);
console.log(`ファイルの末尾が改行: ${text.endsWith("\n")}`);
for (const c of cases) {
  console.log(`${c.id} [${c.feedback ?? "-"}] ${c.question}`);
}
```

```bash
node check-cases.ts
```

```text
6行、6件、id の重複 0件
ファイルの末尾が改行: true
shipping-001 [bad]   注文した商品は　いつ届きますか？ 
shipping-002 [-] 注文をキャンセルしたら送料はかかりますか？
shipping-003 [-] 配達の時間帯を指定できますか？
refund-001 [bad] 返品は何日以内ならできますか？
account-001 [-] 登録したメールアドレス <email> を変更したいです。
payment-001 [good] 支払い方法を教えてください。
```

6行がすべて JSON として読め、id の重複もありません。

### 最後の行にも改行を付ける

`build-cases.ts` は、最後の1件のあとにも `\n` を書く作りです。JSON Lines のページは、最後の値のあとにも行の区切りを入れることを強く勧めています（出典2）。値ごとに区切りを入れておくと、ファイルの生成と連結が楽になるというのが、そのページの説明です（出典2）。

行数を数える `wc -l` は、ファイルの中の改行の数を出力します（出典11）。

```bash
wc -l cases.jsonl
```

```text
6 cases.jsonl
```

手元で最後の改行だけを削ったファイルを数えると、6件あるのに5と出ました。件数を `wc -l` で確かめる運用にするなら、最後の改行は欠かせません。

## 期待する答えは人が書き足す

書き出したテストケースには、まだ期待する答えがありません。`logged_answer` は、そのときアプリが返した回答で、正しいとは限らないからです。

その例が `refund-001` で、ログの回答は「購入から14日以内です」でした。ユーザーはこの回答に `bad` を付けています。同じ質問の13行目の回答は30日です。`logged_answer` をそのまま期待する答えにすると、間違えた回答を正解として採点することになります。

期待する答えは、テストケースを1件ずつ読んで人が決めてください。採点の方法の選び方は、[採点の記事](/posts/llm-eval-harness-fixtures)にあります。あちらの採点の指定は、文字列と配列でできた値です。そのため `cases.jsonl` の各行に足しても、JSONL のまま持てる形です。

RAG の検索の評価には、質問ごとに正解の文書の id も要ります。見本のログには文書を指す欄が無いので、質問と正解の文書の組はこの手順では作れません。測り方は[RAG の評価の記事](/posts/rag-retrieval-eval-recall-mrr)で扱います。

## 料金がかかるのはモデルに回答を作らせる操作

この記事のコードは API を呼ばないので、料金はかかりません。ネットワークの無い環境でも、2つのスクリプトは同じ結果を出しました。

料金がかかるのは、書き出したテストケースでモデルに回答を作らせる操作です。テストケース1件につき、モデルへのリクエストが1回増えます。Claude Haiku 5.5 は、100万トークンで入力 0.10 ドル、出力 0.50 ドルです（出典10）。この単価は、プロンプトが10万トークン以下の場合です（出典10）。この記事ではモデルを呼んでいないので、1件あたりの金額は計っていません。

## 自分のログで使う前に確かめること

自分のアプリのログで動かす前に、次の5つをすべて確かめてください。

- ログの1行に、日時、カテゴリ、質問、回答、フィードバックの5つの欄がある
- `ts` の書式とタイムゾーンが全件でそろっている（新しい順を文字列の比較で決めるため）
- 重複を見分けるキーが、自分のログの表記の揺れ（全角と半角、空白）をそろえている
- 書き出した `cases.jsonl` に、氏名と電話番号が1つも残っていない
- 期待する答えを、`logged_answer` を写さずに人が1件ずつ決めた

目標の件数 `TOTAL` の5件は、この記事の見本に合わせて決めた値です。自分のアプリでは、テストケースが何件までなら、変更のたびに評価の終わりを待てるでしょうか。

入門ステップ講座は、この記事で終わりです。

## 出典

確認日は、どれも 2026-11-02 です。本文の（出典1）などの番号は、この表の番号を指します。

| # | 題名 | URL | 確認日 |
|---|---|---|---|
| 1 | Define success criteria and build evaluations | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | 2026-11-02 |
| 2 | JSON Lines | https://jsonlines.org/ | 2026-11-02 |
| 3 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | 2026-11-02 |
| 4 | JSON.parse()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse | 2026-11-02 |
| 5 | String.prototype.normalize()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize | 2026-11-02 |
| 6 | Array.prototype.sort()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort | 2026-11-02 |
| 7 | Math.random()（MDN） | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random | 2026-11-02 |
| 8 | RFC 2606 Reserved Top Level DNS Names | https://www.rfc-editor.org/rfc/rfc2606.txt | 2026-11-02 |
| 9 | RFC 8259（JSON） | https://www.rfc-editor.org/rfc/rfc8259.txt | 2026-11-02 |
| 10 | Pricing | https://platform.claude.com/docs/en/about-claude/pricing | 2026-11-02 |
| 11 | wc（The Open Group Base Specifications Issue 8） | https://pubs.opengroup.org/onlinepubs/9799919799/utilities/wc.html | 2026-11-02 |

AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。
