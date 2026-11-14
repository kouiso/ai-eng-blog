claude -p "1+1 の答えを数字だけで答えてください。" \
  --model haiku \
  --output-format stream-json --verbose \
  --setting-sources "" --strict-mcp-config --tools "" \
  | jq -c 'select(.type == "system" and .subtype == "init") | {apiKeySource, model}'
