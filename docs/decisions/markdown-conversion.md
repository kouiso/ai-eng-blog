# 原稿の Markdown を EmDash に渡す方法（#66、#64 の一部）

状態: **判断は manager 待ち（pending manager）**。この文書は調べた事実と選択肢と推奨だけを書いている。どの方法にするかは決めていない。

調べた日: 2026-11-14。対象の EmDash は、このリポジトリに入っている `emdash` 1.4.0 と `@emdash-cms/admin` 1.4.0。

## 結論（先に）

- 原稿30本は、表（パイプの表）を69個、表の行を551行（区切りの行を入れると620行）使っている。30本すべてが表を持つ。
- 1.4.0 の `content_create` は、Markdown を行ごとの簡易な変換で Portable Text にする。**表を変換する処理がなく**、表の行は1行ずつ段落になる。30本すべてで起きる。
- 1.4.0 の変換は、表のほかに2つの問題がある。
  1. `_x_` を斜体にする正規表現が語中の `_` にも当たり、見出しや本文に `total_cost_usd` と書くと、`_` が消えて斜体になる。表のセルの URL（`.../Logical_OR` など）も壊れる。10本で17か所。
  2. リンクの文字にインラインコードを入れた `[` `` `claude -p` `` `](/posts/...)` は、バッククォートが文字として残る。2本で2か所。
- EmDash 1.5.0（2026-11-11 公開）の changelog に「GFM のパイプの表が、Markdown の取り込み（クライアント API、CLI、MCP）でネイティブの表のブロックになる」とある。変換器は `marked` を使う実装に置き換わっており、上の3つのうち2つ（`_` と表）はソースを読む限り直る。ただし **1.5.0 の変換器は、このセッションでは実行して確かめられていない**（取得したパッケージのコードを動かす操作が許可されなかった）。ソースを読んだ範囲の結論。
- 表のブロックの形は、公式ドキュメントには書かれていない。インストール済みのパッケージのソースにある（後述）。
- 推奨は「選択肢 B（1.5.0 に上げる。版上げは別の項目）」を第一、「選択肢 A（リポジトリのスクリプトで Portable Text にしてから渡す）」を保険にする。理由は下の「推奨」。

## 1. 原稿30本で使っている書き方

集計は `node scripts/markdown-inventory.mjs` の出力（frontmatter を除く本文だけ。コードブロックの中身は書き方として数えず、コードブロックは1個と数える）。記事ごとの内訳は `--per-article`、JSON は `--json`。行ごとの正規表現による数え方なので、個数は目安。

