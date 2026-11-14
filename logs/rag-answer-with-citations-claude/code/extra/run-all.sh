#!/usr/bin/env bash
# 記事の手順どおりに作業フォルダを作り、記事のコマンドを1つずつ実行して run/NN.log に残す。
# logs/claude-agent-sdk-first-agent/code/extra/run-all.sh を写し、この記事のコマンドに差し替えたもの。
# 使い方: run-all.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ>
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
  sed -e "s#$WORK_PARENT#<work>#g" -e "s#$CODE_DIR#<code>#g" -e "s#$TC_DIR#<tc>#g" -e "s#$HOME/#~/#g" "$f.tmp" >> "$f"
  rm -f "$f.tmp"
  echo "--- exit=$code" >> "$f"
  echo "===== run/$n.log"; cat "$f"
}

cd "$WORK_PARENT"
rm -rf rag-citations
log_run 01 "node -v"
log_run 02 'test -n "$ANTHROPIC_API_KEY" && echo set || echo unset'
mkdir rag-citations
cd rag-citations
log_run 03 "$(printf 'npm init -y\nnpm pkg set type=module')"
log_run 04 "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322"
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR"/tokenize.ts "$CODE_DIR"/bm25.ts "$CODE_DIR"/docs.ts "$CODE_DIR"/verify.ts "$CODE_DIR"/ask.ts "$CODE_DIR"/check-sample.ts .
log_run 05 "ls *.ts"
log_run 06 "node check-sample.ts"
log_run 07 'node ask.ts "返品できる期間は？"'
log_run 08 'node ask.ts "返品した商品の送料は？"'
log_run 09 'node ask.ts "返金はいつ？"'
# 以下は記事に載せない確認用の実行。同じ質問を4回ずつ足して、5回の結果を数える
for n in 10 11 12 13; do log_run $n 'node ask.ts "返品できる期間は？"'; done
for n in 14 15 16 17; do log_run $n 'node ask.ts "返品した商品の送料は？"'; done
cp "$CODE_DIR"/extra/tsconfig.typecheck.json .
log_run 18 "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
cp package.json "$CODE_DIR"/package.json
cd "$WORK_PARENT"
