# selection: mcp-connection-closed-fix

選んだ日: 2026-11-02

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-11-02 に `ls keywords/` で確かめた）。ワークフローの指示が CSV なしで書き進めるよう明示しているので先へ進めたが、スキル手順1のとおり次のように扱う。

- `target_query: null`
- ゲート G10 は NG（CSV 待ち）
- `status: draft`
- CSV に無い検索語は、`target_query`、`brief.md`、このファイルのどこにも作らない

## 選んだテーマ

ワークフローの指示で与えられたテーマを使った。`content/plan.md` の #25（course_step 5、MCPサーバー）。

- slug: `mcp-connection-closed-fix`
- タイトル: MCP サーバーにつながらない（Connection closed）原因と直し方
- 検索意図の仮の分類: エラー（plan.md の列。検索データではない）

## 人気度

CSV が無く、検索ボリュームの列も無い。Google トレンドも、比べる候補の語が CSV から決まらないので見ていない。人気度の大小関係は「未確認」とする。

## 外した候補と理由

候補は plan.md の course_step 5 の5本。

| slug | 外した理由 |
|---|---|
| `mcp-server-typescript-stdio` | 作成済み（パイロット）。重なり |
| `mcp-server-streamable-http` | 作成済み（`status: draft`）。重なり |
| `mcp-inspector-debug` | 作成済み（`status: draft`）。重なり |
| `mcp-server-resources-prompts` | この記事の講座で1つ前。今回の指示の対象外 |

## 既存記事との重なり（G06）

`content/articles/*.md` の13本の frontmatter（`title`、`main_keyword`、`target_query`）を全件読んだ（2026-11-02）。`target_query` はどれも null。

- パイロット `mcp-server-typescript-stdio` はサーバーを作る記事（やり方）。stdout にログを書いたときの挙動の節がある。この記事はその節を繰り返さず、1文とリンクに任せた（plan.md の「重なりを避けるために決めたこと」の #25 の行に従った）。
- `mcp-inspector-debug` は Inspector の使い方の記事（やり方）。終了コードの読み方として `Connection closed` の1例（ファイル名の誤り）を見せ、ほかの原因はこの記事へリンクしている。この記事は原因の切り分けに答える（エラー）。Inspector の読み方はリンクに任せた。
- `mcp-server-streamable-http` は HTTP でサーバーを動かす記事。この記事は stdio の接続の失敗だけを扱う。
- ほかの10本（LLM API、構造化出力、RAG、AIエージェント）は MCP の接続の失敗を扱っていない。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果: unset（2026-11-02）。記事を直した 2026-11-10 にも unset。

この記事のコードは LLM の API を呼ばない（SDK のクライアントと Claude Code の `claude mcp` でサーバーを直接起動する）ので、キーが無くても全部を実行できる（`needs_api_key: false`）。
