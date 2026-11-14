# review: claude-agent-sdk-streaming

- 点検した日: 2026-11-11
- 書いた道具: Claude Code のサブエージェント（Claude）。API キーは使っていない（`run/14.log`、`run/15.log`、`run/17.log` の `apiKeySource` が none。`run/09.log` 〜 `run/16.log` の見出しは `ANTHROPIC_API_KEY: unset`）
- 点検した道具: Claude Code のサブエージェント（Claude、Sonnet 5.5）。書いたエージェントとは別。Claude Code のバージョン 2.1.322（`claude --version` の出力）。プランのログイン。この点検ではモデルを呼ぶコードを動かしていない
- 結果: 直すべき指摘 2 件、任意の指摘 6 件

## 直すべき指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/claude-agent-sdk-streaming.md:235`、`logs/claude-agent-sdk-streaming/gate.md:76`、`sources.md:10` | 「`content_block_start` を見ます。`content_block.type` が `thinking` のときが、表示を切り替える合図です」は、新しいログのどこにも裏付けが無い。この文には（出典n）が付いておらず、`sources.md` の出典2の行は `thinking_delta` と `signature_delta` しか記録していない。それなのに gate.md の C37 は、この文を「動作確認した結果」から下した判断に数えている。thinking のブロックは `run/09.log` 〜 `run/17.log` のどこにも届いていないので、動かして確かめた事実ではない | `run/14.log`、`run/15.log` は `message_start` の直後に `content_block_start text`。`run/17.log` は6回とも `thinking=false`。出典2のページには `content_block_start` の例（`"content_block": {"type": "thinking", ...}`）があることを、点検で `platform.claude.com/docs/en/build-with-claude/streaming.md` を開いて確かめた。つまり出典で支えられるが、記事も記録もそう書いていない | 235行目の文に（出典2）を付ける。`sources.md` の出典2の行に「`content_block_start` の `content_block.type` が `thinking`」を足す。gate.md の C37 の根拠から「thinking の間の表示の切り替え方 235行目」を外す（動かしていない判断なので） |
| 2 | `content/articles/claude-agent-sdk-streaming.md:45`、`251`、`262`（頭の数字）と `229`、`231`〜`235` | 「最初の文字は1,743ミリ秒」「約1.7秒」が、読者の環境でも出る値のように読める。同じ手順の6回で測った最初の text までの時間は、`strictMcpConfig=true` の3回が 1,924、2,445、2,068 ミリ秒、付けない3回が 2,435、2,358、3,242 ミリ秒で、記事の 1,743 と 1,655 はそのどれより速い。さらに、同じコードと同じモデルで書き手の最初の撮影（`run/06.log`、`run/07.log`）は thinking のブロックが先に届き、最初の text_delta が 2,994 と 4,082 ミリ秒だった。なぜ届いたり届かなかったりするのか、書き手の README は分からないと書いている。読者の実行で thinking が出ると、`timing.ts` の出力は記事の出力と形が変わり、「最初の文字」の時刻も数秒ずれる。229行目の「届く個数と時刻は、実行のたびに変わります」は個数と時刻の揺れしか言っておらず、thinking が出るかどうかが実行ごとに変わることと、出たときは最初の text_delta が thinking の分だけ遅れることを書いていない | `run/17.log` 3〜8行目（6回の `first_text_ms`）。`run/14.log`、`run/15.log`。`run/06.log`、`run/07.log`（旧い記録だが、同じコードで thinking が届いた事実として使える）。`code/README.md` 末尾の段落「thinking が消えたのは `strictMcpConfig` のせいとは言えない」 | 262行目と45行目は「この実行では」「1.7秒前後から2秒台」のように幅で書き、`run/17.log` の6回（1,924〜3,242ミリ秒）を根拠として足す。231〜235行目に、thinking が先に届く実行もあり、そのとき最初の text_delta は thinking の終わりまで出ないことを1文足す（出典2と `run/06.log` を根拠にできる） |

