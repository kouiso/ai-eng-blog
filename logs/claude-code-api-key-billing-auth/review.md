# review: claude-code-api-key-billing-auth

- 点検した日: 2026-11-11
- 書いた道具: Claude Code のサブエージェント（Claude）。API キーは使っていない（`run/18.log`、`run/22.log`、`run/25.log` の init の `apiKeySource` が `none`。ダミーのキーを置いた `run/19.log`、`run/21.log` は意図どおり `ANTHROPIC_API_KEY`）
- 点検した道具: Claude Code のサブエージェント（Claude、Sonnet 5.5）。書いたエージェントとは別。Claude Code のバージョン 2.1.322 (Claude Code)。プランのログイン。点検側はモデルを呼ぶ記事のコードを動かしていない
- 結果: 直すべき指摘 1 件、任意の指摘 7 件

## 直すべき指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | content/articles/claude-code-api-key-billing-auth.md:85 | 「キーで動いているときは `api_key` になり、`apiKeySource` の行も加わります（出典3）」の出典3は、この断定を支えていない。出典3（CLI reference）が `claude auth status` について書くのは「JSON で表示する」「`authMethod` は none、claude.ai、oauth_token、api_key、api_key_helper、third_party のどれか」まで。`apiKeySource` の語は出典3のページに0回（点検時に取得して数えた）。また「キーで動いているとき」と一般化しているが、実測したのは環境変数のキーだけで、設定の `apiKeyHelper` なら出典3の一覧では `api_key_helper` になる | 出典3の本文に `apiKeySource` が0件。実測の根拠は `run/16.log:9-10`（環境変数のキーのときだけ `api_key` と `apiKeySource` が出た）。`sources.md:9` も出典3で確かめた事実に `apiKeySource` を挙げていない | 出典3を付けるのは「`authMethod` が `claude.ai` なら」までにする。後半は「環境変数のキーを置くと `api_key` になり、`apiKeySource` の行も出ました（実行結果は下の再現）」のように実測として書き、一般化を外す。`apiKeyHelper` の場合は `api_key_helper` になる、と出典3の一覧どおりに1語足してもよい |

## 任意の指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | logs/claude-code-api-key-billing-auth/gate.md:84 と 3 | 末尾の「結果」が古いまま。「G10（CSV 待ち）が NG」「`status: draft` で止める」と書いているが、G10 の行（36行目）は OK。3行目の追記で説明はあるが、結果の節と矛盾が残る。G07 の NG は今も本当 | gate.md:36 は G10 OK、gate.md:84 は G10 NG | 結果の節を現状に合わせて書き直す（G07 と G11 だけが残る、と書く） |
| 2 | logs/claude-code-api-key-billing-auth/selection.md:7、11、34、brief.md:5 | 「CSV は1つも無い」「`target_query` は null」「G10 は NG」と書かれたまま。追記（42行目以降）で変わったが、冒頭は古い。28本という数（23行目、gate.md:32）も、`content/articles/` の現状（この記事のほか29本）と合わない。selection.md:48 は「ほかの29本」と書いていて、同じファイル内でも食い違う | `ls content/articles` で 30 本（.gitkeep を除く）。selection.md:23 は28本、selection.md:48 は29本 | 冒頭の段落を現状に直す。本数は数え直して1つに揃える |
| 3 | content/articles/claude-code-api-key-billing-auth.md:136-138 | 「トークン数が 0」の根拠になった `--output-format json` のコマンドが、記事に載っていない。読者は自分で確かめられない。数値は `run/23.log` と一致している | run/23.log:8（`"total_cost_usd":0,"input_tokens":0,"output_tokens":0`）。記事のコードブロックは20個で、23番のコマンドは含まれない（check-code-and-outputs.txt:1） | 記事に `--output-format json` の短い実行例を足すか、「`--output-format json` で受け取ると」とコマンドの形を1行で示す |
| 4 | content/articles/claude-code-api-key-billing-auth.md:2、target_query | 狙う語「claude code api 従量課金」のうち、タイトルに「Claude Code」が無い（先頭は「LLM API」、括弧内は「Agent SDK、claude -p、Invalid API key」）。本文は「従量課金で動く原因と直し方」に答えているので、答えは合っているが、タイトルは弱い一致。検索語は `keywords/google-suggest-llm-api.csv:51` に1文字違わず存在する | CSV 51行目、記事 title | 講座のキーワード「LLM API」を先頭に残すなら、括弧内に「Claude Code」を足す（60字以内に収まるか、`prose-check.py` で数え直す） |
| 5 | content/articles/claude-code-api-key-billing-auth.md:96、93 | 「プランで動かしたいなら、`none` 以外はすべて外します」とあるが、表の `/login managed key`（Console のログインで保存されたキー）と `apiKeyHelper` の外し方は書かれていない。`apiKeyHelper` は設定ファイルの節（311行目）にも出てこない。出典1の優先順位では `apiKeyHelper` は4番目 | authentication ページの優先順位の一覧（点検時に取得）。記事:311-315 は `env` だけを扱う | 外し方が書いてあるのは `ANTHROPIC_API_KEY` だけ、と気づけるようにするか、設定の節に「`apiKeyHelper` が設定されていても同じ」と事実を1文足す（実測はしていないので、出典1を引く形で） |
| 6 | content/articles/claude-code-api-key-billing-auth.md:189-199 ほか | 出力の `2` はモデルの回答で、実行のたびに同じになる保証はない。「数字だけで答えてください」と頼んでいるので実際は安定しやすいが、記事は固定の結果として載せている（`run/18.log`、`22.log`、`25.log` の3回とも `2`） | run/18.log:10、run/22.log:10、run/25.log:10 | 判定に使うのは `apiKeySource` と `is_error` で、`2` は目印にすぎない、と1文足すか、実行結果の差を気にしなくてよいことを示す |
| 7 | content/plan.md:46 | 一覧のタイトルが旧題（「Agent SDK と claude -p が API キーの従量課金で動いてしまう原因と直し方【apiKeySource で確かめる、Invalid API key】」）のまま。記事の title と食い違う。本記事の公開前ゲートの外 | plan.md:46、記事:2 | plan.md を現行のタイトルに合わせる（メインエージェントが `content/plan.md` を整える段で） |

