# EmDash の版を 1.4.0 に上げる（2026-10-31）

結論: `emdash` と `@emdash-cms/cloudflare` を 1.3.1 から 1.4.0 に上げた。changelog に破壊的変更（Major）は無く、ビルド、型チェック、`wrangler deploy --dry-run`、ローカルでの画面確認、MCP での作成から公開までがすべて 1.3.1 のときと同じように通った。1.3.1 に戻す理由は見つからなかった。

## 1.4.0 が最新かどうか

`npm view emdash dist-tags versions time --json`（2026-10-31 実行）の結果:

- `dist-tags`: `{'rc': '1.0.1-rc.1', 'latest': '1.4.0'}`
- 1.3.1 は 2026-10-18T19:19:29Z、1.4.0 は 2026-10-29T13:20:26Z の公開
- `@emdash-cms/cloudflare` も `latest` が 1.4.0

出典: https://www.npmjs.com/package/emdash 、https://www.npmjs.com/package/@emdash-cms/cloudflare （2026-10-31 確認）

## changelog で確かめたこと

読んだもの（すべて 2026-10-31 に参照）:

- https://github.com/emdash-cms/emdash/blob/main/packages/core/CHANGELOG.md の「1.4.0」
- https://github.com/emdash-cms/emdash/blob/main/packages/cloudflare/CHANGELOG.md の「1.4.0」
- 同じリポジトリの `packages/admin`、`packages/auth`、`packages/blocks` の CHANGELOG.md の「1.4.0」

npm の tarball には CHANGELOG が入っていないので、GitHub の main にあるファイルを読んだ。

1.4.0 は Minor が1件（`admin.hiddenNavItems` の追加）で、残りは Patch。5つのパッケージのどれにも「Major Changes」の節は無い。このサイトに関係しそうなものを1件ずつ見た。

| 変更 | このサイトへの影響 |
|---|---|
| #4243 キャッシュヒントが `Last-Modified` を自動で付けなくなった。`cacheHint.lastModified` も自動では入らない | このサイトは `cacheHint.lastModified` を読んでいない（`src/` を grep して0件）。`astro.config.mjs` に Astro のキャッシュの設定も無い。影響なし |
| #4286 同じ版をもとにした保存が同時に2件来たとき、2件目が `409 CONFLICT` になる（以前は1件目が黙って上書きされた） | MCP で記事を直す手順（`content_get` で読んだ `_rev` を渡す）は変わらない。CONFLICT のときは読み直してやり直す、という write-article スキルの手順のままでよい |
| #4287 期限切れの OAuth トークンとログインコードを scheduled handler が消すようになった | 本番の MCP は OAuth でつなぐ予定なので、たまり続けなくなる。設定の変更は要らない |
| #4459 `/_emdash/api/oauth/token` のエラーコードが RFC どおりの小文字 `invalid_grant` になった | OAuth クライアント（claude.ai のコネクタ）にとっては直る方向の変更 |
| #3129 空の画像フィールド `""` が `null` で保存されるようになった。必須の画像フィールドに `""` を送ると検証エラーになる | `featured_image` は必須ではない。MCP で記事を作るときに `featured_image` を送っていないので影響なし |
| #4157 外部の認証プロバイダ（Cloudflare Access など）を使うとき、毎リクエストの KV 書き込みをやめた | Access は使っていないので関係しない |
| cloudflare #4278 / #4281 / #4394 サンドボックスのプラグインまわり | `sandboxRunner` も `LOADER` も使っていない（CLAUDE.md）ので関係しない |

ほかに、DB のマイグレーションは増えていない。1.4.0 でビルドしたあとの `.emdash/migrations.json` の90件と、1.3.1 のときに作った既存のローカル DB（`.wrangler/`）の `_emdash_migrations` の90件は、名前が完全に一致した。フォーム機能も 1.4.0 では追加されていないので、`docs/decisions/subscribe.md` の判断（D1 の独自テーブルに保存する）はそのままでよい。

## 入れ方

```sh
npm install --save-exact emdash@1.4.0 @emdash-cms/cloudflare@1.4.0
```

