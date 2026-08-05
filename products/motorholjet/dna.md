# Creative DNA – Motorhöljet (Bäverbutiken)

**Produkt:** Marin Motorhölje 420D – Universellt Skydd · 299 kr (jämförpris 367 kr)
**LP:** https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd
**Konto:** MagiBorsten `1867947880635861` (SEK) · Kampanj `120249435814310291` · CBO 6 000 kr/dag
**Target-CPA:** 135 kr
**Senast uppdaterad:** 2026-08-05, andra körningen (/cs → funnelanalys + butiksvarianter)

---

## Läget i siffror (livstid t.o.m. 2026-08-05)

| | Värde |
|---|---|
| Spend | ≈ 21 927 kr |
| Köp | 139 |
| **CPA** | **≈ 158 kr** (target 135 kr → **17 % över**) |
| Största posten | `Motorhölje_PD_1_H3` = 14 185 kr = **65 % av all spend**, CPA 170,90 kr |

**Huvudproblemet just nu:** budgeten koncentreras till en annons vars CPA ligger 27 % över target.
De fyra annonser som faktiskt slår target-CPA har tillsammans fått 21 % av spenden.

---

## FUNNELN: var läckan faktiskt sitter (viktigaste fyndet hittills)

CPA per annons döljer att annonserna köper helt olika sorters trafik. Bryter man ner funneln:

| Annons | kr/utgående klick | LPV→ATC | ATC→köp | LPV→köp |
|---|---|---|---|---|
| PD_1_H3 (volymbäraren) | **6,65 kr (billigast)** | **9,2 % (sämst)** | 47,5 % | **4,4 % (sämst)** |
| SP_1_H1 | 11,22 kr (dyrast) | 16,0 % | **68,0 %** | **10,9 % (bäst)** |
| SO_1_H2 | 6,89 kr | **17,3 %** | 44,4 % | 7,7 % |
| SO_2 (statisk) | 9,87 kr | 12,9 % | 68,8 % | 8,9 % |
| SO_1_H1 (förlorare) | 7,52 kr | 13,7 % | 39,3 % | 5,4 % |

**Slutsats:** PD_1_H3 köper kampanjens billigaste klick och konverterar dem sämst. SP_1_H1 köper de
dyraste och konverterar dem dubbelt så bra. Problemet är alltså inte hooken, det är **vem klicket
är** och **steget LPV→ATC**.

**Den mest sannolika orsaken till ATC-läckan:** produkten säljs i sex storleksintervall och ingen
annons har någonsin förklarat vilket som passar. Köparen kommer till sidan och vet inte vad hen ska
välja. Det är hypotesen batch #4 testar på flera sätt.

**Regel härifrån:** optimera mot LPV→ATC och LPV→köp, inte mot CTR. En annons som får färre men
bättre klick är ett framsteg även om CTR faller.

## VAD BUTIKSDATAN SÄGER (hämtad 2026-08-05)

**Storlekar:** 6 - 18 hk · 20 - 30 hk · 40 - 60 hk · 60 - 90 hk · 100 - 150 hk · 175 - 250 hk.
Försäljningen koncentreras till **40 hk och uppåt** (40-60, 100-150 och 175-250 säljer mest;
6-18 rör sig knappt). Annonserna talar i dag till en generisk "båtägare" — köparen har en större
och dyrare motor än så, vilket gör värdeargumentet bokstavligen sannare för dem.

**Färger:** Svart, Blå, Grå, Grön, Mintgrön. **Svart står för den stora majoriteten av
försäljningen. Mintgrön och Grön har sålt noll.** Färgutbud är alltså inte en säljvinkel, och
tidigare idéer om färg-som-hjälte är avfärdade av datan. Använd svart i bildmaterialet.

**Trafiktyp:** 100 % kall prospektering. Ingen retargeting finns. PD_1_H3 ensam har genererat
177 lägg-i-varukorg mot 84 köp, alltså ca 93 övergivna varukorgar från en enda annons som
ingenting i kontot talar till.

## Så läser vi CPA (rättad 2026-08-05)

**Grundregeln: CPA mätt på olika spendnivåer är inte jämförbara.** En annons som fått 400 kr har
bara fått Metas billigaste och varmaste visningar. En annons som fått 14 000 kr har tvingats ut i
dyrare auktioner mot kallare publik. Låg CPA på låg spend är därför systematiskt smickrad, inte
bevisad.

