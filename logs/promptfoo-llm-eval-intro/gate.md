# gate: promptfoo-llm-eval-intro

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


判定日: 2026-11-11（オーナーの裁定に合わせて、利用条件の注意書きを消し、設定に `strict_mcp_config: true` を足して、コードを全部動かし直した。記事の出力と数値を新しいログ `run/14.log`〜`23.log` に合わせ、影響する行を判定し直した。直した内容は末尾の「2026-11-11 の修正」。それより前の判定と直しは「2026-11-10 の修正」「2026-11-10 の再実行」）。原稿は `content/articles/promptfoo-llm-eval-intro.md`（451行、frontmatter は1〜65行目）。行番号はすべて 2026-11-14 に今の451行の版へ数え直した。

判定の前に Read ツールで読んだガイド（どれも 2026-11-10、全文）: `docs/tech-writing-pack/checklist.md`、`guides/01-seo-for-dev-blogs.md`、`guides/02-article-structures.md`、`guides/03-anti-ai.md`、`guides/04-collocation.md`、`guides/05-technical-writing.md`、`guides/06-rewriting-prompts.md`、`guides/08-ai-buntai-ruleset.md`、`guides/09-ai-writing-manual.md`。あわせて `keywords/README.md`。

補助スクリプト: `lint/prose-check.py`（除外はコードフェンスの中と、URL だけの表のセル16個。frontmatter は `title` と `description` の値を数える。インラインコード、リンクの URL、（出典n）、見出し、表のセル、箇条書きは書かれたとおりに数える）、`lint/check-code-and-outputs.py`（記事のコードと出力が `code/` と `run/` に1文字も違わず一致するか、本文の数値がログにあるか、終了コード、ログに UUID が残っていないか）。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。`lint/ai-smell.txt` 5行目「--- 判定: ✅ 致命なし」、末尾 `exit=0`、集計「use 0件 / 📎mention 0件」。frontmatter の行の mention も0件（`judgments.md`「frontmatter の扱い」） |
| G02 | `writing-lint.py` の判定行が FATAL 0 / DENSITY超過 0。SHOULD、WATCH、INFO は1件ずつ判断した | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 21行目「### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0」、`exit=0`。DENSITY は10カウンタとも0回、WATCH の節なし、INFO 0件（`judgments.md`） |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Agent SDK や `claude -p` の記事は、オーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 記事のコードは promptfoo の設定と、結果のファイルを読む TypeScript で、Messages API（`@anthropic-ai/sdk`）を直接呼ばない（`needs_api_key: false`、61行目）。モデルは promptfoo の `anthropic:claude-agent-sdk` プロバイダー経由で Agent SDK が呼ぶ。2026-11-11 17:04〜17:05（UTC-8）に、スクラッチの空の作業フォルダ（実行後に削除）から `code/extra/run-fix.sh` で記事の手順を最初からやり直し、`run/14.log`〜`23.log` を残した（`run/01.log`〜`13.log` は前の実行のログとしてそのまま残した）。`ANTHROPIC_API_KEY` は各ログ4行目で unset、`run/23.log` で `apiKeySource=none`、`claude_code_version=2.1.322`、init の `tools=0 mcp_servers=0`、SDK 0.3.322、promptfoo 0.125.1。設定は `strict_mcp_config: true` を足した版（180行目、`code/promptfooconfig.yaml`）。記事のインストールの出力（110〜125行目、`run/15.log`）、eval の表（262〜299行目、`run/17.log`）、`show-failures.ts` の出力（363〜374行目、`run/18.log`）、2回目の出力の1行（388〜390行目、`run/20.log`）と、本文の数値（378、386、400、402、408〜411、417行目）をこのログに合わせて直した。`lint/check-code-and-outputs.txt` は14ブロックすべて OK、本文の数値20件 OK、終了コード22件 OK、UUID 0件、末尾「ALL OK」。型の確認と `npm audit` は同じ端末で取り直した（`run/25.log`、`run/26.log`。`tsc_exit=0`、各ログに `uname: Darwin arm64`） |
| G05 | 断定した事実すべてに一次情報の出典が本文にある。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 2026-11-11 に、利用条件の注意書きを消したことで引かれなくなった Legal and compliance（旧出典12）を、本文末の表、frontmatter の `sources`、`sources.md` から外し、旧13〜16を12〜15に詰めた。本文末の出典の表（433〜453行目）に15件、URL と確認日つき。小さなスクリプトで、本文で引いた番号が1〜15、表の行が1〜15、frontmatter の `sources` が15件で、引かれていない行も行の無い番号も0件だと確かめた。出典が無い事実はすべて実行ログが根拠で、`sources.md` の後半の表に対応を書いた（`strict_mcp_config` のコードコメントの根拠も、インストールした promptfoo 0.125.1 の dist 507行目と SDK の `sdk.d.ts` 2416行目として書いた）。料金は「1回の評価で、プランの利用枠から6回分が引かれる」の節（394〜427行目）で、プランの利用枠から引かれること（出典12）、Pro は月20ドル（出典13）、`cost` は定価換算の見積もり（0.00133430 ドル、`run/21.log`、出典14）を書いた。`cost_estimate`（9行目）は本文と同じ内容。`run_environment`（10行目）の Node.js 22.23.4、npm 10.9.9 は `run/14.log`〜`23.log` の3行目、macOS arm64 は実行した端末の `uname -sm`（Darwin arm64）、promptfoo 0.125.1 と SDK 0.3.322 は `run/16.log` と `run/23.log`、Claude Code 2.1.322 は `run/23.log`、TypeScript 7.0.2 は `run/26.log`、macOS arm64 は `run/24.log`〜`27.log` の `uname: Darwin arm64`。`verified_at`（11行目）2026-11-11 は最後のログ `run/23.log` の日付と、455行目の末尾表記と同じ |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `content/articles/` の frontmatter を全件読んだ（この記事のほか22本）。promptfoo の使い方を書いた記事は無い（`grep -l promptfoo` は前後リンクの slug を書いた2本だけ）。#26 `llm-eval-harness-fixtures` は自作の採点、#27 `llm-as-a-judge-claude` はモデルに採点させる記事で、この記事は promptfoo の設定と結果の読み方に絞り、採点の方法は2本へのリンクに任せた（73行目、251行目、380行目）。380行目は #26 の275行目と同じ「採点を緩めずにプロンプトを直す」理由を書き直していたので、理由は #26 へのリンクに任せ、promptfoo で metric を分けたことで直す先が決まる点だけを残した。`content/plan.md` の「26（自作の採点）と 29（promptfoo）は…分けます」「29（promptfoo）は採点の考え方を繰り返さず、26 と 27 にリンクします」のとおり |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | OK | 2026-11-14 に #31 で判定し直した。公開の順（`content/plan.md` の「公開の順番」）で29番。本文の内部リンクは7件で、リンク先はすべて自分より前の順番: 84行目と423行目 `/posts/claude-agent-sdk-first-agent`（17番）、73行目と251行目と380行目 `/posts/llm-eval-harness-fixtures`（26番）、73行目 `/posts/llm-as-a-judge-claude`（27番）、73行目 `/posts/rag-retrieval-eval-recall-mrr`（28番）。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。frontmatter は `prev: rag-retrieval-eval-recall-mrr`、`next: llm-eval-dataset-from-logs` のまま。次の記事への本文リンクは外した。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」を含む決まった表記 | 原稿の末尾 | OK | 455行目「AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。」。日付は `verified_at` と最後のログ `run/23.log` の日付に一致 |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/promptfoo-llm-eval-intro/` を `sk-ant`、`api_key = <16文字以上>`、`Bearer <文字列>`、`password`、メールアドレスの正規表現で `grep -rn` して0件（`run/*.log` も0件）。ログの UUID（セッションの ID）は保存時に `<session-id>` に置き換え、`check-code-and-outputs.txt` で `run/01.log`〜`23.log` の23ファイルとも UUID 0件（2026-11-11 に原稿とログ全体を `sk-ant`、`Bearer`、`password`、メールアドレスと UUID の正規表現、git の `user.email` でもう一度かけ、gate.md の確かめ方の説明に出る語のほかは0件）。`results.jsonl` はリポジトリに置いていない。個人名: git の `user.name`（この環境では AI の製品名と同じ6文字の語で、記事では製品名として使っている。個人名ではない）、git の `user.email`、リポジトリのオーナーのアカウント名、CLAUDE.md に出てくる人物名と人格名の候補（漢字の姓と名、ローマ字）を1つずつ `grep -rlF` で原稿とログにかけ、`user.name` 以外は0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-llm-eval.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭の原則と §1 を読んで判定。`brief.md` の C01 の1行「LLM の API かチャットを1回触った程度の TS/JS 開発者が『promptfoo の使い方』を調べたときに、設定ファイル1つで2つのプロンプトを比べ、不合格の理由を読み、終了コードで CI につなぐところまでを答える」 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」を読んで判定。2行目のタイトルは「promptfoo」と「LLM」「評価」を前に置き、【設定ファイル1つから、Claude プランで動かす】で手段と条件を示した。「徹底解説」「完全ガイド」は0件。CSV が無いので検索語との一致は G10 で NG として別に数える |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文が最重要」を読んで判定。67〜71行目の3段落で、promptfoo が何か、この記事で何を比べるか、動かした結果（形を指定しないプロンプトが3件とも不合格、理由はラベルの前後の記号と説明の文）を先に出した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 と guides/02 タイプ1を読んで判定。やり方の検索意図に、チュートリアルの骨格（リード → 前提・環境 75行目 → 手順 98、154、253、313行目 → 動作確認は各手順の実行結果 → まとめ 429行目 → 出典 433行目。前の記事のリンク 73行目）を合わせた（`brief.md`）。guides/02 タイプ1の末尾「まとめ（完成したものの再確認、次にやれること（発展）・関連記事へのリンク）」に当たる節として、2026-11-14 に「## まとめ」（429〜431行目）を足した。内容は、本文で見せた比較と終了コードの確認、`tests` に自分の入力を足して metric を分ける次の一手で、本文に無い事実は足していない。関連記事へのリンクは、このまとめには置かない（73行目、84行目、251行目、380行目、423行目に既にある）。394行目は料金の節で、まとめではない |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02「どのタイプでも共通の原則」1を読んで判定。結果（3件とも不合格）をリード71行目に置き、理由（形の検査で落ちた）を315、378行目、詳細（全文、2回目、料金）をその後に置いた。各 H2 の直下も結論の文から始めた（例 305行目、396行目） |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通の原則2を読んで判定。H2 は「用意するもの → インストール → 設定ファイル → eval の表 → results.jsonl → 料金 → API キー → 出典」の順で、各 H2 は1つの話題だけを扱う（見出し一覧は `grep -n '^## \|^### '`） |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通の原則4と guides/03 症状②を読んで判定。見出しは「`npm audit fix --force` は実行しない」「npx promptfoo eval の表で、形を指定しないプロンプトが3件とも FAIL になる」「不合格が1件でもあれば、終了コードは 100」のように、言えることを書いた。「まず〜する」「〜を確認する」型の見出しは0件 |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 チュートリアルの肝と guides/01 §4 を読んで判定。インストールのコマンド（102〜108行目）、設定ファイル全体（158〜208行目、`strict_mcp_config` の行を含む）、`import` を含む TypeScript 全体（319〜353行目）を省略なしで載せ、それぞれの実行結果を2026-11-11 のログ（`run/15.log`、`17.log`、`18.log`）から写した。`lint/check-code-and-outputs.txt` で14ブロックとも `code/` と `run/` に一致 |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03「5つの不在」1を読んで判定。「`npm audit fix --force` は実行しない」（143行目）、「採点を緩めない理由は[採点の記事]にあります」と、metric を分けて直す先を絞る判断（386行目）、「システムプロンプトもアプリと同じものに差し替えておくのが筋です」（415行目）で判断を示した。前提の説明は短く、結果の読み方の節を長くした |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03「5つの不在」2を読んで判定（2026-11-11 に読み直した）。注意書きの H2 を消したあとの各 H2 の言い切り: 77行目「Node.js 22.22.0 以上を要求します」、152行目「実行しません」、156行目「評価の中身は、次の設定ファイル1つです」、305行目「3件とも不合格でした」、380行目「直す先はプロンプトの形の指定に絞れます」、396行目「プランの利用枠から引かれます」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①を読んで判定。地の文の「でしょう」「かもしれ」「と言える」は0件（`grep -c`） |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②を読んで判定。「解説します」「見ていき」「紹介します」は0件。ai-smell-lint のメタ発言の検出も0件 |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫を読んで判定。「ここから」「ここまで」「次は」「まとめ」「整理」は地の文で0件。ai-smell-lint の ⑫ も0件 |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬を読んで判定。比喩は使っていない。⑬の語は0件 |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧と guides/08 B-1 を読んで判定。writing-lint の B-1 対比構文 0回。地の文の「ではなく」「ではありません」「じゃない」は0件（コードブロックの中のモデルの出力は対象外） |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03「5つの不在」4と原因⑦を読んで判定。`lint/prose-check.txt` は sentences=227、最長60字、60字超は0件（2026-11-14 に回し直した）。392行目は32字と51字の2文で、短文と長文が混ざる。1文だけの段落は 357行目 |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03「語尾の反復チェック」を読んで判定。`lint/prose-check.txt` で末尾3字が3文連続で同じ箇所は0件（最初の版の「〜を見ます」の3連続は直した、`judgments.md`） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮を読んで判定。60字に収めるために分けた文も主語を残した（例 231行目「このプロバイダーは、`ANTHROPIC_API_KEY` か設定の `apiKey` でキーを受け取ります」）。主語も目的語も無い体言止めや命令形の連続は無い。2026-11-11 に書き直した378行目と386行目も主語（「3件とも」「1回目の2件目の出力には」）を残した |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮と guides/05 §7「文体の統一」を読んで判定。`lint/prose-check.txt` で「。」で終わる文のうち、ですます系以外で終わる文は0件（`plain=0`）。writing-lint の B-10 文体混在も検出なし |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」を読んで判定。「エラーは 1 です」（309行目）の1か所で、ミスマッチの表に当たる結びつきは無い |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」を読んで判定。「キャッシュします」「認証します」「分類します」はどれも他動詞で「を」を取るか目的語を省いた形。「を向上する」「を発生する」「を変化する」は0件 |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」を読んで判定。形容詞と名詞の組は「短いシステムプロンプト」「長い」程度で、表の誤用に当たるものは無い |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」を読んで判定。「まず最初に」「約〜程度」「各〜ごとに」は0件。英単語と和訳の重複（「inputを入力する」型）も無い |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」を読んで判定。「〜を作る」は「URL を作らない」（255行目）だけで、表の翻訳調に当たらない。「〜を持っている」は0件 |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」を読んで判定。`lint/prose-check.txt`「sentences=227 long(>60)=0 max=60」（2026-11-11 の修正のあとに回し直した結果。guides/05 §1 を読み直した）（インラインコード、リンクの URL、（出典n）、見出し、表のセル、箇条書き、title、description も書かれたとおりに数えた。除外したのは URL だけの表のセル15個）。最初の版の14文は分けるか短くした。再実行に合わせて書き直した392行目の1文が72字になったので、2文に分けた（`judgments.md`） |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」を読んで判定。「テストケース」「プロンプト」「プロバイダー」「採点の条件」「利用枠」「終了コード」を通して同じ語で書いた。assert を「条件」、metric を英語のまま書くことも全体で揃えた |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」を読んで判定（2026-11-11 に読み直した）。バージョン、件数（6回、3件）、トークン数（8,185、28,013）、金額（月20ドル、0.00133430 ドル）、終了コード（100、1）を数値で書いた。見出しは比の語をやめて実測の数字だけにした（「prompt は 7,841 から 27,745 に増えた」）。比は環境で変わる（前の実行の prompt は 16,055 と 29,916）ので、本文でも1組の値と書いた |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」を読んで判定（2026-11-11 に読み直した）。コードフェンスの外の「や」の並列は「記号や説明の文」（305行目。両方が付いた例と記号だけの例があり、出力の全文を363〜374行目で示した）だけ（2026-11-11 に `grep` で確かめた）。前の版の「製品かサービス」の文は注意書きと一緒に消えた。「など」「等」は0件 |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | guides/05 §7「文体の統一」を読んで判定。C19 と同じ根拠（`plain=0`）。表のセルと見出しは体言止め（guides/05 §7 の例外） |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03「記号NG」を読んで判定。`lint/prose-check.txt` の C30 検出0件。`**` はコードブロックの中（モデルの出力）にだけある |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03「記号NG」を読んで判定。コードブロックの外で `—`、`──`、`―`、`─` は0件（`prose-check.txt`）。罫線は promptfoo の表の出力（コードブロックの中）にだけある |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03「記号NG」を読んで判定。全角コロンと全角スラッシュはコードブロックの外で0件（`prose-check.txt`） |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。手順7のコマンドで実行、`lint/ai-smell.txt` の判定行「✅ 致命なし」、`exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「lint との関係」を読んで判定。warn は0件。判断の記録は `judgments.md` |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。use 0件、mention 0件。frontmatter の行の扱いも `judgments.md` に記録 |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」を読んで判定。この記事は文章の悪い例を引用していない（`📎mention` 0件）。モデルの出力の悪い例（382〜386行目）は、コードブロックで示し、何が問題かと直し方（「形の指定あり」のプロンプト）を直後に置いた |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。実際に動かした結果（`run/04.log` の表と終了コード 100、`run/05.log` の不合格の全文、`run/06.log`・`07.log` の2回目の比較、`run/08.log` のシステムプロンプトなしのトークン数、`run/25.log` の `npm audit` の提案、`run/12.log` の cost）と、そこから下した判断（`--force` を実行しない 152行目、採点を緩めない 386行目、システムプロンプトをアプリに合わせる 419行目、`apiKeyRequired: false` だとキャッシュが効かず毎回利用枠が減る 398〜400行目）。2026-11-11 の再実行で、同じ判断の根拠は `run/17.log`〜`22.log` に移った（表と終了コード 100 は `run/17.log`、不合格の全文は `18.log`、2回目は `19.log`・`20.log`、cost は `21.log`、システムプロンプトなしは `22.log`）。判断の行は 152、380、415、398〜400行目 |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。G04 と同じ根拠。2026-11-11 に記事の手順を空の作業フォルダからやり直した `run/14.log`〜`23.log` と、`lint/check-code-and-outputs.txt` ALL OK。オーナーの Claude プランで実行した（`run/23.log` の `apiKeySource=none`） |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | guides/03「沈黙の不在」を読んで判定。431行目「あなたのプロンプトでは、どんな形の崩れを不合格にしますか。」で、まとめの節を閉じた（1か所） |

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

