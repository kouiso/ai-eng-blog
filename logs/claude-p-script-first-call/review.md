# review: claude-p-script-first-call

- 点検した日: 2026-11-11
- 書いた道具: Claude Code のサブエージェント（Claude）。API キーは使っていない（`run/09.log` の init の `apiKeySource` が `none`、`run/01.log`〜`15.log` と `run/10.log` の `ANTHROPIC_API_KEY: unset`）
- 点検した道具: Claude Code のサブエージェント（Claude、Sonnet 5.5）。書いたエージェントとは別。Claude Code のバージョン 2.1.322 (Claude Code)。プランのログイン。この点検ではモデルを呼ぶ操作はしていない
- 結果: 直すべき指摘 1 件、任意の指摘 8 件

## 直すべき指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/claude-p-script-first-call.md:228`、`:422`、`:443`（`gate.md:29` の G07） | 本文のリンク先 3 本（`claude-code-api-key-billing-auth`、`claude-agent-sdk-first-agent`、`claude-agent-sdk-streaming`）はどれも `status: draft` で、公開も予約もされていない。スキル手順5の「リンク先は公開済みか、この記事より前の日時で予約済みの記事に限る」に反する。講座の1本目なので、1日1本の予約公開だと #17 は十数日、リンク切れになる。ゲート自身が G07 を NG にしており、G11 の前に解けていない | `gate.md:29`（G07 NG）、`content/plan.md:42,43,46,58`（#1、#2、#5、#17 の順）、`claude-agent-sdk-streaming.md:38`、`claude-agent-sdk-first-agent.md:47` の `status: draft` | 228 行目と 422 行目の関連リンクは、リンク先が公開済みになるまで外すか、#5 と #17 を先に予約する。443 行目の次の記事（#2）は、#2 を #1 の直後の日に予約し、予約日を `gate.md` に書いて G07 を OK にする |

## 任意の指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/claude-p-script-first-call.md:175`、`:181-185` | 見出しと表の 94,062、18,173、3,776 は、オーナーのアカウントで 1 回ずつ測った値。フラグなしの 94,062 は、この環境の claude.ai コネクタの数でほぼ決まる。187 行目に「手元の設定と MCP サーバーの数で変わります」とあるが、見出しは数字を断定している。読者の環境では 94,062 は再現しない | `run/16.log:5-7`（各行 1 回の測定）、`code/extra/measure-isolation.sh`（フラグなしの行は `--strict-mcp-config` なし） | 見出しを数字なしの形にするか、「この環境では」を表の直前に 1 句足す |
| 2 | `content/articles/claude-p-script-first-call.md:409` | 「2回呼んで7.9秒」と「execFile は1回で同じ7.9秒」を並べている。spawn で 1 回呼んだ時間は測っていないので、並べると spawn のほうが速いと読める。所要時間は回ごとに揺れる（同じ質問で 2.6 秒から 25.5 秒、`run/16.log:5-7`）のに固定の値として載っている | `run/14.log`、`run/15.log` の `elapsed_seconds=7.9`、`run/16.log` の `seconds=` | 7.9 秒の比較を削り、標準エラーの警告の文面（3 秒待つ）だけを根拠にする |
| 3 | `content/articles/claude-p-script-first-call.md:271` | 「Haiku の数字は、最初の実行より小さくなりました。キャッシュから読まれた入力は…安く数えられます」は、並べ方が原因をキャッシュと読ませる。`run/11.log` にはキャッシュのトークン数が出ておらず、`judgments.md` では断定しないと決めている | `run/11.log`（`total_cost_usd` だけ）、`lint/judgments.md` の「根拠の無い断定を外した」 | 原因の推測を外すか、キャッシュの内訳を出す測定を `run/` に足す |
| 4 | `content/articles/claude-p-script-first-call.md:175-187` | スキルの「Claude プランで動かす記事」6 は、`--strict-mcp-config` の理由を本文に段落で足さず、コードコメントの 1 行にするよう定めている。この節は見出し、段落、表でフラグの効果を説明していて、その規定と食い違う（トークン数の記述としては有用） | `SKILL.md` の「Claude プランで動かす記事」6、本文 175-187 行 | オーナーに残すか削るかを決めてもらう。残すなら、コネクタの話は 1 文に抑える |
| 5 | `content/articles/claude-p-script-first-call.md:210-228` | `claude-code-api-key-billing-auth`（`:63-96`）と `apiKeySource` の扱いが重なる。こちらはコード 1 本と出力、値の意味の説明 1 段落、リンク 1 段落で、段落 1 つとリンクという目安より長い。ただし原因や外し方、無効なキーの再現は書いておらず、重複して説明しているわけではない。251 行目の「subtype で決めず is_error」も、あちらの `:217-221` と同じ主張 | `claude-code-api-key-billing-auth.md:63-96,217-221`、`selection.md` の重なりの表 | 226 行目の値の意味の説明をリンク先に任せ、コード、出力、リンクだけにする |
| 6 | frontmatter `target_query: "llm api 月額"`、`keywords/google-suggest-llm-api.csv` の 76 行目 | CSV の行は種の語 `llm api 月額` をそのまま返した 1 行（rank 1）だけで、ほかの種の語（rank 1 は種の語の反復）と同じ形。Google が別の候補を返したわけではなく、需要の根拠は弱い。本文に「月額」の語は無く、description にも無い（タイトルにだけある）。同じ CSV にある実在の候補 `llm api サブスク` のほうが答えに近い可能性がある | CSV 76 行目（`fetched_at` は 2026-11-12T01 の組）、`grep` で本文の「月額」は 2 件（2 行目のタイトルと 7 行目の `target_query`） | 本文か description に「月額」の語を 1 回入れる。公開後は Search Console で選び直す |
| 7 | `logs/claude-p-script-first-call/gate.md:26,27,80` | G04 が「`run/01.log`〜`15.log` はすべて 2026-11-11、jq-1.8.1」と書くが、`run/10.log` は日付が 2026-11-12T01:01:14Z（UTC。この環境の現地では 11-11）、jq は jq-1.7.1-apple。`code/README.md` には書いてあるが、ゲートの行は不正確。80 行目は「G07 と G10 が NG」のままで、3 行目の追記と 32 行目（G10 は OK）に反する | `run/10.log:1,3`、`code/README.md` の「ブロック10の再実行」、`gate.md:3,32,80` | G04 に 10.log の例外を 1 句足す。80 行目の結論を現状に直す |
| 8 | `content/articles/claude-p-script-first-call.md:10`（`run_environment`） | `jq 1.8.1` と書くが、記事のブロック 10 の出力を取った `run/10.log` は jq 1.7.1。jq は表示に使うだけで出力は変わらない | `run/10.log:3` | `jq 1.7.1 から 1.8.1` のように範囲で書くか、ブロック 10 を 1.8.1 で再実行する |

