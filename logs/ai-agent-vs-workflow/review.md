# review: ai-agent-vs-workflow

- 点検した日: 2026-11-11
- 書いた道具: Claude Code のサブエージェント（Claude）。API キーは使っていない（`run/23.log` から `run/35.log` の `ANTHROPIC_API_KEY: unset`、`run/28.log` から `run/31.log` の出力に `apiKeySource: none`、`run/33.log` と `run/35.log` も `apiKeySource=none` / `none`）
- 点検した道具: Claude Code のサブエージェント（Claude、Sonnet 5.5）。書いたエージェントとは別。Claude Code のバージョン 2.1.322（`claude --version` の出力）。プランのログイン
- 結果: 直すべき指摘 2 件、任意の指摘 7 件

## 直すべき指摘
| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | content/articles/ai-agent-vs-workflow.md:288-297（4通りの表の `total_cost_usd` 列と297行目の文） | 費用の列は1通り1回の測定で、同じ入力の合計でも費用が15倍違う行がある（A は 677 トークンで 0.000139、C は 680 トークンで 0.000009）。B と D も同じ形で、`systemPrompt` を外すと約 0.00014 下がる。本文は「差は入力の合計の差より小さい」としか書かず、この食い違いに触れていない。再現もしない。前回の Linux の実行では向きが逆（A 0.000319、C 0.000407）。読者は「`systemPrompt` を外すと安い」と誤読する | `run/33.log`（A から D の4行）、`run/22.log`（同じ4通り、向きが逆）。出典2（agent-loop）に「For how a custom system prompt or append text affects cache reuse across sessions」とあり、費用はキャッシュの当たり外れで動く。入力の合計は2回の実行でほぼ同じ（677 と 1,462 は環境差、15,252 と 38,995 も環境差、`systemPrompt` の有無による差は3と6トークン）で、費用だけが不安定 | 表から費用の列を外し、入力の合計だけで比べる。残すなら「各1回の測定で、キャッシュの状態で変わるので比べない」と1文で書く |
| 2 | content/articles/ai-agent-vs-workflow.md:284、292、295（「`systemPrompt` を指定しない」の行と「入力の増加は3トークン」） | C と D は `systemPrompt` を外しただけに読めるが、コードは指示の文を `prompt` の先頭へ移している（`次の…`を足している）。入力の増加3トークンは「システムプロンプトが無いときの増分」ではなく、指示の置き場所を変えた差。実験の中身と表の見出しが合っていない | `logs/ai-agent-vs-workflow/code/extra/tools-vs-systemprompt.ts:15-16`（`const prompt = c.system ? body : \`次の${INSTRUCTION}\n${body}\``）、`run/33.log`（C と D の入力の合計 680、15,254） | 行の見出しを「指示を `systemPrompt` でなく `prompt` に書く」に直し、295行目を「指示をどちらに書いても入力はほぼ変わらず、増えるのは `tools` を外したときだけ」と書く。コードブロックは載せていないので、置き場所を変えたことを1文で足す |