## 確かめて問題が無かったこと

- 数値と出力: 記事の20個のコードブロックと、`run/14.log` から `run/22.log` のコマンドと出力が一致することを、`python3 -I logs/claude-code-api-key-billing-auth/lint/check-code-and-outputs.py content/articles/claude-code-api-key-billing-auth.md logs/claude-code-api-key-billing-auth` で確かめた（スクリプトを先に読んでから実行。出力は `ALL OK`）。
- 引用した警告: 記事の123行目の「claude.ai connectors are disabled because ANTHROPIC_API_KEY or another auth source is set ...」は、`run/16.log:11`、`run/23.log:7`、`run/24.log:7` の文面と一字違わない（最新の14から26番のログ）。
- ダミーのキー: 記事とログとコードで `sk-ant-` を含む語は `sk-ant-invalid-demo` だけ。記事から `sk-ant-invalid-demo` 以外の `sk-ant-` を探して0件。
- 本文の数: `total_cost_usd`、入力と出力のトークン数が 0 は `run/23.log:8`、`exit=1` は `run/16.log:13`、`run/24.log:9`、型の確認の `Version 7.0.2` と `tsc_exit=0` は `run/26.log:8-9`。frontmatter の `run_environment`（Node.js 22.23.4、npm 10.9.9、Claude Code 2.1.322、Agent SDK 0.3.322、macOS arm64、TypeScript 7.0.2）は `run/14.log`、`run/18.log`、`run/26.log` の見出し行と一致。
- 日付: ログの時刻は UTC の 2026-11-12T01:01〜01:02。点検時の `date` は PST で 2026-11-11 17:21、UTC で 2026-11-12 01:21 で、PST の日付は 2026-11-11。`verified_at` と末尾の「2026-11-11 に実際に実行して確認」は合っている。
- 厳格な MCP 設定: `query()` の2か所（`code/check-auth.ts:11`、`code/plan-only.ts:11`）に `strictMcpConfig: true`、`claude -p` の3か所（`code/repro-cli.sh:2`、`run/23.log:5`、`run/24.log:5`）に `--strict-mcp-config`。`claude -p` を使うコマンドはほかに無い。`extra/run-all.sh:56、58` の2つも付いている。
- プランで動いた実行: `run/18.log`、`run/22.log`、`run/25.log` の init が `apiKeySource: none`。
- 出典の取得（点検時に開いたページ）: authentication（優先順位の一覧で `ANTHROPIC_API_KEY` が3番目、`/login` が7番目、「prompted once」と「non-interactive mode (-p), the key is always used」、`unset` の記述）、Agent SDK TypeScript（`ApiKeySource` の4値の表、`authentication_failed`、`env` が `process.env` を置き換える記述）、pricing（Haiku 5.5 が100,000トークン以下で入力 $0.10、出力 $0.50 / MTok）、settings-reference（`env` の値が同じ名前のシェルの変数を上書きする）、legal-and-compliance（キーで認証した分は「billed to the key owner」）、cli-reference（`claude auth status` は JSON、`authMethod` の6値）、errors（`Invalid API key · Fix external API key` の表示）。記事の該当する断定はそれぞれ支えられている（85行目の後半を除く）。
- 出典の対応: 本文の出典1から11、末尾の表11行、frontmatter の `sources` 11件、`sources.md` の表11行が、番号、URL、題名で揃っている（目で突き合わせた）。使われない出典は無い。
- 利用条件の文: 利用条件、個人利用の限定、Console でキーを発行する勧め、のような文は本文に無い。93行目の「Claude Console のアカウントでログインしたときに保存されたキー」は `ApiKeySource` の表の技術的な説明で、許される範囲。
- リンク: `llm-api-429-retry-sdk-mock`、`claude-agent-sdk-structured-output`、`claude-p-script-first-call`、`claude-agent-sdk-first-agent`、`ai-agent-max-turns-budget-limit` が `content/articles/` にある。旧 slug 4つは記事に無い。`content/plan.md` の番号4が `llm-api-429-retry-sdk-mock`、5が本記事、6が `claude-agent-sdk-structured-output` で、`prev`、`next` と一致。相手の記事も `llm-api-429-retry-sdk-mock` の `next` が本記事、`claude-agent-sdk-structured-output` の `prev` が本記事。リンクの説明（429 エラーの回、構造化出力、`for await` が結果のあとで例外を投げる動き）は、相手の本文と合う（`ai-agent-max-turns-budget-limit.md:51`、`:55`）。
- ゲートの OK 行: G01、G02、G04、G05、G08、G09、C08、C25、C37 を確かめた。lint 2本を標準出力に出し直し、`ai-smell` が `致命なし`、`use 0件 / 📎mention 0件`、`writing-lint` が `FATAL 0 / DENSITY超過 0 / SHOULD 0` で、保存済みの判定行と一致。C25 は `prose-check.py` を標準出力に出して `over60=0 max=60`。G09 はログの `@` を含む行は `@anthropic-ai` と gate の検索語の説明だけ。`/Users/`、`session_` の実際のパス、メール、トークンは0件。G04 の「20ブロックが全部一致」は上記スクリプトで本当。
- target_query: 「claude code api 従量課金」は `keywords/google-suggest-llm-api.csv:51` の `suggestion` に1文字違わず1行あり、ほかの記事の `target_query` には無い。記事は原因、見分け方、外し方を答えており、検索の問いに合っている。
- 読者テスト: `claude auth status` と `claude -p` で `apiKeySource` を確かめる順序が整っている。ダミーのキーで再現するので、読者が実際の請求を心配せず試せる。

