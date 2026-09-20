#!/usr/bin/env python3
"""bygg-cap.py — bygger lagren och konfigen för de amerikanska videorna (US-runda 2026-09-20).

Källorna (Bäverbutikens speglade videor, Carl Vicentes mall) bär tre sorters inbränd text:
  1. ordcaptions i vitt piller nederst      → no-precis.py suddar pillret och lägger den engelska cuen
  2. stora röda pop-texter (1129 KR / 1 469 KR överstruket / FRI FRAKT / 30 DAGARS ÖPPET KÖP /
     210D-VÄV) mitt i bild, mätta med rodtext.py → förbehandling: kraftig blur + mörk platta i
     samma ruta, och en PNG med den amerikanska texten i samma stil (vit, röd kant)
  3. Bäverbutikens slutkort (logga + produktbild + svensk titel + kr-pris) i sex av åtta,
     CaraShells .se-slutkort i PD_5_H1                    → helt nytt US-slutkort som PNG-lager

    python3 bygg-cap.py            # skriver cap/<n>.json, lager/*.png, forbehandla.json
Mått ur rodtext.py + piller.py 2026-09-20 (se batch-log). Inget är gissat.
De fyra källorna bär ALLA Bäverbutikens slutkort (identisk crop, mätt: produktbilden
y 467–807, x 61–659 i alla fyra) och svenska ordcaptions i piller y 916–977.
⚠️ RI_103_H1 har ett RÖTT FÖNSTER 0,4–1,6 s som inte är text utan en röd PIL som
pekar på taket — den rörs inte, varken av förbehandlingen eller av ett lager.
"""
import json, os
from PIL import Image, ImageDraw, ImageFont

HÄR = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
STJARNA = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
os.makedirs(os.path.join(HÄR, "lager"), exist_ok=True)
os.makedirs(os.path.join(HÄR, "cap"), exist_ok=True)

RÖD = (214, 30, 30, 255)


def passa(text, font_path, storlek, maxbredd):
    f = ImageFont.truetype(font_path, storlek)
    while f.getlength(text) > maxbredd and storlek > 20:
        storlek -= 4; f = ImageFont.truetype(font_path, storlek)
    return f


