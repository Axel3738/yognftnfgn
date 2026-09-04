# Höstfiske — gädda, havsöring, abborre från båt, brygga och strand (batch 1)

**Kluster:** man 45–70 som fiskar från egen båt (trailerbåt/roddbåt), brygga eller strand, september–november.
**Kontots facit i klustret:** Fiskespöhållaren (Rodholder) — spöklämma som skruvas på båtreling, flerköp 1,49 enh/order, hela vinsten (+43 700 kr) bärs av andra packet i beställningen (`docs/temu-vinnar-dna.md` w2). Uppdraget: hitta samma STRUKTUR (fäster på något ägaren redan har, NU-friktion), inte samma PRODUKT.

**Metod:** `docs/temu-vinnar-dna.md` avsnitt 4/6/7/9/12, `PIPELINE-V2.1.md` (gate-ordning O→P→HYLLA→Temu→material→ekonomi→variant→hook→publik), `SVERIGE-VIABILITET.md`, `DATAVAGAR.md` (Temu blockerad → WebSearch/Seznam/WebFetch, aldrig direkt temu.com). Temu rördes aldrig direkt.

**Budget använd:** ~85 WebSearch/WebFetch/curl-anrop av ~120 tillåtna.

---

## Huvudfyndet: hyllan är inte bara stark här — den är i praktiken heltäckande

Uppdraget bad mig kolla hyllan FÖRST och hitta golvet på svenska ord, med en explicit varning om att fackhandeln (Fiskarnas, Sportfiskeprylar, Jaktia) är stark specifikt för gäddans hantering. Efter att ha gått igenom hela objektuniversumet nedan är slutsatsen tydligare och bredare än förväntat:

**Svensk sportfiskehandel (Sportfiskeprylar.se, Fiske.se, Fiskejournalen.se, Dogger.se, Fiska.nu, Olssonsfiske.se, Fladen Fishing, m.fl.) fungerar redan som en egen, väletablerad "Temu för fiske"** — djupa, prissatta kategorier för praktiskt taget varje tillbehör en höstfiskare kan tänkas vilja fästa på sin båt, brygga, bil eller kropp. Till skillnad från klustren där Bäverbutiken redan vunnit (motorhölje, sätesöverdrag, IBC-tank) där Biltema/Jula/Clas/Rusta har GENERISKA hyllor med luckor, har fisket en SPECIALISERAD fackhandel utan luckor.

Konkret, verifierat golv per kategori (14 objekt kollade, alla FAIL på hyllgaten):

| Objekt | Golv | Källa |
|---|---|---|
| Spöhållare båt | 149 kr | Biltema (4 SKU:n) + Sportfiskeprylar (49 SKU:n, 149–1599 kr) |
| Spöhållare bil | < 100 kr (sugkopp) | Fyndiq/Amazon.se; Sportfiskeprylar 17 SKU:n 389–3969 kr |
| Spöhållare strand/mark | 47 kr | Biltema, Fiske.se, Fiska.nu, Lundgrens, Lapponicus, **Fladen Fishing "Sandspik"** (eget produktnamn) |
| Spöhållare isfiske | 79 kr | Sportfiskeprylar (15 SKU:n, fel säsong ändå) |
| Håvtillbehör (lina/magnetrelease) | 199 kr | Sportfiskeprylar (Guideline, McLean, Loon, C&F) |
| Ekolodsfäste/givarhållare | 125 kr | Kayakstore.se (hel produktfamilj till 2999 kr) |
| Käftöppnare (gapöppnare) | — | Sportfiskeprylar, dedikerad kategori |
| Avkrokningsmatta/mätmatta | — | Sportfiskeprylar, dedikerad kategori |
| Lip-grip/fisktång med våg | 155 kr | **Biltema direkt** |
| Draglåda/betesväska | 239 kr | Sportfiskeprylar, Fiskejournalen, Dogger |
| Rullskydd/rullfodral | — | Sportfiskeprylar, dedikerad kategori |
| Spöfodral/spöstrumpa | — | 6+ butiker, dedikerad kategori |
| Stolsäck | — | Sportfiskeprylar, dedikerad kategori |
| Nappalarm/bitindikator | 39 kr | 6+ butiker, spann 39–3199 kr |
| Batterilåda/batterifäste | — | **Biltema + Jula direkt** |
| Filébräda/rensbräda (lös) | 47 kr | **Biltema + Jula direkt** |
| Rensbord (fällbart, diskho) | — | Costway, Moory, Fiskehornan |
| Skärskyddad fiskehandske | 30 kr | Amazon.se |
| Wobbler-/jerkbaitväska | 239 kr | Fiskejournalen |
| Ståltafsförvaring | 219 kr | Olssonsfiske.se |
| Kylväska/fiskeväska med kylfack | — | **Biltema + Jula, fiskespecifik variant** |
| Vadarstövelhängare | 255 kr | Redan prövad i tidigare pass, dataset.json — avslag kvarstår |