## 確かめて問題が無かったこと

- 数値と出力: `python3 -I logs/claude-p-script-first-call/lint/check-code-and-outputs.py content/articles/claude-p-script-first-call.md logs/claude-p-script-first-call`（スクリプトを読んでから実行）が `ALL OK`。30 ブロックの一致、`run/01.log`〜`15.log` の exit=0、表の数字と `run/16.log` の一致を確かめた。
- 新しい `run/10.log`: 記事 236-249 行の `--bare` のコマンドは `--strict-mcp-config` つきで、`run/10.log:7-14` の command 欄と同じ。出力の `exit=1`、`is_error: true`、`Not logged in · Please run /login` は `run/10.log:17-22` と同じ。古い `run/10-before-strict-guard.log` は `--strict-mcp-config` なしで出力は同じ。
- 数字の突き合わせ（スクリプトの外）: `0.0006710900000000001` は `run/07.log` と `run/08.log`、`2.1.322` は `run/02.log`、`v22.23.4` は `run/03.log`、`7.9` 秒は `run/14.log` と `run/15.log`、`0.00008206` と `0.0101209` は `run/11.log`、TypeScript 7.0.2 は `run/17.log` にあった。
- 末尾の日付: 445 行の 2026-11-11 は、`run/01.log`〜`16.log` の日付と、`run/10.log`（UTC の 11-12 は現地 11-11。`code/README.md` が説明）に合う。`verified_at` も同じ。
- コード: `exec-file.ts` と `ask.ts` は `code/` の同名ファイルと一致（スクリプトの #25、#28）。`claude -p` の 7 か所（シェル 5 ブロック、`ask.ts`、`exec-file.ts`）すべてに `--strict-mcp-config` があることを目で確かめた（`measure-isolation.sh` の測定用の呼び出しは、未ガードの測定の記録として README が説明している）。`query()` は記事にない。
- キー: `logs/` と記事を `ANTHROPIC_API_KEY` で調べ、値の使用は無く、`unset` の確認とその説明の文だけ。`sk-ant` は 0 件。`run/09.log` の `apiKeySource` は `none`。
- 出典の対応: 本文の（出典n）は 37 か所で、`grep` の数と gate.md の「37か所」が一致。出典 1 から 10 がすべて本文で引かれ、frontmatter の `sources` 10 件、本文の表 10 行、`sources.md` 10 行の題名と URL が一致。
- 出典の中身: https://code.claude.com/docs/en/headless を開き、「In bare mode, Claude Code never reads OAuth credentials or the system keychain」を確かめた。173 行目の `--bare` の説明を支える。https://code.claude.com/docs/en/authentication を開き、「If you have an active Claude subscription but also have ANTHROPIC_API_KEY set ..., Claude Code uses the API key once you approve it」を確かめた。67 行目の断定は、承認の語を省いているが矛盾しない。
- 料金の整合: `run/16.log` の最小の行（キャッシュ作成 3,125、読み出し 649、出力 3）の `total_cost_usd` は 0.00063319。キャッシュ作成を入力単価 0.10 ドルの 2 倍で計算すると 0.000632 付近で、出典 7 の Haiku 5.5 入力 0.10 ドルと合う（この計算は点検の推定）。
- 注意書き: 「利用規約」「規約」「個人」「他の人」「Console」「API キーで認証」を本文で調べ、0 件。228 行目の `none` 以外の案内と 67 行目の `ANTHROPIC_API_KEY` の説明は、技術的な説明で許される範囲。
- リンク: `/posts/claude-code-api-key-billing-auth`、`/posts/claude-agent-sdk-first-agent`、`/posts/claude-agent-sdk-streaming` の原稿が `content/articles/` に実在。それぞれの title と description を読み、228 行目（キーを外す話）、422 行目（Agent SDK の導入）、443 行目（ストリーミング）の説明が合う。`prev: null`、`next: claude-agent-sdk-streaming` は `content/plan.md:42-43` の順と一致し、あちらの `prev` も `claude-p-script-first-call`。禁止の古い 4 つの slug は 0 件。
- ゲートの行を現状と照らした: G01 と G02 は lint を標準出力に再実行して判定行が保存済みと同じ（`致命なし`、`FATAL 0 / DENSITY超過 0 / SHOULD 0`）。G04 は上のスクリプト、G05 は出典の数と frontmatter、G08 は 445 行、G09 は `/Users/`、`@`、`session_`、`sk-ant-`、アカウント名、メールの検索で本文の hit なし。ログの `@` は `@anthropic-ai/...` と `@types/node` だけ。C15、C30、C31、C32 は本文の `—`、`―`、`**`、`：`、`／`、`ではなく` が 0 件。C25 は最長の文が 59 字。C37 は `run/10.log`、`run/14.log`、`run/16.log` に根拠がある。G10 は CSV の行と文字が一致（ただし任意の指摘 6）。C08 は前提と import が載っている。
- プライバシー: `logs/claude-p-script-first-call/` と記事を python3 で走査した hit は、`gate.md:31` の検索語の一覧、`code/README.md:23` の `session_id` を載せないという説明、`@` の npm パッケージ名のみ。アカウント名、メール、セッション ID、`/Users/` の実パスは無い。
- 読者の目線: 前提（Node.js 22.18.0 以上、jq、ログイン、`ANTHROPIC_API_KEY` の確認）が最初に揃っている。6 つのフラグの数は 6 つで合う。`<work>` の説明は 126 行目にある。`execFile` の 3 秒待ちは `run/14.log` の警告の文面と合い、実演として壊れにくい。

## 確かめていないこと

- 出典 6（料金プランで Free に Claude Code が無いこと、Pro が月払いで 20 ドル）と出典 7（Haiku 5.5、Sonnet 5.5 の単価）のページは取得したが、検索が制限されて該当の文を読めていない。数字は上の計算の整合だけを根拠にしている。
- 出典 2、3、5、8、9、10 のページは開いていない（`sources.md` の記述との照合もしていない）。
- 記事のコマンドとコードは再実行していない（モデルを呼ばない約束のため）。94,062 トークンなどの再現性は見ていない。
- Node.js 22.18.0 での動作と、`jq` が無い環境での挙動は確かめていない。
- EmDash に載ったときの表示（内部リンクの形 `/posts/...` が実際のサイトの URL と合うか）は見ていない。

