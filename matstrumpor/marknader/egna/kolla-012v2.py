#!/usr/bin/env python3
"""kolla-012v2.py <KOD|fil.mp4> … — bildruta för bildruta i annons 004 (012v2): täcker vår ruta källans
svenska ruta i varje ruta där den syns, och är det aldrig mer än en av våra rutor tänd samtidigt?

  python3 matstrumpor/marknader/egna/kolla-012v2.py NO DK FI US DE FR NL ES IT PL PT JP TW

Jämför med källan (kalla/012v2.mp4) pixel för pixel i rutornas områden ur 012v2.boxar.json:
- svensk text synlig = källans aktiva ruta är orörd (medelavvikelse < 6) — vår ruta ligger inte där;
- annan ruta tänd = ett område som inte överlappar den aktiva rutan avviker kraftigt (> 25) från
  källan — en av våra andra rutor syns samtidigt.
Exit 1 vid fel. Varför (granskningen 2026-09-30, G-B04): två rutor syntes samtidigt vid varje byte,
och källans svenska "Ingen får låna din." syntes en bildruta vid 6,08 s i alla tretton språk, för att
gränsen mättes med 10 bilder/s (6,1 s) medan källan byter på bildruta 152 (6,08 s vid 25 bilder/s).
Kontrollen fångade det gamla felet (ruta 152 + nio dubbla) innan den godkände de nya filerna.
Kräver ffmpeg och numpy.
"""
import json, math, os, subprocess, sys
import numpy as np

HAR = os.path.dirname(os.path.abspath(__file__))
KLAR = os.path.join(HAR, '..', 'annonser', 'klar')
b = json.load(open(os.path.join(HAR, '012v2.boxar.json')))
seg = b['segment']
W, H, FPS = 720, 1280, 25


def ramar(fil):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', fil, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.uint8).reshape(-1, H, W, 3).astype(np.int16)


# Källans bytesrutor ur rutornas starttider: första bildrutan på eller efter tiden.
byten = [math.ceil(s['a'] * FPS - 1e-9) for s in seg] + [10 ** 9]
aktiv = lambda n: max(i for i in range(len(seg)) if n >= byten[i])


def avvikelse(a, c, r):
    x0, y0, x1, y1 = r
    return float(np.abs(a[y0:y1, x0:x1] - c[y0:y1, x0:x1]).mean())


def overlappar(r1, r2):
    return not (r1[2] <= r2[0] or r2[2] <= r1[0] or r1[3] <= r2[1] or r2[3] <= r1[1])


def main():
    kalla = ramar(os.path.join(HAR, 'kalla', '012v2.mp4'))
    fel = 0
    for arg in sys.argv[1:]:
        fil = arg if arg.endswith('.mp4') else os.path.join(KLAR, f'{arg.upper()}_012v2.mp4')
        v = ramar(fil)
        n = min(len(v), len(kalla))
        lackor, dubbla = [], []
        for i in range(n):
            s = aktiv(i)
            if avvikelse(v[i], kalla[i], seg[s]['ruta']) < 6:
                lackor.append(i)
            for j in range(len(seg)):
                if j != s and not overlappar(seg[j]['ruta'], seg[s]['ruta']) and avvikelse(v[i], kalla[i], seg[j]['ruta']) > 25:
                    dubbla.append((i, j + 1))
        ok = not lackor and not dubbla
        print(f"{'✅' if ok else '❌'} {os.path.basename(fil)}: {n} bildrutor · svensk text synlig i {len(lackor)} {lackor[:8]} · annan ruta tänd i {len(dubbla)} {dubbla[:6]}")
        fel += len(lackor) + len(dubbla)
    sys.exit(1 if fel else 0)


if __name__ == '__main__':
    main()
