# leverantor/ — förhandla med leverantören

Byggd 2026-10-01 (Axel: "jag tycker det är svårt att förhandla priser med leverantören, och jag har
ingen bra strategi"). Leverantören är **CWD**, agenten i Kina (Slack `cwd-yqg1304`,
`#axel-odhner-fulfill`).

| Fil | Vad |
|---|---|
| `FORHANDLING.md` | **Strategin**: varför, var vi börjar, sex steg, regler, tidplan. |
| **`meddelanden/0-q4-minimum.md`** | **Det enda som ska skickas nu:** de 415 väntande Matstrumpor-ordrarna, nästa sushibeställning, taköverdragets första lager, sista beställningsdag före Black Friday och delbetalning. |
| `meddelanden/1-matstrumpor-lager.md` | Brådskande: var ligger Matstrumpors lager och hur mycket finns inför julen? |
| `meddelanden/2-nyaret.md` | CWD:s stängning inför kinesiska nyåret 6/2 2027. |
| `meddelanden/3-prisgenomgang.md` | Prisuppdelning och volympriser, taköverdraget först. |
| `meddelanden/4-villkor.md` | Frakten varannan vecka, betala när det skickas, garantipolicy för defekter. |
| `meddelanden/5-jamforelseoffert.md` | Offert från Matedropshipping (Evolves leverantör) att jämföra med. |
| **`svar.md`** | **Det CWD har svarat, med datum.** 2026-10-01: deposition + rest vid leverans, beställ 1–2 veckor i förväg, ätpinnar bara när de står på ordern. |
| `inkopsvarde.mjs` | Vilka produkter vi köper in mest av, i kronor (sålda × Cost per item). |
| `rapporter/` | Körningarna av `inkopsvarde.mjs`. |

```bash
node leverantor/inkopsvarde.mjs --skriv
```

Meddelandena skickas av Axel (eller Mechile) i Slack. Ingen session skriver till CWD.
När ett svar kommer: skriv in det här (datum, priser, villkor) och i `lager/konfig.json`
(ledtid, MOQ, nyårsdatum), så räknar lagerplanen med det riktiga.
