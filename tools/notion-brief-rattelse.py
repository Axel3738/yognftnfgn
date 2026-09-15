#!/usr/bin/env python3
"""Byter ut en ordagrann rad i en Notion-briefs tabellceller och stycken.

Varför: /bildannonser rättar påståenden som produktsidan inte bär, men
/notionkorning kräver att bildens text står ordagrant i briefen. En rättelse
som bara ligger som kommentar gör att leveransrundan studsar annonsen. Därför
skrivs rättelsen in i briefen också — då säger båda samma sak.
"""
import json,os,sys,time,urllib.request,urllib.error
TOK=os.environ["NOTION_TOKEN"]
H={"Authorization":f"Bearer {TOK}","Notion-Version":"2025-09-03","Content-Type":"application/json"}
def api(m,u,b=None):
    for i in range(5):
        try:
            r=urllib.request.Request(f"https://api.notion.com/v1/{u}",
                data=json.dumps(b).encode() if b else None,headers=H,method=m)
            return json.load(urllib.request.urlopen(r))
        except urllib.error.HTTPError as e:
            if i==4: raise SystemExit(f"HTTP {e.code}: {e.read()[:300]}")
            time.sleep(1.5)
def barn(bid):
    ut=[];c=None
    while True:
        r=api("GET",f"blocks/{bid}/children?page_size=100"+(f"&start_cursor={c}" if c else ""))
        ut+=r["results"]
        if not r.get("has_more"): break
        c=r["next_cursor"]
    return ut
def txt(rt): return "".join(x.get("plain_text","") for x in rt)
def byt(rt,gam,ny):
    """Byter i den rich_text-lista där hela strängen ryms. Returnerar ny lista
    eller None om raden inte fanns."""
    if gam not in txt(rt): return None
    return [{"type":"text","text":{"content":txt(rt).replace(gam,ny)}}]
def ga(bid,gam,ny,djup=0):
    n=0
    for b in barn(bid):
        t=b["type"];v=b.get(t,{})
        if t=="table_row":
            celler=v.get("cells",[]);andrad=False;nya=[]
            for c in celler:
                r=byt(c,gam,ny)
                if r is not None: nya.append(r);andrad=True
                else: nya.append(c)
            if andrad:
                api("PATCH",f"blocks/{b['id']}",{"table_row":{"cells":nya}});n+=1
        elif "rich_text" in v:
            r=byt(v["rich_text"],gam,ny)
            if r is not None:
                api("PATCH",f"blocks/{b['id']}",{t:{"rich_text":r}});n+=1
        if b.get("has_children"): n+=ga(b["id"],gam,ny,djup+1)
    return n
if __name__=="__main__":
    pid,gam,ny=sys.argv[1],sys.argv[2],sys.argv[3]
    n=ga(pid,gam,ny)
    print(f"{'✓' if n else '✗'} {n} block bytta: {gam[:50]!r} → {ny[:50]!r}")
