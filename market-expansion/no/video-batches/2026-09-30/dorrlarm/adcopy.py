import json,os,urllib.request
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
src={k:open(f'adcopy/sv_{k}.txt').read() for k in ['CS','G','PD','SP']}
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
p=f"""Du skriver norsk (bokmål) Meta-annonsetekst ved å lokalisere fire svenske ADCOPY-dokumenter for samme produkt.
FAKTA (beverbutikken.no, det eneste du får påstå): "Dør- og Vindusalarm 110 dB – Trådløs Fjernkontroll". Pris 389 kr, førpris 509 kr (spar 120 kr, rundt 24 % rabatt). Vibrasjonssensor som varsler når noen rykker eller bender på døren, vinduet eller sykkelen; 110 desibel som høres gjennom hele huset; trådløs fjernkontroll som slår alarmen på og av på avstand; ingen app, ikke noe abonnement, ingen elektriker; én enhet og fjernkontroll er nok. 30 dagers åpent kjøp. Fri frakt KUN over 300 kr (ikke nevn frakt). Kilden bruker svenske priser 449/589 kr, det er feil for Norge: bruk 389/509 kr.
REGLER:
- Uverifiserte påstander i kilden skal bort: 'bare i dag', 'begrenset lager', 'før det tar slutt', kundesitater, stjernebetyg, 'hundrevis av hjem', 'tusenvis har valgt', anekdoter brukt som bevis, '14 dagers åpent kjøp' (skal være 30 dagers). 'Under 500 kr' er sant (389 kr). Skriv om til belagte fakta (110 dB, fjernkontroll, ingen app/abonnement/elektriker).
- Aldri butikknavn eller domene (ikke bäverbutiken/baverbutiken.se). CTA peker på knappen: 'Trykk på knappen under' e.l.
- Aldri 'Sverige'/'svensk'. Ingen svenske ord eller tegn (ä, ö). Produktet heter 'dør- og vindusalarm'.
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
