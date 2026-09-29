#!/usr/bin/env python3
"""logga.py — tar bort en logga från en slät vägg i en stillastående scen och skriver en ren lapp (PNG).

Byggt 2026-09-29 för Matstrumpors 012v2: sista scenen bär loggan "MATSTRUMPOR.SE" på väggen, och
butikens namn och adress får aldrig stå i en annons (CLAUDE.md). Vanlig ifyllning (cv2.inpaint)
lämnade en ljus skugga i loggans form. Här fylls i stället varje kolumn LODRÄTT mellan väggen
ovanför och nedanför loggan, så att lodräta kanter (fönsterkarmen) står kvar raka. Därefter
mjukas fyllningen upp lite i sidled och får väggens brus. Scenen måste stå still: lappen läggs som
en fast bild över hela scenen (mätt för 012v2: medelskillnad ≤ 0,4 i regionen över scenen).

  python3 pipeline/logga.py <video> <sekund> <x0,y0,x1,y1> <ut.png> [--kontroll <kontroll.png>]

Regionen ska omsluta loggan med vägg runt om (loggan får inte nå regionens kant). Masken är
färgade pixlar (orange text, lax, kinder), mörka pixlar (ögon, mun) och vita delar (riset) som
ligger intill dem och inte når kanten (fönstret till höger är också vitt).
"""
import sys

import cv2
import numpy as np


def mask(reg, dil=15):
    """Loggans pixlar i regionen (bool), vidgade med dil px."""
    hsv = cv2.cvtColor(reg, cv2.COLOR_BGR2HSV)
    sa, v = hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    hh, ww = reg.shape[:2]
    kant = lambda x, y, w, h: x == 0 or y == 0 or x + w == ww or y + h == hh
    farg, mork, vit = sa > 55, v < 125, (v > 228) & (sa < 45)
    nara = cv2.dilate((farg | mork).astype(np.uint8), np.ones((15, 15), np.uint8)) > 0
    n, lab, st, _ = cv2.connectedComponentsWithStats(vit.astype(np.uint8))
    vit2 = np.zeros_like(vit)
    for i in range(1, n):
        x, y, w, h, a = st[i]
        k = lab == i
        if not kant(x, y, w, h) and h < 110 and w < 260 and (k & nara).sum() > 0.02 * a: vit2 |= k
    m = (farg | mork | vit2).astype(np.uint8) * 255
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)))
    m2 = np.zeros_like(m)
    for i in range(1, n2):
        x, y, w, h, a = st2[i]
        if a > 30 and not kant(x, y, w, h): m2[lab2 == i] = 255
    return cv2.dilate(m2, np.ones((dil, dil), np.uint8)) > 0


def fyll_lodratt(reg, m, seed=1):
    """Fyller masken kolumn för kolumn mellan väggen ovanför och nedanför. Returnerar (bild, mjuk alfa)."""
    reg = reg.astype(np.float32)
    hh, ww = m.shape
    ut = reg.copy()
    for x in range(ww):
        col, y = m[:, x], 0
        while y < hh:
            if not col[y]: y += 1; continue
            ya = y
            while y < hh and col[y]: y += 1
            xa, xb = max(0, x - 2), min(ww, x + 3)
            top = np.median(reg[max(0, ya - 6):ya, xa:xb].reshape(-1, 3), axis=0) if ya > 0 else None
            bot = np.median(reg[y:min(hh, y + 6), xa:xb].reshape(-1, 3), axis=0) if y < hh else None
            top = bot if top is None else top
            bot = top if bot is None else bot
            t = np.linspace(0, 1, y - ya + 2)[1:-1][:, None]
            ut[ya:y, x] = top * (1 - t) + bot * t
    mjuk = cv2.GaussianBlur(ut, (0, 0), sigmaX=3, sigmaY=1)
    fyll = np.where(m[..., None], mjuk, ut)
    fyll = np.where(m[..., None], fyll + np.random.default_rng(seed).normal(0, 1.2, fyll.shape).astype(np.float32), fyll)
    alfa = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 2)
    return fyll.clip(0, 255).astype(np.uint8), alfa


def lapp(video, sek, ruta):
    """RGBA-lapp för regionen ur rutan vid sek. Returnerar (lapp, originalregion, ren region)."""
    cap = cv2.VideoCapture(video)
    cap.set(cv2.CAP_PROP_POS_MSEC, sek * 1000)
    ok, f = cap.read()
    if not ok: sys.exit(f'kan inte läsa {video} vid {sek} s')
    x0, y0, x1, y1 = ruta
    reg = f[y0:y1, x0:x1]
    m = mask(reg)
    if m.mean() < 0.02: sys.exit('ingen logga hittad i regionen')
    fyll, alfa = fyll_lodratt(reg, m)
    rgba = np.dstack([cv2.cvtColor(fyll, cv2.COLOR_BGR2RGB), (alfa * 255).astype(np.uint8)])
    ren = (reg * (1 - alfa[..., None]) + fyll * alfa[..., None]).astype(np.uint8)
    return rgba, reg, ren


if __name__ == '__main__':
    video, sek, ruta, ut = sys.argv[1], float(sys.argv[2]), [int(x) for x in sys.argv[3].split(',')], sys.argv[4]
    rgba, reg, ren = lapp(video, sek, ruta)
    cv2.imwrite(ut, cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA))
    if '--kontroll' in sys.argv: cv2.imwrite(sys.argv[sys.argv.index('--kontroll') + 1], np.hstack([reg, ren]))
    print(f'lapp {ut}: {rgba.shape[1]}×{rgba.shape[0]} vid ({ruta[0]},{ruta[1]}), {100 * (rgba[..., 3] > 127).mean():.0f} % ifyllt')
