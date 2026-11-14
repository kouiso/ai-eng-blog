# review: mcp-server-streamable-http

- 点検した日: 2026-11-14
- 点検の対象: #58 の直し（コミット `4f97efe`）。本文83行目に足した関連記事のリンクの1文、`updated`、`gate.md` の G07 と集計と追記、`lint/` の取り直し。直しの前からある本文（83行目以外）は、`check-code-and-outputs.py` の再実行と行番号の突き合わせのほかは読み直していない（下の「確かめていないこと」）
- 書いた道具: Claude Code のサブエージェント（Claude、Sonnet 5.5。コミット `4f97efe` の Co-Authored-By の行）。この直しではコードを動かしておらず、モデルも呼んでいない（記事は `needs_api_key: false`、`check-code-and-outputs.txt` は変えていない）
- 点検した道具: Claude Code のサブエージェント（Claude、Opus 5.5）。書いたエージェントとは別。Claude Code のバージョン 2.1.325（`claude --version` の出力）。プランのログインのセッションで、`ANTHROPIC_API_KEY` は未設定（点検のシェルで設定の有無だけを見た）。自分の init の `apiKeySource` は、サブエージェントからは見えないので確かめていない。点検ではモデルを呼ぶコードを動かしていない
- 結果: 直すべき指摘 3 件、任意の指摘 2 件

## 直すべき指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `logs/mcp-server-streamable-http/gate.md:93-101`（集計と結論） | 集計と結論が表と食い違っていて、ゲートの記録として読めない。集計の A は「OK 9 / NG 1（G10）」だが、表の G10（`gate.md:46`）は OK で、G07（`gate.md:43`）も今は OK。合計は「OK 46 / NG 2」のまま。結論は「G07 と G10 に落ちたので draft のまま止める」と書き、G07 のリンク先を `mcp-server-typescript-stdio` と `mcp-inspector-debug` としている。今の G07 の根拠（本文のリンク先は21番と16番、`next` の本文リンクは外した）と合わない。G11 の行も無かった（この点検で `gate.md:47` に足した）。メインエージェントは公開の前にこの記録を読み直すので、どれが正しい判定か分からない | `gate.md:43`、`gate.md:46`、`gate.md:95-97`、`gate.md:101`。冒頭 `gate.md:3` の追記も「残る NG は G07 と G11」のまま | 集計を表の今の判定で数え直す（A は G01〜G10 が OK、G11 は点検の結果）。結論を今の状態に書き直し、冒頭3行目の追記も合わせる。「ただし冒頭の追記のとおり…」の読み替えの注記は消す |
| 2 | `logs/mcp-server-streamable-http/gate.md` の本文の行番号（G05、G06、G07 以外の C 行の多く）と `gate.md:105`（2026-11-14 の追記） | 行番号のずれの説明が逆になっている。追記は「617行目、621行目など、これより下の参照は2行ずれている」と書くが、617、621、625〜641、643行目の参照は今の原稿（643行）で正しい（`content/articles/mcp-server-streamable-http.md:617` の問い、`:621` の出典の注記、`:643` の末尾）。ずれているのは 84〜615行目あたりを指す参照で、どれも今は2行後ろにある。例: C10 の「93行目」は `:95`、「282行目」は `:284`、「456行目」は `:458`、「570行目」は `:572`、「591行目」は `:593`、「613行目」は `:615`。C27 の「83行目」（4ファイルで121行）は `:85`。C13 の「615行目『講座の次の記事は…』」は、本文に「講座の次の記事」の語が無い（#31 で外した文。`grep -n "講座の次の記事"` で0件）。同じ日の `ai-agent-custom-tools-agent-sdk/review.md` の点検でも、gate.md の行番号が今の原稿と合わないことを直すべき指摘にしている | `git show origin/develop:content/articles/mcp-server-streamable-http.md` は641行で、その版では問いが615行目、末尾が641行目（gate.md はすでに2行ずれていた）。今の版との行の対応は、文を `grep -n` で引いて比べた | gate.md の行番号を今の原稿（643行）に合わせて全行書き直す。C13 から外した文の引用を消す。2026-11-14 の追記の「2行ずれている」の説明を消すか、正しい範囲に直す |
| 3 | `content/articles/mcp-server-streamable-http.md:83` | 足した1文目「Agent SDK のエージェントには、別のプロセスを立てずに MCP のツールを渡せます。」は Agent SDK についての事実の断定だが、この記事の本文に出典が無い。G05 は「断定した事実すべてに一次情報の出典（URL とアクセス日）があり、それが本文に出ている」で、CLAUDE.md も「断定には一次情報の URL と確認した日付を付けます」。この記事の出典の表（`:623-641`）に Agent SDK の資料は無い。G05 の行は、この文について判定し直されていない（`gate.md:105-107` の追記は C 行を据え置きと書き、G05 にも触れていない） | 中身は正しい。`@anthropic-ai/claude-agent-sdk` 0.3.322 の `sdk.d.ts` の `createSdkMcpServer` のコメントは「define custom tools that run in the same process」（2026-11-14 に手元の 0.3.322 のパッケージで確認）。リンク先の `content/articles/ai-agent-custom-tools-agent-sdk.md:74` も同じことを出典5（この `sdk.d.ts`）付きで書いている | どちらか。(a) 出典の表に `sdk.d.ts` 0.3.322（リンク先の記事の出典5と同じ URL）を18番として足し、1文目に（出典18）を付け、`sources.md` と frontmatter の `sources` にも足す。(b) 断定をリンク先の記事についての文に変える（例「別のプロセスを立てずに MCP のツールを Agent SDK に渡す方法は、[自作ツールの記事](…)で扱っています。」）。どちらでも lint 4本を取り直し、G05 の根拠を書き直す |

