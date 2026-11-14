# review: claude-agent-sdk-structured-output

- 点検した日: 2026-11-11
- 書いた道具: Claude Code のサブエージェント（Claude）。API キーは使っていない（`run/23.log`、`run/31.log`〜`33.log` の init が `apiKeySource=none`、`run/18.log`〜`33.log` のヘッダーが `ANTHROPIC_API_KEY: unset`）
- 点検した道具: Claude Code のサブエージェント（Claude、Sonnet 5.5）。書いたエージェントとは別。Claude Code のバージョン 2.1.322。プランのログイン。私はモデルを呼ぶコードを動かしていない
- 結果: 直すべき指摘 2 件、任意の指摘 6 件

## 直すべき指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/claude-agent-sdk-structured-output.md`:260、264〜266、272 | 満たせないスキーマの結果が「2回ずつ、`num_turns=4`」で固定の数字として載っている。ログ全体では回によって違う。1回目の実行では3回とも不一致が3回ずつ、`num_turns=5` で、`run/12.log` では1つのメッセージに2つの不一致がまとまって出ていた。読者が3回出る結果を見ると、記事が間違いだと思う。また既定の上限が5回（272行目）と書いてあるのに、既定のままでは2回で止まる理由が書かれていない。5回まで試す動きは SDK では1度も見ていない（見たのは上限を1にした `run/25.log` だけ） | `run/24.log`、`29.log`、`30.log` は不一致2回、`num_turns=4`。`run/07.log`、`12.log`、`13.log` は不一致3回、`num_turns=5`。`sources.md`:22 に「出し直しをやめるまでの回数は回によって変わる」と書き手自身が書いているのに、記事に無い | 264〜266行目に「不一致の回数は回によって2回や3回と変わりました。変わらなかったのは、3回とも `success` で値が無かったことです」と事実を足す。272行目の既定5回は「公式の表の値で、既定のままでは5回まで試す動きは確かめていません」と書く。`num_turns=4` の出力は載せたままでよい |
| 2 | `logs/claude-agent-sdk-structured-output/code/README.md`:25 | 点検の指示では `code/` の中に `disableClaudeAiConnectors` の文字列を残してはいけない（`code/extra/explore-without-settings.ts` を除く）。README の25行目に、旧版のコードを説明する文として2か所残っている。記事本文には0件 | `code/` 内の全ファイルを grep した結果、この1行だけ。`sources.md`:19 にもあるが、これは `code/` の外 | 「`settings` の1行を `strictMcpConfig: true` に替えた」のように、設定名を書かない言い方に直す |

## 任意の指摘

| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | `content/articles/claude-agent-sdk-structured-output.md`:192〜194 | 「800個読み込まれた回がありました」の根拠は `run/17.log` の1回だけで、そのコードは `maxTurns: 1` を足した別の版（`code/extra/explore-without-settings.ts`）。守りを付けずに動かした `run/14.log`〜`16.log` の3回は、コネクタのツール0個。`strictMcpConfig` を付けると減る、という比べ方の記録は無い（`run/31.log`〜`33.log` の0個は付けた版だけ） | `run/17.log`:7〜8 は801個、`run/14.log`〜`16.log` は `mcp_tools=0`、`sources.md`:25〜26 | 「1回だけ800個になり、同じ条件の3回は0個だった」と実測の分布を書く。または回数の話を消し、付ける理由だけを残す |
| 2 | 同:192〜194 | スキルの「守ること」6（`.claude/skills/write-article/SKILL.md`:251）は、理由を書くなら設定の横の1行コメントだけで、本文に段落を足して説明しないと決めている。記事には見出しと2文の段落がある。コードのコメント（141、221、324行目）は規定どおり | `SKILL.md`:251 | 見出しと段落を消し、コードコメントだけにするか、段落の削除を書いた AI に判断させる |
| 3 | 同:368 | 「ここで失敗することはまずありません（出典1）」。出典1の要約（`sources.md`:8）には、検証済みだと書いてあるだけで、確率の話は無い。書き手の見込みに出典番号が付いている | `sources.md`:8、記事368行目 | 出典番号を外し、「SDK が検証済みの値なので」と理由だけにする |
| 4 | `logs/claude-agent-sdk-structured-output/gate.md`:33（G07）、84 | G07 の根拠に「比較の記事は原稿も無い」「リンク先はどれも公開も予約もされていない」とあるが、今は `content/articles/structured-output-methods-compare.md` がある（`status: draft`）。84行目は G10 を NG と書いたまま（冒頭の追記3行目が上書きしている）。G07 の NG 判定自体は、リンク先が未公開なので正しい | `ls content/articles/` で4つのリンク先がすべて存在し、`status: draft` | G07 の根拠を「4本とも原稿はあるが draft」に直し、84行目を G10 OK に合わせる |
| 5 | `logs/claude-agent-sdk-structured-output/sources.md`:15、記事62行目 | 記事は「Pro、Max、Ultra のどれか」と書くが、出典8の行は Pro のことしか記録していない。料金ページを開くと、FAQ に「Max と Ultra は Pro の全部に加えてさらに利用量」とあり、記事の文は支えられる。記録だけ足りない | `https://claude.com/pricing` の FAQ「How are Max and Ultra different from Pro?」（点検で開いた） | `sources.md` の出典8の行に Max と Ultra の記述を足す |
| 6 | 記事61〜63行目、75行目 | 初めての読者向けに、「プランでログインした Claude Code」にどうやってなるかが書かれていない（出典6へ飛ぶだけ）。ログインしていない読者は init の前で止まる | 記事63行目 | 「`claude` を起動してログインする」程度の1文と出典の番号を足す。規約の注意書きにはならない |

