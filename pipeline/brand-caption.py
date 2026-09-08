#!/usr/bin/env python3
"""brand-caption.py — byter ETT ord i en videos inbrända captions, utan att röra resten.

Bakgrund: när en Bäverbutiks-video brand-swappas till en OPS-butik (FAS2 uppdrag A2)
räcker det nästan aldrig att dubba om ljudet — captionpillret nederst i bild säger
fortfarande det gamla butiksnamnet. `no-precis.py` bygger om HELA captionspåret ur en
SRT; det är rätt verktyg när språket byts, men överdrivet när ett enda ord ska bytas i
en bevisad creative. Det här skriptet gör den kirurgiska varianten:

  1. hittar de SRT-cuear som innehåller det nya varumärkesordet,
  2. mäter det vita captionpillret i just de tidsfönstren (per frame, numpy),
  3. ritar ett nytt piller i EXAKT samma ruta med den rättade texten (PIL),
  4. skriver en `no-precis.py`-konfig med `blur` (täck gamla) + `lager` (nytt piller).

  python3 pipeline/brand-caption.py --video <fil.mp4> --srt <rättad.srt> \
      --ord TankGuard --ut <mapp> [--konfig-bara]

Skriver <mapp>/<namn>.lager-N.png, <mapp>/<namn>.precis.json och QA-frames.
Kör no-precis.py på konfigen för att få den färdiga videon.

Beroenden: ffmpeg (imageio-ffmpeg duger), numpy, PIL.
"""
import argparse, json, os, re, shutil, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FONTKANDIDATER = [
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
]


def ffmpeg_bin():
    p = shutil.which('ffmpeg')
    if p:
        return p
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def ffinfo(ff, path):
    r = subprocess.run([ff, '-hide_banner', '-i', path], capture_output=True, text=True)
    m = re.search(r'Video:.*?(\d{3,5})x(\d{3,5})', r.stderr)
    f = re.search(r'(\d+(?:\.\d+)?) fps', r.stderr)
    if not (m and f):
        sys.exit(f'kunde inte läsa {path}')
    return int(m[1]), int(m[2]), float(f[1])


def parse_ts(t):
    h, m, s = t.split(':')
    s, ms = s.split(',')
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def las_srt(path):
    cues = []
    for block in re.split(r'\n\n+', open(path, encoding='utf-8').read().strip()):
        rader = block.strip().split('\n')
        if len(rader) < 3:
            continue
        a, e = (parse_ts(x) for x in rader[1].split(' --> '))
        cues.append((a, e, ' '.join(rader[2:]).strip()))
    return cues


