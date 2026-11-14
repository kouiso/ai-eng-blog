#!/usr/bin/env bash
# Runs every command block of the article (code/blocks/NN-*.sh, same text as the article), in order,
# and writes run/NN.log.
# Usage: bash run-all.sh <work-dir> <claude-bin-dir>
#   <work-dir>       empty scratch directory outside the repo (deleted afterwards)
#   <claude-bin-dir> directory whose `claude` is the real Claude Code binary (no shell wrapper)
# Each block runs with `bash` and stdin from /dev/null (a terminal user types no input either).
# Blocks 01-04 run in <work-dir>; 04 creates claude-script/, and later blocks run inside it.
# Before 14, the article's exec-file.ts and ask.ts are copied into claude-script/ (the reader saves them by hand).
# The absolute work path is replaced with <work> in the logs. No block prints account data.
set -u
WORK="$1"
BIN="$2"
CODE="$(cd "$(dirname "$0")/.." && pwd)"
RUN="$CODE/../run"
mkdir -p "$WORK" "$RUN"
export PATH="$BIN:$PATH"
P="$WORK/claude-script"

for block in "$CODE"/blocks/*.sh; do
  name="$(basename "$block" .sh)"
  num="${name%%-*}"
  if [ "$num" -le 4 ]; then cwd="$WORK"; else cwd="$P"; fi
  if [ "$num" = "14" ]; then cp "$CODE/exec-file.ts" "$CODE/ask.ts" "$P/"; fi
  log="$RUN/$num.log"
  {
    echo "date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "cwd: ${cwd/#$WORK/<work>}"
    echo "node: $(node -v) / npm: $(npm -v) / os: $(uname -sm) / claude: $(claude --version) / jq: $(jq --version)"
    echo "ANTHROPIC_API_KEY: $(test -n "${ANTHROPIC_API_KEY:-}" && echo set || echo unset)"
    echo "block: code/blocks/$name.sh"
    echo "--- command ---"
    cat "$block"
    echo "--- output (stdout+stderr) ---"
    (cd "$cwd" && bash "$block" < /dev/null 2>&1)
    echo "--- exit=$?"
  } > "$log.tmp"
  python3 - "$log.tmp" "$log" "$WORK" <<'PY'
import sys
src, dst, work = sys.argv[1:4]
text = open(src, encoding="utf-8").read().replace(work, "<work>")
open(dst, "w", encoding="utf-8").write(text)
PY
  rm -f "$log.tmp"
  echo "wrote $log"
done
