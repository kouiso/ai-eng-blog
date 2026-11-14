# review: ai-agent-custom-tools-agent-sdk

- 点検した日: 2026-11-11
- 書いた道具: Claude Code のサブエージェント（Claude）。API キーは使っていない（`run/06.log:7`、`run/07.log:7`、`run/08.log:7` の init 行が `apiKeySource=none`、各ログの `ANTHROPIC_API_KEY: unset`）
- 点検した道具: Claude Code のサブエージェント（Claude、Sonnet 5.5）。書いたエージェントとは別。Claude Code のバージョン 2.1.322。プランのログインで起動したセッション（自分の init の `apiKeySource` は、この点検では表示していないので確かめていない）
- 結果: 直すべき指摘 1 件、任意の指摘 8 件

## 直すべき指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/ai-agent-custom-tools-agent-sdk.md:323` | 「組み込みのツールは見えるだけで、許可していないので実行はされません」は、同じ節の321行目と矛盾する。組み込みのツール ToolSearch は `allowedTools` に無いのに実行され、`is_error=false` で結果が返っている。許可の無い組み込みのツールが断られた実行は、どのログにも無い（観測していない推測）。 | `run/08.log:11`（ToolSearch の tool_use）、`run/08.log:12`（`is_error=false` の tool_reference）。`allowedTools` は `code/shop-agent.ts:59` で自作の2つだけ。出典3の dontAsk の記述（取得して確認）は「事前承認されたツールと、default モードで承認が要らない呼び出しは動く。確認が要る呼び出しは断る」で、承認が要らない呼び出しは動くと読める。 | 「承認が要るツール（Bash、Write など）は dontAsk で断られる設定だが、この実行では呼ばれていない。承認が要らない ToolSearch は許可なしで動いた」と、観測した範囲に合わせて書き直す。 |

