TITLE: docs: 1.5.0 の移行の説明と post-deploy の noindex 確認を直す

Refs #67 #82

#82（EmDash 1.5.0）のレビューで見つかった文書の誤り3件を直します。#82 のマージ後の main に対する差分です。

## 変更

1. `docs/decisions/emdash-version.md`: 「既存の行を書き換えるのは 093 だけ」は誤りでした。`node_modules/emdash/src/database/migrations/` で確かめた結果は次のとおりです。
   - 093: `UPDATE _emdash_menu_items`
   - 094: `UPDATE _emdash_media_usage_index_status`（必要な表が無ければ何もしない）
   - 095: `_plugin_indexes` の `DELETE` と `INSERT`
   - 092 は `options` への `INSERT` のみ。096、097 に `UPDATE`/`DELETE` は無い。

   要約を 093、094、095 の3つに直しました。結論（空の本番 D1 では 092〜095 は対象の行が無く、何もしないまま通る）は、いずれも対象の表や行が空なら何もしないので変わりません。
2. 同じファイル: `EmDashHead.astro:128-129` の参照の閉じ括弧が足りなかったので閉じました。
3. `docs/verification/post-deploy.md` 手順 1b: `curl -s <URL>/ | grep -i robots` は HTTP 500 や接続失敗でも通ってしまうので、`code=$(curl -sS -o page.html -w '%{http_code}' <URL>/) && [ "$code" = 200 ] && ! grep -qi 'noindex' page.html && echo OK` に置き換えました。`/robots.txt` とキャッシュの確認はそのままです。

## curl の確認結果

`npm run build` のあと `npx wrangler dev --local --var EMDASH_SITE_URL:http://localhost:8787` で確かめました（Node v24.22.3）。確認のあと wrangler は止めています。

```
--- 正しいポート (8787), 200 で noindex なし
OK
exit=0 code=200

--- 間違ったポート (8799)
curl: (7) Failed to connect to localhost port 8799 after 0 ms: Couldn't connect to server
exit=7 code=000        # OK は出ない

--- 存在しないページ (404)
exit=1 code=404        # OK は出ない

--- 本文に noindex がある場合 (page.html に <meta name="robots" content="noindex, nofollow"> を置いて grep 部分だけ実行)
noindex-body exit=1    # OK は出ない
```

注意: ローカルの DB はセットアップ前だったため、`/` は staging の noindex を出しませんでした。noindex を含む本文の失敗は、実際のページではなく手で置いた本文で確かめています。

## チェック

- `npm run check`: 通過（secret-scan 0 件）
- `npm run check:samples`: 通過
- 2回目の修正: 093 の箇条書きに残っていた「`UPDATE` で書き換えるのはこの移行だけ」を外し、まとめの段落に誘導しました。手順 1b の curl は本文を `mktemp` の一時ファイルに書いて消すようにし、3xx では `OK` が出ないことを注記しました。`OK` が出る条件（200 で `noindex` なし）は変えていません。一時ファイル版も、200 は `OK`、閉じたポートと 404 は `OK` なしで確かめました。
- 変更は上の2ファイルのみ。CLAUDE.md、AGENTS.md、`docs/tech-writing-pack/`、`content/` は触っていません。

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01Cv4a6Hqi9gpNzM1cEZDAYQ
