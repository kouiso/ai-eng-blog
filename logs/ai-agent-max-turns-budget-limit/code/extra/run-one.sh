#!/usr/bin/env bash
# run-strict.sh のあとに足した実行。run-strict.sh が作った作業フォルダ（<作業場所の親フォルダ>/agent-limits）で、
# 渡したコマンドを1つ実行して run/<番号>.log に残す。maxBudgetUsd の値を実測から選び直すのと、
# 応答の数が回によって変わるかを確かめるのに使った。
# 使い方: run-one.sh <作業場所の親フォルダ> <run ログの出力先> <番号> <コマンド>
set -u
unset ANTHROPIC_API_KEY
WORK_PARENT="$1"
RUN_DIR="$2"
N="$3"
CMD="$4"
cd "$WORK_PARENT/agent-limits"
f="$RUN_DIR/$N.log"
{
  echo "date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "cwd: <work>/$(basename "$PWD")"
  echo "node: $(node -v) / npm: $(npm -v) / os: $(uname -s) $(uname -m)"
  echo "ANTHROPIC_API_KEY: $(test -n "${ANTHROPIC_API_KEY:-}" && echo set || echo unset)"
  echo "command: $CMD"
  echo "--- output (stdout+stderr) ---"
} > "$f"
bash -c "$CMD" > "$f.tmp" 2>&1
code=$?
sed -e "s#$WORK_PARENT#<work>#g" "$f.tmp" >> "$f"
rm -f "$f.tmp"
echo "--- exit=$code" >> "$f"
