import json,sys
d=json.load(open('srt-no/sonnet.json'))
for n in sys.argv[1:]:
    bl=open(f'dub/{n}.mp4.srt').read().strip().split('\n\n')
    assert len(bl)==len(d[n]),n
    open(f'dub/{n}.cap.srt','w').write('\n'.join(f"{b.split(chr(10))[0]}\n{b.split(chr(10))[1]}\n{c['tekst']}\n" for b,c in zip(bl,d[n])))