`package.json` の2行が 1.4.0 に変わった。`package-lock.json` では66パッケージの版が変わった。内訳は `emdash` と `@emdash-cms/*` の6つが 1.4.0 に、`@tiptap/*` が 3.32.0 から 3.32.2 に、ほかは `jose` 6.2.13 → 6.2.14、`qs` 6.16.1 → 6.17.1 などのパッチ版で、どれも EmDash の依存の範囲の中で npm が選び直したもの。

## 確かめた結果（2026-10-31、Node.js 22.22.0、wrangler 4.152.0）

### ビルドと型

| コマンド | 結果 |
|---|---|
| `npm run build` | exit 0。`[emdash] Build complete`、`[build] Complete!` |
| `npm run cf:types && npm run typecheck` | exit 0。`Result (26 files): - 0 errors - 0 warnings - 0 hints` |
| `npx wrangler deploy --dry-run` | `Total Upload: 16062.39 KiB / gzip: 4255.25 KiB`、バインディングは SESSION（KV）、DB（D1）、MEDIA（R2）、ASSETS。`--dry-run: exiting now.` |

1.3.1 のときの dry-run は `15,816.08 KiB / gzip 4,236.46 KiB`（`docs/decisions/ogp.md`）で、約 246 KiB 増えた。Workers の上限は Free・Paid とも非圧縮で 64 MiB、圧縮後の上限は無い（https://developers.cloudflare.com/workers/platform/limits/ の「Worker size」、2026-10-31 確認）ので、収まっている。

### 画面（Playwright、Chromium）

`npm run build` のあと、ローカル DB をリポジトリの `.wrangler/` とは別のスクラッチパッドのディレクトリにして `npx wrangler dev --local --port 8787 --ip 127.0.0.1 --persist-to <scratchpad>/wr-v140` で動かした。空の DB から、セットアップ画面（Empty site → ローカル専用の架空の管理者 → 仮想認証器でパスキー）を通した。

| 確かめたこと | 結果 |
|---|---|
| `/` | 200。見出しが表示された |
| 診断の切り替え | 初期は「入門ステップ講座の 1「LLM API」から順に読む」。「pro」を押すと「6「LLM 評価」と応用記事、特典のサンプルアプリ」に切り替わり `aria-pressed=true`。「new」に戻すと元に戻った |
| フォームの送信 | `/api/subscribe` が 200 `{"ok":true,"message":"登録を受け付けました。…"}`。画面に同じ文言が出た。D1 の `newsletter_subscribers` に1行入った（Turnstile は未設定なので無効のまま） |
| `/posts` | 200。MCP で公開した記事が載った |
| 記事ページ `/posts/v140-verify-rag` | 200。料金の目安の枠（`[data-cost-box]`）に「料金の目安 / 約 10 円（検証用の合成データ） / 動かした環境 / Node.js 22 / wrangler dev --local」、公開日の横に「動作確認日 2026年10月31日」。本文の h2 とコードブロックも出た |
| `/tag/rag` | 200。タイトルは「RAG（入門ステップ講座 03）」で、記事が載った |
| `/privacy` | 200 |
| 幅 390px の `/` | `scrollWidth` 390、はみ出す要素なし |
| コンソールのエラー | `/nope-404` を開いたときの 404 だけ（わざと開いた存在しないページ）。ほかのページでは0件 |

### MCP（`docs/verification/local-mcp.md` と同じ手順）

管理画面の Settings → API Tokens で、ローカル DB の中だけで使う PAT を発行した（スコープ `content:read` / `content:write` / `schema:read`、有効期限7日）。値はスクラッチパッドの権限 600 のファイルにだけ置き、終わったあとにファイルもローカル DB のディレクトリごと消した。