## 2026-11-10 の再実行

執筆の段階でコードを動かしたかどうかが記録で確かめられなかった（メインエージェントの指摘）ので、記事の全コードブロックを動かし直した。2026-11-10 08:38〜08:39 UTC に、スクラッチの空の作業フォルダ（`fix4-promptfoo-llm-eval-intro/base`、実行後に削除）から `code/extra/run-all.sh` と `run-extra.sh` で記事の手順を最初からやり直し、`run/01.log`〜`13.log` を取り直した（前の版のログはこの実行で上書きした）。モデルを呼んだ `run/04.log`、`06.log`、`08.log`、`13.log` は、`ANTHROPIC_API_KEY` が unset のまま、オーナーの Claude プランのログインで動いた（`run/13.log` の init で `apiKeySource=none`）。

| 箇所 | 前の版 | 再実行の結果（ログ） | 直したこと |
|---|---|---|---|
| 125行目（インストールの出力） | `in 36s` | `in 35s`（`run/02.log`） | ブロックをログの出力で置き換えた |
| 270〜305行目（eval の表） | Total Tokens 17,489（16,050 prompt） | 16,663（16,055 prompt）、3 passed、終了コード 100（`run/04.log`） | ブロックをログの出力で置き換えた |
| 369〜380行目（`show-failures.ts`） | 太字と「分類:」が付いたのは3件目だけ | 1件目と3件目に付いた（`run/05.log`） | ブロックを置き換え、384行目を「1件目と3件目は」に直した |
| 392〜396行目（2回目） | 2件目の途中に太字 | 2件目の先頭に「**分類: bug**」（`run/07.log`）。合格3件と終了コード 100 は同じ（`run/06.log`） | 392行目を書き直し（72字になったので2文に分けた）、引用の1行を `run/07.log` から写した |
| 当時の406、414〜417行目（トークン数） | 17,489 と 17,201、なしの設定は 31,477 / 29,913 | 16,663 と 17,829（`run/04.log`、`06.log`）、なしは 31,708 / 29,916（`run/08.log`）。合否は同じ3件 | 数値を直した。見出しの「ほぼ半分」は 16,663 / 31,708 でも当たる |
| 423行目（cost） | 0.00236732 ドル | 0.00268162 ドル、`costBasis=claude-haiku-5-5:list`（`run/12.log`） | 数値を直した。`sources.md` と `code/README.md` も同じ値にした |

