#!/usr/bin/env bash
# run-all.sh のあとに、同じ作業フォルダで補助の確認を2つ実行して run/12.log と 13.log に残す（記事には載せない）。
# 使い方: bash run-all.sh <作業フォルダの親> <logs/promptfoo-llm-eval-intro の絶対パス>
set -u
BASE="$1"
LOGDIR="$2"
CODE="$LOGDIR/code"
RUN="$LOGDIR/run"
WORK="$BASE/promptfoo-intro"
TC="$BASE/typecheck"
mkdir -p "$RUN"

clean() {
  # ANSI の色コードを外し、作業フォルダの絶対パスと UUID（sessionId など）を伏せる
  sed -E 's/\x1b\[[0-9;]*m//g' \
    | sed "s#$WORK#<work>#g; s#$TC#<tc>#g; s#$BASE#<base>#g" \
    | python3 -c '
import re, sys
pat = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{0,12}…?")
for line in sys.stdin:
    sys.stdout.write(pat.sub(lambda m: "<session-id>".ljust(len(m.group(0))), line))
'
}

step() {
  local n="$1"; shift
  local dir="$1"; shift
  local cmd="$*"
  local log="$RUN/$n.log"
  {
    echo "date: $(date -Iseconds)"
    echo "cwd: $dir"
    echo "node: $(node -v)  npm: $(npm -v)"
    echo "ANTHROPIC_API_KEY: $(test -n "${ANTHROPIC_API_KEY:-}" && echo set || echo unset)"
    echo "\$ $cmd"
    echo "----"
  } > "$log.tmp"
  (cd "$dir" && bash -c "$cmd") > "$log.out" 2>&1
  local code=$?
  cat "$log.out" >> "$log.tmp"
  echo "----" >> "$log.tmp"
  echo "exit=$code" >> "$log.tmp"
  clean < "$log.tmp" | tee "$log"
  rm -f "$log.tmp" "$log.out"
  echo "==== $n exit=$code"
}

cp "$CODE/extra/check-auth.ts" "$WORK/check-auth.ts"
cp "$CODE/extra/sum-cost.ts" "$WORK/sum-cost.ts"
step 12 "$WORK" 'node sum-cost.ts'
step 13 "$WORK" 'node check-auth.ts; echo "claude-agent-sdk $(npm pkg get version --prefix node_modules/@anthropic-ai/claude-agent-sdk 2>/dev/null)"; npx promptfoo --version'
