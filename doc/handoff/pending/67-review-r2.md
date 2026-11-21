REVIEW | PR #67-branch | f9006fb | PASS

reviewer: general-purpose subagent（Opus 5.5）、round 2 of 3。このブランチのコミットは書いていない。worktree `/home/user/r67b`（f9006fb0d681ae85eb741a738ccfb09ef3af8428）、Node 24.22.3。must 0 / want 3 / nit 3

## round 1 の指摘が直ったか

| round 1 | 結果 |
|---|---|
| must 1 staging（noindex）が書かれていない | 直った。emdash-version.md の「新しいサイトは staging（noindex）で始まる」と、post-deploy.md の 1b に入った。引いている行は `npm ci` のあとに自分で確かめた。`node_modules/emdash/src/astro/routes/api/setup/index.ts:140` が `options.setIfAbsent("site:staging", true)`、`node_modules/emdash/src/components/EmDashHead.astro:128` が `stagingContributions` で、129 行目に `noindex, nofollow`、`src/layouts/Base.astro:99` が `<EmDashHead page={pageCtx} />`。「Settings > General > Site Status の Go live」「MCP の `settings_update`」「既存のサイトは影響を受けない」「robots.txt は staging のあいだキャッシュしない」は、changelog と `node_modules/emdash/src/mcp/server.ts:3829,3859`、`src/astro/routes/robots.txt.ts:63`（`no-store`）に合っている |
| want 1 17か所と19 span | 直った（emdash-version.md、local-mcp.md） |
| want 2 サイズの値が混ざっている | 直った。ファイル数、合計、messages の範囲、36 ファイル、`.map` 0 は、自分で測った値と同じ。`entrypoints_*.mjs` は nit 3 を参照 |
| want 3 本文の「だけ」と head | 直った。8ファイルを挙げていて、`git diff --stat origin/develop f9006fb` の8ファイルと同じ。head の f9006fb も書いてある |
| want 4 SKILL.md の日付 | 直った（「2026-10-31。1.5.0 での再確認は 2026-11-14」） |
| want 5 マイグレーション | 一部だけ直った。新しいマイグレーションは 096 と 097 の2つではなく6つある（下の want 1） |
| nit 1 localcheck.txt の sha | 直った（2行目に「base: origin/develop …」と書き添えてある） |
| nit 2 `@tiptap` のパッチ版が下がる | 直った（句読点が1つ崩れている。下の nit 1） |
| nit 3 SKILL.md の 1.4.0 の挙動 | 直った（「1.5.0 では未確認」） |

## must

なし。

## want

1. **docs/decisions/emdash-version.md「マイグレーション 096 と 097」と PR 本文: 1.5.0 で増えたマイグレーションは 092〜097 の6つ（want）**
   - `npm pack emdash@1.4.0` の tarball の `src/database/migrations/` は `091_redirect_artifacts.ts` で終わる。1.5.0 の `node_modules/emdash/src/database/migrations/runner.ts:102-105,201-204` は、さらに `092_plugin_kv_options`、`093_menu_item_orphans`、`094_media_usage_file_url_reindex`、`095_plugin_storage_unique_scope` を読み込んでいる。096 と 097 はその後ろ。
   - 093 は既存の行を書き換える（`UPDATE _emdash_menu_items SET parent_id = NULL …`）。095 は、changelog で「plugin storage の unique index があるサイトはメンテナンスの時間が要る」と書かれている。どちらも、空の本番 D1 で新しく流すこのサイトには影響しない。なので want にとどめた。
   - 096 と 097 の中身（`columnExists` で確かめてから列を足す、`ifNotExists`）は、書いてあるとおりだった。
   - 直し方: 見出しを「1.5.0 で増えたマイグレーション（092〜097）」にして、092〜095 を1行ずつ足す。「どちらも追加だけ」は「093 は孤立したメニュー項目を最上位に移す。空の DB では対象の行が無い」のように書き直す。PR 本文の「マイグレーション 096/097」も合わせる。

2. **docs/verification/post-deploy.md:16「手順 4 で管理者を作ってから」: 手順の番号が違う（want）**
   - OWNER_TASKS.md では、手順 4 が「すぐに管理画面を開く」、手順 5 が「最初の管理者を作る」になっている。このファイルの中にも「## 4. 変数と secret」がある。このため「手順 4」がどちらを指すのか読み取れず、指していても番号が合わない。
   - 直し方: 「OWNER_TASKS.md の手順 5 で最初の管理者を作ったあと」にする。

