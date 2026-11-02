#!/usr/bin/env bash
# 記事の手順どおりに作業フォルダを作り、記事のコマンドを1つずつ実行して run/NN.log に残す。
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
rm -rf eval-dataset typecheck missing-field
log_run 01 "node -v"
mkdir eval-dataset
cd eval-dataset
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く（code/ は記事と1文字も違わないことを check-code-and-outputs.py で確かめている）
cp "$CODE_DIR"/package.json "$CODE_DIR"/logs.jsonl "$CODE_DIR"/build-cases.ts "$CODE_DIR"/check-cases.ts .
log_run 02 "node build-cases.ts"
log_run 03 "cat cases.jsonl"
log_run 04 "node check-cases.ts"
log_run 05 "wc -l cases.jsonl"
# 以下は記事に載せない確認用の実行
mkdir extra
cp "$CODE_DIR"/extra/*.ts extra/
log_run 06 "node extra/dedup-variants.ts"
log_run 07 "node extra/quota.ts"
log_run 08 "head -c -1 cases.jsonl > no-final-newline.jsonl; tail -c 1 cases.jsonl | od -An -c; tail -c 1 no-final-newline.jsonl | od -An -c; wc -l cases.jsonl no-final-newline.jsonl"
# フィールドの欠けたログ（JSON としては読める）を渡したときの動き
cd "$WORK_PARENT"
mkdir missing-field
cd missing-field
cp "$CODE_DIR"/package.json "$CODE_DIR"/build-cases.ts .
printf '%s\n' '{"ts":"2026-10-01T09:00:00+09:00","category":"shipping","answer":"質問の欄が無いログ","feedback":null}' > logs.jsonl
log_run 09 "cat logs.jsonl; node build-cases.ts"
# 型の確認は記事の作業フォルダとは別のフォルダで行う（記事の package.json に依存を足さないため）
cd "$WORK_PARENT"
mkdir typecheck
cd typecheck
cp "$CODE_DIR"/package.json "$CODE_DIR"/*.ts .
mkdir extra
cp "$CODE_DIR"/extra/*.ts extra/
cp "$CODE_DIR"/extra/tsconfig.typecheck.json tsconfig.json
log_run 10 "npm install --no-save --no-audit --no-fund typescript@7.0.2 @types/node@22.20.5 >/dev/null 2>&1 && npx tsc -v && npx tsc -p tsconfig.json && echo 'tsc: no errors'"
# ネットワークの無い名前空間で記事の node コマンドを動かす（外へ通信しないことの確認）
cd "$WORK_PARENT/eval-dataset"
log_run 11 'unshare -rn bash -c '"'"'node -e "fetch(\"https://example.com\").then(()=>console.log(\"fetch: ok\"),e=>console.log(\"fetch: failed\", e.cause?.code ?? e.message))"; node build-cases.ts; echo "終了コード: $?"; node check-cases.ts; echo "終了コード: $?"'"'"''
log_run 12 "uname -sm"
