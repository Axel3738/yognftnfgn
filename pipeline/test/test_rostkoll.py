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

        print("\nsista repliken som går till sista bildrutan ska bli RÖTT:")
        srt = t / "avhuggen.srt"
        h, m, s = int(d // 3600), int(d % 3600 // 60), d % 60
        srt.write_text(f"1\n00:00:01,000 --> {h:02d}:{m:02d}:{s:06.3f}\nsista repliken\n"
                       .replace(f"{s:06.3f}", f"{s:06.3f}".replace(".", ",")), encoding="utf-8")
        fel, _, _ = rostkoll.kolla(None, kalla, srt)
        pastar(any("tala klart" in f for f in fel), "det avhuggna slutet fångades")

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
