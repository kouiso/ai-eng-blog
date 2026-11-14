# gate: claude-agent-sdk-streaming

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


判定日: 2026-11-11（直しの回で再判定）。原稿: `content/articles/claude-agent-sdk-streaming.md`（292行。行番号はすべてこの版）。

直しの回（2026-11-11）: オーナーの裁定に合わせ、利用の条件を書いていた見出しと2段落（旧73〜77行目）と、その根拠だった旧出典5（Legal and compliance）を消して出典を5〜7に詰めた。2つの `query()` に `strictMcpConfig: true` を足し、記事の手順を最初から撮り直して（`run/09.log`〜`17.log`）、出力と数字を新しいログに替えた。新しいログでは thinking のブロックが届かなかったので、thinking の節は今回のログと出典2で言えることだけに書き直した。直しの回で、G01、G02、G04、G05、G07、G08 と、行番号や数字が変わった B の行を、行が指すガイドの節を読み直してから判定し直した（guides/01 §3 リード文と §5 内部リンク、guides/02 共通の原則、guides/03 不在1・不在2（症状①）・沈黙の不在、guides/04 重言、guides/05 §1 文の長さと §4 曖昧表現の具体化）。

## 判定の前に読んだもの

2026-11-11 に、次を Read ツールで全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）、`06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `.claude/skills/write-article/SKILL.md`（394行。Read ツールの上限に当たったので 1〜200行と 200〜394行の2回で全行）、`content/plan.md`（95行、Read で全文）、`CLAUDE.md`
- 手本の記事 `content/articles/claude-agent-sdk-first-agent.md` と `logs/claude-agent-sdk-first-agent/` の brief、selection、run、code、lint、gate

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。`keywords/README.md` は読んでいない（`ls keywords/` で CSV が無いことだけを確かめた）。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、最終行 `exit=0`。frontmatter（1〜41行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `292行/117文`、判定行 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、最終行 `exit=0`。DENSITY は10カウンタすべて0回。WATCH の節なし、SHOULD 0件、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Agent SDK や `claude -p` の記事は、オーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 記事のコードは Agent SDK だけで、Messages API を直接呼ばない（`needs_api_key: false`、37行目）。2つの `query()` はどちらも `strictMcpConfig: true` 付き（`lint/check-code-and-outputs.txt` の `query() 2 / strictMcpConfig 2`）。オーナー自身の Claude プランでログイン済みの環境で実行した。`lint/check-code-and-outputs.txt` ALL OK: 記事のコードブロック10個が、記事の順に `run/10.log` の command と出力、インストールの4コマンド（`mkdir`、`cd`、`run/11.log`、`run/12.log` の command）と `run/12.log` の出力、`code/stream.ts`、`run/13.log` の command と出力、`code/timing.ts`、`run/14.log` の command と出力に、1文字も違わない（出力はログの末尾の改行1つだけ除いて比べた）。実行は `code/extra/run-all.sh`（ずらし幅 8）で、記事の手順どおり。`run/09.log`〜`17.log` はすべて `exit=0`、node v22.23.4 / npm 10.9.9 / Darwin arm64、claude-agent-sdk 0.3.322 / bundled Claude Code 2.1.322、`ANTHROPIC_API_KEY: unset`。モデルを呼んだ `run/14.log`、`15.log`、`17.log` の init は `apiKeySource=none`。型は `run/16.log`（tsc 7.0.2、`tsc_exit=0`）。`run/17.log` で `strictMcpConfig=true` の3回は init の `mcp_servers=0`（付けない3回は24）。`run/01.log`〜`08.log` は足す前のコードの記録で、根拠に使っていない。npm は `~/.npmrc` を読ませずに既定の設定で動かした（理由は `code/README.md`） |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 278〜290行目に出典の表（7件、題名、URL、確認日 2026-11-11）。断定した文は（出典n）で表を引く（43、53、54、58、68、123、125、131、221、239、241、245、247、249、251、268、274、276行目）。表の番号はすべて本文で引かれ、引かれた番号はすべて表にある（1〜7。frontmatter の `sources` も7件）。文ごとの対応と、実行ログを根拠にした文（時刻、個数、字数）は `sources.md`。料金は、プランの利用枠から引かれること（274行目、出典5）と Pro が月払いで月20ドル（54、276行目、出典6）を書いた。コードは `total_cost_usd` を表示しないので、見積もりの値には触れなかった（276行目）。frontmatter 9〜11行目の `cost_estimate`（本文と同じ内容）、`run_environment`（`run/*.log` の見出しの行と `run/16.log` の `Version 7.0.2` と一致）、`verified_at: "2026-11-11"`（撮り直しの日。手元の `date +%F` は 2026-11-11、ログの `date:` は UTC で 2026-11-12T01:0x） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | guides/01 §1「検索意図」と §5 を読んで判定。2026-11-11 に `content/articles/` は26本（この記事のほか25本）。`grep -l -i 'includePartialMessages\|stream_event\|text_delta'` はこの記事だけを返す。#17（導入と `query()` のメッセージの読み方）とは、メッセージの種類と SDK の入れ方を省き（56行目）、足すのは `stream_event` だけにした。#18（上限で止める）、#27（`outputFormat`）とも扱う機能が重ならない。表は `selection.md` |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | OK | 2026-11-14 に #31 で判定し直した。公開の順（`content/plan.md` の「公開の順番」）で2番。本文の内部リンクは1件で、リンク先はすべて自分より前の順番: 47行目 `/posts/claude-p-script-first-call`（1番）。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。frontmatter は `prev: claude-p-script-first-call`、`next: llm-api-cost-estimate-js-tiktoken` のまま。次の記事への本文リンクは外した。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 292行目「AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。」。日付は撮り直し（`run/09.log`〜`17.log`）の手元の日付と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 秘密情報: 原稿と `logs/claude-agent-sdk-streaming/` の全ファイルに `sk-ant`、`password`、`secret`、`/Users/`、`tmp/claude`、`scratchpad`、`session_id`、メールアドレスの形、UUID の形（`[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}`）を Python の正規表現で大文字小文字を区別せずにかけた。当たったのは、メールアドレスの形に似たパッケージ名と版 `claude-agent-sdk@0.3.322` だけ（原稿、`sources.md`、`code/README.md`、`run-all.sh`、`run/04.log`、`run/12.log`）。直しの回で増えた `run/09.log`〜`17.log`、`code/extra/compare-strict.ts` にも同じ検索をかけ、ほかの当たりは0件（`gate.md` のこの行の検索語を除く）。`run/17.log` は MCP サーバーとツールの数だけを出し、名前を出していない。値としての API キーやトークンは0件。環境変数の名前 `ANTHROPIC_API_KEY` は出るが値は無い。コードは init の `session_id` と `cwd` を表示しない。作業フォルダのパスは `<work>`、型の確認用のフォルダは `<tc>`、ホームのパスは `~/` に置き換えて保存した。個人名: git のコミット作者名とメールアドレスのローカル部（Claude と Anthropic の分を除く）、ユーザーの GitHub アカウント名、ユーザーの名前（漢字と英字の姓・名）、組織名の計9語を、原稿と `logs/claude-agent-sdk-streaming/` の全ファイルに大文字小文字を区別せずにかけて0件（語そのものはここに書かない） |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する。CSV が無い、または null なら不合格 | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-llm-api.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計（→ 01-seo-for-dev-blogs.md） | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭と §1 を読んで判定。`brief.md` の「C01 の1行」 |
| C02 | 設計（→ 01-seo-for-dev-blogs.md） | タイトルにキーワードが含まれ、具体的（「徹底解説」「完全ガイド」を使っていない） | OK | guides/01 §3「タイトルの作り方」を読んで判定。2行目のタイトルは「LLM」「ストリーミング」「1文字ずつ表示」を前方に置き、使う機能 `includePartialMessages` を【】に入れた。「徹底解説」「完全ガイド」は `prose-check.txt` で0件 |
| C03 | 設計（→ 01-seo-for-dev-blogs.md） | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文」を読んで判定。43行目で `includePartialMessages: true` を足すと途中の文字が届くこと、45行目で条件分岐3つのコードと実測の時刻（5回測って最初の文字が出るまで1,655〜2,445ミリ秒）、47行目で API キー不要と前の記事を示した |
| C04 | 設計（→ 01-seo-for-dev-blogs.md） | 検索意図のタイプ（やり方/エラー/比較/概念）に構成が合っている | OK | guides/01 §1 と guides/02 タイプ1を読んで判定。やり方に合わせてチュートリアルの骨格（前提 49行目、セットアップ 70行目、実装 92行目、動作確認 146行目、判断と次 253行目、292行目）。各手順にコードと実行結果を組にした |
| C05 | 構成（→ 02-article-structures.md） | 結論先行になっている（答え → 理由 → 詳細） | OK | guides/02「共通の原則」1を読んで判定。リードで答え（オプション1つ、条件3つ、時刻）を先に出し、理由（イベントの順番）と詳細（thinking、assistant、result）を後に置いた。各 H2 の1文目も結論（例 123行目「ストリーミングのために足したのは…1行です」、255行目「完成する時刻は早くなりません」） |
| C06 | 構成（→ 02-article-structures.md） | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通原則2を読んで判定。見出し（49、70、92、146、223、233、243、253、272行目）を順に読むと、前提、入れ方、書き出し、順番の確認、差分、thinking、assistant、効果、料金と流れる |
| C07 | 構成（→ 02-article-structures.md） | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通原則4と guides/03 症状②を読んで判定。見出しは「前提は…」「SDK は 0.3.322 に固定して入れる」「文字は1,486ミリ秒のあいだに73回に分かれて届いた」「thinking のブロックが先に届く実行もある」「ストリーミングで縮むのは、最初の文字が出るまでの待ち時間」など内容を言い切る形。「まず〜する」型は0件 |
| C08 | 構成（→ 02-article-structures.md） | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1の肝を読んで判定。2本とも import から全文を載せた。インストールの手順も全部載せた（75〜79行目）。実行結果は撮り直したログ（`run/12.log`、`13.log`、`14.log`）から写した。`lint/check-code-and-outputs.txt` ALL OK |
| C09 | AI臭（→ 03-anti-ai.md） | 書き手の態度が感じられる（全部同じ温度になっていない） | OK | guides/03 不在1を読んで判定。時刻の実測と届く順番に字数を割き（223〜251行目）、SDK の入れ方は省いて短くした（56行目）。使い分けの判断（263〜268行目）を書いた |
| C10 | AI臭（→ 03-anti-ai.md） | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2（症状①ヘッジ）を読んで判定。49→51「用意するものは2つです」、70→72「0.3.322 に固定します」、92→123「足したのは…1行です」、146→150「1個ずつは表示しません」、223→229「届く個数と時刻は、実行のたびに変わります」、233→241「`stream.ts` の条件を通りません」、243→245「`assistant` は届きます」、253→255「完成する時刻は早くなりません」、272→274「プランの利用枠から引かれます」 |
| C11 | AI臭（→ 03-anti-ai.md） | ヘッジ（〜でしょう/かもしれません）が過剰でない | OK | guides/03 症状①を読んで判定。`prose-check.txt` で「でしょう」「かもしれ」「可能性があります」0件 |
| C12 | AI臭（→ 03-anti-ai.md） | メタ発言（〜を解説します/見ていきましょう）を削った | OK | guides/03 症状②を読んで判定。「解説します」「紹介します」「見ていき」「ここでは」0件（`prose-check.txt`）。ai-smell-lint の②も0件 |
| C13 | AI臭（→ 03-anti-ai.md） | 章境界アナウンス（ここから〜/ここまで〜してきました/次は〜）が無い | OK | guides/03 症状⑫を読んで判定。「ここから」「ここまで」「次は」「整理」0件。「まとめ」1件は43行目の動詞「まとめて返します」で章境界ではない（`judgments.md`） |
| C14 | AI臭（→ 03-anti-ai.md） | テンプレ比喩（地図/土台/車の両輪/潤滑油/スパイス…）を使っていない | OK | guides/03 症状⑬を読んで判定。「地図」「仕様書」「設計書」「レシピ」0件（`prose-check.txt`）、ai-smell-lint の⑬も0件。比喩は使っていない |
| C15 | AI臭（→ 03-anti-ai.md） | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧を読んで判定。地の文で「ではなく」「ではありません」「じゃない」0件、writing-lint の B-1 0回 |
| C16 | AI臭（→ 03-anti-ai.md） | 文長に緩急がある（短文と長文が混ざっている） | OK | guides/03 不在4を読んで判定。`prose-check.txt` の C16 行 地の文87文、最短12字、最長60字、20字以下10文、41〜60字41文。1文の段落（51、270行目）も挟んだ |
| C17 | AI臭（→ 03-anti-ai.md） | 同じ語尾が3回以上連続していない | OK | guides/03「語尾の反復チェック」を読んで判定。`prose-check.txt` の C17 行 3字の判定 0件、2字の判定（参考）は1件（56行目） |
| C18 | AI臭（→ 03-anti-ai.md） | 一文を短くしすぎて主語・目的語を削っていない（ブツ切り回避） | OK | guides/03 症状⑮を読んで判定。目視で全文を読み、主語と目的語を削った体言止めの連続は無い。短い文（51行目「用意するものは2つです」など）も主語を持つ |
| C19 | AI臭（→ 03-anti-ai.md） | ですます/である調が統一されている（常体落ちが無い） | OK | guides/03 症状⑮と guides/05 §7「文体の統一」を読んで判定。`prose-check.txt` C19 `non-desumasu prose=0`。writing-lint の B-10 文体混在も超過なし。箇条書きの「取る」2項目（265、266行目）は一覧の項目で、guides/05 §6 の「各項目の文法構造を揃える」に従った |
| C20 | コロケーション（→ 04-collocation.md） | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」を読んで判定。該当の名詞は本文に出ない。「縮むのは…待ち時間」（253行目の見出し）は量の変化の動詞で合う（「差は広がります」は長い答えを測っていないため削った） |
| C21 | コロケーション（→ 04-collocation.md） | 漢語サ変動詞の助詞（が/を）が合っている（速度が向上する／速度を向上させる） | OK | guides/04「自動詞・他動詞の取り違え」を読んで判定。「API キーが優先されます」（58行目）、「文字列が一致しました」（251行目）など、が格の自動詞で合う |
| C22 | コロケーション（→ 04-collocation.md） | 形容詞と名詞が合っている（理解は深い、精度は高い） | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」を読んで判定。形容詞の用例は「長い答え」（261行目）「別の種類」（241行目）で合う |
| C23 | コロケーション（→ 04-collocation.md） | 重言が無い（まず最初に／throwを投げる／約〜程度） | OK | guides/04「重言」を読んで判定。「まず最初」0件（`prose-check.txt`）。「約〜程度」「約〜ほど」も無い（「約1.5秒」「約1.3秒」「約20ミリ秒」「5字ほど」は単独で使った） |
| C24 | コロケーション（→ 04-collocation.md） | 翻訳調が無い（影響を作る → 影響を与える） | OK | guides/04「翻訳調」を読んで判定。目視で「〜を作る」「〜を持っている」の翻訳調は無い。268行目「文字列を持ちません」は型のフィールドの有無を言う文で、型定義の表現に合わせた |
| C25 | 正確さ（→ 05-technical-writing.md） | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」を読んで判定。`prose-check.txt` 2行目 `C25 over60=0 max=60`（インラインコード、リンクの URL、title、description を含めて数えた）。最初の版の13文と、直しの回の書き換えで出た2文を分けるか語を削った（`judgments.md`） |
| C26 | 正確さ（→ 05-technical-writing.md） | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」を読んで判定。届く文字の単位は「差分」（イベント名は `text_delta`）、時刻は「開始からのミリ秒」、メッセージの種類はコードの値（`stream_event`、`assistant`、`result`）で通した。内部リンクは47行目の「前の記事」1件だけ |
| C27 | 正確さ（→ 05-technical-writing.md） | 数量・期間が具体的な数値（早めに → 1週間以内に） | OK | guides/05 §4「曖昧表現の具体化」を読んで判定。時刻と個数はミリ秒と個数で書いた（1,743、3,243、1,486、73個、341字、1,655、2,948、63個、293字、1,924、2,445、1.7〜4.1秒、約1.5秒、約1.3秒、約20ミリ秒）。版は 0.3.322、22.18.0、22.23.4 |
| C28 | 正確さ（→ 05-technical-writing.md） | AND/ORが明確（「AやB」で曖昧にしていない） | OK | guides/05 §4「AND/ORの明確化」を読んで判定。「や」の並列は0件（`prose-check.txt`）。54行目「Pro、Max、Ultra のどれか」は OR を明示 |
| C29 | 正確さ（→ 05-technical-writing.md） | ですます/である調が混在していない | OK | C19 と同じ根拠 |
| C30 | 記号（→ 03-anti-ai.md） | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` `PAT bold **: 0` |
| C31 | 記号（→ 03-anti-ai.md） | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03「記号NG」を読んで判定。em-dash、罫線、U+2015 いずれも0件 |
| C32 | 記号（→ 03-anti-ai.md） | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03「記号NG」を読んで判定。全角コロン0件、全角スラッシュ0件 |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | guides/03「lint との関係」を読んで判定。G01 と同じ根拠 |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。warn 0件。判断の記録は `judgments.md` |
| C35 | 機械チェック | FATAL/warnが「自分が使っている(use)」か「悪い例の引用(📎mention)」かを確認した（引用なら合格） | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。use 0件、mention 0件。frontmatter の mention も0件 |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」を読んで判定。悪い例の引用は書いていない（該当なし） |
| C37 | 最後の一押し（人間にしかできない） | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。実際に動かした結果（`run/14.log` の届く順番と時刻、`apiKeySource=none`）、2回の実行の比較（`run/14.log` と `run/15.log` で差分の個数と時刻が違った、229行目）、そこから下した判断（縮むのは最初の文字までの時間 253〜259行目、画面は `text_delta`、保存は `result` 263〜268行目）。thinking の間の表示の切り替え方（241行目）は出典2の記述で、動かして確かめた結果ではないので、この項目の根拠には数えない |
| C38 | 最後の一押し（人間にしかできない） | コードを実際に動かして確認した | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。G04 と同じ根拠（`run/09.log`〜`17.log`、`lint/check-code-and-outputs.txt` ALL OK）。オーナーの Claude プランで実行した |
| C39 | 最後の一押し（人間にしかできない） | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | guides/03「沈黙の不在」を読んで判定。270行目「あなたのアプリでは、最初の文字が出るまでの待ち（この環境では1.7〜4.1秒）をどう見せますか。」で節を閉じた（1か所） |

## 結果

A は G07（リンク先が未公開）が NG。G10 は OK（`target_query` を決めた）。G11 は未点検。ほかは OK。記事は `status: draft`。
