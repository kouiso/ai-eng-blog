# selection: mcp-inspector-debug

選んだ日: 2026-11-02

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-02 に `ls keywords/` で確かめた）。ワークフローの指示が CSV なしで書き進めるよう明示しているので先へ進めたが、スキル手順1のとおり次のように扱う。

- `target_query: null`
- ゲート G10 は NG（CSV 待ち）
- `status: draft`
- CSV に無い検索語は、`target_query`、`brief.md`、このファイルのどこにも作らない

## 選んだテーマ

ワークフローの指示で与えられたテーマを使った。`content/plan.md` の #23（course_step 5、MCPサーバー）。

- slug: `mcp-inspector-debug`
- 仮タイトル: MCP Inspector で MCP サーバーを調べる【ツール一覧と呼び出しを画面と CLI で】
- 検索意図の仮の分類: やり方（plan.md の列。検索データではない）

## 人気度

CSV が無く、検索ボリュームの列も無い。Google トレンドも、比べる候補の語が CSV から決まらないので見ていない。人気度の大小関係は「未確認」とする。

## 外した候補と理由

候補は plan.md の course_step 5 の5本。

| slug | 外した理由 |
|---|---|
| `mcp-server-typescript-stdio` | 作成済み（パイロット）。重なり |
| `mcp-server-streamable-http` | 別のワークフローの担当。この記事の講座で1つ前。書いている間に原稿（`status: draft`）が置かれた |
| `mcp-server-resources-prompts` | この記事の講座で1つ後。今回の指示の対象外 |
| `mcp-connection-closed-fix` | 今回の指示の対象外。検索意図はエラーで、この記事（やり方）と分かれる |

## 既存記事との重なり（G06）

`content/articles/*.md` の11本の frontmatter（`title`、`main_keyword`、`target_query`）を全件読んだ（2026-11-02）。`target_query` はどれも null。

- いちばん近いのはパイロット `mcp-server-typescript-stdio`。パイロットは「MCP サーバーを作り、SDK のクライアントで確かめ、Claude Code に登録する」記事で、サーバーを確かめる道具は自分で書いた `check.ts`。この記事は「作ったサーバーを MCP Inspector（公式の開発ツール）で調べる」記事で、答える検索の意図（Inspector の使い方）が違う。
- 重なりを避けるため、この記事ではサーバーの作り方（`registerTool` の書き方、`Intl.Segmenter` の数え方、stdout のログの落とし穴）を繰り返さず、パイロットへのリンクに任せた。
- `mcp-connection-closed-fix`（plan.md #25）とは、`Connection closed` の1例を見せるところだけ接する。この記事は Inspector の終了コードの読み方として1例を見せるだけで、原因の切り分けは #25 へのリンクに任せた。
- ほかの9本（LLM API、構造化出力、RAG、AIエージェント）は MCP の Inspector を扱っていない。
- 書いている間に `content/articles/mcp-server-streamable-http.md`（`status: draft`）が増えた。2026-11-02 に frontmatter と本文の `Inspector` を確かめた。HTTP でサーバーを動かす記事で、Inspector は次の記事（この記事）への案内の1か所だけに出る。重なりは無い。

### 2026-11-10 の読み直し

`content/articles/` は20ファイルになっていた（この記事のほかに19本。2026-11-10 に `ls content/articles | wc -l` で20）。19本の frontmatter（`title`、`main_keyword`、`target_query`、`course_step`、`prev`、`next`、`status`）を全件読み直した。`target_query` はどれも null、`status` はどれも `draft`。本文に `Inspector` が出るのは次の3本だけ（`grep -c -i inspector`）。

- `mcp-server-resources-prompts`（1行目から読んだ見出し: Resources と Prompts の登録、SDK のクライアントでの確認、Claude Code での呼び出し）。答える意図は Resources と Prompts の公開で、この記事（Inspector の使い方）と分かれる。Inspector は H3「Inspector の CLI でも同じ要求を送れる」（384行目）で `resources/read` を1回送るだけで、`prev: "mcp-inspector-debug"` と88行目のリンクでこの記事に任せている。
- `mcp-connection-closed-fix`（見出し: Connection closed の意味、確認用のクライアント `check.ts`、原因1〜3、ほかの文面、確かめる順番）。答える意図は `Connection closed` のエラーの直し方（トラブル解決）。原因2（303行目）で `Cannot find module` を扱い、この記事の手順4のファイル名の誤り（`servr.ts`）と同じ例が出る。この記事はその例を終了コード1の読み方として1回見せるだけで、原因の切り分けは382行目のリンクで向こうに任せている。向こうは445行目でこの記事にリンクしていて、Inspector の使い方は書いていない（`Inspector` の出現は445行目の1行だけ）。重なりは1例が接するところだけで、検索意図は重ならない。
- `mcp-server-streamable-http`（frontmatter 13行目の `next` と、615行目の次の記事への案内の2か所）。上と同じく重なりは無い。
- ほかの16本（LLM API、構造化出力、RAG、AIエージェント、LLM 評価）は `Inspector` が0回で、MCP Inspector を扱っていない。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果: unset（2026-11-02）。2026-11-10 にもう一度確かめ、unset。

この記事のコードは LLM の API を呼ばない（Inspector がサーバーを直接呼ぶ）ので、キーが無くても全部を実行できる（`needs_api_key: false`）。

## 2026-11-11 追記: target_query を決めた

- 読んだ CSV は `keywords/google-suggest-mcp-server.csv`（Google のサジェストを集めた CSV。列は `suggestion,seed_query,rank,fetched_at`）。ラッコキーワードの CSV は届いていない。最初の回はサジェストの CSV で選ぶ、というオーナーの裁定（2026-11-11）に従った。
- `target_query` は、この CSV の `suggestion` の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-11 にスクリプトで確かめた。
- 選んだ理由: MCP Inspector を画面と CLI で使う手順を示す記事です。
- この CSV に検索ボリュームは無い。人気度は比べていない。公開後に Search Console の実測で見直す。
- ほかの29本の `target_query` と重なっていないことを、同じスクリプトで確かめた。
