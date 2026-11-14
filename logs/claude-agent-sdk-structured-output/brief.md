# brief: claude-agent-sdk-structured-output

## C01 の1行

LLM の出力をアプリで使いたい TypeScript の開発者が、「Claude に JSON を確実に返させる方法」を探して検索したときに、Agent SDK の `outputFormat` に JSON Schema を渡して `structured_output` で受け取る書き方と、スキーマを満たせないときの結果の読み分け、zod で書くときの `target: "draft-7"` を、自分の Claude プランで動かした結果つきで答える記事。

検索語は、書いた時点では CSV が無く未確定だった。2026-11-11 に `target_query: "claude 構造化出力"` を決めた（`selection.md` の追記、G10 OK）。

## 検索意図のタイプ

やり方（How-to）。`content/plan.md` #6 の仮の分類も「やり方」。guides/01 §1 の表で、合う記事型はチュートリアル。

Google（日本）の上位10記事は見ていない。このセッションでは日本向けの Google 検索の結果を取得する手段が無かった。

## 記事型

チュートリアル（guides/02 タイプ1）。テンプレートの骨格（リード、前提・環境、手順、動作確認、まとめ）を、次の見出しに当てはめた。見出しは作業の実況でなく内容で書く（guides/02 共通原則4）。

1. リード（`outputFormat` と `structured_output` の答え、プランで動かしたこと、扱う範囲）
2. 前提（Node.js、プラン、ログイン、`ANTHROPIC_API_KEY` を外す）。プランで動かしてよい範囲の節は、2026-11-11 の直しの回で消した
3. セットアップ（SDK と zod を版を固定して入れる）
4. 1本目 `classify.ts`（JSON Schema を渡すと `structured_output` に入る。`StructuredOutput` のツール。コネクタを外す設定は、2026-11-11 の2回目の直しでコードの横のコメントだけにした）
5. 2本目 `impossible.ts`（満たせないスキーマで、success なのに値が無い終わり方と、`error_max_structured_output_retries` と例外の終わり方。失敗を減らすスキーマの書き方）
6. 3本目 `classify-zod.ts`（`target: "draft-7"`、省いたときのエラー、`safeParse` で型を付ける）
7. プロンプトで頼む書き方との違い（#10 へリンク）と、問いで閉じる
8. 料金、出典、次の記事へのリンク、末尾の表記

## 読み終えた人ができるようになること

自分の Claude プランで Agent SDK の `query()` に JSON Schema を渡し、`subtype`、`is_error`、`structured_output` の3つで成功を判定して値を取り出し、zod のスキーマから作った JSON Schema でも同じことができる。
