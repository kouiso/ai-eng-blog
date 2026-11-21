REVIEW | reviewer: general-purpose subagent, Opus 5.5 medium | authored no commit on this PR | head 2329580abfd7ec90334314ec476f9d8e5e48a449 | axes: pass line, design, scope, tests, body vs diff, evidence | verdict FAIL | must 2 want 3 nit 4

head は PR の現在の head（2329580abfd7ec90334314ec476f9d8e5e48a449）と一致し、/home/user/w42 のチェックアウトで確認しました（作業ツリーはきれいなまま）。差分は merge-base fd51b62 との比較です（PR の base は aecb256、手元の origin/develop は 16d2096）。判定は、マネージャーの最終裁定 (A) から (D) で読み替えた基準で行いました。

## 1回目の指摘への答え（この head で）
- must C30-C32 のインラインコード: 直っています。`scripts/check-article.py:220-223` がインラインコードを除いてから数え、`c30-32-code.md` が通ること（インラインコード、``` `` ``` の2重のもの、```text ブロック）と、`c30.md` `c31.md` `c32.md` が落ちることを試験しています。裁定 (C) を満たします。
- must C25 の URL だけのセル: 裁定 (A) で、数えないことが認められました。実装（`:137`、`:163-170`）は、60字を超えるものを `[SKIP C25-URL]` で行つきで出し、30本で 138 件です。ただし判定の正規表現に穴があります（下の must 1）。
- must C17 の「ます」「ました」: 直っています。`:62-63` の形のデータに入り、形ごとに別の語尾として数えます。`c17-masu.md` は語尾3字が違う「ます」の並びで落ち、`c17-mixed.md` は形が混ざる並びで通ります。裁定 (B) を満たします。
- want（コメントと実装の食い違い）: 解消しました（`:159-162`）。want（`c17-four.md` の「です」の並び）、want（C25 の60字と61字の境界、frontmatter、表のセル、見出しの fixture）、nit（コードブロックの中の `**` が通る fixture）: どれも足されています。

## pass line
- `npm test`: 11 ファイル、142 件が通過しました。`test/check-article.test.ts` だけだと 33 件です。
- `python3 scripts/check-article.py --all`: exit 1 です。報告の表の30行と合計（C25 42、C17 141、C30-32 0、OUTPUT 18、C16 97、C26 0、C28 36）をスクリプトの出力の SUMMARY 行と機械的に突き合わせ、ずれた行は 0 でした。落ちた記事 29 本、C17 に落ちた記事 21 本、`[SKIP C25-URL]` 138 件も一致しています。
- 落ちる試験の確認: `c17-masu.md` の3文目を「手順を説明しました。」に変えると、`C17 は「ます」の3連続も数え…` が落ちました（1 failed / 32 passed）。戻すと 33 件とも通りました。コミットはしていません。
- `node scripts/secret-scan.mjs origin/develop`: 49 files、0 findings。`npm run typecheck`: 0 errors。`npm run build` は今回は実行していません。
- 差分は追加 49 ファイルだけです。`package.json`、`package-lock.json`、`logs/`（`logs/*/lint/*.py` の60本を含む）、`content/`、`.claude/`、`docs/tech-writing-pack/` に変更はありません。試験は合成の fixture だけを使い、実際の原稿は `npm test` にも CI にも入っていません。`python3` が無いときは `spawnSync` の `r.error` で throw するので、試験は落ちます。
- 「Closes #42」: #42 の条件（題名の「記事ごとの検査スクリプト2種類を1つにまとめ、試験を付ける」。本文は空）は満たしています。#17 の残りの条件は #43 と #44 に分けてあります。

## design
- **must** `scripts/check-article.py:80`（`URL_ONLY = re.compile(r"https?://\S+")`）と `:137`: `\S+` は全角の文字と読点も URL に含めます。そのため、URL のすぐ後に空白なしで語が続くセルも「URL だけのセル」と判定され、C25 で数えられません。裁定 (A) は「数えないのは、セルの中身がちょうど URL 1つのときだけ。URL と語が混じるセルは全体を数える」です。scratchpad に置いた fixture で、次の2つのセルが exit 0 になることを確かめました（どちらも `[SKIP C25-URL]` に出るだけで、`[FAIL C25]` にはなりません）。
  - `| https://example.com/…/on（英語のページ、2026-11-02に確認） |`（92字）
  - `| https://example.com/…/on、https://example.com/…/on |`（141字。URL が2つ）
  `c25-url-words.md` は、URL の前後に半角空白がある場合しか試していません。URL に使える文字（RFC 3986 の ASCII の範囲、たとえば `[A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+`）だけを1つ受け付ける判定にし、この2つの型が落ちる fixture を足してください。30本の中で今この型に当たるセルは 0 件だったので、直しても報告の件数は変わりません。
- **must** `scripts/check-article.py:49`、`:119`（frontmatter は決めたキーだけを数える）: 数えるのは `title` `description` `cost_estimate` `run_environment` と sources の `title` だけです。それ以外のキーは、件数も出さずに外れます。裁定 (A) は「frontmatter の文字列も含め、自然言語の文字列はどこにあっても数える」で、docstring（`:14`）の「数えないものは…数を出力する」とも合いません。`tags` と `target_query` に70字の値を入れた fixture は、どちらも exit 0 で、何も出力されませんでした。`tags` はサイトのタグとして読者に見えるので、スクリプト自身の「読者に見える文字列」の基準にも入ります。自然言語のキー（少なくとも `tags` の各要素、`main_keyword`、`target_query`）を数え、落ちる fixture を足してください。30本ではいちばん長い値でも `target_query` の34字なので、直しても報告の件数は変わりません。
- want `scripts/check-article.py:49-50`（frontmatter の `url:`）: sources の `url:` は数えず、一覧にも出しません。30本で60字を超えるものが 138 件あります。URL は自然言語ではないので、裁定 (A) の外と読めます。それでも、表のセルの URL と同じく `[SKIP C25-URL]` で一覧に出すかどうかは、マネージャーに確かめてください。今は数えておらず、出力にも何も出ません。

## scope
0件。見たもの: 変更はすべて追加で、スクリプト、例外の JSON（空）、試験、fixture、報告だけです。依存、記事、スキル、ログ、pack には変更がありません。報告の「自前のスクリプトから落としたもの」（`docs/verification/check-article-report.md:261-268`）には、checklist の行に結びつかない理由が書いてあります。

## tests
- want `test/check-article.test.ts:79-84`: 「ました」が3文続いて落ちる fixture がありません。手元で「使いました。確認しました。書きました。」（語尾3字はどれも違う）を試すと、`語尾「ました」` で落ちました。実装は正しいので、裁定 (B) の「ました」を試験で押さえる fixture を1本足してください。
- 0件（そのほか）。見たもの: 確定の検査（C17、C25、C30、C31、C32、OUTPUT）は、どれも通る fixture と落ちる fixture があります。候補（C16、C26、C28）は、出る fixture と、`ok.md` で出ないことがあります。

## body vs diff
- nit PR 本文と `docs/verification/check-article-report.md:46`: 「形は guides/03-anti-ai.md 409行と193行に結びつけたデータ」とあります。一方、`scripts/check-article.py:60-61` は、ます、ました、でしたを「に加え」と書いています。裁定 (B) では受け入れられていますが、書き方をそろえてください。
- nit `scripts/check-article.py:79`: C31 は `―`（U+2015）も数えます。checklist C31 とガイドの記号の表にあるのは `—` `——` `──` で、`―` はありません。30本での件数は 0 です。docstring（`:30`）と本文の書き方もそろえてください。
- そのほかは 0件。見たもの: 本文の件数、終了コード（0、1、2）、`--only`、`--root`、`--exceptions`、試験の件数（142）、secret-scan（49 files、0）は、実装と出力に一致しました。

## evidence
- want: 現在の head（2329580）を名指しした証跡がありません。LOCAL-CHECK のコメントは 887a9ac のもので、数字も古いままです（129 件、C17 22、OUTPUT 52）。PR 本文の「確認したこと」と報告にも、どのコミットで実行したかが書いてありません。この head で LOCAL-CHECK を出し直すか、報告の冒頭にコミットを書いてください。
- nit `docs/verification/check-article-report.md:54-254`: 確定の一覧のうち10行が、180字で切れています（frontmatter の `run_environment` の行）。冒頭には「出た結果をそのまま載せます」とあるので、切らずに載せるか、切ったことを書いてください。
- nit 同じ報告の47行: `[SKIP C25-URL]` は件数（138）だけです。行の一覧は `--all` の出力にしか出ません。報告から見つけられるよう、出し方を一言書いてください。

---
_Generated by [Claude Code](https://claude.ai/code)_
