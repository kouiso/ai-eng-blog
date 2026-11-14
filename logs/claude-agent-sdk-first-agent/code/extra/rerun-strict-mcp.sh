#!/usr/bin/env bash
# 2026-11-11 の再実行。hello.ts と agent.ts に strictMcpConfig: true を足したので、記事の手順を最初から
# 1つずつ実行し直して run/15.log〜26.log に残す（run-all.sh と同じ手順。番号だけ続きにした）。
# 26 は前提の Node.js の版の確認（run-node-versions.sh の 12 と同じ）で、新しい hello.ts を Node.js 20 で動かす。
# 使い方: rerun-strict-mcp.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ> <Node.js 20 の bin>
# ログにはアカウント名、メールアドレス、セッションの ID、認証情報を出さない（記事のコードもそれらを表示しない）。
set -u
WORK_PARENT="$1"
RUN_DIR="$2"
TC_DIR="$3"
NODE20_BIN="$4"
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

cd "$WORK_PARENT"
rm -rf first-agent
log_run 15 "node -v"
log_run 16 'test -n "$ANTHROPIC_API_KEY" && echo set || echo unset'
mkdir first-agent
cd first-agent
log_run 17 "$(printf 'npm init -y\nnpm pkg set type=module')"
log_run 18 "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322"
log_run 19 "npm pkg get type dependencies"
log_run 20 "ls node_modules/@anthropic-ai"
cp "$CODE_DIR"/hello.ts "$CODE_DIR"/agent.ts .
log_run 21 "node hello.ts"
log_run 22 "$(cat "$CODE_DIR"/setup-tasks.sh)"
log_run 23 "node agent.ts"
cp "$CODE_DIR"/extra/tsconfig.typecheck.json .
log_run 24 "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
# agent.ts をもう一度動かし、ツールを呼ぶ順番と回数が1回目と同じかを見る（記事の注記の裏付け）
log_run 25 "node agent.ts"
# 新しい hello.ts を Node.js 20 で動かす（22.18.0 より前の版では .ts を直接動かせないことの根拠）
PATH="$NODE20_BIN:$PATH" log_run 26 "node hello.ts"
cp package.json "$CODE_DIR"/package.json
cd "$WORK_PARENT"
