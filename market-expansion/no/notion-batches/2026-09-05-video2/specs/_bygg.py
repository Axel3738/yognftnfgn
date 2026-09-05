# Bygger spec-filer per video (pipeline/no-captions-precis.py) ur pillmätningen
# (pill-matt.json), de uppmätta grafikrutorna (union över hela tidsintervallet,
# 10 fps, 2026-09-05) och de norska texterna i grafik-NO.json (sonnet-subagent).
import json, os
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pill = json.load(open(f'{B}/pill-matt.json'))
pill['batmotortrekk_AU_1_H1'].update({'y0': 961, 'y1': 1022, 'x0': 178, 'x1': 543})   # 5:e percentilen fångade REGN-boxarna; medianen är pillen
G = json.load(open(f'{B}/grafik-NO.json')) if os.path.exists(f'{B}/grafik-NO.json') else {}
GUL = [253, 181, 7]; ROD = [153, 27, 27]; SVART = [17, 17, 18]; VIT = [255, 255, 255]; ORANGE = [242, 106, 27]; MORK = [20, 20, 20]; GRA = [120, 120, 120]


def g(key, f, default):
    return G.get(key, {}).get(f, default)


def pris_delar(s):
    gam, ny = [p.strip() for p in s.replace('(struket)', '|').split('|')]
    return gam, ny


def slutkort_kamera(key, fran, till):
    """Slutkortet driver ~14 px uppåt under visningen — rutorna täcker unionen."""
    titel = g(key, 'slutkort_titel', 'ÖVERVAKNINGSKAMERA TRÅDLÖS - DUBBELLINS PTZ MED AI-SPÅRNING')
    d = titel.replace(' – ', ' - ').split(' - '); rader = [d[0] + ' -', ' '.join(d[1:])] if len(d) > 1 else [titel]
    gam, ny = pris_delar(g(key, 'slutkort_pris', '1,000 kr (struket) 799 kr'))
    return [
        {'box': [124, 334, 596, 420], 'fran': fran, 'till': till, 'fyll': None},                                   # röd remsa "inom Sverige": suddas på plats
        {'box': [160, 828, 560, 892], 'fran': fran, 'till': till, 'fyll': VIT, 'rader': rader, 'stil': {'storlek': 15, 'fet': True, 'farg': MORK, 'radavstand': 1.15}},
        {'box': [160, 892, 560, 942], 'fran': fran, 'till': till, 'fyll': VIT, 'text': '★★★★★  ' + g(key, 'slutkort_recensioner', '10 recensioner'), 'stil': {'storlek': 11, 'fet': False, 'farg': [60, 60, 60], 'dy': -11}},
        {'box': [160, 892, 560, 942], 'fran': fran, 'till': till, 'ingen_sudd': True, 'text': gam, 'stil': {'storlek': 11, 'fet': False, 'farg': GRA, 'stryk': True, 'justering': 'hoger', 'indrag': 205, 'dy': 8}},
        {'box': [160, 892, 560, 942], 'fran': fran, 'till': till, 'ingen_sudd': True, 'text': ny, 'stil': {'storlek': 11, 'fet': True, 'farg': MORK, 'justering': 'vanster', 'indrag': 205, 'dy': 8}},
        {'box': [117, 958, 602, 1114], 'fran': fran, 'till': till, 'fyll': ROD, 'text': g(key, 'slutkort_knapp', 'Handla nu'), 'stil': {'storlek': 48, 'fet': True, 'farg': VIT}},
    ]


def slutkort_ibc(key, fran, till):
    titel = g(key, 'slutkort_titel', 'IBC-TANKÖVERDRAG 1000 L - STOPPAR ALGER & UV')
    gam, ny = pris_delar(g(key, 'slutkort_pris', '636 kr (struket) 489 kr'))
    return [
        {'box': [150, 801, 570, 828], 'fran': fran, 'till': till, 'fyll': VIT, 'text': titel, 'stil': {'storlek': 13, 'fet': True, 'farg': MORK}},
        {'box': [150, 834, 570, 876], 'fran': fran, 'till': till, 'fyll': VIT, 'text': '★★★★★  ' + g(key, 'slutkort_recensioner', '10 recensioner'), 'stil': {'storlek': 10, 'fet': False, 'farg': [60, 60, 60], 'dy': -9}},
        {'box': [150, 834, 570, 876], 'fran': fran, 'till': till, 'ingen_sudd': True, 'text': gam, 'stil': {'storlek': 11, 'fet': False, 'farg': GRA, 'stryk': True, 'justering': 'hoger', 'indrag': 212, 'dy': 8}},
        {'box': [150, 834, 570, 876], 'fran': fran, 'till': till, 'ingen_sudd': True, 'text': ny, 'stil': {'storlek': 11, 'fet': True, 'farg': MORK, 'justering': 'vanster', 'indrag': 212, 'dy': 8}},
        {'box': [172, 914, 546, 1032], 'fran': fran, 'till': till, 'fyll': ROD, 'text': g(key, 'slutkort_knapp', 'Handla nu'), 'stil': {'storlek': 46, 'fet': True, 'farg': VIT}},
    ]


S = {}
for key, p in pill.items():
    S[key] = {'caption': {'band': [p['y0'], p['y1']], 'x': [p['x0'], p['x1']], 'storlek': 30, 'max_tecken': 30}, 'boxar': []}

