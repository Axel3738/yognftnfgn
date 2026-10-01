import json,os,urllib.request,glob,re
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
vids={}
for f in sorted(glob.glob('srt-sv/*.srt')):
    n=os.path.basename(f)[:-4]
    vids[n]=[b.split('\n',2)[2].strip() for b in open(f).read().strip().split('\n\n')]
fakta="""Produkt (beverbutikken.no): "Kamadotrekk 80 × 102 cm – Med Oppbevaringspose" (trekk til kamadogrill). Pris NÅ 629 kr, førpris 819 kr (spar 190 kr = 23,2 %, altså 'rundt tjuetre prosent'; si 'hundre og nitti kroner' for besparelsen).
Fakta fra produktsiden (det ENESTE du får påstå): trekk i sort 600D-stoff, 80 × 102 cm (mål grillen før kjøp); holder regnet unna lokket og ventilen (regn renner ellers ned i ventilen på toppen, og lokket kan fryse fast om vinteren); håndtak på toppen; ventilåpning; fire spennremmer og en snøring i underkanten som holder trekket på plass i vind; oppbevaringspose følger med (trekket legges vekk i posen når du griller); 30 dagers åpent kjøp. Grillen følger ikke med, bare trekket.
IKKE belagt (må fjernes eller byttes ut med belagte fakta, samme antall replikker): 'beskytter mot smuss, støv, sol, UV' (kun REGN er belagt), 'så lenge lageret rekker', 'begrenset lager/tilbud', 'bare i dag/idag', 'ikke vent for lenge/siste sjanse', 'holdbar/værbestandig/vanntett' som kvalitetsløfter, 'passer alle kamadogriller' (mål 80 × 102 cm – si 'mål grillen først'), tall på kunder. 'Grillen holder seg ren' er ikke belagt – bytt mot 'regnet holdes unna lokket og ventilen'.
Svensk kildepris i videoene (649/849 kr, 200 kr rabatt) er SVENSK og skal byttes til norske tall: nå 629 kr, før 819 kr, spar 190 kr. 'Kamado-huv'/'kamadohuv' = 'kamadotrekk'. Frakt nevnes ikke. Butikknavn nevnes ikke."""
res=json.load(open('srt-no/sonnet.json')) if os.path.exists('srt-no/sonnet.json') else {}
for n in vids:
  if n in res and len(res[n])==len(vids[n]): continue
  for forsok in range(3):
    prompt=f"""Du er en norsk (bokmål) annonsetekstforfatter. Oversett/lokaliser disse svenske videomanusene til naturlig, muntlig norsk bokmål, replikk for replikk (cue for cue).
    KRAV:
    - Nøyaktig samme antall replikker per video som kilden, i samme rekkefølge. Omtrent samme lengde (helst litt kortere) – de leses inn over samme filmklipp.
    - For hver replikk: "tale" (det voiceoveren leser: ALLE tall skrevet med bokstaver, norske tall med mellomrom og bindestrek, f.eks. 'seks hundre og tjue-ni', 'åtte hundre og nitten', 'hundre og nitti kroner') og "tekst" (undertekst på skjermen: samme setning, men tall med sifre, f.eks. '629 kr', '819 kr', '190 kr').
    - Butikkens navn og domene skal ALDRI nevnes (ikke 'bäverbutiken.se', ikke noe butikknavn). Siste CTA blir f.eks. 'Bestill via lenken.' / 'Finn det via lenken nedenfor.'
    - Aldri ordet 'Sverige'/'svensk'. Ingen svenske ord eller bokstaver (ä, ö). Produktet heter 'kamadotrekk' på norsk. 'Fjernkontroll', 'trådløs'.
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
