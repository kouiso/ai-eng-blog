REVIEW | PR #71 | 374c921 | FAIL

## musts（直すべき指摘、5件）

1. `content/articles/mcp-server-streamable-http.md:526`（4文目）、`logs/mcp-server-streamable-http/sources.md:58`、`logs/mcp-server-streamable-http/gate.md:40`（G04）
   - 何が問題か: 本文の「この1行だけは、2026-11-14 に Claude Code 2.1.325 で確かめました。」のうち、バージョンを裏付けるログがありません。`sources.md:58` は、この文の根拠を `run/51`〜`54.log` としています。しかし4本に入っているのは `node: v22.23.4` と `npm: 10.9.9` だけで、`claude --version` の出力はありません。2.1.325 という値は、gate.md:40 の地の文にしか出てきません。2.1.322 には `run/12.log` の `claude --version` という裏付けがあり、扱いがそろっていません。
   - 根拠: スキル手順6の3（ログにランタイムのバージョンを残す）、手順4（断定には出典を付ける）、G05、2回目の指摘3の基準（出典か実行ログ）。点検の環境で 2026-11-14T13:10:24Z に `claude --version` を実行すると、`2.1.325 (Claude Code)` が出ました。これは傍証にはなりますが、書いた側の実行の記録の代わりにはなりません。
   - 直し方の案: 次のどちらかです。(a) `claude --version` から同じ手順を取り直し、1回に1ファイルで `run/` に残す。(b) 本文からバージョンを外し、日付だけを残す。

2. `logs/mcp-server-streamable-http/gate.md:108`、`:119`（C37〜C39）、`:120`（G02）、それに伴う G03
   - 何が問題か: 2026-11-14 に判定し直す前に読み直したガイドは、`guides/01`、`02`、`03`、`04`、`05`、`09` の全文と、`08` の前半（A-1〜B-1）だけです（gate.md:108）。SKILL.md:64〜65 の表は、判定の前に読むガイドを次のように決めています。
     - C37〜C39: `guides/03` と、`guides/06` の「使い方の流れ」4。`guides/06` は読み直していません。gate.md:119 も、根拠を「guides/03 不在、guides/05」と書いていて、表の組み合わせと違います。
     - G02: DENSITY の上限の正本である `guides/08`。B-2 以降と、密度基準総表（`guides/08` の198行目〜）を読み直していません。
   - SKILL.md:54 は、ガイドを読まずに判定した項目を、根拠が何であっても NG と数えます。そのうえで、記憶と別の場所にある写しは、読んだことの代わりにならないと定めています。gate.md:14 には 2026-11-10 に全文を読んだ記録がありますが、これは本文を変える前のものです。今の版の C37〜C39 と G02 の判定を支えるものにはなりません。526行目の書き換えは、C37 と C38 の根拠（動作確認した結果）に直接関わります。
   - 直し方の案: `guides/06` と `guides/08` を全文読み直してから、C37〜C39 と G02 を判定し直します。根拠には、照らし合わせた節を書きます。

3. `content/articles/mcp-server-streamable-http.md:11`（`verified_at`）、`:10`（`run_environment`）、`:647`、`logs/mcp-server-streamable-http/gate.md:41`（G05）、`:44`（G08）
   - 何が問題か: SKILL.md:375 によれば、`verified_at` はコードを最後に実行した日で、「`run/` の最後のログの日付と、末尾の『AI 支援で執筆』の日付にそろえる」ものです。SKILL.md:374 によれば、`run_environment` は `run/` のログにあるランタイムです。今の `run/` の最後のログは `run/54.log` で、日付は 2026-11-14 です。gate.md:40 によれば、2026-11-14 にも `code/` を `npm install` し、`tsc` でビルドし、`node dist/server.js` で動かしています。それなのに `verified_at` と647行目は 2026-11-10 のままです。`run_environment` も、`run/51`〜`54` の環境（node v22.23.4、Claude Code 2.1.325）を含んでいません。G05 はこの2つが `run/` のログと一致することを求めますが、一致していません。さらに gate.md:41 と :44 は、「最後の実行は `run/50.log`」と、事実と違うことを書いています。
   - 直し方の案: 次のどちらかです。(a) 記事のコードとコマンドを1つの環境でまとめて取り直し、frontmatter と647行目をその日と環境に合わせる。(b) `verified_at`、`run_environment`、647行目を、`run/` の最後のログに合わせて書き直す。どちらでも、G05 と G08 の行を書き直します。

