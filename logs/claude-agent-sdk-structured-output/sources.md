# sources: claude-agent-sdk-structured-output

番号は記事の出典の表と同じ。アクセス日はどれも 2026-11-11。取得は fetch（Markdown 版のあるページは `.md` の URL）で行い、該当箇所を読んだ。

| # | URL | 題名 | 確かめた事実 | 記事で使った文 |
|---|---|---|---|---|
| 1 | https://code.claude.com/docs/en/agent-sdk/structured-outputs | Get structured output from agents | `outputFormat`（`type: "json_schema"`、`schema`）を渡すと結果の `structured_output` に検証済みの値が入る。不一致ならモデルに作り直させる（re-prompting on mismatch）。`enum`、`const`、`required`、入れ子、`$ref` に対応。SDK は draft-07 で検証し、新しい版を宣言したスキーマは拒否する。zod は既定が 2020-12 なので `target: "draft-7"` を渡す。不正なスキーマは起動時に失敗する（v2.1.205 以降）。`format` は注記として受け付け、検証しない。`StructuredOutput` というツールを Claude Code が足し、init の `tools` に出る。答えは `tool_use` でなく `structured_output` から読む。ツールの表示から `StructuredOutput` を外すよう勧めている。成功の判定は `subtype === "success"`、`!is_error`、`structured_output` がある、の3つ。`error_max_structured_output_retries` の意味。1回きりの `query()` は失敗の結果のあとに例外を投げる。深い入れ子と多い必須項目は満たしにくい。情報が無いかもしれない項目は任意にする | 51、180〜190、194、243、289〜301、354〜368、374行目付近 |
| 2 | https://code.claude.com/docs/en/agent-sdk/troubleshooting | Troubleshooting (Agent SDK) | 「structured_output is None but the result says success」の節。`subtype: "success"` で `structured_output` が無い結果を失敗として扱う。原因の候補に、満たせないスキーマ（例 `minLength` が `maxLength` より大きい）とモデルが断った場合 | 268行目 |
| 3 | https://unpkg.com/@anthropic-ai/claude-agent-sdk@0.3.322/sdk.d.ts | @anthropic-ai/claude-agent-sdk 0.3.322 の型定義 sdk.d.ts | `JsonSchemaOutputFormat = { type: 'json_schema'; schema: Record<string, unknown> }`、`OutputFormatType = 'json_schema'`（1123、2573行目）。`SDKResultError.subtype` に `error_max_structured_output_retries`、`errors: string[]`（6030行目付近）。`structured_output?: unknown`（6202行目）。`apiKeySource` の `'none'` は API キーを使っていない（claude.ai の OAuth など。6349行目）。`total_cost_usd` は「An estimate, not a billing statement」。`Options.strictMcpConfig?: boolean` は `mcpServers` で渡した MCP サーバー（と明示した `agents` の分）だけを使い、ほかの MCP の設定を無視する。CLI の `--strict-mcp-config` に当たる（2416行目付近） | 178、180、287、366、382行目付近（194行目のコネクタの段落は 2026-11-11 の2回目の直しで消した。`strictMcpConfig` の説明はコードの横のコメントだけになった） |
| 4 | https://code.claude.com/docs/en/env-vars | Environment variables (Claude Code) | `MAX_STRUCTURED_OUTPUT_RETRIES` は `-p` の `--json-schema` の検証に失敗したときに許す回数。既定5（最初の1回と再試行4回） | 272、274行目 |
| 5 | https://zod.dev/json-schema | JSON Schema（Zod） | `z.toJSONSchema()` の `target` は既定が `"draft-2020-12"`。`"draft-7"`（`"draft-07"`）を受け付ける | 354行目 |
| 6 | https://code.claude.com/docs/en/authentication | Authentication (Claude Code) | 「Authentication precedence」。サブスクリプションがあっても `ANTHROPIC_API_KEY` があればキーが使われる。`unset ANTHROPIC_API_KEY` でサブスクリプションに戻る | 63、65、75行目 |
| 7 | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | Use the Claude Agent SDK with your Claude plan | 「when you're signed in with your Claude plan, the Claude Agent SDK and claude -p still draw from your subscription limits」（記事の article 要素から読んだ） | 380行目 |
| 8 | https://claude.com/pricing | Claude の料金プラン | Pro は「$20 if billed monthly」。Pro の機能一覧に Claude Code がある。Free の一覧には無い。Max は「Everything in Pro, plus」、Ultra は「Everything in Max, plus」で、機能の比較表の「Claude Code」の行は Free が No、Pro、Max、Ultra が Yes（2026-11-11 に開き直して確かめた） | 62、384行目、`cost_estimate` |
| 9 | https://nodejs.org/docs/v22.22.0/api/typescript.html | Node.js v22.22.0 Modules: TypeScript | 履歴「v22.18.0 Type stripping is enabled by default」 | 61行目 |

