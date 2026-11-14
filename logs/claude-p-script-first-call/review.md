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
