# brief: ai-agent-custom-tools-agent-sdk

## C01 の1行

TypeScript で LLM を少し触ったことがある開発者が、「AI エージェントに自作の関数をツールとして渡す方法」を探して検索したときに、Claude Agent SDK の `tool()` と zod でツールを定義し、`createSdkMcpServer()` と `mcpServers` で渡し、`tools: []` と `allowedTools` で使えるツールを絞り、ツール呼び出しの往復（`tool_use` と `tool_result`）と `isError` の届き方を実行結果つきで答える記事。

検索語（`target_query`）は G10 で確定した（`selection.md` の追記）。

## 検索意図のタイプ

やり方（How-to）。guides/01 §1 の表で、合う記事型はチュートリアル。`content/plan.md` #16 の仮の分類も「やり方」。依頼（オーナー判断を受けた書き直しの指示）で、#16 は Messages API の自作ループから、Agent SDK の `tool()` で自作ツールを渡す記事に置き換えた（slug も `ai-agent-tool-use-loop-typescript` から `ai-agent-custom-tools-agent-sdk` に変更）。

Google（日本）の上位10記事は見ていない。このセッションでは日本向けの Google 検索の結果を取得する手段を使っていない。検索意図は、仮タイトルが「自作ツールを渡す」で、手順とコードを求める人が来る前提から、やり方に決めた。

## 記事型

チュートリアル（guides/02 タイプ1）。

テンプレートの見出し骨格（guides/02 から写す）:

```
タイトル：【環境/バージョン】〇〇で△△を作る方法

リード
  - 何が作れるか（完成形を最初に見せる。画像やデモがあれば理想）
  - 対象読者（前提知識：例「Reactの基本がわかる人」）
  - 所要時間の目安

前提・環境
  - 必要なもの（Node.jsのバージョン、インストール済みパッケージ）
  - コードの全体像 or 完成リポジトリへのリンク

手順（番号付き、1ステップ1見出し）
  1. セットアップ
  2. 〇〇の実装
  3. △△の実装
  ※ 各手順に「コード」と「その時点の実行結果」をセットで
  ※ ハマりやすい所は「⚠️ ここで詰まりやすい」と補足

動作確認
  - 実際に動かした結果（スクショ or 出力）

まとめ
  - 完成したものの再確認
  - 次にやれること（発展)・関連記事へのリンク
```

この記事での見出し（内容で書く。guides/02 共通原則4）:

1. リード（何が動くか、組み込みを外して自作2つを4回呼んだ結果、プランで API キーなしに動くこと）
2. 結論（tool() → createSdkMcpServer → mcpServers → mcp__shop__get_product の流れ）
3. 前提（Node.js、プラン、ログイン、`ANTHROPIC_API_KEY` を外す）
4. セットアップ（SDK と zod を版固定で入れる）
5. コード `shop-agent.ts`（tool() の4つの引数、zod の入力定義、isError）
6. オプション（mcpServers、strictMcpConfig、tools、allowedTools、permissionMode）
7. 動作確認（4往復、is_error=true の届き方、2回目の比較）
8. ツール名の決まり（mcp__サーバー名__ツール名、ワイルドカード、キーの置き換え）
9. `tools: []` と `strictMcpConfig` を外した確認（判断の根拠）
10. 料金、締めの判断と問い、出典、次の記事

所要時間は書いていない（install と1回の実行の実測は run/04 の 37s と run/06 だが、読者の環境で変わるため）。

## 扱わないこと（依頼の指示）

- `maxTurns` と `maxBudgetUsd` の詳しい扱い（#18 `ai-agent-max-turns-budget-limit` にリンク）
- ファイル操作ツールの安全な作り方（#19 `ai-agent-safe-file-tool` にリンク）
- 別プロセスの MCP サーバー（#21 `mcp-server-typescript-stdio` にリンク）
- `query()` のメッセージの種類の読み方（#17 `claude-agent-sdk-first-agent` にリンク）
- zod から JSON Schema への変換の中身（#8 `zod-to-json-schema-tool-definition` にリンク）

## 読み終えた人ができるようになること

自分の関数を zod の入力定義つきで `tool()` にし、`createSdkMcpServer()` と `mcpServers` でエージェントに渡し、`tools: []` と `allowedTools`（`mcp__<サーバー名>__<ツール名>`）で使えるツールを自作のものに絞って、`tool_use`、`tool_result`、`is_error` を自分のコードで読める。
