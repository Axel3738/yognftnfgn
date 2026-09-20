#!/usr/bin/env python3
"""inbrand-mat.py — MÄTER den inbrända texten i en videoannons. Ändrar ingenting.

    python3 pipeline/omdubb/inbrand-mat.py <video.mp4> [--fps 3] [--konf 0.45]
            [--till 22.9] [--rod-fps 10] [--rutor <mapp>]

Skriver JSON på stdout:

  {"fil": …, "W": 720, "H": 1280, "langd": 25.91, "fps": 3, "rutor": 78,
   "rader":   [ {"text","t":[t0,t1],"rutor","box","konf","drift_px","h_andel","cy_andel"} … ],
   "rodblock":[ {"t":[t0,t1],"box":[…],"max_px":…,"rader":[ {"text","box","konf","rutor"} … ]} … ]}

Två MÄTNINGAR, två syften — den skillnaden är hela poängen:

  1. OCR per bildruta (rapidocr, samma motor som `factory/brand-text.py`) säger
     VAD texten står. Den läser utan diakriter: "30 DAGARS ÖPPET KÖP" kommer
     tillbaka som "30 DAGARS OPPET KOP" (mätt 2026-09-20 på
     CaraShellRoof_CO_101_H1). Allt som jämförs mot den här texten måste därför
     vika å/ä/ö.
  2. Röda pixlar per bildruta (porterad från
     `market-expansion/ops/carashell/2026-09-18-us/video/rodtext.py`, bevisad på
     åtta videor) säger VAR pop-texten sitter och HUR LÄNGE. Den mätningen är
     oberoende av OCR — och den behövs, för OCR:en läser den överstrukna
     jämförprisraden som "149", "14C9 KR", "Teer" och "TUUT" i fyra bildrutor i
     rad (mätt på samma video). En platta som bara täckte det OCR läste säkert
     hade lämnat "1 469 KR" kvar i bild.

⚠️ `ffprobe -select_streams` används ALDRIG: /usr/local/bin/ffprobe är en
python-shim i den här containern och kraschar på flaggan (mätt 2026-09-20).
Måtten läses ur `ffmpeg -i`:s stderr, precis som i `marknadsvideo.mjs`.

Ingen dom fattas här. Klassificeringen (piller / pop / övrig), språkfrågan och
ersättningstexterna görs av `pipeline/omdubb/inbrand.mjs`, så att en människa
kan läsa mätningen och domen var för sig.

Beroenden: ffmpeg, numpy, rapidocr-onnxruntime. Inga nätanrop, 0 kr.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata

import numpy as np

# Trösklarna för "stark röd" är rodtext.py:s egna (2026-09-18, åtta videor).
ROD_R, ROD_G, ROD_B = 170, 80, 80
# Antal röda pixlar som gör en bildruta till "pop-text". rodtext.py hade 1500
# hårdkodat för 720×1280 (= 0,16 % av bilden); här skalas det med upplösningen
# så en 1080×1920-källa inte får en lägre tröskel i praktiken.
ROD_ANDEL = 1 / 600
# Percentiler i stället för min/max när blockets ruta räknas: en röd bil eller
# jacka i filmen får annars rutan att svälla över halva bilden. 0,2 %/99,8 %
# skär bort strötpixlar men behåller konturens kant (mätt 2026-09-20: rutan för
# "1129 KR"-blocket blev 110,325–631,657 mot OCR:ens 112,328–625,654).
ROD_PERCENTIL = (0.2, 99.8)
ROD_PAD = 6


class Fel(Exception):
    """Ett fel som ska nå användaren som en mening, inte som en stacktrace."""


# --------------------------------------------------------------------------
# Mått och bildrutor
# --------------------------------------------------------------------------
def ffmpeg_bin():
    p = shutil.which('ffmpeg')
    if p:
        return p
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        raise Fel('ffmpeg saknas (installera ffmpeg eller `pip install imageio-ffmpeg`).')


def matt(fil):
    """(bredd, höjd, längd) ur `ffmpeg -i`:s stderr."""
    r = subprocess.run([ffmpeg_bin(), '-hide_banner', '-i', fil], capture_output=True, text=True)
    txt = r.stderr or ''
    m = re.search(r'Video:.*?(\d{3,5})x(\d{3,5})', txt)
    d = re.search(r'Duration: (\d+):(\d+):(\d+\.?\d*)', txt)
    if not m or not d:
        raise Fel(f'Kunde inte läsa måtten ur ffmpeg -i {os.path.basename(fil)}')
    langd = int(d[1]) * 3600 + int(d[2]) * 60 + float(d[3])
    return int(m[1]), int(m[2]), langd


def dra_rutor(fil, fps, mapp):
    """Bildrutor som PNG. Ruta i ligger på tiden i/fps (ffmpegs fps-filter)."""
    subprocess.run([ffmpeg_bin(), '-v', 'error', '-y', '-i', fil, '-vf', f'fps={fps}',
                    '-start_number', '0', os.path.join(mapp, 'r%05d.png')], check=True)
    return sorted(f for f in os.listdir(mapp) if f.startswith('r') and f.endswith('.png'))


# --------------------------------------------------------------------------
# OCR
# --------------------------------------------------------------------------
def ocr_motor():
    try:
        from rapidocr_onnxruntime import RapidOCR
    except ImportError:
        raise Fel('OCR_SAKNAS: rapidocr-onnxruntime saknas. Kör '
                  '`pip install rapidocr-onnxruntime`. Utan OCR kan inbränd text '
                  'inte mätas — steget rapporteras HOPPAT, aldrig grönt.')
    return RapidOCR()


def las_ruta(motor, sokvag, konf_min):
    """[(text, konfidens, [x0,y0,x1,y1]) …] för en bildruta."""
    resultat, _ = motor(sokvag)
    ut = []
    for post in resultat or []:
        box, text, konf = post[0], str(post[1]).strip(), float(post[2])
        if not text or konf < konf_min:
            continue
        xs = [p[0] for p in box]
        ys = [p[1] for p in box]
        ut.append((text, round(konf, 3),
                   [int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))]))
    return ut


# --------------------------------------------------------------------------
# Gruppering
# --------------------------------------------------------------------------
def vik(s):
    """Gemener, å/ä/ö/æ/ø vikta, allt utom a–z0–9 bort. Samma vikning som
    `factory/slutkort.py:_vik` + `factory/brandord.mjs:normalisera`, för att
    OCR:en läser "ÖPPET KÖP" som "OPPET KOP"."""
    s = str(s).lower().replace('ø', 'o').replace('æ', 'ae')
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', '', s)


def iou(a, b):
    x0, y0 = max(a[0], b[0]), max(a[1], b[1])
    x1, y1 = min(a[2], b[2]), min(a[3], b[3])
    if x1 <= x0 or y1 <= y0:
        return 0.0
    snitt = (x1 - x0) * (y1 - y0)
    ya = (a[2] - a[0]) * (a[3] - a[1])
    yb = (b[2] - b[0]) * (b[3] - b[1])
    return snitt / float(ya + yb - snitt) if (ya + yb - snitt) else 0.0


def union(a, b):
    return [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3])]


def gruppera(per_ruta, fps, H, min_iou=0.25, max_hopp=1):
    """Text som står still över flera bildrutor blir ETT fönster.

    Matchar på vikt text (så "FRI FRAKT" och "FRIFRAKT" är samma rad) och på
    att rutan ligger kvar (IoU ≥ min_iou). `drift_px` är hur långt rutans
    hörn vandrat — ett överlägg står still, text som är FILMAD följer kameran.
    """
    oppna, klara = [], []
    for i, rader in enumerate(per_ruta):
        rort = set()
        for text, konf, box in rader:
            nyckel = vik(text)
            traff = None
            for w in oppna:
                if w['nyckel'] != nyckel or id(w) in rort:
                    continue
                if i - w['sista_i'] > max_hopp:
                    continue
                if iou(box, w['sista_box']) < min_iou:
                    continue
                traff = w
                break
            if traff is None:
                oppna.append({'nyckel': nyckel, 'text': text, 'konf': [konf],
                              'box': list(box), 'forsta_box': list(box), 'sista_box': list(box),
                              'forsta_i': i, 'sista_i': i, 'rutor': 1, 'drift': 0,
                              'texter': [text]})
                rort.add(id(oppna[-1]))
                continue
            traff['box'] = union(traff['box'], box)
            traff['drift'] = max(traff['drift'],
                                 max(abs(box[k] - traff['forsta_box'][k]) for k in range(4)))
            traff['sista_box'] = list(box)
            traff['sista_i'] = i
            traff['rutor'] += 1
            traff['konf'].append(konf)
            traff['texter'].append(text)
            rort.add(id(traff))
        kvar = []
        for w in oppna:
            (kvar if i - w['sista_i'] <= max_hopp else klara).append(w)
        oppna = kvar
    klara.extend(oppna)

    ut = []
    for w in klara:
        box = w['box']
        h = box[3] - box[1]
        cy = (box[1] + box[3]) / 2.0
        # Den vanligaste avläsningen vinner; lika ofta ⇒ den längsta med högst
        # konfidens (OCR:en tappar hellre tecken än hittar på extra).
        antal = {}
        for t in w['texter']:
            antal[t] = antal.get(t, 0) + 1
        basta = sorted(w['texter'], key=lambda t: (antal[t], len(t)), reverse=True)[0]
        ut.append({
            'text': basta,
            'texter': sorted(set(w['texter'])),
            't': [round(w['forsta_i'] / fps, 3), round((w['sista_i'] + 1) / fps, 3)],
            'rutor': w['rutor'],
            'box': box,
            'konf': round(sum(w['konf']) / len(w['konf']), 3),
            'drift_px': int(w['drift']),
            'h_andel': round(h / float(H), 4),
            'cy_andel': round(cy / float(H), 4),
        })
    ut.sort(key=lambda r: (r['t'][0], r['box'][1]))
    return ut


# --------------------------------------------------------------------------
# Röda pop-texter (porterad rodtext.py)
# --------------------------------------------------------------------------
def roda_block(fil, W, H, fps):
    p = subprocess.run([ffmpeg_bin(), '-v', 'error', '-i', fil, '-vf', f'fps={fps}',
                        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                       capture_output=True)
    ra = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(ra) // (W * H * 3)
    if n == 0:
        return []
    fr = ra[:n * W * H * 3].reshape(n, H, W, 3).astype(np.int16)
    rod = (fr[..., 0] > ROD_R) & (fr[..., 1] < ROD_G) & (fr[..., 2] < ROD_B)
    antal = rod.reshape(n, -1).sum(axis=1)
    trosk = max(1500, int(W * H * ROD_ANDEL))
    block, i = [], 0
    while i < n:
        if antal[i] <= trosk:
            i += 1
            continue
        j = i
        while j < n and antal[j] > trosk:
            j += 1
        mask = rod[i:j].any(axis=0)
        ys, xs = np.nonzero(mask)
        lo, hi = ROD_PERCENTIL
        box = [int(np.percentile(xs, lo)) - ROD_PAD, int(np.percentile(ys, lo)) - ROD_PAD,
               int(np.percentile(xs, hi)) + ROD_PAD, int(np.percentile(ys, hi)) + ROD_PAD]
        box = [max(0, box[0]), max(0, box[1]), min(W, box[2]), min(H, box[3])]
        block.append({'t': [round(i / fps, 3), round(j / fps, 3)], 'box': box,
                      'max_px': int(antal[i:j].max()), 'trosk_px': trosk})
        i = j
    return block


def rader_i_block(block, rader):
    """OCR-raderna som ligger inne i blocket, klustrade till RADER.

    Två avläsningar hör till samma rad om deras y-intervall överlappar ≥ 50 %
    av den kortare. Det är så den överstrukna jämförprisraden hålls ihop trots
    att OCR:en läser den olika i varje bildruta."""
    bx = block['box']
    inne = []
    for r in rader:
        # Raden måste ligga i blocket i TIDEN, inte bara nudda kanten: två
        # pop-block följer ofta direkt på varandra (mätt: prisblocket slutar
        # 19,5 s och fraktblocket börjar 19,6 s, medan OCR-fönstret för
        # "1129KR" sträcker sig till 19,667 s). Utan kravet lånade fraktblocket
        # prisraden.
        overlapp = min(r['t'][1], block['t'][1]) - max(r['t'][0], block['t'][0])
        if overlapp < min(0.5, (r['t'][1] - r['t'][0]) / 2):
            continue
        b = r['box']
        # rutan ska ligga i blocket (≥ 60 % av radens yta)
        x0, y0 = max(b[0], bx[0]), max(b[1], bx[1])
        x1, y1 = min(b[2], bx[2]), min(b[3], bx[3])
        yta = (b[2] - b[0]) * (b[3] - b[1])
        if x1 <= x0 or y1 <= y0 or not yta:
            continue
        if (x1 - x0) * (y1 - y0) / float(yta) < 0.6:
            continue
        inne.append(r)

    kluster = []
    for r in sorted(inne, key=lambda r: r['box'][1]):
        lagd = False
        for k in kluster:
            a, b = k['box'], r['box']
            ov = min(a[3], b[3]) - max(a[1], b[1])
            kort = min(a[3] - a[1], b[3] - b[1]) or 1
            if ov > 0 and ov / float(kort) >= 0.5:
                k['box'] = union(a, b)
                k['kandidater'].append(r)
                lagd = True
                break
        if not lagd:
            kluster.append({'box': list(r['box']), 'kandidater': [r]})

    ut = []
    for k in kluster:
        # Den mest lästa raden vinner; tie-break på konfidens × längd, så en
        # lång säker avläsning slår ett kort fragment ("14C9 KR" > "149").
        best = sorted(k['kandidater'],
                      key=lambda r: (r['rutor'], r['konf'] * len(r['text'])), reverse=True)[0]
        # Rutan ritas av de avläsningar som setts i MINST TVÅ bildrutor. En
        # engångsavläsning har ofta en vild ruta (mätt: den stora röda texten
        # lästes en bildruta som bara "K" i rutan 362,264–579,557, 112 px
        # högre än de sju avläsningarna av "1129KR"). Finns ingen sådan rad —
        # jämförprisraden lästes olika i varenda ruta — används alla.
        stabila = [r for r in k['kandidater'] if r['rutor'] >= 2]
        valda = stabila or k['kandidater']
        box = list(valda[0]['box'])
        for r in valda[1:]:
            box = union(box, r['box'])
        ut.append({'text': best['text'],
                   'texter': sorted({t for r in k['kandidater'] for t in r['texter']}),
                   'box': box, 'konf': best['konf'],
                   'rutor': sum(r['rutor'] for r in k['kandidater']),
                   'ruta_ur': 'rader sedda i ≥ 2 bildrutor' if stabila else 'alla avläsningar (ingen sågs två gånger)'})
    return ut


# --------------------------------------------------------------------------
# Ordcaption-pillret (porterad piller.py)
# --------------------------------------------------------------------------
# Pillret är en nästan vit platta med mörk text, nederst i bild. Det mäts i
# PIXLAR och inte med OCR, av exakt samma skäl som röda blocket: en rad som
# OCR:en läser fel ska ändå suddas. Språket spelar ingen roll — plattan syns.
# Trösklarna är piller.py:s (2026-09-18) med bredden skalad mot upplösningen.
PILLER_VIT, PILLER_MORK = 235, 60
PILLER_MIN_BREDD = 1 / 6      # andel av bildbredden som måste vara vit på raden
PILLER_MIN_MORKA = 3          # mörka textpixlar på samma rad
PILLER_MIN_HOJD = 16          # px; tunnare band är inte en textrad
PILLER_MAX_HOJD = 1 / 9       # andel av bildhöjden; högre är inte ett piller


def piller_fonster(fil, W, H, fps, zon_fran=0.5):
    """Bildrutor där ett ordcaption-piller syns, grupperade till fönster.

    Returnerar [{"t":[t0,t1], "box":[x0,y0,x1,y1], "rutor":n}] — rutan är
    UNIONEN av pillrets läge i fönstrets bildrutor."""
    p = subprocess.run([ffmpeg_bin(), '-v', 'error', '-i', fil, '-vf', f'fps={fps}',
                        '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True)
    ra = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(ra) // (W * H)
    if n == 0:
        return []
    fr = ra[:n * W * H].reshape(n, H, W).astype(np.int16)
    lo = int(H * zon_fran)
    min_bredd = max(60, int(W * PILLER_MIN_BREDD))
    max_hojd = int(H * PILLER_MAX_HOJD)
    per_ruta = []
    for i in range(n):
        g = fr[i][lo:]
        vit = g > PILLER_VIT
        mork = g < PILLER_MORK
        rader = np.nonzero((vit.sum(axis=1) > min_bredd) & (mork.sum(axis=1) >= PILLER_MIN_MORKA))[0]
        if len(rader) < PILLER_MIN_HOJD:
            per_ruta.append(None)
            continue
        y0, y1 = int(rader[0]), int(rader[-1])
        if y1 - y0 > max_hojd:
            per_ruta.append(None)
            continue
        # x mäts på TEXTEN, inte på det vita: `vit.any(axis=0)` tar med varje
        # ljus sak i bandet (mätt 2026-09-20: husvagnens vita tak gav x 0–719
        # på en 720 px bred bild, alltså hela bredden). Den mörka texten är
        # däremot bara pillrets. Kolumnklustret får ha mellanrum upp till
        # ordmellanrummets bredd.
        morka = np.nonzero(mork[y0:y1 + 1].sum(axis=0) >= 2)[0]
        if len(morka) < 10:
            per_ruta.append(None)
            continue
        kluster, start = [], 0
        for k in range(1, len(morka) + 1):
            if k == len(morka) or morka[k] - morka[k - 1] > max(20, W // 24):
                kluster.append((int(morka[start]), int(morka[k - 1])))
                start = k
        x0, x1 = max(kluster, key=lambda c: c[1] - c[0])
        # Plattans kant ligger några px utanför texten. Den kan INTE mätas
        # genom att växa ut i det vita: i den här källan är himlen och
        # husvagnens tak också vita, och kanten växte till hela bildbredden
        # (mätt 2026-09-20). Ett fast tillägg är ärligare än en mätning som
        # spårar ur.
        pad = max(10, (y1 - y0) // 3)
        per_ruta.append([max(0, x0 - pad), lo + y0, min(W - 1, x1 + pad), lo + y1])

    fonster, oppet = [], None
    for i, box in enumerate(per_ruta):
        if box is None:
            if oppet and i - oppet['sista_i'] > 1:
                fonster.append(oppet)
                oppet = None
            continue
        if oppet and i - oppet['sista_i'] <= 1:
            oppet['box'] = union(oppet['box'], box)
            oppet['sista_i'] = i
            oppet['rutor'] += 1
        else:
            if oppet:
                fonster.append(oppet)
            oppet = {'box': list(box), 'forsta_i': i, 'sista_i': i, 'rutor': 1}
    if oppet:
        fonster.append(oppet)
    sedda = [b for b in per_ruta if b]
    median = None
    if sedda:
        median = [int(np.median([b[k] for b in sedda])) for k in range(4)]
    return {
        'fonster': [{'t': [round(f['forsta_i'] / fps, 3), round((f['sista_i'] + 1) / fps, 3)],
                     'box': f['box'], 'rutor': f['rutor']} for f in fonster],
        'median_box': median,
        'rutor_med_piller': len(sedda),
        'rutor': n,
    }


# --------------------------------------------------------------------------
def mat(fil, fps=3, konf=0.45, rod_fps=10, till=None, spara_rutor=None):
    W, H, langd = matt(fil)
    tmp = spara_rutor or tempfile.mkdtemp(prefix='inbrand-')
    os.makedirs(tmp, exist_ok=True)
    try:
        namn = dra_rutor(fil, fps, tmp)
        motor = ocr_motor()
        per_ruta = []
        for f in namn:
            t = len(per_ruta) / float(fps)
            if till is not None and t >= till:
                per_ruta.append([])
                continue
            per_ruta.append(las_ruta(motor, os.path.join(tmp, f), konf))
        rader = gruppera(per_ruta, fps, H)
    finally:
        if not spara_rutor:
            shutil.rmtree(tmp, ignore_errors=True)

    block = [b for b in roda_block(fil, W, H, rod_fps)
             if till is None or b['t'][0] < till]
    for b in block:
        if till is not None:
            b['t'][1] = min(b['t'][1], till)
        b['rader'] = rader_i_block(b, rader)

    piller = piller_fonster(fil, W, H, rod_fps)
    piller['fonster'] = [p for p in piller['fonster'] if till is None or p['t'][0] < till]
    for p in piller['fonster']:
        if till is not None:
            p['t'][1] = min(p['t'][1], till)

    return {'fil': os.path.abspath(fil), 'W': W, 'H': H, 'langd': round(langd, 3),
            'fps': fps, 'rod_fps': rod_fps, 'rutor': len(per_ruta),
            'till': till, 'konf_min': konf, 'rader': rader, 'rodblock': block,
            'piller': piller}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('video')
    ap.add_argument('--fps', type=float, default=3, help='OCR-bildrutor per sekund (standard 3)')
    ap.add_argument('--rod-fps', type=float, default=10, help='röd-skanningens bildrutor per sekund')
    ap.add_argument('--konf', type=float, default=0.45, help='lägsta OCR-konfidens')
    ap.add_argument('--till', type=float, default=None,
                    help='mät bara fram till den här sekunden (slutkortet klipps bort senare)')
    ap.add_argument('--rutor', default=None, help='spara bildrutorna i mappen (för att titta själv)')
    a = ap.parse_args()
    try:
        json.dump(mat(a.video, a.fps, a.konf, a.rod_fps, a.till, a.rutor),
                  sys.stdout, ensure_ascii=False)
    except Fel as e:
        sys.exit(str(e))


if __name__ == '__main__':
    main()
