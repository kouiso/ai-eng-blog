# code: llm-api-cost-estimate-js-tiktoken

記事に載せたコードと1文字も違わない形で置いている（`lint/check-code-and-outputs.py` で照合）。

最後の実行は 2026-11-10（`run/10`〜`17`）。`run/01`〜`09` は 2026-10-31 の実行の記録。コードは 2026-10-31 から変えていない。

| ファイル | 記事の場所 | 実行ログ（2026-11-10） |
|---|---|---|
| `package.json` | 手順1 | `run/11.log`（`npm install`）。作業フォルダは `run/10.log`（`mkdir token-cost-estimate`） |
| `count.ts` | 手順2 | `run/12.log`（`node count.ts`） |
| `estimate.ts` | 手順3 | `run/13.log`（`node estimate.ts`） |
| `unknown-model.ts` | 「js-tiktoken 1.0.21 は gpt-5.6-terra の名前を知らない」 | `run/14.log`（`node unknown-model.ts`） |

記事の外で行った確認（記事の文の根拠に使ったもの）:

- `run/15.log`: `time node estimate.ts`。記事の「手元で9.2秒」の根拠（real 0m9.242s）。2026-10-31 の `run/06.log` は 8.485s だった。
- `run/07.log`（2026-10-31）: TypeScript 5.9.3 の `tsc --noEmit --strict` で3つの `.ts` を型チェック。Node.js の型の除去は型をチェックしないため、記事のコードが型として正しいことを別に確かめた。コードを変えていないので 2026-11-10 には再実行していない。
- `run/16.log`: `"type": "module"` を消した `extra/package.notype.json` を package.json にしたフォルダで `node count.ts`。`MODULE_TYPELESS_PACKAGE_JSON` の警告が出て、数えた結果は同じ（記事の手順2の末尾）。
- `run/17.log`: `unshare -rn` でネットワークの無い名前空間を作り、3つのスクリプトを実行。`fetch` は `EAI_AGAIN` で失敗し、3つの出力は 12〜14 と同じ（記事の「料金がかからない範囲」）。

実行は scratchpad の使い捨てフォルダで行い、ログの中のそのパスは `/path/to` に置き換えた。`node_modules` は残していない（実行後にフォルダごと消した）。
