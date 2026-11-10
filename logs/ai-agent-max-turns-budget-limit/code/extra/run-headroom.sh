#!/usr/bin/env bash
# run-all.sh のあとに足した実行。記事の手順どおりに作業フォルダを作り直し、
# 余裕を持たせた maxBudgetUsd（0.0021）で最後まで終わるかを run/13.log に残す。
# 使い方: run-headroom.sh <作業場所の親フォルダ> <run ログの出力先>
set -u
unset ANTHROPIC_API_KEY
WORK_PARENT="$1"
RUN_DIR="$2"
CODE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$WORK_PARENT"
rm -rf agent-limits
mkdir agent-limits
cd agent-limits
npm init -y > /dev/null && npm pkg set type=module > /dev/null && npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 > /dev/null 2>&1
cp "$CODE_DIR"/setup.ts "$CODE_DIR"/run-agent.ts "$CODE_DIR"/turns-limit.ts "$CODE_DIR"/budget-limit.ts "$CODE_DIR"/no-catch.ts .
node setup.ts > /dev/null

f="$RUN_DIR/13.log"
{
  echo "date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "cwd: <work>/$(basename "$PWD")"
  echo "node: $(node -v) / npm: $(npm -v) / os: $(uname -s) $(uname -m)"
  echo "ANTHROPIC_API_KEY: $(test -n "${ANTHROPIC_API_KEY:-}" && echo set || echo unset)"
  echo "command: node budget-limit.ts 0.0021"
  echo "--- output (stdout+stderr) ---"
} > "$f"
node budget-limit.ts 0.0021 > "$f.tmp" 2>&1
code=$?
sed -e "s#$WORK_PARENT#<work>#g" "$f.tmp" >> "$f"
rm -f "$f.tmp"
echo "--- exit=$code" >> "$f"
cd "$WORK_PARENT"
rm -rf agent-limits
