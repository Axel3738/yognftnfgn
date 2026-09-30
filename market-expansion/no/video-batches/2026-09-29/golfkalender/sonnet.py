import json,os,urllib.request,glob,re
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
vids={}
for f in sorted(glob.glob('srt-sv/*.srt')):
    n=os.path.basename(f)[:-4]
    vids[n]=[b.split('\n',2)[2].strip() for b in open(f).read().strip().split('\n\n')]
fakta="""Produkt (beverbutikken.no): "Golf Adventskalender – 24 Golftilbehør". Pris NÅ 619 kr, førpris 809 kr (spar 190 kr, rundt 23 %).
Fra produktsiden: 24 nummererte luker, ferdig fylt med golftilbehør i stedet for sjokolade. Innhold blant annet: golfballer, peger (tees) i plast og tre, ballmarkeringspenner, linjemarkører, en capsklemme med ballmarkør, en greenreparatør med speil, en T-nøkkel for spikes, en køllebørste, et grooveverktøy, nøkkelringer og et golfhåndkle med klips. Én luke om dagen frem til julaften. Én eske å pakke inn, kan sendes rett til mottakeren. For voksne og tenåringer som spiller golf. 30 dagers åpent kjøp. Fri frakt KUN over 300 kr (ikke nevn frakt).
Svenske kildepriser i videoene (549 / 719 / 170 kr rabatt) er SVENSKE og skal byttes til 619 / 809 / 190 kr.
'Poängräknare' (poengteller) står IKKE i innholdslisten – bytt til 'grooveverktøy' eller 'nøkkelringer'. 'Pitchgaffel' = 'greenreparatør'. 'Golfbågen' i kilden er en feilhøring av 'golfbagen' = 'golfbagen'.
IKKE BELAGT, skal IKKE sies: 'bare i dag', 'tilbudet gjelder bare i dag', 'nesten utsolgt', 'før prisen går opp', 'før den er borte/tar slutt', 'fornøyde kunder har allerede bestilt', 'mange sier det var den morsomste gaven', 'har blitt en favoritt', 'alle golfere snakker om', 'det sier kundene', '(X) har allerede bestilt'. Erstatt med sanne linjer av omtrent samme lengde, f.eks. 'Nå på salg.', 'Nå 619 kroner.', 'Bestill via lenken.', 'Før desember kommer.', 'En luke hver dag frem til julaften.', 'Ferdig fylt, ingenting å fylle selv.', 'Én eske å pakke inn, ikke 24 gaver.', 'Golfballer, peger og et håndkle med klips.'"""
res=json.load(open('srt-no/sonnet.json')) if os.path.exists('srt-no/sonnet.json') else {}
for n in vids:
  if n in res and len(res[n])==len(vids[n]): continue
  for forsok in range(3):
    prompt=f"""Du er en norsk (bokmål) annonsetekstforfatter. Oversett/lokaliser disse svenske videomanusene til naturlig, muntlig norsk bokmål, replikk for replikk (cue for cue).
    KRAV:
    - Nøyaktig samme antall replikker per video som kilden, i samme rekkefølge. Omtrent samme lengde (helst litt kortere) – de leses inn over samme filmklipp.
    - For hver replikk: "tale" (det voiceoveren leser: ALLE tall skrevet med bokstaver, norske tall med mellomrom og bindestrek, f.eks. 'seks hundre og nitten kroner', 'åtte hundre og ni kroner', 'hundre og nitti kroner', 'tjue-fire luker') og "tekst" (undertekst på skjermen: samme setning, men tall med sifre, f.eks. '619 kr', '809 kr', '24 luker').
    - Butikkens navn og domene skal ALDRI nevnes (ikke 'bäverbutiken.se', ikke noe butikknavn). Siste CTA blir f.eks. 'Bestill via lenken.' / 'Finn det via lenken nedenfor.'
    - Aldri ordet 'Sverige'/'svensk'. Ingen svenske ord eller bokstaver (ä, ö). Produktet heter 'golfkalenderen' / 'golf-adventskalenderen' på norsk. Julklapp = julegave, luckor = luker, slips = slips, tröja = genser. Alle tall i 'tale' som ord, aldri sifre.
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