4. 本文と食い違う記録（374c921 の時点）
   - `gate.md:43`（G07）と `sources.md:31`（出典18）: 86行目を、直す前の文面「Agent SDK では、自作のツールを同じプロセスの MCP サーバーにして、エージェントに渡せます」のまま引用しています。今の本文は「Claude Agent SDK では、自作のツールを同じプロセスの MCP サーバーにして渡せます（出典18）。」です。
   - `gate.md:76`（C24）: 287行目を「サーバーとトランスポートを新しく作ります」と引用しています。本文は「POST が届くたびに、`McpServer` とトランスポートを新しく作ります。」です。
   - `sources.md:21`（出典9）: 「405 だけを…黙って受け入れます」と「それ以外の失敗は `Failed to open SSE stream`」を引用しています。594行目の本文は「405 を「SSE が無いサーバー」の印として黙って受け入れます」と「404 のような失敗は、`Failed to open SSE stream` として報告されます」です。
   - `gate.md:68`（C16）: 「41〜60字103文」と書いていますが、今の `lint/prose-check.txt` は `long(41-60) 106` です。
   - `gate.md:3`: 「直すべき指摘が3件出た」で止まっています。gate.md:98 と :102 の「直した」と合いません。
   - 根拠: スキル手順8「根拠は後から人が確かめられる形」。点検の側で、gate.md、judgments.md、sources.md の「…」の引用をすべて機械で本文と突き合わせました。ガイドの節名と、過去の版を引用していると明示したものを除くと、残ったのが上の5か所です。
   - 直し方の案: 今の本文と `prose-check.txt` に合わせて書き直します。

5. `logs/mcp-server-streamable-http/gate.md:46`（G10）
   - 何が問題か: G10 が OK になっています。点検の環境で読める CSV は、メインの作業コピーにある `keywords/google-suggest-mcp-server.csv` です（`.gitignore` の `keywords/*.csv` で追跡の外。10行、`fetched_at` はどの行も 2026-11-14）。このファイルに、`target_query`（`mcp streamable http typescript`）と1文字も違わない行は0件でした。`keywords/` のほかの CSV にも `streamable` を含む行はありません。gate.md:46 自身も、「この環境に無い CSV で判定」「ここでは判定し直していない」と書き、結論（:102）では「最終の判定は Mac のレーン」としています。今の時点で、G10 の OK を裏付けるものがありません。
   - G07 は任意の指摘4に回し、G10 は直すべき指摘にしています。理由は次のとおりです。G07 の OK は、`content/plan.md` の公開の順番という、確かめられる条件に基づいています。メインエージェントは手順10でこの順番を守って予約します。G10 は、読める唯一の CSV が OK と逆の結果を示し、gate.md 自身も判定を保留しています。
   - 根拠: SKILL.md の G10（CSV に無い値なら不合格、値を作って合格にしない）。CSV の行はここに写していません。
   - 直し方の案: どの CSV を正とするかは、呼び出し側（メインエージェント）が決めます。その CSV で判定し直すまでは、G10 を「保留」か NG と書きます。

## shoulds（任意の指摘）

