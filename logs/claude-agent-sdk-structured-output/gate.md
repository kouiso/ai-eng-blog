# gate: claude-agent-sdk-structured-output

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


判定日: 2026-11-11。原稿: `content/articles/claude-agent-sdk-structured-output.md`（402行。行番号はすべて 2026-11-14 に数え直した今の版）。

直しの回（2026-11-11、`.omc/fix-round-brief.md`）: 利用条件の注意書き（旧83〜87行目）を消し、コネクタの外し方を `strictMcpConfig: true` に揃えてコードを全部動かし直した。lint、`check-code-and-outputs.py`、`prose-check.py` を回し直し、行番号と根拠が変わる行（G01、G02、G04、G05、G07、G08、G09、C03〜C06、C08〜C13、C16、C18、C20、C24、C25、C27、C28、C36〜C39）を書き直した。

## 判定の前に読んだもの

2026-11-11 に、次を Read ツールで全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）、`06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `.claude/skills/write-article/SKILL.md`（394行。Read で2回に分けて全行）、`content/plan.md`（Read で全文。#6 の行は書き換え後の版を 47行目で読み直した）、`CLAUDE.md`、`.omc/plan-only-rewrite-brief.md`
- 手本: `content/articles/claude-agent-sdk-first-agent.md` と `logs/claude-agent-sdk-first-agent/` の brief、selection、code、run、lint、gate

直しの回では、書き直した行が指すガイドの節（guides/02 タイプ1、guides/03 5つの不在と「引用（mention）と使用（use）の区別」、guides/05 §1 と §4、guides/06「使い方の流れ」、guides/08 密度基準総表、guides/09 §2）を Read で読み直した。

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。lint のスクリプトのソースは読んでいない。出力の読み方はスキル手順7の表に従った。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」を 2026-11-11 の直しの回で読み直して判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `判定: ✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜47行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を直しの回で読み直して判定。`lint/writing-lint.txt` 1行目 `402行/134文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY は10カウンタすべて0回。WATCH なし、SHOULD 0件、INFO 0件（`lint/judgments.md`） |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Agent SDK や `claude -p` の記事は、オーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 記事のコードは Agent SDK と zod だけで、Messages API を呼ばない（`needs_api_key: false`、43行目）。3本とも `query()` の `options` に `strictMcpConfig: true`（`sdk.d.ts` 0.3.322 の `Options.strictMcpConfig?: boolean` を確かめた）。直しの回（2026-11-11）に `code/extra/run-all.sh`（第4引数 18）で記事の手順どおり全部動かし直し、`run/18.log`〜`33.log` を足した（1回目の `run/01`〜`17` は残した）。`lint/check-code-and-outputs.txt` が ALL OK: 記事のコードブロック18個が、記事の順に `code/` の3ファイル、`run/` の command 行、`run/` の出力と1文字も違わない（出力はログ末尾の改行1つを除いて比べた。18個目は `run/27.log` の出力の1行と一致する抜粋）。`run/18`〜`26`、`28`〜`33` は `exit=0`、`run/27` は期待どおり `exit=1`（`target` を外した版が起動時に止まる）。node v22.23.4 / npm 10.9.9 / Darwin arm64、claude-agent-sdk 0.3.322 / bundled Claude Code 2.1.322 / zod 4.6.7、`ANTHROPIC_API_KEY: unset`。モデルを呼んだ `run/23.log` の init は `apiKeySource=none`、`run/31`〜`33` も `apiKeySource=none`。型は `run/28.log`（tsc 7.0.2、`tsc_exit=0`）。`run/17.log` は探索の段階の実行を名前を伏せて残したもの（`code/README.md`） |
| G05 | 断定した事実すべてに一次情報の出典があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 出典の表は 390〜400行目（9件、URL と確認日 2026-11-11）。直しの回で使われなくなった2件（Legal and compliance、MCP のページ）を表、frontmatter の `sources`、`sources.md` から外し、番号を詰めた。本文の（出典n）は41か所で、引かれている番号は1〜9、表の行も1〜9で過不足なし（スクリプトで確かめた）。出典の無い文は、実行で見た事実（`run/` が根拠。`sources.md` の「実行で確かめた事実」）か、書き手の判断（376行目の問い）。料金は 378〜384行目（プランの利用枠から引かれる、`total_cost_usd` は見積もり、Pro は月払いで月20ドル）。`cost_estimate`（9行目）は本文と同じ内容。`run_environment`（10行目）は `run/` のヘッダー（Node.js 22.23.4、npm 10.9.9、SDK 0.3.322、Claude Code 2.1.322、zod 4.6.7、Darwin arm64）と `run/28.log`（TypeScript 7.0.2）と一致。`verified_at` 2026-11-11 は直しの回の実行日（ローカルの `date +%F`。ログの `date` は UTC で 2026-11-12T01:0x）と、402行目の日付と一致 |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | `selection.md` の表。29本の frontmatter を読み、`outputFormat` などで grep した4本は本文を読んだ。#7、#8、#27 とは扱う範囲を分け、リンクで任せた |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | NG | 2026-11-14 に #31 で判定し直した。公開の順（`content/plan.md` の「公開の順番」）で6番。本文の内部リンクは1件で、リンク先はすべて自分より前の順番: 55行目 `/posts/claude-code-api-key-billing-auth`（5番）。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。frontmatter は `prev: claude-code-api-key-billing-auth`、`next: zod-validate-llm-json-output` のまま。次の記事への本文リンクは外した。公開時に既存記事が3本以上あるのに関連記事のリンクが無い。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」を含む決まった表記 | 原稿の末尾 | OK | 402行目「AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。」日付は直しの回の実行日（`run/18`〜`33`、ローカルの日付）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 直しの回に、原稿と `logs/claude-agent-sdk-structured-output/` の全ファイルに、ユーザーの名前（漢字とローマ字）、ユーザーの GitHub アカウント名、組織名、`sk-ant`、セッションの ID の接頭辞、claude.ai のコネクタのツール名の接頭辞をかけ、原稿は全部0件。ログは `sk-ant` が `code/README.md` の説明文1行とこの `gate.md` の説明だけ（文字列の説明で、キーではない）。`run/10.log` と `run/27.log` の SDK の圧縮済みソースの行は注記に置き換え、コネクタの名前は `run/17.log` で数に置き換えた。`npm run secret-scan` は `484 changed file(s) scanned, 3 finding(s)` で、3件はどれも別の記事（`llm-api-429-retry-sdk-mock`）のファイル。この記事の原稿とログには0件 |
| G10 | `target_query` が `keywords/*.csv` の行のキーワードと一致する | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-structured-output.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計 | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭と §1。`brief.md` の「C01 の1行」 |
| C02 | 設計 | タイトルにキーワードが含まれ、具体的 | OK | guides/01 §3 タイトルの作り方。2行目に JSON、Agent SDK、outputFormat、JSON Schema。「徹底解説」「完全ガイド」は無い（`prose-check.txt` PAT 0）。60字 |
| C03 | 設計 | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3 リード文。49〜53行目で、`outputFormat` を使う、答えは `structured_output` に入る、満たせないときと zod も扱う、を先に言う |
| C04 | 設計 | 検索意図のタイプに構成が合っている | OK | guides/01 §1、guides/02 タイプ1。やり方の検索にチュートリアルの骨格（前提 57行目、セットアップ 77行目、手順 113・196・299行目、各手順にコードと実行結果） |
| C05 | 構成 | 結論先行 | OK | guides/02 共通原則1。49行目に答え、各 H2 の直下も結論から（113、196、299行目の節名が結論） |
| C06 | 構成 | 1見出し1トピック。見出しで流れがわかる | OK | guides/02 共通原則2。H2 8本、H3 7本（`grep -c`。直しの回で H3「プランで動かしてよいのは、自分で試す範囲です」を消した）。前提、入れ方、渡し方、満たせないとき、zod、違い、料金、出典の順 |
| C07 | 構成 | 見出しが内容で書かれている | OK | guides/02 共通原則4、guides/03 症状②。「outputFormat に JSON Schema を渡すと structured_output に入る」「success なのに structured_output が無い」など内容を言い切る形。作業実況の見出しは無い |
| C08 | 構成 | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 チュートリアルの肝を直しの回で読み直して判定。3本とも import から全文で、`strictMcpConfig: true` の行も記事と `code/` で同じ。インストールのコマンドと `type=module` も載せた。実行結果は直しの回の `run/19`〜`27` から写した（`lint/check-code-and-outputs.txt` ALL OK） |
| C09 | AI臭 | 書き手の態度が感じられる | OK | guides/03 不在1を直しの回で読み直して判定。268行目「`subtype` だけで成功を判定すると、この結果を通してしまいます」、289行目付近「`try` で囲んでおかないと、プロセスごと止まります」、295行目の `due_date` を必須のまま null にした判断。補足の節（291行目）とコネクタの節（192行目）は短く、満たせないときの節は長くした |
| C10 | AI臭 | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2。各 H2、H3 に断定文がある（例 180、186、194、198、287、354、366、380行目） |
| C11 | AI臭 | ヘッジが過剰でない | OK | guides/03 症状①。「でしょう」0件、「かもしれ」0件（`prose-check.txt`）。「まず」「おそらく」「はずです」「だろう」の言い回しは本文に0件 |
| C12 | AI臭 | メタ発言を削った | OK | guides/03 症状②。「解説します」「見ていきましょう」「紹介します」0件。53行目「〜も扱います」はリードの範囲の明示（guides/05 §3 でリード文は例外） |
| C13 | AI臭 | 章境界アナウンスが無い | OK | guides/03 症状⑫。「ここから」「ここまで」「次は」「まとめ」「整理」0件（`prose-check.txt`）。402行目は末尾の決まった表記で、章の予告ではない。次の記事への本文リンクは外した（G07） |
| C14 | AI臭 | テンプレ比喩を使っていない | OK | guides/03 症状⑬。地図、仕様書、設計書、レシピ 0件。比喩そのものを使っていない |
| C15 | AI臭 | 対比構文が2回以上出ていない | OK | guides/03 症状⑧。「ではなく」「ではありません」「じゃない」0件。writing-lint の B-1 対比構文 0回 |
| C16 | AI臭 | 文長に緩急がある | OK | guides/03 不在4。地の文97文で最短13字、最長60字、20字以下10文、41〜60字40文（`prose-check.txt` 3行目、直しの回の版）。1文だけの段落もある（384行目） |
| C17 | AI臭 | 同じ語尾が3回以上連続していない | OK | guides/03 語尾の反復チェック。3字の語尾の3連続0（`prose-check.txt`）。2字の「ます」「です」は基調そのもの（`lint/judgments.md`） |
| C18 | AI臭 | ブツ切り回避 | OK | guides/03 症状⑮。主語と目的語を削った体言止めの連続は無い。箇条書き（61〜63行目）の前に導入文（59行目）がある |
| C19 | AI臭 | ですます/である調が統一されている | OK | guides/03 症状⑮。地の文の文末はすべてですます（`C19 non-desumasu prose=0`）。writing-lint の FATAL・DENSITY にも文体混在なし |
| C20 | コロケーション | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04 動詞と目的語。「エラー」は「表示されたエラーのうち」（356行目）で、動詞との組のずれは無い。「問題」は使っていない |
| C21 | コロケーション | 漢語サ変動詞の助詞が合っている | OK | guides/04 自動詞・他動詞。「検証した値」「変換することもできます」「判定すると」など、他動詞は「を」で使っている |
| C22 | コロケーション | 形容詞と名詞が合っている | OK | guides/04 形容詞。形容詞＋名詞の組は「深く入れ子」「難しく」程度で、ずれは無い |
| C23 | コロケーション | 重言が無い | OK | guides/04 重言。「まず最初」0件。「エラーを投げる」でなく「例外を投げました」 |
| C24 | コロケーション | 翻訳調が無い | OK | guides/04 翻訳調。「〜を作る」の直訳は無い。英語の型定義のコメントは「」で引用（382行目） |
| C25 | 正確さ | 60字超の長文を分割した | OK | guides/05 §1 文の長さを直しの回で読み直して判定。インラインコードとリンクの URL を書かれたとおり数えて `C25 over60=0 max=60`（`prose-check.txt` 2行目）。直しの回で縮めたコネクタの節の2文目が最初61字だったので短くした（`lint/judgments.md`）。title と description も60字以下 |
| C26 | 正確さ | 用語が記事全体で統一されている | OK | guides/05 §4 用語の統一。「スキーマ」「JSON Schema」「structured_output」「コネクタ」「利用枠」で統一 |
| C27 | 正確さ | 数量・期間が具体的な数値 | OK | guides/05 §4 曖昧表現の具体化を直しの回で読み直して判定。既定5回、2回ずつ、3回とも、800個、Node.js 22.18.0 以上、月20ドル |
| C28 | 正確さ | AND/ORが明確 | OK | guides/05 §4 AND/OR。62行目「Pro、Max、Ultra のどれか」、182行目「3つの条件」で全部を列挙。190行目は「画面に出す」と「ログに出すときも同じ」を2文に分けた |
| C29 | 正確さ | ですます/である調が混在していない | OK | guides/05 §7 文体の統一。C19 と同じ根拠 |
| C30 | 記号 | `**太字**` のアスタリスク残りが無い | OK | guides/03 記号NG。コードブロック外で0件（`prose-check.txt`） |
| C31 | 記号 | em-dash、罫線を使っていない | OK | guides/03 記号NG。—、─、― 0件（`prose-check.txt`）。writing-lint の B-5 ダッシュ 0回 |
| C32 | 記号 | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03 記号NG。全角コロン、全角スラッシュ 0件（`prose-check.txt`） |
| C33 | 機械チェック | ai-smell-lint の FATAL がゼロ | OK | `lint/ai-smell.txt` `exit=0`、use 0件 |
| C34 | 機械チェック | warn は目視で要否を判断した | OK | warn 0件。lint 以外の候補（「効く」「かもしれ」「だけ」「や」）は `lint/judgments.md` で1件ずつ判断した |
| C35 | 機械チェック | use か mention かを確認した | OK | use 0件、mention 0件（`lint/ai-smell.txt`） |
| C36 | 機械チェック | 悪い例を引用したときの3点 | OK | guides/03「悪い例を引用するときの書き方」。悪い例の引用は書いていないので該当なし。372行目の「JSON で答えて」はプロンプトの例で、悪い例の語の引用ではない |
| C37 | 最後の一押し | 実体験・判断・動作確認した結果が入っている | OK | guides/03 5つの不在、guides/06「使い方の流れ」4を直しの回で読み直して判定。動作確認の結果: 満たせないスキーマで3回とも success で値が無かった（264〜266行目、`run/24`、`29`、`30`）、`MAX_STRUCTURED_OUTPUT_RETRIES` が SDK でも同じ上限になった（272〜287行目、`run/25`）、`target` を外すと起動時に止まった（356〜360行目、`run/27`）、`tools: []` だけではコネクタのツールが800個読み込まれた回があった（1回だけの観察で、記事からは外した。`run/17`）。判断: 268行目の判定の落とし穴、295行目の `due_date` を必須のまま null にした理由 |
| C38 | 最後の一押し | コードを実際に動かして確認した | OK | G04 と同じ根拠（直しの回の `run/18`〜`33`） |
| C39 | 最後の一押し | 問いで終わる箇所（任意） | あり | guides/03 不在5。376行目「あなたのアプリでは、どの項目を必須にして、どの項目を任意にしますか。」 |

## 結果

NG は G07（リンク先が未公開、4本とも原稿はあるが `status: draft`）。G10 は OK（`target_query` を決めた）、G11 は未点検。ほかの G01〜G06、G08、G09 と、B の C01〜C38 は OK（C39 は任意で「あり」）。frontmatter は `status: draft` のまま止める。
