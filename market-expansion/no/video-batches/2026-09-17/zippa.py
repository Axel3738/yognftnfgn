# Packar de färdiga videorna i zip-filer <= 30 MiB (Fas 2 steg 4, /translate-no).
# zip -0 (ingen komprimering) enligt kommandofilen; en video per zip om den är stor.
import os, subprocess

BASE = os.path.dirname(os.path.abspath(__file__))
FINAL = os.path.join(BASE, 'final')
OUT = os.path.join(BASE, 'zip')
os.makedirs(OUT, exist_ok=True)
GRANS = 30 * 1024 * 1024

for slug in sorted(os.listdir(FINAL)):
    d = os.path.join(FINAL, slug)
    if not os.path.isdir(d):
        continue
    filer = sorted(f for f in os.listdir(d) if f.endswith('.mp4'))
    grupp, storlek, n = [], 0, 1
    def skriv(grupp, n):
        if not grupp:
            return
        namn = os.path.join(OUT, f'NO_{slug}_{n}.zip')
        subprocess.run(['zip', '-0', '-j', '-q', namn] + [os.path.join(d, f) for f in grupp],
                       check=True)
        mb = os.path.getsize(namn) / 1024 / 1024
        print(f'{os.path.basename(namn)}: {len(grupp)} videor, {mb:.1f} MiB')
        for f in grupp:
            print('   ', f)
    for f in filer:
        s = os.path.getsize(os.path.join(d, f))
        if grupp and storlek + s > GRANS:
            skriv(grupp, n)
            n += 1
            grupp, storlek = [], 0
        grupp.append(f)
        storlek += s
    skriv(grupp, n)
