#!/usr/bin/env bash
# 記事の手順どおりに作業フォルダを作り、記事の node コマンドを1つずつ実行して run/NN.log に残す。
# 使い方: run-all.sh <作業場所の親フォルダ> <run ログの出力先>
set -u
WORK_PARENT="$1"
RUN_DIR="$2"
CODE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$RUN_DIR"

log_run() {
  local n="$1"; shift
  local cmd="$*"
  local f="$RUN_DIR/$n.log"
  {
    echo "date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
    echo "cwd: <work>/$(basename "$PWD")"
    echo "node: $(node -v) / npm: $(npm -v)"
    echo "command: ${cmd//$CODE_DIR/<code>}"
    echo "--- output (stdout+stderr) ---"
  } > "$f"
  bash -c "$cmd" 2>&1 | sed -e "s#$WORK_PARENT#<work>#g" -e "s#$CODE_DIR#<code>#g" >> "$f"
  local code=${PIPESTATUS[0]}
  echo "--- exit=$code" >> "$f"
}

cd "$WORK_PARENT"
rm -rf llm-eval typecheck
log_run 01 "node -v"
mkdir llm-eval
cd llm-eval
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く（code/ は記事と1文字も違わないことを check-code-and-outputs.py で確かめている）
cp "$CODE_DIR"/package.json "$CODE_DIR"/graders.ts "$CODE_DIR"/cases.ts \
   "$CODE_DIR"/answers.ts "$CODE_DIR"/run-eval.ts "$CODE_DIR"/compare.ts .
log_run 02 'node run-eval.ts; echo "終了コード: $?"'
log_run 03 "node compare.ts"
# 以下は記事に載せない確認用の実行
mkdir extra
cp "$CODE_DIR"/extra/*.ts extra/
log_run 04 "node extra/no-normalize.ts"
log_run 05 "node extra/gflag.ts"
log_run 06 "node extra/missing-answer.ts"
log_run 09 "node extra/format-only.ts"
# 型の確認は記事の作業フォルダとは別のフォルダで行う（記事の package.json に依存を足さないため）
cd "$WORK_PARENT"
mkdir typecheck
cd typecheck
cp "$CODE_DIR"/package.json "$CODE_DIR"/*.ts .
mkdir extra
cp "$CODE_DIR"/extra/*.ts extra/
cp "$CODE_DIR"/extra/tsconfig.typecheck.json tsconfig.json
log_run 07 "npm install --no-save --no-audit --no-fund typescript@7.0.2 @types/node@22.20.5 >/dev/null 2>&1 && npx tsc -v && npx tsc -p tsconfig.json && echo 'tsc: no errors'"
# ネットワークの無い名前空間で記事の node コマンドを動かす（外へ通信しないことの確認）
cd "$WORK_PARENT/llm-eval"
log_run 08 'unshare -rn bash -c '"'"'node -e "fetch(\"https://example.com\").then(()=>console.log(\"fetch: ok\"),e=>console.log(\"fetch: failed\", e.cause?.code ?? e.message))"; node run-eval.ts; echo "終了コード: $?"; node compare.ts; echo "終了コード: $?"'"'"''
