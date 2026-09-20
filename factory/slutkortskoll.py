#!/usr/bin/env python3
"""slutkortskoll.py — hittar slutkortet i en färdig mp4, utan att gissa.

    python3 factory/slutkortskoll.py <video.mp4> [<video2.mp4> …] [--json]

Varför den finns
----------------
Nio av Bäverbutikens 24 svenska taköverdrags-videor slutar med ett slutkort på
exakt 3,0 sekunder — åtta med butikens logga och svenska flagga, en med en
"carashell.se"-badge. Åtta av dem ligger live i Norge med loggan kvar. Luckan:
`tools/ops-spegla.mjs` → `brandtraff()` läser bara COPY och BRIEFTEXT och har
ingen bildrutekontroll alls, så loggan i bildrutorna gick rakt igenom.
Mätningen "3,0 sekunder i nio av nio fall" gjordes av en människa som tittade.
Den här filen mäter i stället, så nästa marknad (Danmark) kan fråga koden.

⚠️ Den svarar på EN fråga: *finns det ett slutkort och från vilken sekund?*
Den läser ingen text och vet inget om varumärken — OCR:en är `factory/brand-text.py`,
och domen om butikens namn i en annons är `factory/brandord.mjs`. Slutkortskollen
säger var man ska titta.

⚠️ DEN HÄR FILEN ÄR INTE SPÄRREN. Spärren före uppladdning är
`factory/bildbrand.mjs` — den importeras som `granskaOmVideo` av
`tools/ops-spegla.mjs` och `tools/ops-leveranskon.mjs`, läser OCR ur kortet och
dömer ren / slutkort-utan-brand / slutkort-med-brand. Den här filen är
MÄTVERKTYGET en människa kör för hand (steg 2 i
`factory/output/carashell/PROMPT-DK-ANNONSER.md`): den mäter var kortet BÖRJAR,
vilket bildbrand inte gör — bildbrand antar 3,0 s bakifrån.
Bygg aldrig in den här filen som en grind bredvid bildbrand: två grindar på
samma fråga börjar förr eller senare svara olika.
Jämförda 2026-09-20 på repots alla 98 mp4:or: noll oenigheter om *om* det finns
ett kort (bildbrand 97 ren + 1 slutkort, den här 94 NEJ + 3 OSÄKER + 1 JA — och
det är samma fil). Om kortets START skiljer de sig med flit: på
CaraShellRoof_DK_CO_101_H1 mäter den här filen 22,71 s, bildbrand antar 22,91 s.

Metoden
-------
1. Längd och upplösning läses ur `ffmpeg -i` (stderr).
   ⚠️ Avsiktligt INTE `ffprobe -select_streams v:0 …`: /usr/local/bin/ffprobe är i
   den här miljön en python-shim som kastar `ValueError: not enough values to
   unpack` på flaggan, eller svarar med fel fält. ffmpeg självt fungerar, så
   allt som mäts här går genom ffmpeg. Bygg aldrig in `-select_streams`.
2. Svansen (default de sista 8 sekunderna) dras som råa RGB-frames i låg
   upplösning, 5 frames/s, i ETT ffmpeg-anrop. Inga filer skrivs.
3. HUVUDSIGNALEN är rörelse: medelvärdet av den absoluta skillnaden mellan två
   intilliggande frames, 0–1. Ett slutkort är ett stillbildslager ovanpå videon
   → rörelsen faller till komprimeringsbruset. Levande film som står nästan
   stilla gör det inte.
4. SEKUNDÄRSIGNALEN är ytan: hur stor andel av bildrutan som ligger nära sin egen
   medianfärg ("platt"), plus ljusheten. Originalkortet är vitt, Bäverbutikens
   svart — därför får ljusheten ALDRIG avgöra ensam, den skiljer bara korttyp.
   Plattheten fäller bara avgörandet när rörelsen är gränsfall.
5. Domen heter JA, NEJ eller OSÄKER. OSÄKER när signalerna säger olika saker —
   aldrig ja eller nej på en gissning.

Alla mätvärden följer med i svaret (antal frames, trösklar, rörelse per frame i
slutet) så en människa kan se att domen har fel.

Tidsupplösningen är en frame, alltså ±0,2 s vid 5 fps. `--fps 10` halverar den
och kostar dubbelt så mycket tid. `--svans 12` tittar längre bak.

Mätt 2026-09-20 på 98 mp4:or i repot: 1 JA (CaraShellRoof_DK_CO_101_H1, kortet
börjar 22,71 s — kontrollbilden vid 22,70 visar kortet, alltså rätt inom en
frame), 3 OSÄKER (frysta slutbilder), 94 NEJ, noll falska JA.

Kostar 0 kr: lokal ffmpeg, ingen modell, inget nät, inget annonskonto.
"""

