# selection: llm-json-parse-error-fix

選んだ日: 2026-10-31

## 読んだ CSV

`keywords/` には `README.md` しか無く、CSV は1つも無い（2026-10-31 に `ls keywords/` で確認）。ラッコキーワードの CSV はまだ届いていない。

そのため、キーワードは CSV から選んでいない。`target_query` は null のままにし、検索語を作って書いていない。ゲート G10 は NG（CSV 待ち）で、記事は `status: draft` で止める。この記事を書いたのは、ワークフローの指示（CSV なしで書き進め、G10 を NG にして下書きで止める）によるもので、テーマは `content/plan.md` の #9 に従った。

## ANTHROPIC_API_KEY

`test -n "$ANTHROPIC_API_KEY" && echo set || echo unset` の結果は `unset`（2026-10-31）。値は表示もしていないし、どこにも残していない。

この記事のコードは API を呼ばない（失敗する文字列も応答の形も手で作った見本、直す関数は標準の機能だけの TypeScript）。`needs_api_key: false`。

## 既存記事との重なり（G06）

`content/articles/*.md` の frontmatter（title、main_keyword、target_query）を全件読んだ（2026-10-31）。

| slug | main_keyword | 答える検索意図 | 重なり |
|---|---|---|---|
| `mcp-server-typescript-stdio` | MCPサーバー | MCP サーバーの作り方 | なし |
| `llm-api-cost-estimate-js-tiktoken` | LLM API | リクエスト前の料金の見積もり | なし |
| `llm-api-429-retry-sdk-mock` | LLM API | 429・529 のエラーとリトライ | なし（HTTP のエラーで、JSON の読み取りは扱わない） |
| `zod-validate-llm-json-output` | 構造化出力 | JSON として読めたあとの形の検証（safeParse の issues の読み方） | なし。`content/plan.md`「重なりを避けるために決めたこと」の1つ目のとおり、あちらは「形が合っているか」、この記事は「JSON として読めるか」に答える。あちらの記事は `JSON.parse` が例外を投げる場合を1文で触れるだけで（同記事183行目）、原因と直し方は書いていない。見本の JSON も使い回していない（あちらは5つのチケットの見本、こちらは前後の文字と切れた文字列の4つ） |
| `zod-to-json-schema-tool-definition` | 構造化出力 | zod のスキーマから JSON Schema を作ってツール定義に使う | なし |

`target_query` はどの記事も null なので、検索語での突き合わせはできない。上の判断は記事の中身で行った。

## 外した候補

CSV が無いので、候補の一覧そのものが無い。講座の順番（course_step 2）とキー不要（○）は `content/plan.md` の #9 の判定をそのまま使った。

## 2026-11-10 の再確認（検証の指摘を直したとき）

- `keywords/` は今も `README.md` だけで、CSV は無い（`ls keywords/`）。`target_query` は null のまま、G10 は NG（CSV 待ち）。
- `ANTHROPIC_API_KEY` は `unset`（同じコマンド）。直した版のコードも API を呼ばない。
- `content/articles/*.md` は18本に増えていた。全件の title と main_keyword を読み直し、`main_keyword: "構造化出力"` はこの記事のほかに `zod-to-json-schema-tool-definition` と `zod-validate-llm-json-output` の2本だけで、上の表の判断のまま重ならない。ほかの15本は MCP サーバー、RAG、LLM API の料金と 429、評価、エージェントのファイル操作ツールで、`JSON.parse` の `SyntaxError` に答える記事は無い。

## 2026-11-11 追記: target_query は null のまま

- Google のサジェストを集めた CSV（`keywords/google-suggest-*.csv`）を 2026-11-11 に読んだ。この記事が答える検索に合う行は無かった。近い行はあったが、記事の中身より広い検索だったので当てはめていない。
- `target_query` は null のまま、G10 は NG のままにする。合う行が見つかるまで下書きで止める。

## 2026-11-14 追記: target_query を `llm json 出力` に決めた

- 読んだ CSV は `keywords/google-suggest-structured-output.csv`（Google のサジェストを集めた CSV。この行の `fetched_at` は 2026-11-12）。ラッコの CSV に同じ語は無かった。この CSV には検索数の列が無く、人気度は比べていない。
- この語の行は 2026-11-12 に足された行で、2026-11-11 に読んだときには CSV に無かった。だから上の 2026-11-11 の追記では合う行が見つからなかった。
- `target_query` は、CSV の「キーワード」（サジェストの CSV は `suggestion`）の列にある行と1文字も違わない値にした。一致する行が1つあることを 2026-11-14 にスクリプトで確かめた。
- 選んだ理由: LLM が返した JSON を読み込むときの SyntaxError の原因と直し方を扱う記事なので、「json 出力」を含む語が読者の探し方に最も近い。講座2（構造化出力）に属する。
- 公開後に Search Console の実測で見直す。CSV の行や件数は、ラッコの利用規約の都合でこのリポジトリには写していない（`keywords/README.md`）。

## 2026-11-15 追記（#87 の1。人気度と外した候補）

#83 で `target_query` を `llm json 出力` に決めたとき、SKILL.md:117（人気度）と SKILL.md:409（外した候補）の記録が抜けていた。その分をここに足す。`target_query` と G10 の判定は変えない。

### 人気度（SKILL.md:117）

比べていない。

- サジェストの CSV には検索数の列が無い。ラッコの書き出しの「月間検索数」も6つの CSV のすべての行で null だった。無料プランで書き出したためで、2026-11-15 にスクリプトで確かめた。
- 検索数が無いときは Google トレンドで候補を比べるのが SKILL.md:117 の手順だ。この比較の結果は取っていない。
- そのため `llm json 出力` が候補の中で検索の多い語かどうかは裏付けが無い。公開後に Search Console の実測で見直す。

### 外した候補（SKILL.md:409）

読んだのは `keywords/構造化出力.csv` と `keywords/LLM API.csv`（ラッコ）、`keywords/google-suggest-structured-output.csv`（サジェスト）。ラッコの語は利用規約の都合で語そのものを書かず、意味だけを書く（`keywords/README.md`）。サジェストの語は種と順番も書く。順番は検索回数ではない。

| 外した候補 | 外した理由 |
|---|---|
| 構造化出力と JSON を組み合わせたラッコの語 | JSON の出し方を探す語。出し方を比べるのは `structured-output-methods-compare`（`構造化出力 プロンプト`）が答える意図で、重なる（G06） |
| LLM API と JSON や JSON Schema を組み合わせたラッコの語 | API の機能で JSON を出させる方法を探す語。API を直接呼ぶ書き方が中心で、API を呼ばないこの記事とは合わない（SKILL の手順1の2の2） |
| サジェストの `構造化出力 json`（種「構造化出力」の 7 番目） | 1行目と同じく、JSON の出し方を探す語 |
| サジェストの `dify llm json 出力`（種「llm json 出力」の 2 番目） | Dify で JSON を出す方法を探す語。この記事は Dify を扱わない |
| サジェストの `zod parse json schema`（種「zod json schema」の 7 番目） | zod のスキーマの話で、`zod-to-json-schema-tool-definition` の範囲 |

JSON のパースの失敗や SyntaxError を表す語はどの CSV にも無かった（2026-11-15 にスクリプトで確かめた）。選んだ理由は 2026-11-14 の追記と同じ。LLM が返した JSON を読み込むときの失敗を扱う記事なので、「json 出力」を含む語が読者の探し方に最も近い。
