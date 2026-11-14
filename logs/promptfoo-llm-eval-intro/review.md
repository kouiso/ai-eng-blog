# review: promptfoo-llm-eval-intro

- 点検した日: 2026-11-11
- 書いた道具: Claude Code のサブエージェント（Claude）。API キーは使っていない（`run/14.log` から `run/23.log` の4行目が `ANTHROPIC_API_KEY: unset`、`run/23.log` の init が `apiKeySource=none`）
- 点検した道具: Claude Code のサブエージェント（Claude、Sonnet 5.5）。書いたエージェントとは別。Claude Code のバージョン 2.1.322 (Claude Code)。プランのログイン。この点検ではモデルを呼ぶコードは動かしていない
- 結果: 直すべき指摘 2 件、任意の指摘 6 件

## 直すべき指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/promptfoo-llm-eval-intro.md:10`（`run_environment`）、`:77`、`:147-150`（`npm audit` の出力）、`logs/promptfoo-llm-eval-intro/gate.md` の G05 の行、`lint/check-code-and-outputs.txt` の `run/10.log` の2行 | `run_environment` は「Node.js 22.23.4、npm 10.9.9、macOS arm64（型の確認は TypeScript 7.0.2）」と書いているが、型の確認の根拠 `run/10.log` は前の実行（2026-11-10 08:39 UTC、Node.js 22.22.0、npm 10.9.4、README では Linux x86_64）のログで、`@types/node` 22.20.5 を使っている。2026-11-11 の実行 `run/14.log` から `23.log` には型の確認が無い。`:147-150` の `npm audit` の2行も、前の実行の `run/09.log:11-12` から写したもの（`run-fix.sh` は 09 から 11 に当たる手順を動かしていない）。さらに「macOS arm64」を示す行はどのログにも無い（`uname` も `arm64` も `run/*.log` に0件。README と gate.md の記述だけ）。gate.md の G05 は「TypeScript 7.0.2 は `run/10.log`」と書いて OK にしており、false OK。`check-code-and-outputs.py` は 10.log と 09.log が古い実行のものだと見分けないので、ALL OK では検出できない | `run/10.log:2-3`（`date: 2026-11-10T08:39:21+00:00`、`node: v22.22.0  npm: 10.9.4`）、`run/09.log:2-3`、`code/README.md:20`（01 から 13 は Linux x86_64、Node.js 22.22.0）、`code/extra/run-fix.sh:50-72`（型の確認の step が無い）、`grep` で `uname`/`arm64`/`Darwin`/`Linux` が `run/*.log` に0件 | 型の確認と `npm audit` を、Node.js 22.23.4 の同じ環境で取り直して `run/` に残す（`run-fix.sh` に 09 から 11 に当たる step を足す）。`uname -sm` を各ログのヘッダーに足し、「macOS arm64」をログで裏付ける。取り直せないなら、`run_environment` の「型の確認は TypeScript 7.0.2」を外すか「Linux、Node.js 22.22.0 で確認」と書き分け、G05 を NG に直す |
| 2 | `content/articles/promptfoo-llm-eval-intro.md:402`（見出し）、`:411`、`:413` | 見出し「トークン数は3分の1以下になった」は、この環境の1組の数字を一般の比率として書いている。比率そのものは合っている（`run/17.log:33` の 8,185 を `run/22.log:29` の 28,013 で割ると 29.2%、prompt は 7,841 と 27,745 で 28.3%、2回目の 8,129 でも 29.0%）。しかし同じ記事の前の実行では、同じ2つの設定が `run/04.log:31` の 16,663 と `run/08.log:28` の 31,708 で、比は 52.5% だった（前回の見出しが「約半分」だった理由）。差の prompt も今回は 19,904、前回は 13,871 で、同じ `claude_code` プリセットを足しているのに6千トークンずれる。本文 `:411` は増えた分を「既定で付く Claude Code のシステムプロンプトです」と言い切るが、ログが示すのは2つの設定の違いが `systemPrompt` だけ（promptfoo 0.125.1 の `src/providers/claude-agent-sdk.ts` 1622行目でツールは両方空、1710から1724行目でプリセットとカスタムの切り替え）ということまでで、増加分がプリセットの文章の大きさだと測ってはいない。前回との差（約6千）は原因が書かれていない。読者の環境（読み込まれるものが違う）では比は変わりうるのに、断定に見える | `run/17.log:33-34`、`run/19.log:31-32`、`run/22.log:29-30`、`run/04.log:31-32`、`run/08.log:28-29`、`code/README.md:20`（前の実行と今の実行は環境が違う）、`sources.md` 出典9の行（1710行目付近） | 見出しを「システムプロンプトを差し替えると、prompt のトークン数は 7,841 から 27,745 に増えた」のように、実測の数字だけにする（比率の語を外す）。`:411` は「2つの設定の違いはシステムプロンプトだけなので、増えた分はこの差です」と根拠の範囲まで書き、「この環境での値で、読み込まれるものが違えば変わる」の1文を足す。前回の実行で差が小さかった理由が分かるなら `judgments.md` に残す |

