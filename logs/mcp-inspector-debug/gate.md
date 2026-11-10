# gate: mcp-inspector-debug

判定日: 2026-11-02。原稿: `content/articles/mcp-inspector-debug.md`（459行、frontmatter は1〜53行目。行番号はすべてこの版）。

## 判定の前に読んだもの

2026-11-02 に、次を全文読んでから全項目を判定した（Bash の cat で全文を表示して読んだ）。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）
- `guides/08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `guides/06-rewriting-prompts.md` は、スキルの表が指す「使い方の流れ」（181〜186行目）を読んだ
- `keywords/README.md`

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜53行目）の mention も0件。warn 0件（`judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `459行/182文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY の上限（B-1 2回、B-6 1回など）は guides/08 の標準の列と一致し、全カウンタ 0回。WATCH の節なし、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（ALL OK）: 記事のコード2つ（`package.json`、`server.ts`）が `code/` と1文字も違わない。記事の bash のコードブロック11個は、中身がそのまま `run/01.log`〜`11.log` の command と一致し（`code/extra/run-all.sh` が記事の順に `bash -c` で実行）、直後の実行結果11個はログの出力と1文字も違わない。終了コードは 01〜10 が 0（07、09、10 は `echo $?` を含むブロックで、表示した終了コードは 5、5、1）、11 は Ctrl+C（SIGINT）で止めた 130。画面の操作は `run/12.log`（ヘッドレスの Chromium、exit=0）と `lint/check-web-ui.txt`（13項目すべて PASS）。実行は 2026-11-02、node v22.22.0 / npm 10.9.4。型は `run/13.log`（TypeScript 7.0.2、exit=0）。API は呼ばない（`needs_api_key: false`、49行目） |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 441〜457行目に出典の表（11件、題名、URL、確認日 2026-11-02）。断定した文は（出典n）で表を引き、文ごとの対応と、実行ログを根拠にした文は `sources.md`。料金は 429〜433行目で、手順はどれも LLM の API を呼ばないので API の料金はかからない、Inspector のライセンスは Apache-2.0 と MIT（出典2）、Claude にツールを呼ばせるには Claude Code の有料のプランか Console のアカウントが要る（出典11）。その操作は実行していないので「無料」とは書かず、していないと書いた。frontmatter 9〜11行目: `cost_estimate`（本文の料金の記述と同じ内容）、`run_environment: "Node.js 22.22.0、npm 10.9.4、MCP Inspector 2.13.0、SDK 1.32.2、zod 4.6.7、Linux x86_64（型の確認は TypeScript 7.0.2）"`（`run/*.log` の見出し `node: v22.22.0 / npm: 10.9.4`、`run/04.log` の `2.13.0`、`code/package.json` の固定した版、`run/13.log` の `Version 7.0.2`、`uname -m` の `x86_64` と一致）、`verified_at: "2026-11-02"`（最後の実行 `run/14.log` の日付 2026-11-02） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（書き始めたときの11本と、書いている間に増えた `mcp-server-streamable-http`。この記事のほかに12本）。最も近いパイロット `mcp-server-typescript-stdio` はサーバーを作って自作のクライアントで確かめる記事で、この記事は Inspector の使い方に答える。サーバーの作り方は繰り返さずリンクに任せた。`mcp-server-streamable-http` は HTTP でサーバーを動かす記事で、Inspector の使い方は扱わず、この記事へ次の記事としてリンクしている。`mcp-connection-closed-fix`（未作成）とは `Connection closed` の1例が接するだけで、切り分けはリンクに任せた |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 63行目 `/posts/mcp-server-streamable-http`（frontmatter 12行目 `prev`）。次: 439行目 `/posts/mcp-server-resources-prompts`（13行目 `next`）。関連: 63行目 `/posts/mcp-server-typescript-stdio`、379行目 `/posts/mcp-connection-closed-fix`。前後は `content/plan.md` の course_step 5 の並び（#22、#24）による計画上の slug で、パスは既存の原稿と同じ `/posts/<slug>`。前の記事 `mcp-server-streamable-http` は、この記事を書いている間に別のワークフローが原稿を置いた（2026-11-02 に確認。`status: draft`、`next: "mcp-inspector-debug"` でこの記事を指し、563行目からこの記事へリンクしている）。`mcp-server-typescript-stdio` も原稿があるが `status: draft`。次の記事と `mcp-connection-closed-fix` は原稿が無い。4本とも公開も予約もされていないので、今公開するとリンク切れになる。この記事のほかの12本はどれも `status: draft` で、公開済みか予約済みの記事は0本。リンク先の slug: `mcp-server-streamable-http`、`mcp-server-resources-prompts`、`mcp-server-typescript-stdio`、`mcp-connection-closed-fix` |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 459行目「AI 支援で執筆しました。コードは 2026-11-02 に実際に実行して確認しています。」。日付は最後の実行（`run/14.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/mcp-inspector-debug/` 全体に、32桁以上の16進、`sk-ant`、`ANTHROPIC`、`password`、`secret`、`token`、`api_key`、`/root`、`/home/user`、`tmp/claude`、`scratchpad` を `grep -rniIE` でかけた。該当は、frontmatter の `needs_api_key`、Inspector の出力の `secrets.json` と `MCP_INSPECTOR_SECRET_*` の環境変数名と `***` に置き換えたトークン、`selection.md` の環境変数の名前と `unset` の記録、`web-ui-check.mjs` の変数名だけ。Inspector の API トークン（起動ごとに作られるローカルのトークン）は `run-all.sh` が `***` に置き換えてから保存した。値としての API キーやトークンは0件。ログのパスは `/path/to` と `~` に置き換えた。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分。名前、メールのローカル部、数字の ID）、ユーザーのメールアドレスのローカル部、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）を1語ずつ `grep -rniI -F` で原稿と `logs/mcp-inspector-debug/` にかけ、0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | NG | `keywords/` に CSV が無い（README.md だけ）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める（CSV 待ち） |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（TypeScript で MCP サーバーを作り始めた人が、MCP Inspector の使い方を調べたときに、v2 の CLI と画面でツール一覧と呼び出しを確かめる手順と、CLI の引数の落とし穴に答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」。2行目「MCP Inspector で MCP サーバーを調べる【ツール一覧と呼び出しを画面と CLI で】」。「MCP Inspector」「MCP サーバー」を左寄せで入れ、確かめる中身（ツール一覧と呼び出し）と手段（画面と CLI）を【】に書いた。講座のキーワード「MCPサーバー」は tags と main_keyword（5〜6行目）にも入れた。タイトルはワークフローの指示で与えられたもの。「徹底解説」「完全ガイド」は0件（`prose-check.txt` の PAT） |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」、guides/02 タイプ1 のリード。55行目で、Inspector が LLM を通さずにツールを呼べること、CLI なら1行で JSON が返り終了コードで成否がわかること、2.13.0 の CLI と画面で調べることを示し、57行目で `--tool-arg text=2026` の落とし穴と直し方があることを示した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアル。guides/02 タイプ1 の骨格に照らした（`brief.md`）。リード（55〜61行目、完成形の出力、対象読者、所要時間の13秒）→ 前提・環境（82行目、Node.js の版、パッケージの版、ファイル構成）→ 番号付きの手順 1〜5（112、203、250、320、381行目、各手順にコマンドとその時点の実行結果）→ 動作確認（画面の結果、421行目）→ まとめに当たる節（435行目、次にやれることと次の記事へのリンク） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード（55行目）の1文目が「Inspector で何ができるか」の答え。各 H2 は見出しが結論（例 203行目「tools/list でクライアントに渡るツールの定義が見える」、320行目「終了コードを見れば失敗の種類がわかる」）で、本文はコマンドと結果、理由、詳細の順 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 65（Inspector とは）、82（環境）、112（サーバー）、203（一覧）、250（呼び出し）、320（終了コード）、381（画面）、429（料金）、435（Claude Code の前に確かめる）、441（出典）。H3 は 76（v2 の変更）、272（数字だけの文字列） |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「調べるサーバーは server.ts の1ファイル」「数字だけの文字列は --tool-args-json で渡す」「v2 では 6277 番のプロキシが無くなった」。「まず〜する」型は0件。82行目「前提となる環境」、429行目「料金がかからない範囲」は中身を名詞で示す見出し |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1、guides/01 §4。2ファイルを import から全文掲載し、ファイル名（121、141行目）、作業フォルダ（114行目）、前提（84行目 Node.js 22.19.0 以上、102行目 `.ts` をそのまま実行できる版）を示した。各コマンドの出力は `run/01`〜`11.log` から写した（G04 の `check-code-and-outputs.txt`）。パスとトークンを置き換えたことは 349、389行目に書いた |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。74行目「覚える順番は CLI が先です」とその理由。手元で引っかかった `--tool-arg` の落とし穴を最初に予告し（57行目）、H3（272〜318行目）で実行結果とともに最も長く書き、318行目で「最初から `--tool-args-json` を使うことにしています」と決めた。料金と環境の節は短くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。65: 74行目「覚える順番は CLI が先です」、76: 78行目「v1 のものです」、82: 84行目「インストールは止めません」、112: 139行目「記事と同じ版の Inspector で動かすためです」、203: 246行目「この出力を読めば見つかります」と248行目「省けません」、250: 270行目「結果は正しい値です」、272: 318行目「使うことにしています」、320: 347行目「`code` を読みます」と379行目「上を読んでください」、381: 423行目「結果が違います」、429: 431行目「料金はかかりません」、435: 437行目「確認は済みです」、441: 443行目「どれも 2026-11-02 です」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」は0件（`prose-check.txt` の PAT）。条件の文（「開かなかったときは」414行目）は条件を切って言い切っている |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件、writing-lint の B-6 0回。「解説します」「見ていき」「紹介します」は0件（PAT） |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「まとめ」「整理」は0件（PAT）。途中の版の「次は、サーバーのファイル名を…」は直した（`judgments.md`）。「次の4つ」「次の形」は直後の内容を指す語。439行目「講座の次の記事」はスキルが求める講座の前後リンク |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件、PAT の「地図」「仕様書」0件。比喩は「落とし穴」の1語だけ（2回、`judgments.md`） |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではなく」「ではありません」「じゃない」0件。298行目の「例外にならず、…結果で返っています」を数えても1回（`judgments.md`） |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。`prose-check.txt` で地の文の文長が11〜60字、20字以下11文、41〜60字70文。例 248行目「`--method` は省けません。」、318行目「今度は4文字と返りました。」の短文の後に長い説明が続く |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と語尾の反復チェック。`prose-check.txt` の SAME3（末尾3字）0、2字の語尾（「ます」「です」など）の3連続も0。途中の版の21か所を直した（`judgments.md`） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「保存先は OS のキーチェーンです（出典2）。無ければ、…に暗号化せずに書きます（出典2）。」（412行目）のように、2文目の主語は1文目と同じで読み取れる |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文と description の文末を `prose-check.py` で調べ、ですます以外は0件（`prose-check.txt` の C19）。箇条書き（69〜72行目）と番号付きの手順（418〜421行目）もですます調。表のセルは guides/05 §7 の例外 |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」「効果」は0件。「エラー」は「エラーを返しました」（57、274行目）、「エラーで終わり」（248行目）、「入力のエラー」（347行目）で、表の誤用に当たらない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「実行します」「表示します」「保存します」「検査しません」「公開します」など、どれも他動詞として「を」を取る。「表示が `Connected` に変わります」（418行目）は和語。取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「正しい値」（270行目）、「試験的な」「予期しない」程度で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」「約〜程度」「各〜ごとに」なし。「標準エラー」「終了コード」は英語と和訳を重ねていない（目視） |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし。「作業フォルダを作り」（114行目）、「起動のたびに作られるトークン」（414行目）は実体を作る記述（目視） |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」。`prose-check.txt` で60字超 0（最長60字）。途中の版の14文を分けた（`judgments.md`）。インラインコード、リンク（URL を含む）、（出典n）も書かれたとおりに数え、見出し、表のセル、箇条書き、番号付きの手順、frontmatter の title と description も数えた。除外はコードブロックと URL だけのセル11個 |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。「画面」（Web のこと。65〜74行目で Web と CLI を定義し、以後「画面」と「CLI」で通した）、「終了コード」、「作業フォルダ」、「起動のログ」、「秘密情報」、「キーチェーン」で通した。製品名は Node.js、TypeScript、npm、Claude Code、MCP Inspector の公式表記。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。2.13.0、22.19.0、13秒、40行、6274 番、6277 番、終了コード 0・1・3・4・5、7文字、4文字、5行、11件など。「数個」「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（PAT。途中の版の3か所を直した）。AND は「Node.js 22.19.0 以上と npm」（84行目）、「環境変数の値と OAuth のトークン」（412行目）、OR は「6277 番のポートか `MCP_PROXY_AUTH_TOKEN`」（78行目）、「有料のプランか Console のアカウント」（433行目）。表の終了コード5の行は「返したか、見つからない」の OR |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。地の文の `—`、`─`、`―` は0件（PAT）、writing-lint B-5 0回。391〜410行目のコードブロックにある `—` は Inspector の出力をそのまま写したもので、guides/03 の「コードブロックの中は対象外」に当たる |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`：`、`／` は0件（PAT）。ツールの出力の `文字数: 4 / 行数: 1` はインラインコードとコードブロックの中で、対象外 |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/mcp-inspector-debug.md > logs/mcp-inspector-debug/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、459行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。warn 0件で判断の対象なし（`lint/judgments.md`）。writing-lint の SHOULD、WATCH、INFO も0件。lint が拾わない語（「落とし穴」「有効」「通りませんでした」など）は guides/04「技術ブログでの線引き」に照らして判断した（`judgments.md`） |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。FATAL、warn、mention がすべて0件で、区別が要る検出なし |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。失敗するコマンド（`--tool-arg text=2026`、ツール名の誤り、ファイル名の誤り）は、失敗する例だと前の文で明示し（274、334、349行目）、直後に実行結果と直し方か読み方を置いた（296〜318、347、379行目） |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/07.log`（`text=2026` が数値で送られ isError、終了コード5）と `run/08.log`（`--tool-args-json` で4文字）から、文字列の引数は最初から `--tool-args-json` で渡すと決めた（318行目）。`run/12.log`（画面では同じ `2026` が4文字）から、画面と CLI で結果が違うことを書いた（423行目）。`run/09.log` と `run/07.log` の終了コードがどちらも5なので `code` で見分けると判断した（347行目）。`run/10.log` から、終了コード1のときは JSON の行より上を読むと書いた（379行目）。`run/14.log` で CLI の README の「Basic usage」の形（`--method` なし）が終了コード1で終わることを確かめ、248行目に書いた。`run/11.log` のキーチェーンの警告から、秘密情報の保存先の注意を足した（412行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（`run/01.log`〜`11.log`、G04）。画面の操作は `run/12.log`、型は `run/13.log`、`--method` を省いたときは `run/14.log`。API は呼んでいない（キーが無く、記事も API を使わない） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 437行目「あなたのサーバーのツールに、数字だけの文字列を受け取る引数はいくつありますか。」の1か所 |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）

## 結論

G07 と G10 が NG なので、`status: draft` のまま止める。

- G10: `keywords/` に CSV が届いていない（CSV 待ち）。`target_query` は null で、値は作っていない。
- G07: 前後と関連のリンク先（`mcp-server-streamable-http`、`mcp-server-resources-prompts`、`mcp-server-typescript-stdio`、`mcp-connection-closed-fix`）が、どれも公開も予約もされていない。前の記事と関連のパイロットが先に予約され、次の記事と `mcp-connection-closed-fix` の原稿ができて予約されるまで、この記事は公開できない。公開の時点で無い記事があれば、そのリンクを外して frontmatter を null に戻す。

EmDash への投稿と git のコミットはしていない（執筆するエージェントの担当外）。
