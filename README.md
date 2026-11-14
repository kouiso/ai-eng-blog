# ai-eng-blog

AI をアプリに組み込む開発を、LLM の API を初めて触る人が順番に学べるブログです。記事のテーマ選びから執筆、公開までを Claude Code に任せられるかどうかを確かめる PoC を兼ねています。人の手が要る作業は [OWNER_TASKS.md](./OWNER_TASKS.md) にまとめています。

Claude 向けの運用ルールは [CLAUDE.md](./CLAUDE.md)、EmDash のコードを書くときのルールは [AGENTS.md](./AGENTS.md) にあります。

## 使っているもの

| 部分 | 中身 |
|---|---|
| CMS | [EmDash](https://github.com/emdash-cms/emdash) 1.4.0（Astro 製。MCP サーバーを内蔵。版を上げた経緯は [docs/decisions/emdash-version.md](./docs/decisions/emdash-version.md)） |
| フレームワーク | Astro 7.3.2、`@astrojs/cloudflare` 14.3.1 |
| 実行環境 | Cloudflare Workers |
| データ | D1（記事などの DB）、R2（画像）、KV（セッション） |
| 予約公開とメンテナンス | EmDash 公式の scheduled handler と毎分の Cron Trigger |
| 文章の規約 | [tech-writing-pack](./docs/tech-writing-pack/)（`docs/tech-writing-pack/` に変更なしで同梱） |

版は `package.json` と `package-lock.json` で固定しています。Node.js は 24 系を使います（`.nvmrc` に `24`、`package.json` の `engines` に `24.x`）。Cloudflare Workers Builds は `.nvmrc` を読んでビルドの Node.js の版を決めます（https://developers.cloudflare.com/workers/ci-cd/builds/build-image/ 、2026-10-31 確認）。

## ローカルで動かす

npm を使います。

```sh
npm ci
npm run typecheck
npm run build
npx wrangler deploy --dry-run
npx wrangler dev --local
```

`npm run typecheck` は先に `wrangler types` を流して `worker-configuration.d.ts`（Git に入らない生成ファイル）を作ってから `astro check` を流すので、クローン直後に `npm ci` のあとすぐ流せます。`npm run cf:types` を別に流す必要はありません。

公開ページは `http://localhost:8787/`、管理画面は `http://localhost:8787/_emdash/admin` で開きます。初回は管理画面がセットアップ画面に移ります。ローカルのデータは `.wrangler/` に保存され、Git には入りません。

ローカルでの動作確認は、[OWNER_TASKS.md](./OWNER_TASKS.md) の作業が済んでいなくても Claude が自分で行います。

`wrangler.jsonc` の `EMDASH_SITE_URL` には本番の URL（`https://ai-eng-blog.kouiso.workers.dev`）が入っています。そのまま `npx wrangler dev --local` で起動すると、ローカルでも本番の URL が使われ、ローカルでのセットアップやパスキーの登録が本番のドメインに結び付き、canonical や sitemap も本番の URL になります。ローカルでは次のように上書きして起動します（[docs/decisions/site-url.md](./docs/decisions/site-url.md)）。

```sh
npx wrangler dev --local --var EMDASH_SITE_URL:http://localhost:8787
```

ローカル（`localhost`、`127.0.0.1`）で開いているときは、Turnstile のキーが無くても登録フォームを試せます。それ以外のアドレスでは、キーが2つそろうまで登録を受け付けません（[docs/decisions/subscribe.md](./docs/decisions/subscribe.md)）。

テストは `npm test` で実行します（vitest。メールアドレスの検証、本文の上限、Turnstile、D1 への保存を Node で確かめます）。

## 記事の任意フィールド

記事（`posts`）には、本文とは別に次の3つのフィールドがあります。どれも入力しなければ記事ページに出ません。

| フィールド | 管理画面の表示名 | 型 | 記事ページでの出方 |
|---|---|---|---|
| `cost_estimate` | 料金の目安 | `string` | タイトルの下の枠に「料金の目安」として出る |
| `run_environment` | 動かした環境 | `string` | 同じ枠に「動かした環境」として出る |
| `verified_at` | 動作確認日（YYYY-MM-DD） | `string`（`YYYY-MM-DD` の形か空欄だけ受け付ける） | 公開日の横に「動作確認日 2026年10月30日」の形で出る |

管理画面で動作確認日の欄を消して保存すると、空の文字列 `""` が送られます。検証の正規表現を `^(\d{4}-\d{2}-\d{2})?$` にして空の文字列も通しているのは、そのときに保存全体が 400 で失敗しないようにするためです。記事ページは空の値を未入力として扱います。

動作確認日を `datetime` にしていないのは、EmDash の `datetime` が時刻付きの瞬間を UTC で保存する型で、暦の日付には `string` を使うようドキュメントに書かれているためです（https://docs.emdashcms.com/reference/field-types/ 、2026-10-31 確認）。

フィールドの定義は `seed/seed.json` にあります。seed が使われるのは、空の DB でセットアップ画面を終える前の最初の1回だけです。すでにセットアップを済ませた DB（ローカルの `.wrangler/` を含む）には、seed を変えても追加されません。その場合は管理画面の Content Types から足すか、`npx emdash schema add-field posts cost_estimate --type string --label "料金の目安" --url <サイトの URL>` のように CLI で足します（https://docs.emdashcms.com/deployment/schema-evolution/ 、2026-10-31 確認）。`emdash-env.d.ts` は `npm run dev` を起動したときに、ローカルの DB のスキーマから作り直されます（https://docs.emdashcms.com/reference/cli/ の「Generated files」）。

## OGP 画像

記事の OGP 画像は、SEO パネルの OG Image があればそれを使い、無ければ `/og/posts/<slug>.svg` でタイトルから作る SVG を使います。X や Facebook は SVG を表示しないので、SNS に画像を出したい記事は OG Image に PNG か JPEG を設定します。Worker の中で PNG に変換しない理由は、測った値とあわせて [docs/decisions/ogp.md](./docs/decisions/ogp.md) にあります。

## 無料枠に収まるか

Workers の無料枠では、Worker のサイズは圧縮前で 64 MiB まで、CPU 時間は1回の呼び出しで 10 ms までです。10 ms の上限は HTTP リクエストだけでなく Cron Trigger にもかかります（https://developers.cloudflare.com/workers/platform/limits/ 、2026-10-31 確認）。

- サイズ: `npx wrangler deploy --outdir bundled/ --dry-run` の結果は `Total Upload: 16062.39 KiB / gzip: 4255.24 KiB` でした。圧縮前 15.69 MiB で、上限の約 25% です（2026-10-31、emdash 1.4.0）。`bundled/` は `.gitignore` 済みです。
- CPU 時間: ローカルでは測れません。deploy のあと、全ページを巡回して Error 1102（Worker exceeded resource limits）が出ないこと、ダッシュボードの Metrics → Errors の呼び出しの状態に Exceeded resources が無いこと、Settings → Trigger Events で毎分の cron が成功していることを Claude が確かめます。

測り方と本番で確かめる手順の詳細は [docs/verification/free-tier.md](./docs/verification/free-tier.md) にあります。

## 持ち主の作業

deploy の手順と、持ち主にしかできない作業は [OWNER_TASKS.md](./OWNER_TASKS.md) にまとめています。

## 個人情報と法律まわり

メルマガ登録でメールアドレスを集めるため、次の3点を決めています。前の2点は作ってあり、3点目は今回は作りません。

- プライバシーポリシーのページ（`/privacy`）に、集める情報（メールアドレス）、使い道（メルマガと特典の送付）、保存場所（D1）と読み書きする人、削除の依頼方法を書いています。問い合わせ先（`PUBLIC_CONTACT_EMAIL`）が決まるまで、登録フォームは受け付けません。
- 登録フォームには Cloudflare Turnstile（無料）を入れ、ボットの登録を防ぎます。本番ではキーが2つそろうまで登録を受け付けません。
- 特定商取引法に基づく表記は今回の範囲外です。教材を売り始めるときに用意します。

配信サービスにはまだつないでいません。EmDash に使えるフォーム機能が無いので、登録は D1 の独自テーブル `newsletter_subscribers` に保存します（[docs/decisions/subscribe.md](./docs/decisions/subscribe.md)）。最初のメールを送る前にダブルオプトインにします（[docs/verification/post-deploy.md](./docs/verification/post-deploy.md) の 6）。

## 役に立ったかを測る

PoC の目的は、自動化した執筆と公開が役に立つかを判断することです。そのために次の3つを入れます。

- Cloudflare Web Analytics（無料）でページビューを取ります（上の作業5で有効にします）。
- Google Search Console にサイトを登録します（上の作業5）。
- 公開から30日後に、表示回数、クリック数、記事ごとの流入を Search Console API で取得して報告します。この取得は、最初の記事を予約公開した時点で Claude Code の scheduled task を1回分作って起動します。認証は上の作業5で済ませたものを使います。

## 現状

2026-10-31 時点では、サイトは Cloudflare にまだ deploy されていません。公開 URL は `https://ai-eng-blog.kouiso.workers.dev` に決めましたが、まだ何も表示されません。経緯は [PBI #1](https://github.com/kouiso/emdash/issues/1) と [VERIFICATION.md](./VERIFICATION.md) に記録しています。deploy のあとに確かめることは [docs/verification/post-deploy.md](./docs/verification/post-deploy.md) にまとめています。

- 接続済みの Cloudflare プラグインでアセットのアップロードセッションは作れましたが、アセットのアップロード API が `Unauthorized` を返しました。原因はわかっていません。
- この作業環境では Wrangler の CLI が未認証で、Cloudflare API への直接のリクエストは HTTP 403 で拒否されます。失敗のあと、新しい認証や別の公開経路は試していません。
- 作成済みのリソースは次のとおりです。あとで正式に deploy するときに使います。中身は、2026-10-31 に持ち主が Cloudflare のダッシュボードで確かめたところ空でした（D1 はテーブル 0、R2 はオブジェクト 0、KV はキー 0）。この作業環境からは Cloudflare に入れないので、Claude は確かめていません。
  - D1 `emdash-trial-20261021-db`（バインディング `DB`）
  - R2 `emdash-trial-20261021-media`（バインディング `MEDIA`）
  - KV `emdash-trial-20261021-session`（Astro 標準の `SESSION`）
- Worker `ai-eng-blog` はまだ作成も deploy もされていません（`wrangler.jsonc` の Worker 名。2026-10-31 に旧名 `emdash-trial-20261021` から変更）。D1、R2、KV は上の旧名のリソースをそのまま使い、名前、ID、バインディングは変えていません。静的アセットは Workers Assets（`ASSETS`）で配る設定です。
- 旧名の Worker `emdash-trial-20261021` は、ダッシュボードに中身の無い Worker として存在します。一度も deploy されておらず、バインディングは無く、workers.dev とプレビューの URL は無効で、外から届きません（2026-10-31 に持ち主がダッシュボードで確かめた内容。Claude は確かめていません）。以前は「作られていない」と書いていましたが、誤りでした。残しておいても公開されないので、消すかどうかは持ち主が決めます。
- Workers Builds では、ダッシュボードの Worker 名と `wrangler.jsonc` の `name` が一致しないとビルドが失敗します（https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/ 、2026-10-31 確認）。Worker をつなぐときは `ai-eng-blog` という名前にします。
- リポジトリ名は旧名（`emdash`）のままです。`package.json` と `package-lock.json` の `name` は `ai-eng-blog` です。
- Access、LOADER、AI、メール、独自 DNS、有料 CI は追加していません。フォントは OS 標準で、外部の Web フォントは読み込みません（2026-10-31 に Google Fonts の読み込みを外しました）。画像変換は無効です。
- ローカルでのビルド、型チェック、テスト（`npm test`）、`wrangler deploy --dry-run`、`wrangler dev --local` と Playwright での画面の確認は、2026-10-31 に通っています（VERIFICATION.md の「2026-10-31 の追記」）。

[OWNER_TASKS.md](./OWNER_TASKS.md) の「ユーザーにしかできないこと」の1が済めば、deploy は GitHub への push から行われる見込みです。今回の `Unauthorized` がその経路でも起きるかは、まだ確かめていません。

## クレジット

- EmDash の公式 Cloudflare starter（[`emdash@1.3.1` の release commit](https://github.com/emdash-cms/emdash/tree/12a179389f07821beb819a684e62627e6017ba8d/templates/starter-cloudflare)）をもとにしています。Copyright 2026 Cloudflare Inc.、[MIT ライセンス](./LICENSE)です。変更点は [NOTICE.md](./NOTICE.md) にあります。
- 文章の規約は [hana652/tech-writing-pack](https://github.com/hana652/tech-writing-pack) を `docs/tech-writing-pack/` に変更なしで同梱しています。ライセンスは [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) です。取り込んだ版と出典は [NOTICE.md](./NOTICE.md) にあります。
