# Status Beverbutikken (norska butiken) — 2026-08-06

## ✅ Klart i butiken (allt som utkast/opublicerat där det går)

| Del | Resultat |
|-----|----------|
| Produkter | **134/134 skapade och AKTIVA**, 0 fel. Norsk copy, BEVER-SKU:er, NOK-priser, supplier-SKU som metafält (custom.supplier_sku), bilder kopierade till butikens CDN |
| Kanalpublicering | **Alla 134 produkter + 8 kollektioner publicerade till Onlinebutik-kanalen ("Webbshop")** 2026-08-07. Obs: API-skapade objekt hamnar INTE i kanalen automatiskt — det var därför sajten först såg tom ut |
| Kollektioner | 8 st: Forside (2), Hage & Utendørs (20), Bil Verktøy & Garasje (25), Camping & Friluft (28), Landbruk & Dyr (5), Båt & Marine (10), Tilbehør & Annet (10), Kjøretøy & Belysning (20) |
| Kollektionskontroll | Stämmer mot källan — Landbruk 5 (ej 6: arkiverad fågeldrickare exkluderad korrekt), Marine 10 (ej 11: Marin Polish var draft i källan, exkluderad korrekt) |
| Sidor | Om oss, FAQ, Kontakt, Fraktinformasjon, Retur & angrerett, Kjøpsvilkår — publicerade (butiken är ej live) |
| Menyer | Hovedmeny (kategorier + Alle produkter + Kontakt), Bunntekstmeny (sidor + personvern-länk) |

16 produkter tillhör ingen kategorikollektion (samma som i källbutiken — nya vågen från 1 aug + legacy + fraktgaranti). De syns under "Alle produkter".

## ✅ Tema (2026-08-07)

Svenska temat (Impulse, "theme-export-baverbutiken-se-theme-export-trev") uppladdat av Axel
och komplett norskifierat via API i det OPUBLICERADE temat (gid …193356562807):
- Startsida: hero "Tøfler – Heavy Duty" + "Kjøp nå" → norsk produkt, hero-bild kopierad från
  svenska CDN, 7 kategorirutor → norska kollektioner, nyhetsbrev + kontaktskjema på norska.
- settings_data: vit Beverbutikken-logga i header/sidfot, svart i kassan, norska banners
  (FRI FRAKT över 300 kr `[JURIDISK GRANSKNING – måste matcha faktisk fraktinställning]`,
  Klarna-banner), BEVERKLUBBEN, firmatext STONEBITE ECOM AB, valutaväljare av.
- 14 mallar norskifierade (produktsida inkl. säljargument + "i Norge", kollektion, cart,
  404, blogg, kontakt, FAQ, password m.fl.).
- Default theme content: alla 551 locale-nycklar översatta till bokmål och skrivna till
  sv.json + en.default.json + nb.json (verifierat). Kopia i output/theme-locale-nb.json.

**Återstår för Axel: förhandsgranska temat och klicka Publish** (spärrat för API, med flit).
Kvarlämnat medvetet: GemPages-sektioner/-mallar (kampanjsidor, svenska) — används ej av
startsidan; städas eller översätts vid behov.

## 🟡 Att slipa (Axel eller nästa arbetspass)

1. **Butiksnamn**: butiken heter "Beverkobling.no" i Shopify — byt till **Beverbutikken** i Settings → General (ingen API-mutation finns för detta).
2. **Antiskli-tape**: variantoption har fel namn (hela produkttiteln i stället för t.ex. "Lengde") + källdatan hade motstridiga längder (5/6/10 m) — rätta manuellt.
3. **Gamla Kungpressen-rester**: 2 arkiverade produkter + svenska sidor (Integritetspolicy/Fraktpolicy/Retur/3 Års Garanti/Kontakta) ligger kvar — radera eller lämna (syns ej för kunder). Forside-kollektionen innehåller den arkiverade Kungpressen + Beverlampe Pro.
4. **Tema + logotyp**: ej gjort. Butikens live-tema är "theme-export-beverkobling-no…". För svensk look: exportera temat från Bäverbutiken-admin (zip) → importera här, så översätter jag alla temattexter via API. Logotyp: grov Beverbutikken-wordmark kan tas fram.
5. **Personvernerklæring**: generera norsk mall i Settings → Policies, se `content/pages/personvern-NOTAT.md`.

## 🔴 Kräver Axel före lansering

- VOEC-registrering (annars måste "ingen toll"-texterna skrivas om)
- Fraktpriser (förslag 79 NOK / fritt över 999 NOK) + fraktzon Norge
- Betalning (Shopify Payments/Klarna/ev. Vipps), domänkoppling beverbutikken.no, supportmail
- Juridisk slutgranskning: alla `[JURIDISK GRANSKNING]`-flaggor i `output/build-report.md` + sidorna
- Aktivering av produkterna (draft → active) — görs på ditt GO, kan göras i bulk per kollektion

