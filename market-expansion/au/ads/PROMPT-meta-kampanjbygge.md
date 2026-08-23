# Prompt: bygg AU-kampanjen i Meta (klistra in i en session med Meta Ads-koppling)

Bygg en Meta-annonskampanj åt mig i annonskontot **Snark Mexico**. Gör allt nedan exakt —
fråga bara om något saknas eller inte går att hitta, ändra inga värden på eget bevåg.
Skapa allt PAUSAT — jag aktiverar själv.

## Kampanj
- Namn: `AU — Mastern — CBO — Video — v1`
- Mål: Försäljning (Sales)
- CBO (Advantage campaign budget), daglig budget **2 000 SEK**
- Budstrategi: högsta volym (lowest cost), inget budtak

## Adset (exakt ETT)
- Namn: `AU — Video — All — Broad`
- Pixel: **Grillkliniken Pixel**, optimeringshändelse: **Purchase**
- Geografi: Australien. Ålder 25–65+. Inga intressen, inga custom audiences, språk tomt (broad)
- Placeringar: Advantage+ (automatiska)
- Attribution: 7 dagars klick / 1 dags visning

## Annonser — 18 st, en per video
Videorna ligger redan uppladdade i kontots mediebibliotek och heter:
AU_001, AU_050, AU_110_H1, AU_110_H2, AU_110_H3, AU_128B_H1, AU_128B_H2, AU_128B_H3,
AU_128B_H4, AU_128B_H5, AU_235_H1, AU_235_H2, AU_235_H3, AU_235_H4, AU_Mastern_ad01,
AU_Meta_AQO, AU_Rea_01 (filnamn med .mp4).
Hittar du inte alla 18: skapa annonserna för dem du hittar och lista vilka som saknades.

Varje annons:
- Namn = videons filnamn utan .mp4 (t.ex. `AU_110_H1`)
- Facebook-sida: **The Barbecue Clinic** (Instagram: koppla sidans IG-konto om det finns, annars bara FB)
- Format: en video, ingen katalog, inga Advantage+ creative-förbättringar som skriver om text
- Destination: `https://thebbqclinic.com/products/the-master-electric-bbq-brush`
- CTA-knapp: Shop Now
- Miniatyr: Metas autoval

Samma copy på ALLA annonser, exakt så här:

Primary text:
```
Been putting off cleaning the BBQ since last summer?

The electric BBQ brush from The BBQ Clinic does the job for you — press a button and the grates are clean in minutes. No scrubbing, zero effort.

✔ Cordless and rechargeable
✔ Rotates 180° — gets into every corner
✔ Interchangeable brush heads, easy to wash

Click the link and order yours today.
```

Headline:
```
Clean grates in minutes, no bristles
```

Description:
```
Electric BBQ brush with interchangeable heads. Cordless, rechargeable and easy to use. Order yours today.
```

URL-parametrar på alla annonser:
```
utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

## Kontroller innan du är klar (rapportera resultatet av varje)
1. Att pixeln som valdes verkligen heter "Grillkliniken Pixel" och att den tagit emot händelser
   från domänen **thebbqclinic.com** nyligen (kolla Events Manager). Om pixeln bara har trafik
   från grillkliniken.se: FLAGGA det tydligt och pausa — då mäter kampanjen inga köp.
2. Att annonskontots valuta är SEK (annars är budgeten 2000 i fel valuta — flagga och fråga).
3. Att alla annonser fick status "Klar/Granskas" utan policy-flaggor.
4. Att allt ligger PAUSAT.

## Rapportera tillbaka
- Kampanj-ID, adset-ID och lista över skapade annonser (namn + ID)
- Vilka videor som ev. inte hittades
- Utfallet av de fyra kontrollerna
