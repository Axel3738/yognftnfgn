import json,os,urllib.request
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
src={k:open(f'adcopy/sv_{k}.txt').read() for k in ['CS','GT','PD','SP']}
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
p=f"""Du skriver norsk (bokmål) Meta-annonsetekst ved å lokalisere fire svenske ADCOPY-dokumenter for samme produkt.
FAKTA (beverbutikken.no, det eneste du får påstå): "Motorlås I Rustfritt Stål – Låser Påhengsmotorens Festskruer". Pris 1079 kr, førpris 1409 kr (spar 330 kr, 23,4 % rabatt: skriv "over 23 %" eller bare "spar 330 kr", ALDRI 24 %). Motorlåset i rustfritt stål legges over påhengsmotorens festskruer og låses med en av to nøkler som følger med; festskruene går ikke an å skru løs uten nøkkelen; nøkkelringen flyter (mister du den i vannet, flyter den opp); to nøkler (én til deg, én i reserve); laget i rustfritt stål for å sitte ute ved bryggen; festskruene kan ellers løsnes på et par minutter med riktig verktøy. 30 dagers åpent kjøp. Fri frakt og Klarna er IKKE belagt: ikke nevn. Kilden bruker svenske priser 909/1189 kr, det er feil for Norge: bruk 1079/1409 kr.
REGLER:
- Uverifiserte påstander i kilden skal bort: 'bare i dag', 'begrenset lager', 'før det tar slutt', kundesitater, stjernebetyg, 'hundrevis av hjem', 'tusenvis har valgt', anekdoter brukt som bevis, '14 dagers åpent kjøp' (skal være 30 dagers), 'monteres på minutter', 'tåler saltvann/regn/sol', 'lageret krymper', 'fri frakt', 'Klarna', 'båteiere i Sverige'. 'Under 500 kr' er sant (389 kr). Skriv om til belagte fakta (110 dB, fjernkontroll, ingen app/abonnement/elektriker).
- Aldri butikknavn eller domene (ikke bäverbutiken/baverbutiken.se). CTA peker på knappen: 'Trykk på knappen under' e.l.
- Aldri 'Sverige'/'svensk'. Ingen svenske ord eller tegn (ä, ö). Ingen 'rostfritt', bruk 'rustfritt'. Produktet heter 'motorlås i rustfritt stål'.
- Priser kun i NOK etter faktaene. Beholde emojier og struktur fra kilden.
- Headline maks ca. 40 tegn, description maks ca. 60 tegn.
- Følg copy-reglene.
COPY-REGLER:
{regler}
KILDER:
{json.dumps(src,ensure_ascii=False,indent=1)}
Svar KUN med JSON: {{"CS":{{"message":"...","headline":"...","description":"..."}},"GT":{{...}},"PD":{{...}},"SP":{{...}},"_tre":"én linje: tre-spørsmålstesten per konsept ✅/❌"}}"""
for f in range(6):
    r=urllib.request.Request(B.rstrip('/')+'/v1/messages',data=json.dumps({"model":"claude-sonnet-5","max_tokens":4000,"messages":[{"role":"user","content":p}]}).encode(),headers={'x-api-key':K,'anthropic-version':'2023-06-01','content-type':'application/json'})
    try:
      d=json.load(urllib.request.urlopen(r,timeout=600)); t=''.join(c.get('text','') for c in d['content'] if c['type']=='text'); t=t[t.index('{'):t.rindex('}')+1]; o=json.loads(t); break
    except Exception as e: print(e)
json.dump(o,open('adcopy/no.json','w'),ensure_ascii=False,indent=1)
for k,v in o.items(): print('==',k); print(v if isinstance(v,str) else '\n'.join(f'[{a}] {b}' for a,b in v.items()))
