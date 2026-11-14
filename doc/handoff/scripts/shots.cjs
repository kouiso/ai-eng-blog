const {chromium}=require('playwright');const fs=require('fs');
const slug='mcp-server-resources-prompts',O='/home/user/notes/evidence/82-fbede26-';
(async()=>{const b=await chromium.launch();const out=[];
for(const w of [390,1440]){const ctx=await b.newContext({viewport:{width:w,height:900},deviceScaleFactor:1});const p=await ctx.newPage();
 await p.goto('http://localhost:8787/posts/'+slug,{waitUntil:'networkidle'});
 const m=await p.evaluate(()=>{const de=document.documentElement;return {docScrollW:de.scrollWidth,docClientW:de.clientWidth,bodyScrollW:document.body.scrollWidth,tables:[...document.querySelectorAll('[data-prose] table')].map(t=>{const wr=t.closest('.emdash-table-wrapper');const e=wr||t.parentElement;const cs=getComputedStyle(e),ct=getComputedStyle(t);return {wrapper:wr?'.emdash-table-wrapper':e.tagName,wrapperClientW:e.clientWidth,wrapperScrollW:e.scrollWidth,wrapperOverflowX:cs.overflowX,wrapperScrolls:e.scrollWidth>e.clientWidth,tableOverflowX:ct.overflowX,tableDisplay:ct.display,tableScrollW:t.scrollWidth,tableClientW:t.clientWidth,tableScrolls:t.scrollWidth>t.clientWidth,hasUrl:!![...t.querySelectorAll('td')].find(c=>/^https?:/.test(c.textContent.trim()))}})}});
 out.push({w,...m});console.log(JSON.stringify({w,...m}));
 await p.screenshot({path:O+'full-'+slug+'-'+w+'.png',fullPage:true});
 const idx=m.tables.findIndex(t=>t.hasUrl);const t=p.locator('[data-prose] table').nth(idx);const box=t.locator('xpath=ancestor-or-self::*[contains(@class,"emdash-table-wrapper")][1]');
 const target=(await box.count())?box:t;await target.scrollIntoViewIfNeeded();await target.screenshot({path:O+'sources-table-'+slug+'-'+w+'.png'});
 await ctx.close();}
fs.writeFileSync('measure.json',JSON.stringify(out,null,1));await b.close()})();
