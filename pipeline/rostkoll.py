#!/usr/bin/env python3
"""rostkoll.py — fångar en keff röst INNAN videon levereras.

    python3 pipeline/rostkoll.py --kalla original.mp4 --ny oversatt.mp4 [--srt oversatt.srt]
    python3 pipeline/rostkoll.py --mapp final/ --kallmapp original/ --srtmapp srt-fixed/

Axels regel 2026-09-08: ingen HeyGen-video går ut med dålig röst.
Proofread läser TEXTEN — den säger ingenting om hur rösten låter. Det här
skriptet läser LJUDET i den renderade filen och jämför med källan.

Kostar 0 kr och 0 krediter: bara ffmpeg lokalt.

VAD SOM FAKTISKT GÅR ATT MÄTA — och vad som inte gör det
---------------------------------------------------------
ffmpeg hör inte skillnad på tal och musik. Nästan varje annons har en
musikbädd som ligger på hela filmen, så "hur mycket av filmen är tal"
går INTE att mäta ur ljudet — ett första försök 2026-09-08 dömde varenda
video som "avhuggen" av precis det skälet. En kontroll som alltid är röd
är värdelös; den togs bort samma dag.

Talets tider kommer därför ur SRT:en när den finns (HeyGen lämnar ut den,
och pipelinen sparar den redan). Ur ljudet mäts bara det ljudet faktiskt
bär: volym och längd.

Fyra fel den fångar, alla verkliga HeyGen-lägen:

  1. TYST spår — klonen misslyckades helt.                      (ljud)
  2. LÄNGDDRIFT mot källan — rösten låter för snabb eller släpig. (ljud)
  3. AVHUGGET SLUT — sista repliken hinner inte ta slut.         (SRT)
  4. TAPPAT TAL — meningar har fallit bort i översättningen.      (SRT)

⚠️ Skriptet hör inte om rösten låter TREVLIG — det hör om den är trasig.
Grönt betyder "inga mätbara fel", inte "godkänd". Lyssna alltid på minst
den video som ska bära mest spend.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

MAX_LANGDDRIFT = 0.15        # >15 % skillnad i längd hörs som fel tempo
MIN_MEDELVOLYM_DB = -45.0    # under detta är spåret i praktiken tyst
MAX_TALTAPP = 0.40           # översättningen får tappa max 40 % av källans tal
SLUTMARGINAL_S = 0.15        # sista repliken närmare slutet än så = avhuggen


def kor(argv):
    return subprocess.run(argv, capture_output=True, text=True)


def langd(fil):
    r = kor(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(fil)])
    try:
        return float(r.stdout.strip())
    except ValueError:
        return None


def har_ljudspar(fil):
    r = kor(["ffprobe", "-v", "error", "-select_streams", "a",
             "-show_entries", "stream=index", "-of", "csv=p=0", str(fil)])
    return bool(r.stdout.strip())


def volym(fil):
    r = kor(["ffmpeg", "-i", str(fil), "-af", "volumedetect", "-f", "null", "-"])
    m = re.search(r"mean_volume:\s*(-?\d+(?:\.\d+)?) dB", r.stderr)
    x = re.search(r"max_volume:\s*(-?\d+(?:\.\d+)?) dB", r.stderr)
    return (float(m.group(1)) if m else None, float(x.group(1)) if x else None)


TID = re.compile(r"(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})")


def srt_tider(fil):
    """(talsekunder, sista_replikens_slut) ur en SRT. None om filen saknas."""
    if not fil or not Path(fil).exists():
        return None
    text = Path(fil).read_text(encoding="utf-8", errors="replace")
    sek = lambda h, m, s, ms: int(h) * 3600 + int(m) * 60 + int(s) + int(ms.ljust(3, "0")) / 1000
    intervall = []
    for m in TID.finditer(text):
        a = sek(*m.groups()[:4])
        b = sek(*m.groups()[4:])
        if b > a:
            intervall.append((a, b))
    if not intervall:
        return None
    # Slå ihop överlappande repliker så tiden inte dubbelräknas.
    intervall.sort()
    ihop = [list(intervall[0])]
    for a, b in intervall[1:]:
        if a <= ihop[-1][1]:
            ihop[-1][1] = max(ihop[-1][1], b)
        else:
            ihop.append([a, b])
    return sum(b - a for a, b in ihop), ihop[-1][1]


def kolla(kalla, ny, srt=None, kall_srt=None):
    fel, noter, m = [], [], {}

    if not har_ljudspar(ny):
        return ["den översatta filen har inget ljudspår alls"], noter, m

    m["langd_ny"] = langd(ny)
    m["medel_db"], m["max_db"] = volym(ny)

    # 1. tyst spår
    if m["medel_db"] is not None and m["medel_db"] < MIN_MEDELVOLYM_DB:
        fel.append(f"ljudet är i praktiken tyst (medelvolym {m['medel_db']:.1f} dB)")

    # 2. längddrift
    if kalla:
        if not har_ljudspar(kalla):
            fel.append("källvideon har inget ljudspår — det finns ingen röst att klona")
        m["langd_kalla"] = langd(kalla)
        if m["langd_kalla"] and m["langd_ny"]:
            drift = abs(m["langd_ny"] - m["langd_kalla"]) / m["langd_kalla"]
            m["langddrift"] = round(drift, 3)
            if drift > MAX_LANGDDRIFT:
                fel.append(f"längden drev {drift*100:.0f} % "
                           f"({m['langd_kalla']:.1f}s → {m['langd_ny']:.1f}s) — tempot låter fel")
    else:
        noter.append("ingen källvideo angiven — längddriften gick inte att mäta")

    # 3 + 4: talets tider ur SRT
    t = srt_tider(srt)
    if t:
        m["tal_ny"], sista = t
        m["sista_replik_slut"] = round(sista, 2)
        if m["langd_ny"] and (m["langd_ny"] - sista) < SLUTMARGINAL_S:
            fel.append(f"sista repliken slutar {sista:.2f}s in i en {m['langd_ny']:.2f}s film "
                       f"— rösten hinner inte tala klart")
        tk = srt_tider(kall_srt)
        if tk:
            m["tal_kalla"] = tk[0]
            if tk[0] > 0:
                tapp = (tk[0] - m["tal_ny"]) / tk[0]
                m["taltapp"] = round(tapp, 3)
                if tapp > MAX_TALTAPP:
                    fel.append(f"översättningen tappade {tapp*100:.0f} % av talet "
                               f"({tk[0]:.1f}s → {m['tal_ny']:.1f}s)")
    else:
        noter.append("ingen SRT — avhugget slut och tappat tal gick inte att mäta")

    return fel, noter, m


def hitta(mapp, namn):
    if not mapp:
        return None
    stam = Path(namn).stem
    for kand in Path(mapp).glob("*"):
        if kand.stem == stam or kand.stem.replace(".orig", "") == stam:
            return kand
    return None


def main():
    p = argparse.ArgumentParser(description="Röstkoll på HeyGen-översatta videor.")
    p.add_argument("--ny"); p.add_argument("--kalla"); p.add_argument("--srt")
    p.add_argument("--kallsrt")
    p.add_argument("--mapp"); p.add_argument("--kallmapp"); p.add_argument("--srtmapp")
    p.add_argument("--kallsrtmapp")
    p.add_argument("--json", action="store_true")
    a = p.parse_args()

    jobb = []
    if a.mapp:
        for f in sorted(Path(a.mapp).glob("*.mp4")):
            jobb.append((hitta(a.kallmapp, f.name), f,
                         hitta(a.srtmapp, f.name), hitta(a.kallsrtmapp, f.name)))
    elif a.ny:
        jobb.append((Path(a.kalla) if a.kalla else None, Path(a.ny),
                     a.srt, a.kallsrt))
    else:
        p.error("ange --ny eller --mapp")

    if not jobb:
        print("Inga mp4-filer hittades.")
        return 1

    allt, trasiga = {}, 0
    for kalla, ny, srt, ksrt in jobb:
        fel, noter, m = kolla(kalla, ny, srt, ksrt)
        allt[ny.name] = {"fel": fel, "noteringar": noter, "matvarden": m}
        if fel:
            trasiga += 1
            print(f"❌ {ny.name}")
            for f in fel:
                print(f"     {f}")
        else:
            print(f"✅ {ny.name}")
        for n in noter:
            print(f"     ⚠️ {n}")

    print(f"\n{len(jobb) - trasiga} av {len(jobb)} klarade röstkollen.")
    if a.json:
        print(json.dumps(allt, ensure_ascii=False, indent=1))
    if trasiga:
        print("\nEn video med ❌ levereras INTE. Rendera om den i HeyGens UI\n"
              "eller stryk den ur batchen — ladda aldrig upp den ändå.")
    print("\n⚠️ Grönt betyder 'inga mätbara fel', inte 'godkänd'.\n"
          "   Lyssna själv på den video som ska bära mest spend.")
    return 1 if trasiga else 0


if __name__ == "__main__":
    sys.exit(main())