1. `content/articles/mcp-server-streamable-http.md:86`: 60字に収めるために「エージェントに」を削った結果、「渡せます」の渡す先が文から消えました。1回目の点検の任意の指摘1（何に渡すのかがあいまい）が、また出ています。C18（主語や目的語を削っていない）に照らして直すべき指摘にするほどではありませんが、文を2つに分けて渡す先を書くほうがよいです（例「`query()` に渡せます」）。
2. `run/51`〜`54.log` には `claude mcp` の4つのコマンドしか入っていません。gate.md:40 に書いてある `npm install`、`tsc`、サーバーの起動と停止のログはありません。スキル手順6の3（1回の実行で1ファイル）に合わせ、こうした手順も `run/` に残すほうがよいです。`run/53.log` の ECONNREFUSED から、止めたことは読み取れます。
3. `gate.md:45`（G09）: 確かめた日は 2026-11-10、範囲は79ファイルのままです。`run/51`〜`54.log`、`review.md`、直した `lint/` のファイルは範囲に入っていません。点検の側で `sk-ant`、`api_key`、`token`、`password`、`Bearer`、`/root`、`/home/user`、`scratchpad` を検索したところ、該当は本文70行目の `needs_api_key` と、605行目の「Bearer トークン」（出典4の節名）だけでした。秘密情報は0件です。記録の日付と範囲を新しくするほうがよいです。
4. G07: リンク先の `mcp-server-typescript-stdio`（21番）と `ai-agent-custom-tools-agent-sdk`（16番）は、どちらも今は `status: draft`、`publish_at: null` です。`content/plan.md:57`、`:62`、`:63` では、どちらもこの記事（22番）より前の順番なので、順に予約すれば条件を満たします。予約するときに、リンク先が先に予約済みであることを、メインエージェントが確かめる必要があります。
5. 526行目の「この1行だけは」は、出力の1行を指すのか、本文の1文を指すのか分かりにくいです。「`× Failed to connect` の行だけは」と書くほうがよいです。
6. `gate.md:40`（G04）の条件の欄が「API を呼ぶ記事で `ANTHROPIC_API_KEY` が無いときは不合格」のままで、今のスキルの G04（Messages API を呼ぶ記事は書かない、Claude プランで動かしたログがあれば合格）と違います。G05 の条件の欄も、スキルの文面より短くなっています。今のスキルの文面に写し直すほうがよいです。
7. 書いた AI の init の `apiKeySource` は、どの回の記録にもありません（下の「G11 の確認の記録」）。メインエージェントが書き手のサブエージェントを起こしたときに init を写さないと、この記録は取れません。

## 2回目の直すべき指摘3件の今の状態

| 2回目の # | 内容 | 今の状態 |
|---|---|---|
| 1 | gate.md と judgments.md の行番号の参照が古い | 直っている。C06 の H2 14個と H3 5個、C10 の節の番号16個は、本文の見出しの行と一致する。G04 の「70行目」、C33 の「647行の版」、judgments.md:13 の「647行/250文」も合っている。ほかの行番号も40か所以上を本文と突き合わせ、ずれは0件。ただし、引用している文の中身が古い箇所がある（直すべき指摘4） |
| 2 | 変えた文について B の行と G03 を判定し直していない | 一部だけ直っている。gate.md:108〜120 に、86、412、526、624行目を判定し直した記録はある。しかし、判定の前に読むガイドが足りない（直すべき指摘2） |
| 3 | 526行目の断定に出典も実行ログも無い | 一部だけ直っている。「`× Failed to connect` と出ます」は `run/53.log` が裏付けている（`run/52.log` の `√ Connected` との対比もある）。しかし「Claude Code 2.1.325」は裏付けが無い（直すべき指摘1）。また、`run/51`〜`54` を足したことで、`verified_at` と `run_environment` がログと合わなくなった（直すべき指摘3） |

## 行った確認と結果（点検の環境、2026-11-14）

