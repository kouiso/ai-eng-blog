REVIEW | pilot claude-p-script-first-call | 2ee501c | FAIL

点検の対象: `content/articles/claude-p-script-first-call.md`（445行）と `logs/claude-p-script-first-call/`。コミットは 2ee501ce73640ca1fbc63ffc0e851f92aae29002（origin/develop の上に2コミット）。点検した日は 2026-11-14 です。

develop との差分だけでなく、記事全体を checklist の C01〜C39 と G01〜G11 に照らしました。判定の前に Read ツールで全文を読んだものは、次のとおりです（2026-11-14）。

- `docs/tech-writing-pack/checklist.md`
- `docs/tech-writing-pack/guides/02-article-structures.md`、`03-anti-ai.md`、`04-collocation.md`、`05-technical-writing.md`、`09-ai-writing-manual.md`
- `.claude/skills/write-article/SKILL.md`

`guides/01-seo-for-dev-blogs.md` は §1、§3（タイトル、リード）、§7 を読みました。`06-rewriting-prompts.md` は「使い方の流れ」、`08-ai-buntai-ruleset.md` は見出しと密度の上限の行だけを読みました。G02 の DENSITY は lint の結果が全カウンタ0回なので、上限の値は判定を左右しません。

直すべき指摘は3件、任意の指摘は12件です。G11 は、直すべき指摘が0件になるまで通りません。

## 直すべき指摘（must）

| # | 場所 | 何が問題か | 何を変えるか |
|---|---|---|---|
| M1 | `content/articles/claude-p-script-first-call.md:11`（`verified_at: "2026-11-11"`）、`:445`（本文の日付の行）。`logs/claude-p-script-first-call/gate.md:27`、`:38`、`:41`。`code/README.md:27` | 裁定8では、公開の前に `verified_at`、`run_environment` の版、本文の日付の行の3つを、最後の `run/` のログに合わせます。最後に動かしたログは `run/10.log` で、見出しは `date: 2026-11-12T01:01:14Z` です。ほかのログは 2026-11-11T11:04:46Z〜11:08:58Z（`run/01.log`〜`18.log`）なので、時刻の順で最後なのは `10.log` です。「最後」は時刻で読みます。SKILL.md:100 が「コードを最後に動かして、動いた日」、SKILL.md:376 が「`run/` の最後の成功したログの日付にそろえる」と書いているためです。`10.log` は通った再実行です（ブロックの `--- exit=0`。出力は本文 245〜250行目と1文字も違いません）。`code/README.md:27` は「このマシンの日付は 2026-11-11」と書いていますが、ログの中に裏付けがありません。書いた AI も `gate.md:37` で「このマシンの時刻帯を確かめられない」と書いています。ログが示す日付は 2026-11-12 で、2026-11-11 とは合いません。`run_environment` の版（jq 1.7.1 と 1.8.1、Node.js 22.23.4、Claude Code 2.1.322）は `10.log` と合っています | `:11` を `verified_at: "2026-11-12"`、`:445` を「AI 支援で執筆しました。コードは 2026-11-12 に実際に実行して確認しています。」にします。`gate.md` の G05、G08 の根拠と、提出前チェックの (c)（`:27`）を、`run/10.log` の `2026-11-12T01:01:14Z` を根拠にする形に書き直します。`code/README.md:27` の現地の日付の説明は、消すか「確かめていない」と書きます。日付だけの直しなら、コードを動かし直す必要はありません（gate-readings.md の11の(c)）。2026-11-11 のままにしたいなら、全ブロックを1回で動かし直し、その回のログに3つを合わせます（出力が変われば本文の直しになります） |
| M2 | `content/articles/claude-p-script-first-call.md:411`「2回呼んで、警告は出ていません。」。`logs/claude-p-script-first-call/sources.md:29` | 実行して見えた結果として書かれていますが、`run/15.log` はこれを示せません。`ask.ts` は子の標準エラーを変数 `stderr` に貯めるだけです（記事 371行目、`code/ask.ts:26`）。外に出すのは、標準出力が空のときの `reject` だけです（記事 374〜376行目、`code/ask.ts:30`）。成功した回は、警告が出ても出なくても `node ask.ts` の出力が同じになります。所要時間の 7.9秒（`run/14.log` は1回、`run/15.log` は2回）も根拠になりません。回ごとに揺れるためで（`run/16.log` の `seconds=` は 2.6〜25.5）、この比較は以前の点検の任意の指摘2で外したものです。G05（断定した事実に根拠がある）と C08（実行結果を示した）に当たります | 次のどちらかにします。(a) 411行目を、出力が示すことだけの文にするか、消します（例「2回とも、`result` に答えが入って返りました。」）。`sources.md:29` もそれに合わせます。(b) `ask.ts` が標準エラーも出すように1行足し、ブロック15を動かし直して、`run/` に新しいログを足します。(b) はコードと出力の直しなので、手順6〜8を通し、M1 の3つをその回のログに合わせます。(a) のほうが小さく済みます |
| M3 | `content/articles/claude-p-script-first-call.md:234`「スクリプトや CI で動かすときに」「フックや CLAUDE.md を読まずに」。`:179`「フックや CLAUDE.md などを」。`logs/claude-p-script-first-call/gate.md:77`（C28）、`lint/judgments.md:28` | C28 は「AND/ORが明確（「AやB」で曖昧にしていない）」です。guides/05 §4 は「「AやB」は曖昧」とし、OR は「または」「いずれか」で書くよう求めています。234行目の「スクリプトや CI」は、どちらか一方の場面を指す OR の意味で、この形にそのまま当たります。続く「フックや CLAUDE.md を読まずに」は、出典1の一覧（hooks、skills、…、CLAUDE.md）の一部を挙げただけで、「など」がありません。読まないのが2つだけなのか、ほかもあるのかが分かりません。C28 の行の根拠は事実と合っていません。`gate.md:77` は「並列の「や」を「か」に直した」、`judgments.md:28` は「今の版の検出は0件」「257行目だけを残した」と書いていますが、179行目と 234行目に3つ残っています。補助のスクリプト（`prose-check.py`）がこの形を拾わなかったことを、目で確かめた結果として書いています | 234行目を「スクリプトか CI で動かすときに」「フックや CLAUDE.md などを読まずに」（または出典1の一覧どおりに列挙）にします。179行目は「など」があり、guides/05 §4 の「「等」「など」の前に代表例を最低2つ」を満たすので、そのままでかまいません。ただしその判断を `judgments.md` に書きます。`gate.md:77` と `judgments.md:28` を、今の本文の「や」を1つずつ挙げた形に直します |