## 確かめていないこと

- 記事のコードの再実行（brief の制限で、モデルを呼ぶことを禁じられたため）。
- 公開側の確認。G07 は gate.md のとおり、リンク先5本が下書きで、今は公開されていない（点検対象外。メインエージェントが公開順を決める段で見る）。
- 出典のうち Node.js の2ページ（`--env-file` と、22.18.0 の type stripping）と、legal-and-compliance の別の節、sdk.d.ts のコメントは、点検時に開いていない。`sources.md` の記述との一致も、原文で確かめていない。
- `~/.claude/settings.json` に `env` でキーを置いたときの実測（記事は `--settings` で代えたと書いており、この点は記事に正直に書いてある）。
- Google 上位記事との比較。

## 対応（2026-11-11）

| 指摘 | 対応 | 変えた場所（または見送りの理由） |
|---|---|---|
| 直すべき #1 | 直した | 記事:85。出典3を付けるのを `authMethod` が `claude.ai` の部分までにし、後半は「環境変数のキーを置くと `api_key` になり、`apiKeySource` の行も出ました（実行結果は下の再現）」という実測の書き方にした。`sources.md` に85行目（後半）の行を足し、根拠を `run/16.log:9-10` とした |
| 任意 #1 | 直した | gate.md:84 の結果の節を、G07 が NG（公開の順番で解消する。今は直さない）、G11 は再点検待ち、G10 は OK に書き直した |
| 任意 #2 | 直した | selection.md:7、11、23、34 と brief.md:7、55 の古い記述を現状に合わせた。本数は `ls` で数え直して29本（この記事のほか）に揃え、gate.md:32 も直した |
| 任意 #3 | 見送り | 記事は 136 行目で `--output-format json` を名指ししており、数値は `run/23.log` と一致する。実行例のコードブロックを足すのは新しい範囲 |
| 任意 #4 | 見送り | 事実の誤りではなくタイトルの方針。ここで変えると SEO の判断を足すことになる |
| 任意 #5 | 見送り | `apiKeyHelper` の外し方は実測しておらず、足すと新しい節になる |
| 任意 #6 | 直した | 記事:189。出力の `2` は目印にすぎず、判定は `apiKeySource` と `is_error` で行うこと、`none` だった3回（`run/18.log`、`run/22.log`、`run/25.log`）はどれも `2` だったことを書いた |
| 任意 #7 | 見送り（メインが直す） | `content/plan.md` はこの作業の範囲外 |

