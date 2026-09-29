# Lokalisera en HeyGen-SRT — Matstrumpors UGC till en ny marknad (2026-09-28)

Du skriver den text som HeyGen läser upp med den klonade rösten och läppsynkar.
Samma text bränns sedan in som undertext i videon. Det är en annons som ska säljas
till en infödd tittare: den ska låta som en riktig person som pratar, inte som en
översättning.

## Vad du får

- `srt-orig/matstrumpor_<video>.srt` — HeyGens maskinöversättning. **Blocken och
  tidskoderna i den här filen är facit.** Din fil har exakt samma antal block, samma
  nummer och samma tidskoder, tecken för tecken. Bara textraderna ändras.
- `srt-orig/matstrumpor_<video>.orig.srt` — HeyGens svenska transkript av samma block
  (vad som sägs i varje tidsfönster). Transkriptet har hörfel; manuset nedan är sanningen.
- Manuset nedan — ur de inbrända svenska texterna i videon (det talaren faktiskt säger).

## Talarna

- **nathalie**: Nathalie, en kvinna, berättar över bilder. I mitten öppnar en ANNAN kvinna
  (mörkt kort hår) paketet — hon är mottagaren och säger ingenting; Nathalie kommenterar
  henne ("titta på den minen", "ja, hon blev verkligen överraskad").
- **sofie_h1** och **sofie_h2**: Sofie, en kvinna, pratar i kameran och visar lådan.
- Talarna är **kvinnor**: alla språk med genus i verb eller adjektiv (pl "myślałam",
  es/it/pt/fr adjektiv om talaren) ska ha kvinnlig form. Mottagaren i Nathalies video är också
  en kvinna ("sorprendida", "surprise", "zaskoczona" …).

## Manuset (svenska, det som faktiskt sägs)

**nathalie** (27,7 s):
Det här är ditt tecken. Dom sålde slut i november. Ge bort dom, ta med till kalaset eller spara
till julstrumpan. När du ger bort dom här så är det som att du vet allt om personen — du visste
ju deras favoriträtt. Tio sushibitar med ätpinnar i trä. Pizza, burgare och donut i egna lådor
finns också. Fyra looks som verkligen lurar blicken totalt. Titta på den minen. Ja, hon blev
verkligen överraskad. Rolig att öppna och används år efter år. Dom sålde slut i november förra
året, så säkra dina på matstrumpor.se innan det händer igen.

**sofie_h1** (25,0 s):
Jag trodde helt seriöst att det här var riktig sushi. Men här är faktiskt strumpor. Fem par
sushistrumpor, paketerade som en riktig takeaway-låda, och till och med med ätpinnar. Och alltså
förpackningen, pinnarna, kvalitén — det är en riktigt galen och rolig grej. Och jag kan redan
komma på typ tio personer som jag hade kunnat ge det här till. Och det är ju inte bara strumpor,
utan hela grejen i sig blir en present. Och just nu så får du två paket i priset av ett på
matstrumpor.se.

**sofie_h2** (25,6 s): samma som sofie_h1 men krokens första mening är
"Det här måste ju vara den enda sushin som faktiskt hör hemma i en julstrumpa." (hon håller en
stickad julstrumpa i bild).

## Regler (varje brott stoppar filen)

1. **Samma block, samma tidskoder** som HeyGens `.srt`. Ingen sammanslagning, ingen delning,
   inga nya block. Varje block har minst en textrad.
2. **Ungefär samma längd per block som HeyGens text** (±25 % tecken) — rösten ska hinna säga
   det i blockets tid och läpparna följer. Ett block på 2 sekunder rymmer 4–7 ord.
3. **Inget butiksnamn och ingen domän i talet** (Axels regel: butikens namn står aldrig i en
   annons, inte heller domänen). "…på matstrumpor.se" blir "via länken", "i länken nedan",
   "här" eller motsvarande naturligt på språket. Aldrig "Matstrumpor", aldrig ".se".
4. **Inga priser, inga belopp, ingen valuta, ingen leveranstid, ingen rabattprocent.**
   "Två paket i priset av ett" får stå — erbjudandet "Köp 1 – Få 1 gratis" finns i alla
   marknader (butikens paketväljare). Skriv det naturligt, t.ex. "two boxes for the price of one".
5. **Inga nya löften** (ingen "fri frakt", "snabb leverans", "garanti", "begränsat antal").
   "Sålde slut i november (förra året)" är sant och får stå.
6. **Inget "svensk", "Sverige", "skandinavisk"** i talet (det står i annonstexten).
7. **Ingen svenska kvar**, inga svenska ord som "låda", "strumpor", "kalas".
8. **Siffror skrivs som ord** när de sägs ("tio", "fem par", "fyra"), inga symboler (%, &, –, /),
   inga förkortningar. Inget tankstreck — komma eller punkt i stället.
9. **Idiomatiskt, som en infödd kreatör på TikTok/Reels** — kort, pratigt, varmt. "Det här är ditt
   tecken" = den etablerade sociala-medier-frasen på språket (en "This is your sign"). "Julstrumpan"
   = marknadens egen form (en US "stocking"/"stocking stuffer"; de "Weihnachtsstrumpf" eller
   "Nikolausstiefel"; fr "chaussette de Noël" eller "sous le sapin"; nl "kerstsok" eller "onder de
   kerstboom"; es "calcetín de Navidad" eller "para Reyes"; it "calza della Befana"; pl "świąteczna
   skarpeta" eller "pod choinkę"; pt "meia de Natal" eller "sapatinho de Natal"). I sofie_h2 syns en
   julstrumpa i bild — behåll strumpan där. "Kalaset" = en fest/ett party.
10. **Tilltal:** nb/da/nl "du/je", de "du", fr "vous", es "tú" (Spanien), it "tu", pl "ty",
    pt europeisk portugisiska med "tu"-ton, fi "sinä", en "you". Följ marknadens annonstext
    (`annonser/<KOD>.json`) i ton och ordval.
11. **Produktord ur butikens ordlista** (samma ord som tittaren sedan ser i butiken):

| | NO (nb) | DK (da) | FI (fi) | US (en, amerikansk) | DE | FR | NL | ES (Spanien) | IT | PL | PT (Portugal) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| sushistrumpor | sushisokker | sushisokker | sushisukat | sushi socks | Sushi-Socken | chaussettes sushi | sushisokken | calcetines de sushi | calzini sushi | skarpetki sushi | meias de sushi |
| ätpinnar i trä | spisepinner i tre | spisepinde i træ | puiset syömäpuikot | wooden chopsticks | Essstäbchen aus Holz | baguettes en bois | houten eetstokjes | palillos de madera | bacchette di legno | drewniane pałeczki | pauzinhos de madeira |
| låda / paket | boks | æske | rasia | box | Box | boîte | doos | caja | scatola | pudełko | caixa |
| Köp 1 – Få 1 | Kjøp 1 – Få 1 | Køb 1 – Få 1 | Osta 1 – Saat 1 | Buy 1 – Get 1 | Kauf 1 – Bekomm 1 | Achetez-en 1 – Recevez-en 1 | Koop 1 – Krijg 1 | Compra 1 – Llévate 1 | Compri 1 – Ricevi 1 | Kup 1 – Otrzymaj 1 | Compre 1 – Receba 1 |

## Leverans

Skriv `srt-fixed/matstrumpor_<video>.srt` (UTF-8, `\n`, tom rad mellan block, avslutande
radbrytning). Kontrollera själv innan du svarar: blockantal och tidskoder identiska med
HeyGens fil, inget "matstrumpor", ".se", "kr", "€", "$", "%", "–", "—", och inga svenska ord.
