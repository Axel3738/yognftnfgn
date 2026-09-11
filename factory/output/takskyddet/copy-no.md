# CaraShell — norsk annonsecopy, Taköverdraget

Kilde: norske annonser på Bäverbutikens NO-konto (allerede korrekt bokmål —
kun rettet det som er feil for CaraShell). Faktagrunnlag: `factory/butiker/carashell.yaml`
(frakt, retur, tonalitet) og `factory/produkter/takskyddet.yaml` (features).
Tre-spørsmålstesten: `docs/copy-regler.md`.

Lenke i alle blokker: https://carashell.se/nb/products/takskyddet

---

## Blokk PD (problem/demo)

**Message:**
```
Taket på campingvogna er flaten du aldri sjekker – og den som koster mest å reparere. 🏕️\n✅ Beskytter mot regn, snø og UV hele vinteren\n✅ Elastiske stropper med plasthaker hektes under karosseriens kant – klart på minutter\n✅ Én person klarer det helt alene\n✅ Dekker hele takflaten, med kanten hengende ca. 30–40 cm ned over sidene\nBeskytt campingvogntaket før vinteren gjør det dyrt. 👇
```

**Headline:** Campingvogntaket – helt beskyttet i vinter

**Tre-spørsmålstesten (kun endrede linjer):**

| Linje | Visualisere | Falsifisere | Ingen andre kan si det |
|---|---|---|---|
| "Elastiske stropper med plasthaker hektes under karosseriens kant – klart på minutter" | ✅ | ✅ | ✅ |
| "Dekker hele takflaten, med kanten hengende ca. 30–40 cm ned over sidene" | ✅ | ✅ | ✅ |

**Endret:** Linje 3 (stropp+strammer/dragsko → belagt mekanisme: elastiske stropper med plasthaker under karosseriens kant) og linje 5 (oppbevaringspose → belagt dekningsmål 30–40 cm). Linje 1, 2, 4 og headline er urørt.

---

## Blokk SP (social proof)

**Message:**
```
"Veldig fornøyd. God beskyttelse når campingvogna står ute." – Johan 🙌\nDet er ikke bare Johan – vi har 10 anmeldelser, alle på 5 av 5 stjerner.\n✅ Beskytter taket mot regn, snø og skitt\n✅ Én person setter det på selv – ingen hjelp nødvendig\n✅ 14 dagers angrerett hvis du ikke er fornøyd\nLes hvorfor campingvogneiere velger dette før hver vinter. 👇
```

**Headline:** 10 av 10 anmeldelser: 5 stjerner

**Tre-spørsmålstesten (kun endrede linjer):**

| Linje | Visualisere | Falsifisere | Ingen andre kan si det |
|---|---|---|---|
| "Veldig fornøyd. God beskyttelse når campingvogna står ute." – Johan | ✅ | ✅ | ✅ |
| "Det er ikke bare Johan – vi har 10 anmeldelser, alle på 5 av 5 stjerner." | ✅ | ✅ | ✅ |
| "14 dagers angrerett hvis du ikke er fornøyd" | ✅ | ✅ | ❌ |
| Headline: "10 av 10 anmeldelser: 5 stjerner" | ✅ | ✅ | ✅ |

**Endret:** Linje 1 (oppdiktet sitat → ekte kundesitat fra Johan, oversatt til bokmål, med navn), linje 2 ("flere og flere" uten belegg → faktisk antall: 10 anmeldelser, alle 5 stjerner), linje 5 (30 dagers åpent kjøp finnes ikke hos CaraShell → 14 dagers angrerett, korrekt policy), headline (skrevet om fra volumpåstand til det faktiske tallet). Linje 3 og 4 er urørt. Merk til linje 5: den stryker ikke Q3 fordi 14 dagers angrerett er lovpålagt minimum i Norge/Sverige, ikke noe unikt for CaraShell — den leveres likevel fordi den erstatter en faktisk feil (30 dager finnes ikke), og en policylinje skal være korrekt, ikke unik.

---

## Blokk G (gaven) — uendret

**Message:**
```
Han snakker om campingvogna som om den var et kjæledyr. 😅 I år fant jeg endelig noe han faktisk blir glad for.\n🎁 Et takovertrekk som beskytter campingvogna hele vinteren\n🎁 Noe han faktisk bruker – gang på gang\n🎁 Leveres rett hjem, klart til å pakkes inn\nGi en gave som viser at du skjønner hva han bryr seg om. 👇
```

**Headline:** Gaven han faktisk blir glad for

**Endret:** Ingen linjer endret. Levert ordrett som bekreftelse på at blokken er lest og at ingen feil ble funnet — ingen pris, ingen forbudte påstander, tonen matcher CaraShells "saklig nabo".

---

## Blokk CS — holdt tilbake

Ikke skrevet: hele blokken bygger på en NOK-pris ("1549 kr → 1189 kr") som CaraShell ennå ikke har satt, og butikkens regel er at ingen norsk annonse skal nevne pris i det hele tatt.
