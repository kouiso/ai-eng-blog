REVIEW (retroactive) | PR #83 | 1960ef3 | FINDINGS 6

PR #83「ラッコの書き出しで記事の検索語とサイトの主キーワードを決める」。head 1960ef3 で、develop には 86e1466 として入っています。差分は15ファイルです（コード 0、文書 3、記事の frontmatter 4、logs 8）。ここでは何も戻しません。下の指摘は、課題か後追いの PR にする案です。

G11 と C01〜C04 は判定し直していません。それぞれの記事の #81 の回でやり直します。

## 指摘

### 1.（中）サイトの主キーワード「生成AI API」を決めた根拠がリポジトリのどこにも無い
- `CLAUDE.md:19`、`.claude/skills/write-article/SKILL.md:80`、`keywords/README.md:26`
- 3か所とも「2026-11-14 に、ラッコキーワードのサジェスト一覧と Google トレンド（日本、12か月）の比較から決めた」と書いています。でも、比べた候補、トレンドの URL、見た日の記録はどこにもありません。`git grep "生成AI API"` で当たるのは、この3か所と `logs/ai-agent-safe-file-tool/selection.md:58` だけです。CLAUDE.md には「断定には一次情報の URL と確認した日付」という決まりがあり、この書き方はそれに合っていません。
- 同じ決定を3か所に書いていて、中身の細かさも違います。SKILL.md:80 には「（日本、12か月）」も役割の分け方も書いていません。いずれずれていきます。
- 案: `docs/decisions/site-keyword.md` を作り、比べた候補の語、トレンドの URL（geo=JP、期間12か月）、見た日、選んだ理由を書きます。CSV の行と数値は写しません。3か所は1行の要約とそこへのリンクにします。

### 2.（中）変えた4本の選定が、スキルの手順 1-2-4（人気度）と selection.md の書式に従っていない
- `logs/ai-agent-safe-file-tool/selection.md:56`、`logs/claude-p-script-first-call/selection.md:48`、`logs/llm-eval-dataset-from-logs/selection.md:48`、`logs/llm-json-parse-error-fix/selection.md:48`
- 4本とも「検索数の列は null で、人気度は比べていない」で止まっています。SKILL.md:117（手順 1-2-4）は「無ければ Google トレンドで候補を比べ（日本、過去12か月）」と決めています。同じ日にサイトの主キーワードはトレンドで比べたと書いているので、比べられなかったわけでもありません。
- SKILL.md:409 は selection.md に「外した候補と外した理由」を書くよう求めています。4本の追記にはそれがありません。claude-p と llm-eval は前の語を外した理由だけを書いています。
- G10（CSV の行と一致するか）の判定とは別の話です。G10 の OK は変わりません。
- 案: 各記事の #81 の回で、トレンドの比較（0 同士なら「差なし」）と、外した候補を selection.md に書き足します。

### 3.（低）サジェストの CSV を使う場面の決まりが、CLAUDE.md と SKILL.md で食い違っている
- `CLAUDE.md:43` と `keywords/README.md:9` は、この PR で「ラッコの CSV に合うキーワードが無い記事はこれで選ぶ」に変わりました。`.claude/skills/write-article/SKILL.md:111` は「最初の回は、ラッコの CSV が無くてもサジェストの CSV だけで選んでよい」のままです。スキルの側に、ラッコの CSV を先に見るという順番がありません。手順の正本はスキルなので、決まりが CLAUDE.md にしか無い形です。
- `keywords/README.md:9` には「キーワードを変えていない26本の記事は、サジェストのキーワードを使っています」とあります。26本の gate.md の G10 の行は、どれも `google-suggest-*.csv` を挙げていて、そこは事実に合っています（下の「行った確認」）。ただ、新しい決まりで読むと「26本はラッコの CSV に合う語が無かった」ことになります。26本についてラッコの CSV と照らした記録はありません（26本の selection.md はこの PR で変わっていません）。
- 案: SKILL.md:111 を CLAUDE.md:43 と同じ決まりに直します（ラッコを先に、合う語が無ければサジェスト）。README:9 は「ラッコの CSV が届く前に選んだ」と書き換えるか、26本をラッコの CSV と照らした結果を書きます。

### 4.（低）`logs/llm-eval-dataset-from-logs/gate.md` の集計と結論が、まだ「G10 が NG」のまま
- `logs/llm-eval-dataset-from-logs/gate.md:96`（「A: OK 8 / NG 2（G07、G10）」）、`:98`（合計 NG 2）、`:102`（「G07 と G10 が NG」）、`:104`（「G10: `keywords/` に CSV が届いていない（CSV 待ち）」）
- この PR は同じファイルの5行目（追記）と48行目（G10 の欄）を直したのに、集計と結論は直していません。ほかの2本（ai-agent-safe-file-tool と llm-json-parse-error-fix）は、集計と結論を表に合わせてあります。オーナーのレビューで nit 1 として挙がり、直されないままマージされました。
- 案: G10 を OK として集計し直し、104行目を消します。G07 の分は #31 の範囲です。この PR の外の課題として分けます。

### 5.（低）`logs/llm-json-parse-error-fix/gate.md:3` で、2026-11-11 の追記を足さずに置き換えた
- 前の「2026-11-11 追記: サジェストの CSV を読んだが合う行が無く…」の行を消し、2026-11-14 の追記を書いています。ほかの3本の gate.md は追記を足す形です。経緯は selection.md に残っていますが、gate.md の側では履歴が消えています。
- 案: 2026-11-11 の行を戻し、その下に 2026-11-14 の行を置きます。

