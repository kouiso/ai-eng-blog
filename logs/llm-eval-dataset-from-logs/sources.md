# sources: llm-eval-dataset-from-logs

アクセス日はすべて 2026-11-02。frontmatter の `sources` と、本文末尾の出典の表（番号も同じ）に同じ URL を入れた。

| # | 題名 | URL | 確かめたこと | 記事の根拠にした文 |
|---|---|---|---|---|
| 1 | Define success criteria and build evaluations | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | Eval design principles の 1 に "Be task-specific: Design evals that mirror your real-world task distribution. Don't forget to factor in edge cases!" とある | 「テストケースはログの質問の割合に合わせて選ぶ」の、実際のタスクの分布に合わせた評価を勧める文と、エッジケースを忘れないようにと書いている文 |
| 2 | JSON Lines | https://jsonlines.org/ | 3つの要件（UTF-8 Encoding、Each Line is a Valid JSON Value、Line Terminator is '\n'）。"a blank line is not"（空の行は値として認められない）。"It's a great format for log files."。"JSON Lines files may be saved with the file extension .jsonl."。"Including a line terminator after the last JSON value in a file is strongly recommended but not required. Including a line terminator after every JSON value makes generating and concatenating JSON Lines files easier." | 「見本のログ logs.jsonl は1行に1件の JSON」の定義、文字コード、区切り、拡張子、空の行、ログに向いた形式の文。「最後の行にも改行を付ける」の、強く勧めている文と、生成と連結が楽になる文 |
| 3 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | History の v22.18.0 に "Type stripping is enabled by default."。"Node.js will replace inline type annotations with whitespace, and no type checking is performed."。"To use import and export syntax, add "type": "module" to the nearest parent package.json." | 「動かした環境と作業フォルダ」の 22.18.0 から `.ts` を実行する文、型の検査をしない文、`"type": "module"` の文 |
| 4 | JSON.parse() - JavaScript MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse | Exceptions に "SyntaxError Thrown if the string to parse is not valid JSON." | 「切れた行は try と catch で1行だけとばす」の、読めない文字列で `SyntaxError` を投げる文 |
| 5 | String.prototype.normalize() - JavaScript MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize | NFKC は "Compatibility Decomposition, followed by Canonical Composition."。互換の正規化について "the normalization is appropriate for search ... But it may not be appropriate for display, because the visual representation is different." | 「重複は NFKC と空白の除去でそろえたキーで見分ける」の NFKC の定義の文と、検索には向くが表示には向かない場合があるという文 |
| 6 | Array.prototype.sort() - JavaScript MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort | "A negative value indicates that a should come before b."。"Since version 10 (or ECMAScript 2019), the specification dictates that Array.prototype.sort is stable." | 「どの1件を残すかは並べ替えの順で決まる」の、負の値で `a` が前に並ぶ文と、ECMAScript 2019 から安定ソートの文 |
| 7 | Math.random() - JavaScript MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random | "The implementation selects the initial seed to the random number generation algorithm; it cannot be chosen or reset by the user." | 同じ節の、乱数の種を利用者が指定できない文 |
| 8 | RFC 2606 Reserved Top Level DNS Names | https://www.rfc-editor.org/rfc/rfc2606.txt | 3章 "Reserved Example Second Level Domain Names" に example.com が挙がっている | 「見本のログ」の、`example.com` は例に使うために予約されたドメインという文 |
| 9 | RFC 8259 The JavaScript Object Notation (JSON) Data Interchange Format | https://www.rfc-editor.org/rfc/rfc8259.txt | 7章 Strings に "except for the characters that MUST be escaped: quotation mark, reverse solidus, and the control characters (U+0000 through U+001F)." | 「改行を含む回答も1行に収まる」の、制御文字はエスケープしなければならないという文 |
| 10 | Pricing | https://platform.claude.com/docs/en/about-claude/pricing | Model pricing の表に "Claude Haiku 5.5 (for prompts up to 100,000 tokens) ... $0.10 / MTok ... $0.50 / MTok"（Base input tokens、Output tokens） | 「料金がかかるのはモデルに回答を作らせる操作」の単価と、10万トークン以下の場合という条件の文 |
| 11 | wc（The Open Group Base Specifications Issue 8） | https://pubs.opengroup.org/onlinepubs/9799919799/utilities/wc.html | -l: "Write to the standard output the number of <newline> characters in each input file." | 「最後の行にも改行を付ける」の、`wc -l` は改行の数を出力するという文 |

## 出典ではなく実行ログを根拠にした文

| 記事の文 | 根拠 |
|---|---|
| 8行目が切れていても残りの15行は読み込めました | `run/02.log`（読めない行 8行目、読めたログ 15件） |
| `question` の欄が無い行で `mask` の中で `TypeError` になり、終了コード 1 で止まった | `run/09.log` |
| 全角の疑問符は半角の「?」に、全角の空白は半角の空白になった | `run/06.log` |
| 空白を1つにまとめるだけのキーでは13件、記事のキーで12件。別の質問どうしが同じキーになることはなかった | `run/06.log`（キーごとの件数）、`run/02.log`（12件）と `code/logs.jsonl` の12件の質問を目で比べた |
| 1、4、10行目の重複で10行目が残り、3行目と13行目で3行目が残る | `run/03.log`（`shipping-001` の `source_ts` が 2026-10-10、`refund-001` が 2026-10-03） |
| `payment` は割合どおりなら0.417件で0件になり、最低1件で合計6件 | `run/07.log`、`run/02.log` |
| 改行を `\n` の2文字で書き出す | `run/03.log`（`payment-001` の行） |
| 最後の改行を削ったファイルは 5 と出た | `run/08.log` |
| ネットワークの無い環境でも同じ結果 | `run/11.log` |
| 型の誤りが無い（TypeScript 7.0.2） | `run/10.log` |
| Node.js 22.22.0、npm 10.9.4、Linux x86_64 | `run/*.log` の見出し、`run/12.log` |
| 4ファイルで111行 | `wc -l` で `build-cases.ts` 77行、`check-cases.ts` 12行、`package.json` 6行、`logs.jsonl` 16行 |

## 調べたが記事に使わなかったもの

- Anthropic の同じページの "Writing hundreds of test cases can be hard to do by hand! Get Claude to help you generate more from a baseline set of example test cases."（Claude にテストケースを増やさせる話）。API を呼ぶ操作になり、この記事の範囲（ログから選ぶ）から外れるので使わなかった。
- MDN の Character class escape（`\s`）。全角の空白が `\s` に当たるかはページに文字の一覧が無く書かれていないので、記事では NFKC で半角になるという実行結果だけを書いた。
