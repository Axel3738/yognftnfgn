#!/usr/bin/env python3
"""slutkort.py — slutkortet (endcard) som läggs sist i en videoannons, per marknad.

    python3 factory/slutkort.py --produkt factory/produkter/takskyddet.yaml \\
        --butik factory/butiker/carashell.yaml --marknad DK --bredd 720 \\
        --produktbild <bild.png> --ut <slutkort.png>

    python3 factory/slutkort.py --produkt … --butik … --marknad DK --json-text
        (bara raderna som JSON — ingen bild, ingen Pillow, inget att titta på)

Varför den finns
----------------
Bäverbutikens videoannonser speglas till OPS-butikerna. Mätt 2026-09-20 på de 24
svenska taköverdrags-videorna: nio slutar med ett slutkort på exakt 3,0 sekunder
— åtta med Bäverbutikens logga (svart ruta, rött bäverhuvud, guld ordmärke,
svensk flagga, svensk titel, "10 recensioner", 1 469 kr överstruket / 1 129 kr),
den nionde (PD_5_H1) med en blå badge som säger "carashell.se".

Axels beslut 2026-09-18: butikens namn och domän står ALDRIG i en annons — inte
"Bäverbutiken", inte "CaraShell", inte domänen. Axels order 2026-09-20: täpp
luckan INFÖR DANMARK, gå inte tillbaka och rätta NO/US/GB/CA/AU/NZ.

Kedjan består av tre delar, och det här är den tredje:
  * `factory/slutkortskoll.py`  MÄTER om en mp4 har ett slutkort och från vilken
                                sekund (mätverktyg, en människa kör det).
  * `factory/bildbrand.mjs`     SPÄRREN före uppladdning: OCR ur kortet, dom
                                ren / slutkort-utan-brand / slutkort-med-brand.
  * `factory/slutkort.py`       RENDERAR ett nytt, marknadsanpassat kort utan
                                butiksnamn — det som ersätter det fällda.

Layouten är LYFT ur `market-expansion/ops/carashell/2026-09-18-us/video/bygg-cap.py`
→ `slutkort()`. Den är bevisad: fem amerikanska videor ligger live med den.
Skillnaderna mot originalet, alla med flit:
  1. Inget är hårdkodat. Titel, garanti, pris, recensioner och fraktrad kommer
     ur produktfilen, butiksfilen, marknadsraden i `factory/opsmarknader.mjs`
     och (om den finns) butikens egen översättningsfil.
  2. Ingen logga, inget butiksnamn, ingen domän — och `granska_brandord()`
     VÄGRAR skriva en bild där något av det smugit in i en rad.
  3. Fem språk (sv, nb, en, fi, da) i EN tabell högst upp — samma fem som
     `TEMAORD` i `factory/tema.mjs`.

Node-tabellerna (`opsmarknader.mjs`, `yaml.mjs`) läses genom att SPAWNA node,
som skriver JSON. Ingen .mjs tolkas i Python — då hade tabellen haft två
sanningar, och den ena hade tystnat.

Spärrar: inga nätanrop, inget annonskonto, ingen Shopify. Kostar 0 kr.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import unicodedata

ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --------------------------------------------------------------------------
# ORDEN PER SPRÅK — en tabell, fem språk, samma som TEMAORD i factory/tema.mjs.
#
# Danskan är avläst ur repots egna danska texter 2026-09-20, inte översatt på
# fri hand: "hverdage" ur TEMAORD.leverans_enhet.da, "14 dages fortrydelsesret"
# och "Gratis fragt" ur factory/output/carashell/oversattning-da.json.
# Finskan likaså ("arkipäivää", "Ilmainen toimitus Suomeen").
#
# `land` är marknadens namn i marknadens EGET språk. Varje språk hör till en
# marknad (sv→SE, nb→NO, da→DK, fi→FI, en→US). ⚠️ US-marknaden bär även GB, CA,
# AU och NZ (butikens marknadsrad `lander:`); butikssidan byter landnamn med
# token per besökare, men ett slutkort är EN bild och säger marknaden.
# --------------------------------------------------------------------------
ORD = {
    'sv': {
        'land': 'Sverige',
        'fri_frakt': 'Fri frakt till {land}',
        'frakt': 'Frakt till {land}',
        'leverans': '{tid} arbetsdagar',
        'recensioner': '{n} recensioner',
        'snitt': '{v} i snitt',
        'oppet_kop': '{n} dagars öppet köp',
        'angerratt': '{n} dagars ångerrätt',
        'rea': 'Rea',
    },
    'nb': {
        'land': 'Norge',
        'fri_frakt': 'Gratis frakt til {land}',
        'frakt': 'Frakt til {land}',
        'leverans': '{tid} virkedager',
        'recensioner': '{n} anmeldelser',
        'snitt': '{v} i snitt',
        'oppet_kop': '{n} dagers åpent kjøp',
        'angerratt': '{n} dagers angrerett',
        'rea': 'Salg',
    },
    'en': {
        'land': 'the US',
        'fri_frakt': 'Free shipping to {land}',
        'frakt': 'Shipping to {land}',
        'leverans': '{tid} business days',
        'recensioner': '{n} reviews',
        'snitt': '{v} average',
        'oppet_kop': '{n}-day returns',
        'angerratt': '{n}-day right of withdrawal',
        'rea': 'Sale',
    },
    'fi': {
        'land': 'Suomeen',
        'fri_frakt': 'Ilmainen toimitus {land}',
        'frakt': 'Toimitus {land}',
        'leverans': '{tid} arkipäivää',
        'recensioner': '{n} arvostelua',
        'snitt': 'keskiarvo {v}',
        'oppet_kop': '{n} päivän palautusoikeus',
        'angerratt': '{n} päivän peruuttamisoikeus',
        'rea': 'Tarjous',
    },
    'da': {
        'land': 'Danmark',
        'fri_frakt': 'Gratis fragt til {land}',
        'frakt': 'Fragt til {land}',
        'leverans': '{tid} hverdage',
        'recensioner': '{n} anmeldelser',
        'snitt': '{v} i gennemsnit',
        'oppet_kop': '{n} dages åbent køb',
        'angerratt': '{n} dages fortrydelsesret',
        'rea': 'Tilbud',
    },
}

# Prisformatet hör till VALUTAN, inte till språket. Avläst 2026-09-20 ur
# butikernas egna marknadssidor och Axels prislistor:
#   DKK  819 → "819 kr."      1069 → "1.069 kr."   (punkt som tusental, kr. EFTER)
#   USD  199 → "$199"                               ($ före, komma som tusental)
#   NOK 1106 → "1 106 kr"     1382.5 → "1 382,50 kr"
#   EUR 126.9 → "126,90 €"
#   SEK 1129 → "1 129 kr"
# Decimaler visas bara när beloppet faktiskt har en decimaldel — ett påhittat
# ",00" är en siffra ingen skrivit.
VALUTAFORMAT = {
    'SEK': {'symbol': 'kr', 'fore': False, 'tusental': ' ', 'decimal': ','},
    'NOK': {'symbol': 'kr', 'fore': False, 'tusental': ' ', 'decimal': ','},
    'DKK': {'symbol': 'kr.', 'fore': False, 'tusental': '.', 'decimal': ','},
    'EUR': {'symbol': '€', 'fore': False, 'tusental': ' ', 'decimal': ','},
    'USD': {'symbol': '$', 'fore': True, 'tusental': ',', 'decimal': '.'},
}

# Typsnitten: samma sökvägar som originalet (bygg-cap.py). Liberation Sans
# saknar ★ och ritar en ruta i stället — stjärnorna tas därför ur DejaVu, precis
# som i factory/bild-text.py. Ett typsnitt som saknas är ett FEL med namn, aldrig
# ett tyst fallback till något utan å/ä/ö.
FET = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
NORMAL = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
STJARNA = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

# Färgerna ur det bevisade US-kortet (bygg-cap.py 2026-09-18).
VIT = (255, 255, 255, 255)
BLACK = (20, 22, 26, 255)
GRA = (130, 134, 140, 255)
GRA_MJUK = (90, 94, 100, 255)
GRA_TEXT = (70, 74, 80, 255)
GRON = (33, 150, 83, 255)
BADGE = (44, 95, 138, 255)


class Fel(Exception):
    """Ett fel som ska nå användaren som en mening, inte som en stacktrace."""


# --------------------------------------------------------------------------
# Node-bron: yaml.mjs + opsmarknader.mjs läses av NODE, aldrig av Python.
# --------------------------------------------------------------------------
_JS = r'''
// ⚠️ `node -e` lägger INTE något skriptnamn i argv (mätt 2026-09-20, node 22):
// process.argv = [node, ...argumenten]. slice(2) hade tappat första argumentet,
// så de fyra sista läses i stället — det stämmer oavsett hur node numrerar.
const [rot, produktFil, butikFil, kod] = process.argv.slice(-4);
const { pathToFileURL } = await import('node:url');
const bas = pathToFileURL(rot + '/').href;
const { lasYaml } = await import(new URL('factory/yaml.mjs', bas).href);
const m = await import(new URL('factory/opsmarknader.mjs', bas).href);
const { readFileSync } = await import('node:fs');
const las = (f) => lasYaml(readFileSync(f, 'utf8'));
const produkt = las(produktFil);
const butik = las(butikFil);
const K = String(kod || '').toUpperCase();
let marknad = null;
try { marknad = m.marknadFor(K); } catch { marknad = null; }
const rader = Array.isArray(butik?.butik?.marknader) ? butik.butik.marknader : [];
const marknadsrad = rader.find((r) => String(r?.land ?? '').toUpperCase() === K) ?? null;
process.stdout.write(JSON.stringify({
  produkt, butik, marknad, marknadsrad,
  marknadskoder: m.OPS_MARKNADSKODER,
}));
'''


def las_konfig(produktfil, butikfil, kod, rot=ROT):
    """Produktfil, butiksfil och marknadsrad — lästa av node, tillbaka som JSON."""
    r = subprocess.run(
        ['node', '--input-type=module', '-e', _JS, rot, produktfil, butikfil, kod],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        raise Fel(f'node kunde inte läsa konfigen:\n{r.stderr.strip()}')
    try:
        return json.loads(r.stdout)
    except json.JSONDecodeError as e:
        raise Fel(f'node svarade inte med JSON: {e}\n{r.stdout[:400]}')


# --------------------------------------------------------------------------
# Brandspärren — ingen bild skrivs med butikens namn eller domän i en rad.
# --------------------------------------------------------------------------
def _vik(s):
    """Viker å/ä/ö/æ/ø till a/o så "Bäverbutiken" och "baverbutiken" är samma ord."""
    s = str(s).lower().replace('ø', 'o').replace('æ', 'ae')
    return ''.join(c for c in unicodedata.normalize('NFD', s) if not unicodedata.combining(c))


TOPPDOMANER = ('se', 'com', 'dk', 'no', 'fi', 'net', 'shop', 'co.uk')
_DOMAN = re.compile(r'\b[a-z0-9][a-z0-9-]{1,}\.(?:' + '|'.join(TOPPDOMANER) + r')\b')


def forbjudna_ord(konfig):
    """Butiksnamn och domäner som aldrig får stå i en annons.

    Härleds ur filerna, aldrig ur en lista i huvudet: butikens brand och
    supportdomän, produktfilens brand + domänidéer, marknadsradernas egna
    domäner och KÄLLBUTIKEN (annonsen är speglad därifrån)."""
    b, p = konfig.get('butik') or {}, konfig.get('produkt') or {}
    ut = set()
    def lagg(v):
        v = str(v or '').strip()
        if len(v) >= 3:
            ut.add(_vik(v))
    lagg((b.get('butik') or {}).get('brand'))
    mail = str((b.get('butik') or {}).get('supportmail') or '')
    if '@' in mail:
        lagg(mail.split('@')[1])
        lagg(mail.split('@')[1].split('.')[0])
    for rad in (b.get('butik') or {}).get('marknader') or []:
        lagg((rad or {}).get('doman'))
    lagg((p.get('brand') or {}).get('namn'))
    for d in (p.get('brand') or {}).get('domanideer') or []:
        lagg(d)
        lagg(str(d).split('.')[0])
    kalla = str((p.get('kalla') or {}).get('butik') or '')
    lagg(kalla)
    lagg(kalla.split('.')[0])
    return sorted(w for w in ut if w)


def granska_brandord(texter, forbjudna):
    """Kastar på första träffen. En bild med butikens namn skrivs ALDRIG."""
    fynd = []
    for falt, varde in texter.items():
        if not isinstance(varde, str):
            continue
        vikt = _vik(varde)
        for ord_ in forbjudna:
            if ord_ and ord_ in vikt:
                fynd.append(f'{falt}: "{varde}" innehåller butiksordet "{ord_}"')
        for d in _DOMAN.findall(vikt):
            fynd.append(f'{falt}: "{varde}" innehåller domänen "{d}"')
    if fynd:
        raise Fel('BRANDORD I SLUTKORTET (Axels beslut 2026-09-18 — butikens '
                  'namn och domän står aldrig i en annons):\n  ' + '\n  '.join(fynd))


# --------------------------------------------------------------------------
# Pris
# --------------------------------------------------------------------------
def formatera_pris(belopp, valuta):
    if belopp is None:
        return None
    f = VALUTAFORMAT.get(str(valuta).upper())
    if not f:
        raise Fel(f'Okänd valuta "{valuta}". Kända: {", ".join(sorted(VALUTAFORMAT))} '
                  '(lägg till raden i VALUTAFORMAT i factory/slutkort.py).')
    tal = float(belopp)
    decimaler = 0 if abs(tal - round(tal)) < 0.005 else 2
    hel = f'{abs(tal):,.{decimaler}f}'.replace(',', '\x00').replace('.', '\x01')
    hel = hel.replace('\x00', f['tusental']).replace('\x01', f['decimal'])
    if tal < 0:
        hel = '-' + hel
    return f'{f["symbol"]}{hel}' if f['fore'] else f'{hel} {f["symbol"]}'


def _marknadspris(nod, valuta, basvaluta=None):
    """(pris, jamforpris) för valutan.

    Butikens BASVALUTA står som `pris`/`jamforpris` rakt på noden (SEK i varje
    OPS-butik i dag) — den har ingen rad i `marknadspriser`, och ska inte få
    en. Alla andra valutor är fasta priser i marknadens prislista."""
    nod = nod or {}
    if basvaluta and str(valuta).upper() == str(basvaluta).upper():
        if nod.get('pris') is not None:
            return nod.get('pris'), nod.get('jamforpris')
    for rad in nod.get('marknadspriser') or []:
        if str((rad or {}).get('valuta', '')).upper() == str(valuta).upper():
            return rad.get('pris'), rad.get('jamforpris')
    return None, None


def valj_variant(produkt, butik, valuta, onskad=None):
    """Referensvarianten: butikens annonserade storlek, annars den första.

    Returnerar (namn, pris, jamforpris, regel). Utan varianter faller den
    tillbaka på produktens `ekonomi`."""
    bas = (butik.get('butik') or {}).get('valuta')
    varianter = produkt.get('varianter') or []
    if not varianter:
        pris, jam = _marknadspris(produkt.get('ekonomi'), valuta, bas)
        if pris is None:
            raise Fel(f'Produkten har inget pris i {valuta} — lägg raden i '
                      'ekonomi.marknadspriser. Ett pris skrivs aldrig in i koden.')
        return None, pris, jam, 'produktens ekonomi (inga varianter)'

    def med_pris(v):
        return _marknadspris(v, valuta, bas)[0] is not None

    if onskad:
        for v in varianter:
            if str(v.get('namn', '')).strip() == onskad.strip():
                p, j = _marknadspris(v, valuta, bas)
                if p is None:
                    raise Fel(f'Varianten "{onskad}" har inget pris i {valuta}.')
                return v.get('namn'), p, j, '--variant på kommandoraden'
        raise Fel(f'Ingen variant heter "{onskad}". Finns: '
                  + ', '.join(str(v.get('namn')) for v in varianter))

    # Butikens annonserade storlek: startsidans produktetikett bär den
    # ("Taköverdrag 6,5 × 3 m"), och menynamnet som reserv.
    etiketter = [
        str((butik.get('startsida') or {}).get('produkt_etikett') or ''),
        str(produkt.get('produkt', {}).get('menynamn') or ''),
        str(produkt.get('produkt', {}).get('namn') or ''),
    ]
    for etikett in etiketter:
        if not etikett:
            continue
        for v in varianter:
            namn = str(v.get('namn', '')).strip()
            if namn and namn in etikett and med_pris(v):
                p, j = _marknadspris(v, valuta, bas)
                return v.get('namn'), p, j, f'butikens annonserade storlek ("{etikett}")'

    for v in varianter:
        if med_pris(v):
            p, j = _marknadspris(v, valuta, bas)
            return v.get('namn'), p, j, 'första varianten med pris i valutan'
    raise Fel(f'Ingen av {len(varianter)} varianter har ett pris i {valuta}.')


# --------------------------------------------------------------------------
# Texterna — den rena delen. `--json-text` skriver exakt det här.
# --------------------------------------------------------------------------
def _las_oversattning(rot, butiks_id, locale, egen=None):
    """Butikens EGNA marknadstext (titel, garanti) om filen finns. Valfri."""
    fil = egen or os.path.join(rot, 'factory', 'output', str(butiks_id), f'oversattning-{locale}.json')
    if not os.path.exists(fil):
        return {}, None
    with open(fil, encoding='utf-8') as f:
        return json.load(f), fil


def _forsta_i_lista(varde):
    """Översättningsfilens listfält är JSON-strängar: '["14 dages …"]'."""
    if isinstance(varde, list):
        return varde[0] if varde else None
    if isinstance(varde, str):
        t = varde.strip()
        if t.startswith('['):
            try:
                lista = json.loads(t)
                return lista[0] if lista else None
            except json.JSONDecodeError:
                return None
        return t or None
    return None


_TID = re.compile(r'\d+(?:\s*[–—-]\s*\d+)?')


def bygg_texter(konfig, kod, variant=None, titel=None, garanti=None, rot=ROT, oversattning=None):
    """Alla rader på kortet + varifrån de kom. Ingen Pillow, inga pixlar."""
    produkt, butik = konfig.get('produkt') or {}, konfig.get('butik') or {}
    marknad, rad = konfig.get('marknad'), konfig.get('marknadsrad') or {}
    kod = str(kod).upper()

    locale = (marknad or {}).get('locale') or rad.get('locale') or ('sv' if kod == 'SE' else None)
    if kod == 'SE':
        locale = 'sv'
    if not locale:
        raise Fel(f'Marknaden {kod} finns varken i factory/opsmarknader.mjs eller i '
                  'butikens `marknader:` — språket går inte att härleda.')
    if locale not in ORD:
        raise Fel(f'Språket "{locale}" saknas i ORD-tabellen (factory/slutkort.py). '
                  f'Finns: {", ".join(ORD)}.')
    o = ORD[locale]
    valuta = (marknad or {}).get('valuta') or rad.get('valuta') or butik.get('butik', {}).get('valuta')
    if not valuta:
        raise Fel(f'Marknaden {kod} har ingen valuta i opsmarknader.mjs eller i butiksfilen.')

    produkt_id = str(produkt.get('produkt', {}).get('id') or '')
    butiks_id = str(butik.get('butik', {}).get('id') or '')
    over, overfil = _las_oversattning(rot, butiks_id, locale, oversattning)

    kallor = {
        'marknad': ('opsmarknader.mjs' if marknad else
                    f'butikens marknader: (ingen annonsmarknad i opsmarknader.mjs — koder där: '
                    f'{", ".join(konfig.get("marknadskoder") or [])})'),
        'oversattningsfil': overfil or 'ingen (bara produktfil + butiksfil)',
    }

    # --- titel ------------------------------------------------------------
    if titel:
        t, kallor['titel'] = titel, '--titel på kommandoraden'
    elif over.get(f'produkt.{produkt_id}.title'):
        t, kallor['titel'] = over[f'produkt.{produkt_id}.title'], f'{os.path.basename(overfil)} → produkt.{produkt_id}.title'
    elif locale == 'sv':
        t, kallor['titel'] = produkt.get('produkt', {}).get('namn'), 'produktfilen → produkt.namn'
    else:
        raise Fel(f'Ingen {locale}-titel: varken --titel eller '
                  f'factory/output/{butiks_id}/oversattning-{locale}.json → '
                  f'produkt.{produkt_id}.title. Den svenska titeln får inte stå på '
                  f'ett {locale}-kort.')
    if not t:
        raise Fel('Produkten har ingen titel.')

    # --- garanti (badgen) -------------------------------------------------
    if garanti:
        g, kallor['garanti'] = garanti, '--garanti på kommandoraden'
    elif _forsta_i_lista(over.get(f'metafalt.{produkt_id}.opf.garantier')):
        g = _forsta_i_lista(over[f'metafalt.{produkt_id}.opf.garantier'])
        kallor['garanti'] = f'{os.path.basename(overfil)} → metafalt.{produkt_id}.opf.garantier[0]'
    elif locale == 'sv' and (butik.get('garantier') or []):
        g, kallor['garanti'] = butik['garantier'][0], 'butiksfilen → garantier[0]'
    else:
        retur = butik.get('retur') or {}
        dagar = retur.get('oppet_kop_dagar') or retur.get('angerratt_dagar')
        if not dagar:
            raise Fel('Ingen garanti att sätta i badgen: varken översättningsfil, '
                      'butik.garantier eller butik.retur.*_dagar.')
        nyckel = 'oppet_kop' if retur.get('oppet_kop_dagar') else 'angerratt'
        g = o[nyckel].format(n=int(dagar))
        kallor['garanti'] = f'butiksfilen → retur.{nyckel}_dagar = {int(dagar)} + ORD[{locale}]'

    # --- pris -------------------------------------------------------------
    variantnamn, pris, jamforpris, regel = valj_variant(produkt, butik, valuta, variant)
    kallor['variant'] = f'{variantnamn or "(ingen variant)"} — {regel}'
    kallor['pris'] = f'{pris} {valuta} (jämförpris {jamforpris if jamforpris is not None else "—"})'

    # --- recensioner ------------------------------------------------------
    rec = [r for r in (produkt.get('reviews') or []) if isinstance(r, dict)]
    recrad = None
    if rec:
        betyg = [float(r['betyg']) for r in rec if isinstance(r.get('betyg'), (int, float))]
        recrad = o['recensioner'].format(n=len(rec))
        if betyg:
            snitt = sum(betyg) / len(betyg)
            v = f'{snitt:.1f}'.replace('.', VALUTAFORMAT[str(valuta).upper()]['decimal'])
            recrad += ' · ' + o['snitt'].format(v=v)
        kallor['recensioner'] = f'produktfilen → reviews ({len(rec)} st)'
    else:
        kallor['recensioner'] = 'produkten har inga recensioner i repot — raden utelämnas'

    # --- frakt + leverans (marknadens sanning, aldrig en översatt svenska) --
    frakt = butik.get('frakt') or {}
    leveranstid = rad.get('leveranstid') or frakt.get('leveranstid')
    if not leveranstid:
        raise Fel(f'Ingen leveranstid för {kod}: varken marknadsraden eller butik.frakt.leveranstid.')
    m = _TID.search(str(leveranstid))
    if not m:
        raise Fel(f'Leveranstiden "{leveranstid}" bär inget tal — kortet skriver aldrig "5–10" ur huvudet.')
    tid = re.sub(r'\s*', '', m.group(0))
    fri = bool(frakt.get('fri_globalt'))
    fraktord = (o['fri_frakt'] if fri else o['frakt']).format(land=o['land'])
    fotrad = ' · '.join([fraktord, g, o['leverans'].format(tid=tid)])
    kallor['frakt'] = (f'butik.frakt.fri_globalt={fri}, leveranstid "{leveranstid}" ur '
                       + ('marknadsraden' if rad.get('leveranstid') else 'butik.frakt') + f' + ORD[{locale}]')

    texter = {
        'marknad': kod,
        'sprak': locale,
        'valuta': str(valuta).upper(),
        'badge': str(g).upper(),
        'titel': str(t),
        'stjarnor': '★★★★★' if rec else '',
        'recensioner': recrad or '',
        'pris': formatera_pris(pris, valuta),
        'jamforpris': formatera_pris(jamforpris, valuta),
        'rea': o['rea'] if jamforpris and float(jamforpris) > float(pris) else '',
        'fotrad': fotrad,
    }
    granska_brandord(texter, forbjudna_ord(konfig))
    return texter, kallor


# --------------------------------------------------------------------------
# Renderingen — layouten ur bygg-cap.py, sk = W/720 precis som originalet.
# --------------------------------------------------------------------------
def _typsnitt(sokvag, storlek):
    from PIL import ImageFont
    if not os.path.exists(sokvag):
        raise Fel(f'TYPSNITT SAKNAS: {sokvag}. Installera det (Liberation + DejaVu) — '
                  'ett kort ritas aldrig med ett annat typsnitt i tysthet.')
    return ImageFont.truetype(sokvag, max(1, int(storlek)))


def _bryt(text, sokvag, storlek, maxbredd, maxrader):
    """Ordbrytning med krympning: raderna ska rymmas, aldrig klippas."""
    from PIL import ImageFont
    s = int(storlek)
    while s > 12:
        f = _typsnitt(sokvag, s)
        rader, nuvarande = [], ''
        for o in str(text).split():
            prov = f'{nuvarande} {o}'.strip()
            if f.getlength(prov) <= maxbredd or not nuvarande:
                nuvarande = prov
            else:
                rader.append(nuvarande)
                nuvarande = o
        if nuvarande:
            rader.append(nuvarande)
        if len(rader) <= maxrader and all(f.getlength(r) <= maxbredd for r in rader):
            return rader, f
        s -= 2
    raise Fel(f'Texten "{text}" ryms inte på {maxrader} rader i {maxbredd} px.')


def _passa(text, sokvag, storlek, maxbredd):
    """En rad som krymps tills den ryms (originalets `passa`, men utan golv på 20)."""
    s = int(storlek)
    f = _typsnitt(sokvag, s)
    while f.getlength(text) > maxbredd and s > 10:
        s -= 1
        f = _typsnitt(sokvag, s)
    return f


def _vitrensa(bild, trosk):
    """Snäpper nästan-vitt till kortets vita, så produktbilden inte får en ram.

    ⚠️ Mätt 2026-09-20 på produktbilden som dras ur ett befintligt slutkort
    (`Takoverdrag_CO_1_H1/slutkort.png`, crop 61,467–660,808 enligt bygg-cap.py
    rad 100–102): bakgrunden där är (253, 253, 253), kortets är (255, 255, 255).
    Två stegs skillnad räcker för att kunden ska se en grå ruta runt produkten.
    Bara pixlar där ALLA kanaler ligger över tröskeln rörs — en produkt i ljus
    grå eller beige påverkas inte. `--vitrensa 0` stänger av steget."""
    if not trosk:
        return bild
    px = bild.load()
    for y in range(bild.height):
        for x in range(bild.width):
            r, g, b, a = px[x, y]
            if a and r >= trosk and g >= trosk and b >= trosk:
                px[x, y] = (255, 255, 255, a)
    return bild


def rita_slutkort(texter, produktbild, ut, bredd=720, hojd=None, vitrensa=250):
    """Skriver PNG:en. Layout och mått ur bygg-cap.py → slutkort() (US, bevisad)."""
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        raise Fel('PILLOW_SAKNAS: kör `pip3 install pillow`.')

    W = int(bredd)
    H = int(hojd) if hojd else int(round(W * 16 / 9))
    sk = W / 720
    marg = int(60 * sk)
    txtbredd = W - 2 * marg

    im = Image.new('RGBA', (W, H), VIT)
    d = ImageDraw.Draw(im)

    # --- badge: garantin, centrerad (originalets plats: y = 250 × sk) ------
    f = _passa(texter['badge'], NORMAL, 40 * sk, txtbredd - int(60 * sk))
    w = f.getlength(texter['badge'])
    bw, bh = w + 60 * sk, 72 * sk
    bx, by = (W - bw) / 2, 250 * sk
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=int(10 * sk), fill=BADGE)
    d.text((W / 2 - w / 2, by + bh / 2 - f.getmetrics()[0] * 0.72 / 2 - 4 * sk),
           texter['badge'], font=f, fill=VIT)

    # --- textblockets höjd räknas FÖRE bilden, så inget hamnar utanför ----
    titelrader, ftitel = _bryt(texter['titel'], FET, 34 * sk, txtbredd, 3)
    radhojd = int(44 * sk)
    hojd_text = len(titelrader) * radhojd + int(14 * sk)
    if texter['recensioner']:
        hojd_text += int(48 * sk)
    hojd_text += int(66 * sk)           # prisraden
    hojd_text += int(34 * sk)           # fotraden + luft

    # --- produktbilden ----------------------------------------------------
    p = _vitrensa(Image.open(produktbild).convert('RGBA'), vitrensa)
    topp = int(400 * sk)
    max_b = int(600 * sk)
    max_h = H - topp - int(50 * sk) - hojd_text - int(40 * sk)
    if max_h < int(120 * sk):
        raise Fel('Texten tar hela kortet — produktbilden får ingen plats. '
                  'Korta titeln eller höj kortet.')
    skala = min(max_b / p.width, max_h / p.height)
    p = p.resize((max(1, int(p.width * skala)), max(1, int(p.height * skala))))
    im.alpha_composite(p, (int((W - p.width) / 2), topp))
    y = topp + p.height + int(50 * sk)

    # --- titel ------------------------------------------------------------
    for rad in titelrader:
        d.text((marg, y), rad, font=ftitel, fill=BLACK)
        y += radhojd
    y += int(14 * sk)

    # --- stjärnor + recensioner (utelämnas helt när produkten saknar dem) --
    if texter['recensioner']:
        fs = _typsnitt(STJARNA, 24 * sk)
        d.text((marg, y), texter['stjarnor'], font=fs, fill=GRON)
        x = marg + fs.getlength(texter['stjarnor']) + 12 * sk
        fr = _passa(texter['recensioner'], NORMAL, 22 * sk, W - marg - x)
        d.text((x, y + 2 * sk), texter['recensioner'], font=fr, fill=GRA_TEXT)
        y += int(48 * sk)

    # --- pris: jämförpris överstruket, priset, rea-brickan ----------------
    x = marg
    if texter['jamforpris']:
        fj = _typsnitt(NORMAL, 26 * sk)
        d.text((x, y + 8 * sk), texter['jamforpris'], font=fj, fill=GRA)
        wj = fj.getlength(texter['jamforpris'])
        ym = y + 8 * sk + fj.getmetrics()[0] * 0.5
        d.line([(x, ym), (x + wj, ym)], fill=GRA, width=max(2, int(2 * sk)))
        x += wj + 18 * sk
    fp = _typsnitt(FET, 38 * sk)
    d.text((x, y), texter['pris'], font=fp, fill=BLACK)
    x += fp.getlength(texter['pris']) + 18 * sk
    if texter['rea']:
        fb = _typsnitt(FET, 18 * sk)
        bredd_bricka = fb.getlength(texter['rea']) + 20 * sk
        if x + bredd_bricka <= W - marg:
            d.rounded_rectangle([x, y + 8 * sk, x + bredd_bricka, y + 8 * sk + 30 * sk],
                                radius=int(4 * sk), fill=BLACK)
            d.text((x + 10 * sk, y + 12 * sk), texter['rea'], font=fb, fill=VIT)
    y += int(66 * sk)

    # --- fotraden ---------------------------------------------------------
    ff = _passa(texter['fotrad'], NORMAL, 19 * sk, txtbredd)
    d.text((marg, y), texter['fotrad'], font=ff, fill=GRA_MJUK)

    im.save(ut)
    return {'bredd': W, 'hojd': H, 'ut': ut}


# --------------------------------------------------------------------------
def main(argv=None):
    ap = argparse.ArgumentParser(description='Slutkort (endcard) per OPS-marknad.')
    ap.add_argument('--produkt', required=True, help='factory/produkter/<id>.yaml')
    ap.add_argument('--butik', required=True, help='factory/butiker/<id>.yaml')
    ap.add_argument('--marknad', required=True, help='SE, NO, US, DK … (factory/opsmarknader.mjs)')
    ap.add_argument('--bredd', type=int, default=720, help='720 eller 1080 (standard 720)')
    ap.add_argument('--hojd', type=int, default=None, help='standard bredd × 16/9')
    ap.add_argument('--produktbild', help='PNG med produkten, frilagd')
    ap.add_argument('--ut', help='PNG att skriva')
    ap.add_argument('--variant', default=None, help='referensvariantens namn, t.ex. "6,5 × 3 m"')
    ap.add_argument('--titel', default=None, help='överstyr titeln')
    ap.add_argument('--garanti', default=None, help='överstyr badgen')
    ap.add_argument('--oversattning', default=None, help='egen oversattning-<locale>.json')
    ap.add_argument('--vitrensa', type=int, default=250,
                    help='snäpp produktbildens nästan-vita bakgrund till kortets vita (0 = av)')
    ap.add_argument('--rot', default=ROT, help='repo-roten (standard: filens repo)')
    ap.add_argument('--json-text', action='store_true', help='skriv bara raderna som JSON')
    a = ap.parse_args(argv)

    try:
        konfig = las_konfig(a.produkt, a.butik, a.marknad, a.rot)
        texter, kallor = bygg_texter(konfig, a.marknad, variant=a.variant, titel=a.titel,
                                     garanti=a.garanti, rot=a.rot, oversattning=a.oversattning)
        if a.json_text:
            print(json.dumps({'texter': texter, 'kallor': kallor}, ensure_ascii=False, indent=1))
            return 0
        if not a.produktbild or not a.ut:
            raise Fel('--produktbild och --ut krävs (eller --json-text).')
        if not os.path.exists(a.produktbild):
            raise Fel(f'Produktbilden finns inte: {a.produktbild}')
        res = rita_slutkort(texter, a.produktbild, a.ut, a.bredd, a.hojd, a.vitrensa)
    except Fel as e:
        print(str(e), file=sys.stderr)
        return 4

    print(f'Slutkort {res["bredd"]}×{res["hojd"]} → {res["ut"]}')
    print(f'  marknad     {texter["marknad"]} · språk {texter["sprak"]} · valuta {texter["valuta"]}')
    for rad in ('badge', 'titel', 'recensioner', 'jamforpris', 'pris', 'rea', 'fotrad'):
        print(f'  {rad:<11} {texter[rad] or "— (utelämnad)"}')
    print('  VALT:')
    for k, v in kallor.items():
        print(f'    {k:<17} {v}')
    print('  Ingen logga, inget butiksnamn, ingen domän — granska_brandord() passerad.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