## 任意の指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | 記事:86、142 | 読者が詰まる。`claude auth login` を打つには Claude Code の CLI が要るが、入れ方が書かれていない。`shop-agent.ts` をどのフォルダに保存するかも書かれていない（`custom-tools` に置く前提）。 | 記事:86、106〜112、142。 | 前提に「Claude Code を入れて `claude auth login` 済み」の1行と、保存先の1行を足す。 |
| 2 | 記事:124 | 「zod の 4.0.0 以上」は、peer dependency の `^4.0.0`（4.x のみ）と違う。同じ段落で「Zod 3 と Zod 4 の両方に対応」とも書いており、どちらを使えばよいか迷う。0.3.322 が最新という断定は、`run/` にログが無い（`sources.md:16` の説明だけ）。 | 点検時に `npm view @anthropic-ai/claude-agent-sdk@0.3.322 peerDependencies --json` が `"zod": "^4.0.0"`、`npm view ... version` が 0.3.322。 | 「zod 4.x」と書き、「型定義のコメントは Zod 3 も対象と書くが、この SDK の peer は 4.x」と言い切る。`npm view` の出力を `run/` に残す。 |
| 3 | 記事:321〜323 | tool search の説明が、読者に伝わりにくい。ToolSearch は組み込みのツールの1つなので、`tools: []` で消えると呼べなくなり、定義が最初から渡る。この因果が書かれていない。「num_turns が5から6」は1回の実行（`run/08.log`）だけが根拠で、決まった差のように読める。 | `run/08.log:6`（1回だけ）、`run/06.log:14`、`run/07.log:14`（どちらも 5）。出典2に tool search は既定で有効とある（取得して確認）。 | 「この実行では」と回数を限定し、ToolSearch が組み込みのツールであることを1文で書く。 |
| 4 | 記事:58、78、239、267、337、358（frontmatter 12〜13行） | リンク先6本はすべて `status: draft`。うち4本（#17、#18、#19、#21）は計画表で自分より後ろの番号なので、番号順に1日1本で公開すると、公開日にリンク切れになる。スキルの手順5（155行目）は、リンク先を公開済みか先に予約済みの記事に限る。`gate.md` の G07 は NG と正直に書いてある（嘘の OK ではない）。 | `content/plan.md:56〜62`（#15、#17〜#19、#21、#8）。`gate.md:29`。 | 公開順を決める人が、前方リンクの解消方法（後ろの記事を先に予約する、公開後に差し替える）を決める。 |
| 5 | `gate.md:15 付近`（C02）、`gate.md:28 付近`（G06）、`gate.md:41`（C04）、`brief.md:5` | 古い記述が残る。C02 の「target_query は未確定」、G06 の「ほか27本」（今は30ファイル）、C04 の「実装 147」（147行目はコード内。見出しは140行目）、`brief.md` の「検索語そのものは未確定」。ゲートの OK 判定自体は今も正しい。 | `ls content/articles/*.md` が30。記事:140（見出し）。`selection.md` の追記。 | 該当行を現状に直す。 |
| 6 | `code/extra/redact-mcp-tools.py:3`、`code/README.md:28`、`gate.md:26`（G04） | 番号のずれが残る。スクリプトの説明は strictMcpConfig を外した確認を `run/10.log` と書くが、実際は `run/09.log`（10 は tsc）。README と G04 は「`run/11.log` だけ run-all.sh で作っていない」と書くが、`run/12.log` も run-all.sh に無い（`log_run` は 01〜10 まで）。 | `code/extra/run-all.sh:38〜58`。`run/12.log:6`（for ループの手動コマンド）。 | 説明を 09 に直し、「11 と 12 は手動」と書く。 |
| 7 | 記事:325、`run/11.log` | 756個の根拠は、アカウントの情報を伏せて保存した1回のログだけで、フィルターを通す前の出力は残っていない。その後の4回（`run/09.log:5`、`run/12.log:6〜8`）は0個。「実行ごとに変わった」は、5回中1回が756個という観測からの推測で、原因は分かっていない。 | `run/11.log:7`、`code/README.md:28`、`run/09.log:5`、`run/12.log:6〜8`。 | 「5回中1回（試作の実行）で並んだ。原因は確かめていない」と書く。 |
| 8 | 記事:269、54、301〜305 | 見出しの「4往復」と `num_turns=5` は、2回の実行（`run/06`、`07`）だけが根拠。301〜305行目で2回しか試していないことを断っており、問題の大きさは小さい。target_query「ai エージェント ツール 呼び出し」には答えているが、ツール呼び出しとは何か（モデルが依頼を返し、プログラムが実行し、結果を返す）の説明が薄い。 | `run/06.log:14`、`run/07.log:14`。`keywords/google-suggest-ai-agent.csv` に一致行が1つ。 | 冒頭に概念の1文を足すと、検索の疑問に直接答えられる。 |

## 確かめて問題が無かったこと