Golvet är genomgående lägre än de 300 kr uppdraget kräver som minimum, och i sex fall (markerade **fetstil**) säljer Biltema eller Jula produkten **direkt**, vilket är det starkaste hyllfallet som finns i modellen. `dragrulle/linupprullare` är dessutom redan en bevisad förlorare i det egna kontot (ROAS 0,30, `docs/temu-vinnar-dna.md` avsnitt 2) och skulle FAIL:ats oavsett hylla.

**Detta är i sig svaret uppdraget bad om: höstfiske-klustret, angripet via "fäst-en-hållare-på-utrustningen"-mönstret, är i praktiken mättat i Sverige.** Det förklarar varför Fiskespöhållaren är en sällsynt lyckträff snarare än ett mönster att upprepa rakt av — den vann specifikt för att transportklämman (som håller ihop flera spötoppar) skiljer sig i FORM från allt hyllan säljer (relingsfästen/väggställ), inte för att kategorin "spöhållare" var tom.

---

## Objektuniversumet (så här söktes det igenom)

Gicks igenom i ordning enligt uppdragets egen lista: spön (förvaring bil/båt/hem/transport/skydd) → rullen → draglådor/betesväska → håven → gäddans hantering (gapöppnare/avkrokning/mätmatta) → flytoverall/flytväst (**hoppad**, PPE) → vadare (**hoppad**, personlig passform + redan prövad) → båtens fiskeutrustning (ekolodsfäste, batterilåda, dragrulle) → bryggfiske (spöställ, stolsäck, ljus) → kyla (**hoppad**, handvärmare=hylla) → mörker (**hoppad**, pannlampa=hylla). Utöver listan lades tio egna sidospår till efter att huvudspåren visat sig mättade: rensbräda (lös vs relingsmonterad), fiskehandske, wobblerväska, ståltafsförvaring, kylväska, undervattensbelysning, propellerskydd (avfärdat som utanför uppdraget — täcks av det parallella `bat`-klustret, ej fiskespecifikt).

**Sökfraser körda (urval, ~55 st):** `spöhållare brygga fäste biltema jula`, `sandspjut spöhållare strandfiske`, `spöhållare bil bagageutrymme`, `håvhållare håvfäste reling båt`, `ekolodsfäste transducerarm båt`, `sportfiskeprylar.se gapöppnare avkrokning`, `sportfiskeprylar.se mätmatta`, `sportfiskeprylar.se fisktång våg`, `sportfiskeprylar.se betesväska draglåda`, `betesplockare lösgörare fastnat`, `fisklina kedja hålla fångad fisk stringer`, `fiskrensbord bryggmonterat filébord`, `nappindikator bite alarm ljus`, `batterilåda båt fäste`, `propellerskydd vass grunt vatten`, `undervattensbelysning brygga fiske`, `fiskehandske skärskydd gädda`, `spö säkerhetslina`, `wobblerväska jerkbaitväska`, `ståltafs hållare dispenser`, `site:temu.com fish fillet cleaning table boat clamp`, `site:temu.com boat cutting board rod holder mount`, m.fl. Fullständig lista i `sources` per koncept i JSON-filen.

---

## Tratten

**KONCEPT-TRATTEN:** 26 koncept identifierade från objektuniversumet → 26 klarade objekt+presens (steg 0–1, alla är ägda saker med NU-friktion i rätt säsong, utom isfiske som är fel säsong och undervattensbelysningen som har osäker presens) → **1 av 26 klarade hyllan fullt ut** (steg 2, rensbräda-relingsklämma) + 2 klarade den villkorat/osäkert (håvhållare, undervattensbelysning) → 1 nådde Temu-listningsjakt (steg 4) → 0 nådde verifierad ekonomi (Temu blockerad hela natten, Seznam gav inga prissnippets för den enda kvalificerade produktklassen).

**LISTNINGS-TRATTEN:** 1 kandidatkoncept (rensbräda-relingsklämma) → 9 listningar hittade på Temu via WebSearch → 0 hämtade (temu.com blockerad, bekräftat med två separata WebFetch-försök som gav tomt skal) → 0 material-PASS → 0 ekonomi-PASS → **0 bästa listning vald**. Konceptet står som `VERIFY`: strukturen håller, listningen är overifierad.

