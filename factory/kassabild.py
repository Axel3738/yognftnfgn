#!/usr/bin/env python3
"""kassabild.py — den SPRÅKLÖSA trygghetsbilden till Shopifys kassa.

    python3 factory/kassabild.py --spec <spec.json> --ut <bild.png>

Varför den är språklös, och varför det inte är en stilfråga:

Shopifys kassa går INTE att anpassa per marknad under planen Advanced
(mätt på CaraShell 2026-09-21: planen är "Shopify", checkoutBranding svarar
ACCESS_DENIED med plantexten, och butiken har EN publicerad checkout-profil
som betjänar alla fem marknaderna). Bilden är alltså EN inställning för hela
butiken, och den visas samtidigt för svenska, norska, danska, finska och
engelsktalande kunder. Ett enda ord på bilden är därför fel för fyra av fem.

Det som ÄR språkneutralt: butikens eget namn (samma i alla marknader),
stjärnor, och en siffra. Inget annat får ritas här — `granska_ord()` vägrar
skriva filen om spec:en bär text som inte är butiksnamnet eller ett tal.

⚠️ Bilden är STATISK. Betyget måste därför mätas, inte skrivas: kassabild.mjs
läser produkternas `reviews.rating` live ur Shopify och stoppar in det här,
och bokför vad den mätte så en senare körning kan se att siffran glidit.

Stjärnorna ritas som polygoner, aldrig som tecknet ★ — Liberation Sans (det
enda typsnitt containern har med garanterat å/ä/ö) saknar U+2605, och ett
tecken som saknas blir en tom ruta utan felmeddelande.

spec.json:
    {
      "namn": "CaraShell",
      "betyg": 5.0,
      "farger": { "mork": "#22282E", "accent": "#1F6F8E", "text": "#1B2026",
                  "yta": "#FFFFFF", "stjarna": "#F5A623" },
      "logga": "valfri/sokvag/logga.png",
      "bredd": 560
    }
"""
import argparse
import json
import math
import os
import re
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit('Pillow saknas. Kör: pip3 install pillow')

TYPSNITT = [
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]


def typsnitt(px):
    for s in TYPSNITT:
        if os.path.exists(s):
            return ImageFont.truetype(s, px)
    raise SystemExit(
        'Hittade inget typsnitt med å/ä/ö. Sökta: ' + ', '.join(TYPSNITT) +
        '. Installera fonts-liberation — ett saknat typsnitt får aldrig bli '
        'ett tyst fallback till ett utan svenska tecken.'
    )


def granska_ord(spec):
    """Vägrar varje text som inte är butiksnamnet eller ett tal.

    Spärren finns för att bilden visas i FEM marknader samtidigt. Ett
    "Trygg betalning" här är osynligt fel för den danska kunden — det ser
    rätt ut i förhandsgranskningen och är fel i fyra av fem kassor.
    """
    namn = str(spec.get('namn', '')).strip()
    fel = []
    for nyckel in ('rubrik', 'underrad', 'text', 'badge', 'botten'):
        if str(spec.get(nyckel, '')).strip():
            fel.append(f'{nyckel}: "{spec[nyckel]}"')
    if fel:
        raise SystemExit(
            'STOPP — kassabilden får inte bära ord. Den visas i alla marknader '
            'samtidigt (Shopify kan inte byta den per marknad under planen '
            'Advanced). Ta bort: ' + '; '.join(fel)
        )
    if namn and not re.fullmatch(r'[A-Za-zÅÄÖåäö0-9 .&-]{1,24}', namn):
        raise SystemExit(f'STOPP — "{namn}" ser inte ut som ett butiksnamn.')
    return namn


def stjarna(rita, mitt, radie, farg, fyllnad=1.0):
    """En femuddig stjärna som polygon. `fyllnad` 0–1 klipper den från vänster."""
    cx, cy = mitt
    punkter = []
    for i in range(10):
        r = radie if i % 2 == 0 else radie * 0.42
        v = math.radians(-90 + i * 36)
        punkter.append((cx + r * math.cos(v), cy + r * math.sin(v)))
    if fyllnad >= 0.999:
        rita.polygon(punkter, fill=farg)
        return
    # Delvis fylld: rita hela i blekt och klipp in den fyllda delen.
    rita.polygon(punkter, fill=farg + (60,) if len(farg) == 3 else farg)
    if fyllnad <= 0.001:
        return
    lager = Image.new('RGBA', (int(radie * 4), int(radie * 4)), (0, 0, 0, 0))
    d2 = ImageDraw.Draw(lager)
    flytt = [(x - cx + radie * 2, y - cy + radie * 2) for x, y in punkter]
    d2.polygon(flytt, fill=farg)
    bredd = int(radie * 4 * fyllnad)
    beskuren = lager.crop((0, 0, bredd, int(radie * 4)))
    lager2 = Image.new('RGBA', lager.size, (0, 0, 0, 0))
    lager2.paste(beskuren, (0, 0))
    rita._image.alpha_composite(lager2, (int(cx - radie * 2), int(cy - radie * 2)))


