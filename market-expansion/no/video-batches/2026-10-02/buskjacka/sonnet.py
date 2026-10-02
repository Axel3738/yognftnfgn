import json,os,urllib.request,glob,re
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
vids={}
for f in sorted(glob.glob('srt-sv/*.srt')):
    n=os.path.basename(f)[:-4]
    vids[n]=[b.split('\n',2)[2].strip() for b in open(f).read().strip().split('\n\n')]
fakta="""Produkt (beverbutikken.no): "Buskjakke 2-Pk 120 × 180 cm – Skjermer Mot Vind Og Kulde" (jakke av fiberduk du trekker over busk eller potteplante). Pris NÅ 379 kr, førpris 499 kr (spar 120 kr = 24 %; si 'hundre og tjue kroner' for besparelsen og 'tjuefire prosent').
Fakta fra produktsiden (det ENESTE du får påstå): 2 jakker i pakken, 120 × 180 cm per stykk, i beige fiberduk (polypropylen) som legges over hele planten, busker og potteplanter; glidelås som kan åpnes for å vanne eller se til planten uten å løfte av jakken; snøring i underkanten som strammes rundt stammen eller potten; skjermer mot vind og kulde; 30 dagers åpent kjøp (pengene tilbake). Første kalde natt kommer ofte tidligere enn ventet.
IKKE belagt (må fjernes eller byttes ut med belagte fakta, samme antall replikker): 'snø' (si 'vind og kulde'), 'frost' som garanti (si 'skjermer mot vind og kulde'; 'før første frost/kalde natt' som tidspunkt er OK), 'fest i bakken/marken' (bare snøring rundt stammen/potten), 'hele vinteren', 'bare i dag/idag', 'nesten utsolgt/begrenset lager', 'før prisen går opp', 'redder alle planter', 'to sekunder'/hastighetsløfter, kundetall/'flere og flere velger', 'tjuetre prosent'. Svensk kildepris i videoene (559/429 kr, 130 kr rabatt, 23 %) er SVENSK og skal byttes til norske tall: nå 379 kr, før 499 kr, spar 120 kr, 24 %. 'Buskjacka' = 'buskjakke'. Frakt nevnes ikke. Butikknavn nevnes ikke. Jul/fødselsdag-gavefokus kan beholdes som gave, uten tidsfrister."""
res=json.load(open('srt-no/sonnet.json')) if os.path.exists('srt-no/sonnet.json') else {}
for n in vids:
  if n in res and len(res[n])==len(vids[n]): continue
  for forsok in range(3):
    prompt=f"""Du er en norsk (bokmål) annonsetekstforfatter. Oversett/lokaliser disse svenske videomanusene til naturlig, muntlig norsk bokmål, replikk for replikk (cue for cue).
    KRAV:
    - Nøyaktig samme antall replikker per video som kilden, i samme rekkefølge. Omtrent samme lengde (helst litt kortere) – de leses inn over samme filmklipp.
    - For hver replikk: "tale" (det voiceoveren leser: ALLE tall skrevet med bokstaver, norske tall med mellomrom og bindestrek, f.eks. 'tre hundre og sytti-ni', 'fire hundre og nittini', 'hundre og tjue kroner') og "tekst" (undertekst på skjermen: samme setning, men tall med sifre, f.eks. '379 kr', '499 kr', '120 kr').
    - Butikkens navn og domene skal ALDRI nevnes (ikke 'bäverbutiken.se', ikke noe butikknavn). Siste CTA blir f.eks. 'Bestill via lenken.' / 'Finn det via lenken nedenfor.'
    - Aldri ordet 'Sverige'/'svensk'. Ingen svenske ord eller bokstaver (ä, ö). Produktet heter 'buskjakke' på norsk. 'Fjernkontroll', 'trådløs'.
    - Priser i NOK etter faktaene under, aldri de svenske. Ingen påstander som ikke står i faktaene (se IKKE belagt). Første persons fortelling (ren UGC-stemme) beholdes.
    - Følg copy-reglene (konkret, pek på ting, ingen tomme adjektiver) men ikke skriv om budskapet – dette er lokalisering.
    FAKTA:
    {fakta}
    COPY-REGLER:
    {regler}
    KILDEMANUS (JSON, video -> liste med svenske replikker):
    {json.dumps({n:vids[n]},ensure_ascii=False,indent=1)}
    Svar KUN med JSON: {{"{n}": [{{"tale": "...", "tekst": "..."}}, ...], "_tre_sporsmal": "én kort linje: tre-spørsmålstesten (visualisere ✅/❌, falsifisere ✅/❌, ingen konkurrent kan si det ✅/❌)"}}"""
    req=urllib.request.Request(B.rstrip('/')+'/v1/messages',data=json.dumps({"model":"claude-sonnet-5","max_tokens":4000,"messages":[{"role":"user","content":prompt}]}).encode(),headers={'x-api-key':K,'anthropic-version':'2023-06-01','content-type':'application/json'})
    d=json.load(urllib.request.urlopen(req,timeout=600))
    t=''.join(c.get('text','') for c in d['content'] if c['type']=='text'); t=t[t.index('{'):t.rindex('}')+1]
    try: o=json.loads(t)
    except Exception as e: print(n,'json',e); continue
    if len(o.get(n,[]))!=len(vids[n]): print(n,'antal',len(o.get(n,[])),len(vids[n])); continue
    res[n]=o[n]; res['_tre_'+n]=o.get('_tre_sporsmal'); json.dump(res,open('srt-no/sonnet.json','w'),ensure_ascii=False,indent=1); print(n,'ok'); break
