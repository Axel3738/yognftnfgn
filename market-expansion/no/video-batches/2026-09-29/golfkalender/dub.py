import json,hashlib,os,shutil,subprocess,sys,time,urllib.request
R="Martin - Clear and Comforting"
os.makedirs('tts-cache',exist_ok=True)
def sub():
    d=json.load(urllib.request.urlopen(urllib.request.Request('https://api.elevenlabs.io/v1/user/subscription',headers={'xi-api-key':os.environ['ELEVENLABS_API_KEY']})))
    return d['character_count'],d['character_limit']
start=sub(); print('före',start,flush=True)
for n in sys.argv[1:]:
    cues=[b.split('\n',2)[2].strip() for b in open(f'srt-no/{n}.srt').read().strip().split('\n\n')]
    vo=f'dub/vo/{n}'; os.makedirs(vo,exist_ok=True)
    for i,t in enumerate(cues):
        h='tts-cache/'+hashlib.sha1((R+'|'+t).encode()).hexdigest()+'.mp3'
        if os.path.exists(h) and not os.path.exists(f'{vo}/{i}.mp3'): shutil.copy(h,f'{vo}/{i}.mp3')
    for f in range(5):
        r=subprocess.run(['node','/home/user/yognftnfgn/pipeline/omdubb/elevenlabs-omdubb.mjs',f'--kalla=src/{n}.mp4',f'--srt=srt-no/{n}.srt',f'--ut=dub/{n}.mp4',f'--rost={R}',f'--vo={vo}'],capture_output=True,text=True)
        open(f'dub/{n}.log','w').write(r.stdout+r.stderr)
        if r.returncode==0: break
        if '429' in r.stdout+r.stderr: time.sleep(30*(f+1)); continue
        print('FEL',n,(r.stdout+r.stderr)[-500:]); break
    for i,t in enumerate(cues):
        h='tts-cache/'+hashlib.sha1((R+'|'+t).encode()).hexdigest()+'.mp3'
        if os.path.exists(f'{vo}/{i}.mp3') and not os.path.exists(h): shutil.copy(f'{vo}/{i}.mp3',h)
    print('==',n,r.returncode,[l for l in r.stdout.split('\n') if '⚠' in l or 'Källan' in l or '✓' in l],flush=True)
    c=sub(); 
    if c[0]-start[0]>6000: print('STOPP teckenbudget'); break
print('efter',sub(),'förbrukat',sub()[0]-start[0])