def hex_rgb(v, standard=(0, 0, 0)):
    s = str(v or '').strip().lstrip('#')
    if len(s) != 6:
        return standard
    try:
        return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))
    except ValueError:
        return standard


def bygg(spec, ut):
    namn = granska_ord(spec)
    betyg = float(spec.get('betyg') or 0)
    if not 0 < betyg <= 5:
        raise SystemExit(f'STOPP — betyget {betyg} är inte mätt. Kör kassabild.mjs, som läser det ur Shopify.')
    f = spec.get('farger') or {}
    c_text = hex_rgb(f.get('mork'), (34, 40, 46))
    c_stjarna = hex_rgb(f.get('stjarna') or '#F5A623', (245, 166, 35))
    c_yta = hex_rgb(f.get('yta') or '#FFFFFF', (255, 255, 255))

    bredd = int(spec.get('bredd') or 560)
    hojd = int(bredd * 0.26)
    skala = 4  # ritas 4× och krymps — kanterna blir mjuka utan antialias-flaggor
    B, H = bredd * skala, hojd * skala
    bild = Image.new('RGBA', (B, H), c_yta + (255,))
    rita = ImageDraw.Draw(bild)
    rita._image = bild

    logga_sokvag = str(spec.get('logga') or '').strip()
    x = int(B * 0.06)
    mitt_y = H // 2

    if logga_sokvag and os.path.exists(logga_sokvag):
        logga = Image.open(logga_sokvag).convert('RGBA')
        mal_h = int(H * 0.46)
        mal_b = max(1, int(logga.width * mal_h / logga.height))
        logga = logga.resize((mal_b, mal_h), Image.LANCZOS)
        bild.alpha_composite(logga, (x, mitt_y - mal_h // 2))
        x += mal_b
    elif namn:
        tf = typsnitt(int(H * 0.30))
        rita.text((x, mitt_y), namn, font=tf, fill=c_text + (255,), anchor='lm')
        x += int(rita.textlength(namn, font=tf))

    # Avdelare mellan brandet och betyget.
    delare_x = x + int(B * 0.045)
    rita.line([(delare_x, int(H * 0.28)), (delare_x, int(H * 0.72))],
              fill=hex_rgb(f.get('linje') or '#D6D9D3', (214, 217, 211)) + (255,), width=max(1, skala))

    # Siffran — ett tal är samma på alla fem språk. Decimaltecknet är det enda
    # som skiljer (4.8 mot 4,8), så heltal skrivs utan decimal och resten med
    # den svenska kommateringen: kassans största marknad är Sverige.
    txt = str(int(betyg)) if betyg == int(betyg) else f'{betyg:.1f}'.replace('.', ',')
    tf = typsnitt(int(H * 0.26))
    txt_b = rita.textlength(txt, font=tf)

    # ⚠️ Stjärnornas storlek RÄKNAS ut ur det som är kvar, den sätts inte.
    # Med en fast radie sköt femte stjärnan och siffran utanför kanten, och
    # en bild som är beskuren i högerkant syns inte förrän någon tittar i en
    # riktig kassa — PNG:en själv ser hel ut. Ett långt butiksnamn, ett
    # bredare betyg (4,6 mot 5) eller en annan bredd flyttar gränsen.
    hoger = int(B * 0.94)
    sx = delare_x + int(B * 0.045)
    lucka = int(B * 0.025)
    tillgangligt = hoger - sx - lucka - txt_b
    radie = max(4, min(int(H * 0.17), int(tillgangligt / 11.75)))
    steg = int(radie * 2.35)
    if tillgangligt <= 0:
        raise SystemExit('STOPP — butiksnamnet tar hela bredden, stjärnorna får inte plats. Höj "bredd" i spec:en.')

    for i in range(5):
        kvar = betyg - i
        fyllnad = 1.0 if kvar >= 1 else (kvar if kvar > 0 else 0.0)
        stjarna(rita, (sx + radie + i * steg, mitt_y - int(H * 0.02)), radie, c_stjarna, fyllnad)

    rita.text((sx + 5 * steg + lucka, mitt_y - int(H * 0.02)), txt,
              font=tf, fill=c_text + (255,), anchor='lm')

    bild = bild.resize((bredd, hojd), Image.LANCZOS)
    os.makedirs(os.path.dirname(os.path.abspath(ut)) or '.', exist_ok=True)
    bild.save(ut)
    return {'fil': ut, 'bredd': bredd, 'hojd': hojd, 'betyg': betyg, 'namn': namn}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--spec', required=True)
    p.add_argument('--ut', required=True)
    p.add_argument('--json', action='store_true')
    a = p.parse_args()
    with open(a.spec, encoding='utf-8') as fh:
        spec = json.load(fh)
    res = bygg(spec, a.ut)
    if a.json:
        print(json.dumps(res, ensure_ascii=False))
    else:
        print(f"✅ {res['fil']} — {res['bredd']}×{res['hojd']} px, betyg {res['betyg']}, inga ord")


if __name__ == '__main__':
    main()
