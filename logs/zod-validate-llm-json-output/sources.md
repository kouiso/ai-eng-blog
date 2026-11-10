# sources: zod-validate-llm-json-output

番号は記事の「出典」の表（470〜480行目）と同じ。アクセス日は 2026-10-31、ただし 3 と 7 は 2026-11-10 に読み直した（下の「2026-11-10 の読み直し」）。frontmatter の `sources` も同じ9件（並びも同じ、3 と 7 の `accessed` は 2026-11-10）。行番号は 482行の原稿。

取得の方法:

- 1〜4（zod.dev）は HTML のページが HTTP 200 で取れることを確かめたうえで、同じ内容の原稿をタグ `v4.6.7` の raw ファイル（`https://raw.githubusercontent.com/colinhacks/zod/v4.6.7/packages/docs/content/<page>.mdx`）で読んだ。zod.dev は main ブランチの原稿を出している。main と v4.6.7 の原稿を比べると、`error-formatting.mdx`、`error-customization.mdx` は同じで、`basics.mdx` は main に `.validate()` の段落が1つ足されているだけだった（記事はこの段落を使っていない）。
- 5 は GitHub の blob のページがこの環境から 403 だったので、同じタグの raw ファイル（`https://raw.githubusercontent.com/colinhacks/zod/v4.6.7/packages/zod/src/v4/core/errors.ts`、HTTP 200）を読んだ。タグ `v4.6.7` が存在することは `git ls-remote --tags` で確かめた（コミット b500a2ee）。
- 6 は npm のページが 403 だったので、`npm view zod version`（4.6.7）、`npm view zod dist-tags`（latest: 4.6.7）、`npm view zod@4.6.7 license`（MIT）で確かめた。タグ `v4.6.7` の `LICENSE` も MIT License だった。
- 7 と 9 は `https://platform.claude.com/docs/en/<path>.md`（同じページの Markdown 版）を curl で取得して読んだ。HTML のページも HTTP 200。
- 8 は HTML を取得して読んだ。

## 2026-11-10 の読み直し

レビューで、記事が出典7の2点（enum の大文字小文字を区別せずに比べる勧めと、SDK のヘルパーが外した制約を応答で確かめること）を本文に生かしていないと指摘された。直すために 3 と 7 を読み直した。

- 7: `https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md` を curl で取得（HTTP 200、2863行）。HTML のページも HTTP 200。2026-10-31 に確かめた事実（Not supported の Numerical constraints と String constraints、Why use structured outputs の Missing required fields と Inconsistent data types、How SDK transformation works、max_tokens、Enum value casing）が同じ文面で残っていることも確かめた。
- 3: `https://raw.githubusercontent.com/colinhacks/zod/v4.6.7/packages/docs/content/api.mdx` と main の同じファイルを取得（どちらも HTTP 200）。zod.dev/api も HTTP 200。記事が使う「string transforms」「Pipes」「`.extend()`」の箇所は v4.6.7 と main で同じ。

