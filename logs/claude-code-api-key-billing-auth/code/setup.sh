mkdir key-check
cd key-check
npm init -y > /dev/null
npm pkg set type=module
npm install --save-exact @anthropic-ai/claude-agent-sdk@0.3.322
