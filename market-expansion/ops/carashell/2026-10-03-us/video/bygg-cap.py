#!/usr/bin/env python3
"""bygg-cap.py — lagren och konfigen för de amerikanska videorna (US-runda 2026-10-03, 7 st).

Alla sju källor bär det svenska priset inbränt i BILDEN, i två olika sorter
(kallskanning.py 2026-10-03, OCR 4 fps):

  GRUPP A — 111, 113, 114: en stor vit pristext i egen stil, ovanför captionpillret.
     Den ritas om på engelska i samma stil och läggs som PNG över en hårt blurrad ruta.
       111: två rader, vit fet med mörk kant, himmel bakom      [76, 314, 634, 442]
       113: tre rader, vit fet med mjuk skugga                  [101, 268, 626, 431]
       114: tre rader, samma stil, längre ner i bilden          [101, 747, 623, 922]

  GRUPP B — 117, 118, 119, 122: en RÖD pop-text som KÄLLAN SJÄLV redan suddat, men
     för svagt: OCR når den inte (conf < 0,5), men ÖGAT läser "1 129 kr" ur den i
     117, 118 och 119 (frames/r/*-rad.png, tittade 2026-10-03). Den får en hård blur
     och INGEN ny text. Skälet: källans författare suddade den med flit, så en
     engelsk text där hade lagt till något den svenska versionen inte har. Priset
     står ändå i captionen och i rösten. ⚠️ Rör aldrig det här till "lägg dit en
     engelsk pristext" utan att först titta på en frame — plattan ligger i himlen.

  ⛔ SLUTKORTEN i grupp B bär butikens egna märken, och leveransköns slutkortskoll
     dömde alla fyra "ren" (slutet rör sig, diff 65–102 > 6) — den tittade alltså
     aldrig efter ett varumärke:
       122: BÄVERBUTIKEN-loggan HELT OSUDDAD, OCR 0,99, ruta [290,292,564,348]
            (den svarta plattan runt den: [86,230,636,406]). Den målas bort, samma
            väg som Matstrumpors logga (CLAUDE.md, pipeline/logga.py).
       117: samma loggplatta men suddad av källan — överkanten är kvar skarp,
            så hela plattan täcks.
       118 och 119: den svenska raden "SKYDDAR DEN DYRASTE YTAN" är suddad till
            HÄLFTEN; bokstävernas underkant syns. Täcks.
     ⚠️ Lita aldrig på att en video utan slutkortsdom är ren: titta på sista framen.

⚠️ Texten säger bara det som är sant på den amerikanska sidan, läst live 2026-10-03
ur carashell.com/products/takskyddet.js?country=US: 199 dollar från 249, spara 50,
20 %. Storleken 21 × 10 ft (6,5 × 3 m). Inget kronbelopp någonstans.
⚠️ Tiderna nedan är mätta PÅ RENDERN (rodtext.py/tidslinje.py mot render/*.mp4) —
HeyGens precision-render har egen längd, så källans tider ligger fel.

    python3 bygg-cap.py            # skriver cap/<n>.json, lager/*.png, forbehandla.json
"""
import json, os
from PIL import Image, ImageDraw, ImageFont

HÄR = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
os.makedirs(os.path.join(HÄR, "lager"), exist_ok=True)
os.makedirs(os.path.join(HÄR, "cap"), exist_ok=True)


def passa(text, storlek, maxbredd):
    f = ImageFont.truetype(FET, storlek)
    while f.getlength(text) > maxbredd and storlek > 18:
        storlek -= 2
        f = ImageFont.truetype(FET, storlek)
    return f