## 任意の指摘（should）

| # | 場所 | 何が問題か | 直し方の案 |
|---|---|---|---|
| S1 | 記事 `:2`（タイトル）、`:4`（description）、`:52`（リード1文目） | 「LLM API の呼び出しは、`claude -p` なら…API キーなしで済みます」は、`claude -p` を LLM API の呼び出し口として示しています。事実の誤りはありません。出典5に「`claude -p` still draw from your subscription limits」があり、2文目が `claude -p` を Claude Code のコマンドと説明し、67行目で API を直接呼ぶ書き方は使わないと書いています。ただ、HTTP の API の呼び方を探して来た読者がそれを知るのは、15行あとです。guides/01 §7 は「タイトルと中身が違う（釣り）」を避けるよう求めています。今の形は釣りに当たらないと判断しましたが、判断の分かれる所です | 67行目の趣旨を、リードの2文目か3文目に寄せます。否定対比は今0回なので、使うなら1回に収めます。オーナーの判断に任せてもかまいません |
| S2 | 記事 `:214`「プランで動いているかは、`stream-json` の形式で確かめられます。」 | 出典8の `ApiKeySource` の説明は `'none' (no API key in use - e.g. claude.ai OAuth login, a bearer token, or a third-party cloud provider)` です（`sdk.d.ts:133`）。`none` が示すのは API キーを使っていないことだけで、プランのログインであることまでは示しません。見出し（212行目）と 230行目は正しい範囲で書かれています | 「API キーで動いていないかは、…確かめられます。」のように、見出しと同じ範囲の主張にします |
| S3 | 記事 `:208`「`costBasis` の `list` は、定価で換算したという意味です。」 | 出典の番号がありません。根拠は出典8の `costBasis` の説明（`sdk.d.ts:1536`、`Claude Code's built-in list prices ('list')`）です | 文末に（出典8）を足し、`sources.md` の出典8の行にも書きます |
| S4 | 記事 `:210`「入力の単価は、10万トークン以下のプロンプトのものです（出典7）。」 | 出典7の表では、10万トークン以下かどうかで分かれるのは入力も出力も同じです（`Claude Haiku 5.5 (for prompts up to 100,000 tokens)` の行が入力 $0.10、出力 $0.50。超えると $0.50 と $2.50）。今の書き方だと、出力の 0.50ドルはプロンプトの長さに関係なく同じ、と読めます | 「どちらも、10万トークン以下のプロンプトの単価です（出典7）。」にします |
| S5 | 記事 `:179`「手元の設定と道具を読み込ませない」 | ほかの所では「ツール」（147、299行目）と書いています。「道具」は MCP サーバーとツールをまとめた語のようですが、定義がありません。guides/05 §4「用語の統一」（一概念一用語）に照らすと揃っていません | 「手元の設定、MCP サーバー、ツールを読み込ませない」のように、指すものを書きます |
| S6 | 記事 `:177-189`。SKILL.md:260 | 以前の点検の任意の指摘4（`review.md:21`）が、オーナーの判断待ちのまま残っています。SKILL.md:260 は、`--strict-mcp-config` を付ける理由を本文の段落で説明しないよう定めています。この節は、見出し、段落、表で3つのフラグの効果を説明しています。測った結果として有用なので、直すべき指摘にはしていません | オーナーの判断を取って `review.md` に書きます |
| S7 | `logs/claude-p-script-first-call/sources.md:13`、`:26`。`lint/judgments.md:35` | どれも「273行目はキャッシュの読み出しの単価が安いことを出典7で書いた」としています。今の 273行目は「理由は確かめていません」で、キャッシュの語はありません。出典7を引くのは Sonnet 5.5 の単価と20倍の所だけです。gate-readings.md の11の(b)（引用と数を、直したあとの本文に合わせる）が済んでいません | 3か所を今の 273行目に合わせます |
| S8 | `logs/claude-p-script-first-call/gate.md:72`（C23） | 「各フラグの役割」を「138行目」としていますが、今の版では 140行目です。138行目はコードフェンスの閉じです | 140行目に直します |
| S9 | `logs/claude-p-script-first-call/selection.md:27-29`、`lint/judgments.md:22`、`:37` | 2026-11-11 の版の行番号（422、210〜228、443、230行目）と、今は本文に無い #5 へのリンク（「228行目で #5 にリンクして任せた」「230行目に移した」）が、断りなく残っています。今の本文の内部リンクは0件です（`grep -c "/posts/"` が0。`gate.md:40`） | 各節の頭に「2026-11-11 の版の記録。今の本文にはリンクが無い」と1行足します |
| S10 | `logs/claude-p-script-first-call/selection.md:58-66`。SKILL.md:117、:409 | Google トレンドで比べていません（HTTP 429 が2回。User-Agent を変えた取得は止められ、実行されていません）。理由は下に書きます | 残った比較は記事ごとに持たず、#83（オーナーの端末で行うキーワードの作業）で閉じてもらいます。統括の判断が出るまで、この行は開いたままにします |
| S11 | PR 本文の案（`pending/pilot-body.md`）の「`verified_at`、…本文の日付は 2026-11-11 のままで、最後のログと合っています」 | 同じ本文の「点検する AI に判断してほしいこと」と食い違い、M1 とも合いません | M1 を直したあとの形に書き直します |
| S12 | 記事 `:185`（表の total_cost_usd 0.01681166） | `run/16.log` は 0.016811660000000003 です。小数第8位に丸めたことは `sources.md:22` に書いてあるので、誤りではありません。ほかの2行も丸めの範囲で一致します | 直さなくてかまいません。表の下に「小数第8位までに丸めた」と1句足すと、読者にも分かります |

