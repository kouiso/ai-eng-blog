# gate: mcp-server-resources-prompts

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


判定日: 2026-11-10（初回の判定は 2026-11-02）。原稿: `content/articles/mcp-server-resources-prompts.md`（454行、frontmatter は1〜74行目。行番号はすべて 2026-11-10 の版）。

2026-11-10 に、レビューで指摘された4点を直して全行を判定し直した。直した内容は末尾の「2026-11-10 の修正」に書いた。

## 判定の前に読んだもの

2026-11-02 に、次を Read ツールで全文読んでから全項目を判定した。2026-11-10 の判定し直しでも、`checklist.md`、`guides/01`〜`05`、`08`、`09` を Read ツールで全文読み直し、`guides/06` はスキルの表が指す「使い方の流れ」を含む170〜186行目を読み直した。`keywords/README.md` も読み直した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）
- `guides/06-rewriting-prompts.md`（186行。スキルの表が指す「使い方の流れ」は181〜186行目）
- `guides/08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `keywords/README.md`

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。2026-11-10 の版で回し直した `lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜74行目）の mention も0件。warn 0件（`judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。2026-11-10 の版で回し直した `lint/writing-lint.txt` 1行目 `454行/208文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY の上限（B-1 2回、B-5 2回、B-6 1回など）は guides/08 の標準の列と一致し、全カウンタ 0回。WATCH の節なし、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（ALL OK）: 記事のコード3つ（`package.json`、`server.ts`、`check.ts`）が `code/` と1文字も違わない。記事の bash のコードブロック5個は、中身がそのまま `run/01.log`〜`04.log` と `run/09.log` の command と一致し（`code/extra/run-all.sh` が記事の順に `bash -c` で実行）、直後の実行結果4個はログの出力と1文字も違わない（`mkdir` のブロックは出力なし）。リードの1行（81行目）は `run/04.log` の出力の行をそのまま抜き出したもの。終了コードはすべて 0。最後の実行は 2026-11-10（`code/extra/run-all.sh` で 01〜11 を全部やり直した）、node v22.22.0 / npm 10.9.4 / x86_64。2026-11-10 の実行から、各ログの末尾に所要秒数（`--- elapsed=`）を残し、npm のキャッシュを空のフォルダにして読者の初回と同じ条件にした（更新のお知らせ `npm notice` は 2026-11-02 の出力と比べられるよう切った。`code/README.md`）。2026-11-02 のログとの違いは、`run/03.log` の `in 2s` が `in 3s` になったことと、`--- elapsed=` の行が増えたことだけ（日時の行を除いて `diff` で確かめた）。本文の根拠にした確認は `run/05.log`〜`08.log`、`10.log`、型は `run/11.log`（TypeScript 7.0.2、exit=0）。API は呼ばない（`needs_api_key: false`、70行目） |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 429〜452行目に出典の表（18件、題名、URL、確認日。出典2、5、10、12、16 は 2026-11-10 に読み直したので 2026-11-10、ほかは 2026-11-02。frontmatter の `sources` の `accessed` も同じ）。断定した文は（出典n）で表を引き、文ごとの対応と、実行ログを根拠にした文は `sources.md`。料金は 417〜421行目で、手順はどれも LLM の API を呼ばないので API の料金はかからない、Claude Code の会話で使うには有料のプランか Console のアカウントが要る（出典13）。その操作は実行していないので「無料」とは書かず、していないと書いた。frontmatter 9〜11行目: `cost_estimate`（本文の料金の記述と同じ内容）、`run_environment: "Node.js 22.22.0、npm 10.9.4、SDK 1.32.2、zod 4.6.7、Linux x86_64（Inspector の確認は 2.13.0、型の確認は TypeScript 7.0.2）"`（`run/*.log` の見出し `node: v22.22.0 / npm: 10.9.4 / arch: x86_64`、`code/package.json` の固定した版、`run/09.log` の `inspector@2.13.0`、`run/11.log` の `Version 7.0.2` と一致）、`verified_at: "2026-11-10"`（最後の実行 `run/11.log` の日付 2026-11-10）。`run_environment` の値は 2026-11-10 のログの見出しとも同じ |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | 2026-11-10 に、`content/articles/` のこの記事のほかの18本（`ls content/articles/*.md` で19本、うち1本がこの記事）の frontmatter（`title`、`main_keyword`、`target_query`）を全件読み直した（2026-11-02 の判定のときは13本で、`mcp-connection-closed-fix` を含む5本がその後に増えた）。`target_query` はどれも null。MCP の記事は4本で、パイロット、Streamable HTTP、Inspector はツールだけを扱い、`mcp-connection-closed-fix` は Connection closed の原因と直し方を書くエラーの記事。18本の本文に `registerResource`、`registerPrompt`、`resources/read`、`prompts/get`、`resources/list`、`prompts/list` で `grep` をかけ、該当は `mcp-inspector-debug` の末尾（439行目）の次の記事への案内1か所だけ。`Resources` での `grep` では、`mcp-connection-closed-fix` の70行目（前の記事としてこの記事を案内する1文）も出るが、Resources と Prompts の中身は扱っていない。ほかの14本（LLM API、構造化出力、RAG、AIエージェント、LLM 評価）も該当なし。ツールの作り方と `claude mcp add` は繰り返さずリンクに任せた（`selection.md` の「既存記事との重なり」） |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | OK | 2026-11-14 に #31 で判定し直した。公開の順（`content/plan.md` の「公開の順番」）で24番。本文の内部リンクは3件で、リンク先はすべて自分より前の順番: 88行目と409行目 `/posts/mcp-server-typescript-stdio`（21番）、88行目 `/posts/mcp-inspector-debug`（23番）。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。frontmatter は `prev: mcp-inspector-debug`、`next: mcp-connection-closed-fix` のまま。次の記事への本文リンクは外した。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 454行目「AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。」。日付は最後の実行（`run/11.log`、2026-11-10）と `verified_at` と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/mcp-server-resources-prompts/` 全体に、32桁以上の16進、`sk-ant`、`ANTHROPIC`、`password`、`secret`、`token`、`api_key`、`/root`、`/home/user`、`tmp/claude`、`scratchpad` を `grep -rniIE` でかけた。2026-11-10 の版でもかけ直し、該当は、frontmatter の `needs_api_key`、`selection.md` の環境変数の名前と `unset` の記録、この gate.md の検索語の列挙だけ。値としての API キーやトークンは0件。ログのパスは `/path/to` と `~` に置き換えた。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分。名前、姓と名を分けたもの、メールのローカル部、数字の ID）、ユーザーのメールアドレスのローカル部、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）を1語ずつ `grep -rniI -F` で原稿と `logs/mcp-server-resources-prompts/` にかけ、0件（2026-11-10 にかけ直した。語の一覧はセッションの一時フォルダに置き、画面にも出さずに件数だけを見た。製品名の Claude に当たる語の該当は除いた） |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-mcp-server.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（MCP サーバーにツールを1つ作ったことがある TypeScript の開発者が、Resources と Prompts の公開方法を調べたときに、SDK v1.32.2 での登録の書き方、SDK のクライアントでの確かめ方、ツールとの使い分けに答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」。2行目「MCP サーバーで Resources と Prompts を公開する【ツール以外の2つの機能】」。「MCP サーバー」を左寄せで入れ、扱う機能の名前（Resources と Prompts）と位置づけ（ツール以外の2つ）を書いた。講座のキーワード「MCPサーバー」は tags と main_keyword（5〜6行目）にも入れた。タイトルはワークフローの指示で与えられたもの。「徹底解説」「完全ガイド」は0件（`prose-check.txt` の PAT） |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」、guides/02 タイプ1 のリード。76行目で、ツールのほかに Resources と Prompts があること、それぞれの定義、この記事で作るもの（ルールを返す Resource と見直しを頼む Prompt）を示し、78〜81行目で完成形の出力を見せた |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアル。guides/02 タイプ1 の骨格に照らした（`brief.md`）。リード（76〜88行目、完成形の出力、確かめた範囲、対象読者、所要時間。いちばん待つ Inspector の初回の `npx` が12秒、`npm install` が3秒）→ 3つの機能の違い（90行目）→ 前提・環境（104行目、Node.js の版、パッケージの版、ファイル構成）→ 番号付きの手順 1〜4（136、178、272、284行目、コードとその時点の実行結果）→ 動作確認（`node check.ts` の出力、332〜365行目）→ まとめに当たる節（423行目、次の記事へのリンク） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード（76行目）の1文目が「ツールのほかに2つある」の答え。各 H2 と H3 は見出しが結論（例 90行目「Resources と Prompts は使う人がツールと違う」、272行目「Prompt の引数は文字列で受け取る」、372行目「失敗はツールと違って例外で届く」）で、本文はコードと結果、理由、詳細の順 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 90（3つの違い）、104（環境）、136（準備）、178（Resource）、272（Prompt）、284（クライアントで確かめる）、407（Claude Code での使い方）、417（料金）、423（使う人で決める）、429（出典）。H3 は 262（ResourceTemplate）、372（失敗の返り方）、384（Inspector の CLI） |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「Resource は URI を決めて registerResource で登録する」「URI に変数がある Resource は ResourceTemplate で書く」「Inspector の CLI でも同じ要求を送れる」。「まず〜する」型は0件。104行目「前提となる環境」、417行目「料金がかからない範囲」は中身を名詞で示す見出し |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1、guides/01 §4。3ファイルを import から全文掲載し、ファイル名（145、180、286行目）、作業フォルダ（138行目）、前提（106行目 Node.js 22.18.0 以上、160行目 `"type": "module"`）を示した。各コマンドの出力は `run/01`、`03`、`04`、`09.log` から写した（G04 の `check-code-and-outputs.txt`） |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。102行目「手元の資料を会話に添えたいだけなら、ツールより Resource が向いています」とその理由（Claude Code ならユーザーが `@` で添えられ、モデルも自動で用意される読み取りのツールで同じ Resource を読める、出典12）。読者が引っかかる2点（SDK の not found のコードが仕様と食い違う 378行目、Claude Code が引数を空白で分ける 415行目）に節を割き、415行目では自分の `review-text` がその形になっていないことも書いた。料金と環境の節は短くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。90: 102行目「Resource が向いています」、104: 125行目「v1 系の 1.32.2 を使います」と123行目「v1 系で対応する予定はありません」、136: 160行目「指定が必要です」、178: 260行目「別のスキームにしてください」、262: 268行目「表の外を引かないためです」、272: 274行目「数に変換してください」と282行目「モデルを呼びません」、284: 368行目「`tools` は出ていません」、372: 378行目「`message` も合わせて読んでください」、384: 386行目「`resources/read` を送れます」、407: 415行目「1つの引数に空白は入れられません」、417: 419行目「料金はかかりません」、423: 425行目「最初に使う人を決めてください」、429: 431行目「確認日は、出典2、5、10、12、16 が 2026-11-10、ほかは 2026-11-02 です」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」は0件（`prose-check.txt` の PAT。途中の版の「どれでしょうか」を直した）。415行目「のが安全です」は条件（Claude Code から使う Prompt）を切って言い切っている |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件、writing-lint の B-6 0回。「解説します」「見ていき」「紹介します」は0件（PAT） |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「まとめ」「整理」は0件（PAT）。「次の形」「次のとおり」「次の1行」は直後の内容を指す語。427行目「[次の記事]」はスキルが求める講座の前後リンク |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件、PAT の「地図」「仕様書」0件。比喩は使っていない（`judgments.md`） |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではなく」「ではありません」「じゃない」0件。2026-11-02 の版で数えに入れていた102行目の「任せず、…選べるからです」は、2026-11-10 の修正で文ごと消えた。地の文に否定対比の形は無く、0回（`judgments.md`） |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。2026-11-10 の版の `prose-check.txt` 3行目で地の文の文長が10〜60字（154文）、20字以下8文、41〜60字86文。例 180行目「ツールはありません。」、282行目「このサーバーはモデルを呼びません。」の短文の前後に長い説明がある |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と語尾の反復チェック。`prose-check.txt` 4行目 SAME3（末尾3字）0、5行目の2字の語尾（「ます」「です」など）の3連続も0。途中の版の19か所を直した（`judgments.md`） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「埋め込む Resource には、URI と MIME タイプが要ります（出典3）。本文は `text` か `blob` のどちらかで入れます（出典3）。」（278行目）のように、2文目の主題は1文目から読み取れる |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文と description の文末を `prose-check.py` で調べ、ですます以外は0件（`prose-check.txt` 6行目）。表のセルは guides/05 §7 の例外。コードの中の文字列（`styleGuide` の箇条書きや用語の説明）は記事の地の文ではない |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」「効果」は0件。「エラー」は「エラーで返ります」（374行目）、「エラーになりました」（268行目）、「SDK が自分で返したエラー」（376行目）で、表の誤用に当たらない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「公開します」「登録します」「宣言した」「検査しません」「判定する」「実行していません」など、どれも他動詞として「を」を取るか目的語を伴う。取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「必須の引数」「普通の `Error`」「安全です」程度で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」「約〜程度」「各〜ごとに」なし。「例外を投げました」（374行目）は throw を和語で1回だけ書いた形（目視） |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし。「作業フォルダを作り」（138行目）、「引数の一覧は、SDK が…作る仕組みです」（276行目）は実体を作る記述。「`role` と `content` を持つメッセージ」（278行目）はデータの持つフィールドで、「質問を持っている」型ではない（目視） |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」。2026-11-10 の版の `prose-check.txt` 2行目で60字超 0（最長60字）。途中の版の17文を分けた。2026-11-10 の修正で足した文のうち62字になった1文（102行目）も短くした（`judgments.md`）。インラインコード、リンク（URL を含む）、（出典n）も書かれたとおりに数え、見出し、表のセル、frontmatter の title と description も数えた。除外はコードブロックと URL だけのセル18個 |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。機能の名前は仕様の表記どおり Resources、Prompts（総称）、Resource、Prompt（1つ）、ツール（Tools は仕様の表の中だけ。102行目の Claude Code が用意する「Resources を一覧して読むツール」も、モデルが呼ぶ関数なので同じ「ツール」）で通した。「読み取りの関数」「URI テンプレート」「作業フォルダ」「起動のログ」「前置き」で通した。製品名は Node.js、TypeScript、npm、Claude Code、MCP Inspector の公式表記。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。1.32.2、22.18.0、12秒と3秒、117行、2026-07-27 から少なくとも6か月、ファイル3つ、Resource 2つと Prompt 1つ、-32002、-32602、-32603、URI が3つ、プランが5つなど。「数個」「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（PAT）。AND は「Node.js 22.18.0 以上と npm」（106行目）、「URI と MIME タイプ」（278行目）、OR は「`text` か `blob` のどちらか」（278行目）、「有料のプランか Console のアカウント」（421行目） |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。地の文の `—`、`─`、`―` は0件（PAT）、writing-lint B-5 0回 |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`：`、`／` は0件（PAT） |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/mcp-server-resources-prompts.md > logs/mcp-server-resources-prompts/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、2026-11-10 の454行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。warn 0件で判断の対象なし（`lint/judgments.md`）。writing-lint の SHOULD、WATCH、INFO も0件。lint が拾わない語（「食い違っています」「取りこぼします」「安全です」など）は guides/04「技術ブログでの線引き」に照らして判断した（`judgments.md`） |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。FATAL、warn、mention がすべて0件で、区別が要る検出なし |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。失敗する要求（表に無い用語、テンプレートに合わない URI、必須の引数なし）は、失敗する要求だと前の文で明示し（374行目）、直後に結果の読み方と見分け方を置いた（376〜380行目）。普通のオブジェクトと普通の `Error` の版（268、270行目）も、失敗する形だと書いてから記事のコードでの書き方を示した |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/06.log`（オブジェクトの表で `constructor` を読むとクライアントの検証エラー）と `run/07.log`（Map の版は `-32002`）から、用語の表を `Map` にした（268行目）。`run/05.log`（普通の `Error` は `-32603`）から、`McpError` を `-32002` で投げる形にした（270行目）。`run/04.log` の2つ目の失敗（SDK が `-32602` を返す）と仕様の推奨（`-32002`）の食い違いから、コードだけで判定せず `message` も読むと書いた（378行目）。`run/08.log`（`list` なしだと一覧に用語が出ない）から、`list` で一覧に入れた理由を書いた（266行目）。`run/04.log` の前置きが2回付く出力を SDK のソースで読み解いた（382行目）。`run/09.log`、`10.log` で前の記事の Inspector の CLI からも同じ要求が送れることを確かめた（386〜405行目）。2026-11-10 の実行で各コマンドの所要秒数を測り（`run/09.log` の `elapsed=12s`、`run/10.log` の `elapsed=1s`、`run/03.log` の `in 3s`）、読者がいちばん待つのは Inspector の初回の `npx` だと判断してリードに書いた（86行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（最後は 2026-11-10。`run/01.log`〜`04.log`、`09.log`、G04）。本文の根拠にした確認は `run/05.log`〜`08.log`、`10.log`、型は `run/11.log`。API は呼んでいない（キーが無く、記事も API を使わない）。Claude Code の会話での操作（407〜415行目）は実行しておらず、本文にもそう書いた（409行目） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 425行目「あなたのサーバーのツールの中に、本当はユーザーが選ぶべきものはありますか。」の1か所 |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）

