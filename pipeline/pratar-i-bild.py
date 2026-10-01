#!/usr/bin/env python3
"""Mäter om någon PRATAR I BILD i en videoannons.

Varför: HeyGen kostar krediter per rendering och gör läppsynk. ElevenLabs
kostar per tecken och gör bara ljud. Skillnaden spelar roll i exakt ett fall —
när en riktig människa syns prata mot kameran, för då måste munnen följa den
nya repliken. Har videon bara voiceover över produktbilder kan ljudet bytas
rakt av, och då är HeyGen bortkastade pengar.

Skriptet DÖMER inte på gissningar. Det mäter tre saker per videoannons:

  1. andel_ansikte  — hur stor del av de avlästa bildrutorna som har ett
                      frontalt ansikte (Haar-kaskaden som följer med OpenCV,
                      helt offline).
  2. ansiktsyta     — medianansiktets yta som andel av bildytan. Ett ansikte
                      långt bort i en b-roll är inte en talande person.
  3. munrorelse     — medianförändringen i munregionen mellan två avlästa
                      bildrutor där ansiktet ligger kvar på samma ställe.
                      En stillbild på en person rör sig inte; en som pratar gör det.

⚠️ **Osäkerhet ger alltid HeyGen.** Går videon inte att läsa, saknar den
bildspår, eller hamnar måtten i gråzonen, blir domen OKÄND och den som
anropar ska välja HeyGen. Att bränna krediter i onödan kostar pengar; att
lägga ny röst på en mun som rör sig fel kostar förtroende, och det syns i
varje visning. Repots regel gäller: en kontroll som inte kan köras
rapporteras med orsak, aldrig som grön.

Beroenden: opencv-python-headless<5 (bär Haar-kaskaderna inbyggt — OpenCV 5
har tagit bort både CascadeClassifier och kaskadfilerna, mätt 2026-09-30),
numpy. Inget nät, ingen modell att ladda ner.

    python3 pipeline/pratar-i-bild.py <video.mp4> [--json] [--rutor 90]
    python3 pipeline/pratar-i-bild.py <mapp>/*.mp4 --json
"""

import argparse
import json
import os
import sys

try:
    import cv2
except ImportError:
    sys.exit('opencv saknas (pip install "opencv-python-headless<5")')
import numpy as np


# --- Trösklar, mätta 2026-09-30 på 86 riktiga videor: 84 av Bäverbutikens
# NO-källor (produktfilm med voiceover) och 2 UGC-annonser där en människa
# pratar mot kameran (`Termoskydd_UG_1_H1`, `Takoverdrag_UG_1_H1`, hämtade med
# SIDTOKEN — de är page-ägda reels och `source` är tom på den vanliga token:en).
#
# ⚠️ **Ytan är grinden, inte träfffrekvensen.** Haar-kaskaden hittar "ansikten"
# i tyg, gräs och rutiga skjortor, och de falska träffarna kan dyka upp i
# hälften av bildrutorna — `Batmotortrekk RV_1_H1` fick ansikte i 50 % av
# rutorna med en median ansiktsyta på 0,39 %. Ett ansikte som ska läppsynkas
# fyller en helt annan del av bilden. Mätt:
#   talande ansikte (2 st):  yta 2,9–3,1 %, andel 37–52 %, munrörelse ~20
#   produktvideo (84 st):    yta median 0,66 %; de med hög andel har yta < 0,8 %
# Ändra trösklarna bara mot NYA mätningar, aldrig mot en magkänsla.
ANSIKTSYTA_GOLV = 0.015         # under detta finns inget ansikte att synka mot
ANDEL_ANSIKTE_PRATAR = 0.35     # ansikte i minst så stor del av bildrutorna
MUNRORELSE_PRATAR = 4.0         # median abs-diff i munrutan (0-255)
# Ett stort ansikte som bara glimtar förbi är inte en talande person.
ANDEL_ANSIKTE_GRAZON = 0.12