## 対応（2026-11-13）

直すべき指摘

| # | 結果 | 何を変えたか |
|---|---|---|
| 1 | 見送り | G07。公開の順で消える。今は直さない |

任意の指摘

| # | 結果 | 何を変えたか |
|---|---|---|
| 1 | 直した | 記事:175 の見出しを「この環境では」から始め、表の前に「この環境での1回ずつの測定」と足した |
| 2 | 直した | 記事:409 の「7.9秒」の比較の文を削った（`sources.md` の 409 行も合わせた） |
| 3 | 直した | 記事:271 のキャッシュが原因という文を「理由は確かめていません」に替えた |
| 4 | 見送り | 節を残すか削るかはオーナーが決める内容で、削ると節の構成が変わる |
| 5 | 見送り | 重なりの度合いは目安の問題で、削る範囲の判断が要る。事実の誤りではない |
| 6 | 見送り | 検索語の選び直しは公開後に Search Console で行う。`target_query` と description の変更は範囲外 |
| 7 | 直した | `gate.md` の G04 に `run/10.log` の例外を足し、結果の節を G07 だけ NG に直した |
| 8 | 直した | 記事:10 の `run_environment` を「jq 1.7.1 から 1.8.1」にした |

点検の結果（2026-11-14）: 直すべき指摘 1

- gate.md の行番号と数が今の原稿（443行）と合わない。`gate.md:30` G08 は「445行目」だが原稿の末尾は `content/articles/claude-p-script-first-call.md:443`。`gate.md:47` C10 の「95行目」の文は今 :173、「210行目」の文は :228、「230行目」の文は :234。`lint/prose-check.txt` 1〜2行目（units=179、sentences=100）は回し直すと 175、96。全12本で `lint/prose-check.txt` が今の原稿に回し直した結果と食い違う（原稿を直したあとに証跡を取り直していない。2026-11-14 の本文リンクを外した直しが原因と見られる）

対応（2026-11-14）:

- gate.md の行番号と数と引用: 全行を今の原稿の行に合わせて書き直した。主な行は gate.md:24（G02）、gate.md:30（G08）、gate.md:47（C10）、gate.md:53（C16）。
- `lint/prose-check.txt`: 今の原稿で回し直し、`lint/ai-smell.txt`、`lint/writing-lint.txt`、`lint/check-code-and-outputs.txt` も取り直した（`lint/` 内の各ファイル）。

点検の結果（2026-11-14 2回目）: 直すべき指摘 0

- 直すべき指摘は無し。

任意: gate.md:58 C21 の「is_error で判定してください」は :251 では「is_error か終了コードで判定してください」（引用が原文どおりでない。行は合う）

点検した道具: Claude のサブエージェント（Opus 5.5、この記事の執筆と直しには関わっていない）。環境変数 `ANTHROPIC_API_KEY` は設定なし（`env` で0件）。やったこと: lint 2本を作業用の一時フォルダへ回し直し（ai-smell exit 0・FATAL 0、writing-lint `FATAL 0 / DENSITY超過 0 / SHOULD 0`、保存済みの `lint/` と一致）。`lint/check-code-and-outputs.py` と `lint/prose-check.py` を今の原稿で回し直し、保存済みと一致（ALL OK）。gate.md の G・C 行にある「N行目「引用」」「「引用」（N行目）」と、見出し・問い・段落を指す行番号を、全行スクリプトで今の原稿と照らした。G05 の出典の表の範囲と件数、引用している行の一覧を照らした。過去の点検の直すべき指摘（G07 を除く）は、今の本文の該当行を開いて閉じているか確かめた。地の文の3桁以上の数を run/ と code/ のログと照らし、見つからない数は計算で確かめた。ほかの記事を指す文は、指す先の記事が同じ記事の本文でリンクされているかを確かめた。G07 は対象外。本文の通読は、スクリプトで拾った箇所と過去の指摘の箇所に限った。

対応（2026-11-14 2回目）: gate.md:58 C21 の引用を原稿の文字どおり（`is_error` か終了コードで判定してください）に直した。 全12本の gate.md の行番号・引用を照合するスクリプトを回し、食い違い0件（旧・当時の記録の行と、sdk.d.ts・dist・plan.md・run・lint のログの行は照合の対象外）。

## 点検（2026-11-14、この PR（#81 の作業、コミット 2ee501c）の1回目。target_query を `llm api 呼び出し` にした版）

- 書いた道具: Claude のサブエージェント（Claude Code。2026-11-14 の直しをした AI）。その init は点検する側からは見えないので、ログインの方法は、書いた側の記録（`run/09.log` の `apiKeySource: none`、2026-11-11）による
- 点検した道具: Claude のサブエージェント（Opus 5.5。この記事の執筆と直しには関わっていない）。Claude Code 2.1.325。プランのログイン。`env -u ANTHROPIC_API_KEY claude -p "say ok" --output-format stream-json --verbose --strict-mcp-config` の init は `"apiKeySource":"none"`（2026-11-14T14:26:30Z）
- 結果: 直すべき指摘 3 件、任意の指摘 12 件。G11 は NG（下書きのまま）

### 直すべき指摘

| # | 場所 | 何が問題か | 直し方 |
|---|---|---|---|
| 1 | 記事:11（`verified_at`）、記事:445（本文の日付）、`gate.md:27,38,41`、`code/README.md:27` | 裁定8では、3つを最後の `run/` のログに合わせる。時刻の順で最後のログは `run/10.log`（`2026-11-12T01:01:14Z`）。現地の日付が 11-11 だという説明は、ログの中に裏付けが無い | `verified_at: "2026-11-12"` にし、末尾の日付を 2026-11-12 にする。G05、G08、(c) の根拠を `run/10.log` に向ける。README の現地の日付の説明は消すか、「確かめていない」と書く |
| 2 | 記事:411「2回呼んで、警告は出ていません。」、`sources.md:29` | `ask.ts` は成功した回で子の標準エラーを出さない（記事 371、374〜376行目）。そのため `run/15.log` は警告の有無を示せない | 出力が示すことだけの文にするか、消す。または標準エラーを出すように直して動かし直す |
| 3 | 記事:234「スクリプトや CI」「フックや CLAUDE.md を読まずに」、`gate.md:77`（C28）、`lint/judgments.md:28` | C28（「AやB」で曖昧にしていない）と guides/05 §4 に当たる。gate と judgments は「や」を直した、検出0件と書いているが、179行目と 234行目に3つ残っている | 「スクリプトか CI」「フックや CLAUDE.md などを読まずに」にし、gate と judgments を今の本文に合わせる |

