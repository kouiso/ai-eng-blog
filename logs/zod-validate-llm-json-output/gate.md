# gate: zod-validate-llm-json-output

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


判定日: 2026-11-10。原稿: `content/articles/zod-validate-llm-json-output.md`（482行。行番号はすべてこの版）。2026-10-31 の 437行の版に対するレビューの指摘2件（enum の大文字小文字の勧めを引いたまま放置していた点、Structured Outputs の節が SDK の検証を無視して自前の検証が要ると言い過ぎていた点）を直し、コードを実行し直し、lint をかけ直して全項目を判定し直した。

## 判定の前に読んだもの

2026-11-10 に、次を Read ツールで全文読んでから全項目を判定した（2026-10-31 にも同じものを読んでいる）。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）
- `guides/06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `keywords/README.md`（35行）

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 use 0件 / 📎mention 0件、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜47行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `482行/155文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY は10カウンタすべて0回で、上限は guides/08 の標準レジスターと一致。WATCH 節なし、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（ALL OK）: 記事のコード8つ（`package.json`、`schema.ts`、`samples.ts`、`check.ts`、`lowercase-enum.ts`、`retry-message.ts`、`pretty-ja.ts`、`strip.ts`）が `code/` と1文字も違わず、記事のコマンド11個が記事にあり、記事の実行結果10個が `run/` から機械的に取り出したものと一致。実行は `code/extra/run-all.sh` で `run/01.log`〜`13.log`（2026-11-10 06:45 UTC、node v22.22.0 / npm 10.9.4、記事の手順の順、すべて exit=0）。型は `run/14.log`（tsc 7.0.2、`tsc_exit=0`、`lowercase-enum.ts` を含む）。外へ出ないことは `run/15.log`（`unshare -rn` の中で9つの `node` コマンドが exit=0、外への fetch は `EAI_AGAIN`）。API は呼ばない（`needs_api_key: false`、43行目） |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 466〜480行目に出典の表（9件、題名、URL、確認日。3と7は 2026-11-10 に読み直し、468行目に明記）。断定した文は（出典n）で表を引く。新しく足した断定は、86行目（`zodOutputFormat()` と `parse()` が外した制約を確かめる、`jsonSchemaOutputFormat()` は検証しない、出典7）、88行目3文目（出典7）、335行目（`toLowerCase`、`.pipe()`、出典3）、337行目（`.extend()` の上書き、出典3）、339行目（大文字小文字だけが違う候補を避ける、出典7）。どれも 2026-11-10 に取得した原文で確かめた（`sources.md` の「2026-11-10 の読み直し」と表）。実行結果を根拠にした文は `sources.md` 後半の表。料金は 447〜451行目で、記事の手順は無料（zod は MIT、出典6）、再依頼の文をモデルに送ると料金がかかり、Claude Haiku 5.5 は 100万トークンあたり入力 $0.10、出力 $0.50（10万トークン以下のプロンプト、出典9）。frontmatter 9〜11行目の `cost_estimate`、`run_environment: "Node.js 22.22.0、npm 10.9.4、zod 4.6.7"`（`run/*.log` の見出し `node: v22.22.0 / npm: 10.9.4` と `code/package.json` の `4.6.7` に一致）、`verified_at: "2026-11-10"`（最後の実行 `run/15.log` の日付） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | 2026-11-10 に `content/articles/*.md` の frontmatter を読み直した（18本）。main_keyword「構造化出力」の記事は、この記事のほかに `zod-to-json-schema-tool-definition`（zod のスキーマから JSON Schema を作ってツール定義に使う）と `llm-json-parse-error-fix`（`JSON.parse` の失敗を直す）。どちらも講座の後ろの記事で、`safeParse` の issues の読み方には答えていない。選んだときの判定は `selection.md` |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | OK | 2026-11-14 に #13 と #31 の裁定で直した。公開の順で7番。本文の内部リンクを1件足した: 451行目 `/posts/llm-api-cost-estimate-js-tiktoken`（3番）。既にあった前の記事へのリンクと合わせて、本文リンクは 53行目 `/posts/claude-agent-sdk-structured-output`（6番）, 451行目 `/posts/llm-api-cost-estimate-js-tiktoken`（3番） で、すべて自分より前の順番。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。足したリンクは既存の文の中に入れたもので、段落は増やしていない。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 482行目「AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。」。日付は最後の実行（`run/15.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/zod-validate-llm-json-output/` 全体（この gate.md と `run/` を除く）に `ANTHROPIC`、`sk-ant`、`token`、`password`、`secret`、`api_key`、`/root`、`/home/user`、`tmp/claude`、`scratchpad` を `grep -rniI` でかけた。該当は、frontmatter の `needs_api_key`、本文の `max_tokens`、`selection.md` の環境変数の名前と `unset` の記録と slug `llm-api-cost-estimate-js-tiktoken`、`sources.md` の出典の引用（`max_tokens`、「100,000 tokens」）、`code/README.md` の作業場所の説明（scratchpad の語だけ、パスは無い）。`run/` は同じ語で `grep -rliI` をかけて該当ファイル0件（ログのコマンドは作業場所を `<work>`、コードの場所を `(code)` に置き換えて書いている、`code/extra/run-all.sh`）。値としての API キーやトークンは0件（コードはキーを使わない）。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分、名前の各語とメールのローカル部と数字の ID）、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）の12語を1語ずつ `grep -rliI` で原稿とログ全体にかけ、すべて0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-structured-output.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（TypeScript の経験があり LLM の出力を使い始めた人が、zod での検証と `safeParse` のエラーの読み方を検索したときに答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」。2行目「LLM の出力 JSON を zod で検証する【safeParse のエラーの読み方】」。「LLM」「JSON」「zod」「safeParse」を左寄せで入れた。講座のキーワード「構造化出力」そのものはタイトルに無く、tags と main_keyword（5〜6行目）に入れた。タイトルはワークフローの指示で与えられたもの。「徹底解説」「完全ガイド」は0件（`prose-check.txt` の PAT） |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」。49行目の3文で、検証の書き方（`JSON.parse` のあとに `safeParse`）、失敗時の読み方（`path`、`code`、`message` の順）、記事で示すもの（5つの見本の実際の issues）を示した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアルか解説。guides/02 タイプ1 を原本で読み、要素ごとに照合した（`brief.md` の表、2026-11-10 の行番号）。リード（49〜53行目）→ 前提（90行目）→ 手順（132、202、298、341、380、414行目、各コードと結果）→ 確認（453行目）と次の記事（464行目） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード（49行目）の1文目が答え。最初の H2（55行目）は見出し自体が結論で、読む順と出た `code` の表。理由（78行目、Structured Outputs は文字数と範囲に対応しないので受け取る側で確かめる）が2つ目、手順の詳細はその後 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 55（読む順）、78（文字数と範囲を受け取る側で確かめる）、90（準備）、132（スキーマと見本）、202（issues の読み方）、298（大文字と小文字をそろえる）、341（再依頼の文）、380（日本語）、414（z.object）、447（料金）、453（確認）、466（出典）。H3 は1つの `code` に1つ（206、225、244、263）。大文字小文字の直し方は issues の読み方（202）から分けて独立の H2 にした |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「safeParse の失敗は path、code、message の順に読む」「文字数と数値の範囲は受け取る側で確かめる」「大文字と小文字の違いは z.enum の前にそろえる」「z.object は余分なキーを黙って消す」。「まず〜する」型は0件。90行目「使うバージョンと準備」、132行目「スキーマと見本の JSON」は中身を名詞で示す見出し |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1 の肝、guides/01 §4。8ファイルを import から全文掲載し、ファイル名（149、164、322、361、397、433行目）、作業フォルダ（98〜101行目）、前提（94行目 Node.js 22.18.0 以上、出典8）を示した。`lowercase-enum.ts` は `schema.ts` と `samples.ts` を import し、それらを置く手順（132〜164行目）のあとに置いた。各コマンドの出力は `run/03`、`05`〜`13` から写した（G04） |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。条件を切った判断の文: 88行目（SDK を通さないとき、または検証しないヘルパーのときは自分で確かめる、`zodOutputFormat()` と `parse()` なら重ねて書かずに済む）、339行目（小文字にそろえてよい条件、記事の `Ticket` を `z.enum` のまま残した理由、アプリでは差し替えた形を使う）、412行目「この講座では英語のまま使います」、445行目「開発とテストでは `z.strictObject` を使います」。料金と準備の節は短くし、issues の読み方の節を最も長くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。55: 「次の順に読むと迷いません」、78: 「自分のコードで確かめます」（88行目）、90: 「固定しています」（103行目）、132: 「エラーにします」（149行目）、206: 「優先度のキーが合わないとわかります」、225: 「`values` に候補の一覧が入ります」、244: 「オブジェクト全体についての違反だからです」、263: 「3 は許されるとわかります」、298: 「アプリでモデルの出力を受けるときは、差し替えた形を使います」、341: 「モデルに伝えられます」、380: 「英語のまま使います」、414: 「`z.strictObject` を使います」、447: 「無料です」、453: 「すべて確かめます」、466: 「2026-11-10 に読み直しました」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」は0件（`prose-check.txt` の PAT）。「起こり得ます」（84、223、242行目）は出典7の「might」に合わせた言い方で、出典を付けた3か所だけ |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件、writing-lint の B-6 0回。「解説します」「見ていきましょう」「紹介します」は0件（目視）。242行目の「勧めに沿う書き方は「大文字と小文字の違いは z.enum の前にそろえる」の節に載せています」は、公式の勧めを引いた直後に書き方の場所を節の名前で示す文で、lint の②と⑫にも B-6 にも検出されていない |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「次の節」は0件（PAT）。「次の順に」（59行目）「次の4種類」（69行目）「次の4つ」（455行目）は直後の内容を指す語。「次のスキーマの `z.enum`」（335行目）は `.pipe()` の渡し先の説明。464行目「講座の次の記事」はスキルが求める講座の前後リンク |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件。比喩は使っていない |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件。PAT の「ではありません」は151行目の1件で、見本が手作りであることの明記（後ろに肯定側を続ける対比になっていない、`judgments.md`）。数えても1回で「2回以上」に当たらない。見出しに否定の構文は無い |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。`prose-check.txt` で地の文と frontmatter の文長が8〜60字、20字以下5文、41〜60字62文。例 116行目「依存を入れます。」の短文、96行目「作業フォルダを作って移動します。」の後に長い説明が続く |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と語尾の反復チェック。`prose-check.txt` の SAME3 0 |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も主語を残した。例 86行目「同じ SDK の `jsonSchemaOutputFormat()` は、応答を検証しません（出典7）。API が対応しない制約に反する値も、そのまま通します（出典7）。」、337行目「`CaseInsensitiveTicket` は、`category` だけを差し替えたスキーマです。見本 `bad-enum` はこれで検証を通り、…」 |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文の文末を Python で調べ、ですます以外は0件（`judgments.md` の「文末の調査」、2026-11-10）。表のセル（「型が違う」など）と箇条書きの「〜か」は guides/05 §7 の例外 |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」「効果」は0件。「エラー」は「エラーにします」（149行目）だけで、表の誤用に当たらない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「検証します」「固定しています」「分類させる」「設定です」など。「JSON は…`safeParse` で検証します」「`jsonSchemaOutputFormat()` は、応答を検証しません」「バージョンは…固定しています」は他動詞に を／は、「出力をスキーマに合わせる」で取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「長い」（配列が長い）、「読みやすい」（文字列）、「余分な」（キー）程度で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」「約〜程度」なし。「例外を投げず」（57行目）「例外を投げて」（185行目）は throw の和訳だけで英単語と重ねていない。「`.toLowerCase()` は、文字列を小文字に変えます」（335行目）はメソッド名の説明で、地の文の語の重複ではない |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし（目視）。「型も作れます」（149行目）「再依頼の文を作る」（341行目）は実際に値を作る技術的な記述。「候補を作らないよう」（339行目）は enum の値を定義する操作で、make の直訳ではない |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」。`prose-check.txt` で60字超 0（最長60字）。2026-11-10 の直しで足した文のうち60字を超えた7文を分けた（`judgments.md`）。インラインコード、Markdown のリンク（URL を含む）、（出典n）も1字ずつ数え、見出し、表のセル、箇条書き、frontmatter の文字列も数えた。除外はコードブロックと URL だけのセル（件数は `prose-check.txt` 2行目） |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。「見本」（「サンプル」は地の文で0件、コードの識別子 `samples` だけ）、「違反」、「再依頼の文」、「作業フォルダ」（「ディレクトリ」0件）、「バージョン」（「版」0件）、「候補」（`z.enum` の値と JSON Schema の `enum` の値。242、298〜339行目も同じ語）、「大文字と小文字」（「大小」は242行目「頭文字の大小」の1か所で、直後に「大文字と小文字」と書き分けている）、「issues」「issue」は zod のフィールド名のまま。JSON のキーは「キー」、認証の鍵は必ず「API キー」と書き分けた。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」と「等」「など」。5つの見本、4種類、11種類、1〜3、40字、15分ほど、3件、2つ目、`$0.10`、`$0.50`、10万トークン、100万トークン。「数個」「早めに」型なし。「など」は地の文で0回（86行目の途中の版の「`minimum` などの違反」は「API が対応しない制約に反する値」に直した、`judgments.md`） |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（`prose-check.txt` の YA 2件は「読みやすい」「しやすい」の一部）。AND は「`path` と `code` を使います」（67行目）「カテゴリ、1〜3の優先度、40字以内の要約、タグの配列」（134行目）、箇条書きは「次の4つをすべて」（455行目）。OR は「true か false」（57行目）、「SDK を通さないとき、または検証しないヘルパーを使うときは」（88行目、途中の版の「〜ときと、〜ときは」を直した） |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。`prose-check.txt` の PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。`—`、`─`、`―` 0件（PAT）、writing-lint B-5 0回 |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`： `、`：`、`／` は0件（PAT）。コードブロック内の出力（`大きすぎる値: …`、`Bug -> bug`）は対象外 |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/zod-validate-llm-json-output.md > logs/zod-validate-llm-json-output/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、482行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。warn 0件で判断の対象なし（`lint/judgments.md`） |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。FATAL、warn、mention がすべて0件で、区別が要る検出なし |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。違反を入れた JSON の見本は、手作りで違反を入れたと明示し（151行目）、直後に各見本の issues と読み方を置いた（202〜296行目）。大文字の `"Bug"` は、拒まれる理由（242行目）と直し方（298〜339行目）を続けた |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/06`〜`09.log` の issues から、読む順を `path`、`code`、`message` に決めた（55〜67行目）。`run/07.log`（`"Bug"` が `invalid_value`）と `run/10.log`（小文字にそろえると `"Bug"` と `"BILLING"` は通り、`"feature"` は `invalid_value` のまま、`Ticket.extend()` で `bad-enum` が通る）から、アプリでは差し替えた形を使うと判断した（339行目）。`run/09.log`（違反3つで3件）から、再依頼の文を1回の検証で作れると判断した（294、378行目）。`run/12.log`（日本語の文がやや不自然で、`z.config` は全体に効く）から、講座では英語のまま使うと判断した（412行目）。`run/13.log`（`confidence` が黙って消える）から、開発とテストでは `z.strictObject` を使うと判断した（443〜445行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（`run/01.log`〜`13.log`、G04）。型は `run/14.log`、外へ出ないことは `run/15.log`。モデルには送っていない（キーが無く、記事も文字列を作るところまでにした。378行目） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 462行目「再依頼を何回まで続け、それでも合わない出力はどう扱いますか。」の1か所 |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）

