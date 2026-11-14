# 持ち主の作業

このリポジトリで Claude が代わりにできない作業の一覧です。上から順に進めます。チェックが付いたら、Claude にそのことを伝えてください。

## 本番に deploy する

Cloudflare のダッシュボードでの操作と、パスキーを登録する端末が要るので、持ち主が行います。手順 1〜7 は途中で止めずに続けて行います。公開されたサイトでは、セットアップを最初に終えた人が管理者になるためです。

1. 公開 URL を確かめる
   - 公開 URL は `https://ai-eng-blog.kouiso.workers.dev` です。`wrangler.jsonc` の `EMDASH_SITE_URL` にこの値が入っています（2026-10-31、持ち主がダッシュボードの Workers & Pages の「Your subdomain」で `kouiso` を確かめた値）。
   - ダッシュボードの「Your subdomain」が `kouiso` のままであることを、deploy の前にもう一度確かめます（https://developers.cloudflare.com/workers/configuration/routing/workers-dev/ 、2026-10-31 確認）。違っていたら、先に Claude に伝えて `EMDASH_SITE_URL` を直してもらいます。URL の形の値が違っていてもエラーは出ず、パスキーが違うアドレスに結び付きます。理由は [docs/decisions/site-url.md](./docs/decisions/site-url.md) にあります。
2. Worker をつなぐ
   - Workers & Pages で Create application を選び、GitHub を選んでこのリポジトリを選びます（https://developers.cloudflare.com/workers/ci-cd/builds/ 、2026-10-31 確認）。
   - Worker 名は `ai-eng-blog` にします。`wrangler.jsonc` の `name` と違うと、ビルドが `The name in your Wrangler configuration file (<Worker name>) must match the name of your Worker.` で失敗します（https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/ ）。
   - **Worker の名前もアカウントのサブドメインも、ここで変えません。** workers.dev の URL は `<Worker 名>.<サブドメイン>.workers.dev` の形なので、どちらかを変えると公開 URL が `EMDASH_SITE_URL` とずれます。変える必要が出たら、手順 4 に進む前に止めて、Claude に新しい URL を伝え、`wrangler.jsonc` の `name` と `EMDASH_SITE_URL` を直してもらってから続けます。最初の管理者を作ったあとで変えると、パスキーを作り直すことになります（下の「独自ドメインに移す」と同じ手順）。
   - 旧名の Worker `emdash-trial-20261021` は、中身の無い Worker としてダッシュボードに残っています（下の「現状」）。これには接続しません。
   - 設定は次のとおりです（https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ ）。

     | 項目 | 値 |
     |---|---|
     | Git branch | `main` |
     | Build command | `npm run build` |
     | Deploy command | `npx wrangler deploy` |
     | Root directory | 空欄（リポジトリの直下） |

   - Node.js の版は `.nvmrc` の `24` が使われます。npm の版は `package.json` の `packageManager` で決まり、`engines` では決まりません。このリポジトリには `packageManager` が無いので、ビルドイメージに入っている npm が使われます（https://developers.cloudflare.com/workers/ci-cd/builds/build-image/ ）。
   - Save and Deploy を選びます。
3. deploy が済んだことを確かめる
   - ビルドのログが成功で終わり、`https://ai-eng-blog.kouiso.workers.dev/` が表示されることを確かめます。
4. すぐに管理画面を開く
   - `https://ai-eng-blog.kouiso.workers.dev/_emdash/admin` を開きます。手順 1 の URL と完全に同じアドレスで開きます。パスキーは作ったアドレスでしか使えません（https://docs.emdashcms.com/guides/authentication/ ）。
   - 「Set up your site」のセットアップ画面が出たら、手順 5 に進みます。
   - **次のどちらかになったら、そこで止めます。** セットアップ画面が出ずにサインイン画面になった場合と、自分の知らない管理者がいる場合です。どちらも、自分より先に誰かがセットアップを終えたことを意味します。記事は公開せず、MCP もつながず、下の「D1 を作り直す」に進みます。
5. 最初の管理者を作る
   - サイトの名前を入れ、自分のメールアドレスと名前を入れます。
   - 最初の選択（コンテンツ）は、既定の「Sample content」のままにします。「Empty site」は選びません。「Empty site」を選ぶと、講座6語のタグが入りません。画面の説明は「例の記事と固定ページ」と書いてありますが、このサイトの `seed/seed.json` には英語のサンプル記事も固定ページも無いので、「Sample content」を選んでも入るのは講座6語のタグ（とカテゴリ General・Updates）だけです。
   - 「Create passkey」で、いま使っている端末にパスキーを登録します。
   - 管理者を作ったら、管理画面の Settings → General → Site Status で **Go live** を押し、staging（検索に載らない状態）を外します。EmDash 1.5.0 の新しいサイトは staging で始まり、外し忘れると記事が検索に出ません。確かめ方は [docs/verification/post-deploy.md](./docs/verification/post-deploy.md) の「1b」です。
   - 終わった後に、次のとおりになっていることを確かめます。`https://ai-eng-blog.kouiso.workers.dev/posts` の記事一覧が空で、`https://ai-eng-blog.kouiso.workers.dev/sitemap-posts.xml` に記事の URL が1つも無いこと。管理画面の Tags に、LLM API・構造化出力・RAG・AIエージェント・MCPサーバー・LLM 評価の6つだけがあり、Starter と Example が無いこと。Posts と Pages に、英語の「Welcome」と「About」が無いこと。