| # | URL | 題名 | 確かめた事実 | 記事のどの文の根拠か |
|---|---|---|---|---|
| 1 | https://zod.dev/basics | Basic usage \| Zod | Handling errors 節「use the `.safeParse()` method to get back a plain result object containing either the successfully parsed data or a `ZodError`. The result type is a discriminated union」、`if (!result.success) { result.error } else { result.data // { username: string; xp: number } }`。`.parse()` の失敗で `error.issues` に issue の配列が入る例。Inferring types 節の `z.infer<typeof Player>` | 57行目（例外を投げない、`success`、`error.issues`）、149行目3文目（`z.infer`）、200行目（`result.data` に値、型） |
| 2 | https://zod.dev/error-formatting | Formatting errors \| Zod | `z.strictObject` に余分なキーを渡した例で、issue `{ code: 'unrecognized_keys', keys: [ 'extraKey' ], path: [], … }`。`z.prettifyError()` は「a human-readable string representation of the error」で、`✖ … → at username` の形 | 261行目3文目、343行目 |
| 3 | https://zod.dev/api | Defining schemas \| Zod | Objects 節「By default, unrecognized keys are *stripped* from the parsed result」。`z.strictObject`「throws an error when unknown keys are found」。Enums 節の `z.enum`。（2026-11-10）Strings 節「To perform some simple string transforms」の `z.string().toLowerCase(); // toLowerCase`。Pipes 節「Schemas can be chained together into "pipes"」と `z.string().pipe(...)`。`.extend()` 節「This API can be used to overwrite existing fields! … If the two schemas share keys, B will override A.」 | 75行目、149行目2文目、416行目、335行目1〜2文目（`toLowerCase`、`.pipe()`）、337行目1文目（`.extend()` の上書き） |
| 4 | https://zod.dev/error-customization | Customizing errors \| Zod | Global error customization 節「To specify a global error map, use `z.config()`」。Internationalization 節で locales は `zod/locales` から import して `z.config(en())` のように渡す。使えるロケールの一覧に「`ja` — Japanese」 | 382行目、412行目1文目 |
| 5 | https://github.com/colinhacks/zod/blob/v4.6.7/packages/zod/src/v4/core/errors.ts | colinhacks/zod v4.6.7 packages/zod/src/v4/core/errors.ts | `export type $ZodIssue` は11の型の合併（`invalid_type`、`too_big`、`too_small`、`invalid_format`、`not_multiple_of`、`unrecognized_keys`、`invalid_union`、`invalid_key`、`invalid_element`、`invalid_value`、`custom`）。`$ZodIssueBase` に `path`、`message`。`$ZodIssueTooBig` に `origin`、`maximum`、`inclusive`。`$ZodIssueInvalidValue` に `values` | 69行目「11種類」、表の `code` の意味（71〜76行目） |
| 6 | https://www.npmjs.com/package/zod | zod (npm) | latest は 4.6.7（2026-10-12 公開）。license は MIT | 92行目2文目、449行目2文目 |
| 7 | https://platform.claude.com/docs/en/build-with-claude/structured-outputs | Structured outputs | Why use structured outputs 節「Without structured outputs, Claude can generate malformed JSON responses or invalid tool inputs…: Missing required fields, Inconsistent data types」。JSON Schema limitations の Not supported「Numerical constraints (such as `minimum`, `maximum`, `multipleOf`)」「String constraints (`minLength`, `maxLength`)」。How SDK transformation works「Most SDK helpers… Remove unsupported constraints… Update descriptions by adding each unsupported constraint to the field's description」「Validate responses against your original schema and all its constraints, if the helper validates responses」「A helper that validates responses still checks the response against `minimum: 100`」。TypeScript の `zodOutputFormat()`「Wrap a Zod schema in `zodOutputFormat()` and pass it to `client.messages.parse()` … `zodOutputFormat()` transforms the schema, and `parse()` validates the response」。`jsonSchemaOutputFormat()`「Unlike `zodOutputFormat()`, it doesn't validate the response, so it doesn't catch violations of constraints not supported by the API, such as `minimum`」。Invalid outputs 節の max_tokens「The output might be incomplete and not match your schema」と Enum value casing「don't guarantee the capitalization of string `enum` and `const` values」「Compare enum values case-insensitively, and avoid enum values that differ only in capitalization」 | 80行目（制約に対応しない）、82〜84行目、86行目（`zodOutputFormat()` と `parse()` が外した制約を確かめる、`jsonSchemaOutputFormat()` は検証しない）、88行目3文目、223行目3文目、242行目3〜4文目、339行目2文目（大文字小文字だけが違う候補を避ける） |
| 8 | https://nodejs.org/docs/latest-v22.x/api/typescript.html | Node.js v22 Modules: TypeScript | History「v22.18.0 Type stripping is enabled by default.」。Type stripping 節「Node.js will replace inline type annotations with whitespace, and no type checking is performed.」 | 94行目 |
| 9 | https://platform.claude.com/docs/en/about-claude/pricing | Pricing | Model pricing の表で「Claude Haiku 5.5 (for prompts up to 100,000 tokens)」は Base input $0.10 / MTok、Output $0.50 / MTok | 451行目 |

## 出典ではなく実行ログを根拠にした断定

ログは 2026-11-10 にすべて取り直した（`code/extra/run-all.sh`）。

| 文（行番号は原稿） | 根拠 |
|---|---|
| 92行目1文目 動かした環境 | `run/*.log` の見出し `node: v22.22.0 / npm: 10.9.4`、`code/package.json` の `"zod": "4.6.7"` |
| 94行目 型の確認は `tsc` 7.0.2 で行った | `run/14.log`（`Version 7.0.2`、`tsc_exit=0`） |
| 122〜130行目 `npm install` の出力 | `run/03.log` |
| 191〜198、212〜221、231〜240、250〜259、269〜292行目の出力 | `run/05.log`〜`09.log` |
| 204行目 4つの見本がそれぞれ別の `code` を返した | `run/06.log`〜`09.log` |
| 242行目5文目 `z.enum` は区別して比べるので `"Bug"` を拒んだ | `run/07.log`（`invalid_value`） |
| 294行目 3つ入れて3件返った、最初の違反で止まらない | `run/09.log` |
| 296行目 `inclusive: true` と `<=3`、`received undefined`、`[ 'tags', 1 ]` | `run/09.log` と `code/samples.ts` の `many` |
| 328〜333行目の出力、335行目3〜4文目、337行目3文目 | `run/10.log`（`Bug -> bug`、`BILLING -> billing`、`feature -> invalid_value`、`bad-enum: true bug`） |
| 367〜376、403〜410、439〜441行目の出力 | `run/11.log`〜`13.log` |
| 412行目2文目 再依頼の文まで日本語に変わる | `run/12.log`（`z.config(ja())` のあと `z.prettifyError` の文が日本語）と出典4（`z.config` は全体の設定） |
| 443行目 `confidence` が消え、issues にも残らない | `run/13.log`（`true` と `confidence` の無い `data`） |
| 449行目 通信は `npm install` だけ、ネットワークの無い環境でも `node` のコマンドがすべて成功 | `run/15.log`（`unshare -rn` の中で9つの `node` コマンドが exit=0、外への `fetch` は `EAI_AGAIN`） |
