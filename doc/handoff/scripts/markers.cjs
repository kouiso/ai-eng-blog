const {chromium}=require('playwright');const fs=require('fs');
const slugs=Object.keys(JSON.parse(fs.readFileSync('ids30.json')));
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
let T={cells:0,urlJustify:0,urlExpected:0,urlMissed:0,numLeft:0,numExpected:0,numMissed:0,leftNotNum:0,justNotUrl:0,otherAlign:0,styleOther:0,wrapperSeen:0};const miss=[],ex=[];
const NUM=/^[v^~]?\d[\d.\-/: ]*$/,URL_=/^https?:\/\/\S+$/;
for(const s of slugs){await p.goto('http://localhost:8787/posts/'+s,{waitUntil:'domcontentloaded'});
 const cells=await p.evaluate(()=>[...document.querySelectorAll('[data-prose] td,[data-prose] th')].map(c=>({t:c.textContent.trim(),st:c.getAttribute('style')||'',tag:c.tagName,wrap:!!c.closest('.emdash-table-wrapper')})));
 for(const c of cells){T.cells++;if(c.wrap)T.wrapperSeen++;
  const isU=URL_.test(c.t),isN=NUM.test(c.t);const j=/text-align:\s*justify/.test(c.st),l=/text-align:\s*left/.test(c.st);
  if(c.st&&!j&&!l)T.styleOther++;
  if(isU){T.urlExpected++;if(j)T.urlJustify++;else{T.urlMissed++;miss.push([s,c.t,c.st])}}
  else if(isN){T.numExpected++;if(l)T.numLeft++;else{T.numMissed++;miss.push([s,c.t,c.st])}}
  if(l&&!isN)T.leftNotNum++;if(j&&!isU)T.justNotUrl++;
  if(!ex.length&&j)ex.push(c);}
}
console.log(JSON.stringify(T));console.log(JSON.stringify(miss.slice(0,10)));console.log(JSON.stringify(ex));
await b.close()})();
