import re,glob,sys
def norm(s): return re.sub(r'[^a-zæøå0-9 ]','',s.lower().replace('-','')).split()
bad=0
for f in sorted(glob.glob('final/*.ordkoll')):
    t=open(f).read(); miss=[]
    for m in re.finditer(r'cue (\d+) @.*?\n\s+manus: (.*?)\n\s+hörs:  (.*?)\n',t):
        manus,hors=norm(m.group(2)),' '+' '.join(norm(m.group(3)))+' '
        if ' '+' '.join(manus)+' ' not in hors:
            miss.append((m.group(1),m.group(2),m.group(3)))
    print(f,'cues utan exakt träff:',len(miss))
    for x in miss: print('   ',x)