### 任意の指摘

| # | 場所 | 何が問題か | 直し方の案 |
|---|---|---|---|
| 1 | 記事:2、:4、:52 | `claude -p` を LLM API の呼び出し口として示している。事実の誤りは無いが、API を直接呼ばないことは 67行目まで出てこない（guides/01 §7） | 67行目の趣旨をリードに寄せる |
| 2 | 記事:214 | `apiKeySource` が `none` でも、bearer token や外部のクラウドのことがある（`sdk.d.ts:133`）。「プランで動いているか」は言い過ぎ | 「API キーで動いていないかは」にする |
| 3 | 記事:208 | `costBasis` の `list` の意味の文に、出典の番号が無い | （出典8）を足す |
| 4 | 記事:210 | 10万トークン以下で分かれるのは、入力と出力の両方（出典7） | 「どちらも、10万トークン以下のプロンプトの単価です」にする |
| 5 | 記事:179 | 「道具」と「ツール」（147、299行目）が混在している（guides/05 §4） | 指すもの（MCP サーバーとツール）を書く |
| 6 | 記事:177-189、SKILL.md:260 | 以前の任意の指摘4が、オーナーの判断待ちのまま | オーナーの判断を記録する |
| 7 | `sources.md:13,26`、`lint/judgments.md:35` | 273行目がキャッシュの単価を書いているという記述が、今の本文と合わない | 今の 273行目に合わせる |
| 8 | `gate.md:72` | 「各フラグの役割」は 138行目ではなく 140行目 | 行番号を直す |
| 9 | `selection.md:27-29`、`lint/judgments.md:22,37` | 2026-11-11 の版の行番号と、今は無いリンクの記述が残っている | 旧版の記録であることを書く |
| 10 | `selection.md:58-66`、SKILL.md:117、:409 | Google トレンドで比べていない。ゲートの行ではなく、裁定2でキーワードは #83 の担当なので、G11 の指摘には数えない。ただし SKILL.md:409 の最低限の中身が欠けているので、免除は統括か #83 が決める | #83 か統括が閉じる |
| 11 | PR 本文の案 | 「最後のログと合っています」が、直すべき指摘1と食い違う | 直したあとの形に書き直す |
| 12 | 記事:185 | 表の値は小数第8位に丸めてある（`sources.md:22` に記録がある） | 任意。表の下に一言足す |

### 確かめて問題が無かったこと

- `check-article.py` は確定0、候補0（OUTPUT は13件すべて一致、例外0件）
- ai-smell-lint は致命なしで exit=0、writing-lint は `FATAL 0 / DENSITY超過 0 / SHOULD 0` で exit=0。どちらも保存済みの `lint/` と diff で一致した
- 記事の `text` 13個、`bash` 15個、`ts` 2個が、`run/` と `code/` に完全に一致する（自前のスクリプト）。表のトークン数は `run/16.log` と一致する
- C17 は3連続が0件（自前のスクリプト、111文）
- 出典10ページをすべて開き、各断定を支える文を確かめた
- gate.md、sources.md、selection.md の引用と行番号を30か所照らした。合わないのは、直すべき指摘3と任意の指摘7〜9だけ
- G09 の検索（アカウント名、author の名前、メール、パス、UUID）で、当たりは無い
- G10 の行には、#83 を出典にした日付つきの注記がある
- Node 24.22.3 とコミット 2ee501c で、`npm ci`、`npm run check`、`npm run check:samples`、`node scripts/secret-scan.mjs origin/develop` がどれも exit=0（secret-scan は 8 files、0 findings）

### 確かめていないこと

- 記事のコードは動かし直していない
- guides/06 と 08 は全文を読んでいない（G02 の DENSITY が全カウンタ0回のため）
- `keywords/LLM API.csv`（オーナーの端末にだけある）と、Google の上位10記事は見ていない

### 対応

対応（2026-11-14、書いた AI。点検の対象 2ee501c に origin/develop をマージしてから直した）:

- 直すべき指摘1: `verified_at` を `"2026-11-12"` に（記事:11）、末尾の日付を「2026-11-12」に（記事:445）した。`run_environment` の版は `run/10.log` と同じなので変えていない。`gate.md` の (c)、G04、G05、G08 の根拠を `run/10.log` の `2026-11-12T01:01:14Z` に向けた。`code/README.md:27` の現地の日付の説明は消し、「現地の日付は確かめていない」と書いた。日付だけの直しなので、コードは動かし直していない（gate-readings.md の11の(c)）。
- 直すべき指摘2: 記事:411 を「2回とも、`result` に答えが入って返りました。」にした（`run/15.log` の `answer:` と `cause:` の行が根拠）。`sources.md:29` も合わせた。
- 直すべき指摘3: 記事:234 を「スクリプトか CI で動かすときに」「フックや CLAUDE.md などを読まずに」にした。179行目の「フックや CLAUDE.md などを」は残し、その判断を `lint/judgments.md` に書いた。`gate.md` の C28 と `lint/judgments.md` を、今の本文の「や」3つ（179、234、257行目）を1つずつ挙げた形に直した。
- 任意の指摘で直したもの: 2（記事:214 を「API キーで動いていないかは」）、3（記事:208 に（出典8）。出典の数は38か所）、4（記事:210 を「どちらも、10万トークン以下のプロンプトの単価です」）、5（記事:179 を「手元の設定と MCP サーバーを読み込まず、ツールも使わせない」）、7（`sources.md` の 273行目の2か所、`lint/judgments.md` のキャッシュの記述）、8（`gate.md` の C23 を140行目に）、9（`selection.md` の表と `lint/judgments.md` の2か所に、2026-11-11 の版の記録だと書いた）。出典7と出典8は、この直しのために 2026-11-14 に開き直して文を確かめた。
- 任意の指摘で直していないもの: 1（リードの書き方。オーナーの判断）、6（オーナーの判断待ち）、10（#83 か統括が閉じる）、11（PR 本文の案は共有の作業ツリーにあり、この作業では触らない。PR を出す側が直す）、12（直さなくてよいとされた）。
- 本文の行数は445行のまま。`check-article.py` は直す前も後も確定0、候補0。ai-smell-lint は致命なし、writing-lint は `FATAL 0 / DENSITY超過 0 / SHOULD 0`。

