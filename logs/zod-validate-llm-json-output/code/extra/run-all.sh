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
    echo "command: ${cmd//$CODE_DIR/(code)}"
    echo "----- stdout+stderr -----"
  } > "$f"
  bash -c "$cmd" >> "$f" 2>&1
  local code=$?
  echo "----- exit=$code -----" >> "$f"
}

cd "$WORK_PARENT"
rm -rf zod-llm-check
log_run 01 "mkdir zod-llm-check"
cd zod-llm-check
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く（code/ は記事と1文字も違わないことを check-code-and-outputs.py で確かめている）
log_run 02 "cp $CODE_DIR/package.json ."
log_run 03 "npm install"
log_run 04 "cp $CODE_DIR/schema.ts $CODE_DIR/samples.ts $CODE_DIR/check.ts ."
log_run 05 "node check.ts ok"
log_run 06 "node check.ts wrong-type"
log_run 07 "node check.ts bad-enum"
log_run 08 "node check.ts extra-key"
log_run 09 "node check.ts many"
log_run 10 "cp $CODE_DIR/lowercase-enum.ts . && node lowercase-enum.ts"
log_run 11 "cp $CODE_DIR/retry-message.ts . && node retry-message.ts"
log_run 12 "cp $CODE_DIR/pretty-ja.ts . && node pretty-ja.ts"
log_run 13 "cp $CODE_DIR/strip.ts . && node strip.ts"
# 以下は記事に載せない確認用の実行
cp "$CODE_DIR"/extra/tsconfig.typecheck.json "$CODE_DIR"/extra/offline-all.sh .
log_run 14 "npm install --no-save typescript@7.0.2 @types/node@22.20.5 > /dev/null 2>&1; npx tsc --version; npx tsc -p tsconfig.typecheck.json; echo tsc_exit=\$?"
log_run 15 "unshare -rn ./offline-all.sh"
