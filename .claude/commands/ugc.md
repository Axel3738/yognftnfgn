# /ugc – Uppdatera UGC-plan och deadlines

Argument: `$ARGUMENTS` — produkt-id + ny information.
Exempel: `/ugc strandtofflorna creator @annaxyz bekräftad, produkt skickas 7/8, behöver 7 dagar efter leverans`

1. Öppna UGC-databasen i Notion (kolumner enligt `docs/os/SOP-03-ugc-pipeline.md`).
2. Uppdatera raden. Deadlines om inget annat anges:
   - Beräknad leverans råmaterial = produkt skickad + 3 dagar frakt + creatorns filmtid (default 7 dagar)
   - Deadline råmaterial = beräknad leverans + 2 dagars buffert
   - Deadline färdig annons = deadline råmaterial + 3 dagar redigering
3. Råmaterial väntas inom 7 dagar → skapa redigerings-task i creative-databasen (Draft – Pending approval) kopplad till en brief. Saknas brief: skriv UGC-briefen direkt utifrån `products/<id>/dna.md` — **copy/voiceover via subagent med `model: "sonnet"`**.
4. Visa hela pipelinen som tabell, sorterad på närmaste deadline, 🔴 på förseningar.

## DEFINITION OF DONE
- [ ] Notion-raden uppdaterad
- [ ] Deadlines enligt reglerna
- [ ] Redigerings-task skapad om leverans < 7 dagar bort
- [ ] Pipelinen visad med förseningar markerade
