import json,os,urllib.request,glob,re
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
vids={}
for f in sorted(glob.glob('srt-sv/*.srt')):
    n=os.path.basename(f)[:-4]
    vids[n]=[b.split('\n',2)[2].strip() for b in open(f).read().strip().split('\n\n')]
fakta="""Produkt (beverbutikken.no): "Varmesåler Med Fjernkontroll". Pris NÅ 799 kr, førpris 1039 kr (spar 240 kr, rundt 23 %).
Fra produktsiden: to såler som klippes etter egen skostørrelse langs trykte linjer (41–46), tre varmenivåer (høy, middels, lav), styres med en fjernkontroll formet som en nøkkelring, uten å røre en fot. Lades med vanlig USB-kabel (ingen kabel mens du bruker dem). Ifølge leverandøren 4–10 timer per lading avhengig av nivå. 30 dagers åpent kjøp. Fri frakt KUN over 300 kr (ikke nevn frakt).
Svenske kildepriser i videoene (869 / 1139 kr) er SVENSKE og skal byttes til 799 / 1039 kr.
IKKE BELAGT, skal IKKE sies: 'bare i dag', 'lageret går fort', 'snart utsolgt', 'bestill før de er borte', 'tusenvis av svensker/nordmenn', 'produktet alle snakker om'. Erstatt med sanne linjer av samme lengde, f.eks. 'Nå på salg.', 'Nå 799 kr.', 'Bestill via lenken.', 'Før vinteren kommer.', 'Jeg hadde hørt om dem.'. 'Opptil åtte timer' er ok (innenfor 4–10)."""
res=json.load(open('srt-no/sonnet.json')) if os.path.exists('srt-no/sonnet.json') else {}
for n in vids:
  if n in res and len(res[n])==len(vids[n]): continue
  for forsok in range(3):
    prompt=f"""Du er en norsk (bokmål) annonsetekstforfatter. Oversett/lokaliser disse svenske videomanusene til naturlig, muntlig norsk bokmål, replikk for replikk (cue for cue).
    KRAV:
    - Nøyaktig samme antall replikker per video som kilden, i samme rekkefølge. Omtrent samme lengde (helst litt kortere) – de leses inn over samme filmklipp.
    - For hver replikk: "tale" (det voiceoveren leser: ALLE tall skrevet med bokstaver, norske tall med mellomrom og bindestrek, f.eks. 'sju hundre og nitti-ni kroner', 'tusen og tretti-ni kroner', 'tre varmenivåer', 'åtte timer') og "tekst" (undertekst på skjermen: samme setning, men tall med sifre, f.eks. '799 kr', '1039 kr', '3 varmenivåer').
    - Butikkens navn og domene skal ALDRI nevnes (ikke 'bäverbutiken.se', ikke noe butikknavn). Siste CTA blir f.eks. 'Bestill via lenken.' / 'Finn det via lenken nedenfor.'
    - Aldri ordet 'Sverige'/'svensk'. Ingen svenske ord eller bokstaver (ä, ö). Produktet heter 'varmesåler med fjernkontroll' på norsk. Skidbakken = skibakken, julklapp = julegave. Alle tall i 'tale' som ord, aldri sifre.
    - Priser i NOK etter faktaene under, aldri de svenske. Ingen påstander som ikke står i faktaene (ikke 'begrenset lager', ikke frakt). 
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
