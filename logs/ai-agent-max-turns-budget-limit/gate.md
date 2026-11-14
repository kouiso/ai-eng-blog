# gate: ai-agent-max-turns-budget-limit

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


## 3版目（2026-11-11）

オーナーの裁定に合わせて3点を直し、ゲートを回し直した。原稿は 469 行。

1. 利用条件の注意書きを消した（2版目の88〜92行、H3「プランで動かしてよいのは、自分で試す範囲です」と2段落）。そこでしか引いていなかった出典5を外し、番号を繰り上げた。
2. `run-agent.ts` の `baseOptions` に `strictMcpConfig: true, // claude.ai のコネクタのツールを読み込まない` を足した（171行目）。全部を動かし直し（`run/15.log`〜`33.log`、Node.js 22.23.4、macOS arm64）、出力と数値を新しいログに合わせた。`maxBudgetUsd` は、止まる例に 0.0005、完走する例に 0.0021 を使い、0.00066 は「上限が見積もりの範囲の中だと回で変わる」例として6回を表で見せる（0.0008 は最終の環境で4回とも `success`、`sources.md` の末尾）。`maxTurns` の節は、19回とも応答3回だった結果に合わせて見出しと文を直した。
3. 2版目の56行目のリンク（原稿の無い `ai-agent-tool-use-loop-typescript`）と「Messages API でループを自作する場合は別の記事で扱う」という文を消し、53行目で `ai-agent-custom-tools-agent-sdk` へのリンクに向け直した。

3版目の判定の前に、Read ツールで `.claude/skills/write-article/SKILL.md`（全文）、`guides/02-article-structures.md`（全文）、`guides/05-technical-writing.md` の §1〜2、`guides/09-ai-writing-manual.md` の §2、`guides/08-ai-buntai-ruleset.md` の B-2〜B-10 と密度基準総表、`guides/06-rewriting-prompts.md` の「使い方の流れ」、`guides/03-anti-ai.md` の「5つの不在」と「引用（mention）と使用（use）の区別」を読み直した（2026-11-11）。

判定し直した行（行番号は 469 行の版）: G01、G02、G04、G05、G07、G08、G09、C06〜C10、C16、C17、C21〜C23、C25〜C28、C33、C37、C38。ほかの行も、行番号は 2026-11-14 に今の469行の版へ数え直した。判定は A が OK 8 / NG 2（G07、G10）、B が OK 38 / 任意・あり 1 で、2版目と同じ。

判定日: 2026-11-10（2版目。外部レビューの指摘3件を直して判定し直した）。原稿: `content/articles/ai-agent-max-turns-budget-limit.md`（476行。行番号はすべてこの版）。

## 2026-11-10 の2回目の直し（C25）

タイトル（2行目）を63字から60字に短くした（「AI エージェントを上限で止める【Claude Agent SDK の maxTurns と maxBudgetUsd】」）。本文は変えていないので、行番号は下の判定のまま。直したあとに `ai-smell-lint.py` と `writing-lint.py` を回し直し、出力は直す前と同じ（FATAL 0、DENSITY超過 0、SHOULD 0）。`prose-check.txt` を取り直し、60字超 0。判定の前に `guides/01-seo-for-dev-blogs.md` と `guides/05-technical-writing.md` を読み直した。

## 判定の前に読んだもの

2026-11-10 に、次を全文読んでから全項目を判定した。

- Read ツールで全文: `docs/tech-writing-pack/checklist.md`（61行）、`guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）、`06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `keywords/README.md`、`content/plan.md`、`.claude/skills/write-article/SKILL.md`（全文）
- 補助スクリプトは `logs/ai-agent-safe-file-tool/lint/prose-check.py` を写したもの（除外と数え方は同じ）と、この記事用に書いた `check-code-and-outputs.py`

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

