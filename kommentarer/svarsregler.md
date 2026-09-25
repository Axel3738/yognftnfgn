# Svarsregler för annonskommentarer — Axels facit

Källa: Axels granskning av 50 svarsförslag, 2026-09-25 (sidan
https://claude.ai/artifact/JjZm9G4vJD2MEWCMSBeZeU, samlingen `beslut`).
Utfall: **26 Ja · 19 Ändra · 5 Nej.** Varje svarsförslag i `/kommentarer`
skrivs mot den här filen och `kommentarer/produktfakta.md`. Subagenten som
skriver svaren får båda filerna.

## Reglerna

1. **Låt aldrig osäker om våra egna produkter.** "Vi vet inte", "vi har
   ingen info", "vi har inte testat" underkändes varje gång (#5, #7, #10,
   #11, #14, #18, #25, #32). Axel: *"skriv inte som att du är osäker på
   våra egna produkter"*.
2. **Kan du inte svaret: tänk själv först, hoppa annars.** Går svaret att
   resonera fram ur hur produkten är byggd, så gör det (#32: *"försök klura
   ut någonting … var inte dum i huvudet"*). Går det inte: föreslå inget
   svar (#11: *"du behöver inte svara på de här frågorna om du inte kan
   svaret"*). Frågan hamnar i stället på listan till leverantören (regel 3).
3. **Varje okänd produktfråga blir en fråga till leverantören.** Varje
   körning skriver en lista "Frågor till leverantören" i rapporten. Axel
   skickar den vidare på WhatsApp. Svaret förs in i `produktfakta.md`.
4. **Produktproblem från köpare går till leverantören.** En köpare som
   beskriver ett fel på varan (#31: banden och plastkrokarna) svaras vänligt
   i kommentaren, och felet står i rapporten under frågorna till
   leverantören.
5. **Köpare med fel storlek eller missnöje: nämn ångerrätten** (#2) utöver
   "hör av dig med ordernumret". Svenska: "14 dagars ångerrätt enligt lag".
6. **Fel i vår egen annons: säg det rakt ut.** Fick kunden fel bild av
   annonsen (#8: en video visade en fjärrkontroll som inte följer med), så
   erkänn felet kort och säg hur det är.
7. **Hitta aldrig på en användning.** Står det på produktsidan men Axel
   säger emot, så gäller Axel (#30: spöhållarna är inte byggda för vägg
   eller båt). Då står det i `produktfakta.md`, och produktsidan ska rättas.
8. **Skämt och beröm: svara kort och glatt.** Alla skämt- och tack-svar fick
   Ja (#12, #33, #35, #44, #46, #47, #48).
9. **Skeptiker utan köp: fråga vad som fick dem att tveka.** "Vad är det som
   gjort dig skeptisk? Hör gärna av dig om något är fel" fick Ja (#1, #3, #42).
10. **Nej betydde "inget bra svar finns"**, inte "svara aldrig på sådana":
    de fem Nej (#13, #36, #37, #40, #41) var alla svar som antingen var
    tomma ("vi vet inte") eller argumenterade emot kunden.
