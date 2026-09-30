import json,os,urllib.request
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
src={k:open(f'adcopy/{k}.sv.txt').read() for k in ['CS','G','PD','SP']}
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
p=f"""Du skriver norsk (bokmål) Meta-annonsetekst ved å lokalisere fire svenske ADCOPY-dokumenter for samme produkt.
FAKTA (beverbutikken.no, det eneste du får påstå): "Varmesåler Med Fjernkontroll". Pris 799 kr, førpris 1039 kr (spar 240 kr = 23 % rabatt; kilden sier 24 % – det er FEIL, bruk 23 %). To såler som klippes etter egen skostørrelse langs trykte linjer (41–46), tre varmenivåer (høy, middels, lav), styres med fjernkontroll formet som nøkkelring uten å ta av skoene, lades med vanlig USB-kabel, ifølge leverandøren 4–10 timer per lading ('opptil 8 timer' er ok). 30 dagers åpent kjøp. Fri frakt KUN over 300 kr (sant her, men ikke nødvendig).
REGLER:
- Uverifiserte påstander i kilden SKAL BORT: 'i dag endast/bare i dag', 'imorgon er prisen tilbake', 'få kvar i lager/lageret synker', kundesitater, stjerner, 'tusentals svenskar', 'betrodd av tusenvis'. Erstatt med sanne fakta (pris, førpris, 23 %, tre varmenivåer, fjernkontroll, 30 dagers åpent kjøp).
- Aldri butikknavn eller domene (ikke bäverbutiken/baverbutiken.se). CTA peker på knappen: 'Trykk på knappen under' e.l.
- Aldri 'Sverige'/'svensk'. Ingen svenske ord eller tegn (ä, ö). Produktet heter 'varmesåler med fjernkontroll'. Julklapp = julegave, skidbacken = skibakken.
- Priser kun i NOK etter faktaene. Beholde emojier og struktur fra kilden.
- Headline maks ca. 40 tegn, description maks ca. 60 tegn.
- Følg copy-reglene.
COPY-REGLER:
{regler}
KILDER:
{json.dumps(src,ensure_ascii=False,indent=1)}
Svar KUN med JSON: {{"CS":{{"message":"...","headline":"...","description":"..."}},"G":{{...}},"PD":{{...}},"SP":{{...}},"_tre":"én linje: tre-spørsmålstesten per konsept ✅/❌"}}"""
for f in range(3):
    r=urllib.request.Request(B.rstrip('/')+'/v1/messages',data=json.dumps({"model":"claude-sonnet-5","max_tokens":4000,"messages":[{"role":"user","content":p}]}).encode(),headers={'x-api-key':K,'anthropic-version':'2023-06-01','content-type':'application/json'})
    d=json.load(urllib.request.urlopen(r,timeout=600)); t=''.join(c.get('text','') for c in d['content'] if c['type']=='text'); t=t[t.index('{'):t.rindex('}')+1]
    try: o=json.loads(t); break
    except Exception as e: print(e)
json.dump(o,open('adcopy/no.json','w'),ensure_ascii=False,indent=1)
for k,v in o.items(): print('==',k); print(v if isinstance(v,str) else '\n'.join(f'[{a}] {b}' for a,b in v.items()))
