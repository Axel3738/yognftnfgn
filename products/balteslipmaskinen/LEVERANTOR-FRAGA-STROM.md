# Bälteslipmaskinen: frågan till leverantören om ström och effekt

Skriven 2026-10-03. Bakgrund: en kund frågade i annonskommentarerna
"what is the wattage, and does it run on 230 V or does it need an adapter?".
Produktsidan sa ingenting om ström. Det vi vet, och varifrån:

| Uppgift | Värde | Källa |
|---|---|---|
| Motor | likströmsmotor, lågvolt, matas av separat nätadapter | leverantörens specbild 2026-09-25 ("Output 12–24 V"); samma modellfamilj hos fem återförsäljare (SI FANG SDJ-N15A m.fl.: "low voltage DC device with a separate power supply", "96 W power supply") |
| Adapterns ingång | **oklart** — specbilden säger "Input voltage 110V", och produktbilden i butiken visar en adapter med amerikansk platt stickpropp | leverantörens specbild + `temu2-balteslip.webp` |
| Effekt | **oklart** — återförsäljarna skriver 96 W för adaptern, ingen uppgift från vår leverantör | woodartsupply.com (SI FANG-listningen), läst 2026-10-03 |
| Varvtal | 4 000–9 000 varv/min, 7 steg, fram/back | specbilden |
| Slipband | 330 × 30 mm | specbilden |
| Vinkel | fast 15° | Axel 2026-09-25 |
| Levererat utan klagomål på kontakten | 168 ordrar / 185 st sedan 2026-08-21, 161 skickade; 12 recensioner (2 negativa: kvalitet och vibration, ingen om ström); 0 kundmejl om adapter eller kontakt | Shopify, Judge.me, supportbrevlådan 2026-10-03 |

Slutsatsen: maskinen fungerar bara så bra som adaptern, och adapterns ingång
är det enda vi inte kan läsa oss till. Därför står det på sidan att maskinen
är en lågvoltsmaskin med medföljande adapter, men inte "230 V" och ingen
watt-siffra, förrän leverantören svarat. Raden byts med
`node products/balteslipmaskinen/produktsida.mjs --strom klar --watt <N> --skarpt`.

## WhatsApp-meddelandet (kopiera rakt av)

```
Hi! Quick question about the mini belt grinder (3-in-1 knife sharpener, 7 speeds, 15°, 330×30 mm belts) that you ship for us to Sweden, Norway, Denmark and Finland.

Customers are asking about power. Can you confirm:
1. What power adapter is included for the European orders: input voltage range (is it 100–240 V, or 110 V only?) and output (12 V or 24 V DC, how many amps)?
2. Which plug is on the adapter cable for EU orders: EU two-pin (type C/F), UK, or US flat pins? If US, do you add a plug adapter in the box?
3. What is the rated power of the machine in watts (motor and adapter)?
4. Is the motor model 755 or 795?

If you have a photo of the adapter label (the sticker with input/output), please send it — that answers everything at once.

Thanks!
```

## När svaret kommer

- Nordisk eller EU-stickpropp, 100–240 V in ⇒ `--strom klar --watt <N>`.
- Universaladapter men US-stickpropp ⇒ be leverantören lägga till en
  resestickpropp i varje låda, och kör `--strom adapter --watt <N>` först när
  det är bekräftat att den följer med.
- 110 V-adapter ⇒ stoppa: ingen rad om ström, Axel avgör (byta adapter hos
  leverantören eller sluta sälja i Europa).

Svaret skrivs in i `kommentarer/produktfakta.md` under Bälteslipmaskin, så
att kommentarsgranskningen och kundtjänsten säger samma sak som sidan.
