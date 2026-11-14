# review: rag-answer-with-citations-claude

- 点検した日: 2026-11-11
- 書いた道具: Claude Code のサブエージェント（Claude）。API キーは使っていない（`run/24.log`、`25.log`、`27.log`〜`34.log` の10件すべてで `apiKeySource: none`、ヘッダーは `ANTHROPIC_API_KEY: unset`）
- 点検した道具: Claude Code のサブエージェント（Claude、Sonnet 5.5）。書いたエージェントとは別。Claude Code のバージョン 2.1.322。プランのログイン。この点検ではモデルを呼ぶコードは動かしていない
- 結果: 直すべき指摘 0 件、任意の指摘 5 件

公開については、G07（リンク先の記事がまだ公開も予約もされていない）が `gate.md` で NG のままです。これは指摘ではなく、公開の順番の条件です。

## 直すべき指摘
| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| - | - | 0 件 | - | - |

## 任意の指摘
| # | 場所（ファイル:行） | 何が問題か | 根拠（ログ名:行、出典など） | 直し方の案 |
|---|---|---|---|---|
| 1 | content/articles/rag-answer-with-citations-claude.md:223 | 「1文字でも書き換えた引用は通しません」は正しいが、短すぎる引用は通る。空文字の引用は `includes("")` が true なので、`{chunk: 1, quote: ""}` は検証を通る。`verify()` の限界として書かれているのは412行目の「回答の文の中身」だけで、引用文が極端に短い場合は書かれていない | `node -e 'console.log("abc".includes(""))'` が true（この点検で実行）。`code/verify.ts` の `doc.text.includes(quote)`。スキーマ（`ask.ts`:269〜289行）に `minLength` は無い | 223行目か412行目に「空や1語だけの引用も通る」と1文足す。または `verify.ts` に最小の長さを入れ、コードと実行ログを取り直す |
| 2 | content/articles/rag-answer-with-citations-claude.md:412 | 資料にない一文が `answer` に入る例は run/25 の1件だけを挙げている。実際は答えられない5回すべてに、資料にない「ショップに問い合わせてください」系の一文が入っている。読者には偶然の1件に見える | `run/25.log`、`31.log`〜`34.log` の `answer` の末尾（5回とも「ショップへ直接お問い合わせください」「サポート窓口にご確認ください」の類） | 「5回とも、資料にない案内の一文が付きました」と書く。数は上のログから言える |
| 3 | content/articles/rag-answer-with-citations-claude.md:59〜67 | 読者がどうやってプランでログインするかが書かれていない。「プランのアカウントでログインした Claude Code」が前提だが、`claude` を起動してログインする手順への案内が無い。JS/TS は書けて LLM は初めての読者が止まりやすい | 本文59〜65行目。入門記事（65行目のリンク先）にあるかは、この点検では読んでいない | 入門記事のログインの節へのリンクを1行足す。または1行でログインの確かめ方を書く |
| 4 | logs/rag-answer-with-citations-claude/gate.md:80 | 結論の行が古い。「G07 と G10（CSV 待ち）が NG」とあるが、G10 は32行目で OK。3行目の追記と食い違う（行番号やスクリプトの古さではなく、結論の文の食い違い） | `gate.md`:3、32、80 | 80行目を「G07 が NG、G11 は点検待ち」に直す |
| 5 | content/articles/rag-answer-with-citations-claude.md:10（`run_environment`） | 長さ152字の1つの値で、読点で並べた1文のまま記事ページの枠に出る。C25 の「60字超を分割」は、`gate.md`:62 が title と description だけを数えたと書いているので、この値は数えられていない | frontmatter 10行目。`gate.md`:62 | 気になるなら「Node.js 22.23.4、npm 10.9.9」と「SDK 0.3.322（Claude Code 2.1.322）」「macOS、TypeScript 7.0.2」に分けて書く。必須ではない |

