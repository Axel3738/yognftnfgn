# Vetting-ramverk: så känner man igen en bra UGC-kreatör INNAN man betalat något

**Byggd:** 2026-09-06 av `/ugc-research`. Används av `/ugc-scout` steg 1 —
varje kandidat filtreras genom den här filen innan outreach.

**Vad vi köper:** innehållet, aldrig räckvidden. Kreatörens följarantal och
engagemang är irrelevanta — videon ska köras som betald annons på våra konton.
Det enda som räknas är om personen kan leverera det husets data redan bevisat
fungerar: äkta människa, mobilfilmat, konkret föremål i sekund ett, produkt
tidigt i bild.

## Källäge

| Källa | Status | Märkning |
|---|---|---|
| Santiagos kurs (Happy Flops, micro-influencer) | **INTE nedladdad 2026-09-06.** `whop-downloader/` innehåller bara skriptet, ingenting i `docs/`. Kör `/ugc-research` igen när kursen finns — då uppdateras filen och kurskriterier märks `[KURS]`. Kurskriterier som bygger på kreatörens egen publik ska då översättas till innehållskriterier innan de skrivs in. | `[KURS]` |
| Öppen research (webben, hämtad 2026-09-06) | Använd. Länkar längst ned. | `[RESEARCH]` |
| Husets egen data (playbook, hook-regeln, DNA-filer, copy-regler) | Använd. Filhänvisning per kriterium. | `[HUSET]` |
| Ingen källa alls | Kriteriet är en gissning och märks så. | `[GISSNING]` |

**Varför husets data väger tyngst:** axelbältets vinstmotor är en enda ÄKTA
UGC-video filmad på mobil — 57 % av kampanjens nettovinst (mätt 2026-08-09,
`products/axelbaltet/dna.md`). Två creatives med AI-genererade ansikten har
dödats i samma konto. Vi vet alltså redan exakt vilken sorts video vi köper;
kreatören bedöms på om hen kan leverera just den.

---

## 1. Snabbfiltret — 7 ja/nej-frågor, under 2 minuter, från profilen

Går att ge till en VA eller redigerare. Ett NEJ på fråga 1, 2 eller 7 stoppar
direkt; annars krävs minst 5 JA för att gå vidare till djupkollen.
(Trösklarna 5 av 7 är en `[GISSNING]` — justera när utfall finns.)

| # | Fråga (svenska) | Question (English, for VA) | Källa |
|---|---|---|---|
| 1 | Talar kreatören svenska i sina videor? | Does the creator speak Swedish in their videos? | `[HUSET]` — alla annonser körs på svenska marknaden; dubbning av UGC är inte en väg vi använder |
| 2 | Är det en riktig människa — namn, ansikte, kontaktväg — inte AI eller anonym sida? | Is this a real person — name, face, contact — not AI or an anonymous page? | `[HUSET]` AI-ansikten dödade `PD_2_1` och `SF_2_1` (`products/axelbaltet/dna.md`) + Editor rule 13 |
| 3 | Finns en portfolio/showreel med UGC-exempel för flera olika varumärken? | Is there a portfolio/showreel with UGC samples for several different brands? | `[RESEARCH]` etablerade kreatörer har typiskt 10+ exempel (Hustler Marketing/Conbersa) |
| 4 | Ser exemplen ut som riktiga mobilklipp, inte studioproduktion? | Do the samples look like real phone footage, not studio production? | `[RESEARCH]` "ser det ut som influencer-reklam presterar det sämre som UGC-annons" + `[HUSET]` vinnaren är rå mobil-UGC |
| 5 | Filmar kreatören vardagsmiljöer — utomhus, hem, trädgård — inte bara ringlight/beauty? | Does the creator film everyday settings — outdoors, home, garden — not just ringlight/beauty? | `[HUSET]` produkterna är båt/trädgård/strand (motorhölje, strandtofflor, axelbälte); en beauty-kreatör kan sakna miljön. Kopplingen miljö → leverans är dock en `[GISSNING]` |
| 6 | Finns klipp där produkten hålls/används i närbild med händerna? | Are there clips where the product is held/used in close-up with hands? | `[HUSET]` husets filmregler: makro, inom 15 cm, bara händer (`docs/hook-visual-rule-2026-08-04.md`) |
| 7 | Är det samma person/röst i alla portfolio-klipp? | Is it the same person/voice in all portfolio clips? | `[RESEARCH]` olika röster eller andras vattenstämplar = stulen portfolio (Conbersa/PixelPanda) |

---

## 2. Djupkollen — kreatörens 3 senaste videor

Titta på de tre senaste (eller tre bästa säljexemplen). Bedöm varje punkt
0–2: 0 = saknas/fel, 1 = delvis, 2 = tydligt ja.