再実行のあとの結果: `lint/ai-smell.txt` 判定「✅ 致命なし」、use 0件、mention 0件、`exit=0`。`lint/writing-lint.txt`「### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0」、`exit=0`。`lint/prose-check.txt`「sentences=236 long(>60)=0 max=60 plain=0 … issues=0」。`lint/check-code-and-outputs.txt`「ALL OK」。ログと原稿に、アカウント名、メールアドレス、セッションの ID、組織の ID、API キーは0件（ログイン中のアカウントの値そのものと、`sk-ant`、`Bearer`、メールアドレスの正規表現で `grep` して確かめた）。

ゲートの数（再実行のあと）: OK 46（G01〜G06、G08、G09、C01〜C38）、任意・あり 1（C39）、NG 2（G07、G10）。判定が変わった項目は無い。

## 2026-11-11 の修正

オーナーの裁定（2026-11-11。余計な文を足さない趣旨）と、スキルの「Agent SDK の `query()` には `strictMcpConfig: true` を…必ず付ける」に合わせて直した。

| 箇所（2026-11-10 の版の行） | 直したこと | 根拠 |
|---|---|---|
| 当時の101〜107行目（見出し「プランで動かしてよいのは、自分で試す範囲です」と3段落） | 消した。利用枠から引かれる事実は396行目（旧402行目）に残っている | 裁定。fix-round-brief の Fix A |
| 431〜435行目（見出し「ほかの人に使わせるなら API キーで動かす」と2段落） | 消した。437行目の「このプロバイダーは、`ANTHROPIC_API_KEY` か設定の `apiKey` でキーを受け取ります」の2文は技術の事実なので、`apiKeyRequired: false` の節（今の231行目）へ移した。語は足していない | 同上 |
| 出典12（Legal and compliance） | 引く文が無くなったので、表、frontmatter、`sources.md` から外し、13〜16を12〜15に詰めた | 同上 |
| 設定ファイル（今の180行目） | `strict_mcp_config: true # claude.ai のコネクタのツールを読み込まない` を足した。`code/promptfooconfig.yaml` と `code/extra/promptfooconfig.no-system-prompt.yaml` も同じ。`code/extra/check-auth.ts` の `query()` に `strictMcpConfig: true` と同じコメントを足し、init の `tools` と `mcp_servers` の数を表示するようにした | promptfoo 0.125.1 の dist `claude-agent-sdk-23bIVI75.js` 507行目 `strictMcpConfig: config.strict_mcp_config ?? true,`、dist の627行目でその options を `query()` に渡す。SDK の `sdk.d.ts` 2416行目 `strictMcpConfig?: boolean;` |
| 233行目（旧241行目） | 「ほかの3行の意味は」を「ほかの行の意味は」にした（設定の行が1つ増えたため） | 設定ファイルの行の数 |
| 出力と数値 | `run/14.log`〜`23.log` の値に置き換えた（インストール 44s、eval 8,185 / 7,841、2回目 8,129、なしの設定 28,013 / 27,745、cost 0.00133430 ドル）。見出しを「ほぼ半分」から「3分の1以下」にした。378行目と386行目の文を新しい出力に合わせた | `run/15.log`、`17.log`〜`22.log` |
| frontmatter | `run_environment` を Node.js 22.23.4、npm 10.9.9、macOS arm64 に、`verified_at` と `updated` を 2026-11-11 にした。77行目「検証は 22.23.4 で行いました」 | `run/14.log`〜`23.log` の3行目、`uname -sm` |