import json
import os
import re
import subprocess
import sys

# --- trösklar -------------------------------------------------------------
# Avlästa 2026-09-20 på 98 riktiga mp4:or i repot (Bäverbutikens källvideor,
# de norska batcherna, fabrikens utdata). Rörelse i svansen:
#   slutkort (CaraShellRoof_DK_CO_101_H1, PNG-lager över sista 3,2 s): 0,00000–0,00001
#   övergången IN i kortet (en enda frame):                            0,156 och 0,360
#   levande film som står nästan stilla (Frontrutetrekk_NO_G_1):       0,0266–0,0351
#   levande film, normal (Termoskydd_PD_2):                            0,0217–0,0510
#   fryst sista bildruta (NO_ibc_SP_1_H1, hand lämnar bilden):         < 0,006 i 0,8 s
# Gapet mellan stillbildslager och stillastående film är alltså ~1000×, men den
# frysta slutbilden ligger mitt i kortets zon — därför två trösklar, en OSÄKER-zon
# och platthet som andrasignal.
#
# ⚠️ MIN_LANGD_S finns av ett konkret skäl: ffmpegs fps-filter DUBBLERAR ofta sista
# framen när strömmen tar slut mellan två uttag. Räknat 2026-09-20 på de 94 videor
# som fick NEJ: 17 av dem har ett rörelsevärde under RORELSE_JA i sin ALLRA SISTA
# frame utan att ha något slutkort (Frontrutetrekk_NO_*, NO_stickers_* m.fl.).
# En enda lugn frame får aldrig bli en dom. Sänk inte MIN_LANGD_S under 0,8 s.
# Mätt samma dag genom att köra om domslut() på samma mätdata med olika värden:
#   0,8 → 1 JA / 3 OSÄKER / 94 NEJ      0,2 → 1 JA / 11 OSÄKER / 86 NEJ
#   0,4 → 1 JA / 6 OSÄKER / 91 NEJ      0,0 → 1 JA / 23 OSÄKER / 74 NEJ
# På det här korpuset blir de extra fallen OSÄKER, inte JA — plattheten räddar
# dem, för en fryst filmruta är ett foto. Men en film som slutar PLATT (uttoning
# mot svart, en ljus produktbild) har inget sådant skydd: med MIN_LANGD_S = 0 ger
# en enda dubblerad slutframe då ett falskt JA. Det fallet är testat i
# `factory/test/slutkortskoll.test.mjs` ("en dubblerad slutframe är inget kort").
#
# Utfallet med värdena nedan: 1 JA (rätt), 3 OSÄKER (alla verkligt tveksamma
# frysta slutbilder), 94 NEJ, noll falska JA.
RORELSE_JA = 0.006      # under detta: bildrutan rör sig inte, det är ett lager
RORELSE_KANSKE = 0.011  # mellan trösklarna: kandidat, men domen blir OSÄKER
PLATT_MIN = 0.35        # andel pixlar nära medianfärgen — ett kort har stora enfärgade ytor
MIN_LANGD_S = 0.8       # kortare svans än så är en frys i klippet, inte ett slutkort
SVANS_S = 8.0           # hur långt bak vi tittar
FPS = 5.0               # frames per sekund ur svansen
BREDD_PX = 64           # frames skalas till denna bredd (höjden följer bildförhållandet)
PLATT_TOLERANS = 14     # ± per kanal för att en pixel ska räknas som "nära medianen"