- 読んだもの: CLAUDE.md（作業コピーとメインの作業コピーのものは同じ内容）、`.claude/skills/write-article/SKILL.md`（全文）、`docs/tech-writing-pack/checklist.md`（全文）。2026-11-14 に、`guides/01`〜`06`、`08`、`09` の全文を Read ツールで読んだ。
- `python3 docs/tech-writing-pack/scripts/ai-smell-lint.py content/articles/mcp-server-streamable-http.md`: `use 0件 / 📎mention 0件`、`判定: ✅ 致命なし`、`exit=0`。保存された `lint/ai-smell.txt` と1文字も違わない。frontmatter の行の mention も0件。
- `python3 docs/tech-writing-pack/scripts/writing-lint.py … --type article --register standard`: `647行/250文`、`### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、WATCH と INFO は無し、`exit=0`。`lint/writing-lint.txt` と1文字も違わない。
- 書いた側の補助スクリプト: `prose-check.py` を取り直した結果は保存と同じ。`check-code-and-outputs.py` は `ALL OK`。この PR での変更（`run/52`、`53` の2項目を足し、終了コードの出力を54本に広げた）は差分で確かめた。
- 書いた側のスクリプトとは別に、本文の出力を自分で `run/` と突き合わせた。354行目と `run/06`、384行目と `run/07`、408〜409行目と `run/08`、423行目と `run/09`、443行目と `run/10`、457行目と `run/11`、587行目と590行目を `run/27`、548〜562行目の15行を `run/20`。どれも一致した。526行目の記述も、`run/52`（`√ Connected`）と `run/53`（`× Failed to connect`）に一致した。
- `npm ci` のあと `npm test`（Node v24.22.3）: Test Files 10 passed、Tests 109 passed。
- `node scripts/secret-scan.mjs origin/develop`: `13 file(s) scanned, 0 finding(s)`、exit 0。
- 行番号の突き合わせ（40か所以上、ずれ0件）。
  - gate.md: C06（H2 14個、H3 5個）、C08（155、180、215、307、148〜151、133〜140、113、303、329、343、465）、C09（287、461、575、82、213）、C10（16個の節と、その文の 98、109、127、153、287、358、412、461、465、526、575、596、600、612、618、624）、C11（429）、C13（102、131、343、360、567、602）、C16（113、368）、C18（490）、C20（579、127、581）、C21（526、366、104）、C22（96、94）、C23（146、567）、C24（127）、C26（467、429）、C27（360、366、565、602、608）、C36（528、530、579、581、567〜577、594〜596）、C37（575、461、360〜366、596、127）、C39（620）、G05（622〜645、102、125、299、394、610〜614、9〜11）、G06（82）、G07（82、86）、G08（647）
  - judgments.md: 390、530、616、624、105、394（「やり取り」2件）、596、604〜606、620
- 引用の突き合わせ: gate.md、judgments.md、sources.md の「…」をすべて、機械で本文と突き合わせた。食い違いは直すべき指摘4に挙げた。
- 出典: 本文の（出典1）〜（出典18）は、どれも sources.md の「出典ごとの確認内容」の行と対応している。実行ログを根拠にした文は「出典ではなく実行ログを根拠にした文」の表にある（526行目のバージョンだけが、直すべき指摘1のとおり裏付けを欠く）。次の3件を開いた（どれも HTTP 200）。
  - 出典3（`raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/v1.x/README.md`）: 「the maintenance line」「implements the MCP spec up to 2025-11-25」「v2, the current stable release」「at least six months after the v2 release (2026-07-27)」。102、123、125行目を支えている。
  - 出典18（`unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts`）: 640行目に「This allows SDK users to define custom tools that run in the same process.」、651行目に `createSdkMcpServer` の宣言。86行目を支えている。
  - 出典1（2025-11-25 の Transports）: 標準のトランスポートが2つ、独立したプロセスが複数のクライアントの接続を扱える、POST と GET を受ける1つの MCP エンドポイント、Origin が不正なら 403（MUST）、127.0.0.1 で待ち受ける（SHOULD）、認証（SHOULD）、GET には SSE か 405、セッション ID は MAY。92〜98、293、295、299、429、605行目を支えている。
- C 行は、ガイドを読んだうえで本文の全行に当てた。上の任意の指摘のほかに、不合格の行は無い。
  - どの H2 の直下にもリード文がある（guides/09 §1-1 の3）。
  - 体言止めは604〜606行目の項目名3つだけで、連続していない（guides/08 B-3）。
  - 強調語の「いちばん」は287行目の1回だけ。否定対比は0回。ですます調で統一している。
  - 利用規約についての注意書きは足されていない。84、612、614行目は、実行した範囲と料金の説明。
- G06 は、2回目の点検で30ファイルを確かめたとおり、重なりは無い。G01、G02（lint の結果の中身）、G04（コードとログの一致）、G08（末尾の表記の形）、G09（秘密情報の中身）は OK。G05 は、直すべき指摘1と3を除いて OK。

## G11 の確認の記録（ログインの方法）

- `claude --version`: `2.1.325 (Claude Code)`
- 実行したコマンド: `env -u ANTHROPIC_API_KEY claude -p "say ok" --strict-mcp-config --output-format stream-json --verbose`
  - 開始は 2026-11-14T13:10:24Z（UTC）。exit 0、result は `success`、返った文は `ok`。
- init の行: `apiKeySource: "none"`（`claude_code_version: 2.1.325`）
- この `claude -p` は、点検するサブエージェントとは別に起こしたプロセスです。init にあるモデルの名前も、このプロセスのものです。この記録からわかるのは、この環境のログインの状態、つまり API キーを使わずにプランのログインで動くことまでです。点検したサブエージェント自身の init と、書いたサブエージェントの init は、サブエージェントの中からは見えないので確かめられません。セッションの ID とアカウントの情報は写していません。

この点検は、記事を書いた AI とは別の AI が行いました。Claude Code のサブエージェント（Claude Opus 5.5）で、この記事を書いておらず、1回目と2回目の点検もしていません。

## review.md 追記案

```markdown
## 2026-11-14 記事全体の点検（3回目、PR #71 の 374c921）

