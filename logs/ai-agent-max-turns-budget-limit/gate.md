# gate: ai-agent-max-turns-budget-limit

判定日: 2026-11-10。原稿: `content/articles/ai-agent-max-turns-budget-limit.md`（474行。行番号はすべてこの版）。

## 判定の前に読んだもの

2026-11-10 に、次を全文読んでから全項目を判定した。

- Read ツールで全文: `docs/tech-writing-pack/checklist.md`（61行）、`guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）、`06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `keywords/README.md`、`content/plan.md`、`.claude/skills/write-article/SKILL.md`（全文）
- 補助スクリプトは `logs/ai-agent-safe-file-tool/lint/prose-check.py` を写したもの（除外と数え方は同じ）と、この記事用に書いた `check-code-and-outputs.py`

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 2行目 `✅ クリーン`、3行目 `use 0件 / 📎mention 0件`、4行目 `✅ 致命なし`、末尾 `exit=0`。frontmatter（1〜50行目）の mention も0件。途中の版の warn 1件（②「ここでは」、232行目）は use と判断して直した（`judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `474行/146文`、判定行 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、`exit=0`。上限は guides/08 の標準の列と一致（対比2、ダッシュ2、メタ談話予告1、つまり2）。途中の版の B-2 三連反復2か所は直した（`judgments.md`）。WATCH の節なし、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | NG | B の C25 が NG（タイトルが63字）。ほかの C01〜C38 は OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Messages API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格。Agent SDK の記事はオーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（ALL OK）: 記事のコードブロック25個が、記事の順に `code/` の5ファイル（`setup.ts`、`run-agent.ts`、`turns-limit.ts`、`budget-limit.ts`、`no-catch.ts`）、`run/` の command 行、`run/` の出力と1文字も違わない（出力は末尾の改行だけ除いて比べた）。インストールの4つのコマンドは `run/02.log` で `&&` でつないで同じ順に実行した（mkdir と cd は `code/extra/run-all.sh` が行う）。実行は `code/extra/run-all.sh` と `run-headroom.sh` で、記事の手順どおり。`run/01.log`〜`13.log` はすべて `--- exit=0`（`run/08.log` の中の `exit=1` は記事が見せる `no-catch.ts` の終了コード）。2026-11-10、node v22.22.0 / npm 10.9.4 / Linux x86_64、`ANTHROPIC_API_KEY: unset`。Messages API は呼ばない（`needs_api_key: false`、46行目）。オーナーの Claude プランで動かし、init の `apiKeySource none`、`claude-haiku-5-5`、`Claude Code 2.1.322` を `run/04.log`〜`07.log`、`12.log`、`13.log` に残した。SDK の版は `run/10.log`（`@anthropic-ai/claude-agent-sdk@0.3.322`）。型は `run/11.log`（tsc 7.0.2、`tsc_exit=0`） |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 457〜472行目に出典の表（10件、題名、URL、確認日 2026-11-10）。断定した文は（出典n）で表を引く（52、65、71、84、86、90、92、141、166、232〜235、237、307、390、432、438、440、442、444行目）。文ごとの対応と、実行ログを根拠にした文は `sources.md`。料金は 436〜444行目で、プランの利用枠から引かれること（出典6）、`total_cost_usd` は手元で計算した見積もりで請求額ではないこと（出典3）、結果を載せた6回の合計が約0.0044ドルの見積もり（`run/04`〜`08`、`13` の合計 0.00435928）、API キーで動かすときの Haiku 5.5 の単価（出典8）。スキルの「Claude プランで動かす記事」3 のとおり。frontmatter 9〜11行目: `cost_estimate`（本文と同じ内容）、`run_environment: "Node.js 22.22.0、npm 10.9.4、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、モデル claude-haiku-5-5、Linux x86_64（型の確認は TypeScript 7.0.2）"`（`run/*.log` の見出し、init の行、`run/10.log`、`run/11.log` と一致）、`verified_at: "2026-11-10"`（最後の実行 `run/13.log` の日付） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（この記事のほか19本）。近いのは `claude-agent-sdk-first-agent`（plan #17、導入とメッセージの読み方）で、上限の話は1段落だけ。止まったときの結果の中身、ターンの数え方、`maxBudgetUsd`、例外の受け止め方は書いていない（`content/plan.md` の重なりの決めごとと同じ分け方）。ほかは grep で0件 |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 56行目 `/posts/claude-agent-sdk-first-agent`（frontmatter 12行目 `prev`）。次: 455行目 `/posts/ai-agent-safe-file-tool`（13行目 `next`）。関連: 56行目 `/posts/ai-agent-tool-use-loop-typescript`。前後は `content/plan.md` の course_step 4 の並び（#17、#19）で、`claude-agent-sdk-first-agent` の `next` と `ai-agent-safe-file-tool` の `prev` もこの記事を指している。パスは既存の原稿と同じ `/posts/<slug>`。前と次の2本は原稿があるが `status: draft` で、公開も予約もされていない。`ai-agent-tool-use-loop-typescript` は原稿が無い。今この記事を公開すると3本ともリンク切れになる。公開済みか予約済みの記事は0本（既存19本はどれも `status: draft`）。リンク先の slug: `claude-agent-sdk-first-agent`、`ai-agent-safe-file-tool`、`ai-agent-tool-use-loop-typescript` |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 474行目「AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。」。日付は最後の実行（`run/13.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/ai-agent-max-turns-budget-limit/` に `sk-ant`、`ANTHROPIC_AUTH`、`oauth`、`token`、`password`、`secret`、`api_key`、`/root`、`/home/user`、`tmp/claude`、`scratchpad`、`session_id`、メールアドレスの形を `grep -rniIE` でかけた。当たったのは環境変数の名前 `ANTHROPIC_API_KEY`（原稿 82、86行目、`run-all.sh` と `run-headroom.sh` の `unset` と `set`/`unset` の表示、`run/*.log` 4行目の `ANTHROPIC_API_KEY: unset`）と、frontmatter の `needs_api_key`（46行目）だけ。値としての API キー、トークン、セッションの ID は0件。init の行に出すのはモデル名、`apiKeySource`、Claude Code の版だけで、アカウント名とメールアドレスは表示していない。このセッションの認証情報は取り出しておらず、コードにも渡していない（認証は Claude Code のログインに任せた）。作業場所のパスは `<work>`、`<code>`、`<tc>` に置き換えて保存した。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分。名前の各語、メールのローカル部）、リポジトリのオーナーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名と姓名、英字の姓・名）の15語を1語ずつ `grep -rniI -F` で原稿と `logs/ai-agent-max-turns-budget-limit/` にかけ、合計0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | NG | `keywords/` に CSV が無い（README.md だけ）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める（CSV 待ち） |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（Agent SDK でエージェントを動かし始めた TypeScript の開発者が、止まらないのを防ぐ方法を検索したときに、2つの上限の渡し方、止まったときの result と例外、値の決め方を実行結果つきで答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」。2行目。講座のキーワード「AIエージェント」を左端に置き（表記は「AI エージェント」、tags と main_keyword は5〜6行目）、SDK 名と2つのオプション名を【】に具体的に書いた。「徹底解説」「完全ガイド」は0件（`prose-check.txt` の PAT） |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」、guides/02 タイプ1 のリード。52行目で「止める手段は2つの上限」と、それぞれが数えるもの、54行目で止まったときに届くもの（result、例外、`try` が無いと終了コード 1）を示した。56行目で対象読者を示した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアル。guides/02 タイプ1 を原本で読み、要素ごとに照合した（`brief.md` の表）。リード（52〜56行目）→ 結論の表（58〜73行目）→ 前提・環境（75行目）→ セットアップ（94行目）→ 手順ごとにコードとその時点の実行結果（164、250、275、305行目）→ 詰まりやすい所（388行目）→ 料金（436行目）→ 確認すること（446行目、次の記事へのリンク）。所要時間の目安は計っていないので書いていない（`brief.md`） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード（52行目）の1文目がループが続く理由、2文目が答え（2つの上限）。最初の H2（58行目）は見出しが結論で、止まったときに届くものの表と「両方を入れておくのが、この記事の結論です」（73行目）。詳細のコードと実行結果は後 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 58（結論）、75（環境と前提）、164（maxTurns の数え方）、305（maxBudgetUsd の超え方）、388（例外）、436（料金）、446（確認）、457（出典）。H3 は 88（プランで試してよい範囲）、94（セットアップ）、250（2で止まる）、275（応答の数が回によって変わる）の4つ |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「maxTurns: 2 だと、最後の回答の前で止まる」「同じ依頼でも、必要な応答の数は回によって変わる」「maxBudgetUsd は、上限を超えた応答のあとで止まる」。「まず〜する」型は0件。94行目「作業フォルダと見本のメモを作る」は作業を示す見出しだが、中身が作るもの（作業フォルダとメモ）を名指していて、「まず環境構築する」型の手の動きの実況とは違う |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1、guides/01 §4。5ファイルを import から全文掲載し、ファイル名（143、168、239、309、392行目の地の文）、作業フォルダの作り方（106〜113行目）、前提（84行目 Node.js 18.14 以上、86行目 `ANTHROPIC_API_KEY` を外す、141行目 `"type": "module"` と `.ts` の拡張子）を示した。各コマンドの出力は `run/01`〜`09.log`、`13.log` から写した（G04 の `check-code-and-outputs.txt`） |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。「両方を入れておくのが、この記事の結論です」（73行目）、「上限は、成功したときの応答の数ちょうどに合わせないでください」（301行目）、「`num_turns` は、応答の数を数えるのには使えません」（303行目）、「金額の上限は、払ってもよい額から応答1回分を引いた値にします」（386行目）と判断を示した。実行で見つけたこと（応答の数が回で変わる、`num_turns` が応答の数と合わない、例外でプロセスが終わる）の節を厚くし、環境と料金の節は短くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。58: 73行目「両方を入れておくのが、この記事の結論です」、75: 84行目「別に入れる必要はありません」、88: 92行目「禁止されています」、94: 141行目「既定で有効です」、164: 166行目「1ターンです」、250: 273行目「`error_max_turns` で止まりました」、275: 303行目「使えません」、305: 386行目「超える分は止められないからです」、388: 422行目「「ループのあとの行」は出ていません」、436: 440行目「請求額でもありません」、446: 448行目「すべて確かめてください」、457: 459行目「どれも 2026-11-10 です」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」「可能性があります」「注意が必要」は0件（`prose-check.txt` の PAT）。「請求額と一致するとは限りません」（440行目）は出典3の "can drift from what you are actually billed" に合わせた言い方で、出典を付けた1か所だけ |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件（途中の版の「ここでは」1件は直した）、writing-lint の B-6 0回。「解説します」「見ていき」「紹介します」「ここでは」は0件（PAT）。60行目「先に、…表に並べます」は表の直前に置いた導入文（guides/05 §6）で、記事の構造の予告ではない |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「まとめ」「整理」は0件（PAT。途中の版の「まとめました」は直した）。「次のとおり」（77行目）、「次のように」（230行目）、「次の4つ」（448行目）は直後の内容を指す語。455行目「次の記事」はスキルが求める講座の前後リンク |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件、PAT の「地図」「仕様書」「設計書」「レシピ」0件。途中の版の「堂々めぐり」「歯止め」は比喩なので具体に戻した（`judgments.md`） |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではなく」「ではありません」「じゃない」0件 |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。`prose-check.txt` で地の文の文長が13〜60字、20字以下10文、41〜60字34文（112文中）。例 252行目「上限を2にして動かします。」、277行目「上限を10にすると、最後まで答えました。」の短文のあとに、長い実行結果の説明が続く |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と「語尾の反復チェック」。`prose-check.txt` の SAME3（末尾3字）0、2字の語尾（「ます」「です」）の3連続も0（途中の版の18か所は直した）。writing-lint の B-2 も0（途中の版の2か所は直した） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「`runAgent` は、同じ例外を `catch` で受けて1行表示します。そのあとも処理は止まりません。」（432行目）のように、2文目の主語が1文目から読み取れる |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文と description の文末を `prose-check.py` で調べ、ですます以外は0件（`prose-check.txt` の C19）。434行目の問いも「〜しますか」。表のセル、箇条書き、見出しは guides/05 §7 の例外 |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」「効果」は0件。「エラー」は地の文では「標準エラー」（407、422行目）だけで、「ファイルに逃がして」「例外の文が残っています」と、表の誤用に当たらない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「実行する」「処理される」「表示する」「設定されている」「中継する」「固定する」など。「処理は止まりません」（432行目）、「応答は最後まで処理され」（307行目、受身）、「`ANTHROPIC_API_KEY` が設定されていると」（86行目）で取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「額が大きい」（73行目）、「最も高かった実行」（362行目）、「標準エラーは長い」（407行目）程度で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」「約〜程度」「各〜ごとに」なし（PAT と ai-smell-lint の CO重言 0件）。「約 0.00065 ドル」「約30%」「約0.0044ドル」は「程度」と重ねていない。「例外を投げます」は throw の和訳だけ |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし（目視。途中の版の「同じ ID を持ちます」は「ID が同じです」に直した）。「メモを作る」（94行目）は実際にファイルを作る記述 |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | NG | guides/05 §1「文の長さ」。`prose-check.txt` で60字超が1つ: frontmatter の title（2行目、63字）。本文、見出し、表のセル、箇条書き、description の文はすべて60字以下（最長60字。途中の版の7文は分けた）。インラインコード、リンク（URL を含む）、（出典n）も書かれたとおりに数え、除外はコードブロックと URL だけのセル10個だけ。タイトルはワークフローの指示と `content/plan.md` #18 のままで、この記事の担当では変えていない。数えないのはガイドに無い除外になるので NG とした。直す案は「AI エージェントの暴走を止める【Claude Agent SDK の maxTurns と maxBudgetUsd】」（60字）で、plan.md の仮タイトルと合わせて直すかはメインエージェントの判断（`judgments.md`） |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。「応答」は Claude の出力1回（166行目で定義し、`message.id` で数える。237行目）、「ターン」は SDK の数え方の単位で、応答1回とそのツールの実行（166行目）。「上限」は `maxTurns` と `maxBudgetUsd` の値、「見積もり」は `total_cost_usd`、「プランの利用枠」で通した。`result` はメッセージの種類、`result` の欄（71行目）はフィールドとして書き分けた。製品名は Node.js、TypeScript、npm、Claude Code、Claude Console の公式表記。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。上限の値（1、2、3、10、0.0005、0.0008、0.0021）、応答の回数（3回、4回）、`num_turns` の値（5、上限より1多い）、約30%、0.00105244 ドル、約0.0044ドル、Node.js 18.14 以上と 22.18.0、0.10 ドルと 0.50 ドル、100万トークンと10万トークン。「数回動かし」（450行目）は、記事で示した回数（3回と1回、299行目）を受けた確認項目。「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（PAT。途中の版の「アプリやサービス」は「アプリかサービス」に直した）。AND は「Glob と Read の2つ」（232行目）、「`subtype` と `errors`」（71行目）、「接続の失敗と、プロセスの失敗」（432行目）、「次の4つをすべて」（448行目）。OR は「`error_max_turns` か `error_max_budget_usd`」（表）、「アプリかサービス」（92行目）、「再開しますか。それとも…」（434行目） |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。`—`、`─`、`―` 0件（PAT）、writing-lint B-5 0回 |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`：`、`／` は0件（PAT）。コードの出力の `subtype: …` などは半角コロンで、コードブロックの中 |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/ai-agent-max-turns-budget-limit.md > logs/ai-agent-max-turns-budget-limit/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、474行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。最後の版は warn 0件。途中の版の warn 1件（②「ここでは」）は use と判断して直した。writing-lint の SHOULD、WATCH、INFO も0件。lint が拾わない語（「止まる」「投げる」「逃がす」「後始末」）は guides/04 と guides/08 に照らして判断し、`judgments.md` に書いた |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。最後の版は FATAL、warn、mention がすべて0件。途中の版の warn 1件は use と判断した（`judgments.md`） |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。悪いコードの見本 `no-catch.ts` は、本文で「囲まないとどうなるか」（392行目）と明示し、コードの中のコメント（398行目）にも `try/catch` を付けないことを書いた。直後に実行結果（413〜430行目）と直し方（432行目、`runAgent` の `catch`）を置いた |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/05.log`（応答4回）と `run/12.log`（同じ依頼が3回とも応答3回）から、同じ依頼でも応答の数が変わるので、上限は成功時の数ちょうどにしないと判断した（299〜301行目）。`run/05.log` と `run/12.log`（どちらも `num_turns` 5）、`run/04.log` と `08.log`（上限より1多い）から、`num_turns` を応答の数として読まず `message.id` で数えると決めた（303行目）。`run/06.log` と `07.log`（上限を超えて止まる）と `run/13.log`（0.0021 で成功）から、上限は払ってもよい額から応答1回分を引いた値にすると判断した（341、362、386行目）。`run/08.log` と `09.log`（終了コード 1、「ループのあとの行」が出ない）から、`for await` を `try` で囲むことを確認項目に入れた（452行目）。`run/04.log`（ファイルを3つ読んでも回答の前で止まる）から、上限に最後の回答の1回を足すことを見出しにした（164行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（`run/01.log`〜`09.log`、`13.log`、G04）。補助の確認は `run/10.log`（SDK の版と標準エラーの大きさ）、`run/11.log`（型）、`run/12.log`（`maxTurns: 3` を3回）。モデルを呼ぶ実行は、オーナーの Claude プランで行った（`apiKeySource none`） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 434行目「上限で止まった作業を、上限を上げて再開しますか。それとも、そこで打ち切って人に結果を返しますか。」の1か所。答えは書いていない |

## 集計

- A: OK 7 / NG 3（G03、G07、G10）（全10項目）
- B: OK 37 / NG 1（C25） / 任意・あり 1（全39項目）

## 結論

G03（C25）、G07、G10 が NG なので、`status: draft` のまま止める。

- G10: `keywords/` に CSV が届いていない（CSV 待ち）。`target_query` は null で、値は作っていない。
- G07: 前後と関連のリンク先（`claude-agent-sdk-first-agent`、`ai-agent-safe-file-tool`、`ai-agent-tool-use-loop-typescript`）が、どれも公開も予約もされていない。最後の1本は原稿も無い。
- C25（G03）: タイトルが63字。タイトルは指示と plan.md のままにしてあり、直す案（60字）は `judgments.md` に書いた。

EmDash への投稿と git のコミットはしていない（執筆するエージェントの担当外）。
