import json,os,urllib.request
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
src={k:open(f'adcopy/sv_{k}.txt').read() for k in ['CS','G','PD','SP']}
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
p=f"""Du skriver norsk (bokmål) Meta-annonsetekst ved å lokalisere fire svenske ADCOPY-dokumenter for samme produkt (kamadotrekk). CS-dokumentet er konseptet 'C1' (rabatt).
FAKTA (beverbutikken.no, det eneste du får påstå): "Kamadotrekk 80 × 102 cm – Med Oppbevaringspose". Pris 629 kr, førpris 819 kr (spar 190 kr, 23 %). Trekk i sort 600D-stoff, 80 × 102 cm (mål grillen før kjøp); holder regnet unna lokket og ventilen; håndtak på toppen, ventilåpning, fire spennremmer og snøring i underkanten som holder trekket på plass i vind; oppbevaringspose følger med; 30 dagers åpent kjøp. Grillen følger ikke med, bare trekket. Fri frakt KUN over 300 kr (ikke nevn frakt). Kilden bruker svenske priser 649/849 kr, det er feil for Norge: bruk 629/819 kr og spar 190 kr.
REGLER:
- Uverifiserte påstander i kilden skal bort: 'begrenset tilbud', 'før det er for sent', 'passa på før erbjudandet är slut', beskyttelse mot smuss/sol/støv (kun REGN er belagt), 'holder grillen fersk/ren', 'gjør vardagen enklere' som løfte. 'Skyddar' -> 'holder regnet unna lokket og ventilen'. Skriv om til belagte fakta.
- Aldri butikknavn eller domene. CTA peker på knappen: 'Trykk på knappen under'.
- Aldri 'Sverige'/'svensk'. Ingen svenske ord eller tegn (ä, ö). Produktet heter 'kamadotrekk'.
- Priser kun i NOK etter faktaene. Behold emojier og struktur fra kilden.
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