| # | 呼び出し | 結果 |
|---|---|---|
| 0 | トークンなしで `tools/list` | HTTP 401、`WWW-Authenticate: Bearer resource_metadata="http://127.0.0.1:8787/.well-known/oauth-protected-resource"` |
| 1 | `initialize` | serverInfo `emdash` 0.1.0、capabilities `tools.listChanged` |
| 2 | `tools/list` | 72 ツール。1.3.1 のときに保存した一覧と比べて、増えたものも減ったものも無い |
| 3 | `taxonomy_create_term` `{taxonomy:"tag", slug:"rag"}` | 作成できた（Empty site のセットアップでは seed の分類の定義だけが入り、語は入らない） |
| 4 | `content_create`（`cost_estimate`、`run_environment`、`verified_at`、`taxonomies:{tag:["rag"]}`） | 下の「気づいたこと」を参照。`content_update` でタグを付け直した |
| 5 | `content_schedule`（30 分後） | `status:"scheduled"`。`/posts` に出ず、詳細ページは 404 |
| 6 | `content_publish` | `status:"published"`、`scheduledAt:null`、`liveRevisionId` が付いた。`/posts` と `/tag/rag` に載り、詳細ページは 200 |
| 7 | 別の記事を 45 秒後に予約し、時刻を過ぎてから `/cdn-cgi/local/scheduled` を呼ぶ | `{"outcome":"ok","noRetry":false}`、ログに `[scheduled] Published 1 scheduled item(s)`。`publishedAt` は予約時刻と同じ 05:27:20Z、詳細ページは 404 から 200 に変わった |

### 気づいたこと（1.4.0 の退行ではない）

まだ無いタグ（`rag`）を `taxonomies` に入れて `content_create` を呼ぶと、`isError:true`、`[VALIDATION_ERROR] Unknown taxonomy term: tag='rag' (locale 'en')` が返る。ところが記事そのものは下書きとして作られて残り、同じ slug でやり直すと `[SLUG_CONFLICT]` になる。

原因は D1 がトランザクションを使えないこと。EmDash の `src/database/transaction.ts` は、D1 ではトランザクションを使わずに1文ずつ実行すると書いている（「multi-statement atomicity is lost, but that's a known D1 limitation」）。このファイルは 1.3.1 と 1.4.0 の npm パッケージで中身が同じで、`handleContentCreate` の違いも slug の作り方の1行だけだった。つまり 1.3.1 でも同じことが起きる。

write-article スキルで記事を作るときは、先に `taxonomy_list_terms` で語があることを確かめる。エラーが返ったら、作り直す前に `content_get` で記事が残っていないかを見る。

## 片付け

- wrangler を止め、プロセスが残っていないこと、8787 番に接続できないこと（curl exit 7）を確かめた。
- リポジトリの `.wrangler/` は作業の前後で22ファイルの sha256 が全部一致した（このたびの確認では使っていない）。

## 戻すとき

`package.json` の2行を 1.3.1 に戻して `npm install` する。DB のマイグレーションは増えていないので、ローカルの DB はそのまま使える。


# EmDash を 1.5.0 に上げる（2026-11-14）

結論: `emdash` と `@emdash-cms/cloudflare` を 1.4.0 から 1.5.0 に上げた。上げた理由は、1.4.0 の `markdownToPortableText` が GFM の表を変換せず、語の途中の `_` まで斜体にすることが #66 の調べで分かったため。1.5.0 では、原稿30本をそのまま MCP の `content_create` に渡して、表は表として、`_` はそのままの文字として出た。ビルド、型、テスト、`wrangler deploy --dry-run` も通った。1.4.0 に戻す理由は見つからなかった。

## 1.5.0 が最新かどうか

`npm view emdash dist-tags --json`（2026-11-14 実行）は `latest` が 1.5.0 で、`@emdash-cms/cloudflare` も `latest` が 1.5.0。`emdash@1.5.0` の公開は 2026-11-11（`time.modified` は 2026-11-11T18:19:08Z）。`@emdash-cms/cloudflare@1.5.0` は peer dependency に `emdash` の 1.5.0 ちょうどを要求するので、2つは同じ版に揃える。

## 入れ方

