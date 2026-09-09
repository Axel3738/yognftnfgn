# /ugc-research – bygg vetting-ramverket: hur man känner igen en bra UGC-kreatör

Argument: `$ARGUMENTS` — valfri länk/sökväg till kursmaterial.

Målet: en fil, `factory/ugc/vetting-framework.md`, som svarar på EN fråga —
**hur känner man igen en bra UGC-kreatör innan man betalat något?**
`/ugc-scout` steg 1 ska sedan filtrera varje kandidat genom den filen.

## Källorna, i prioritetsordning

1. **Santiagos kurs (Happy Flops-grundaren, micro-influencer-kursen Axel
   har).** Leta först lokalt: `whop-downloader/`-utdata och `docs/`. Finns
   inget nedladdat: be Axel köra `whop-downloader/whop_dl.py` på kursen
   eller klistra in avsnitten — och fortsätt under tiden med källa 2.
   ⚠️ Kursen handlar om MICRO-INFLUENCERS. Vårt jobb är att ÖVERSÄTTA
   ramverket till UGC-kreatörer: vi köper innehållet, inte deras räckvidd.
   Varje kurskriterium som bygger på kreatörens egen publik (engagemang,
   följarkvalitet) ska skrivas om till motsvarande innehållskriterium
   (hookar, autenticitet, säljförmåga i video).
2. **Öppen research** (WebSearch): vad skiljer UGC-annonser som presterar
   från de som inte gör det; hur brief:ar och vettar etablerade
   e-com-operatörer sina kreatörer; svenska marknadens särdrag.
3. **Husets egen data:** `docs/playbook.md`, `docs/hook-visual-rule-2026-08-04.md`
   och `products/*/dna.md` — vi VET redan vilka hooks och format som
   spenderat pengar bra. En bra kreatör för oss är en som kan leverera dem.

## Leveransen: `factory/ugc/vetting-framework.md`

Strukturen:
1. **Snabbfiltret** — 5–8 ja/nej-frågor som går att svara på från kreatörens
   profil på under 2 minuter (går att ge till en redigerare eller VA).
2. **Djupkollen** — vad man tittar på i kreatörens 3 senaste videor
   (hooken de första 2 sekunderna, talat språk, ljud, ljus, kan hen sälja
   utan att det ser ut som reklam).
3. **Röda flaggor** — det som diskvalificerar direkt.
4. **Poängmall** — så att två kandidater går att jämföra med siffror.
5. **Källhänvisning per kriterium** — kursen, öppen research eller husets
   playbook. Ett kriterium utan källa är en gissning och märks som det.

## Regler

- Ramverket ska funka för BÅDE män och kvinnor och för svenska kreatörer.
- Hitta inte på statistik. Finns ingen siffra i källan: skriv kriteriet
  utan siffra.
- När kursen dyker upp senare: kör kommandot igen — det ska UPPDATERA
  filen och markera vad som kom från kursen.

## DEFINITION OF DONE
- [ ] Letat efter kursmaterialet lokalt och rapporterat om det fanns
- [ ] Ramverket bygger på minst två av de tre källorna
- [ ] Kurskriterier översatta från micro-influencer → UGC där de använts
- [ ] Snabbfilter + djupkoll + röda flaggor + poängmall finns
- [ ] Varje kriterium har källa eller är märkt som gissning
- [ ] `/ugc-scout` steg 1 pekar på framework-filen
