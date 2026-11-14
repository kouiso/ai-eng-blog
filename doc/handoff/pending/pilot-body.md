TITLE: content: claude-p-script-first-call を検索語「llm api 呼び出し」に合わせて直す（パイロット）

Refs #81 #87 #83

## 変えたこと

#81 のパイロットの1本です。`target_query` が `llm api 呼び出し` に変わった（#83）ので、C01〜C04 を判定し直し、あわせて `check-article.py` の確定指摘11件（C25 1件、C17 10件）を本文で直しました。

- 本文: タイトルの先頭、リード1文目、description を「LLM API の呼び出し」に合わせました。前提の節に、Claude の API を直接呼ぶ書き方は扱わないことと、その料金がトークン数に応じることを1段落（出典7）で足しました。リード1文目は「`claude -p` なら」の条件つきです。事実は変えていません。コードと実行結果のブロック30個は、直す前と1文字も違いません。
- C25: frontmatter の `run_environment` を「。」で区切りました。足した文も60字以下です。
- C17: 語尾が3文続く10区間を、語尾を変えて直しました。
- 出典: 10ページを 2026-11-14 に開き直し、確認日と行番号をつけ直しました。`--strict-mcp-config` の公式の文面は変わっていたので、`sources.md` に両方の文面を書きました。`ANTHROPIC_API_KEY` については、`-p` では常にそのキーが使われる、と公式にあるので、本文をそれに合わせました。
- #87 の1: `selection.md` に、人気度の比較と外した候補を書きました。Google トレンドは取得が HTTP 429 で止まり、比較できていません（理由と試行は `selection.md`）。外した候補は、ラッコの一覧がこの環境に無いので、読める Google サジェストの CSV と以前の `target_query` からのものです。
- G10: 判定し直していません。裁定2に従い、#83 を出典にした日付つきの注記を `gate.md` の G10 の行に残しました。
- コード: 動かし直していません（コードと出力が変わらないため）。`verified_at`、`run_environment` の版、本文の日付は 2026-11-11 のままで、最後のログと合っています。`run_environment` は書き方だけ変えました（版は同じ）。

## ゲートの結果（書いた AI の判定）

G01〜G10 と C01〜C39 はすべて OK（C39 は任意で「あり」）。G11 は未判定で、別の AI の点検を待ちます（この PR の書いた AI は点検しません）。`status` は `draft` のままです。G11 を通ったあとに、メインエージェントが `ready` にします。

## 記録の読み方で、点検する AI に判断してほしいこと

- G05: `run/10.log` の見出しの日付が UTC で 2026-11-12T01:01:14Z です。`code/README.md` は現地で 11-11 と書いていますが、このマシンの時刻帯は今回確かめられていません。`verified_at` を 2026-11-11 のままにしてよいかは、裁定8の読みの問題です。
- G07: 本文の内部リンクは0件で、並び順だけを示しています（裁定1）。

## lint とチェック

- `check-article.py`: 確定 0、候補 0
- `ai-smell-lint.py`: 致命なし。`writing-lint.py`: FATAL 0 / DENSITY超過 0 / SHOULD 0
- `npm run check`、`npm run check:samples`、`node scripts/secret-scan.mjs origin/develop`: すべて通過（LOCAL-CHECK を貼る。先頭のコミットは 2ee501c）

## 実施できなかったこと

- Google トレンドでの人気度の比較（HTTP 429）
- 上位10記事の確認（検索結果を取得する手段が無い）
- `keywords/LLM API.csv` の確認（オーナーの端末にだけある）

## G11

別の AI の点検が必要です。点検は `logs/claude-p-script-first-call/review.md` を取り直します（2026-11-11 の `review.md` は本文を直す前の版への点検）。

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01Cv4a6Hqi9gpNzM1cEZDAYQ
