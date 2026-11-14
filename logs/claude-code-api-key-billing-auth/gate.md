# gate: claude-code-api-key-billing-auth

> 2026-11-11 追記: `target_query` を決め、G10 を OK に変えた。この下で G10 を NG、`target_query` を null と書いている箇所は、この追記より前の状態。残る NG は G07 と、まだ点検を受けていない G11。


判定日: 2026-11-11。原稿: `content/articles/claude-code-api-key-billing-auth.md`（347行。行番号はすべてこの版）。

2026-11-11 の直し（`.omc/fix-round-brief.md`）: 利用条件を説明する段落（旧310行目の見出しと旧314、316行目）を消した。`query()` 2か所に `strictMcpConfig: true`、`claude -p` に `--strict-mcp-config` を付け、全ブロックを `run/14.log`〜`26.log` に動かし直した。行番号とログの番号は、この版に合わせて書き直した。

## 判定の前に読んだもの

2026-11-11 に、次を Read ツールで全文読んでから全項目を判定した。

- `docs/tech-writing-pack/checklist.md`（61行）
- `guides/01-seo-for-dev-blogs.md`（192行）、`02-article-structures.md`（173行）、`03-anti-ai.md`（443行）、`04-collocation.md`（265行）、`05-technical-writing.md`（183行）、`06-rewriting-prompts.md`（186行）、`08-ai-buntai-ruleset.md`（266行）、`09-ai-writing-manual.md`（97行）
- `.claude/skills/write-article/SKILL.md`（Read で2回に分けて全394行）、`content/plan.md`（Read で全文。2026-11-11 の作業中の差分は `git diff` で読んだ）、`CLAUDE.md`、手本の `content/articles/claude-agent-sdk-first-agent.md` と `logs/claude-agent-sdk-first-agent/` の brief、selection、gate、code、run、lint
- `.omc/plan-only-rewrite-brief.md`（オーナーの裁定 2026-11-11 の原文が入った、この記事の指示）

`07-ai-buntai-laws.md` と `10-ai-buntai-handoff.md` は、スキルの表で判定の前に読むガイドに入っていないので読んでいない。lint のスクリプトのソースは読んでいない。出力の読み方はスキル手順7の表に従った。

スキルと plan.md には「Messages API の記事は `needs_api_key: true` のまま、キーが入るまで待つ」とある。これはオーナーの裁定（2026-11-11。費用を月額のプランの範囲に収める趣旨）で置き換えられ、この記事は Agent SDK と `claude -p` の記事として書いた（`needs_api_key: false`）。

## A. このリポジトリで足しているゲート

