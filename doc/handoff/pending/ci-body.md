TITLE: ci: check の secret-scan 手順で一覧を出し、push の before が 0 でも動くようにする

Refs #37

## 変えたこと

`.github/workflows/check.yml` の「secret-scan（0 ファイルで通さない）」手順だけを直しました。#78 のレビューの want と nit に当たります。

1. secret-scan が失敗したとき、`bash -e` が代入の行で止まって一覧が捨てられていました。`|| rc=$?` で終了コードを受け、`echo "$out"` で「ファイル:行: 種類」の一覧を出してから同じ終了コードで落とします。値はスクリプトが元から出さないので、ログに秘密は出ません。
2. push の `github.event.before` がすべて 0（新しい ref の最初の push）、または履歴に無い（force-push）ときは、0 を基準に渡しません。origin/develop との merge-base が HEAD と違えばそれ、同じなら親 commit と比べます。どちらも取れなければ落とします。「0 ファイルなら落とす」確認はそのまま残しています。

トリガー、`permissions: contents: read`、secrets の不使用、deploy なし、actions の SHA 固定、`.nvmrc` の Node は変えていません。

## 確認

- `npx --yes @action-validator/cli .github/workflows/check.yml`: 終了コード 0（エラーなし）
- 手順のシェルを bash -e で手元の一時リポジトリに流した結果:
  - push、before が実在の commit: 基準はその commit、1 file(s) scanned、終了 0
  - push、before がすべて 0: 警告を出して親 commit を基準にし、1 file(s) scanned、終了 0
  - pull_request、base.sha が実在の commit: 基準はその commit、1 file(s) scanned、終了 0
  - 補足: force-push で before が履歴に無い場合も親 commit に切り替わり終了 0。秘密らしい行を足したときは「leak.txt:1: assigned secret」の一覧が出て終了 1。before が HEAD と同じ（0 ファイル）ときは落ちる
- Node 24.22.3 で `npm ci` のあと `npm run check`: 4 手順すべて通過
- `node scripts/secret-scan.mjs origin/develop`: 1 file(s) scanned, 0 finding(s)
- push 側の本物の経路は、マージ後の Actions で初めて動きます

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01Cv4a6Hqi9gpNzM1cEZDAYQ