S10 を NG にしなかった理由は3つです。

1. SKILL.md:117 は手順1（キーワードを選ぶ）の絞り込みの4つ目で、公開前ゲートの行ではありません。G10 の条件（SKILL.md:281）は、CSV の行と一致することだけです。
2. 止めて報告する条件（SKILL.md:8、:428-437）に、トレンドが取れないことは入っていません。
3. 裁定2で、この記事のキーワードは #83 が選び、クラウドでは G10 を判定し直しません。SKILL.md:117 も「公開後は Search Console の実測を優先する」と書いています。

ただし、SKILL.md:409 は `selection.md` の最低限の中身に「人気度の大小関係とその出どころ」を挙げていて、今の `selection.md` には出どころがありません。裁定の前文は「裁定とゲートの行、checklist、SKILL.md が食い違ったら、その行の判定を止めて issue に書き、統括の判断を待ちます」と定めています。そのため、これを免除するのは点検する AI の役目ではありません。この点検では G11 の指摘に数えていませんが、#83 か統括が閉じるまでは開いたままです。

## 確かめたことと結果

### lint とスクリプト

- `python3 scripts/check-article.py claude-p-script-first-call`: `SUMMARY … 確定 0 {} / 候補 0 {}`、exit=0。
  - `[SKIP C25-URL]` は20件で、そのうち60字を超えるのは4件です（27、36、438、441行目。どれもセルか値の全体が URL 1つ）。
  - outputs は `text` 13件がすべてログと一致し、例外は0件でした。
