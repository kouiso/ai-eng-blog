LOCAL-CHECK | head 0974e6ac8bd5c05c35ad6890efde88dfdd5e749e | Node v24.22.3 | npm ci; npm run check (typecheck, test, build, secret-scan); npm run check:samples | pass 3 fail 0 | 2026-11-14T13:25:26Z–13:26:22Z

- npm ci exit 0
- npm run check exit 0: typecheck 0 errors; vitest 12 files, 116 passed; astro build complete; secret-scan base origin/develop, 8 files, 0 findings
- npm run check:samples exit 0: 7 steps passed
- Under the owner ruling (local pass on the exact head counts as checks passed). Hosted CI is not claimed here.
