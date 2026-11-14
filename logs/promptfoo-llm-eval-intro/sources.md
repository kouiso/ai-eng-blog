# sources: promptfoo-llm-eval-intro

どれも 2026-11-10 に読んだ。番号は記事の出典の表と同じ（2026-11-11 に利用条件の注意書きを消し、それだけが引いていた Legal and compliance の行を外して 13〜16 を 12〜15 に詰めた）。

| # | 題名 | URL | 確かめた事実 | 記事のどの文の根拠か |
|---|---|---|---|---|
| 1 | promptfoo（GitHub） | https://github.com/promptfoo/promptfoo | README の1行目「`promptfoo` is a CLI and library for evaluating and red-teaming LLM-based apps.」、「Promptfoo remains open source and MIT licensed.」 | リードの1文目、「1回の評価で」の MIT ライセンスと無料、`cost_estimate` |
| 2 | promptfoo（npm） | https://www.npmjs.com/package/promptfoo | `npm view promptfoo` で、`dist-tags.latest` が 0.125.1（2026-10-25 公開）、`engines.node` が `>=22.22.0`、`license` が MIT | 「Node.js 22.22.0 以上を要求」、「0.125.1 は npm の最新版」 |
| 3 | Claude Agent SDK (promptfoo) | https://www.promptfoo.dev/docs/providers/claude-agent-sdk/ | プロバイダー ID `anthropic:claude-agent-sdk`。「The Claude Agent SDK and its native CLI are not included in the default Promptfoo install.」。`apiKeyRequired` の説明「Require Promptfoo to find an Anthropic API key before calling the SDK. Set to `false` for local SDK auth.」と「the SDK still needs to be able to authenticate on its own」。既定は「runs in a temporary directory with no tools enabled」。`max_turns`「Maximum conversation turns」、`custom_system_prompt`「Replace default system prompt」。「This provider automatically caches responses」。`ANTHROPIC_API_KEY` か `apiKey` で鍵を渡せる | 「モデルを呼ぶ部分は」、install の節の1文目、`apiKeyRequired` の節、ツールなしで一時フォルダ、キャッシュ、`apiKeyRequired` の節の API キーで動かす場合の2文 |
| 4 | Reference (promptfoo) | https://www.promptfoo.dev/docs/configuration/reference/ | `defaultTest`「Sets the default properties for each test case.」、`vars`「Key-value pairs to substitute in the prompt.」、テストケースは「is fed into all prompts and providers」 | `{{inquiry}}` の節の2文 |
| 5 | Prompts (promptfoo) | https://www.promptfoo.dev/docs/configuration/prompts/ | 「Prompts use Nunjucks templating」、`label` と `raw` を持つオブジェクトの例 | `{{inquiry}}` は Nunjucks |
| 6 | Assertions and metrics (promptfoo) | https://www.promptfoo.dev/docs/configuration/expected-outputs/ | `regex`「output matches regex」、`icontains`「output contains a string or number as text, case insensitive」、`metric`「Tag that appears in the web UI as a named metric」、「Omit the test-level threshold to require every nonzero-weight assertion to pass.」 | 「形の検査と中身の検査を」の節 |
| 7 | Command line (promptfoo) | https://www.promptfoo.dev/docs/usage/command-line/ | 「By default the `eval` command will read the `promptfooconfig.yaml` configuration file in your current directory.」、`--no-share`「Do not create a shareable URL」、`-o`（jsonl を含む形式）、失敗が1件以上で終了コード 100、ほかのエラーは 1、`PROMPTFOO_FAILED_TEST_EXIT_CODE` で変更 | 設定ファイルの名前、eval のコマンドの説明、終了コード 100 の節 |
| 8 | Output formats (promptfoo) | https://www.promptfoo.dev/docs/configuration/outputs/ | JSONL は「Each line contains one JSON result」。「The top-level `success`, `score`, and `gradingResult` fields describe the aggregate result for the row.」「inspect each row's `gradingResult?.componentResults` array」。JSONL Format の節の例に `"response":{"output":"Response 1"}` がある（2026-11-10 にページと 0.125.1 の `site/docs/configuration/outputs.md` 127行目で確認）。`prompt`（`prompt.label`）と `vars` の説明は無い（ページの HTML と outputs.md を grep して `vars`、`"prompt"`、`label` の該当なし。記事361行目でそう書いた） | 「不合格の理由は results.jsonl から読む」の節 |
| 9 | promptfoo 0.125.1 の src/providers/claude-agent-sdk.ts | https://github.com/promptfoo/promptfoo/blob/0.125.1/src/providers/claude-agent-sdk.ts | `custom_system_prompt` が無いときは `systemPrompt` に `preset: 'claude_code'` を渡す（1710行目付近）。`externalCredentialProviderBypassesCache = config.apiKeyRequired === false || …` のとき `shouldReadCache: false, shouldWriteCache: false`（1802〜1841行目付近）。応答の `sessionId` は SDK の結果の `session_id`（2431行目付近）。raw.githubusercontent.com のタグ 0.125.1 で取得し、インストールした dist と同じ処理であることも確かめた | 「この行を書かないと」、`sessionId` の列、キャッシュを読まず書きもしない、増えた分は既定のシステムプロンプト |
| 10 | Telemetry (promptfoo) | https://www.promptfoo.dev/docs/configuration/telemetry/ | コマンドの実行（`eval` など）とアサーションの種類を記録して送る。「Telemetry does not include prompts, model outputs, test cases, provider API keys, or full configuration files.」。`PROMPTFOO_DISABLE_TELEMETRY=1` で止まる | テレメトリーの段落 |
| 11 | Authentication (Claude Code) | https://code.claude.com/docs/en/authentication | Pro、Max、Ultra は claude.ai のアカウントでログインできる。認証の優先順位で `ANTHROPIC_API_KEY` が7番目の subscription OAuth より上。「Run `unset ANTHROPIC_API_KEY` to fall back to your subscription」。`ANTHROPIC_API_KEY` は Agent SDK にも効く | 前提の節のログイン、`ANTHROPIC_API_KEY` が先に使われる、`unset` で外す |
| 12 | Use the Claude Agent SDK with your Claude plan | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | 「the Claude Agent SDK and `claude -p` still draw from your subscription limits」（プランでサインインしているとき） | プランの利用枠から引かれる（2か所） |
| 13 | Claude の料金プラン | https://claude.com/pricing | Pro は「$20 if billed monthly」。Free の列は Claude Code が「No」 | 前提の節の箇条書き、`cost_estimate` |
| 14 | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | `total_cost_usd` のコメントの末尾「An estimate, not a billing statement.」。`apiKeySource` のコメント「'none' (no API key in use - e.g. claude.ai OAuth login, …)」。インストールした `node_modules` の同じファイルでも同じ文を確かめた | cost は見積もりの節、`apiKeySource` が `none` の意味 |
| 15 | Node.js v22.22.0 Modules: TypeScript | https://nodejs.org/docs/v22.22.0/api/typescript.html | 履歴の表「v22.18.0 Type stripping is enabled by default.」。「To use `import` and `export` syntax, add `"type": "module"` to the nearest parent `package.json`.」 | `type` を `module` にする理由、`.ts` をそのまま `node` で実行 |