| # | 条件 | 確かめ方と記録先 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | `ai-smell-lint.py` の FATAL が0件。frontmatter の行で出た `📎mention` は use として扱う。warn は1件ずつ判断した | `lint/ai-smell.txt`、`lint/judgments.md` | OK | guides/03「引用（mention）と使用（use）の区別」と「lint との関係」を読んで判定。`lint/ai-smell.txt` 3行目 `✅ クリーン`、4行目 `use 0件 / 📎mention 0件`、5行目 `✅ 致命なし`、10行目 `exit=0`。frontmatter（1〜53行目）の mention も0件。warn 0件（`lint/judgments.md`） |
| G02 | `writing-lint.py` の判定行で FATAL と DENSITY超過がどちらも 0。SHOULD、WATCH、INFO は1件ずつ判断した。個人名は G09 で確かめる | `lint/writing-lint.txt`、`lint/judgments.md` | OK | guides/09 §2 と guides/08 の密度基準総表を読んで判定。`lint/writing-lint.txt` 1行目 `347行/134文`、21行目 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、23行目 `exit=0`。DENSITY は10カウンタすべて0回（6〜15行目）で、上限は guides/08 の標準の列と一致。WATCH の節なし、SHOULD 0件、INFO 0件 |
| G03 | 下の B の全項目を満たす | `gate.md` | OK | B は C01〜C38 がすべて OK、C39（任意）は「あり」 |
| G04 | 記事のコードを記事の形のまま実際に動かし、ログがある。Agent SDK や `claude -p` の記事は、オーナーの Claude プランで動かしたログがあれば合格 | `code/`、`run/` | OK | 記事のコードは Agent SDK、`claude -p`、`claude auth status` だけで、Messages API を呼ばない（`needs_api_key: false`、49行目）。オーナー自身の Claude プランでログイン済みの環境で実行した。`lint/check-code-and-outputs.txt` が `ALL OK`: 記事のコードブロック20個が、記事の順に `run/` の command 行、`run/` の出力、`code/check-auth.ts`、`code/plan-only.ts` と1文字も違わない（出力はログの末尾の改行1つだけ除いて比べた）。`code/*.sh` と `run/` の command 行も一致。実行は `code/extra/run-all.sh` で、記事の手順どおり（`test -n` → `claude auth status` → ダミーのキーで `claude auth status` と `claude -p` → `mkdir key-check` から `npm install` → `node check-auth.ts` → ダミーのキーで `node check-auth.ts` → `.env` を作る → `node --env-file=.env check-auth.ts` → `node --env-file=.env plan-only.ts`）。`run/14.log`〜`26.log` はすべて `exit=0`（16 と 24 の中の `claude -p` の終了コード 1 は `echo` で出力に出している。期待どおり）、2026-11-11（PST。ログの UTC は 2026-11-12T01:01〜01:02）、node v22.23.4 / npm 10.9.9 / Darwin arm64 / claude 2.1.322、claude-agent-sdk 0.3.322 / bundled Claude Code 2.1.322、シェルの `ANTHROPIC_API_KEY: unset`。プランで動いた `run/18.log`、`run/22.log`、`run/25.log` の init は `apiKeySource: none`。型は `run/26.log`（tsc 7.0.2、`tsc_exit=0`）。使ったキーは無効なダミーの `sk-ant-invalid-demo` だけ。`query()` の2か所に `strictMcpConfig: true`、`claude -p` の3か所（記事の1つと `run/23.log`、`run/24.log`）に `--strict-mcp-config` を付けて動かした（インストールした `sdk.d.ts` の `strictMcpConfig?: boolean;` を確かめた）。付けたあとも `⚠ claude.ai connectors are disabled ...` の行は出る（`run/16.log`、`23.log`、`24.log`）ので、記事の出力もそのまま。付ける前の `run/01.log`〜`13.log` は消さずに残した |
| G05 | 断定した事実すべてに一次情報の出典（URL とアクセス日）があり、本文に出ている。料金の目安がある。`cost_estimate`、`run_environment`、`verified_at` が埋まり、ログと一致する | 原稿の出典の表、`sources.md`、frontmatter | OK | 本文 329〜345行目に出典の表（11件、題名、URL、確認日 2026-11-11）。断定した文は（出典n）で表を引く（55、57、83、85、87、96、100、104〜106、130、138、142、215、219、229、233、237、266、297、313、319、323、325行目。`grep -n '（出典'` の結果と照らし合わせた）。実行ログを根拠にした文と出典の対応は `sources.md`。料金は、スキルの「Claude プランで動かす記事」の3に合わせ、プランの利用枠から引かれること（319行目、出典7）、ダミーのキーの呼び出しはトークン数0（136行目、`run/23.log`）、キーで動いた分はキーの持ち主に請求されること（323行目、出典6）、Haiku 5.5 の単価（323、325行目、出典8）を書いた。frontmatter 9〜11行目の `cost_estimate`（本文と同じ内容）、`run_environment: "Node.js 22.23.4、npm 10.9.9、Claude Code 2.1.322、@anthropic-ai/claude-agent-sdk 0.3.322（同梱の Claude Code 2.1.322）、macOS arm64（型の確認は TypeScript 7.0.2）"`（`run/*.log` の見出しの行と `run/26.log` の `Version 7.0.2` と一致）、`verified_at: "2026-11-11"`（`run/14.log`〜`26.log` の日付） |
| G06 | 既存記事と検索意図が重ならない | `selection.md` | OK | guides/01 §1「検索意図」と §2 を読んで判定。`content/articles/` の29本（この記事のほか。2026-11-11 の修正時に `ls` で30ファイルを数えた）の title を全件読み、`Invalid API key`、`auth status`、`--env-file` が出る記事は0本。`ANTHROPIC_API_KEY` と `apiKeySource` は10本に出るが、どれも前提の確認か `none` の1節で、エラーを直す検索意図ではない。#17（`claude-agent-sdk-first-agent` 208行目の見出し）と #1（`claude-p-script-first-call` 210行目の見出し）の「apiKeySource が none なら、API キーは使われていない」の節とは、やり方とエラーで分かれる。#18 の例外の話は221行目の1文とリンクにとどめた（`selection.md` の表） |
| G07 | 講座の前後リンクと、既存記事が3本以上なら関連記事への内部リンク。リンク先は公開済みか先に予約済み | `gate.md` | OK | 2026-11-14 に #31 で判定し直した。公開の順（`content/plan.md` の「公開の順番」）で5番。本文の内部リンクは2件で、リンク先はすべて自分より前の順番: 61行目 `/posts/claude-p-script-first-call`（1番）、59行目 `/posts/llm-api-429-retry-sdk-mock`（4番）。後の順番の記事・原稿の無い記事への本文リンクは0件（リンク数えの台本で `LINKS_TO_LATER=0 LINKS_TO_MISSING=0`）。frontmatter は `prev: llm-api-429-retry-sdk-mock`、`next: claude-agent-sdk-structured-output` のまま。次の記事への本文リンクは外した。 |
| G08 | 本文の最後の段落が「AI 支援で執筆」の決まった表記 | 原稿の末尾 | OK | 347行目「AI 支援で執筆しました。コードは 2026-11-11 に実際に実行して確認しています。」。日付は `run/` の最後の実行（`run/26.log`、2026-11-11）と同じ |
| G09 | 原稿、ログ、frontmatter に秘密情報が無い。原稿に個人名が無い | `gate.md` | OK | 原稿と `logs/claude-code-api-key-billing-auth/` 全体を `grep -r -n -E 'sk-ant-[A-Za-z0-9_-]+'` で調べ、`sk-ant-invalid-demo`（無効なダミーの文字列）以外は0件。原稿を `grep -i -E 'token|password|secret'` で調べて0件。ログは `claude auth status` を `grep` で `authMethod` と `apiKeySource` の行に絞り、メールアドレス、組織名、組織の ID、プランの種類を残していない。個人名は、ユーザーの名前（漢字とローマ字の姓と名）、ユーザーの GitHub アカウント名、ユーザーの会社のドメイン、`@gmail`、ホームの絶対パス `/Users/` の9語を `grep -r -i -c` で原稿とログにかけ、すべて0件。作業フォルダのパスは `<work>`、ホームは `~` に置き換えた |
| G10 | `target_query` が `keywords/*.csv` のどれかの行と1文字も違わない | `selection.md` | OK | `selection.md` の「2026-11-11 追記」。`target_query` は `keywords/google-suggest-llm-api.csv` の `suggestion` の列に一致する行が1つある（2026-11-11 にスクリプトで確認）。ラッコの CSV は無く、サジェストの CSV で選んだ |

