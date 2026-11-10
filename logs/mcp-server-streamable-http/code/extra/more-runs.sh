#!/usr/bin/env bash
# 記事には載せない。all-runs.sh（run/01〜34）のあとに続けて、run/35〜50 を取る台本。
# 使い方: more-runs.sh <作業場所>（all-runs.sh を実行し終えた作業場所。char-count-http が手順2の形に戻っていること）
# 35〜36: 手順3の `node dist/check.js` を30回続けて動かし、回ごとに ok: の行と AbortError の行の数を数える。
# 37〜38: @types/express を外したとき・戻したときの型チェック（別の作業フォルダ char-count-http-notypes）。
# 39〜43: 悪い例2（app.all の受け口を消す）で、同じクライアントを30回動かす。
# 44〜50: ALLOWED_ORIGINS に http://localhost:5173 を入れ、ブラウザが送るプリフライト（OPTIONS）と
#         Origin 付きの POST を curl でまねる。最後に手順2の形に戻す。
set -u
W="$1"
P="$W/char-count-http"
Q="$W/char-count-http-notypes"
R="$W/code/extra/run.sh"
STOP="$W/code/extra/stop-server.sh"
wait_up() { for _ in $(seq 1 50); do curl -s -o /dev/null http://127.0.0.1:3000/ 2>/dev/null && return 0; sleep 0.1; done; return 1; }
start_bg() { bash "$R" "$1" "$P" 'npm start' > "$W/bg-$1.out" 2>&1 & BG=$!; wait_up; }
stop_bg() { bash "$STOP"; wait "$BG"; }

LOOP30='for i in $(seq 1 30); do out="$(node dist/check.js 2>&1)"; echo "run $i ok=$(printf "%s\n" "$out" | grep -c "^ok:") abort=$(printf "%s\n" "$out" | grep -c "AbortError") notfound=$(printf "%s\n" "$out" | grep -c "Not Found")"; done'
CURL_PREFLIGHT='curl -sS -i -X OPTIONS http://127.0.0.1:3000/mcp \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"'
CURL_POST_ORIGIN='curl -sS -i -X POST http://127.0.0.1:3000/mcp \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '"'"'{"jsonrpc":"2.0","id":1,"method":"tools/list"}'"'"''

# 手順3のクライアントを30回
start_bg 35
bash "$R" 36 "$P" "$LOOP30"
stop_bg
# @types/express を外す・戻す
mkdir -p "$Q/src"
cp "$W/code/package.json" "$W/code/tsconfig.json" "$Q/" && cp "$W/code/src/server.ts" "$W/code/src/check.ts" "$Q/src/"
bash "$R" 37 "$Q" 'npm pkg delete "devDependencies.@types/express" && npm install --silent && npx tsc --noEmit; echo "tsc_exit=$?"'
bash "$R" 38 "$Q" 'npm pkg set "devDependencies.@types/express=5.0.6" && npm install --silent && npx tsc --noEmit; echo "tsc_exit=$?"'
# 悪い例2を30回
bash "$R" 39 "$P" 'cp ../code/extra/server.no-405.ts src/server.ts && diff ../code/src/server.ts src/server.ts'
bash "$R" 40 "$P" 'npm run build'
start_bg 41
bash "$R" 42 "$P" "$LOOP30"
stop_bg
bash "$R" 43 "$P" 'cp ../code/src/server.ts src/server.ts && diff ../code/src/server.ts src/server.ts && echo same'
# ブラウザからの呼び出しをまねる
bash "$R" 44 "$P" 'cp ../code/extra/server.cors-check.ts src/server.ts && diff ../code/src/server.ts src/server.ts'
bash "$R" 45 "$P" 'npm run build'
start_bg 46
bash "$R" 47 "$P" "$CURL_PREFLIGHT"
bash "$R" 48 "$P" "$CURL_POST_ORIGIN"
stop_bg
bash "$R" 49 "$P" 'cp ../code/src/server.ts src/server.ts && diff ../code/src/server.ts src/server.ts && echo same'
bash "$R" 50 "$P" 'npm run build'
