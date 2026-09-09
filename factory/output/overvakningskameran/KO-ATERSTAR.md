# HeimGuard — kön över det som återstår

Skriven 2026-09-09. **Ingenting här är avfärdat — allt är arbete som väntar,
med vad var sak behöver.** Räkningen per marknad står i `brand-rapport.md`.

Priser och villkor att rätta MOT (butikens egna, ur
`factory/butiker/hemvakten.yaml` och produktsidan):

| | SE | NO |
|---|---|---|
| Pris | 799 kr (förr 1 000 kr) | 799 kr (förr 1 000 kr) — sidan tar SEK, inte NOK |
| Frakt | fri, **ingen beloppsgräns** | fri till Norge, **ingen beloppsgräns** |
| Öppet köp | 30 dagar | 30 dagar |
| Leveranstid | 5–10 arbetsdagar | 5–10 virkedager |

---

## 1. Videor med Bäverbutiken i talet — HeyGen (5 st, alla NO)

Plånboken har **16 818 krediter** (mätt 2026-09-09), så inget blockerar.

| Annons | Spend | Vad som behövs |
|---|---:|---|
| `Overvåkingskamera_NO_SP_8_H1` | 0 kr | talet säger "baverbutiken.se" + brandet inbränt i bild |
| `Overvåkingskamera_NO_SP_9_H1` | 0 kr | samma |
| `Overvåkingskamera_NO_SP_11_H1` | 1 kr | samma |
| `Overvåkingskamera_NO_SP_12_H1` | 6 kr | samma |
| `Overvåkingskamera_NO_SP_13_H1` | 0 kr | samma |

**Gör så här:** rätta meningen i `srt-fixed`-filen (byt bort butiksnamnet),
kör `pipeline/translate-batch.mjs` med `--lang="Norwegian Bokmål (Norway)"`,
och byt sedan den inbrända raden med `pipeline/no-precis.py`.
⚠️ Proofread före rendering. ⚠️ Kör `pipeline/rostkoll.py` på resultatet.

---

## 2. Videor med brandet inbränt på slutkortet (2 st)

| Annons | Marknad | Spend | Vad som behövs |
|---|---|---:|---|
| `Overvakningskamera_SP_4_H1` | SE | 20 kr | "BAVERBUTIKEN" i bild, frames 66–73 (sista sekunderna) |
| `Overvakningskamera_RI_1_H1` | SE | 4 kr | "BAVERBUTIKEN" i bild, frames 71–77 |
| `Overvåkingskamera_NO_SP_4_H1` | NO | 1 kr | brandet inbränt + priset 899/1169 i bild |
| `Overvåkingskamera_NO_RI_1_H1` | NO | 0 kr | brandet inbränt |

**Gör så här:** `pipeline/no-precis.py` byter texten i sin egen ruta. Bygg ingen
ny caption-motor. Talet är rent i alla fyra — ingen omdubbning behövs.

---

## 3. Videor med källans pris eller fraktgräns i bild och tal

Det här är den dyraste gruppen, för den innehåller bevisade vinnare.

| Annons | Marknad | Spend | ROAS | Vad som behövs |
|---|---|---:|---:|---|
| `HeimGuard_CS_3` | SE **(LIVE)** | 5 010 kr | 3,44 | säger OCH visar "fri frakt över trehundra kronor" |
| `HeimGuard_CS_2` | SE **(LIVE)** | 2 631 kr | 2,34 | samma |
| `HeimGuard_CS_1` | SE **(LIVE)** | 246 kr | 5,45 | samma |
| `Overvåkingskamera_NO_CS_1` | NO | 2 923 kr | 2,66 | priset 899 kr inbränt + fraktgränsen i copy |
| `Overvåkingskamera_NO_CS_3` | NO | 1 489 kr | 1,68 | fraktgränsen inbränd |
| `Overvåkingskamera_NO_CS_2` | NO | 198 kr | — | fraktgränsen inbränd |

**Gör så här:** meningen "Fri frakt över 300 kronor" ska bort ur både ljud och
bild. FAS2:s plan B gäller: klipp bort eller skriv över meningen — dubba inte om
hela videon för en rad. Den inbrända raden byts med `pipeline/no-precis.py`.

⚠️ **De tre svenska ligger LIVE och spenderar.** Felet gör löftet SÄMRE än
verkligheten (butiken har fri frakt utan gräns, annonsen lovar över 300 kr), så
ingen kund blir lurad på pengar. Det är ändå ett påstående butiken inte har.
Axel äger beslutet om de ska pausas medan de rättas — CS_3 och CS_2 är två av
tre bevisade vinnare.

---

## 4. Norska bildannonser med källans pris (9 st) — GRATIS

`LI_1_1`, `CS_4_1`, `CO_2_1`, `CS_2_1`, `BOF_1_1`, `BOF_3_1`, `CO_3_1`,
`CS_5_1`, `BOF_2_1`, `RI_2_1`.

Fixade 2026-09-09 med `pipeline/oversatt-bild.py` och boxmetoden.
⚠️ **Använd alltid boxmetoden** (`{"box":[x0,y0,x1,y1],"text":…,"vanster_x":…}`),
aldrig `{"form":N,"rad":K}`. Den senare suddar HELA formen och ritar om varje
rad, vilket flyttar texten några pixlar och lämnar gröna bockar hängande ovanför
sin rad. Sex bilder underkändes på exakt det innan metoden byttes.

---

## 5. NOK i butiken

Norska sidan tar fortfarande betalt i **SEK** (verifierat på
heimguard.se/nb 2026-09-09: `currency: "SEK"`, priset 799,00 kr).
All norsk copy är därför skriven på butikens verkliga tal, inte källans.
Slås NOK på i Shopify Payments ändras priserna på sidan och **all norsk copy
måste räknas om** innan kampanjen sätts igång.
