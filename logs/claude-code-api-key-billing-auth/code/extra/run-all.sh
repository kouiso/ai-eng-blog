#!/usr/bin/env bash
# 記事の手順どおりに作業フォルダを作り、記事のコードブロックを1つずつ実行して run/NN.log に残す。
# 使い方: run-all.sh <作業場所の親フォルダ> <run ログの出力先> <tsc と @types/node を入れたフォルダ> [ログ番号に足す数]
# 4つ目を省くと 01〜13 に書く。2026-11-11 の2回目（strictMcpConfig を足したあと）は 13 を渡し、14〜26 に書いた。
# 標準入力は /dev/null（端末から打ったときと同じく、claude の -p 実行が入力待ちをしないようにするため）。
# ログにはアカウント名、メールアドレス、組織名、セッションの ID、認証情報を出さない。
# 使うキーは無効なダミーの文字列 sk-ant-invalid-demo だけ。本物のキーはどこにも書かない。
set -u
WORK_PARENT="$1"
RUN_DIR="$2"
TC_DIR="$3"
OFFSET="${4:-0}"
CODE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$RUN_DIR"

log_run() {
  local n; n=$(printf "%02d" $((10#$1 + OFFSET))); shift
  local cmd="$*"
  local f="$RUN_DIR/$n.log"
  {
    echo "date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
    echo "cwd: <work>/$(basename "$PWD")"
    echo "node: $(node -v) / npm: $(npm -v) / os: $(uname -s) $(uname -m) / claude: $(claude --version < /dev/null)"
    if [ -f node_modules/@anthropic-ai/claude-agent-sdk/package.json ]; then
      echo "claude-agent-sdk: $(node -p 'require("./node_modules/@anthropic-ai/claude-agent-sdk/package.json").version') / bundled Claude Code: $(node -p 'require("./node_modules/@anthropic-ai/claude-agent-sdk/package.json").claudeCodeVersion')"
    fi
    echo "ANTHROPIC_API_KEY (shell): $(test -n "${ANTHROPIC_API_KEY:-}" && echo set || echo unset)"
    local shown="${cmd//$CODE_DIR/<code>}"
    echo "command: ${shown//$TC_DIR/<tc>}"
    echo "--- output (stdout+stderr) ---"
  } > "$f"
  bash -c "$cmd" < /dev/null > "$f.tmp" 2>&1
  local code=$?
  sed -e "s#$WORK_PARENT#<work>#g" -e "s#$CODE_DIR#<code>#g" -e "s#$TC_DIR#<tc>#g" -e "s#$HOME#~#g" "$f.tmp" >> "$f"
  rm -f "$f.tmp"
  echo "--- exit=$code" >> "$f"
  echo "===== run/$n.log"; cat "$f"
}

cd "$WORK_PARENT"
rm -rf key-check
log_run 01 "$(cat "$CODE_DIR"/check-env.sh)"
log_run 02 "$(cat "$CODE_DIR"/auth-status.sh)"
log_run 03 "$(cat "$CODE_DIR"/repro-cli.sh)"
log_run 04 "$(cat "$CODE_DIR"/setup.sh)"
cd key-check
cp "$CODE_DIR"/check-auth.ts "$CODE_DIR"/plan-only.ts .
log_run 05 "node check-auth.ts"
log_run 06 "ANTHROPIC_API_KEY=sk-ant-invalid-demo node check-auth.ts"
log_run 07 "$(cat "$CODE_DIR"/make-env.sh)"
log_run 08 "node --env-file=.env check-auth.ts"
log_run 09 "node --env-file=.env plan-only.ts"
# 以下は記事にコードを載せない確認用の実行
# 10: 無効なキーで claude の -p 実行を JSON で受け取り、is_error、費用の見積もり、トークン数だけを取り出す
log_run 10 "ANTHROPIC_API_KEY=sk-ant-invalid-demo claude -p \"1+1は？数字だけで答えてください。\" --model haiku --tools \"\" --strict-mcp-config --output-format json | node -e 'let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const r=JSON.parse(s);console.log(JSON.stringify({type:r.type,subtype:r.subtype,is_error:r.is_error,result:r.result,total_cost_usd:r.total_cost_usd,input_tokens:r.usage&&r.usage.input_tokens,output_tokens:r.usage&&r.usage.output_tokens}))})'"
# 11: settings の env に置いたキーも使われるか（claude の -p 実行の --settings で一時的に渡す。settings のファイルは書き換えない）
log_run 11 "claude -p \"1+1は？数字だけで答えてください。\" --model haiku --tools \"\" --strict-mcp-config --settings '{\"env\":{\"ANTHROPIC_API_KEY\":\"sk-ant-invalid-demo\"}}'; echo \"exit=\$?\""
# 12: plan-only.ts を .env なしで動かしても、プランで動くこと
log_run 12 "node plan-only.ts"
# 13: 型の確認（記事には載せない）
cp "$CODE_DIR"/extra/tsconfig.typecheck.json .
log_run 13 "$TC_DIR/node_modules/.bin/tsc -v && $TC_DIR/node_modules/.bin/tsc -p tsconfig.typecheck.json --typeRoots $TC_DIR/node_modules/@types; echo tsc_exit=\$?"
cp package.json "$CODE_DIR"/package.json
cd "$WORK_PARENT"
