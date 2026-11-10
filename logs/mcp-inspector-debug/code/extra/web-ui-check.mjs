// 記事の「画面で調べる」節の操作を、ヘッドレスの Chromium で同じ順に行い、画面に出た文字を記録する。
// 使い方: node web-ui-check.mjs <起動時の出力を保存したファイル>
// トークンは起動時の出力から読み、ログには書かない。
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const banner = readFileSync(process.argv[2], "utf8");
const token = banner.match(/Auth token: ([0-9a-f]+)/)[1];
const url = `http://127.0.0.1:6274?MCP_INSPECTOR_API_TOKEN=${token}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const show = async (label, locator) => {
  const snap = await locator.ariaSnapshot();
  const kept = snap
    .split("\n")
    .filter((l) => !/button "(Pin|Expand|Replay|Edit and replay)"|- img$/.test(l));
  console.log(`=== ${label}\n${kept.join("\n")}`);
};

await page.goto(url);
await page.waitForTimeout(2000);
await show("1. 開いた直後", page.locator("main"));

await page.getByRole("switch", { name: 'Connect or disconnect "node"' }).click({ force: true });
await page.waitForTimeout(3000);
await show("2. スイッチを入れたあと", page.locator("body"));

await page.locator("label", { hasText: /^Tools$/ }).click();
await page.waitForTimeout(1500);
await page.getByRole("button", { name: /count_chars/ }).click();
await page.waitForTimeout(1000);
await show("3. Tools で count_chars を選んだあと", page.locator("main"));

await page.getByRole("textbox", { name: "text" }).fill("2026");
await page.getByRole("button", { name: "Execute Tool" }).click();
await page.waitForTimeout(2500);
await show("4. text に 2026 を入れて Execute Tool を押したあと", page.locator("main"));

await page.locator("label", { hasText: /^Console$/ }).click();
await page.waitForTimeout(1500);
await show("5. 右側の Console を開いたあと", page.locator("main"));

await browser.close();