def rodtext(W, H, rader, panel):
    """rader: [(text, storlek, box[x0,y0,x1,y1], stryk)] — vit fet versal text med röd kant,
    centrerad i sin ruta. panel: [x0,y0,x1,y1] mörk halvgenomskinlig platta bakom."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = panel
    d.rounded_rectangle([x0, y0, x1, y1], radius=28, fill=(10, 12, 16, 215))
    for text, storlek, box, stryk in rader:
        bx0, by0, bx1, by1 = box
        f = passa(text, FET, storlek, bx1 - bx0 - 20)
        w = f.getlength(text); asc, desc = f.getmetrics()
        x = (bx0 + bx1) / 2 - w / 2; y = (by0 + by1) / 2 - asc * 0.72 / 2 - (asc - asc * 0.72) * 0.15
        kant = max(4, storlek // 14)
        d.text((x, y), text, font=f, fill=(255, 255, 255, 255), stroke_width=kant, stroke_fill=RÖD)
        if stryk:
            ym = y + asc * 0.72 / 2
            d.line([(x - 10, ym), (x + w + 10, ym)], fill=RÖD, width=max(6, storlek // 9))
    return im


def slutkort(W, H, produktbild, ut):
    """US-slutkort: vit bakgrund, blå badge, produktbilden ur källans slutkort,
    titel, stjärnor + 16 reviews, $249 överstruket + $199 + Sale, fotrad.
    ⚠️ Badgen sa "carashell.com" när de åtta videorna renderades 2026-09-18. Samma dag
    beslutade Axel att butikens namn och domän aldrig står i en annons
    (`docs/copy-regler.md`, processregel 1) — bygget hann före regeln. De åtta ligger
    kvar live (live-annonser stängs aldrig av i efterhand, Axels beslut 2026-09-15);
    texten är bytt HÄR så nästa runda som kopierar filen börjar rätt. Ändringen rör
    ingen befintlig annons."""
    sk = W / 720
    im = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    d = ImageDraw.Draw(im)
    # badge — produkten, priset och länken pekar ut butiken; namnet tillför inget
    f = ImageFont.truetype(NORMAL, int(40 * sk)); t = "90-DAY GUARANTEE"; w = f.getlength(t)
    bw, bh = w + 60 * sk, 72 * sk; bx = (W - bw) / 2; by = 250 * sk
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=int(10 * sk), fill=(44, 95, 138, 255))
    d.text((W / 2 - w / 2, by + bh / 2 - f.getmetrics()[0] * 0.72 / 2 - 4 * sk), t, font=f, fill=(255, 255, 255, 255))
    # produktbild
    p = Image.open(produktbild).convert("RGBA")
    mål_b = int(600 * sk); p = p.resize((mål_b, int(p.height * mål_b / p.width)))
    im.alpha_composite(p, (int((W - p.width) / 2), int(400 * sk)))
    y = int(400 * sk) + p.height + int(50 * sk)
    # titel
    f = ImageFont.truetype(FET, int(34 * sk))
    for rad in ["Roof Cover for Travel Trailers", "& Motorhomes · 21 × 10 ft (6.5 × 3 m)"]:
        d.text((int(60 * sk), y), rad, font=f, fill=(20, 22, 26, 255)); y += int(44 * sk)
    y += int(14 * sk)
    # stjärnor + reviews
    fs = ImageFont.truetype(STJARNA, int(24 * sk)); d.text((int(60 * sk), y), "★★★★★", font=fs, fill=(33, 150, 83, 255))
    fr = ImageFont.truetype(NORMAL, int(22 * sk)); d.text((int(60 * sk) + fs.getlength("★★★★★") + 12 * sk, y + 2 * sk), "16 reviews · 5.0 average", font=fr, fill=(70, 74, 80, 255))
    y += int(48 * sk)
    # pris
    fj = ImageFont.truetype(NORMAL, int(26 * sk)); t = "$249"; d.text((int(60 * sk), y + 8 * sk), t, font=fj, fill=(130, 134, 140, 255))
    wj = fj.getlength(t); ym = y + 8 * sk + fj.getmetrics()[0] * 0.5
    d.line([(int(60 * sk), ym), (int(60 * sk) + wj, ym)], fill=(130, 134, 140, 255), width=max(2, int(2 * sk)))
    fp = ImageFont.truetype(FET, int(38 * sk)); d.text((int(60 * sk) + wj + 18 * sk, y), "$199", font=fp, fill=(20, 22, 26, 255))
    xs = int(60 * sk) + wj + 18 * sk + fp.getlength("$199") + 18 * sk
    fb = ImageFont.truetype(FET, int(18 * sk)); d.rounded_rectangle([xs, y + 8 * sk, xs + fb.getlength("Sale") + 20 * sk, y + 8 * sk + 30 * sk], radius=int(4 * sk), fill=(20, 22, 26, 255))
    d.text((xs + 10 * sk, y + 12 * sk), "Sale", font=fb, fill=(255, 255, 255, 255))
    y += int(66 * sk)
    ff = ImageFont.truetype(NORMAL, int(19 * sk)); d.text((int(60 * sk), y), "Free shipping to the US · 90-day guarantee · 5–10 business days", font=ff, fill=(90, 94, 100, 255))
    im.save(ut)


# ------------------------------------------------------------ produktbilden ur källans slutkort
# Mätt: 720-kortet har produktbilden y 467–807, x 61–659; 1080-kortet y 587–1097, x 91–989.
Image.open(os.path.join(HÄR, "rod", "OB_101_H1-slutkort.png")).convert("RGBA").crop((61, 467, 660, 808)).save(os.path.join(HÄR, "lager", "produkt-720.png"))
slutkort(720, 1280, os.path.join(HÄR, "lager", "produkt-720.png"), os.path.join(HÄR, "lager", "slutkort-720.png"))

# ------------------------------------------------------------ röda texter (720×1280)
PRIS = [("$199", 150, [124, 340, 605, 500], False), ("$249", 78, [194, 528, 624, 618], True)]
FRAKT = [("FREE SHIPPING", 110, [64, 340, 656, 500], False), ("90-DAY GUARANTEE", 62, [64, 512, 656, 596], False)]
rodtext(720, 1280, PRIS, [40, 316, 680, 640]).save(os.path.join(HÄR, "lager", "pris-mitt.png"))
rodtext(720, 1280, FRAKT, [40, 316, 680, 620]).save(os.path.join(HÄR, "lager", "frakt-mitt.png"))
rodtext(720, 1280, [("210D FABRIC", 100, [54, 280, 627, 507], False)], [30, 260, 690, 530]).save(os.path.join(HÄR, "lager", "vav-mitt.png"))
rodtext(720, 1280, [("$199", 150, [62, 55, 665, 291], False)], [40, 36, 680, 310]).save(os.path.join(HÄR, "lager", "pris-topp.png"))
rodtext(720, 1280, [("FREE SHIPPING", 100, [62, 70, 665, 285], False)], [40, 36, 680, 310]).save(os.path.join(HÄR, "lager", "frakt-topp.png"))
# US-runda 2026-09-20: källornas röda texter är "210D-VÄV", "6,5 × 3 m", "1 129 kr" och
# "1 129 kr / Spara 340" — ett lager per sort, i samma rutor som svenskan låg i.
rodtext(720, 1280, [("21 x 10 FT", 104, [126, 292, 594, 424], False)], [100, 272, 620, 446]).save(os.path.join(HÄR, "lager", "storlek-ob.png"))
rodtext(720, 1280, [("21 x 10 FT", 104, [126, 427, 594, 583], False)], [100, 408, 620, 602]).save(os.path.join(HÄR, "lager", "storlek-ri.png"))
rodtext(720, 1280, [("$199", 150, [110, 470, 640, 800], False)], [90, 452, 660, 820]).save(os.path.join(HÄR, "lager", "pris-ob.png"))
rodtext(720, 1280, [("$199", 150, [110, 336, 640, 530], False)], [90, 320, 660, 548]).save(os.path.join(HÄR, "lager", "pris-pd106.png"))
rodtext(720, 1280, [("$199", 132, [120, 356, 640, 536], False), ("SAVE $50", 84, [120, 546, 640, 700], False)], [100, 338, 660, 718]).save(os.path.join(HÄR, "lager", "pris-spara-pd107.png"))
rodtext(720, 1280, [("$199", 132, [118, 362, 600, 552], False), ("SAVE $50", 84, [118, 562, 600, 724], False)], [98, 344, 620, 742]).save(os.path.join(HÄR, "lager", "pris-spara-ri.png"))

# ------------------------------------------------------------ per video
# fönster ur rodtext.py (t0 = första framen med röd text, t1 = sista) + slutkort_fran
VIDEOR = {
    "OB_101_H1": {"W": 720, "cy": 946, "rod": [("vav-mitt", [9.2, 11.0], [90, 250, 670, 560]), ("pris-ob", [12.8, 15.0], [90, 452, 660, 820])], "slut": 15.0},
    "PD_107_H1": {"W": 720, "cy": 946, "rod": [("storlek-ob", [0.0, 3.6], [100, 272, 620, 446]), ("pris-spara-pd107", [10.8, 14.8], [100, 338, 660, 718])], "slut": 14.8},
    "RI_103_H1": {"W": 720, "cy": 946, "rod": [("storlek-ri", [4.4, 6.4], [100, 408, 620, 602]), ("pris-spara-ri", [10.4, 14.2], [98, 344, 620, 742])], "slut": 14.2},
    "PD_106_H1": {"W": 720, "cy": 946, "rod": [("pris-pd106", [10.6, 13.0], [90, 320, 660, 548])], "slut": 13.0},
}
forbehandla = {}
for n, v in VIDEOR.items():
    sk = v["W"] / 720
    lager = [{"png": f"../lager/{png}.png", "t": t} for png, t, _ in v["rod"]]
    if v["slut"] is not None:
        lager.append({"png": f"../lager/slutkort-{v['W']}.png", "t": [v["slut"], 999]})
    K = {
        "in": f"../forbehandlad/carashell_{n}.mp4",
        "ut": f"../../us/CaraShellRoof_US_{n}.mp4",
        "srt": f"../srt-us/carashell_{n}.srt",
        "captions": {"zon": [int(880 * sk), int(1100 * sk)], "max_chars": 34, "font_px": int(30 * sk), "standard_cy": v["cy"],
                     "x0": int(50 * sk), "x1": int(670 * sk), "bredd_max": int(620 * sk),
                     **({"av": [[v["slut"], 999]]} if v["slut"] is not None else {}),
                     **({"fyll": v["fyll"]} if v.get("fyll") else {})},
        "lager": lager,
        "qa": f"qa-{n}",
    }
    json.dump(K, open(os.path.join(HÄR, "cap", f"{n}.json"), "w"), indent=1, ensure_ascii=False)
    forbehandla[n] = [{"rect": r, "t": t} for _, t, r in v["rod"]]
json.dump(forbehandla, open(os.path.join(HÄR, "forbehandla.json"), "w"), indent=1)
print("cap/*.json, lager/*.png, forbehandla.json skrivna")
