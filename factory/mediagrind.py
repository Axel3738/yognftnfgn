#!/usr/bin/env python3
"""mediagrind.py — läser den FÄRDIGA filen och letar källbutikens påståenden.

En ren annonstext är inte en ren annons. Källbutikens pris, rabatt, villkor,
stjärnor, kundnamn och varumärke sitter i PIXLARNA, och ett captionbyte rör
bara captionpillret — text som ligger någon annanstans i bild står kvar.

    python3 factory/mediagrind.py se <fil ...>
    python3 factory/mediagrind.py no <mapp>/*.mp4

Videor samplas med frames; bilder läses direkt. Kräver factory/brand-text.py
(lokal OCR, inga krediter).

Avslutar med kod 1 om något hittas — kör den i en `&&`-kedja före uppladdning.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

HÄR = os.path.dirname(os.path.abspath(__file__))

# Två uppsättningar, för marknaderna säljer inte samma sak.
# ⚠️ TankGuards EGNA tal (489/799/1099 kr, 18/25 % med paketnivå) är sanna på
# den svenska marknaden och får stå. Norge har inget känt NOK-pris — där är
# varje pris och varje procentsats förbjuden.
REGLER = {
    'se': [
        (r'\b636\b|\b147\b', 'källbutikens prispar'),
        (r'23\s*%', 'källbutikens rabatt'),
        (r'b[aä]verbutik', 'källvarumärke'),
        (r'[★⭐]', 'stjärnor'),
        (r'recension|omdöme|verifierad kund|\d[,.]\d\s*av\s*5', 'socialt bevis'),
        (r'\bmaria\b|\blena\b|\bsofia\b|\bjohan\b', 'kundnamn'),
        (r'fri frakt|gratis frakt|klarna|öppet köp|pengarna tillbaka', 'villkor'),
        (r'lagret krymper|bara idag|innan det är slut|endast få kvar', 'påhittad brådska'),
    ],
    'no': [
        (r'\b\d+\s*(kr|kroner)\b|\bkroner\b', 'pris'),
        (r'\b(439|586|147|300)\b', 'källbutikens tal'),
        (r'\d+\s*%|prosent|rabatt', 'procent eller rabatt'),
        (r'b[aäe]v[eo]r?[\s-]?butik|BB[\s-]?butikk', 'källvarumärke'),
        (r'[★⭐]', 'stjärnor'),
        (r'anmeldels|omtale|verifisert kunde', 'socialt bevis'),
        (r'\bmaria\b|\blena\b|\bsofia\b|\bjohan\b', 'kundnamn'),
        (r'fri frakt|gratis frakt|klarna|åpent kjøp|pengene tilbake', 'villkor'),
        (r'lageret|bare i dag|så lenge lageret', 'påhittad brådska'),
    ],
}


def frames(video, tmp, fps='1/2'):
    """False om filen inte går att läsa — den skrivs kanske fortfarande."""
    namn = os.path.splitext(os.path.basename(video))[0]
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf',
                        f'fps={fps},scale=720:1280',
                        os.path.join(tmp, f'{namn}_%03d.jpg')],
                       capture_output=True, text=True)
    return r.returncode == 0


def las(filer):
    r = subprocess.run(['python3', os.path.join(HÄR, 'brand-text.py'), '--filer'] + filer,
                       capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'OCR misslyckades: {r.stderr[:300]}')
    return json.loads(r.stdout)


def main(marknad, filer):
    regler = REGLER.get(marknad)
    if not regler:
        sys.exit(f'Okänd marknad "{marknad}" — välj {", ".join(REGLER)}.')
    fel = 0
    for f in filer:
        if not os.path.exists(f):
            print(f'  ?  {f} — finns inte'); fel += 1; continue
        with tempfile.TemporaryDirectory() as tmp:
            if f.lower().endswith(('.mp4', '.mov', '.webm')):
                if not frames(f, tmp):
                    print(f'  ?  {os.path.basename(f)} — går inte att läsa '
                          '(skrivs den fortfarande?)')
                    fel += 1
                    continue
                bilder = sorted(os.path.join(tmp, x) for x in os.listdir(tmp))
            else:
                bilder = [f]
            if not bilder:
                print(f'  ?  {f} — inga frames'); fel += 1; continue
            d = las(bilder)
        fynd = {}
        for _, rader in d.items():
            for r in rader:
                for pat, namn in regler:
                    if re.search(pat, r['text'], re.I):
                        fynd.setdefault(namn, set()).add(r['text'][:45])
        namn = os.path.basename(f)
        if fynd:
            fel += 1
            print(f'  ❌ {namn}')
            for k, v in sorted(fynd.items()):
                print(f'       {k}: {", ".join(sorted(v))}')
        else:
            print(f'  ✅ {namn}   ren')
    print()
    if fel:
        print(f'⛔ {fel} av {len(filer)} bär källbutikens påståenden — ladda inte upp.')
        return 1
    print(f'✅ {len(filer)} av {len(filer)} rena.')
    return 0


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit('Användning: mediagrind.py <se|no> <fil ...>')
    sys.exit(main(sys.argv[1].lower(), sys.argv[2:]))