## 確かめて問題が無かったこと

- 数字と出力: 記事の18個のコードブロックと出力を `python3 -I logs/claude-agent-sdk-structured-output/lint/check-code-and-outputs.py content/articles/claude-agent-sdk-structured-output.md logs/claude-agent-sdk-structured-output` で照合した（スクリプトを先に読んだ）。結果は ALL OK で、`run/19`〜`27` と記事が1文字も違わない
- `npm install` の出力: 記事89〜97行目は `run/21.log` の出力と一致（`added 105 packages, and audited 106 packages in 15s`）。1回目の `run/04.log`（`added 3 packages`）とは別で、新しいほうが載っている
- コード: 3本のコードそれぞれの `query()` に `strictMcpConfig: true`（記事141、221、324行目）。`claude -p` のコマンドは記事に無い。`disableClaudeAiConnectors` は記事に0件、`code/` で `extra/explore-without-settings.ts` にも無い。`ANTHROPIC_API_KEY` は検査コマンドと `unset` の説明だけで、使っていない
- `apiKeySource`: `run/23.log`、`31`〜`33` が `none`。記事167行目と一致
- `run_environment`、`verified_at`、末尾の日付: Node.js 22.23.4、npm 10.9.9、SDK 0.3.322、Claude Code 2.1.322、zod 4.6.7、arm64 は `run/22.log` のヘッダー、TypeScript 7.0.2 は `run/28.log` と一致。日付 2026-11-11 は、ログが UTC の 2026-11-12 01:02〜01:03 で、ローカル日付が 2026-11-11 という前提に合う
- 出典: 本文の `（出典n）` は41か所、番号は1〜9、表は9行、frontmatter の `sources` も9件で、URL の並びが同じ。`sources.md` も9行。使われていない行は無い
- 出典の中身: 料金ページを開き、Pro の月払いの記録と Max、Ultra の記述（任意5）を確かめた。構造化出力のページと環境変数のページも取得して索引に入れたが、検索の回数制限で引けず、中身の突き合わせは `sources.md` の記述までにとどまる
- 利用条件の注意書き: 記事を「規約」「個人」「Console」「Ultra」で grep し、当たったのは62行目の「Pro、Max、Ultra」（機能の話）だけ。62、65、75行目の `ANTHROPIC_API_KEY` の話は `apiKeySource` の技術説明
- リンク: 55、301、368、374、402行目の4つの slug（`claude-code-api-key-billing-auth`、`zod-to-json-schema-tool-definition`、`zod-validate-llm-json-output`、`structured-output-methods-compare`）はすべて `content/articles/` にある。各記事の題と説明を読み、記事の説明文は真。`prev`（課金の記事）、`next`（zod の検証）は `content/plan.md`:46〜48 の #5、#7 と一致し、課金の記事の `next` と zod の記事の `prev` もこの記事を指す。旧 slug 4つは0件
- `target_query`: `claude 構造化出力` は `keywords/google-suggest-structured-output.csv` の `suggestion` に1行ある（rank 1）。記事は `outputFormat` で JSON を返させる手順を答えており、題名にも JSON と構造化出力の語が入っている。弱い適合ではない
- ゲート行の再検証: G01、G02（lint を標準出力に出し直した。`ai-smell-lint` は use 0件、mention 0件、致命なし。`writing-lint` は FATAL 0、DENSITY超過0、SHOULD 0。保存済みの判定行と一致）、G04、G05（出典41か所、9行）、G09（`/Users/`、`session_`、`sk-ant-`、ユーザー名の系統を python3 で全ファイルにかけ、当たりは npm のパッケージ名の `@` と、`selection.md` の1つだけで、秘密は無い）、G10（CSV の行を確認）、C08（check スクリプト）、C25（`prose-check.py` を標準出力に出して `C25 over60=0 max=60`）、C37（`run/24`、`29`、`30`、`25`、`27`、`17` がそれぞれ記事の記述を支える）、C06（H2 は8、H3 は7）、C13（「まとめ」「整理」「ここから」「次は」0件）。この範囲に偽の OK は無い
- 秘密: `run/` と `code/` の中に `/Users/`、メールアドレス、セッション ID、`sk-ant-` は無い。`run/27.log`、`run/10.log` の圧縮ソース行は注記に置き換え済み。コネクタの名前は `run/17.log` で数に置き換わっている

