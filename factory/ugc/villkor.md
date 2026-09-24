# UGC-villkor — beslutade av Axel 2026-09-06

Beslutade i chatt 2026-09-06. `/ugc-scout` får skriva meddelanden med exakt
dessa villkor. Ändras de: uppdatera här först, aldrig i ett enskilt meddelande.

| Fält | Värde |
|---|---|
| Ersättning per video | **1 500 kr** som standard. Kreatörer med **14–16 poäng** i `vetting-framework.md`:s poängmall får erbjudas upp till **3 000 kr** per video (Axels besked 2026-09-06: beredd att betala mer för riktigt bra kreatörer). Nivån väljs innan meddelandet skrivs och står i meddelandet. |
| Antal videor per samarbete | 3 videor (testsamarbete; förlängning diskuteras efter leverans) |
| Produkt ingår | Ja — kreatören får produkten och behåller den |
| Rättigheter | Full rätt att använda videorna i betald annonsering, alla kanaler, utan tidsgräns |
| Leveranstid efter mottagen produkt | 14 dagar |
| Betalningssätt och när | Swish, inom 7 dagar efter godkänd leverans |
| Exklusivitet | Ingen — kreatören får jobba med andra varumärken |

## Ändrat 2026-09-24 (Axel) — gäller före tabellen ovan

- **Betalning: faktura** till Stonebite Ecom AB efter mottagen OCH godkänd
  video, 30 dagar. Aldrig Swish, aldrig förskott. Kreatör utan företag
  fakturerar via Frilans Finans/Cool Company/Gigapay.
- **Råmaterialet ingår alltid** (alla oredigerade klipp).
- **Inga extra rättighetsavgifter:** användningsrätten ingår i priset, ingen tidsgräns.
- **Förhandlingstaktiken:** långsiktigt samarbete över många produkter
  (Bäverbutiken testar nya produkter hela tiden) i stället för högre pris.
- **Evolves svar 2026-09-24 inlagda** (`factory/ugc/evolve-svar-2026-09-24.md`):
  första affären är **1 video + allt råmaterial (3–5 hook-tagningar m.m.)**
  från **3 olika kreatörer per produkt**, i stället för 3 videor från en.
  Skriftligt avtal (`va-kit/AGREEMENT.md`, utkast tills en jurist läst det)
  godkänt med fullständigt namn, inte ett "ja". Brief = ramverk, aldrig
  manus. Facebook-grupper först, marknadsplatser sist. Efter en vinnare
  beslutar Axel nästa steg; VA:n lovar aldrig retainer eller bonusbelopp.
- **Inget månadsarbete, ingen retainer, ingen bonus** (Axels val B
  2026-09-24): en video i taget, även efter en vinnare.
- **Paketet levereras som PDF** (Axels dom samma dag: .md går inte att läsa
  på Windows): `python3 factory/ugc/bygg-va-paket.py <utmapp>` bygger
  "1 - START HERE.pdf", "2 - VA Handbook.pdf", en .txt för Claude-projektet
  och CSV-mallarna. Källan är fortfarande `va-kit/*.md` — ändra där, bygg om.
- **VA:n sköter allt själv** med paketet `factory/ugc/va-kit/` på ett eget
  Claude-konto — INTE i det här repot. Kreatörerna sparas i hennes Google
  Sheet, inte här. Paketets `TERMS.md` är hennes kopia av villkoren: ändras
  något här, ändra där också och skicka henne den nya filen.