点検の結果（2026-11-14）: 直すべき指摘 1

- gate.md の行番号と数が今の原稿（347行）と合わない。`gate.md:34` G08 は「349行目」だが末尾は `content/articles/claude-code-api-key-billing-auth.md:347`。`gate.md:60` C19 は `prose-check.txt` 6行目 `non-desumasu prose=0` と書くが、保存済みも回し直しも `non-desumasu prose=1`（:85 の「（実行結果は下の再現）。」。中身はですますで誤検出だが、gate の根拠の値が違う）。全12本で `lint/prose-check.txt` が今の原稿に回し直した結果と食い違う（原稿を直したあとに証跡を取り直していない。2026-11-14 の本文リンクを外した直しが原因と見られる）

対応（2026-11-14）:

- gate.md の行番号と数と引用: 全行を今の原稿の行に合わせて書き直した。主な行は gate.md:28（G02）、gate.md:34（G08）、gate.md:57（C16）、gate.md:58（C17）、gate.md:60（C19）。
- `lint/prose-check.txt`: 今の原稿で回し直し、`lint/ai-smell.txt`、`lint/writing-lint.txt`、`lint/check-code-and-outputs.txt` も取り直した（`lint/` 内の各ファイル）。

点検の結果（2026-11-14 2回目）: 直すべき指摘 1

- `logs/claude-code-api-key-billing-auth/gate.md:61` C20 の根拠の引用「エラーを再現する」（110行目）と「エラーで止まりました」（130行目）は原稿に無い。`content/articles/claude-code-api-key-billing-auth.md:110` は見出し「無効なダミーのキーで Invalid API key を再現する」、`:130` は「今回はキーが無効なので、ここで止まりました。」で、どちらの行にも「エラー」の語が無い。「エラー」に付く動詞の判定の根拠になっていない。今の原稿の「エラー」の出る行（例 `:219`「API のエラーで終わったターン」）で根拠を書き直す。

点検した道具: Claude のサブエージェント（Opus 5.5、この記事の執筆と直しには関わっていない）。環境変数 `ANTHROPIC_API_KEY` は設定なし（`env` で0件）。やったこと: lint 2本を作業用の一時フォルダへ回し直し（ai-smell exit 0・FATAL 0、writing-lint `FATAL 0 / DENSITY超過 0 / SHOULD 0`、保存済みの `lint/` と一致）。`lint/check-code-and-outputs.py` と `lint/prose-check.py` を今の原稿で回し直し、保存済みと一致（ALL OK）。gate.md の G・C 行にある「N行目「引用」」「「引用」（N行目）」と、見出し・問い・段落を指す行番号を、全行スクリプトで今の原稿と照らした。G05 の出典の表の範囲と件数、引用している行の一覧を照らした。過去の点検の直すべき指摘（G07 を除く）は、今の本文の該当行を開いて閉じているか確かめた。地の文の3桁以上の数を run/ と code/ のログと照らし、見つからない数は計算で確かめた。ほかの記事を指す文は、指す先の記事が同じ記事の本文でリンクされているかを確かめた。G07 は対象外。本文の通読は、スクリプトで拾った箇所と過去の指摘の箇所に限った。

対応（2026-11-14 2回目）: gate.md:61 C20 の根拠を今の原稿の引用（110行目の見出し、130行目、219行目、233行目、59行目）に書き直し、110行目と130行目に「エラー」の語が無いことを明記した。gate.md:32 の他記事の行番号（first-agent 208行目、p-script 210行目の見出し）も直した。 全12本の gate.md の行番号・引用を照合するスクリプトを回し、食い違い0件（旧・当時の記録の行と、sdk.d.ts・dist・plan.md・run・lint のログの行は照合の対象外）。
