# sources: llm-json-parse-error-fix

取得は WebFetch で行った。アクセス日は出典1、2、5、6 が 2026-10-31、出典3と出典4が 2026-11-10（`refusal` と `model_context_window_exceeded` の扱いを足す修正のときに読み直した）。本文の（出典n）は原稿末尾の出典の表の番号で、frontmatter の `sources` と同じ順・同じ URL・同じアクセス日にしてある。

## 一次情報

| # | 題名 | URL | アクセス日 | 確かめた事実（ページの記述） | 根拠にした本文の文（行番号は原稿 350 行の版） |
|---|---|---|---|---|---|
| 1 | JSON.parse() - JavaScript \| MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse | 2026-10-31 | Exceptions 節「SyntaxError: Thrown if the string to parse is not valid JSON.」。同ページの例のエラーの文は `Unexpected token ] in JSON at position 13` の形で、Node.js 22.22.0 で出た文（`run/02.log`）と形が違う | 48行目「文字列が正しい JSON でないとき、`JSON.parse` は `SyntaxError` を投げます」 |
| 2 | Node.js v22 Modules: TypeScript | https://nodejs.org/docs/latest-v22.x/api/typescript.html | 2026-10-31 | 履歴の表で v22.18.0 に「Type stripping is enabled by default.」。本文「no type checking is performed」。`.ts` は `.js` と同じモジュールの規則に従い、近くの `package.json` に `"type": "module"` を足すと `import`/`export` が使える | 62行目（22.18.0 以上は型を取り除いて実行、型の検査はしない）、81行目（`"type": "module"` は `import` を使うための指定） |
| 3 | Stop reasons and fallback | https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons | 2026-11-10 | 「The `stop_reason` field is part of every successful Messages API response.」。Quick reference の表（7行）: `end_turn` は「Claude completed its response naturally.」「Use the response.」、`max_tokens` は「The response reached your `max_tokens` limit.」「Raise `max_tokens` or continue the response」、`refusal` は「Claude declined to respond.」「Read `stop_details` and retry on a fallback model.」、`model_context_window_exceeded` は「The response filled the model's context window.」「Treat the response as truncated.」。ほかに `stop_sequence`、`tool_use`、`pause_turn` の3行がある。「Use the response.」とあるのは `end_turn` の行だけ。応答の JSON の例に `content` の `{"type": "text", "text": ...}` と `stop_reason` がある | 40行目（途中で切れた出力なら `max_tokens` を上げる）、205行目（成功した応答には必ず `stop_reason`、`max_tokens` は上限で止まった、公式の案内は上げるか続きを生成）、207行目（`model_context_window_exceeded` も切れた応答として扱う、`refusal` は断ったときの値、そのまま使ってよいのは `end_turn` だけ）、209〜213行目の表、215行目（表に無い3つの値の名前）、217行目（見本の応答は公式の例の形を真似た） |
| 4 | Structured outputs | https://platform.claude.com/docs/en/build-with-claude/structured-outputs | 2026-11-10 | 「Structured outputs guarantee schema-compliant responses through constrained decoding」「Always valid: No more `JSON.parse()` errors」。Invalid outputs の節「Although structured outputs guarantee schema compliance in most cases, there are scenarios where the output might not match your schema」。Refusals の項「The response has `stop_reason: "refusal"`.」「The output might not match your schema because the refusal message takes precedence over schema constraints.」。Token limit reached の項「`stop_reason: "max_tokens"`」「The output might be incomplete and not match your schema.」「Retry with a higher `max_tokens` value」 | 207行目（`refusal` のときの出力はスキーマに合わないことがある）、302行目（JSON の外に文字を付けさせない Structured Outputs がある、`JSON.parse()` のエラーが無くなると説明）、304行目（`refusal` と `max_tokens` は保証の外、スキーマに合わないことがある、`max_tokens` のときは途中で切れていることもある） |
| 5 | Pricing | https://platform.claude.com/docs/en/about-claude/pricing | 2026-10-31 | モデル料金の表に「Claude Haiku 5.5 (for prompts up to 100,000 tokens)」Base input $0.10 / MTok、Output $0.50 / MTok。料金は入力と出力のトークンごと | 320行目（取り直すと新しいリクエストの入力と出力のトークンに料金、Haiku 5.5 の単価、10万トークン以下の条件） |
| 6 | RFC 8259 The JavaScript Object Notation (JSON) Data Interchange Format | https://www.rfc-editor.org/rfc/rfc8259 | 2026-10-31 | §2「A JSON text is a serialized value.」、文法「JSON-text = ws value ws」。ws は空白、タブ、改行、復帰 | 140行目「JSON のテキストは、前後の空白を除けば1つの値だけです」 |

