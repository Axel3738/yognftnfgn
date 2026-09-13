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


def talslut(fil):
    """När talbandets energi (300–3400 Hz) sist ligger över 15 % av toppen, i sekunder.
    Mäts i 50 ms-fönster. None om ljudet inte gick att läsa.

    Finns för att SRT:ens tidkoder är KÄLLANS: HeyGen kräver samma tidkoder i den
    översatta SRT:en, så "sista repliken slutar 0,09 s före slutet" säger bara att den
    svenska källan slutar tätt — inte om dubben hann tala klart. (AdventLane 2026-09-12:
    6 av 7 videor rödmarkerades av tidkoden fast norskan slutade tidigare än svenskan.)"""
    r = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(fil), "-vn",
                        "-af", "highpass=f=300,lowpass=f=3400", "-ac", "1", "-ar", "16000",
                        "-f", "s16le", "-"], capture_output=True)
    if not r.stdout:
        return None
    import array
    a = array.array("h"); a.frombytes(r.stdout[: len(r.stdout) // 2 * 2])
    w = 800
    n = len(a) // w
    if n == 0:
        return None
    rms = [ (sum(x * x for x in a[i * w:(i + 1) * w]) / w) ** 0.5 for i in range(n) ]
    topp = max(rms) or 1.0
    sista = max((i for i, v in enumerate(rms) if v > 0.15 * topp), default=-1)
    return (sista + 1) * 0.05 if sista >= 0 else 0.0


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
            # Tidkoden är källans (HeyGen kräver samma tidkoder). Har vi källan: mät i
            # LJUDET var talet faktiskt slutar i båda. Dubben är avhuggen bara om den
            # slutar tätare mot slutet än källan gör (mer än 50 ms tätare).
            marg_ny = marg_k = None
            if kalla and m.get("langd_kalla"):
                ts_ny, ts_k = talslut(ny), talslut(kalla)
                if ts_ny is not None and ts_k is not None:
                    marg_ny = m["langd_ny"] - ts_ny
                    marg_k = m["langd_kalla"] - ts_k
                    m["talslut_ny"], m["talslut_kalla"] = round(ts_ny, 2), round(ts_k, 2)
            if marg_ny is None:
                fel.append(f"sista repliken slutar {sista:.2f}s in i en {m['langd_ny']:.2f}s film "
                           f"— rösten hinner inte tala klart")
            elif marg_ny < SLUTMARGINAL_S and marg_ny + 0.05 < marg_k:
                # avhugget = talet slutar närmare slutet än marginalen OCH tätare än källan
                fel.append(f"talet slutar {marg_ny:.2f}s före slutet, källan hade {marg_k:.2f}s "
                           f"— rösten hinner inte tala klart")
            else:
                noter.append(f"sista repliken ligger {m['langd_ny'] - sista:.2f}s från slutet enligt "
                             f"tidkoden (källans), men i ljudet slutar talet {marg_ny:.2f}s före slutet "
                             f"mot källans {marg_k:.2f}s — inte avhugget")
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
