#!/usr/bin/env bash
# 2026-11-11 の再実行。run-agent.ts に strictMcpConfig: true を足したあと、記事の手順どおりに
# 作業フォルダを作り直し、記事のコマンドを1つずつ実行して run/15.log 以降に残す。
# 使い方: run-strict.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ> <読み終えて止まる額> <回答のあとで止まる額> <最後まで答える額>
# ANTHROPIC_API_KEY は外して実行する（Claude プランのログインだけで動くことを確かめるため）。
set -u
unset ANTHROPIC_API_KEY
WORK_PARENT="$1"
RUN_DIR="$2"
TC_DIR="$3"
B_LOW="$4"
B_MID="$5"
B_HIGH="$6"
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
log_run 15 "node -v"
mkdir agent-limits
cd agent-limits
log_run 16 "npm init -y > /dev/null && npm pkg set type=module && npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 && cat package.json"
# 記事には載せない確認用。入れた SDK の型定義に strictMcpConfig があるか
log_run 17 "grep -n 'strictMcpConfig' node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts"
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR"/setup.ts "$CODE_DIR"/run-agent.ts "$CODE_DIR"/turns-limit.ts "$CODE_DIR"/budget-limit.ts "$CODE_DIR"/no-catch.ts .
log_run 18 "node setup.ts"
log_run 19 "node turns-limit.ts 2"
log_run 20 "node turns-limit.ts 10"
log_run 21 "node budget-limit.ts $B_LOW"
log_run 22 "node budget-limit.ts $B_MID"
log_run 23 "node budget-limit.ts $B_HIGH"
log_run 24 "node no-catch.ts 2> stderr.txt; echo \"exit=\$?\""
log_run 25 "grep -n \"^Error:\" stderr.txt"
# 以下は記事に載せない確認用の実行
log_run 26 "npm ls @anthropic-ai/claude-agent-sdk && wc -c stderr.txt"
cp "$CODE_DIR"/extra/tsconfig.typecheck.json "$CODE_DIR"/extra/show-blocks.ts .
log_run 27 "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
# maxTurns: 3 を3回。同じ依頼でも、応答の数が回によって変わるかを確かめる
log_run 28 "node turns-limit.ts 3; node turns-limit.ts 3; node turns-limit.ts 3"
# 上限で止まった回に、回答の text が届いてから result が来るかを見る
log_run 29 "node show-blocks.ts $B_MID; node show-blocks.ts $B_MID; node show-blocks.ts $B_MID; node show-blocks.ts $B_LOW"
