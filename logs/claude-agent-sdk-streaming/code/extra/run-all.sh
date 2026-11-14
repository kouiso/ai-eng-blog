#!/usr/bin/env bash
# 記事の手順どおりに作業フォルダを作り、記事のコマンドを1つずつ実行して run/NN.log に残す。
# 使い方: run-all.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ> [ログ番号のずらし幅]
# ずらし幅は既定 0（run/01〜08）。2026-11-11 の2回目（strictMcpConfig を足したコード）は 8 で run/09〜16 に残した。
# npm は読者の既定の設定で動かすため、NPM_CONFIG_USERCONFIG=/dev/null で手元の ~/.npmrc を読ませない。
# ログにはアカウント名、メールアドレス、セッションの ID、認証情報を出さない（記事のコードもそれらを表示しない）。
set -u
WORK_PARENT="$1"
RUN_DIR="$2"
TC_DIR="$3"
BASE="${4:-0}"
num() { printf '%02d' $(( $1 + BASE )); }
CODE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export NPM_CONFIG_USERCONFIG=/dev/null
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
rm -rf stream-demo
log_run "$(num 1)" "node -v"
log_run "$(num 2)" 'test -n "$ANTHROPIC_API_KEY" && echo set || echo unset'
mkdir stream-demo
cd stream-demo
log_run "$(num 3)" "$(printf 'npm init -y\nnpm pkg set type=module')"
log_run "$(num 4)" "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322"
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR"/stream.ts "$CODE_DIR"/timing.ts .
log_run "$(num 5)" "node stream.ts"
log_run "$(num 6)" "node timing.ts"
# 以下は記事に載せない確認用の実行
# timing.ts をもう一度動かし、時刻のばらつきを見る（記事の注記の裏付け）
log_run "$(num 7)" "node timing.ts"
cp "$CODE_DIR"/extra/tsconfig.typecheck.json .
log_run "$(num 8)" "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
cp package.json "$CODE_DIR"/package.json
cd "$WORK_PARENT"
