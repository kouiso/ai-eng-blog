LOCAL-CHECK | head 6f708fa8a7f2c0cab2ecf28234418dcec63414f0 | Node v24.22.3 | npm ci; npm run typecheck; npm test; npm run build; node scripts/secret-scan.mjs origin/develop | pass 5 fail 0 | 2026-11-14T13:26:52Z–13:28:02Z

- typecheck 0 errors; vitest 121 passed; astro build complete; secret-scan base origin/develop, 3 files, 0 findings
- this head predates `npm run check` (scripts/check.mjs root), so its four steps were run one by one; same commands
- Under the owner ruling (local pass on the exact head counts as checks passed). Hosted CI is not claimed here.
