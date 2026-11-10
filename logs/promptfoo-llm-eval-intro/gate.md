# gate: promptfoo-llm-eval-intro

判定日: 2026-11-10（同日にレビューの指摘2件で361行目と386行目を直し、lint 2本、`prose-check.py`、`check-code-and-outputs.py` を回し直して、影響する行を判定し直した。直した内容は末尾の「2026-11-10 の修正」）。原稿は `content/articles/promptfoo-llm-eval-intro.md`（466行、frontmatter は1〜68行目）。

判定の前に Read ツールで読んだガイド（どれも 2026-11-10、全文）: `docs/tech-writing-pack/checklist.md`、`guides/01-seo-for-dev-blogs.md`、`guides/02-article-structures.md`、`guides/03-anti-ai.md`、`guides/04-collocation.md`、`guides/05-technical-writing.md`、`guides/06-rewriting-prompts.md`、`guides/08-ai-buntai-ruleset.md`、`guides/09-ai-writing-manual.md`。あわせて `keywords/README.md`。

補助スクリプト: `lint/prose-check.py`（除外はコードフェンスの中と、URL だけの表のセル16個。frontmatter は `title` と `description` の値を数える。インラインコード、リンクの URL、（出典n）、見出し、表のセル、箇条書きは書かれたとおりに数える）、`lint/check-code-and-outputs.py`（記事のコードと出力が `code/` と `run/` に1文字も違わず一致するか、本文の数値がログにあるか、終了コード、ログに UUID が残っていないか）。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。`lint/ai-smell.txt` 5行目「--- 判定: ✅ 致命なし」、末尾 `exit=0`、集計「use 0件 / 📎mention 0件」。frontmatter の行の mention も0件（`judgments.md`「frontmatter の扱い」） |
| G02 | `writing-lint.py` の判定行が FATAL 0 / DENSITY超過 0。SHOULD、WATCH、INFO は1件ずつ判断した | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 21行目「### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0」、`exit=0`。DENSITY は10カウンタとも0回、WATCH の節なし、INFO 0件（`judgments.md`） |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Agent SDK や `claude -p` の記事は、オーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 記事のコードは promptfoo の設定と、結果のファイルを読む TypeScript で、Messages API（`@anthropic-ai/sdk`）を直接呼ばない（`needs_api_key: false`、64行目）。モデルは promptfoo の `anthropic:claude-agent-sdk` プロバイダー経由で Agent SDK が呼ぶ。スキルの「Claude プランで動かす記事」に従い、オーナー自身の Claude プランでログイン済みの環境で実行した（`run/01.log` 〜 `13.log`、`ANTHROPIC_API_KEY` は各ログ4行目で unset、`run/13.log` で `apiKeySource=none`）。`lint/check-code-and-outputs.txt` は14ブロックすべて OK、本文の数値20件 OK、終了コード13件 OK、UUID 0件、末尾「ALL OK」（361行目と386行目の修正のあとに回し直しても ALL OK。修正は地の文だけで、コードと出力は1文字も変えていない）。型の確認は `run/10.log`（TypeScript 7.0.2、`tsc_exit=0`） |
| G05 | 断定した事実すべてに一次情報の出典が本文にある。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 361行目の出典8の扱いは、出典8（https://www.promptfoo.dev/docs/configuration/outputs/ と 0.125.1 の `site/docs/configuration/outputs.md` 127行目、2026-11-10）の JSONL の例に `response.output` があるので、「出典8の説明にない」のは `prompt.label` と `vars` の2つだけと直した（`sources.md` の出典8の行と35行目も同じく直した）。本文末の出典の表（441〜462行目）に16件、URL と確認日つき。（出典1）〜（出典16）がすべて本文から引かれている（`grep -o "出典n）"` で各1回以上、合計39か所）。出典が無い事実はすべて実行ログが根拠で、`sources.md` の後半の表に対応を書いた。料金は「1回の評価で、プランの利用枠から6回分が引かれる」の節（400〜429行目）で、プランの利用枠から引かれること、Pro は月20ドル、`cost` は定価換算の見積もり（0.00236732 ドル）を出典付きで書いた。`cost_estimate`（9行目）は本文と同じ内容。`run_environment`（10行目）の Node.js 22.22.0、npm 10.9.4 は各ログ3行目、promptfoo 0.125.1 と SDK 0.3.322 は `run/03.log` と `run/13.log`、Claude Code 2.1.322 は `run/13.log`、TypeScript 7.0.2 は `run/10.log`。`verified_at`（11行目）2026-11-10 は最後のログ `run/13.log` の日付と、466行目の末尾表記と同じ |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（この記事のほか22本）。promptfoo の使い方を書いた記事は無い（`grep -l promptfoo` は前後リンクの slug を書いた2本だけ）。#26 `llm-eval-harness-fixtures` は自作の採点、#27 `llm-as-a-judge-claude` はモデルに採点させる記事で、この記事は promptfoo の設定と結果の読み方に絞り、採点の方法は2本へのリンクに任せた（76行目、259行目、386行目）。386行目は #26 の275行目と同じ「採点を緩めずにプロンプトを直す」理由を書き直していたので、理由は #26 へのリンクに任せ、promptfoo で metric を分けたことで直す先が決まる点だけを残した。`content/plan.md` の「26（自作の採点）と 29（promptfoo）は…分けます」「29（promptfoo）は採点の考え方を繰り返さず、26 と 27 にリンクします」のとおり |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | リンクは本文にある。前: 76行目 `/posts/rag-retrieval-eval-recall-mrr`（frontmatter 12行目 `prev`）。次: 464行目 `/posts/llm-eval-dataset-from-logs`（13行目 `next`）。関連: 76行目と259行目と386行目 `/posts/llm-eval-harness-fixtures`、76行目 `/posts/llm-as-a-judge-claude`、87行目と427行目 `/posts/claude-agent-sdk-first-agent`。前後は `content/plan.md` の course_step 6 の並び（#28、#30）で、どちらの原稿もこの記事を `next`、`prev` に書いている。ただし、リンク先5本はどれも `status: draft` で、公開済みでも予約済みでもない（`content/articles/` に `scheduled` か `published` の記事は0本）。条件を満たさないので NG |
| G08 | 本文の最後の段落が「AI 支援で執筆」を含む決まった表記 | 原稿の末尾 | OK | 466行目「AI 支援で執筆しました。コードは 2026-11-10 に実際に実行して確認しています。」。日付は `verified_at` と最後のログの日付に一致 |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/promptfoo-llm-eval-intro/` を `sk-ant`、`api_key = <16文字以上>`、`Bearer <文字列>`、`password`、メールアドレスの正規表現で `grep -rn` して0件（`run/*.log` も0件）。ログの UUID（セッションの ID）は保存時に `<session-id>` に置き換え、`check-code-and-outputs.txt` で13ファイルとも UUID 0件。`results.jsonl` はリポジトリに置いていない。個人名: git の `user.name`（この環境では AI の製品名と同じ6文字の語で、記事では製品名として使っている。個人名ではない）、git の `user.email`、リポジトリのオーナーのアカウント名、CLAUDE.md に出てくる人物名と人格名の候補（漢字の姓と名、ローマ字）を1つずつ `grep -rlF` で原稿とログにかけ、`user.name` 以外は0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | NG | `keywords/` に CSV が無い（README.md だけ）。`target_query` は null（7行目）。値は作っていない。CSV が届くまで下書きのまま止める（CSV 待ち） |

## B. checklist.md の全項目

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1 を読んで判定。`brief.md` の C01 の1行「LLM の API かチャットを1回触った程度の TS/JS 開発者が『promptfoo の使い方』を調べたときに、設定ファイル1つで2つのプロンプトを比べ、不合格の理由を読み、終了コードで CI につなぐところまでを答える」 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」を読んで判定。2行目のタイトルは「promptfoo」と「LLM」「評価」を前に置き、【設定ファイル1つから、Claude プランで動かす】で手段と条件を示した。「徹底解説」「完全ガイド」は0件。CSV が無いので検索語との一致は G10 で NG として別に数える |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」を読んで判定。70〜74行目の3段落で、promptfoo が何か、この記事で何を比べるか、動かした結果（形を指定しないプロンプトが3件とも不合格、理由はラベルの前後の記号と説明の文）を先に出した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 と guides/02 タイプ1を読んで判定。やり方の検索意図に、チュートリアルの骨格（リード → 前提・環境 78行目 → 手順 109、165、261、319行目 → 動作確認は各手順の実行結果 → 次にやれることと関連記事 431、464行目）を合わせた（`brief.md`） |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02「どのタイプでも共通の原則」1を読んで判定。結果（3件とも不合格）をリード74行目に置き、理由（形の検査で落ちた）を311、382行目、詳細（全文、2回目、料金）をその後に置いた。各 H2 の直下も結論の文から始めた（例 400〜402行目） |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2を読んで判定。H2 は「用意するもの → インストール → 設定ファイル → eval の表 → results.jsonl → 料金 → API キー → 出典」の順で、各 H2 は1つの話題だけを扱う（見出し一覧は `grep -n '^## \|^### '`） |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4と guides/03 症状②を読んで判定。見出しは「`npm audit fix --force` は実行しない」「npx promptfoo eval の表で、形を指定しないプロンプトが3件とも FAIL になる」「不合格が1件でもあれば、終了コードは 100」のように、言えることを書いた。「まず〜する」「〜を確認する」型の見出しは0件 |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 チュートリアルの肝と guides/01 §4 を読んで判定。インストールのコマンド（113〜119行目）、設定ファイル全体（169〜218行目）、`import` を含む TypeScript 全体（325〜359行目）を省略なしで載せ、それぞれの実行結果をログから写した。`lint/check-code-and-outputs.txt` で14ブロックとも `code/` と `run/` に一致 |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03「5つの不在」1を読んで判定。「`npm audit fix --force` は実行しない」（163行目）、「採点を緩めない理由は[採点の記事]にあります」と、metric を分けて直す先を絞る判断（386行目）、「システムプロンプトもアプリと同じものに差し替えておくのが筋です」（419行目）で判断を示した。前提の説明は短く、結果の読み方の節を長くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03「5つの不在」2を読んで判定。各 H2 の言い切り: 80行目「Node.js 22.22.0 以上を要求します」、163行目「実行しません」、167行目「評価の中身は、次の設定ファイル1つです」、311行目「3件とも不合格でした」、386行目「直す先はプロンプトの形の指定に絞れます」、402行目「プランの利用枠から引かれます」、433行目「API キーで認証します」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①を読んで判定。地の文の「でしょう」「かもしれ」「と言える」は0件（`grep -c`） |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②を読んで判定。「解説します」「見ていき」「紹介します」は0件。ai-smell-lint のメタ発言の検出も0件 |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫を読んで判定。「ここから」「ここまで」「次は」「まとめ」「整理」は地の文で0件。ai-smell-lint の ⑫ も0件 |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬を読んで判定。比喩は使っていない。⑬の語は0件 |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧と guides/08 B-1 を読んで判定。writing-lint の B-1 対比構文 0回。地の文の「ではなく」「ではありません」「じゃない」は0件（コードブロックの中のモデルの出力は対象外） |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03「5つの不在」4と原因⑦を読んで判定。地の文143文で、最短13字、最長60字、20字以下が14文、41字以上が70文（修正のあとに数え直した）。1文だけの段落（107行目、363行目）を、3文の段落とコードブロックの間に置いた |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03「語尾の反復チェック」を読んで判定。`lint/prose-check.txt` で末尾3字が3文連続で同じ箇所は0件（最初の版の「〜を見ます」の3連続は直した、`judgments.md`） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮を読んで判定。60字に収めるために分けた文も主語を残した（例 433行目「評価を製品の開発に組み込むなら、Claude Console の API キーで認証します」）。主語も目的語も無い体言止めや命令形の連続は無い |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮と guides/05 §7「文体の統一」を読んで判定。`lint/prose-check.txt` で「。」で終わる文のうち、ですます系以外で終わる文は0件（`plain=0`）。writing-lint の B-10 文体混在も検出なし |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」を読んで判定。「エラーは 1 です」（315行目）の1か所で、ミスマッチの表に当たる結びつきは無い |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」を読んで判定。「キャッシュします」「認証します」「分類します」はどれも他動詞で「を」を取るか目的語を省いた形。「を向上する」「を発生する」「を変化する」は0件 |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」を読んで判定。形容詞と名詞の組は「短いシステムプロンプト」「長い」程度で、表の誤用に当たるものは無い |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」を読んで判定。「まず最初に」「約〜程度」「各〜ごとに」は0件。英単語と和訳の重複（「inputを入力する」型）も無い |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」を読んで判定。「〜を作る」は「URL を作らない」（263行目）だけで、表の翻訳調に当たらない。「〜を持っている」は0件 |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」を読んで判定。`lint/prose-check.txt`「sentences=235 long(>60)=0 max=60」（修正のあとに回し直した結果）（インラインコード、リンクの URL、（出典n）、見出し、表のセル、箇条書き、title、description も書かれたとおりに数えた。除外したのは URL だけの表のセル16個）。最初の版の14文は分けるか短くした（`judgments.md`） |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」を読んで判定。「テストケース」「プロンプト」「プロバイダー」「採点の条件」「利用枠」「終了コード」を通して同じ語で書いた。assert を「条件」、metric を英語のまま書くことも全体で揃えた |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」を読んで判定。バージョン、件数（6回、3件）、トークン数（17,489、31,477）、金額（月20ドル、0.00236732 ドル）、終了コード（100、1）を数値で書いた。見出しの「ほぼ半分」は直後の表で数値を示した |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」を読んで判定。地の文の「や」の並列は「記号や説明の文」（311行目。両方が付いた例と片方の例があり、出力の全文を382〜384行目と表で示した）だけ。「製品やサービス」は出典の or に合わせて「製品かサービス」に直した。「など」「等」は0件 |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7「文体の統一」を読んで判定。C19 と同じ根拠（`plain=0`）。表のセルと見出しは体言止め（guides/05 §7 の例外） |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03「記号NG」を読んで判定。`lint/prose-check.txt` の C30 検出0件。`**` はコードブロックの中（モデルの出力）にだけある |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03「記号NG」を読んで判定。コードブロックの外で `—`、`──`、`―`、`─` は0件（`prose-check.txt`）。罫線は promptfoo の表の出力（コードブロックの中）にだけある |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03「記号NG」を読んで判定。全角コロンと全角スラッシュはコードブロックの外で0件（`prose-check.txt`） |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。手順7のコマンドで実行、`lint/ai-smell.txt` の判定行「✅ 致命なし」、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」を読んで判定。warn は0件。判断の記録は `judgments.md` |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。use 0件、mention 0件。frontmatter の行の扱いも `judgments.md` に記録 |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」を読んで判定。この記事は文章の悪い例を引用していない（`📎mention` 0件）。モデルの出力の悪い例（382〜386行目）は、コードブロックで示し、何が問題かと直し方（「形の指定あり」のプロンプト）を直後に置いた |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。実際に動かした結果（`run/04.log` の表と終了コード 100、`run/05.log` の不合格の全文、`run/06.log`・`07.log` の2回目の比較、`run/08.log` のシステムプロンプトなしのトークン数、`run/09.log` の `npm audit` の提案、`run/12.log` の cost）と、そこから下した判断（`--force` を実行しない 163行目、採点を緩めない 386行目、システムプロンプトをアプリに合わせる 419行目、`apiKeyRequired: false` だとキャッシュが効かず毎回利用枠が減る 404〜406行目） |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。G04 と同じ根拠（`run/01.log`〜`13.log`、`lint/check-code-and-outputs.txt` ALL OK）。オーナーの Claude プランで実行した |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | guides/03「沈黙の不在」を読んで判定。439行目「あなたのプロンプトでは、どんな形の崩れを不合格にしますか。」で節を閉じた（1か所） |

## 結論

G07（リンク先が未公開）と G10（CSV 待ち）が NG。frontmatter は `status: draft` のまま止める。

## 2026-11-10 の修正

レビューで指摘された2件を、一次情報と原稿で確かめてから直した。

| 箇所 | 指摘 | 確かめたこと | 直したこと |
|---|---|---|---|
| 361行目、`sources.md` の出典8の行と35行目 | `response.output` も「出典8の説明にない」と書いていた | 出典8のページ（2026-11-10 取得）の JSONL Format の例に `"response":{"output":"Response 1"}` がある。0.125.1 の `site/docs/configuration/outputs.md` 127行目も同じ。`vars`、`"prompt"`、`label`（`sidebar_label` を除く）は無い | 「出典8の説明にない」を `prompt.label` と `vars` の2つに絞り、`response.output` は出典8の JSONL の例にあると書いた |
| 386行目 | #26 `llm-eval-harness-fixtures` の275行目と同じ「採点を部分一致に緩めず、プロンプトを直す」理由を、リンクなしで書き直していた（`content/plan.md` 95行目「29（promptfoo）は採点の考え方を繰り返さず、26 と 27 にリンクします」に反する） | #26 の275行目と、この記事の386行目を並べて読み、組み立てが同じことを確かめた | 理由は `/posts/llm-eval-harness-fixtures` へのリンクに任せ、promptfoo で `regex` と `icontains` の metric を分けたので直す先がプロンプトの形の指定に絞れる、という点だけを残した |

修正のあとの結果: `lint/ai-smell.txt` 判定「✅ 致命なし」、use 0件、mention 0件、`exit=0`。`lint/writing-lint.txt`「### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0」、`exit=0`。`lint/prose-check.txt`「sentences=235 long(>60)=0 max=60 plain=0 … issues=0」。`lint/check-code-and-outputs.txt`「ALL OK」。モデルを呼ぶ `eval` は動かし直していない。コードと出力を変えていないことを `check-code-and-outputs.py` で確かめたので、記事に写した `run/` のログをそのまま根拠にした（動かし直すと出力の文面が変わり、記事に写した出力とログが一致しなくなる）。

ゲートの数: OK 46（G01〜G06、G08、G09、C01〜C38）、任意・あり 1（C39）、NG 2（G07、G10）。

