# sources: llm-eval-harness-fixtures

アクセス日は、2 と 5 が 2026-11-10、ほかは 2026-11-02。取得は WebFetch で行った。2 は 2026-11-02 に読み、2026-11-10 にも読み直して同じ記述を確かめた。5 は 2026-11-10 に読み直し、根拠にする記述を差し替えた（下の表）。本文の（出典n）は原稿末尾の出典の表の番号で、frontmatter の `sources` と同じ順・同じ URL・同じアクセス日にしてある。行番号は原稿 344 行の版（2026-11-10 に直した版。直した文はどれも元と同じ行に収めたので、行番号は 2026-11-02 の版と変わらない）。

## 一次情報

| # | 題名 | URL | 確かめた事実（ページの記述） | 根拠にした本文の文 |
|---|---|---|---|---|
| 1 | Define success criteria and build evaluations | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | 「When deciding which method to use to grade evals, choose the fastest, most reliable, most scalable method」。「Code-based grading: Fastest and most reliable, extremely scalable, but also lacks nuance for more complex judgments that require less rule-based rigidity.」。例として「Exact match: `output == golden_answer`」「String match: `key_phrase in output`」。完全一致の例の採点関数は `model_output.strip().lower() == correct_answer.lower()` で、空白と大文字小文字をそろえてから比べている | 70行目（コードでの採点は最も速く最も信頼できる、規則で割り切れない複雑な判断には向かない） |
| 2 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | 履歴の表で v22.18.0 に「Type stripping is enabled by default.」（v22.18.0 には「Type stripping no longer emits an experimental warning.」も並ぶ）。このページは v22 系の文書なので、23 系以降の版の条件は確かめていない。「Node.js will replace inline type annotations with whitespace, and no type checking is performed.」。「To use `import` and `export` syntax, add `"type": "module"` to the nearest parent `package.json`.」。「the `type` keyword is necessary to correctly strip type imports. Without the `type` keyword, Node.js will treat the import as a value import, which will result in a runtime error.」 | 74行目（22 系で `.ts` をそのまま実行するには 22.18.0 以降が要る。2026-11-02 の版の「22.18.0 以上」は 23 系以降まで含むと読めて、このページの範囲を超えていたので、2026-11-10 に 22 系に限った）、76行目（22 系は 22.18.0 から型を取り除いて実行、型の検査はしない）、97行目（`"type": "module"` は `import` と `export` のため）、205行目（`type` が無いと値の読み込みとして扱い、実行時にエラー） |
| 3 | String.prototype.normalize() - JavaScript \| MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize | `"NFKC"` は「Compatibility Decomposition, followed by Canonical Composition.」。互換な列は「represent the same abstract characters, and should be treated alike in some — but not necessarily all — applications」。例は合字「ﬀ」と「ff」、丸囲みの「Ⓓ」と「D」 | 155行目（NFKC は、見た目が違っても同じ文字として扱ってよい文字を1つの形にそろえる） |
| 4 | String.prototype.includes() - JavaScript \| MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes | 戻り値「true if the search string is found anywhere within the given string」。「The `includes()` method is case sensitive.」 | 155行目（`includes` は大文字と小文字を区別する）、281行目（指定した語が回答のどこかに含まれていれば合格） |
| 5 | RegExp.prototype.test() - JavaScript \| MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test | 戻り値「`true` if there is a match between the regular expression and the string `str`. Otherwise, `false`.」 | 163行目（`test()` は一致する箇所があれば true、無ければ false を返す）。2026-11-02 の版はこのページの `g` フラグと `lastIndex` の記述を根拠に「採点のたびに `new RegExp` で作る理由」を書いていたが、記事の `Grader` 型にフラグの欄は無く、`new RegExp(grader.pattern)` はフラグなしで作るので、記事のコードでは起きない話だった。2026-11-10 にその文を消し、根拠をこの戻り値の記述に替えた |
| 6 | Lookbehind assertion - JavaScript \| MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookbehind_assertion | 「The `(?<!pattern)` form negates the assertion — it succeeds if the `pattern` does not match the input immediately to the left of the current position.」 | 304行目（`(?<!\d)` は否定の後読みで、すぐ左が数字でないときだけ一致） |
| 7 | Input boundary assertion - JavaScript \| MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion | 「`^` asserts that the current position is the start of input. `$` asserts that the current position is the end of input.」（`m` フラグが無いとき） | 277行目（`^` で先頭、`$` で末尾を指定） |
| 8 | Node.js v22 Process | https://nodejs.org/docs/latest-v22.x/api/process.html | `process.exitCode` は「A number which will be the process exit code, when the process either exits gracefully, or is exited via `process.exit()` without specifying a code.」 | 249行目（`process.exitCode` の値が正常終了時の終了コードになる） |
| 9 | Setting exit codes for actions - GitHub Docs | https://docs.github.com/en/actions/how-tos/create-and-publish-actions/set-exit-codes | 表で、終了コード 0 は check run の `success`、「Any other exit code indicates the action failed.」で `failure` | 269行目（GitHub Actions のアクションは 0 以外の終了コードを失敗として扱う）。アクションについてのページなので、本文も「アクションは」と書き、ワークフローの `run` のステップ一般には広げていない |
| 10 | Pricing | https://platform.claude.com/docs/en/about-claude/pricing | モデル料金の表に「Claude Haiku 5.5 (for prompts up to 100,000 tokens)」Base input $0.10 / MTok、Output $0.50 / MTok。10万トークン超の行は別の単価（入力 $0.50、出力 $2.50） | 310行目（Haiku 5.5 の単価、10万トークン以下の条件） |

