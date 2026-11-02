# code: ai-agent-safe-file-tool

記事 `content/articles/ai-agent-safe-file-tool.md` に載せたコードを、記事と1文字も違わない形で置いています（`../lint/check-code-and-outputs.py` で確かめています）。

- `package.json`、`setup.ts`、`naive-tool.ts`、`try-naive.ts`、`safe-file-tools.ts`、`try-safe.ts`、`naive-write.ts`、`tools.ts`、`try-tools.ts`: 記事のコードブロックそのものです。依存パッケージはありません。
- `extra/run-all.sh`: 記事の手順どおりに作業フォルダを作り、記事のコマンドを1つずつ実行して `../run/NN.log` に残すスクリプトです。作業場所はリポジトリの外（一時フォルダ）で、ログのパスは `<work>`、`<code>` に置き換えています。
- `extra/tsconfig.typecheck.json`: TypeScript 7.0.2 で型を確かめる設定です。`@types/node` 22.20.5 は記事の作業フォルダとは別の一時フォルダに入れました（`../run/` の型の確認のログ）。
- `extra/hard-link.ts`、`extra/dotdot-name.ts`: 記事の説明の裏付けに使った確認用のコードで、記事には載せていません。