- 数値と出力: 記事の10個のコードブロックと実行結果を、`python3 -I logs/<slug>/lint/check-code-and-outputs.py content/articles/<slug>.md logs/<slug>`（スクリプトは先に読んだ。ファイルを読むだけ）で再実行した。`ALL OK`。コードは `code/shop-agent.ts` と一致。
- `run_environment` と `verified_at`: Node 22.23.4、npm 10.9.9（`run/06.log:3`）、SDK 0.3.322、Claude Code 2.1.322、zod 4.6.7（`run/06.log:4`）、TypeScript 7.0.2（`run/10.log:6`）が記事10行目と一致。日付は最後のログ `run/12.log:2`（UTC 2026-11-11、日本時間でも同日）と末尾の 360行目と一致。
- 組み込みのツール25個を `run/08.log` の init 行から数え直して25。ToolSearch が最初の呼び出しで、`num_turns=6`。
- 2回目の比較: `run/06.log` と `run/07.log` のツール行が一致、最後の文だけ違う（303行目の記述のとおり）。
- code: `query()` は1か所（記事:195）で `strictMcpConfig: true`（201行目）。`claude -p` は記事にも `code/` にも無い。`ANTHROPIC_API_KEY` は unset の確認（`run/02.log`）にだけ出る。
- 出典: 本文の出典1〜10がすべて引かれ、frontmatter、記事の表（347〜356行）、`sources.md` の10行が同じ URL と順序。`sources.md` の「根拠にした本文の行」を本文の行と突き合わせて一致。
- 出典の中身: 次の主張を取得したページで確認した。例外は生のメッセージでエラー結果になりループは続く（出典1）、`tools: []` は組み込みを全部外す（出典1）、ワイルドカード `mcp__weather__*`（出典1）、`my.server` は `mcp__my_server__`（出典2）、tool search は既定で有効（出典2）、dontAsk の挙動（出典3）、`strictMcpConfig` の説明文（出典4）、`createSdkMcpServer` の「same process」、Zod 3 と 4、`settingSources`、スキーマ変換できないツールは一覧から外れる（出典5）、`unset ANTHROPIC_API_KEY` と Ultra（出典6）。
- 規約や注意書き: 「個人用に限る」「API キーで認証」「Console で発行」の文は本文に無い。料金は利用枠から引かれることと月額の事実だけ。
- 内部リンク: 6本の slug はすべて `content/articles/` に存在。旧 slug 4つは本文に無い。`prev` は #15、`next` は #17 で `content/plan.md:56〜58` と一致。各リンクを説明する文は、リンク先の題名と冒頭に照らして真。他の記事から本記事への説明（自作ツールを Agent SDK に渡す、ツール呼び出しの流れ）は、記事が実際に扱っている内容と合う（tool()、createSdkMcpServer、tool_use と tool_result の往復）。
- 秘密情報: `logs/<slug>/` と記事を python3 で `/Users/`、`@`、`session_`、`sk-ant-`、メール形、コネクタ系のサービス名で走査。実在のパスは0件。`@` は npm のスコープ名、`/Users/` と `session_` は `gate.md:31` の説明文にある文字列だけ。コネクタやツールの名前は `run/09`、`11`、`12.log` を含めどこにも残っていない（`mcp__` は `mcp__shop__` のみ）。
- ゲートの行を今の状態で確かめた（15行）: G04、G05（行番号を全部突き合わせ）、G06（本数のずれは指摘5）、G07（NG で正しい）、G08、G09、C02、C04、C06（見出しの行番号14個が一致）、C08、C15（「ではなく」は305行目の1回）、C25（本文の文は最長60字、60字超は0）、C27、C31、C37。偽の OK は無かった。
- lint 2本を stdout で再実行。判定行は保存分と同じ（ai-smell は「致命なし」、writing-lint は `FATAL 0 / DENSITY超過 0 / SHOULD 0`）。
- 文体: 太字、ダッシュ類、全角コロン、「でしょう」「かもしれ」は0件。

## 確かめていないこと

- `claude.com/pricing` の Pro 月20ドル、Node.js 公式の 22.18.0 の記述、support.claude.com のページ（出典7、8、9）。ページを開いていない。
- 出典3（agent-loop）のうち、assistant と user のメッセージの順序の記述。実行ログで観測した順序とは合っている。
- 記事のコードの再実行（brief の禁止事項のため）。モデル呼び出しは行っていない。
- Google の検索結果での順位や、読者が実際に Claude Code を入れていない環境で試したときの動き。
- `run/11.log` のフィルター前の出力（残っていない）。

## 対応（2026-11-13）

直すべき指摘

| # | 結果 | 何を変えたか |
|---|---|---|
| 1 | 直した | 記事:321〜323。ToolSearch は組み込みのツールで、`allowedTools` に無くても断られず動いたと書き直した。確認が要るツールが断られる場面は観測していないと明記した。`num_turns` の5と6は、5が `run/06.log`、`run/07.log`、6が `run/08.log` の1回と書いた |

任意の指摘

| # | 結果 | 何を変えたか |
|---|---|---|
| 1 | 一部だけ直した | 記事:142 に保存先が `custom-tools` フォルダだと足した。Claude Code の入れ方は新しい節になるので見送り |
| 2 | 直した | 記事:124 を「zod 4.x（`^4.0.0`）」に直した。`npm view` の出力を `run/13.log` に保存した（`code/README.md`、`sources.md:25` に追記） |
| 3 | 直した | 記事:321 に ToolSearch が組み込みのツールであることと、1回の実行だったことを書いた |
| 4 | 見送り | G07。公開の順番で解消する。今は直さない |
| 5 | 直した | `gate.md` の C02、G06、C04、`brief.md:7` を現状に直した |
| 6 | 直した | `code/extra/redact-mcp-tools.py:3` を `run/09.log` に、`code/README.md`、`gate.md` G04 を「11、12、13 は手動」に直した |
| 7 | 直した | 記事:325。5回中1回（試作の実行）だけ並び、原因は確かめていないと書いた。残りの4回は `run/09.log`、`run/12.log` |
| 8 | 見送り | 概念の1文は新しい内容になる。「4往復」は2回の実行だけが根拠と、記事:301〜305 が既に断っている |

