printf 'ANTHROPIC_API_KEY=sk-ant-invalid-demo\n' > .env
grep -n "ANTHROPIC_API_KEY" .env
