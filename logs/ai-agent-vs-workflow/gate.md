# gate: ai-agent-vs-workflow

判定日: 2026-11-10（レビューの指摘を直したあとの判定。最初の判定も同じ日）。原稿: `content/articles/ai-agent-vs-workflow.md`（420行。行番号はすべてこの版）。

## 判定の前に読んだもの

2026-11-10 に、レビューの指摘を直したあと、次を Read ツールで全文読み直してから全項目を判定し直した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）、`06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `.claude/skills/write-article/SKILL.md`（394行、sed で全文表示）、`keywords/README.md`（最初の判定で読んだ。`keywords/` は今回も `ls` で README.md だけ）

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。lint のスクリプトのソースは、B-3 のパターン1行（`writing-lint.py` 51行目）だけを `grep` で見た（`lint/judgments.md`）。

`run/*.log` は、この環境の設定 `Read(./**/*.log)` で Read ツールから開けない。2回目の実行のログの中身は、`code/extra/run-round2.sh` が実行中に標準出力へ出した写しで読み、記事のコードと出力がログと1文字も違わないことは `lint/check-code-and-outputs.py` で機械的に比べた（`lint/check-code-and-outputs.txt` ALL OK）。

## 2026-11-10 の見直し（レビューの指摘と直したこと）

| # | 指摘 | 判断 | 直したこと | 根拠 |
|---|---|---|---|---|
| 1 | 出典1の取り違え。「遅延とコストを払う」の主語は agentic systems（ワークフローとエージェントの両方）で、比べる相手は LLM の呼び出し1回なのに、エージェントの性質として書き、「Anthropic の説明と逆の結果」と対立を作っていた | 正しい | 80行目を「ワークフローとエージェントの両方を agentic systems と呼ぶ。どちらも、LLM の呼び出し1回で済ませる方法より、遅延とコストを払って性能を取ることが多い」「手順のはっきりした処理には、予測しやすく結果のそろうワークフローが向く」に直した。「Anthropic の説明と逆の結果です」の文は消し、377行目に「prompt chaining（ワークフローの1つ）は遅延と引き換えに精度を上げる方法」と出典どおりに書いた。H2（363行目）は実測の結果だけを言う見出しで、出典との対立は本文から無くなった | 2026-11-10 に出典1を curl で取り直し、「we categorize all these variations as agentic systems」「This might mean not building agentic systems at all. Agentic systems often trade latency and cost for better task performance」「workflows offer predictability and consistency for well-defined tasks」「The main goal is to trade off latency for higher accuracy」を確かめた（`sources.md` の1） |
| 2 | プランの条件が狭い。Team と Enterprise も Claude Code を含み、サブスクリプションの OAuth が既定 | 正しい | 89行目を「Pro、Max、Ultra、Team、Enterprise のどれかが必要です（出典7）」に直した | `authentication.md` の優先順位7「This is the default for Claude Pro, Max, Ultra, Team, and Enterprise users.」、`claude.com/pricing` の Team の「Claude Code and Claude Cowork」と比較表「Claude Code Yes Yes Yes」（`sources.md` の7、8） |
| 3 | エージェント版のデモが `claude-agent-sdk-first-agent`（#17）と重なる（同じオプション、3ファイル、num_turns=5 の内訳、2回目の Glob の引数） | 正しい | エージェント版をワークフロー版と同じ仕事（3件の分類と、返金への返信の書き出し）に書き直し（`code/agent.ts`、294〜361行目）、`result` が届いてから `LABELS.includes` でラベルを確かめる形にした。num_turns の内訳と Glob の引数の違いの説明は外し、この記事の問い（同じ仕事を任せたとき、答えを確かめられる時点が「1件ごと」と「全部の作業のあと」に分かれる）を書いた。オプションの役割は #17 へのリンクに任せた（330行目） | `run/19.log`、`run/21.log`。`selection.md` の G06 の追記 |
| 4 | description が「止め方を実測で比べます」と約束しているのに、エージェントの停止条件は実測していない | 正しい | description（4行目）を「呼び出し回数と時間を実測で比べます。答えを確かめられる時点の違いも示します。」に直した。比較の表（367〜373行目）に実測の「途中で止まった問い合わせ」の行（ワークフロー1回目は 003.txt を手順2が止めた、エージェントは2回とも 0件で 6ターンと5ターンで終了）と「答えをコードで確かめた時点」の行を足し、375行目で「エージェント版は2回とも上限の maxTurns: 10 に届く前に答えを返した。止める仕組みが実際に働いたのはワークフロー版の1回目の手順2」と書いた。上限で止まったときの挙動は #18 へのリンク（395行目） | `run/07.log`、`run/19.log`（num_turns=6）、`run/21.log`（num_turns=5） |
| 5 | `tools` を外すとツール39個の分だけ費用が増える、という節の実験が、`tools` と `systemPrompt` を同時に外していて、どちらの影響かを分けられない | 正しい | `code/extra/tools-vs-systemprompt.ts` で、手順1と同じ分類を4通り（両方指定、`tools` だけ外す、`systemPrompt` だけ外す、両方外す）で投げ直した（`run/22.log`）。入力の合計（input + cache_creation + cache_read。出典12）で比べ、両方指定 1,462、`tools` を外す 38,995、`systemPrompt` を外す 1,468、両方外す 39,001。277〜292行目を、この4通りの表と「`systemPrompt` を外したときの増加は6トークン、入力が大きく増えたのは `tools` の指定を外した2通り」に書き直した。見出しは「39個のツールが付いて入力が約27倍になる」 | `run/22.log`、`sources.md` の12。`run/12.log`（同時に外した実験）は記事から外した |
| 6 | 指摘ではなくメモ。`run/10.log`、`run/11.log` をレビューで開けず、エージェント2回目の数字（8,459ms、0.000931）が未確認 | 確かめた | `run/11.log` の `num_turns=5、cache_creation=1685`、`total_cost_usd（見積もり）: 0.000931、かかった時間: 8459ms` は、この作業の最初に `cat` で表示して一致を確かめた（その後 `Read(./**/*.log)` の設定に気づき、以後は .log を直接開いていない）。ただし書き直しでエージェント版のコードが変わったので、比較の表のエージェント側は2回目の実行 `run/19.log`（9,769ms、0.001239）と `run/21.log`（9,166ms、0.001069）に入れ替えた | `run/19.log`、`run/21.log` |

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜56行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `420行/162文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY は10カウンタすべて0回（途中の版で出た B-3 の1回は「当たった」の誤検出で、書き換えた。`lint/judgments.md`）。WATCH の節なし、SHOULD 0件、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Messages API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格。Agent SDK や `claude -p` の記事は、オーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 記事のコードは Agent SDK だけで、Messages API を直接呼ばない（`needs_api_key: false`、52行目）。スキルの「Claude プランで動かす記事」に従い、オーナー自身の Claude プランでログイン済みの環境で実行した。`lint/check-code-and-outputs.txt`（ALL OK）: 記事のコードブロック15個が、記事の順に `run/` の command 行、`run/` の出力、`code/setup-tickets.sh`、`code/workflow.ts`、`code/agent.ts` と1文字も違わない（エージェント版の出力は `run/21.log`）。2回目の実行の準備（`run/14〜18`）のコマンドは記事のコマンド（`run/02〜06`）と同じ（同ファイル最後の行 `round2 setup commands == round1: OK`）。1回目は `code/extra/run-all.sh`（`run/01〜13`）、2回目は `code/extra/run-round2.sh`（`run/14〜22`）で、どちらも記事の手順どおり（`test -n` → `mkdir vs-workflow` → `cd` → `npm init -y` → `npm pkg set type=module` → `npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322` → `npm pkg get` → `tickets/` を作る → `node agent.ts`）。`run/01〜22` はすべて `exit=0`、2026-11-10、node v22.22.0 / npm 10.9.4 / Linux x86_64、claude-agent-sdk 0.3.322 / bundled Claude Code 2.1.322、`ANTHROPIC_API_KEY: unset`。2回目のモデルを呼んだ `run/19.log`、`run/21.log`、`run/22.log` の `apiKeySource` はすべて `none`。型は `run/20.log`（tsc 7.0.2、書き直した `agent.ts` を含む、`tsc_exit=0`）。ログにアカウント名、メールアドレス、セッションの ID、認証情報は無い（G09。`run/19.log` の一時フォルダの絶対パスは置き換えた、`code/README.md`） |
| G05 | 断定した事実すべてに一次情報の出典（URL とアクセス日）があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 401〜418行目に出典の表（12件、題名、URL、確認日 2026-11-10）。frontmatter の `sources` も同じ12件（14〜50行目）。断定した文は（出典n）で表を引く（58、66、77〜78、80、88〜90、92、94、104、108、110、112、116、233、235、237、239、255、281、330、332、377、379、381、391〜393、395行目）。文ごとの対応と、実行ログを根拠にした文は `sources.md`。料金は、スキルの「Claude プランで動かす記事」の3に合わせ、プランの利用枠から引かれること（108行目、出典5）、Pro が月払いで月20ドル（89行目、出典8）、`total_cost_usd` は見積もりで請求額とは別（112行目、出典4）を書いた。frontmatter 9〜11行目の `cost_estimate`（本文と同じ内容）、`run_environment: "Node.js 22.22.0、npm 10.9.4、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、Linux x86_64（型の確認は TypeScript 7.0.2）"`（`run/*.log` の見出しの行と `run/20.log` の `Version 7.0.2` と一致）、`verified_at: "2026-11-10"`（最後の実行 `run/22.log` の日付） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（最初の判定）。エージェントとワークフローの違いを主題にした記事は無い。#17（`query()` の導入とメッセージの読み分け）とはエージェント版のデモが重なっていたので、同じ仕事をワークフロー版と比べる形に書き直した（上の見直しの3、`selection.md` の追記）。#18（上限で止まったあと）、#16（自作ループ）とはリンクで分けた |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 62行目 `/posts/ai-agent-safe-file-tool`（frontmatter 12行目 `prev`）。次: 399行目 `/posts/mcp-server-typescript-stdio`（13行目 `next`）。関連: 149行目と330行目 `/posts/claude-agent-sdk-first-agent`、395行目 `/posts/ai-agent-max-turns-budget-limit`、397行目 `/posts/ai-agent-tool-use-loop-typescript`。`ai-agent-tool-use-loop-typescript` は原稿が無い（`ls` で確認）。ほかの4本は原稿があるが、どれも `status: draft`（2026-11-10 に `grep` で確認）。公開済みか予約済みの記事は0本（`grep -l "^status: \(scheduled\|published\)"` が0件）。今この記事を公開すると5本ともリンク切れになる。リンク先の slug: `ai-agent-safe-file-tool`、`mcp-server-typescript-stdio`、`claude-agent-sdk-first-agent`、`ai-agent-max-turns-budget-limit`、`ai-agent-tool-use-loop-typescript` |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 420行目「AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。」。日付は最後の実行（`run/22.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/ai-agent-vs-workflow/`（この gate.md を除く）に `sk-ant`、`password`、`secret`、`/root`、`/home/user`、`tmp/claude`、`scratchpad`、`session_id`、メールアドレスの形、UUID の形を `grep -rniIE` でかけた（2026-11-10、直したあと）。該当は `run-all.sh`、`run-extra.sh`、`run-round2.sh` の `/root/` を `~/` に置き換える sed の式だけ。値としての API キーやトークン、セッションの ID は0件。`run/19.log` で LLM が `Glob` に渡した一時フォルダの絶対パス（UUID の形を含む）は、保存後に `"<Claude Code の一時フォルダ>"` に置き換えた（`code/README.md`）。作業フォルダのパスは `<work>`、型の確認用のフォルダは `<tc>` に置き換えて保存し、`agent.ts` はツールの引数と答えの中の作業フォルダのパスを `.` にして表示する。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分。名前の全体と各語、メールのローカル部とドメインの語、noreply の数字の ID）、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）の14語を1語ずつ `grep -rniIF` で原稿と `logs/ai-agent-vs-workflow/` にかけ、すべて0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | NG | `keywords/` に CSV が無い（2026-11-10 に `ls` で README.md だけ）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める（CSV 待ち） |

