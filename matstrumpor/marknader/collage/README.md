# Startsidans collage "Matstrumpor i världen" (2026-09-29)

Axels beställning: bilder med UGC-kreatörer och flaggor för länderna vi säljer i,
strumporna lite överallt i världen — **bara på startsidan**.

- `collage.json` — promptarna (12 länder + en globbild), referensbilderna är butikens egna produktfoton.
- `bilder.mjs` — genererar bilderna via kie.ai (`--igen <id>` gör om en). Bilderna i `bilder/` är krympta till 900 px.
- `ms-varlden.liquid` + `tema.mjs --skarpt` — lägger bilderna som assets, sektionen och raden i `templates/index.json` (efter "berattelse") i det publicerade temat.

Rubriken följer butikens språk (12 språk, Liquid-`case`), landsnamnen står på landets eget språk,
och besökarens eget land läggs först (orange etikett).

⚠️ Personerna är AI-genererade. Rutorna bär bara landets namn — aldrig citat, namn eller "kund".
⚠️ AI-kartor blev fel två gånger (strumpor i Afrika, Sydamerika, Kina) — därför en globbild i stället för en karta.

Omgång 2 samma dag (Axels dom: "hyperrealistiskt eller tydligt tecknat — ingen halvdålig AI slop"): alla 13 omgjorda som mobil/blixtfoton i riktiga hem, i samma stil som sajtens "Som de används"-bilder (en av dem är referensbild), flaggan som en naturlig del av miljön. AI-raden under collaget = samma text som "ugc_markning". Läst som kund: SE, NO, US, 0 trasiga bilder, dator + mobil.
Ta bort: radera sektionen "Matstrumpor i världen" på startsidan i temaredigeraren.

**Omgång 3, samma dag, gäller nu** (Axel: "hellre animerade bilder bara"): alla 13 som tecknade
illustrationer i loggans kawaii-stil (loggan + produktfotot som referens), en figur per land med
landmärke och flagga, globen med sockhalsduk överst. Ramar som modellen ritade själv gjordes om (NO, NL, GB),
och Norges vita kant beskars i koden. Läst som kund: SE, NO, US, 0 trasiga bilder, dator + mobil.
