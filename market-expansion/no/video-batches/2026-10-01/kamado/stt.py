import json,os,sys,subprocess,urllib.request,uuid,re,time
K=os.environ['ELEVENLABS_API_KEY']
def stt(name):
    out=f'stt/{name}.json'
    if os.path.exists(out): return json.load(open(out))
    wav=f'stt/{name}.mp3'
    subprocess.run(['ffmpeg','-y','-v','error','-i',f'src/{name}.mp4','-vn','-ac','1','-ar','16000','-b:a','64k',wav],check=True)
    b=uuid.uuid4().hex; data=open(wav,'rb').read()
    body=b''
    for k,v in [('model_id','scribe_v1'),('language_code','swe'),('timestamps_granularity','word'),('tag_audio_events','false')]:
        body+=f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    body+=f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n'.encode()+data+f'\r\n--{b}--\r\n'.encode()
    for f in range(6):
        try:
            req=urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text',data=body,headers={'xi-api-key':K,'Content-Type':f'multipart/form-data; boundary={b}'})
            d=json.load(urllib.request.urlopen(req,timeout=300)); break
        except urllib.error.HTTPError as e:
            print(name,e.code,e.read()[:200]); time.sleep(20*(f+1))
    json.dump(d,open(out,'w'),ensure_ascii=False)
    return d
def fmt(t):
    ms=int(round(t*1000)); return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
def srt(name,d):
    w=[x for x in d['words'] if x['type']=='word']
    cues=[];cur=[]
    for x in w:
        cur.append(x)
        txt=' '.join(c['text'] for c in cur)
        if re.search(r'[.!?]$',x['text']):
            cues.append(cur);cur=[]
    if cur: cues.append(cur)
    ut=[]
    for c in cues:
        if len(' '.join(x['text'] for x in c))>85:
            ks=[i for i,x in enumerate(c[:-1]) if x['text'].endswith(',')]
            if ks:
                k=min(ks,key=lambda i:abs(i-len(c)/2)); ut+= [c[:k+1],c[k+1:]]; continue
        ut.append(c)
    cues=ut
    s=''.join(f"{i+1}\n{fmt(c[0]['start'])} --> {fmt(c[-1]['end'])}\n{' '.join(x['text'] for x in c)}\n\n" for i,c in enumerate(cues))
    open(f'srt-sv/{name}.srt','w').write(s)
for n in sys.argv[1:]:
    d=stt(n); srt(n,d); print('==',n,d.get('language_code'),d.get('language_probability')); print(open(f'srt-sv/{n}.srt').read())
