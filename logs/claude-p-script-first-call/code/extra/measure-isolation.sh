#!/usr/bin/env bash
# Measures what the three isolation flags change (not an article block; the article cites the numbers).
# Usage: bash measure-isolation.sh <work-dir> <claude-bin-dir>
# Prints only derived values (token counts, seconds, whether the CLAUDE.md marker appeared).
# The answer text itself is not printed, because without the flags it reflects the owner's own settings.
set -u
WORK="$1"
BIN="$2"
export PATH="$BIN:$PATH"
mkdir -p "$WORK/isolation"
cd "$WORK/isolation"
printf '答えの最後に必ず「にゃん」と付けてください。\n' > CLAUDE.md
echo "CLAUDE.md in cwd: 答えの最後に必ず「にゃん」と付けてください。"

run() { # run <label> <extra flags...>
  local label="$1"; shift
  local start end
  start=$(python3 -c 'import time; print(time.time())')
  claude -p "1+1 の答えを数字だけで答えてください。" --model haiku --output-format json "$@" < /dev/null > out.json 2> err.txt
  local code=$?
  end=$(python3 -c 'import time; print(time.time())')
  python3 - "$label" "$code" "$start" "$end" <<'PY'
import json, sys
label, code, start, end = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
d = json.load(open("out.json"))
u = d["usage"]
prompt_tokens = u["input_tokens"] + u["cache_creation_input_tokens"] + u["cache_read_input_tokens"]
print(f"[{label}] exit={code} is_error={d['is_error']} has_nyan={'にゃん' in d['result']} "
      f"prompt_tokens={prompt_tokens} cache_creation={u['cache_creation_input_tokens']} "
      f"cache_read={u['cache_read_input_tokens']} output_tokens={u['output_tokens']} "
      f"total_cost_usd={d['total_cost_usd']} seconds={end - start:.1f}")
PY
}

run "no isolation flags"
run "--setting-sources \"\" only" --setting-sources ""
run "all three flags" --setting-sources "" --strict-mcp-config --tools ""
