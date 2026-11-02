# gate: rag-local-embeddings-transformers-js

判定日: 2026-10-31。原稿: `content/articles/rag-local-embeddings-transformers-js.md`（376行。frontmatter は1〜59行目。行番号はすべてこの版）。

## 判定の前に読んだもの

2026-10-31 に、次を全文読んでから全項目を判定した（長いファイルは Bash の `cat` と Read で全行を読んだ）。

- `docs/tech-writing-pack/checklist.md`
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）
- `guides/06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `keywords/README.md`

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行（`title`、`description`、`sources` の `title`）で出た `📎mention` は use として扱い、FATAL に当たる種類なら不合格（手順7の「frontmatter の扱い」）。warn は1件ずつ判断し、use か mention かを記録した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜59行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行が `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD n` の形で、FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH（出たときだけ）、INFO(要人間確認) は1件ずつ判断を記録した。この FATAL 0 では個人名を検出できない（`PERSONAL_NAMES` が空）ので、個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `376行/179文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY は10カウンタすべて0回で、上限は guides/08 の標準レジスターと一致。WATCH 節なし、SHOULD 0件、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（ALL OK）: 記事のコード6つ（`package.json`、`embed.ts`、`show-vector.ts`、`docs.ts`、`vector-search.ts`、`search.ts`）が `code/` と1文字も違わず、記事のコマンド8ブロックが記事にあり、ログのコマンドと引数が同じで、記事の実行結果6つ（`run/04`、`06`、`07`、`10`、`11`、`12`）がログから機械的に取り出したものと一致。実行は `run/01.log`〜`12.log`（2026-10-31 13:51〜13:52 UTC、node v22.22.0、npm 10.9.4、記事の手順の順）。skip でのインストールは `run/13`〜`16.log`、外へ出ないことは `run/17.log`（`unshare -rn`、`EAI_AGAIN`、4コマンド exit=0）、型は `run/21.log`（tsc 7.0.2、skipLibCheck、`tsc_exit=0`。skipLibCheck なしのエラーは `node_modules` の .d.ts だけ、`run/20.log`）。LLM の API は呼ばない（`needs_api_key: false`、55行目） |
| G05 | 断定した事実すべてに一次情報の出典（URL とアクセス日）があり、それが本文に出ている。料金の目安がある。frontmatter の `cost_estimate`、`run_environment`、`verified_at` が埋まっていて、`run_environment` と `verified_at` が `run/` のログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 356〜374行目に出典の表（13件、題名、URL、確認日 2026-10-31）。断定した文は（出典n）で表を引く（`sources.md` に文ごとの対応。実行ログを根拠にした文は後半の表）。料金は 331〜341行目: 記事の手順は無料（アカウントもトークンも使わずにダウンロード、Hugging Face はログインなしの利用者に IP ごと5分3,000回まで許す、出典12）、埋め込みを API で作ると有料で Voyage AI の voyage-4-lite は100万トークンあたり $0.02、最初の2億トークンは無料（出典13）。Voyage AI は呼んでいないので「実際の金額は確かめていません」と書いた。frontmatter 9〜11行目の `cost_estimate`、`run_environment: "Node.js 22.22.0、@huggingface/transformers 4.3.2、Linux x64"`（`run/*.log` の見出し `node: v22.22.0`、`run/25.log` の `Linux x86_64` と `@huggingface/transformers@4.3.2`）、`verified_at: "2026-10-31"`（最後の実行 `run/25.log` の日付） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（この記事のほか8本、`selection.md` に列挙）。RAG の2本は BM25 の検索とチャンク分割で、埋め込みモデルで文をベクトルにして検索する方法に答える記事は無い |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 73行目 `/posts/rag-chunking-japanese-text`（frontmatter 12行目 `prev`、`content/plan.md` #12）。次: 354行目 `/posts/rag-answer-with-citations-claude`（13行目 `next`、plan.md #14）。関連記事: 81行目と207行目 `/posts/rag-bm25-search-typescript`（plan.md #11、同じ FAQ 8件を使う記事）。パスは既存の原稿と同じ `/posts/<slug>`。`rag-chunking-japanese-text` と `rag-bm25-search-typescript` は原稿があるが `status: draft`、`rag-answer-with-citations-claude` は原稿も無い。どれも公開も予約もされておらず、今この記事を公開すると3本ともリンク切れになる。既存の原稿8本はすべて `status: draft`（`publish_at: null`）で、公開済みか予約済みの記事は0本。リンク先の slug: `rag-chunking-japanese-text`、`rag-answer-with-citations-claude`、`rag-bm25-search-typescript` |
| G08 | 本文の最後の段落が「AI 支援で執筆」を含む決まった表記になっている | 原稿の末尾 | OK | 376行目「AI 支援で執筆しました。コードは 2026-10-31 に実際に実行して確認しています。」。日付は最後の実行（`run/25.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/rag-local-embeddings-transformers-js/` 全体（この gate.md を書く前）に `ANTHROPIC`、`sk-ant`、`hf_`、`HF_TOKEN`、`token`、`password`、`secret`、`api_key`、`/root`、`/home/user`、`tmp/claude`、`scratchpad` を大文字小文字を区別せず Python でかけた。該当は、出典の URL と表の題名の `Anthropic`（337、362行目）、frontmatter の `needs_api_key`（55行目）、FAQ の id `password`（原稿 219、313行目、`code/docs.ts`、`run/12.log`、`run/17.log`）、パッケージ名 `@huggingface/tokenizers` とファイル名 `tokenizer.json`（`run/18.log`、`run/20.log`）。値としての API キーやトークンは0件（コードはキーを使わず、実行環境に `HF_TOKEN` も無い）。ログの作業フォルダのパスは `run.sh` が `/path/to` に置き換え、`/home/user` と scratchpad のパスは0件。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分、名前の各語とメールのローカル部と数字の ID）、ユーザーのメールアドレスのローカル部、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）を1語ずつかけ、すべて0件 |
| G10 | `target_query` が `keywords/*.csv` のどれかの行のキーワードと1文字も違わない。CSV が無いとき、null のとき、CSV に無い値のときは不合格（「CSV 待ち」） | `selection.md` | NG | `keywords/` に CSV が無い（README.md だけ）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（TypeScript の経験があり RAG の検索部分を組んでいる人が、埋め込みを API キーなし・有料サービスなしで手元で作ってベクトル検索する方法を検索したときに答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」。2行目「埋め込みを手元で作ってベクトル検索する【Transformers.js、API キー不要】」。記事の主題の語「埋め込み」「ベクトル検索」を前方に置き、ライブラリ名「Transformers.js」と「API キー不要」で具体にした。タイトルはワークフローの指示で与えられたもの。講座のメインキーワード「RAG」はタイトルに無く、本文の1文目とタグの1つ目に入れた。検索語は CSV が無く未確定なので（G10）、CSV が届いたら選んだ語がタイトルに入っているかを見直す。「徹底解説」「完全ガイド」は0件 |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」。61行目の3文で、解決すること（RAG の埋め込みを手元の Node.js で作れる、API キーが要らない）、使うもの（Transformers.js、multilingual-e5-small）、記事で書く範囲（FAQ 8件と質問をベクトルにして近い順に並べる）を示し、63〜69行目で完成形の出力を見せた |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアルか解説。guides/02 タイプ1 を原本で読み、要素ごとに照合した（`brief.md` の表）。リードと完成形（61〜73行目）→ 前提（85行目）→ 手順（134、205行目、各コードと実行結果）→ ハマりどころ（187、298行目）→ 動作確認（325行目）→ 確認と次の記事（343、354行目） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード（61行目）の1文目が答え（Transformers.js で手元で作れる）。完成形の出力を先に見せ、最初の H2（75行目）は見出し自体が埋め込みの検索のやること。手順の詳細はその後 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 75（埋め込みの検索がやること）、85（準備）、134（1文をベクトルにする）、205（FAQ を検索する）、298（関係のない質問のスコア）、325（ネットワークなし）、331（料金）、343（確認）、356（出典）。H3 は 187（モデルのファイルの保存先）の1つ |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「関係のない質問でも8件すべてに0.78前後のスコアが付く」「2回目からはネットワークが無くても動く」「モデルのファイルは node_modules の中に保存される」。「まず〜する」型は0件。85行目「使うバージョンと準備」、331行目「料金がかからない範囲」は中身を名詞で示す見出し |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1 の肝、guides/01 §4。6ファイルを import から全文掲載し、ファイル名（136、159、207、228、259行目ほか）、作業フォルダ（93〜96行目）、前提（89行目 Node.js 22.18.0 以上、出典11）、依存のインストール（113〜116行目）を示した。各コマンドの出力は `run/04`、`06`、`07`、`10`、`11`、`12` から写した（G04） |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。e5 のスコアが値で使えないことを独立した H2（298行目）にして実際の出力で見せ、下限を置かない判断を書いた（323行目）。判断の文（201行目「ダウンロードを小さくするために、この記事は q8 にしました」、323行目「この記事では下限を置かず、上位3件をそのまま返すことにしました」）。ネットワークと料金の節は短く、検索の節を長くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。75: 「言い換えた文書にもスコアが付きます」、85: 「`node_modules` は 484M でした」と「このダウンロードは止められます」、134: 「質問は384個の数の並びになり、長さは1にそろいました」、187: 「この記事は q8 にしました」、205: 「答えの書かれた `cancel` が2位に入りました」、298: 「上位3件をそのまま返すことにしました」、325: 「検索にネットワークを使いません」、331: 「無料です」、343: 「すべて確かめます」、356: 「どれも 2026-10-31 です」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」は0件（`prose-check.txt` の PAT）。「と読めます」型の推測は途中の版で書かず、1位の `returns` は書いてあること（返金の時期は書いていない）だけを書いた（284行目） |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件、writing-lint の B-6 0回。「解説します」「見ていきましょう」「紹介します」は0件（目視） |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「次の節」は0件（PAT）。「次の `embed.ts`」（136行目）「次の `show-vector.ts`」（159行目）「次のファイル」（207行目）「次の4つ」（345行目）は直後の内容を指す語。354行目「講座の次の記事」はスキルが求める講座の前後リンク。255行目「まとめて」は動作の説明（`judgments.md`） |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件。比喩は使っていない |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではな」「じゃな」「ではありません」0件。319行目「値より順位」は比較で、否定→肯定の構文ではない |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。`prose-check.txt` で地の文と frontmatter の文長が13〜60字、20字以下10文、41〜60字63文。例 91行目「作業フォルダを作って移動します。」、185行目「質問は384個の数の並びになり、長さは1にそろいました。」の短文の前後に長い説明が続く |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と語尾の反復チェック。`prose-check.txt` の SAME3 0（途中の版の箇条書きの「〜いるか」3連続を直した、`judgments.md`） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「Linux x64 では、`onnxruntime-node` が追加のファイルを取ってきます（出典9）。取ってくるのは CUDA 12 用のライブラリで、取得元は NuGet です（出典9）。」（124行目）のように主語を残した |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。`lint/ending-check.txt` で地の文132文すべてがですます調。表のセルと箇条書きの「〜か」は guides/05 §7 の例外 |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。地の文に「課題」「問題」「エラー」「目標」「効果」は0件 |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「対応し」「変換した」「実行します」「保存します」「保存される」「成功し」「指定」「禁止する」「量子化した」。「100の言語に対応し」「モデルのファイルは…保存される」「`.ts` のファイルを…実行します」で取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「大きい」（パッケージが）、「小さく」（ダウンロードを、値の差が）、「低く」（温度のパラメーターを）、「近い」（文書が）で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」なし。「およそ4倍」（201行目）は「程度」と重ねていない。「0.78前後」も「約」と重ねていない |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし（目視）。「埋め込みを作る」「関数を作ります」（228行目）は実際にベクトルとコードを作る技術的な記述で、タイトルの語に合わせた |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」。`prose-check.txt` で60字超 0（最長60字）。途中の版の14文を分けた（`judgments.md`）。インラインコード、Markdown のリンク（URL を含む）、（出典n）も1字ずつ数え、見出し、表のセル、箇条書き、frontmatter の文字列も数えた。除外はコードブロックと URL だけのセル（件数は `prose-check.txt` 2行目） |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。「埋め込み」（「エンベディング」0件）、「ベクトル」（77行目で定義）、「文書」（「ドキュメント」0件）、「質問」、「スコア」、「作業フォルダ」（「ディレクトリ」0件、PAT）、「バージョン」（「版」0件、PAT）、「モデルカード」（157行目で定義。173、319行目はその後）、「接頭辞」は使わず `query: ` と書いた。容量は `du` の表示の単位 M のまま書き、バイトは数字で書いた。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。8件、384次元、100の言語、4.3.2、22.18.0、6つ、46個、745M、484M、272,054,000 バイト、130M、4ファイル、118,308,185 バイト、470,268,533 バイト、4.3秒、2.6秒、0.852、0.832、0.797、0.018、0.04 から 0.06、0.7から1.0、0.01、5分で3,000回、$0.02、2億トークン、512トークン。「数個」「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（`prose-check.txt` の YA 0件）。AND は「アカウントもトークンも」（333行目）「`pooling: "mean"` と `normalize: true`」（348行目）、箇条書きは「次の4つをすべて」（345行目）。OR は「自分のデータでスコアの下限を測りますか。それとも、…答えさせますか。」（352行目） |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。`prose-check.txt` の PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。`—`、`─`、`―` 0件（PAT）、writing-lint B-5 0回 |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`： `、`：`、`／` は0件（PAT）。インラインコードの `query: ` と `passage: ` は半角のコロンでコードの文字列（guides/03 の「コードの中の記号は対象外」） |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/rag-local-embeddings-transformers-js.md > logs/rag-local-embeddings-transformers-js/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、376行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。warn 0件で判断の対象なし（`lint/judgments.md`） |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。FATAL、warn、mention がすべて0件で、区別が要る検出なし |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。うまくいかない使い方の例（関係のない質問「宿題を手伝って」、298〜323行目）は、見出しで何が起きるかを明示し、原因（出典2 の温度 0.01）と対処（値で切らず順位で使う、下限を置かない）を直後に置いた |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/12.log`（関係のない質問でも 0.779〜0.797、差 0.018）と `run/10`、`11.log` から、固定の下限を置かず上位3件を返すと判断した（321〜323行目）。`run/03`、`04`、`22`、`24.log`（745M、CUDA のライブラリ 272,054,000 バイト）と `run/14`〜`16.log`（skip で 484M、結果は同じ）から、GPU を使わないときの入れ方を書いた（122〜132行目）。ファイルの大きさ（出典3）から q8 を選んだ（201行目）。`run/17.log` でネットワークなしでも動くことを確かめた（327行目）。`run/10.log` と BM25 の記事の結果を比べた（284行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（`run/01.log`〜`16.log`、G04）。外へ出ないことは `run/17.log`、型は `run/21.log`。LLM の API は呼んでいない（記事も呼ばない） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 352行目「関係のない質問を見分けるには、自分のデータでスコアの下限を測りますか。それとも、回答を作るモデルに「わかりません」と答えさせますか。」の1か所 |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）
- 合計: OK 46 / NG 2 / 任意・あり 1（全49項目）

## 結論

G07（前後リンクと関連リンクの先が未公開）と G10（CSV 待ち）に落ちたので、`status: draft` のまま止める。G07 は前後の記事（`rag-chunking-japanese-text`、`rag-answer-with-citations-claude`）と関連記事 `rag-bm25-search-typescript` が、この記事より前に公開か予約されれば通る。G10 はラッコキーワードの CSV が届き、`target_query` を CSV の行から選べれば通る。どちらも、この記事の原稿を直しても解消しない。