6. パスキーを2つにする
   - Settings → Security の Register Passkey で、別の端末（PC とスマートフォンなど）にもう1つ登録します。1人10個まで登録できます。パスキーが1つしかないと、その端末をなくしたときに入れなくなります。メールを設定していないこのサイトでは、復旧のマジックリンクも使えません（https://docs.emdashcms.com/guides/authentication/ 、2026-10-31 確認）。
   - 一度サインアウトし、2つのパスキーのそれぞれでサインインできることを確かめます。
7. 受け入れ条件を確かめる（VERIFICATION.md）
   - Posts でタイトル `試用確認・合成データ` の下書きを保存し、`fixtures/trial.png` をメディアにアップロードします。再読み込みして、どちらも残っていることを確かめます。

Git branch 以外のブランチに push すると、Workers Builds はプレビューを作ります（https://developers.cloudflare.com/workers/ci-cd/builds/ ）。プレビューはトップレベルのバインディングと `vars` を引き継がず、プレビューの URL は公開されます（https://docs.emdashcms.com/deployment/cloudflare/ ）。このリポジトリは `wrangler.jsonc` の `"preview_urls": false` で Version URL（プレビューの URL を含む）を切っているので、本番と同じ D1 に別の URL から届くことはありません（https://developers.cloudflare.com/workers/configuration/previews/ 、2026-10-31 確認）。ダッシュボードの Settings → Domains & Routes で Preview URLs を有効にし直さないでください。deploy のあと、Preview URLs が無効になっていることを確かめます（[docs/verification/post-deploy.md](./docs/verification/post-deploy.md)）。

### D1 を作り直す（手順 4 で止めたとき）

知らない人が管理者になった DB は使い続けません。記事を1本も入れていないうちに、空の DB に替えます。

1. ダッシュボードの D1 SQL database を開き、`emdash-trial-20261021-db` を選びます。
2. Settings で Delete を選び、確認の欄にデータベース名 `emdash-trial-20261021-db` を入れて削除します。
3. D1 SQL database で Create Database を選び、同じ名前 `emdash-trial-20261021-db` で作ります（手順の出典は https://developers.cloudflare.com/d1/get-started/ 、2026-10-31 確認）。
4. 新しいデータベースの ID（データベースの画面に出る UUID）を Claude に伝えます。Claude が `wrangler.jsonc` の `database_id` を書き換えて push します。名前とバインディング `DB` は変えません。
5. push で deploy されたら、すぐに上の手順 4 からやり直します。

R2 の `emdash-trial-20261021-media` と KV の SESSION はそのまま使います。知らない人がメディアを上げていた場合は、R2 の中身も消します。

### 独自ドメインに移す

最初は workers.dev で動かし、あとで独自ドメインに移すときの手順です。出典は https://docs.emdashcms.com/guides/change-domain/ と https://docs.emdashcms.com/deployment/cloudflare/ の「Custom domains」です（どちらも 2026-10-31 確認）。

先に知っておくことが2つあります。

- パスキーは作ったアドレスでしか使えません。workers.dev で作ったパスキーは、独自ドメインでは使えません。新しいドメインで作り直します。
- `EMDASH_SITE_URL` を別のドメインに変えると、サインインの場所もそのドメインに移ります。`EMDASH_SITE_URL` を設定しているあいだ、管理画面の Settings → General にある Site URL は、設定した値を表示します。メールやプラグインが使うアドレスを変えるには、設定を書き換えて deploy し直します。

手順です。

1. ドメインを用意する
   - ドメインは、Worker と同じ Cloudflare アカウントで有効になっている必要があります。
2. ドメインを Worker につなぐ
   - Claude が `wrangler.jsonc` に `"routes": [{ "pattern": "<新しいドメイン>", "custom_domain": true }]` を足して push します。`EMDASH_SITE_URL` はこの時点では workers.dev のままにします。
   - deploy のあと、workers.dev と新しいドメインの両方でサイトが出ることを確かめます。workers.dev を残しておくと、DNS の問題とアプリの問題を見分けられます。
   - `https://<新しいドメイン>/_emdash/admin` でサインイン画面が出れば、ドメインの準備はできています。
3. 古いアドレスでサインインしたまま、新しいアドレスでのサインインを用意する
   - workers.dev の管理画面でサインインしておきます。
4. `EMDASH_SITE_URL` を新しいドメインに変える
   - Claude が `EMDASH_SITE_URL` を `https://<新しいドメイン>` に書き換えて push します。