def _kor(argv):
    """Kör ett kommando och returnera (returkod, stdout-bytes, stderr-text)."""
    p = subprocess.run(argv, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return p.returncode, p.stdout, p.stderr.decode("utf-8", "replace")


def videofakta(sokvag):
    """Längd (s), bredd och höjd ur `ffmpeg -i`. Se metodnot 1 om varför inte ffprobe.

    ffmpeg utan utfil avslutar med "At least one output file must be specified"
    och returkod != 0 — det är normalt, det är stderr vi är ute efter."""
    _, _, err = _kor(["ffmpeg", "-hide_banner", "-i", sokvag])
    m = re.search(r"Duration:\s*(\d+):(\d\d):(\d\d(?:\.\d+)?)", err)
    if not m:
        raise RuntimeError(f"ffmpeg gav ingen Duration för {sokvag} — är det en video?")
    langd = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    # Första videoströmmens upplösning. "720x1280 [SAR 1:1 DAR 9:16]" eller "720x1280,"
    b = h = None
    for rad in err.splitlines():
        if "Video:" in rad:
            mm = re.search(r"(?<![\d])(\d{2,5})x(\d{2,5})(?![\d])", rad)
            if mm:
                b, h = int(mm.group(1)), int(mm.group(2))
                break
    if not b:
        raise RuntimeError(f"ffmpeg hittade ingen videoström i {sokvag}")
    return {"langd_s": round(langd, 3), "bredd": b, "hojd": h}


def dra_svans(sokvag, fakta, svans_s=SVANS_S, fps=FPS, bredd=BREDD_PX):
    """Dra svansens frames som råa RGB-bytes. Returnerar (frames, w, h, start_s).

    Ett ffmpeg-anrop, rawvideo på stdout — inga temporärfiler, inget som kan bli
    kvar i containern."""
    start = max(0.0, fakta["langd_s"] - svans_s)
    h = max(2, int(round(fakta["hojd"] * bredd / fakta["bredd"])) // 2 * 2)
    kod, ut, err = _kor([
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-ss", f"{start:.3f}", "-i", sokvag, "-an",
        "-vf", f"fps={fps},scale={bredd}:{h}",
        "-pix_fmt", "rgb24", "-f", "rawvideo", "-",
    ])
    rutstorlek = bredd * h * 3
    if not ut or len(ut) < rutstorlek:
        raise RuntimeError(f"ffmpeg gav {len(ut)} byte frames för {sokvag}: {err.strip()[:200]}")
    antal = len(ut) // rutstorlek
    frames = [ut[i * rutstorlek:(i + 1) * rutstorlek] for i in range(antal)]
    return frames, bredd, h, start


def rorelse(a, b):
    """Medelvärdet av |a-b| över alla kanaler, 0–1. Ren funktion på två frames."""
    if len(a) != len(b) or not a:
        return 1.0
    summa = 0
    for x, y in zip(a, b):
        summa += x - y if x > y else y - x
    return summa / (len(a) * 255.0)


def ytmatt(frame):
    """(platta, ljushet) för en frame. Ren funktion.

    platta  = andel pixlar vars alla tre kanaler ligger inom ±PLATT_TOLERANS från
              bildrutans egen mediankanalfärg. Ett slutkort har stora enfärgade
              fält; en fotograferad scen har det nästan aldrig.
    ljushet = medelluminans 0–1. Skiljer vitt kort (original) från svart
              (Bäverbutikens) — informativt, aldrig avgörande."""
    n = len(frame) // 3
    if n == 0:
        return 0.0, 0.0
    r = sorted(frame[0::3])
    g = sorted(frame[1::3])
    b = sorted(frame[2::3])
    mr, mg, mb = r[n // 2], g[n // 2], b[n // 2]
    tr = PLATT_TOLERANS
    nara = 0
    summa = 0
    for i in range(n):
        pr, pg, pb = frame[3 * i], frame[3 * i + 1], frame[3 * i + 2]
        if abs(pr - mr) <= tr and abs(pg - mg) <= tr and abs(pb - mb) <= tr:
            nara += 1
        summa += pr * 299 + pg * 587 + pb * 114
    return nara / n, summa / (n * 1000 * 255.0)


def tyngdpunkt(frame, bredd, hojd):
    """Bonus: ligger detaljen (text/logga) i övre eller nedre halvan?

    Mäter vågrät kantenergi per halva — text ger många kanter. Rapporteras som
    'ovre' (logga högt upp), 'undre' (produkt/pris nederst) eller 'jamn'.
    Informativt. Påverkar aldrig domen."""
    halva = hojd // 2
    energi = [0, 0]
    rader = [0, 0]
    for y in range(hojd):
        del_ = 0 if y < halva else 1
        rad = y * bredd * 3
        for x in range(bredd - 1):
            i = rad + x * 3
            energi[del_] += abs(frame[i] - frame[i + 3])
        rader[del_] += 1
    if not rader[0] or not rader[1]:
        return "jamn", [0.0, 0.0]
    o = energi[0] / (rader[0] * (bredd - 1) * 255.0)
    u = energi[1] / (rader[1] * (bredd - 1) * 255.0)
    if o > u * 1.4:
        namn = "ovre"
    elif u > o * 1.4:
        namn = "undre"
    else:
        namn = "jamn"
    return namn, [round(o, 4), round(u, 4)]


def domslut(tider, rorelser, plattor, min_langd_s=MIN_LANGD_S):
    """Ren funktion: mätvärden in, dom ut. Testbar utan ffmpeg.

    tider[i]    = tidpunkt för frame i
    rorelser[i] = rörelse mellan frame i-1 och i (rorelser[0] är None)
    plattor[i]  = platthet för frame i

    Letar den LÄNGSTA SVANSEN av frames där rörelsen ligger under tröskeln, dvs
    bakifrån tills en frame rör sig för mycket. Att kräva svansen (och inte vilken
    lugn ö som helst mitt i videon) är hela poängen: ett slutkort sitter sist."""
    n = len(tider)
    if n < 3:
        return {"dom": "OSAKER", "skal": "för få frames för att mäta rörelse", "fran_s": None}

    def svans(grans):
        """Index för FÖRSTA framen i den lugna svansen.

        rorelser[i] är skillnaden mellan frame i-1 och frame i. Vi går bakifrån
        så länge stegen är små. När steget in till frame i är STORT slutar vi —
        men frame i hör ändå till gruppen: det stora steget ÄR övergången in i
        kortet. (Mätt på CaraShellRoof_DK_CO_101_H1: 22,51→22,71 ger 0,36 och
        22,71→22,91 ger 0,00001; kontrollbilden vid 22,70 visar kortet. Returnerar
        vi i+1 missar vi kortets första frame och svarar en frame för sent.)"""
        i = n - 1
        while i >= 1 and rorelser[i] is not None and rorelser[i] < grans:
            i -= 1
        return i

    i_ja = svans(RORELSE_JA)
    i_kanske = svans(RORELSE_KANSKE)

    def langd(i):
        return tider[-1] - tider[i] if i < n else 0.0

    # Ingen lugn svans alls ens med den tillåtande tröskeln → inget slutkort.
    if i_kanske >= n - 1 or langd(i_kanske) < min_langd_s:
        return {
            "dom": "NEJ",
            "skal": (f"den lugna svansen är bara {langd(i_kanske):.1f} s (kräver {min_langd_s} s) — "
                     f"bildrutorna rör sig ända till slutet, tröskel {RORELSE_KANSKE}"),
            "fran_s": None,
        }

    platt_ja = sum(plattor[i_ja:]) / max(1, n - i_ja)
    platt_kanske = sum(plattor[i_kanske:]) / max(1, n - i_kanske)

    # Fall 1: tydlig stillbild, tillräckligt lång, tillräckligt platt.
    if langd(i_ja) >= min_langd_s and platt_ja >= PLATT_MIN:
        return {
            "dom": "JA",
            # ⚠️ langd() mäter mellan FÖRSTA och SISTA UTTAGNA bildrutan, inte till
            # filmens slut — sista uttaget ligger upp till 1/fps före slutet. Den
            # siffran är därför alltid något mindre än `slutkort_langd_s` i svaret
            # (POC:en: 2,8 s här, 3,20 s dit). Säg vilket som är vilket, annars
            # läser en människa det som att verktyget säger emot sig självt.
            "skal": (f"{n - i_ja} frames rör sig inte (< {RORELSE_JA}) över {langd(i_ja):.1f} s uttagna "
                     f"bildrutor (kortets fulla längd står i slutkort_langd_s), "
                     f"platthet {platt_ja:.2f} ≥ {PLATT_MIN}"),
            "fran_s": round(tider[i_ja], 2),
        }
    # Fall 2: stillbild men ytan ser ut som ett foto → frusen sista bildruta?
    if langd(i_ja) >= min_langd_s:
        extra = " (hela det analyserade fönstret står still — stillbild, inte annons?)" if i_ja == 0 else ""
        return {
            "dom": "OSAKER",
            "skal": (f"bildrutan står still i {langd(i_ja):.1f} s men ytan är inte platt "
                     f"(platthet {platt_ja:.2f} < {PLATT_MIN}) — fryst slutbild snarare än ett kort?{extra}"),
            "fran_s": round(tider[i_ja], 2),
        }
    # Fall 3: bara den tillåtande tröskeln träffar.
    return {
        "dom": "OSAKER",
        "skal": f"svag rörelse ({RORELSE_JA} ≤ värdena < {RORELSE_KANSKE}) i {langd(i_kanske):.1f} s, platthet {platt_kanske:.2f} — nära stillastående film eller ett kort med rörlig bakgrund",
        "fran_s": round(tider[i_kanske], 2),
    }


def kolla(sokvag, svans_s=SVANS_S, fps=FPS):
    """Hela kedjan för en fil. Returnerar en dict som både CLI och --json använder."""
    fakta = videofakta(sokvag)
    frames, w, h, start = dra_svans(sokvag, fakta, svans_s=svans_s, fps=fps)
    tider = [round(start + i / fps, 3) for i in range(len(frames))]
    rorelser = [None] + [rorelse(frames[i - 1], frames[i]) for i in range(1, len(frames))]
    ytor = [ytmatt(f) for f in frames]
    plattor = [p for p, _ in ytor]
    ljus = [l for _, l in ytor]

    dom = domslut(tider, rorelser, plattor)
    svar = {
        "fil": os.path.basename(sokvag),
        "sokvag": sokvag,
        "langd_s": fakta["langd_s"],
        "upplosning": f'{fakta["bredd"]}x{fakta["hojd"]}',
        "dom": dom["dom"],
        "skal": dom["skal"],
        "slutkort_fran_s": dom["fran_s"],
        "slutkort_langd_s": round(fakta["langd_s"] - dom["fran_s"], 2) if dom["fran_s"] is not None else None,
        "matt": {
            "frames": len(frames),
            "fps": fps,
            "svans_s": svans_s,
            "analysstorlek": f"{w}x{h}",
            "trosklar": {
                "rorelse_ja": RORELSE_JA,
                "rorelse_kanske": RORELSE_KANSKE,
                "platt_min": PLATT_MIN,
                "min_langd_s": MIN_LANGD_S,
            },
            "per_frame": [
                {
                    "t": tider[i],
                    "rorelse": None if rorelser[i] is None else round(rorelser[i], 5),
                    "platt": round(plattor[i], 3),
                    "ljus": round(ljus[i], 3),
                }
                for i in range(len(frames))
            ],
        },
    }
    if dom["fran_s"] is not None:
        sista = frames[-1]
        namn, varden = tyngdpunkt(sista, w, h)
        svar["kortyta"] = {
            "ljushet": round(ljus[-1], 3),
            "kortton": "ljust" if ljus[-1] >= 0.6 else ("morkt" if ljus[-1] <= 0.35 else "mellan"),
            "tyngdpunkt": namn,
            "kantenergi_ovre_undre": varden,
        }
    return svar


def _skriv_text(s):
    ikon = {"JA": "✅", "NEJ": "—", "OSAKER": "⚠️"}[s["dom"]]
    print(f'{ikon} {s["fil"]}  ({s["langd_s"]:.2f} s, {s["upplosning"]})')
    if s["slutkort_fran_s"] is not None:
        print(f'   slutkort: {s["dom"]}, från {s["slutkort_fran_s"]:.2f} s ({s["slutkort_langd_s"]:.2f} s långt)')
    else:
        print(f'   slutkort: {s["dom"]}')
    print(f'   skäl: {s["skal"]}')
    if "kortyta" in s:
        k = s["kortyta"]
        print(f'   yta: {k["kortton"]} (ljushet {k["ljushet"]}), detaljen ligger {k["tyngdpunkt"]}')
    m = s["matt"]
    svansvarden = [f'{p["t"]:.1f}s:{p["rorelse"]:.4f}' for p in m["per_frame"][-6:] if p["rorelse"] is not None]
    print(f'   mätt: {m["frames"]} frames @ {m["fps"]}/s i {m["analysstorlek"]}, tröskel {m["trosklar"]["rorelse_ja"]}')
    print(f'   rörelse sist: {" ".join(svansvarden)}')


def _flagga(argv, namn, standard):
    """--namn <tal> eller --namn=<tal>. Returnerar (värde, kvarvarande argv)."""
    def tal(rå):
        # Ett skrivfel i en flagga ska ge en mening, inte en pythonstacktrace —
        # och 0 eller negativt ger division med noll längre ner (tider = i/fps).
        try:
            v = float(rå)
        except ValueError:
            raise SystemExit(f"--{namn} vill ha ett tal, fick {rå!r}")
        if v <= 0:
            raise SystemExit(f"--{namn} måste vara större än 0, fick {v}")
        return v

    kvar, varde, i = [], standard, 0
    while i < len(argv):
        a = argv[i]
        if a == f"--{namn}" and i + 1 < len(argv):
            varde = tal(argv[i + 1]); i += 2; continue
        if a == f"--{namn}":
            raise SystemExit(f"--{namn} saknar värde")
        if a.startswith(f"--{namn}="):
            varde = tal(a.split("=", 1)[1]); i += 1; continue
        kvar.append(a); i += 1
    return varde, kvar


def main(argv):
    fps, argv = _flagga(argv, "fps", FPS)
    svans_s, argv = _flagga(argv, "svans", SVANS_S)
    filer = [a for a in argv if not a.startswith("--")]
    som_json = "--json" in argv
    if not filer:
        print("Hittar slutkortet i en färdig mp4 — mäter, gissar inte.", file=sys.stderr)
        print("Användning: python3 factory/slutkortskoll.py <video.mp4> [...] "
              "[--json] [--fps 5] [--svans 8]", file=sys.stderr)
        print(f"Tidsupplösningen är en frame, alltså ±{1 / FPS:.2f} s vid {FPS} fps.", file=sys.stderr)
        return 2

    svar = []
    fel = 0
    for f in filer:
        try:
            svar.append(kolla(f, svans_s=svans_s, fps=fps))
        except Exception as e:  # en trasig fil får inte stoppa resten
            fel += 1
            svar.append({"fil": os.path.basename(f), "sokvag": f, "dom": "FEL", "skal": str(e),
                         "slutkort_fran_s": None})
    if som_json:
        print(json.dumps(svar, ensure_ascii=False, indent=2))
    else:
        for s in svar:
            if s["dom"] == "FEL":
                print(f'❌ {s["fil"]}: {s["skal"]}')
            else:
                _skriv_text(s)
            print()
        ja = sum(1 for s in svar if s["dom"] == "JA")
        osaker = sum(1 for s in svar if s["dom"] == "OSAKER")
        print(f'{len(svar)} filer: {ja} med slutkort, {osaker} osäkra, {fel} fel')
    return 1 if fel else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
