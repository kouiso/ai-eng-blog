REVIEW | reviewer: general-purpose subagent, Opus 5.5 medium | authored no commit on this PR | head f95abae7db670327fb4fa0fd2ef3c117cad818ec | axes: pass line, design, scope, tests, body vs diff, evidence | verdict FAIL | must 1 want 5 nit 3

## must

1. **docs/decisions/emdash-version.md:110（結論）と docs/verification/post-deploy.md: 1.5.0 で新しく作るサイトが staging（全ページ `noindex, nofollow`）で始まることが、どこにも書かれていない（must）**
   - 1.5.0 のセットアップは `site:staging` を true にする（`node_modules/emdash/src/astro/routes/api/setup/index.ts:140` の `options.setIfAbsent("site:staging", true)`）。`EmDashHead` は staging のあいだ `<meta name="robots" content="noindex, nofollow">` を出す（`node_modules/emdash/src/components/EmDashHead.astro:128`）。このサイトは `src/layouts/Base.astro:99` で `EmDashHead` を使っているので、全ページが対象になる。
   - このブランチのローカル確認でも出ている。`scratchpad/pr67/p.html` に `<meta name="robots" content="noindex, nofollow">` がある。
   - 本番の D1 は空なので（README:110）、deploy してセットアップを通すと、本番のサイトは staging で始まる。検索から読者を集めるブログにとって、版を上げたことで本番の挙動が変わる点はここだけ。#66 の `docs/decisions/markdown-conversion.md:153` はこの点を挙げていたが、この PR は引き継いでいない。
   - 直し方: emdash-version.md の 1.5.0 の節に「新しいサイトは staging（noindex）で始まる。ローカルの新しい DB でも出た」と、確かめた日付を書く。post-deploy.md には、セットアップのあとで staging を外し、`<meta name="robots"` が無いことを確かめる項目を足す。docs だけの直しで済む。

## want

1. **docs/decisions/emdash-version.md:154,158 / docs/verification/local-mcp.md:10: #67 の合格条件の「`_` の17か所」と、PR の「19 span」の対応が書かれていない（want）**。#66（markdown-conversion.md:12,60,173）は「10本で17か所」と数えている。この PR は同じ10本で「19 span」と数えている（em140.txt）。85=85 の一致と em 0 で中身は満たしているが、合格条件の数と照らせない。単位が違う（箇所と span。1か所が2 span に割れるところがある）ことを1文書くと、照らせるようになる。
2. **docs/verification/free-tier.md:39: 同じ文の中に、測り直した値と古い値が混ざっている（want）**。673 ファイル、17,399,624 バイトは 1.5.0 で測り直した値。一方、`chunks/entrypoints_*.mjs`（698,327 バイト）と `messages-*.mjs`（約 540〜630 KB）は 1.4.0 のときの値のまま。f95abae で `--outdir` に出し直すと、`entrypoints_*.mjs` は 728,228 バイト、最大の `messages-*.mjs` は 693,422 バイトだった。測り直した値に揃えてほしい。
3. **PR の本文: 概要と実際の差分が食い違っている。確かめた head も書かれていない（want）**。概要は「変更は package.json、package-lock.json、README の版とバンドルの行、docs/decisions/emdash-version.md の新しい節だけです」と書いている。しかし差分には SKILL.md、local-mcp.md、free-tier.md も入っている（下の「追加の更新」には書いてある）。「だけ」をやめて7ファイルを挙げる。あわせて、確かめた head を書く。チェックは f219f78 で走らせ、f95abae は docs だけの変更、の形で。
4. **.claude/skills/write-article/SKILL.md:235: 根拠の日付が古いまま（want）**。変換の説明には 1.5.0 と 2026-11-14 が入った。しかし同じ項目の末尾は「根拠はローカルでの検証記録 `docs/verification/local-mcp.md`（2026-10-31）」のままになっている。#67 の「確かめた版と日付に合わせて直す」に沿って、「（2026-10-31。1.5.0 での再確認は 2026-11-14）」とする。
5. **docs/decisions/emdash-version.md（1.5.0 の節）: 増えたマイグレーション2つが書かれていない（want）**。中身は `096_revision_kind_and_editors`（`revisions` に `kind`、`edited_by` の列を足す。列が無いときだけ足す）と、`097_room_storage`（`_emdash_rooms` と `_emdash_room_updates` を `ifNotExists` で作る）。どちらも追加だけで、seed（`seed/seed.json`）にも空の本番 D1 にも影響しない。新しい DB では、ほかのマイグレーションと一緒に流れるだけ。この判断と、1.4.0 以前とのサイト移行（書き出しと取り込み）ができなくなる点（changelog）を、「戻すとき」の前に2〜3行で書くとよい。

