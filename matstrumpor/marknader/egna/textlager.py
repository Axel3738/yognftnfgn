#!/usr/bin/env python3
"""textlager.py <KOD> <video> — byter alla svenska texter i en av Matstrumpors egna röstvideor
mot marknadens (undertexter, inledningsruta, rubriker, knapp, etikett), i samma stil och på samma
plats, och renderar videon med ORIGINALLJUDET. Rösten byts efteråt (dubba.mjs).

  python3 matstrumpor/marknader/egna/textlager.py DE haikuh3 [--ut=fil.mp4]

Läser: kalla/<video>.mp4 (hamta.mjs), <video>.boxar.json (pipeline/textboxar.py på källan),
<video>.manus.json (svenska segment med tider), <KOD>/<video>.json (granskad lokalisering).
Skriver: ut/<KOD>_<video>.text.mp4 + plan-JSON bredvid + QA-bilder (textbyte.py).

Undertexterna följer segmenten i manuset: varje segments text delas i korta bitar som visas i
tur och ordning inom segmentets tid (ElevenLabs manuella dubbning lägger talet i samma fönster).
En ny ruta ritas minst lika stor som de svenska rutorna den ska täcka; svenska rutor suddas
dessutom medan de syns, så att inget svenskt ord blir kvar i en lucka.
"""
import json, os, re, subprocess, sys

HAR = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HAR, '../../..'))
FONT = os.path.join(REPO, 'pipeline/fonts/Poppins-SemiBold.ttf')
VIT, SVART, MORK, ORANGE = [255, 255, 255, 255], [0, 0, 0], [22, 22, 22, 215], [246, 132, 38, 255]

# Mätt i källorna 2026-09-29 (textboxar.py + titt på bilder). Rutor i px vid 720×1280.
KONF = {
    # slutkort: loggan "MATSTRUMPOR.SE" zoomar in på slät beige bakgrund (RGB 248,237,204, brus < 1)
    # från ruta 1505 resp. 1379 och står kvar till slutet; största utbredning x 204–515, y 538–731.
    # Uttoningen från sista klippet är klar först i ruta 1504 resp. 1378 (mätt: 1503 är ännu mörkare).
    # Från den rutan kopieras bakgrunden ovanför (y 300–524, alltid tom) över loggans yta — butikens
    # namn och adress står aldrig i en annons. Knappen (y 765–853) ligger utanför och byts som förut.
    'haikuh3': {'under': {'stil': 'mork', 'band': [800, 930], 'falt': [104, 816, 616, 918], 'bak': MORK, 'farg': [255, 255, 255]},
                'rubrik_band': [230, 340],
                'hook': {'ruta': [60, 292, 660, 466]},
                'knapp': {'band': [760, 860]},
                'slutkort': {'fran_s': 50.12, 'ruta': [188, 524, 532, 748], 'kalla_y': 300}},
    'haikuh2': {'under': {'stil': 'mork', 'band': [800, 930], 'falt': [104, 816, 616, 918], 'bak': MORK, 'farg': [255, 255, 255]},
                'rubrik_band': [200, 340],
                'hook': {'ruta': [104, 220, 620, 386]},  # svenska remsorna x 110–609, y 224–380 (mätt 1,0 s)
                'knapp': {'band': [760, 860]},
                'slutkort': {'fran_s': 45.92, 'ruta': [188, 524, 532, 748], 'kalla_y': 300}},
    's001h1': {'under': {'stil': 'ljus', 'band': [840, 960], 'falt': [184, 860, 536, 952], 'bak': VIT, 'farg': SVART},
               'topp': {'sv_borjar': 'Ser ut som sushi', 'ruta': [84, 198, 637, 314]},
               'etikett': {'sv_borjar': 'Sushistrumpor', 'ruta': [151, 854, 569, 937]}},
}


def langd(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True)
    return float(r.stdout.strip())


def bitar(text, max_tecken=24):
    """Delar en mening i korta bitar på ordgräns (som originalets 2–4 ord)."""
    ut, rad = [], ''
    for o in text.split():
        prov = (rad + ' ' + o).strip()
        if len(prov) <= max_tecken or not rad: rad = prov
        else: ut.append(rad); rad = o
    if rad: ut.append(rad)
    return ut