## 点検（2026-11-15、2回目。head 874bf0d）

- 判定: PASS。直すべき指摘0件、任意の指摘6件（N1、S1、S6、S10、S11、S12）。1回目の直すべき指摘3件はすべて閉じた。
- 点検した道具: Claude Code のサブエージェント（general-purpose）、モデルは Opus 5.5（claude-opus-5-5）。書いた AI とは別のエージェント。
- ログインの方法: 統括の会話のサブエージェント。`ANTHROPIC_API_KEY` は未設定（2026-11-15T06:04:35Z に確認）。
- 裁定6の確認: `env -u ANTHROPIC_API_KEY claude -p --output-format stream-json --verbose --strict-mcp-config "1+1は？"` の init の行は `"apiKeySource":"none"`。2026-11-15T06:05:56Z〜06:06:06Z に実行。`claude --version` は `2.1.325 (Claude Code)`。
- 任意の指摘のうち S1（リードで `claude -p` を LLM API の呼び出し口として示す書き方）と S6（`--strict-mcp-config` の理由を本文で説明する節）はオーナーの判断待ち。返事が無ければ今の書き方のまま。
- N1: `ask.ts` が標準入力の待ちを避けたことを示すログは無い。本文はログ以上のことを言っていないので、直さない。

## 点検（2026-11-27、3回目。head f434f8b、通し）

- 判定: FAIL。直すべき指摘2件、任意の指摘9件。G11 は NG（下書きのまま）。`gate.md` の G11 の行と機械で読む行の `G11=OK` は、この点検に合わせて NG に直す必要がある（点検する側は読み取りだけで、ファイルは直していない）。
- 点検した道具: Claude Code のサブエージェント。モデルは Opus 5.5（claude-opus-5-5）で、この記事の執筆と直しには関わっていない。`claude --version` は `2.1.332 (Claude Code)`。ログインはプランのログイン。環境変数 `ANTHROPIC_API_KEY` は未設定（`test -n` が unset）。
- 裁定6の確認: `env -u ANTHROPIC_API_KEY claude -p --output-format stream-json --verbose --strict-mcp-config "1+1は？" | head -1` を 2026-11-27T14:01:45Z〜14:01:53Z に実行した。2.1.332 では1行目が init ではなく `{"type":"active_goal",...}` で、`apiKeySource` が入っていなかった。そこで同じコマンドを `head` なしで 2026-11-27T14:01:59Z〜14:02:04Z にもう一度流し、3行目の `system`/`init` の行を読んだ。値は `"apiKeySource":"none"`（その行の `claude_code_version` も 2.1.332）。
- 書いた AI のサブエージェント自身の init は、点検する側からは見えない。
- 書いた道具（`review.md:4`、`:94` と `gate.md` の記録による）: Claude Code のサブエージェント（Claude）。モデルの記録は無い。コードはオーナーの端末で Claude Code 2.1.322 から動かしている。ログインはプランのログインで、根拠は書いた側の記録（`run/09.log` の `apiKeySource: none`、2026-11-11。`run/01.log`〜`15.log` の `ANTHROPIC_API_KEY: unset`）。2026-11-14 の直しをした AI も Claude のサブエージェント。

### 渡されたもの

- 原稿 `content/articles/claude-p-script-first-call.md`（445行）
- `logs/claude-p-script-first-call/` の全部（gate.md、sources.md、selection.md、brief.md、review.md、run/ の19本、code/、lint/）
- `.claude/skills/write-article/SKILL.md`、`docs/tech-writing-pack/checklist.md`、`docs/decisions/gate-readings.md`
- 書いた AI の報告と結論は渡されていない。渡されたのは、点検で見る項目を並べた依頼文だけ。

### 確かめたこと

- 共通の検査: `python3 scripts/check-article.py claude-p-script-first-call` は exit=0 で、確定0件、候補0件。OUTPUT は ```text 13件がすべてログに一致し、例外0件、ログ19本。C25 で数えなかった URL だけの値は20件。
- lint: ai-smell-lint は `✅ 致命なし`、use 0件、mention 0件、exit=0。writing-lint は `445行/143文`、`### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、exit=0。保存済みの `lint/ai-smell.txt`（ファイル名の行を除く）と `lint/writing-lint.txt` に一致した。
- コード: 記事の `ts` 2ブロックが `code/exec-file.ts` と `code/ask.ts` に1文字も違わず一致。`lint/check-code-and-outputs.txt` は ALL OK。
- 数字とログの照合: 0.0006710900000000001 は `run/07.log`、`run/08.log`。0.00008206 と 0.0101209 は `run/11.log`。0.00007506 は `run/15.log`。7.9 は `run/14.log`、`run/15.log`。表の 94,062、18,173、3,776 と 0.01681166、0.00147332、0.00063319 は `run/16.log`（小数第8位で丸めた値）。2.1.322 は `run/02.log`、v22.23.4 は `run/03.log`、TypeScript 7.0.2 は `run/17.log`。3つのフラグを付けた行の料金は、出典7の Haiku 5.5 の単価で計算すると 0.000633 になり、ログと合う。
- frontmatter: `verified_at: "2026-11-12"` と末尾の日付は、時刻の順で最後のログ `run/10.log`（2026-11-12T01:01:14Z、exit=0）に一致する。`run_environment` の版はすべてログの見出しの行と一致する（jq は `run/10.log` が 1.7.1、ほかが 1.8.1）。`cost_estimate` は本文の52、62、208行目と食い違わない。
- 出典: 10ページすべてを 2026-11-27 に取得し、本文の断定を支える文があることを確かめた（出典8 は unpkg と jsdelivr がこの環境のプロキシで 403 だったので、同じ版 0.3.322 を `npm pack` で取り、`sdk.d.ts` で確かめた）。本文の（出典n）は38か所で、番号ごとの行は `sources.md` の表と一致する。frontmatter の `sources`、本文の表、`sources.md` は10件とも題名と URL が一致する。
- 利用規約の注意書き: 本文を「利用規約」「規約」「個人」「他の人」「ほかの人」「Console」「利用条件」「商用」「禁止」で検索して0件。意味を変える注意書きは足されていない。
- G09: 原稿と `logs/claude-p-script-first-call/` に `sk-ant`、`/Users/`、`session_01`、`@gmail`、`/tmp/claude`、UUID の形、`/home/<名前>`、メールの形を検索した。当たったのは review.md と gate.md の検索語の説明の行だけ。アカウント名は `gate.md:18` の裁定コメントの URL（public のリポジトリの URL）にだけあり、原稿には無い。
- G08: 445行目「AI 支援で執筆しました。コードは 2026-11-12 に実際に実行して確認しています。」
- G07: 本文の `/posts/` は0件で、`prev: null`、`next: claude-agent-sdk-streaming`。裁定1のとおりなら OK（任意の指摘2を参照）。
- `--strict-mcp-config`: 記事の `claude -p` のコード7か所すべてにある。
- gate.md の行番号と引用: C06、C07、C10、C27、C36 と G05 の行番号と引用を、今の原稿と照らして合っていた。
- selection.md の 2026-11-15 追記と G10・C01: トレンドの値は今の語と以前の語がどちらも 0。高かった3語を選び直さない理由（検索意図の型が違う）は、SKILL の手順1の2の4に照らして筋が通っている。C01 の1行（`brief.md`）と食い違わない。ただし `gate.md` の G10 の行は、この追記を反映していない（直すべき指摘1）。
- 2.1.332 での再現（モデルを呼ばないブロックだけ）: ブロック10（`--bare`）を同じ形で流し、exit=1、`subtype: success`、`is_error: true` を再現した。`result` の文面だけが違った（任意の指摘6）。