## 任意の指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/mcp-server-streamable-http.md:83` | 「MCP のツール」が何を指すかが少しあいまい。この記事の HTTP のサーバーのツールを、別のプロセスなしで Agent SDK に渡せるとも読める。リンク先で渡しているのは、`tool()` で作ったツールを `createSdkMcpServer()` でまとめた、同じプロセスの MCP サーバー | `ai-agent-custom-tools-agent-sdk.md:52`、`:67`、`:74` | 「自分で書いた関数を、同じプロセスの MCP サーバーにまとめて渡せます」のように、何を渡すかを書く。直すべき指摘3の (b) で書き換えるなら一緒に直る |
| 2 | `logs/mcp-server-streamable-http/gate.md:6` | 冒頭の判定日が 2026-11-10 のままで、「行番号はすべてこの版」と書いている。2026-11-14 に G07 を判定し直したことが冒頭から分からない | `gate.md:6`、`gate.md:43` | 判定日に 2026-11-14（#58、G07 と G11）を足す |

## 確かめて問題が無かったこと

- 足した文の位置と形: 83行目、前後の段落（81行目の確かめた範囲、85行目の対象読者）と別の段落で、リンクは文の中に置いた。`prev` や `next` の言い回し（「次の記事」「前の記事」）は使っていない。講座の前のリンクは79行目の別の文。
- G07 の決まり: リンク先 `ai-agent-custom-tools-agent-sdk` は `content/plan.md:57` で16番、この記事は `content/plan.md:63` で22番。自分より前の順番の記事だけ。本文の `/posts/` は79行目（21番）と83行目（16番）の2件で、後の順番の記事への本文リンクは0件。原稿は `content/articles/ai-agent-custom-tools-agent-sdk.md` にあり、`slug` が一致する。frontmatter の `prev`（21番）と `next`（23番）は変わっていない。#31 で判定し直したほかの記事の G07 と同じ扱い。
- 主張の中身: リンク先の記事は `createSdkMcpServer()` で作る同じプロセスの MCP サーバーを扱っている（`ai-agent-custom-tools-agent-sdk.md:4`、`:52`、`:67`、`:74`、`:187`）。一次情報の `sdk.d.ts` 0.3.322 のコメントも「run in the same process」。gate.md の G07 の「その記事の74行目」も正しい。
- `updated`: `2026-11-14` に変わった（70行目）。本文を変えた日と同じ。`verified_at` はコードを動かし直していないので `2026-11-10` のままで正しい。末尾の643行目の日付も実行の日のままで正しい。
- lint 4本を点検の作業場所で再実行し、保存されたものと比べた。`ai-smell.txt`、`writing-lint.txt`、`prose-check.txt` は1文字も違わない（`diff` で差分なし）。ai-smell は use 0 / mention 0、writing-lint は `FATAL 0 / DENSITY超過 0 / SHOULD 0`、prose-check は LONG>60 が0、SAME3 が0。`check-code-and-outputs.py` は `ALL OK`（保存したファイルとの違いは、末尾の `exit=0` の行が保存したほうに無いことだけ）。`judgments.md` の 2026-11-14 の再実行の記録も、この結果と合う。
- 足した2文の長さ: prose-check で60字以下。リンクの文字を縮めた経緯は `judgments.md` にある。
- 秘密情報: 差分（記事、gate.md、lint/）に、キー、トークン、パス、個人名は無い。

