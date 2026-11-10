#!/usr/bin/env bash
# 記事の bash のコードブロックを、記事に書いた順に1つずつ実行して run/NN.log に残す。
# 1つのコードブロックを1つのログにする。ブロックの中身はそのまま bash -c に渡す。
# 05 以降は記事に載せない確認（本文の文の根拠）。
# 使い方: run-all.sh <作業場所の親フォルダ> <run ログの出力先>
set -u
WORK_PARENT="$(cd "$1" && pwd)"
RUN_DIR="$2"
CODE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$RUN_DIR"

mask() {
  # 作業場所の絶対パスとホームフォルダを置き換える
  sed -e "s#$WORK_PARENT#/path/to#g" -e "s#$HOME#~#g"
}

header() {
  echo "date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "cwd: $(pwd | mask)"
  echo "node: $(node -v) / npm: $(npm -v) / arch: $(uname -m)"
  echo "command:"
  printf '%s\n' "$1" | sed 's/^/  /'
  echo "--- output (stdout+stderr) ---"
}

log_run() {
  local n="$1" cmd="$2" f="$RUN_DIR/$1.log"
  header "$cmd" > "$f"
  local t0=$(date +%s)
  bash -c "$cmd" 2>&1 | mask >> "$f"
  local code=${PIPESTATUS[0]}
  local t1=$(date +%s)
  echo "--- exit=$code" >> "$f"
  echo "--- elapsed=$((t1 - t0))s" >> "$f"
}

cd "$WORK_PARENT"
rm -rf writing-helper-mcp
# 読者の初回と同じ条件で待ち時間を測るため、npm のキャッシュ（npx のパッケージも入る）を空のフォルダにする
rm -rf "$WORK_PARENT/npm-cache-empty"
export npm_config_cache="$WORK_PARENT/npm-cache-empty"
# 空のキャッシュでは npm の更新のお知らせ（npm notice）が出る。2026-11-02 の実行には出ていないので、比べられるよう切る
export npm_config_update_notifier=false
had_dir=no; [ -e "$HOME/.mcp-inspector" ] && had_dir=yes

log_run 01 'node -v'
log_run 02 'mkdir writing-helper-mcp
cd writing-helper-mcp'
cd writing-helper-mcp
# 記事の package.json、server.ts、check.ts を、記事に書いたファイル名でそのまま置く
cp "$CODE_DIR/package.json" "$CODE_DIR/server.ts" "$CODE_DIR/check.ts" .
log_run 03 'npm install'
log_run 04 'node check.ts'

# 以下は記事に載せない確認
cp "$CODE_DIR/extra/probe.ts" "$CODE_DIR/extra/list-only.ts" .
python3 "$CODE_DIR/extra/make-variants.py" . > /dev/null || exit 1
# 05: 見つからない用語で普通の Error を投げたときのコード
log_run 05 'node probe.ts server-plain-error.ts guide://glossary/agent'
# 06: 用語の表を普通のオブジェクトにしたとき、constructor を読むとどうなるか
log_run 06 'node probe.ts server-object.ts guide://glossary/prompt guide://glossary/constructor'
# 07: 記事の Map の版で constructor を読んだとき
log_run 07 'node probe.ts server.ts guide://glossary/constructor'
# 08: ResourceTemplate の list を undefined にしたときの一覧
log_run 08 'node list-only.ts server-no-list.ts'
# 09、10: 前の記事の MCP Inspector の CLI で同じ要求を送れるか
log_run 09 'npx -y @modelcontextprotocol/inspector@2.13.0 --cli node server.ts --method resources/read --uri guide://style'
log_run 10 'npx -y @modelcontextprotocol/inspector@2.13.0 --cli node server.ts --method prompts/get --prompt-name review-text --prompt-args text=MCPサーバーを作った。'
# 11: server.ts と check.ts の型を TypeScript 7.0.2 で確かめる（Node.js は型を検査せずに実行するため）
cp "$CODE_DIR/extra/tsconfig.typecheck.json" .
log_run 11 'npm install --no-save typescript@7.0.2 @types/node@22.20.5 > /dev/null && npx tsc -p tsconfig.typecheck.json && npx tsc -v'

{
  echo "--- note: 実行前に ~/.mcp-inspector があったか: $had_dir。実行後の ~/.mcp-inspector の中身: $(cd "$HOME" && find .mcp-inspector -type f 2>/dev/null | tr '\n' ' ')"
} >> "$RUN_DIR/10.log"
if [ "$had_dir" = no ]; then rm -rf "$HOME/.mcp-inspector"; fi
