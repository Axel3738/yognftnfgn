import json,os,urllib.request
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
src={k:open(f'adcopy/sv_{k}.txt').read() for k in ['CS','G','PD','SP']}
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
p=f"""Du skriver norsk (bokmål) Meta-annonsetekst ved å lokalisere fire svenske ADCOPY-dokumenter for samme produkt (buskjakke). CS-dokumentet er konseptet 'C1' (rabatt).
FAKTA (beverbutikken.no, det eneste du får påstå): "Buskjakke 2-Pk 120 × 180 cm – Skjermer Mot Vind Og Kulde". Pris 379 kr, førpris 499 kr (spar 120 kr, 24 %). 2 jakker i pakken, 120 × 180 cm per stykk, beige fiberduk (polypropylen) som legges over hele planten; glidelås som kan åpnes for å vanne uten å løfte av jakken; snøring i underkanten som strammes rundt stammen eller potten; skjermer mot vind og kulde; passer busker og potteplanter; 30 dagers åpent kjøp (pengene tilbake). Kilden bruker svenske priser 559/429 kr (130 kr, 23 %), det er feil for Norge: bruk 379/499 kr, spar 120 kr, 24 %.
REGLER:
- Uverifiserte påstander skal bort: 'begrenset antall/lager', 'før prisen går opp', 'frosten venter ikke' som press, 'frost/snø' som garanti (si vind og kulde), 'Svenskt företag i Göteborg', fri frakt (ikke nevn frakt), 'Klarna' i annonsen. Skriv om til belagte fakta, behold struktur og emojier.
- Aldri butikknavn eller domene. CTA peker på knappen: 'Trykk på knappen under'.
- Aldri 'Sverige'/'svensk'. Ingen svenske ord eller tegn (ä, ö). Produktet heter 'buskjakke'.
- Priser kun i NOK etter faktaene.
- Headline maks ca. 40 tegn, description maks ca. 60 tegn.
- Følg copy-reglene.
COPY-REGLER:
{regler}
KILDER:
{json.dumps(src,ensure_ascii=False,indent=1)}
Svar KUN med JSON: {{"CS":{{"message":"...","headline":"...","description":"..."}},"G":{{...}},"PD":{{...}},"SP":{{...}},"_tre":"én linje: tre-spørsmålstesten per konsept ✅/❌"}}"""
for f in range(3):
    r=urllib.request.Request(B.rstrip('/')+'/v1/messages',data=json.dumps({"model":"claude-sonnet-5","max_tokens":16000,"messages":[{"role":"user","content":p}]}).encode(),headers={'x-api-key':K,'anthropic-version':'2023-06-01','content-type':'application/json'})
    d=json.load(urllib.request.urlopen(r,timeout=600)); t=''.join(c.get('text','') for c in d['content'] if c['type']=='text'); print(repr(t[:300]),d.get("stop_reason")); t=t[t.index('{'):t.rindex('}')+1]
    try: o=json.loads(t); break
    except Exception as e: print(e)
json.dump(o,open('adcopy/no.json','w'),ensure_ascii=False,indent=1)
for k,v in o.items(): print('==',k); print(v if isinstance(v,str) else '\n'.join(f'[{a}] {b}' for a,b in v.items()))