### 確かめていないこと

- モデルを呼ぶブロック（05、09、11、13、14、15）とトークン数の測定は、動かし直していない。
- `keywords/LLM API.csv` と `keywords/google-suggest-llm-api.csv` はこの環境に無い。G10 の CSV との一致は確かめていない。
- Google の上位10記事と、EmDash に載せたときの表示は見ていない。
- guides/01〜10 はこの点検では全文を読み直していない。checklist、SKILL.md、gate-readings.md は全文を読んだ。C09〜C24 は本文を通読して判断した。
- Node.js 22.18.0 そのものでの動作は確かめていない。

### 直すべき指摘

| # | 場所 | 何が問題か | 直し方 |
|---|---|---|---|
| 1 | `logs/claude-p-script-first-call/gate.md:45`（G10 の根拠の最後の文） | 最後の文「Google トレンドの比較は、取得が HTTP 429 で止まったので実施できていない」が今の記録と食い違う。比較は `selection.md:251-273` の「2026-11-15 追記」で行っており、同じ `gate.md` の結論も「2026-11-15 に行った」と書いている | 最後の文を「2026-11-14 は HTTP 429 で取得できず、2026-11-15 に行った（`selection.md` の「2026-11-15 追記」）。今の語は平均0で、以前の語と差は無い」の趣旨に直す |
| 2 | `content/articles/claude-p-script-first-call.md:181` | 「同じ質問を、フラグを変えて1回ずつ、計3回送りました。」は、直前の流れでは131行目の TypeScript の質問を指すと読める。測定で送ったのは「1+1 の答えを数字だけで答えてください。」で（`code/extra/measure-isolation.sh:19`）、作業フォルダには CLAUDE.md も置いていた（`run/16.log:3`）。そのため表の「3つとも付ける」の 0.00063319 は、同じフラグで送った171行目の 0.0006710900000000001 と違い、読者は数字が合わないと受け取る | 測定に使った質問を書く。数字とコードは変えずに済む。直したら手順7と8を回し直し、gate.md と sources.md の行番号と引用も合わせる |

### 任意の指摘

| # | 場所 | 内容 |
|---|---|---|
| 1 | 記事:214 | 「最初に届く init イベントを見ます（出典1）」。出典1は "It is the first event in the stream unless startup events precede it" と条件付き。2.1.332 では init は3行目だった。記事のコードは `select` で拾うので動くが、`head -1` で読む読者はつまずく。「最初に」を外し、`type` が `system`、`subtype` が `init` のイベントを見る、と書く案 |
| 2 | 記事:420-426、frontmatter `next` | 読者に見える次の記事へのリンクが無い。G07 は裁定1で OK だが、前の記事の `next` にリンクを足す手順10の6は「実行しない」とされている。統括かオーナーが扱いを決める項目 |
| 3 | 記事:253 と :418 | 253行目は「`is_error` か終了コードで判定」を勧め、418行目は「終了コードで判定すると、失敗の理由を読み損ねます」と書く。418行目を「理由を読むには JSON を先に読む」の趣旨にそろえる案 |
| 4 | 記事:378（`ask.ts`） | `close` のハンドラの中の `JSON.parse` が失敗すると、`reject` されず捕まえられない例外になる。`try` で囲んで `reject` にすると415行目の説明と合う。直すならコードと出力を動かし直す必要がある |
| 5 | 記事:257 | 「それぞれ最新の Haiku、Sonnet、Opus を指します」。出典3が「最新」を言うのは sonnet と opus だけ。版で書く案 |
| 6 | 記事:244-250 | 2.1.332 のクラウドの環境で `--bare` を流すと、`result` は "Authentication error · …" で "Not logged in · Please run /login" ではなかった。記事は 2.1.322 で動かしたと書いているので直さなくてよいが、文面は版か環境で変わりうる |
| 7 | `logs/claude-p-script-first-call/lint/` | SKILL.md 手順7にある `lint/check-article.txt` が無い（30本どれにも無い）。この点検で流した `check-article.py` の結果を保存しておくとよい |
| 8 | `review.md` の2回目の点検の節 | 書いた道具の記録と、裁定6の「書いた AI の init は見えない」の1文が無い。この3回目の節で補ったが、`gate.md` の G11 の根拠を2回目に向けたままにしない |
| 9 | 記事:2、:4、:52、:177-189 | 前回からの S1 と S6 は、まだオーナーの判断待ち |

### 指摘ごとの対応

（この小節は、書いた側が 2026-11-27 に足した。上の点検の本文は書き換えていない。）

4回目の点検（2026-11-27）の記録に合わせて、3回目の指摘への対応を書く。

- 直すべき指摘1（`gate.md` の G10 の根拠の最後の文）: 直した（`gate.md` の G10、コミット 3876a6e）。
- 直すべき指摘2（記事:181 の測定の質問）: 直した（181行目、コミット 3876a6e）。
- 任意の指摘1、3、5、7: 直した（コミット 3876a6e）。
- 任意の指摘2、9: オーナーか統括の判断。書いた側では直していない。
- 任意の指摘4（`ask.ts` の `JSON.parse`）: 直していない。コードを変えるとオーナーのプランで動かし直す必要があるため。
- 任意の指摘6（`--bare` の文面）: 本文の直しはいらない（記事は 2.1.322 で動かした結果を書いている）。
- 任意の指摘8（書いた道具の記録）: 書いた側の対応ではなく、点検した側が3回目と4回目の節で補った。