2版目の判定の前にも、同じ日（2026-11-10）に Read ツールで `checklist.md`（61行）、`guides/01`（192行）、`02`（173行）、`03`（443行）、`04`（265行）、`05`（183行）、`06`（186行）、`08`（266行）、`09`（97行）を全文読み直した。2版目で変えたのは原稿の92行目（1文を2文に足した）と362〜364行目（0.0008 の回の説明を書き直し、段落を2つに分けた）。363行目以降は1版目から2行うしろにずれた。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | 3版目（2026-11-11）に guides/03「引用（mention）と使用（use）の区別」「lint との関係」「悪い例を引用するときの書き方」を読み直して判定。469行の版で `lint/ai-smell.txt` 2行目 `✅ クリーン`、`use 0件 / 📎mention 0件`、`--- 判定: ✅ 致命なし`、末尾 `exit=0`。frontmatter（1〜47行目）の mention も0件。2版目までの経緯（途中の版の warn 1件は use と判断して直した）は `judgments.md` |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | 3版目に guides/09 §2 と guides/08 の B-2、B-3、密度基準総表を読み直して判定。`lint/writing-lint.txt` 1行目 `469行/160文`、判定行 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、`exit=0`。3版目の途中で出た B-2 三連反復1か所（269、291行目の「〜ました」）は直した（`judgments.md` の3版目）。WATCH の節なし、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B の C01〜C38 は全部 OK（C25 は 2026-11-10 にタイトルを60字に直して OK）、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Messages API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格。Agent SDK の記事はオーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 3版目で `run-agent.ts` に `strictMcpConfig: true`（原稿171行目、`code/run-agent.ts` 10行目）を足したので、全部を動かし直した。`query()` は3か所（`code/run-agent.ts`、`code/no-catch.ts`、`code/extra/show-blocks.ts`）で、どれも `baseOptions` を広げて渡すので3/3に入る。入れた SDK の型に `strictMcpConfig?: boolean;` があることは `run/17.log`（`sdk.d.ts` 2416行目）。`lint/check-code-and-outputs.txt`（ALL OK、25個）: 記事のコードブロックが、記事の順に `code/` の5ファイル、`run/` の command 行、`run/` の出力と1文字も違わない（出力は末尾の改行だけ除いて比べた）。0.00066 の節の表6行は `run/31.log`（確認用の3回）と `run/33.log`（3回）の合計と `subtype` に一致する（`lint/check-code-and-outputs.txt` の `0.00066 table` の行）。0.0021 の例は `run/23.log`、0.0005 の例は `run/21.log`。インストールの4つのコマンドは `run/16.log` で `&&` でつないで同じ順に実行した（mkdir と cd は `code/extra/run-strict.sh` が行う）。実行は `code/extra/run-strict.sh`（`run/15.log`〜`29.log`）と `run-one.sh`（`run/30.log`〜`33.log`）。どれも `--- exit=0`（`run/24.log` の中の `exit=1` は記事が見せる `no-catch.ts` の終了コード）。実行日は 2026-11-11（このマシンの時刻、PST。ログの `date:` 行は UTC で 2026-11-12T01:02:12Z〜01:05:38Z）、node v22.23.4 / npm 10.9.9 / Darwin arm64、`ANTHROPIC_API_KEY: unset`。Messages API は呼ばない（`needs_api_key: false`、43行目）。オーナーの Claude プランで動かし、モデルを呼んだ `run/19`〜`24`、`28`〜`33.log` の init の行はすべて `apiKeySource none`、`claude-haiku-5-5`、`Claude Code 2.1.322`。SDK の版は `run/26.log`（`@anthropic-ai/claude-agent-sdk@0.3.322`）。型は `run/27.log`（tsc 7.0.2、`tsc_exit=0`）。380行目の「確認用の3回のうち2回は、回答の文が届いてから止まった」は、記事に載せない `code/extra/show-blocks.ts` の `run/31.log` の0.00066 の3回（3回とも `error_max_budget_usd`、2回は応答3の text のあと、1回は text なし）に一致する。0.00066 の回が一般に回答まで生成される、という書き方はしていない。2版目までのログ（`run/01.log`〜`14.log`）は残してある |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 453〜467行目に出典の表（9件、題名、URL、確認日 2026-11-10）。3版目で利用条件の段落を消し、そこでしか引いていなかった Legal and compliance（2版目の出典5）を表、frontmatter の `sources`、`sources.md` から外して、出典6〜10 を 5〜9 に繰り上げた。引用番号と表の行が1対1なことはスクリプトで確かめた（引いている番号 1〜9、表の行 1〜9、frontmatter の `sources` 9件）。断定した文は（出典n）で表を引く（49、62、68、81、83、132、157、224〜227、229、301、380、388、430、436、438、440、442行目）。文ごとの対応と、実行ログを根拠にした文は `sources.md`。料金は 434〜442行目で、プランの利用枠から引かれること（出典5）、`total_cost_usd` は手元で計算した見積もりで請求額ではないこと（出典3）、結果を載せた6回の合計が約0.0040ドルの見積もり（`run/19`、`20`、`21`、`23`、`24.log` と `run/33.log` の1回目の合計 0.00397414）、API キーで動かすときの Haiku 5.5 の単価（出典7）。frontmatter 9〜11行目: `cost_estimate`（本文と同じ約0.0040ドル）、`run_environment: "Node.js 22.23.4、npm 10.9.9、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、モデル claude-haiku-5-5、macOS arm64（型の確認は TypeScript 7.0.2）"`（`run/15`〜`33.log` の見出し、init の行、`run/26.log`、`run/27.log` と一致。ログの `Darwin arm64` を macOS arm64 と書いた）、`verified_at: "2026-11-11"`（最後の実行 `run/33.log` の日付。ログの `date:` 行は UTC の 2026-11-12T01:05:38Z で、このマシンの時刻 PST では 2026-11-11 17:05。`date +%F` の日付にそろえた） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | 2版目で取り直した（2026-11-10、`selection.md` の「既存記事との重なり」）。1版目の根拠（この記事のほか19本、grep で当たったのは `claude-agent-sdk-first-agent` だけ）は、そのあとに記事が増えて成り立たなくなっていた。今は `ls content/articles/` で23ファイル、この記事のほか22本の frontmatter（title、main_keyword、target_query）を全件読んだ。`target_query` はどれも null。上限そのもので `grep -lnE 'maxTurns|maxBudgetUsd|error_max_turns'` をかけると、当たるのは `claude-agent-sdk-first-agent` と `ai-agent-vs-workflow` の2本。`claude-agent-sdk-first-agent`（plan #17、導入とメッセージの読み方）は上限を入れたことに触れ、止まったときの結果と例外はこの記事に回すと書いている（314行目）。`ai-agent-vs-workflow` は比較の記事（エージェントとワークフローの違い）で、`maxTurns: 10` を停止条件として入れ（322、348行目）、`maxTurns` と `maxBudgetUsd` の少なくとも一方を渡すと書く（412行目）が、止まったあとの扱いは414行目でこの記事へのリンクに任せている。`maxBudgetUsd` の超え方、ターンの数え方、上限の値の決め方、例外の受け止め方は、どちらの記事にも無い。Agent SDK の語が出る残りの2本（`llm-as-a-judge-claude`、`promptfoo-llm-eval-intro`）は採点と評価の記事で、上限は0行（`llm-as-a-judge-claude` は239行目でこの記事へリンク）。ほかの18本は Agent SDK と上限の語が0行 |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | OK | 2026-11-14 に #31 で判定し直した。公開の順（`content/plan.md` の「公開の順番」）で18番。本文の内部リンクは2件で、リンク先はすべて自分より前の順番: 53行目 `/posts/ai-agent-custom-tools-agent-sdk`（16番）、53行目 `/posts/claude-agent-sdk-first-agent`（17番）。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。frontmatter は `prev: claude-agent-sdk-first-agent`、`next: ai-agent-safe-file-tool` のまま。次の記事への本文リンクは外した。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 469行目「AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。」。日付は最後の実行（`run/33.log`。PST で 2026-11-11、ログの UTC 表記では 2026-11-12T01:05:38Z）と同じ日 |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 3版目で、原稿と `logs/ai-agent-max-turns-budget-limit/` の全ファイル（足した `run/15.log`〜`33.log`、`code/extra/run-strict.sh`、`run-one.sh` を含む）に `sk-ant`、`ANTHROPIC_AUTH`、`oauth`、`token`、`password`、`secret`、`api_key`、`/root`、`/home/user`、`/Users/`、`tmp/claude`、`scratchpad`、`session_id`、メールアドレスの形を Python の正規表現（大文字小文字を区別しない）でかけた。当たったのは、この行に並べた検索語そのもの（`gate.md`）、環境変数の名前 `ANTHROPIC_API_KEY` と frontmatter の `needs_api_key`、`selection.md` の slug の「token」、メールアドレスの形に見える npm のパッケージ名（`@anthropic-ai/claude-agent-sdk@0.3.322`、`agent-limits@1.0.0`）だけ。値としての API キー、トークン、セッションの ID は0件。作業場所のパスは `<work>`、`<code>`、`<tc>` に置き換えて保存した（`/Users/` は0件）。init の行に出すのはモデル名、`apiKeySource`、Claude Code の版だけ。個人名: git のコミット作者名とメールアドレス（Claude 以外。名前の各語、メールのローカル部）、リポジトリのオーナーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字と英字）の10語を、原稿と `logs/ai-agent-max-turns-budget-limit/` の全ファイルに大文字小文字を区別せずにかけ、合計0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-ai-agent.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（Agent SDK でエージェントを動かし始めた TypeScript の開発者が、止まらないのを防ぐ方法を検索したときに、2つの上限の渡し方、止まったときの result と例外、値の決め方を実行結果つきで答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」を 2026-11-10 に読み直して判定。2行目「AI エージェントを上限で止める【Claude Agent SDK の maxTurns と maxBudgetUsd】」。講座のキーワード「AIエージェント」を左端に置き（表記は「AI エージェント」、tags と main_keyword は5〜6行目）、SDK 名と2つのオプション名を【】に具体的に書いた。C25 のために短くしたあとも、キーワードの位置と【】の中身は変えていない。「徹底解説」「完全ガイド」は0件（`prose-check.txt` の PAT） |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」、guides/02 タイプ1 のリード。49行目で「止める手段は2つの上限」と、それぞれが数えるもの、51行目で止まったときに届くもの（result、例外、`try` が無いと終了コード 1）を示した。53行目で対象読者を示した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアル。guides/02 タイプ1 を原本で読み、要素ごとに照合した（`brief.md` の表）。結論の節（55行目）→ 前提・環境（72行目）→ セットアップ（85行目）→ 手順ごとにコードとその時点の実行結果（155、242、267、299、359行目）→ 詰まりやすい所（386行目）→ 料金（434行目）→ 確認すること（444行目、次の記事へのリンク）。所要時間の目安は計っていないので書いていない（`brief.md`） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード（49行目）の1文目がループが続く理由、2文目が答え（2つの上限）。最初の H2（55行目）は見出しが結論で、止まったときに届くものの表と「両方を入れておくのが、この記事の結論です」（70行目）。詳細のコードと実行結果は後 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | 3版目に guides/02 共通の原則2を読み直して判定。H2 は 55（結論）、72（環境と前提）、155（maxTurns の数え方）、299（maxBudgetUsd の超え方）、382（例外）、430（料金）、440（確認）、451（出典）。H3 は 85（セットアップ）、242（2で止まる）、267（10なら最後まで答える）の3つ。2版目の H3「プランで動かしてよいのは、自分で試す範囲です」は消した |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | 3版目に guides/02 共通の原則4を読み直して判定。例「maxTurns: 2 だと、最後の回答の前で止まる」「maxTurns: 10 なら、最後まで答える」「maxBudgetUsd は、上限を超えた応答のあとで止まる」。3版目で直した267行目の H3 も、実行で何が起きたかを書いた内容の見出し。「まず〜する」型は0件。85行目「作業フォルダと見本のメモを作る」は作るもの（作業フォルダとメモ）を名指していて、手の動きの実況とは違う |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | 3版目に guides/02 タイプ1「チュートリアルの肝」と共通の原則3を読み直して判定。5ファイルを import から全文掲載し、ファイル名（134、159、231、303、386行目の地の文）、作業フォルダの作り方（98〜104行目）、前提（81行目 Node.js 18.14 以上、83行目 `ANTHROPIC_API_KEY` を外す、132行目 `"type": "module"` と `.ts` の拡張子）を示した。足した `strictMcpConfig: true` の理由は171行目のコードコメント1行。各コマンドの出力は `run/15`、`16`、`18`〜`21`、`23`〜`25.log` と `run/33.log` の1回目から写した（G04 の `check-code-and-outputs.txt`） |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | 3版目に guides/03 不在1を読み直して判定。「両方を入れておくのが、この記事の結論です」（70行目）、「上限は、成功したときの応答の数ちょうどに合わせないでください」（295行目）、「`num_turns` は、応答の数を数えるのには使えません」（297行目）、「金額の上限は、払ってもよい額から応答1回分を引いた値にします」（384行目）と判断を示した。実行で見つけたこと（Read の呼び方が回で変わる、見積もり額が同じ値でも回で変わる、`num_turns` が応答の数と合わない、例外でプロセスが終わる）の節を厚くし、環境と料金の節は短くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | 3版目に guides/03 不在2を読み直して判定。55: 70行目「両方を入れておくのが、この記事の結論です」、72: 81行目「別に入れる必要はありません」、85: 132行目「既定で有効です」、155: 157行目「1ターンです」、242: 265行目「`error_max_turns` で止まりました」、267: 297行目「使えません」、299: 384行目「超える分は止められないからです」、382: 420行目「「ループのあとの行」は出ていません」、430: 438行目「請求額でもありません」、440: 446行目「すべて確かめてください」、451: 455行目「どれも 2026-11-10 です」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」「可能性があります」「注意が必要」は0件（`prose-check.txt` の PAT）。「請求額と一致するとは限りません」（438行目）は出典3の "can drift from what you are actually billed" に合わせた言い方で、出典を付けた1か所だけ |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件（途中の版の「ここでは」1件は直した）、writing-lint の B-6 0回。「解説します」「見ていき」「紹介します」「ここでは」は0件（PAT）。57行目「先に、…表に並べます」は表の直前に置いた導入文（guides/05 §6）で、記事の構造の予告ではない |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「まとめ」「整理」は0件（PAT。途中の版の「まとめました」は直した）。「次のとおり」（74行目）、「次のように」（222行目）、「次の4つ」（446行目）は直後の内容を指す語。「次の記事」の文言は本文に0件 |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件、PAT の「地図」「仕様書」「設計書」「レシピ」0件。途中の版の「堂々めぐり」「歯止め」は比喩なので具体に戻した（`judgments.md`） |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではなく」「ではありません」「じゃない」0件 |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | 3版目に guides/03 不在4を読み直して判定。`prose-check.txt` で地の文の文長が11〜58字、20字以下13文、41〜60字30文（128文中）。例 244行目「上限を2にして動かします。」、269行目「上限を10にすると、最後まで答えました。」の短文のあとに、長い実行結果の説明が続く |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | 3版目に guides/03 症状⑥と guides/08 B-2 を読み直して判定。`prose-check.txt` の SAME3（末尾3字）0、2字の語尾の3連続も0。writing-lint の B-2 も0（3版目の途中で出た269、291行目の「〜ました」3連続は直した） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「`runAgent` は、同じ例外を `catch` で受けて1行表示します。そのあとも処理は止まりません。」（430行目）のように、2文目の主語が1文目から読み取れる |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文と description の文末を `prose-check.py` で調べ、ですます以外は0件（`prose-check.txt` の C19）。432行目の問いも「〜しますか」。表のセル、箇条書き、見出しは guides/05 §7 の例外 |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」「効果」は0件。「エラー」は地の文では「標準エラー」（405、420行目）だけで、「ファイルに逃がして」「例外の文が残っています」と、表の誤用に当たらない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「実行する」「処理される」「表示する」「設定されている」「固定する」など（2版目の「中継する」は3版目で消した段落にあった）。「処理は止まりません」（430行目）、「応答は最後まで処理され」（301行目、受身）、「`ANTHROPIC_API_KEY` が設定されていると」（83行目）で取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「額が大きい」（70行目）、「最も高い回」（335行目）、「標準エラーは長い」（405行目）程度で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」「約〜程度」「各〜ごとに」なし（PAT と ai-smell-lint の CO重言 0件）。「約 0.00065 ドル」「約30%」「約0.0040ドル」は「程度」と重ねていない。「例外を投げます」は throw の和訳だけ |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし（目視。途中の版の「同じ ID を持ちます」は「ID が同じです」に直した）。「メモを作る」（85行目）は実際にファイルを作る記述 |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | 3版目に guides/05 §1「文の長さ」（60字超で分割を検討、80字が上限）と「一文一意」を読み直して判定。3版目で書いた文のうち60字を超えた3文（53行目77字、291行目84字、`success` と合計の額の66字）は分けた（`judgments.md` の3版目）。取り直した `prose-check.txt` で `C25 over60=0 max=60`。インラインコード、リンク（URL を含む）、（出典n）も書かれたとおりに数え、除外はコードブロックと URL だけのセル9個だけ。タイトル（2行目）は2版目の2回目の直しの60字のまま |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。「応答」は Claude の出力1回（157行目で定義し、`message.id` で数える。229行目）、「ターン」は SDK の数え方の単位で、応答1回とそのツールの実行（157行目）。「上限」は `maxTurns` と `maxBudgetUsd` の値、「見積もり」「合計」は `total_cost_usd`、「プランの利用枠」で通した。`result` はメッセージの種類、`result` の欄（68行目）はフィールドとして書き分けた。製品名は Node.js、TypeScript、npm、Claude Code、macOS の公式表記。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。上限の値（1、2、3、10、0.0005、0.00066、0.0021）、応答の回数（3回）、実行の回数（15回、3回、19回、2回）、`num_turns` の値（5、上限より1多い）、約30%、0.00079436、0.00064186、0.0007558 ドル、約0.0040ドル、Node.js 18.14 以上と 22.18.0、0.10 ドルと 0.50 ドル、100万トークンと10万トークン。「数回動かし」（448行目）は、記事で示した回数（19回、291行目）を受けた確認項目。「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（PAT）。AND は「Glob と Read の2つ」（224行目）、「`subtype` と `errors`」（68行目）、「接続の失敗と、プロセスの失敗」（430行目）、「次の4つをすべて」（446行目）。OR は「`error_max_turns` か `error_max_budget_usd`」（表）、「再開しますか。それとも…」（432行目）。2版目の「アプリかサービス」は3版目で消した段落にあった |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。`—`、`─`、`―` 0件（PAT）、writing-lint B-5 0回 |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`：`、`／` は0件（PAT）。コードの出力の `subtype: …` などは半角コロンで、コードブロックの中 |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/ai-agent-max-turns-budget-limit.md > logs/ai-agent-max-turns-budget-limit/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、469行の版（3版目）に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。最後の版は warn 0件。途中の版の warn 1件（②「ここでは」）は use と判断して直した。writing-lint の SHOULD、WATCH、INFO も0件。lint が拾わない語（「止まる」「投げる」「逃がす」「後始末」）は guides/04 と guides/08 に照らして判断し、`judgments.md` に書いた |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。最後の版は FATAL、warn、mention がすべて0件。途中の版の warn 1件は use と判断した（`judgments.md`） |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。悪いコードの見本 `no-catch.ts` は、本文で「囲まないとどうなるか」（390行目）と明示し、コードの中のコメント（400行目）にも `try/catch` を付けないことを書いた。直後に実行結果（415〜432行目）と直し方（434行目、`runAgent` の `catch`）を置いた |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | 3版目に guides/03 不在1・不在4、guides/06「使い方の流れ」4 を読み直して判定。Claude が動かした結果と、そこからの判断: `run/20`、`28`、`30`、`32.log`（19回とも応答3回）と `run/21.log`（応答2で Read を1つだけ呼んだ）から、Read の呼び方は回で変わるので、上限は成功時の数ちょうどにしないと判断した（291〜295行目）。`run/20.log` と `28.log`（`num_turns` 5）、`run/19.log` と `24.log`（上限より1多い）から、`num_turns` を応答の数として読まず `message.id` で数えると決めた（297行目）。`run/21.log` と `33.log`（上限を超えて止まる）と `run/23.log`（0.0021 で成功）から、上限は払ってもよい額から応答1回分を引いた値にすると判断した（333、337、384行目）。0.00066 の回が回答まで生成されたかは、text のブロックも表示した `run/31.log` の3回だけを根拠に、「3回のうち2回」と数だけを書いた（380行目）。別の実行の合計との大小比較は根拠に使っていない。`run/33.log` の2回目（同じ値で `success`）から、見積もり額が回で変わると書いた（382行目）。`run/24.log` と `25.log`（終了コード 1、「ループのあとの行」が出ない）から、`for await` を `try` で囲むことを確認項目に入れた（446行目）。`run/19.log`（ファイルを3つ読んでも回答の前で止まる）から、上限に最後の回答の1回を足すことを見出しにした（155行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 3版目（`strictMcpConfig: true` を足したコード）で、記事のコードとコマンドをすべて動かし直した（`run/15`、`16`、`18`〜`25.log`、`run/33.log`、G04）。補助の確認は `run/17.log`（型定義の `strictMcpConfig`）、`run/26.log`（SDK の版と標準エラーの大きさ）、`run/27.log`（型）、`run/28.log`（`maxTurns: 3` を3回）、`run/30.log` と `32.log`（`maxTurns: 10` を5回と10回）、`run/29.log` と `31.log`（text のブロックも表示して `maxBudgetUsd` を試した）。モデルを呼ぶ実行は、オーナーの Claude プランで行った（`apiKeySource none`） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 432行目「上限で止まった作業を、上限を上げて再開しますか。それとも、そこで打ち切って人に結果を返しますか。」の1か所。答えは書いていない |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）

## 結論

G07、G10 が NG なので、`status: draft` のまま止める。

- G10: `keywords/` に CSV が届いていない（CSV 待ち）。`target_query` は null で、値は作っていない。
- G07: 前後と関連のリンク先（`claude-agent-sdk-first-agent`、`ai-agent-safe-file-tool`、`ai-agent-custom-tools-agent-sdk`）が、どれも公開も予約もされていない（3版目で関連のリンク先を、原稿の無い `ai-agent-tool-use-loop-typescript` から向け直した）。
- C25（G03）: 2026-11-10 の2回目の直しでタイトルを60字にして OK になった。`content/plan.md` #18 と `brief.md` のタイトルも同じ文に直した。

2版目（2026-11-10）で直したのは、外部レビューの指摘3件（362行目の 0.0008 の回の事実誤り、92行目の claude.ai ログインの禁止の抜け、G06 と `selection.md` の古い重なりの確認）。どれも判定は変わらず、NG は1版目と同じ3項目と C25。経緯は `lint/judgments.md` の末尾。

EmDash への投稿と git のコミットはしていない（執筆するエージェントの担当外）。