## 🇳🇴 /oversatt — körlogg (Notion-kön `SE-ACTIVE to be translated` → Magiborsten NO)

| Datum | Kö | Bilder | Video | Upp i kontot | Hoppade | Krediter | Anm |
|---|---|---|---|---|---|---|---|
| 2026-09-03 | 44 rader, 5 produkter | 44 | 0 | 44 ACTIVE i produkternas befintliga kampanjer; 20 nya adset klonade från syskon-adset (nya vinklar) | 0 | Kie 16 593 → 16 593 (bilderna översätts lokalt), HeyGen orörd | Första körningen. Metas skrivbudget (kod 17) stoppade efter 4 annonser — backoff i minuter (`tools/meta-lib.mjs`) löste det, omkörningen räknade de 4 som klara. Alla 44 QA-bilder lästa. Notion: kommentar + Translated url + `Translation in review`. |
| 2026-09-05 | 4 rader, 2 produkter (IBC-tanktrekk 2, Beltesliper 2) | 4 | 0 | 4 ACTIVE i produkternas befintliga kampanjer; 1 nytt adset (IBC-tanktrekk NO - CO, klon av GT) | 0 | Kie 16 389 → 16 389 (bilderna översätts lokalt), HeyGen orörd | Kön läst via Notion-MCP (NOTION_TOKEN saknas i sessionen) — 8 hubbar, de arkiverade saknar statusen i schemat. IBC_CO_1_1 krävde override (halvgenomskinlig topplatta över foto, som Batmotor_CO_1_1). Beltesliper-priser 909/1 182 → 1 029/1 715 kr. Metas skrivbudget (kod 17) gav 4 backoff-väntor, alla gick igenom. Alla 4 QA-bilder lästa. Notion: kommentar + Translated url + `Translation in review` på alla 4 (MCP-kopplingen tappades halvvägs, läget lästes tillbaka innan resten sattes). Discord-brief skickad. |
| 2026-09-05 (runda 2, Axels begäran) | 14 rader, 3 produkter (IBC-tanktrekk 7, Overvåkingskamera 5, Kranbeskyttelse 2) | 14 | 0 | 14 ACTIVE i produkternas befintliga kampanjer; 4 nya adset klonade (IBC BOF + RV, kamera BOF, kran CI) | 0 | Kie 16 389 → 16 389 (lokal komposition), HeyGen orörd (621 kvar) | Kön läst via Notion-SQL över 7 aktiva hubbar (Belt grinder, IBC, Kranskydd, Motorcycle, Surveillance, Boat motor, Smiley); Men's Plush Slippers och Gravstenspenna saknar statusen/är raderad. Axels beslut: norska bilden läggs ÖVERST i Notion-raden (gjort på alla 14 + förmiddagens 4). Sex bilder krävde override: BOF-mallens vita fraktrad på fotot (textljus), halvgenomskinliga topplattor (IBC_BOF_2_1, kamera BOF_3_1), delad platta (kamera BOF_1_1), spökrester (IBC_BOF_3_1, IBC_RV_1_1). Två strykningsbuggar rättade (hela prisraden ströks; block utan strykning). Kranskydd_PD_7_1: "Fri frakt oavsett var i Sverige" struken (219 kr < 300 kr) → "Trygg betaling med Klarna". Alla 14 QA-bilder lästa, sex omgjorda och lästa igen. Metas skrivbudget: backoff upp till 240 s, alla gick igenom. Notion: kommentar + Translated url + `Translation in review` + bild överst. Kvar i kön: 2 videor (Beltgrinder_PD_4_H1, PD_5_H1) som kom in under körningen — tas av 15:00-rutinen. |
| 2026-09-05 (video, Axels begäran) | 2 videorader, Beltesliper (PD_4_H1, PD_5_H1) — kom in under dagen | 0 | 2 | 2 ACTIVE i Beltesliper NO - PD | 0 | HeyGen 621 → 596 (två 10-sekundersvideor), Kie orörd | Proofread → sonnet-SRT (909 kr → 1 029 kr, "slipeskive" → "slipestein") → render → captions. Båda videorna har inbränd svensk text: PD_5 ordcaptions (band 836:912 i 720×1280), PD_4 både rubrikband (445:700) och ordcaptions — rubrikpasset måste köras FÖRE captionpasset, annars kopieras captionrutan in i rubrikbandet (mätt: första försöket gav spökrest). Rubrikerna fick egna norska cues (0,25–2,85 / 2,95–4,15 / 5,45–6,7 s). QA-bilder lästa. Notion: kommentar + Translated url + `Translation in review` + videon överst. Samma dag: onsdagens 44 rader fick den norska bilden inlagd överst (hämtad ur Magiborsten NO via annons-id) och sex hubbar fick fliken 🇳🇴 Norsk granskning. |
