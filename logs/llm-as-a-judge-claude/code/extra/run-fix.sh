#!/usr/bin/env bash
# 2026-11-11 の直し（judge.ts の query() に strictMcpConfig: true を足した）のあとに、記事の手順を新しい作業フォルダで
# 最初からやり直し、記事のコマンドを記事のまま動かして run/26.log〜 に残す。
# 使い方:
#   run-fix.sh install <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ>   → run/26〜30
#   run-fix.sh run     <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ>   → run/31〜46
# ログにはアカウント名、メールアドレス、セッションの ID、認証情報、コネクタやツールの名前を出さない
# （記事のコードはそれらを表示しない。inspect.ts と maxturns1.ts は MCP のツールを数だけ出す）。
set -u
PHASE="$1"
WORK_PARENT="$2"
RUN_DIR="$3"
TC_DIR="$4"
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
    local shown="${cmd//$CODE_DIR/<code>}"
    echo "command: ${shown//$TC_DIR/<tc>}"
    echo "--- output (stdout+stderr) ---"
  } > "$f"
  bash -c "$cmd" > "$f.tmp" 2>&1
  local code=$?
  sed -e "s#$WORK_PARENT#<work>#g" -e "s#$CODE_DIR#<code>#g" -e "s#$TC_DIR#<tc>#g" -e "s#$HOME/#~/#g" "$f.tmp" >> "$f"
  rm -f "$f.tmp"
  echo "--- exit=$code" >> "$f"
  echo "===== run/$n.log"; cat "$f"
}

if [ "$PHASE" = install ]; then
  cd "$WORK_PARENT"
  rm -rf llm-judge
  log_run 26 "node -v"
  log_run 27 'test -n "$ANTHROPIC_API_KEY" && echo set || echo unset'
  mkdir llm-judge
  cd llm-judge
  log_run 28 "$(printf 'npm init -y\nnpm pkg set type=module')"
  log_run 29 "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322"
  log_run 30 "npm pkg get type dependencies"
  cp package.json "$CODE_DIR"/package.json
  exit 0
fi

cd "$WORK_PARENT/llm-judge"
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR"/judge.ts "$CODE_DIR"/rubric.md "$CODE_DIR"/rubric-vague.md .
# c の回答を書き直す前の grade.ts（記事の diff の「変更前」）を3回
cp "$CODE_DIR"/extra/grade-first.ts grade.ts
log_run 31 "node grade.ts rubric.md"
log_run 32 "node grade.ts rubric.md"
log_run 33 "node grade.ts rubric.md"
# 記事に載せた grade.ts で、規則を書いた基準を5回
cp "$CODE_DIR"/grade.ts grade.ts
log_run 34 "node grade.ts rubric.md"
log_run 35 "node grade.ts rubric.md"
log_run 36 "node grade.ts rubric.md"
log_run 37 "node grade.ts rubric.md"
log_run 38 "node grade.ts rubric.md"
# 2行の基準を5回
log_run 39 "node grade.ts rubric-vague.md"
log_run 40 "node grade.ts rubric-vague.md"
log_run 41 "node grade.ts rubric-vague.md"
log_run 42 "node grade.ts rubric-vague.md"
log_run 43 "node grade.ts rubric-vague.md"
# 以下は記事に載せない確認用の実行
cp "$CODE_DIR"/extra/inspect.ts "$CODE_DIR"/extra/maxturns1.ts "$CODE_DIR"/extra/tsconfig.typecheck.json .
log_run 44 "node inspect.ts"
log_run 45 "node maxturns1.ts"
log_run 46 "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
cd "$WORK_PARENT"
