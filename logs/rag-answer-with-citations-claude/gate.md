# gate: rag-answer-with-citations-claude

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


判定日: 2026-11-11。原稿: `content/articles/rag-answer-with-citations-claude.md`（474行。行番号はすべて 2026-11-14 に数え直した今の版）。2026-11-11 の直し（利用条件の注意書きの節と旧出典6を削除、`ask.ts` に `strictMcpConfig: true`、`run/19.log`〜`35.log` で再実行）のあとで判定し直し、行番号も数え直した。

## 判定の前に読んだもの

2026-11-11 に、次を Read ツールで読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行、全文。cat で表示）
- 全文を読んだもの: `guides/01-seo-for-dev-blogs.md`、`02-article-structures.md`、`03-anti-ai.md`、`04-collocation.md`、`05-technical-writing.md`、`09-ai-writing-manual.md`
- 一部を読んだもの: `guides/08-ai-buntai-ruleset.md` の 110〜214行（Part B の B-1〜B-10 と「密度基準総表」。G02 の DENSITY の上限の正本に当たる部分）、`guides/06-rewriting-prompts.md` の「使い方の流れ」（181〜186行。C37〜C39 で引く 4）
- `.claude/skills/write-article/SKILL.md`（Read で全文）、`content/plan.md`（Read で全文）、`keywords/README.md`（cat で表示）、`CLAUDE.md`（セッションの指示として読んだ）

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。lint のスクリプトのソースは読んでいない。出力の読み方はスキル手順7の表に従った。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜47行目）に出た `📎mention` も0件。`judgments.md` に記録 |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY は全カウンタが上限内（B-3 切り詰め 1/2 のほかは0）。SHOULD 0、INFO 0、WATCH の節なし。`judgments.md` に B-3 の1件の判断を記録 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Messages API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格。Agent SDK や `claude -p` の記事は、オーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 記事のコードは Agent SDK の `query()` だけでモデルを呼び、Messages API（`@anthropic-ai/sdk`）を呼ばない（`needs_api_key: false`、43行目）。スキルの「Claude プランで動かす記事」に従い、オーナー自身の Claude プランでログイン済みの環境で `code/extra/run-all.sh` を実行し（2026-11-11 11:05〜11:06 UTC、`run/01.log`〜`18.log`）、`ask.ts` の `options` に `strictMcpConfig: true` を足したあと `code/extra/rerun-strict.sh` で取り直した（2026-11-12 01:02 UTC、手元の日付は 2026-11-11、`run/19.log`〜`35.log`）。オプション名は同じ版の `sdk.d.ts` の `strictMcpConfig?: boolean` で確かめた。35件すべて `exit=0`（`lint/check-code-and-outputs.txt`）。モデルを呼んだ再実行の10件（24、25、27〜34）はすべて `apiKeySource: none`、`ANTHROPIC_API_KEY: unset`。記事のコードブロック18個は `code/` のファイルと run ログの出力に1文字も違わない（`lint/check-code-and-outputs.txt` の「ALL OK」）。#11 から写した3ファイルは `logs/rag-bm25-search-typescript/code/` と同一（同ファイル）。`run/` には Agent SDK 0.3.322 と同梱の Claude Code 2.1.322 の版が出ている。型は `tsc` 7.0.2 で確認（`run/35.log`、`tsc_exit=0`） |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 458〜472行目に出典の表（9件、題名、URL、確認日 2026-11-11）。断定した文は（出典n）で表を引く（61〜63、65、75、99、225、259、341〜343、345、353、355、384、386、443行目）。出典を付けていない断定は実行ログを根拠にしたもので、`sources.md` の「実行ログを根拠にした文」に行と根拠を列挙した。本文の（出典n）の番号と表の行が1〜9で過不足なく対応することをスクリプトで確かめた。料金は 441〜445行目（プランの利用枠から引かれること、`total_cost_usd` は見積もりで請求額ではないこと、モデルを呼ばない処理は利用枠を使わないこと）と 62行目（Pro は月払いで月20ドル）。スキルの「Claude プランで動かす記事」の3に合わせた。frontmatter の `cost_estimate`（9行目）は本文と同じ内容。`run_environment`（10行目）は `run/` のヘッダー（`node: v22.23.4 / npm: 10.9.9 / os: Darwin arm64`、`claude-agent-sdk: 0.3.322 / bundled Claude Code: 2.1.322`）と `run/35.log` の `Version 7.0.2` と一致。`verified_at`（11行目）は `2026-11-11` で、最後の再実行（`run/35.log`。ヘッダーは UTC で 2026-11-12、実行した手元の `date +%F` は 2026-11-11）の日付、474行目の日付と一致 |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | guides/01 §1「検索意図」を読んで判定。`selection.md` の表に、2026-11-11 の時点の全記事と重なりの判定を書いた。#11 の検索器は1文字も変えずに使い、検索の説明は 101行目でリンクに任せた。`outputFormat` の説明は 345行目で #6 に任せた（`content/plan.md` の「重なりを避けるために決めたこと」の #27 と同じ扱い）。#17 のメッセージの読み分けは繰り返していない（`apiKeySource` と `tools` を1行で表示するだけ） |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | OK | 2026-11-14 に #31 で判定し直した。公開の順（`content/plan.md` の「公開の順番」）で14番。本文の内部リンクは4件で、リンク先はすべて自分より前の順番: 345行目 `/posts/claude-agent-sdk-structured-output`（6番）、55行目と101行目 `/posts/rag-bm25-search-typescript`（11番）、55行目 `/posts/rag-local-embeddings-transformers-js`（13番）。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。frontmatter は `prev: rag-local-embeddings-transformers-js`、`next: rag-hybrid-search-rrf` のまま。次の記事への本文リンクは外した。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 474行目「AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。」。日付は記事に写した実行（`run/02.log`、`06.log`、`22.log`〜`26.log`）と最後の実行（`run/35.log`）を手元で動かした日付 2026-11-11 と同じ（`run/19.log` 以降のヘッダーは UTC で 2026-11-12） |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/rag-answer-with-citations-claude/` の全57ファイルに、`sk-ant`、`password`、`secret`、`/Users/`、`/private/`、`tmp/claude`、`session_id`、メールアドレスの形、UUID の形を正規表現でかけた。当たったのは FAQ の文書の ID `"password"`（原稿 178行目と `code/docs.ts`）だけ。`token` は `tokenize.ts` の変数名と、`sources.md` に写した環境変数の名前 `ANTHROPIC_AUTH_TOKEN` だけ。値としての API キーやトークンは0件。コードは init の `session_id` と `cwd` を表示しない。作業フォルダのパスは `<work>`、型の確認用のフォルダは `<tc>`、ホームは `~/` に置き換えて保存した。個人名: git のコミット作者名とメールアドレスを語に分けたもの（Claude と noreply を除く）と、ユーザーの名前（漢字の姓・名、英字の姓・名）、ユーザーの GitHub アカウント名の10語を、大文字小文字を区別せずに原稿とログの全ファイルにかけた。当たったのはメールのドメインの1語（`anthropic.com`。出典の URL とパッケージ名に出る）だけで、人名に当たる語は0件（語そのものはここに書かない） |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-rag.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1 を読んで判定。`brief.md` の「C01 の1行」（BM25 などで検索を作った TypeScript の開発者が、出典つきで答えさせる方法を探したときに、番号を付けた資料と JSON の出典と、その検証の手順を答える） |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」を読んで判定。2行目のタイトルは「RAG」を先頭に置き、「出典つきで回答させる」と道具（Claude Agent SDK）、やること（出典の番号を検証する）を書いている。「徹底解説」「完全ガイド」は0件（`lint/prose-check.txt` の PAT） |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文（導入）が最重要」を読んで判定。49行目の3文で、資料に番号を振って渡す、番号と引用文を JSON で返させる、渡した資料と突き合わせてコードで確かめる、を言い切っている。51行目でプランで API キーなしに動くこと、53行目で実測の結果（10回とも検証 OK）を続けた |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表と guides/02 タイプ1を読んで判定。やり方 → チュートリアル。前提（57行目）、セットアップ（79行目）、実装（189、259行目）、動作確認（359、390、414、428行目）、まとめと次（443、449行目）の順で、各手順にコードと実行結果を組にした |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02「どのタイプでも共通の原則」1を読んで判定。49〜53行目で、やり方の答えと実測の結果を先に書き、前提と手順はそのあと |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通原則2を読んで判定。H2 は「動かすのに要る…」「SDK を入れて…」「verify.ts は…」「ask.ts は…」「答えのある質問では…」「答えが資料に無い質問では…」「資料が1件も見つからない質問は…」「5回ずつ動かすと…」「料金は…」「確認すること」「出典」で、1見出しに1つの話題 |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通原則4と guides/03 症状②を読んで判定。見出しは「verify.ts は、出典の番号と引用文を渡した資料と突き合わせる」「答えが資料に無い質問では、answerable が false になる」のように、結果か中身を言う形。「まず〜する」型の見出しは無い |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1「チュートリアルの肝」と guides/01 §4 を読んで判定。#11 から使う3ファイル（`tokenize.ts`、`bm25.ts`、`docs.ts`）も省かずに載せた（105〜185行目）。インストールのコマンドと出力、各コードの import、実行のコマンドと出力を載せ、`lint/check-code-and-outputs.txt` で18ブロックが `code/` と `run/` に1文字も違わないことを確かめた |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1を読んで判定。189行目「モデルが返した出典は、そのまま信じずにコードで確かめます」が記事の態度。410行目で自分のコードの限界（回答の文の中身までは確かめられない）を書き、送料の質問は 408行目で「550円と答えてしまいそうな並び」として力を入れた。インストールの節（79〜187行目）は短い説明で流した |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2を読んで判定。各 H2 の言い切り: 59、79、189、259、384、410、428、439、445、451行目。出典の節は 458行目 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①を読んで判定。「でしょう」「かもしれ」「可能性があります」は0件（`lint/prose-check.txt` の PAT） |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②を読んで判定。「解説します」「紹介します」「見ていき」「ここでは」は0件（`lint/prose-check.txt`）。writing-lint の B-6 メタ談話予告も0回 |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫を読んで判定。「ここから」「ここまで」「次は」「まとめ」「整理」は0件（`lint/prose-check.txt`）。途中の版の「次は、どの資料にも…」は 390行目「どの資料にも答えが書かれていない質問を投げます。」に直した。次の記事への案内は本文に0件（`next` への本文リンクは外した。G07） |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬を読んで判定。「地図」「仕様書」「設計書」「レシピ」は0件（`lint/prose-check.txt`）。ai-smell-lint の検出も0件 |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧を読んで判定。「ではなく」「ではありません」「じゃない」は0件（`lint/prose-check.txt`）。writing-lint の B-1 対比構文も0回 |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4と原因⑦を読んで判定。地の文91文で、最短7字、最長60字、20字以下が14文、41〜60字が29文（`lint/prose-check.txt`）。1文だけの段落（390、414、439行目）も挟んだ |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03「語尾の反復チェック」を読んで判定。末尾3字の3連続は0件（`lint/prose-check.txt`）。2字の「ます」の3連続（参考）6組は、3字では別の語尾で、判断は `judgments.md` |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮を読んで判定。地の文の短い文（「検証も OK です。」408行目、「1文字も変えていません。」101行目）は、どれも前の文と主語がつながっている。主語も目的語も無い命令形や体言止めの連続は無い。目で全文を読んで確かめた |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮と guides/05 §7「文体の統一」を読んで判定。地の文でですます以外の文末と出た2件（359、414行目）は、鉤括弧の中の「？」で区切られたもので、文全体の文末は「選びます。」「質問です。」（`judgments.md`）。箇条書きの体言止め（193〜195、351〜353、453〜456行目）は guides/05 §7 の例外。writing-lint の B-10 文体混在も検出なし |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」を読んで判定。「問題として返す」（189、255行目）、「問題として数えます」（223行目）。「課題」「エラー」「目標」「効果」は地の文で使っていない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」を読んで判定。「API キーが優先されます」（65行目）、「検証されている」（355行目）。どれも助詞と自他が合っている |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」を読んで判定。形容詞は「スコアの高い順」（118行目）、「最新版」（99行目）程度で、名詞との組み合わせに崩れは無い |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」を読んで判定。「まず最初」は0件（`lint/prose-check.txt`）。「約」は使っていない。英単語と和訳の重複も無い |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」を読んで判定。「〜を作る」「〜を持つ」の直訳の形は無い。「回答を手で作って」（227行目）は実体のある物を作る用法 |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」を読んで判定。地の文、見出し、表のセル、箇条書き、frontmatter の title と description を書かれたとおりの字数で数え、60字超は0件（最長60字。`lint/prose-check.txt`）。除外はコードブロックの中身と URL だけの表のセルだけ。途中の版の11件は分けて直した。2026-11-11 の再実行で 410行目が66字になったので、2文に分けた |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」を読んで判定。モデルに渡す文書は「資料」、モデルが返す根拠は「出典」、根拠の文は「引用文」、資料の通し番号は「番号」で通した。「チャンク」はコードの `chunk` にだけ使った |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」を読んで判定。回数（5回ずつ、10回）、下限（0.1）、見積もりの範囲（0.00009305〜0.0007195）、版（22.18.0、22.23.4、0.3.322）、料金（月20ドル）を数値で書いた。「幾つか」「早めに」の形は無い |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」を読んで判定。「AやB」の形は0件（`lint/prose-check.txt` の「や（並列候補）」）。条件の箇条書きには「次のどれかに当たったとき」（189行目）、「すべてそろっているか」（347行目）、「次の4つをすべて」（449行目）と、OR か AND かを書いた |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7「文体の統一」を読んで判定。C19 と同じ根拠 |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03「記号NG」を読んで判定。`**` は0件（`lint/prose-check.txt`） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03「記号NG」を読んで判定。`—`、`─`、`―` は0件（`lint/prose-check.txt`）。writing-lint の B-5 ダッシュも0回 |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03「記号NG」を読んで判定。全角コロン `：` と全角スラッシュ `／` はどちらも0件（`lint/prose-check.txt`） |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | guides/03「lint との関係」を読んで判定。スキル手順7のコマンドで実行。`lint/ai-smell.txt` 5行目 `✅ 致命なし`、10行目 `exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。warn は0件。writing-lint の B-3 の1件と prose-check の検出は `judgments.md` で1件ずつ判断した |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。`lint/ai-smell.txt` 4行目 `use 0件 / 📎mention 0件`。frontmatter の行の mention も0件（`judgments.md`） |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」を読んで判定。本文に悪い例の引用は無い（`judgments.md`）。手で作った誤った回答の見本（227〜255行目）は文体の悪い例ではなく、検証の動きを見せるデータで、227行目で「手で作って」「モデルが出した回答とは別物」と明示した |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 の5つの不在と guides/06「使い方の流れ」4を読んで判定。動作確認: 384、386行目（`tools: []` でも `StructuredOutput` が一覧に残った。`run/24.log`）、408行目（550円の資料が並んでも答えられないを選んだ。`run/25.log`）、428〜437行目（5回ずつ動かした集計。`run/24.log`、`25.log`、`27.log`〜`34.log`）。判断: 410行目（`answer` の最後の一文は資料に無いのに検証を素通りする。このコードの限界）、437行目（5回では誤った出典の割合までは測れない）、424行目（資料が0件ならモデルを呼ばない） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | G04 と同じ。`run/01.log`〜`35.log`（記事の出力は `run/02.log`、`06.log`、`22.log`、`24.log`〜`26.log`）、`lint/check-code-and-outputs.txt` の「ALL OK」 |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | guides/03 不在5を読んで判定。439行目「あなたのアプリでは、出典の検証を通らなかった回答を、利用者に見せますか。」の1箇所 |

## 結論

G07（リンク先が公開も予約もされていない）が NG、G11 は点検待ちなので、`status: draft` のまま止める。G07 は公開の順番で解消する。ほかは全項目 OK（G10 は 32 行目のとおり OK）。