## 確かめていないこと

- 直しの前からある本文（83行目以外）の出典、数値、文体。この記事には、これまで別の AI による点検の記録（`review.md`）が無かった。G11 を OK にするには、直すべき指摘を直したあと、記事全体を別の AI が点検し直す必要がある。
- 出典の表の17件のページ。開いていない。
- 記事のコードの再実行（コードは変わっていない）。

## 2026-11-14 記事全体の点検（2回目、PR #71 の 6468fdf）

- 点検した日: 2026-11-14
- 点検の対象: PR #71（#58）のブランチの `6468fdf`。本文の全行（647行）、frontmatter、出典18件、`code/`、`run/` の50本、`lint/` の全ファイル、`gate.md` の全行、`sources.md`、`selection.md`、`brief.md`、上の1回目の点検の直すべき指摘3件
- 書いた道具: Claude Code のサブエージェント（Claude）。本文の大部分は Claude Opus 5.5（コミット `29c1a8e` 2026-11-02、`4bff6ac` 2026-11-10 の Co-Authored-By の行）。#58 の直し（86行目の2文、出典18、gate.md の書き直し）は Claude Sonnet 5.5（`4f97efe`、`6468fdf` の Co-Authored-By の行）。2026-11-10 の実行で使った Claude Code は 2.1.322（`run/12.log`）。ログインの方法は、`ANTHROPIC_API_KEY` が未設定だったこと（`selection.md:15`、2026-11-02）だけが記録にあり、init の `apiKeySource` は記録が無い。記事はモデルを呼ばない（`needs_api_key: false`）
- 点検した道具: Claude Code のサブエージェント（Claude、Opus 5.5）。この記事を書いておらず、1回目の点検もしていない、新しく起こしたサブエージェント。Claude Code 2.1.325（`claude --version`）。プランのログインのセッションで、`ANTHROPIC_API_KEY` は未設定（点検のシェルで有無だけを見た）。自分の init の `apiKeySource` はサブエージェントからは見えないので確かめていない。点検ではモデルを呼ぶコードを動かしていない
- 点検の前に Read ツールで読んだもの（2026-11-14）: `.claude/skills/write-article/SKILL.md`（全文）、`CLAUDE.md`、`docs/tech-writing-pack/checklist.md`、`guides/01`、`02`、`03`、`04`、`05`、`06`、`08`、`09`（全文）
- 結果: 直すべき指摘 3 件、任意の指摘 3 件。G11 は NG のまま

