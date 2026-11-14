#!/usr/bin/env bash
# ask.ts に strictMcpConfig: true を足したあとの再実行（2026-11-11）。run-all.sh と同じ手順で作業フォルダを作り直し、
# 記事のコマンドを1つずつ実行して run/19.log〜35.log に残す（01〜18 は残したまま、番号を続ける）。
# check-sample.ts と、その出力（run/06.log）はコードが変わっていないので取り直さない。
# 使い方: rerun-strict.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ>
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
log_run 19 "node -v"
log_run 20 'test -n "$ANTHROPIC_API_KEY" && echo set || echo unset'
mkdir rag-citations
cd rag-citations
log_run 21 "$(printf 'npm init -y\nnpm pkg set type=module')"
log_run 22 "npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322"
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR"/tokenize.ts "$CODE_DIR"/bm25.ts "$CODE_DIR"/docs.ts "$CODE_DIR"/verify.ts "$CODE_DIR"/ask.ts "$CODE_DIR"/check-sample.ts .
log_run 23 "ls *.ts"
log_run 24 'node ask.ts "返品できる期間は？"'
log_run 25 'node ask.ts "返品した商品の送料は？"'
log_run 26 'node ask.ts "返金はいつ？"'
# 以下は記事に載せない確認用の実行。同じ質問を4回ずつ足して、5回の結果を数える
for n in 27 28 29 30; do log_run $n 'node ask.ts "返品できる期間は？"'; done
for n in 31 32 33 34; do log_run $n 'node ask.ts "返品した商品の送料は？"'; done
cp "$CODE_DIR"/extra/tsconfig.typecheck.json .
log_run 35 "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
cd "$WORK_PARENT"