## 任意の指摘
| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | content/articles/ai-agent-vs-workflow.md:394 | 「4回か5回くり返すので、9秒を超えます」は計算が合わない。2,234ms の4回分は 8,936ms で 9 秒に届かない（9,438ms を超えたのは測った値）。2,234ms も1回の測定で、前回の Linux の同じ測定は 6,714ms だった | `run/34.log`（`query() 全体: 2234ms`、`duration_ms=1071`）、`run/13.log`（`6714ms`）、`run/28.log`（9,438ms） | 「1回の測定で 2,234ms、ワークフロー版の実測は 9,438ms と 12,246ms」とだけ書き、掛け算の文を外す |
| 2 | content/articles/ai-agent-vs-workflow.md:170、305（コードブロックの直前） | 保存するファイル名が書かれていない。243行目の `node workflow.ts` と351行目の `node agent.ts` で初めて名前が出る。読者は `workflow.ts` として保存すると推測するしかない | 記事の170行目と305行目は直前に「保存する」の文が無い。`code/workflow.ts`、`code/agent.ts` がファイル名の根拠 | 各コードブロックの前の1文に「次のコードを `workflow.ts` として保存します」を入れる |
| 3 | content/articles/ai-agent-vs-workflow.md:400 | 「この仕分けはワークフローで書きます」の理由（呼び出し回数の上限が読める、答えの形を1件ずつ確かめられる）は、測っていない設計上の性質。測った4つの比較（時間、正しいラベル、費用が1勝1敗）はエージェントに有利か同点で、手順2は取り違えたラベルを2件通している（278行目）。誠実に書いてあるが、結論が測定の外にあることが読者に見えにくい | `run/28.log`、`run/29.log`（ラベルの取り違え）、`run/30.log`、`run/31.log` | 「測ったのは速さと正しさ、選んだ理由は測っていない設計の性質」と1文で分ける |
| 4 | content/articles/ai-agent-vs-workflow.md:297 | `tools: []` の入力の合計 677 のうち 675 がキャッシュ読み出しで、プロンプトと問い合わせ（100トークン前後）より大きい。残りの約570トークンが何かを書いていない。読者が `tools: []` で数百トークンの固定分を見て驚く | `run/33.log` の A と C（`cache_read=675`、`678`）、`run/28.log` 6行目（`cache_creation=671`） | 「Claude Code が固定で足す分が約600トークンある」と書くか、中身を確かめて1文足す |
| 5 | logs/ai-agent-vs-workflow/gate.md:94（結果の段落）、10行目 | 結果の段落が「G10 は NG、OK 46、NG 2」のまま。46行目では G10 が OK、冒頭の追記では NG は G07 と G11 だけ。10行目の「SKILL.md（395行）」も現在は 422 行。ゲートの記録が自分と食い違っている | `gate.md:3`、`gate.md:46`、`gate.md:94`。`wc -l` で SKILL.md は 422 行 | 結果の段落を OK 47、NG 1（G07）、G11 は点検待ちに書き直す |
| 6 | logs/ai-agent-vs-workflow/sources.md:11（出典5の行） | 出典5のページ冒頭に「Update June 15, 2026: We've paused the previously-announced changes to Claude Agent SDK usage. For now, nothing has changed」の注記がある（2026-11-11 に取得して確認）。本文105行目の断定は今も正しいが、利用枠の扱いが将来変わりうる注記が記録に無い | 出典5のページ本文 | `sources.md` に注記があることを1行足す（記事本文は変えなくてよい） |
| 7 | content/articles/mcp-server-typescript-stdio.md:9 | 次の記事の `prev` が null のまま。plan.md の並び（#20 の次が #21）に合わせるには、この記事を公開する手順で `prev` を `ai-agent-vs-workflow` に更新する必要がある。この記事の frontmatter 自体は plan.md と合っている | `content/plan.md:61-62`、`mcp-server-typescript-stdio.md:9` | 手順10の6の作業として公開時に更新する（今は記録のみ） |