## 実行ログを根拠にした文（出典の番号を付けていない文）

| 本文の文 | 根拠 |
|---|---|
| 56行目「書き写すコードは6ファイルで102行、依存パッケージはありません」 | `code/` の6ファイルを `wc -l` で数えて合計102行。`package.json` に `dependencies` が無い |
| 74行目「動かしたのは Node.js 22.22.0 と npm 10.9.4 で、OS は Linux（x86_64）」 | `run/*.log` の見出し `node: v22.22.0 / npm: 10.9.4`。`run/10.log`（`uname -sm` の出力 `Linux x86_64`） |
| 76行目「TypeScript 7.0.2 の `tsc` でも型の誤りが無い」 | `run/07.log`（`Version 7.0.2`、`tsc: no errors`、exit=0） |
| 155行目「全角の「３０日」は「30日」になりました」「`normalize` を通さずに比べると、見本の回答の「Negative」も「３０日」も不合格になりました」 | `run/04.log`（`"Negative" === "negative": false`、`refund の回答 includes("30日"): false`、`"３０日".normalize("NFKC"): 30日`） |
| 247行目「回答が引用符でくくられ、中の改行は `\n` と表示されます」「どこまでが回答かを1行で読める」 | `run/11.log`（`code/extra/stringify.ts`。`run-eval.ts` と同じ書き方で、改行を含む回答が `"neutral です。\n以上です。"` と1行に出た） |
| 247行目「手元で空の文字列を3つの方法のどれで採点しても、不合格でした」 | `run/06.log`（`code/extra/missing-answer.ts`） |
| 257〜267行目の実行結果、269行目「5件中3件が合格」「終了コードは 1」、273行目の不合格2件の中身 | `run/02.log` |
| 277行目「前後の空白と改行は取り除かれ、全角の数字は半角になります」「手元では「 2026-11-20」も「２０２６-１１-２０」も合格でした」「日付の後ろに句点を付けた回答は、不合格です」 | `run/05.log`（`code/extra/boundary.ts`。`" 2026-11-20"`、`"2026-11-20\n"`、`"２０２６-１１-２０"` が true、`"2026-11-20。"` が false）。取り除くのは `graders.ts` の `normalize`（`trim()` と NFKC）。2026-11-02 の版の「日付の前後に1文字でも付けば不合格です」は、この結果と合わないので直した |
| 277行目「「2026-11-21」と答えても合格になります」 | `run/09.log`（`code/extra/format-only.ts`。2026-11-20 も 2026-11-21 も `pass: true`） |
| 297〜300行目の実行結果、302行目、304行目「一致しません」 | `run/03.log` |
| 308行目「外への通信が失敗する環境でも、`run-eval.ts` と `compare.ts` は同じ結果を出しました」 | `run/08.log`（`unshare -rn` の中で `fetch: failed EAI_AGAIN`、2つの出力は `run/02.log`、`run/03.log` と同じ） |

## 参考にしたが出典にしていないもの

- WebSearch（2026-11-02、「LLM 回答 自動採点 完全一致 部分一致 正規表現 評価 TypeScript」）の結果7件。評価ツールの説明ページと用語集で、この記事の断定の根拠にはしていない。検索意図の参考としてだけ `brief.md` に書いた。
