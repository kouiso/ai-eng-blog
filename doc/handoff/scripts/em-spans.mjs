// usage: node em-spans.mjs <emdash package dir> <articles dir>  -> em-marked spans per article
import {readdirSync,readFileSync} from 'node:fs';import {pathToFileURL} from 'node:url';
const {markdownToPortableText}=await import(pathToFileURL(process.argv[2]+'/dist/client/index.mjs').href);
let n=0,blocks=0;const out=[];
for(const f of readdirSync(process.argv[3]).filter(x=>x.endsWith('.md')).sort()){
 const body=readFileSync(process.argv[3]+'/'+f,'utf8').replace(/^---\n[\s\S]*?\n---\n/,'').trim();
 const pt=markdownToPortableText(body);
 const walk=(b,where)=>{for(const s of b.children??[])if((s.marks??[]).includes('em')){n++;out.push(f.slice(0,-3)+' | '+where+' | '+JSON.stringify(s.text))}};
 for(const b of pt){if(b._type==='block')walk(b,'para');if(b._type==='table')for(const r of b.rows??[])for(const c of r.cells??[])walk({children:c.content},'table')}
}
console.log('em spans',n);console.log(out.join('\n'));