## 任意の指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `code/README.md:21-22`、`gate.md` の G04 の行 | README に古い記述が残っている。21行目「今のログは、同日 08:38〜08:39 UTC に…全部やり直したもの」と22行目「モデルを呼ぶ `run/04.log`、`06.log`、`08.log`、`13.log` は…`apiKeySource` は `none`（`run/13.log`）」は、今の記事の根拠（`run/17.log` から `23.log`）と食い違う。20行目の新しい説明と並んで読むと、どれが今のログか迷う | `code/README.md:20-22` | 21から22行目に「前の実行の記述」と明記するか、14から23の記述に書き直す |
| 2 | `logs/promptfoo-llm-eval-intro/brief.md` の見出し骨格 8 | 「ほかの人に使わせるなら API キーで動かす」という、オーナーが「書かなくていい」と裁定した種類の節が骨格に残っている。記事には無い（`grep` で記事に該当する文は0件）。public リポジトリのログに残るだけだが、取り下げた旨が無い | `brief.md` の見出し骨格 8、`SKILL.md:247` | 骨格から消すか「記事からは削除済み」と書く |
| 3 | `content/articles/promptfoo-llm-eval-intro.md:305` | 「左の列の出力も、正しいラベルは3件とも含んでいます」。`:301` で「右の2列がプロンプト」と書いているので、「左の列」が表の左端（inquiry）に読める。実際は「形の指定なし」の列 | `run/17.log:7-8`（列の並び） | 「形の指定なしの列の出力も」と書く |
| 4 | `target_query`（`"promptfoo とは"`）とタイトル | `keywords/google-suggest-llm-eval.csv` に同じ行はある（49行中1行、rank 2）ので G10 は問題なし。ただし検索意図は概念（とは）で、記事は入門のやり方。リードの1文目（`:67`）が定義に答えるだけで、「とは」と検索した人が最初に欲しい「何を解決するツールか」「ほかの評価方法との違い」は短い。タイトルにも「とは」は無い | `content/articles/promptfoo-llm-eval-intro.md:67-71`、`selection.md` の2026-11-11 追記 | リードに、promptfoo が何を自動化するか（プロンプトを変えるたびの目視確認を、採点つきの表にする）を1文足す。または `brief.md` の検索意図を「やり方」にそろえて、弱い適合と認める |
| 5 | `gate.md` の G07 | gate.md 自身が NG としている（リンク先5本が `status: draft`）。公開順を、リンク先を先に予約する順にしないと、公開時にリンク切れになる。判定は正直 | `gate.md` の G07 の行 | 公開手順（手順10）で、リンク先5本が先に予約されていることを確かめてから予約する |
| 6 | `code/promptfooconfig.yaml:20`、記事の `:180` | `strict_mcp_config: true` は promptfoo 0.125.1 では既定値でもある（`config.strict_mcp_config ?? true`、`sources.md` が記した dist 507行目と、GitHub のタグ 0.125.1 の `src/providers/claude-agent-sdk.ts` 1705行目で確認）。付けても害は無く、スキルの規約どおり。ただし、前の実行（設定に行が無い）で入力が約16千、今回が約7.8千と小さいのは、この行のせいではなく環境の違いかもしれない。README はこの行の追加で減ったと読める書き方 | `code/README.md:14,20`、`run/04.log:32`、`run/17.log:34` | README の「足したあとで」の書き方を、減った理由は未確認と分かる書き方にする |

## 確かめて問題が無かったこと

