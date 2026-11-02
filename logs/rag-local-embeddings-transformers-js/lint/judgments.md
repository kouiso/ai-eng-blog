# judgments: rag-local-embeddings-transformers-js

判定日: 2026-10-31。対象は `content/articles/rag-local-embeddings-transformers-js.md`（376行。frontmatter は1〜59行目）。lint はスキル手順7のコマンドでリポジトリのルートから実行し、最後の実行結果を `ai-smell.txt`、`writing-lint.txt` に保存した。

## ai-smell-lint.py（`ai-smell.txt`）

- 判定行 `--- 判定: ✅ 致命なし`、集計 `use 0件 / 📎mention 0件`、`exit=0`。
- `🚨FATAL` 0件、`⚠️warn` 0件、`📎mention` 0件。1件ずつ判断する対象は無い。
- frontmatter の扱い（手順7）: frontmatter の範囲（1〜59行目）に出た `📎mention` は0件。use として扱うべき検出は無い。
- 出力の件数が表示行数を超える症状は無い（全部0件）。

## writing-lint.py（`writing-lint.txt`）

- 判定行 `### 判定: FATAL 0 / DENSITY超過 0 / SHOULD 0`、`exit=0`。
- DENSITY は10カウンタすべて0回（B-1 対比構文、B-5 ダッシュ、B-11、B-3、B-7、B-12、B-6、B-13、B-14、B-9 つまり）。上限は guides/08 の密度基準総表の標準レジスターと一致（B-1 2回、B-5 2回、B-6 1回、B-9 2回）。
- `### WATCH` の節は出ていない（転用動詞の検出なし）。
- SHOULD 0件、INFO(要人間確認) 0件。1件ずつ判断する対象は無い。
- 個人名は `PERSONAL_NAMES` が空で検出されないので、G09 で `grep` 相当の確認をした（gate.md の G09）。

## 途中の版で直したもの

lint の FATAL と warn は最初の版から0件だった。補助のチェック（`prose-check.py`、checklist とガイドに無い除外は入れていない）で次を直した。

| 直したもの | 内容 |
|---|---|
| 60字超の文（C25、guides/05 §1） | 最初の版で14文（frontmatter の `description` と `run_environment` を含む）。Markdown のリンクの URL、インラインコード、（出典n）も1字ずつ数えたうえで、接続助詞の手前で切るか、2文に分けた。例「Linux x64 では、`onnxruntime-node` のインストールの処理が、CUDA 12 用のライブラリを NuGet から取ってきます（出典9）。」（81字）→「Linux x64 では、`onnxruntime-node` が追加のファイルを取ってきます（出典9）。取ってくるのは CUDA 12 用のライブラリで、取得元は NuGet です（出典9）。」。リンク付きの文は、リンクを短い語「別の記事」に付け替えるか、リンクだけの短い文にした。最後の版は60字超0（最長60字） |
| 箇条書きの語尾の3連続（C17、guides/03 語尾の反復チェック） | 「確認すること」の4項目のうち3つが「〜いるか」で続いていた（SAME3 2件）。「付けたか」「指定しているか」「使うようにしたか」「収まっているか」に変えて SAME3 0 |
| 「など」（guides/05 §4「等」「など」） | 「トークナイザーの設定などの4つ」を、残り3ファイルの中身（`config.json` とトークナイザーのファイル2つ）を書く形にした |
| 指す先がずれた「こちら」「どちら」 | 文を足した結果、「こちらは 470,268,533 バイト」が WebAssembly の文の直後になったので、`model.onnx` の文の直後に戻した。「どちらも、省くと何もしない設定が既定です」が `pooling` と `normalize` の段落の直後に来るよう、モデルカードの段落を後ろに移した |

## 文末の調査（C19、C29）

`ending-check.py`（地の文の文末を、（出典n）を外してから判定。見出し、表、箇条書き、コードブロックは guides/05 §7 の例外として除外）で、132文すべてがですます調（`ending-check.txt` の `non-desu-masu 0`）。箇条書きの「〜か」と表のセルは guides/05 §7 の例外。

## prose-check.py の PAT の検出

| 行 | 検出 | use か mention か | 判断 |
|---|---|---|---|
| 255 | 「まとめ」（「8件の文書をまとめてベクトルにします」） | use | 残した。症状⑫の「まとめます」（章境界アナウンス）ではなく、複数の文書を1回の呼び出しで処理する動作の説明。`createVectorSearch` が `embed` を1回呼ぶコードと対応している |
