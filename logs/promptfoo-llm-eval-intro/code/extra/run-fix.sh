#!/usr/bin/env bash
# 2026-11-11 の修正（設定に strict_mcp_config を足した）のあとで、記事の手順を空の作業フォルダからやり直し、
# run/14.log〜23.log に残す（記事には載せない）。01〜13 は前の実行のログとしてそのまま残す。
# 使い方: bash run-fix.sh <作業フォルダの親> <logs/promptfoo-llm-eval-intro の絶対パス>
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

rm -rf "$WORK" "$TC"
mkdir -p "$BASE"

step 14 "$BASE" 'test -n "$ANTHROPIC_API_KEY" && echo set || echo unset'
step 15 "$BASE" 'mkdir promptfoo-intro
cd promptfoo-intro
npm init -y > /dev/null
npm pkg set type=module
npm install --save-exact promptfoo@0.125.1 @anthropic-ai/claude-agent-sdk@0.3.322'
step 16 "$WORK" 'npm pkg get type dependencies'
cp "$CODE/promptfooconfig.yaml" "$WORK/promptfooconfig.yaml"
cp "$CODE/show-failures.ts" "$WORK/show-failures.ts"
step 17 "$WORK" 'npx promptfoo eval --no-share -o results.jsonl
echo $?'
step 18 "$WORK" 'node show-failures.ts'
step 19 "$WORK" 'npx promptfoo eval --no-share -o results.jsonl
echo $?'
step 20 "$WORK" 'node show-failures.ts'
cp "$CODE/extra/sum-cost.ts" "$WORK/sum-cost.ts"
step 21 "$WORK" 'node sum-cost.ts'
cp "$CODE/extra/promptfooconfig.no-system-prompt.yaml" "$WORK/promptfooconfig.no-system-prompt.yaml"
step 22 "$WORK" 'npx promptfoo eval --no-share -c promptfooconfig.no-system-prompt.yaml'
cp "$CODE/extra/check-auth.ts" "$WORK/check-auth.ts"
step 23 "$WORK" 'node check-auth.ts; echo "claude-agent-sdk $(npm pkg get version --prefix node_modules/@anthropic-ai/claude-agent-sdk 2>/dev/null)"; npx promptfoo --version'
