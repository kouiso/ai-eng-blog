# gate: rag-retrieval-eval-recall-mrr

判定日: 2026-11-02。原稿: `content/articles/rag-retrieval-eval-recall-mrr.md`（579行。行番号はすべてこの版）。

## 判定の前に読んだもの

2026-11-02 に、次を Read ツールで全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）
- `guides/06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `keywords/README.md`（35行）

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行（`title`、`description`、`sources` の `title`）で出た `📎mention` は use として扱い、FATAL に当たる種類なら不合格（手順7の「frontmatter の扱い」）。warn は1件ずつ判断し、use か mention かを記録した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜53行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行が `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD n` の形で、FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH（出たときだけ）、INFO(要人間確認) は1件ずつ判断を記録した。この FATAL 0 では個人名を検出できない（`PERSONAL_NAMES` が空）ので、個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `579行/203文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY は10カウンタすべて0回で、上限は guides/08 の標準レジスターと一致。途中の版で出た B-2 三連反復の超過2箇所は直した（`lint/judgments.md`）。WATCH 節なし、SHOULD 0件、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格 | `code/`、`run/` | OK | `lint/check-code-and-outputs.txt`（ALL OK）: 記事のコード11個（`package.json`、`metrics.ts`、`check-metrics.ts`、`cases.ts`、`tokenize.ts`、`bm25.ts`、`docs.ts`、`embed.ts`、`vector-search.ts`、`rrf.ts`、`eval.ts`）が `code/` と1文字も違わず、記事のコマンド7つが記事にあり、ログのコマンドと同じで、記事の実行結果5つ（`run/06`、`08`、`18`、`19`、`12.log`）が記事のコードブロックと一致。実行は `run/01.log`〜`12.log`、`18.log`、`19.log`（2026-11-02 15:50〜15:56 UTC、node v22.22.0、npm 10.9.4、記事の手順の順）。ネットワークの無い名前空間での再実行 `run/16.log` の出力もオンラインの実行と同じ。型は `run/14.log`（記事のファイルのエラー0件、`node_modules/@huggingface/` の型定義の12件で `tsc_exit=1`）と `run/15.log`（skipLibCheck で `tsc_exit=0`）。API は呼ばない（`needs_api_key: false`、49行目） |
| G05 | 断定した事実すべてに一次情報の出典（URL とアクセス日）があり、それが本文に出ている。料金の目安がある。frontmatter の `cost_estimate`、`run_environment`、`verified_at` が埋まっていて、`run_environment` と `verified_at` が `run/` のログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 561〜577行目に出典の表（11件、題名、URL、確認日 2026-11-02）。断定した文は（出典n）で表を引く（`sources.md` に文ごとの対応、実行ログと計算を根拠にした文は後半の表）。料金は 538〜544行目で、記事のコードは API を呼ばないので無料、モデルのダウンロードはトークンなしでできた（`run/17.log`）、料金がかかるのは検索結果を Claude に渡して回答させる操作で、Claude Haiku 5.5 は 100万トークンあたり入力 0.10 ドル、出力 0.50 ドル（10万トークン以下のプロンプト、出典11）。Claude に送る操作は実行していないので金額を「無料」とは書いていない。frontmatter 9〜11行目の `cost_estimate`、`run_environment: "Node.js 22.22.0、npm 10.9.4、Linux x86_64。@huggingface/transformers 4.3.2。埋め込みモデルは Xenova/multilingual-e5-small（q8）。型の確認は TypeScript 7.0.2。"`（`run/*.log` の見出し `node: v22.22.0`、`npm: 10.9.4`、`run/20.log` の `Linux x86_64`、`code/package.json` の 4.3.2、`code/embed.ts` の `dtype: "q8"`、`run/14.log` の `Version 7.0.2`）、`verified_at: "2026-11-02"`（最後の実行 `run/21.log` の日付） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（この記事のほか17本、`selection.md` に列挙）。main_keyword「LLM 評価」は `llm-eval-harness-fixtures`（回答を文字列で採点）と `llm-eval-dataset-from-logs`（ログからテストケースを作る）の2本で、検索の結果を Recall@k と MRR で測る方法に答える記事は無い。RAG の3本は検索器を作る記事 |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 61行目 `/posts/llm-as-a-judge-claude`（frontmatter 12行目 `prev`）。次: 559行目 `/posts/promptfoo-llm-eval-intro`（13行目 `next`）。どちらも `content/plan.md` の並び（#27、#29）による計画上の slug で、2本とも `content/articles/` に原稿が無く、公開も予約もされていない。今この記事を公開すると2本ともリンク切れになる。関連記事への内部リンクは4本（203行目 `/posts/rag-bm25-search-typescript`、`/posts/rag-hybrid-search-rrf`、291行目 `/posts/rag-local-embeddings-transformers-js`、557行目 `/posts/llm-eval-harness-fixtures`）を本文に入れたが、既存の原稿17本はどれも `status: draft`、`publish_at: null`（2026-11-02 に全件の frontmatter で確認）で、公開済みか予約済みの記事は0本。リンク先の slug: `llm-as-a-judge-claude`、`promptfoo-llm-eval-intro`、`rag-bm25-search-typescript`、`rag-hybrid-search-rrf`、`rag-local-embeddings-transformers-js`、`llm-eval-harness-fixtures` |
| G08 | 本文の最後の段落が「AI 支援で執筆」を含む決まった表記になっている | 原稿の末尾 | OK | 579行目「AI 支援で執筆しました。コードは 2026-11-02 に実際に実行して確認しています。」。日付は最後の実行（`run/21.log`）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/rag-retrieval-eval-recall-mrr/` 全体（49ファイル、この gate.md を書く前）に `ANTHROPIC`、`sk-ant`、`token`、`password`、`secret`、`api_key`、`hf_`、`/root`、`/home/user`、`tmp/claude`、`scratchpad` を大文字小文字を区別せず Python でかけた。該当は、出典の URL のドメイン `anthropic.com` と本文の「Anthropic」、関数名 `tokenize` とファイル名 `tokenize.ts`、FAQ の id `password`、frontmatter の `needs_api_key`、`node_modules/@huggingface/tokenizers` の型定義のパス（`run/14.log`）、環境変数の名前 `HF_TOKEN`、`HUGGING_FACE_HUB_TOKEN` と `unset` の記録（`run/17.log`、`code/extra/env-check.sh`）。値としての API キーやトークンは0件（コードはキーを使わない）。ログの作業フォルダのパスは `run.sh` が `/path/to` に置き換え、`run/cases-written-at.txt` のパスは相対パスに直した。`code/README.md` の「scratchpad」の語は作業場所の説明で、パスは無い（README は G09 の検索のあとに書いた。書いたあと同じ語で検索し直し、パスが無いことを確かめた）。最後に、この gate.md を含む55ファイルに個人名の語と `/root`、`/home/user`、`tmp/claude`、`sk-ant` をかけ直し、該当はこの行の検索語の列挙だけだった。個人名: git のコミット作者名とメールアドレス（Claude 以外の全員分、名前の各語とメールのローカル部と数字の ID）、ユーザーのメールアドレスのローカル部、ユーザーの GitHub アカウント名、CLAUDE.md の人格設定の人名（漢字の姓・名、英字の姓・名）を1語ずつかけ、すべて0件 |
| G10 | `target_query` が `keywords/*.csv` のどれかの行のキーワードと1文字も違わない。CSV が無いとき、null のとき、CSV に無い値のときは不合格（「CSV 待ち」） | `selection.md` | NG | `keywords/` に CSV が無い（README.md だけ、2026-11-02 に確認）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める |

## B. checklist.md の全項目（原文のまま）

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1。`brief.md` の C01 の1行（TypeScript で RAG の検索を組んでいて、変えたときに良くなったかを数字で確かめたい人が、RAG の検索の評価を Recall@k と MRR で計算する方法を検索したときに答える）。検索語そのものは G10 のとおり未確定 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」。2行目「RAG の検索の良し悪しを数字で測る【Recall@k と MRR を TypeScript で】」。指標の名前2つと言語を入れて具体にした。講座のメインキーワード「LLM 評価」はタイトルに無いが、評価の対象（RAG の検索）と指標名（Recall@k、MRR）を前に置いた。タイトルはワークフローの指示で与えられたもの。検索語は CSV 待ちで、CSV が届いたら選んだ語がタイトルに入っているかを確かめ直す。「徹底解説」「完全ガイド」は0件 |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」。55行目の最初の2文で、解決すること（RAG の検索が良くなったかを2つの数字で判定できる）と、用意するもの（質問と正解の文書の組）を示し、続けて2つの指標の定義を置いた。57行目で、採点する3つの検索器と結果（ベクトル検索が MRR 0.967 で最も高い、差は3問だけ）を示した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 の表でやり方に合うのはチュートリアルか解説。guides/02 タイプ1 を原本で読み、要素ごとに照合した（`brief.md` の表）。リード（55〜61行目）→ 前提（78行目）→ 手順（110、166、201、351行目、各コードと実行結果）→ 動作確認と読み方（448、468、500行目）→ 料金（538行目）→ 確認と関連記事・次の記事（546〜559行目） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02 共通の原則1。リード（55行目）の1文目が答え。最初の H2（63行目）は見出し自体が2つの指標の違い（取りこぼし、最初の正解の順位）で、定義と出典が続く。コードと結果の読み方はその後 |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2。H2 は 63（2つの指標の違い）、78（準備）、110（指標の関数）、166（評価用の質問）、201（3つの検索器のファイル）、351（eval.ts）、448（差がついた3問）、468（k と Recall@k）、500（設定を変えて測り直す）、538（料金）、546（確認）、561（出典）。H3 は無い |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4、guides/03 症状②。例「差がついたのは15問のうち3問だけ」「k を小さくすると Recall@k の差が開く」「評価用の質問は、検索器を動かす前に正解と組にして書く」。「まず〜する」型は0件。78行目「使うバージョンと準備」、546行目「確認すること」は中身を名詞で示す見出し |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1 の肝、guides/01 §4。11ファイルを import から全文掲載した（前の記事と同じ6ファイルも省略せず 201〜349行目に載せた）。作業フォルダ（84〜89行目）、`package.json` と `npm install`（91〜106行目）、前提（82行目 Node.js 22.18.0 以上、出典4）を示した。各コマンドの出力は `run/06`、`08`、`18`、`19`、`12.log` から写した（G04） |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1。平均の差が3問から来ていることを独立した H2（448行目）にし、「この15問の結果だけで、ハイブリッド検索をやめてベクトル検索に切り替えることはしません。」（466行目）と判断を示した。`cases.ts` を検索器を動かす前に書いた理由（197行目）も書き手の判断。料金と準備の節は短く、結果の読み方の節を長くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。63: 「上位 k 件の中での順番は見ません」、78: 「依存パッケージは…1つです」、110: 「どの検索器にも同じ関数が使えます」、166: 「利用者が実際に打った質問から選んでください」、201: 「1文字も違いません」、351: 「上位5件に入らなかった正解は `-` と表示されます」、448: 「切り替えることはしません」、468: 「k は、モデルに渡す件数に合わせて選びます」、500: 「同じ15問で測り直して比べます」、538: 「無料です」、546: 「すべて確かめます」、561: 「どれも 2026-11-02 です」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①。「でしょう」「かもしれ」は0件（`lint/prose-check.txt` の PAT）。「一方で」「とはいえ」「もちろん」も0件（目視） |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②、guides/05 §3。ai-smell-lint の②0件、writing-lint の B-6 0回。「解説します」「見ていきましょう」「紹介します」は0件（目視） |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「次の節」は0件（PAT。途中の版の「次は質問を増やして…」は直した、`lint/judgments.md`）。「次の6ファイル」（203行目）「次の4つ」（548行目）は直後の内容を指す語。559行目「講座の次の記事」はスキルが求める講座の前後リンク |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬の一覧。ai-smell-lint の⑬0件。比喩は使っていない（目視）。「取りこぼし」（63、73行目）は正解の文書が上位 k 件に入らないことを指す和語で、一覧の語に当たらない |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧、guides/08 B-1。writing-lint の B-1 0回、ai-smell-lint の⑧0件、PAT の「ではな」「じゃな」「ではありません」0件。553行目「平均だけでなく1問ずつの順位を見て」は付け足しの「だけでなく」で、否定から肯定へ反転する対比ではない |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4。`lint/prose-check.txt` で地の文と frontmatter の文長が13〜60字、20字以下8文、41〜60字81文。例 84行目「作業フォルダを作って移動します。」、193行目「このファイルを `cases.ts` として保存します。」の短文の前後に長い説明が続く |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03 症状⑥と語尾の反復チェック。`lint/prose-check.txt` の SAME3 0、writing-lint の B-2 三連反復も最後の版で0（途中の版の2箇所は直した） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮（目視）。地の文を読み、主語か目的語が抜けて意味が取れない文が無いことを確かめた。60字に収めるために分けた文も「ハイブリッド検索の Recall@3 は、1.000 から 0.933 に下がりました。MRR も 0.900 から 0.867 に下がっています。」（532行目）のように主語を残した |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮、guides/05 §7。地の文155文の文末を `lint/endings-check.py` で調べ、ですます以外は0件（`lint/endings-check.txt`）。表のセルと箇条書きの常体は guides/05 §7 の例外で、それぞれの中で形を揃えた（`lint/judgments.md`） |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」。「課題」「問題」「目標」は0件。「効果」は59行目「設定を変えた効果を数字で確かめたい」で、確かめる対象として自然。「エラー」は「エラーコード」（458、460、466行目）だけで、動詞を取らない |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」。サ変動詞は「判定できます」「計算できます」「採点します」「表示します」「保存します」「一致しません」「固定します」。「15問を…採点します」「文書の語が…一致せず」「バージョンは…固定します」は他動詞に を、自動詞に が で、取り違えなし（目視） |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」。形容詞は「MRR 0.967 で最も高く」「スコアの高い順」「下限が 0.1 のほうが高い結果」「k を小さくすると」で、値に「高い」、k に「小さい」と対応している（目視） |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」。「まず最初に」なし。「約 0.033」は「約」だけで「程度」と重ねていない。「各〜ごとに」なし（「質問ごとに」だけ） |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」。「〜を作る（make）」「〜を持っている（have）」型なし（目視）。「評価を作る」（199行目）は評価用の質問の組を実際に作る作業、「回答を作る前の段階」（61行目）はモデルが回答を生成する処理で、どちらも実体のある作成 |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」。`lint/prose-check.txt` で60字超 0（最長60字）。途中の版の20文を分けた（`lint/judgments.md`）。インラインコード、Markdown のリンク（URL を含む）、（出典n）も1字ずつ数え、見出し、表のセル、frontmatter の文字列も数えた。除外はコードブロックと URL だけのセル（件数は `prose-check.txt` 2行目） |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」と §7。「正解の文書」（「関連文書」は0件）、「検索器」、「質問」（評価用の質問。「クエリ」は0件）、「順位」、「点数」は RRF の合計にだけ使い、BM25 とベクトル検索の値は「スコア」（ハイブリッド検索の記事と同じ使い分け）、「作業フォルダ」（「ディレクトリ」0件）、「バージョン」（「版」0件）。指標名は「Recall@k」「MRR」で統一し、k を決めた値は「Recall@3」のように書いた。半角と全角の間には空白 |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」。15問、10件、5件、3件、0.967、0.900、0.867、1.000、0.933、0.767、0.033、0.067、0.03252、0.03227、0.03226、1/62、36秒、24秒、4.2秒、2.2〜2.5秒、745MB、130MB、22.18.0、100万トークン、10万トークン、0.10 ドル、0.50 ドル。「数個」「早めに」型なし |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」。並列の「や」は0件（`prose-check.txt` の YA 6件は語の一部、`lint/judgments.md`）。AND は「BM25、ベクトル検索、ハイブリッド検索の3つ」（57行目）「`returns` と4位の `points`」（162行目）、箇条書きは「次の4つをすべて」（548行目） |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7。C19 と同じ文末の調査で、ですます調だけ |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03 記号NG。`prose-check.txt` の PAT `**` 0件（コードブロックの外） |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03 記号NG。`—`、`─`、`―` 0件（PAT）、writing-lint B-5 0回。途中の版の「1 − Recall@20」（U+2212 の負号）も「1 から Recall@20 を引いた値」に開いた |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。`： `、`：`、`／` は0件（PAT）。インラインコードの `query: `、`passage: ` は対象外（guides/03 記号NG の注記） |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | スキル手順7のコマンド（`python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/rag-retrieval-eval-recall-mrr.md > logs/rag-retrieval-eval-recall-mrr/lint/ai-smell.txt 2>&1; echo "exit=$?" >> …`）で、579行の版に FATAL 0、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」。warn 0件で判断の対象なし（`lint/judgments.md`） |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」。FATAL、warn、mention がすべて0件で、区別が要る検出なし |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」。文章の悪い例は引用していない。うまくいかない検索の例（「返金はいつ？」「E1021 が出た」「カードが使えない」、448〜466行目、下限0の例 500〜536行目）は、差がついた質問だと見出しと表で明示し、原因（一致した語、同点の並び方、`run/13`、`21.log`）と対処（質問を足して測り直す、下限 0.1 を残す）を直後に置いた |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03 不在1・不在4、guides/06「使い方の流れ」4。Claude が動かした結果と、そこからの判断: `run/08.log`（差は3問、12問は同じ順位）から、この結果だけでは検索器を切り替えないと判断した（466行目）。`cases.ts` を検索器を動かす前に書いた（197行目、`run/cases-written-at.txt`）。`run/13`、`21.log` で差のついた3問の原因を一致した語と点数まで確かめた（456〜462行目）。`run/18`、`19.log` から、k をモデルに渡す件数に合わせると判断した（498行目）。`run/12.log` で、ハイブリッド検索の記事の下限 0.1 が15問でも高いことを確かめ、差が1問分なので質問を増やして測り直すと判断した（536行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | 記事のコードとコマンドはすべて実行した（`run/01.log`〜`12.log`、`18.log`、`19.log`、G04）。型は `run/14`、`15.log`、外へ出ないことは `run/16.log`。モデル（LLM）には送っていない（キーが無く、記事も検索の採点までにした） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | 555行目「差がつく質問を足すなら、あなたのアプリの質問ログからどんな質問を選びますか。」の1か所 |

## 集計

- A: OK 8 / NG 2（G07、G10）（全10項目）
- B: OK 38 / NG 0 / 任意・あり 1（全39項目）
- 合計: OK 46 / NG 2 / 任意・あり 1（全49項目）

## 結論

G07（前後リンクの先が未公開）と G10（CSV 待ち）に落ちたので、`status: draft` のまま止める。G07 は前後の記事（`llm-as-a-judge-claude`、`promptfoo-llm-eval-intro`）と関連記事のどれかが公開か予約されれば通る。前後の2本はどちらも API キーが要る記事（`content/plan.md` #27、#29）で、`ANTHROPIC_API_KEY` が入るまで書けない。G10 はラッコキーワードの CSV が届き、`target_query` を CSV の行から選べれば通る。どちらも、この記事の原稿を直しても解消しない。