### 直すべき指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `logs/mcp-server-streamable-http/gate.md:58`（C06）、`:62`（C10）、`:40`（G04）、`:85`（C33）、`logs/mcp-server-streamable-http/lint/judgments.md:13` | 1回目の直すべき指摘2（行番号のずれ）が直りきっていない。書き直しで漏れた参照が残っていて、根拠を後から確かめられない（スキル手順8「後から人が確かめられる形」）。漏れは次のとおりで、これで全部（gate.md と judgments.md の「N行目」と見出しの番号を全件、本文と突き合わせた）。C06 の H2 の14個: 85→90、106→111、139→144、206→211、296→301、365→370、422→427、491→496、523→528、574→579、593→598、605→610、611→616、619→622。C06 の H3 の5個: 95→100、124→129、391→396、409→414、458→463。C10 の節の見出しの番号（「85:」「95:」…「619:」の16個）も同じ対応でずれている（括弧の中の文の行番号は正しい）。G04 の「`needs_api_key: false`、67行目」は今の70行目。C33 の「643行の版」は今の647行の版。judgments.md:13 の「1行目 `643行/247文`」は、今の `writing-lint.txt` の1行目「647行/250文」と合わない | `grep -n '^##' content/articles/mcp-server-streamable-http.md` の出力（90、100、111、129、144、211、301、370、396、414、427、463、496、528、579、598、610、616、622行目）。`content/articles/mcp-server-streamable-http.md:70`。`lint/writing-lint.txt:1`。ほかの行の参照（G01、G02、G05、G06、G07、G08、C03〜C05、C07〜C09、C10 の括弧内、C11、C13、C14、C16〜C24、C26〜C28、C36、C37、C39 の参照すべて）は本文の同じ文を指していることを確かめた | 上の漏れを直す。直したあと、C06 の番号は `grep -n '^##'` の出力と並べて確かめる |
| 2 | `logs/mcp-server-streamable-http/gate.md:107`（2026-11-14 の追記の3つ目）と B の全行、G03 | #58 で足した本文86行目の2文と624行目の1文について、C 行が判定されていない。追記は「ガイドを読み直していないので、C 行の判定は据え置きで、足した文についての再判定はしていない」と書く。スキルの「ゲートの項目はガイドを読んでから判定する」は、ガイドを読まずに判定した項目を NG と数える。今の B の OK と G03 の OK は、647行の原稿に対しては裏付けが無い。点検した側でガイドを読んで足した3文を見た結果は「確かめて問題が無かったこと」に書いた（C の判定に当たる不合格は見つからなかった）が、gate.md の記録は書いた側が直す | `gate.md:107`、`gate.md:6`（判定日が 2026-11-10 のまま）、SKILL.md の「ゲートの項目はガイドを読んでから判定する」 | ガイドを読み直して、86行目と624行目を含む今の原稿で B の全行を判定し直し、冒頭の判定日と読んだ日を 2026-11-14 にする。点検した側の判断: この指摘を直すべきものに数えるかは、スキルの文言から決めた。メインエージェントの判断で任意に下げるなら、その理由を gate.md に書く |
| 3 | `content/articles/mcp-server-streamable-http.md:526`（3文目） | 「サーバーを止めると、ツールは使えなくなります。」は断定だが、出典も実行ログも無い。G05 は「断定した事実すべてに一次情報の出典」。`sources.md` の「出典ではなく実行ログを根拠にした文」の表にもこの文は無い。`run/` の50本に、サーバーを止めた状態で `claude mcp list` や `claude mcp get` を打ったログは無い（`run/13`〜`16.log` はどれもサーバーが動いている間）。同じ段落の2文目「stdio と違い、Claude Code はサーバーを起動しません」は、`run/05.log` で自分で `npm start` し、`run/13.log` が URL を登録しただけなので、実行の記録で支えられている | `run/` の各ログの `command:` の行（`run/12`〜`16.log` は `claude --version`、`mcp add`、`mcp list`、`mcp get`、`mcp remove`）。出典12（`code.claude.com/docs/en/mcp`）には、つながらないときの状態表示として `✘ Failed to connect` がある（2026-11-14 に確認）が、本文はこの出典を引いていない | どちらか。(a) サーバーを止めて `claude mcp list` を打ち、`run/` にログを残して `sources.md` の表に足す（出典12の `✘ Failed to connect` を引いてもよい）。(b) 文を削るか、実行した範囲の言い方にする。どちらでも lint を取り直す |

### 任意の指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/mcp-server-streamable-http.md:86` | 「Agent SDK」が初出で説明が無い。この記事の「SDK」は、ほかの全部の箇所で MCP の TypeScript SDK を指すので、別の SDK だと分かりにくい（guides/05 §4「用語の統一」、§5「知らない用語は初出時に定義する」） | 出典18の題名は `@anthropic-ai/claude-agent-sdk`。本文の「SDK」は76、96、113、123、287、291 行目ほか | 「Claude Agent SDK」と書く |
| 2 | `content/articles/mcp-server-streamable-http.md:412` | 「HTTP のクライアントを自分で書くと、この1行を忘れがちです。」は一般論で、根拠になる観察が記事に無い（guides/09 §3 の4「具体性の検証」） | 本文で 406 が出たのは、点検のために `Accept` を外した curl（`run/08.log`）だけ | 「406 が返ったら、まず `Accept` を見てください。」だけを残すか、何で確かめたかを書く |
| 3 | `content/articles/mcp-server-streamable-http.md:86` の位置 | リードの中で、確かめた範囲（84行目）と対象読者（88行目）の間に、別の講座の記事の話が入っている。前の記事へのリンク（82行目）と並べると流れが切れにくい（guides/02 タイプ1 のリード、guides/03 不在3） | 76〜88行目 | 88行目の後か、まとめの近くに移す。必須ではない |