- 点検した日: 2026-11-14
- 点検の対象: PR #71（#58）の `374c921`
  - 本文の全行（647行）、frontmatter、出典18件（3件は開いて確かめた）
  - `run/` のうち、本文の出力の写し元（06〜11、20、27、52、53）と、足した51〜54
  - `lint/` の全ファイル、`gate.md`、`judgments.md`、`sources.md`、`selection.md`
  - 2回目の点検の直すべき指摘3件
- 書いた道具: Claude Code のサブエージェント（Claude）。本文の大部分は Claude Opus 5.5、#58 の直しは Claude Sonnet 5.5（どちらもコミットの Co-Authored-By の行）。書いた側の init の `apiKeySource` は記録が無い（サブエージェントの中からは見えない）
- 点検した道具: Claude Code のサブエージェント（Claude、Opus 5.5）。この記事を書いておらず、1回目と2回目の点検もしていない。Claude Code 2.1.325（`claude --version`）
- ログインの方法の確認: 2026-11-14T13:10:24Z（UTC）に、別のプロセスで `env -u ANTHROPIC_API_KEY claude -p "say ok" --strict-mcp-config --output-format stream-json --verbose` を実行した
  - init の行は `apiKeySource: "none"`（`claude_code_version: 2.1.325`）、result は `success`
  - これはこの環境のログインの状態の記録。点検したサブエージェント自身の init と、書いたサブエージェントの init は、見えないので確かめていない
- 点検の前に読んだもの（2026-11-14）: `CLAUDE.md`、`.claude/skills/write-article/SKILL.md`、`docs/tech-writing-pack/checklist.md`、`guides/01`〜`06`、`08`、`09`（ガイドは Read ツールで全文）
- 結果: 直すべき指摘 5 件、任意の指摘 7 件。G11 は NG のまま

### 2回目の直すべき指摘の今の状態

| 2回目の # | 今の状態 |
|---|---|
| 1 行番号 | 直っている（40か所以上を本文と突き合わせて、ずれは0件）。引用している文の中身が古い箇所は、下の4 |
| 2 B と G03 の判定し直し | 一部だけ直っている。読み直したガイドに、`guides/06` と `guides/08` の後半が入っていない（下の2） |
| 3 526行目 | 一部だけ直っている。`× Failed to connect` は `run/53.log` で裏付けられた。「Claude Code 2.1.325」は裏付けが無い（下の1）。`run/51`〜`54` を足したことで、`verified_at` と `run_environment` がログと合わなくなった（下の3） |

