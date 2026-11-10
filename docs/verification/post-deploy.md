# deploy のあとに本番で確かめること

ローカルの `wrangler dev` では確かめられず、本番に deploy してからでないとわからないものをここに集める。2026-10-31 のレビュー（0d648ef を読んだ敵対レビュー）で「本番でしか確かめられない」とされたものと、そのとき直した設定の本番での効き目を含む。

2026-10-31 時点で、Worker `ai-eng-blog` はまだ deploy されていない。下はどれも未確認。確かめたら、日付、見たもの、結果を各項目の下に書き足す。

公開 URL は `https://ai-eng-blog.kouiso.workers.dev`（`wrangler.jsonc` の `EMDASH_SITE_URL`）。以下 `<URL>` と書く。

## 1. deploy の直後（管理者を作る前に、README の手順 3 と 4 のあいだで行う）

- [ ] `<URL>/robots.txt` の `Sitemap:` 行が `https://ai-eng-blog.kouiso.workers.dev/sitemap.xml` になっている。`http://` や別のホスト名なら、`EMDASH_SITE_URL` が効いていない。管理者を作らずに止める。
- [ ] `<URL>/privacy` の `<link rel="canonical">` が `https://ai-eng-blog.kouiso.workers.dev/privacy` になっている。
- [ ] Version URL が無効になっている。ダッシュボードの Worker の Settings → Domains & Routes で Preview URLs が無効になっていることを見る（`wrangler.jsonc` の `"preview_urls": false`。https://developers.cloudflare.com/workers/configuration/previews/ ）。有効なら、管理者を作らずに止める。
- [ ] Turnstile のキーが無いあいだ、`<URL>/` のフォームの入力欄が無効で、理由が表示されている。`curl -X POST -H 'Accept: application/json' -d 'email=check@example.com&consent=yes' <URL>/api/subscribe` が `503` と `"error":"unavailable"` を返す（キーなしで本番が登録を通さないこと）。

## 2. CPU 時間（無料枠の 10 ms）

手順の詳細は [free-tier.md](./free-tier.md) の「本番で確かめること」にある。少なくとも次の3つを見る。

- [ ] `<URL>/` を開いて、Error 1102（Worker exceeded resource limits）にならない。
- [ ] 記事を1本公開したら、`<URL>/posts/<slug>` を開いて、Error 1102 にならない。記事が増えたら `/posts` とあわせて見直す。
- [ ] scheduled event（毎分の Cron Trigger）の CPU 時間。deploy から 15 分以上たってから、Settings → Trigger Events で直近の実行が成功していること、Workers Logs で scheduled の呼び出しの CPU 時間が 10 ms を超えていないこと、Metrics の Invocation Statuses に Exceeded resources が無いことを見る。予約した記事が時刻どおりに公開されたかもあわせて見る。

## 3. サイトマップ

- [ ] `<URL>/sitemap.xml` が 200 で、`<loc>` がすべて `https://ai-eng-blog.kouiso.workers.dev/` で始まる。
- [ ] `<loc>` に並んだ子サイトマップを1つずつ取得して、すべて 200 になる（404 の子サイトマップを載せていない。[../decisions/sitemap.md](../decisions/sitemap.md)）。
- [ ] 503 が返るなら、Workers Logs で `[sitemap]` のエラーを見る。

## 4. 変数と secret

- [ ] 公開してよい値（`PUBLIC_TURNSTILE_SITE_KEY`、`PUBLIC_CF_ANALYTICS_TOKEN`、`PUBLIC_CONTACT_EMAIL`）を `wrangler.jsonc` の `vars` に足して deploy したあと、Worker の Settings → Variables and Secrets にその値が出ている。ダッシュボードで直接足した変数は次の deploy で消えるので、ダッシュボードでは足さない（[../decisions/site-url.md](../decisions/site-url.md)）。
- [ ] `TURNSTILE_SECRET_KEY` を secret として登録したあと、もう一度 push して deploy しても secret が残っている。

## 5. 登録フォーム（Turnstile と問い合わせ先がそろってから）

- [ ] `<URL>/privacy` の「6. お問い合わせ先」に `PUBLIC_CONTACT_EMAIL` のアドレスが出ている。`[連絡先]` や「準備しています」の文が残っていない。
- [ ] `<URL>/privacy` の「4. 利用している外部サービス」に Turnstile が出ている。Web Analytics を有効にしたなら、それも出ている。出る項目が変わったので、`src/utils/subscribers.ts` の `PRIVACY_POLICY_VERSION` を上げたかを確かめる。
- [ ] `<URL>/` で Turnstile のウィジェットが出て、自分のアドレスで登録できる。`npx wrangler d1 execute DB --remote --command "SELECT email, consent_policy_version FROM newsletter_subscribers"` に1行入っている（最初の1件でテーブルが作られる）。
- [ ] ウィジェットを通さない `curl` の登録が `captcha_failed`（400）になる。
- [ ] `/api/subscribe` に WAF のレート制限ルールを1つ作る。Turnstile を通った送信でも、同じ IP から短い間に何度も送られると D1 の書き込みが無料枠を食うため。
  - 前提: ルールは自分のゾーン（Cloudflare に追加した独自ドメイン）に対して作る。Worker をそのゾーンの [Custom Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) か route で動かしてから行う。`*.workers.dev` は Cloudflare が管理するゾーンで、自分のゾーンに作ったルールはそこには効かない（[workers.dev のページ](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) の Browser Integrity Check の節。2026-11-10 確認）。`*.workers.dev` だけで動かしているあいだは、このルールは作れないので未対応として残す。
  - 無料プランで使える範囲（[Rate limiting rules の Availability 表](https://developers.cloudflare.com/waf/rate-limiting-rules/)、2026-11-10 確認）: ルールは1つ、数える単位は IP だけ、数える期間と遮断の長さはどちらも 10 秒だけ、条件に使えるのは Path と Verified Bot。リクエストのメソッド（POST）は Business 以上でないと条件にできない。このサイトで `/api/subscribe` に来るのはフォームの POST だけなので、Path だけで POST を絞ったのと同じになる。
  - 作り方（[ダッシュボードでの作成手順](https://developers.cloudflare.com/waf/rate-limiting-rules/create-zone-dashboard/)、2026-11-10 確認）: ゾーンの **Security rules** → **Create rule** → **Rate limiting rules**。**Rule name** は `subscribe-post`。**Field** を `URI Path`、**Operator** を `equals`、**Value** を `/api/subscribe`。**With the same characteristics** は IP。**When rate exceeds** は 10 秒に 5 回（人が普通に送るのは1回で、入力ミスの再送を足しても 5 回には届かない）。**Choose action** は Block、**Duration** は 10 秒。**Deploy** を押す。
  - 確かめ方: 同じ端末から `for i in $(seq 1 8); do curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Origin: <URL>" <URL>/api/subscribe; done` を流し、途中から 429 が返る。10 秒待つと、また 400 などのいつもの応答に戻る。Security → Events にそのルールの Block が出ている。

## 6. 最初のメールを送る前（配信サービスにつなぐとき）

- [ ] ダブルオプトインにする。登録済みのアドレスに確認のメールを1通だけ送り、確認のリンクを押した人にだけメルマガと特典を送る。リンクを押さなかったアドレスには2通目を送らない。
- [ ] 確認のメールに、配信停止の方法とプライバシーポリシーへのリンクを入れる。
- [ ] 送る前に、メールの配信を始めることをプライバシーポリシーとトップの文言に反映する（今は「配信はまだ始めていません」と書いている）。
