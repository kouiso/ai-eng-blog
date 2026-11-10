#!/usr/bin/env bash
# 記事の手順どおりに作業フォルダを作り、記事のコマンドを1つずつ実行して run/NN.log に残す。
# 使い方: run-all.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ>
# ANTHROPIC_API_KEY は外して実行する（Claude プランのログインだけで動くことを確かめるため）。
set -u
unset ANTHROPIC_API_KEY
WORK_PARENT="$1"
RUN_DIR="$2"
TC_DIR="$3"
CODE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$RUN_DIR"

log_run() {
  local n="$1"; shift
  local cmd="$*"
  local f="$RUN_DIR/$n.log"
  {
    echo "date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
    echo "cwd: <work>/$(basename "$PWD")"
    echo "node: $(node -v) / npm: $(npm -v) / os: $(uname -s) $(uname -m)"
    echo "ANTHROPIC_API_KEY: $(test -n "${ANTHROPIC_API_KEY:-}" && echo set || echo unset)"
    local shown="${cmd//$CODE_DIR/<code>}"
    echo "command: ${shown//$TC_DIR/<tc>}"
    echo "--- output (stdout+stderr) ---"
  } > "$f"
  bash -c "$cmd" > "$f.tmp" 2>&1
  local code=$?
  sed -e "s#$WORK_PARENT#<work>#g" -e "s#$CODE_DIR#<code>#g" -e "s#$TC_DIR#<tc>#g" "$f.tmp" >> "$f"
  rm -f "$f.tmp"
  echo "--- exit=$code" >> "$f"
}

cd "$WORK_PARENT"
rm -rf agent-limits
log_run 01 "node -v"
mkdir agent-limits
cd agent-limits
log_run 02 "npm init -y > /dev/null && npm pkg set type=module && npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 && cat package.json"
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR"/setup.ts "$CODE_DIR"/run-agent.ts "$CODE_DIR"/turns-limit.ts "$CODE_DIR"/budget-limit.ts "$CODE_DIR"/no-catch.ts .
log_run 03 "node setup.ts"
log_run 04 "node turns-limit.ts 2"
log_run 05 "node turns-limit.ts 10"
log_run 06 "node budget-limit.ts 0.0005"
log_run 07 "node budget-limit.ts 0.0008"
log_run 08 "node no-catch.ts 2> stderr.txt; echo \"exit=\$?\""
log_run 09 "grep -n \"^Error:\" stderr.txt"
# 以下は記事に載せない確認用の実行
log_run 10 "npm ls @anthropic-ai/claude-agent-sdk && wc -c stderr.txt"
cp "$CODE_DIR"/extra/tsconfig.typecheck.json .
log_run 11 "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
# maxTurns: 3 を3回。同じ依頼でも、応答の数が回によって変わるかを確かめる
log_run 12 "node turns-limit.ts 3; node turns-limit.ts 3; node turns-limit.ts 3"
cd "$WORK_PARENT"
rm -rf agent-limits
