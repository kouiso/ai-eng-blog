# gate: mcp-server-resources-prompts

判定日: 2026-11-02。原稿: `content/articles/mcp-server-resources-prompts.md`（452行、frontmatter は1〜74行目。行番号はすべてこの版）。

## 判定の前に読んだもの

2026-11-02 に、次を Read ツールで全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）
- `guides/06-rewriting-prompts.md`（186行。スキルの表が指す「使い方の流れ」は181〜186行目）
- `guides/08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `keywords/README.md`

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜74行目）の mention も0件。warn 0件（`judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `452行/197文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY の上限（B-1 2回、B-5 2回、B-6 1回など）は guides/08 の標準の列と一致し、全カウンタ 0回。WATCH の節なし、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（ALL OK）: 記事のコード3つ（`package.json`、`server.ts`、`check.ts`）が `code/` と1文字も違わない。記事の bash のコードブロック5個は、中身がそのまま `run/01.log`〜`04.log` と `run/09.log` の command と一致し（`code/extra/run-all.sh` が記事の順に `bash -c` で実行）、直後の実行結果4個はログの出力と1文字も違わない（`mkdir` のブロックは出力なし）。リードの1行（81行目）は `run/04.log` の出力の行をそのまま抜き出したもの。終了コードはすべて 0。実行は 2026-11-02、node v22.22.0 / npm 10.9.4 / x86_64。本文の根拠にした確認は `run/05.log`〜`08.log`、`10.log`、型は `run/11.log`（TypeScript 7.0.2、exit=0）。API は呼ばない（`needs_api_key: false`、70行目） |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 427〜450行目に出典の表（18件、題名、URL、確認日 2026-11-02）。断定した文は（出典n）で表を引き、文ごとの対応と、実行ログを根拠にした文は `sources.md`。料金は 415〜419行目で、手順はどれも LLM の API を呼ばないので API の料金はかからない、Claude Code の会話で使うには有料のプランか Console のアカウントが要る（出典13）。その操作は実行していないので「無料」とは書かず、していないと書いた。frontmatter 9〜11行目: `cost_estimate`（本文の料金の記述と同じ内容）、`run_environment: "Node.js 22.22.0、npm 10.9.4、SDK 1.32.2、zod 4.6.7、Linux x86_64（Inspector の確認は 2.13.0、型の確認は TypeScript 7.0.2）"`（`run/*.log` の見出し `node: v22.22.0 / npm: 10.9.4 / arch: x86_64`、`code/package.json` の固定した版、`run/09.log` の `inspector@2.13.0`、`run/11.log` の `Version 7.0.2` と一致）、`verified_at: "2026-11-02"`（最後の実行 `run/11.log` の日付 2026-11-02） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の、この記事のほかの13本の frontmatter を全件読んだ。MCP の3本（パイロット、Streamable HTTP、Inspector）はどれもツールだけを扱い、Resources と Prompts の登録は書いていない（本文を `registerResource`、`registerPrompt`、`resources/list`、`prompts/list` で `grep` し、該当は `mcp-inspector-debug` の末尾の次の記事への案内1か所だけ）。ツールの作り方と `claude mcp add` は繰り返さずリンクに任せた |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 88行目 `/posts/mcp-inspector-debug`（frontmatter 12行目 `prev`）。次: 425行目 `/posts/mcp-connection-closed-fix`（13行目 `next`）。関連: 88行目と407行目 `/posts/mcp-server-typescript-stdio`。前後は `content/plan.md` の course_step 5 の並び（#23、#25）による slug で、パスは既存の原稿と同じ `/posts/<slug>`。前の記事 `mcp-inspector-debug` は原稿があり（`status: draft`、`next: "mcp-server-resources-prompts"` でこの記事を指す）、パイロットも原稿があるが `status: draft`。次の記事 `mcp-connection-closed-fix` は原稿が無い。3本とも公開も予約もされていないので、今公開するとリンク切れになる。この記事のほかの13本はどれも `status: draft` で、公開済みか予約済みの記事は0本。リンク先の slug: `mcp-inspector-debug`、`mcp-connection-closed-fix`、`mcp-server-typescript-stdio` |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 452行目「AI 支援で執筆しました。コードは 2026-11-02 に実際に実行して確認しています。」。日付は最後の実行（`run/11.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/mcp-server-resources-prompts/` 全体に、32桁以上の16進、`sk-ant`、`ANTHROPIC`、`password`、`secret`、`token`、`api_key`、`/root`、`/home/user`、`tmp/claude`、`scratchpad` を `grep -rniIE` でかけた。該当は、frontmatter の `needs_api_key`、`selection.md` の環境変数の名前と `unset` の記録、この gate.md の検索語の列挙だけ。値としての API キーやトークンは0件。ログのパスは `/path/to` と `~` に置き換えた。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分。名前、姓と名を分けたもの、メールのローカル部、数字の ID）、ユーザーのメールアドレスのローカル部、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）を1語ずつ `grep -rniI -F` で原稿と `logs/mcp-server-resources-prompts/` にかけ、0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | NG | `keywords/` に CSV が無い（README.md だけ）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める（CSV 待ち） |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（MCP サーバーにツールを1つ作ったことがある TypeScript の開発者が、Resources と Prompts の公開方法を調べたときに、SDK v1.32.2 での登録の書き方、SDK のクライアントでの確かめ方、ツールとの使い分けに答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」。2行目「MCP サーバーで Resources と Prompts を公開する【ツール以外の2つの機能】」。「MCP サーバー」を左寄せで入れ、扱う機能の名前（Resources と Prompts）と位置づけ（ツール以外の2つ）を書いた。講座のキーワード「MCPサーバー」は tags と main_keyword（5〜6行目）にも入れた。タイトルはワークフローの指示で与えられたもの。「徹底解説」「完全ガイド」は0件（`prose-check.txt` の PAT） |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」、guides/02 タイプ1 のリード。76行目で、ツールのほかに Resources と Prompts があること、それぞれの定義、この記事で作るもの（ルールを返す Resource と見直しを頼む Prompt）を示し、78〜81行目で完成形の出力を見せた |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアル。guides/02 タイプ1 の骨格に照らした（`brief.md`）。リード（76〜88行目、完成形の出力、確かめた範囲、対象読者、所要時間の2秒）→ 3つの機能の違い（90行目）→ 前提・環境（104行目、Node.js の版、パッケージの版、ファイル構成）→ 番号付きの手順 1〜4（134、176、270、282行目、コードとその時点の実行結果）→ 動作確認（`node check.ts` の出力、330〜363行目）→ まとめに当たる節（421行目、次の記事へのリンク） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード（76行目）の1文目が「ツールのほかに2つある」の答え。各 H2 と H3 は見出しが結論（例 90行目「Resources と Prompts は使う人がツールと違う」、270行目「Prompt の引数は文字列で受け取る」、370行目「失敗はツールと違って例外で届く」）で、本文はコードと結果、理由、詳細の順 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 90（3つの違い）、104（環境）、134（準備）、176（Resource）、270（Prompt）、282（クライアントで確かめる）、405（Claude Code での使い方）、415（料金）、421（使う人で決める）、427（出典）。H3 は 260（ResourceTemplate）、370（失敗の返り方）、382（Inspector の CLI） |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「Resource は URI を決めて registerResource で登録する」「URI に変数がある Resource は ResourceTemplate で書く」「Inspector の CLI でも同じ要求を送れる」。「まず〜する」型は0件。104行目「前提となる環境」、415行目「料金がかからない範囲」は中身を名詞で示す見出し |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1、guides/01 §4。3ファイルを import から全文掲載し、ファイル名（143、178、284行目）、作業フォルダ（136行目）、前提（106行目 Node.js 22.18.0 以上、158行目 `"type": "module"`）を示した。各コマンドの出力は `run/01`、`03`、`04`、`09.log` から写した（G04 の `check-code-and-outputs.txt`） |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。102行目「手元の資料を会話に添えたいだけなら、ツールより Resource が向いています」とその理由。読者が引っかかる2点（SDK の not found のコードが仕様と食い違う 376行目、Claude Code が引数を空白で分ける 413行目）に節を割き、413行目では自分の `review-text` がその形になっていないことも書いた。料金と環境の節は短くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。90: 102行目「Resource が向いています」、104: 123行目「版をそろえるためです」、134: 158行目「指定が必要です」、176: 258行目「別のスキームにしてください」、260: 266行目「表の外を引かないためです」、270: 272行目「数に変換してください」と280行目「モデルを呼びません」、282: 366行目「`tools` は出ていません」、370: 376行目「`message` も合わせて読んでください」、382: 384行目「`resources/read` を送れます」、405: 413行目「1つの引数に空白は入れられません」、415: 417行目「料金はかかりません」、421: 423行目「最初に使う人を決めてください」、427: 429行目「どれも 2026-11-02 です」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」は0件（`prose-check.txt` の PAT。途中の版の「どれでしょうか」を直した）。413行目「のが安全です」は条件（Claude Code から使う Prompt）を切って言い切っている |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件、writing-lint の B-6 0回。「解説します」「見ていき」「紹介します」は0件（PAT） |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「まとめ」「整理」は0件（PAT）。「次の形」「次のとおり」「次の1行」は直後の内容を指す語。425行目「[次の記事]」はスキルが求める講座の前後リンク |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件、PAT の「地図」「仕様書」0件。比喩は使っていない（`judgments.md`） |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではなく」「ではありません」「じゃない」0件。102行目の「任せず、…選べるからです」を数えても1回（`judgments.md`） |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。`prose-check.txt` 3行目で地の文の文長が10〜60字、20字以下7文、41〜60字79文。例 178行目「ツールはありません。」、280行目「このサーバーはモデルを呼びません。」の短文の前後に長い説明がある |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と語尾の反復チェック。`prose-check.txt` 4行目 SAME3（末尾3字）0、5行目の2字の語尾（「ます」「です」など）の3連続も0。途中の版の19か所を直した（`judgments.md`） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「埋め込む Resource には、URI と MIME タイプが要ります（出典3）。本文は `text` か `blob` のどちらかで入れます（出典3）。」（276行目）のように、2文目の主題は1文目から読み取れる |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文と description の文末を `prose-check.py` で調べ、ですます以外は0件（`prose-check.txt` 6行目）。表のセルは guides/05 §7 の例外。コードの中の文字列（`styleGuide` の箇条書きや用語の説明）は記事の地の文ではない |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」「効果」は0件。「エラー」は「エラーで返ります」（372行目）、「エラーになりました」（266行目）、「SDK が自分で返したエラー」（374行目）で、表の誤用に当たらない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「公開します」「登録します」「宣言した」「検査しません」「判定する」「実行していません」など、どれも他動詞として「を」を取るか目的語を伴う。取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「必須の引数」「普通の `Error`」「安全です」程度で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」「約〜程度」「各〜ごとに」なし。「例外を投げました」（372行目）は throw を和語で1回だけ書いた形（目視） |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし。「作業フォルダを作り」（136行目）、「引数の一覧は、SDK が…作る仕組みです」（274行目）は実体を作る記述。「`role` と `content` を持つメッセージ」（276行目）はデータの持つフィールドで、「質問を持っている」型ではない（目視） |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」。`prose-check.txt` 2行目で60字超 0（最長60字）。途中の版の17文を分けた（`judgments.md`）。インラインコード、リンク（URL を含む）、（出典n）も書かれたとおりに数え、見出し、表のセル、frontmatter の title と description も数えた。除外はコードブロックと URL だけのセル18個 |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。機能の名前は仕様の表記どおり Resources、Prompts（総称）、Resource、Prompt（1つ）、ツール（Tools は仕様の表の中だけ）で通した。「読み取りの関数」「URI テンプレート」「作業フォルダ」「起動のログ」「前置き」で通した。製品名は Node.js、TypeScript、npm、Claude Code、MCP Inspector の公式表記。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。1.32.2、22.18.0、2秒、117行、ファイル3つ、Resource 2つと Prompt 1つ、-32002、-32602、-32603、URI が3つ、プランが5つなど。「数個」「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（PAT）。AND は「Node.js 22.18.0 以上と npm」（106行目）、「URI と MIME タイプ」（276行目）、OR は「`text` か `blob` のどちらか」（276行目）、「有料のプランか Console のアカウント」（419行目） |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。地の文の `—`、`─`、`―` は0件（PAT）、writing-lint B-5 0回 |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`：`、`／` は0件（PAT） |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/mcp-server-resources-prompts.md > logs/mcp-server-resources-prompts/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、452行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。warn 0件で判断の対象なし（`lint/judgments.md`）。writing-lint の SHOULD、WATCH、INFO も0件。lint が拾わない語（「食い違っています」「取りこぼします」「安全です」など）は guides/04「技術ブログでの線引き」に照らして判断した（`judgments.md`） |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。FATAL、warn、mention がすべて0件で、区別が要る検出なし |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。失敗する要求（表に無い用語、テンプレートに合わない URI、必須の引数なし）は、失敗する要求だと前の文で明示し（372行目）、直後に結果の読み方と見分け方を置いた（374〜378行目）。普通のオブジェクトと普通の `Error` の版（266、268行目）も、失敗する形だと書いてから記事のコードでの書き方を示した |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/06.log`（オブジェクトの表で `constructor` を読むとクライアントの検証エラー）と `run/07.log`（Map の版は `-32002`）から、用語の表を `Map` にした（266行目）。`run/05.log`（普通の `Error` は `-32603`）から、`McpError` を `-32002` で投げる形にした（268行目）。`run/04.log` の2つ目の失敗（SDK が `-32602` を返す）と仕様の推奨（`-32002`）の食い違いから、コードだけで判定せず `message` も読むと書いた（376行目）。`run/08.log`（`list` なしだと一覧に用語が出ない）から、`list` で一覧に入れた理由を書いた（264行目）。`run/04.log` の前置きが2回付く出力を SDK のソースで読み解いた（380行目）。`run/09.log`、`10.log` で前の記事の Inspector の CLI からも同じ要求が送れることを確かめた（384〜403行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（`run/01.log`〜`04.log`、`09.log`、G04）。本文の根拠にした確認は `run/05.log`〜`08.log`、`10.log`、型は `run/11.log`。API は呼んでいない（キーが無く、記事も API を使わない）。Claude Code の会話での操作（405〜413行目）は実行しておらず、本文にもそう書いた（407行目） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 423行目「あなたのサーバーのツールの中に、本当はユーザーが選ぶべきものはありますか。」の1か所 |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）

## 結論

G07 と G10 が NG なので、`status: draft` のまま止める。

- G10: `keywords/` に CSV が届いていない（CSV 待ち）。`target_query` は null で、値は作っていない。
- G07: 前後と関連のリンク先（`mcp-inspector-debug`、`mcp-connection-closed-fix`、`mcp-server-typescript-stdio`）が、どれも公開も予約もされていない。前の記事と関連のパイロットが先に予約され、次の記事 `mcp-connection-closed-fix` の原稿ができて予約されるまで、この記事は公開できない。公開の時点で次の記事が無ければ、そのリンクを外して frontmatter の `next` を null に戻す。

EmDash への投稿と git のコミットはしていない（執筆するエージェントの担当外）。