k = 'overvakingskamera_RI_1_H1'; r = S[k]['boxar']
r.append({'box': [130, 492, 590, 836], 'fran': 0.0, 'till': 1.12, 'fyll': VIT, 'rader': g(k, 'rubrik_svart_2_rader', ['Vad är', 'dyrast']), 'stil': {'storlek': 108, 'fet': True, 'farg': MORK, 'radavstand': 1.05}})
r.append({'box': [384, 444, 622, 554], 'fran': 1.6, 'till': 3.85, 'fyll': GUL, 'text': g(k, 'badge_gul', '799 KR'), 'stil': {'storlek': 46, 'fet': True, 'farg': MORK}})
r.append({'box': [192, 524, 540, 688], 'fran': 16.8, 'till': 19.4, 'fyll': GUL, 'text': g(k, 'badge_gul', '799 KR'), 'stil': {'storlek': 64, 'fet': True, 'farg': MORK}})
r.append({'box': [165, 690, 642, 845], 'fran': 16.3, 'till': 19.6, 'fyll': SVART, 'text': g(k, 'etikett_svart', '30 dagars garanti.'), 'stil': {'storlek': 36, 'fet': True, 'farg': VIT, 'dy': -20}})
r.extend(slutkort_kamera(k, 20.95, 23.2))

k = 'overvakingskamera_SP_4_H1'; r = S[k]['boxar']
r.append({'box': [212, 630, 562, 782], 'fran': 17.2, 'till': 19.7, 'fyll': GUL, 'text': g(k, 'badge_gul', '799 KR'), 'stil': {'storlek': 62, 'fet': True, 'farg': MORK}})
r.extend(slutkort_kamera(k, 19.75, 22.1))

k = 'overvakingskamera_AU_1_H1'; r = S[k]['boxar']
r.append({'box': [40, 984, 690, 1140], 'fran': 16.25, 'till': 18.35, 'fyll': None, 'granne': 'over', 'text': g(k, 'orange_stor_text', 'Handla nu.'), 'stil': {'storlek': 118, 'fet': True, 'kursiv': True, 'farg': [236, 98, 17]}})
r.append({'box': [150, 1096, 560, 1216], 'fran': 18.3, 'till': 20.1, 'fyll': VIT, 'text': g(k, 'vit_pill_botten', 'Handla nu.'), 'stil': {'storlek': 56, 'fet': True, 'farg': MORK}})

k = 'overvakingskamera_SP_6_H1'; r = S[k]['boxar']
for n, (a, e) in enumerate([(0.0, 2.7), (5.95, 9.02), (9.02, 11.8), (11.8, 13.8), (13.8, 16.0)], 1):
    r.append({'box': [110, 548, 610, 660], 'fran': a, 'till': e, 'fyll': None, 'granne': 'over', 'text': g(k, f'etikett_{n}', ['3 grannar', 'Direkt notis', 'AI-spårning', '30 dagars garanti', 'Handla nu'][n - 1]), 'stil': {'storlek': 46, 'fet': True, 'farg': VIT, 'kant': [30, 30, 30], 'kantpx': 3}})

k = 'ibc-tanktrekk_PD_3_H1'; r = S[k]['boxar']
r.append({'box': [95, 308, 625, 512], 'fran': 0.15, 'till': 2.85, 'fyll': None, 'granne': 'under', 'rader': g(k, 'rubrik_orange_2_rader', ['210D', 'Oxford-tyg']), 'stil': {'storlek': 92, 'fet': True, 'farg': ORANGE, 'kant': VIT, 'kantpx': 4, 'radavstand': 1.0}})
r.extend(slutkort_ibc(k, 21.75, 24.6))
k = 'ibc-tanktrekk_GT_3_H1'; S[k]['boxar'].extend(slutkort_ibc(k, 15.15, 18.0))

k = 'batmotortrekk_AU_1_H1'; r = S[k]['boxar']
ch = g(k, 'checklista', ['REGN', 'SNÖ', 'UV'])
r.append({'box': [332, 644, 576, 732], 'fran': 8.85, 'till': 10.8, 'fyll': VIT, 'text': ch[1], 'stil': {'storlek': 52, 'fet': True, 'farg': MORK, 'justering': 'vanster', 'indrag': 19}})
tit = g(k, 'mobil_titel', 'BÅTMOTORSKYDD 420D – HELTÄCKANDE FÖR UTOMBORDARE'); d = tit.replace(' - ', ' – ').split(' – '); trader = [d[0] + ' –', ' '.join(d[1:])] if len(d) > 1 else [tit]
r.append({'box': [198, 404, 562, 480], 'fran': 11.25, 'till': 15.4, 'fyll': VIT, 'rader': trader, 'stil': {'storlek': 21, 'fet': True, 'farg': MORK, 'radavstand': 1.2}})
r.append({'box': [198, 740, 522, 812], 'fran': 11.25, 'till': 15.4, 'fyll': [229, 30, 30], 'text': g(k, 'mobil_knapp_rod', '30 DAGARS ÖPPET KÖP'), 'stil': {'storlek': 27, 'fet': True, 'farg': VIT}})
r.append({'box': [228, 816, 502, 868], 'fran': 11.25, 'till': 15.4, 'fyll': VIT, 'text': g(k, 'mobil_pris', '579 kr'), 'stil': {'storlek': 40, 'fet': True, 'farg': [229, 30, 30]}})
r.append({'box': [228, 868, 502, 896], 'fran': 11.25, 'till': 15.4, 'fyll': VIT, 'text': g(k, 'mobil_pris_struket', '965 kr'), 'stil': {'storlek': 21, 'fet': False, 'farg': GRA, 'stryk': True}})

os.makedirs(f'{B}/specs', exist_ok=True)
for key, s in S.items():
    json.dump(s, open(f'{B}/specs/{key}.json', 'w'), ensure_ascii=False, indent=1)
print('specs:', len(S), '| grafik-NO:', 'ja' if G else 'NEJ (platshållare = svenska)')
