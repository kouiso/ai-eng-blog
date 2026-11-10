# selection: mcp-server-resources-prompts

選んだ日: 2026-11-02

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-02 に `ls keywords/` で確かめた）。ワークフローの指示が CSV なしで書き進めるよう明示しているので先へ進めたが、スキル手順1のとおり次のように扱う。

- `target_query: null`
- ゲート G10 は NG（CSV 待ち）
- `status: draft`
- CSV に無い検索語は、`target_query`、`brief.md`、このファイルのどこにも作らない

## 選んだテーマ

ワークフローの指示で与えられたテーマを使った。`content/plan.md` の #24（course_step 5、MCPサーバー）。

- slug: `mcp-server-resources-prompts`
- タイトル: MCP サーバーで Resources と Prompts を公開する【ツール以外の2つの機能】
- 検索意図の仮の分類: やり方（plan.md の列。検索データではない）
- キー不要の理由（plan.md と指示）: SDK のクライアントで一覧と取得を確かめる。モデルは使わない

## 人気度

CSV が無く、検索ボリュームの列も無い。Google トレンドも、比べる候補の語が CSV から決まらないので見ていない。人気度の大小関係は「未確認」とする。

## 外した候補と理由

候補は plan.md の course_step 5 の5本。

| slug | 外した理由 |
|---|---|
| `mcp-server-typescript-stdio` | 作成済み（パイロット）。重なり |
| `mcp-server-streamable-http` | 作成済み（別のワークフロー）。重なり |
| `mcp-inspector-debug` | 作成済み（別のワークフロー）。この記事の講座で1つ前 |
| `mcp-connection-closed-fix` | 今回の指示の対象外。この記事の講座で1つ後。検索意図はエラーで、この記事（やり方）と分かれる |

## 既存記事との重なり（G06）

`content/articles/*.md` の、この記事のほかの13本の frontmatter（`title`、`main_keyword`、`target_query`）を全件読んだ（2026-11-02）。`target_query` はどれも null。

- MCP の記事は3本。パイロット `mcp-server-typescript-stdio` はツールを1つ持つサーバーを作って Claude Code に登録する記事、`mcp-server-streamable-http` は HTTP で動かす記事、`mcp-inspector-debug` は Inspector でツールを調べる記事。どれもツールだけを扱い、Resources と Prompts の登録は書いていない（3本の本文を `registerResource`、`registerPrompt`、`resources/list`、`prompts/list` で `grep` し、該当は `mcp-inspector-debug` の末尾の「次の記事」への案内1か所だけ）。
- この記事は「ツール以外の機能（Resources と Prompts）をどう登録し、どう確かめるか」に答える。ツールの作り方、stdout のログの落とし穴、`claude mcp add` の手順は繰り返さず、パイロットへのリンクに任せた。Inspector の使い方も、`resources/read` の1コマンドを見せるだけで、前の記事へのリンクに任せた。
- ほかの10本（LLM API、構造化出力、RAG、AIエージェント）は MCP の Resources と Prompts を扱っていない。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果: unset（2026-11-02）。

この記事のコードは LLM の API を呼ばない（`needs_api_key: false`）。`prompts/get` はメッセージの並びを返すだけで、モデルには送らない。