**A. Hooken, de första 2 sekunderna.** Pausa efter 2 sekunder. Vad såg du?
Ett konkret, fysiskt föremål i närbild → 2 poäng. En människa som pratar mot
kameran utan föremål → 1 poäng. Ingenting — logga, intro, svart ruta, text →
0 poäng.
`[HUSET]` Hook-visual-regeln: vinnaren 235 H3 höll 12,4 % förbi hooken,
narrativa hooks utan filmbart föremål låg på 2–6 % (mätt 2026-08-04,
`docs/hook-visual-rule-2026-08-04.md`). `[RESEARCH]` bekräftar: hook rate
avgör distributionen på både Meta och TikTok.

**B. Talat språk.** Naturlig svenska, dialekt är ett plus, låter som en
människa som berättar — inte som ett uppläst manus.
`[RESEARCH]` "UGC som låter skriptat förstör hela formatets poäng" (Sideshift/
Hustler Marketing).

**C. Kan hen peka i stället för att prata?** Letar du efter EN sak: visar
personen något konkret (före/efter, problemet i bild, produkten som gör
jobbet) i stället för adjektiv ("fantastisk", "smart", "game changer")?
Testa deras bästa rad mot tre-frågorstestet: går den att visualisera, går den
att falsifiera, kan ingen annan säga den?
`[HUSET]` `docs/copy-regler.md` ("Prata inte. Peka.") + playbookens vinnare
bygger alla på konkreta bevis i bild (`docs/playbook.md`).

**D. Produkten tidigt.** Syns produkten inom de första 4 sekunderna i deras
säljexempel?
`[HUSET]` Motorhöljets regel "produkt i bild före sekund 4"
(`products/motorholjet/dna.md`) + sätesöverdragaren: "produkten synlig direkt"
är bevisat i båda vinnarna (`products/satesoverdragaren/dna.md`).

**E. Komplett budskap under ~45 sekunder.** Kan kreatören landa problem →
produkt → varför inom 45 sekunder utan att det känns hetsigt?
`[HUSET]` Lång UGC (>45 s) utan cutdown konverterade inte trots hög CTR
(sätesöverdragaren, `SP_2_1_H1`, dokumenterat 2026-08-05).

**F. Ljud och ljus.** Talet hörbart utan att musik bär klippet; vardagsljus,
inte ringlight-perfekt. Inga beauty-filter.
`[HUSET]` husets filmregler säger ingen musik (`docs/hook-visual-rule`).
`[RESEARCH]` beauty-filter förvränger produkten och sänker förtroendet
(Conbersa); för polerat triggar annons-blindhet.

**G. Säljer utan att det ser ut som reklam.** Helhetsfrågan: skulle klippet
kunna ligga i flödet som ett vanligt inlägg? Känns det som en person som
tipsar, inte ett varumärke som annonserar?
`[RESEARCH]` hela UGC-formatets värde är att det inte triggar ad-blindness
(Sideshift/Stackmatix). `[HUSET]` axelbältets vinnare är just ett sådant klipp.

---

## 3. Röda flaggor — diskvalificerar direkt

- **AI-genererat ansikte eller AI-människor någonstans i materialet.**
  `[HUSET]` två döda creatives + förbud i Editor rule 13. Ingen diskussion.
- **Fabricerade testimonials** — påhittade kundcitat, "verifierad kund" som
  inte finns. `[HUSET]` incidenten `SP_3_1_H1` (fabricerad AI-testimonial,
  `products/satesoverdragaren/dna.md` 2026-07-30).
- **Stulna exempel:** olika röster i "sina" klipp, andras vattenstämplar,
  samma video på flera konton med olika namn. `[RESEARCH]` (Conbersa/
  PixelPanda — omvänd bildsökning på nyckelframes avslöjar det).
- **Kräver 100 % betalning i förskott för ett stort paket** innan något
  levererats. `[RESEARCH]` (PixelPanda/Hustler Marketing).
- **Generiskt mallmanus** — "den här produkten förändrade mitt liv"-öppningar
  i flera olika varumärkens klipp. `[RESEARCH]` (Hustler Marketing).
- **Bara polerad influencer-reklam** i portfolion, ingenting som ser
  organiskt ut. `[RESEARCH]` + `[HUSET]` (det är motsatsen till det enda som
  bevisats fungera i kontot).
- **Långsam eller vag kommunikation redan i första kontakten.** Leveranstid
  är en del av produkten. `[RESEARCH]` (Hustler Marketing/Quimby).
- **Ingen svenska.** Klipp på engelska går inte att använda på svenska
  marknaden. `[HUSET]`-krav.