2026-11-27 の記録の訂正（4回目の点検の任意の指摘3）: 上の指摘の表（直すべき指摘2）の「`run/16.log:3`」は `run/16.log:4`（CLAUDE.md の行）、直すべき指摘1の「`selection.md:251-273`」は `selection.md:92-114`（「2026-11-15 追記」の節）が正しい。点検した側の文はそのまま残す。

## 点検（2026-11-27、4回目。head 3876a6e、通し）

- 判定: PASS。直すべき指摘0件、任意の指摘9件。3回目の直すべき指摘2件は、どちらも閉じた。点検する側は読み取りだけで、ファイルは直していない。
- 点検した道具: Claude Code のサブエージェント（general-purpose）。モデルは Opus 5.5（claude-opus-5-5）で、この記事の執筆と直しには関わっていない。`claude --version` は `2.1.332 (Claude Code)`。ログインはプランのログイン。環境変数 `ANTHROPIC_API_KEY` は未設定。
- 裁定6の確認: `env -u ANTHROPIC_API_KEY claude -p --output-format stream-json --verbose --strict-mcp-config "1+1は？"` を `head` なしで、2026-11-27T14:16:16Z〜14:16:22Z に実行した（exit=0）。3行目が `system`/`init` の行で（1行目は `active_goal`、2行目は `autocompact_state`）、値は `"apiKeySource":"none"`。同じ行の `claude_code_version` は 2.1.332。
- 書いた AI のサブエージェント自身の init は、点検する側からは見えない。
- 書いた道具: Claude Code のサブエージェント（Claude）。コードは 2026-11-11 と 11-12 に、オーナーの端末の Claude Code 2.1.322 で動かした。ログインはプランのログイン（`run/09.log` の `apiKeySource: none`、`run/01.log`〜`15.log` の `ANTHROPIC_API_KEY: unset`）。2026-11-27 の直し（3876a6e）も Claude のサブエージェントで、コードは動かし直していない。
- 渡されたもの: 原稿、`logs/claude-p-script-first-call/` の全部、SKILL.md、checklist.md、gate-readings.md、点検の項目を並べた依頼文（f434f8b からの差分を念入りに見るよう書いてあった）。書いた AI の報告と結論は渡されていない。

### 確かめたこと

- `git diff f434f8b HEAD -- content logs` を全部読んだ。本文で変わったのは 181、214、257、418行目と frontmatter の `updated`（2026-11-27）。コードと出力のブロックは変わっていない。
- `python3 scripts/check-article.py claude-p-script-first-call`（作業用の一時フォルダで `npm ci` のあと）: exit=0、確定0件、候補0件、OUTPUT 13件がログに一致、例外0件。保存済みの `lint/check-article.txt` と一致。
- ai-smell-lint は致命なし、use 0件、mention 0件。writing-lint は `445行/147文`、`FATAL 0 / DENSITY超過 0 / SHOULD 0`。保存済みの `lint/` と1文字も違わず一致。`check-code-and-outputs.py` は ALL OK。
- C25: 変わった4行と前後の文を自分で数え、どれも60字以下（最長58字）。C17: 52〜426行目の115文で3連続は0件。C16、C28: `gate.md:77` と一致、直した4行に「や」の並列の曖昧さは無い。
- 181行目: 質問の文面は `code/extra/measure-isolation.sh:19`、CLAUDE.md は同じスクリプトの :12 と `run/16.log:4` で確かめた。0.00063319 は `run/16.log:7`、0.0006710900000000001 は `run/07.log`（質問は `run/05.log` の TypeScript の型注釈）。原因は書いていない。
- 214行目: 出典1（2026-11-27 取得）の "It is the first event in the stream unless startup events precede it" と矛盾しない。257行目: 出典3（2026-11-27 取得）の表の "Anthropic API | Opus 5.5 | Sonnet 5.5 | Haiku 5.5" と一致。418行目: 出典1の終了コードと `result` の説明と合う。
- 記事のブロック09を 2.1.332 で1回流し（2026-11-27T14:18:20Z、exit=0）、出力 `{"apiKeySource":"none","model":"claude-haiku-5-5"}` が本文225行目と一致した。
- 出典の（出典n）は39か所で、`sources.md` の表と `gate.md` の G05 の「39か所」と一致。gate.md の見出しと根拠の行番号も今の本文と合う。
- G09 の検索（`sk-ant`、`/Users/`、`session_01`、`@gmail`、`/tmp/claude`、`/home/<名前>/`、UUID の形）: 当たりは review.md と gate.md の検索語の説明の行だけ。利用規約の注意書きは0件。記号（`**`、ダッシュ類、`：`、`／`、`ではなく`）は0件。

### 確かめていないこと

- ブロック09のほか、モデルを呼ぶブロック（05、11、13、14、15）とトークン数の測定は動かし直していない。
- `keywords/` の CSV はこの環境に無く、G10 の CSV との一致は確かめていない（裁定2の注記のとおり）。
- 出典2、4〜10 は開き直していない（3回目が 2026-11-27 に確かめ、その後これらに当たる本文は変わっていない）。guides/01〜10 は読み直していない。

### 直すべき指摘

無し。

### 任意の指摘

| # | 場所 | 内容 |
|---|---|---|
| 1 | 記事:181 | 「作業フォルダに CLAUDE.md を1つ置いて」の「作業フォルダ」は `<work>/isolation` で、99行目・128行目の作業フォルダとは別（C26）。また `run/16.log:5-7` は3行とも `has_nyan=False` で、CLAUDE.md が答えに出たことはログで示せていない。「測定用の別のフォルダに」と書き、効き目は書かない案 |
| 2 | `gate.md` の C17、`lint/judgments.md` | 418行目の語尾の記録が「です」「ます」「です」だが、実際は「です」「ません」「です」。結論は変わらない |
| 3 | `sources.md`、この review.md の3回目の節 | 「`run/16.log` の3行目」は4行目。`selection.md:251-273` は `selection.md:92-114` |
| 4 | この review.md の3回目の節 | 指摘ごとの対応が無い |
| 5 | `lint/judgments.md` の冒頭、`gate.md` の C33、G05 | lint の最後の実行日が 2026-11-14 のまま（最後は 2026-11-27）。G05 の `SKILL.md:377` は今は :413 |
| 6 | 記事:418 | 「理由は JSON の `result` に入るので」は実行中の失敗に限る話。「実行中の失敗の理由は」とする案 |
| 7 | 記事:232-253、出典1 | 出典1に「`--bare` は将来 `-p` の既定になる」とある。公開後に版を上げて動かし直すときに見る項目 |
| 8 | 記事:257 | 「Claude の API では」は出典3の表の Anthropic API の行を指す。誤りではない |
| 9 | 3回目の任意の指摘2、4、6、9 | 次の記事へのリンク、`ask.ts` の `JSON.parse`、`--bare` の文面、S1・S6 は開いたまま |

