# gate: rag-hybrid-search-rrf

判定日: 2026-10-31。原稿: `content/articles/rag-hybrid-search-rrf.md`（509行。行番号はすべてこの版）。

## 判定の前に読んだもの

2026-10-31 に、次を Read ツールで全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）
- `guides/06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `keywords/README.md`（35行）

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行（`title`、`description`、`sources` の `title`）で出た `📎mention` は use として扱い、FATAL に当たる種類なら不合格（手順7の「frontmatter の扱い」）。warn は1件ずつ判断し、use か mention かを記録した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」「lint との関係」を読んで判定。`lint/ai-smell.txt` 2行目 `✅ クリーン`、3行目 `use 0件 / 📎mention 0件`、4行目 `✅ 致命なし`、末尾 `exit=0`。frontmatter（1〜62行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行が `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD n` の形で、FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH（出たときだけ）、INFO(要人間確認) は1件ずつ判断を記録した。この FATAL 0 では個人名を検出できない（`PERSONAL_NAMES` が空）ので、個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `509行/223文`、判定行 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、末尾 `exit=0`。DENSITY は10カウンタすべて0回で、上限は guides/08 の標準レジスターと一致。WATCH 節なし、SHOULD 0件、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（ALL OK）: 記事のコード8つ（`package.json`、`tokenize.ts`、`bm25.ts`、`docs.ts`、`embed.ts`、`vector-search.ts`、`rrf.ts`、`hybrid.ts`）が `code/` と1文字も違わず、記事の ts と json のコードブロックはすべて `code/` のどれかと一致。記事のコマンド8つがログのコマンドと同じで、記事の実行結果7つが `run/` から機械的に取り出したものと一致。実行は `run/01.log`〜`13.log`（2026-10-31 14:04:56〜14:05:43 UTC、node v22.22.0、npm 10.9.4、記事の手順の順、すべて exit 0）。一致した語の確認は `run/14.log`、型は `run/15.log`（skipLibCheck なし、`node_modules` の型定義の12件で `tsc_exit=1`、記事のファイルは0件）と `run/16.log`（skipLibCheck あり、`tsc_exit=0`）、ネットワークの無い環境での再実行は `run/17.log`（7コマンドとも exit=0、外への fetch は `EAI_AGAIN`）。LLM の API は呼ばない（`needs_api_key: false`、58行目） |
| G05 | 断定した事実すべてに一次情報の出典（URL とアクセス日）があり、それが本文に出ている。料金の目安がある。frontmatter の `cost_estimate`、`run_environment`、`verified_at` が埋まっていて、`run_environment` と `verified_at` が `run/` のログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 488〜507行目に出典の表（14件、題名、URL、確認日 2026-10-31）。断定した文は（出典n）で表を引く（`sources.md` に文ごとの対応。実行ログと計算を根拠にした文は後半の表）。料金は 469〜475行目で、記事の手順は無料（API を呼ばない、トークン無しでモデルをダウンロード `run/18.log`、ダウンロード後はネットワーク無しで動く `run/17.log`）、要るのはネットワークとディスク（745MB と 130MB、`run/04`、`07.log`）、検索結果を Claude に渡すと料金がかかり、Haiku 5.5 は 100万トークンあたり入力 $0.10、出力 $0.50（10万トークン以下、出典14）。Claude に渡す処理は実行していないので「無料」とは書いていない。frontmatter 9〜11行目: `cost_estimate`、`run_environment`（Node.js 22.22.0、npm 10.9.4 は `run/*.log` の見出し、@huggingface/transformers 4.3.2 は `code/package.json`、モデルと q8 は `code/embed.ts`、TypeScript 7.0.2 は `run/16.log`）、`verified_at: "2026-10-31"`（最後の実行 `run/19.log` の日付） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（8本、`selection.md` に列挙）。RAG の記事は `rag-bm25-search-typescript`（BM25 だけの検索の作り方）と `rag-chunking-japanese-text`（チャンク分け）で、2つの検索の結果を合わせる方法に答える記事は無い。BM25 の式と埋め込みの手順は繰り返さず、リンクにした（132、224行目） |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 72行目 `/posts/rag-answer-with-citations-claude`（frontmatter 12行目 `prev`）。次: 486行目 `/posts/ai-agent-tool-use-loop-typescript`（13行目 `next`）。どちらも `content/plan.md` の並び（#14、#16）による計画上の slug で、パスは既存の原稿と同じ `/posts/<slug>` にした。関連記事: 132行目 `/posts/rag-bm25-search-typescript`（plan #11）、224行目 `/posts/rag-local-embeddings-transformers-js`（plan #13）。4本とも公開も予約もされていない（#11 は `status: draft`、#13 と #14 と #16 は `content/articles/` に原稿が無い）。#14 は API キーが要る記事（plan の「キー不要」が ×）で、キーが入るまで公開されない。今この記事を公開すると4本ともリンク切れになる。既存の原稿8本はどれも `status: draft`（`publish_at: null`）で、公開済みか予約済みの記事は0本。リンク先の slug: `rag-answer-with-citations-claude`、`ai-agent-tool-use-loop-typescript`、`rag-bm25-search-typescript`、`rag-local-embeddings-transformers-js` |
| G08 | 本文の最後の段落が「AI 支援で執筆」を含む決まった表記になっている | 原稿の末尾 | OK | 509行目「AI 支援で執筆しました。コードは 2026-10-31 に実際に実行して確認しています。」。日付は最後の実行（`run/19.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/rag-hybrid-search-rrf/` 全体（この gate.md を書く前）に `ANTHROPIC`、`sk-ant`、`token`、`password`、`secret`、`api_key`、`apikey`、`hf_`、`Bearer`、`/root`、`/home/user`、`tmp/claude`、`scratchpad` を大文字小文字を区別せず Python でかけた。該当は、出典の URL のドメイン `anthropic.com`、`selection.md` の環境変数の名前と `unset` の記録、関数名 `tokenize`、FAQ の id `password`、frontmatter の `needs_api_key`、`env-check.sh` と `run/18.log` の環境変数の名前（`HF_TOKEN unset` など、値は出していない）、`code/README.md` の作業場所の説明（scratchpad の語だけでパスは無い）。値としての API キーやトークンは0件（コードはキーを使わない）。ログの作業フォルダのパスは `run.sh` が `/path/to` に置き換えた（`/root`、`/home/user`、`tmp/claude` は0件）。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分、名前の各語とメールのローカル部と数字の ID）、ユーザーのメールアドレスのローカル部、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）を1語ずつかけ、すべて0件。出典1の論文の著者名も原稿の地の文と表には書いていない（著者の姓は、出典1の URL のドメイン `cormack.uwaterloo.ca` にだけ出る） |
| G10 | `target_query` が `keywords/*.csv` のどれかの行のキーワードと1文字も違わない。CSV が無いとき、null のとき、CSV に無い値のときは不合格（「CSV 待ち」） | `selection.md` | NG | `keywords/` に CSV が無い（README.md だけ）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（BM25 とベクトル検索をそれぞれ作り、結果の合わせ方で手が止まった TypeScript の開発者が、RRF でハイブリッド検索を作る方法を検索したときに答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」。2行目「BM25 とベクトル検索を RRF で合わせるハイブリッド検索【TypeScript】」。「BM25」「ベクトル検索」「RRF」「ハイブリッド検索」「TypeScript」を含み、やることが具体。タイトルはワークフローの指示で与えられたもの。講座のメインキーワード「RAG」はタイトルに無く、`tags` の1つ目と `main_keyword` に入れた。「徹底解説」「完全ガイド」は0件 |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」。64行目の3文で、答え（スコアを足さずに順位で合わせる）、方法（文書ごとに `1 / (60 + 順位)` を足す）、規模（15行のファイル1つ）を示し、66〜68行目で用語の定義と載せる結果（正しい文書が1位になる質問と、上位3件から消える質問）を示した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアルか解説。guides/02 タイプ1 を原本で読み、要素ごとに照合した（`brief.md` の表）。リード（64〜72行目）→ 結論と式（74行目）→ 前提（98行目）→ 手順（130、222、270、296行目、各コードと実行結果）→ ハマりどころ（367、393、435行目）→ 料金（469行目）→ 確認と次の記事（477、486行目） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード（64行目）の1文目が答え。最初の H2（74行目）は見出し自体が RRF のやること（順位の逆数を足して並べ直す）で、式、k=60 の理由、順位ごとの点数の表が続く。手順の詳細はその後 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 74（RRF の式）、98（準備）、130（BM25）、222（ベクトル検索）、270（RRF の関数）、296（合わせて上位3件を出す）、367（同点）、393（片方だけが当てた文書）、435（BM25 の下限）、469（料金）、477（確認）、488（出典）。H3 は無い |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「片方の検索だけが当てた文書は上位3件から消える」「BM25 の下限を外すと助詞だけの一致が1位になる」「RRF の関数は文書の ID と順位しか見ない」。「まず〜する」型は0件。98行目「使うバージョンと準備」、469行目「料金がかからない範囲」は中身を名詞で示す見出し |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1 の肝、guides/01 §4。8ファイルを import から全文掲載し、ファイル名（149、197、241、266、292、329行目ほか）、作業フォルダ（104〜109行目）、前提（102行目 Node.js 22.18.0 以上、出典9）、依存とインストール（100、111〜128行目）を示した。各コマンドの出力は `run/06`、`08`〜`13.log` から写した（G04） |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。合わせた結果が悪くなる例を独立した H2 に3つ（367、393、435行目）置き、実際の出力と計算で見せた。判断の文（433行目「この記事では `k` を60のままにします。手を入れるべきなのは…BM25 の順位表に入れてしまう側です」、467行目「弱い一致を順位表から外せるのは、合わせる前の BM25 の側だけです」）。料金と準備の節は短く、合わせた結果の節を長くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。74: 「どちらか一方の1位よりも、両方の中位が上に来やすい計算です」、98: 「依存パッケージは…1つです」、130: 「質問と1語も一致しない文書は、BM25 の順位表に載りません」、222: 「内積はコサイン類似度と同じ値です」、270: 「順位にすれば同じ式で足せます」、296: 「BM25 の差がほぼ全部を決めます」、367: 「同点では BM25 の1位が上に来ます」、393: 「この記事では `k` を60のままにします」、435: 「BM25 のスコアの絶対値は、RRF に渡した時点で消えます」、469: 「無料です」、477: 「すべて確かめます」、488: 「どれも 2026-10-31 です」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」は0件（`prose-check.txt` の PAT）。「〜ことがあります」は出典3 の can miss に合わせた365行目と、395行目（実際に起きた例を直後に示す）の2か所 |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件、writing-lint の B-6 0回。「解説します」「見ていきましょう」「紹介します」は0件（目視）。72行目「この記事は、その検索結果を作る側を扱います」はリード内の講座の位置づけで、guides/05 §3 の「冒頭リード文は例外」に当たる |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「次の節」は0件（PAT）。「次の `bm25.ts`」（149行目）「次のとおり」（84行目）「次の4つ」（479行目）は直後の内容を指す語。486行目「講座は次の記事から…」はスキルが求める講座の前後リンク |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件。比喩は使っていない。途中の版の「要」「負ける」は具体の書き方に直した（`judgments.md`）。「雑音」は検索の用語として、助詞だけで一致した結果を指す語として使った |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではな」「じゃな」「ではありません」0件 |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。`prose-check.txt` で地の文と frontmatter の文長が13〜60字、20字以下12文、41〜60字76文。例 104行目「作業フォルダを作って移動します。」、383行目「答えは `error-e1021` です。」の短文の前後に長い説明が続く |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と語尾の反復チェック。`prose-check.txt` の SAME3 0（途中の版の2か所を直した、`judgments.md`） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「`Array.prototype.sort` は、ECMAScript 2019 から安定ソートです（出典12）。安定ソートでは、同じ値の要素が元の順を保ちます（出典12）。」（389行目）のように主語を残した |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文の文末を Python で調べ、ですます以外は0件（`judgments.md` の「文末の調査」）。表のセルと箇条書きの「〜か」は guides/05 §7 の例外 |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」「効果」は0件。「エラー」は「エラーコード」（199、365、385行目）の形だけで、動詞を取らない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「保存します」「実行します」「一致し」「正規化します」「学習されています」「指定すると」。「ファイルを…保存します」「ベクトルを正規化します」は他動詞に を、「3語が一致し」は自動詞に が で、取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「大きく」（`idf` が、413行目）「大きくなります」（1位の重みが、417行目）「弱い一致」（467行目）程度で、表の誤用なし（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」なし。「約」「程度」は0件。近似は「≈」と「0.001 ほど」「0.03前後」で書き、重ねていない |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし（目視）。「検索結果を作る側」（72行目）は実際に検索結果の配列を作る処理を指す |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」。`prose-check.txt` で60字超 0（最長60字）。途中の版の21文を分けた（`judgments.md`）。インラインコード、Markdown のリンク（URL を含む）、（出典n）も1字ずつ数え、見出し、表のセル、箇条書き、frontmatter の文字列も数えた。除外はコードブロックと URL だけのセル（件数は `prose-check.txt` 2行目） |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。「語」（134行目で `Intl.Segmenter` の区切りを語と呼ぶと定義）、「スコア」（各検索の値）と「点数」（RRF で合わせた値）を分けて統一、「順位表」、「文書」（「ドキュメント」は Elasticsearch のドキュメントを指す96行目だけ）、「作業フォルダ」（「ディレクトリ」0件）、「バージョン」（「版」0件）、「ハイブリッド検索」（66行目で定義）。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。10件、15行、46秒、25秒、745MB、130MB、4秒、2.5〜3.2秒、60、0.01639、0.03252、0.001、0.03、384次元、12層、5件、0.1、0.673、10件中4件、7つ、`$0.10`、`$0.50`、10万トークン、100万トークン。「数個」「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（`prose-check.txt` の YA 1件は「やすい」の一部）。OR は「識別子か技術用語」（365行目）、AND は「BM25 のスコアもコサイン類似度も」（294行目）、箇条書きは「次の4つをすべて」（479行目） |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。`prose-check.txt` の PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。`—`、`─`、`―` 0件（PAT）、writing-lint B-5 0回 |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`： `、`：`、`／` は0件（PAT）。コードブロック内の出力 `BM25  :` は対象外 |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/rag-hybrid-search-rrf.md > logs/rag-hybrid-search-rrf/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、509行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。warn 0件で判断の対象なし（`lint/judgments.md`） |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。FATAL、warn、mention がすべて0件で、区別が要る検出なし |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。うまくいかない検索の例（「E1021 が出た」「届くのが遅い」「返金はいつ？ 0」）は、見出しでどう悪くなるかを明示し（367、393、435行目）、直後に原因（一致した語、計算）と対処（下限を自分のデータで決める、同点の扱いを決める）を置いた |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/06`、`08.log`（ベクトル検索の1位の誤りを BM25 の1位が正した）から、識別子を含む質問で合わせる意味があると示した（365行目）。`run/09.log` と `run/14.log`（BM25 が「が」「出」で `error-e1020` を1位にし、同点になった）から、同点で BM25 の順が先に来る実装の挙動を示した（389行目）。`run/10`、`11.log`（`k` を1にすると `delivery` と雑音の `login` が一緒に上がる）から、`k` は60のままにし、BM25 の側を直すべきだと判断した（433行目）。`run/12`、`13.log`（下限を外すと `cancel` が消える）から、下限は合わせる前に置き、自分のデータで決めると判断した（467行目）。手計算で点数を確かめた（387、415行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（`run/01.log`〜`13.log`、G04）。型は `run/15`、`16.log`、ネットワーク無しは `run/17.log`、ベクトルの長さは `run/19.log`。LLM には送っていない（キーが無く、記事も検索結果を作るところまでにした） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 391行目「同点のときに語の一致と意味の近さのどちらを先に置くか、あなたのデータではどちらが当たりますか。」の1か所。同点の節（367行目）はこの問いで閉じている |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）
- 合計: OK 46 / NG 2 / 任意・あり 1（全49項目）

## 結論

G07（前後リンクと関連リンクの先が未公開）と G10（CSV 待ち）に落ちたので、`status: draft` のまま止める。G07 は、リンク先の4本（`rag-answer-with-citations-claude`、`ai-agent-tool-use-loop-typescript`、`rag-bm25-search-typescript`、`rag-local-embeddings-transformers-js`）が公開か、この記事より前に予約されれば通る。前の記事 `rag-answer-with-citations-claude` は API キーが要る記事なので、キーが入るまで公開されない。G10 はラッコキーワードの CSV が届き、`target_query` を CSV の行から選べれば通る。どちらも、この記事の原稿を直しても解消しない。
