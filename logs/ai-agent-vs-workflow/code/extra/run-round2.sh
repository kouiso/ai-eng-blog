#!/usr/bin/env bash
# 2回目の実行（run/14〜22）。エージェント版を workflow.ts と同じ仕事に書き直したあと、
# 記事の手順どおりに新しい作業フォルダを作り、書き直した agent.ts と、tools と systemPrompt を分けて測る確認を動かす。
# 使い方: run-round2.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ>
# ログにはアカウント名、メールアドレス、セッションの ID、認証情報を出さない（記事のコードもそれらを表示しない）。
set -u
WORK_PARENT="$1"
RUN_DIR="$2"
TC_DIR="$3"
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
  sed -e "s#$WORK_PARENT#<work>#g" -e "s#$CODE_DIR#<code>#g" -e "s#$TC_DIR#<tc>#g" -e "s#/root/#~/#g" "$f.tmp" >> "$f"
  rm -f "$f.tmp"
  echo "--- exit=$code" >> "$f"
  echo "===== run/$n.log"; cat "$f"
}

cd "$WORK_PARENT"
rm -rf vs-workflow
log_run 14 'test -n "$ANTHROPIC_API_KEY" && echo set || echo unset'
mkdir vs-workflow
cd vs-workflow
log_run 15 "$(printf 'npm init -y\nnpm pkg set type=module')"
log_run 16 "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322"
log_run 17 "npm pkg get type dependencies"
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR"/workflow.ts "$CODE_DIR"/agent.ts .
log_run 18 "$(cat "$CODE_DIR"/setup-tickets.sh)"
log_run 19 "node agent.ts"
# 以下は記事に載せない確認用の実行
cp "$CODE_DIR"/extra/tsconfig.typecheck.json .
log_run 20 "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
# 同じ agent.ts の2回目（記事の比較の表）
log_run 21 "node agent.ts"
# tools と systemPrompt を1つずつ外した4通り（記事の本文で数字だけ引く）
cp "$CODE_DIR"/extra/tools-vs-systemprompt.ts .
log_run 22 "node tools-vs-systemprompt.ts"
cd "$WORK_PARENT"