### 1回目の直すべき指摘の今の状態

| 1回目の # | 内容 | 今の状態 |
|---|---|---|
| 1 | gate.md の集計と結論が表と食い違う | 直りきっていなかった。集計の A が「OK 9 / NG 0 / 未判定 1（全10項目）」で、表の G01〜G10 は10行とも OK、G11 の行は NG なので、数も種類も合わない（A は11行）。合計も「全49項目」で、表は A 11行と B 39行の50行。この点検で G11 を判定したので、集計、結論、冒頭3行目の追記を表に合わせて書き直した（この点検のコミット） |
| 2 | 行番号のずれ | 直りきっていない。上の直すべき指摘1 |
| 3 | 86行目の Agent SDK の断定に出典が無い | 直っている。出典18（`https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts`）を 2026-11-14 に取り直し（HTTP 200）、640行目に `createSdkMcpServer` の「This allows SDK users to define custom tools that run in the same process.」があり、651行目の `createSdkMcpServer` の宣言に続くことを確かめた。本文86行目、出典の表645行目、624行目の確認日、frontmatter の `sources`（66〜68行目）、`sources.md` の18番が一致する。足した2文は、1回目の任意の指摘1（何を渡すかがあいまい）も直している |

### スキルの4つの確かめ方ごとの結果

- ゲートで OK とした行が本当に OK か: G01、G02（lint を点検の作業場所で取り直し、`ai-smell.txt`、`writing-lint.txt` と1文字も違わない。use 0 / mention 0、`FATAL 0 / DENSITY超過 0 / SHOULD 0`、どちらも `exit=0`）、G04、G06、G07、G08、G09 は中身として OK。G05 は直すべき指摘3の1文を除いて OK。G03 と B の行は、中身は点検した側の判定でも不合格が無かったが、記録が直すべき指摘1と2のとおり。G10 は下の「確かめられなかったこと」。
- 記事の数値と出力が `run/` のログと一致するか: 一致する。`lint/check-code-and-outputs.py` を取り直して `ALL OK`（保存したものとの違いは末尾の `exit=` の行だけ）。自分でも次を突き合わせた。79、354行目の `ok:` の行と `run/06.log`、203〜208行目と `run/03.log`（`added 108 packages … in 4s`）、476〜487行目と `run/47.log`、`run/36.log` の `ok=1` 30回と `abort=1` 3回、`run/42.log` の `notfound=2` 30回、127行目の7件と `run/37.log` の TS7006 7件、`express@5.3.0` と `run/32.log`、4ファイル121行と69行（`code/` の `wc -l`）、`tsconfig.json` が前の記事の `code/` と同じ（`diff` で差分なし）、`ok:` の行が前の記事の本文と同じ。ログの日付は 2026-11-10 07:16:09〜07:17:23 UTC で、`verified_at`、647行目、`run_environment`（Node.js 22.22.0、SDK 1.32.2、Claude Code 2.1.322）と合う。
- 出典がその断定を支えているか: 18件すべてを 2026-11-14 に取り直して読んだ（どれも HTTP 200。github.com の出典3〜9は同じブランチの raw.githubusercontent.com、MDN は mdn/content の原稿、code.claude.com と modelcontextprotocol.io は末尾 `.md` の版、出典10は `npm view`）。本文の（出典n）の付いた文はすべて、その出典の記述で支えられていた。主なもの: 出典1 の stdio と Streamable HTTP の2つ、独立したプロセス、POST と GET の1つのエンドポイント、Origin の検証と 403、127.0.0.1、認証、DNS リバインディング、Accept の2形式、SSE か JSON、GET に SSE か 405、セッション ID は MAY。出典2 の「MUST be the first interaction」。出典3 の maintenance line、2025-11-25 まで、v2 が current stable release、2026-07-27 から少なくとも6か月。出典4 の recommended for remote servers、Stateless と Stateful、Bearer の節。出典5 の `express.json()`、`localhostHostValidation()`、`allowedHosts`、`listen` を呼ばない。出典6 の3つの名前と DNS リバインディングの注記。出典7 の `enableJsonResponse` 既定 false、`allowedOrigins` の deprecated、再利用時の例外の文言とメッセージ ID の注記。出典8 の POST ごとの作成と GET、DELETE の 405。出典9 の initialized の 202 のあとの GET、405 の扱い、`Failed to open SSE stream`、`close()` の abort と `SSE stream disconnected`。出典10 の latest 1.32.2 と `node >=18`。出典11 の欄の行。出典12 の `--transport http <name> <url>`。出典13 の Pro、Max、Ultra、Team、Enterprise、Console と無料プランに含まれないこと。出典14 の Anthropic のクラウドからつなぐこと、IP の範囲、Free は1つまで。出典15 の Major 1、2、4 と Minor 4。出典16 の Origin と 403、古いクライアントの GET と DELETE に 405（SHOULD）。出典17 の JSON の POST のプリフライトと、`Access-Control-Allow-Origin` が無いとスクリプトに応答を渡さないこと。出典18 は上の表。出典ではなくログで支える文は `sources.md` の後半の表で、直すべき指摘3の1文のほかは表のログで確かめた。
- 利用規約についての注意書きが足されていないか: 足されていない。本文に「個人で試す用途に限る」「API キーで認証する」の類の文は無い。84、612、614行目は、実行した範囲と料金の説明。

