# /ugc – Uppdatera UGC-plan och deadlines

> **Innan du frågar användaren något:** fråga dig själv om det finns ett sätt att
> ta reda på svaret som du inte provat än — repo + git-historik, Drive, Notion,
> Meta, Shopify, product sheetet. Fråga bara när svaret kräver ägaren (pris,
> rabatt, target-CPA). Den som kör kan vara helt icke-teknisk: en fråga i taget,
> enkel svenska utan fackord, och ge alltid ett rekommenderat svar att säga ja till.

Argument: `$ARGUMENTS` — produkt-id + ny information.
Exempel: `/ugc strandtofflorna creator @annaxyz bekräftad, produkt skickas 7/8, behöver 7 dagar efter leverans`

1. Öppna UGC-databasen i Notion (kolumner enligt `docs/os/SOP-03-ugc-pipeline.md`).
2. Uppdatera raden. Deadlines om inget annat anges:
   - Beräknad leverans råmaterial = produkt skickad + 3 dagar frakt + creatorns filmtid (default 7 dagar)
   - Deadline råmaterial = beräknad leverans + 2 dagars buffert
   - Deadline färdig annons = deadline råmaterial + 3 dagar redigering
3. Råmaterial väntas inom 7 dagar → skapa redigerings-task på produktens Notion-sida enligt `docs/os/NOTION-FORMAT.md` (Draft, tag `Video - Pending Approval`, brief i itemet). Saknas brief: skriv UGC-briefen direkt utifrån `products/<id>/dna.md` — **copy/voiceover via subagent med `model: "sonnet"`**.
4. Visa hela pipelinen som tabell, sorterad på närmaste deadline, 🔴 på förseningar.

## DEFINITION OF DONE
- [ ] Notion-raden uppdaterad
- [ ] Deadlines enligt reglerna
- [ ] Redigerings-task skapad om leverans < 7 dagar bort
- [ ] Pipelinen visad med förseningar markerade
