#!/usr/bin/env bash
# 前提の Node.js の版を確かめるための実行（記事には載せない）。
# 記事の手順どおりに作業フォルダを作り、記事の `node hello.ts` を Node.js 20 と 22 で1回ずつ動かして run/NN.log に残す。
# あわせて、プラットフォームごとの本体のパッケージ名を npm のレジストリから取って残す。
# 使い方: run-node-versions.sh <作業場所の親フォルダ> <run ログの出力先> <Node.js 20 の bin> <Node.js 22 の bin>
# ログにはアカウント名、メールアドレス、セッションの ID、認証情報を出さない（記事のコードもそれらを表示しない）。
set -u
WORK_PARENT="$1"
RUN_DIR="$2"
NODE20_BIN="$3"
NODE22_BIN="$4"
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
rm -rf first-agent
mkdir first-agent
cd first-agent
PATH="$NODE22_BIN:$PATH"
npm init -y > /dev/null
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 > /dev/null 2>&1
cp "$CODE_DIR"/hello.ts .
# 12: Node.js 20 で記事の `node hello.ts`（22.18.0 より前の版）
PATH="$NODE20_BIN:$PATH" log_run 12 "node hello.ts"
# 13: 同じフォルダで Node.js 22 の `node hello.ts`
log_run 13 "node hello.ts"
# 14: プラットフォームごとに配られる本体のパッケージ名（npm のレジストリ）
log_run 14 "npm view @anthropic-ai/claude-agent-sdk@0.3.322 optionalDependencies"
cd "$WORK_PARENT"
rm -rf first-agent
