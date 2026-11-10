# マージ前の証跡（PR #4、2026-11-10）

## 画面
| ファイル | 何を示すか |
|---|---|
| `hero-1280.png` | 幅 1280px のトップ。見出しが句の切れ目で折り返り、「まで。」だけの行が無い |
| `hero-1024.png` | 幅 1024px。同じく3行で、句の途中で切れない |
| `hero-390.png` | 幅 390px（スマートフォン）。4行で、横スクロールが無い（scrollWidth 390） |

## 確認結果（ローカルで実行した、CI と同じ内容の確認）
- `npm ci` → 成功
- `npm run build` → `[build] Complete!`
- `npm run typecheck` → `Result (42 files): 0 errors / 0 warnings / 0 hints`
- `npm test` → `Test Files 8 passed (8) / Tests 101 passed (101)`
- `npx wrangler deploy --dry-run` → `Total Upload: 16066.86 KiB`（Free の上限 64 MiB に収まる）
- `samples/rag-chat` → テスト 7 件が合格 / `samples/mcp-server` → テスト 11 件が合格、`E2E OK`
- `npm run secret-scan` → 検出 0 件
- Playwright（`wrangler dev --local`、空の DB）
  - `/` → 200
  - 講座のリンク 6 件と `/posts` のタグ 7 件 → どれも 200 で「まだ記事がありません」と表示
  - 存在しないタグ → 404
  - 別のサイトから登録フォームに送信した場合
    - JS から → 403 とメッセージを返す
    - JS 無しのフォーム送信 → 303 で `/?subscribe=forbidden#gift` に戻し、メッセージを表示
  - 登録結果を表示する `role="status"` の要素は、送信前から存在する（`hidden` 属性が無い）

## 独立レビュー（別人格のエージェント）
- 判定は MERGE OK。CRITICAL と HIGH は 0 件
- テストのミューテーション検査: 18 か所の条件を1つずつ壊したところ、18 か所すべてで少なくとも1つのテストが失敗した
- MEDIUM の指摘 3 件は修正済み: 403 のときのメッセージ、status 要素、WAF の手順
- WAF のレート制限は独自ドメインに移すまで作れない（`*.workers.dev` は Cloudflare のゾーンのため）。`post-deploy.md` に未実施として記録した

## まだ確かめていないこと
- 本番へのデプロイ、本物の Turnstile キー、スクリーンリーダーでの実際の読み上げ
- 記事の下書き 17 本の敵対レビュー（どれも `status: draft` のままで公開しない。ゲートの記録は各 `logs/<slug>/gate.md`）