- `python3 docs/tech-writing-pack/scripts/ai-smell-lint.py`: `✅ クリーン`、`use 0件 / 📎mention 0件`、`✅ 致命なし`、exit=0。保存済みの `lint/ai-smell.txt` と diff で一致しました。frontmatter（1〜50行目）の mention は0件です。
- `writing-lint.py --type article --register standard`: `445行/143文`、`### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、exit=0。WATCH の節は無く、INFO は0件です。保存済みの `lint/writing-lint.txt` と diff で一致しました。

### 出力とコードの照合（OUTPUT）

自分のスクリプトで照らしました。

- 記事の `text` のブロック13個は、どれも `run/` のログの output の欄と、末尾の改行を除いて完全に一致します。照らしたログは 01、02、03、04、06、07、08、09、10（`10-before-strict-guard` とも同じ）、11、13、14、15 です。
- `bash` のブロック15個は `run/01〜15.log` の command の欄と完全に一致します。
- `ts` の2個は `code/exec-file.ts`、`code/ask.ts` と完全に一致します。
- 表の 94,062、18,173、3,776 は、`run/16.log` の `prompt_tokens` と一致します。
- 出力で裏付けられないのは、M2 の 411行目だけです。

### 本文の読み直し

checklist の行ごとに、ガイドを読んでから本文を読み直しました。

- C17: 自分のスクリプトで、52〜426行目の地の文と箇条書きの111文を調べました。（出典n）とインラインコードを除き、末尾3字と裁定4の7つの語尾を見て、3文続く所は0件です。
- C25: check-article.py で0件でした。
- C05〜C12、C16、C18〜C24、C26、C27、C37: 本文を通して読みました。結論先行、1見出し1トピック、内容で書いた見出し、言い切り、メタ発言、文の長さ、主語と目的語、文体、コロケーション、重言、翻訳調、数値を見ています。指摘は M3（C28）、S5（C26）だけです。
- H2 の直下には、どれもリード文があります（guides/09 §1-1 の3）。

### 出典

10ページをすべて 2026-11-14 に `curl` で開きました（どれも HTTP 200）。確かめた文は次のとおりです。

- 出典1: 次の文を確かめました。175、179、208、234、236、279、415、416行目を支えます。
  - 終了コードの扱いと、不正なフラグは標準エラーに出ること
  - "prints the failure as the result on stdout"
  - `--bare` は CLAUDE.md などを読まない。"never reads OAuth credentials"
  - CI では `--bare` を勧めている
  - "Non-interactive mode reads stdin"
  - "client-side estimates and can differ from your actual bill"
  - `system/init`
- 出典2: `--strict-mcp-config`、`--setting-sources`、`--tools ""`。
- 出典3: Anthropic API では haiku、sonnet、opus がそれぞれ Haiku 5.5、Sonnet 5.5、Opus 5.5。257行目を支えます。
- 出典4: "In non-interactive mode (-p), the key is always used when present" と "Run `unset ANTHROPIC_API_KEY` to fall back to your subscription"。69、79行目を支えます。
- 出典5: "draw from your subscription limits"。
- 出典6: Pro は "$20 if billed monthly"。Free の一覧（Chat、Search、Memory、Connect、Artifacts、Design）に Claude Code は無く、Pro の一覧にはあります。"Claude Code is included in all paid plans" もありました。
- 出典7: Haiku 5.5 は入力 $0.10、出力 $0.50（どちらも 100,000トークン以下の行）。Sonnet 5.5 は入力 $2 で、Haiku の20倍です。
- 出典8: "An estimate, not a billing statement"、`ApiKeySource` の説明（S2）、`costBasis` の説明（S3）。
- 出典9: "v22.18.0 Type stripping is enabled by default"。
- 出典10: `stdio` の既定は `'pipe'`。

出典の番号は本文に37か所あり、`gate.md` の数と一致します。キーワードに合わせて曲げた事実はありません。S1 は書き方の指摘です。

### 記録の照合

gate.md、sources.md、selection.md の引用、数、行番号を、本文と30か所照らしました。

- gate.md で合っていた所:
  - 445行、37か所、428〜443行目
  - G04 の `--strict-mcp-config` 7/7
  - G05 の 62、67、208、210、273行目
  - G06 の 212〜230、253、424行目
  - C02 の2行目
  - C04 の 58〜95、97〜418、232、305、420〜426行目
  - C06 の H2 9本の行
  - C07 の 177、341行目
  - C09 の5か所、C10 の10か所
  - C15 の 253、67行目
  - C18 の 69、146行目
  - C20 の 339、418、415行目
  - C21 の 253、343行目
  - C22 の 275、273行目
  - C27 の各数値
  - C28 の 62、253、415行目
  - C36 の 307、339、341行目
  - C39 の 426行目
- sources.md の出典1〜10の行番号は合っていました。
- selection.md の 86、87行目（本文の 52、67行目を指す所）は合っていました。
- 合わなかったのは M3（`gate.md:77`、`judgments.md:28`）、S7、S8、S9 です。

### ゲートの行ごとの確認

- G07: 裁定1に従い、並び順だけを見ました。本文の `/posts/` は0件、`prev: null`、`next: claude-agent-sdk-streaming` です。
- G09: 原稿と `logs/claude-p-script-first-call/` に、`sk-ant`、オーナーの GitHub アカウント名、`@gmail`、`session_01`、`/Users/`、`/tmp/claude`、UUID の形の文字列を `grep` しました。当たったのは、`gate.md:16` の issue の URL（公開のリポジトリの URL）、`gate.md:42` の検索語の説明、古い `review.md` の説明の文だけです。git の履歴にある author の名前とメールアドレス（人の名前のもの）を1語ずつ `grep -i` にかけ、`gate.md` と `review.md` を除いて0件でした。当たったのは author 名の「Claude」だけで、これはツールの名前です。
- G10: `gate.md:43` に、#83 を出典にした日付つきの注記（「注記（2026-11-14。裁定2、出典 #83）」）があります。裁定2のとおり、判定し直していません。
- C01〜C04: guides/01 §1、§3、§7 と guides/02 タイプ1を読んで判定し、OK としました（S1 は任意の指摘）。`llm api 呼び出し` はやり方の検索で、構成はチュートリアルの骨格に合います。上位10記事を見ていないことは `brief.md:76` に書いてあります。
- 利用規約の注意書き（SKILL.md の「Claude プランで動かす記事」2）は、本文にありません。

### ローカルのチェック（gate-readings.md の10）

Node v24.22.3、npm 11.19.1、コミット 2ee501ce73640ca1fbc63ffc0e851f92aae29002 で流しました。終わったあとに `node_modules` を3か所とも消しました。

| コマンド | 結果 |
|---|---|
| `npm ci` | exit=0 |
| `npm run check` | exit=0（typecheck、test、build、secret-scan の4手順） |
| `npm run check:samples` | exit=0（7手順） |
| `node scripts/secret-scan.mjs origin/develop` | `8 file(s) scanned, 0 finding(s)`、exit=0 |

## 確かめていないこと

- 記事のコードは動かし直していません（モデルを呼ぶのは G11 のログインの確認の1回だけにしました）。94,062 トークンなどの再現性も見ていません。
- `guides/06` と `guides/08` は全文を読んでいません（上の「判定の前に読んだもの」）。`07-ai-buntai-laws.md`、`10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいません。
- `keywords/LLM API.csv`（オーナーの端末にだけある）は見ていません。G10 は裁定2により対象外です。
- Google の上位10記事は見ていません。

