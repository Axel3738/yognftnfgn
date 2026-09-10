# TackleBay — brandsteget (fas 1, steg 2)

Datum: 2026-09-09. Källa: `/ny-ops` med två Bäverbutik-länkar.
Butik: `iahe0c-b1.myshopify.com` (My Store 5).

## Källprodukterna

| | Fiskespöhållare 4-pack | Adventskalender Fiskedrag |
|---|---|---|
| Handle | `fiskespohallare-4-pack-kraftig-forvaring` | `adventskalender-fiskedrag-24-drag-bakom-24-luckor` |
| Pris | 289 kr (inget jämförpris) | 469 kr (jämförpris 619 kr) |
| SKU | `TEMU-601104615671651` | `TEMU-B6-FISKEKALENDER` |
| Bilder | 5 | 3 |
| Säsong | året runt | Q4, dör 24 december |

Kaching-nivåer, lästa ur båda publika produktsidorna 2026-09-09 (identiska):

| Antal | Rabatt | Badge |
|---|---|---|
| 1 st | 0 % | — (”Standard pris”) |
| 2 st | 15 % | **Mest populär** |
| 3 st | 20 % | — |

Blir A-varianten i paketen. Mitten (2 st) är redan förvald i källan, vilket
stämmer med husregeln ⌈n/2⌉.

## Köparanalys

**Spöhållaren** köps av fiskaren själv. Smärtan är fysisk och konkret: spön
som trasslar i båten och garaget, linor som fastnar i varandra. Känslan som
säljer är ordning och kontroll — allt på sin plats.

**Kalendern köps inte av fiskaren.** Den köps av någon som ska ge honom en
present och inte vet vad. Källans egen ingress säger det rakt ut: ”Vad ger man
den som redan har allt i fiskelådan?” Känslan är lättnad — presentproblemet är
löst utan att gissa storlek eller märke.

Två olika köpare, samma hushåll, samma nisch. Brandet måste därför bära
**nischen**, inte en av produkterna — annars kan butiken inte hålla båda.

## Namnet

**TackleBay.**

- Helt engelskt ord — uppfyller namnregeln (skärpt 2026-09-08).
- Inga å/ä/ö.
- Både svenskar och norrmän läser och uttalar det utan tvekan: *tackla* är
  inlånat i båda språken, *bay* är grundengelska.
- ”Tackle” är kategoriordet för fiskeutrustning och rymmer allt — spön,
  hållare, drag, presentaskar. Namnet låser inte butiken vid en produkt.
- Seriöst, butiksklingande, inte gulligt.

**Namnkollision:** ingen träff på ”TackleBay” som fiskebrand i sökning
2026-09-09. *NorthTackle valdes bort* — det är en befintlig fiskebutik i
Harrislee, Tyskland.

### ⚠️ Domänen är INTE whois-kontrollerad

Registry-whois för `.se` går bara över port 43, och `.se` saknar RDAP i IANA:s
bootstrap. Båda vägarna är stängda i den här containern (agent-proxyn nekar
`rdap.iis.se`). Det som gick att mäta: `tacklebay.se`, `tacklebay.no` och
`northcatch.se` svarar ENOTFOUND, alltså finns ingen DNS — en indikation, inte
ett bevis. **Kontrollen görs skarpt när domänen köps.**

## Palett

| Roll | Hex | Varför |
|---|---|---|
| Djup | `#0F2A33` | Djupt sjövatten. Bär hela loggan och headern. |
| Mässing | `#D9A441` | Skeddrag och spinnare. Värmen mot det kalla vattnet. |
| Ljus | `#F5F2EA` | Off-white, aldrig rent vitt. |
| Vatten | `#16404F` | Mellanton till ytor och sektioner. |
| Stjärnor | `#00B77F` | Husregel — Judge.me-stjärnorna, varje butik. |

Typografi: grotesk i versaler för ordmärket, generöst teckenavstånd.

## Loggan

Tre varianter byggda, se `loggor-jamforelse.png`:

- **A — sigill** (`logga-a-sigill.svg`): krok, ordmärke, linje, `FISHING GEAR`.
  Mest komplett och seriös. **Vald.**
- **B — kroken** (`logga-b-kroken.svg`): stor krok, ordmärke under. Håller bäst
  i småformat.
- **C — horisont** (`logga-c-horisont.svg`): vattenlinje genom cirkeln.

Krokens första version lästes som ett ”J” — öga, hulling och spets ritades om
tills den läses som en krok.

## Öppet beslut — butikens form

`ops.mjs` tar i dag EN produktfil. Produktloopen är inte byggd
(`factory/FLERPRODUKT.md` punkt 1–4). Butiken kan alltså byggas som
huvudprodukt + tillbehör i dag, eller som två jämlika produkter efter att
fabriken byggts om. **Axel har inte svarat än — inget är skrivet till Shopify.**

Oavsett vilket gäller regeln från FLERPRODUKT.md: `creative_prefix` per
PRODUKT, brandet i kampanjnamnet, break-even per produkt.