---

## De 8 bästa — realistiskt bara 3 att visa

Uppdraget ber om 8 i full mall. Ärligt svar: av 26 prövade koncept är det bara **ett** som klarar hyllgaten (steg 2) fullt ut, och det konceptet kunde inte färdigverifieras eftersom Temu var blockerat hela natten och Seznam gav noll pristräffar för just den produktklassen. Två till håller sig kvar som `WATCH` med reella men namngivna svagheter. Resten (23 av 26) är väldokumenterade avslag på hyllgaten — vilket är klustrets huvudfynd, inte ett misslyckande i jakten. Nedan de tre som inte är rena avslag, i full mall, följt av avslagstabellen.

### 1. Rensbräda/filébord med relingsklämma — status: VERIFY

| Fält | |
|---|---|
| **Koncept** | En rensbräda/filébord som klämfästs direkt på båtens reling via samma typ av bas som en spöhållare — handsfree renstation ombord, går att vrida undan eller ta bort på sekunder |
| **Objekt / äger** | Fångad fisk + båtens reling (exakt samma fästpunkt som kontots bevisade spöhållarvinnare) |
| **Friktion (NU)** | Fisken ska rensas/mätas/hanteras i en gungande båt utan plan yta — man håller idag brädan i knäet eller balanserar den på durken samtidigt som man jobbar med kniv och tång |
| **Old way** | Hålla en lös bräda i knäet, eller använda instrumentbrädan/durken |
| **Säsong** | September–november, hela höstfiskesäsongen (fungerar året om men klustrets fönster är hösten) |
| **Svensk hylla** | **PASS (villkorat).** Den relingsMONTERADE formen (bräda som sitter fast i en klämma/bas på relingen) hittas INTE hos Biltema, Jula, Sportfiskeprylar, Moory, SeaSea, Westgear, Navinordic, Marinaman, Fishline, Direktimporter eller Olssonsfiske — noll träffar. Däremot säljer **Biltema och Jula den LÖSA formen (bräda + fiskklämma, ingen relingsmontering) från 47 kr** — det är den verkliga risken, inte konkurrens mot exakt samma form |
| **Temu-listningar** | Minst 9 distinkta listningar hittade via WebSearch (goods-id i JSON), alla i samma produktklass: "boat bait cutting board with rod holder mount, plier storage, knife slot" — flera storlekar (13,7×10,6 tum vanligast). Pris **PENDING** — temu.com blockerad hela natten (två WebFetch-försök gav bara ett tomt "Temu"-skal), Seznam gav noll prissnippets för fem olika sökfraser kring just denna produkt |
| **Ekonomi** | **BLOCKED_SOURCE.** Enda verifierade prispunkten är den amerikanska DTC-konkurrenten **KNINE Outdoors: 69,97 USD** (egen webbutik, hämtad via WebFetch) — det är ett marknadsankare, INTE en Temu-landad-kostnad-proxy. Tänkt SE-pris 449 kr är en placeholder, inte en verifierad siffra |
| **Sverige-viabilitet** | Population: 800 000 hushåll äger fritidsbåt (Transportstyrelsen Båtlivsundersökningen 2025). TAM-band 75k–200k (delmängd som fiskar aktivt från båten). Säsong 3 månader. Meta-igenkänning 3 (relingen + fisk + kniv är omisskännligt). Klass **B**. Konkurrensklass **WHITE SPACE** för den specifika monteringsformen — bekräftat internationellt behov (KNINE Outdoors egen butik, West Marine, Railblaza Fillet Table II, Traxstech gunwale clamps) som inte hyllats i Sverige än |
| **DNA-match** | 68/100 — äkta "samma struktur (relingsklämma), inte samma produkt (annat objekt: rensbräda i stället för spö, annan friktion: fiskrensning i stället för spöförvaring)" |
| **Varför den kan funka** | Fäster på exakt den punkt kunden redan har en spöhållare på. Löser ett konkret, återkommande NU-problem varje gång man landar en fisk. Ingen svensk aktör säljer den relingsmonterade formen. Internationellt ankare bevisar betalningsvilja. |
| **Varför den kan falla** | Kunden känner redan till en 47-kronorslösning för grundbehovet (rensbräda) — om annonsen inte extremt tydligt visar VARFÖR handsfree-montering är värd 10× priset (gungande båt, händerna fulla med kniv+tång+fisk samtidigt) ser produkten ut som en överprissatt bräda. Material (leverantörsvideo) overifierat. Priset i kronor är en gissning tills ett riktigt Temu-pris hämtas. |
| **Status** | **VERIFY** — häng kvar tills Temu släpper igenom igen (hamta-langsam.py, prioritet strax under Tier A), hämta pris/material på de 9 listade goods-id:na, döm sedan om till TEST eller REJECT |
| **Nästa åtgärd** | (1) Kör `hamta-langsam.py` mot de 9 goods-id:na i en aktiv tur när Temu svarar. (2) Döm material enligt fingeravtryckets krav (produkt i bruk ≤ 3 s, textfri hero). (3) Räkna om ekonomin på riktigt SE-Temu-pris, inte KNINE-ankaret. (4) Om PASS: `/ny-produkt` i ett separat test-ABO (regel 11), en storlek (störst), måtten i cm, hooken "Var rensar du fisken i en gungande båt?" |

