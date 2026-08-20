# Översättningsjobb: Fiskespöhållaren → NO, DK, FI, UK

**Status: REDO ATT GENERERA VIA KIE AI.** Proofread klar 2026-08-20. Ingen generering
är gjord än. Higgsfield är ur bilden (Axels konto saknar unlimited-pott och credits,
supportärende pågår) — **Axel köpte Kie AI 2026-08-20 i stället.**

**Generering körs via Kie AI:s API** (`https://api.kie.ai`, docs: `https://docs.kie.ai`)
med nyckeln i env-variabeln **`KIE_API_KEY`**. Modell: **Nano Banana Pro**
(samma Googlemodell som skillen pekar på i Higgsfield — bäst på textrendering,
vilket är hela jobbet här). Verifiera exakt modellnamn/endpoint mot docs vid körning.
Flödet i övrigt enligt steg 4–6 i `.claude/skills/translate-images/SKILL.md`:
originalbilden som referens + måltexterna nedan ordagrant i prompten, QA bild för
bild, zip per marknad.

## Källa

Drive-mapp: `https://drive.google.com/drive/folders/1M-OayZTRA2rh13j0wJmQg3qUnGhzWeJv`
(mappen "images", ägare Josh). Sex PNG 1024×1024:

| Fil | Drive-ID | Text? |
|---|---|---|
| `Fiskespöhållare_SO_2_1` | `1lhg4ixHXoEpB8vaH7TC53uhPXHg3agr9` | ja |
| `Fiskespöhållare_GT_2_1` | `1ck9QTxW65DClobFTWmN4xR17WE--IxGz` | ja |
| `Fiskespöhållare_PD_2_1` | `1YyduTGgrjzPUcJebpjCfamNjslpSFGAG` | ja |
| `Fiskespöhållare_CS_2_1` | `1BpYx1dz8DdDoiBAWIluClUH9BJaAzVGx` | ja |
| `Fiskespöhållare_SP_2_1` | `1-F3Kcy4XND3Ncx_RkW_cYQ53uuFS3FaZ` | ja |
| `hf_20260812_131430_bc1dbbba….png` | `1Nr3q3oNwt3I37xdpnAkGSQnpZ_1quW7E` | **nej — ren produktbild, kopieras oförändrad till varje marknads-zip** |

Publik nedladdning: `https://drive.google.com/uc?export=download&id=<ID>`.
(Drive-MCP:ns `search_files` på mappen ger tomt svar — hämta via ID:na ovan.)

## Axels beslut (2026-08-20, i chatten)

1. **Marknader:** Norge (norska), Danmark (danska), Finland (finska), UK (engelska).
2. **Priser: TAS BORT.** SO-bildens "– 149 KR" stryks (rubriken blir bara "4-PACK")
   och "Fri frakt över 300 kr" blir "Fri frakt" utan belopp. **"40% RABATT" på
   CS-bilden behålls.** Inga belopp får förekomma i någon marknadsversion.

## Måltexter — används ORDAGRANT i genereringsprompten

Rendera aldrig något annat än strängarna nedan. Samma foto, layout, färger och
komposition som originalet; endast texten byts.

### `Fiskespöhållare_SO_2_1`
Original (SV): «4-PACK – 149 KR» / «Fri frakt över 300 kr» / «Betala sen med Klarna» / knapp «BESTÄLL IDAG»

| Marknad | Rubrik | Rad 1 | Rad 2 | Knapp |
|---|---|---|---|---|
| NO | 4-PAKK | Gratis frakt | Betal senere med Klarna | BESTILL I DAG |
| DK | 4-PAK | Gratis fragt | Betal senere med Klarna | BESTIL I DAG |
| FI | 4-PAKKAUS | Ilmainen toimitus | Maksa myöhemmin Klarnalla | TILAA TÄNÄÄN |
| UK | 4-PACK | Free delivery | Pay later with Klarna | ORDER TODAY |

Obs: rubriken renderas utan prisdel — den orangea "149 KR"-delen utgår helt.

