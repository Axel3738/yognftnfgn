#!/usr/bin/env python3
"""no-drive-fran-meta.py — fyll en NO-produkts Drive-mapp ur den launchade Meta-kampanjen.

Används när en körning launchat i Magiborsten NO men Drive-leveransen inte blev
gjord (mappen saknades, sessionen dog, brevlådan var nere). Allt som behövs finns
i kampanjen: videorna (advideos), bildannonserna (adimages) och adcopyn
(object_story_spec). Inget renderas om, inga HeyGen-krediter.

  python3 pipeline/no-drive-fran-meta.py --par "Sysett=<drive-mapp-id>" [--par …] [--ut <mapp>] [--dry]

  --par  "<del av kampanjnamnet>=<Drive-mapp-id>"  (upprepa för flera produkter)
  --ut   arbetsmapp för nedladdningar (default: market-expansion/no/video-batches/fran-meta/)
  --dry  visa vad som skulle hämtas och laddas upp, gör inget

Idempotent: filer som redan ligger i Drive-mappen (samma namn) hoppas över.
Kräver META_ACCESS_TOKEN + DRIVE_UPLOAD_URL/DRIVE_UPLOAD_KEY (drive-push.mjs).
"""
import json, os, subprocess, sys, time, urllib.parse, urllib.request

HÄR = os.path.dirname(os.path.abspath(__file__))
ROT = os.path.dirname(HÄR)
KONTO = 'act_1050941584152547'
TOK = os.environ.get('META_ACCESS_TOKEN')
if not TOK: sys.exit('META_ACCESS_TOKEN saknas.')


def api(path, **params):
    params['access_token'] = TOK
    url = f'https://graph.facebook.com/v21.0/{path}?' + urllib.parse.urlencode(params)
    for försök in range(6):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                d = json.load(r)
            if 'error' in d: raise RuntimeError(d['error'].get('message'))
            return d
        except Exception as e:
            if försök == 5: raise
            vänta = 20 * (försök + 1)
            print(f'  · Meta svarade fel ({str(e)[:80]}), väntar {vänta}s', flush=True)
            time.sleep(vänta)


def alla(path, **params):
    ut, d = [], api(path, **params)
    ut += d['data']
    while d.get('paging', {}).get('next'):
        with urllib.request.urlopen(d['paging']['next'], timeout=120) as r: d = json.load(r)
        ut += d['data']
    return ut


def hämta(url, mål):
    if os.path.exists(mål) and os.path.getsize(mål) > 0: return
    tmp = mål + '.del'
    with urllib.request.urlopen(url, timeout=600) as r, open(tmp, 'wb') as f:
        while True:
            b = r.read(1 << 20)
            if not b: break
            f.write(b)
    os.replace(tmp, mål)


def i_drive(folder):
    r = subprocess.run([sys.executable, os.path.join(ROT, 'tools', 'drive-ls.py'), folder],
                       capture_output=True, text=True)
    namn = set()
    for rad in r.stdout.splitlines():
        delar = rad.split('\t')
        if len(delar) >= 3: namn.add(delar[2].strip())
    return namn


_VIDEOKÄLLOR = None
def videokälla(video_id):
    """/{video_id}?fields=source ger (#10) permission — men kontots advideos-kant
    lämnar ut source. Hämtas en gång för hela kontot (små sidor, annars 'reduce data')."""
    global _VIDEOKÄLLOR
    if _VIDEOKÄLLOR is None:
        _VIDEOKÄLLOR = {}
        for v in alla(f'{KONTO}/advideos', fields='id,source', limit=25):
            if v.get('source'): _VIDEOKÄLLOR[v['id']] = v['source']
        print(f'  · {len(_VIDEOKÄLLOR)} videokällor lästa ur kontot', flush=True)
    return _VIDEOKÄLLOR.get(video_id)


def koncept(adnamn):
    # Sysett_NO_CS_3 → CS ; Badeshorts_NO_GT_1_H2 → GT ; Sysett_NO_CS_2_1 → CS
    delar = adnamn.split('_')
    if 'NO' in delar:
        i = delar.index('NO')
        if i + 1 < len(delar): return delar[i + 1]
    return delar[1] if len(delar) > 1 else 'X'