## 任意の指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/claude-agent-sdk-streaming.md:251` | 「付けなければ、画面に出るのは3,243ミリ秒の assistant からです」は、`includePartialMessages` を付けない実行を測っていない推定。出典1の説明（ブロックが書き終わってから `AssistantMessage` が届く）とは矛盾しないが、実測として読める | ログに付けない実行は無い（`run/17.log` の比較も `strictMcpConfig` の有無だけ） | 「付けない実行は測っていません。出典1では、assistant はブロックが書き終わってから届きます」のように推定だと書く |
| 2 | `content/articles/claude-agent-sdk-streaming.md:253` | 「答えが長いほど差は広がります」は、長い答えで測ったログが無い | `run/14.log`、`run/15.log` は341字と293字の2回だけ | 削るか、「長い答えは測っていません」と添える |
| 3 | `content/articles/claude-agent-sdk-streaming.md:231`〜`233` | thinking のブロックを出す方法（どのオプションで使うか）が書かれていない。読者は「使う応答」を再現できない。README によれば `thinking: { type: "disabled" }` を渡しても届いた実行があった | `code/README.md` 「記事に載せなかった試し」の段落 | 出典2の thinking のページへのリンクか、オプション名を1つ足す。足せないなら、この節は「届いたら」の説明だと明示する |
| 4 | `logs/claude-agent-sdk-streaming/gate.md:6`、`sources.md:3`、`lint/judgments.md:3` | 「287行」は古い。原稿は286行（`writing-lint.txt` 1行目も `286行`）。引用している行番号自体は286行の版と合っている | `wc -l` と Read の行数が286 | 「287行」を「286行」に直す |
| 5 | `logs/claude-agent-sdk-streaming/gate.md` 末尾の「結果」 | 「A は G07 と G10（CSV 待ち）が NG」は古い。冒頭の追記と G10 の行は OK に変わっている | gate.md 冒頭の追記、G10 の行 | 結果の行を現状（NG は G07 と未点検の G11）に直す |
| 6 | 公開の順番（`gate.md` G07） | G07 は NG のまま。前（`claude-p-script-first-call`）、次（`llm-api-cost-estimate-js-tiktoken`）、関連（`claude-agent-sdk-first-agent`）はどれも `status: draft`、`publish_at: null`。この記事だけ先に公開するとリンク切れになる | 3本の frontmatter を確認 | 前の記事より後に予約する、または3本をそろえて予約する |

## 確かめて問題が無かったこと

