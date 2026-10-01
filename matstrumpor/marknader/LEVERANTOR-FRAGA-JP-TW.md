# Utkast: frågan till leverantören om Japan och Taiwan

⏸ **Parkerad (Axel 2026-09-30):** "vi ska bara vänta tills vi får försäljning på olika marknader … bara då får vi quotes på de olika marknaderna." Skicka inget förrän en marknad har sålt. Utlandspriserna ligger under tiden minst 20 % över Sverige (`paslag.mjs`), eftersom quoten väntas bli dyr.

Axel 2026-09-30: "Jag hade också viljat testa Japan och Taiwan". `matstrumpor/cogs.json` har landad
kostnad bara för USA/UK/AU/CA/NZ. För Japan och Taiwan vet vi inte ens om leverantören skickar dit,
vad det kostar eller hur lång tid det tar. Svaren avgör om Japan och Taiwan går att sälja med fri
frakt och 5–10 arbetsdagar som de andra marknaderna.

Kopiera texten nedan rakt av. Byt `[Name]` mot kontaktpersonen. Engelska, eftersom leverantören är det.

---

**Subject:** Can you ship to Japan and Taiwan? Landed cost per order + delivery time

Hi [Name],

We want to test Matstrumpor in **Japan and Taiwan**. Before we start, we need to know:

**1. Do you ship to Japan and Taiwan?** If yes, with which carrier, and is the tracking visible on
17TRACK?

**2. Product cost + shipping per order, in USD**, for Japan and for Taiwan, the same way as our US
sheet:

| Product | Variant | Order of 1 | Order of 2 |
|---|---|---|---|
| Sushi socks | 5 pairs | cost + shipping | cost + shipping |
| Sushi socks | 3 pairs | | |
| Donut socks | one size | | |
| Pizza socks | one size | | |
| Hamburger socks | one size | | |
| Wooden chopsticks (gift, ships with the socks) | 1 pair | | |

**3. Delivery time:** the typical door-to-door time in business days to Japan and to Taiwan.

**4. Duties and VAT:** is your price DDU (the customer pays any import charges) or DDP (all included)
for Japan and Taiwan?

Thank you!

Best regards,
Axel
Matstrumpor / STONEBITE ECOM AB

---

## Svar 2026-10-01 (leverantören, vidarebefordrat av Axel)

> Taiwan offers low prices for general cargo, with an estimated delivery time of 11-23 business days.
> Other regions with higher shipping costs for general cargo include: Brazil, Israel, New Zealand,
> Greece, Cyprus, South Africa, Nigeria, Ghana, Uganda, Kenya, Tanzania, Rwanda, Angola, Puerto Rico,
> Morocco, and Azerbaijan. Senegal, Mauritius, Reunion Island, Madagascar, Seychelles, Zambia, Mayotte,
> Iceland, Argentina, Colombia, India. Pakistan, and other unmentioned island nations.
>
> You can sell, but it's best to consider this factor when setting prices. We also provide alerts when
> orders arrive in areas with excessively high shipping costs.

Vad det betyder för oss:

- **Taiwan går att skicka till, billigt, men 11–23 arbetsdagar.** Sajten lovar 5–10 (`konfig.json` →
  `TW.leveranstid`; fyra texter i `output/underlag-zh-TW.json` och spårningssidans `sparning/sprak/zh.json`). Texten ändras innan Taiwan startar — det
  står i `annonser/marknader.json` → `TW.lansering_stopp`, bredvid tull-ID:t (`TAIWAN-TULL.md`). Inget
  kronbelopp gavs, så Taiwan har fortfarande inget kostnadsblock i `cogs.json`.
- **Japan nämns inte.** Löftet 5–10 arbetsdagar för Japan är Axels (2026-09-30: "Det är 5 - 10
  arbetsdagar japan osv"), och Japan startar fre 2026-10-02 00:01 med det.
- **Nya Zeeland står på listan med dyrare frakt**, men leverantörens tidigare offert (`cogs.json` →
  `big5`) ger nästan samma frakt som USA: 5-paret 2,6 + 8,1 USD till NZ mot 2,6 + 8,0 USD till USA. NZ
  ligger kvar i WW.
- **Grekland, Cypern och Island** ligger i Shopifys marknad Europa med fri frakt men har ingen kampanj
  (inget eget språk). Leverantören varnar när en order kommer från ett dyrt område.
- Övriga länder på listan (Brasilien, Israel, Sydafrika …) ingår inte i någon av butikens marknader.

## När svaret kommer

1. Skriv raderna i `matstrumpor/cogs.json` i samma form som `big5.rader` (USD per order), med
   länderna `JP` och `TW`.
2. Skickar leverantören inte dit, eller är leveranstiden längre än 5–10 arbetsdagar: säg det till
   Axel innan något byggs vidare. Fraktlöftet står på sajten, i fraktmejlen och i annonserna.