def union(rutor, marg=4):
    return [min(r[0] for r in rutor) - marg, min(r[1] for r in rutor) - marg, max(r[2] for r in rutor) + marg, max(r[3] for r in rutor) + marg]


def overlappar(s, a, b):
    return s['a'] < b and s['b'] > a


def main():
    kod, video = sys.argv[1].upper(), sys.argv[2]
    flag = dict(x[2:].split('=', 1) for x in sys.argv[3:] if x.startswith('--') and '=' in x)
    k = KONF[video]
    kalla = os.path.join(HAR, 'kalla', f'{video}.mp4')
    boxar = json.load(open(os.path.join(HAR, f'{video}.boxar.json')))['segment']
    manus = [s for s in json.load(open(os.path.join(HAR, f'{video}.manus.json'))) if not s.get('stryk')]
    lok = json.load(open(os.path.join(HAR, kod, f'{video}.json')))
    seg, texter = lok['segment'], lok.get('texter', {})
    assert len(seg) == len(manus), f'{kod} {video}: {len(seg)} segment mot {len(manus)} i manuset'
    slut = langd(kalla)
    ut = flag.get('ut', os.path.join(HAR, 'ut', f'{kod}_{video}.text.mp4'))
    os.makedirs(os.path.dirname(ut), exist_ok=True)

    u = k['under']
    gamla_under = [s for s in boxar if s['stil'] == u['stil'] and u['band'][0] <= (s['ruta'][1] + s['ruta'][3]) / 2 <= u['band'][1]]
    texts, sudda = [], []

    # 1) undertexterna, segment för segment. Detektorn missar enstaka bilder, så varje svensk
    #    mening täcks som helhet: alla svenska rutor i meningens fönster slås ihop (U), den nya
    #    rutan ritas minst så stor som U, och U suddas hela fönstret — då syns inget svenskt ord
    #    ens i en bild där detektorn tappade rutan (mätt DE haikuh3 10 s och 33 s: "Glöm …åkiga").
    alla_manus = json.load(open(os.path.join(HAR, f'{video}.manus.json')))
    special = {}
    for nyckel in ('topp', 'etikett'):
        if nyckel in k:
            for i, m in enumerate(manus):
                if m['sv'].startswith(k[nyckel]['sv_borjar']): special[i] = nyckel
    fonster_brukade = set()
    def fonster(m):
        return (max(0, m['a'] - 0.15), m['b'] + 0.35)
    # Meningar som står i övre rutan eller på etiketten har ingen svensk undertext i fältet — att sudda
    # fältet då gav en grå rektangel mitt i bilden (mätt NO s001h1 38,9–40,3 s). Svenska rutor som ändå
    # syns där fångas av suddningen per ruta längre ner.
    egna_rutor = [k[n]['sv_borjar'] for n in ('topp', 'etikett') if n in k]
    for m in alla_manus:
        if any(m['sv'].startswith(s) for s in egna_rutor): continue
        w0, w1 = fonster(m)
        over = [g for g in gamla_under if overlappar(g, w0, w1)]
        for g in over: fonster_brukade.add(id(g))
        # Fältet är fast: en mörk svensk ruta över mörk bakgrund syns inte för detektorn (mätt DE
        # haikuh3 10 s), så storleken tas aldrig ur detektionen — den nya rutan täcker hela fältet.
        U = u['falt']
        m['_U'] = U
        sudda.append({'a': min([w0] + [g['a'] - 0.1 for g in over]), 'b': max([w1] + [g['b'] + 0.1 for g in over]), 'ruta': U})
    manus_utan = [m for m in alla_manus if not m.get('stryk')]
    strukna = [m for m in alla_manus if m.get('stryk')]
    for i, s in enumerate(seg):
        a, b = s['a'], s['b']
        U = manus_utan[i].get('_U')
        nasta = seg[i + 1]['a'] if i + 1 < len(seg) else slut
        b_ut = min(nasta, b + 0.6) if nasta - b < 0.9 else b + 0.3
        # Butikens adress (struken mening, "Matstrumpor.se") står kvar som svensk ruta i fältet efter
        # sista meningen. Suddad syntes den som en grå ruta (mätt DE haikuh3 48,9–50,1 s), så den sista
        # biten får stå kvar över den — till och med tills slutkortet är helt beige, aldrig in över det.
        for st in strukna:
            if b <= st['a'] < nasta:
                b_ut = max(b_ut, min(st['b'] + 0.35, k.get('slutkort', {}).get('fran_s', slut), nasta))
        if special.get(i) == 'topp':
            r = k['topp']['ruta']
            texts.append({'a': a - 0.1, 'b': b_ut, 'text': s['text'], 'mitt': [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], 'min': [r[2] - r[0] + 6, r[3] - r[1] + 6],
                          'max_bredd': 660, 'font_px': 44, 'farg': u['farg'], 'bakgrund': u['bak'], 'radie': 4, 'pad': [18, 8]})
            continue
        if special.get(i) == 'etikett':
            continue  # etiketten ritas nedan ur texter.etikett
        delar = bitar(s['text'])
        vikt = [len(d) + 3 for d in delar]
        t = a
        if U: mitt, minsta = [(U[0] + U[2]) / 2, (U[1] + U[3]) / 2], [U[2] - U[0], U[3] - U[1]]
        else: mitt, minsta = [360, (u['band'][0] + u['band'][1]) / 2], [0, 60]
        for j, d in enumerate(delar):
            t1 = b_ut if j == len(delar) - 1 else a + (b - a) * sum(vikt[:j + 1]) / sum(vikt)
            texts.append({'a': round(t, 2), 'b': round(t1, 2), 'text': d, 'mitt': mitt, 'min': minsta, 'max_bredd': 640,
                          'font_px': 32, 'farg': u['farg'], 'bakgrund': u['bak'], 'radie': 8, 'pad': [16, 8]})
            t = t1
    for g in gamla_under:  # svenska rutor utanför varje meningsfönster suddas där de syns
        if id(g) not in fonster_brukade:
            sudda.append({'a': max(0, g['a'] - 0.2), 'b': g['b'] + 0.2, 'ruta': g['ruta']})

    # 2) rubrikerna (haiku): en per avsnitt, avsnitten börjar där manuset säger "Ett:", "Två:", "Tre:".
    #    Kolonet krävs: haikuh2:s inledning "Tre anledningar att inte köpa …" tog annars första platsen,
    #    och varje rubrik hamnade ett avsnitt för sent — den svenska "TRE:" stod kvar (mätt NO 2026-09-29).
    if 'rubrik_band' in k and texter.get('rubriker'):
        y0, y1 = k['rubrik_band']
        gamla = [s for s in boxar if s['stil'] == 'ljus' and y0 <= (s['ruta'][1] + s['ruta'][3]) / 2 <= y1]
        starter = [m['a'] for m in manus if re.match(r'^(Ett|Två|Tre)\s*:', m['sv'])]
        assert len(starter) == len(texter['rubriker']), f'{video}: {len(starter)} avsnittsstarter mot {len(texter["rubriker"])} rubriker'
        gransar = starter + [slut]
        tackta = set()
        for n, rubrik in enumerate(texter['rubriker']):
            ga = [g for g in gamla if gransar[n] - 0.8 <= (g['a'] + g['b']) / 2 < gransar[n + 1] - 0.1]
            if not ga: continue
            r = union([g['ruta'] for g in ga])
            a_ = min(g['a'] for g in ga); b_ = max(g['b'] for g in ga)
            texts.append({'a': a_, 'b': b_, 'text': rubrik, 'mitt': [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], 'min': [r[2] - r[0], r[3] - r[1]],
                          'max_bredd': 660, 'font_px': 26, 'farg': SVART, 'bakgrund': VIT, 'radie': 10, 'pad': [14, 6]})
            for g in ga: sudda.append({'a': max(0, g['a'] - 0.1), 'b': g['b'] + 0.1, 'ruta': g['ruta']}); tackta.add(id(g))
        # en svensk rubrikruta som ingen ny rubrik fick täcka suddas ändå — aldrig ett svenskt ord kvar
        for g in gamla:
            if id(g) not in tackta: sudda.append({'a': max(0, g['a'] - 0.1), 'b': g['b'] + 0.1, 'ruta': g['ruta']})

    # 3) inledningsrutan (haiku): från start till första rubriken
    if 'hook' in k and texter.get('hook'):
        r = k['hook']['ruta']
        forsta = min([t['a'] for t in texts if t['font_px'] == 26] or [manus[1]['b']])
        # Originalets inledning är stor fet text — den bär annonsens första sekund. Samma här: fet
        # Poppins, största storlek (44 → 28 px) där texten ryms i rutan på högst tre rader.
        from PIL import ImageFont
        sys.path.insert(0, os.path.join(REPO, 'pipeline'))
        from textbyte import radbryt  # samma radbrytning som renderaren
        fet = os.path.join(REPO, 'pipeline/fonts/Poppins-Bold.ttf')
        px = 28
        for prov in range(44, 27, -2):
            f = ImageFont.truetype(fet, prov)
            rader = [x for stycke in texter['hook'].split('\n') for x in radbryt(stycke, f, (r[2] - r[0]) - 36)]
            asc, desc = f.getmetrics()
            if len(rader) <= 3 and (asc + desc) * len(rader) + 20 <= r[3] - r[1]: px = prov; break
        texts.append({'a': 0, 'b': forsta, 'text': texter['hook'], 'mitt': [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], 'min': [r[2] - r[0], r[3] - r[1]],
                      'max_bredd': r[2] - r[0], 'font_px': px, 'font': fet, 'farg': SVART, 'bakgrund': VIT, 'radie': 12, 'pad': [18, 10], 'radavstand': 1.0})

    # 4) knappen på slutbilden (haiku): den orange rutan i knappbandet
    if 'knapp' in k and not texter.get('knapp'):
        syster = os.path.join(HAR, kod, 'haikuh2.json')
        if os.path.exists(syster): texter['knapp'] = json.load(open(syster)).get('texter', {}).get('knapp')
    if 'knapp' in k and texter.get('knapp'):
        y0, y1 = k['knapp']['band']
        ga = [s for s in boxar if s['stil'] == 'orange' and y0 <= (s['ruta'][1] + s['ruta'][3]) / 2 <= y1 and s['a'] > slut - 8]
        if ga:
            r = union([g['ruta'] for g in ga], marg=2)
            texts.append({'a': min(g['a'] for g in ga) - 0.2, 'b': slut + 1, 'text': texter['knapp'], 'mitt': [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2],
                          'min': [r[2] - r[0], r[3] - r[1]], 'max_bredd': 560, 'font_px': 34, 'farg': [255, 255, 255], 'bakgrund': ORANGE, 'radie': 40, 'pad': [22, 8]})

    # 5) slutetiketten (s001h1)
    if 'etikett' in k and texter.get('etikett'):
        r = k['etikett']['ruta']
        i = next(i for i, n in special.items() if n == 'etikett')
        texts.append({'a': seg[i]['a'] - 0.2, 'b': slut + 1, 'text': texter['etikett'], 'mitt': [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2],
                      'min': [r[2] - r[0] + 6, r[3] - r[1] + 6], 'max_bredd': 640, 'font_px': 44, 'farg': SVART, 'bakgrund': VIT, 'radie': 4, 'pad': [18, 8]})

    # 6) loggan på slutkortet (haiku): tom bakgrund ur samma bild kopieras över den
    kopiera = []
    if 'slutkort' in k:
        sk = k['slutkort']; r = sk['ruta']; w, h = r[2] - r[0], r[3] - r[1]
        kopiera.append({'a': sk['fran_s'], 'b': slut + 1, 'fran': [r[0], sk['kalla_y'], w, h], 'till': [r[0], r[1]]})

    plan = {'video': kalla, 'ut': ut, 'font': FONT, 'sudda': sudda, 'kopiera': kopiera, 'texter': texts}
    json.dump(plan, open(ut + '.plan.json', 'w'), ensure_ascii=False, indent=1)
    r = subprocess.run(['python3', os.path.join(REPO, 'pipeline/textbyte.py'), ut + '.plan.json'], capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr[-800:] or r.stdout[-800:])
    # vilken text lagret byggdes på — dubba.mjs vägrar lägga rösten på ett lager från en äldre text
    import hashlib
    lok_sha = hashlib.sha256(open(os.path.join(HAR, kod, f'{video}.json'), 'rb').read()).hexdigest()
    json.dump({'lok_sha': lok_sha}, open(ut + '.sha.json', 'w'))
    print(f'{kod} {video}: {len(texts)} texter, {len(sudda)} suddningar → {ut}')


if __name__ == '__main__':
    main()
