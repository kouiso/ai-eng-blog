#!/usr/bin/env bash
# 記事の bash のコードブロックを、記事に書いた順に1つずつ実行して run/NN.log に残す。
# 1つのコードブロックを1つのログにする。ブロックの中身はそのまま bash -c に渡す。
# 使い方: run-all.sh <作業場所の親フォルダ> <run ログの出力先>
set -u
WORK_PARENT="$(cd "$1" && pwd)"
RUN_DIR="$2"
CODE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$RUN_DIR"

mask() {
  # 作業場所の絶対パスとホームフォルダを置き換え、64桁の16進（Inspector の API トークン）を *** にする
  sed -e "s#$WORK_PARENT#/path/to#g" -e "s#$HOME#~#g" -e 's/[0-9a-f]\{64\}/***/g'
}

header() {
  echo "date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "cwd: $(pwd | mask)"
  echo "node: $(node -v) / npm: $(npm -v)"
  echo "command:"
  printf '%s\n' "$1" | sed 's/^/  /'
  echo "--- output (stdout+stderr) ---"
}

log_run() {
  local n="$1" cmd="$2" f="$RUN_DIR/$1.log"
  header "$cmd" > "$f"
  bash -c "$cmd" 2>&1 | mask >> "$f"
  local code=${PIPESTATUS[0]}
  echo "--- exit=$code" >> "$f"
}

cd "$WORK_PARENT"
rm -rf inspector-demo
log_run 01 'node -v'
log_run 02 'mkdir inspector-demo
cd inspector-demo'
cd inspector-demo
# 記事の package.json と server.ts を、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR/package.json" "$CODE_DIR/server.ts" .
log_run 03 'npm install'
log_run 04 'npx @modelcontextprotocol/inspector --version'
log_run 05 'npx @modelcontextprotocol/inspector --cli node server.ts --method tools/list'
log_run 06 'npx @modelcontextprotocol/inspector --cli node server.ts --method tools/call --tool-name count_chars --tool-arg text=MCPサーバー'
log_run 07 'npx @modelcontextprotocol/inspector --cli node server.ts --method tools/call --tool-name count_chars --tool-arg text=2026
echo $?'
log_run 08 "npx @modelcontextprotocol/inspector --cli node server.ts --method tools/call --tool-name count_chars --tool-args-json '{\"text\":\"2026\"}'"
log_run 09 'npx @modelcontextprotocol/inspector --cli node server.ts --method tools/call --tool-name count_char --tool-arg text=MCP
echo $?'
log_run 10 'npx @modelcontextprotocol/inspector --cli node servr.ts --method tools/list
echo $?'

# 画面（Web）: 記事のコマンドを端末と同じくプロセスグループごと起動し、画面の操作を確かめてから Ctrl+C（SIGINT）で止める
WEB_CMD='npx @modelcontextprotocol/inspector node server.ts'
RAW="$WORK_PARENT/web-raw.out"
had_dir=no; [ -e "$HOME/.mcp-inspector" ] && had_dir=yes
header "$WEB_CMD" > "$RUN_DIR/11.log"
setsid bash -c "$WEB_CMD" > "$RAW" 2>&1 &
WEB_PID=$!
for i in $(seq 1 60); do curl -fsS http://127.0.0.1:6274/healthz > /dev/null 2>&1 && break; sleep 1; done
sleep 2
cp "$CODE_DIR/extra/web-ui-check.mjs" "$WORK_PARENT/web-ui-check.mjs"
mkdir -p "$WORK_PARENT/node_modules"
ln -sfn /opt/node-tools/node_modules/playwright "$WORK_PARENT/node_modules/playwright"
{
  header "node web-ui-check.mjs <起動時の出力>（記事に載せない確認。11 のサーバーが動いているあいだに実行）"
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node "$WORK_PARENT/web-ui-check.mjs" "$RAW" 2>&1 | mask
  echo "--- exit=${PIPESTATUS[0]}"
} > "$RUN_DIR/12.log"
kill -INT -- "-$WEB_PID"
wait "$WEB_PID"; web_code=$?
sleep 1
mask < "$RAW" >> "$RUN_DIR/11.log"
{
  echo "--- exit=$web_code"
  echo "--- note: 端末の Ctrl+C と同じく、プロセスグループに SIGINT を送って止めた。止めたあとの healthz: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:6274/healthz)（000 は接続できない＝止まっている）"
  echo "--- note: 実行前に ~/.mcp-inspector があったか: $had_dir。Inspector が作った ~/.mcp-inspector の中身: $(cd "$HOME" && find .mcp-inspector -type f 2>/dev/null | tr '\n' ' ')"
} >> "$RUN_DIR/11.log"
if [ "$had_dir" = no ]; then rm -rf "$HOME/.mcp-inspector"; fi
rm -f "$RAW"

# 以下は記事に載せない確認
# 13: server.ts の型を TypeScript 7.0.2 で確かめる（Node.js は型を検査せずに実行するため）
cp "$CODE_DIR/extra/tsconfig.typecheck.json" .
log_run 13 'npx -y -p typescript@7.0.2 tsc -p tsconfig.typecheck.json && npx -y -p typescript@7.0.2 tsc -v'
rm -f tsconfig.typecheck.json
# 14: --method を省いたときの終わり方（本文の1文の根拠）
log_run 14 'npx @modelcontextprotocol/inspector --cli node server.ts
echo $?'