## B. checklist.md の全項目

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計 | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭と §1 を読んで判定。`brief.md` の「C01 の1行」（LLM の API を少し触った TypeScript の開発者が、エージェントとワークフローの違いを調べたときに、次の手順を決める側の違いを、実測と答えを確かめられる時点の違いつきで答え、選び方を示す） |
| C02 | 設計 | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」を読んで判定。2行目のタイトルは「AI エージェントとワークフローの違い」を先頭に置き、【決まった手順なら LLM を順に呼ぶだけでいい】で結論を示す。「徹底解説」「完全ガイド」は0件（`prose-check.txt` の PAT）。CSV が無いので検索語との一致は G10 で NG として別に数える |
| C03 | 設計 | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文（導入）が最重要」を読んで判定。58行目で違いの定義（次に何をするかを決める側）、60行目で結論（手順が決まっているならワークフローで足りる）と記事でやること（同じ仕分けを2通りに書いて比べる）を書いた |
| C04 | 設計 | 検索意図のタイプに構成が合っている | OK | guides/01 §1 と guides/02 タイプ2を読んで判定。概念（Learn）に対して解説の骨格（定義を1文目 58行目 → ざっくり理解の表 64行目 → 正確な説明とコード例 171、294行目 → ハマりどころ 257、277行目 → よくある誤解 363行目 → 使いどころ 387行目）。骨格は `brief.md` |
| C05 | 構成 | 結論先行になっている | OK | guides/02 共通原則1を読んで判定。リードの1文目が定義の答え（58行目）。各節も冒頭で結論を言う（例 64節の66行目で定義、277節は見出しで結果を言い切ってから表、363節は見出しで結果を言い切ってから表と理由、387節は389行目で選び方を先に言う） |
| C06 | 構成 | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通原則2を読んで判定。見出し（64、84、106、114、151、171、257、277、294、363、387、401行目）を順に読むと、違いの定義 → 前提 → プランの範囲 → インストール → 題材 → ワークフロー版 → ゲートが止めた例 → tools の指定 → 同じ仕事を任せたエージェント版 → 実測の比較 → 選び方 → 出典、と流れる |
| C07 | 構成 | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通原則4と guides/03 症状②を読んで判定。見出しはどれも中身を言い切る形（「エージェントは、同じ仕事をツールつきの query() 1回に任せる」「tools を指定しないと、39個のツールが付いて入力が約27倍になる」など）。「まず〜する」型は0件 |
| C08 | 構成 | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1「チュートリアルの肝」と共通原則3を読んで判定。`workflow.ts`、`agent.ts` は import から全文。前提（Node.js 22.18.0 以上、プラン、ログイン、`ANTHROPIC_API_KEY` を外す）は 84〜104行目、作業フォルダの作り方とインストールは 114〜147行目、題材のファイルは 151〜169行目。全コマンドの実行結果を `run/` からそのまま載せた（`lint/check-code-and-outputs.txt` ALL OK） |
| C09 | AI臭 | 書き手の態度が感じられる | OK | guides/03「態度の不在」を読んで判定。手順を書き出せる処理をエージェントにする理由は見当たらないと言い切り（82行目）、実測でエージェントが速くて安かったうえで、それでもワークフローで書くと判断（383行目）、`tools: []` を必ず渡すよう指示（292行目）。中心のワークフロー版とエージェント版の節を長く、題材とインストールの節を短くした |
| C10 | AI臭 | 各セクションに言い切りの文が最低1つある | OK | guides/03「勇気の不在」を読んで判定。64節「…理由はほとんど見当たりません」（82行目）、84節「どれも欠かせません」（86行目）、106節「…認証します」（110行目）、114節「npm の最新版です」（116行目）、151節「正解は、001 が返金…です」（169行目）、171節「この回数は…動かす前に計算できます」（255行目）、257節「…コードで受け止められます」（273行目）、277節「…必ず渡してください」（292行目）、294節「…LLM がその場で決めています」（359行目）と「コードが気づけるのは最後の答えが返ってからです」（361行目）、363節「それでも、この仕分けはワークフローで書きます」（383行目）、387節「…で決まります」（389行目） |
| C11 | AI臭 | ヘッジが過剰でない | OK | guides/03 症状①を読んで判定。「でしょう」「かもしれ」「可能性があります」は0件（`prose-check.txt` の PAT） |
| C12 | AI臭 | メタ発言を削った | OK | guides/03 症状②を読んで判定。「解説します」「紹介します」「見ていき」「ここでは」は0件（`prose-check.txt`）。リード60行目の「この記事では…比べます」は guides/05 §3「メタ発言」の例外（冒頭リード文）に当たる1文だけ。writing-lint の B-6 メタ談話予告も0回 |
| C13 | AI臭 | 章境界アナウンスが無い | OK | guides/03 症状⑫を読んで判定。「ここから」「ここまで」「次は」「まとめ」「整理」は0件（`prose-check.txt`）。直す途中の版の「まとめて」は「両方を」に直した（`lint/judgments.md`）。ai-smell-lint の検出も0件 |
| C14 | AI臭 | テンプレ比喩を使っていない | OK | guides/03 症状⑬を読んで判定。「地図」「仕様書」「設計書」「レシピ」は0件（`prose-check.txt`）。ほかの比喩（土台、両輪、潤滑油など）も使っていない（ai-smell-lint 0件） |
| C15 | AI臭 | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧を読んで判定。地の文の「ではなく」「ではありません」「じゃない」は0件（`prose-check.txt`）。writing-lint の B-1 対比構文も0回。見出しにも無い。最初の版でコードブロック内の LLM の出力にあった「ではありません」も、書き直した版の出力には無い |
| C16 | AI臭 | 文長に緩急がある | OK | guides/03「リズムの不在」と原因⑦を読んで判定。`prose-check.txt` 2行目、地の文135文で最短13字、最長60字、20字以下13文、41〜60字65文。1文だけの段落（82、292行目）も挟んだ |
| C17 | AI臭 | 同じ語尾が3回以上連続していない | OK | guides/03「語尾の反復チェック」を読んで判定。`prose-check.txt` 4行目、末尾3字での3連続は0件。281行目の usage の説明は語尾を散らした（`lint/judgments.md`） |
| C18 | AI臭 | 一文を短くしすぎて主語・目的語を削っていない | OK | guides/03 症状⑮を読んで判定。最短の文は13字（`prose-check.txt`）で、主語か目的語を持つ。60字を超える文を分けたときも主語を残した（例 281行目「キャッシュに書き込んだ分は `cache_creation_input_tokens` です。」、377行目「prompt chaining はワークフローの1つです。」） |
| C19 | AI臭 | ですます/である調が統一されている | OK | guides/03 症状⑮と guides/05 §7「文体の統一」を読んで判定。`prose-check.txt` 3行目、地の文、箇条書き、description でですます以外の文末0件。writing-lint の文体混在も検出なし。見出しと表のセルの体言止めは guides/05 §7 の例外 |
| C20 | コロケーション | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」を読んで判定。「課題」「問題」「目標」「効果」は本文に無い。「エラーは0件でした」（92行目）は件数を述べるだけ。「例外が投げられます」（395行目）は guides/04 の重言の表の正しい形 |
| C21 | コロケーション | 漢語サ変動詞の助詞（が/を）が合っている | OK | guides/04「自動詞・他動詞の取り違え」を読んで判定。「認証します」（110行目、目的語なし）、「Claude Code のプロセスを起動して」（379行目、他動詞＋を）、「キャッシュされます」（381行目、受身）、「入力の増加は、6トークンでした」（290行目）。表の誤り例（速度を向上する型）に当たる組み合わせは無い |
| C22 | コロケーション | 形容詞と名詞が合っている | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」を読んで判定。形容詞が名詞にかかるのは「小さな手順」（77行目、大きさ）、「正しいラベル」（355行目）で、どちらも自然な結びつき。表の誤り例（濃い理解、大きい精度など）に当たる組み合わせは無い |
| C23 | コロケーション | 重言が無い | OK | guides/04「重言」を読んで判定。「まず最初」0件（`prose-check.txt`）。「例外が投げられます」は英単語と和訳の重複ではない。「約27倍」「約10倍」に「程度」は付けていない |
| C24 | コロケーション | 翻訳調が無い | OK | guides/04「翻訳調」を読んで判定。「〜を作る」（影響を作る型）、「〜を持っている」（質問を持っている型）は無い。「主導権を持つ仕組み」（69行目）は出典1の maintaining control の訳で、持つ対象が実体のある権限なので翻訳調の表の型に当たらない。「性能を取る」（80行目）は出典1の trade … for better task performance の訳で、「〜と引き換えに〜を取る」の自然な結びつき |
| C25 | 正確さ | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」を読んで判定。`prose-check.txt` 1行目 `C25 over60=0 max=60`（インラインコード、リンクの URL、（出典n）、見出し、表のセル、箇条書き、title、description も書かれたとおりに数えた。除外したのは URL だけの表のセル12個）。直す途中の版の3文は分けた（`lint/judgments.md`） |
| C26 | 正確さ | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」を読んで判定。動作の主体は「LLM」（281行目も「LLM に渡した入力」）、手順の呼び名は「手順1〜3」、「停止条件」「見積もり」「利用枠」「入力の合計」を全体で同じ語で書いた。「モデル」はモデルの名前を指すときだけ（239行目） |
| C27 | 正確さ | 数量・期間が具体的な数値 | OK | guides/05 §4「曖昧表現の具体化」を読んで判定。版（22.18.0、22.22.0、0.3.322、2.1.322、Haiku 5.5）、料金（月20ドル）、回数（4回、1回、num_turns 5 と 6、maxTurns 10、ツールの呼び出し5回）、時間（23,153ms、27,702ms、9,769ms、9,166ms、6,714ms）、トークン（1,485、1,462、38,995、1,468、39,001、6トークン）、ツールの数（39個）、倍率（約27倍、約10倍）を数値で書いた |
| C28 | 正確さ | AND/ORが明確 | OK | guides/05 §4「AND/ORの明確化」を読んで判定。「や」の並列は0件（`prose-check.txt`）。「Pro、Max、Ultra、Team、Enterprise のどれか」（89行目）で OR、「どれも欠かせません」（86行目）で AND、「`maxTurns` と `maxBudgetUsd` の少なくとも一方」（393行目）、「製品かサービス」（110行目）を明示した |
| C29 | 正確さ | ですます/である調が混在していない | OK | guides/05 §7「文体の統一」を読んで判定。C19 と同じ根拠（`prose-check.txt` の non-desumasu 0件） |
| C30 | 記号 | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の `PAT bold **: 0` |
| C31 | 記号 | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の em-dash、罫線、U+2015 がどれも0件。writing-lint の B-5 ダッシュも0回 |
| C32 | 記号 | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の全角コロン0件、全角スラッシュ0件（コードブロックの外）。357行目の「返信の書き出し: 」は LLM の出力の引用で、半角コロン |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | guides/03「lint との関係」を読んで判定。手順7のコマンドで実行。`lint/ai-smell.txt` 5行目 `✅ 致命なし`、10行目 `exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。warn 0件。lint が拾わない症状③⑦⑮、個数予告、「など」の代表例、guides/08 B-3 の「だけ」は目視で見て、`lint/judgments.md` に直した点を書いた |
| C35 | 機械チェック | FATAL/warnが use か mention かを確認した | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。FATAL 0件、warn 0件、mention 0件。frontmatter の範囲（1〜56行目）の mention も0件 |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」を読んで判定。悪い例の引用は原稿に無い（該当なし。mention 0件） |
| C37 | 最後の一押し | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。実際に動かした結果（`run/07.log` で手順2が鉤括弧つきの答えを止めたこと、`run/10.log` で同じコードが通ったこと、`run/22.log` の4通りの入力の合計、`run/19.log` と `run/21.log` でエージェントの手順とターン数が変わったこと、比較の表）と、そこから下した判断（実測ではエージェントが速くて安かったが、それでもワークフローで書く 383行目、速さとコストを決め手にしない 389行目、`tools: []` を必ず渡す 292行目、エージェントでは答えを確かめられるのが最後だけ 361行目） |
| C38 | 最後の一押し | コードを実際に動かして確認した | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。G04 と同じ根拠（`run/01.log`〜`22.log`、`lint/check-code-and-outputs.txt` ALL OK）。オーナーの Claude プランで実行した |
| C39 | 最後の一押し | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | guides/03「沈黙の不在」を読んで判定。275行目「あなたなら括弧を外して通しますか。それとも止めて、人の確認に回しますか。」で段落を閉じた（1か所） |

## 結果

A は G01〜G06、G08、G09 が OK、G07（リンク先が未公開）と G10（CSV 待ち）が NG。B は C01〜C38 がすべて OK、C39（任意）はあり。合計で OK 46、NG 2（任意の C39 は数えない）。frontmatter は `status: draft` のまま止める。