## G11 のログインの確認（裁定6）

```
$ env -u ANTHROPIC_API_KEY claude -p "say ok" --output-format stream-json --verbose --strict-mcp-config
init: "apiKeySource":"none"
時刻（date -u）: 2026-11-14T14:26:30Z（終わったのは 14:26:35Z、exit=0、result は success）
claude --version: 2.1.325 (Claude Code)
```

書いた AI のサブエージェント自身の init は、点検する側からは見えません。上の行は、点検する AI の環境での確認です。

点検した私（Claude、Opus 5.5 のサブエージェント）は、この記事を書いた AI とも、直した AI とも別の AI です。

## review.md 追記案

```markdown
## 点検（2026-11-14、この PR（#81 の作業、コミット 2ee501c）の1回目。target_query を `llm api 呼び出し` にした版）

- 書いた道具: Claude のサブエージェント（Claude Code。2026-11-14 の直しをした AI）。その init は点検する側からは見えないので、ログインの方法は、書いた側の記録（`run/09.log` の `apiKeySource: none`、2026-11-11）による
- 点検した道具: Claude のサブエージェント（Opus 5.5。この記事の執筆と直しには関わっていない）。Claude Code 2.1.325。プランのログイン。`env -u ANTHROPIC_API_KEY claude -p "say ok" --output-format stream-json --verbose --strict-mcp-config` の init は `"apiKeySource":"none"`（2026-11-14T14:26:30Z）
- 結果: 直すべき指摘 3 件、任意の指摘 12 件。G11 は NG（下書きのまま）

### 直すべき指摘

| # | 場所 | 何が問題か | 直し方 |
|---|---|---|---|
| 1 | 記事:11（`verified_at`）、記事:445（本文の日付）、`gate.md:27,38,41`、`code/README.md:27` | 裁定8では、3つを最後の `run/` のログに合わせる。時刻の順で最後のログは `run/10.log`（`2026-11-12T01:01:14Z`）。現地の日付が 11-11 だという説明は、ログの中に裏付けが無い | `verified_at: "2026-11-12"` にし、末尾の日付を 2026-11-12 にする。G05、G08、(c) の根拠を `run/10.log` に向ける。README の現地の日付の説明は消すか、「確かめていない」と書く |
| 2 | 記事:411「2回呼んで、警告は出ていません。」、`sources.md:29` | `ask.ts` は成功した回で子の標準エラーを出さない（記事 371、374〜376行目）。そのため `run/15.log` は警告の有無を示せない | 出力が示すことだけの文にするか、消す。または標準エラーを出すように直して動かし直す |
| 3 | 記事:234「スクリプトや CI」「フックや CLAUDE.md を読まずに」、`gate.md:77`（C28）、`lint/judgments.md:28` | C28（「AやB」で曖昧にしていない）と guides/05 §4 に当たる。gate と judgments は「や」を直した、検出0件と書いているが、179行目と 234行目に3つ残っている | 「スクリプトか CI」「フックや CLAUDE.md などを読まずに」にし、gate と judgments を今の本文に合わせる |

### 任意の指摘

| # | 場所 | 何が問題か | 直し方の案 |
|---|---|---|---|
| 1 | 記事:2、:4、:52 | `claude -p` を LLM API の呼び出し口として示している。事実の誤りは無いが、API を直接呼ばないことは 67行目まで出てこない（guides/01 §7） | 67行目の趣旨をリードに寄せる |
| 2 | 記事:214 | `apiKeySource` が `none` でも、bearer token や外部のクラウドのことがある（`sdk.d.ts:133`）。「プランで動いているか」は言い過ぎ | 「API キーで動いていないかは」にする |
| 3 | 記事:208 | `costBasis` の `list` の意味の文に、出典の番号が無い | （出典8）を足す |
| 4 | 記事:210 | 10万トークン以下で分かれるのは、入力と出力の両方（出典7） | 「どちらも、10万トークン以下のプロンプトの単価です」にする |
| 5 | 記事:179 | 「道具」と「ツール」（147、299行目）が混在している（guides/05 §4） | 指すもの（MCP サーバーとツール）を書く |
| 6 | 記事:177-189、SKILL.md:260 | 以前の任意の指摘4が、オーナーの判断待ちのまま | オーナーの判断を記録する |
| 7 | `sources.md:13,26`、`lint/judgments.md:35` | 273行目がキャッシュの単価を書いているという記述が、今の本文と合わない | 今の 273行目に合わせる |
| 8 | `gate.md:72` | 「各フラグの役割」は 138行目ではなく 140行目 | 行番号を直す |
| 9 | `selection.md:27-29`、`lint/judgments.md:22,37` | 2026-11-11 の版の行番号と、今は無いリンクの記述が残っている | 旧版の記録であることを書く |
| 10 | `selection.md:58-66`、SKILL.md:117、:409 | Google トレンドで比べていない。ゲートの行ではなく、裁定2でキーワードは #83 の担当なので、G11 の指摘には数えない。ただし SKILL.md:409 の最低限の中身が欠けているので、免除は統括か #83 が決める | #83 か統括が閉じる |
| 11 | PR 本文の案 | 「最後のログと合っています」が、直すべき指摘1と食い違う | 直したあとの形に書き直す |
| 12 | 記事:185 | 表の値は小数第8位に丸めてある（`sources.md:22` に記録がある） | 任意。表の下に一言足す |

### 確かめて問題が無かったこと

- `check-article.py` は確定0、候補0（OUTPUT は13件すべて一致、例外0件）
- ai-smell-lint は致命なしで exit=0、writing-lint は `FATAL 0 / DENSITY超過 0 / SHOULD 0` で exit=0。どちらも保存済みの `lint/` と diff で一致した
- 記事の `text` 13個、`bash` 15個、`ts` 2個が、`run/` と `code/` に完全に一致する（自前のスクリプト）。表のトークン数は `run/16.log` と一致する
- C17 は3連続が0件（自前のスクリプト、111文）
- 出典10ページをすべて開き、各断定を支える文を確かめた
- gate.md、sources.md、selection.md の引用と行番号を30か所照らした。合わないのは、直すべき指摘3と任意の指摘7〜9だけ
- G09 の検索（アカウント名、author の名前、メール、パス、UUID）で、当たりは無い
- G10 の行には、#83 を出典にした日付つきの注記がある
- Node 24.22.3 とコミット 2ee501c で、`npm ci`、`npm run check`、`npm run check:samples`、`node scripts/secret-scan.mjs origin/develop` がどれも exit=0（secret-scan は 8 files、0 findings）

### 確かめていないこと

- 記事のコードは動かし直していない
- guides/06 と 08 は全文を読んでいない（G02 の DENSITY が全カウンタ0回のため）
- `keywords/LLM API.csv`（オーナーの端末にだけある）と、Google の上位10記事は見ていない

### 対応

（書いた AI が記入する）
```

---
_Generated by [Claude Code](https://claude.ai/code)_