### 確かめて問題が無かったこと

- 足した3文（86行目の2文、624行目）を、ガイドを読んだうえで C 行の観点で見た。C10（言い切りの文）、C12、C13（「やり方は…にあります」は章をまたぐ予告ではなく、ほかの記事への案内）、C17（84〜88行目の文末は「ません」「ます」「ます」「です」「ます」「でした」で3連続なし）、C19、C25（prose-check で60字以下）、C26（任意の指摘1のほかは用語の揺れなし）、C27、C30〜C32、C14、C15 に当たる不合格は無い。
- 本文全体の文体と記号: 太字、ダッシュ、全角コロンと空白、全角スラッシュは無い（prose-check の PAT）。否定対比は0回。ですます調で統一（judgments.md の文末の調査と同じ結果を、点検の側の lint の取り直しで確かめた）。
- G07: 本文の `/posts/` は82行目（21番 `mcp-server-typescript-stdio`）と86行目（16番 `ai-agent-custom-tools-agent-sdk`）の2件で、`content/plan.md:57`、`:62`、`:63` の順番で、この記事（22番）より前。リンク先の原稿はどちらもあり、`slug` が一致する。16番の記事の74行目は「`createSdkMcpServer()` が作るのは、同じプロセスの中で動く MCP サーバーです」で、86行目の主張と合う。
- 123行目「特典サンプルとバージョンをそろえる」: `samples/mcp-server/package.json` の SDK は 1.32.2。
- G09: 原稿と `logs/mcp-server-streamable-http/` に、キー、トークン、パスワードの値は無い（`sk-ant`、`ghp_`、`github_pat`、`Bearer ` と英数字、`api_key=` などを `grep` で検索。該当は `needs_api_key: false` と、出典4の節名の説明だけ）。個人名は、git のコミット作者名とメールアドレス、リポジトリのオーナーのアカウント名、それらの語の漢字表記の候補を `grep -i` でかけて0件。
- 価格: 本文の料金の節（610〜614行目）と `cost_estimate` は食い違っていない。API を呼ばない範囲と、有料のアカウントが要る操作を出典13付きで分けている。

### 確かめられなかったこと

- G10: 点検した環境の `keywords/` にある CSV は、2026-11-14 に集め直したもので（`fetched_at` が 2026-11-14、`google-suggest-mcp-server.csv` を含む8ファイル）、`target_query` と1文字も違わない行が無かった。この環境の CSV では、30本の記事のうち `target_query` を持つ28本のうち1本だけが一致する。`selection.md` は 2026-11-11 の CSV で一致を確かめたと書くが、その CSV はこの環境に無い（CSV はコミットしない決まり）。G10 の行は書き換えていない。どの CSV で G10 を判定するかはメインエージェントに確かめる（CSV の行はここに写していない）。
- 記事のコードの再実行。コードは 2026-11-10 から変わっていないので、ログと記事の一致だけを確かめた。
- github.com のページそのもの（raw.githubusercontent.com の同じブランチのファイルで読んだ。v1.x ブランチは 2026-11-02 より後に変わっている可能性があるが、npm の latest は 2026-11-14 も 1.32.2 で、本文が引いた記述はどれも今のファイルにある）。
