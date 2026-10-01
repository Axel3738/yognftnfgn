# Enkätutskicket till tidigare kunder (Matstrumpor, oktober 2026)

Axels order 2026-10-01: "Kan vi inte också skicka ut till alla våra befintliga / tidigare
kunder. Dock måste vi exkludera dessa" + 41 adresser (hashade i `undantag.json`, adresserna
står aldrig i repot).

## Beslut som sessionen fattade

- **Publiken är svenska köpare MED samtycke** (`SEG_samtycke_sv` `66dae6c7-55e4-43d5-b1ef-8e23f5baa3a4`
  + `totalOrders ≥ 1` + e-post inte i undantaget). Ett mejl som ber kunden om något åt
  butiken räknas lätt som marknadsföring (MFL 19 §), och kampanjer går bara till
  `subscribed` (CLAUDE.md, Klaviyo-avsnittet). Köpare utan samtycke får enkäten bara i
  orderbekräftelsen när de handlar igen.
- **Svenska.** Enkätsidan är svensk; andra språk har ingen enkät (beslut A 2026-10-01).
- **Kanalkoden `k=mejl`**, så svaren går att skilja från orderbekräftelsens `k=ob`.
  Ingen produkt i länken: kampanjen vet inte vad var och en köpte.
- **Tiden fredag 2/10 18:00.** Inte en tisdag, för då går K-kampanjerna (K02 tis 6/10).
- Ingen belöning, inget säljande, ingen rabatt, inget leveranslöfte.
- `konfig.json → sidor_att_lasa` höjt 3 → 8 så att timrutinen hinner flytta ett svarsrus ur
  inkorgen innan Mechile drunknar.

## Mejlet

Ämnesrad (25 tecken): **Tre snabba frågor från oss**
Förhandstext: **Varför köpte du? Svara med egna ord, det tar en minut.**

> Hej!
>
> Du har handlat hos oss, och vi skulle gärna vilja veta varför. Vad hände som fick dig att
> köpa? Var såg du oss första gången? Och köpte du till dig själv eller till någon annan?
>
> Tänk tillbaka på när du köpte och svara med egna ord, så kort eller långt du vill. Alla
> frågor är frivilliga, och vi frågar inte efter namn eller e-post.
>
> **[Svara på frågorna]** → `https://matstrumpor.se/pages/enkat?k=mejl`
>
> Tack för att du tar dig tid!

Sidfoten och "Avregistrera dig" lägger Spoks till själv.

## Läget

- 2026-10-01: mejlet och Cowork-prompten (`../cowork/3-utskick-tidigare-kunder.txt`) skrivna.
  Prompten i repot saknar adresslistan med flit; Axel fick den hela i chatten.
- ✅ **2026-10-01 kväll: schemalagd fre 2/10 18:00 ("Planerad" i Spoks)**, av Cowork i Axels
  webbläsare. Segmentet "Enkät tidigare kunder (utan 41 undantag)": 2 729 utan undantaget,
  **2 690 med** (39 färre; två av de 41 fanns inte bland samtyckande svenska köpare).
  Spoks saknar `not in` för e-post, så undantaget är 41 `ne`-villkor i "alla måste gälla"-grupper.
  Tre undantagsadresser provade, ingen syntes. Spoks räknar med **2 649 utskick** (spärrade och
  studsande bortdragna). Kampanjtitel "Enkät tidigare kunder · fre 2/10 18:00". Testmejl till Axel
  kom fram och knappen öppnade enkäten på matstrumpor.se. Inget annat i Spoks ändrat.
- Mät efteråt: svar med `Kanal: mejl` per 100 mottagare (2 649), skilt från `ob`.
