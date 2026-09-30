import json,os,urllib.request,glob,re
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
vids={}
for f in sorted(glob.glob('srt-sv/*.srt')):
    n=os.path.basename(f)[:-4]
    vids[n]=[b.split('\n',2)[2].strip() for b in open(f).read().strip().split('\n\n')]
fakta="""Produkt (beverbutikken.no): "Dør- og Vindusalarm 110 dB – Trådløs Fjernkontroll". Pris NÅ 389 kr, førpris 509 kr (spar 120 kr = 23,6 %, altså 'rundt tjuefire prosent' eller 'nesten tjuefire prosent'; 'under fire hundre kroner' er sant).
Fakta fra produktsiden (det eneste du får påstå): vibrasjonssensor som varsler når noen rykker eller bender på døren, vinduet eller sykkelen (ikke først når det er åpent); 110 desibel som høres gjennom hele huset; trådløs fjernkontroll som slår alarmen på og av på avstand; ingen app, ikke noe abonnement, ingen elektriker; én enhet og en fjernkontroll er nok; 30 dagers åpent kjøp.
IKKE belagt (må fjernes eller byttes ut): 'settes opp på fem minutter', 'grannene hører det', 'lageret er begrenset/selger fort', 'rabatten gjelder bare i dag', 'siste sjanse', antall kunder/venner ('fem venner', 'hundrevis'), 'kjøpte en til mamma' som tall er ok som personlig fortelling men ikke som statistikk. Bytt slike replikker mot belagte (f.eks. 'Sett den opp selv, uten elektriker.', 'Prisen er 389 kroner nå.', 'Bestill via lenken.'), samme antall replikker.
Svensk kildepris i videoene (589/449/24 %) er SVENSK og skal byttes til de norske tallene: ordinær 509 kr, nå 389 kr, rundt 24 %. 'Under femhundra kronor' -> 'under fire hundre kroner'. Frakt nevnes ikke."""
res=json.load(open('srt-no/sonnet.json')) if os.path.exists('srt-no/sonnet.json') else {}
for n in vids:
  if n in res and len(res[n])==len(vids[n]): continue
  for forsok in range(3):
    prompt=f"""Du er en norsk (bokmål) annonsetekstforfatter. Oversett/lokaliser disse svenske videomanusene til naturlig, muntlig norsk bokmål, replikk for replikk (cue for cue).
    KRAV:
    - Nøyaktig samme antall replikker per video som kilden, i samme rekkefølge. Omtrent samme lengde (helst litt kortere) – de leses inn over samme filmklipp.
    - For hver replikk: "tale" (det voiceoveren leser: ALLE tall skrevet med bokstaver, norske tall med mellomrom og bindestrek, f.eks. 'tre hundre og åtti-ni', 'fem hundre og ni', 'hundre og ti desibel', 'tjuefire prosent') og "tekst" (undertekst på skjermen: samme setning, men tall med sifre, f.eks. '389 kr', '509 kr', '110 dB').
    - Butikkens navn og domene skal ALDRI nevnes (ikke 'bäverbutiken.se', ikke noe butikknavn). Siste CTA blir f.eks. 'Bestill via lenken.' / 'Finn det via lenken nedenfor.'
    - Aldri ordet 'Sverige'/'svensk'. Ingen svenske ord eller bokstaver (ä, ö). Produktet heter 'dør- og vindusalarm' på norsk. 'Fjernkontroll', 'trådløs'.
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
