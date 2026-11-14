# gate: claude-agent-sdk-first-agent

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


判定日: 2026-11-10（最初の判定は 07:29、再判定は 08:13 ごろ）。原稿: `content/articles/claude-agent-sdk-first-agent.md`（366行。行番号はすべて再判定の版）。

2026-11-11 に、オーナーの裁定3つに合わせる修正ラウンドを行った（Fix A: 利用規約や使ってよい範囲の注意書きを消す。旧 87〜93行目の節と、それだけが引いていた出典5を削除。Fix B: `query()` 2つに `strictMcpConfig: true` を足し、Mac で実行し直して出力と数字を差し替え。Fix C: 前の記事を `ai-agent-custom-tools-agent-sdk` に付け替え）。原稿は 349行になった（2026-11-14 時点）。行番号はすべて 2026-11-14 に今の349行の版へ数え直した。

再判定は、レビューで指摘された4件（前提の Node.js の版、#18 との重なり、G06 と G07 の根拠が古いこと、プラットフォームごとのパッケージ名）を確かめて直したあとに、全行を判定し直したもの。直した内容は `lint/judgments.md` の「再判定で直したもの」、重なりの読み直しは `selection.md` にある。

## 判定の前に読んだもの

2026-11-10 に、次を Read ツールで全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）、`06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `keywords/README.md`（cat で表示）、`content/plan.md`（Read で全文）、`.claude/skills/write-article/SKILL.md`（Read で全文）

再判定でも、2026-11-10 に次を Read ツールで全文読んでから全項目を判定し直した。`docs/tech-writing-pack/checklist.md`（61行）、`guides/01-seo-for-dev-blogs.md`、`02-article-structures.md`、`03-anti-ai.md`、`04-collocation.md`、`05-technical-writing.md`、`06-rewriting-prompts.md`、`08-ai-buntai-ruleset.md`、`09-ai-writing-manual.md`。`.claude/skills/write-article/SKILL.md` は sed で区切って全行を読んだ。`content/plan.md` は 85〜100行目（「重なりを避けるために決めたこと」）を読んだ。`keywords/README.md` は cat で読んだ。

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。lint のスクリプトのソースは読んでいない。出力の読み方はスキル手順7の表に従った。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜50行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | 2026-11-11 の修正ラウンドで判定し直した。guides/09 §2 を読み直して判定。`lint/writing-lint.txt` 1行目 `349行/136文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY は10カウンタすべて0回。SHOULD 0件、INFO 0件。`lint/ai-smell.txt` は `✅ クリーン`、`exit=0` |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Messages API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格。Agent SDK や `claude -p` の記事は、オーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 2026-11-11 の修正ラウンドで判定し直した。記事のコードは Agent SDK だけで、Messages API を直接呼ばない（`needs_api_key: false`、46行目）。`hello.ts`（151行目）と `agent.ts`（252行目）の `query()` に `strictMcpConfig: true` を足した（2/2。名前はインストールした 0.3.322 の `sdk.d.ts` 2416行目 `strictMcpConfig?: boolean;` で確かめた）。コードが変わったので、`code/extra/rerun-strict-mcp.sh` で記事の手順を最初から実行し直した（`run/15.log`〜`26.log`。古い `run/01.log`〜`14.log` は残した）。オーナー自身の Claude プランでログイン済みの Mac で実行し、`ANTHROPIC_API_KEY: unset`、モデルを呼んだ `run/21.log` の init は `apiKeySource=none claude_code_version=2.1.322`。`run/15.log`〜`25.log` はすべて `exit=0`、2026-11-11（ローカル日付。ログの UTC は 2026-11-12T01:02〜01:03）、node v22.23.4 / npm 10.9.9 / Darwin arm64、claude-agent-sdk 0.3.322 / bundled Claude Code 2.1.322。型は `run/24.log`（tsc 7.0.2、`tsc_exit=0`）。`run/26.log` は新しい `hello.ts` を Node.js v20.20.0 で動かし `ERR_UNKNOWN_FILE_EXTENSION`、`exit=1`（期待どおりの失敗。182行目の根拠）。`lint/check-code-and-outputs.txt` は ALL OK: 記事のコードブロック15個が `code/` と `run/16`〜`23` の command 行と出力に1文字も違わない |
| G05 | 断定した事実すべてに一次情報の出典（URL とアクセス日）があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 2026-11-11 の修正ラウンドで判定し直した。本文 332〜347行目に出典の表（10件）。Fix A で 出典5（Legal and compliance）を引いていた段落を消したので、表、frontmatter `sources`、`sources.md` から外し、6〜11 を 5〜10 に振り直した。スクリプトで、本文で引いた番号 {1..10} と表の行 {1..10} が一致し、frontmatter の URL 10件が表の順と一致することを確かめた。断定した文は（出典n）で表を引く（52、64〜66、68、72、82、106、133、135、176〜178、180、182、204、206、210、212、214、218、220、222、280〜282、284、308、310、326行目）。料金は、プランの利用枠から引かれること（220行目、出典5）、Pro が月払いで月20ドル（65行目、出典6）、`total_cost_usd` は定価で換算した見積もり（218行目、出典7）、API キーで使う場合の Haiku 5.5 の単価（222行目、出典8）。frontmatter の `run_environment`（10行目）は `run/15.log`〜`25.log` の見出しの行（node v22.23.4 / npm 10.9.9 / Darwin arm64、0.3.322 / 2.1.322）と `run/24.log` の `Version 7.0.2` と一致。`verified_at: "2026-11-11"`、`updated: 2026-11-11` は再実行の日（`date +%F`） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | guides/01 §1「検索意図」と §2 を読んで判定。再判定で `content/articles/` を読み直した（23本、この記事のほか22本）。最初の判定（07:29）のあとに `ai-agent-max-turns-budget-limit`（07:32）、`ai-agent-vs-workflow`（07:42）、`llm-as-a-judge-claude`（07:55）、`promptfoo-llm-eval-intro`（08:05）ができていて、`grep -l -i 'claude-agent-sdk\|agent sdk'` はこの記事のほか4本を返す。最初の判定の「Agent SDK を扱う記事はまだ無い」は誤りだった。4本を読んだ結果は `selection.md` の表。`ai-agent-max-turns-budget-limit`（#18）とは、最初の版の 326〜328行目（ターンの数え方、`error_max_turns`、`for await` の例外）が、あちらの見出し（当時の58、164、388行目）と重なっていた。`content/plan.md` 94行目の分担（#17 は導入と `query()` のメッセージの読み方、#18 は `maxTurns`・`maxBudgetUsd` と止まったときの結果と例外だけ）に合わせて3点を外し、312行目と314行目で「この記事では扱いません」と書いた。再判定の版で `grep -n '投げ\|error_max_turns'` は0件。`ai-agent-vs-workflow` は比較、`llm-as-a-judge-claude` と `promptfoo-llm-eval-intro` は評価の検索意図で、Agent SDK は道具として使うだけ（メッセージの読み分けはこの記事にリンクして任せている）。ほかの18本も重ならない（`selection.md`） |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | OK | 2026-11-14 に #13 と #31 の裁定で直した。公開の順で17番。本文の内部リンクを1件足した: 72行目 `/posts/claude-code-api-key-billing-auth`（5番）。既にあった前の記事へのリンクと合わせて、本文リンクは 58行目 `/posts/ai-agent-custom-tools-agent-sdk`（16番）, 72行目 `/posts/claude-code-api-key-billing-auth`（5番） で、すべて自分より前の順番。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。足したリンクは既存の文の中に入れたもので、段落は増やしていない。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 2026-11-11 の修正ラウンドで判定し直した。349行目「AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。」。日付は記事に写した実行（`run/15.log`〜`26.log`）のローカル日付と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/claude-agent-sdk-first-agent/`（この gate.md を除く）に `sk-ant`、`token`、`password`、`secret`、`api_key`、`/root`、`/home/user`、`tmp/claude`、`scratchpad`、`session_id`、メールアドレスの形を `grep -rniIE` でかけた。該当は、環境変数の名前 `ANTHROPIC_API_KEY`（原稿 72、75、82、210行目、`selection.md`、`brief.md`、`run-all.sh`、各 `run/*.log` の `ANTHROPIC_API_KEY: unset` の行）と frontmatter の `needs_api_key`、`run-all.sh` の `/root/` を `~/` に置き換える sed の式だけ。値としての API キーやトークンは0件。UUID の形（`[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}`）も0件で、セッションの ID は残っていない。コードは init の `session_id` と `cwd` を表示しない。作業フォルダのパスは `<work>`、型の確認用のフォルダは `<tc>` に置き換えて保存した。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分。名前の各語、メールのローカル部）、ユーザーのメールアドレスのローカル部、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）の18語を1語ずつ `grep -rniIF` で原稿と `logs/claude-agent-sdk-first-agent/` にかけた。当たったのはメールのドメインの断片の2語（`anthropic`、`com`。パッケージ名と URL に出る）だけで、人名に当たる語は0件。再判定: 足した `run/12.log`〜`14.log`、`code/extra/run-node-versions.sh` と原稿に、同じ語（`sk-ant`、`password`、`secret`、`/root`、`/home/user`、`tmp/claude`、`scratchpad`、`session_id`、メールアドレスの形、UUID の形）を `grep -rniIE` でかけ、当たったのは `run-node-versions.sh` の `/root/` を `~/` に置き換える sed の式だけ。個人名は、git のコミット作者名とメールアドレスのローカル部（Claude 以外）、CLAUDE.md の人格設定の人名（漢字と英字の姓・名）、ユーザーの GitHub アカウント名の12語を、原稿と `logs/claude-agent-sdk-first-agent/` の全ファイルに大文字小文字を区別せずにかけて0件（語そのものはここに書かない） 2026-11-11 の修正ラウンド: 足した `run/15.log`〜`26.log` と `code/extra/rerun-strict-mcp.sh` に、ユーザーのアカウント名、`/Users/`、`scratchpad`、`tmp/claude`、`sk-ant`、メールアドレスの形を `grep -rlniIE` でかけて0件（作業フォルダは `<work>`、ホームは `~/` に置き換えて保存した） |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-ai-agent.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計 | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭と §1 を読んで判定。`brief.md` の「C01 の1行」（LLM の API を少し触った TypeScript の開発者が、Agent SDK で最初のエージェントを動かす方法を探したときに、プランのログインで `query()` を動かす手順とメッセージの読み分けを実行結果つきで答える） |
| C02 | 設計 | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」を読んで判定。2行目のタイトルは「Claude Agent SDK」を先頭に置き、【TypeScript、Claude プランで試す】で環境と条件を示す。「徹底解説」「完全ガイド」は0件（`prose-check.txt` の PAT）。`target_query` は G10 で OK（`keywords/google-suggest-ai-agent.csv` に一致する行がある） |
| C03 | 設計 | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文（導入）が最重要」を読んで判定。52行目で SDK が何をするか、54行目でプランのログインなら API キーが要らないこと（実測の `apiKeySource` つき）、56行目で記事で何をするかを書いた |
| C04 | 設計 | 検索意図のタイプに構成が合っている | OK | guides/01 §1 と guides/02 タイプ1を読んで判定。やり方（How-to）に対してチュートリアルの骨格（前提・環境 60行目の節 → セットアップ 84行目の節 → 1本目 137行目の節 → 2本目 224行目の節 → 動作確認と判断 306〜330行目 → 関連記事は 58行目のリンク1件）。各手順にコードと実行結果をセットで置いた |
| C05 | 構成 | 結論先行になっている | OK | guides/02 共通原則1を読んで判定。リードで答え（`query()` がプランのログインで動き `apiKeySource` が `"none"`）を先に置き、各節も冒頭の文で結論を言ってから理由と詳細に入る（例 84行目の見出しと86行目、224行目の見出しと226行目） |
| C06 | 構成 | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通原則2を読んで判定。見出し（60、84、137、208、216、224、306、316、324、332行目）を順に読むと、前提 → インストール → 1本目のメッセージの順 → apiKeySource → 費用の見積もり → 2本目の tool_use と tool_result → 1組の対応 → 実行ごとの違い → 残る判断 → 出典、と流れる |
| C07 | 構成 | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通原則4と guides/03 症状②を読んで判定。見出しはどれも中身を言い切る形（「npm install 1回で、Claude Code の本体も一緒に入る」「apiKeySource が none なら、API キーは使われていない」など）。「まず〜する」型は0件 |
| C08 | 構成 | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | 2026-11-11 の修正ラウンドで判定し直した。guides/02 タイプ1「チュートリアル」を読み直して判定。`hello.ts`、`agent.ts` は import から全文で、`strictMcpConfig: true` の行も含めて `code/` と同じ。前提は 60〜82行目（Node.js 22.18.0 以上、プラン、ログイン、`ANTHROPIC_API_KEY` を外す）。182行目の Node.js 20.20.0 で動かないことは、新しい `hello.ts` で `run/26.log` に取り直した。`ls` の結果は Apple シリコンの Mac のもの（`run/20.log`）だと 121行目に書き、ほかの名前（`linux-x64`、`win32-x64`）は 133行目（`run/14.log`）。全コマンドの実行結果を `run/` からそのまま載せた（`lint/check-code-and-outputs.txt` ALL OK） |
| C09 | AI臭 | 書き手の態度が感じられる | OK | guides/03「態度の不在」を読んで判定。API キーが使われていないことを見出しで言い切り（208行目）、読み取りのツールに絞る組み合わせを安全と判断（284行目）、出力の文字列をそのまま比べるテストは向かないと判断（320行目）。重要な節（2本目、224〜322行目）を長く、インストールの節を短くした |
| C10 | AI臭 | 各セクションに言い切りの文が最低1つある | OK | guides/03「勇気の不在」を読んで判定。60節「SDK は…同梱しています」（68行目）、208節「`"none"` は、API キーを使っていないという意味です」（212行目）、84節「この `darwin-arm64` が…本体です」（133行目）、137節「このうち読むのは、次の表の種類です」（196行目）、216節「`total_cost_usd=0.0002985` は、定価で換算した見積もりです」（218行目）、224節の読み取りのツールに絞る組み合わせ「…手元で試すには安全です」（284行目）、306節「Agent SDK では、届いた `user` を読めば済みます」（310行目）、316節「…このコードには向きません」（320行目）、324節「残る判断は…です」（328行目） |
| C11 | AI臭 | ヘッジが過剰でない | OK | guides/03 症状①を読んで判定。「でしょう」「かもしれ」「可能性があります」は0件（`prose-check.txt` の PAT） |
| C12 | AI臭 | メタ発言を削った | OK | guides/03 症状②を読んで判定。「解説します」「紹介します」「見ていき」「ここでは」は0件（`prose-check.txt`）。リード56行目の「この記事では…読み分けます」は guides/05 §3「メタ発言」の例外（冒頭リード文）に当たる1文だけ。writing-lint の B-6 メタ談話予告も0回 |
| C13 | AI臭 | 章境界アナウンスが無い | OK | guides/03 症状⑫を読んで判定。「ここから」「ここまで」「次は」「まとめ」「整理」は0件（`prose-check.txt`）。ai-smell-lint の検出も0件 |
| C14 | AI臭 | テンプレ比喩を使っていない | OK | guides/03 症状⑬を読んで判定。「地図」「仕様書」「設計書」「レシピ」は0件（`prose-check.txt`）。ほかの比喩（土台、両輪、潤滑油など）も使っていない（ai-smell-lint 0件） |
| C15 | AI臭 | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧を読んで判定。「ではなく」「ではありません」「じゃない」は0件（`prose-check.txt`）。writing-lint の B-1 対比構文も0回。見出しにも無い |
| C16 | AI臭 | 文長に緩急がある | OK | guides/03「リズムの不在」と原因⑦を読んで判定。`prose-check.txt` 3行目（再判定の版）、地の文99文で最短13字、最長60字、20字以下10文、41〜60字48文。1文だけの段落（62、82、121、278、330行目）も挟んだ |
| C17 | AI臭 | 同じ語尾が3回以上連続していない | OK | guides/03「語尾の反復チェック」を読んで判定。`prose-check.txt` 4行目、末尾3字での3連続は0件。2字の「ます」「です」の3連続（参考）は9か所あるが、末尾3字では一致しない（「られます」「ています」「きます」などに分かれる）。再判定で足した文で出た3字の3連続と2字の「した」の3連続は崩した。判断は `lint/judgments.md` |
| C18 | AI臭 | 一文を短くしすぎて主語・目的語を削っていない | OK | guides/03 症状⑮を読んで判定。最短の文は13字（`prose-check.txt`）で、主語か目的語を持つ。60字を超える文を分けたときも「省いた場合は」「これは」など主語を残した（180、222行目） |
| C19 | AI臭 | ですます/である調が統一されている | OK | guides/03 症状⑮と guides/05 §7「文体の統一」を読んで判定。`prose-check.txt` 6行目、地の文と description でですます以外の文末0件。writing-lint の文体混在も検出なし。見出しと表のセル、箇条書きの体言止めは guides/05 §7 の例外 |
| C20 | コロケーション | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」を読んで判定。「課題」「問題」「目標」「効果」は本文に無い。再判定の版で「エラー」に付く動詞は、182行目「`ERR_UNKNOWN_FILE_EXTENSION` のエラーが出て」で、自然な結びつき。最初の版の「例外を投げます」は #18 との重なりを外したときに消えた |
| C21 | コロケーション | 漢語サ変動詞の助詞（が/を）が合っている | OK | guides/04「自動詞・他動詞の取り違え」を読んで判定。「実行できます」（182行目）、「同梱しています」（68行目）はどちらも目的語を「を」で取るか目的語なしで正しい。旧版の「認証します」は今の原稿に無い |
| C22 | コロケーション | 形容詞と名詞が合っている | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」を読んで判定。「最も早い締め切り」「桁の多い小数」は自然な結びつき。表の誤り例（濃い理解、大きい精度など）に当たる組み合わせは無い |
| C23 | コロケーション | 重言が無い | OK | guides/04「重言」を読んで判定。「まず最初」0件（`prose-check.txt`）。「例外を投げる」は再判定の版に無い（`grep -n '投げ'` 0件） |
| C24 | コロケーション | 翻訳調が無い | OK | guides/04「翻訳調」を読んで判定。「〜を作る」（影響を作る型）、「〜を持っている」（質問を持っている型）は無い。「ツールを持たせずに」（139行目）は道具を渡す意味で、翻訳調の表の型に当たらない |
| C25 | 正確さ | 60字超の長文を分割した | OK | 2026-11-11 の修正ラウンドで判定し直した。guides/05 §1「文の長さ」を読み直して判定。`lint/prose-check.txt` 2行目 `C25 over60=0 max=60`。修正の途中で60字を超えた4文（69、65、65、71字。58、70、121、320行目）は短くするか分けた |
| C26 | 正確さ | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」を読んで判定。「プランのログイン」「利用枠」「メッセージ」「ツールの呼び出し」「見積もり」を全体で同じ語で書いた。SDK の型の名前（`tool_use`、`tool_result`、`apiKeySource`）は公式の表記のまま |
| C27 | 正確さ | 数量・期間が具体的な数値 | OK | 2026-11-11 の修正ラウンドで判定し直した。guides/05「曖昧表現の具体化」を読み直して判定。行数（67行、56行目。`code/hello.ts` 29行と `agent.ts` 38行）、版（0.3.322、2.1.322、22.23.4、22.18.0、20.20.0）、料金（月20ドル、0.10ドル、0.50ドル、10万トークン）、メッセージの数（4つ、196行目。`run/21.log`）、ターン数（5）、見積もり（0.0002985、0.00073444）を数値で書いた |
| C28 | 正確さ | AND/ORが明確 | OK | guides/05 §4「AND/ORの明確化」を読んで判定。「や」の並列は0件（`prose-check.txt`）。「Pro、Max、Ultra のどれか」（65行目）、「claude.ai のログインでも Bearer トークンでも」（212行目）で OR を明示した |
| C29 | 正確さ | ですます/である調が混在していない | OK | guides/05 §7「文体の統一」を読んで判定。C19 と同じ根拠（`prose-check.txt` の non-desumasu 0件） |
| C30 | 記号 | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の `PAT bold **: 0` |
| C31 | 記号 | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の em-dash、罫線、U+2015 がどれも0件。writing-lint の B-5 ダッシュも0回 |
| C32 | 記号 | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の全角コロン0件、全角スラッシュ0件（コードブロックの外。コードブロック内の実行結果の「例：」は原文のまま） |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | guides/03「lint との関係」を読んで判定。手順7のコマンドで実行。`lint/ai-smell.txt` 5行目 `✅ 致命なし`、10行目 `exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。warn 0件。lint が拾わない症状③⑦⑮は目視で見て、`lint/judgments.md` に直した点を書いた |
| C35 | 機械チェック | FATAL/warnが use か mention かを確認した | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。FATAL 0件、warn 0件、mention 0件。frontmatter の範囲（1〜50行目）の mention も0件 |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」を読んで判定。悪い例の引用は原稿に無い（該当なし。mention 0件） |
| C37 | 最後の一押し | 自分の実体験・判断・動作確認した結果が入っている | OK | 2026-11-11 の修正ラウンドで判定し直した。guides/03「5つの不在」と guides/06「使い方の流れ」4を読み直して判定。実際に動かした結果（`run/21.log` の4つのメッセージと `apiKeySource=none`、`run/23.log` のツール呼び出しの流れと `num_turns=5`）、2回の実行の比較（`run/23.log` と `run/25.log` で Glob の引数だけが違った、320行目。答えの文面は今回は2回とも同じだったので、見出しと文から「答えの文面は変わる」を外した）、そこから下した判断（文字列の完全一致のテストは向かない、読み取りのツールに絞る組み合わせが安全 284行目、観測用のメッセージは読み飛ばしてよい 204行目） |
| C38 | 最後の一押し | コードを実際に動かして確認した | OK | 2026-11-11 の修正ラウンドで判定し直した。G04 と同じ根拠（`run/15.log`〜`26.log`、`lint/check-code-and-outputs.txt` ALL OK）。オーナーの Claude プランで実行した（`apiKeySource=none`） |
| C39 | 最後の一押し | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | guides/03「沈黙の不在」を読んで判定。330行目「あなたのエージェントには、どのツールまでを確認なしで渡しますか。」で節を閉じた（1か所） |

## 結果

再判定の結果も、2026-11-11 の修正ラウンドのあとも、G07（リンク先が未公開。公開の順番で解消する）が NG。G10 は `target_query` が確定して OK。ほかの G01〜G06、G08、G09 と、B の C01〜C38 は OK（C39 は任意で「あり」）。frontmatter は `status: draft` のまま止める。