### 2. Håvhållare/håvfäste — status: WATCH

| Fält | |
|---|---|
| **Koncept** | Klämma som fäster landningshåven på relingen mellan landningarna, så den inte ligger löst eller riskerar glida i sjön |
| **Svensk hylla** | Noll träffar hos Biltema/Jula för "håvhållare"/"håvfäste" — men två svenska nischbutiker (LMP via lorentsmarin.se/ofc.nu, **386 kr**; Berts Custom Tackle via borgsmotor.se, **895 kr**) säljer exakt formen. Klassas som villkorat PASS via ankarundantaget (895/tänkt pris ≈ 3×) snarare än rent hyllfall |
| **Temu** | Ingen renodlad håv-specifik relingsklämma hittad — bara generiska SPÖ-hållarklämmor marknadsförda dual-use |
| **Största risk** | Den fysiska mekaniken är sannolikt IDENTISK med kontots redan launchade spöhållare — hög risk att bryta mot "samma struktur, inte samma produkt" i praktiken, bara med ny marknadsföring. Bör inte launchas utan att först bekräfta att Temu-materialet visar en genuint annorlunda produkt |
| **Status** | WATCH — svagare kandidat än rensbrädan, inte rekommenderad för nästa steg utan vidare avgränsning mot den befintliga produkten |

### 3. Undervattenslampa för bryggan — status: WATCH

| Fält | |
|---|---|
| **Koncept** | Bärbar, batteridriven lampa som klipps fast på bryggkanten för att locka fisk vid nattfiske |
| **Svensk hylla** | Tudelad marknad: billiga engångs-"lockljus" 39–100 kr (Fyndiq/Fruugo/Amazon.se) vs. permanenta "Ocean LED"-installationer (troligen 2000+ kr, Erlandsons Brygga/Bizzlight). Inget mellansegment hittat — kan vara ett äkta glapp eller ett tecken på att efterfrågan saknas |
| **Största risk** | Svag/overifierad evidens för att svenska gädd-/abborr-/havsöringsfiskare faktiskt fiskar med lockljus i mörker — detta kan vara en importerad (amerikansk crappie-fiske-)vana utan lokal förankring. Ligger dessutom farligt nära "mörker"-kategorin uppdraget uttryckligen bad att hoppa (pannlampa) |
| **Status** | WATCH — kräver att någon verifierar svensk efterfrågan (forum, Ad Library) innan mer tid läggs |

---

## Avslagen (23 av 26) — tabell

