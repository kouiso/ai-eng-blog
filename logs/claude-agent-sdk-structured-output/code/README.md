# code: claude-agent-sdk-structured-output

記事に載せたコードとコマンドを、記事に書いた形のまま置いている。

| ファイル | 記事での扱い |
|---|---|
| `classify.ts` | 1本目のコード（JSON Schema を手で書いて `outputFormat` に渡す） |
| `impossible.ts` | 2本目のコード（満たせないスキーマ。`node impossible.ts` と `MAX_STRUCTURED_OUTPUT_RETRIES=1 node impossible.ts` の2通りで実行） |
| `classify-zod.ts` | 3本目のコード（zod から `target: "draft-7"` で JSON Schema を作り、`safeParse` で読み直す） |
| `package.json` | 記事の手順（`npm init -y`、`npm pkg set type=module`、`npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 zod@4.6.7`）でできたもの。依存は `^` なし |
| `extra/run-all.sh` | 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して `run/NN.log` に残すスクリプト（記事には載せない）。第4引数で最初のログ番号を決める。1回目は既定の1で `run/01.log`〜`16.log`、直しの回は18で `run/18.log`〜`33.log` を作った |
| `extra/classify-zod-no-target.ts` | `classify-zod.ts` から `{ target: "draft-7" }` だけを外した版（1回目は `run/10.log`、直しの回は `run/27.log`。記事にはエラーの1行だけを載せた） |
| `extra/connectors-check.ts` | claude.ai のコネクタのツールが読み込まれるかを、名前を出さずに数える（記事には載せない）。1回目（`run/14.log`〜`16.log`）は `settings` の行を外した版で動かした。今の版は `strictMcpConfig: true` を付けていて、直しの回の `run/31.log`〜`33.log` は3回とも `mcp_tools=0 mcp_servers=0` |
| `extra/explore-without-settings.ts` | 探索の段階で動かした版（`settings` の行が無く、`maxTurns: 1` がある）。この実行の出力を、コネクタの名前を伏せて `run/17.log` に残した |
| `extra/tsconfig.typecheck.json` | 型の確認用（`run/11.log`、直しの回は `run/28.log`。TypeScript 7.0.2、`@types/node` 22.20.5、`strict`。記事には載せない） |

実行は 2026-11-11、macOS arm64、Node.js 22.23.4、npm 10.9.9。作業フォルダはリポジトリの外のスクラッチの領域に作り、終わったあとに消した。`node_modules` はここに置いていない。

モデルを呼ぶ実行は、オーナー自身の Claude プランでログイン済みの環境で動かした（`ANTHROPIC_API_KEY` は unset、init の `apiKeySource` は `none`）。ログには、アカウント名、メールアドレス、セッションの ID、認証情報、claude.ai のコネクタの名前を出していない。作業フォルダの絶対パスは `<work>`、型の確認用のフォルダは `<tc>`、ホームは `~` に置き換えた。

`run/10.log` と `run/27.log` の 9 行目と 10 行目は、Node.js がエラーの位置として表示した SDK の圧縮済みソース1行（127,580字）と、その下の `^` の行。中身は SDK のソースで、秘密情報ではないが、`sk-ant` などの文字列を含み秘密情報のスキャンに引っかかるので、行の長さを書いた注記に置き換えた。

`run/17.log` は `extra/run-all.sh` の前に、スクラッチで `node e1b.ts`（中身は `extra/explore-without-settings.ts` と同じ）を実行した出力から作った。出力は grep を通していたので、終了コードは取れていない。コネクタのツールの名前は数に置き換えた。

直しの回（2026-11-11。ログの `date` は UTC で 2026-11-12）: 記事の3本のコードと `extra/classify-zod-no-target.ts` の `settings` の1行（コネクタを外す設定）を `strictMcpConfig: true`（横に1行のコメント）に替え、`extra/run-all.sh <work> <run> <tc> 18` で全部動かし直した。npm は `NPM_CONFIG_USERCONFIG=/dev/null`（npm の既定の設定）で実行した。`extra/explore-without-settings.ts` は `run/17.log` を作った探索の版の記録なので、書き換えていない（動かし直してもいない）。

