# gate: ai-agent-safe-file-tool

判定日: 2026-10-31。原稿: `content/articles/ai-agent-safe-file-tool.md`（575行。行番号はすべてこの版）。

## 判定の前に読んだもの

2026-10-31 に、次を全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行。Bash の cat で全文を表示して読んだ）
- Read ツールで全文: `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）、`06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `docs/tech-writing-pack/scripts/writing-lint.py`、`ai-smell-lint.py` のソース（判定の仕組みと検出語の確認のため、cat で表示して読んだ）
- `keywords/README.md`（cat で全文を表示して読んだ）、`content/plan.md`

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 use 0件 / 📎mention 0件、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜44行目）の mention も0件。warn 0件。コードブロックの除去がずれず、地の文130行がすべて検査されたことも確かめた（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `575行/162文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。上限は guides/08 の標準の列と一致（対比2、ダッシュ2、メタ談話予告1、つまり2）。最初の版の B-2 三連反復1か所は直した（`judgments.md`）。WATCH の節なし、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（ALL OK）: 記事のコードブロック27個が、記事の順に `code/` の9ファイル（`package.json`、`setup.ts`、`naive-tool.ts`、`try-naive.ts`、`safe-file-tools.ts`、`try-safe.ts`、`naive-write.ts`、`tools.ts`、`try-tools.ts`）、記事のコマンド、`run/` の出力と1文字も違わない（出力は末尾の改行だけ除いて比べた）。ワンライナー2つも `run/07.log`、`run/08.log` の command 行と同じ。実行は `code/extra/run-all.sh` で、記事の手順どおり（`node -v` → `mkdir safe-file-tool` → `cd` → ファイルを置く → `node setup.ts` → `node try-naive.ts` → `node try-safe.ts` → `node naive-write.ts` → `node try-tools.ts`）。`run/01.log`〜`08.log` はすべて `exit=0`、2026-10-31、node v22.22.0 / npm 10.9.4 / Linux x86_64。型は `run/12.log`（tsc 7.0.2、`tsc_exit=0`）。API は呼ばない（`needs_api_key: false`、40行目） |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 560〜573行目に出典の表（8件、題名、URL、確認日 2026-10-31）。断定した文は（出典n）で表を引く（55、70、89、223、318、332、334、402、406、408、414、434、438、526、528、532、536、544行目）。文ごとの対応と、実行ログを根拠にした文は `sources.md`。料金は 540〜544行目で、記事のコードは無料（API を呼ばず、npm のパッケージも入れない）、モデルにつなぐとツールの定義と `tool_result` が入力トークンに数えられ、Claude Haiku 5.5 は 100万トークンあたり入力 $0.10、出力 $0.50（10万トークン以下のプロンプト、出典8）。モデルにつなぐ操作は実行していないので「無料」とは書いていない。frontmatter 9〜11行目の `cost_estimate`、`run_environment: "Node.js 22.22.0、npm 10.9.4、依存パッケージなし（型の確認は TypeScript 7.0.2）、Linux x86_64"`（`run/*.log` の見出し `node: v22.22.0 / npm: 10.9.4 / os: Linux x86_64`、`run/12.log` の `Version 7.0.2` と一致）、`verified_at: "2026-10-31"`（最後の実行 `run/12.log` の日付） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（この記事のほか9本）。course_step 4 の記事はまだ無い。近い `zod-to-json-schema-tool-definition` はツールの入力の型を作る記事、`mcp-server-typescript-stdio` は MCP サーバーの作り方で、どちらもツールの関数の中でパスを確かめる内容は無い（`content/plan.md` の重なりの決めごとと同じ） |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 51行目 `/posts/ai-agent-max-turns-budget-limit`（frontmatter 12行目 `prev`）。次: 558行目 `/posts/ai-agent-vs-workflow`（13行目 `next`）。関連: 49行目 `/posts/ai-agent-tool-use-loop-typescript`、528行目 `/posts/zod-to-json-schema-tool-definition`、556行目 `/posts/mcp-server-typescript-stdio`。前後は `content/plan.md` の course_step 4 の並び（#18、#20）による計画上の slug で、パスは既存の原稿と同じ `/posts/<slug>`。前、次、`ai-agent-tool-use-loop-typescript` の3本は原稿が無い。`zod-to-json-schema-tool-definition` と `mcp-server-typescript-stdio` は原稿があるが `status: draft` で、公開も予約もされていない。今この記事を公開すると5本ともリンク切れになる。公開済みか予約済みの記事は0本（既存9本はどれも `status: draft`）なので、関連記事への内部リンク（3本以上のとき）の条件は満たす対象が無い。リンク先の slug: `ai-agent-max-turns-budget-limit`、`ai-agent-vs-workflow`、`ai-agent-tool-use-loop-typescript`、`zod-to-json-schema-tool-definition`、`mcp-server-typescript-stdio` |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 575行目「AI 支援で執筆しました。コードは 2026-10-31 に実際に実行して確認しています。」。日付は最後の実行（`run/12.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/ai-agent-safe-file-tool/`（この gate.md を除く）に `ANTHROPIC`、`sk-ant`、`token`、`password`、`secret`、`api_key`、`/root`、`/home/user`、`tmp/claude`、`scratchpad` を `grep -rniIE` でかけた。該当は、frontmatter の `needs_api_key`（40行目）と、Windows のパスの例 `D:\secret.txt`（原稿 325、329行目、`run/07.log`、`code/extra/run-all.sh`）だけ。ほかに、`selection.md` の環境変数の名前 `ANTHROPIC_API_KEY`（記録は名前と `unset` だけ）、`needs_api_key: false` の記述、既存記事の slug `llm-api-cost-estimate-js-tiktoken`、`sources.md` に写した料金ページの英文の "tokens" が当たる。値としての API キーやトークンは0件（コードはキーを使わない）。`setup.ts` の `.env` の中身 `SAMPLE_KEY=dummy-value` は見本のダミーの文字列。ログのパスは `<work>`、`<code>`、`<tc>` に置き換えて保存した。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分。名前の各語、メールのローカル部、数字の ID）、ユーザーのメールアドレスのローカル部、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）を1語ずつ `grep -rniI -F` で原稿と `logs/ai-agent-safe-file-tool/` にかけ、0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | NG | `keywords/` に CSV が無い（README.md だけ）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める（CSV 待ち） |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（tool use でエージェントを作り始めた TypeScript の開発者が、ファイル操作ツールで作業フォルダの外を読み書きさせない方法を検索したときに、パスの判定と許可リストの実装を実行結果つきで答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」。2行目「AI エージェントに渡すファイル操作ツールを安全に作る【パスの制限と許可リスト】」。講座のキーワード「AIエージェント」を左端に置き（表記は「AI エージェント」、tags と main_keyword は5〜6行目）、手段の2つを【】に具体的に書いた。タイトルはワークフローの指示で与えられたもの。「徹底解説」「完全ガイド」は0件（`prose-check.txt` の PAT） |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」、guides/02 タイプ1 のリード。47行目の3文で、そのまま開くと外まで読む、`realpath` で実体に直したパスを `path.relative` で判定する、拡張子、書き込み先、ツール名を許可リストで絞る、を示した。49行目で対象読者を示した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアル。guides/02 タイプ1 を原本で読み、要素ごとに照合した（`brief.md` の表）。リード（47〜51行目）→ 全体像の表（53〜66行目）→ 前提・環境（68行目）→ セットアップ（99行目）→ 手順ごとにコードとその時点の実行結果（154、227、404、410、436行目）→ 動作確認（336行目）→ 確認すること（546行目、関連記事と次の記事へのリンク）。所要時間の目安は計っていないので書いていない（`brief.md`） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード（47行目）の1文目が問題、2文目が答え。最初の H2（53行目）は見出しが結論で、4つの検査の表と「守りの本体は2と3」（66行目）。理由（55行目、モデルの渡すパスは外の文章に誘導されうる）と詳細のコードは後 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 53（全体像）、68（環境）、154（素朴な実装の問題）、227（パスの判定）、404（拡張子と大きさ）、410（書き込み）、436（ツール名とエラーの返し方）、530（防げないこと）、540（料金）、546（確認）、560（出典）。H3 は 99（見本の配置）、336（実行結果）の2つ |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「素朴な実装は ../ とリンクで作業フォルダの外を読む」「書き込みは out/ の下に限り、既にある名前には書かない」「この関数で防げないこと」。「まず〜する」型は0件。途中の版の H3「見本のファイルを作る setup.ts」は作業の実況に近いので「setup.ts が作る見本の配置」に直した。68行目「動かした環境と準備」、540行目「料金がかからない範囲」は中身を名詞で示す見出し |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1、guides/01 §4。9ファイルを import から全文掲載し、ファイル名（89、101、156、179、229、338、416、438、494行目）、記事用のフォルダ（82〜87行目）、前提（70行目 Node.js 22.18.0 以上、出典3、Linux）を示した。各コマンドの出力は `run/01`〜`08.log` から写した（G04 の `check-code-and-outputs.txt`） |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。「守りの本体は2と3です」（66行目）と判断を示し、`startsWith` の比較が隣のフォルダとリンクを通す実行結果（`run/03.log`、223〜225行目）と、`path.isAbsolute` は保証にならないこと（334行目）を書いた。防げないこと（530〜538行目）も隠さず書いた。パスの判定の節を最も長くし、料金と環境の節は短くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。53: 66行目「守りの本体は2と3です」、68: 70行目「依存パッケージは使いません」、99: 152行目「隣のフォルダです」、154: 223行目「4つとも読みました」、227: 334行目「保証しているのは、`isInside` のほうです」、336: 400行目「通ったのは…1つです」、404: 406行目「無いからです」、410: 414行目「失敗します」、436: 484行目「関数が引けるからです」、530: 532行目「ハードリンクも防げません」、540: 542行目「無料です」、546: 548行目「すべて確かめます」、560: 562行目「どれも 2026-10-31 です」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」「可能性があります」「注意が必要」は0件（`prose-check.txt` の PAT）。「誘導されることがあります」（55行目）は出典6の "might embed instructions" に合わせた言い方で、出典を付けた1か所だけ |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件、writing-lint の B-6 0回。「解説します」「見ていき」「紹介します」「ここでは」は0件（PAT） |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「まとめ」「整理」は0件（PAT）。「次のファイル」「次の4つ」「次の5つ」は直後の内容を指す語。558行目「講座の次の記事」はスキルが求める講座の前後リンク |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件、PAT の「地図」「仕様書」「設計書」「レシピ」0件。単発の「落とし穴」（152行目）と「守りの本体」（66行目）は一覧に無く、各1回（`judgments.md`） |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではなく」「ではありません」「じゃない」0件 |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。`prose-check.txt` で地の文の文長が6〜60字、20字以下10文、41〜60字66文。例 128行目「実行します。」、223行目「`readNaive` は4つとも読みました。」の短文の後に長い説明が続く |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と語尾の反復チェック。`prose-check.txt` の SAME3（末尾3字）0、2字の語尾（「ます」「です」）の3連続も0。writing-lint の B-2 も0 |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「`readWithPrefixCheck` は、`../outside/private.txt` を断りました。残りの2つは通しています。」（225行目）のように、2文目の主語は1文目と同じで読み取れる |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文と description の文末を `prose-check.py` で調べ、ですます以外は0件（`prose-check.txt` の C19）。538行目の問い（「どちらを選びますか」）もですます。表のセルと箇条書きは guides/05 §7 の例外 |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」「効果」は0件。「エラー」は「ENOENT のエラーを投げます」（402行目）、「エラーの文を返します」（526行目）、「エラーを `is_error` で返しているか」（554行目）で、表の誤用に当たらない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「判定する」「実行する」「保存する」「制限される」「失敗する」「誘導される」など。「パスが既にあると失敗する」（414行目）は自動詞に が、「OS のアクセス権でも…制限されます」（536行目）は受身で、取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「危ない入力」「正規の絶対パス」「空の文字列」程度で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」「約〜程度」「各〜ごとに」なし（PAT と ai-smell-lint の CO重言 0件）。「エラーを投げます」は throw の和訳だけで英単語と重ねていない |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし（目視）。「見本のファイルは、スクリプトで作ります」（101行目）、「手で作った」（494行目）は実際にファイルやデータを作る記述 |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」。`prose-check.txt` で60字超 0（最長60字）。最初の版の22文を分けるか言い換えた（`judgments.md`）。インラインコード、リンク（URL を含む）、（出典n）も書かれたとおりに数え、見出し、表のセル、箇条書き、frontmatter の title と description も数えた。除外はコードブロックと URL だけのセル8つ |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。「作業フォルダ」は `workspace` だけを指し、読者の作るフォルダは「記事用のフォルダ」（82行目）。「リンク」は138行目で「シンボリックリンク（以下、リンク）」と定義し、「ハードリンク」とは分けた。「許可リスト」「見本」「判定」「断る」で通した。製品名は Node.js、TypeScript、npm の公式表記。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。4つの検査、30,000 バイト、20,000 バイト、8つの読み込みと4つの書き込み、Node.js 22.18.0 以上、$0.10、$0.50、10万トークン、100万トークン、5つの確認項目。「数個」「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（PAT。途中の版の「制限や注意点」を直した）。AND は「拡張子、書き込み先、ツール名」（47行目）、「4つの検査をすべて通った」（57行目）、「`.md` と `.txt`」（412行目）。OR は「予想外の出力か、操作された出力」（55行目）、「文字列の判定かリンクの判定」（400行目）、「`..` そのものか、…続く場合」（320行目）。箇条書きは「次の5つをすべて」（548行目） |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。`—`、`─`、`―` 0件（PAT）、writing-lint B-5 0回。配置の図（140〜150行目、コードブロック）も罫線を使わず字下げで書いた |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`：`、`／` は0件（PAT）。出典の表の題名「Modules: TypeScript」は Node.js のページの題名の原文で、半角コロン |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/ai-agent-safe-file-tool.md > logs/ai-agent-safe-file-tool/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、575行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。warn 0件で判断の対象なし（`lint/judgments.md`）。writing-lint の SHOULD、WATCH、INFO も0件。lint が拾わない語（「効く」「固める」「だけ」「守りの本体」「落とし穴」）は、guides/04 と guides/08 に照らして判断し、直したものと残したものを `judgments.md` に書いた |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。FATAL、warn、mention がすべて0件で、区別が要る検出なし |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。悪い実装の見本（`naive-tool.ts`、`naive-write.ts`）は、本文で「守りの無い実装と、よく見かける守り方」（156行目）、「フラグを付けない `writeFile`」（416行目）と明示し、直後に実行結果と問題点（223〜225、434行目）、直し方（227行目以降の `safe-file-tools.ts`、414行目の `"wx"`）を置いた |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/03.log`（`startsWith` の比較が隣のフォルダとリンクを通す）から、文字列の前方一致は守りにならないと判断し、`path.relative` と `realpath` を守りの本体とした（66、225行目）。`run/11.log`（`startsWith("..")` だと `..memo.md` も外になる）から、`..` の後に区切り文字が続く形で判定した（320行目）。`run/07.log`（別ドライブで絶対パスが返る）から `path.isAbsolute(rel)` を足した（322行目）。`run/05.log`（flag なしの書き込みがリンクの先に外のファイルを作る）から `"wx"` を選んだ（434行目）。`run/08.log` から許可リストを `Map` にした（484行目）。`run/10.log`（ハードリンクは通る）から、防げないことを書いた（532〜534行目）。20,000 バイトの上限は料金（出典8）から決めた値で、決めたことを書いた（408行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（`run/01.log`〜`08.log`、G04）。補助の確認は `run/09.log`（実行後のファイルの配置、外に report.md ができたこと）、`run/10.log`（ハードリンク）、`run/11.log`（`..memo.md`）、`run/12.log`（型）。API は呼んでいない（キーが無く、記事も `tool_use` の形の見本までにした） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 538行目「書き込みまで任せるなら、既にある名前を断る今の形と、`out/` の中は上書きを許す形の、どちらを選びますか。」の1か所 |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）

## 結論

G07 と G10 が NG なので、`status: draft` のまま止める。

- G10: `keywords/` に CSV が届いていない（CSV 待ち）。`target_query` は null で、値は作っていない。
- G07: 前後と関連のリンク先（`ai-agent-max-turns-budget-limit`、`ai-agent-vs-workflow`、`ai-agent-tool-use-loop-typescript`、`zod-to-json-schema-tool-definition`、`mcp-server-typescript-stdio`）が、どれも公開も予約もされていない。前の3本は原稿も無い。

EmDash への投稿と git のコミットはしていない（執筆するエージェントの担当外）。
