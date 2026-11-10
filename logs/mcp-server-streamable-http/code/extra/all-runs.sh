#!/usr/bin/env bash
# 記事には載せない。run/01.log〜34.log を、記事の手順の順に空の作業場所で取り直すための台本。
# 使い方: all-runs.sh <作業場所>（中に code -> logs/mcp-server-streamable-http/code のリンクを置いた空のフォルダ）
# ターミナル1の `npm start` は run.sh をバックグラウンドで動かし、stop-server.sh の SIGINT（Ctrl+C と同じ）で止める。
# claude のコマンドは、作業場所の tmp-home を HOME にして動かす（自分の設定を読まず、ログインもしない）。
set -u
W="$1"
P="$W/char-count-http"
R="$W/code/extra/run.sh"
STOP="$W/code/extra/stop-server.sh"
wait_up() { for _ in $(seq 1 50); do curl -s -o /dev/null http://127.0.0.1:3000/ 2>/dev/null && return 0; sleep 0.1; done; return 1; }
start_bg() { bash "$R" "$1" "$P" 'npm start' > "$W/bg-$1.out" 2>&1 & BG=$!; wait_up; }
stop_bg() { bash "$STOP"; wait "$BG"; }

CURL_CALL='curl -sS -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '"'"'{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"count_chars","arguments":{"text":"こんにちは"}}}'"'"' \
  -w "\nstatus: %{http_code} %{content_type}\n"'
CURL_NO_ACCEPT='curl -sS -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" \
  -d '"'"'{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"count_chars","arguments":{"text":"こんにちは"}}}'"'"' \
  -w "\nstatus: %{http_code} %{content_type}\n"'
CURL_GET='curl -sS http://127.0.0.1:3000/mcp -w "\nstatus: %{http_code} %{content_type}\n"'
CURL_ORIGIN='curl -sS -X POST http://127.0.0.1:3000/mcp \
  -H "Origin: https://evil.example" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '"'"'{"jsonrpc":"2.0","id":1,"method":"tools/list"}'"'"' \
  -w "\nstatus: %{http_code} %{content_type}\n"'
CURL_HOST='curl -sS -X POST http://127.0.0.1:3000/mcp \
  -H "Host: evil.example:3000" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '"'"'{"jsonrpc":"2.0","id":1,"method":"tools/list"}'"'"' \
  -w "\nstatus: %{http_code} %{content_type}\n"'
CURL_LIST='curl -sS -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '"'"'{"jsonrpc":"2.0","id":1,"method":"tools/list"}'"'"' \
  -o /dev/null -w "status: %{http_code} %{content_type} %{size_download} bytes\n"'

# 1. 準備
bash "$R" 01 "$W" 'mkdir -p char-count-http/src'
bash "$R" 02 "$P" 'cp ../code/package.json ../code/tsconfig.json . && cp ../code/src/server.ts ../code/src/check.ts src/ && find . -type f | sort'
bash "$R" 03 "$P" 'npm install'
# 2〜3. ビルド、起動、SDK のクライアント
bash "$R" 04 "$P" 'npm run build'
start_bg 05
bash "$R" 06 "$P" 'npm run check'
# 4. curl で中身を見る
bash "$R" 07 "$P" "$CURL_CALL"
bash "$R" 08 "$P" "$CURL_NO_ACCEPT"
bash "$R" 09 "$P" "$CURL_GET"
bash "$R" 10 "$P" "$CURL_ORIGIN"
bash "$R" 11 "$P" "$CURL_HOST"
# 5. Claude Code に登録
mkdir -p "$W/tmp-home"
HOME="$W/tmp-home" bash "$R" 12 "$P" 'claude --version'
HOME="$W/tmp-home" bash "$R" 13 "$P" 'claude mcp add --transport http --scope user char-count-http http://127.0.0.1:3000/mcp'
HOME="$W/tmp-home" bash "$R" 14 "$P" 'claude mcp list'
HOME="$W/tmp-home" bash "$R" 15 "$P" 'claude mcp get char-count-http'
HOME="$W/tmp-home" bash "$R" 16 "$P" 'claude mcp remove char-count-http -s user'
stop_bg
# ハマりどころ1: トランスポートを使い回す
bash "$R" 17 "$P" 'cp ../code/extra/server.reuse.ts src/server.ts && diff ../code/src/server.ts src/server.ts'
bash "$R" 18 "$P" 'npm run build'
start_bg 19
bash "$R" 20 "$P" 'npm run check'
bash "$R" 21 "$P" "$CURL_LIST"
bash "$R" 22 "$P" "$CURL_LIST"
stop_bg
bash "$R" 23 "$P" 'node ../code/extra/reuse-cause.mjs'
# ハマりどころ2: GET に 405 を返さない
bash "$R" 24 "$P" 'cp ../code/extra/server.no-405.ts src/server.ts && diff ../code/src/server.ts src/server.ts'
bash "$R" 25 "$P" 'npm run build'
start_bg 26
bash "$R" 27 "$P" 'npm run check'
stop_bg
# 元に戻して手順3と同じ結果になることを確かめる
bash "$R" 28 "$P" 'cp ../code/src/server.ts src/server.ts && diff ../code/src/server.ts src/server.ts && echo same'
bash "$R" 29 "$P" 'npm run build'
start_bg 30
bash "$R" 31 "$P" 'npm run check'
stop_bg
# 版の確認
bash "$R" 32 "$P" 'npm ls @modelcontextprotocol/sdk zod typescript @types/express @types/node express @hono/node-server'
bash "$R" 33 "$P" 'npm view @modelcontextprotocol/sdk version engines'
bash "$R" 34 "$P" 'npx tsc --noEmit --skipLibCheck false; echo "tsc_exit=$?"'
