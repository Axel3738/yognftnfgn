# Bygger spec-filer per video (pipeline/no-captions-precis.py) för IBC-batchen 2026-09-09.
# Mått mätta ur källframes (10 fps) 2026-09-09: captionpill (min/max-x, 2/98-percentil y),
# topp-piller (vit pill med pris, y 583–697), orange rubrik (PD_4: över tanken, GT_4: på vitt kort)
# och slutkortet (samma mall som 2026-09-05-video2 → slutkort_ibc-rutorna återanvänds).
import json, os
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = json.load(open(f'{B}/oversatt-output-video.json'))['grafik']
CAP = {  # captionpill per video (mätt)
 'CS_4_H1': [924, 1011, 33, 687], 'GT_4_H1': [872, 937, 159, 570], 'PD_4_H1': [835, 901, 161, 575],
 'PD_4_H2': [835, 901, 163, 575], 'PD_4_H3': [1052, 1118, 122, 599], 'SP_3_H1': [922, 1023, 82, 638]}
ROD = [153, 27, 27]; MORK = [20, 20, 20]; VIT = [255, 255, 255]; GRA = [120, 120, 120]; ORANGE = [242, 106, 27]


def pris_delar(s):
    gam, ny = [p.strip() for p in s.replace('(struket)', '|').split('|')]; return gam, ny


def slutkort(fran, till):
    gam, ny = pris_delar(G['slutkort_pris'])
    return [
        {'box': [150, 801, 570, 828], 'fran': fran, 'till': till, 'fyll': VIT, 'text': G['slutkort_titel'], 'stil': {'storlek': 13, 'fet': True, 'farg': MORK}},
        {'box': [150, 834, 570, 876], 'fran': fran, 'till': till, 'fyll': VIT, 'text': '★★★★★  ' + G['slutkort_recensioner'], 'stil': {'storlek': 10, 'fet': False, 'farg': [60, 60, 60], 'dy': -9}},
        {'box': [150, 834, 570, 876], 'fran': fran, 'till': till, 'ingen_sudd': True, 'text': gam, 'stil': {'storlek': 11, 'fet': False, 'farg': GRA, 'stryk': True, 'justering': 'hoger', 'indrag': 212, 'dy': 8}},
        {'box': [150, 834, 570, 876], 'fran': fran, 'till': till, 'ingen_sudd': True, 'text': ny, 'stil': {'storlek': 11, 'fet': True, 'farg': MORK, 'justering': 'vanster', 'indrag': 212, 'dy': 8}},
        {'box': [172, 914, 546, 1032], 'fran': fran, 'till': till, 'fyll': ROD, 'text': G['slutkort_knapp'], 'stil': {'storlek': 46, 'fet': True, 'farg': VIT}},
    ]


def pill(box, fran, till, text, storlek=40):
    x0, y0, x1, y1 = box
    return {'box': [x0 + 3, y0 + 3, x1 - 3, y1 - 3], 'fran': fran, 'till': till, 'fyll': VIT, 'text': text, 'stil': {'storlek': storlek, 'fet': True, 'farg': MORK}}


S = {}
for k, (y0, y1, x0, x1) in CAP.items():
    S[k] = {'caption': {'band': [y0, y1], 'x': [x0, x1], 'storlek': 30, 'max_tecken': 30}, 'boxar': []}
r = S['CS_4_H1']['boxar']
r.append(pill([99, 583, 621, 696], 0.0, 7.45, G['topp_pill_spara']))
r.append(pill([199, 584, 521, 697], 16.45, 20.1, G['topp_pill_idag']))
S['PD_4_H3']['boxar'].append(pill([199, 584, 521, 697], 8.55, 9.85, G['topp_pill_idag']))
for k in ('PD_4_H1', 'PD_4_H2'):
    S[k]['boxar'].append({'box': [80, 560, 620, 720], 'fran': 5.45, 'till': 7.85, 'fyll': None, 'granne': 'under', 'rader': G['rubrik_orange_2_rader'], 'stil': {'storlek': 58, 'fet': True, 'kursiv': True, 'farg': ORANGE, 'kant': VIT, 'kantpx': 4, 'radavstand': 1.0}})
    S[k]['boxar'].extend(slutkort(13.25, 16.5))
S['GT_4_H1']['boxar'].append({'box': [140, 262, 580, 420], 'fran': 6.75, 'till': 8.55, 'fyll': VIT, 'rader': G['rubrik_orange_2_rader'], 'stil': {'storlek': 58, 'fet': True, 'kursiv': True, 'farg': ORANGE, 'kant': VIT, 'kantpx': 3, 'radavstand': 1.0}})
S['GT_4_H1']['boxar'].extend(slutkort(18.25, 21.6))
for k, s in S.items():
    json.dump(s, open(f'{B}/specs/ibc-tanktrekk_{k}.json', 'w'), ensure_ascii=False, indent=1)
print('specs:', len(S))
