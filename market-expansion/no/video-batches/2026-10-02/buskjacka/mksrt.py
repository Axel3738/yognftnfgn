import json,glob,os
d=json.load(open('srt-no/sonnet.json'))
for f in sorted(glob.glob('srt-sv/*.srt')):
    n=os.path.basename(f)[:-4]
    bl=open(f).read().strip().split('\n\n'); assert len(bl)==len(d[n]),n
    open(f'srt-no/{n}.srt','w').write(''.join(f"{i+1}\n{b.split(chr(10))[1]}\n{c['tale']}\n\n" for i,(b,c) in enumerate(zip(bl,d[n]))))
