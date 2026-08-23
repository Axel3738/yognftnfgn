# Listicles SE → AU — lokaliseringsfacit

Gäller alla GemPages-listicles som flyttas från Grillkliniken (SE) till The BBQ Clinic (AU).
Text är den lätta delen. Det här dokumentet är den svåra delen: allt som INTE är översättning.

Källa: inventeringen i `INVENTORY.md` (36 mallar, 249 sektioner, ~30 400 ord).

---

## 0. Arbetsflöde (samma som Mexiko)

1. Axel installerar GemPages på The BBQ Clinic och exporterar de valda sidorna från SE-butiken
   som `.gempages`.
2. Claude översätter + lokaliserar filen med **byte-nivåkirurgi** i den råa JSON:en — aldrig
   `json.dumps` — och räknar om `sha256(str(themePageID) + component)` per sektion.
3. Axel importerar de färdiga filerna i AU-butikens GemPages.

**Varför inte redigera temat direkt:** varje sektion har en `checksum`-setting som GemPages äger.
Den läses inte vid rendering (0 referenser i 249 filer), så en inaktuell checksum syns inte —
men öppnar någon sidan i GemPages-editorn och sparar, skrivs översättningen över utan varning.

---

## 1. Språkregler (hårda)

| Regel | |
|---|---|
| **"Grill" = ugnsgrillen i Australien.** Utomhusgrillen heter ALLTID BBQ/barbecue | `grillen` → *the BBQ* · `grilla` → *to barbecue / have a BBQ* · `grillgallret` → *the grates* (OK) |
| AU-stavning | colour, flavour, -ise, centre, grey, aluminium, litre, metre, mould |
| Slang | max 1–2 australianismer per sida. **"barbie" max en gång**, aldrig i rubrik/CTA/prisrad. ALDRIG "shrimp on the barbie" |
| Datum | DD/MM. `15 maj 2026` → *15 May 2026* |
| Temperatur/mått | °C, cm, kg (samma som SE — ingen konvertering behövs) |

Undantag: egennamn behåller "grill" — *Greatgrill*, *Flipgrill*, *Grill Master*, *The Grillfather*.

---

## 2. Varumärke och bolag

| Svenska | Australiensiska |
|---|---|
| Grillkliniken / Grillklinikens | **The BBQ Clinic** / The BBQ Clinic's |
| Grillklinikens Master / Master Kit | **The Master** / **The Complete Master Kit** |
| `kundsupport@grillkliniken.se` (38 förekomster) | **hello@thebbqclinic.com** |
| `Org.nr: 5595762401 · Grillkliniken drivs av Stonebite Ecom AB` | *The BBQ Clinic is operated by STONEBITE ECOM AB (Sweden)* — **stryk org.nr**, det är en svensk registrering utan betydelse i AU |
| `OBS: Detta är reklam.` | *Advertisement.* |
| Av Anders Johansson / Av Jonny från Grillkliniken | behåll bylinestrukturen, byt namn till ett AU-namn (se §6) |

---

## 3. Länkar och CTA — den vanligaste orsaken till trasiga sidor

**128 hårdkodade absoluta länkar till `https://grillkliniken.se/...` måste bort.**
De skickar en australiensisk besökare rakt in i den svenska butiken mitt i tratten.

| Gammal länk | Ny |
|---|---|
| `https://grillkliniken.se/products/elektrisk-grillborste` (120 st) | `/products/the-master-electric-bbq-brush` |
| `https://grillkliniken.se/products/roterande-grillkorg-...` (4 st) | `/products/greatgrill-rotating-bbq-basket` |
| `/products/master` | `/products/the-master-electric-bbq-brush` |
| `/products/mastern-risten-skinner-olet-er-kaldt` (norskt/danskt handle) | `/products/the-master-electric-bbq-brush` |
| `/products/elektrisk-grillborste` (relativ) | `/products/the-master-electric-bbq-brush` |

Använd **relativa** länkar (`/products/...`), aldrig absoluta — då följer de domänen.

