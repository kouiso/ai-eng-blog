const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
for(const s of Object.keys(JSON.parse(fs.readFileSync('ids30.json')))){await p.goto('http://localhost:8767/posts/'+s,{waitUntil:'domcontentloaded'});
const r=await p.evaluate(()=>[...document.querySelectorAll('[data-prose] a')].filter(a=>a.querySelector('code')).map(a=>a.outerHTML));
r.forEach(x=>console.log(s,x));}
await b.close()})();