def vit_text(W, H, rader, box, kant=True, panel=None):
    """Vit fet text, en rad per element, centrerad i `box`. kant=True ger mörk kontur
    (källans stil i 111), annars mjuk skugga (källans stil i 113 och 114).

    ⛔ `panel` är inte dekoration: blurrutan under texten syns som en GRÅ REKTANGEL
    mot himmel och foto (sett i en frame 2026-10-03, 113 var värst). Den amerikanska
    texten är kortare än den svenska, så den täcker inte rutan själv. En mörk rundad
    platta över hela blurrutan gör fläcken till ett avsiktligt priskort i stället."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if panel:
        d.rounded_rectangle(panel, radius=26, fill=(12, 14, 18, 212))
    x0, y0, x1, y1 = box
    radhojd = (y1 - y0) / len(rader)
    for i, text in enumerate(rader):
        storlek = max(28, int(radhojd * 0.82))
        f = passa(text, storlek, x1 - x0)
        w = f.getlength(text)
        asc, _ = f.getmetrics()
        x = (x0 + x1) / 2 - w / 2
        y = y0 + i * radhojd + (radhojd - asc * 0.78) / 2
        if kant:
            d.text((x, y), text, font=f, fill=(255, 255, 255, 255),
                   stroke_width=max(4, storlek // 13), stroke_fill=(24, 26, 30, 255))
        else:
            for dx, dy in ((4, 5), (3, 4), (2, 3)):
                d.text((x + dx, y + dy), text, font=f, fill=(0, 0, 0, 90))
            d.text((x, y), text, font=f, fill=(255, 255, 255, 255))
    return im


# ------------------------------------------------------------ grupp A: ett lager per video
# Rutorna är källans egna, mätta med kallskanning.py; tiderna sätts per render i videor.json.
# (textruta, rader, mörk kontur?, panel som täcker blurrutan under)
LAGER = {
    # 111: källan säger "1 129 kr (regular 1 469 kr), save 340 kr (23 %)." på två rader.
    "ob111-pris": ([72, 308, 638, 444], ["$199 (regular $249),", "save $50 (20% off)."], True, [62, 296, 648, 456]),
    # 113 och 114: källan säger "1 129 kronor / spara 340 kronor / 23 procent rabatt".
    "ob113-pris": ([98, 264, 631, 518], ["$199", "Save $50", "20% off"], False, [86, 252, 643, 530]),
    "ob114-pris": ([90, 742, 629, 999], ["$199", "Save $50", "20% off"], False, [78, 731, 641, 1010]),
}
for namn, (box, rader, kant, panel) in LAGER.items():
    vit_text(720, 1280, rader, box, kant, panel).save(os.path.join(HÄR, "lager", f"{namn}.png"))

# ------------------------------------------------------------ slutkortens plattor
# ⛔ Logga och svensk tagline ligger på ett NÄSTAN vitt kort. En blur där blir en grå
# rektangel mitt i det vita (sett i en frame 2026-10-03) — kortets egen färg målas
# dit i stället, så fläcken försvinner helt. Färgen är mätt bredvid rutan, aldrig gissad.
KORTPLATTOR = {
    "ob117-kort": ([76, 230, 634, 404], (251, 251, 251)),   # loggplattan (källan suddade den själv, kanten kvar)
    "ob117-rad": ([50, 830, 600, 902], (251, 251, 251)),    # "SKYDDAR DEN DYRASTE YTAN", halvsuddad
    "ob118-kort": ([54, 836, 576, 934], (253, 253, 253)),   # "SKYDDAR DEN DYRASTE YTAN", halvsuddad
    "ob119-kort": ([54, 836, 576, 934], (253, 253, 253)),
    "ob122-kort": ([80, 226, 642, 410], (251, 251, 251)),   # BÄVERBUTIKEN-loggan, helt osuddad
}
for namn, (box, farg) in KORTPLATTOR.items():
    im = Image.new("RGBA", (720, 1280), (0, 0, 0, 0))
    ImageDraw.Draw(im).rectangle(box, fill=(*farg, 255))
    im.save(os.path.join(HÄR, "lager", f"{namn}.png"))

# ------------------------------------------------------------ per video
# rod: (lagernamn|None, [t0,t1], förbehandlingsruta) — None = bara blur, ingen ny text.
# cy/zon/h: captionpillrets mitt, sökband och höjdintervall — mätt med pillerhojd.py.
VIDEOR = json.load(open(os.path.join(HÄR, "videor.json")))

forbehandla = {}
for n, v in VIDEOR.items():
    # Nycklarna bär hela SE-namnet (CaraShellRoof_OB_111_H1); målnamnet är samma
    # namn med marknadskoden insatt: CaraShellRoof_US_OB_111_H1 — aldrig prefixet två gånger.
    kort = n.split("_", 1)[1] if "_" in n else n
    prefix = n.split("_", 1)[0]
    lager = [{"png": f"../lager/{png}.png", "t": t} for png, t, _ in v["rod"] if png]
    K = {
        "in": f"../forbehandlad/carashell_{n}.mp4",
        "ut": f"../../us/{prefix}_US_{kort}.mp4",
        "srt": f"../srt-us/carashell_{n}.srt",
        # `av` = inga captions i fönstret. Används där KÄLLANS caption för sista
        # repliken ÄR den stora pristexten (111, 113, 114): utan den hade priset
        # stått två gånger, en gång i pillret och en gång på plattan.
        "captions": {"zon": v["zon"], "max_chars": 34, "font_px": 30, "standard_cy": v["cy"],
                     "h_min": v["h"][0], "h_max": v["h"][1],
                     "x0": 50, "x1": 670, "bredd_max": 620,
                     **({"av": v["av"]} if v.get("av") else {}),
                     **({"fyll": v["fyll"]} if v.get("fyll") else {})},
        "lager": lager,
        "qa": f"qa-{n}",
    }
    json.dump(K, open(os.path.join(HÄR, "cap", f"{n}.json"), "w"), indent=1, ensure_ascii=False)
    forbehandla[n] = [{"rect": r, "t": t} for _, t, r in v["rod"]]
json.dump(forbehandla, open(os.path.join(HÄR, "forbehandla.json"), "w"), indent=1)
print(f"{len(LAGER)} lager, {len(VIDEOR)} cap-konfigar, forbehandla.json skrivna")
