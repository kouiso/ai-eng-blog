LOCAL-CHECK | head 7b847760e7a149885edd983ce2c2abc74c909a24 | npx @action-validator/cli check.yml; bash -e simulation x3 (+3 extra); npm run check (Node 24.22.3); node scripts/secret-scan.mjs origin/develop | pass 9 fail 0 | 2026-11-14T13:49:47Z

validator rc=0; simulations: normal push exit 0, zero before exit 0 (parent fallback), PR base exit 0, plus bogus before exit 0, finding case exit 1 with list, 0-file guard exit 1; npm run check 4/4; secret-scan 0 findings.