## 確かめて問題が無かったこと
- 記事の15個のコードブロックと出力: `python3 -I logs/ai-agent-vs-workflow/lint/check-code-and-outputs.py content/articles/ai-agent-vs-workflow.md` を読んだうえで実行し、15ブロックすべて OK（`code/workflow.ts`、`code/agent.ts`、`run/23` から `run/31` と1文字違わない）。
- 数字の突き合わせ: 入力の合計 677、15,252、680、15,254（`run/33.log` の input、cache_creation、cache_read の和）、約23倍（15,252 ÷ 677 は 22.5）、3トークン、25個（`run/33.log`、`run/35.log`）、時間 9,438、12,246、5,628、7,313、2,234ms、費用 0.000766、0.000758、0.001009、0.000733、呼び出し回数 4、5、num_turns 5 を、いずれも該当ログの行と照らして一致を確認した。
- 比較の表の「正しいラベルの件数」: ワークフロー1回目は 001 と 003 が正しく 002 は止めた（2件）、2回目は 001 だけ正しい（1件）、エージェントは2回とも3件で、`run/28` から `run/31` と合う。「1回目はワークフロー版、2回目はエージェント版の費用が小さい」も数字と合う。
- 一般化: 3件と各2回の限定が見出し（377行目）、379行目、402行目に書かれていて、「この結果からは」「この2回では」と範囲を絞っている。速さの順は古い Linux の実行（`run/07`、`run/10`、`run/08`、`run/11`）でも同じ向きだった。
- `settingSources: []` の新しい文（235行目）: `sdk.d.ts` 0.3.322 を取得して、「Pass `[]` to disable filesystem settings (SDK isolation mode).」「Must include `'project'` to load CLAUDE.md files.」「When omitted, all sources are loaded」があることを確認した。本文の「手元の設定と CLAUDE.md を読まない指定」と矛盾しない。
- この機械の設定の混入: `logs/ai-agent-vs-workflow/` の全ファイル（run 35本、code、lint、gate など）を python で走査し、`【`、関西弁の語尾、`/Users/`、`session_`、`sk-ant-`、UUID の形、ユーザー名の形が `run/` と記事に0件。`run/23` から `run/35` の答えは「返金」「不具合」「その他」の1語だけで、入力の合計も `tools: []` で 677 と 680（混入した前の取得は 35,800 と README にある）。
- API キー: すべての `query()`（記事2、`code/` の6ファイル）に `strictMcpConfig: true` と `settingSources: []` がある（grep で数えた）。`claude -p` の例は無い。`ANTHROPIC_API_KEY` の使用は `unset` の確認だけ。
- 出典: 記事の出典の表11行、frontmatter の `sources` 11件、`sources.md` の11行の URL が一致し、本文は出典1から11をすべて引いている（python で照合）。
- 出典の中身: 出典1（取得して、`trade latency and cost`、`predictability and consistency`、`stopping conditions`、`predefined code paths`、`maintaining control`、`gate` の語が原文にあること）、出典2（`Without tools, Claude can only respond with text`、trailing system events、prompt cached）、出典4（`An estimate, not a billing statement`、`default local spawn`）、出典5（`still draw from your subscription limits`）、出典8（v22.18.0 で type stripping が既定で有効）、出典10（`haiku` が Anthropic API で Haiku 5.5）を開いて確認した。
- 規約の文章: 記事を `規約`、`個人`、`Console`、`API キーで`、`利用条件` で検索して0件。`ANTHROPIC_API_KEY` と `apiKeySource` の説明は技術的な内容と費用の事実だけ。
- リンク: 記事内の5つのリンク先（`ai-agent-safe-file-tool`、`mcp-server-typescript-stdio`、`claude-agent-sdk-first-agent`、`ai-agent-max-turns-budget-limit`、`ai-agent-custom-tools-agent-sdk`）が `content/articles/` にあり、題名と中身が文と合う（入門記事に `message.type` の分岐と `settingSources: []`、止め方の記事に `error_max_turns` と例外の記述あり）。`prev` と `next` は `content/plan.md:60-62` の #19、#21 と同じ。旧 slug 4つは記事とログに0件。
- `target_query`: 「ai エージェント ワークフロー 違い」は `keywords/google-suggest-ai-agent.csv` に1行ある。タイトルは「AI エージェントとワークフローの違い」を先頭に置き、リードの55行目がその答えを言っている。
- ゲートの OK の行: G01、G02（lint を2本とも標準出力で再実行し、判定行が保存分と同じ。ai-smell は致命なし、writing-lint は `FATAL 0 / DENSITY超過 0 / SHOULD 0`）、G04、G05、G06、G08、G09、G10、C08、C15、C25、C31、C37 を現在の原稿とログで確かめて、どれも真だった（C25 は表を除く地の文で60字超が0件、C15 は対比構文の語が0件、C31 はダッシュが0件）。
- 日付: `run/23.log` の 2026-11-12T01:10Z は太平洋時間の 2026-11-11 17:10 で、ローカル日付 2026-11-11 と合う。`verified_at`、末尾の「コードは 2026-11-11 に」、`run_environment`（Node.js 22.23.4、npm 10.9.9、SDK 0.3.322、Claude Code 2.1.322、macOS arm64、TypeScript 7.0.2）は `run/23` から `run/35` と `run/32.log` の `Version 7.0.2` に合う。
- 読者の目線: 出力が実行ごとに変わることを本文が最初から書いている（259から280行目、369から373行目）。ワークフロー1回目の止まり方は固定の結果として書かれていない。

## 確かめていないこと
- `tools: []` の入力のうち約 570 トークンの固定分の中身。init メッセージの全文やシステムプロンプトのログが無く、モデル呼び出しは禁止されているので、この機械の設定が1文字も入っていないことは、答えが1語であることと入力の合計の小ささからの推定にとどまる。
- 出典6（認証）、出典7（料金プラン、Free に Claude Code が無いこと、Pro 月20ドル）、出典9（npm の最新版）、出典11（prompt caching の和の式）の本文は開いていない（`sources.md` の記述を信じている）。
- 記事のコードの再実行（禁止のため行っていない）。`tsc` の結果は `run/32.log` の記録を読んだだけ。
- EmDash 側の表示、タグ、公開予約、`logs/ai-agent-vs-workflow/brief.md` と `selection.md` の中身の細部。

## 対応（2026-11-13）

