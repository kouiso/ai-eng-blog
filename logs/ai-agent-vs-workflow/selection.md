# selection: ai-agent-vs-workflow

選んだ日: 2026-11-10

## 読んだ CSV

`keywords/` を `ls` で確かめた結果、CSV は1つも無い（`README.md` だけ）。スキル手順1の1に従えば「CSV 待ち」で止める条件に当たる。今回はワークフローの指示（CSV なしで書き進め、`target_query: null`、G10 NG、`status: draft` のままにする）で書き進めた。CSV に無いキーワードは作っていない。`target_query` は null。

## 選んだ記事とその理由

`content/plan.md` の計画表 #20（course_step 4、AIエージェント）の `ai-agent-vs-workflow` を、ワークフローの割り当てどおりに書いた。

- 人気度: CSV が無く、検索ボリュームも Google トレンドも比べていない。人気度の大小は不明（G10 と同じく CSV 待ち）。
- 講座の順番: course_step 4 の5本目（計画表 #16〜#20 の最後）。
- 検索意図: 概念（「AI エージェント ワークフロー 違い」型の、違いと使い分けを知りたい検索）。CSV が無いので、検索語は仮の分類。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（`run/02.log`）。

この記事のコードは Claude Agent SDK だけで、Messages API（`@anthropic-ai/sdk`）を呼ばない。`content/plan.md` の「キー不要」の列は「プラン」。スキルの「Claude プランで動かす記事（Agent SDK、claude -p）」の1に照らすと、検索意図は概念で、呼び出し口を問わない内容に当たる。Messages API の書き方を検索意図の中心にした記事を作り替えたものではない。

## 既存記事との重なり（G06）

`content/articles/*.md` の frontmatter（title、main_keyword、target_query）を全件（この記事のほか20本）読んだ。target_query はすべて null。

- 「ワークフロー」を本文に含むのは `ai-agent-safe-file-tool`（次の記事への予告の1文）と `mcp-server-typescript-stdio`（MCP の説明の文脈）だけで、エージェントとワークフローの違いを主題にした記事は無い。
- 近い記事との分け方。
  - `claude-agent-sdk-first-agent`（#17）は `query()` の導入とメッセージの読み分け。この記事はメッセージの種類の説明をせず、同記事へリンクする。
    - 2026-11-10 のレビューで、エージェント版のデモが #17 と重なると指摘された（同じ `tools: ["Glob","Read"]` と `allowedTools`、3ファイルを読む、num_turns=5 の内訳の説明、2回目の Glob の引数の違い）。エージェント版をワークフロー版と同じ仕事（3件の分類と返金への返信の書き出し）に書き直し、num_turns の内訳と Glob の引数の説明は外した。この記事のエージェント版が示すのは、ワークフロー版と同じ仕事を任せたときの呼び出し回数、時間、答えを確かめられる時点の違いで、#17 のメッセージの読み分けとは問いが違う。ツールの指定（Glob と Read）は、ファイルを読ませる最小の組み合わせなので #17、#18 と同じものを使い、オプションの役割は #17 へリンクする。
  - `ai-agent-max-turns-budget-limit`（#18）は上限で止まったときの結果と例外。この記事は `maxTurns` を停止条件として付けるところまでで、止まったあとの扱いは同記事へリンクする。
  - #16 `ai-agent-custom-tools-agent-sdk` は、`tool()` で作った自作ツールを Agent SDK に渡し、ツール呼び出しの流れを追う記事。この記事は自作ツールを作らず、リンクだけ置く（2026-11-11 に旧 slug `ai-agent-tool-use-loop-typescript` から差し替え。旧記事は無い）。

外した候補: なし（割り当ての1本を書いた）。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-ai-agent.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: エージェントとワークフローの違いを、手順を決めるのがコードか LLM かで説明する記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
