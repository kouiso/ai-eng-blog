#!/usr/bin/env bash
# 記事の bash のコードブロックを、記事に書いた順に1つずつ実行して run/NN.log に残す。
# 1つのコードブロックを1つのログにする（10 と 11 は同じコマンドを、server.ts を直す前と後に実行したもの）。
# ブロックの中身はそのまま bash -c に渡す。
# 使い方: run-all.sh <作業場所の親フォルダ> <run ログの出力先>
set -u
WORK_PARENT="$(cd "$1" && pwd)"
RUN_DIR="$2"
CODE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_HOME="$WORK_PARENT/tmp-home" # Claude Code の設定を書く使い捨てのホームフォルダ
mkdir -p "$RUN_DIR"

mask() {
  # 使い捨てのホームを ~ に、作業場所の絶対パスを /path/to に、本当のホームを ~ に置き換える
  sed -e "s#$TMP_HOME#~#g" -e "s#$WORK_PARENT#/path/to#g" -e "s#$HOME#~#g"
}

header() {
  echo "date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "cwd: $(pwd | mask)"
  echo "node: $(node -v) / npm: $(npm -v) / os: $(uname -sm)"
  if [ "${2:-}" = claude ]; then echo "claude: $(claude --version)"; echo "HOME: 使い捨てのフォルダ（ログでは ~）"; fi
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

log_run_claude() {
  local n="$1" cmd="$2" f="$RUN_DIR/$1.log"
  HOME="$TMP_HOME" header "$cmd" claude > "$f"
  HOME="$TMP_HOME" bash -c "$cmd" 2>&1 | mask >> "$f"
  local code=${PIPESTATUS[0]}
  echo "--- exit=$code" >> "$f"
}

INIT_CMD=$(cat <<'EOF'
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"manual","version":"0.0.0"}}}' | NOTES_DIR="$PWD/notes" node server.ts
EOF
)

cd "$WORK_PARENT"
rm -rf notes-mcp "$TMP_HOME"
mkdir -p "$TMP_HOME"

log_run 01 'node -v'
log_run 02 'mkdir -p notes-mcp/notes
cd notes-mcp
touch notes/todo.md notes/idea.md'
cd notes-mcp
# 記事の package.json、server.ts、check.ts（変更前）を、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR/package.json" "$CODE_DIR/server.ts" "$CODE_DIR/check.ts" .
log_run 03 'npm install'
log_run 04 'NOTES_DIR="$PWD/notes" node check.ts node server.ts'
# 記事の「変更後」の check.ts に置き換える（シェルの環境変数を env に写す4行を足したもの）
cp "$CODE_DIR/after/check.ts" check.ts
log_run 05 'NOTES_DIR="$PWD/notes" node check.ts node server.ts'
log_run_claude 06 'claude mcp add notes --scope user -e NOTES_DIR="$PWD/notes" -- node server.ts
claude mcp list'
log_run 07 'NOTES_DIR="$PWD/notes" node check.ts node servr.ts'
log_run_claude 08 '(cd ~ && claude mcp list)'
log_run_claude 09 'claude mcp remove notes -s user
claude mcp add notes --scope user -e NOTES_DIR="$PWD/notes" -- node "$PWD/server.ts"
(cd ~ && claude mcp list)'
# 記事のとおり server.ts から await server.connect(...) の1行を消す
grep -v '^await server.connect(new StdioServerTransport());$' "$CODE_DIR/server.ts" > server.ts
log_run 10 'NOTES_DIR="$PWD/notes" node check.ts node server.ts'
log_run 11 "$INIT_CMD"
# 消した1行を戻す（記事の server.ts に戻す）
cp "$CODE_DIR/server.ts" server.ts
log_run 12 "$INIT_CMD"

# 以下は記事に載せない確認
# 13: Claude Code は、claude を起動したシェルの環境変数をサーバーに渡すか（-e なしで登録して比べる）
log_run_claude 13 'claude mcp remove notes -s user
claude mcp add notes --scope user -- node "$PWD/server.ts"
(cd ~ && claude mcp list)
export NOTES_DIR="$PWD/notes"
(cd ~ && claude mcp list)
claude mcp remove notes -s user'
# 14: claude mcp の add、list、remove が、ネットワークに出られず、環境変数も PATH と HOME だけの状態で動くか
log_run_claude 14 'env -i PATH="$PATH" HOME="$HOME" HTTPS_PROXY=http://127.0.0.1:9 HTTP_PROXY=http://127.0.0.1:9 bash -c '"'"'
claude mcp add notes --scope user -e NOTES_DIR="$PWD/notes" -- node "$PWD/server.ts"
claude mcp list
claude mcp remove notes -s user
'"'"''
# 15: Connection closed 以外の失敗（コマンドが無い、応答しない）で SDK と Claude Code が出すメッセージ
cp "$CODE_DIR/extra/other-errors.mjs" .
log_run 15 'node other-errors.mjs'
rm -f other-errors.mjs
log_run_claude 16 'claude mcp add notes --scope user -- nodee server.ts
claude mcp list
claude mcp get notes
claude mcp remove notes -s user'
# 17: server.ts と check.ts（変更後）の型を TypeScript 7.0.2 で確かめる（Node.js は型を検査せずに実行するため）。
#     あわせて、process.env をそのまま env に渡すと型の検査で止まることを確かめる（direct-env.ts）
cp "$CODE_DIR/extra/tsconfig.typecheck.json" "$CODE_DIR/extra/tsconfig.direct.json" "$CODE_DIR/extra/direct-env.ts" .
log_run 17 'npm install --no-save typescript@7.0.2 @types/node@22.20.5 > /dev/null && npx tsc -v && npx tsc -p tsconfig.typecheck.json && echo "typecheck ok"
npx tsc -p tsconfig.direct.json; echo "direct-env exit=$?"'
rm -f tsconfig.typecheck.json tsconfig.direct.json direct-env.ts
# 18: package.json が記事のままか（--no-save で書き換わっていないか）
log_run 18 'cat package.json'
# 19: 変更後の check.ts を、server.ts とは別のサーバーに使う（別のコマンドと引数、別のツール、別の環境変数、環境変数とは別の起動時エラー）
cp "$CODE_DIR/extra/other.ts" "$CODE_DIR/extra/envneed.ts" "$CODE_DIR/extra/config-server.ts" .
log_run 19 'node check.ts node other.ts --flag
node check.ts sh -c "exec node other.ts x"
FOO=1 node check.ts node envneed.ts
node check.ts node config-server.ts'
rm -f envneed.ts config-server.ts
# 20: Claude Code がサーバーに渡す環境変数の名前を、claude を起動したシェルの名前と比べる（値は出さない。違う名前だけを出す）
cp "$CODE_DIR/extra/envdump.ts" .
log_run_claude 20 'export DUMP_TO="$PWD/server-env.txt"
claude mcp add dump --scope user -- node "$PWD/envdump.ts"
(cd ~ && claude mcp list)
claude mcp remove dump -s user
env | cut -d= -f1 | sort > shell-env.txt
echo "shell: $(wc -l < shell-env.txt) names / server: $(wc -l < server-env.txt) names"
echo "only in shell: $(comm -23 shell-env.txt server-env.txt | tr "\n" " ")"
echo "only in server: $(comm -13 shell-env.txt server-env.txt | tr "\n" " ")"
rm -f shell-env.txt server-env.txt'
rm -f envdump.ts other.ts
