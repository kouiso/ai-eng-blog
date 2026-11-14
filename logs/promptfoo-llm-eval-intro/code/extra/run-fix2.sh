#!/usr/bin/env bash
# 2026-11-11 の点検の指摘 1 を受けて、モデルを呼ばない手順（インストール、npm audit、型の確認、版の確認）だけを
# run-fix.sh と同じ端末で空の作業フォルダからやり直し、run/24.log〜27.log に残す（記事には載せない）。
# 各ログの先頭に uname -sm を足した。モデルを呼ぶ eval と query() はここでは動かさない。
# 使い方: bash run-fix2.sh <作業フォルダの親> <logs/promptfoo-llm-eval-intro の絶対パス>
set -u
BASE="$1"
LOGDIR="$2"
CODE="$LOGDIR/code"
RUN="$LOGDIR/run"
WORK="$BASE/promptfoo-intro"
TC="$BASE/typecheck"
mkdir -p "$RUN"

clean() {
  # ANSI の色コードを外し、作業フォルダの絶対パスと UUID を伏せる
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
    echo "uname: $(uname -sm)"
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

step 24 "$BASE" 'mkdir promptfoo-intro
cd promptfoo-intro
npm init -y > /dev/null
npm pkg set type=module
npm install --save-exact promptfoo@0.125.1 @anthropic-ai/claude-agent-sdk@0.3.322'
step 25 "$WORK" 'npm audit'
mkdir -p "$TC"
cp "$CODE/show-failures.ts" "$TC/show-failures.ts"
cp "$CODE/extra/tsconfig.typecheck.json" "$TC/tsconfig.json"
step 26 "$TC" 'npm init -y > /dev/null && npm install --save-exact typescript@7.0.2 @types/node@22.20.5 > /dev/null 2>&1; npx tsc -v; npm pkg get dependencies; npx tsc -p tsconfig.json; echo "tsc_exit=$?"'
step 27 "$WORK" 'npm pkg get type dependencies; npm ls promptfoo @anthropic-ai/claude-agent-sdk; npm pkg get version --prefix node_modules/@anthropic-ai/claude-agent-sdk; npx promptfoo --version'