5. 新しいドメインでパスキーを登録し直す
   - Settings → General の Site URL の下にある「Continue on」を選びます。このボタンは、サインインしているアドレスが Site URL と違うときに出ます。
   - 新しいアドレスのサインイン画面で Continue を選びます。このリンクは1回だけ使えて、5分で切れます。
   - Settings → Security が開くので、Register Passkey で新しいアドレス用のパスキーを登録します。手順 6 と同じく、2つ目の端末でも登録します。
   - メールの設定は要りません。
6. 新しいドメインでサインインし直せることを確かめる
   - サインアウトし、新しいドメインの2つのパスキーのそれぞれでサインインできることを確かめます。
   - すべての管理者が新しいドメインでサインインできるようになるまで、古いアドレスを外しません。
7. MCP のコネクタを付け替える
   - claude.ai のカスタムコネクタの URL を `https://<新しいドメイン>/_emdash/api/mcp` に変えて、OAuth のログインをやり直します（MCP の discovery も `EMDASH_SITE_URL` に従うため）。

sitemap は最大1時間、robots.txt は最大1日、古い内容がキャッシュから返ることがあります。

## ユーザーにしかできないこと

どれもアカウントの持ち主の操作、ブラウザでのログイン、ユーザー自身の判断のどれかが要る作業です。Claude はこのリポジトリの中から代わりに実行できません。

1. Cloudflare の Workers と GitHub リポジトリをつなぐ
   - 手順は下の「本番に deploy する」の手順 1〜3 です。
2. 本番の EmDash 管理画面で最初の管理者を作る
   - 手順は下の「本番に deploy する」の手順 4〜7 です。Worker をつないだら、間を空けずに続けて行います。
3. claude.ai のカスタムコネクタに EmDash の MCP を追加する
   - claude.ai の設定からカスタムコネクタを追加し、URL に `https://<ドメイン>/_emdash/api/mcp` を入れます。
   - OAuth のログインを1回通します。PAT は作りません。
4. Search Console、Web Analytics、Turnstile の登録
   - Google Search Console にサイトを追加し、所有権の確認を済ませます。
   - Search Console のデータを Claude が読めるように認証します。手でトークンを作って渡す方法は使わず、ユーザーがログインして許可する方法（コネクタの OAuth など）にします（CLAUDE.md の秘密情報のルール）。具体的な方法は「実装時にドキュメントで確認する」項目です。
   - Cloudflare のダッシュボードで Web Analytics を有効にします。ビーコンのトークンの発行が要るかどうかを含め、手順は「実装時にドキュメントで確認する」項目です。トークンは公開してよい値なので、Claude に伝えます。Claude が `wrangler.jsonc` の `vars` に `PUBLIC_CF_ANALYTICS_TOKEN` として書いて push します。
   - Cloudflare のダッシュボードで Turnstile のサイトキーとシークレットキーを発行します。サイトキーは公開してよい値なので Claude に伝え、Claude が `vars` に `PUBLIC_TURNSTILE_SITE_KEY` として書いて push します。シークレットキーだけを、Worker の secret として登録します（ダッシュボードの Variables and Secrets で、種類を Secret にする）。リポジトリには入れず、Claude にも渡しません。
   - **サイトキーやトークンを、ダッシュボードの変数（種類が Text のもの）として登録しないでください。** push のたびに走る `wrangler deploy` が `wrangler.jsonc` の `vars` でダッシュボードの変数を上書きするので、次の deploy で消えます。secret は消えません（https://developers.cloudflare.com/workers/wrangler/configuration/ 、2026-10-31 確認。[docs/decisions/site-url.md](./docs/decisions/site-url.md)）。
   - Turnstile のキーが2つそろうまで、本番の登録フォームは入力欄を無効にし、登録を受け付けません（[docs/decisions/subscribe.md](./docs/decisions/subscribe.md)）。
   - プライバシーポリシーに載せる問い合わせ先のメールアドレスを決め、Claude に伝えます。Claude が `vars` に `PUBLIC_CONTACT_EMAIL` として書いて push します。決まるまで、登録フォームは受け付けません（登録した人が削除を頼む先が無いため）。
5. ラッコキーワードにログインする（任意。急ぎません）
   - ユーザーがやるのは、ラッコキーワードにログインすることだけです。講座のキーワード6語のそれぞれをかけて CSV を書き出す作業と、キーワードの選定は Claude が行います。置き場所と名前は [keywords/README.md](./keywords/README.md) にあります。
   - **CSV は public のこのリポジトリを通しません。** コミット、push、Issue や PR への添付、Gist はどれも使いません。ラッコキーワードの規約で、データの第三者への提供にライセンスが要るためです（keywords/README.md）。書き出した CSV は Claude Code の作業環境にだけ置きます。`keywords/*.csv` は `.gitignore` 済みです。
   - 最初の回は、Claude が集めた Google のサジェストの CSV で進めています（2026-11-11 の裁定）。ラッコの CSV は、検索ボリュームなどでキーワードを選び直したくなったときに、ログインして Claude に書き出させてください。Claude はラッコの画面から一覧を写し取りません（keywords/README.md）。
6. パイロット記事の報告に返事をする
   - 最初の1本を予約公開まで通したら、Claude がゲートの結果と気になった点を報告します。
   - 返事があるまで、Claude は2本目に進みません。