`npm install --save-exact emdash@1.5.0 @emdash-cms/cloudflare@1.5.0` は、環境に拒否されたのではなく、npm の依存の解決が `ERESOLVE`（peer の衝突）で止まった。1.4.0 のまま固定された `package-lock.json` が、`@emdash-cms/cloudflare@1.5.0` の peer（`emdash@1.5.0`）と食い違うため。`package.json` の2行を 1.5.0 に直しても同じだった。ロックファイルを使わずに `package.json` だけで解決すると（スクラッチパッドで確認）通るので、依存の宣言そのものに問題は無い。

`--force` や `--legacy-peer-deps` は使わず、`package-lock.json` から `emdash` と `@emdash-cms/*` の11エントリだけを消してから `npm install` した。結果は、`emdash` と `@emdash-cms/{admin,auth,blocks,cloudflare,gutenberg-to-portable-text}` が 1.5.0 に、`@emdash-cms/{plugin-types,registry-client,registry-lexicons,registry-verification}` がパッチ版に、`@cloudflare/kumo` が 2.6.0 から 2.15.0（emdash の依存）に、`@tiptap/y-tiptap` が 3.0.12 から 3.2.0 になった。`@tiptap/*` は、emdash と `@emdash-cms/admin` が 3.32.0 ちょうどに固定しているため、その下に 3.32.0 が入れ子で入り（88パッケージの追加、45パッケージの削除）、最上位にあった 3.32.2 は消えた。最上位の `node_modules/@tiptap/core` が 3.32.2、`node_modules/emdash/node_modules/@tiptap/core` が 3.32.0 で、パッチ版が1つ下がる（`package-lock.json` で確認、2026-11-14）。`package-lock.json` の差分が大きいのはこのため。`package.json` の dependencies は `emdash` と `@emdash-cms/cloudflare` の2行だけが変わった。

## 確かめた結果（2026-11-14、Node.js 24.22.3、npm 11.19.1、wrangler 4.152.0）

| 確かめたこと | 結果 |
|---|---|
| `npm ci` | exit 0 |
| `npm run build` | exit 0 |
| `npm run typecheck` | exit 0、`0 errors / 0 warnings / 0 hints` |
| `npm test` | exit 0、12 ファイル・116 テストが通った |
| `npx wrangler deploy --outdir bundled/ --dry-run` | `Total Upload: 16991.71 KiB / gzip: 4586.90 KiB`。圧縮前 16.59 MiB で、無料枠の上限 64 MiB の約 26%。1.4.0 の 16062.39 KiB から約 929 KiB 増えた |
| 新しいローカル DB（OWNER_TASKS の手順5、「Sample content」） | タグは LLM API・構造化出力・RAG・AIエージェント・MCPサーバー・LLM 評価の6つだけ。`posts` と `pages` は 0 件で、サンプル記事は無い |
| `docs/verification/local-mcp.md` の作成・予約・cron での公開 | 下の表のとおり、1.4.0 のときと同じに通った |

ローカルは `npx wrangler dev --local --persist-to <新しいスクラッチ> --var EMDASH_SITE_URL:...` で動かした。別の作業が 8787 番を使っていたので、ポートは 8767 にして `EMDASH_SITE_URL` も `http://localhost:8767` に揃えた。セットアップは Playwright と仮想の WebAuthn 認証器で行い、管理画面の表示は `EmDash v1.5.0`。MCP のトークンはローカル DB の中だけで使い、作業後に DB ごと消した。

| 呼び出し | 結果 |
|---|---|
| トークンなしの `tools/list` | 401、`WWW-Authenticate: Bearer resource_metadata=...` |
| `initialize` / `tools/list` | serverInfo `emdash` 0.1.0、72 ツール（1.4.0 と同数） |
| `content_create`（`taxonomies:{tag:["rag"]}`） | `draft`。既存の term なので `VALIDATION_ERROR` は出ない |
| `content_schedule`（30 分後） | `scheduled`。詳細ページは 404 |
| `content_publish` | `published`。詳細ページは 200 |
| 45 秒後に予約し、時刻を過ぎてから `/cdn-cgi/local/scheduled` | `{"outcome":"ok"}`。`published`、`publishedAt` は予約時刻と同じ。詳細ページは 404 から 200 |

