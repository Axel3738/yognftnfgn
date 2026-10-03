# Granskning av autosvarets skarpa svar 1–2 oktober (2026-10-03)

Axels fråga: "Vad är det för mail den har svarat på? Kan du granska det och
läsa som en människa?" Åtta kort på sajtens Kundtjänst-flik, alla åtta mejl
och svar lästa i brevlådorna (Bäverbutiken och Matstrumpor, Sent + INBOX),
plus Mechiles uppföljningar. Dom: 3 rätt, 2 skickade kunden fel väg i pengar,
3 svarade på något annat än kunden frågade.

| Kund | Kunden skrev | Boten | Dom | Rättat |
|---|---|---|---|---|
| Thomas (Bäver, 1/10) | presenning med snörstumpar, "känner mig lurad" | ARG, frågar efter ordernumret | rätt | — |
| Christer (Bäver, 2/10) | FÖRE köp: "hoppas att detta inte är samma som Temu säljer … rena skräpet" | ARG: "det du beskriver är helt oacceptabelt" | fel: inget har hänt | förköpsfraserna (hoppas att, samma som Temu/Wish/…) + ett argt ord utan något ärende (inget ordernummer, ingen order, ingen vara, inget klagomål) ⇒ VA:n (`harArende`) |
| Coco (Matstrumpor, 1/10) | snällt "om jag ångrat mitt köp, hur går jag till väga?" | ARG + "levererat, kolla brevlådan" | fel hink | HTML-mejl utan plain-del: Shopifys orderbekräftelse låg i ett `<blockquote>` under Apple Mails "21 sep. 2026 kl. 11:42 skrev …:" och klipptes aldrig, så "Tack för din order!" blev kundens utropstecken. `htmlTillText` ger blockquote en ">"-rad, `taBortCitat` känner citathuvudet med klockslag |
| Tony (Bäver, 2/10) | "stämmer inte med bilden, finns inga band" | ENKEL foton: varan + förpackningen + fraktetiketten | halvbra: fel bilder | ny fotonTyp `avviker`: bild på varan som den kom (fem språk) |
| Lars (Bäver, 2/10) | trasigt vid uthämtningen, ombudet skickade tillbaka till DHL | ENKEL foton | fel: han har inget att fota | `arVaranBorta` ⇒ VA:n, ingen bildförfrågan (också i den arga vägen) |
| Johan #7884 (Bäver, 2/10) | "passar inte enligt den beskrivning som ges", vill returnera | returmallen, "Returfrakten står du själv för" | fel: reklamation | `arReklamation` ⇒ returmallen aldrig; SVÅR till VA:n, som ordnar returen på butikens bekostnad |
| Annica #7361 (Bäver, 2/10) | "Reklamation", felsytt kardborreband, vill returnera | returmallen, egen frakt | fel: reklamation | samma |
| Karl-Arne #7425 (Bäver, 2/10) | mätte fel, "passar inte alls", vill returnera | returmallen | rätt | oförändrat: ett bart "passar inte" är ångerrätt |

Axels order 2026-10-03 ("rätta"): fel vara eller trasig ger aldrig
returmallen med egen frakt; frågor före köp går alltid till Mechile; snälla
ångerfrågor går till Mechile, inte till leveransmallen.

## Mechiles uppföljningar, lästa samma dag

- Christer fick en mall om försenad leverans när han vidarebefordrat
  fraktbekräftelsen. Fel ärende två gånger.
- Tony fick "det tidigare e-postmeddelandet du fick skickades av misstag".
  Det underminerar butikens första svar inför kunden. SOP:en
  "Following up the auto-reply" säger nu uttryckligen: skriv aldrig så.
- Coco togs över bra (retur eller behåll med avdrag).
- Thomas och Lars hade ingen uppföljning alls klockan 05 den 3/10; Thomas
  48-timmarslöfte går ut 3/10 13:50.

## Tester

`kundtjanst/test/autosvar.test.mjs` → "Axels granskning 2026-10-03" (alla åtta
mejlen, Cocos HTML-mejl, fem språk) och `kundtjanst/test/mime.test.mjs` →
"HTML-citat". Peters test från 2026-09-22 (reklamation + "smidig retur" ⇒
returblocket) är omskrivet: reklamation ger inget returblock, en ren
ångerretur gör det fortfarande.