- 数字と出力（項目1）: 記事の 1,743、3,243、3,229、73個、341字、1,486、1,655、2,948、63個、293字、約1.5秒（3,243 − 1,743）、約1.3秒（2,957 − 1,655）、平均5字（341 ÷ 73）、約20ミリ秒（1,486 ÷ 72 または 73）を、`run/14.log` と `run/15.log` の行から1つずつ計算して合うことを確かめた。thinking 以外で旧ログ（`run/01.log` 〜 `08.log`）の値が現在の数字として残っている箇所は無い（記事の数字は `run/09.log` 〜 `17.log` の値だけ）。
- コード（項目2）: `python3 -I logs/claude-agent-sdk-streaming/lint/check-code-and-outputs.py content/articles/claude-agent-sdk-streaming.md logs/claude-agent-sdk-streaming` を、スクリプトを先に読んでから実行した。`ALL OK`（記事のコードブロックと実行結果がログと一致、`query() 2 / strictMcpConfig 2`、`run/14.log`、`15.log` の `apiKeySource=none`）。`code/extra/compare-strict.ts` は `strictMcpConfig` を付けない側があるが、README と `run/17.log` の説明があり、記事には載っていない。`ANTHROPIC_API_KEY` の使用は無い。
- 出典（項目3）: 記事の（出典1〜7）は7つすべて本文で引かれ、表、frontmatter、`sources.md` の7行が同じ。点検で開いたページ: 出典1（`streaming-output.md`、assistant が `content_block_stop` の前に届くことと、同じ message ID）、出典2（`streaming.md`、`thinking_delta`、`signature_delta`、`content_block_start` の thinking の例）、出典4（`authentication.md`、キーがあると承認後にキーを使う）、出典5（サポート記事、プランでは利用枠から引かれる）、出典6（`claude.com/pricing`、Pro が月払いで $20、Ultra の名前がある）、出典7（Node.js 22.23.4 のページ、v22.18.0 で type stripping が既定で有効）。出典3の `sdk.d.ts` は開いていない。
- 利用条件の注意書き（項目4）: 原稿全体に、利用規約、個人利用に限る、API キーを使うべき、Console で発行、といった文は無い。58、68行目の `ANTHROPIC_API_KEY` の説明は `apiKeySource` と認証の優先順位の技術的な説明で、許される範囲。
- リンク（項目5）: `claude-p-script-first-call`、`claude-agent-sdk-first-agent`、`llm-api-cost-estimate-js-tiktoken` は `content/articles/` にある。`plan.md` の #1、#2、#3 の順で `prev`、`next` と合う。禁止の旧 slug 4つは原稿に無い。「初めて呼ぶ手順は前の記事」は前の記事のタイトルと合い、`total_cost_usd` の読み方は入門の記事の「total_cost_usd は請求額の見積もり」の節にある。前の記事の `next` も `claude-agent-sdk-streaming`。
- `target_query`（項目6）: 「llm ストリーミング」は `keywords/google-suggest-llm-api.csv` の65行目に一字一句同じ行がある。タイトルは「LLM」「ストリーミング」を前方に置き、記事は Agent SDK での受け取り方を答えている。Messages API の直接ストリーミングを探す人には合わないが、このリポジトリの方針（キー不要）の範囲で答えており、合わないとは言えない。
- ゲートの行（項目7）: G01、G02（lint 2本を `content/articles/claude-agent-sdk-streaming.md` に対して標準出力へ再実行。判定行は保存した `ai-smell.txt` の `致命なし`、`writing-lint.txt` の `FATAL 0 / DENSITY超過 0 / SHOULD 0` と同じ）、G04、G05（出典7件の対応と `run_environment` が `run/14.log`、`run/16.log` と一致）、G08（286行目）、G09、C08（check スクリプトが ALL OK）、C25（本文の文を frontmatter と表と見出しとコードを除いて数え直し、60字超は0件。title の値は59字）の9行は本当に OK。G07 は NG と正直に書いてある。C37 は上の直すべき指摘1の1か所だけ根拠が不正確だが、ほかの根拠で成り立つ。
- ログの日付: `verified_at: 2026-11-11` と末尾の「コードは 2026-11-11 に」は、`run/14.log` の `2026-11-12T01:01:53Z` が手元の日付（この点検の `date` は PST で 2026-11-11）と同じ日になることと合う。`run_environment` の Node.js 22.23.4、npm 10.9.9、SDK 0.3.322、Claude Code 2.1.322、Darwin arm64、tsc 7.0.2 は `run/09.log` 〜 `16.log` の見出しと一致。
- プライバシー（項目8）: `logs/claude-agent-sdk-streaming/` と原稿を `/Users/`、`@`、`session_`、`sk-ant-`、ユーザー名とアカウント名の系統で走査した。当たったのは `@anthropic-ai/...` のパッケージ名と、gate.md の G09 の行が検索語として書いた文字列だけ。ログの絶対パスは `<work>`、`<tc>` に置換済み。
- 読者テスト（項目9）: 手順どおりに打つ前提（Node 22.18.0 以上、`type=module`、`node stream.ts`）は出典7と `run/13.log` で成り立つ。`npm install` の出力（105 packages、15s）は読者ごとに変わりうるが、断定ではなく出力例。

## 確かめていないこと

- 記事のコードの再実行（指示で禁止）。
- 出典3（unpkg の `sdk.d.ts`）のページ。`sources.md` にある「作業フォルダの版と1バイトも違わない（585,906 バイト）」も、作業フォルダが消えているので確かめられない。
- thinking が届く条件（モデル、時刻、アカウント側の設定）。新しいログに届いた例が無いので、原因は分からないまま。
- 公開済みの他記事とのキーワードの重なり（G06）、C09〜C24 の文章の質の判定は、ガイドを読み直す形では確かめていない（lint と文字数だけ再確認）。

## 対応（2026-11-13）

| 指摘 | 対応 | 変更点（ファイル:行）または理由 |
|---|---|---|
| 直すべき 1 | 直した | 記事 :241 の文に（出典2）が付いている。`sources.md` 出典2の行に `content_block.type` が `thinking` を追記し、使用行を 239、241 に直した。`gate.md` C37 の根拠から thinking の切り替え方を外し、「動かして確かめた結果ではない」と明記した |
| 直すべき 2 | 直した | 記事 :45 は「5回測ると 1,655〜2,445 ミリ秒、thinking が先に届く実行ではもっと遅れる」、:229-237 は2回目と追加3回（1,924、2,445、2,068）と thinking が先に届く実行（2,994、4,082）を書き、:270 は「この環境では 1.7〜4.1 秒」。根拠は `run/14.log`、`run/15.log`、`run/17.log`、`run/06.log`、`run/07.log` |
| 任意 1 | 直した | 記事 :257、:259。「付けない実行は測っていません」と書き、出典1の記述として扱った |
| 任意 2 | 直した | 記事 :261。「長い答えは測っていません」。「差は広がります」は削除 |
| 任意 3 | 見送り | thinking を出すオプション名は動かして確かめていない（README では disabled でも届いた）。記事 :235-237 は「どちらのコードも thinking を指定していない」「届く理由はわかっていない」と書いてある |
| 任意 4 | 直した | `gate.md:6`、`sources.md:3`、`lint/judgments.md:3` を294行に。gate の行番号は294行の版に合わせて直した |
| 任意 5 | 直した | `gate.md` の結論の行を、NG は G07 のみ（G10 は OK、G11 は未点検）に |
| 任意 6 | 見送り | 公開の順番で解消する。今は直さない（G07） |