### `Fiskespöhållare_GT_2_1`
Original (SV): «DEN PERFEKTA PRESENTEN TILL HONOM SOM ALLTID FISKAR» / «Han kommer visa upp den för alla sina fiskekompisar» / knapp «GE BORT ORDNING»

| Marknad | Rubrik | Underrad | Knapp |
|---|---|---|---|
| NO | DEN PERFEKTE GAVEN TIL HAM SOM ALLTID FISKER | Han kommer til å vise den fram for alle fiskekameratene sine | GI BORT ORDEN |
| DK | DEN PERFEKTE GAVE TIL HAM DER ALTID FISKER | Han vil vise den frem for alle sine fiskekammerater | GIV ORDEN I GAVE |
| FI | TÄYDELLINEN LAHJA HÄNELLE, JOKA AINA KALASTAA | Hän esittelee sitä kaikille kalakavereilleen | ANNA JÄRJESTYS LAHJAKSI |
| UK | THE PERFECT GIFT FOR THE MAN WHO'S ALWAYS FISHING | He'll show it off to all his fishing mates | GIVE THE GIFT OF ORDER |

### `Fiskespöhållare_PD_2_1`
Original (SV): «TRASSLIGA SPÖN? ALDRIG MER.»

| Marknad | Rubrik |
|---|---|
| NO | FLOKETE STENGER? ALDRI MER. |
| DK | FILTREDE STÆNGER? ALDRIG MERE. |
| FI | SOTKEUTUNEET VAVAT? EI ENÄÄ KOSKAAN. |
| UK | TANGLED RODS? NEVER AGAIN. |

### `Fiskespöhållare_CS_2_1`
Original (SV): «40% RABATT – IDAG ENDAST» / «Få kvar i lager – beställ innan det är slut» / knapp «HANDLA NU»

| Marknad | Rubrik | Underrad | Knapp |
|---|---|---|---|
| NO | 40% RABATT – KUN I DAG | Få igjen på lager – bestill før det er tomt | KJØP NÅ |
| DK | 40% RABAT – KUN I DAG | Få tilbage på lager – bestil inden det er udsolgt | KØB NU |
| FI | 40% ALENNUS – VAIN TÄNÄÄN | Varastossa vain vähän jäljellä – tilaa ennen kuin loppuu | OSTA NYT |
| UK | 40% OFF – TODAY ONLY | Low stock – order before it's gone | SHOP NOW |

Procentsatsen skrivs "40%" utan mellanslag, som i originalet — siffran får inte ändras.

### `Fiskespöhållare_SP_2_1`
Original (SV): «★★★★★» / «Äntligen håller sig spöet ihopfällt – ingen mer trassel!» / «— Verifierad kund, 52 år» / «30 dagars nöjd-kund-garanti» / knapp «HANDLA NU»

| Marknad | Citat | Attribution | Garantirad | Knapp |
|---|---|---|---|---|
| NO | Endelig holder stanga seg sammenslått – ikke mer floke! | — Verifisert kunde, 52 år | 30 dagers fornøydhetsgaranti | KJØP NÅ |
| DK | Endelig holder stangen sig sammenklappet – ikke mere bøvl! | — Verificeret kunde, 52 år | 30 dages tilfredshedsgaranti | KØB NU |
| FI | Vihdoinkin vapa pysyy kasassa – ei enää sotkuja! | — Vahvistettu asiakas, 52 v. | 30 päivän tyytyväisyystakuu | OSTA NYT |
| UK | My rod finally stays folded – no more tangles! | — Verified customer, 52 | 30-day satisfaction guarantee | SHOP NOW |

De fem stjärnorna behålls som grafik, oförändrade. "52" är ett påstått kundcitat —
siffran får inte ändras mellan marknader.

## Leverans (när genereringen är gjord)

Enligt skillen: en zip per marknad — `Annonser_NO_fiskespohallare.zip`,
`Annonser_DK_…`, `Annonser_FI_…`, `Annonser_UK_…` — samma filnamn som originalen,
JPEG q92 sRGB < 2 MB/fil, plus den textlösa produktbilden oförändrad i varje zip.
QA bild för bild mot originalet innan något skickas (stavning, siffror, layout).
