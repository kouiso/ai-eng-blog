LOCAL-CHECK | head fbede26fd7c1ee2b2a6af2c06b82b4006ab28050 | Node v24.22.3 | npm ci; npm run check; npm run check:samples; node scripts/secret-scan.mjs origin/develop | pass 4 fail 0 (check) + samples 7/7 + secret-scan 0 | 2026-11-14T13:47Z
- merged origin/develop (f97ccb4) into 0974e6a (merge commit 4962c2d), then type fix
- npm run check: typecheck 0 errors, vitest 15 files / 168 tests passed, build complete (dist/client, dist/server), secret-scan 0 findings
- npm run check:samples: all 7 steps passed
- node scripts/secret-scan.mjs origin/develop: 9 files, 0 findings
- wrangler dev render check not run
Hosted CI is not claimed; these are local results only.
