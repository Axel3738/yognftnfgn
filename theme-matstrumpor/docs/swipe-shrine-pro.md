# Swipe-analys: Shrine Pro 1.2.3

Analyserad 2026-08-21 från en zip Axel äger licens för. **Ingen kod, grafik eller
fil därifrån finns i det här repot** — zippen packades upp i en temp-mapp och
lästes, inget mer. Det här dokumentet beskriver *funktioner och tekniker*, som
inte går att äga, så att vi kan bygga våra egna.

Regeln står i `README.md` och gäller utan undantag:

> Får kopieras: funktioner och idéer. Får INTE kopieras: deras faktiska filer,
> deras grafik, deras namn.

Därför heter inget vi bygger `sp-*` eller `ss-*`, och ingen fil är en
omskrivning av deras.

---

## Vad det faktiskt är

268 sektionsfiler, men inte 268 funktioner. Paketet är **tre teman hopslagna**:

| Prefix | Antal | Vad |
|---|---|---|
| *(inget)* | ~70 | Shrine-kärnan — bygger på Dawn |
| `sp-*` | ~120 | Ett tilläggspaket ("🚀SP") |
| `ss-*` | ~60 | Ytterligare ett tilläggspaket |

Det ger enorm dubblering: **sex olika FAQ-sektioner, tio bildgallerier, fyra
nedräknare, sju recensionsupplägg.** Samma funktion om och om igen med olika
utseende.

Och det är extremt inställningstungt: **2 418 `range`-reglage, 1 367 `select`,
1 257 färgväljare** över de 254 sektioner som har giltigt schema. Affärsmodellen
är "designa allt i redigeraren". Det är också varför en enda sektion kan vara
72 kB (`ss-product-vidoes`, 109 inställningar).

**Det är inte den delen vi ska ta.** Vårt tema är medvetet fåordigt: få
inställningar, rätt förvalda. Det vi ska ta är *mekanikerna*.

---

## Teknikerna värda att ha

### 1. Video som beter sig som gif ⭐ det Axel frågade efter

Ingen magi, och inget de äger. Shopifys `video`-inställning (samma mediaväljare
som för bilder) plus fyra attribut:

```
autoplay muted loop playsinline
```

Utan `controls`. `muted` är det som gör att webbläsare alls tillåter autoplay.
`playsinline` hindrar iOS från att ta över helskärm. Resultatet ser ut som en
gif men är en tiondel så stor och långt skarpare.

De lägger till två saker som är värda att ta med:

- **`preload="none"` + `data-src` + IntersectionObserver** — filen laddas först
  när den scrollas in i bild. Utan det drar en startsida med fem videor tiotals
  megabyte innan något syns.
- **Poster-bild** så rutan inte är svart innan filmen börjat.

Används i 86 av deras inställningar, spritt över videohero, videorutnät,
video-i-karusell, videomodal och produktvideoslider.

⚠️ **Butiken har noll videor i dag.** Alla fem produkter har bara stillbilder,
tre av dem har en enda bild. Funktionen är värdelös tills film laddas upp — och
den finns redan, i annonsmaterialet.

### 2. Paketrabatter över flera produkter

Vår paketväljare säljer fler av *samma* produkt. Deras `bundle-deals` säljer
**olika** produkter ihop ("köp alla fyra strumporna"), räknar totalen, och har
en `skip_cart`-inställning som skickar kunden direkt till kassan i stället för
till varukorgen. Det senare är ett verkligt konverteringsgrepp.

För en presentbutik med fyra strumpor är det här den enskilt största möjligheten.

### 3. Klickbara punkter på en bild (hotspots / shoppable image)

En livsstilsbild med prickar som öppnar en liten produktruta. Passar en
platt-lay med alla fyra strumporna perfekt.

### 4. Leveransnedräkning kopplad till klockan

"Beställ inom 3 tim 12 min så skickas den idag." Vi har mekaniken i
`ms-delivery-estimate` men visar den inte som en nedräkning som tickar.

### 5. Sticky köpknapp som skakar

`ss-atc-button-3` har exakt en inställning: `shake_type`. Knappen vickar till
efter en stunds inaktivitet. Billigt, och det fungerar.

### 6. Recensioner i tre former

Slider, rutnät och "masonry". Plus färdiga kopplingar till Trustpilot och
Facebook-omdömen. Vi har rutnätet; slidern saknas.

### 7. Övrigt som är enkelt och gör nytta

| Funktion | Vad |
|---|---|
| Instagram-stories | Runda bubblor som öppnar en story-vy |
| Innehållsflikar | Beskrivning / Leverans / Storlek som flikar i stället för dragspel |
| Storleksguide i modal | Egen liten tabell, öppnas från köprutan |
| Kampanjpopup | Med fördröjning i sekunder och kaka i dagar |
| Typewriter-rubrik | Bokstav för bokstav |
| Räknare / progresscirklar | "12 400 sålda par" |
| Spåra order | Formulär som går mot Shopifys egen ordersida |
| Till toppen | Liten knapp som dyker upp vid scroll |
| Cookiebanner | Egen, utan app |

---

## Vad vi redan har

| Deras | Vårt | Läge |
|---|---|---|
| Sticky ATC | `ms-sticky-atc` | ✅ klart, saknar skak |
| Paketväljare (samma produkt) | `ms-bundle-picker` | ✅ klart |
| Trygghetsikoner | `ms-trust-row` | ✅ klart |
| Nedräkning | `<ms-countdown>` i `ms-cro.js` | ✅ byggd, inte inlagd |
| Leveransbesked | `ms-delivery-estimate` | ✅ klart, saknar tickande timer |
| FAQ / dragspel | `ms-faq` | ✅ klart |
| Jämförelsetabell | `ms-compare` | ✅ klart |
| Rullande band | `ms-marquee` | ✅ klart |
| Omdömen (rutnät) | `ms-reviews` | ✅ klart, saknar slider |
| Garanti | `ms-guarantee` | ✅ klart |
| Betalikoner | `ms-payment-icons` | ✅ klart |
| Lagerindikator | `ms-stock-urgency` | ✅ klart |
| **Video** | — | ❌ saknas helt |
| **Paket över flera produkter** | — | ❌ saknas |
| **Hotspots** | — | ❌ saknas |
| **Storleksguide** | — | ❌ saknas |
| **Popup** | — | ❌ saknas |

Vi ligger alltså inte efter på konverteringsblocken. Vi ligger efter på **video**
och på **paket över flera produkter**.

---

## Vad som är värt att bygga, i ordning

Rangordnat efter vad som faktiskt flyttar pengar i en presentbutik med fem
produkter — inte efter vad som är roligast att bygga.

1. **Video-block och videosektion.** Låter annonsmaterialet göra jobbet på
   sajten. Kräver att film laddas upp först.
2. **Paket över flera produkter.** "Alla fyra för X" är en gåva-i-sig-produkt.
   Störst effekt på snittordervärdet.
3. **Leveransnedräkning som tickar.** Liten insats, vi har redan halva.
4. **Recensionsslider + riktiga omdömen.** Sajten har noll social proof i dag.
5. **Hotspots på en gruppbild.** Kräver att en sådan bild finns.
6. **Storleksguide i modal.** "Passar de alla?" är den vanligaste invändningen.
7. Skak på sticky-knappen, till toppen-knapp, popup. Småsaker.

Allt utom 1 och 5 går att bygga utan nytt material.
