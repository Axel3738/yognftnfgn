import pypdfium2 as pdfium, glob, os, re, json
from decimal import Decimal, ROUND_HALF_UP
from PIL import Image

def band(v, cuts, desc=True):
    # cuts: list of (threshold, points) evaluated in order
    for th,p in cuts:
        if (v>=th if desc else v<=th): return p
    return 0
BANDS={
 'fake':   (lambda v: band(v,[(10,10),(15,8),(20,5),(30,2)],desc=False)),
 'real':   (lambda v: band(v,[(85,10),(75,8),(65,5),(55,2)])),
 'lt500':  (lambda v: band(v,[(70,10),(55,8),(40,5),(20,2)])),
 'comm':   (lambda v: band(v,[(100,10),(60,8),(40,5),(20,2)])),
 'female': (lambda v: band(v,[(80,10),(70,8),(60,5),(50,2)])),
 'age45':  (lambda v: band(v,[(50,10),(40,8),(30,5),(20,2)])),
 'se':     (lambda v: band(v,[(85,10),(75,8),(65,5),(55,2)])),
}
W={'fake':.20,'real':.15,'lt500':.15,'comm':.20,'female':.10,'age45':.15,'se':.05}

def num(s):
    s=s.replace(',','').lower()
    m=re.match(r'^([\d.]+)(k|m)?$', s); v=float(m.group(1))
    return v*1000 if m.group(2)=='k' else v*1e6 if m.group(2)=='m' else v

def parse(path):
    slug=os.path.basename(path).replace("report-","").split("-Sep-")[0]
    pdf=pdfium.PdfDocument(path); page=pdf[0]; tp=page.get_textpage()
    t=tp.get_text_range(); lines=[l.strip() for l in t.split('\n') if l.strip()]
    o={'slug':slug,'name':lines[1],'handle':lines[2],'bio_line':lines[3]}
    i=lines.index('Followers'); o['followers']=lines[i+1].split()[0]
    j=lines.index('Avg. likes'); hdr_likes=lines[j+1].split()[0]
    k=lines.index('Engagement rate'); o['er']=lines[k+1]
    tail_start=max(i for i,l in enumerate(lines) if l==o['followers'])
    tail=lines[tail_start:]
    pct=lambda s: float(s.rstrip('%'))
    p=[pct(x) for x in tail[1:11]]
    o['fake']=p[0]; o['real']=p[1]; o['lt500']=p[6]
    assert abs(sum(p[1:6])-100)<0.2 and abs(sum(p[6:10])-100)<0.2, slug
    a=[i for i,l in enumerate(lines) if re.match(r'^>[\d.]+%',l)][0]
    e=[i for i in range(a,len(lines)) if re.search(r'<[\d.]+%$',lines[i])][0]
    z=[i for i in range(e+1,len(lines)) if re.match(r'^<[\d.]+%',lines[i])][0]
    seq=lines[e+1:z]
    assert seq[0]==hdr_likes and seq[4]==seq[0], (slug, seq)
    o['avg_likes']=seq[0]; o['comm']=float(seq[5]); o['est_reach']=seq[3]
    o['story_reach']=seq[-4]; o['paid_eng']=seq[-2]; o['paid_views']=seq[-1]
    def table(after,key):
        k=lines.index(after)
        for l in lines[k:k+40]:
            if l.startswith(key+' '):
                m=re.search(r'([\d,]+) / ([\d.]+)%\s*$', l); return float(m.group(2))
    o['female']=table('Gender split','Female'); o['age45']=table('Age split','45-64'); o['age35']=table('Age split','35-44')
    o['se']=table('Location by Country','Sweden')
    # top 3 countries
    kk=lines.index('Location by Country'); o['countries']=[l.rsplit(' ',1)[0].split(' / ')[0] for l in lines[kk+2:kk+5]]
    # scores
    sub={m:BANDS[m](o[m]) for m in W}
    raw=sum(W[m]*sub[m] for m in W)
    cap=None
    if o['fake']>30: cap=3
    if o['se']<65: cap=4 if cap is None else min(cap,4)
    if o['comm']<20: cap=5 if cap is None else min(cap,5)
    score=float(Decimal(str(raw)).quantize(Decimal('0.1'),ROUND_HALF_UP))
    o['sub']=sub; o['raw']=score; o['cap']=cap; o['score']=min(score,cap) if cap else score
    # crops for visual check
    w,h=page.get_size(); S=2
    def y_of(label, nth=0):
        s=tp.search(label); r=None
        for _ in range(nth+1): r=s.get_next()
        idx=r[0]; l,b,rr,tt=tp.get_charbox(idx); return (h-tt)*S
    img=Image.open(f"png/{slug}.png")
    y1=y_of('Fake followers')-40; y2=y_of('Followers growth')+10
    y3=y_of('Content')-10; y4=y_of('Engagement rate distribution')+10
    c1=img.crop((0,int(y1),1176,int(y2))); c2=img.crop((0,int(y3),1176,int(y4)))
    W2=980; c1=c1.resize((W2,int(c1.height*W2/1176))); c2=c2.resize((W2,int(c2.height*W2/1176)))
    both=Image.new('RGB',(W2,c1.height+c2.height+20),'white'); both.paste(c1,(0,0)); both.paste(c2,(0,c1.height+20))
    both.save(f"crops/{slug}.jpg",quality=80)
    return o

files=sorted(glob.glob("batch 1/*.pdf")+glob.glob("batch 1/extra i found/*.pdf"))
res=sorted([parse(f) for f in files], key=lambda o:-o['score'])
json.dump(res,open('scores.json','w'),indent=1,ensure_ascii=False)
print("| Profil | Följare | Falska | Real | ≤500 | Komm. | Kvinnor | 45–64 | Sverige | Råpoäng | Spärr | Betyg |")
for o in res:
    s=o['sub']
    print(f"| {o['name']} {o['handle']} | {o['followers']} | {o['fake']}% ({s['fake']}) | {o['real']}% ({s['real']}) | {o['lt500']}% ({s['lt500']}) | {o['comm']:.0f} ({s['comm']}) | {o['female']}% ({s['female']}) | {o['age45']}% ({s['age45']}) | {o['se']}% ({s['se']}) | {o['raw']} | {o['cap'] or '–'} | **{o['score']}** |")
print()
for o in res: print(o['slug'], 'ER',o['er'],'reach',o['est_reach'],'story',o['story_reach'],'paid',o['paid_eng'],'35-44',o['age35'],'countries',o['countries'])
