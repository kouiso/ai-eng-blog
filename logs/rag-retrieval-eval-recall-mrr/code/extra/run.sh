#!/usr/bin/env bash
# 使い方: run.sh <ログの番号> <作業フォルダ> <コマンド...>
# logs/rag-hybrid-search-rrf/code/extra/run.sh を写したもの（この行と次の行のパスのほかは変えていない）。
# 記事のコマンドを作業フォルダで実行し、logs/rag-retrieval-eval-recall-mrr/run/<番号>.log に1回分を書く。
# 実行した場所の絶対パスは /path/to に置き換える。書いたログは確認のため標準出力にも出す。
# 2026-11-10 の再実行では、環境変数 LOG_DIR を指定したときだけ、run/ の代わりにそのフォルダへ書く（あとで run/ に写す）。
set -u
num="$1"; dir="$2"; shift 2
log="${LOG_DIR:-$(cd -P "$(dirname "$0")/../.." && pwd)/run}/${num}.log"
base="$(dirname "$dir")"
cmd=""
for a in "$@"; do
  case "$a" in *" "*) cmd+="\"$a\" " ;; *) cmd+="$a " ;; esac
done
start=$(date +%s%N)
out="$(cd "$dir" && "$@" 2>&1)"; code=$?
end=$(date +%s%N)
{
  echo "date: $(date '+%Y-%m-%d %H:%M:%S %z')"
  echo "cwd: /path/to/$(basename "$dir")"
  echo "node: $(node -v)"
  echo "npm: $(npm -v)"
  echo "command: ${cmd% }"
  echo "exit: ${code}"
  echo "elapsed: $(( (end - start) / 1000000 )) ms"
  echo "--- stdout+stderr ---"
  printf '%s\n' "$out" | sed "s#${base}#/path/to#g"
} > "$log"
echo "wrote $log (exit ${code})"
cat "$log"
