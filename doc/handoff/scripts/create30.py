import json,re,sys,glob,os
from mcp import *
ART='/home/user/e82/content/articles'
terms={t['label']:t['slug'] for t in call('taxonomy_list_terms',taxonomy='tag')[1]['items']}
out={}
for f in sorted(glob.glob(ART+'/*.md')):
    slug=os.path.basename(f)[:-3]
    t=open(f).read()
    _,fm,body=t.split('---',2)
    g=lambda k:(re.search(r'^'+k+r':\s*"(.*)"\s*$',fm,re.M) or [None,None])[1]
    tags=re.search(r'^tags:\s*\[(.*)\]',fm,re.M).group(1)
    tg=[terms[x.strip().strip('"')] for x in tags.split(',') if x.strip().strip('"') in terms]
    data={'title':g('title'),'excerpt':g('description'),'content':body.strip()}
    for k in('cost_estimate','run_environment','verified_at'):
        if g(k):data[k]=g(k)
    e,r=call('content_create',collection='posts',slug=slug,data=data,taxonomies={'tag':tg})
    if e: print('ERR',slug,str(r)[:300]);continue
    it=r['item'];rev=call('content_get',collection='posts',id=it['id'])[1]['_rev']
    e2,p=call('content_publish',collection='posts',id=it['id'],_rev=rev)
    out[slug]={'id':it['id'],'create_status':it['status'],'pub_err':e2,'tags':tg}
    print(slug,it['status'],'pub_err' if e2 else 'published',tg)
json.dump(out,open('ids30.json','w'),indent=1)
print(len(out))
