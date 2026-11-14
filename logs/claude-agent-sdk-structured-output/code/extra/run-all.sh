#!/usr/bin/env bash
# 記事の手順どおりに作業フォルダを作り、記事のコマンドを1つずつ実行して run/NN.log に残す。
# 使い方: run-all.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ> [最初のログ番号（既定 1）]
# 1回目（2026-11-11、settings の行で外していた版）は既定の 1 で run/01〜16、strictMcpConfig に揃えた2回目は 18 で run/18〜33 を作った。
# ログにはアカウント名、メールアドレス、セッションの ID、認証情報、claude.ai のコネクタの名前を出さない（コードがそれらを表示しない）。
set -u
WORK_PARENT="$1"
RUN_DIR="$2"
TC_DIR="$3"
START="${4:-1}"
num() { printf '%02d' $((10#$START - 1 + $1)); }
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
      echo "claude-agent-sdk: $(node -p 'require("./node_modules/@anthropic-ai/claude-agent-sdk/package.json").version') / bundled Claude Code: $(node -p 'require("./node_modules/@anthropic-ai/claude-agent-sdk/package.json").claudeCodeVersion') / zod: $(node -p 'require("./node_modules/zod/package.json").version')"
    fi
    echo "ANTHROPIC_API_KEY: $(test -n "${ANTHROPIC_API_KEY:-}" && echo set || echo unset)"
    local shown="${cmd//$CODE_DIR/<code>}"
    echo "command: ${shown//$TC_DIR/<tc>}"
    echo "--- output (stdout+stderr) ---"
  } > "$f"
  bash -c "$cmd" > "$f.tmp" 2>&1
  local code=$?
  sed -e "s#$WORK_PARENT#<work>#g" -e "s#$CODE_DIR#<code>#g" -e "s#$TC_DIR#<tc>#g" -e "s#$HOME#~#g" "$f.tmp" >> "$f"
  rm -f "$f.tmp"
  echo "--- exit=$code" >> "$f"
  echo "===== run/$n.log"; cat "$f"
}

cd "$WORK_PARENT"
rm -rf structured-output
log_run "$(num 1)" "node -v"
log_run "$(num 2)" 'test -n "$ANTHROPIC_API_KEY" && echo set || echo unset'
mkdir structured-output
cd structured-output
log_run "$(num 3)" "$(printf 'npm init -y\nnpm pkg set type=module')"
log_run "$(num 4)" "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322 zod@4.6.7"
log_run "$(num 5)" "npm pkg get type dependencies"
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR"/classify.ts "$CODE_DIR"/impossible.ts "$CODE_DIR"/classify-zod.ts .
log_run "$(num 6)" "node classify.ts"
log_run "$(num 7)" "node impossible.ts"
log_run "$(num 8)" "MAX_STRUCTURED_OUTPUT_RETRIES=1 node impossible.ts"
log_run "$(num 9)" "node classify-zod.ts"
# 以下は記事にコードを載せない確認用の実行
cp "$CODE_DIR"/extra/classify-zod-no-target.ts "$CODE_DIR"/extra/connectors-check.ts "$CODE_DIR"/extra/tsconfig.typecheck.json .
log_run "$(num 10)" "node classify-zod-no-target.ts"
log_run "$(num 11)" "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
# impossible.ts を既定の設定であと2回動かし、結果の subtype がどう分かれるかを数える
log_run "$(num 12)" "node impossible.ts"
log_run "$(num 13)" "node impossible.ts"
# claude.ai のコネクタのツールが読み込まれるかを、名前を出さずに数える（3回）。1回目は settings の1行を外した版、2回目は strictMcpConfig: true の版
log_run "$(num 14)" "node connectors-check.ts"
log_run "$(num 15)" "node connectors-check.ts"
log_run "$(num 16)" "node connectors-check.ts"
cp package.json "$CODE_DIR"/package.json
cd "$WORK_PARENT"
