# gate: structured-output-methods-compare

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


判定日: 2026-11-11。原稿: `content/articles/structured-output-methods-compare.md`（489行。行番号はすべて 2026-11-14 に数え直した今の版。出典6（Legal and compliance）の削除に伴う修正の後の版）。

## 判定の前に読んだもの

2026-11-11 に、次を全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`
- `guides/01-seo-for-dev-blogs.md`、`02-article-structures.md`、`03-anti-ai.md`、`04-collocation.md`、`05-technical-writing.md`、`09-ai-writing-manual.md`（どれも全文）
- `guides/08-ai-buntai-ruleset.md`（1〜60行目の共通原則と Part A の冒頭、110〜212行目の Part B と密度基準総表。G02 の DENSITY の上限の正本として読んだ範囲）
- `guides/06-rewriting-prompts.md`（181〜186行目「使い方の流れ」。C37〜C39 の判定のため）
- `.claude/skills/write-article/SKILL.md`（Read で1〜250行目と250〜395行目に分けて全行）、`CLAUDE.md`、`content/plan.md`（22〜110行目。判定基準、計画表、重なりを避けるために決めたこと）、`.omc/plan-only-rewrite-brief.md`
- 見本の記事 `content/articles/claude-agent-sdk-first-agent.md` と、その `logs/`（brief、selection、code/README、run、gate、lint の補助スクリプト）

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。`lint/ai-smell.txt` に `✅ クリーン`、`use 0件 / 📎mention 0件`、`✅ 致命なし`、`exit=0`。frontmatter（1〜50行目）の mention も0件。途中で出た warn 2件（②メタ発言）は直した（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` の `489行/171文`、`### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、`exit=0`。DENSITY は10カウンタすべて0回。WATCH の節なし、SHOULD 0件、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Agent SDK や `claude -p` の記事は、オーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 記事のコードは Agent SDK と zod だけで、Messages API を呼ばない（`needs_api_key: false`、46行目）。オーナー自身の Claude プランでログイン済みの環境で実行した。`lint/check-code-and-outputs.txt` が `ALL OK`。記事のコードブロック16個が、記事の順に `code/*.ts`、`run/` の command 行、`run/` の出力と1文字も違わない。本文で触れる数字とエラーの有無（`run/06.log`、`08.log`、`09.log`、`10.log`、`11.log` の該当行）も同じスクリプトで照合した。実行は `code/extra/run-all.sh` で、記事の手順どおり（`test -n` → `mkdir` → `cd` → `npm init -y` → `npm pkg set type=module` → `npm install --save-exact ...` → `npm pkg get` → `node compare.ts` → `wc -l`）。`run/01.log`〜`11.log` はすべて `exit=0`、2026-11-11、node v22.23.4 / npm 10.9.9 / Darwin arm64、claude-agent-sdk 0.3.322 / bundled Claude Code 2.1.322 / zod 4.6.7、`ANTHROPIC_API_KEY: unset`。モデルを呼んだ `run/06.log` と `run/11.log` の最終行は `apiKeySource: none`。型は `run/10.log`（tsc 7.0.2、`tsc_exit=0`）。`run/00-earlier-pass.txt` は記事の最終版より前の通しの記録で、記事が使うのは正解の数（423〜429行目）だけ。その版との違いはトークンの数え方の4行で、判定の行は同じ（ファイルの冒頭に書いた） |
| G05 | 断定した事実すべてに一次情報の出典（URL とアクセス日）があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 472〜487行目に出典の表（10件、題名、URL、確認日 2026-11-11）。断定した文は（出典n）で表を引く（76、80、84、96、120、265、267、269、287、291、295、314、318、322、374、452、462、464、468、474行目）。実測の数字は `run/06.log`、`08.log`、`09.log`、`11.log` からの写し（比較表 70〜75行目は `run/06.log` と `run/11.log` の `==` の行と一致することを目で照合）。料金は、プランの利用枠から引かれること（96行目、462行目、出典6）、`total_cost_usd` は定価で換算した見積もりで請求額ではないこと（464行目、出典5）、API キーで使う場合の Haiku 5.5 の単価（468行目、出典7）。frontmatter の `cost_estimate`（9行目、0.006ドル相当は `run/06.log` の3つの total_cost_usd の和 0.00595）、`run_environment`（10行目、`run/*.log` の見出しの行と `run/10.log` の `Version 7.0.2` と一致）、`verified_at: "2026-11-11"`（`run/11.log` の日付） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | guides/01 §1 を読んで判定。`content/articles/` の24本を読み、`outputFormat`、`structured_output`、`createSdkMcpServer`、`構造化出力` で当たった6本は見出しまで読んだ。どれも検索意図が違う（`selection.md` の表）。計画上の #6、#7、#27 の担当は、本文でリンクに任せて繰り返さない（62、172、316行目。`grep -n '](/posts'` の結果はこの3件だけ）。#16、#17、#18 の担当へのリンクは今の本文に無い |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | OK | 2026-11-14 に #31 で判定し直した。公開の順（`content/plan.md` の「公開の順番」）で10番。本文の内部リンクは3件で、リンク先はすべて自分より前の順番: 316行目 `/posts/claude-agent-sdk-structured-output`（6番）、172行目 `/posts/zod-validate-llm-json-output`（7番）、62行目 `/posts/llm-json-parse-error-fix`（9番）。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。frontmatter は `prev: llm-json-parse-error-fix`、`next: rag-bm25-search-typescript` のまま。次の記事への本文リンクは外した。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 489行目「AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。」。日付は `run/11.log` と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 原稿と `logs/structured-output-methods-compare/` に `grep -rn -i -E "sk-ant\|api[_-]?key\s*[:=]\|token\s*[:=]\|password\|session_id"` をかけ、`ANTHROPIC_API_KEY` の名前と `needs_api_key: false` 以外は0件。ログは作業フォルダを `<work>`、ホームを `~` に置き換え、`/Users`、`/private/tmp` は0件（`grep -rn` で確認）。モデルを呼んだときのデバッグ用のログ（MCP サーバーの ID を含む）は検証の途中で作ったがリポジトリには置かず、消した。個人名は、ユーザーの GitHub アカウント名、ユーザーの姓名（ローマ字と漢字）、ユーザーのメールアドレスのドメインの4種類を `grep -n` で原稿にかけ0件。原稿の「山田」「佐藤」などは問い合わせの見本の架空の姓で、実在の人を指さない |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-structured-output.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計 | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭と §1 を読んで判定。`brief.md` の「C01 の1行」 |
| C02 | 設計 | タイトルにキーワードが含まれ、具体的 | OK | guides/01 §3「タイトルの作り方」を読んで判定。2行目のタイトルの先頭に「構造化出力」。比べる3つを【】で具体的に並べた。「徹底解説」「完全ガイド」は0件（`prose-check.txt`） |
| C03 | 設計 | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文」を読んで判定。52行目で結論（迷ったら outputFormat）、54行目で実測の要点（20件すべて正解、差はターン、トークン、行数） |
| C04 | 設計 | 検索意図のタイプに構成が合っている | OK | guides/01 §1 と guides/02 タイプ4を読んで判定。比較の意図に、結論先出しのリード、比較表（64行目）、観点ごとの詳細（207〜446行目）、ケース別の選び方（448行目）の順で合わせた |
| C05 | 構成 | 結論先行になっている | OK | guides/02 共通原則1を読んで判定。52行目が結論、64〜80行目が根拠の表、その後に詳細 |
| C06 | 構成 | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通原則2を読んで判定。見出し15本（64〜472行目）。各節は1つのやり方か1つの落とし穴 |
| C07 | 構成 | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通原則4と guides/03 症状②を読んで判定。見出しは「(a) プロンプト指示は1ターンで安いが、形の保証は無い」のように結論を書く。「まず〜」「〜する」の実況形は0件 |
| C08 | 構成 | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1の肝と guides/05 チェックリストを読んで判定。`.ts` 6本は import から全行を載せ、`check-code-and-outputs.txt` で `code/` と一致。インストールの手順と実行結果（102〜134行目、376〜415行目、439〜444行目）を載せた |
| C09 | AI臭 | 書き手の態度が感じられる | OK | guides/03「態度の不在」を読んで判定。52行目「迷ったら `outputFormat` を選んでください」、450行目「結論は、迷ったら (c) です」、456行目で中身の誤りは防げないと書いた |
| C10 | AI臭 | 各セクションに言い切りの文が最低1つある | OK | guides/03「勇気の不在」を読んで判定。各 H2 に言い切りがある（例 78、96、231、283、318、423、450、460行目） |
| C11 | AI臭 | ヘッジが過剰でない | OK | guides/03 症状①を読んで判定。「でしょう」0件、「かもしれ」0件（`prose-check.txt`） |
| C12 | AI臭 | メタ発言を削った | OK | guides/03 症状②を読んで判定。ai-smell-lint の②メタ発言は0件（途中の2件は直した）。「解説します」「見ていき」「紹介します」「ここでは」0件 |
| C13 | AI臭 | 章境界アナウンスが無い | OK | guides/03 症状⑫を読んで判定。「ここから」「ここまで」「次は」「まとめ」「整理」0件（`prose-check.txt`）。489行目は末尾の決まった表記で、章の予告ではない。「次の記事」の文言は本文に0件 |
| C14 | AI臭 | テンプレ比喩を使っていない | OK | guides/03 症状⑬を読んで判定。「地図」「仕様書」「設計書」「レシピ」0件。ai-smell-lint の⑬も0件 |
| C15 | AI臭 | 対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧を読んで判定。writing-lint の B-1 対比構文0回。「ではなく」「ではありません」「じゃない」0件 |
| C16 | AI臭 | 文長に緩急がある | OK | guides/03「リズムの不在」と原因⑦を読んで判定。`prose-check.txt` の地の文133文で、最短13字、最長59字、20字以下12文、41〜60字39文 |
| C17 | AI臭 | 同じ語尾が3回以上連続していない | OK | guides/03「語尾の反復チェック」を読んで判定。`prose-check.txt` の `C17 SAME3(3字)=0`。2字の参考の扱いは `lint/judgments.md` |
| C18 | AI臭 | ブツ切り回避 | OK | guides/03 症状⑮を読んで判定。主語と目的語を残して分けた（例 265行目「`tool()` に zod のスキーマを渡し、`createSdkMcpServer()` で包みます」）。体言止めの連続は無い |
| C19 | AI臭 | ですます/である調が統一されている | OK | guides/03 症状⑮を読んで判定。`prose-check.txt` の `C19 non-desumasu prose=0`。箇条書きの (a)〜(c) の説明（58〜60行目）は体言に近い常体の項目で、guides/05 §7「箇条書きは体言止めOK」の範囲 |
| C20 | コロケーション | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」を読んで判定。「例外を投げました」（324行目）、「結果がエラーになります」（314行目）。表のミスマッチ例は0件 |
| C21 | コロケーション | 漢語サ変動詞の助詞が合っている | OK | guides/04「自動詞・他動詞の取り違え」を読んで判定。「〜を向上する」「〜を発生する」「〜を変化する」の形は0件 |
| C22 | コロケーション | 形容詞と名詞が合っている | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」を読んで判定。表の誤り例（濃い理解、大きい精度など）は0件 |
| C23 | コロケーション | 重言が無い | OK | guides/04「重言」を読んで判定。「まず最初」0件。「約〜程度」「各〜ごと」も0件 |
| C24 | コロケーション | 翻訳調が無い | OK | guides/04「翻訳調」を読んで判定。「〜を作る（make）」「〜を持っている（have）」の形は0件 |
| C25 | 正確さ | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」を読んで判定。`prose-check.txt` の `C25 over60=0 max=59`（インラインコードもリンクの URL も書かれた文字数のまま数えた） |
| C26 | 正確さ | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」を読んで判定。3つのやり方は全体で (a)(b)(c) と「プロンプト指示」「自作ツール」「outputFormat」で呼ぶ。見積もりは `total_cost_usd`、キャッシュは「キャッシュの書き込み」で統一 |
| C27 | 正確さ | 数量・期間が具体的な数値 | OK | guides/05 §4「曖昧表現の具体化」を読んで判定。件数（10件、20件）、トークン（16万から25万）、倍率（約470倍から710倍）、行数（15、25、14）、所要時間（ms）を数値で書いた |
| C28 | 正確さ | AND/ORが明確 | OK | guides/05 §4「AND/ORの明確化」を読んで判定。「や」の並列は0件（`prose-check.txt`、途中の3件は直した）。448〜454行目の選び方は条件ごとに1つを言い切る |
| C29 | 正確さ | ですます/である調が混在していない | OK | guides/05 §7「文体の統一」を読んで判定。C19 と同じ根拠 |
| C30 | 記号 | `**太字**` のアスタリスク残りが無い | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の `PAT bold **: 0` |
| C31 | 記号 | em-dash、罫線を使っていない | OK | guides/03「記号NG」を読んで判定。`PAT em-dash —: 0`、`PAT 罫線 ─: 0`、`PAT ― U+2015: 0` |
| C32 | 記号 | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03「記号NG」を読んで判定。全角コロンは423行目のモデルの出力の引用1か所で、後ろに空白は無い（`lint/judgments.md`）。`PAT 全角スラッシュ ／: 0` |
| C33 | 機械チェック | ai-smell-lint を実行し、FATALがゼロ | OK | guides/03「lint との関係」を読んで判定。手順7のコマンドで実行。`lint/ai-smell.txt` の `exit=0`、FATAL 0件 |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03 を読んで判定。最後の実行は warn 0件。途中の2件は `lint/judgments.md` に判断と処置 |
| C35 | 機械チェック | use か mention かを確認した | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。mention 0件。途中の warn 2件は use と判断して直した |
| C36 | 機械チェック | 悪い例の引用の書き方 | OK | guides/03「悪い例を引用するときの書き方」を読んで判定。悪い例の引用は無い。423行目の「ランチ会（幹事：渡辺）」は誤答の実例で、直後の425〜427行目で何が問題かと、防ぐには正解と比べる仕組みが要ることを書いた |
| C37 | 最後の一押し | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。動作確認の結果は 376〜415行目（`run/06.log`）、2回目は 419行目（`run/11.log`）。`strictMcpConfig` を外したときの数字（275〜287行目、`run/08.log`）と draft-7 の例外（324行目、`run/09.log`）は、検証の途中で実際に当たった問題を記録したもの。判断は 448〜456行目 |
| C38 | 最後の一押し | コードを実際に動かして確認した | OK | G04 と同じ根拠 |
| C39 | 最後の一押し | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | guides/03「沈黙の不在」を読んで判定。458行目「あなたの抽出では、形の保証と1件あたりの見積もりの、どちらを先に取りますか。」 |

## 結論

G07（リンク先がどれも未公開）が NG。G10 は OK（`target_query` を決めた）。G11 は未点検。`status: draft` のまま止める。