## 確かめて問題が無かったこと
- 数と出力（本文53、384、410、428〜437行目）: `run/24.log`、`25.log`、`27.log`〜`34.log` を python で数え直した。返品の質問は5回とも answerable true、出典は資料1の1件、検証 OK。送料の質問は5回とも false、出典は空、検証 OK。10回とも `num_turns=2`、`tools: StructuredOutput`、`exit=0`。記事の「5回とも」「10回とも」と一致する
- 費用の範囲（437行目）: 10回の `total_cost_usd` の最小は `28.log`、`30.log` の 0.00009305000000000001、最大は `25.log` の 0.0007195000000000001。本文の 0.00009305 と 0.0007195 は浮動小数点の端数を落とした値で、`code/README.md` も同じ説明
- 高い見積もりの1件: 本文にも `cost_estimate` にも、`code/README.md` にある 0.567573 の試し実行への言及は無い。原因の推測も無い。437行目は「10回で」と範囲を10回に限っていて、ログの裏付けがある
- 実行環境と日付: `run_environment`（10行目）は `run/19.log` の node v22.23.4、npm 10.9.9、`run/23.log` 以降の SDK 0.3.322、Claude Code 2.1.322、`run/35.log` の tsc 7.0.2、Darwin arm64 と一致。`verified_at` と478行目は 2026-11-11。`run/19.log` 以降のヘッダーは UTC で 2026-11-12（01:02〜01:03）だが、手元の日付が 2026-11-11 であることは `gate.md`:30 が書いており、依頼の前提とも合う
- コード: `python3 -I logs/<slug>/lint/check-code-and-outputs.py content/articles/<slug>.md logs/<slug>` を、スクリプトを読んでから実行した。コードブロック18個すべてが `code/` と `run/` に一致し、`tokenize.ts`、`bm25.ts`、`docs.ts` は `logs/rag-bm25-search-typescript/code/` と同一、`run/01.log`〜`35.log` が `exit=0`（出力は ALL OK）
- `strictMcpConfig`: `ask.ts` の `query()` は1つで、318行目に `strictMcpConfig: true` がある（`code/ask.ts` も同じ）。`claude -p` はコードにも記事にも無い。`ANTHROPIC_API_KEY` を使うコードは無く、出てくるのは有無の確認コマンドだけ。`code/extra/run-all.sh` は付ける前の記録で、`code/README.md` がそう書いている
- 出典の対応: 本文の（出典1〜9）と表の9行、frontmatter の `sources` 9件、`sources.md` の表9行の URL と題名が揃っている。旧出典6（Legal and compliance）への参照は残っていない
- 出典が断定を支えているか: `sources.md` に写された原文と本文を照らした。227行目の「裏付けの引用が見つからない主張は取り下げさせる」は出典2の「If it can't find a quote, it must retract the claim」と合う。386行目の `StructuredOutput` の説明は出典3の記述と合う。62行目の Pro 月20ドルは出典7の「$20 if billed monthly」と合う。ページ本体は3件（出典2、5、6）を取得したが、検索の呼び出しが制限されて本文を読めなかったので、原文の照合は `sources.md` の引用を信頼している
- 利用規約や注意書き: 本文と `cost_estimate` に、利用条件、個人用途の限定、API キーを勧める文、Claude Console の話は無い。51行目、67行目、77行目、445行目は `apiKeySource` と優先順位の技術的な説明と料金の事実だけ
- リンク: 本文のリンク先6件（`rag-local-embeddings-transformers-js`、`rag-hybrid-search-rrf`、`rag-bm25-search-typescript`、`claude-agent-sdk-first-agent`、`claude-agent-sdk-structured-output`、`rag-retrieval-eval-recall-mrr`）は `content/articles/` にある。各リンクの説明文は、題名とあちらの記事の内容に照らして真。`content/plan.md` の並びは #13 → #14 → #15 で、この記事の `prev`（12行目）と `next`（13行目）、前後の記事の `next` と `prev` が一致。禁止の旧 slug 4つは0件
- `target_query`: `rag 出典` は `keywords/google-suggest-rag.csv` に1件あり、ほかの記事の `target_query` に重なる物は無い。タイトルは「RAG」と「出典つきで回答させる」を含み、記事は番号つきの資料、出典の JSON、検証までを答えている。合っている
- ゲートの行（OK のうち G04、G05、G08、G09、C08、C25、C37、C38 の8行）: G04 は上のコード照合と10件の `apiKeySource` で真。G05 は出典の本文行の列挙（61、62、63、67、77、101、227、261、343〜347、355、357、386、388、445）が実際の行と一致。G08 は478行目の日付が一致。G09 は57ファイルという数が実際の数と一致し、私の走査（下記）でも同じ結論。C08 は18ブロック一致で真。C25 は本文の地の文に60字超の文が0件（私が数え直した）。C37 は引用されたログ行が実在する。C38 は G04 と同じ。G07 の NG は実際の状態と合っている
- lint の再実行: `ai-smell-lint.py` と `writing-lint.py`（手順7のコマンド、標準出力のみ）の判定行は保存済みと同じ（`致命なし`、`FATAL 0 / DENSITY超過 0 / SHOULD 0`）
- 個人情報: `logs/rag-answer-with-citations-claude/` と原稿を python で走査（`/Users/`、`session_`、`sk-ant-`、`@`、`/private/`、`tmp/claude`、`/home/`、ユーザー名の語）。当たったのは `gate.md`:31 の走査語の説明文と、`selection.md`、原稿の `Recall@k` だけで、実際の値は無い
- 読者の目で見た壊れやすさ: 返品の質問と送料の質問は5回ずつで固定した結果として書かれているが、439行目で「5回では誤った出典が出る割合までは測れない」と書いてあり、確実とは言っていない。しきい値 0.1 は BM25 記事の値で、記事内に由来がある
- `verify()` の限界の書き方: 412行目で「出典の番号と引用文しか見ない」「回答の文の中身までは確かめられない」と、資料にない一文を実例にして書いている。この点は誠実

