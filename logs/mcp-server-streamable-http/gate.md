# gate: mcp-server-streamable-http

判定日: 2026-11-02。原稿: `content/articles/mcp-server-streamable-http.md`（588行。行番号はすべてこの版）。

## 判定の前に読んだもの

2026-11-02 に、次を Read ツールで全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）
- `guides/06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `keywords/README.md`（35行）

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行（`title`、`description`、`sources` の `title`）で出た `📎mention` は use として扱い、FATAL に当たる種類なら不合格（手順7の「frontmatter の扱い」）。warn は1件ずつ判断し、use か mention かを記録した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」「lint との関係」を読んで判定。`lint/ai-smell.txt` 2行目 `✅ クリーン`、3行目 `use 0件 / 📎mention 0件`、4行目 `✅ 致命なし`、末尾 `exit=0`。frontmatter（1〜62行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行が `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD n` の形で、FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH（出たときだけ）、INFO(要人間確認) は1件ずつ判断を記録した。この FATAL 0 では個人名を検出できない（`PERSONAL_NAMES` が空）ので、個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `588行/217文`、判定行 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、末尾 `exit=0`。DENSITY は11カウンタすべて上限内（0回でないのは B-9 つまり 1回 / 上限2、363行目の換言。`judgments.md` に判断）。上限は guides/08 の標準レジスターと一致。途中の版の B-2 三連反復の超過1は直した（`judgments.md`）。WATCH 節なし、SHOULD 0件、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（47項目すべて True、`ALL OK`）: 記事のコード5つ（`package.json`、`tsconfig.json`、`src/server.ts`、`src/check.ts`、悪い例の `extra/reuse-snippet.ts`）が `code/` と1文字も違わず、記事の ts と json のコードブロックはすべて `code/` のどれかと一致。悪い例2つの全体（`server.reuse.ts`、`server.no-405.ts`）が記事の説明どおりの書き換えであることも機械で確認。記事のコマンド（`mkdir`、`npm install`、`npm run build`、`npm start`、`npm run check`、curl 5つ、`claude mcp` 4つ）がログの `command:` と同じで、記事の実行結果13個がログから取り出したものと一致。実行は `run/01.log`〜`34.log`（2026-11-02 15:04:46〜15:05:02 UTC、`code/extra/all-runs.sh` で空の作業場所から記事の順に実行、node v22.22.0、npm 10.9.4）。`npm start` の5回は Ctrl+C と同じ SIGINT で止めたので exit 130、悪い例の `diff` の2回と `npm run check`（悪い例1、`run/20.log`）は想定どおり exit 1、ほかは exit 0。30回の繰り返しは `run/35`、`36.log`、`@types/express` を外した型チェックは `run/37`、`38.log`。型は `run/34.log`（`--skipLibCheck false` でも `tsc_exit=0`）。LLM の API は呼ばない（`needs_api_key: false`、58行目） |
| G05 | 断定した事実すべてに一次情報の出典（URL とアクセス日）があり、それが本文に出ている。料金の目安がある。frontmatter の `cost_estimate`、`run_environment`、`verified_at` が埋まっていて、`run_environment` と `verified_at` が `run/` のログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 567〜586行目に出典の表（14件、題名、URL、確認日 2026-11-02）。断定した文は（出典n）で表を引く（`sources.md` に出典ごとの事実と原稿の文の対応。実行ログを根拠にした文は後半の表）。料金は 553〜557行目で、記事の手順は API を呼ばないので無料、`claude mcp` はログインなしで動いた（`run/13`〜`16.log`）、Claude にツールを呼ばせるには有料のプランか Console のアカウントが要る（出典13）、公開の置き場所の料金は実行していないので金額を書いていない。frontmatter 9〜11行目: `cost_estimate`、`run_environment`（Node.js 22.22.0 は `run/*.log` の見出し、SDK 1.32.2 は `run/32.log`、Claude Code 2.1.316 は `run/12.log`）、`verified_at: "2026-11-02"`（最後の実行 `run/38.log` の日付） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（11本、`selection.md` に列挙）。MCP の記事は `mcp-server-typescript-stdio`（stdio で作る）だけで、Streamable HTTP で動かす方法に答える記事は無い。ツールの中身と stdout のログの話は繰り返さず、前の記事へのリンクにした（70行目） |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 70行目 `/posts/mcp-server-typescript-stdio`（frontmatter 12行目 `prev`、plan #21）。次: 563行目 `/posts/mcp-inspector-debug`（13行目 `next`、plan #23）。前後は `content/plan.md` の course_step 5 の並びによる slug で、パスは既存の原稿と同じ `/posts/<slug>`。関連記事への内部リンクは、前の記事 `mcp-server-typescript-stdio`（既存の原稿で、内容が直接つながる記事）を兼ねる。`mcp-server-typescript-stdio` は原稿があるが `status: draft`（`publish_at: null`）で、公開も予約もされていない。`mcp-inspector-debug` は `content/articles/` に原稿が無い。今この記事を公開すると2本ともリンク切れになる。既存の原稿11本はどれも `status: draft` で、公開済みか予約済みの記事は0本。リンク先の slug: `mcp-server-typescript-stdio`、`mcp-inspector-debug` |
| G08 | 本文の最後の段落が「AI 支援で執筆」を含む決まった表記になっている | 原稿の末尾 | OK | 588行目「AI 支援で執筆しました。コードは 2026-11-02 に実際に実行して確認しています。」。日付は最後の実行（`run/38.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/mcp-server-streamable-http/` 全体（この gate.md を書く前）に `ANTHROPIC`、`sk-ant`、`token`、`password`、`secret`、`api_key`、`apikey`、`Bearer`、`hf_`、`/root`、`/home/user`、`tmp/claude`、`scratchpad` を大文字小文字を区別せず Python でかけた。該当は、原稿の「Anthropic のクラウド」「Anthropic の IP アドレス」（出典14 の内容）、`selection.md` の環境変数の名前と `unset` の記録、frontmatter の `needs_api_key`、slug `llm-api-cost-estimate-js-tiktoken` の一部、原稿と `sources.md` の「Bearer トークンで認証する例」（docs/server.md の節名）、`code/README.md` の作業場所の説明（scratchpad の語だけでパスは無い）。値としての API キーやトークンは0件（コードはキーを使わない）。ログの作業フォルダのパスは `run.sh` が `/path/to` に置き換えた（`/root`、`/home/user`、`tmp/claude` は0件）。Claude Code のコマンドは空の一時フォルダを HOME にして動かし、ログインしていない。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分、名前の各語とメールのローカル部と数字の ID）、ユーザーのメールアドレスのローカル部、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）を1語ずつかけ、すべて0件 |
| G10 | `target_query` が `keywords/*.csv` のどれかの行のキーワードと1文字も違わない。CSV が無いとき、null のとき、CSV に無い値のときは不合格（「CSV 待ち」） | `selection.md` | NG | `keywords/` に CSV が無い（README.md だけ、2026-11-02 に確認）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（stdio の MCP サーバーを作ったことがあり HTTP で受けたい開発者が、SDK v1 系で Streamable HTTP のサーバーを書く方法を検索したときに、コード一式、確かめ方、Origin の検査、つまずく2か所を実行結果つきで答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」。2行目「MCP サーバーを Streamable HTTP で動かす【TypeScript SDK、リモート接続の準備】」。講座のメインキーワード「MCP サーバー」を左に置き、方式（Streamable HTTP）、言語と道具（TypeScript SDK）、目的（リモート接続の準備）を含む。タイトルはワークフローの指示で与えられたもの。「徹底解説」「完全ガイド」は0件 |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」。64行目の3文で、答え（Streamable HTTP のトランスポートで作る）、作るもの（前の記事のツールを `http://127.0.0.1:3000/mcp` から呼べるようにする）、完成形（stdio と同じ1行の結果、66〜68行目に実物）を示した。70〜74行目で前の記事、確かめた範囲、対象読者、量と待ち時間を示した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアルか解説。guides/02 タイプ1 を原本で読み、要素ごとに照合した（`brief.md` の表）。リード（64〜74行目）→ 全体像（76行目）→ 前提（86行目）→ 番号付きの手順1〜5（117、184、274、343、438行目、各コードと実行結果）→ ハマりどころ（400、470、521行目）→ 公開の準備（541行目）→ 料金（553行目）→ まとめと次の記事（559行目） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード 64行目の1文目が答え（SDK の Streamable HTTP のトランスポートで作る）。最初の H2（76行目）は見出し自体が方式の答えで、ステートレスにする理由（84行目）が続く。手順2では「いちばん大事なのは `app.post` の中です」（260行目）を先に言い、各行の理由を後に置いた |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 76（方式）、86（環境）、117（準備）、184（サーバー）、274（SDK のクライアント）、343（curl）、400（Origin と Host）、438（Claude Code）、470（使い回し）、521（405）、541（claude.ai）、553（料金）、559（まとめ）、567（出典）。H3 は 102（ファイル構成）、369（406）、387（405）で、親の H2 の中の1話題ずつ |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「サーバーはリクエストごとに作り直す」「トランスポートを使い回すと2回目から 500 になる」「curl で送ると SSE の形で返る」「claude.ai からつなぐには公開 URL と認証が要る」。「まず〜する」型は0件。86行目「前提となる環境」、553行目「料金がかからない範囲」は中身を名詞で示す見出し |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1 の肝、guides/01 §4。4ファイルを import から全文掲載し（128、153、188、280行目）、ファイル名、作業フォルダの作り方（121〜124行目）、ファイル構成（106〜113行目）、前提（88行目 Node.js 18 以上、出典10）、依存とインストール（90〜100、171行目）、2つのターミナルの使い分け（276、302、316行目）を示した。各コマンドの出力は `run/03`、`05`〜`11`、`13`〜`16`、`20`、`27.log` から写した（G04） |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。`brief.md` の態度の1行（作り直しと Origin の検査がいちばん大事で、書き忘れても気づきにくい）。260行目「いちばん大事なのは `app.post` の中です」、434行目「書いたら、この curl で 403 が返ることまで確かめてください」、517行目「厄介なのは、この例外の文言がサーバーにもクライアントにも出ないことです」。ツールの中身は前の記事に任せて短くし（70、186行目）、つまずく所に独立した H2 を2つ置いた |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。76: 「この記事のサーバーはステートレスです」（84行目）、86: 「Express は自分で入れる必要がありません」（100行目）、117: 「記事と同じバージョンを入れます」（126行目）、184: 「1つを使い回すと、2回目のリクエストから失敗します」（260行目）、274: 「トランスポートを替えても、ツールの結果は変わりません」（331行目）、343: 「406 が返ったら、まず `Accept` を見てください」（385行目）、400: 「書いたら、この curl で 403 が返ることまで確かめてください」（434行目）、438: 「stdio と違い、Claude Code はサーバーを起動しません」（468行目）、470: 「500 の空の本文を見たら、トランスポートの作り方を疑ってください」（517行目）、521: 「仕様どおり 405 を返せば、この行は出ません」（539行目）、541: 「claude.ai のカスタムコネクタは、手元のサーバーにつながりません」（543行目）、553: 「LLM の API を呼ばないので無料です」（555行目）、559: 「どれも、手元のクライアントで成功しただけでは抜けに気づけない行です」（561行目）、567: 「確認日は、どれも 2026-11-02 です」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」は0件（`prose-check.txt` の PAT）。「恐れがあります」は仕様の could に合わせた402行目の1か所 |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件、writing-lint の B-6 0回。「解説します」「見ていきましょう」「紹介します」は0件（目視）。途中の版の「その様子は後の節に載せました」は削った（`judgments.md`） |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「次の節」「後の節」は0件（PAT）。「次の形」（104行目）「次のコマンド」（316行目）「次の1行」（333行目）「次の文言」「次の3つ」は直後の内容を指す語。563行目「講座の次の記事は…」はスキルが求める講座の前後リンク |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件。比喩は使っていない。「受け口」は HTTP のルートのハンドラーを指す語として、186行目から統一して使った |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではな」「じゃな」「ではありません」0件（途中の版の1件は直した、`judgments.md`） |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。`prose-check.txt` で地の文と frontmatter の文長が最長60字、20字以下14文、41〜60字82文。例 88行目「必要なのは Node.js です。」、341行目「サーバーを止めるときは、1つ目のターミナルで Ctrl+C を押します。」の短文の前後に長い説明が続く |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と語尾の反復チェック。`prose-check.txt` の SAME3 0、writing-lint の B-2 三連反復0（途中の版の3か所を直した、`judgments.md`） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「Origin は、自分で書いたミドルウェアが断りました。Host は `createMcpExpressApp()` の検査が断っています。」（434行目）のように主語を残した |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文の文末を Python で調べ、ですます以外は箇条書きの項目名3つだけ（`judgments.md` の「文末の調査」）。項目名は guides/05 §7 の例外。writing-lint の文体混在の検出も0 |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」「効果」は0件。「エラー」は「エラーを報告する」（521行目の見出し）、「エラーを出しました」（100行目）、「エラーの行が増えます」（523行目）で、どれも自然な結びつき |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「起動します」「実行します」「表示する」「登録できます」「報告されます」「接続」「公開する」。「サーバーを起動します」「セッション ID を表示する」は他動詞に を、「SSE の切断として報告されます」は受身で、取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「単純なサーバー」（82行目）「新しい POST」（80行目）「空の本文」（517行目）「厄介な」程度で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」なし（「最初に」は119行目だけ）。「約」「程度」は0件。「例外を投げます」（509行目）は throw の和語1つ |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし（目視）。「サーバーとトランスポートを新しく作ります」（260行目）は実際にオブジェクトを生成する処理を指す。「express を依存に持っていて」（100行目）は package.json の依存の一覧に載っていることを指す |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」。`prose-check.txt` で60字超 0（最長60字）。途中の版の16文を分けた（`judgments.md`）。インラインコード、Markdown のリンク（URL を含む）、（出典n）も1字ずつ数え、見出し、表のセル、箇条書き、frontmatter の文字列も数えた。除外はコードブロックと URL だけのセル（件数は `prose-check.txt` 2行目） |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。「トランスポート」、「受け口」（ルートのハンドラー）、「作業フォルダ」（「ディレクトリ」0件）、「バージョン」（「版」0件）、「ステートレス」「ステートフル」（82行目で定義）、「MCP エンドポイント」（80行目で定義）、「SSE」（363行目で定義）、「DNS リバインディング」（402行目で説明）、「カスタムコネクタ」。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。4ファイル、121行、69行、3秒、Node.js 18 以上、6か月、7件、30回中4回、3000番、403、405、406、500、0 bytes、1つまで、14件。「数個」「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（`prose-check.txt` の YA 2件は「やり取り」「見逃しやすい」の一部）。AND は「`application/json` と `text/event-stream` です」（385行目、直前に「両方」）、OR は「SSE か `application/json` のどちら」（365行目）「SSE で応じるか、405 を返す」（272行目）、箇条書きは「少なくとも次の3つを足します」（545行目） |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。`prose-check.txt` の PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。`—`、`─`、`―` 0件（PAT）、writing-lint B-5 0回 |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`： `、`：`、`／` は0件（PAT）。コードブロック内の `文字数: 15 / 行数: 2` はツールの出力で対象外 |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/mcp-server-streamable-http.md > logs/mcp-server-streamable-http/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、588行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。warn 0件で判断の対象なし（`lint/judgments.md`） |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。FATAL、warn、mention がすべて0件で、区別が要る検出なし |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。コードの悪い例2つは、地の文で「悪い例として」と明示し（472、523行目）、見出しで何が起きるかを示し（470、521行目）、直後に原因（出典7、9）と直し方（手順2の形に戻す、405 を返す）を置いた（509〜519、537〜539行目） |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/20`〜`22.log`、`run/19.log`（使い回すと 500 が空の本文で返り、サーバーには何も出ない）から、「500 の空の本文を見たらトランスポートの作り方を疑う」と判断した（517行目）。`run/06`、`07.log` が `ALLOWED_ORIGINS` 空で成功したことから、SDK のクライアントと curl は Origin を付けず、手順3では検査を確かめられないと判断し、403 の確認を求めた（434行目、`run/10.log`）。`run/36.log`（30回中4回の AbortError の行、30回とも `ok:`）から、その行は無視してよいと判断した（339行目）。`run/27.log` から、405 を返さないと結果は正しいのにエラーの行が出て見逃しやすいと判断した（539行目）。`run/37.log` から `@types/express` が要る理由を示した（100行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（`run/01.log`〜`34.log`、G04）。繰り返しは `run/36.log`、型は `run/34`、`37`、`38.log`。LLM には送っていない（キーが無く、記事もモデルを使わない） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 565行目「あなたのサーバーを公開するとき、Origin の許可リストにはどのページを入れますか。」の1か所。まとめの節はこの問いで閉じている |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）
- 合計: OK 46 / NG 2 / 任意・あり 1（全49項目）

## 結論

G07（前後リンクの先が未公開）と G10（CSV 待ち）に落ちたので、`status: draft` のまま止める。G07 は、リンク先の2本（`mcp-server-typescript-stdio`、`mcp-inspector-debug`）が公開か、この記事より前に予約されれば通る。`mcp-inspector-debug` はまだ原稿が無い。G10 はラッコキーワードの CSV が届き、`target_query` を CSV の行から選べれば通る。どちらも、この記事の原稿を直しても解消しない。