### 直すべき指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/mcp-server-streamable-http.md:526`、`sources.md:58`、`gate.md:40` | 「Claude Code 2.1.325」を裏付けるログが無い | `run/51`〜`54.log` の見出しは node と npm だけで、`claude --version` が無い。2.1.322 には `run/12.log` がある。スキル手順6の3、G05 | `claude --version` から取り直して `run/` に残すか、本文からバージョンを外す |
| 2 | `gate.md:108`、`:119`（C37〜C39）、`:120`（G02） | 判定し直す前に、C37〜C39 で読む `guides/06` と、G02 で読む `guides/08`（B-2 以降と密度基準総表）を読んでいない。この版の C37〜C39、G02、G03 の OK が成り立たない | SKILL.md:54、:64、:65。2026-11-10 に読んだ記録（gate.md:14）は、本文を変える前のもので代わりにならない | 2つのガイドを全文読み直してから判定し、読んだ節を根拠に書く |
| 3 | 原稿の10、11、647行目、`gate.md:41`、`:44` | `verified_at` と647行目が 2026-11-10 のままで、`run/` の最後のログ（`run/54.log`、2026-11-14）と合わない。`run_environment` が `run/51`〜`54` の環境を含まない。gate.md は最後の実行を `run/50.log` と書いている | SKILL.md:374、:375、G05。`run/54.log` の `date:` の行。gate.md:40 によれば 2026-11-14 にもコードをビルドして動かした | 1つの環境でまとめて取り直すか、frontmatter と647行目を `run/` の最後のログに合わせる。G05、G08 の行も書き直す |
| 4 | `gate.md:43`、`:76`、`:68`、`:3`、`sources.md:31`、`:21` | 本文と食い違う引用と数がある。86行目の古い文面、287行目と594行目の文面の誤り、C16 の103文（今は106文）、冒頭の「3件残る」 | 本文86、287、594行目、`lint/prose-check.txt` の `long(41-60) 106`、gate.md:98、:102 | 今の本文とログに合わせて書き直す |
| 5 | `gate.md:46`（G10） | 点検の環境の `keywords/google-suggest-mcp-server.csv`（追跡の外、`fetched_at` は 2026-11-14）に、`target_query` と一致する行が0件。gate.md 自身も、判定し直していないと書いている | SKILL.md の G10。gate.md:46、:102 | どの CSV を正とするかをメインエージェントが決める。判定し直すまでは G10 を保留か NG にする |

### 任意の指摘

| # | 場所（ファイル:行） | 何が問題か | 直し方の案 |
|---|---|---|---|
| 1 | 原稿の86行目 | 「渡せます」の渡す先が文から消えた（1回目の任意の指摘1と同じ問題） | 渡す先を書く（例「`query()` に渡せます」） |
| 2 | `run/51`〜`54.log` | `npm install`、`tsc`、サーバーの起動と停止のログが無い | 1回の実行で1ファイル残す |
| 3 | `gate.md:45`（G09） | 確かめた範囲が 2026-11-10 の79ファイルのまま。点検の側で新しいファイルも検索し、秘密情報は0件だった | 日付と範囲を新しくする |
| 4 | G07 | リンク先の2本は今 `draft` | 予約するときに、リンク先が先に予約済みであることを確かめる |
| 5 | 原稿の526行目 | 「この1行だけは」の指す先があいまい | 「`× Failed to connect` の行だけは」と書く |
| 6 | `gate.md:40`、`:41` | G04 と G05 の条件の欄が、今のスキルの文面と違う | スキルの文面に写し直す |
| 7 | G11 | 書いた AI の init の `apiKeySource` は、メインエージェントが起動のときに写さないと取れない | 起動のときに init を写す |

### 行った確認

- `ai-smell-lint.py`（use 0 / mention 0、exit=0）と `writing-lint.py`（FATAL 0 / DENSITY超過 0 / SHOULD 0、exit=0）を取り直した。どちらも `lint/` に保存された結果と同じだった。
- `prose-check.py` は保存と同じ結果。`check-code-and-outputs.py` は ALL OK。
- 本文の出力を、スクリプトとは別に `run/06`〜`11`、`20`、`27`、`52`、`53` と突き合わせ、どれも一致した。
- `npm test` は 109 passed。`node scripts/secret-scan.mjs origin/develop` は 0 finding。
- 出典1、3、18 を開いて、本文の断定を支えていることを確かめた（どれも HTTP 200）。
```