def las_frame(ff, path, t, W, H):
    """En gråframe vid tiden t."""
    r = subprocess.run(
        [ff, '-nostdin', '-v', 'error', '-ss', f'{t:.3f}', '-i', path,
         '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
        capture_output=True)
    if len(r.stdout) < W * H:
        return None
    return np.frombuffer(r.stdout[:W * H], dtype=np.uint8).reshape(H, W)


def hitta_piller(g, zon, min_bredd=140, max_bredd=None, min_hojd=28, max_hojd=140):
    """Det vita captionpillret i gråframen: sammanhängande rader där en lång körning
    av mycket ljusa pixlar (>=232) finns, centrerad i bild. Returnerar [x0,y0,x1,y1]."""
    H, W = g.shape
    max_bredd = max_bredd or int(W * 0.94)
    y0z, y1z = max(0, zon[0]), min(H, zon[1])
    rader = {}
    for y in range(y0z, y1z):
        ljus = g[y] >= 232
        # längsta körningen, luckor <= 34 px (glyferna) räknas som del av pillret
        bast, i = None, 0
        while i < W:
            if not ljus[i]:
                i += 1
                continue
            start = i
            lucka = 0
            while i < W and (ljus[i] or lucka < 34):
                lucka = 0 if ljus[i] else lucka + 1
                i += 1
            slut = i - lucka
            if bast is None or slut - start > bast[1] - bast[0]:
                bast = (start, slut)
        if bast and min_bredd <= bast[1] - bast[0] <= max_bredd:
            mitt = (bast[0] + bast[1]) / 2
            if abs(mitt - W / 2) <= W * 0.14:          # captions är centrerade
                rader[y] = bast
    if not rader:
        return None
    # längsta sammanhängande radgruppen
    ys = sorted(rader)
    grupper, cur = [], [ys[0]]
    for y in ys[1:]:
        if y - cur[-1] <= 3:
            cur.append(y)
        else:
            grupper.append(cur)
            cur = [y]
    grupper.append(cur)
    grupper = [g_ for g_ in grupper if min_hojd <= g_[-1] - g_[0] + 1 <= max_hojd]
    if not grupper:
        return None
    grupp = max(grupper, key=len)
    x0 = min(rader[y][0] for y in grupp)
    x1 = max(rader[y][1] for y in grupp)
    return [x0, grupp[0], x1, grupp[-1]]


def rita_piller(W, H, rect, text, font_fil):
    """Nytt piller i exakt samma ruta: vit platta, svart fet text, autokrympning."""
    x0, y0, x1, y1 = rect
    bredd, hojd = x1 - x0, y1 - y0
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    radie = max(4, hojd // 5)
    d.rounded_rectangle([x0, y0, x1, y1], radius=radie, fill=(255, 255, 255, 255))
    px = int(hojd * 0.62)
    while px > 8:
        f = ImageFont.truetype(font_fil, px)
        l, t, r, b = d.textbbox((0, 0), text, font=f)
        if r - l <= bredd - 16 and b - t <= hojd - 6:
            break
        px -= 1
    f = ImageFont.truetype(font_fil, px)
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    d.text((x0 + (bredd - (r - l)) / 2 - l, y0 + (hojd - (b - t)) / 2 - t),
           text, font=f, fill=(17, 17, 17, 255))
    return img


BLECK = 128         # signaturens längd
BLACK_TROSKEL = 200 # allt mörkare än så är bläck (fångar karaokens gråa ord med)
# Mätt på IBC_PD_1_H1 2026-09-08: inom samma caption 0,01–0,12, mellan två
# captions 0,16–0,19. 0,14 skiljer dem med marginal åt båda håll.
SKILJER = 0.14      # andel avvikande kolumner som räknas som ny caption
MIN_SEG = 0.35      # sekunder — kortare än så är breddbrus, inte en caption


def bleck(g, rect):
    """Signatur för pillrets TEXT: vilka kolumner som bär bläck, omsamplade till en fast
    längd. Tröskeln tar med karaokens gråa (ännu ej lästa) ord — annars ser varje
    karaokesteg ut som en ny caption. Glyfernas POSITION är det stabila inom en
    caption; den byts helt när texten byts."""
    x0, y0, x1, y1 = rect
    ruta = g[y0:y1, x0:x1]
    if ruta.size == 0:
        return None
    mörk = (ruta < BLACK_TROSKEL).any(axis=0).astype(np.float32)
    if mörk.size < BLECK:
        mörk = np.pad(mörk, (0, BLECK - mörk.size))
    kant = np.linspace(0, mörk.size, BLECK + 1).astype(int)
    return np.array([mörk[kant[i]:max(kant[i] + 1, kant[i + 1])].max() for i in range(BLECK)])


def mat_segment(ff, video, a, e, W, H, zon, fps, steg=0.1):
    """Pillrets segment inom en cue: en sammanhängande följd frames med samma
    textsignatur. Returnerar [(t0, t1, rect), ...]."""
    prov = []
    t = a + 0.02
    while t < e - 0.02:
        g = las_frame(ff, video, t, W, H)
        r = hitta_piller(g, zon) if g is not None else None
        prov.append((t, r, bleck(g, r) if r else None))
        t += steg

    segment, cur = [], None
    for t, r, sig in prov:
        if r is None or sig is None:
            if cur:
                segment.append(cur)
                cur = None
            continue
        # Jämför alltid mot segmentets FÖRSTA signatur. Ett glidande snitt (eller en
        # union) suddar ut skillnaden och slår ihop två captions till en.
        if cur is not None and np.mean(np.abs(sig - cur[3])) < SKILJER:
            cur = (cur[0], t, [min(cur[2][0], r[0]), min(cur[2][1], r[1]),
                               max(cur[2][2], r[2]), max(cur[2][3], r[3])], cur[3])
        else:
            if cur:
                segment.append(cur)
            cur = (t, t, r, sig)
    if cur:
        segment.append(cur)

    ut = [(t0, min(t1 + steg, e), rect) for t0, t1, rect, _ in segment]
    # slå ihop segment som blev för korta (breddbrus mitt i en caption)
    slagna = []
    for s in ut:
        if slagna and s[1] - s[0] < MIN_SEG:
            f = slagna[-1]
            slagna[-1] = (f[0], s[1], [min(f[2][0], s[2][0]), min(f[2][1], s[2][1]),
                                       max(f[2][2], s[2][2]), max(f[2][3], s[2][3])])
        else:
            slagna.append(s)
    return [s for s in slagna if s[1] - s[0] >= MIN_SEG]


def passa_bitar(text, antal):
    """Delar cue-texten i exakt `antal` bitar med samma ordvisa regel som cover-srt.py.
    max_chars provas tills antalet stämmer — bredden mäts ju redan ur videon, så
    gissningen ligger bara i VAR raden bryts, och den valideras av antalet."""
    if antal == 1:
        return [text]
    for max_chars in range(12, 61):
        bitar = chunka(text, max_chars)
        if len(bitar) == antal:
            return bitar
    return None


def chunka(text, max_chars):
    """Ordvis radbrytning till bitar ≤ max_chars (meningsgräns först) — samma regel
    som pipeline/no-precis.py använder, så bitarna hamnar där källan bröt dem."""
    sents = [x.strip() for x in re.findall(r'[^.!?]+[.!?]?\s*', text) if x.strip()]
    bitar, cur = [], ''
    for x in sents:
        if len(x) > max_chars:
            if cur:
                bitar.append(cur)
                cur = ''
            seg = ''
            for w in x.split():
                if seg and len(seg) + 1 + len(w) > max_chars:
                    bitar.append(seg)
                    seg = w
                else:
                    seg = f'{seg} {w}'.strip()
            if seg:
                bitar.append(seg)
        elif cur and len(cur) + 1 + len(x) <= max_chars:
            cur = f'{cur} {x}'
        else:
            if cur:
                bitar.append(cur)
            cur = x
    if cur:
        bitar.append(cur)
    return bitar


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--video', required=True)
    ap.add_argument('--srt', required=True)
    ap.add_argument('--ord', required=True, help='det NYA varumärkesordet, t.ex. TankGuard')
    ap.add_argument('--ut', required=True)
    ap.add_argument('--zon', default=None, help='y0,y1 att leta pillret i (default: nedre tredjedelen)')
    args = ap.parse_args()

    ff = ffmpeg_bin()
    W, H, fps = ffinfo(ff, args.video)
    namn = os.path.splitext(os.path.basename(args.video))[0]
    os.makedirs(args.ut, exist_ok=True)
    font_fil = next((f for f in FONTKANDIDATER if os.path.exists(f)), None)
    if not font_fil:
        sys.exit('hittade inget fet sans-typsnitt')
    zon = [int(x) for x in args.zon.split(',')] if args.zon else [int(H * 0.62), int(H * 0.80)]

    träffar = [(a, e, t) for a, e, t in las_srt(args.srt) if args.ord.lower() in t.lower()]
    if not träffar:
        sys.exit(f'{namn}: ingen cue innehåller "{args.ord}" — inget att byta')

    blur, lager, rapport = [], [], []
    nr = 0
    for a, e, text in träffar:
        # En SRT-cue visas som FLERA piller efter varandra ("Ett IBC-tanköverdrag"
        # → "från Bäverbutiken."). Segmenten mäts ur videon i stället för att gissas:
        # pillrets bredd/innehåll ändras vid varje textbyte.
        segment = mat_segment(ff, args.video, a, e, W, H, zon, fps)
        if not segment:
            rapport.append(f'✗ cue ({a:.2f}–{e:.2f}s): hittade inget piller i zon {zon}')
            continue
        bitar = passa_bitar(text, len(segment))
        if bitar is None:
            rapport.append(f'✗ cue ({a:.2f}–{e:.2f}s): {len(segment)} pillersegment men texten '
                           f'går inte att dela i {len(segment)} bitar — mät för hand')
            continue
        for (t0, t1, rect), bit in zip(segment, bitar):
            if args.ord.lower() not in bit.lower():
                rapport.append(f'· {t0:.2f}–{t1:.2f}s "{bit}" — orört')
                continue
            nr += 1
            png = os.path.join(args.ut, f'{namn}.lager-{nr}.png')
            rita_piller(W, H, rect, bit, font_fil).save(png)
            # täck den gamla texten med marginal, lägg det nya pillret ovanpå
            blur.append({'rect': [max(0, rect[0] - 6), max(0, rect[1] - 4),
                                  min(W, rect[2] + 6), min(H, rect[3] + 4)], 't': [t0, t1]})
            lager.append({'png': os.path.basename(png), 't': [t0, t1]})
            rapport.append(f'✓ {t0:.2f}–{t1:.2f}s piller {rect} → "{bit}"')

    konfig = {
        'in': os.path.abspath(args.video),
        'ut': os.path.abspath(os.path.join(args.ut, f'{namn}.mp4')),
        'blur': blur,
        'lager': lager,
        'qa': os.path.abspath(os.path.join(args.ut, 'qa')),
    }
    kfil = os.path.join(args.ut, f'{namn}.precis.json')
    json.dump(konfig, open(kfil, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f'{namn}: {W}x{H} @ {fps:g} fps, {len(träffar)} cue(ar) med "{args.ord}"')
    for r in rapport:
        print(f'  {r}')
    print(f'  konfig: {kfil}')
    if len(lager) != len(träffar):
        sys.exit(2)


if __name__ == '__main__':
    main()