## 結論

G07 と G10 が NG なので、`status: draft` のまま止める。

- G10: `keywords/` に CSV が届いていない（CSV 待ち）。`target_query` は null で、値は作っていない。
- G07: 前後と関連のリンク先（`mcp-inspector-debug`、`mcp-connection-closed-fix`、`mcp-server-typescript-stdio`）は3本とも原稿があるが、どれも `status: draft` で、公開も予約もされていない。前の記事と関連のパイロットが先に予約され、次の記事 `mcp-connection-closed-fix` がこの記事より後の日時で予約されるまで、この記事のリンクは切れたままになる。公開の時点で次の記事が予約されていなければ、そのリンクを外して frontmatter の `next` を null に戻す。

EmDash への投稿と git のコミットはしていない（執筆するエージェントの担当外）。

## 2026-11-10 の修正

レビューで指摘された4点を、一次情報とログで確かめてから直した。4点とも指摘どおりだった。

| # | 指摘 | 確かめたこと | 直したところ |
|---|---|---|---|
| 1 | 102行目「モデルが呼ぶかどうかに任せず、添えるものを人とアプリが選べるからです」と100行目が、出典12と出典2に反する | code.claude.com/docs/en/mcp.md（2026-11-10）の「Use MCP resources」の Tips に "Claude Code automatically provides tools to list and read MCP resources when servers support them"。仕様の Resources（2025-11-25）の22行目に "Implement automatic context inclusion, based on heuristics or the AI model's selection" | 100行目に「モデルの選択に合わせてアプリが自動で添える実装も、同じく例にあります（出典2）」を足し、「会話に添えるかどうか」を「会話への取り込み方」にした。102行目の理由を、ユーザーが `@` で添えられることと、モデルも Claude Code が用意するツールで同じ Resource を読めること（出典12）に書き換えた。`sources.md` の出典2と出典12の行に、確かめた原文を足した |
| 2 | SDK の版の説明に、v1.x がメンテナンスの系列で、2026-07-28 の仕様に対応しないことと、修正の提供期間が抜けている | `v1.x/README.md`（2026-11-10）の3行目と7行目。`npm view` で latest が 1.32.2 のまま（2026-11-10） | 123〜125行目を2段落にし、v1 系がメンテナンスの系列で仕様 2025-11-25 までを実装していること、2026-07-28 の仕様は v2 にあり v1 系では予定がないこと、v2 が別のパッケージで出ているので `@modelcontextprotocol/sdk` の latest が v1 系のままであること、v2 のリリース（2026-07-27）から少なくとも6か月は修正が出ること、2026-07-28 の機能を使うなら README から移行ガイドを読むことを書いた |
| 3 | 86行目「いちばん待つのは `npm install` で…2秒」が、ログ（Inspector の `npx` が約12秒）と食い違う | 2026-11-02 のログの開始時刻の差（`run/09.log` 15:24:37Z → `run/10.log` 15:24:49Z）。2026-11-10 に npm のキャッシュを空にしてやり直し、`run/09.log` が `elapsed=12s`、`run/03.log` が `in 3s` | 86行目を「いちばん待つのは、Inspector を初めて `npx` で動かすときです。2026-11-10 の実測では、パッケージのダウンロードを含めて12秒でした。`npm install` は3秒です。」にした。`npm install` の出力のブロック（170行目）も `run/03.log` から写し直した |
| 4 | G07 が「次の記事は原稿が無い」、G06 が「ほかの13本」としていて、リポジトリと合わない | `ls content/articles` で、この記事のほかに18本（指摘の時点の17本から、`claude-agent-sdk-first-agent.md` が増えていた）。`mcp-connection-closed-fix.md` は 9行目 `prev`、53行目 `status: draft`、70行目にこの記事へのリンク | G06 と G07 の根拠、`selection.md` の「外した候補と理由」と「既存記事との重なり」を、18本を読み直した結果に書き換えた。G06 は OK、G07 は NG のままで、結論は変わらない |

原稿を直したので、コード（`run/01`〜`11.log`）、2本の lint、補助の `prose-check.py` と `check-code-and-outputs.py` をすべて回し直し、全行を判定し直した。`verified_at`、`updated`、末尾の日付は 2026-11-10 にした。123行目の段落を2つに分けて2行増えたので、124行目より後の行番号は 2026-11-02 の版から2つずれている（この gate.md、`sources.md`、`lint/judgments.md` の行番号は直した）。
