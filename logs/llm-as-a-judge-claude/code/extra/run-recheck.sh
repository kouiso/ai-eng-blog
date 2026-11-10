#!/usr/bin/env bash
# 点の揺れを確かめるための追加の実行（2026-11-10、レビューの指摘を受けて）。記事の手順どおりに新しい作業フォルダを作り、
# 変更前の grade.ts、規則を書いた基準、2行の基準を、それぞれ記事のコマンドのまま複数回動かして run/15.log〜25.log に残す。
# 使い方: run-recheck.sh <作業場所の親フォルダ> <run ログの出力先>
# ログにはアカウント名、メールアドレス、セッションの ID、認証情報を出さない（記事のコードもそれらを表示しない）。
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
    echo "node: $(node -v) / npm: $(npm -v) / os: $(uname -s) $(uname -m)"
    if [ -f node_modules/@anthropic-ai/claude-agent-sdk/package.json ]; then
      echo "claude-agent-sdk: $(node -p 'require("./node_modules/@anthropic-ai/claude-agent-sdk/package.json").version') / bundled Claude Code: $(node -p 'require("./node_modules/@anthropic-ai/claude-agent-sdk/package.json").claudeCodeVersion')"
    fi
    echo "ANTHROPIC_API_KEY: $(test -n "${ANTHROPIC_API_KEY:-}" && echo set || echo unset)"
    echo "command: ${cmd//$CODE_DIR/<code>}"
    echo "--- output (stdout+stderr) ---"
  } > "$f"
  bash -c "$cmd" > "$f.tmp" 2>&1
  local code=$?
  sed -e "s#$WORK_PARENT#<work>#g" -e "s#$CODE_DIR#<code>#g" -e "s#/root/#~/#g" "$f.tmp" >> "$f"
  rm -f "$f.tmp"
  echo "--- exit=$code" >> "$f"
  echo "===== run/$n.log"; cat "$f"
}

cd "$WORK_PARENT"
rm -rf llm-judge
mkdir llm-judge
cd llm-judge
log_run 15 "$(printf 'npm init -y\nnpm pkg set type=module\nnpm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322')"
cp "$CODE_DIR"/judge.ts "$CODE_DIR"/rubric.md "$CODE_DIR"/rubric-vague.md .
# c の回答を書き直す前の grade.ts（記事の diff の「変更前」）を3回
cp "$CODE_DIR"/extra/grade-first.ts grade.ts
log_run 16 "node grade.ts rubric.md"
log_run 17 "node grade.ts rubric.md"
log_run 18 "node grade.ts rubric.md"
# 記事に載せた grade.ts で、規則を書いた基準を3回
cp "$CODE_DIR"/grade.ts grade.ts
log_run 19 "node grade.ts rubric.md"
log_run 20 "node grade.ts rubric.md"
log_run 21 "node grade.ts rubric.md"
# 2行の基準を4回（run/11.log と合わせて5回）
log_run 22 "node grade.ts rubric-vague.md"
log_run 23 "node grade.ts rubric-vague.md"
log_run 24 "node grade.ts rubric-vague.md"
log_run 25 "node grade.ts rubric-vague.md"
cd "$WORK_PARENT"