- 数値と出力（記事の引用ブロック14個）: `python3 -I logs/promptfoo-llm-eval-intro/lint/check-code-and-outputs.py content/articles/promptfoo-llm-eval-intro.md logs/promptfoo-llm-eval-intro` をスクリプトを読んでから実行し ALL OK。加えて、`run/17.log:33-38`（8,185、7,841、344、48、3 passed、6s）、`run/19.log:31-38`（8,129、7,843）、`run/22.log:29-30`（28,013、27,745）、`run/21.log`（0.00133430、`costBasis=claude-haiku-5-5:list`）を記事の `:288-295`、`:400`、`:408-409`、`:417` と目で突き合わせて一致。
- 2回目の比較（`:386-390`）: `run/18.log` の2件目は「**bug**」で「分類:」なし、`run/20.log` の2件目は「**分類: bug**」で、記事の引用文と1文字も違わない。終了コード 100 は `run/17.log` と `run/19.log` の末尾。
- 日付: `verified_at` と末尾の「2026-11-11」は `run/14.log` から `23.log`（2026-11-11 17:04 から 17:05、UTC-8）と合う（UTC では 2026-11-12 01:05 で、表の `eval-GIb-2026-11-12T01:05:19` と同じ時刻）。
- コード: `promptfooconfig.yaml` と `show-failures.ts` は `code/` の同名ファイルと一致（上のスクリプトの #8 と #11）。`code/extra/check-auth.ts` の `query()` は `strictMcpConfig: true`、promptfoo の設定は `strict_mcp_config: true`。`claude -p` は使っていない。`ANTHROPIC_API_KEY` を使うコードは `code/` に0件（`grep` で、出てくるのは unset を確かめるログ用の行だけ）。
- 設定ファイルの読み込み（観点 c）: promptfoo 0.125.1 は `settingSources: config.setting_sources ?? []`（`src/providers/claude-agent-sdk.ts` 1772行目。GitHub のタグ 0.125.1 を開いて確認）で、設定に何も書かなくても、この機器の設定ファイルや CLAUDE.md は読まない（SDK の `sdk.d.ts` は省略時に全部読むと書くので、この既定値が効いている）。一時フォルダで動く（同 1886行目）。最新の `run/17.log` から `22.log` の出力に、この機器の口調や印は無い。1回あたりの prompt は 7,841 を6回で割って約1,307 で、ユーザーの CLAUDE.md を読んだ規模ではない。読者の環境でも設定は読まれないので、数値の再現性が下がる原因はここにはない（再現性の問題は指摘 2 の環境差のほう）。
- ツール: ツールが既定で空であることは、同 1622行目 `config.working_dir ? FS_READONLY_ALLOWED_TOOLS : []` で確認。記事 `:241` と合う。
- 出典: 本文の（出典n）が1から15、表が15行、frontmatter の `sources` が15件、`sources.md` が15行で一致（gate.md の G05 が記した確認を、番号の数え直しで再確認）。事実の突き合わせは3件を開いて確認した。出典9（promptfoo 0.125.1 のソース）で `custom_system_prompt` が無いときに `preset: 'claude_code'`（1710行目付近）、同じソースで `apiKeyRequired === false` のとき既定でキャッシュを使わないと `sources.md` に書いた処理、`sdk.d.ts`（出典14）の `settingSources` の説明。出典の本文が断定を支えている。
- 規約についての文: 記事に、利用規約、個人利用、API キーを使うよう勧める、Console でのキー発行を勧める文は0件。`ANTHROPIC_API_KEY` と `apiKeySource` の記述は技術説明（`:86`、`:96`、`:421`）。
- リンク: `rag-retrieval-eval-recall-mrr`、`llm-eval-harness-fixtures`、`llm-as-a-judge-claude`、`claude-agent-sdk-first-agent`、`llm-eval-dataset-from-logs` の5本が `content/articles/` にある。`prev`、`next` は `content/plan.md` の #28、#30 と一致。旧 slug の4つは記事に0件。`:251` の「部分一致の通し方は採点の記事で試しました」と `:380` の「採点を緩めない理由」は、`llm-eval-harness-fixtures.md:261` と `:275`（部分一致を試した出力と、部分一致に緩めない理由）で本当。
- ゲートの行（OK の行で、今も本当か）: G01 と G02 は lint を標準出力で再実行し、判定行が保存済みと同じ（ai-smell は use 0件、writing-lint は FATAL 0 / DENSITY超過 0 / SHOULD 0）。G10 は CSV を開き `promptfoo とは` が1行ある。G09 は `/Users/`、`session_`、`sk-ant-` を `logs/` と記事に `python3` で走らせて、出たのは出典の URL とファイル名の文字列、npm のスコープの `@` だけ。C25 は `prose-check.py` を再実行して issues=0。C30 の `**` は表の中の出力と引用の中だけ。C06、C14、C08 も記事を読んで本当。G04 の「ログがある」は本当だが、型の確認の環境は指摘 1。G05 は指摘 1 のため false OK。
- 個人情報: `logs/` と記事に、アカウント名、メールアドレス、セッションの ID、`/Users/` のパス、トークンは無い。
- 読者の目（観点 9）: 「形の指定なし」が3件とも不合格になる結果は、6回の実行（`run/04.log`、`06.log`、`08.log`、`17.log`、`19.log`、`22.log`）で毎回3件、「形の指定あり」は毎回3件合格。記事は出力の文面が実行ごとに変わることを `:382-392` で書いている。しきい値すれすれの演示ではない。

