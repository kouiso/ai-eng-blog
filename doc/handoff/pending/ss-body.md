TITLE: docs(skill): キーワード選定の優先順をラッコ先・サジェスト後に揃える

Refs #83 #87

## 概要

`.claude/skills/write-article/SKILL.md` の111行目が、「最初の回はサジェストの CSV だけで選んでよい」という古い書き方のまま残っていました。#83 以降、CLAUDE.md の43行目と `keywords/README.md` の9行目は「ラッコの CSV を先に使い、合うキーワードが無い記事だけサジェストで選ぶ」です。SKILL.md の111行目をこれに揃えます。変更は選定の優先順だけです。

CLAUDE.md:43（原文のまま）:

> | `keywords/google-suggest-*.csv` | Claude が集めた Google のサジェストの CSV。ラッコの CSV に合うキーワードが無い記事はこれで選ぶ。どちらもコミットしない |

## 変更前後（SKILL.md:111 の該当文のみ）

変更前:

> 最初の回は、ラッコの CSV が無くてもサジェストの CSV だけで選んでよい（オーナーの裁定 2026-11-11「最初はサジェストくらいのワードで反応見てみるのもありかな」）。

変更後:

> 選ぶ順は、先にラッコの CSV を使い、ラッコの CSV に合うキーワードが無い記事だけサジェストの CSV で選ぶ（CLAUDE.md の「どこに何を置くか」の表と同じ。`keywords/README.md` も同じ）。以前は「最初の回は、ラッコの CSV が無くてもサジェストの CSV だけで選んでよい（オーナーの裁定 2026-11-11「最初はサジェストくらいのワードで反応見てみるのもありかな」）」としていたが、この優先順に置き換えた。

2026-11-11 のオーナーの発言は、以前の規則として日付つきでそのまま残しています。

## 触っていないもの

- G10 の行と、ほかのゲートの行
- CLAUDE.md、AGENTS.md、`docs/tech-writing-pack/`、`content/`、`logs/`

差分は SKILL.md の1行（1 insertion, 1 deletion）だけです。

## 確認

Node v24.22.3 で次を実行しました。

- `npm ci`
- `npm run check`: root の4手順がすべて通過（secret-scan は検出0件）
- `npm run check:samples`: samples の7手順がすべて通過（サンプルのテスト 14 件 pass, 0 fail）

確認のあと、worktree の `node_modules` は削除しました。

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01Cv4a6Hqi9gpNzM1cEZDAYQ