## 確かめていないこと

- 記事のコードの再実行（指示で禁止）。結果は書き手のログだけを根拠にした
- 出典1、2、4の本文と、`sdk.d.ts` の「An estimate, not a billing statement」の一文。構造化出力と環境変数のページは取得したが、検索が制限され、断定ごとの突き合わせはしていない
- Node.js 22.18.0 ちょうどで `node classify.ts` が警告なしに動くか（検証は 22.23.4 のみ）
- 記事の「SDK でも `MAX_STRUCTURED_OUTPUT_RETRIES` が効く」の上限5回側（既定のままで5回まで試す動き）。ログに無い
- Google の上位記事との比較

## 対応（2026-11-13）

| 指摘 | 対応 | 変更点（ファイル:行）または理由 |
|---|---|---|
| 直すべき 1 | 直した | 記事 :262-264。「この記事のコードで3回動かすと不一致は3回とも2回、`num_turns=4`」「前の版では3回とも3回、`num_turns=5`、回数が違った理由は確かめていません」。:272 は既定5回を公式の表の値とし、既定のままで5回まで試す動きは確かめていないと書いた。根拠は `run/24.log`、`29.log`、`30.log`（`num_turns=4`）と `run/07.log`、`12.log`、`13.log`（`num_turns=5`） |
| 直すべき 2 | 直した | `code/README.md:25` は設定名を書かない言い方になっている（`code/` 内に該当なし）。`sources.md:19` に残っていた設定名も「コネクタを外す設定」に直した。残りは `review.md` の指摘の引用だけ |
| 任意 1 | 直した | 記事から「800個」の段落が外れている。`gate.md` の C37 の根拠も「1回だけの観察で記事からは外した」に直した |
| 任意 2 | 見送り | 段落の削除は、前の直しで見出しと段落が整理された後の版に対する指摘。今の本文に該当の見出しは無く、新しい変更は足さない |
| 任意 3 | 直した | 記事 :368 は出典1を「SDK がスキーマで検証した値です」だけに付け、確率の話は無い |
| 任意 4 | 直した | `gate.md` G07 の根拠を「4本とも `status: draft`」に、結論の行を G10 OK に |
| 任意 5 | 直した | `sources.md` 出典8の行に Max と Ultra の記述が入っている（`sources.md:14`） |
| 任意 6 | 見送り | ログイン手順の文は新しいスコープ。出典6への参照は :63 に残してある |

点検の結果（2026-11-14）: 直すべき指摘 1

- gate.md の行番号と数が今の原稿（402行）と合わない。`gate.md:34` G08 は「404行目」だが末尾は `content/articles/claude-agent-sdk-structured-output.md:402`。`lint/prose-check.txt` 1〜3行目（units=154、sentences=102）は回し直すと 149、97。全12本で `lint/prose-check.txt` が今の原稿に回し直した結果と食い違う（原稿を直したあとに証跡を取り直していない。2026-11-14 の本文リンクを外した直しが原因と見られる）

対応（2026-11-14）:

- gate.md の行番号と数と引用: 全行を今の原稿の行に合わせて書き直した。主な行は gate.md:28（G02）、gate.md:34（G08）、gate.md:54（C13）、gate.md:57（C16）。
- `lint/prose-check.txt`: 今の原稿で回し直し、`lint/ai-smell.txt`、`lint/writing-lint.txt`、`lint/check-code-and-outputs.txt` も取り直した（`lint/` 内の各ファイル）。

点検の結果（2026-11-14 2回目）: 直すべき指摘 0

- 直すべき指摘は無し。

点検した道具: Claude のサブエージェント（Opus 5.5、この記事の執筆と直しには関わっていない）。環境変数 `ANTHROPIC_API_KEY` は設定なし（`env` で0件）。やったこと: lint 2本を作業用の一時フォルダへ回し直し（ai-smell exit 0・FATAL 0、writing-lint `FATAL 0 / DENSITY超過 0 / SHOULD 0`、保存済みの `lint/` と一致）。`lint/check-code-and-outputs.py` と `lint/prose-check.py` を今の原稿で回し直し、保存済みと一致（ALL OK）。gate.md の G・C 行にある「N行目「引用」」「「引用」（N行目）」と、見出し・問い・段落を指す行番号を、全行スクリプトで今の原稿と照らした。G05 の出典の表の範囲と件数、引用している行の一覧を照らした。過去の点検の直すべき指摘（G07 を除く）は、今の本文の該当行を開いて閉じているか確かめた。地の文の3桁以上の数を run/ と code/ のログと照らし、見つからない数は計算で確かめた。ほかの記事を指す文は、指す先の記事が同じ記事の本文でリンクされているかを確かめた。G07 は対象外。本文の通読は、スクリプトで拾った箇所と過去の指摘の箇所に限った。