## B. checklist.md の全項目

| # | 区分 | 項目 | 判定 | 根拠 |
|---|---|---|---|---|
| C01 | 設計 | 「誰の、どんな検索に答える記事か」が1行で言える | OK | guides/01 冒頭と §1 を読んで判定。`brief.md` の「C01 の1行」（Agent SDK と `claude -p` をプランで使う TypeScript の開発者が、従量課金で動く、Invalid API key が出る、で検索したときに、原因、見分け方、外し方を答える） |
| C02 | 設計 | タイトルにキーワードが含まれ、具体的 | OK | guides/01 §3「タイトルの作り方」を読んで判定。2行目「LLM API が従量課金になる原因と直し方【Agent SDK、claude -p、Invalid API key】」。講座のキーワード「LLM API」を先頭に置き、エラー文 `Invalid API key` をそのまま入れた（guides/02 タイプ3）。「徹底解説」「完全ガイド」は無い（`prose-check.txt` の PAT が0件） |
| C03 | 設計 | リード文の3行で「何が解決するか」が伝わる | OK | guides/01 §3「リード文」を読んで判定。55行目で原因（`ANTHROPIC_API_KEY` がログインより先に使われる）、57行目で影響（従量で請求）と道筋（`apiKeySource` で見分けて外せば直る）を言い切った |
| C04 | 設計 | 検索意図のタイプに構成が合っている | OK | guides/01 §1 と guides/02 タイプ3を読んで判定。エラーの検索意図に、トラブル解決の型で答えた。結論（63行目の節）→ 原因（98行目）→ 再現（110、140行目）→ 原因別の解決策（223行目の節の H3 4つ）。コードは変更前 `check-auth.ts`（`.env` のキーで失敗、254〜260行目の出力）→ 変更後 `plan-only.ts`（270〜295行目、出力は303〜307行目）で対比した。テンプレートのまとめのチェックリストは、結論の節が確かめ方になっているので立てなかった（`brief.md`） |
| C05 | 構成 | 結論先行になっている | OK | guides/02 共通原則1を読んで判定。最初の H2（63行目）が答え（`none` ならプラン、それ以外は外す、`unset`）で、理由（98行目）と詳細（110行目以降）が後に続く |
| C06 | 構成 | 1見出し1トピック。見出しを読むだけで流れがわかる | OK | guides/02 共通原則2を読んで判定。H2 は63、98、110、140、223、317、329行目。順に読むと「none ならプラン → キーが先に使われる → CLI で再現 → SDK で再現 → 出どころ別の直し方 → 料金の出どころ → 出典」になる |
| C07 | 構成 | 見出しが「作業の実況」でなく「内容」で書かれている | OK | guides/02 共通原則4と guides/03 症状②を読んで判定。見出しはどれも中身を言い切る形（例 98行目「キーがあると、ログインより先に使われる」、217行目「subtype だけ見ると、認証の失敗を見逃す」）。「まず〜する」「ステップ」は無い |
| C08 | 構成 | コードはコピペで動く形（import・前提を省略していない／実行結果を示した） | OK | guides/02 タイプ1の肝と guides/01 §4 を読んで判定。2本の `.ts` は import から書いた全体（161〜187、270〜295行目）。前提の Node.js 22.18.0 以上（142行目）、作業フォルダと依存の入れ方（144〜150行目）を書いた。コマンドの全ブロックに実行結果を付けた。G04 の `lint/check-code-and-outputs.txt` が ALL OK |
| C09 | AI臭 | 書き手の態度が感じられる | OK | guides/03 不在1を読んで判定。「スクリプトと Agent SDK は、確認の画面を出しません」（108行目）、「subtype だけ見ると、認証の失敗を見逃す」（217行目）、「作業フォルダの `.env` は疑ってかかるべきです」（233行目）で、どこが危ないかの判断を出した。料金の単価の段落（323、325行目）は短く流した |
| C10 | AI臭 | 各セクションに言い切りの文が最低1つある | OK | guides/03 不在2を読んで判定。63行目の節「`none` 以外はすべて外します」（96行目）、98行目の節「確認の画面を出しません」（108行目）、110行目の節「`authMethod` が `api_key` へ切り替わりました」（128行目）、140行目の節「`is_error` も見てください」（221行目）、223行目の節「`apiKeySource` は `none` に戻りました」（309行目）、317行目の節「プランのログインで動かした Agent SDK と `claude -p` は、プランの利用枠から引かれます」（319行目） |
| C11 | AI臭 | ヘッジが過剰でない | OK | guides/03 症状①を読んで判定。「でしょう」0件、「かもしれ」0件、「可能性があります」0件（`prose-check.txt`）。推量は231行目の「残っているはずです」の1か所で、起動ファイルが原因と決めた直後の確度の表現 |
| C12 | AI臭 | メタ発言を削った | OK | guides/03 症状②を読んで判定。「解説します」「紹介します」「見ていき」「ここでは」0件（`prose-check.txt`）。writing-lint の B-6 メタ談話予告 0回 |
| C13 | AI臭 | 章境界アナウンスが無い | OK | guides/03 症状⑫を読んで判定。「ここから」「ここまで」「次は」「まとめ」「整理」0件（`prose-check.txt`）。347行目は末尾の決まった表記で、章の予告ではない |
| C14 | AI臭 | テンプレ比喩を使っていない | OK | guides/03 症状⑬を読んで判定。「地図」「仕様書」「設計書」「レシピ」0件（`prose-check.txt`）。ほかの比喩（土台、柱、潤滑油、スパイス、車の両輪）も無い |
| C15 | AI臭 | 「〜じゃない。〜だ。」の対比構文が1記事に2回以上出ていない | OK | guides/03 症状⑧を読んで判定。writing-lint の B-1 対比構文 0回（`writing-lint.txt` 6行目）。「ではなく」「ではありません」「じゃない」0件（`prose-check.txt`） |
| C16 | AI臭 | 文長に緩急がある | OK | guides/03 不在4を読んで判定。`prose-check.txt` 3行目、地の文93文で最短13字、最長60字、20字以下が5文、41〜60字が44文。1文だけの段落（102、262、309行目）を挟んだ |
| C17 | AI臭 | 同じ語尾が3回以上連続していない | OK | guides/03「語尾の反復チェック」を読んで判定。`prose-check.txt` 4行目、3字の語尾の3連続は0件。2字の「ます」の3連続（参考）1件（96行目）は `lint/judgments.md` で1件ずつ判断した |
| C18 | AI臭 | 一文を短くしすぎて主語・目的語を削っていない | OK | guides/03 症状⑮を読んで判定。短い文（102行目「キーがあるときの動きは、モードによって少し違います。」、262行目、309行目）も主語と述語がそろっている。主語の無い命令形や体言止めの連続は無い（目視） |
| C19 | AI臭 | ですます/である調が統一されている | OK | guides/03 症状⑮と guides/05 §7 を読んで判定。`prose-check.txt` 6行目 `C19 non-desumasu prose=1`（85行目の「（実行結果は下の再現）。」を拾った。文の中身はですますなので誤検出）。writing-lint の文体混在（B-10）も検出なし |
| C20 | コロケーション | 「課題・問題・エラー・目標・効果」に付く動詞が正しい | OK | guides/04「動詞と目的語のミスマッチ」を読んで判定。「Invalid API key を再現する」（110行目の見出し）、「ここで止まりました」（130行目）、「API のエラーで終わったターン」（219行目）、「公式のエラーの手引き」（233行目）、「429 エラーとリトライの回」（59行目）。原稿の「エラー」が出る行は59、219、233行目の3か所で、110行目と130行目に「エラー」の語は無い。「課題を改善」型の誤りは無い |
| C21 | コロケーション | 漢語サ変動詞の助詞が合っている | OK | guides/04「自動詞・他動詞の取り違え」を読んで判定。「請求されます」（57行目）、「記憶されます」（104行目）、「認証します」の他動詞は目的語を取らない形、「キーが優先される」（112行目）。「〜を発生する」型は無い |
| C22 | コロケーション | 形容詞と名詞が合っている | OK | guides/04「形容詞・連体修飾と名詞のミスマッチ」を読んで判定。「無効な文字列」（112行目）、「有効なキー」（130行目）。表のミスマッチの型（濃い理解、大きい精度）は無い |
| C23 | コロケーション | 重言が無い | OK | guides/04「重言」を読んで判定。「まず最初」0件（`prose-check.txt`）。「例外を投げる」（221行目）は guides/04 の表の正しい形 |
| C24 | コロケーション | 翻訳調が無い | OK | guides/04「翻訳調」を読んで判定。「〜を作る」（影響を作る型）、「〜を持っている」は無い。「`.env` にキーが書いてある状態を、ダミーのキーで作りました」（239行目）は状態をこしらえる意味で、翻訳調の表の型に当たらない |
| C25 | 正確さ | 60字超の長文を分割した | OK | guides/05 §1「文の長さ」を読んで判定。`prose-check.txt` 2行目 `C25 over60=0 max=60`（インラインコード、リンクの URL、（出典n）、見出し、表のセル、箇条書き、title、description も書かれたとおりに数えた。除外したのは URL だけの表のセル11個）。最初の版の19文は分けるか短くした（`lint/judgments.md`） |
| C26 | 正確さ | 用語が記事全体で統一されている | OK | guides/05 §4「用語の統一」を読んで判定。「プランのログイン」「利用枠」「ダミーのキー」「起動ファイル」を全体で同じ語で書いた。型とコマンドの名前（`apiKeySource`、`authMethod`、`is_error`）は公式の表記のまま |
| C27 | 正確さ | 数量・期間が具体的な数値 | OK | guides/05 §4「曖昧表現の具体化」を読んで判定。順番（3番目、7番目）、版（0.3.322、22.18.0）、トークン数（0）、料金（0.10ドル、0.50ドル、10万トークン、100万トークン）、確かめるコマンドの数（2つ）を数値で書いた |
| C28 | 正確さ | AND/ORが明確 | OK | guides/05 §4「AND/ORの明確化」を読んで判定。「や」の並列は0件（`prose-check.txt`）。「`~/.zshrc` か `~/.bashrc`」（231行目）で OR を、「Agent SDK でも `claude -p` でも同じ」（55行目）で両方を明示した |
| C29 | 正確さ | ですます/である調が混在していない | OK | guides/05 §7「文体の統一」を読んで判定。C19 と同じ根拠（`prose-check.txt` の non-desumasu 0件） |
| C30 | 記号 | `**太字**` のアスタリスク残りが無い（コードブロック外） | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の `PAT bold **: 0` |
| C31 | 記号 | `—`（em-dash）`──`（罫線）を使っていない | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の em-dash、罫線、U+2015 がどれも0件。writing-lint の B-5 ダッシュも0回 |
| C32 | 記号 | `：`+半角スペース、`／`での概念並列を使っていない | OK | guides/03「記号NG」を読んで判定。`prose-check.txt` の全角コロン0件、全角スラッシュ0件（コードブロックの外） |
| C33 | 機械チェック | `python3 scripts/ai-smell-lint.py 記事.md` を実行し、FATALがゼロ | OK | guides/03「lint との関係」を読んで判定。手順7のコマンドで実行。`lint/ai-smell.txt` 5行目 `✅ 致命なし`、10行目 `exit=0` |
| C34 | 機械チェック | warnは目視で要否を判断した | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。warn 0件。lint が拾わない症状③⑦⑮は目視で見て、直した点を `lint/judgments.md` の「書きながら直したもの」に書いた |
| C35 | 機械チェック | FATAL/warnが use か mention かを確認した | OK | guides/03「引用（mention）と使用（use）の区別」を読んで判定。FATAL 0件、warn 0件、mention 0件。frontmatter の範囲（1〜53行目）の mention も0件 |
| C36 | 機械チェック | 悪い例を引用したときは、引用符でくくり・悪い例と明示し・直後に直し方を置いた | OK | guides/03「悪い例を引用するときの書き方」を読んで判定。悪い例の文章の引用は原稿に無い（該当なし。mention 0件）。エラーの文面は、コードブロックの実行結果とインラインコードで示した |
| C37 | 最後の一押し | 自分の実体験・判断・動作確認した結果が入っている | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。実際に動かした結果（`run/16.log` でログイン済みでも `api_key` に切り替わった、`run/19.log` で `subtype: success` なのに `is_error=true`、`run/21.log` でシェルが空でも `.env` のキーが使われた、`run/23.log` でトークン数0）と、そこから下した判断（`is_error` も見るべき 221行目、`.env` を疑うべき 233行目、コードの `env` で外す 264行目の節） |
| C38 | 最後の一押し | コードを実際に動かして確認した | OK | guides/03「5つの不在」と guides/06「使い方の流れ」4を読んで判定。G04 と同じ根拠（`run/14.log`〜`26.log`、`lint/check-code-and-outputs.txt` ALL OK）。オーナーの Claude プランで実行した |
| C39 | 最後の一押し | 「答えを書かずに問いで終わる」箇所が1〜2箇所ある（任意） | 任意・あり | guides/03「沈黙の不在」を読んで判定。327行目「あなたのシェルの起動ファイルには、今どのキーが書いてありますか。」で本文を閉じた（1か所） |

## 結果

G07（リンク先が未公開。公開の順番で解消する。今は直さない）が NG、G11（点検の指摘の解消）はこの修正後の再点検待ち。G10 は `target_query` が `keywords/google-suggest-llm-api.csv` の行と一致して OK。ほかの G01〜G06、G08、G09 と、B の C01〜C38 は OK（C39 は任意で「あり」）。frontmatter は `status: draft` のまま止める。
