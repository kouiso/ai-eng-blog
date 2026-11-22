// usage: BASE=http://localhost:8767 NODE_PATH=/opt/node-tools/node_modules node check-render.cjs <articlesDir> <out.json>
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const {marked}=require(process.env.MARKED||'/tmp/claude-0/-home-user-ai-eng-blog/c9890e66-ff84-5ec6-8a76-1c402c3c2933/scratchpad/mk/node_modules/marked');
const BASE=process.env.BASE||'http://localhost:8767';
const dir=process.argv[2],out=process.argv[3];
const body=t=>t.replace(/^---\n[\s\S]*?\n---\n/,'').trim();
const stripCode=md=>md.replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm,'').replace(/`[^`\n]*`/g,'');
const measure=(root)=>{
  const q=s=>[...root.querySelectorAll(s)];
  const inCell=q('td,th');
  const inlineCode=q('code').filter(c=>!c.closest('pre'));
  const nonCodeText=(()=>{const c=root.cloneNode(true);c.querySelectorAll('code,pre').forEach(e=>e.remove());return c.textContent})();
  const norm=s=>s.replace(/\s+/g,' ').trim();
  return {
    table:q('table').length,cells:inCell.length,cellsWithCode:inCell.filter(c=>c.querySelector('code')).length,
    inlineCode:inlineCode.length,pre:q('pre').length,a:q('a').length,aWithCode:q('a').filter(a=>a.querySelector('code')).length,
    em:q('em').length,strong:q('strong').length,li:q('li').length,h2:q('h2').length,h3:q('h3').length,p:q('p').length,br:q('br').length,
    underscores:(nonCodeText.match(/_/g)||[]).length,
    blocks:q('p,li,h2,h3,h4,td,th,pre').filter(e=>!(e.tagName==='P'&&e.closest('li,td,th'))&&!(e.tagName==='LI'&&false)).map(e=>norm(e.tagName==='LI'?[...e.childNodes].filter(n=>!(n.nodeType===1&&/^(UL|OL)$/.test(n.tagName))).map(n=>n.textContent).join(''):e.textContent))
  };};
(async()=>{
const b=await chromium.launch();const p=await (await b.newContext()).newPage();
const res={};
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.md')).sort()){
  const slug=f.slice(0,-3);const md=body(fs.readFileSync(path.join(dir,f),'utf8'));
  const html=marked.parse(md,{gfm:true,breaks:false});
  await p.goto(BASE+'/posts/'+slug,{waitUntil:'domcontentloaded'});
  const got=await p.evaluate(`(${measure.toString()})(document.querySelector('[data-prose]'))`);
  await p.setContent('<div id=x>'+html+'</div>');
  const exp=await p.evaluate(`(${measure.toString()})(document.getElementById('x'))`);
  const mdUnd=(stripCode(md).replace(/\\_/g,'_').match(/_/g)||[]).length;
  const diffs=[];const n=Math.max(got.blocks.length,exp.blocks.length);
  let strict=0,loose=0,ex=[];
  const L=s=>s.replace(/\s/g,'');
  for(let i=0;i<n;i++){const a=got.blocks[i]??'<none>',e=exp.blocks[i]??'<none>';if(a!==e){if(L(a)===L(e))loose++;else{strict++;if(ex.length<3)ex.push({i,got:a.slice(0,120),exp:e.slice(0,120)})}}}
  const keys=['table','cells','cellsWithCode','inlineCode','pre','a','aWithCode','em','strong','li','h2','h3','p','br'];
  const cnt={};for(const k of keys)cnt[k]=[got[k],exp[k]];
  res[slug]={cnt,mdUnderscores:mdUnd,renderedUnderscores:got.underscores,blocks:[got.blocks.length,exp.blocks.length],textMismatch:strict,wsOnlyMismatch:loose,examples:ex};
}
fs.writeFileSync(out,JSON.stringify(res,null,1));await b.close();})();