## 確かめていないこと

- 記事のコードの再実行（モデルを呼ぶため、規約で禁止）。ログの数値が今の環境で再現するかは見ていない。
- 出典のうち、promptfoo の GitHub ソースと SDK の型定義の2つだけをこの点検で開いた。ほかの出典 13 件（料金ページ、認証ページ、サポート記事など）は、`sources.md` の記述を信じて、中身を開いて確かめていない。promptfoo のドキュメントのサイトは、この環境から開けなかった（HTTP 403）。
- 「macOS arm64」は、ログに無いので事実かどうか確かめられなかった（指摘 1）。
- `claude.ai` のコネクタが前の実行で読み込まれていたかどうか（入力が約16千から約7.8千に減った理由）。ログに init の `tools` と `mcp_servers` の数があるのは `run/23.log` だけ。

## 対応（2026-11-13）

直すべき指摘

| # | 結果 | 何を変えたか |
|---|---|---|
| 1 | 直した | モデルを呼ばない手順を同じ端末で取り直した記録が `run/24.log`〜`27.log`（`uname: Darwin arm64`、Node.js 22.23.4、npm 10.9.9、TypeScript 7.0.2、`npm audit` の2行）にある。`lint/check-code-and-outputs.py` の照合先を `run/09.log`、`run/10.log` から `run/25.log`、`run/26.log` に替えて ALL OK。`gate.md` の G04、G05、`code/README.md`、`sources.md:34` を新しいログに合わせた。記事:147〜150 の2行は `run/25.log` と一致する |
| 2 | 直した | 記事:402 の見出しを実測の数字だけにした。411〜413 は、2つの設定の違いが1行だけという根拠の範囲まで書き、プリセットの大きさは測っていないこと、前の実行（Linux）の 16,663 と 31,708 との差（15,045 と 19,828）、理由は未確認であることを足した。`gate.md` の C27 の説明も直した |

任意の指摘

| # | 結果 | 何を変えたか |
|---|---|---|
| 1 | 直した | `code/README.md` の旧い記述に「前の実行の記述」と明記し、`run/09.log`、`run/10.log` を今のログ（`run/25.log`、`run/26.log`）に差し替えた |
| 2 | 直した | `brief.md:35` を「取り下げ済み」に変えた |
| 3 | 直した | 記事:305 を「『形の指定なし』の列の出力も」に直した |
| 4 | 見送り | 検索意図とリードの弱い適合。新しい文の追加は範囲外。G10 は問題なし |
| 5 | 見送り | G07。公開の順番で解消する。今は直さない |
| 6 | 直した | `code/README.md` に、入力が小さくなった理由は `strict_mcp_config` のせいかどうか確かめていないと書いた（`gate.md` の既存の説明と合わせた） |

点検の結果（2026-11-14）: 直すべき指摘 2

- `content/articles/promptfoo-llm-eval-intro.md:413` で、見出し（:402）と :411 は prompt の列（7,841 から 27,745、差は 19,904）を言うのに、:413 の「16,663 と 31,708」「差は 15,045」「今回の差は 19,828」は Total Tokens の列（`run/04.log`、`run/08.log`、`run/17.log`、`run/22.log` の `Total Tokens` 行）。列が変わったことを書いていないので、読者が 27,745 − 7,841 を計算すると 19,828 と合わない。「Total Tokens で比べると」と書くか、prompt の列で揃える。
- gate.md の数と行が今の原稿に合わない。`gate.md:55` C25 は `sentences=222` だが今の原稿に回すと 227（保存済みは 230）。`gate.md:69` C39 の「425行目」の問いは今 :427。全12本で `lint/prose-check.txt` が今の原稿に回し直した結果と食い違う（原稿を直したあとに証跡を取り直していない。2026-11-14 の本文リンクを外した直しが原因と見られる）