### 原稿30本を MCP で作った結果

原稿30本を、write-article スキルと同じ形（`data:{title, excerpt, content:<frontmatter を除いた Markdown>, cost_estimate, run_environment, verified_at}` と、コース6語の term の `taxonomies`）で `content_create` した。30本とも `draft` で作られ、エラーは0件だった。描画を確かめるために、ローカルの DB の中だけで公開した。公開ページの `[data-prose]` を、同じ Markdown を `marked`（GFM）で HTML にしたものと突き合わせた（突き合わせたスクリプトはスクラッチパッドにあり、リポジトリには入れていない）。

| 確かめたこと | 1.4.0 の調べ（#66） | 1.5.0 の結果 |
|---|---|---|
| `<table>` の数 | 表は変換されない | 69個。原稿の表の数と30本とも一致 |
| 表のセルの中のインラインコード | — | 151セルが `<code>` で出た。原稿の151セルと一致 |
| インラインコード、コードブロック、h2、h3、リスト項目 | — | 2487、592、292、99、181。原稿と一致 |
| `_` が斜体になる箇所（1.4.0 で `em` になった span） | 19 span | `em` の span は0。19 span の `_` はすべて文字のまま（本文の `_` は原稿85個、描画85個で、30本とも一致） |
| コードを含むリンク2か所 | 記号が残る | `<a href="/posts/claude-code-api-key-billing-auth"><code>ANTHROPIC_API_KEY</code></a>` と `<a href="/posts/claude-p-script-first-call"><code>claude -p</code></a>` |
| 「1つの改行はソフトな改行になる」変更 | — | 段落、リスト項目、見出し、セル、コードブロックの文字列（空白を1つに畳んだもの）が、原稿と全ブロックで一致。`<br>` は0。行がつながったり崩れたりした箇所は0 |

`1.4.0 で em になった 19 span` は、1.4.0 の `markdownToPortableText` に原稿30本を通して数えたもの（10本の記事にまたがる。どれも本文の段落の中）。#66 の「10本で17か所」（`docs/decisions/markdown-conversion.md` の12行目、60行目、173行目）と数える単位が違う。#66 は文章の中で `_` が壊れる場所を数え、ここは変換結果で `em` になった span を数えた。記事は同じ10本で、差の2は、1か所が2つの span に割れた分と考えられる（どの2か所かまでは特定していない）。合格条件の「17か所とも壊れない」は、19 span が0になり、本文の `_` が原稿85個・描画85個で一致したことで満たす。1.5.0 では同じ原稿で `em` の span が0になる。なお、原稿に裸の URL がある表のセルを `marked` は自動でリンクにするが、EmDash は 1.4.0 と同じくリンクにしない（`a` は 78 個と 412 個）。表示の仕様の違いで、今回の合格条件には入っていない。

### 画面（Playwright、Chromium、DSF 2、390 と 1440）

トップ、`/posts/rag-retrieval-eval-recall-mrr`（表3つ）、`/tag/rag` を撮った。ページ全体の横幅は 390 でも 1440 でもはみ出さない（`scrollWidth` と `clientWidth` が一致）。390 では、表を囲む要素が `overflow-x: auto` で、広い表だけが要素の中で横にスクロールする。PR #53 の表の見た目は 1.5.0 でも効いている。

## 1.5.0 で変わること（このサイトに関係するもの）

出典は emdash 1.5.0 の changelog（https://github.com/emdash-cms/emdash/blob/main/packages/core/CHANGELOG.md の「1.5.0」の節。見出しは `# emdash`。2026-11-14 に読んだ。ローカルの写しはリポジトリに入れていない）と、`node_modules/emdash` のソース。

### 新しいサイトは staging（noindex）で始まる