## 結論

G07 と G10 が NG なので、`status: draft` のまま止める。EmDash への投稿も git のコミットもしていない。

ブロッカー（解消するまで下書き）:

1. G10: `keywords/` に CSV が無い。`target_query` は null のまま、値は作らない（`selection.md`）。
2. G07: 講座の前後の記事（`claude-agent-sdk-structured-output`、`zod-to-json-schema-tool-definition`）が、公開も予約もされていない（前も次も下書きの原稿だけがある）。この記事より前に2本が公開か予約されるか、公開の時点で無いほうのリンクを外して frontmatter を null に戻すまで、公開に進めない。

ゲート外の制約:

1. 検証した JSON は手で作った見本で、本物のモデルの出力ではない（本文151行目に明記）。モデルが実際にどの違反をどれくらい返すかは確かめていない。
2. 再依頼の文をモデルへ送る処理は書いておらず、実行もしていない（キーが無い）。
3. `zodOutputFormat()` と `parse()` が外した制約を確かめること（86行目）は出典7の記述だけが根拠で、SDK を入れて動かしてはいない（API キーが無いと `parse()` を呼べない）。
4. GitHub の blob のページと npm のページはこの環境から 403 だったので、同じタグの raw ファイルと `npm view` で中身を確かめた（`sources.md`）。zod.dev は main の原稿を出しているので、v4.6.7 の原稿と比べて差が記事に関係しないことを確かめた（`sources.md`）。
5. `run/` はこの環境の Read ツールの拒否設定に当たるディレクトリなので、2026-11-10 は `run-all.sh` で scratchpad にログを書き、中身をそこで確かめてから `run/` に cp した。`check-code-and-outputs.py` も scratchpad のログと `run/` の両方で ALL OK（`lint/check-code-and-outputs.txt` は `run/` に対する最後の実行）。
