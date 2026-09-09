#!/usr/bin/env python3
"""Bygg om slutkortet i en källvideo så den bär OPS-butikens brand.

Bakgrund: källvideorna slutar med en skärmdump av källbutikens produktsida —
ordmärke, recensionsbetyg och prispar inbränt i pixlarna. Talet i de här
videorna är rent, så de behöver ingen omdubb (och inga HeyGen-credits). Det
enda som måste bytas är slutkortet.

Metoden: mät var rutorna sitter (de ligger still när kortet väl tonat in),
lägg en PNG-overlay över dem och brännn in den med ffmpeg från den sekund
kortet börjar. Talet och resten av videon rörs aldrig.

    python3 factory/slutkort.py --in kalla.mp4 --ut klar.mp4 \
        --start 15.25 --ordmarke TANKGUARD [--pris "489 kr"]

Utan --pris målas prisraden bara över. Det är rätt val när butiken inte har
ett känt pris i videons valuta: en påhittad siffra är förbjuden, en tom yta
är bara tom.

Rutorna är mätta på 720×1280. Kör --mat för att skriva ut vad som faktiskt
sitter var i en given fil innan du litar på dem.
"""
import argparse
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

BREDD, HOJD = 720, 1280
# Sidan bakom kortet är 253, kortet självt är rent vitt. Recensions- och
# prisrutan ligger INNE i kortet — måla dem 253 och de syns som grå plåster.
BAKGRUND = (253, 253, 253)
KORT_BAKGRUND = (255, 255, 255)

# Mätt 2026-09-09 på både den svenska och den norska källvideon. Banderollen
# poppar upp under ~0,4 s, så rutan är unionen av dess största och minsta läge.
RUTA_BANDEROLL = (161, 166, 557, 322)
RUTA_BANDEROLL_STILLA = (168, 169, 551, 319)
RUTA_RECENSION = (300, 838, 420, 853)
RUTA_PRIS = (322, 854, 400, 870)

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"


def bygg_overlay(sokvag, ordmarke, pris=None):
    """Skriv PNG:en som läggs över slutkortet."""
    lager = Image.new("RGBA", (BREDD, HOJD), (0, 0, 0, 0))
    rita = ImageDraw.Draw(lager)

    # Banderollen: hel svart platta, ordmärket i vitt, guldstreck under.
    rita.rectangle(RUTA_BANDEROLL, fill=(0, 0, 0, 255))
    x0, y0, x1, y1 = RUTA_BANDEROLL_STILLA
    storlek = 64
    while storlek > 20:
        font = ImageFont.truetype(FET, storlek)
        bb = rita.textbbox((0, 0), ordmarke, font=font)
        if bb[2] - bb[0] <= (x1 - x0) - 40:
            break
        storlek -= 2
    bb = rita.textbbox((0, 0), ordmarke, font=font)
    tx = x0 + ((x1 - x0) - (bb[2] - bb[0])) // 2 - bb[0]
    ty = y0 + ((y1 - y0) - (bb[3] - bb[1])) // 2 - bb[1] - 6
    rita.text((tx, ty), ordmarke, font=font, fill=(255, 255, 255, 255))
    strecky = ty + bb[3] + 10
    rita.rectangle(
        (tx, strecky, tx + (bb[2] - bb[0]), strecky + 5),
        fill=(212, 175, 55, 255),
    )

    # Recensionsraden bort: butiken har inga egna recensioner att hänvisa till.
    rita.rectangle(RUTA_RECENSION, fill=KORT_BAKGRUND + (255,))

    # Prisparet bort. Med --pris skrivs butikens eget pris i stället.
    rita.rectangle(RUTA_PRIS, fill=KORT_BAKGRUND + (255,))
    if pris:
        font_pris = ImageFont.truetype(FET, 15)
        bb = rita.textbbox((0, 0), pris, font=font_pris)
        px0, py0, px1, py1 = RUTA_PRIS
        rita.text(
            (
                px0 + ((px1 - px0) - (bb[2] - bb[0])) // 2 - bb[0],
                py0 + ((py1 - py0) - (bb[3] - bb[1])) // 2 - bb[1],
            ),
            pris,
            font=font_pris,
            fill=(26, 26, 26, 255),
        )

    lager.save(sokvag)
    return sokvag


def mat(video):
    """Skriv ut var slutkortet börjar och var rutorna sitter i en fil."""
    import glob
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ["ffmpeg", "-v", "error", "-i", video, "-vf",
             f"fps=8,scale={BREDD}:{HOJD}", "-start_number", "0",
             os.path.join(tmp, "f%04d.jpg"), "-y"],
            check=True,
        )
        filer = sorted(glob.glob(os.path.join(tmp, "*.jpg")))
        forsta = None
        for i, f in enumerate(filer):
            im = Image.open(f).convert("RGB")
            px = im.load()
            bg = all(abs(a - b) <= 10 for a, b in zip(px[20, 20], BAKGRUND))
            banderoll = sum(px[360, 240]) < 200
            forsta = i if (bg and banderoll and forsta is None) else (
                forsta if (bg and banderoll) else None)
        if forsta is None:
            print("inget slutkort hittat", file=sys.stderr)
            return None
        print(f"slutkort börjar {forsta / 8:.2f} s (frame {forsta})")
        return forsta / 8


def branne(kalla, ut, overlay, start):
    subprocess.run(
        ["ffmpeg", "-v", "error", "-i", kalla, "-i", overlay,
         "-filter_complex",
         f"[0:v]scale={BREDD}:{HOJD}[v];[v][1:v]overlay=0:0:enable='gte(t,{start})'",
         "-c:a", "copy", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", ut, "-y"],
        check=True,
    )
    return ut


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--in", dest="kalla", required=True)
    p.add_argument("--ut")
    p.add_argument("--start", type=float)
    p.add_argument("--ordmarke", default="TANKGUARD")
    p.add_argument("--pris")
    p.add_argument("--mat", action="store_true")
    a = p.parse_args()

    if a.mat:
        mat(a.kalla)
        sys.exit(0)

    start = a.start if a.start is not None else mat(a.kalla)
    if start is None:
        sys.exit(1)
    ov = os.path.splitext(a.ut)[0] + "-overlay.png"
    bygg_overlay(ov, a.ordmarke, a.pris)
    branne(a.kalla, a.ut, ov, start)
    print(a.ut)
