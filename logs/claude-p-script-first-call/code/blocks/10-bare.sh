claude -p "こんにちは" --bare --strict-mcp-config --output-format json > bare.json
echo "exit=$?"
jq '{subtype, is_error, result}' bare.json
