REVIEW | PR #77 | e30bacb | PASS

reviewer: general-purpose subagent, Opus 5.5（3回目、最後）。この PR のコミットは書いていません。head は PR の現在の head（e30bacb220bd9387b96deda292ccd36d8214b522）と一致し、`/home/user/r77c` の worktree で確かめました（作業ツリーはきれいなまま）。差分は merge-base fd51b62 との比較です。判定は、確定した裁定（C25 で数えないのはちょうど URL 1つの値だけで、`[SKIP C25-URL]` に件数つきで出す。frontmatter の `url:` も同じ扱い。C30-C32 はインラインコードを数えない。C17 は pack の lint の文の取り方に従う。30本中29本が落ちたままでもマージしてよい）で行いました。

must 0 / want 3 / nit 1

## 2回目の指摘への答え（この head で）
- must C25 の URL だけの判定（`\S+`）: 直っています。`scripts/check-article.py:84` は RFC 3986 の ASCII の文字だけを受け付け、`fullmatch` で判定します。`c25-url-ja.md`（URL の後ろに全角の語が空白なしで続く）と `c25-url-two.md`（URL 2つを読点でつなぐ）は、どちらも `[FAIL C25]` になり、件数は 0件、`[SKIP C25-URL]` は出ません。
- must frontmatter の決めたキーだけ: 直っています。`fm_values`（`:107-126`）は、キーで選ばずに文字列の値をすべて取ります。数えないのは、引用符のない数値、日付、真偽、null だけです。`c25-fm-tags.md`（インラインの一覧）、`c25-fm-tags-block.md`（行ごとの一覧）、`c25-fm-target.md` は、どれも `70字 [fm]` で落ちます。
- want frontmatter の `url:`: リードの裁定どおり、`[SKIP C25-URL]` に出ます（`c25-fm-url.md`）。30本では 276 件で、内訳は表のセルが 138 件、frontmatter が 138 件です。frontmatter の 138 件は、行番号で frontmatter の中かどうかを見て数えました。報告に書いてある件数と一致します。数えなかった値は全部で 668 件で、`url:` の行が 334 本あるので、表のセルと frontmatter が 334 件ずつという報告の内訳とも合います。
- want 「ました」の fixture: `c17-mashita.md`（「使いました。確認しました。書きました。」）が足されています。`語尾「ました」` で落ちます。
- want どのコミットの証跡か: 報告の冒頭（`docs/verification/check-article-report.md:3`）に 9bf4815 と書いてあります。`git diff 9bf4815 e30bacb --stat` は `docs/verification/check-article-report.md` の1ファイルだけ（+16 −14）なので、報告の数字はこの head のスクリプトで出した数字と同じです。
- nit 「に加え」: 報告（`:46`）に、7つの形のうち4つがガイドの行、3つ（ます、ました、でした）が追加と書いてあり、スクリプトのコメント（`:60-63`）と合っています。ただし PR 本文は古いままです（下の want 1）。
- nit C31 の `―`（U+2015）: `C31_CHARS = "—─"`（`:81`）から外れ、docstring（`:31`）と報告にも書いてあります。
- nit 180字で切れた行: 直っています。報告の FAIL の一覧 201 行は、`--all` の出力の `[FAIL` の行と1字も違わず一致します（`diff` で 0 件の差）。
- nit SKIP の一覧の出し方: 報告（`:47`）に `--all | grep SKIP` と書いてあります。

## C26 と C28 から URL だけの値を外したこと
妥当と判断します。`URL_ONLY` に一致する値は ASCII の文字だけです。一方、C26 の組（`:68-77`）と C28 の型（`:79`）は、どれも仮名か漢字を含みます。そのため、外しても外さなくても今の候補は変わりません。C25 で「文ではない」として外した値を、文の候補の検査でも同じに扱うことになり、筋も通ります。URL と語が混じるセルは、どの検査でも数えたままです。

## must
0件。

## want
- want 1 PR 本文が e30bacb の内容と合っていません。PR 本文（GitHub の REST で読んだもの。head は e30bacb）には、次の古い記述が残っています。
  - C31 の記号に `―` がある（`:81` で外した）。
  - C25 の説明が「frontmatter の読者に見える文字列、sources の title」のまま（今は文字列の値すべてと、frontmatter の url）。
  - 「60字超のものは…138件」とある（今は 276 件で、表のセル 138 件と frontmatter 138 件）。
  - `npm test` 142 件、secret-scan 49 files（この head では 149 件と 56 files）。
  - どのコミットで確かめたかが書いていない。

  マージで残る説明なので、報告の数字と e30bacb の確認結果に書き換えてください。コードの変更は要りません。
