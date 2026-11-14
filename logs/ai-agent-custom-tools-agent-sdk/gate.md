# gate: ai-agent-custom-tools-agent-sdk

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


判定日: 2026-11-11。原稿: `content/articles/ai-agent-custom-tools-agent-sdk.md`（356行。行番号はすべて 2026-11-14 に数え直した今の版。出典7（Legal and compliance）の削除に伴う修正の後の版）。

## 判定の前に読んだもの

2026-11-11 に、次を Read ツールで全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行。1〜230行目と230〜443行目の2回に分けて読んだ）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）、`06-rewriting-prompts.md`（1〜180行目を Read で読み、181〜186行目の「使い方の流れ」は grep の出力で読んだ）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `.claude/skills/write-article/SKILL.md`（Read で1〜200行目と200〜394行目）、`content/plan.md`（Read で全文）、`content/articles/claude-agent-sdk-first-agent.md`（手本の記事。Read で全文）と `logs/claude-agent-sdk-first-agent/` の brief、selection、sources、gate、code の README と run-all.sh
- `keywords/` は `ls` で README.md だけであることを確かめた

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。lint のスクリプトのソースは読んでいない。出力の読み方はスキル手順7の表に従った。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、末尾 `exit=0`。frontmatter（1〜50行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `356行/157文`、判定行 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、`exit=0`。DENSITY は10カウンタすべて上限以内（B-1 対比 1/2、B-11 するだけ 1/2、ほかは0回）。上限は guides/08 の標準の列と一致。2件の判断は `lint/judgments.md`。WATCH の節なし、SHOULD 0件、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Messages API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格。Agent SDK や `claude -p` の記事は、オーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 記事のコードは Agent SDK と zod だけで、Messages API を直接呼ばない（`needs_api_key: false`、46行目）。オーナー自身の Claude プランでログイン済みの環境で実行した（`run/06.log` の init `apiKeySource=none`、`ANTHROPIC_API_KEY: unset`）。`lint/check-code-and-outputs.txt` は ALL OK: 記事のコードブロック10個が、記事の順に流れの図（実行しない図）、`run/02` の command と出力、install の4行（`mkdir`、`cd`、`run/03`、`run/04` の command）と `run/04` の出力、`run/05` の command と出力、`code/shop-agent.ts`、`run/06` の command と出力と1文字も違わない。`run/01`〜`13` の終了コードはすべて 0。実行は `code/extra/run-all.sh` で記事の手順どおりに行った（`run/11.log`、`run/12.log`、`run/13.log` は手で保存したもの。`run/11.log` は試作の実行、`code/README.md`）。型の確認 `run/10.log` は `tsc_exit=0` |
| G05 | 断定した事実すべてに一次情報の出典（URL とアクセス日）があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 339〜354行目に出典の表（10件、題名、URL、確認日 2026-11-11）。断定した文は（出典n）で表を引く（52、74、76、82〜84、86、96、98、122、228、231〜233、235、237、241、243、245、253〜257、259、261、263、265、289、307、311、313、319、327行目。`grep -n '出典'` の結果と照らし合わせた）。文ごとの対応と、実行ログを根拠にした文は `sources.md`。料金は、スキルの「Claude プランで動かす記事」の3に合わせ、プランの利用枠から引かれること（98行目、327行目、出典7）、Pro が月払いで月20ドル（83行目、出典8）、npm のパッケージとツールの処理は無料で外部の API に通信しないこと（329行目、コードのとおり）を書いた。このコードは `total_cost_usd` を表示しないので、見積もりの数字は載せていない。frontmatter 9行目の `cost_estimate` は本文と食い違わない。10行目の `run_environment`（Node.js 22.23.4、npm 10.9.9、SDK 0.3.322、Claude Code 2.1.322、zod 4.6.7、macOS arm64、TypeScript 7.0.2）は `run/06.log` のヘッダー（`node: v22.23.4 / npm: 10.9.9 / os: Darwin arm64`、`claude-agent-sdk: 0.3.322 / bundled Claude Code: 2.1.322 / zod: 4.6.7`）と `run/10.log`（`Version 7.0.2`）に一致。11行目の `verified_at` 2026-11-11 は `run/12.log`（最後のログ）の日付と一致 |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | guides/01 §1「検索意図」と §2 を読んで判定。`content/articles/` のこの記事のほか29本の `title`（2026-11-11 時点は27本。点検時は30ファイル） を読み、`createSdkMcpServer`、`mcp__`、`isError` で grep した。`createSdkMcpServer` を使う記事はこの記事だけ。隣の記事（#8、#17、#18、#19、#21）との分け方は `selection.md` の表と、`content/plan.md` 91行目の分担、依頼の指示（#18、#19、#21 の内容は扱わずリンクする）に従った |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | OK | 2026-11-14 に #31 で判定し直した。公開の順（`content/plan.md` の「公開の順番」）で16番。本文の内部リンクは2件で、リンク先はすべて自分より前の順番: 237行目 `/posts/zod-to-json-schema-tool-definition`（8番）、58行目 `/posts/rag-hybrid-search-rrf`（15番）。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。frontmatter は `prev: rag-hybrid-search-rrf`、`next: claude-agent-sdk-first-agent` のまま。次の記事への本文リンクは外した。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 356行目「AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。」。日付は記事に写した実行（`run/06.log`）と最後の実行（`run/12.log`）と同じ 2026-11-11 |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 原稿と `logs/ai-agent-custom-tools-agent-sdk/` の29ファイル（この gate.md を書く前の時点）に、Python の正規表現で `sk-ant`、`token`、`password`、`secret`、`session_id`、メールアドレスの形、UUID の形、ホームのパス（`/Users/`）、スクラッチの領域のパス（`claude-501`、`scratchpad`、`tmp/claude`）をかけて0件。`ANTHROPIC_API_KEY` は環境変数の名前としてだけ26か所に出る（値ではない）。個人名: ユーザーのアカウント名、git のコミット作者名の姓と名、ユーザーの漢字の姓と名、所属組織の名前を同じ方法でかけて0件。コネクタのツール名（ログイン中のアカウントがつないでいるサービスの名前を含む）は `code/extra/redact-mcp-tools.py` で件数に置き換えてから保存した（`run/09.log`、`run/11.log`、`run/12.log`）。コードは init の `session_id`、`cwd`、アカウントの情報を表示しない |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-ai-agent.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計 | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭と §1 を読んで判定。`brief.md` の「C01 の1行」 |
| C02 | 設計 | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」を読んで判定。2行目のタイトルは講座のメインキーワード「AI エージェント」を先頭に置き、`tool()` と「ツール呼び出しの流れ」で中身を具体的に言う。「徹底解説」「完全ガイド」は0件（`prose-check.txt`）。`target_query` は G10 で確定済み |
| C03 | 設計 | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文」を読んで判定。52行目で手段（`tool()` で定義、`createSdkMcpServer()` で束ねて `query()` に渡す）、54行目で動いた結果（自作の2つだけを4回呼んで合計を答えた）、56行目で API キーが要らないことを言う |
| C04 | 設計 | 検索意図のタイプに構成が合っている | OK | guides/01 §1 と guides/02 タイプ1を読んで判定。やり方の意図にチュートリアルの骨格（リード、前提 80行目、セットアップ 102行目、実装 140・249行目、動作確認 269行目、次にやれることと関連リンク 333行目）で答えた。所要時間の目安は書いていない（読者の環境で変わる。`brief.md`） |
| C05 | 構成 | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02「共通の原則」1を読んで判定。最初の H2（60行目）で3段の流れとツール名の形を先に示し、その後に前提、手順、結果を置いた |
| C06 | 構成 | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通原則2を読んで判定。H2 と H3 の一覧（60、80、102、140、241、249、269、295、301、307、317、327、333、341行目）が、流れ → 前提 → インストール → 定義 → 失敗の返し方 → 絞り方 → 実行結果 → 失敗の届き方 → 再実行 → 名前の決まり → 外したときの比較 → 料金 → 判断 → 出典の順で、それぞれ1つの話題 |
| C07 | 構成 | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通原則4と guides/03 症状②を読んで判定。見出しはどれも結論か中身（例 267行目「実行すると tool_use と tool_result が4往復する」、315行目「tools: [] を外すと、組み込みのツールが25個並んだ」）。「まず〜する」型は0件 |
| C08 | 構成 | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1の肝と guides/01 §4 を読んで判定。142〜226行目のコードは import から始まる完全な形で、`code/shop-agent.ts` と1文字も違わない（`check-code-and-outputs.txt`）。前提の Node.js、プラン、ログイン、`ANTHROPIC_API_KEY` を80〜98行目に書き、インストールの手順は105〜109行目。実行結果は275〜287行目（`run/06.log` の出力そのまま） |
| C09 | AI臭 | 書き手の態度が感じられる | OK | guides/03 不在1を読んで判定。`strictMcpConfig` を付けた理由を自分の試しの結果から言う（323行目）、文面ではなく数量と合計を比べるべきと言い切る（303行目）、組み込みのツールは外しておくと判断を示す（321行目） |
| C10 | AI臭 | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2を読んで判定。各 H2 に言い切りがある（例 74行目「別のプロセスを立てる必要はありません」、259行目「モデルは MCP のツールしか使えません」、311行目「自作ツールの許可にはなりません」、329行目「外部の API には通信しません」） |
| C11 | AI臭 | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①を読んで判定。「でしょう」「かもしれ」は0件（`prose-check.txt`）。推測は303行目「この注文が単純だったからと考えています」の1か所で、推測であることを明示した |
| C12 | AI臭 | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②を読んで判定。「解説します」「紹介します」「見ていき」は0件（`prose-check.txt`）。78行目にあった「この記事では、ツールの定義と呼び出しの往復に絞ります」も、記事の構造を説明するだけの文なので削った |
| C13 | AI臭 | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫を読んで判定。「ここから」「ここまで」「次は」は0件（`prose-check.txt`）。ai-smell-lint でも0件 |
| C14 | AI臭 | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬を読んで判定。「地図」「仕様書」などのテンプレ比喩は0件（`prose-check.txt`、ai-smell-lint） |
| C15 | AI臭 | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧を読んで判定。「ではなく」1回（303行目）、「じゃない」「ではありません」0回。writing-lint の B-1 も1回 |
| C16 | AI臭 | 文長に緩急がある | OK | guides/03 不在4を読んで判定。`prose-check.txt` の C16: 地の文124文中、最短8字、最長59字、20字以下9文、41〜60字57文 |
| C17 | AI臭 | 同じ語尾が3回以上連続していない | OK | guides/03「語尾の反復チェック」を読んで判定。3字で比べた同じ語尾の3連続は0件（`prose-check.txt`）。2字の「ます」「です」の連続は `lint/judgments.md` に判断を書いた |
| C18 | AI臭 | 一文を短くしすぎて主語・目的語を削っていない | OK | guides/03 症状⑮を読んで判定。60字超を分けたときも主語と目的語を残した（例 289行目は「呼ぶたびに、`tool_use` を載せた `assistant` が届きます」「続いて、`tool_result` を載せた `user` が届きます」で両方に主語がある）。主語も目的語も無い命令形の短文は0件 |
| C19 | AI臭 | ですます/である調が統一されている | OK | guides/03 症状⑮と guides/05 §7 を読んで判定。地の文の非ですます文末は0件（`prose-check.txt` の C19）。表のセルと箇条書きの一部は体言止め（guides/05 §7 の例外） |
| C20 | コロケーション | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」を読んで判定。「エラーの結果にします」（243行目）、「失敗したことをモデルに伝える」（241行目）など。表の ❌ の形は0件 |
| C21 | コロケーション | 漢語サ変動詞の助詞（が/を）が合っている | OK | guides/04「自動詞・他動詞の取り違え」を読んで判定。「通信しません」（329行目）。表の ❌ の形は0件 |
| C22 | コロケーション | 形容詞と名詞が合っている | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」を読んで判定。表の ❌ の形は0件 |
| C23 | コロケーション | 重言が無い | OK | guides/04「重言」を読んで判定。「まず最初に」「各〜ごとに」「約〜程度」「違和感を感じる」は0件。「例外を投げても」（243行目）は throw の重言にしていない |
| C24 | コロケーション | 翻訳調が無い | OK | guides/04「翻訳調」を読んで判定。「〜を作る」の直訳型と「〜を持っている」は0件 |
| C25 | 正確さ | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」を読んで判定。`prose-check.txt` の `C25 over60=0 max=59`。インラインコード、リンクの URL、（出典n）、frontmatter の title と description も書かれたとおりの文字数で数えた（除外はコードブロックの中と URL だけの表のセル）。最初の版の18文を分けた経緯は `lint/judgments.md` |
| C26 | 正確さ | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」を読んで判定。「組み込みのツール」にそろえた（`lint/judgments.md`）。tool() に渡す関数は「処理」、`createSdkMcpServer()` の戻り値は「MCP サーバー」、`mcp__shop__get_product` の形は「完全な名前」で通した |
| C27 | 正確さ | 数量・期間が具体的な数値 | OK | guides/05 §4「曖昧表現の具体化」を読んで判定。ツール呼び出し4回、`num_turns` 5と6、組み込みのツール25個、コネクタのツール756個、4回の再実行、Node.js 22.18.0 以上、版の番号。すべて run/ のログか出典に基づく |
| C28 | 正確さ | AND/ORが明確 | OK | guides/05 §4「AND/ORの明確化」を読んで判定。「や」の並列は0件（`prose-check.txt`）。「いずれか」の意味の箇所は「か」で書いた（245行目） |
| C29 | 正確さ | ですます/である調が混在していない | OK | guides/05 §7「文体の統一」を読んで判定。C19 と同じ根拠。writing-lint の B-10 文体混在も DENSITY の対象外で FATAL 0 |
| C30 | 記号 | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の `PAT bold **: 0` |
| C31 | 記号 | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03「記号NG」を読んで判定。`PAT em-dash —: 0`、`PAT 罫線 ─: 0`、`PAT ― U+2015: 0`。writing-lint の B-5 も0回 |
| C32 | 記号 | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03「記号NG」を読んで判定。`PAT 全角コロン ：: 0`、`PAT 全角スラッシュ ／: 0` |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | guides/03「lint との関係」を読んで判定。スキル手順7のコマンドで実行。`lint/ai-smell.txt` で FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」を読んで判定。warn は0件。補助スクリプトの検出と writing-lint の DENSITY の非0の2件は `lint/judgments.md` で1件ずつ判断した |
| C35 | 機械チェック | FATAL/warnが use か mention かを確認した | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。use 0件、mention 0件。frontmatter の行も0件 |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」を読んで判定。この記事は悪い例を引用していない（mention 0件）。満たすべき引用が無いので OK |
| C37 | 最後の一押し | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。実際に動かした結果（`run/06.log` の4往復、`is_error=true` が文字列で届いたこと 295行目）、2回の実行の比較（`run/07.log`、301行目）、`tools: []` を外した比較（`run/08.log`、25個と ToolSearch と `num_turns` 6、315〜321行目）、`strictMcpConfig` を外した試し（`run/09`、`11`、`12.log`、323行目）、そこから下した判断（数量と合計で比べるテスト 303行目、組み込みのツールを外す 321行目、`strictMcpConfig` を最初から付ける 323行目、結果を読むコードは配列と文字列の両方を受ける 297行目） |
| C38 | 最後の一押し | コードを実際に動かして確認した | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。G04 と同じ根拠（`run/01.log`〜`12.log`、`lint/check-code-and-outputs.txt` ALL OK）。オーナーの Claude プランで実行した |
| C39 | 最後の一押し | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | guides/03「沈黙の不在」を読んで判定。337行目「あなたのエージェントでは、失敗した呼び出しのあとにモデルへ何を伝えますか。」で節を閉じた（1か所） |

## 結果

- A: G01〜G06、G08、G09 は OK。G07（リンク先6本がまだ下書き）と G10（CSV 待ち）は NG。
- B: C01〜C38 は OK、C39 は任意・あり。
- 1つでも NG があるので `status: draft` のまま止める（47行目）。
