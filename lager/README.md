# Lagerplanen — vad som tar slut, vad som ska beställas, vad som binder pengar

Byggd 2026-10-01 efter Axels order: "jag har problem med att planera lagerinköp … jag tycker det
är jättejobbigt". Metoden är Kanarys ur Evolve Supply Chain Program (modul 0 "Forecasting and
order planning" och "Last Minute CNY Prep"), sammanfattad i `ekonomi/evolve/SUPPLY-CHAIN.md`.

```bash
node lager/kor.mjs              # hämtar CWD:s ark och visar planen (tar ~10 s)
node lager/kor.mjs --skriv      # + lager/rapporter/<datum>.md och .json
npm run lager                   # samma som första raden
node --test lager/test/*.test.mjs
```

Läs-bart mot allt. Skriptet beställer ingenting, skriver inget i arket och rör inte Shopify.

## Var lagret finns

Allt vi har betalat i förväg ligger hos **CWD**, agenten i Kina (Slack-arbetsytan
`cwd-yqg1304`, kanalen `#axel-odhner-fulfill`, kontakterna Colleen och Larry). CWD fyller i
lagret i Google-arket **"Axel stock"** varje vardag, en ny flik per dag (`9.30updated`).
Arket är delat med länk, så skriptet läser det utan inloggning.

Mätt 2026-10-01 i arket (49 flikar, 31/7–30/9):

- **2 051 enheter i lager.** Störst: Mastern 650, sticker 291, Borst + PolérHuvud 179,
  Bävertratt 458 i fem färger, D2-kopplingen 123, Bäverkoppling 93, Bäverlampa Pro 90.
- **Matstrumpors strumpor står på 0** (sushi sedan 19/9), och det stämmer: lagret är slut.
  Förra lagerbeställningen var en bluff mot CWD, nytt är beställt och Axels 1 000 kommer inom
  tre dagar (Axel 2026-10-01). ⚠️ **"Fulfilled" i Shopify betyder inte skickat hos CWD** — de
  markerar ordern och skapar spårningsnumret direkt. Den här filen sa först att "allt skickas
  inom ett dygn" ur Shopifys fulfillments; spårningen visade samma kväll 415 ordrar
  (#4807–#5247, 819 sushilådor) vars paket inte rört sig sedan 22–23/9. Mät alltid skickat ur
  spårningen (`sparning/butiker/<id>/lage.json`: `CONFIRMED` = bara etikett), aldrig ur Shopify.
- **Uppmätt ledtid:** Mastern beställdes 1 000 st 13/8 och stod i lager 17/8 = 4 dagar.
  Planen räknar med 7 (4 + marginal) tills fler påfyllningar är mätta.
- **Mastern var slut 15–17/8** med 77 ordrar som väntade ("sold out:77" i arket).

Det mesta i Bäverbutiken har inget lager alls: CWD köper per order (dropshipping,
`factory/lagerpolicy.mjs`). De varorna behöver ingen lagerplan, bara ett bra styckpris
(`leverantor/FORHANDLING.md`).

## Så räknar den

| Tal | Hur | Var det ändras |
|---|---|---|
| Takt | utleveranser per dag **medan varan fanns i lager**, senaste 14 dagarna (30 om 14 är för tunt) | — |
| Dagar kvar | lager ÷ takt | — |
| Beställ senast | slutdagen − ledtid − säkerhet | `konfig.json` → `standard` |
| Beställ antal | takt × (ledtid + säkerhet + 30 dagar) − lager, uppåt till MOQ | `cykel_dagar`, `artiklar.<SKU>.moq` |
| Överlager | lager utöver 120 dagars behov, i kronor där Shopify har Cost per item | `overtackning_dagar` |
| Stilla | lager utan en enda utleverans på 30 dagar | — |
| Kinesiska nyåret | räcker lagret till 6/3 2027 + ledtiden? Annars: hur mycket som ska in före 28/1 | `kinesiska_nyaret` |

Takten räknas bara på dagar med lager. En vara som stått slut en vecka har inte sålt noll den
veckan, den har inte kunnat sälja. Att räkna med de dagarna ger för låg takt och nästa
slutförsäljning.

**Säsongsplanen** gäller varor vars lager inte syns i arket (Matstrumpor). Den läser
försäljningen ur Shopify (14 dagar), räknar enheter per order och ställer tre scenarier mot
förra säsongens månadskurva: dagens takt, 1×, 2× och 3× förra året. Glappet över kinesiska
nyåret (28/1–13/3) är det som ska ligga färdigt i lagret innan fabrikerna stänger.

## Kostnaden per vara

Cost per item läses ur Shopify för Bäverbutiken (`SHOPIFY_*_SE`) och Matstrumpor
(`SHOPIFY_*_1r46tp_qx`) och matchas på produktnamn + variant. Grillkliniken har inga nycklar i
miljön, så Mastern och grillsakerna står utan kronor. Sätt `kostnad_sek` per SKU i
`konfig.json` om de ska räknas.

## Kinesiska nyåret 2027

Nyårsdagen är **lördag 6 februari 2027**. Kanary (inspelat inför nyåret 2026):

- Ledtiderna **dubblas** veckorna före. En vara med 15–20 dagars ledtid tar 30–40.
- Sista skeppning ut ur Kina ~7–9 dagar före. Kinesiska 3PL:er stänger runt nyårsdagen i en vecka.
- Fabrikerna är tillbaka sista veckan i februari, men **normal kapacitet först runt mitten av mars**.
- Boka frakt tidigt. Containrar rullas till nästa vecka när alla skeppar samtidigt.

Datumen i `konfig.json` är räknade på samma avstånd. **CWD:s egna stängningsdagar är inte
frågade.** Byt talen när de svarat (`leverantor/meddelanden/2-nyaret.md`).

## Vad den inte vet

- Vad som är **på väg** till CWD (inköp som inte landat). Arket visar bara det som står på hyllan.
- Lagret för Matstrumpor (se ovan).
- MOQ per vara. Lägg in `moq` per SKU när CWD svarat.
- Säsongen för Bäverbutikens lagervaror. Takten är dagens; en julvara behöver
  `sasongsfaktor` per SKU.