- want 2 `scripts/check-article.py:84` の `URL_ONLY` は、ASCII の区切りで URL を2つつないだ値も「URL 1つ」と見ます。scratchpad に置いた fixture で、表のセル `| https://a.example.com/path/one,https://b.example.com/path/two |`（61字）が exit 0 で、`[SKIP C25-URL]` にだけ出ました。`c25-url-two.md` の読点を消して URL 2つを直接つなげても、試験の「URL が2つ」の項が落ちます（下の「確かめたこと」を参照）。カンマは RFC 3986 で URL に使える文字なので、文字の種類だけでは見分けられません。裁定の「ちょうど URL 1つ」に合わせるなら、`https?://` が2回以上出る値を URL だけの値と見ないようにし、その fixture を1本足してください。30本では、SKIP に出た 276 件のうち、`://` を2回含むものは 0 件です。ですから、直しても報告の件数は変わりません。`[SKIP C25-URL]` に字数つきで出るので、見落としにはなりにくいと考え、want にしました。
  - 同じ理由で、`https://example.com/page(English,checked-2026-11-02,ok)` のような、ASCII の語を括弧でつないだ値も SKIP に入ります。Wikipedia の URL のように括弧を含む正しい URL があるので、ここは今のままでかまいません。
- want 3 frontmatter のブロックスカラーは数えず、件数も出ません。`description: >` の次の行に70字の値を置いた fixture は、exit 0 で、何も出ませんでした（`fm_values` は字下げした続きの行を拾いません）。docstring（`:14`）の「数えないものは…数を出力する」と合いません。30本の frontmatter には `|` も `>` もなく（キーは一行の値だけです）、今の件数には影響がありません。次のどちらかにしてください。続きの行をつないで1つの値として数える。または、ブロックスカラーがあったら件数を出すか exit 2 にする。

## nit
- nit `fm_values` の細かい取り方。次の3つは、どれも多めに数える側か、30本に当たる行がありません。
  - `description: >` の `>` を、1字の値として返す。
  - インラインの一覧の単引用符の要素（`['あ…, x']`）を、カンマで割る。scratchpad の fixture では、先頭の `'` を含めて71字の `[FAIL C25]` になりました。
  - 行末の `# コメント` を値に含める。

  want 3 を直すついでに、扱いを決めてください。

## scope
0件。見たもの: merge-base fd51b62 との差分は 56 ファイルで、すべて追加です。`content/`、`logs/`、`.claude/`、`docs/tech-writing-pack/`、`package.json`、`package-lock.json` の変更は 0 件です（`git diff fd51b62 HEAD --name-only` を grep して確かめました）。2329580 からの差分は、スクリプト、試験、新しい fixture 7本、報告だけです。

## 確かめたこと（Node v24.22.3、e30bacb）
- `npm ci`: 通りました（install-scripts の警告だけ）。
- `npm test`: 11 ファイル、149 件が通りました。`test/check-article.test.ts` だけでは 40 件です。
- `npm run typecheck`: 45 files、0 errors、0 warnings、0 hints。
- `node scripts/secret-scan.mjs origin/develop`: 56 files、0 findings。
- `python3 scripts/check-article.py --all`: exit 1。
  - 報告の表の30行と合計を、各記事の SUMMARY 行と機械的に突き合わせました。ずれた行は 0 です。合計は C25 42、C17 141、C30-32 0、OUTPUT 18、C16 97、C26 0、C28 36 です。
  - 落ちた記事は 29 本、C17 に落ちた記事は 21 本で、報告と一致します。
  - `[FAIL` の行は 201 行で、報告の一覧と `diff` の差は 0 です。
  - `[SKIP C25-URL]` は 276 件（表のセル 138、frontmatter 138）、数えなかった値は 668 件です。
- 落ちる試験の確認: `c25-url-two.md` の `、https` を `https` に変え、URL 2つを直接つなげました。`C25 は、URL が2つ、読点でつながるセル を…` が落ちました（1 failed / 39 passed）。元に戻すと 40 件とも通り、`git status` もきれいなままです。
- 試験の外で試した fixture 11本（scratchpad。リポジトリの外です）:
  - 正しく扱われたもの（6本）:
    - 全角の語が混じる frontmatter の値: FAIL。
    - `[公式のページ](URL)` のセル: FAIL。
    - 引用符のない sources の url: SKIP。
    - 引用符つきの任意のキーの URL: SKIP。
    - 行ごとの tags の中の URL: SKIP。70字の要素は FAIL。
    - URL の末尾に `.` が付いたもの: SKIP。`.` は URL に使える文字です。
  - want 2 に当たったもの: ASCII のカンマで URL 2つをつないだセル、ASCII の語を括弧で付けたセル。
  - want 3 に当たったもの: ブロックスカラー。
  - nit に当たったもの: 単引用符の一覧の要素、行末のコメント。
- `npm run build` は今回は実行していません（e30bacb から 9bf4815 までの差分は報告のファイルだけです）。

---
_Generated by [Claude Code](https://claude.ai/code)_
