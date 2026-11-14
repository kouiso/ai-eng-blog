cat error.log | claude -p "標準入力で渡したエラーログの原因を、日本語の1文で説明してください。" \
  --model haiku --output-format json \
  --setting-sources "" --strict-mcp-config --tools "" \
  | jq -r '.result'