3. **OWNER_TASKS.md: Go live をだれがやるのかが、持ち主の手順に入っていない（want）**
   - 1b の手順は「管理画面で Go live を押す」。管理画面に入れるのは、パスキーを持つ持ち主だけ。ところが、持ち主が上から順に進める OWNER_TASKS.md の手順 5〜7 には、staging の話がまったく出てこない。
   - Claude が代わりにやるなら、コネクタの OAuth でつないだ MCP の `settings_update`（`staging: false`）を使う。emdash-version.md にはこの方法も書いてあるが、1b には書いていない。
   - 直し方は次のどちらか。ひとつは、OWNER_TASKS.md の手順 5 か 7 に「Settings > General > Site Status で Go live を押す」を1行足す。オーナーのファイルなので、この PR で変えないなら、その旨を本文に書く。もうひとつは、1b に「MCP をつないだあと Claude が `settings_update` で外す」という方法を足し、だれがやるかを決めて書く。

## nit

1. docs/decisions/emdash-version.md:120 の「（`package-lock.json` で確認、2026-11-14）。、`package-lock.json` の差分が大きいのはこのため」の「。、」が崩れている。「。`package-lock.json` の差分が…」にする。
2. emdash-version.md の出典「`@emdash-cms/*` の changelog に載る emdash の 1.5.0 の節」は、実際は emdash のリポジトリの `packages/core/CHANGELOG.md`（見出しは `# emdash`）。URL（https://github.com/emdash-cms/emdash/blob/main/packages/core/CHANGELOG.md ）を書いておくと、たどりやすい。scratchpad の CHANGELOG-core.md の 1.5.0 の節は、2026-11-14 に raw.githubusercontent.com から取った main の版と、1行も違わなかった。
3. free-tier.md の `entrypoints_*.mjs`（727,989 バイト）と、合計 17,399,624 バイトについて。自分が `/home/user/r67b` で測ると 728,228 バイト、17,399,942 バイト、`Total Upload: 16992.02 KiB / gzip: 4587.33 KiB` になった。round 1 も 728,228 だった。チェックアウト先のパスがバンドルに入るため、値が数百バイト動くのだと思う。結論（約 26%）は変わらない。「バイト数はチェックアウト先のパスで数百バイト変わる」と1文添えるとよい。

## checks（f9006fb、/home/user/r67b、Node 24.22.3）

| check | 結果 |
|---|---|
| `git diff --stat f219f78 f9006fb` | 5ファイル。`.claude/skills/write-article/SKILL.md` と、docs/ の4ファイル（decisions/emdash-version.md、verification/free-tier.md、local-mcp.md、post-deploy.md）。どれも文章だけで、コード、依存、設定は変わっていない。f219f78 で走らせたランタイムの確認を使ってよい |
| `git diff --stat origin/develop f9006fb` | 8ファイル。PR 本文の一覧と一致する |
| CLAUDE.md、AGENTS.md、docs/tech-writing-pack/、content/ | origin/develop から差分なし |
| `npm ci` | exit 0 |
| `npm run build` | exit 0（Complete!） |
| `npm run typecheck` | 0 errors / 0 warnings / 0 hints |
| `npm test` | 12 files、116 tests が通った |
| `node scripts/secret-scan.mjs origin/develop` | 7ファイルを調べ、検出0件（package-lock.json はスクリプトの SKIP の対象） |
| `npx wrangler deploy --outdir <scratch> --dry-run` | `Total Upload: 16992.02 KiB / gzip: 4587.33 KiB`。673 ファイル、`.map` 0、messages は 36 ファイル（177,339〜693,422 バイト）。64 MiB の約 26% |
| post-deploy 1b を動かせるか | 動かせる。`curl -s <URL>/ \| grep -i robots` で見る。トップは `noindex` の prop を渡していないので（`src/layouts/Base.astro:98` の `noindex` は 404 だけ）、Go live のあとは robots の meta が出なくなる。`/robots.txt` はサイトで上書きしておらず、EmDash の route が返す（staging のあいだは `no-store`、外すと `max-age=86400`）。直すのは手順の番号と担当（want 2、3） |
| changelog の書き出しと取り込みの記述 | 裏付けがある。1.5.0 の #4637 に「Once a site has run the migration, earlier EmDash versions can't export it or import into it with site transfer.」とある（CHANGELOG-core.md:154。upstream の main と同じ）。この文が指すのは 096 のマイグレーション。staging の記述は #3716（同じファイルの 156〜164 行目） |
| PR 本文 | 8ファイルを挙げていて、head の f9006fb も書いてある。数字は docs と合っている（マイグレーションは want 1） |

---
_Generated by [Claude Code](https://claude.ai/code)_
