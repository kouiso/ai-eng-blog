import json,urllib.request,urllib.error,os
BASE=os.environ.get('BASE','http://localhost:8767')
tok=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'tok.txt')).read().strip()
_i=[0]
def rpc(m,params=None,token=True):
    _i[0]+=1
    h={'Content-Type':'application/json','Accept':'application/json, text/event-stream'}
    if token:h['Authorization']='Bearer '+tok
    r=urllib.request.Request(BASE+'/_emdash/api/mcp',data=json.dumps({"jsonrpc":"2.0","id":_i[0],"method":m,"params":params or {}}).encode(),headers=h)
    try:
        resp=urllib.request.urlopen(r);t=resp.read().decode();code=resp.status;hd=dict(resp.headers)
    except urllib.error.HTTPError as e:
        return {'http':e.code,'www':e.headers.get('WWW-Authenticate')}
    d=[l[5:] for l in t.splitlines() if l.startswith('data:')]
    return json.loads(d[0]) if d else t
def call(name,**a):
    r=rpc('tools/call',{"name":name,"arguments":a})
    res=r['result'];txt=res['content'][0]['text']
    try:j=json.loads(txt)
    except Exception:j=txt
    return res.get('isError',False),j
