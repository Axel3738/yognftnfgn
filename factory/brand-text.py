#!/usr/bin/env python3
"""brand-text.py — läser texten i en bild eller en videoframe. 0 krediter.

Yta 3 (inbränd text + slutkort) och yta 4 (attribution i bildannons) i
brand-detektorn går inte att döma utan att faktiskt LÄSA bilden. Det här är
den läsningen: lokal OCR, ingen molntjänst, ingen kie.ai.

    python3 factory/brand-text.py --filer bild1.jpg bild2.jpg
    python3 factory/brand-text.py --filer -        # filnamn på stdin, ett per rad

Skriver JSON på stdout: { "<fil>": [ {"text": "...", "konfidens": 0.97}, ... ] }.
Ingen dom fattas här — matchningen mot brandnamnet görs på ett enda ställe
(factory/brandord.mjs), så yta 1–4 aldrig kan döma olika på samma sträng.

Beroende: rapidocr-onnxruntime (pip install rapidocr-onnxruntime). Saknas det
avslutar skriptet med kod 2 och ett tydligt meddelande — brand-detektorn
skriver då "okänd" på ytan, aldrig "ren".
"""
import json
import sys
from pathlib import Path

MIN_KONFIDENS = 0.30  # under detta är OCR:en gissningar, inte läsning


def las_motor():
    try:
        from rapidocr_onnxruntime import RapidOCR
    except ImportError:
        sys.exit(
            "2:rapidocr-onnxruntime saknas. Kör: pip install rapidocr-onnxruntime\n"
            "Utan OCR kan yta 3 och 4 inte läsas — de blir 'okänd', aldrig 'ren'."
        )
    return RapidOCR()


def main():
    argv = sys.argv[1:]
    if "--filer" not in argv:
        sys.exit("Användning: brand-text.py --filer <fil ...>  (eller --filer - för stdin)")
    filer = argv[argv.index("--filer") + 1:]
    if filer == ["-"]:
        filer = [r.strip() for r in sys.stdin.read().splitlines() if r.strip()]
    if not filer:
        print("{}")
        return

    motor = las_motor()
    ut = {}
    for f in filer:
        p = Path(f)
        if not p.exists():
            ut[f] = []
            continue
        resultat, _ = motor(str(p))
        rader = []
        for post in resultat or []:
            # RapidOCR ger [box, text, konfidens] per rad.
            text = post[1]
            konf = float(post[2])
            if konf >= MIN_KONFIDENS and str(text).strip():
                # Rutan följer med. Utan den går det att SE att en bild bär ett
                # förbjudet påstående, men inte att BYTA ut det.
                xs = [float(p[0]) for p in post[0]]
                ys = [float(p[1]) for p in post[0]]
                rader.append({
                    "text": str(text).strip(),
                    "konfidens": round(konf, 3),
                    "ruta": [round(min(xs)), round(min(ys)), round(max(xs)), round(max(ys))],
                })
        ut[f] = rader
    json.dump(ut, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
