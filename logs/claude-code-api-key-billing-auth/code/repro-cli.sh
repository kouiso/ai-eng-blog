ANTHROPIC_API_KEY=sk-ant-invalid-demo claude auth status | grep -E '"(authMethod|apiKeySource)"'
ANTHROPIC_API_KEY=sk-ant-invalid-demo claude -p "1+1は？数字だけで答えてください。" --model haiku --tools "" --strict-mcp-config # claude.ai のコネクタのツールを読み込まない
echo "exit=$?"
