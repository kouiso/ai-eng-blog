# sources: llm-eval-harness-fixtures

アクセス日はすべて 2026-11-02。取得は WebFetch で行った。本文の（出典n）は原稿末尾の出典の表の番号で、frontmatter の `sources` と同じ順・同じ URL・同じアクセス日にしてある。行番号は原稿 344 行の版。

## 一次情報

| # | 題名 | URL | 確かめた事実（ページの記述） | 根拠にした本文の文 |
|---|---|---|---|---|
| 1 | Define success criteria and build evaluations | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | 「When deciding which method to use to grade evals, choose the fastest, most reliable, most scalable method」。「Code-based grading: Fastest and most reliable, extremely scalable, but also lacks nuance for more complex judgments that require less rule-based rigidity.」。例として「Exact match: `output == golden_answer`」「String match: `key_phrase in output`」。完全一致の例の採点関数は `model_output.strip().lower() == correct_answer.lower()` で、空白と大文字小文字をそろえてから比べている | 70行目（コードでの採点は最も速く最も信頼できる、規則で割り切れない複雑な判断には向かない） |
| 2 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | 履歴の表で v22.18.0 に「Type stripping is enabled by default.」。「Node.js will replace inline type annotations with whitespace, and no type checking is performed.」。「To use `import` and `export` syntax, add `"type": "module"` to the nearest parent `package.json`.」。「the `type` keyword is necessary to correctly strip type imports. Without the `type` keyword, Node.js will treat the import as a value import, which will result in a runtime error.」 | 74行目（22.18.0 以上が要る）、76行目（型を取り除いて実行、型の検査はしない）、97行目（`"type": "module"` は `import` と `export` のため）、205行目（`type` が無いと値の読み込みとして扱い、実行時にエラー） |
| 3 | String.prototype.normalize() - JavaScript \| MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize | `"NFKC"` は「Compatibility Decomposition, followed by Canonical Composition.」。互換な列は「represent the same abstract characters, and should be treated alike in some — but not necessarily all — applications」。例は合字「ﬀ」と「ff」、丸囲みの「Ⓓ」と「D」 | 155行目（NFKC は、見た目が違っても同じ文字として扱ってよい文字を1つの形にそろえる） |
| 4 | String.prototype.includes() - JavaScript \| MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes | 戻り値「true if the search string is found anywhere within the given string」。「The `includes()` method is case sensitive.」 | 155行目（`includes` は大文字と小文字を区別する）、281行目（指定した語が回答のどこかに含まれていれば合格） |
| 5 | RegExp.prototype.test() - JavaScript \| MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test | 「When a regex has the global flag set, `test()` will advance the `lastIndex` of the regex.」「Further calls to `test(str)` will resume searching `str` starting from `lastIndex`.」 | 163行目（`g` フラグ付きは `test()` のたびに `lastIndex` が進む、続けて呼ぶとその位置から探す） |
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
| 163行目「同じ正規表現を使い回して同じ回答に3回かけると、手元では true、false、true と結果が入れ替わりました」 | `run/05.log`（`code/extra/gflag.ts`） |
| 247行目「手元で空の文字列を3つの採点関数に渡すと、どれも不合格でした」 | `run/06.log`（`code/extra/missing-answer.ts`） |
| 257〜267行目の実行結果、269行目「5件中3件が合格」「終了コードは 1」、273行目の不合格2件の中身 | `run/02.log` |
| 277行目「「2026-11-21」と答えても合格になります」 | `run/09.log`（`code/extra/format-only.ts`。2026-11-20 も 2026-11-21 も `pass: true`） |
| 297〜300行目の実行結果、302行目、304行目「一致しません」 | `run/03.log` |
| 308行目「外への通信が失敗する環境でも、`run-eval.ts` と `compare.ts` は同じ結果を出しました」 | `run/08.log`（`unshare -rn` の中で `fetch: failed EAI_AGAIN`、2つの出力は `run/02.log`、`run/03.log` と同じ） |

## 参考にしたが出典にしていないもの

- WebSearch（2026-11-02、「LLM 回答 自動採点 完全一致 部分一致 正規表現 評価 TypeScript」）の結果7件。評価ツールの説明ページと用語集で、この記事の断定の根拠にはしていない。検索意図の参考としてだけ `brief.md` に書いた。