Ett tidigare försök att ranka på "effektivitetsindex" (kampanjens CPA delat med annonsens CPA)
föll på precis det: det rankade PD_1_H3 under annonser som aldrig testats i närheten av dess
spendnivå. Indexet står kvar nedan som referens, men **det är inte ett rankningsmått.**

**Rätt läsning:** en annons är bevisad först när den hållit sin CPA vid den spend den faktiskt ska
köras på. Just nu är `PD_1_H3` den enda som klarat det.

| Annons | Spend | Köp | Index | Tolkning |
|---|---|---|---|---|
| SP_1_H1 | 1 985 kr | 17 | 1,35 | **Mest tillförlitliga vinnaren.** Största urvalet över 1,0 |
| SO_2 (statisk) | 1 381 kr | 11 | 1,26 | Bevisad, statiskt format håller |
| PD_EXTRA | 773 kr | 8 | 1,63 | Bästa index bland tillförlitliga |
| SO_1_H2 | 379 kr | 4 | 1,67 | Högst index, minst urval av vinnarna. Aldrig itererad förrän nu |
| SP_1_H2 | 163 kr | 1 | 0,97 | Brus |
| **PD_1_H3** | **14 185 kr** | **83** | **0,92** | **Volymvinnaren. Enda annonsen bevisad i skala. Indexet är missvisande här: den betalar priset för att vara den som faktiskt skalats** |
| SO_1_H1 | 1 932 kr | 11 | 0,90 | Sämst av de skalade |
| SO_5_1 | 342 kr | 1 | 0,46 | Sämsta med riktig spend |
| SO_4_H1 / PD_7_H1 / SP_5_H1 | 36–63 kr | 1 var | 2,5–4,4 | **Brus.** Ett köp vardera, indexet svänger på en konvertering |

**Om PD_1_H3:** den tar 65 % av budgeten och ger 60 % av köpen, och den är lönsam (ROAS 2,34,
ca 33 000 kr intäkt). Den gick från CPA 120 kr till 171 kr när den skalades, vilket är vad som
händer med varje annons som skalas, inte ett tecken på förfall. Meta la budgeten där för att den
håller under press. **Den ska inte bort. Den ska förbättras** — och eftersom den bär två
tredjedelar av budgeten är 10 % lägre CPA där värt mer än att perfekta en annons som spenderat
773 kr.

**Två regler härifrån:**
1. Ranka aldrig annonser mot varandra över olika spendnivåer utan att säga det högt. En CPA på
   400 kr spend är en hypotes, inte en dom.
2. Nya koncept med ett enda köp får **en** iteration, inte fyra. Bygg flotta först vid ≥3 köp
   eller ledande indikatorer (hook, completion, kostnad per LPV) som håller oberoende av
   konverteringarna.
3. **Iterationer viktas efter var pengarna ligger**, inte efter vilken annons som har snyggast
   nyckeltal. Volymbäraren får flest hookvarianter.

## Winning DNA (bevisat med data, ≥300 kr spend och ≥3 köp)

1. **Kort, komplett demo slår lång demo på effektivitet.**
   `PD_EXTRA`: CPA 96,59 kr · ROAS 4,18 · CTR 5,48 % · CPC 2,20 kr · hook 41,4 % · completion 10,3 %.
   Samma copy som PD_1_H3 men annan video → hela skillnaden ligger i videoinnehållet.
2. **Social proof-vinkeln ger billigast köp per klick.**
   `SP_1_H1`: CPA 116,79 kr · ROAS 3,42 trots kampanjens lägsta CTR (1,65 %). Färre men varmare klick.
3. **Offer fungerar när prisbeviset är synligt.**
   `SO_2` (statisk med pris i bild): CPA 125,58 kr · ROAS 3,37 på 1 381 kr.
   `SO_1_H2` (offer-video): CPA 94,67 kr · ROAS 3,68 — **kampanjens bästa CPA bland dömbara**.
4. **Statiskt format är underexploaterat men bevisat.** SO_2 ensam står för 11 av 139 köp till CPA under target.
5. **Copy-strukturen problem → mekanism → friktionssänkare → CTA** bär volymannonsen (PD_1_H3, 83 köp).

## Losing DNA (bevisat)

