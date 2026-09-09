# /ugc-scout – hitta UGC-kreatörer och förbered outreach

Argument: `$ARGUMENTS` — butiks-id (ex `hemvakten`) + valfritt antal (default 20).
Exempel: `/ugc-scout hemvakten 30`

Hittar svenska UGC-kreatörer (blandat män och kvinnor) som passar butikens
produkt, bygger en kontaktlista i repot och skriver färdiga
outreach-meddelanden. **Skickar ALDRIG något utan Axels uttryckliga ok per
batch** — utskick är en egen, bekräftad handling.

## Förberedelser (stoppar utan dem)

1. Läs `factory/butiker/<id>.yaml` (brand, tonalitet) och
   `factory/produkter/<id>.yaml` (produkt, målgrupp, vinklar).
2. Läs `factory/ugc/villkor.md` — ersättning, antal videor, rättigheter,
   leveranstid. **Saknas filen: STOPP.** Skriv aldrig ett meddelande som
   lovar villkor som inte är beslutade. Be Axel fylla i mallen i stället.
3. Läs `factory/ugc/kreatorer.md` om den finns — kontakta aldrig samma
   kreatör två gånger.

## Steg 1 — hitta kreatörer

Läs först `factory/ugc/vetting-framework.md` (byggs av `/ugc-research`) —
varje kandidat ska genom snabbfiltret innan den hamnar på listan, och
poängen ur poängmallen skrivs in i tabellen. **Saknas framework-filen:
kör `/ugc-research` först.**

Sök brett med WebSearch (TikTok, Instagram, UGC-plattformar som Sprww,
Vocast, Influee; sökord: "UGC kreatör Sverige", "svensk UGC creator",
nisch-ord från produkten — för hemsäkerhet: hem, villa, "smart home",
förälder/villaliv).

Krav på listan:
- **Målet är hälften män, hälften kvinnor** — sök aktivt efter båda,
  redovisa fördelningen.
- Svensktalande. Nisch som passar produkten och målgruppen.
- Bara publikt listade kontaktvägar (mejl i bio, kontaktformulär,
  UGC-plattformsprofil). Gissa aldrig mejladresser.
- Per kreatör: namn/alias, plattform + länk, kontaktväg, kön, nisch,
  följarantal (om synligt), varför hen passar produkten (en rad).

Skriv/uppdatera `factory/ugc/kreatorer.md` — en tabell, med statuskolumn
(`ny / kontaktad <datum> / svarat / avtal / nej`). Committa inte utan att
Axel bett om det (filen innehåller persondata — håll den i repot, aldrig i
publika artefakter).

## Steg 2 — skriv meddelandena

- Ett meddelande per kreatör, personligt (referera till något hen faktiskt
  gjort), på svenska, avsändare = butikens brand.
- Följ butikens tonalitet ur `branding:` (för Hemvakten: sakligt, lugnt,
  inga utropstecken).
- Innehåll: vem vi är, produkten, vad vi erbjuder (EXAKT ur villkor.md),
  vad vi vill ha, hur man svarar. Max ~120 ord.
- Inga påhittade siffror, inga "vi älskar ditt konto"-floskler.
- Meddelandena läggs i `factory/ugc/utskick/<datum>-<id>.md`, ett block per
  kreatör med kontaktväg ovanför.

## Steg 3 — utskick (kräver Axels ok)

1. Visa Axel: antal, könsfördelning, kanalfördelning och 2 exempelmeddelanden.
2. Vänta på hans ok för batchen. Inget ok = ingenting skickas.
3. Med ok: skicka via de kanaler sessionen faktiskt når (mejl-connector om
   kopplad). DM:ar på TikTok/Instagram kan inte skickas härifrån — de
   levereras som copy-paste-lista till Axel eller butikens redigerare.
4. Uppdatera statuskolumnen i `kreatorer.md` efter varje skickat meddelande.
5. Max 20 utskick per körning — hellre två batcher än ett massutskick som
   fastnar i spamfilter.

## DEFINITION OF DONE
- [ ] villkor.md fanns och användes (annars stoppat och bett Axel fylla i)
- [ ] Lista med kreatörer i `factory/ugc/kreatorer.md`, könsfördelning redovisad
- [ ] Inga dubbletter mot tidigare kontaktade
- [ ] Personliga meddelanden skrivna med exakta villkor, sparade i utskick-mappen
- [ ] Axel har sett batchen och sagt ok FÖRE något utskick
- [ ] Status uppdaterad per kreatör efter utskick