| 書き方 | 使っている記事数（30本中） | 出現数の合計 |
|---|---|---|
| インラインコード | 30 | 2487 |
| 段落 | 30 | 1538 |
| コードブロック（```） | 30 | 592 |
| 表の行（見出し行を含む。区切りの行は除く） | 30 | 551 |
| 表のセルの中の裸の URL（リンクの記法ではない） | 30 | 334 |
| 見出し h2 | 30 | 292 |
| 表（パイプの表） | 30 | 69 |
| リンク `[text](url)`（すべて `/posts/...` の内部リンク） | 29 | 78 |
| 箇条書き（入れ子なし） | 25 | 162 |
| 見出し h3 | 25 | 99 |
| 表のセルの中のインラインコード | 21 | 151 |
| 語中の `_`（`total_cost_usd` など、コードの外） | 9 | 13 |
| 番号付きリスト（入れ子なし） | 5 | 19 |
| リンクの文字にインラインコードを含むリンク | 2 | 2 |
| バックスラッシュのエスケープ | 1 | 2 |
| 表の中のエスケープしたパイプ `\|`（`rag-retrieval-eval-recall-mrr.md:573`） | 1 | 1 |

使っていない書き方（0本）: h1、h4 以下、強調 `**`、斜体、打ち消し、引用、画像、水平線、HTML、脚注、タスクリスト、入れ子のリスト、リスト項目の続き行、改行で折った段落、表の列の寄せ指定、`<br>`、表のセルの中のリンク。

コードブロックの言語: text 224、bash 218、ts 122、json 22、markdown 3、diff 1、js 1、yaml 1（言語なしは0）。

気づいたこと。

- 表のセルにリンクの記法は1つもない。出典の表の URL は裸の URL で、どの版でもリンクにならない（1.5.0 は `marked` のオートリンクを切っている。後述）。issue #64 の完了条件「表のセルの中のリンクが働いている」は、今の原稿ではインラインコードだけが対象になる。リンクを使いたくなったときの確認として残す価値はある。
- 本文の `<work>` のような山括弧の語は、行の途中にあるだけで HTML としては使っていない。`<doc id=...>` はコードブロックの中にある。

### 1.4.0 の変換にこの30本を通した結果

`markdownToPortableText`（`emdash/client`。MCP の `content_create` が `portableText` フィールドに文字列を渡されたときに使う関数）に、本文をそのまま通した。

| 結果 | 記事数 | 合計 |
|---|---|---|
| 表の行が段落のまま残る（区切りの行 `|---|---|` も段落） | 30 | 620 |
| 見出し h2 / h3 | 30 / 25 | 292 / 99 |
| 箇条書き / 番号付きリスト | 25 / 5 | 162 / 19 |
| コードブロック（言語つき） | 30 | 592 |
| 斜体（em）に化けた箇所 | 10 | 17 |
| リンクの文字にバッククォートが残る | 2 | 2 |

表の行が「551 + 69 = 620」になることは、インベントリの数え方と変換結果の突き合わせになっている。

## 2. EmDash が何を変換するか

### 2.1 公式ドキュメント（docs.emdashcms.com。docs の MCP は未設定なので、サイトマップの95ページを直接取得して読んだ。2026-11-14 確認）

- Markdown から Portable Text への変換規則は、**どのページにも書かれていない**。「Markdown」を含むのは `coming-from/astro`（Astro の Markdown/MDX との比較）、`guides/media-library`（MCP や CLI が書いた Markdown の画像の参照を数える話）、`reference/cli`（`content get --raw` が「Portable Text を Markdown でなくそのまま返す」）の3ページだけ。
- `content_create` の入力の説明も docs には無い。https://docs.emdashcms.com/reference/mcp-server/ には、`content_update` は部分更新であること、`_rev` による競合、予約は `content_schedule` / `content_unschedule`（`content:write`）であること、などがあるだけ。
- 表のブロックの形（`_type:"table"`、行、セル）も docs に無い。https://docs.emdashcms.com/plugins/creating-native-plugins/portable-text-components/ は組み込みのブロックの一覧を持たない。
- 唯一の記述は https://docs.emdashcms.com/guides/working-with-content/ の「Write rich text」で、Portable Text フィールドのエディタが「headings, paragraphs, quotations, lists, links, images, videos, galleries, code blocks, tables, HTML blocks, and reusable sections」を扱う、というもの。表のブロックが存在することの根拠はこれだけ。
- docs の一覧は https://docs.emdashcms.com/llms.txt と https://docs.emdashcms.com/sitemap-0.xml（95ページ）。

### 2.2 MCP ツールの説明（インストール済みのソース）

`node_modules/emdash/src/mcp/server.ts`（emdash 1.4.0）の `content_create` の説明に、次のとおり書いてある。

> For rich text (portableText) fields, pass a Markdown string — converted to Portable Text automatically; prefer this. Pass a Portable Text JSON array only for complex content Markdown can't express (custom blocks, embeds).

同じファイルの `convertWriteData` のコメントに「Non-string values pass through, so callers may still send Portable Text」とある。つまり `content` に Portable Text の配列を渡す経路は、公式に想定されている。write-article スキルが前提にしている「Markdown の文字列をそのまま渡す」は、表については成り立たない。

### 2.3 1.4.0 の変換器の実体

`node_modules/emdash/src/client/portable-text.ts`（emdash 1.4.0）の `markdownToPortableText`（179行目から）は、1行ずつ正規表現で見る簡易なもの。

| 書き方 | 1.4.0 の扱い |
|---|---|
| 見出し `#`〜`######` | `style: "h1"〜"h6"` のブロックになる |
| 段落 | **1行が1ブロック**。改行で折った段落は別々のブロックになる（原稿には無い） |
| コードブロック | 行頭が ```` ``` ```` のものだけ。`_type:"code"`、`language`、`code`。リストの中のインデントしたコードブロックは対象外（原稿には無い） |
| 箇条書き / 番号付き | `listItem: "bullet"` / `"number"`、`level` は先頭の空白2つごとに1段 |
| 引用 | 行頭が `> ` の1行ごとに `style:"blockquote"` |
| 画像 | 行全体が `![alt](url)` のときだけ `_type:"image"` |
| インライン | `**強調**`、`_斜体_`、`` `コード` ``、`[文字](url)`、`~~打ち消し~~` の5つ。`*斜体*` は変換しない。入れ子は不可 |
| 表（パイプの表） | **変換する処理が無い**。1行ずつ段落になる（上の結果表のとおり、30本で620行） |
| 水平線、HTML、脚注 | 変換する処理が無い。そのまま段落の文字になる |

実害のある挙動は次の2つ。

- 斜体の正規表現 `(_(.+?)_)` は語の境界を見ない。コードの外に `total_cost_usd` と書くと、`_cost_` が斜体になって `_` が消え、「total」「cost（斜体）」「usd」に分かれて出る（`claude-p-script-first-call.md` の見出し「## total_cost_usd は…」など）。表のセルの URL（`.../Logical_OR`、`.../Lookbehind_assertion` など）にも起きる。
- リンクの文字の中のインラインコードは解釈されず、バッククォートが文字として残る。

### 2.4 表のブロックの形（1.4.0 のパッケージに入っている）

`node_modules/@emdash-cms/admin/dist/portable-text-table.d.ts`（`@emdash-cms/admin` 1.4.0）が型を定義している。

```text
PortableTextTableBlock  { _type:"table", _key, rows: PortableTextTableRow[], hasHeaderRow?: boolean, markDefs? }
PortableTextTableRow    { _type:"tableRow", _key, cells: PortableTextTableCell[] }
PortableTextTableCell   { _type:"tableCell", _key, content: PortableTextTableSpan[], markDefs?, isHeader?, colspan?, rowspan?, colwidth?, textAlign? }
PortableTextTableSpan   { _type:"span", _key, text, marks?: string[] }
```

- セルの `content` は span の配列で、`marks` に使えるのは `strong em underline strike-through subscript superscript code` と、`markDefs` で定義した `link` だけ（`portable-text-table.js` の `DECORATOR_MARKS`、`normalizeMarkDefs`）。それ以外はテーブルごと「安全でない」と判定される。
- サイトでの描画は `node_modules/emdash/src/components/Table.astro`。`.emdash-table-wrapper` の中に `<table class="emdash-table">` を出す。`hasHeaderRow: true` で、1行目のセルがすべて `isHeader: true` なら `<thead>` にする。セルの内容は span と markDefs をそのまま描画するので、`code` マークとリンクが働く。
- 依頼で聞いた「Portable Text を書き換えるスクリプトで `_type:"table"` にしたら `.emdash-table-wrapper` の中に描画された」という結果は、上の型と描画コードに合う。参照にと言われた `tbl.py`（`.../scratchpad/pr53/tbl.py`）は、このセッションの環境に存在しなかったので読めていない。

### 2.5 1.5.0 の変換器（changelog とパッケージのソースを読んだ。実行はしていない）

- npm: `emdash` の `latest` は 1.5.0、公開は 2026-11-11T18:19:07Z（`npm view emdash time`、2026-11-14 実行）。`@emdash-cms/admin` も 1.5.0 がある。
- changelog: https://github.com/emdash-cms/emdash/blob/main/packages/core/CHANGELOG.md の「1.5.0」の Patch Changes に、PR #4607（https://github.com/emdash-cms/emdash/pull/4607 ）がある。引用:
  - 「Fixes Markdown imports through the client API, CLI, and MCP to preserve nested inline formatting, links, and list depth. GFM pipe tables now import as native table blocks and export as Markdown tables, including cell formatting and alignment. Tables with merged cells or other layouts that GFM cannot represent remain preserved in opaque block comments.」
  - 「Markdown imports now treat a single newline as a soft wrap within one paragraph; separate paragraphs with a blank line. Reads escape literal inline punctuation (for example, `snake_case` becomes `snake\_case`), use `*text*` for italics instead of `_text_`, and write hard line breaks as a trailing backslash (`\`).」
  - 「Unlinked images in ordinary paragraphs become native image blocks … Images inside list items, blockquotes, or links remain inline Markdown text」
  - 1.5.0 に Major Changes の節は無い。
- ソース（`npm pack emdash@1.5.0` で取得し、スクラッチパッドに展開して読んだ。`src/client/portable-text.ts`）: `new Marked({ gfm: true, tokenizer: { url: () => undefined } })` で字句解析する。`table` トークンを `{ _type:"table", hasHeaderRow:true, rows:[{_type:"tableRow", cells:[{_type:"tableCell", content: spans, markDefs, isHeader, textAlign?}]}] }` にする。これは 2.4 の型と同じ形。セルの中は `parseInline` を通るので、インラインコード（`code` マーク）、リンク（`markDefs` の `link`）、強調が付く。`url: () => undefined` はオートリンクを切る設定なので、**裸の URL は1.5.0 でもリンクにならない**。
- 1.5.0 の変換器にこの30本が通ったときの実際の出力は、確かめられていない。表の数と一致するか、セルの `code` マークが付くか、`\|` を含むセルが正しく出るか（`marked` は GFM のセルの `\|` をパイプとして扱う）は、版上げの項目で実行して確かめる必要がある。

### 2.6 このリポジトリの既存の確認の範囲

`docs/verification/local-mcp.md` の35行目（呼び出し #4）と77行目の「うまくいったこと」は、Markdown が Portable Text に変換されたと書いているが、確かめた中身は見出し、コード（言語つき）、強調、箇条書きだけで、表は試していない。issue #64 の指摘どおり。

## 3. 選択肢

### A. リポジトリのスクリプトで Markdown を Portable Text にして `content_create` に渡す

`content` に Portable Text の配列を渡す（2.2のとおり公式に想定された経路）。スクリプトは `scripts/` に置き、`content/articles/<slug>.md` の本文を読んで JSON を作る。

- 扱える書き方: 30本で使っているものすべて。表は 2.4 の形で作れる（セルのインラインコード151か所は `code` マーク、`\|` のセルも扱える）。`_` の誤爆も、自前のパーサー（または `marked`）なら避けられる。
- 長所: EmDash の版に依存しない。いま動いている 1.4.0 のまま、30本の変換の中身を自分で決められる。表のセルの裸の URL をリンクにするかどうかも選べる。原稿は書き換えない。
- 短所: 変換器を自前で持つことになる（`marked` を devDependency に足して、1.5.0 の変換器と同じ形の出力を作るのが現実的。依存の追加は別途判断）。EmDash の将来の版と形が食い違う恐れがある。`content_get` で読み戻すと Markdown に戻る（`portableTextToMarkdown`）ので、往復で表が崩れないかの確認が要る。MCP の呼び出しに大きな JSON を載せる（記事1本で、段落とコードのブロックが数十から数百個になる）。
- スキルの変更: 手順10の3の「`content` には Markdown の文字列をそのまま渡せば」を、「スクリプトで作った Portable Text を渡す」に変える。

### B. EmDash を 1.5.0 に上げる（版上げは別の項目）

Markdown の文字列をそのまま渡す、いまのスキルの手順を変えない。

- 扱える書き方: 30本で使っているものすべて（`marked` の GFM。ソースを読んだ範囲。実行は未確認）。表、セルのインラインコードとリンクの記法、`_` の扱い、`[`` `code` `](url)` のリンクが直る見込み。
- 長所: 変更が最小で、スキルの手順も `content_get` の読み戻しも upstream の想定どおり。変換器を自前で持たない。
- 短所:
  - CLAUDE.md のとおり、版上げは記事の作業と混ぜず、`npm run build` と `npm run typecheck` が通ることを確かめてから入れる別の項目になる。#66 の本文にも同じ方針がある。
  - 1.5.0 は Minor の変更が多く、確認が要る。マイグレーションが2つ増える（共同編集の `_emdash_rooms` ほか、`revisions` テーブルの列。いったん上げると、1.4.0 以前とのサイト移行での書き出しと取り込みができなくなる、と changelog にある）。新しいサイトは staging モード（`noindex`）で始まるが、既存のサイトは影響を受けない（本番はまだ deploy 前なので、setup を新しく通すなら公開の切り替えが要る）。予約公開に関わる変更は `no-scheduling` フラグの追加（既定は予約が有効のまま）。
  - 1.5.0 の変換器の出力は未確認。版上げの項目で、30本をローカルの下書きに作って `<table>` の数を数えるところまでやらないと、結論にならない。
  - 裸の URL は 1.5.0 でもリンクにならない。リンクにしたいなら原稿か別の処理が要る。

### C. Markdown の文字列に、表だけ不透明なブロックのコメントとして埋め込む（補助的な案）

1.4.0 の変換器が、`<!--ec:block {JSON} -->` の行を Portable Text のブロックとして取り込む仕組み（`OPAQUE_FENCE_PATTERN`）を使う。スクリプトで表を `<!--ec:block {"_type":"table",…} -->` の1行に置き換えた文字列を、いまのスキルどおり `content` に渡す。

- 扱える書き方: 表（セルのインラインコードとリンクも）。表の中の URL の `_` の誤爆は避けられる。
- 長所: 変換器を丸ごと持たずに済み、表だけの変換で済む。
- 短所: 表の外にある `_` の誤爆（17か所のうち表の外は7か所。見出し `## total_cost_usd …` を含む。残りの10か所は表の中で、表を埋め込めば避けられる）と、リンクの文字のバッククォート（2か所）は直らない。1.4.0 の変換器はバックスラッシュのエスケープを解釈しないので、原稿を直さずに避ける手段もない。#64 の完了条件（Markdown の記号がそのまま見える段落が無い）を満たさない恐れがある。単独では推奨しない。A の一部として使える程度。

## 4. 推奨（決めるのは manager）

1. **第一は B**。#64 の問題は、upstream が 1.5.0 で直したものとほぼ同じで、スキルの「Markdown の文字列をそのまま渡す」を守れる。変換器を自前で持つ維持コストが無い。版上げは別の項目にし、その項目の完了条件を「30本をローカルの下書きに作り、描画された `<table>` の数が原稿の表の数（69）と一致する。セルのインラインコードが `<code>` になる。`_` を含む語が壊れない」にして、実行して確かめる。
2. **B で確かめて落ちたら A**。A は 1.4.0 のまま今日から作業できるので、1.5.0 の確認が長引くときの保険にもなる。その場合、`marked` を devDependency に足す判断と、変換の出力を EmDash の `normalizePortableTextTable` に通す検査（2.4）を一緒に決める。
3. どちらでも、#64 の完了条件にある「予約の前に下書きで描画を確かめる段」（落ちた記事は予約しない）と「`post-deploy.md` に試しの1本の表の確認」は必要。`scripts/markdown-inventory.mjs` の出力の「表（パイプの表）」の個数が、描画された `<table>` の数の期待値になる。

## 5. 再現と出典

- `node scripts/markdown-inventory.mjs [--per-article|--json]`（このリポジトリ。`test/markdown-inventory.test.ts` に小さなテストがある）。
- パッケージのソース: `node_modules/emdash/src/client/portable-text.ts`、`node_modules/emdash/src/mcp/server.ts`（`content_create`）、`node_modules/emdash/src/components/Table.astro`、`node_modules/@emdash-cms/admin/dist/portable-text-table.{d.ts,js}`（すべて 1.4.0）。
- docs.emdashcms.com（2026-11-14 確認）: https://docs.emdashcms.com/reference/mcp-server/ 、https://docs.emdashcms.com/guides/working-with-content/ 、https://docs.emdashcms.com/reference/cli/ 、https://docs.emdashcms.com/guides/media-library/ 、https://docs.emdashcms.com/plugins/creating-native-plugins/portable-text-components/ 、https://docs.emdashcms.com/llms.txt 、https://docs.emdashcms.com/sitemap-0.xml 。
- changelog（2026-11-14 確認）: https://github.com/emdash-cms/emdash/blob/main/packages/core/CHANGELOG.md の 1.5.0、PR #4607。
- npm: `npm view emdash time`（2026-11-14）。