- **Pris långt över svensk marknadsnivå utan motsvarande portfolio.** Svensk
  marknad ligger ungefär 500–3 000 kr per video exkl. rättigheter;
  nybörjare 700–2 000 kr. `[RESEARCH]` (Svenskaföljare/Teknoradar/Collabios,
  hämtat 2026-09-06). Priser ändras — kolla mot aktuell nivå, inte mot den
  här raden om den är gammal.

---

## 4. Poängmallen — så jämförs två kandidater med siffror

**Steg 1: Snabbfiltret.** NEJ på fråga 1, 2 eller 7 → ut. Färre än 5 JA → ut.

**Steg 2: Röda flaggor.** En enda träff → ut, oavsett poäng.

**Steg 3: Djupkollen, 0–2 poäng per punkt A–G.**
Hooken (A) räknas dubbelt — det är den variabel husets data säger mest om
(hook-hold skiljer vinnare från förlorare 12,4 % mot 2–6 %, `[HUSET]`).

| Punkt | Vikt | Max |
|---|---|---|
| A. Hook, första 2 sek | ×2 | 4 |
| B. Talat språk | ×1 | 2 |
| C. Pekar, pratar inte | ×1 | 2 |
| D. Produkt inom 4 sek | ×1 | 2 |
| E. Komplett under 45 sek | ×1 | 2 |
| F. Ljud/ljus/inga filter | ×1 | 2 |
| G. Ser inte ut som reklam | ×1 | 2 |
| **Totalt** | | **16** |

**Tolkning** (gränserna är en `[GISSNING]` — kalibrera efter de första
verkliga samarbetena och skriv in utfallet här):

- **12–16:** kontakta. Prioritera högst totalpoäng, vid lika högst A-poäng.
- **8–11:** reservlista. Kontakta bara om 12+-listan är tom.
- **0–7:** nej.

Skriv poängen i `/ugc-scout`-tabellen så att två kandidater alltid går att
ställa mot varandra med samma siffror.

---

## 5. Källor

**`[HUSET]`** (filer i repot, lästa 2026-09-06):
- `docs/hook-visual-rule-2026-08-04.md` — konkret-substantiv-testet, hook-hold-datan, filmreglerna, AI-människoförbudet
- `products/axelbaltet/dna.md` — äkta UGC = vinstmotorn; AI-ansikten dödar; "samma vinkel, samma råa mobilutförande, en annan verklig människa"
- `products/satesoverdragaren/dna.md` — produkt synlig direkt; lång UGC utan cutdown konverterar inte; testimonial-incidenten
- `products/motorholjet/dna.md` — den enskilda creativen är huvudvariabeln; produkt i bild före sekund 4
- `docs/playbook.md` — bevisade vinklar (auktoritet/story, trust, problem/före-efter)
- `docs/copy-regler.md` — tre-frågorstestet, "prata inte, peka"

**`[RESEARCH]`** (hämtat 2026-09-06):
- [Hustler Marketing — How to Vet & Hire UGC Creators](https://www.hustlermarketing.com/how-to-vet-hire-ugc-creators-what-to-look-for-before-you-commit/)
- [Hustler Marketing — UGC hooks, the first 3 seconds](https://www.hustlermarketing.com/blog/how-to-write-ugc-ad-hooks-that-stop-the-scroll-on-meta-and-tiktok/)
- [Conbersa — How to Vet UGC Creators](https://www.conbersa.ai/learn/how-to-vet-ugc-creators) + [Portfolio red flags](https://www.conbersa.ai/learn/ugc-creator-portfolio-red-flags)
- [Sideshift — Vetting guide](https://sideshift.app/blog/how-to-vet-ugc-creators) + [UGC in paid ads](https://sideshift.app/blog/ugc-in-paid-ads-strategy)
- [PixelPanda — Platforms, pricing, red flags](https://pixelpanda.ai/blog/2026/03/23/how-to-hire-ugc-creators-platforms-pricing-and-red-flags-2/)
- [Quimby Digital — How to hire UGC creators](https://quimbydigital.com/how-to-hire-ugc-creators/)
- [Svenskaföljare — UGC Sverige](https://svenskafoljare.se/ugc-sverige/) · [Teknoradar — hitta svenska UGC-kreatörer](https://teknoradar.se/marknadsforing/influencers/sa-hittar-du-svenska-ugc-kreatorer/) · [Collabios — UGC-kreatör 2026](https://collabios.com/sv/blog/ugc-kreator-2026) · [UGC Sverige — kreatörer](https://www.ugcsverige.se/kreat%C3%B6rer/)

**`[KURS]`** — Santiagos kurs: **tom sektion tills kursen laddats ned.**
När den finns: kör `/ugc-research` igen. Varje kurskriterium som bygger på
kreatörens egen publik (engagemang, följarkvalitet, räckvidd) översätts till
motsvarande innehållskriterium (hook, autenticitet, säljförmåga i video)
innan det skrivs in, och märks `[KURS]` med avsnittshänvisning.