## 実行で確かめた事実（出典ではなくログが根拠）

2026-11-11（ローカルの日付。ログの `date` は UTC で 2026-11-12）に、コードのコネクタを外す設定を `strictMcpConfig: true` に替えて全部動かし直した（`run/18.log`〜`33.log`）。記事の数字はこの回のログから写した。1回目（`run/01.log`〜`17.log`）は残してある。

- init の `tools` が `["StructuredOutput"]`、`apiKeySource=none`、`num_turns=2`（`run/23.log`。1回目は `run/06.log`）
- 満たせないスキーマで、既定の設定のまま3回動かし、3回とも `success` で `structured_output` が無い。不一致は2回ずつ、`num_turns=4`（`run/24.log`、`29.log`、`30.log`）。1回目の3回（`run/07.log`、`12.log`、`13.log`）は不一致が3回ずつ、`num_turns=5` だった。出し直しをやめるまでの回数は回によって変わる。1回目と直しの回の違いは、コネクタを外す設定の書き方だけ。回数が違った理由は確かめていない。記事の260〜266行目はこの6回の分布をそのまま書いている（2回目の直し）
- 既定の `MAX_STRUCTURED_OUTPUT_RETRIES` のままで5回まで試す動きは、SDK では見ていない（既定の設定で動かした6回は、どれも不一致2回か3回でモデルが出し直しをやめた）。記事の272行目にそう書いた
- `MAX_STRUCTURED_OUTPUT_RETRIES=1` で `error_max_structured_output_retries`、`errors` に最後の理由、そのあと例外（`run/25.log`。1回目の `run/08.log` と同じ出力）。公式の表は `claude -p` の説明だが、SDK でも同じ上限になった
- zod の既定の `toJSONSchema()` では起動時にプロセスが終了コード1で止まる（`run/27.log`。1回目は `run/10.log`）
- 記事の手順の `npm install` は、2回目は `added 105 packages, and audited 106 packages`（`run/21.log`）。1回目の `added 3 packages`（`run/04.log`）は、ユーザーの `~/.npmrc` の `legacy-peer-deps=true` で peer の依存が入らなかった回と見ている（推定。2026-11-11 に同じ install を `--dry-run` で比べると、`~/.npmrc` ありで `added 10 packages`、`NPM_CONFIG_USERCONFIG=/dev/null` で `added 112 packages` と差が出た。数は本番の install と一致しないので推定のまま。2回目は `NPM_CONFIG_USERCONFIG=/dev/null` で npm の既定の設定のまま実行）。読者の既定の npm に近い2回目の出力を記事に載せた
- `strictMcpConfig: true` の版の `extra/connectors-check.ts` を3回動かし、3回とも `mcp_tools=0 mcp_servers=0`（`run/31.log`〜`33.log`）
- 2026-11-11 の2回目の直しで、記事から「`tools: []` だけの設定では、コネクタのツールが800個読み込まれた回がありました」の段落を消した（スキルの「守ること」6、理由はコードの横のコメントだけにする）。下はその記録として残す。旧根拠: 設定の行が無く `maxTurns: 1` を足した版で、init の `tools` が801個（800個は17個のコネクタ）、モデルがコネクタのツールを呼んで許可エラー（`run/17.log`、名前は伏せた）。同じく設定の行を外した `connectors-check.ts`（1回目の版）の3回は、コネクタのツール0個（`run/14.log`〜`16.log`）