### 6.（nit）`keywords/README.md:45-48` の表の見出しが「想定している列」のまま
- 52行目で実際の列名（「キーワード」「月間検索数」）を書きましたが、上の表は直していません。「この README の上の表を実際の列名に書き換えます」という前の約束は、文を消して済ませた形です。オーナーのレビューの nit 3 と同じ点です。
- 案: 表の右の列を「キーワード」「月間検索数（無料プランでは null）」にします。サジェストの CSV の列名（`suggestion`）も同じ表に並べます。

### 数に入れないもの
- `logs/claude-p-script-first-call/gate.md:3` と `:82` の「G07 が NG」は、表の G07（OK）と合いません。ただ、これは #31 の分で、この PR の外です。
- 語を差し替えた理由が、PR の本文（「「月額」が本文に無い話」）と `logs/claude-p-script-first-call/selection.md:50` で違います。リポジトリに残るのは selection.md の言い方だけで、こちらは記事のタイトルと合っています。

## 合格の基準で確かめたこと
- `docs/tech-writing-pack/` は変わっていません（差分0ファイル）。
- 秘密情報とアカウントの情報: 足された行に `sk-ant`、`@gmail`、`session_01`、`/home/user`、`/Users/`、`tmp/claude`、リポジトリのオーナーのアカウント名は0件でした。
- CSV の中身: 足された行にタブ区切りの行は0件です。`keywords/README.md:52` に書いたのはヘッダーの列名だけで、行も件数もありません。
- 記事の frontmatter: 変わったのは4本の `target_query` の行だけです。`status` と `main_keyword` は変わっていません。
- 検索語の3層の文（CLAUDE.md:16-21 と SKILL.md:80）は、「未定」が「生成AI API」に変わっただけで、3層の形も `main_keyword` の説明も保たれています。「未定」の文字はどの文書にも残っていません。
- 4本の gate.md と selection.md の突き合わせ:
  - 4本とも、G10 の欄が挙げる CSV と selection.md の 2026-11-14 の追記が挙げる CSV が同じです。`AIエージェント.csv`、`LLM API.csv`、`LLM 評価.csv` は講座のキーワードと合っています。llm-json だけは `google-suggest-structured-output.csv` です。
  - 日付はすべて 2026-11-14 です。llm-json は、その行の `fetched_at` を 2026-11-12 と書いています。これで、2026-11-11 には合う行が無かったことと矛盾しません。
  - frontmatter の値と、selection.md の見出しにある語が、1文字も違わず一致しています。
  - 指摘4と5のほかに、日付と語の食い違いはありません。

## Codex（chatgpt-codex-connector）の指摘
- 指摘は0件です。コメントは2件あり、どちらも指摘ではありません。
  1. Codex Review Summary: 1960ef3 の Code Review が「Failed」で、「We couldn't complete this review」と出ています。
  2. 「You have reached your Codex usage limits for code reviews」。
- 行のコメント（review comments）は4件あり、どれもオーナーのアカウントのレビューの nit です。Codex のものではありません。CodeRabbit も使える回数の上限で止まり、レビューしていません。
- PR #83 は、自動のレビューを1つも受けずにマージされました。この回顧レビューで中身を見たのは上のとおりです。

## 行った確認
- GitHub の MCP の `pull_request_read`（get、get_comments、get_review_comments）で、PR の本文、コメント6件、行のコメント4件を読みました。
- `git diff $(git merge-base 16d2096 1960ef3) 1960ef3` で差分を全部読みました（15ファイル、+59/-24）。
- `git show 86e1466:<file>` で、CLAUDE.md、SKILL.md（80、105-125、409行目）、keywords/README.md、変えた4本の gate.md と selection.md を、マージした版で読みました。
- 30本の gate.md の G10 の欄が挙げる CSV を数えました。サジェストが27本（変えていない26本と llm-json）、ラッコが3本でした。README:9 の書き方と合っています。
- `/home/user/r83`（86e1466）で `node scripts/secret-scan.mjs 16d2096` を実行しました（Node v24.22.3）。結果は「base 16d2096, 30 file(s) scanned, 0 finding(s)」です。30ファイルは、86e1466 の中のほかのマージの分も入った範囲で、この PR の15ファイルを含みます。
  - `npm ci` は実行していません。ディスクの空きが約295MBしかなく、入れられませんでした。`scripts/secret-scan.mjs` が読み込むのは Node の標準のモジュール（`node:child_process`、`node:fs`、`node:path`）だけなので、結果には響きません。
- 同じ場所で `git ls-files keywords` を実行しました。出たのは `keywords/README.md` だけで、CSV は0件です。`.gitignore:19` に `keywords/*.csv` があります。
- 確認のあとで worktree `/home/user/r83` は消しました（`git worktree remove`）。
- 確かめられなかったこと: 30/30 の `target_query` がラッコの CSV の行と一致するかは、やり直せていません。この環境にはラッコの CSV がありません。手元のサジェストの CSV は、この回で取り直したもので、それぞれの記事が引いた版ではありません。一致はオーナーのレビュー（30/30）と作者の LOCAL-CHECK の結果のままです。

---
_Generated by [Claude Code](https://claude.ai/code)_