1.5.0 のセットアップは `site:staging` を true にする（`node_modules/emdash/src/astro/routes/api/setup/index.ts:140` の `options.setIfAbsent("site:staging", true)`）。staging のあいだ、`EmDashHead` は `<meta name="robots" content="noindex, nofollow">` を出す（`node_modules/emdash/src/components/EmDashHead.astro:128-129`。129 行目が `noindex, nofollow`）。このサイトは `src/layouts/Base.astro:99` で `EmDashHead` を使っているので、全ページが対象になる。ローカルの新しい DB でも出た。`/robots.txt` の中身は変わらず、ページを開くことはできる。検索に載らないだけ。

本番の D1 は空で（README）、deploy のあとにセットアップを通すので、本番のサイトは staging で始まる。検索から読者を集めるブログなので、外し忘れると記事が検索に出ない。外すのは管理画面の Settings > General > Site Status の **Go live**（MCP の `settings_update` でもよい）。既存のサイトは影響を受けない（設定が無いサイトは公開のまま）。この点は #66 の `docs/decisions/markdown-conversion.md:153` でも挙げていたもので、deploy の後の手順は [docs/verification/post-deploy.md](../verification/post-deploy.md) の「1b. 初回のセットアップのあと」にある。

### 1.5.0 で増えたマイグレーション（092〜097）

1.4.0 の tarball（`npm pack emdash@1.4.0`）の `src/database/migrations/` は `091_redirect_artifacts.ts` で終わる。1.5.0 の `node_modules/emdash/src/database/migrations/runner.ts` は、その後ろに次の6つを読み込む（2026-11-14 に確認）。

- `092_plugin_kv_options`: サンドボックス側の plugin の KV（`_plugin_storage` の `__kv`）を、プロセス内の `options` 表へ `plugin:<id>:<key>` として写す。`options` に同じ名前があれば上書きしない。元の行は残す。plugin を使わないこのサイトでは対象の行が無い。
- `093_menu_item_orphans`: 親が同じメニューに無いメニュー項目の `parent_id` を `NULL` にして、最上位へ移す。`UPDATE` で既存の行を書き換えるのは、この移行だけ。空の DB には対象の行が無い。
- `094_media_usage_file_url_reindex`: リッチテキストの項目を持つコレクションで、メディア使用状況の索引を作り直す対象としてマークする（`_emdash_media_usage_index_status` を更新する）。必要な表と有効な記録が無ければ何もしない。
- `095_plugin_storage_unique_scope`: plugin の storage の unique index を、宣言したコレクションの範囲に限った partial index に作り直す。changelog は、plugin storage の unique index があるサイトには、この移行のためのメンテナンスの時間が要ると書いている。このサイトは plugin storage を使わないので、対象の index が無い。
- `096_revision_kind_and_editors`: `revisions` に `kind` と `edited_by` の列を足す。`columnExists` で確かめて、列が無いときだけ足す。既存の版には埋めない。
- `097_room_storage`: 共同編集用の `_emdash_rooms` と `_emdash_room_updates` を `ifNotExists` で作る。

既存の行を書き換えるのは 093（`UPDATE _emdash_menu_items`）、094（`UPDATE _emdash_media_usage_index_status`）、095（`_plugin_indexes` の `DELETE` と `INSERT`）の3つで、ほかは列や表の追加、索引の作り直し、plugin のデータの複製（092 は `options` への `INSERT`）。空の本番 D1 では 092〜095 は対象の行が無く、何もしないまま通る。`seed/seed.json` は表の構造に依存しないので影響しない。新しい DB では、ほかのマイグレーションと一緒に流れるだけ。ただし changelog には「いったんマイグレーションを流したサイトは、1.4.0 以前の EmDash ではサイト移行（書き出しと取り込み）ができない」とある（#4637。096 の列のこと）。このサイトは移行を使わないが、1.5.0 を deploy したあとで 1.4.0 に戻しても、書き出しと取り込みは戻らない。

## 戻すとき

`package.json` の2行を 1.4.0 に戻して `npm install` する。ローカルは新しい DB で確かめただけで、1.4.0 の DB に 1.5.0 を重ねたときのマイグレーションは確かめていない。本番の DB への影響は deploy のあとに確かめる（`docs/verification/post-deploy.md`）。
