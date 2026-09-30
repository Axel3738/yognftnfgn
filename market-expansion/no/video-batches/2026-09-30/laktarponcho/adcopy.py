import json,os,urllib.request
K=os.environ['ANTHROPIC_NYCKEL']; B=os.environ.get('ANTHROPIC_BASE_URL','https://api.anthropic.com')
src={k:open(f'adcopy/sv_{k}.txt').read() for k in ['CS','G','PD','SP']}
regler=open('/home/user/yognftnfgn/docs/copy-regler.md').read()[:9000]
p=f"""Du skriver norsk (bokmål) Meta-annonsetekst ved å lokalisere fire svenske ADCOPY-dokumenter for samme produkt.
FAKTA (beverbutikken.no, det eneste du får påstå): "Tribuneponcho Med Varme – Tre Varmenivåer Via USB". Pris 679 kr, førpris 889 kr (spar 210 kr, rundt 24 % rabatt). Innebygd varme med tre varmenivåer du styrer selv, drives via USB fra en powerbank (POWERBANK FØLGER IKKE MED), strikket stoff i beige som ser ut som en vanlig poncho, glidelås rett frem, holder varmen i gang når du sitter stille (tribune, jaktpost). 30 dagers åpent kjøp.
IKKE belagt: vaskbar, rask oppvarming, batteritid, kundeuttalelser/stjerner/'folk snakker om', 'bare i dag', 'nesten utsolgt', 'utsalg/clearance', antall solgte, frakt.
REGLER:
- Linjer i kilden som påstår noe av det uverifiserte over (bare idag, nesten slutsålt, kundecitat/stjerner, 'älskad av kunder', 'kunder pratar om', 'favorit', vaskbar) TAS BORT eller byttes med en sann linje fra faktaene.
- Aldri butikknavn eller domene (ikke bäverbutiken/baverbutiken.se). CTA peker på knappen: 'Trykk på knappen under' e.l.
- Aldri 'Sverige'/'svensk'. Ingen svenske ord eller tegn (ä, ö). Produktet heter 'tribuneponcho' ('läktarponcho'), 'tribunen'.
- Priser kun i NOK etter faktaene. Beholde emojier og struktur fra kilden. Svensk pris (1109/849) skal byttes til 889/679. Si aldri at powerbank følger med.
- Headline maks ca. 40 tegn, description maks ca. 60 tegn.
- Følg copy-reglene.
COPY-REGLER:
{regler}
KILDER:
{json.dumps(src,ensure_ascii=False,indent=1)}
Svar KUN med JSON: {{"CS":{{"message":"...","headline":"...","description":"..."}},"G":{{...}},"PD":{{...}},"SP":{{...}},"_tre":"én linje: tre-spørsmålstesten per konsept ✅/❌"}}"""
for f in range(6):
    r=urllib.request.Request(B.rstrip('/')+'/v1/messages',data=json.dumps({"model":"claude-sonnet-5","max_tokens":9000,"messages":[{"role":"user","content":p}]}).encode(),headers={'x-api-key':K,'anthropic-version':'2023-06-01','content-type':'application/json'})
    d=json.load(urllib.request.urlopen(r,timeout=600)); t=''.join(c.get('text','') for c in d['content'] if c['type']=='text'); t=t[t.index('{'):t.rindex('}')+1] if '{' in t else '{'
    try: o=json.loads(t); break
    except Exception as e: print('retry',e)
json.dump(o,open('adcopy/no.json','w'),ensure_ascii=False,indent=1)
for k,v in o.items(): print('==',k); print(v if isinstance(v,str) else '\n'.join(f'[{a}] {b}' for a,b in v.items()))