### 3回目の直すべき指摘

- 1（`gate.md` の G10 の根拠）: 閉じた。
- 2（記事:181 の測定の質問）: 閉じた。

## 点検（2026-11-27、5回目。head 53f667e、4回目からの差分）

- 判定: PASS。直すべき指摘0件、任意の指摘4件。4回目の任意の指摘1〜6は、どれも直っていた。点検する側は読み取りだけで、ファイルは直していない。
- 点検した道具: Claude Code のサブエージェント。モデルは Opus 5.5（claude-opus-5-5）で、この記事の執筆と直しには関わっていない。`claude --version` は `2.1.332 (Claude Code)`。ログインはプランのログイン。環境変数 `ANTHROPIC_API_KEY` は未設定。
- 裁定6の確認: `env -u ANTHROPIC_API_KEY claude -p --output-format stream-json --verbose --strict-mcp-config "1+1は？"` を `head` なしで、2026-11-27T14:25:16Z〜14:25:21Z に実行した（exit=0）。3行目が `system`/`init` の行で、値は `"apiKeySource":"none"`。同じ行の `claude_code_version` は 2.1.332。
- 書いた AI のサブエージェント自身の init は、点検する側からは見えない。
- 書いた道具: Claude Code のサブエージェント（Claude）。今回の直し（53f667e）は文章と記録だけで、`run/`、`code/`、`scripts/`、`docs/`、`.claude/` に触れていない。コードは 2026-11-11 と 11-12 に、オーナーの端末の Claude Code 2.1.322 で動かした（プランのログイン）。
- 渡されたもの: worktree（head 53f667e）と、点検の項目を並べた依頼文（3876a6e からの差分を見ること、4回目の通しの点検に頼る差分の点検であること）。書いた AI の報告と結論は渡されていない。

### 確かめたこと

- `git diff 3876a6e HEAD -- content logs` を全部読んだ。記事で変わったのは181行目と418行目だけで、445行のまま。コードと出力のブロックは変わっていない。
- 181行目「測定用の別のフォルダに CLAUDE.md を1つ置いて」: `code/extra/measure-isolation.sh:10-12` の `$WORK/isolation` と合う。CLAUDE.md が答えに効いたという文は無く、`run/16.log:5-7` の `has_nyan=False` と矛盾しない。質問は同じスクリプトの :19 と一致、0.00063319 は `run/16.log:7`。
- 418行目「実行中の失敗の理由は JSON の `result` に入る」: 出典1（https://code.claude.com/docs/en/headless 、2026-11-27 取得）の "If you pass an invalid flag, Claude Code reports the error to stderr before the run starts. When a failure happens inside the run, …, Claude Code prints the failure as the result on stdout." と合う。415、416、175行目とも食い違わない。
- C25: 181行目は46、55、16、31、58字、418行目は29、52、35字で、どれも60字以下。C17: 181行目と415〜422行目に3連続は無い。`gate.md` の C17 と `lint/judgments.md` の語尾の記録は実際の文と一致。C16 は `prose-check.txt` の分布と一致。C26: 「フォルダ」は99、128、181行目で同じ語。
- 記録の訂正: `gate.md` の G05 の `SKILL.md:413` は `verified_at` の行。`sources.md` の `run/16.log` の4行目は CLAUDE.md の行。`review.md` は追加だけで、前の点検者の文は書き換えられていない。訂正の記録の `run/16.log:4` と `selection.md:92-114` は正しい。
- `python3 scripts/check-article.py claude-p-script-first-call`（作業用の一時フォルダで `npm ci` のあと）: exit=0、確定0、候補0、OUTPUT 13件がログに一致、例外0件。lint 2本と `prose-check.py`、`check-code-and-outputs.py`（ALL OK）の出力は保存済みの `lint/` と1文字も違わない。

### 確かめていないこと

- これは差分の点検で、それ以外の項目は4回目の通しの点検（head 3876a6e、PASS）に頼っている。checklist の全項目、guides、出典2〜10 は読み直していない。
- モデルを呼ぶブロックとトークン数の測定は動かし直していない（コードと出力のブロックが変わっていないため）。`keywords/` の CSV はこの環境に無い。

### 直すべき指摘

無し。

### 任意の指摘

| # | 場所 | 内容 |
|---|---|---|
| 1 | `sources.md:22` | 「作業フォルダに CLAUDE.md を1つ置いている」が181行目の新しい書き方に合っていない |
| 2 | `gate.md` の「2026-11-27 追記（2回目）」 | `prose-check.txt` の差に末尾の `exit=0` の行も増えていることが書かれていない |
| 3 | この review.md の3回目の節の「指摘ごとの対応」 | 書いた側が足したことの書き添えが無い。任意の指摘8の対応は点検した側の記録 |
| 4 | `gate.md` の G11 の行、結論、機械で読む行 | まだ3回目の FAIL を根拠にしている。この点検を足したら同じ commit で直す。4回目の任意の指摘7〜9は開いたまま |

### 指摘ごとの対応（書いた側が 2026-11-27 に足した）

- 1: `sources.md:22` を「測定用の別のフォルダ（`$WORK/isolation`）」に直した。
- 2: `gate.md` の追記に `exit=0` の行も書いた。
- 3: 3回目の節の「指摘ごとの対応」に、書いた側が足したことの1文を足し、任意の指摘8は点検した側が補ったと書き直した（点検者の本文は書き換えていない）。
- 4: `gate.md` の G11 の行・結論・機械で読む行を、4回目と5回目の PASS を根拠に OK にした。4回目の任意の指摘7（`--bare` が将来 `-p` の既定になる）は公開後に版を上げて動かし直すときに見る項目、8・9 のうち S1・S6 と次の記事へのリンクはオーナーか統括の判断、`ask.ts` の `JSON.parse` はコードと出力をオーナーのプランで動かし直す必要があるので、どれもこの直しでは扱わない。