| 指摘 | 対応 | 変えた所 / 理由 |
|---|---|---|
| 直すべき 1（費用の列が1回の測定） | 直した | 原稿 288〜292行目の表は入力の合計だけで、費用の列は無い。299行目に「入力の合計がほぼ同じ2通りでも見積もりは15倍ほど違った。前の日の Linux の1回は向きが逆で、理由は確かめていないので比べない」と書いた。`sources.md:32` に数値の根拠 |
| 直すべき 2（systemPrompt を外しただけに読める） | 直した | 原稿 284行目に「指示を `systemPrompt` に書かない2通りでは、同じ指示を `prompt` の先頭に書いた」と書き、表の見出し（290〜293行目）を「指示は `systemPrompt`」「指示は `prompt` の先頭」にし、295行目を「指示をどちらに書いても、入力の差は3トークン」にした |
| 任意 1（9秒を超える、の計算） | 直した | 原稿 396行目。掛け算の文を外し、「この環境で1回測って 2,234ms。ワークフロー版の実測は 9,438ms と 12,246ms」だけにした |
| 任意 2（保存するファイル名） | 直した | 原稿 168行目と 305行目の末尾に「次のコードを `workflow.ts`（`agent.ts`）として保存します」 |
| 任意 3（結論が測定の外にある） | 直した | 原稿 402行目に「測ったのは速さと正しさと費用で、ワークフローを選ぶ理由はどれも測っていない設計の性質です」 |
| 任意 4（固定分の約570トークン） | 直した（確認していないと書いた） | 原稿 297行目に「残りの中身は確かめていません」。中身の確認にはモデル呼び出しが要るので、数字は足していない |
| 任意 5（gate.md の結果の段落） | 直した | `gate.md:94` を「OK 47、NG 1（G07）、G10 は OK、G11 は点検待ち」にし、表の行を数えて一致を確かめた。10行目と16行目の行数の記述も直した |
| 任意 6（出典5の注記） | 直した | `sources.md:11` に June 15 の注記を記録済み |
| 任意 7（次の記事の `prev`） | 見送り | 別の記事のファイルで、この担当の範囲の外。公開の手順で更新する |
| 追加 | 直した | `updated` を 2026-11-13 にした。lint 2本と `check-code-and-outputs.py` を回し直して保存し直した |

点検の結果（2026-11-14）: 直すべき指摘 2

- `content/articles/ai-agent-vs-workflow.md:295` の「指示をどちらに書いても、入力の差は3トークンでした」は、直上の表と合わない。:290 と :292 は 677 と 680 で差3、:291 と :293 は 15,252 と 15,254 で差2（`run/33.log` も同じ値）。「2〜3トークン」にする。
- gate.md の数と行が今の原稿に合わない。`gate.md:67` C16 は「地の文138文、20字以下14文、41〜60字62文」「1文だけの段落（79、299行目）」だが、`prose-check.py` を今の原稿に回すと 148文、15文、63文で、:299 は5文の段落。全12本で `lint/prose-check.txt` が今の原稿に回し直した結果と食い違う（原稿を直したあとに証跡を取り直していない。2026-11-14 の本文リンクを外した直しが原因と見られる）

対応（2026-11-14）:

- gate.md の行番号と数と引用: 全行を今の原稿の行に合わせて書き直した。主な行は gate.md:38（G02）、gate.md:44（G08）、gate.md:67（C16）、gate.md:78（C27）。
- `lint/prose-check.txt`: 今の原稿で回し直し、`lint/ai-smell.txt`、`lint/writing-lint.txt`、`lint/check-code-and-outputs.txt` も取り直した（`lint/` 内の各ファイル）。
- content/articles/ai-agent-vs-workflow.md:295: 「入力の差は3トークン」を「2〜3トークン」に直した（表の :290〜:293 の 677/680 と 15,252/15,254、`run/33.log` と合う）。

点検の結果（2026-11-14 2回目）: 直すべき指摘 0

- 直すべき指摘は無し。

点検した道具: Claude のサブエージェント（Opus 5.5、この記事の執筆と直しには関わっていない）。環境変数 `ANTHROPIC_API_KEY` は設定なし（`env` で0件）。やったこと: lint 2本を作業用の一時フォルダへ回し直し（ai-smell exit 0・FATAL 0、writing-lint `FATAL 0 / DENSITY超過 0 / SHOULD 0`、保存済みの `lint/` と一致）。`lint/check-code-and-outputs.py` と `lint/prose-check.py` を今の原稿で回し直し、保存済みと一致（ALL OK）。gate.md の G・C 行にある「N行目「引用」」「「引用」（N行目）」と、見出し・問い・段落を指す行番号を、全行スクリプトで今の原稿と照らした。G05 の出典の表の範囲と件数、引用している行の一覧を照らした。過去の点検の直すべき指摘（G07 を除く）は、今の本文の該当行を開いて閉じているか確かめた。地の文の3桁以上の数を run/ と code/ のログと照らし、見つからない数は計算で確かめた。ほかの記事を指す文は、指す先の記事が同じ記事の本文でリンクされているかを確かめた。G07 は対象外。本文の通読は、スクリプトで拾った箇所と過去の指摘の箇所に限った。

対応（2026-11-14 2回目）: gate.md:26、28、29、30 の行番号を今の原稿に合わせた（当時の80行目、307〜369行目、392行目、414行目、282〜292行目）。 全12本の gate.md の行番号・引用を照合するスクリプトを回し、食い違い0件（旧・当時の記録の行と、sdk.d.ts・dist・plan.md・run・lint のログの行は照合の対象外）。