## 確かめていないこと
- 出典2、5、6のページは取得したが、本文の検索が制限されて読めなかった。出典1、3、4、7、8、9は開いていない。`sources.md` の原文引用を信頼した
- 入門記事のログインの節（任意の指摘3）を読んでいない
- 記事のコードの再実行はしていない（依頼どおり）。`check-sample.ts` の `run/06.log` は修正前の版の実行で、コードの変更が無いという `code/README.md` の説明を、ファイルの更新時刻では確かめていない（記事のコードブロックと `code/` の一致は確かめた）
- `gate.md` の文体の項目（C09 から C24）の、ガイドを読んだうえでの判定は、lint の再実行と C25 の再計算以外は再判定していない

## 対応（2026-11-11）

| 指摘 # | 対応 | 変えた所、または理由 |
|---|---|---|
| 1 | 直した | `content/articles/rag-answer-with-citations-claude.md`:223 に、空の引用文は `includes` が true を返すので検証を通ること、短い引用も資料に含まれていれば通ることを足した。`verify.ts` と `code/` は変えていない |
| 2 | 直した | 同:412 に「同じ質問を動かした5回すべてで、問い合わせを案内する一文が付いていました」を足した。根拠は `run/25.log`、`31.log`〜`34.log` の `answer` の末尾 |
| 3 | 見送り | 新しい節かログイン手順の追加になり、範囲が広がるため |
| 4 | 直した | `gate.md`:80 を「G07 が NG、G11 は点検待ち」に直した |
| 5 | 見送り | 表記の好みで、事実の誤りではない。本文の地の文の長さには影響しない |

再ゲート: ai-smell exit 0 / writing-lint FATAL 0・DENSITY超過 0・SHOULD 0 / check-code-and-outputs ALL OK / prose-check C25 over60=0 / 出典 1〜9 の本文と表が一致。

点検の結果（2026-11-14）: 直すべき指摘 1

- gate.md の行番号が今の原稿（474行）と合わない。`gate.md:30` G08 は「478行目」だが末尾は `content/articles/rag-answer-with-citations-claude.md:474`。`gate.md:46` C09 の「191行目」は今 :189、`gate.md:50` C13 の「392行目」は :390、`gate.md:76` C39 の「441行目」は :439。`lint/prose-check.txt`（units=178、sentences=95）は回し直すと 174、91。全12本で `lint/prose-check.txt` が今の原稿に回し直した結果と食い違う（原稿を直したあとに証跡を取り直していない。2026-11-14 の本文リンクを外した直しが原因と見られる）

対応（2026-11-14）:

- gate.md の行番号と数と引用: 全行を今の原稿の行に合わせて書き直した。主な行は gate.md:24（G02）、gate.md:27（G05）、gate.md:30（G08）、gate.md:46（C09）、gate.md:50（C13）、gate.md:76（C39）、gate.md:53（C16）。
- `lint/prose-check.txt`: 今の原稿で回し直し、`lint/ai-smell.txt`、`lint/writing-lint.txt`、`lint/check-code-and-outputs.txt` も取り直した（`lint/` 内の各ファイル）。

点検の結果（2026-11-14 2回目）: 直すべき指摘 0

- 直すべき指摘は無し。

任意: :339 と :414 の「BM25 の記事」はその文にリンクが無い（:55 と :101 でリンク済み）

点検した道具: Claude のサブエージェント（Opus 5.5、この記事の執筆と直しには関わっていない）。環境変数 `ANTHROPIC_API_KEY` は設定なし（`env` で0件）。やったこと: lint 2本を作業用の一時フォルダへ回し直し（ai-smell exit 0・FATAL 0、writing-lint `FATAL 0 / DENSITY超過 0 / SHOULD 0`、保存済みの `lint/` と一致）。`lint/check-code-and-outputs.py` と `lint/prose-check.py` を今の原稿で回し直し、保存済みと一致（ALL OK）。gate.md の G・C 行にある「N行目「引用」」「「引用」（N行目）」と、見出し・問い・段落を指す行番号を、全行スクリプトで今の原稿と照らした。G05 の出典の表の範囲と件数、引用している行の一覧を照らした。過去の点検の直すべき指摘（G07 を除く）は、今の本文の該当行を開いて閉じているか確かめた。地の文の3桁以上の数を run/ と code/ のログと照らし、見つからない数は計算で確かめた。ほかの記事を指す文は、指す先の記事が同じ記事の本文でリンクされているかを確かめた。G07 は対象外。本文の通読は、スクリプトで拾った箇所と過去の指摘の箇所に限った。
