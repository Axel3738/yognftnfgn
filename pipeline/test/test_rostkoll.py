#!/usr/bin/env python3
"""Tester för pipeline/rostkoll.py.

    python3 pipeline/test/test_rostkoll.py

Bygger medvetet trasiga videor ur en riktig annons och kontrollerar att
röstkollen fångar dem. En kontroll som aldrig blir röd är lika värdelös som
en som alltid är det — det första försöket 2026-09-08 dömde varenda video
som "avhuggen" eftersom musikbädden aldrig tystnar. Därför testas BÅDA
riktningarna: en frisk video ska bli grön, en trasig ska bli röd.
"""

import subprocess
import sys
import tempfile
from pathlib import Path

ROT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROT / "pipeline"))
import rostkoll  # noqa: E402

fel_total = 0


def pastar(villkor, text):
    global fel_total
    print(("  ✅ " if villkor else "  ❌ ") + text)
    if not villkor:
        fel_total += 1


def ffmpeg(*argv):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *argv], check=True)


def kap_mitt_i_ljud(fil):
    """Sekunden att kapa vid för att filen garanterat ska sluta MEDAN något låter.

    Letar upp det energistarkaste 50 ms-fönstret i sista tre sekunderna och lägger
    snittet 30 ms in i det. En kapning som råkar hamna i en paus hörs inte och ska
    inte flaggas — den duger därför inte som testfall."""
    import array
    r = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(fil), "-vn",
                        "-af", "highpass=f=300,lowpass=f=3400", "-ac", "1", "-ar", "16000",
                        "-f", "s16le", "-"], capture_output=True)
    a = array.array("h"); a.frombytes(r.stdout[: len(r.stdout) // 2 * 2])
    w = 800
    rms = [ (sum(x * x for x in a[i * w:(i + 1) * w]) / w) ** 0.5 for i in range(len(a) // w) ]
    fonster = rms[-60:-4]
    i = max(range(len(fonster)), key=lambda j: fonster[j])
    return (len(rms) - 60 + i) * 0.05 + 0.03


def hitta_kalla():
    """En riktig annons att utgå från. Hoppar över testet om ingen finns."""
    for m in [ROT / ".scratch/heimguard/se/video", ROT / "market-expansion"]:
        if m.exists():
            for f in sorted(m.rglob("*.mp4")):
                if f.stat().st_size > 200_000:
                    return f
    return None


def main():
    kalla = hitta_kalla()
    if not kalla:
        print("Ingen mp4 att testa mot — hoppar över (inte ett fel).")
        return 0
    print(f"Utgår från {kalla.name}\n")
    d = rostkoll.langd(kalla)

    with tempfile.TemporaryDirectory() as tmp:
        t = Path(tmp)

        print("frisk video (samma fil som källa) ska bli GRÖN:")
        fel, _, _ = rostkoll.kolla(kalla, kalla)
        pastar(not fel, f"inga fel{'' if not fel else ': ' + '; '.join(fel)}")

        print("\ntyst ljudspår ska bli RÖTT:")
        tyst = t / "tyst.mp4"
        ffmpeg("-i", str(kalla), "-af", "volume=0.0003", "-c:v", "copy", str(tyst))
        fel, _, _ = rostkoll.kolla(None, tyst)
        pastar(any("tyst" in f for f in fel), "tystnaden fångades")

        print("\n30 % längddrift ska bli RÖTT:")
        drift = t / "drift.mp4"
        ffmpeg("-i", str(kalla), "-filter:v", "setpts=1.3*PTS",
               "-filter:a", "atempo=0.77", str(drift))
        fel, _, _ = rostkoll.kolla(kalla, drift)
        pastar(any("drev" in f for f in fel), "längddriften fångades")

        # Tidkoden i den översatta SRT:en är KÄLLANS — HeyGen kräver det. Att sista
        # cue:n går till sista bildrutan säger därför ingenting om dubben, och får
        # aldrig ensamt fälla en film. (DryTrek FO_2_H1 och SP_6_H1 stod röda i tre
        # dygn på precis det, med ett slut som låg 13–49 dB under sin egen median.)
        srt = t / "sista-cue.srt"
        h, m, s = int(d // 3600), int(d % 3600 // 60), d % 60
        srt.write_text(f"1\n00:00:01,000 --> {h:02d}:{m:02d}:{s:06.3f}\nsista repliken\n"
                       .replace(f"{s:06.3f}", f"{s:06.3f}".replace(".", ",")), encoding="utf-8")

        print("\nsista cue:n till sista bildrutan, men ljudet tonar ut — ska bli GRÖNT:")
        fel, _, _ = rostkoll.kolla(None, kalla, srt)
        pastar(not fel, f"inte fälld på tidkoden{'' if not fel else ': ' + '; '.join(fel)}")

        print("\ndubb som kapats mitt i ett ljud ska bli RÖTT:")
        kapad = t / "kapad.mp4"
        # Kapa strax efter det energistarkaste fönstret i slutet, så filen garanterat
        # slutar medan något fortfarande låter. Det är vad ett avhugget slut ÄR.
        ffmpeg("-i", str(kalla), "-t", f"{kap_mitt_i_ljud(kalla):.2f}",
               "-c:v", "copy", "-c:a", "aac", str(kapad))
        fel, _, _ = rostkoll.kolla(kalla, kapad, srt)
        pastar(any("tala klart" in f for f in fel), "det avhuggna slutet fångades")

        # Källor som slutar i BIT-EXAKT tystnad (rms 0) gör differensen degenererad:
        # 20*log10(0/median) kläms till −180 dB och något ovanför är per definition
        # mer än 3 dB "högre än källan". IBC_PD_8_H2 2026-09-25 föll på just det —
        # 168,8 dB röd fast talet tog slut 0,11 s före sista bildrutan.
        tyst_slut = t / "tyst-slut.mp4"
        ffmpeg("-i", str(kalla), "-af", f"volume=enable='gte(t,{d - 0.3:.2f})':volume=0",
               "-c:v", "copy", str(tyst_slut))

        print("\nkälla med bit-exakt tyst svans + dubb som tonar ut — ska bli GRÖNT:")
        tonar_ut = t / "tonar-ut.mp4"
        ffmpeg("-i", str(kalla), "-af", f"volume=enable='gte(t,{d - 0.3:.2f})':volume=0.0001",
               "-c:v", "copy", str(tonar_ut))
        fel, _, matt = rostkoll.kolla(tyst_slut, tonar_ut, srt)
        pastar(not fel, f"inte fälld på källans nollor{'' if not fel else ': ' + '; '.join(fel)}")

        print("\nsamma källa, men dubben kapad mitt i ett ljud — ska ändå bli RÖTT:")
        fel, _, _ = rostkoll.kolla(tyst_slut, kapad, srt)
        pastar(any("tala klart" in f for f in fel), "det avhuggna slutet fångades ändå")

        print("\növersättning som tappat 90 % av talet ska bli RÖTT:")
        kort = t / "kort.srt"; lang = t / "lang.srt"
        kort.write_text("1\n00:00:01,000 --> 00:00:02,000\nkort\n", encoding="utf-8")
        lang.write_text("1\n00:00:01,000 --> 00:00:20,000\nlångt tal\n", encoding="utf-8")
        fel, _, _ = rostkoll.kolla(None, kalla, kort, lang)
        pastar(any("tappade" in f for f in fel), "det tappade talet fångades")

        print("\növerlappande repliker får inte dubbelräknas:")
        dubbel = t / "dubbel.srt"
        dubbel.write_text("1\n00:00:01,000 --> 00:00:05,000\na\n\n"
                          "2\n00:00:02,000 --> 00:00:04,000\nb\n", encoding="utf-8")
        talsek, _ = rostkoll.srt_tider(dubbel)
        pastar(abs(talsek - 4.0) < 0.01, f"4,0 s tal (fick {talsek:.2f} s)")

    print(f"\n{'ALLA TESTER GRÖNA' if not fel_total else str(fel_total) + ' TEST FALLERADE'}")
    return 1 if fel_total else 0


if __name__ == "__main__":
    sys.exit(main())
