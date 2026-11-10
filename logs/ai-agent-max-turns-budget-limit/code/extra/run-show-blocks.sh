#!/usr/bin/env bash
# 2026-11-10 にレビューの指摘（0.0008 の回は回答の応答まで生成されていた）を確かめるために足した実行。
# 記事の手順どおりに作業フォルダを作り直し、extra/show-blocks.ts を maxBudgetUsd 0.0008 で3回、0.0005 で1回動かして run/14.log に残す。
# 使い方: run-show-blocks.sh <作業場所の親フォルダ> <run ログの出力先>
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
cp "$CODE_DIR"/setup.ts "$CODE_DIR"/run-agent.ts "$CODE_DIR"/extra/show-blocks.ts .
node setup.ts > /dev/null

cmd="node show-blocks.ts 0.0008; node show-blocks.ts 0.0008; node show-blocks.ts 0.0008; node show-blocks.ts 0.0005"
f="$RUN_DIR/14.log"
{
  echo "date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "cwd: <work>/$(basename "$PWD")"
  echo "node: $(node -v) / npm: $(npm -v) / os: $(uname -s) $(uname -m)"
  echo "ANTHROPIC_API_KEY: $(test -n "${ANTHROPIC_API_KEY:-}" && echo set || echo unset)"
  echo "command: $cmd"
  echo "--- output (stdout+stderr) ---"
} > "$f"
bash -c "$cmd" > "$f.tmp" 2>&1
code=$?
sed -e "s#$WORK_PARENT#<work>#g" "$f.tmp" >> "$f"
rm -f "$f.tmp"
echo "--- exit=$code" >> "$f"
cd "$WORK_PARENT"
rm -rf agent-limits
