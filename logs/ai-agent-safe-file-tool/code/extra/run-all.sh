#!/usr/bin/env bash
# 記事の手順どおりに作業フォルダを作り、記事のコマンドを1つずつ実行して run/NN.log に残す。
# 使い方: run-all.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ>
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
    local shown="${cmd//$CODE_DIR/<code>}"
    echo "command: ${shown//$TC_DIR/<tc>}"
    echo "--- output (stdout+stderr) ---"
  } > "$f"
  bash -c "$cmd" > "$f.tmp" 2>&1
  local code=$?
  sed -e "s#$WORK_PARENT#<work>#g" -e "s#$CODE_DIR#<code>#g" -e "s#$TC_DIR#<tc>#g" "$f.tmp" >> "$f"
  rm -f "$f.tmp"
  echo "--- exit=$code" >> "$f"
}

cd "$WORK_PARENT"
rm -rf safe-file-tool
log_run 01 "node -v"
mkdir safe-file-tool
cd safe-file-tool
# 記事のコードブロックを、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR"/package.json "$CODE_DIR"/setup.ts "$CODE_DIR"/naive-tool.ts "$CODE_DIR"/try-naive.ts \
   "$CODE_DIR"/safe-file-tools.ts "$CODE_DIR"/try-safe.ts "$CODE_DIR"/naive-write.ts \
   "$CODE_DIR"/tools.ts "$CODE_DIR"/try-tools.ts .
log_run 02 "node setup.ts"
log_run 03 "node try-naive.ts"
log_run 04 "node try-safe.ts"
log_run 05 "node naive-write.ts"
log_run 06 "node try-tools.ts"
log_run 07 "node -e 'console.log(require(\"node:path\").win32.relative(\"C:\\\\work\", \"D:\\\\secret.txt\"))'"
log_run 08 "node -e 'const h = { read_file() {} }; console.log(typeof h[\"toString\"])'"
# 以下は記事に載せない確認用の実行
log_run 09 "ls -l workspace/notes workspace/out outside"
log_run 10 "node setup.ts && node $CODE_DIR/extra/hard-link.ts"
log_run 11 "node $CODE_DIR/extra/dotdot-name.ts"
log_run 12 "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p $CODE_DIR/extra/tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
# try-safe.ts を setup.ts なしで2回続けると結果が変わること、setup.ts のあとは元に戻ることの確認（記事の注意書きの裏付け）
log_run 13 "node setup.ts && echo '--- 1回目' && node try-safe.ts && echo '--- 2回目（setup.ts なし）' && node try-safe.ts && node setup.ts && echo '--- setup.ts のあと' && node try-safe.ts"
cd "$WORK_PARENT"
rm -rf safe-file-tool
