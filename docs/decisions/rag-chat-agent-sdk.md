# rag-chat の答えの段を Claude Agent SDK にする（2026-11-14）

結論: `samples/rag-chat` の答えの段を、`@anthropic-ai/sdk` の Messages API から `@anthropic-ai/claude-agent-sdk` 0.3.322 の `query()` に置き換えた。`@anthropic-ai/sdk`、`ANTHROPIC_API_KEY`、`.env.example` のキーの行は、コードと README から外した。

## 理由

- オーナーの裁定（2026-11-11）: どの記事のコードも、Claude のプランで Agent SDK か `claude -p` から動かす。API キーは費用の面から使わない。
- 記事14（`rag-answer-with-citations-claude`）が同じ答えの段を `@anthropic-ai/claude-agent-sdk` 0.3.322 で書いている。特典のサンプルも同じ版・同じ方式にそろえ、記事とサンプルで読者が見る呼び出しを変えない。
- ログインのトークンを取り出して Messages API を直接呼ぶことはしない（CLAUDE.md の方針）。

## 動き

- ログインが無い（assistant メッセージの `error` が `authentication_failed`）ときは、検索の結果とコンテキストを出し、ログインの方法を1行出して exit 0 で終わる。
- テストは `query()` を差し替え、ログイン無しで通る。キーを読まないこと、`@anthropic-ai/sdk` を使わないことも `test/answer.test.ts` で確かめる。
- 料金表は外し、「Claude のプランのログインが要る」に置き換えた（出典と確認日は README）。「無料」とは書かない。

## 未確認

- 実機の実行は Claude Code のクラウドセッションで、ホストが渡した認証だった。読者の手元で `/login` したプランのログインでの実行と、実機でログインを外した状態の表示は、まだ確かめていない。