点検の結果（2026-11-14）: 直すべき指摘 1

- gate.md の行番号と数が今の原稿（292行）と合わない。`gate.md:6` と `gate.md:32` G08 は「294行」だが末尾は `content/articles/claude-agent-sdk-streaming.md:292`。`gate.md:26` G02 は `286行/115文` だが `lint/writing-lint.txt` 1行目は 292行/117文。`gate.md:42` C03 は「45行目で…1,743ミリ秒と3,243ミリ秒」だが :45 は「1,655〜2,445ミリ秒」。`gate.md:45` C06 の見出し「237」は今 :233。`gate.md:49` C10 の「231→235 stream.ts の条件を通りません」は :241、「237→239 assistant は届きます」は :245、「247→249 完成する時刻は早くなりません」は :255、「264→266 プランの利用枠」は :274。`gate.md:29` G05 と `gate.md:30` G06 は 276行目と 59行目にリンクがあると書くが、どちらにもリンクは無い。`gate.md:61` C22 の「答えが長い（259行目）」、`gate.md:62` C23 と `gate.md:66` C27 の「約1.7秒」「1.5秒ほど」は本文に無い。`gate.md:78` C39 の引用文（約1.7秒をどう見せますか）は :270 の文と違う。全12本で `lint/prose-check.txt` が今の原稿に回し直した結果と食い違う（原稿を直したあとに証跡を取り直していない。2026-11-14 の本文リンクを外した直しが原因と見られる）

対応（2026-11-14）:

- gate.md の行番号と数と引用: 全行を今の原稿の行に合わせて書き直した。主な行は gate.md:26（G02）、gate.md:29（G05）、gate.md:30（G06）、gate.md:32（G08）、gate.md:42（C03）、gate.md:45（C06）、gate.md:49（C10）、gate.md:55（C16）、gate.md:61（C22）、gate.md:62（C23）、gate.md:66（C27）、gate.md:78（C39）。
- `lint/prose-check.txt`: 今の原稿で回し直し、`lint/ai-smell.txt`、`lint/writing-lint.txt`、`lint/check-code-and-outputs.txt` も取り直した（`lint/` 内の各ファイル）。
- content/articles/claude-agent-sdk-streaming.md:121: `入門の記事と同じ` を `の指定は次のとおりです` に直し、リンクの無い別記事への言及を消した。

点検の結果（2026-11-14 2回目）: 直すべき指摘 0

- 直すべき指摘は無し。

点検した道具: Claude のサブエージェント（Opus 5.5、この記事の執筆と直しには関わっていない）。環境変数 `ANTHROPIC_API_KEY` は設定なし（`env` で0件）。やったこと: lint 2本を作業用の一時フォルダへ回し直し（ai-smell exit 0・FATAL 0、writing-lint `FATAL 0 / DENSITY超過 0 / SHOULD 0`、保存済みの `lint/` と一致）。`lint/check-code-and-outputs.py` と `lint/prose-check.py` を今の原稿で回し直し、保存済みと一致（ALL OK）。gate.md の G・C 行にある「N行目「引用」」「「引用」（N行目）」と、見出し・問い・段落を指す行番号を、全行スクリプトで今の原稿と照らした。G05 の出典の表の範囲と件数、引用している行の一覧を照らした。過去の点検の直すべき指摘（G07 を除く）は、今の本文の該当行を開いて閉じているか確かめた。地の文の3桁以上の数を run/ と code/ のログと照らし、見つからない数は計算で確かめた。ほかの記事を指す文は、指す先の記事が同じ記事の本文でリンクされているかを確かめた。G07 は対象外。本文の通読は、スクリプトで拾った箇所と過去の指摘の箇所に限った。