⚠️ **CTA-destinationen ligger på TVÅ ställen per knapp:** i `href` OCH i attributet
`gp-data='{"btnLink":{"link":"/products/..."}}'`. Båda måste bytas.
Byt med **strängersättning inne i attributet** — 6 `gp-data`-attribut innehåller rå Liquid
(`{{ variant | json | escape }}`) och överlever inte en JSON-parser.

---

## 4. Priser

Alla priser är **literala strängar** i copyn, inget `money`-filter. Måste räknas om.

| Svenskt literal | AU |
|---|---|
| `999 kr` (16 st) | **$179.95** (Masterns riktiga AU-pris) |
| `1 665 kr` | **$299.95** (jämförpriset) |
| `99 kr` (9 st) | kontrollera vad det avser — troligen frakt; AU har **fri frakt**, ta bort |
| `12 000 kr` / `13 000 kr` / `7 000 kr` | grillens värde i exempel → **$1,800 / $2,000 / $1,000** (grov ×0,15, runda snyggt) |
| `69 kr` (2 st) | kontrollera kontext |
| ordet `kronor` (20 st) | *dollars* |

🚨 **Fällan:** `SEK` förekommer 8 gånger men **7 av dem är sekundvisaren i nedräkningen**
(`TIM / MIN / SEK`). Den ska bli **`HRS / MIN / SEC`** — inte AUD.

Skriv inga priser i brödtext om det går att undvika: ändras priset blir sidan vilseledande.

---

## 5. Svenska bevis som inte betyder något i Australien

| Svenskt | AU-ersättning |
|---|---|
| Jula (8 st) / Biltema (6 st) | *the big hardware chains* — **skriv INTE "Bunnings"** om produkten inte faktiskt säljs där. Att påstå det är vilseledande. |
| Konsumentverket (2 st) | **ACCC** (Australian Competition and Consumer Commission) |
| "Nationella Cancerinstitutet" | behåll bara om källan går att belägga — annars stryk |
| Sverige (24 st) / svensk, svenska, svenskar (10 st) | *Australia / Australian* |
| "Fri frakt inom Sverige" | **"Free shipping Australia-wide"** (sant — zonen är konfigurerad) |
| "30 dagars öppet köp" | *"30-day change-of-mind returns"* — och lägg till att kunden betalar returfrakten, det gör de |
| Helsingborg, Örebro, Kilsbergen | Newcastle, Ballarat, the Blue Mountains |
| Trustpilot | behåll bara om butiken faktiskt har profil där |

---

## 6. Recensioner och namn

Samma 7 recensenter återkommer i recensionsblocket (168 kB) i **18 mallar**:

| Svenskt namn | AU-namn |
|---|---|
| Tomas W. | Dave M. |
| Rickard B. | Craig T. |
| Peter N. | Shane P. |
| Mikael T. | Wayne H. |
| Marcus A. | Brett K. |
| Johan S. | Glenn R. |
| Christer F. | Trevor D. |

Recensionstexterna är geografiskt svenska och måste skrivas om, inte bara översättas:
- *"Köpte en till stugan också"* → *"Got one for the shack down the coast as well"*
- *"Frun är nöjd att stålborsten försvann"* → *"The missus is glad the wire brush is gone"*

Rubriken `4.7 / 60 recensioner` → *4.7 / 60 reviews*.

**Konsekvens:** recensionsblocket och sidfoten är byte-identiska i 18 mallar.
Översätt dem **en gång** och propagera — det är 35–40 % av allt strängarbete.

---

## 7. Bilder — 89 st, alla hotlinkade från fel butik

Samtliga listicle-bilder ligger på `cdn.shopify.com/s/files/1/**0947/0174/8548**/` = **Grillklinikens**
CDN. AU-butiken är `1/0908/7769/0239`. De laddas idag, men svenska butiken kan radera dem
när som helst. **Ladda upp allihop till AU-butikens Files.**

Dessa har med största sannolikhet **inbränd svensk text** och måste göras om, inte bara flyttas:

