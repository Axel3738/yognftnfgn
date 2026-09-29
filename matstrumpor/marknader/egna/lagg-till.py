#!/usr/bin/env python3
"""lagg-till.py <video> <nnn> <format> <KOD> [<KOD> …] — lägger en egen video som annons i marknadens
annonser/<KOD>.json (idempotent). Copyn är marknadens befintliga (samma som 001), namnet följer
docs/naming-convention.md. WW bär de engelska filerna (US). Laddas upp med bygg.mjs --skarpt (PAUSED)."""
import json, os, sys
HAR = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HAR, '../annonser')
video, nnn, fmt, koder = sys.argv[1], sys.argv[2], sys.argv[3], [k.upper() for k in sys.argv[4:]]
kallor = json.load(open(os.path.join(HAR, 'kallor.json')))['videor']
for kod in koder:
    p = os.path.join(A, f'{kod}.json'); d = json.load(open(p))
    fil_kod = 'US' if kod == 'WW' else kod
    namn = f'MATSTRUMP_{kod}_sushi_gift_{fmt}_{nnn}_v1'
    if any(a['namn'] == namn for a in d['annonser']): print(f'{kod}: {namn} finns'); continue
    if not os.path.exists(os.path.join(A, 'klar', f'{fil_kod}_{video}.mp4')): print(f'{kod}: klar/{fil_kod}_{video}.mp4 saknas — hoppar'); continue
    forsta = d['annonser'][0]
    d['annonser'].append({'namn': namn, 'kalla': f"{kallor[video]['annons']} (video {kallor[video]['video_id']}) — egen video, egen text/röst (matstrumpor/marknader/egna/)",
                          'video': f'klar/{fil_kod}_{video}.mp4', 'title': forsta['title'], 'message': forsta['message'], 'link_description': forsta.get('link_description')})
    json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1); open(p, 'a').write('\n')
    print(f'{kod}: {namn} → klar/{fil_kod}_{video}.mp4')
