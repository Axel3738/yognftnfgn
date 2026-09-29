Matstrumpors kundmejl på alla tolv språk. Läs CLAUDE.md, sedan mejl/README.md, sparning/README.md (avsnittet "Fler butiker", CaraShells flerspråkiga mall) och matstrumpor/marknader/README.md.

Läget (mätt 2026-09-29): Matstrumpor säljer från matstrumpor.se till Norge, hela Europa och USA/UK/AU/CA/NZ på tolv språk: sv, nb, da, fi, en, de, fr, nl, es, it, pl, pt-PT (URL-mappen /pt). Domänerna matstrumpor.no, matstrumpor.eu och matstrumpor.com är kopplade. Men butikens egna fraktmejl (fraktbekräftelse, fraktuppdatering, ute för leverans — byggda 2026-09-21 med `node mejl/bygg-butik.mjs matstrumpor`, filerna i mejl/output/butiker/matstrumpor/) är BARA svenska: mejl/butiker/matstrumpor.json saknar `mejl_marknader`, och mejl/sprak/ har bara sv, nb, da, fi och en. En tysk, fransk eller norsk kund får alltså svenska mejl så fort annonserna går igång. Förlagan finns: CaraShells mall väljer språk i EN mall med `{% case shipping_address.country_code %}` och registret `mejl_marknader`.

Uppdraget:
1. Mät först. Vilka av Matstrumpors notiser är egna mallar och vilka är Shopifys standard (orderbekräftelse, återbetalning, avbokning, presentkort)? Skickar Shopify standardmallarna på kundens språk redan (läs Shopifys dokumentation, och prova om notisernas text finns som översättningsbar resurs via Admin API, typ EMAIL_TEMPLATE i translatableResources)? Skriv ner vad du mätte, var och när.
2. Välj språket på det språk kunden handlade på (orderns kundspråk), med leveranslandet som reserv och engelska sist. Landet räcker inte i Europa: Belgien och Schweiz har flera språk. Kontrollera variabelnamnen i Shopifys dokumentation, gissa inte.
3. Språkfilerna mejl/sprak/{de,fr,nl,es,it,pl,pt}.json skrivs av sonnet-subagenter (CLAUDE.md regel 6) mot sv.json och butikens egna ord i matstrumpor/marknader/output/underlag-<locale>.json. Varje språk granskas av en skeptisk granskare som läser språket som infödd. Fynden läggs in innan något byggs.
4. Spårningslänken i mejlet ska landa på spårningssidan på kundens språk. Sidan har alla tolv språk och byter på sidans språk, så länken behöver språkmappen (till exempel matstrumpor.se/de/pages/spara?nummer=MS-…) eller kundens egen domän. Prova länken som kund för varje språk.
5. Bygg mallarna och Cowork-prompten (mejl/output/butiker/matstrumpor/COWORK-PROMPT.md) för det som bara går att klistra in för hand. Hittade du en API-väg i steg 1, använd den och läs tillbaka. Testmejl per språk ska stå i planen.

Regler:
- Leveransfönstret skrivs aldrig i ett mejl som bär spårningslänken (Axels order 2026-09-21), och löftet heter alltid "5–10 arbetsdagar".
- Adressen är Stenkolsgatan 1B, 417 07 Göteborg. Sjöhed 160 får aldrig stå någonstans.
- Rör inte temat, inte matstrumpor/marknader/ (annonser, underlag, domantema, presentkort) och inga annonser i Meta. En annan session jobbar där.
- Inget skickas till riktiga kunder. Testmejl går bara till butikens egen adress.
- Egen gren, `npm test` grönt, commit och PR, merga till main när det är klart.
- Svara Axel på svenska, kort. Hans egna klick står sist, numrerade, en mening per rad, med exakt var han ska klicka.
