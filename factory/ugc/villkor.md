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
- **Beloppen är exklusive moms** (Axel 2026-09-24): 1 500 kr exkl. moms;
  momsregistrerade kreatörer lägger på moms på fakturan.
- **Konton (Axel 2026-09-24):** VA:n gör allt från Google-kontot
  `claude.employees@stonebite.org` (Gmail, Sheets, Drive, Claude via "Continue
  with Google") och skriver till kreatörer från Instagram
  `stonebite_organisation`, som värms upp 14 dagar först (handbokens kapitel 1).
  Lösenorden står BARA i `va-kit/inlogg.local.json` (gitignorerad) och i
  VA:ns "0 - YOUR LOGINS (secret).pdf" — aldrig i repot eller i handboken som
  laddas upp i Claude-projektet. Saknas filen i en ny container: be Axel om
  inloggningarna igen innan paketet byggs.
- **Två varumärken (Axel 2026-09-25):** Bäverbutiken OCH Matstrumpor.se — VA:n
  väljer bland båda butikernas bästsäljare, [BUTIK] i mallar och avtal.
  Tidigare kreatörer (t.ex. Nathalie) kontaktas först med mallen "Returning
  creator", nytt avtal per video.
- **VA:n frågar aldrig Axel** (Axels order 2026-09-24: "jag vill aldrig behöva se
  nått annat än möjligtvis fakturan"). Varje utfall har en egen regel i SOP:en;
  det som saknas avgörs av fem regler ("When nothing fits"). VA:n väljer själv
  produkter bland butikens 20 bästsäljare (minst 300 kr, lätta att filma), max 2
  åt gången, **max 6 nya affärer per månad** (Claudes beslut — budgettak ca
  9 000-18 000 kr/mån exkl. moms + produkter). Axel får bara fakturorna.
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
