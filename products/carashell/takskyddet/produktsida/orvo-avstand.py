#!/usr/bin/env python3
# orvo-avstand.py — hur nära ligger vår produktsidescopy orvo.se:s?
#
#   python3 products/carashell/takskyddet/produktsida/orvo-avstand.py [--grans 0.70]
#
# Hämtar orvo.se:s produktsida LIVE (lagras aldrig i repot), plockar ut
# synlig text, och jämför varje mening i (1) Bäverbutikens beskrivning
# (produktsida/baverbutiken-beskrivning-EFTER-*.html, senaste) och
# (2) CaraShells copy ur factory/produkter/takskyddet.yaml mot varje mening
# hos ORVO (difflib-ratio på normaliserad text). Meningar som också finns i
# Bäverbutikens EGEN gamla text (baverbutiken-beskrivning-FORE-2026-09-27.html,
# skriven 2026-09-07 — ORVO kopierade den, inte tvärtom) märks "Axels egen".
#
# Bakgrund 2026-09-27: första omskrivningen lånade ORVO:s egna meningar i
# stegen, storleksguiden och FAQ:n nästan ordagrant (åtta träffar ≥ 0,80).
# Det är precis vad en DMCA-anmälan träffar. Omskrivet samma dag; kör det här
# innan produktsidans copy ändras igen. Ingen träff ≥ gränsen utom Axels egna
# rader = grönt. Kräver bara Python 3, inga paket.
import re, sys, json, html, glob, os, subprocess, urllib.request, difflib

HÄR = os.path.dirname(os.path.abspath(__file__))
ROT = os.path.abspath(os.path.join(HÄR, '..', '..', '..', '..'))
GRANS = float(sys.argv[sys.argv.index('--grans') + 1]) if '--grans' in sys.argv else 0.70
ORVO = 'https://orvo.se/products/takskydd-husbil-husvagn'

def synlig_text(s):
    s = re.sub(r'<script.*?</script>|<style.*?</style>|<noscript.*?</noscript>', ' ', s, flags=re.S)
    s = re.sub(r'<(h[1-6]|p|li|div|section|tr|td|th|summary|details)[^>]*>', '\n', s)
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s))
    return re.sub(r'[ \t]+', ' ', s)

def meningar(t):
    t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t)))
    return [m.strip() for m in re.split(r'(?<=[.!?])\s+', t) if len(m.strip()) > 25]

def norm(s):
    return re.sub(r'[^a-zåäö0-9 ]', '', s.lower())

def bast(m, lista):
    return max(((difflib.SequenceMatcher(None, norm(m), norm(x)).ratio(), x) for x in lista), key=lambda t: t[0])

req = urllib.request.Request(ORVO, headers={'User-Agent': 'Mozilla/5.0'})
orvo = [m for rad in synlig_text(urllib.request.urlopen(req, timeout=30).read().decode('utf8', 'ignore')).split('\n') for m in meningar(rad)]
print(f'ORVO: {len(orvo)} meningar lästa live')

# Axels egna rader FÖRE i dag: Bäverbutikens gamla beskrivning + CaraShells
# produktfil som den såg ut i sista commiten före 2026-09-27 (a5f0986).
gammal_yaml = subprocess.run(['git', '-C', ROT, 'show', 'a5f0986:factory/produkter/takskyddet.yaml'], capture_output=True, text=True).stdout
axel = meningar(open(os.path.join(HÄR, 'baverbutiken-beskrivning-FORE-2026-09-27.html'), encoding='utf8').read()) + meningar(gammal_yaml)
axel_allt = norm(' '.join(axel))
efter = sorted(glob.glob(os.path.join(HÄR, 'baverbutiken-beskrivning-EFTER-*.html')))[-1]
mina = {'Bäverbutiken': meningar(open(efter, encoding='utf8').read())}
j = subprocess.run(['node', '-e', '''
import("%s/factory/yaml.mjs").then(({lasYaml})=>{const p=lasYaml(require("fs").readFileSync("%s/factory/produkter/takskyddet.yaml","utf8"));
const b=p.beskrivning; console.log(JSON.stringify([b.problem_rubrik,b.problem_text,b.losning_rubrik,b.losning_text,...p.benefits,...p.features,...p.faq.flatMap(f=>[f.fraga,f.svar])]))})
''' % (ROT, ROT)], capture_output=True, text=True).stdout
mina['CaraShell'] = [m for t in json.loads(j) for m in meningar(t)]

rott = 0
for namn, lista in mina.items():
    print(f'\n=== {namn}: {len(lista)} meningar, gräns {GRANS:.2f}')
    for m in lista:
        ro, xo = bast(m, orvo)
        if ro < GRANS:
            continue
        ra, _ = bast(m, axel)
        # Egen om raden fanns hos Axel före i dag — ELLER om ORVO:s träff är en
        # av Axels gamla rader (då är det ORVO som kopierat, inte vi).
        egen = ra >= GRANS or norm(m)[:40] in axel_allt or norm(xo)[:40] in axel_allt
        print(f"  {ro:.2f} {'Axels egen  ' if egen else '⚠️ ORVO      '} {m[:120]}")
        print(f"        ORVO: {xo[:120]}")
        if not egen:
            rott += 1
print(f'\n{"❌" if rott else "✅"} {rott} meningar ligger nära ORVO utan att vara Bäverbutikens egna.')
sys.exit(1 if rott else 0)
