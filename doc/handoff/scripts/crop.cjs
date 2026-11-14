const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:900},deviceScaleFactor:2});const p=await ctx.newPage();
await p.goto('http://localhost:8767/posts/rag-retrieval-eval-recall-mrr',{waitUntil:'networkidle'});
const t=p.locator('[data-prose] table').nth(2);await t.scrollIntoViewIfNeeded();await p.screenshot({path:'shots/crop390.png'});await b.close()})();