1. **Urgency utan bevis dödar CPA.** `SO_1_H1` ("kampanjpris" + "innan lagret tar slut", inga siffror i bild):
   CPA 175,62 kr · ROAS 2,02 på 1 932 kr — kampanjens sämsta dömbara. Hög CTR (4,70 %) + hög CPA = nyfikenhetsklick.
2. **Säsongsfel deadline.** "innan vintern" kördes i augusti. Används inte igen före september.
3. **Lång demo tappar effektivitet vid skala.** PD_1_H3 gick från CPA 119,74 kr (1 dygn) till 170,90 kr (livstid)
   när CBO:n pressade volym. Bra hook (35,5 %) men CPA över target.
4. **Overifierade claims.** "Hundratals nöjda kunder" kan inte beläggas (inga recensioner) — utfasat.

## Hook rate (p25/plays) — rangordning, alla videor med >100 plays

| Annons | Hook | Hold p50 | Completion |
|---|---|---|---|
| PD_EXTRA | **41,4 %** | 22,4 % | 10,3 % |
| SP_5_H1 (ny) | 38,2 % | 18,4 % | 5,5 % |
| SO_4_H1 (ny) | 35,9 % | 23,9 % | 12,0 % |
| PD_1_H3 | 35,5 % | 22,4 % | 7,3 % |
| SP_1_H2 | 35,4 % | 19,8 % | 10,2 % |
| SO_1_H1 | 30,2 % | 14,7 % | 4,2 % |
| PD_4_H1 (ny) | 30,0 % | 16,0 % | 4,0 % |
| SP_1_H1 | 29,4 % | 14,0 % | 5,7 % |
| PD_7_H1 (ny) | 29,0 % | 15,6 % | 7,8 % |
| SO_1_H2 | 24,5 % | 14,5 % | 5,0 % |
| PD_3_H1 (ny) | 22,9 % | 13,7 % | 7,6 % |

**Tolkning (data):** hook över ~35 % är tröskeln för de annonser som konverterar billigt.
**Tolkning (hypotes):** completion korrelerar starkare med CPA än hook gör — PD_EXTRA och SO_4_H1
har högst completion och bäst CPA. Testas explicit i nästa batch.

---

## Regler

**Behåll alltid**
- 299 kr / 367 kr exakt när pris visas · problem-först-öppning · "universell passform, enkel att sätta på/ta av"
- Handla nu-CTA · produkt i bild före sekund 4 · 420D Oxfordtyg, 6–250 hk, 30 dagars nöjd-kund-garanti

**Testa kontrollerat (en variabel)**
- Hook-varianter på PD_EXTRA-bodyn (bevisad vinnare, billigast att iterera)
- Kort (≤15 s) vs lång demo på samma body
- Synligt prisbevis i sekund 0–3 vs sist
- Social proof-VO på PD_EXTRA-footage (kombinera bästa CTR + bästa CVR)

**Undvik**
- Urgency utan synligt bevis · vinterreferenser före september · overifierade kundantal
- CTR-optimering utan CVR-koll (SO_1_H1-fällan)

**Obevisat (hypoteser i test)**
- Försäkrings-reframe ("motorns billigaste försäkring") — tidig signal ROAS 9,73 på 36 kr
- Torture test som bevis — tidig signal ROAS 6,17 på 56 kr
- Skeptiker-UGC — tidig signal ROAS 5,50 på 63 kr
- Utseende/andrahandsvärde-vinkeln (statiska PD_11/PD_12/SO_7) — ingen dömbar data än

## Ledande indikatorer när köpen är för få (använd dessa under 300 kr)

Vattentestet (PD_7_H1) såg bäst ut på ROAS men **sämst ut på det som inte hänger på ett enda köp**:
hook 29,0 % (under kampanjsnittet) och CTR 1,62 %. Försäkrings-vinkeln (SO_4_H1) hade hook 35,9 %
**och kampanjens högsta completion 12,0 %** — den har verkligt stöd i data som inte är brus.
Skeptiker-UGC (SP_5_H1) hade näst bästa hook 38,2 %.

Rangordning på ledande indikatorer, inte på ROAS:
1. **SO_4_H1** (försäkring) — hook 35,9 %, completion 12,0 %. Starkast stöd.
2. **SP_5_H1** (skeptiker) — hook 38,2 %.
3. **PD_7_H1** (vattentest) — hook 29,0 %, CTR 1,62 %. Svagast av de tre.
