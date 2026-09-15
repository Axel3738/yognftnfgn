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
  3. AVHUGGET SLUT — sista repliken hinner inte ta slut.   (SRT + ljud)
  4. TAPPAT TAL — meningar har fallit bort i översättningen.      (SRT)

⚠️ Punkt 3 mäter SLUTENERGIN, inte var talet slutar (omskrivet 2026-09-15).
Det gamla måttet letade upp var talbandets energi sist passerade 15 % av
filens topp och jämförde marginalen med källans. Det straffade raka motsatsen
till felet det skulle fånga: en dubb som säger sista ordet tydligt och sedan
tystnar får en KORT marginal, medan en källa som tonar ut gradvis får en lång.
DryTreks FO_2_H1 och SP_6_H1 stod röda i tre dygn på exakt det — SP_6:s dubb
slutar 49 dB under sin egen median, alltså i ren tystnad. Mätt på 14 dubbar
plus 14 kapade kopior av dem: hela dubbar ligger på −141…0,0 dB, kapade på
+0,8…+55 dB. Tröskeln 3 dB ger noll falsklarm på de 14 och fångar 8 av de 14
kapningarna — resten kapades i en naturlig paus och låter inte avhuggna.

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
SLUTMARGINAL_S = 0.15        # sista repliken närmare slutet än så = värd att mäta i ljudet
MAX_SLUTENERGI_DIFF_DB = 3.0 # dubben får låta 3 dB högre än källan i sista 100 ms
KALLA_SLUTAR_HOGT_DB = 5.0   # över detta slutar källan själv på full volym → omätbart
SLUT_TYST_DB = -6.0          # under detta har ljudet tonat ut → kan inte vara avhugget


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


def slutenergi(fil):
    """Hur högljutt filen fortfarande låter i sina sista 100 ms, i dB mot sin egen median.

    Talbandet 300–3400 Hz, 50 ms-fönster. None om ljudet inte gick att läsa.

    ETT AVHUGGET SLUT ÄR ETT LJUD SOM INTE HINNER TONA UT. En film som talat
    färdigt slutar i tystnad och landar djupt under sin median; en som kapats
    mitt i ett ord slutar på full volym. Måttet frågar alltså rakt av "låter
    det fortfarande när filen tar slut?" i stället för att leta efter var
    energin sist passerade en tröskel.

    ⚠️ Talar INTE om musik och röst isär — det går inte ur ljudet, och varje
    försök har gett en kontroll som alltid är röd. Musikbädden är densamma i
    källa och dubb, så siffran är meningsfull först som SKILLNAD mot källans
    (`kolla()` nedan). En film som slutar med musiken på (SP_7_H1, +6,2 dB)
    ser annars likadan ut som en kapad."""
    r = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(fil), "-vn",
                        "-af", "highpass=f=300,lowpass=f=3400", "-ac", "1", "-ar", "16000",
                        "-f", "s16le", "-"], capture_output=True)
    if not r.stdout:
        return None
    import array
    import math
    import statistics
    a = array.array("h"); a.frombytes(r.stdout[: len(r.stdout) // 2 * 2])
    w = 800
    n = len(a) // w
    if n == 0:
        return None
    rms = [ (sum(x * x for x in a[i * w:(i + 1) * w]) / w) ** 0.5 for i in range(n) ]
    horbara = [v for v in rms if v > 0]
    if not horbara:
        return None
    median = statistics.median(horbara) or 1.0
    svans = rms[-2:] or rms[-1:]
    return 20 * math.log10((max(svans) or 1e-6) / median)


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
            # Tidkoden är KÄLLANS (HeyGen kräver samma tidkoder i den översatta SRT:en),
            # så den säger ingenting om dubben. Har vi källan: mät i LJUDET hur högljutt
            # var film fortfarande låter när den tar slut, och jämför. Musikbädden är
            # gemensam, så skillnaden är rösten.
            slut_ny = slut_k = None
            if kalla and m.get("langd_kalla"):
                s_ny, s_k = slutenergi(ny), slutenergi(kalla)
                if s_ny is not None and s_k is not None:
                    slut_ny, slut_k = s_ny, s_k
                    m["slutenergi_ny"] = round(s_ny, 1)
                    m["slutenergi_kalla"] = round(s_k, 1)
                    m["slutenergi_diff"] = round(s_ny - s_k, 1)
            if slut_ny is None:
                # Ingen källa att jämföra mot. Absolut mätning räcker ändå åt ena hållet:
                # en film som slutar i tystnad kan inte vara avhuggen.
                s_ensam = slutenergi(ny)
                if s_ensam is not None:
                    m["slutenergi_ny"] = round(s_ensam, 1)
                if s_ensam is not None and s_ensam < SLUT_TYST_DB:
                    noter.append(f"sista repliken går till sista bildrutan enligt tidkoden, men "
                                 f"ljudet tonar ut i tystnad ({s_ensam:.1f} dB mot egen median) "
                                 f"— inte avhugget")
                else:
                    noter.append(f"sista repliken slutar {sista:.2f}s in i en {m['langd_ny']:.2f}s "
                                 f"film och ljudet låter fortfarande vid slutet — utan källvideo "
                                 f"går det INTE att avgöra om det är musiken eller en avhuggen "
                                 f"replik. Kör om med --kalla, eller lyssna på slutet")
            elif slut_k > KALLA_SLUTAR_HOGT_DB:
                # Källan slutar själv på full volym (musiken spelar filmen ut). Då ser en
                # kapad dubb likadan ut som en hel — differensen har inget att mäta mot.
                # HOPPAD med orsak, aldrig grön: PD_13_H1 och SP_7_H1 är just de här.
                noter.append(f"källan slutar själv på full volym ({slut_k:.1f} dB mot egen median) "
                             f"— avhugget slut går INTE att mäta på den här filmen. Lyssna på "
                             f"slutet innan den laddas upp")
            elif slut_ny - slut_k > MAX_SLUTENERGI_DIFF_DB:
                fel.append(f"dubben låter {slut_ny - slut_k:.1f} dB högre än källan i sina sista "
                           f"100 ms ({slut_ny:.1f} mot {slut_k:.1f} dB mot egen median) — "
                           f"rösten hinner inte tala klart")
            else:
                noter.append(f"sista repliken ligger {m['langd_ny'] - sista:.2f}s från slutet enligt "
                             f"tidkoden (källans), men dubben tonar ut som källan "
                             f"({slut_ny:.1f} mot {slut_k:.1f} dB) — inte avhugget")
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
