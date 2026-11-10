#!/usr/bin/env bash
# 記事の手順どおりに作業フォルダを作り、コマンドを1つずつ実行して run/NN.log に残す（記事には載せない）。
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

rm -rf "$WORK" "$TC"
mkdir -p "$BASE"

step 01 "$BASE" 'test -n "$ANTHROPIC_API_KEY" && echo set || echo unset'
step 02 "$BASE" 'mkdir promptfoo-intro
cd promptfoo-intro
npm init -y > /dev/null
npm pkg set type=module
npm install --save-exact promptfoo@0.125.1 @anthropic-ai/claude-agent-sdk@0.3.322'
step 03 "$WORK" 'npm pkg get type dependencies'
cp "$CODE/promptfooconfig.yaml" "$WORK/promptfooconfig.yaml"
cp "$CODE/show-failures.ts" "$WORK/show-failures.ts"
step 04 "$WORK" 'npx promptfoo eval --no-share -o results.jsonl
echo $?'
step 05 "$WORK" 'node show-failures.ts'
step 06 "$WORK" 'npx promptfoo eval --no-share -o results.jsonl
echo $?'
step 07 "$WORK" 'node show-failures.ts'
cp "$CODE/extra/promptfooconfig.no-system-prompt.yaml" "$WORK/promptfooconfig.no-system-prompt.yaml"
step 08 "$WORK" 'npx promptfoo eval --no-share -c promptfooconfig.no-system-prompt.yaml'
step 09 "$WORK" 'npm audit 2>&1 | tail -12'
mkdir -p "$TC"
cp "$CODE/show-failures.ts" "$TC/show-failures.ts"
cp "$CODE/extra/tsconfig.typecheck.json" "$TC/tsconfig.json"
step 10 "$TC" 'npm init -y > /dev/null && npm install --save-exact typescript@7.0.2 @types/node@22.20.5 > /dev/null 2>&1; npx tsc -v; npx tsc -p tsconfig.json; echo "tsc_exit=$?"'
step 11 "$WORK" 'cat package.json'