def _las_rutor(sokvag, max_rutor):
    """Jämnt spridda bildrutor ur videon, som gråskala + färg."""
    kap = cv2.VideoCapture(sokvag)
    if not kap.isOpened():
        raise RuntimeError('videon gick inte att öppna')
    totalt = int(kap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    fps = kap.get(cv2.CAP_PROP_FPS) or 0
    if totalt <= 0:
        # Vissa filer saknar räknare — läs sekventiellt i stället.
        rutor = []
        while len(rutor) < max_rutor:
            ok, ruta = kap.read()
            if not ok:
                break
            rutor.append(ruta)
        kap.release()
        if not rutor:
            raise RuntimeError('inget bildspår gick att läsa')
        return rutor, fps, len(rutor)
    steg = max(1, totalt // max_rutor)
    rutor = []
    for i in range(0, totalt, steg):
        kap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ok, ruta = kap.read()
        if ok:
            rutor.append(ruta)
        if len(rutor) >= max_rutor:
            break
    kap.release()
    if not rutor:
        raise RuntimeError('inget bildspår gick att läsa')
    return rutor, fps, totalt


def _kaskad():
    fil = os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')
    if not os.path.exists(fil):
        raise RuntimeError(f'Haar-kaskaden saknas ({fil}) — installera opencv-python-headless<5')
    k = cv2.CascadeClassifier(fil)
    if k.empty():
        raise RuntimeError('Haar-kaskaden gick inte att läsa')
    return k


def _munruta(ansikte):
    """Munregionen ur en ansiktsruta: nedre 40 %, mittersta 60 % i bredd."""
    x, y, b, h = ansikte
    return (x + int(b * 0.20), y + int(h * 0.60), int(b * 0.60), int(h * 0.40))


def _storsta(ansikten):
    return max(ansikten, key=lambda a: a[2] * a[3])


def mat(sokvag, max_rutor=90):
    """Måtten för en video. Kastar RuntimeError om den inte går att läsa."""
    rutor, fps, totalt = _las_rutor(sokvag, max_rutor)
    kaskad = _kaskad()
    hojd, bredd = rutor[0].shape[:2]
    bildyta = float(hojd * bredd)

    traffar = []          # (index, ansiktsruta)
    for i, ruta in enumerate(rutor):
        gra = cv2.cvtColor(ruta, cv2.COLOR_BGR2GRAY)
        gra = cv2.equalizeHist(gra)
        ansikten = kaskad.detectMultiScale(
            gra, scaleFactor=1.1, minNeighbors=6,
            minSize=(int(min(hojd, bredd) * 0.08),) * 2)
        if len(ansikten):
            traffar.append((i, _storsta(ansikten), gra))

    andel = len(traffar) / len(rutor)
    ytor = [a[2] * a[3] / bildyta for _, a, _ in traffar]
    ansiktsyta = float(np.median(ytor)) if ytor else 0.0

    # Munrörelse: bara mellan träffar som ligger nära varandra i tid OCH där
    # ansiktet står kvar ungefär på samma ställe. Flyttar sig ansiktet är det
    # kameran eller en ny scen, inte en mun.
    diffar = []
    for (i1, a1, g1), (i2, a2, g2) in zip(traffar, traffar[1:]):
        if i2 - i1 > 2:
            continue
        if abs(a1[0] - a2[0]) > a1[2] * 0.25 or abs(a1[1] - a2[1]) > a1[3] * 0.25:
            continue
        m1, m2 = _munruta(a1), _munruta(a2)
        k1 = g1[m1[1]:m1[1] + m1[3], m1[0]:m1[0] + m1[2]]
        k2 = g2[m2[1]:m2[1] + m2[3], m2[0]:m2[0] + m2[2]]
        if k1.size == 0 or k2.size == 0:
            continue
        k1 = cv2.resize(k1, (64, 32)).astype(np.int16)
        k2 = cv2.resize(k2, (64, 32)).astype(np.int16)
        diffar.append(float(np.abs(k1 - k2).mean()))
    munrorelse = float(np.median(diffar)) if diffar else 0.0

    return {
        'fil': os.path.basename(sokvag),
        'rutor_lasta': len(rutor),
        'bildrutor_totalt': totalt,
        'fps': round(fps, 2),
        'upplosning': f'{bredd}x{hojd}',
        'andel_ansikte': round(andel, 3),
        'ansiktsyta': round(ansiktsyta, 4),
        'munrorelse': round(munrorelse, 2),
        'munpar': len(diffar),
    }


def dom(m):
    """Ren funktion: måtten in, dom ut. PRATAR | VOICEOVER | OKAND.

    PRATAR   ⇒ HeyGen (läppsynk krävs)
    VOICEOVER⇒ ElevenLabs (bara ljudet behöver bytas)
    OKAND    ⇒ HeyGen, för säkerhets skull
    """
    if m.get('fel'):
        return 'OKAND', m['fel']
    andel = m['andel_ansikte']
    yta = m['ansiktsyta']
    mun = m['munrorelse']
    # Grinden först: är största ansiktet för litet finns ingen mun att synka,
    # hur ofta kaskaden än tyckt sig se ett ansikte.
    if yta < ANSIKTSYTA_GOLV:
        return 'VOICEOVER', (f'största ansiktet {yta:.1%} av bildytan — för litet för att '
                             f'vara en talande person (ansikte i {andel:.0%} av bildrutorna)')
    if andel < ANDEL_ANSIKTE_GRAZON:
        return 'VOICEOVER', f'ansikte i bara {andel:.0%} av bildrutorna — glimtar förbi'
    if andel >= ANDEL_ANSIKTE_PRATAR and mun >= MUNRORELSE_PRATAR:
        return 'PRATAR', (f'ansikte i {andel:.0%} av bildrutorna, '
                          f'{yta:.1%} av bildytan, munrörelse {mun:.1f}')
    if andel >= ANDEL_ANSIKTE_PRATAR and mun < MUNRORELSE_PRATAR:
        return 'VOICEOVER', (f'ansikte i {andel:.0%} av bildrutorna men munnen står still '
                             f'(rörelse {mun:.1f} < {MUNRORELSE_PRATAR})')
    return 'OKAND', (f'gråzon: ansikte {andel:.0%}, yta {yta:.1%}, munrörelse {mun:.1f} '
                     f'— går inte att avgöra, kör HeyGen')


def verktyg(dom_):
    return 'elevenlabs' if dom_ == 'VOICEOVER' else 'heygen'


def main():
    p = argparse.ArgumentParser(description='Pratar någon i bild? Avgör HeyGen vs ElevenLabs.')
    p.add_argument('videor', nargs='+')
    p.add_argument('--json', action='store_true')
    p.add_argument('--rutor', type=int, default=90, help='max antal bildrutor att läsa')
    a = p.parse_args()

    ut = []
    for v in a.videor:
        try:
            m = mat(v, a.rutor)
        except Exception as e:                      # noqa: BLE001 — orsaken ska med i rapporten
            m = {'fil': os.path.basename(v), 'fel': str(e)}
        d, skal = dom(m)
        m['dom'], m['skal'], m['verktyg'] = d, skal, verktyg(d)
        ut.append(m)

    if a.json:
        print(json.dumps(ut, indent=1, ensure_ascii=False))
    else:
        for m in ut:
            ikon = {'PRATAR': '🗣', 'VOICEOVER': '🔊', 'OKAND': '❓'}[m['dom']]
            print(f"{ikon} {m['fil']:<28} {m['dom']:<10} → {m['verktyg']:<11} {m['skal']}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