前の実行（2026-11-10、`run/04.log`）とトークン数が半分ほどに変わった（16,663 から 8,185）。`strict_mcp_config` は promptfoo 0.125.1 では書かなくても `true`（上の507行目）なので、この1行は前の実行と同じ動きを明示しただけで、差の原因ではない。同じ端末で `strict_mcp_config: false` にした設定でも1回動かし、6,904（6,557 prompt）と同じ水準だった（ログはスクラッチに置いて消した。記事には使っていない）。差は実行した端末の違い（前は Linux x86_64、今回は macOS arm64）と同時に起きていて、どこから来たかは確かめていない。

行番号の対応（2026-11-10 の版 → 今の版）: 1〜47行目は同じ、51〜99行目は −3、108〜190行目は −11、191〜240行目は −10、242〜281行目は −8、284〜285行目は −5、288〜429行目は −6、438〜457行目は −14、463〜467行目は −15。

修正のあとの結果: `lint/ai-smell.txt` 判定「✅ 致命なし」、use 0件、mention 0件、`exit=0`。`lint/writing-lint.txt`「### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0」、`exit=0`。`lint/prose-check.txt`「sentences=222 long(>60)=0 max=60 plain=0 … issues=0」。`lint/check-code-and-outputs.txt`「ALL OK」（14ブロック、数値20件、終了コード22件、UUID 0件）。

ゲートの数（2026-11-11 の修正のあと）: OK 46（G01〜G06、G08、G09、C01〜C38）、任意・あり 1（C39）、NG 2（G07、G10）。判定が変わった項目は無い。

## 2026-11-14 3回目（まとめの節を足したあと）

C04 を NG から OK に変えた（429〜431行目に「## まとめ」を追加）。出典の表は433〜453行目、末尾の1行は455行目に動いたので、G05、G08、C39 の行番号を直した。lint 2本、`prose-check.py`、`check-code-and-outputs.py` を回し直した（`lint/` に保存済み）。

ゲートの数（行を数え直した）: OK 48（G01〜G10、C01〜C38）、任意・あり 1（C39）、NG 0。
