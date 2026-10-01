import json,os,urllib.request,glob,re
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
vids={}
for f in sorted(glob.glob('srt-sv/*.srt')):
    n=os.path.basename(f)[:-4]
    vids[n]=[b.split('\n',2)[2].strip() for b in open(f).read().strip().split('\n\n')]
fakta="""Produkt (beverbutikken.no): "Tribuneponcho Med Varme – Tre Varmenivåer Via USB". Pris NÅ 679 kr, førpris 889 kr (spar 210 kr = 23,6 %, altså 'rundt tjuefire prosent' eller 'over tjue prosent').
Fra produktsiden (eneste du får påstå): innebygd varme med tre varmenivåer du styrer selv (lav, middels, høy), drives via USB fra en powerbank (POWERBANK FØLGER IKKE MED – si 'kobles til en powerbank via USB', aldri at den følger med), strikket stoff i beige som ser ut som en vanlig poncho, åpnes og lukkes med glidelås rett frem, holder varmen i gang når du sitter stille (tribune, jaktpost). 30 dagers åpent kjøp.
IKKE belagt, skal IKKE påstås: at den er vaskbar, at den varmes opp raskt/på sekunder, batteritid, kundeuttalelser ('kunder skriver', 'mange har skaffet den', 'alle spurte'), 'bare i dag', 'nesten utsolgt', 'tar slutt i kveld', 'når den er slutt er den slutt', frakt, antall solgte. Erstatt slike replikker med en nøytral, sann replikk fra faktaene (samme antall replikker!). 'Bare nå' er ok. Hender fri er ok å si kort.
Svensk kildepris i videoene (1109/849 kr) er SVENSK og skal byttes til 889/679. 'Läktarponcho' = 'tribuneponcho'. 'Läktaren' = 'tribunen'."""
res=json.load(open('srt-no/sonnet.json')) if os.path.exists('srt-no/sonnet.json') else {}
for n in vids:
  if n in res and len(res[n])==len(vids[n]): continue
  for forsok in range(3):
    prompt=f"""Du er en norsk (bokmål) annonsetekstforfatter. Oversett/lokaliser disse svenske videomanusene til naturlig, muntlig norsk bokmål, replikk for replikk (cue for cue).
    KRAV:
    - Nøyaktig samme antall replikker per video som kilden, i samme rekkefølge. Omtrent samme lengde (helst litt kortere) – de leses inn over samme filmklipp.
    - For hver replikk: "tale" (det voiceoveren leser: ALLE tall skrevet med bokstaver, norske tall med mellomrom og bindestrek, f.eks. 'seks hundre og syttini kroner', 'åtte hundre og åttini kroner', 'to hundre og ti kroner', 'tre varmenivåer') og "tekst" (undertekst på skjermen: samme setning, men tall med sifre, f.eks. '679 kr', '889 kr', '3 varmenivåer').
    - Butikkens navn og domene skal ALDRI nevnes (ikke 'bäverbutiken.se', ikke noe butikknavn). Siste CTA blir f.eks. 'Bestill via lenken.' / 'Finn det via lenken nedenfor.'
    - Aldri ordet 'Sverige'/'svensk'. Ingen svenske ord eller bokstaver (ä, ö). Produktet heter 'tribuneponcho' (med varme) på norsk.
    - Priser i NOK etter faktaene under, aldri de svenske. Ingen påstander som ikke står i faktaene (ikke 'begrenset lager', ikke frakt). 'Bare nå'/'Ikke gå glipp av dette' er ok.
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