## nit

1. `scratchpad/pr67/localcheck.txt` の2行目は `3fc54e1`（#69 のマージコミット）で、最後のまとめの `head f219f78` と合わない。何の sha かを書き添えるか、消す。
2. emdash-version.md の「入れ方」の段落: `@tiptap/*` の入れ子の 3.32.0 は、最上位にあった 3.32.2 の45エントリを消して置き換えたもの。emdash 1.5.0 と `@emdash-cms/admin` 1.5.0 が 3.32.0 ちょうどに固定しているため（`package-lock.json` で確認）。パッチ版が下がる、と1語添えると読み違えない。
3. SKILL.md:236 の「EmDash 1.4.0 は記事を書いたあとで term を引き…」は 1.4.0 での記述で、1.5.0 では確かめ直していない（1.5.0 で確かめたのは既存の term だけ）。「1.5.0 では未確認」と添える。

## 軸ごとに見たもの

- **pass line（#67 本文）**: Node 24 で npm ci、型、ビルド、テスト、dry-run が通り、無料枠に収まる。ここは手元で再現した。新しい DB のタグ6つとサンプル記事0件、local-mcp の作成・予約・cron での公開、表69個、セルの中のコード151個、`_`（em 0、85=85）、コードを含むリンク2か所、ソフトな改行（不一致0、`br` 0）は、localcheck.txt と 67-f95abae-localcheck.png で確かめた。390 と 1440 の画面は 67-f219f78-*.png と shots/measure.json（`scrollWidth` と `clientWidth` が一致、表のラッパーは `overflow-x:auto`）で確かめた。SKILL.md と local-mcp.md を版と日付に合わせる項目も満たしている（日付の取りこぼしは want 4）。17 と 19 の数の違いは want 1。
- **design**: 版の変更だけで、変換スクリプトには切り替えていない。#66 の B 案どおり。版を上げたことで本番の挙動が変わる点（staging）が抜けているのが must 1。
- **scope**: package.json は `emdash` と `@emdash-cms/cloudflare` の2行だけが変わり、どちらも 1.5.0 に固定されている。ロックファイルの版の変化は12件で、どれも emdash の系列が求めるもの。`@cloudflare/kumo` 2.15.0 は admin、blocks、cloudflare が固定で要求している。`@tiptap/y-tiptap` 3.2.0 は emdash と admin が固定で要求している。最上位に足された8件（d3-geo、d3-array、internmap、cn、proper-lockfile、graceful-fs、retry、signal-exit）は kumo 2.15.0 と emdash の依存。関係のない版のずれは無く、作り直しは最小限（11エントリだけ消して `npm install`、`--force` なし）と判断した。CLAUDE.md と AGENTS.md は変わっていない（CLAUDE.md:64 の 1.4.0 はオーナーの PR に残す方針のとおり）。記事の作業は混ざっていない。
- **tests**: 手元（`/home/user/w67r`、f95abae、Node 24.22.3）で再現した。`npm ci` exit 0、`npm run typecheck` は 0 errors / 0 warnings / 0 hints、`npm test` は 12 ファイル・116 テストが通った。`npm run build` exit 0。`wrangler deploy --dry-run` は `Total Upload: 16992.02 KiB / gzip: 4587.38 KiB` で、記録の 16991.71 KiB との差 0.31 KiB はチェックアウト先のパスの長さの違いと判断した。無料枠 64 MiB の約 26%。
- **body vs diff**: want 3 のほかは、数字（16991.71 KiB、116 テスト、69、151、19→0、85、72 ツール、ポート 8767）が docs と localcheck.txt に合っている。
- **evidence**: 67-f95abae-localcheck.png は「checks on f219f78（f95abae は docs だけ）」と head を名指している。`git diff f219f78 f95abae` が docs の3ファイルだけであることも確かめたので、f219f78 の結果を使ってよい。

---
_Generated by [Claude Code](https://claude.ai/code)_
