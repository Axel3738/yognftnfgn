#!/usr/bin/env python3
"""rita.py — presentkortets bild på ett annat språk än svenska.

    python3 matstrumpor/marknader/domantema/presentkort/rita.py [ut-mapp] [locale …]
    python3 matstrumpor/marknader/domantema/presentkort/rita.py ut ja zh-TW    # bara de två

Den svenska bilden (BlackRedBowPremiumGiftCertificate_3.png) säger PRESENTKORT / MATSTRUMPOR.SE /
150 KR / GILTIG I 3 MÅNADER — svenska ord och svenska kronor, i "Alle produkter" på varje
språk. bas.png är samma bild med texten borttagen (pipeline/logga.py fyll_lodratt: papperet fylls
lodrätt mellan raden ovanför och under texten, med papperets brus). Här ritas ordet för
presentkort (butikens egen översättning av produktnamnet, output/underlag-<locale>.json →
produkt.presentkort.title) överst och MATSTRUMPOR utan .SE där beloppet stod. Beloppet ritas INTE:
kortet säljs i kundens valuta och priset står bredvid bilden. Giltighetstiden ritas INTE heller:
"3 månader" är olagligt i USA (minst 5 år), Kanada (inget utgångsdatum), Australien (minst 3 år),
Tyskland och Österrike (granskarna 2026-09-29) — giltigheten styrs av Shopifys inställning, Axels beslut. Temat byter bild per språk
(domantema.mjs → presentkort-<locale>.png).

Japanska och kinesiska (ja, zh-TW) sedan 2026-10-02 (sajtgranskningen S-021: utan presentkort-ja.png
och presentkort-zh-TW.png i Files visade Japan och Taiwan den svenska bilden, "150 KR, GILTIG I 3
MÅNADER"). Poppins saknar tecknen, så rubriken ritas med Noto Sans CJK JP resp. TC Bold
(pipeline/cjk.py hämtar typsnittet första gången), utan versaler, med smalare spärrning än de
latinska (0,32 em i stället för 0,42 — bredare blir ギフトカード enskilda tecken i stället för ett ord)
och centrerad lodrätt på bläcket, för ett CJK-tecken står delvis under baslinjen. MATSTRUMPOR är
latinskt som på alla andra språk. Talet fyra (4/四) står aldrig i en japansk eller kinesisk text:
rita() vägrar. De latinska språken ritas exakt som förut.

Filerna ritas inte in i repot: de laddas upp till Matstrumpors Shopify Files med EXAKT namnet
presentkort-<locale>.png (alt = filnamnet), som matstrumpor/thumbnails.mjs tillShopify gör. Kolla först
att namnet inte redan finns, för då lägger Shopify till ett suffix och temat hittar inte filen.
ja och zh-TW laddades upp 2026-10-02 (MediaImage 62525284548947 resp. 62525286383955) och lästes som
kund på /ja och /zh-tw (produktsidan och "alla produkter").
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

HAR = os.path.dirname(os.path.abspath(__file__))
UNDERLAG = os.path.join(HAR, '..', '..', 'output')
FET = '/home/user/yognftnfgn/pipeline/fonts/Poppins-Bold.ttf'
HALV = '/home/user/yognftnfgn/pipeline/fonts/Poppins-SemiBold.ttf'
LOCALES = ['nb', 'da', 'fi', 'en', 'de', 'fr', 'nl', 'es', 'it', 'pl', 'pt-PT', 'ja', 'zh-TW']
# Shopifys locale → typsnittet i pipeline/cjk.py (ja = Noto Sans CJK JP, zh = Noto Sans CJK TC).
CJK_SPRAK = {'ja': 'ja', 'zh-TW': 'zh'}
FYRA = '4４四肆'

def spärrad(d, text, cx, topp, fontfil, storlek, sparr_em, max_bredd, fyll='#ffffff'):
    """Versaler med luft mellan bokstäverna (som originalet), centrerat; krymper tills raden ryms."""
    while True:
        f = ImageFont.truetype(fontfil, storlek)
        sparr = storlek * sparr_em
        bredder = [f.getlength(c) for c in text]
        total = sum(bredder) + sparr * (len(text) - 1)
        if total <= max_bredd or storlek < 20: break
        storlek -= 2
    x = cx - total / 2
    for c, b in zip(text, bredder):
        d.text((x, topp), c, font=f, fill=fyll, anchor='ls')
        x += b + sparr
    return storlek

def spärrad_cjk(d, text, cx, mitt, fontfil, storlek, sparr_em, max_bredd, fyll='#ffffff'):
    """Japanska/kinesiska: som spärrad() men utan versaler och med bläckets mitt på y=mitt — ett
    CJK-tecken står delvis under baslinjen, så baslinjen ensam hade lagt raden för lågt."""
    while True:
        f = ImageFont.truetype(fontfil, storlek)
        sparr = storlek * sparr_em
        bredder = [f.getlength(c) for c in text]
        total = sum(bredder) + sparr * (len(text) - 1)
        if total <= max_bredd or storlek < 20: break
        storlek -= 2
    _, ovan, _, under = f.getbbox(text, anchor='ls')    # bläcket i y, relativt baslinjen
    baslinje = mitt - (ovan + under) / 2
    x = cx - total / 2
    for c, b in zip(text, bredder):
        d.text((x, baslinje), c, font=f, fill=fyll, anchor='ls')
        x += b + sparr
    return storlek

def cjk_typsnitt(locale):
    pipeline = os.path.normpath(os.path.join(HAR, '..', '..', '..', '..', 'pipeline'))
    if pipeline not in sys.path: sys.path.insert(0, pipeline)
    import cjk  # Noto Sans CJK JP/TC Bold i ~/.fonts, hämtas första gången
    return cjk.typsnittsfil(CJK_SPRAK[locale])

def rita(locale, ut):
    u = json.load(open(os.path.join(UNDERLAG, f'underlag-{locale}.json')))
    titel = u['produkt.presentkort.title']
    im = Image.open(os.path.join(HAR, 'bas.png')).convert('RGB')
    d = ImageDraw.Draw(im)
    W = im.width
    if locale in CJK_SPRAK:
        ord_ = titel                                             # inga versaler i kana och kanji
        if any(c in ord_ for c in FYRA):
            raise SystemExit(f'{locale}: rubriken "{ord_}" bär talet fyra — skrivs aldrig på japanska eller kinesiska.')
        # Mitten på y 106 = mitten av de latinska versalerna (y 64–148); 116 px ger ungefär samma tyngd.
        spärrad_cjk(d, ord_, W / 2, 106, cjk_typsnitt(locale), 116, 0.32, 1500)
    else:
        ord_ = titel.upper()
        spärrad(d, ord_, W / 2, 148, FET, 118, 0.42, 1500)        # baslinje som PRESENTKORT (y 62–148)
    spärrad(d, 'MATSTRUMPOR', W / 2, 1122, FET, 72, 0.50, 1300)    # där beloppet stod, utan .SE
    im.save(ut, optimize=True)
    return ord_

if __name__ == '__main__':
    mapp = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HAR, 'ut')
    valda = sys.argv[2:] or LOCALES
    okanda = [l for l in valda if l not in LOCALES]
    if okanda: raise SystemExit(f'Okänd locale: {", ".join(okanda)} (känner {", ".join(LOCALES)})')
    os.makedirs(mapp, exist_ok=True)
    for loc in valda:
        print(loc, rita(loc, os.path.join(mapp, f'presentkort-{loc}.png')))