対応（2026-11-14）:

- gate.md の行番号と数と引用: 全行を今の原稿の行に合わせて書き直した。主な行は gate.md:55（C25）、gate.md:69（C39）、gate.md:46（C16）。
- `lint/prose-check.txt`: 今の原稿で回し直し、`lint/ai-smell.txt`、`lint/writing-lint.txt`、`lint/check-code-and-outputs.txt` も取り直した（`lint/` 内の各ファイル）。
- content/articles/promptfoo-llm-eval-intro.md:413: :402 の見出しと :411 に合わせ、Linux の値を prompt の列（16,055 と 29,916、差は 13,861）に直し、今回の差 19,904 と列をそろえた（`run/04.log`、`08.log`、`17.log`、`22.log`）。

点検の結果（2026-11-14 2回目）: 直すべき指摘 1

- `logs/promptfoo-llm-eval-intro/gate.md:34` C04 の骨格の行番号が今の原稿と合わない。「前提・環境 78行目」の見出しは `content/articles/promptfoo-llm-eval-intro.md:75`（`:78` は空行）。「次にやれること 394行目」の `:394` は「## 1回の評価で、プランの利用枠から6回分が引かれる」で、次にやれることの節は原稿に無い。今の見出しの行（75、98、154、253、313、394）と中身に合わせて書き直す。

点検した道具: Claude のサブエージェント（Opus 5.5、この記事の執筆と直しには関わっていない）。環境変数 `ANTHROPIC_API_KEY` は設定なし（`env` で0件）。やったこと: lint 2本を作業用の一時フォルダへ回し直し（ai-smell exit 0・FATAL 0、writing-lint `FATAL 0 / DENSITY超過 0 / SHOULD 0`、保存済みの `lint/` と一致）。`lint/check-code-and-outputs.py` と `lint/prose-check.py` を今の原稿で回し直し、保存済みと一致（ALL OK）。gate.md の G・C 行にある「N行目「引用」」「「引用」（N行目）」と、見出し・問い・段落を指す行番号を、全行スクリプトで今の原稿と照らした。G05 の出典の表の範囲と件数、引用している行の一覧を照らした。過去の点検の直すべき指摘（G07 を除く）は、今の本文の該当行を開いて閉じているか確かめた。地の文の3桁以上の数を run/ と code/ のログと照らし、見つからない数は計算で確かめた。ほかの記事を指す文は、指す先の記事が同じ記事の本文でリンクされているかを確かめた。G07 は対象外。本文の通読は、スクリプトで拾った箇所と過去の指摘の箇所に限った。

対応（2026-11-14 2回目）: gate.md:34 C04 を NG に変えた。前提・環境は75行目に直したが、guides/02 タイプ1の「まとめ（次にやれること・関連記事へのリンク）」に当たる節が原稿に無い（末尾は427行目の問い1文と429行目の出典）。原稿の本文は直していない。オーナーに、まとめの節を足すか C04 を許容するかの判断を渡す。gate.md:98、:111、:114 の過去の記録の行番号には「当時の」「dist の」を付けた。 全12本の gate.md の行番号・引用を照合するスクリプトを回し、食い違い0件（旧・当時の記録の行と、sdk.d.ts・dist・plan.md・run・lint のログの行は照合の対象外）。

対応（2026-11-14 3回目）: C04 の指摘（まとめの節が無い）に対応した。`content/articles/promptfoo-llm-eval-intro.md:429-431` に「## まとめ」を足した（本文で見せた比較と終了コード、次の一手として `tests` に自分の入力を足すこと。末尾の問いは節の中へ移した）。出典の表は433〜453行目、末尾の1行は455行目に動いたので、gate.md の C04、C39、G05、G08 を直した。lint 2本・prose-check・check-code を回し直し（ai-smell exit=0・FATAL 0、writing-lint FATAL 0 / DENSITY超過 0 / SHOULD 0、prose-check issues=0、check-code ALL OK）、全記事の gate.md 行番号の照合は食い違い0件。