## 記事の中で、出典ではなく実行ログを根拠にした事実

| 事実 | ログ |
|---|---|
| `model: haiku` で `claude-haiku-5-5` が使われた | `run/21.log`（`costBasis=claude-haiku-5-5:list`）、`run/23.log` |
| 6件の評価、合格3件、終了コード 100、トークン数 8,185 / 7,841 | `run/17.log` |
| 2回目も合格3件、終了コード 100、トークン数 8,129 | `run/19.log` |
| `custom_system_prompt` なしで 28,013 / 27,745、合格3件 | `run/22.log` |
| `cost` の合計 0.00133430 ドル、`costBasis` が `list` | `run/21.log` |
| `apiKeySource` が `none`（init の `tools` 0 個、`mcp_servers` 0 個） | `run/23.log` |
| 設定の `strict_mcp_config` が SDK の `strictMcpConfig` に渡る（コードコメントの根拠） | インストールした promptfoo 0.125.1 の `dist/src/claude-agent-sdk-23bIVI75.js` 507行目 `strictMcpConfig: config.strict_mcp_config ?? true,`、627行目でその options を `query()` に渡す。SDK 0.3.322 の `sdk.d.ts` 2416行目 `strictMcpConfig?: boolean;`（2414行目「Maps to the CLI `--strict-mcp-config` flag.」） |
| `npm audit fix --force` が promptfoo@0.5.1 を入れる | `run/25.log`（前の実行は `run/09.log`） |
| `prompt.label`、`vars` のフィールド名（`response.output` は出典8の JSONL の例にもある） | 作業フォルダの `results.jsonl` を開いて確かめた（セッションの ID を含むのでリポジトリには置いていない）。`show-failures.ts` が実際にその名前で読めたこと（`run/05.log`、`run/18.log`）が裏付け |