## 実行ログを根拠にした文（出典の番号を付けていない文）

| 本文の文 | 根拠 |
|---|---|
| 50〜55行目の表のエラーの文、131〜136行目の実行結果 | `run/02.log`（Node.js v22.22.0） |
| 56行目（`extractJson` を通しても `Unexpected token` の後ろが空白を除いた出力の1文字目なら、JSON が1つも無い）、58行目「5つ目は、断りの文か説明の文だけが返った応答で、切り出す JSON がありません」 | `run/10.log` の `noJson`（`extractJson` が元の文字列をそのまま返し、`Unexpected token '申'`）と `leadingSpace`（先頭の空白と改行の後の「分」で `Unexpected token '分'`） |
| 138行目「Node.js はその後ろに、入力の先頭10文字と `is not valid JSON` を続けます」 | `run/06.log`（`"```json\n{""...`、`"分類結果は次のとおり"...` はどちらも10文字） |
| 140行目「`trailing` の position 39 は、「以上です」の「以」の位置です」 | `run/06.log`「trailing の「以」の位置: 39」 |
| 167行目「切り出す範囲が見つからないときは、元の文字列をそのまま返します」「表の5行目は、この場合に出るエラーです」 | `extract-json.ts` の `return text;`（原稿の154〜156行目）と、`run/10.log` の `元の文字列のまま=true`（`noJson`、`leadingSpace`） |
| 190〜195行目の実行結果、197行目 | `run/03.log` |
| 199行目（前の文の `{` で範囲がずれる） | `run/09.log`（`code/extra/edge-brace.ts`。切り出した範囲が説明の文の `{` から始まり、`Unexpected token '文'`） |
| 199行目（後ろの文の `]` で範囲が延び、`以上です（参考 [1]）` で終わる出力は `[1]` の `]` まで切り出され、`after JSON` のエラーが残る） | `run/10.log` の `trailingBracket`（切り出した範囲が `…\n以上です（参考 [1]` で終わり、`Unexpected non-whitespace character after JSON at position 39`） |
| 270〜272行目の実行結果、275行目 | `run/04.log` |
| 281行目、294〜296行目、298行目（閉じ括弧を足すと成功し、`summary` が途中で止まる） | `run/05.log` |
| 314行目（`position` は 0 から数えた位置、position 43 は文字列の長さと同じ） | `run/06.log`「trailing の「以」の位置: 39」（`indexOf` は 0 始まり）と「truncated の長さ: 43」 |
| 62行目「型は別に TypeScript 7.0.2 の `tsc` で確かめました」 | `run/07.log`（tsc 7.0.2、exit=0） |
| 318行目「API を呼ばないので無料」「npm からパッケージを入れる手順もありません」 | 記事のコードに import は自作のファイルだけ（`code/`）。`run/08.log`（ネットワークの無い環境で4つの `node` コマンドが exit=0、外への fetch は `EAI_AGAIN`） |

## 参考にしたが出典にしていないもの

- WebSearch（2026-10-31、「LLM JSON.parse エラー コードフェンス 途中で切れる」）の結果7件。英語のライブラリの説明、用語集、GitHub の issue で、一次情報に数えない。検索意図の参考としてだけ `brief.md` に書いた。

## 修正の記録（2026-11-10）

検証で指摘された次の5点を、出典3・出典4の読み直しと `run/10.log` の実行で確かめてから直した。

1. `readJson`、Structured Outputs の節、確認の箇条書きが `max_tokens` しか切れた応答として扱っていなかった。出典3の表は `model_context_window_exceeded` を「Treat the response as truncated.」とし、出典4は `refusal` の出力が「might not match your schema」としている。`readJson` を `end_turn` 以外をすべて例外にする形に直し、205〜215行目、304行目、326行目に書いた。
2. 診断の表が、JSON の無い出力（断りの文など）を「前に説明の文がある」の行に送っていた。`run/10.log` の `noJson` で `Unexpected token '申'` になることを確かめ、表に5行目を足した。
3. 後ろの文の `]` か `}` で切り出す範囲が延びることを書いていなかった。`run/10.log` の `trailingBracket` で確かめ、199行目に書いた。
4. 「元の文字列をそのまま返します」と書きながら、コードは `body.trim()` を返していた。コードを `return text;` に直し、`run/10.log` で `元の文字列のまま=true` を確かめた。
5. 表の直し方の列が、まだ名前の出ていない関数を「同じ関数」と呼んでいた。表の前（48行目）で `extractJson` を名前で示し、表の直し方の列にも名前を書いた。
