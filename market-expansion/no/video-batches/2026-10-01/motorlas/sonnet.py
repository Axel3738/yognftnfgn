import json,os,urllib.request,glob,re
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
vids={}
for f in sorted(glob.glob('srt-sv/*.srt')):
    n=os.path.basename(f)[:-4]
    vids[n]=[b.split('\n',2)[2].strip() for b in open(f).read().strip().split('\n\n')]
fakta="""Produkt (beverbutikken.no): "Motorlås I Rustfritt Stål – Låser Påhengsmotorens Festskruer". Pris NÅ 1079 kr, førpris 1409 kr (spar 330 kr = 23,4 %, altså 'spar tre hundre og tretti kroner' eller 'over tjuetre prosent'; si IKKE 'tjuefire prosent').
Fakta fra produktsiden (det eneste du får påstå): påhengsmotoren sitter fast med noen festskruer som går an å løsne på et par minutter med riktig verktøy; motorlåset i rustfritt stål legges over festskruene og låses med en av to nøkler som følger med; festskruene går ikke an å skru løs uten nøkkelen; nøkkelringen flyter (mister du nøkkelen i vannet, flyter den opp); to nøkler følger med (én til deg, én i reserve); laget i rustfritt stål for å sitte ute ved bryggen; 30 dagers åpent kjøp (pengene tilbake).
IKKE belagt (må fjernes eller byttes ut): 'monteres på minutter/enkel montering', 'tåler saltvann, regn og sol/vær og vind', 'lageret krymper/nesten utsolgt/siste sjanse/bare i dag', fri frakt, Klarna, kundecitater ('sier en kunde', 'sover bedre om nettene, sier en annen'), 'nesten alle som har mistet motoren sier…', 'norske/svenske båteiere snakker om', 'flere og flere velger', antall kunder, 'koster deg tusen lapper' som påstand om skadeomfang (ok som uttrykk? nei, bytt), 'ingen kommer til' (si heller 'går ikke an å skru løs uten nøkkelen'). Bytt slike replikker mot belagte (f.eks. 'Nå 1079 kroner, før 1409.', 'To nøkler følger med.', '30 dagers åpent kjøp.', 'Bestill via lenken.') med samme antall replikker. Gave-videoene (GT): 'presang/gave' er fritt budskap, men bare belagte produktpåstander. Personlig førstepersonsfortelling uten statistikk-påstand kan beholdes ('Jeg trodde aldri det skulle skje meg').
Svenska kildepriser i videoene (909/1189 kronor, 24 %) är SVENSKA och skal byttes til de norske tallene: nå 1079 kr, før 1409 kr, spar 330 kr. Butikkens navn og domene nevnes aldri."""
res=json.load(open('srt-no/sonnet.json')) if os.path.exists('srt-no/sonnet.json') else {}
for n in vids:
  if n in res and len(res[n])==len(vids[n]): continue
  for forsok in range(3):
    prompt=f"""Du er en norsk (bokmål) annonsetekstforfatter. Oversett/lokaliser disse svenske videomanusene til naturlig, muntlig norsk bokmål, replikk for replikk (cue for cue).
    KRAV:
    - Nøyaktig samme antall replikker per video som kilden, i samme rekkefølge. Omtrent samme lengde (helst litt kortere) – de leses inn over samme filmklipp.
    - For hver replikk: "tale" (det voiceoveren leser: ALLE tall skrevet med bokstaver, norske tall med mellomrom og bindestrek, f.eks. 'tusen og syttini', 'fjorten hundre og ni', 'tre hundre og tretti', 'tretti dagers') og "tekst" (undertekst på skjermen: samme setning, men tall med sifre, f.eks. '1079 kr', '1409 kr', '330 kr').
    - Butikkens navn og domene skal ALDRI nevnes (ikke 'bäverbutiken.se', ikke noe butikknavn). Siste CTA blir f.eks. 'Bestill via lenken.' / 'Finn det via lenken nedenfor.'
    - Aldri ordet 'Sverige'/'svensk'. Ingen svenske ord eller bokstaver (ä, ö). Produktet heter 'motorlås' på norsk. 'festeskruer' heter 'festskruer' på produktsiden, bruk 'festskruer'; 'påhengsmotor' (ikke 'utenbordsmotor').
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
