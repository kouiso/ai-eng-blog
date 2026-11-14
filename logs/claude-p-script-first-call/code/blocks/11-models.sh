for model in haiku sonnet; do
  claude -p "TypeScript の型注釈とは何かを、日本語の1文で答えてください。" \
    --model "$model" --output-format json \
    --setting-sources "" --strict-mcp-config --tools "" \
    | jq -r '"\(.modelUsage | keys[0]) total_cost_usd=\(.total_cost_usd)"'
done