def adcopy_text(spec, adnamn):
    vd = spec.get('video_data') or {}
    ld = spec.get('link_data') or {}
    d = vd or ld
    länk = (d.get('call_to_action') or {}).get('value', {}).get('link') or ld.get('link') or ''
    rader = [f'# Norsk adcopy — {adnamn}', '',
             'PRIMÄRTEXT:', d.get('message', ''), '',
             'RUBRIK:', d.get('title') or ld.get('name') or '', '',
             'BESKRIVNING:', d.get('link_description') or ld.get('description') or '', '',
             'LÄNK:', länk, '']
    return '\n'.join(rader)


def main():
    par, ut, dry = [], os.path.join(ROT, 'market-expansion', 'no', 'video-batches', 'fran-meta'), False
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        a = args[i]
        if a == '--par': par.append(args[i + 1]); i += 2
        elif a == '--ut': ut = args[i + 1]; i += 2
        elif a == '--dry': dry = True; i += 1
        else: sys.exit(__doc__)
    if not par: sys.exit(__doc__)

    for p in par:
        namn, folder = p.split('=', 1)
        print(f'\n=== {namn} → Drive {folder}', flush=True)
        f = 'name,creative{video_id,image_hash,object_story_spec}'
        filt = json.dumps([{'field': 'campaign.name', 'operator': 'CONTAIN', 'value': namn}])
        ads = alla(f'{KONTO}/ads', fields=f, filtering=filt, limit=100)
        if not ads: print('  ✗ inga annonser hittades'); continue
        slug = namn.lower().replace(' ', '').replace('&', '')
        mapp = os.path.join(ut, slug); os.makedirs(mapp, exist_ok=True)
        finns = i_drive(folder)
        att_ladda = []
        adcopy = {}
        for ad in ads:
            cr = ad.get('creative') or {}
            spec = cr.get('object_story_spec') or {}
            k = koncept(ad['name'])
            adcopy.setdefault(k, adcopy_text(spec, ad['name']))
            if cr.get('video_id'):
                fil = os.path.join(mapp, ad['name'] + '.mp4')
                if os.path.basename(fil) in finns: continue
                if dry: print('  video', ad['name']); continue
                src = videokälla(cr['video_id'])
                if not src: print('  ✗ ingen source för', ad['name']); continue
                hämta(src, fil); att_ladda.append(fil); print('  ↓', os.path.basename(fil), flush=True)
            elif cr.get('image_hash'):
                fil = os.path.join(mapp, ad['name'] + '.png')
                if os.path.basename(fil) in finns: continue
                if dry: print('  bild ', ad['name']); continue
                bilder = api(f'{KONTO}/adimages', hashes=json.dumps([cr['image_hash']]), fields='url').get('data', [])
                if not bilder or not bilder[0].get('url'): print('  ✗ ingen bild-url för', ad['name']); continue
                hämta(bilder[0]['url'], fil); att_ladda.append(fil); print('  ↓', os.path.basename(fil), flush=True)
        for k, text in sorted(adcopy.items()):
            fil = os.path.join(mapp, f'ADCOPY_NO_{k}.txt')
            if os.path.basename(fil) in finns: continue
            if dry: print('  adcopy', k); continue
            open(fil, 'w', encoding='utf-8').write(text); att_ladda.append(fil)
        if dry or not att_ladda:
            print(f'  {len(ads)} annonser, {len(att_ladda)} att ladda upp'); continue
        # ladda upp i omgångar om 4 så en fallerad fil inte drar med sig resten
        fel = 0
        for j in range(0, len(att_ladda), 4):
            r = subprocess.run(['node', os.path.join(HÄR, 'drive-push.mjs'), f'--folder={folder}', *att_ladda[j:j + 4]],
                               capture_output=True, text=True)
            print(r.stdout.strip(), flush=True)
            if r.returncode != 0: fel += 1; print(r.stderr.strip()[:400], file=sys.stderr, flush=True)
        print(f'  ✓ {namn}: {len(att_ladda)} filer skickade' + (f', {fel} omgångar felade' if fel else ''))


if __name__ == '__main__':
    main()