| Koncept | Golv (kr) | Källa | Orsak |
|---|---|---|---|
| Spöhållare båt | 149 | Biltema, Sportfiskeprylar (49 SKU:n) | Samma form, redan kontots egen kategori |
| Spöhållare bil | <100 | Fyndiq, Amazon.se, Sportfiskeprylar (17 SKU:n) | Golv under 100 kr, tak vid 3969 kr redan täckt |
| Spöhållare strand/mark | 47 | Biltema, Fladen Fishing ("Sandspik"), 4 till | Eget produktnamn i handeln redan |
| Spöhållare isfiske | 79 | Sportfiskeprylar (15 SKU:n) | Mättad + fel säsong |
| Håvtillbehör (lina/magnetrelease) | 199 | Sportfiskeprylar | Flera etablerade märken, även på Temu |
| Ekolodsfäste/givarhållare | 125 | Kayakstore.se (125–2999 kr) | Djupt segmenterad specialhylla |
| Gapöppnare/käftöppnare | — | Sportfiskeprylar | Bekräftar uppdragets egen varning |
| Avkrokningsmatta/mätmatta | — | Sportfiskeprylar, fiske.se | Bekräftar uppdragets egen varning |
| Lip-grip/fisktång med våg | 155 | **Biltema direkt** | Identisk produkt i hyllan |
| Draglåda/betesväska | 239 | Sportfiskeprylar, Fiskejournalen | Grundkategori, ingen vitmark |
| Rullskydd/rullfodral | — | Sportfiskeprylar | Dedikerad kategori |
| Spöfodral/spöstrumpa | — | 6+ butiker | En av de djupaste hyllorna i klustret |
| Stolsäck | — | Sportfiskeprylar | Dedikerad kategori |
| Nappalarm/bitindikator | 39 | 6+ butiker (39–3199 kr) | Samma logik som pannlampan — hoppa |
| Batterilåda/batterifäste | — | **Biltema + Jula direkt** | Identisk produkt, dessutom ej fiskespecifik |
| Dragrulle/linupprullare | — | — | **Bevisad förlorare i eget konto** (ROAS 0,30) |
| Filébräda/rensbräda (lös) | 47 | **Biltema + Jula direkt** | Golv extremt lågt — men informerar #1 ovan |
| Rensbord (fällbart, diskho) | — | Costway, Moory, Fiskehornan | Redan sålt av tre aktörer, svagt DNA-fit (fristående möbel) |
| Skärskyddad fiskehandske | 30 | Amazon.se | Identisk produkt + personlig passform (dubbel negativ rymd) |
| Vadarstövelhängare | 255 | Redan prövad, dataset.json | Avslag kvarstår (smal publik) + personlig passform + inomhusförvarat |
| Wobbler-/jerkbaitväska | 239 | Fiskejournalen | Etablerad kategori |
| Ståltafsförvaring | 219 | Olssonsfiske.se | Litet objekt, redan prissatt |
| Kylväska/fiskeväska med kylfack | — | **Biltema + Jula, fiskespecifik variant** | Identisk produkt |

*(Fullständiga fält och källor för varje rad ovan finns i `hostfiske.json`.)*

---

## Sverige-viabilitet — publiken bakom klustret

- **Sportfiskare totalt:** ~1,1 miljoner svenskar fiskade minst en gång 2025 (752 000 män, 313 000 kvinnor), ~10 miljoner fiskedagar varav nästan hälften från båt. Källa: Havs- och vattenmyndigheten/SCB, pressmeddelande (mynewsdesk.com/se/havochvatten). Tidigare år har redovisat 1,2–1,3 miljoner — spannet **1,1–1,3 M** används som TAM-tak för hela publiken.
- **Båtägare:** 800 000 svenska hushåll äger fritidsbåt (19 % av alla hushåll), totalt 1,46 miljoner fritidsbåtar varav 1,29 miljoner sjövärdiga. Källa: Transportstyrelsens Båtlivsundersökning 2025 (mynewsdesk.com/se/transportstyrelsen).
- **Säsong:** Gädda bäst aug–mitten av okt, abborre toppar sep–okt, havsöringssäsongen öppnar i okt (fredningstid varierar 15 sep–1 jan/1 apr beroende på vattendrag). September–november bekräftas alltså som rätt fönster, ~3 kommersiella månader.
- **Ingen av dessa siffror är en gissning** — alla har källa ovan. Överlappet "äger båt OCH fiskar aktivt på höstarter" är däremot en uppskattning (märkt som sådan i varje koncepts `sweden`-fält), inte en egen statistik.

---

## Slutsats och rekommendation

Klustret levde inte upp till förväntan om ~20 kvalificerade koncept — och det är ett äkta resultat, inte en ofullständig jakt (85 sökningar kördes, hela objektuniversumet uttömdes systematiskt). Den svenska sportfiskefackhandeln har redan hyllat nästan varje "fäst en hållare/klämma/ficka på utrustningen"-idé, ofta till priser under vårt 300 kr-golv. **Rekommendationen är att INTE launcha något ur det här klustret ännu:**
1. Låt `rensbräda-relingsklämma` (VERIFY) vänta i Temu-kön tills materialet och priset går att se på riktigt — det är den enda kandidaten med en äkta, obevakad lucka.
2. Nästa jaktomgång i det här klustret bör byta metod: leta INTE fler "hållare för X", utan gå bredare mot höstfiskets EKONOMISKA friktioner (försäkring/förlust av dyr utrustning, förvaring över vintern av det som INTE är personligt/inomhus, eller en helt ny objektkategori utanför fiske-fackhandelns sortiment helt).
3. Kvoten (`node pipeline/quota.mjs`) påverkas inte av detta — inget härifrån är klart för brief eller launch.
