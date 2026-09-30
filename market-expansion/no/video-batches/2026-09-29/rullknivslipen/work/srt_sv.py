import json,glob,os,re
def fmt(t):
    h=int(t//3600);m=int(t%3600//60);s=int(t%60);ms=int(round((t%1)*1000))
    if ms==1000: ms=999
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
def dela(c):
    txt=' '.join(x['text'] for x in c)
    if len(txt)<=70: return [c]
    best=None
    for i,x in enumerate(c[:-1]):
        if x['text'].endswith(','):
            a=len(' '.join(y['text'] for y in c[:i+1]))
            if a>=15 and len(txt)-a>=15:
                d=abs(a-len(txt)/2)
                if best is None or d<best[0]: best=(d,i)
    if best is None: return [c]
    i=best[1]; return dela(c[:i+1])+dela(c[i+1:])
for f in sorted(glob.glob('work/stt/*.json')):
    n=os.path.basename(f)[:-5]; d=json.load(open(f))
    w=[x for x in d['words'] if x.get('type')=='word']
    cues=[];cur=[]
    for x in w:
        cur.append(x)
        if re.search(r'[.?!]["”]?$',x['text']):
            cues.append(cur);cur=[]
    if cur: cues.append(cur)
    cues=[p for c in cues for p in dela(c)]
    out=[]
    for i,c in enumerate(cues):
        out.append(f"{i+1}\n{fmt(c[0]['start'])} --> {fmt(c[-1]['end'])}\n{' '.join(x['text'] for x in c)}\n")
    open(f'srt-sv/{n}.srt','w').write('\n'.join(out))
    print(n,len(cues))
