#!/usr/bin/env bash
# 使い方: run.sh <ログの番号> <作業フォルダ> '<コマンド文字列>'
# logs/rag-hybrid-search-rrf/code/extra/run.sh をもとに、コマンドを1つの文字列で受け取って bash -c で実行し、
# 記事に書いた形（改行の \ や引用符を含む）のまま command: に記録するようにしたもの。記事には載せない。
# 記事のコマンドを作業フォルダで実行し、logs/mcp-server-streamable-http/run/<番号>.log に1回分を書く。
# 実行した場所の絶対パスは /path/to に置き換える。書いたログは確認のため標準出力にも出す。
set -u
num="$1"; dir="$2"; cmd="$3"
log="$(cd -P "$(dirname "$0")/../.." && pwd)/run/${num}.log"
base="$(dirname "$dir")"
started="$(date '+%Y-%m-%d %H:%M:%S %z')"
start=$(date +%s%N)
out="$(cd "$dir" && bash -c "$cmd" 2>&1)"; code=$?
end=$(date +%s%N)
{
  echo "date: ${started}"
  echo "cwd: /path/to/$(basename "$dir")"
  echo "node: $(node -v)"
  echo "npm: $(npm -v)"
  echo "command: ${cmd}"
  echo "exit: ${code}"
  echo "elapsed: $(( (end - start) / 1000000 )) ms"
  echo "--- stdout+stderr ---"
  printf '%s\n' "$out" | sed "s#${base}#/path/to#g"
} > "$log"
echo "wrote $log (exit ${code})"
cat "$log"