| Fil | Problem |
|---|---|
| `Blev_mystiskt_sjuk_nu_varnar_Harriet_for_vanliga_grillverktyget...png` | svensk kvällstidningsrubrik som bild |
| `Weber_erkanner_A_few_brush_hairs_may_fall_off...png` (7 st) | "Weber erkänner" = svensk bildtext över engelsk skärmdump |
| `Fore.png` (18 st) + `Kopia_av_Fore.png` | "Före" = före/efter-etikett |
| `Lagg_till_en_rubrik_1/3/4.png` (55 st) | Canvas svenska standardnamn — kolla om text är inbränd |
| `Skarmavbild_2026-06-24_kl.*.png` (31 st) | macOS-skärmdumpar på svenska |
| `Skarmbild_2026-05-15_085739.png` (18 st) | Windows-skärmdump på svenska |

Resten (~65) har neutrala filnamn men **filnamn säger inget om pixlarna** — före/efter-GIF:arna
behöver ögonkontroll.

---

## 8. Juridik och påståenden — läs innan du översätter

Samma ACL-regler som gäller produkttexterna gäller listiclesen, och de är hårdare där eftersom
sidorna är rena annonser.

1. **Ingen absolut garanti.** Butikens garanti är *begränsad, mot fabrikationsfel*.
   "Livstidsgaranti" utan kvalificering är en överdrift. Skriv:
   *"a limited lifetime warranty against manufacturing defects — in addition to your rights under
   the Australian Consumer Law"*. Aldrig att garantin ersätter lagstadgade rättigheter.
2. **Weber/Nexgrill-återkallelserna** (3,2 miljoner / 10,2 miljoner) återkommer som huvudargument.
   Att namnge konkurrenter är lagligt i Australien **om påståendet är sant och kan beläggas**.
   Ha CPSC-ärendenumren sparade innan sidan tar betald trafik — annars stryk stycket.
3. **Inga absoluta säkerhetslöften.** "Omöjligt att borststrån hamnar i maten" → *"designed to
   hold the bristles in place"*.
4. **Livslängdspåståenden** ("sju år eller femton") är kvantifierade prestandapåståenden och kräver
   underlag enligt ACL s29(1)(g). Mjuka upp till en icke-numerisk formulering.
5. **Nedräkningar och "lagerrensning"** som inte är äkta är vilseledande knapphet. Om timern
   nollställs vid varje sidladdning: ta bort den.
6. **Returkostnaden måste framgå.** Returadressen är i Sverige och kunden betalar returfrakten
   vid ångerköp — "risk-free" och "no questions asked" är därför falskt.

---

## 9. Säsong — fel halvklot

Mall `631303000391942918` ("din grill dör i vinter … skadan avgörs i september") bygger på nordisk
säsong. I Australien är september **början** på grillsäsongen, inte slutet.
Den sidan måste **skrivas om**, inte översättas. Kontrollera alla sidor för säsongsargument:

| Svenskt | AU |
|---|---|
| inför sommaren / grillsäsongen drar igång | *heading into summer* = **oktober–december** |
| Valborg / midsommar | *the long weekend* / *Australia Day* / *the start of the season* |
| "grillen står ute hela vintern" | i AU står den ute året om — vinkeln är fukt/salt/rost, inte frost |

---

## 10. Checklista per sida innan leverans

- [ ] 0 träffar på `grillkliniken` (domän, mejl, varumärke)
- [ ] 0 träffar på `kr`, `kronor`, `SEK` som valuta (men `SEC` i timern är rätt)
- [ ] 0 träffar på åäö
- [ ] 0 absoluta länkar — alla CTA:er relativa och pekar på en produkt som FINNS i AU-butiken
- [ ] `href` och `gp-data.btnLink.link` uppdaterade på varje knapp
- [ ] alla bilder på AU-butikens CDN, inga med svensk text
- [ ] priser = $179.95 / $299.95, inga andra prisliteraler
- [ ] recensentnamn och orter australiensiska
- [ ] garantiformuleringen den godkända
- [ ] säsongsvinkeln stämmer för södra halvklotet
- [ ] "grill" bara i egennamn, aldrig om utomhusgrillen
- [ ] checksum omräknad per sektion (`sha256(str(themePageID) + component)`)