点検の結果（2026-11-14）: 直すべき指摘 1

- gate.md の行番号が今の原稿（356行）と合わない。`gate.md:30` G08 は「360行目」だが末尾は `content/articles/ai-agent-custom-tools-agent-sdk.md:356`。`gate.md:44` C07 の「269行目」「317行目」の見出しは今 :267、:315。`gate.md:47` C10 の「261行目」は :259。`lint/prose-check.txt`（units=210）は回し直すと 201。全12本で `lint/prose-check.txt` が今の原稿に回し直した結果と食い違う（原稿を直したあとに証跡を取り直していない。2026-11-14 の本文リンクを外した直しが原因と見られる）

対応（2026-11-14）:

- gate.md の行番号と数と引用: 全行を今の原稿の行に合わせて書き直した。主な行は gate.md:24（G02）、gate.md:27（G05）、gate.md:30（G08）、gate.md:44（C07）、gate.md:47（C10）、gate.md:53（C16）。
- `lint/prose-check.txt`: 今の原稿で回し直し、`lint/ai-smell.txt`、`lint/writing-lint.txt`、`lint/check-code-and-outputs.txt` も取り直した（`lint/` 内の各ファイル）。

点検の結果（2026-11-14 2回目）: 直すべき指摘 1

- `logs/ai-agent-custom-tools-agent-sdk/gate.md:27` G05 は「本文 339〜352行目に出典の表（8件…）」と書くが、今の表は `content/articles/ai-agent-custom-tools-agent-sdk.md:339`〜`:354` の10件（`:353` 出典9 Node.js、`:354` 出典10）。本文も出典9と10を引いている（`:82`、`:122`）。frontmatter の `sources` も10件。件数と範囲を今の原稿に合わせる。

任意: :323 の 756 個の実行のログ（run/11.log）を本文が名指ししていない

点検した道具: Claude のサブエージェント（Opus 5.5、この記事の執筆と直しには関わっていない）。環境変数 `ANTHROPIC_API_KEY` は設定なし（`env` で0件）。やったこと: lint 2本を作業用の一時フォルダへ回し直し（ai-smell exit 0・FATAL 0、writing-lint `FATAL 0 / DENSITY超過 0 / SHOULD 0`、保存済みの `lint/` と一致）。`lint/check-code-and-outputs.py` と `lint/prose-check.py` を今の原稿で回し直し、保存済みと一致（ALL OK）。gate.md の G・C 行にある「N行目「引用」」「「引用」（N行目）」と、見出し・問い・段落を指す行番号を、全行スクリプトで今の原稿と照らした。G05 の出典の表の範囲と件数、引用している行の一覧を照らした。過去の点検の直すべき指摘（G07 を除く）は、今の本文の該当行を開いて閉じているか確かめた。地の文の3桁以上の数を run/ と code/ のログと照らし、見つからない数は計算で確かめた。ほかの記事を指す文は、指す先の記事が同じ記事の本文でリンクされているかを確かめた。G07 は対象外。本文の通読は、スクリプトで拾った箇所と過去の指摘の箇所に限った。

対応（2026-11-14 2回目）: gate.md:27 G05 の出典の表を 339〜354行目・10件に直した。gate.md:57 と :60 の引用を原稿の文字どおり（失敗したことをモデルに伝える、例外を投げても）に直した。 全12本の gate.md の行番号・引用を照合するスクリプトを回し、食い違い0件（旧・当時の記録の行と、sdk.d.ts・dist・plan.md・run・lint のログの行は照合の対象外）。
