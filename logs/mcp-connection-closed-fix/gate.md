# gate: mcp-connection-closed-fix

判定日: 2026-11-02。原稿: `content/articles/mcp-connection-closed-fix.md`（485行、frontmatter は1〜56行目。行番号はすべてこの版）。日時はログと同じ UTC。

## 判定の前に読んだもの

2026-11-02 に、次を全文読んでから全項目を判定した（Bash の cat と Read ツールで全文を表示して読んだ）。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）
- `guides/08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `guides/06-rewriting-prompts.md` は、スキルの表が指す「使い方の流れ」（181〜186行目）を読んだ
- `keywords/README.md`

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜56行目）の mention も0件。warn 0件（`judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `485行/202文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY の上限（B-1 2回、B-6 1回、B-9 2回など）は guides/08 の標準の列と一致し、B-9 つまり 1回のほかは0回。WATCH の節なし、INFO 0件。途中の版の B-2 三連反復1か所は直した（`judgments.md`） |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（ALL OK、exit=0）: json と ts のブロック6個が `code/` と一致（全文3個は完全一致、変更前・変更後・消す1行の3個はファイルの連続した行として含まれる。`after/check.ts` は `check.ts` に `env` の1行を足しただけ）。bash のブロック9個は、中身が `run/02.log`〜`11.log` の command と一致し（`code/extra/run-all.sh` が記事の順に `bash -c` で実行。initialize のブロックは直す前の 10 と直した後の 11 の2回）、直後の出力ブロック9個はログの出力と一致（`npm install` の先頭の空行1行だけ省いた。`judgments.md`）。終了コードは 04、06、09 が `check.ts` の失敗を表す1、ほかは0。実行は 2026-11-02、node v22.22.0 / npm 10.9.4 / Linux x86_64、Claude Code 2.1.316。型は `run/16.log`（TypeScript 7.0.2、`typecheck ok`）。API は呼ばない（`needs_api_key: false`、52行目） |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 466〜483行目に出典の表（12件、題名、URL、確認日 2026-11-02）。断定した文は（出典n）で表を引き、文ごとの対応と、実行ログを根拠にした文は `sources.md`。料金は 447〜451行目で、手順はどれも LLM の API を呼ばないので API の料金はかからない、`claude mcp` の add、list、remove はネットワークなしで動いた（`run/13.log`）、Claude にツールを呼ばせるには Claude Code の有料のプランか Console のアカウントが要る（出典8）。その操作は実行していないので金額は載せないと書いた。frontmatter 48〜50行目: `cost_estimate`（本文の料金の記述と同じ内容）、`run_environment: "Node.js 22.22.0、npm 10.9.4、SDK 1.32.2、Claude Code 2.1.316、Linux x86_64（型の確認は TypeScript 7.0.2）"`（`run/*.log` の見出し `node: v22.22.0 / npm: 10.9.4 / os: Linux x86_64`、`claude: 2.1.316 (Claude Code)`、`code/package.json` の固定した版、`run/16.log` の `Version 7.0.2` と一致）、`verified_at: "2026-11-02"`（最後の実行 `run/17.log` の日付 2026-11-02） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（この記事のほかに13本）。パイロット `mcp-server-typescript-stdio` はサーバーを作る記事で、stdout のログの節は繰り返さず1文とリンクにした（445行目）。`mcp-inspector-debug` は Inspector の使い方の記事で、`Connection closed` の1例からこの記事へリンクしている。この記事は原因の切り分けに答え、Inspector の読み方はリンクに任せた（445行目）。`mcp-server-streamable-http` は HTTP の記事で、この記事は stdio だけを扱う |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 70行目 `/posts/mcp-server-resources-prompts`（frontmatter 9行目 `prev`）。次: 464行目 `/posts/llm-eval-harness-fixtures`（10行目 `next`）。関連: 445行目 `/posts/mcp-server-typescript-stdio`、`/posts/mcp-inspector-debug`。前後は `content/plan.md` の並び（#24、#26）による計画上の slug で、パスは既存の原稿と同じ `/posts/<slug>`。前の記事と次の記事は原稿が無い（2026-11-02 に `ls content/articles/` で確認）。関連の2本は原稿があるが `status: draft`。4本とも公開も予約もされていないので、今公開するとリンク切れになる。この記事のほかの13本はどれも `status: draft` で、公開済みか予約済みの記事は0本。リンク先の slug: `mcp-server-resources-prompts`、`llm-eval-harness-fixtures`、`mcp-server-typescript-stdio`、`mcp-inspector-debug` |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 485行目「AI 支援で執筆しました。コードは 2026-11-02 に実際に実行して確認しています。」。日付は最後の実行（`run/17.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/mcp-connection-closed-fix/` 全体に、32桁以上の16進、`sk-ant`、`ANTHROPIC`、`password`、`secret`、`token`、`api_key`、`/root`、`/home/user`、`tmp/claude`、`scratchpad` を `grep -rniIE` でかけた。原稿とログ（`run/`、`code/`、`lint/` の出力）での該当は frontmatter の `needs_api_key` だけ。`sources.md` 13行目には、出典7の例のプレースホルダー `AIRTABLE_API_KEY=YOUR_KEY`（公式ページの文面で、値ではない）が出る。このファイルと `selection.md` には、確かめた語と環境変数の名前、`unset` の記録が出る。値としての API キーやトークンは0件。Claude Code の設定は使い捨てのホームフォルダに書き、その中身（`.claude.json`）はログに写していない（ログに出るのは `File modified: ~/.claude.json` の行だけ）。作業場所と使い捨てのホームのパスは `run-all.sh` が `/path/to` と `~` に置き換えた。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分。名前、姓と名の分割、メールのローカル部、数字の ID）、ユーザーのメールアドレスのローカル部、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）を1語ずつ `grep -rniI -F` で原稿と `logs/mcp-connection-closed-fix/` にかけ、0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | NG | `keywords/` に CSV が無い（README.md だけ）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める（CSV 待ち） |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（stdio の MCP サーバーを作った人が `MCP error -32000: Connection closed` の原因を調べたときに、エラーの意味と stderr から原因を3つに見分けて直す手順に答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」、guides/02 タイプ3「エラーメッセージをそのままタイトル・見出しに入れる」。2行目「MCP サーバーにつながらない（Connection closed）原因と直し方」。「MCP サーバー」を左寄せし、エラーの文面 `Connection closed` を入れた。見出しにも 72、432行目で `Connection closed`、303行目で `Cannot find module` を入れた。講座のキーワード「MCPサーバー」は tags と main_keyword（5〜6行目）にも入れた。タイトルはワークフローの指示で与えられたもの。「徹底解説」「完全ガイド」は0件（`prose-check.txt` の PAT） |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」、guides/02 タイプ3 のリード。58行目の3文で、エラーの意味（プロセスが終了している）、SDK が出すこと、手がかりは stderr であることを示し、60〜66行目で原因3つと直し方を表にした |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でエラーに合うのはトラブル解決。guides/02 タイプ3 の骨格に照らした（`brief.md`）。リード（58〜70行目、結論の表で解決策を先に）→ 原因の説明（72行目）→ 道具と最初の再現（84行目）→ 原因別の解決策（250、303、383行目。変更前 → 変更後は 262〜281行目、相対パス → 絶対パスは 342〜379行目）→ それでもダメなとき（432行目、別の文面、stdout、Inspector）→ チェックリスト形式のまとめ（453行目） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1、タイプ3「解決策を先、原因の説明は後」。リードの表（62〜66行目）が答え。各 H2 は見出しが結論（例 250行目「サーバー自身のエラーで終わるなら起動時の環境変数を疑う」、303行目「Cannot find module は起動するファイルのパスの誤り」）で、本文は理由、再現、直し方の順 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 72（エラーの意味）、84（stderr を読む道具）、250（原因1）、303（原因2）、383（原因3）、432（ほかの文面）、447（料金）、453（確かめる順番）、466（出典）。H3 は 88、100、137、172（環境と3ファイル）、258、297（原因1の直し方を SDK と Claude Code で）、336（相対パス）、409（initialize を手で送る） |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「Connection closed はサーバーのプロセスが終わったという知らせ」「相対パスの登録はフォルダによって結果が変わる」「エラーの行が無ければサーバーが接続を始めていない」。「まず〜する」型は0件。100行目「作業フォルダとメモのファイル」、447行目「料金がかからない範囲」は中身を名詞で示す見出し |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ3、guides/01 §4。3ファイルを import から全文掲載し、ファイル名と作業フォルダ（102〜120行目）、前提（90〜98行目 Node.js 22.18.0 以上）を示した。変更前 → 変更後は差分の範囲を両方載せ、何を足したかを書いた（272行目）。消す1行もそのまま載せた（389〜391行目）。各コマンドの出力は `run/03`〜`11.log` から写した（G04 の `check-code-and-outputs.txt`）。パスを置き換えたことは 246、381行目に書いた |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。74行目「サーバーから届いた言葉は、ひとつも入っていません」で、文面を読んでも無駄だという立場を最初に示し、道具（check.ts）に力を入れた。手元で驚いた環境変数の件を原因1に置き、Claude Code の `export` の挙動まで比べて `-e` を勧めた（301行目）。405行目「このログだけを見て、接続できたと判断するのは早すぎます」。料金と環境の節は短くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。リード: 58行目「サーバーのプロセスはもう終了しています」。72: 80行目「わかるのはプロセスが終わったことだけです」。84: 205行目「要になるのは `stderr: "pipe"` の1行です」。250: 256行目「サーバーには届きません」、301行目「同じ値が渡ります」。303: 334行目「書き間違いだとわかります」、359行目「起点は、claude を実行したフォルダでした」。383: 385行目「疑う先はサーバーのコードです」、405行目「早すぎます」。409: 430行目「調べる先はクライアントの設定です」。432: 434行目「文面が違えば原因も違います」。447: 449行目「料金はかかりません」。453: 462行目「確かめる道具は同じ `check.ts` でした」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」は0件（`prose-check.txt` の PAT）。条件の文（「それでもつながらないなら」430行目）は条件を切って言い切っている |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件、writing-lint の B-6 0回。「解説します」「見ていき」「紹介します」は0件（PAT） |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「まとめ」「整理」は0件（PAT）。「次の形」（110行目）「次の1行」（387行目）「次の順に」（455行目）は直後の内容を指す語。464行目「講座の次の記事」はスキルが求める講座の前後リンク |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件、PAT の「地図」「仕様書」0件。比喩に近い語は「知らせ」の1系統だけ（72、252行目の2回、`judgments.md`） |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではなく」「ではありません」「じゃない」0件。74行目は「組み立てているのは SDK です」「届いた言葉は入っていません」を独立した2文に分けた |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。`prose-check.txt` で地の文の文長が6〜60字、20字以下12文、41〜60字77文。例 262行目「変更前です。」、272行目「変更後です。」の短文の後にコードと長い説明が続く |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と語尾の反復チェック。`prose-check.txt` の SAME3（末尾3字）0、末尾2字（「ます」「です」など）の3連続も0。途中の版の21か所を直した（`judgments.md`） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「Linux と macOS で渡るのは、6つの変数です（出典3）。名前は `HOME`、…です。」（256行目）のように、2文目の主語を書いている |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文、番号付きの手順（457〜460行目）、description の文末を `prose-check.py` で調べ、ですます以外は0件（`prose-check.txt` の C19）。途中の版の番号付き手順の常体を直した。表のセルは guides/05 §7 の例外 |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」「効果」は0件。「エラー」は「エラーを投げて」（139行目）、「エラーで打ち切ります」（58行目）、「エラーを報告し」（445行目）、「エラーが出ました」（246行目）で、表の誤用に当たらない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「起動します」「表示します」「再現しました」「展開します」「登録し直します」など、どれも他動詞として「を」を取る。「プロセスが終了しています」（58行目）は自動詞の「が」。取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「正しい結果」（295行目）、「小さな確認用のプログラム」（86行目）、「気づきにくい」（338行目）程度で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」「約〜程度」「各〜ごとに」なし。「エラーを投げる」は英単語の throw と和訳を重ねていない（コードの `throw` はコードブロックの中）（目視） |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし。「作業フォルダ…を作ります」（102行目）、「確認用のクライアントを…作ります」（60行目）は実体を作る記述（目視） |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」。`prose-check.txt` で60字超 0（最長60字）。途中の版の16文を分けた（`judgments.md`）。インラインコード、リンク（URL を含む）、（出典n）も書かれたとおりに数え、見出し、表のセル、番号付きの手順、frontmatter の title と description も数えた。除外はコードブロックと URL だけのセル12個 |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。「stderr」（58行目で初出、以後この表記）、「stdout」、「作業フォルダ」、「ホームフォルダ」、「起動のログ」、「SDK のクライアント」、「確認用のクライアント」（`check.ts`）、「文面」（エラーの文字列）で通した。製品名は Node.js、TypeScript、npm、Claude Code、MCP Inspector の公式表記。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。-32000、-32001、6つ、12個、60秒、22.18.0、1.32.2、2.1.316、3ファイルで63行、2件、終了コード 0 など。「数個」「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（PAT。途中の版の2か所を直した）。AND は「Node.js 22.22.0 と npm 10.9.4」（90行目）、「原因1の環境変数と、原因2のパス」（430行目）、「`PATH` と `HOME` だけ」（449行目）、OR は「Claude Code か、公式 SDK のクライアント」（68行目）、「`env` か `-e`」（458行目）、「有料のプランか Console のアカウント」（451行目） |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。地の文の `—`、`─`、`―` は0件（PAT）、writing-lint B-5 0回。356行目のコードブロックにある `—` は Claude Code の出力をそのまま写したもので、guides/03 の「コードブロックの中は対象外」に当たる |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`：`、`／` は0件（PAT）。出力の `メモ: 2 件` と `MCP error -32000: Connection closed` はインラインコードとコードブロックの中で、対象外 |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/mcp-connection-closed-fix.md > logs/mcp-connection-closed-fix/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、485行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。warn 0件で判断の対象なし（`lint/judgments.md`）。writing-lint の SHOULD、WATCH、INFO も0件。lint が拾わない語（「知らせ」「作り」「切れる」「疑う」「早すぎます」）は guides/04「技術ブログでの線引き」と guides/08 A-1〜A-3 に照らして判断した（`judgments.md`） |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。FATAL、warn、mention がすべて0件で、区別が要る検出なし |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。失敗するコード（変更前の `check.ts`、`servr.ts`、相対パスの登録、`connect` を消した `server.ts`）は、失敗する例だと前の文で示し（224、305、340、387行目）、直後に実行結果と直し方を置いた（262〜295、334、363〜381、423〜430行目） |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/04.log`（シェルで設定した `NOTES_DIR` がサーバーに届かない）から原因1を最初に置いた。`run/12.log`（Claude Code は `export` した変数を渡した）を見たうえで、シェルに左右されない `-e` を勧めた（301行目）。`run/07.log` と `08.log`（相対パスはフォルダで結果が変わり、絶対パスで直る）から、Claude Code の表示に `Cannot find module` が出ないので `check.ts` で同じコマンドを起動する手順をチェックリストの1番に置いた（361、457行目）。`run/09.log`（起動のログが出ても接続していない）から「早すぎます」と判断した（405行目）。`run/10`、`11.log` から initialize を手で送る確かめ方を選んだ。`run/14`、`15.log` で別の文面の表を作った。`run/13.log` で料金の節の「ネットワークなしで動く」を確かめた |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（`run/02.log`〜`11.log`、G04）。補足の確認は `run/12`〜`15.log`、型は `run/16.log`、package.json が書き換わっていないことは `run/17.log`。API は呼んでいない（キーが無く、記事も API を使わない） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 462行目「あなたのサーバーは、起動に必要な環境変数をいくつ読んでいますか。」の1か所 |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）

## 結論

G07 と G10 が NG なので、`status: draft` のまま止める。

- G10: `keywords/` に CSV が届いていない（CSV 待ち）。`target_query` は null で、値は作っていない。
- G07: 前後と関連のリンク先（`mcp-server-resources-prompts`、`llm-eval-harness-fixtures`、`mcp-server-typescript-stdio`、`mcp-inspector-debug`）が、どれも公開も予約もされていない。前後の2本は原稿も無い。リンク先が先に予約されるまで、この記事は公開できない。公開の時点で無い記事があれば、そのリンクを外して frontmatter を null に戻す。

EmDash への投稿と git のコミットはしていない（執筆するエージェントの担当外）。
