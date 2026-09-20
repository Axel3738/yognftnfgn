# Prompten: CaraShells danska annonser

Axel skrev 2026-09-20: *"ska jag kanske få någon prompt för att sätta igång
annons fixet för danmarks marknad sålänge?"* — det här är den.

**Kör den i en NY, tom session** (så säger `/ny-annonser`: annonsfasen rör inte
Shopify och ska inte släpa på butiksbyggets kontext). Klistra in allt mellan
linjerna.

---

```
/ny-annonser carashell/takskyddet

Uppdraget är DANMARK, inte en ny butik. Butiken, priserna och den danska
sidan är redan byggda och live (2026-09-20) — det här handlar bara om
annonserna. Gör BÅDA produkterna: carashell/takskyddet och
carashell/termoskyddet.

KONTOT: MagiBorsten DK, act_915422744950975 — samma delade OPS-konto som SE
och NO. ⚠️ INTE Magiborsten UK 1107817401910319 (det är USA/GB/CA/AU/NZ).
⚠️ Kontot heter "MagiBorsten DK" men är inte Danmarks eget: det bär alla
OPS-butikers kampanjer OCH Bäverbutikens egna danska kampanjer. Filtrera
varje uppslag på prefixet CaraShell / CARASHELL_ — aldrig på "DK" i namnet.
Mätt 2026-09-20: ingen CARASHELL_DK_-kampanj finns ännu.

PRISERNA (Axels beslut 2026-09-20, står i produktfilerna — läs dem, citera
inte den här texten):
  Taköverdraget  819 DKK (5,5 och 6,5 m) upp till 1 629 DKK (13,5 m),
                 jämförpris 1 069–2 119
  Termoskyddet   409 DKK, jämförpris 679

LÄNKARNA: https://carashell.se/da/products/takskyddet?country=DK
          https://carashell.se/da/products/termoskyddet?country=DK
⚠️ `?country=DK` är obligatoriskt. Utan den skickas besökaren vidare till
carashell.com och ser engelska och dollar. Ta länken ur
`factory/opsmarknader.mjs` (`marknadslank`), gissa den aldrig.

SPRÅKET: danska. ⚠️ **Omdubbningen görs med ElevenLabs, inte HeyGen.**
Axel dömde ut HeyGens klonröst 2026-09-16 kväll; vägen som gäller står i
`pipeline/omdubb/README.md` under rubriken "ElevenLabs-vägen (den som gäller
sedan 2026-09-16 kväll)":

  node pipeline/omdubb/elevenlabs-omdubb.mjs --kalla=<källa.mp4> \
       --srt=<manus.srt> --ut=<ut.mp4> --rost="<röstnamn>" [--torr]

Kör `--torr` först och läs tabellen — en ⚠️-rad betyder att manuset är för
långt för filmen. Efteråt: `python3 pipeline/rostkoll.py` (obligatoriskt,
gratis) och captions med `no-captions.py`. Noll HeyGen-krediter.
⚠️ `CLAUDE.md` beskriver fortfarande `/translate` som HeyGen. Den raden är
inte uppdaterad efter 2026-09-16 och gäller Bäverbutikens `/translate`-flöde,
inte OPS-omdubben. Följ README:n i `pipeline/omdubb/`.

⚠️ **DANSK RÖST SAKNAS — fråga Axel innan första videon renderas.** README
listar bara SE ("Martin - Warm, Confident and Relatable") och NO ("Martin -
Clear and Comforting") och har järnregeln *"dubba aldrig norska med den
svenska rösten"*. Samma sak gäller danska. Mätt 2026-09-20 med
`cd voiceover && npm run voices`: ingen röst på kontot är märkt dansk.
Rendera ingen dansk video förrän rösten är bestämd.

── SLUTKORTEN, det här är hela poängen ──────────────────────────────────

Axels order 2026-09-20: "endcardsen … har bäverbutikens logga på sig och det
måste vi fixa inför danmark. Men du behöver inte gå tillbaka och fixa någon
av de tidigare på de andra marknaderna."

MÄTT 2026-09-20, använd det, mät inte om det:
  · 9 av Bäverbutikens 24 svenska taköverdrags-videor slutar med ett
    slutkort på EXAKT 3,0 sekunder — starttid = videons längd minus 3,0 s.
  · 8 av dem bär Bäverbutikens logga (svart ruta, rött bäverhuvud, guld
    ordmärke, svensk flagga, svensk titel, "10 recensioner", 1 469 kr
    överstruket / 1 129 kr).
  · Den nionde (PD_5) bär en blå badge med "carashell.se" — också fel,
    butikens domän får inte stå i en annons.
  · Videorna: CO_101, OB_101, PD_5, PD_106, PD_107, RI_101, RI_103,
    SP_104, UG_101. De övriga 15 har inget slutkort.
  · Termoskyddets 12 videor har inget slutkort — men sista captionen säger
    "Från CaraShell." rakt ut. Samma regel, samma åtgärd.

GÖR SÅ HÄR:
  1. `python3 factory/slutkort.py --marknad DK …` bygger ett danskt
     slutkort ur produktfilen, butiksfilen och opsmarknader-raden: ingen
     logga, inget butiksnamn, ingen domän. Läs filens egen hjälptext.
     Finns filen inte: receptet står i
     `market-expansion/ops/carashell/2026-09-18-us/video/bygg-cap.py`
     (funktionen `slutkort()`) — den byggde US-korten och är bevisad.
  2. `python3 factory/slutkortskoll.py <video.mp4>` säger vilka videor som
     HAR ett slutkort och från vilken sekund. Lita inte på listan ovan för
     en video du inte känner igen — mät.
  3. Lägg kortet som PNG-lager över de sista 3 sekunderna och rendera med
     `pipeline/no-precis.py`. Noll HeyGen-krediter — bara ffmpeg och PIL.
     ⚠️ `forbehandla.py` lägger 2,5 s tpad; utan den tappar no-precis ~50
     bildrutor i slutet, alltså precis slutkortet.
  4. Sista captionen som säger butikens namn tas bort eller skrivs om.

── ORDNINGEN ────────────────────────────────────────────────────────────

  1. Bygg TOMMA DK-kampanjer, PAUSED, en per produkt:
     `node factory/kampanj.mjs carashell/takskyddet --marknad DK --tom`
     `node factory/kampanj.mjs carashell/termoskyddet --marknad DK --tom`
     Samma låsta struktur som alltid: CBO-kampanj → ett adset per koncept
     utan egen budget → annonserna i sitt adset. Hitta aldrig på en egen.
  2. Fixa slutkorten enligt ovan.
  3. Dansk copy skrivs av en subagent med model: "sonnet", som får
     `docs/copy-regler.md`. Huvudsessionen skriver aldrig slutgiltig copy.
     Butikens namn står ALDRIG i copyn (Axels beslut 2026-09-18).
  4. Ladda upp — allt föds PAUSED, status explicit på alla tre nivåer.
  5. `node factory/rakning.mjs carashell` — ordet "klart" får bara skrivas
     när exitkoden är 0.
  6. Först när kampanjerna står rätt:
     `node factory/register.mjs annonsmarknader carashell/takskyddet NO,US,DK`
     `node factory/register.mjs annonsmarknader carashell/termoskyddet NO,DK`
     (termoskyddet har inte US i dag — kolla registret innan du skriver.)
  7. `/notionscalercs setup carashell/takskyddet` bygger då den dagliga
     DK-rutinen `/ops-oversatt carashell/takskyddet --marknad DK` kl 18:05
     (`ops-oversatt-dk` i `factory/rutin.mjs`, plats 5). Setup är idempotent
     — den bygger bara det som saknas. ⚠️ CaraShells rutiner ligger på
     kontot `claude5@stonebite.org`; en rutin räknas som byggd först när du
     sett den i `list_triggers` på det konto du faktiskt sitter på.
  8. Kampanjerna står PAUSED tills Axel skriver "Launch: <namn>".

── SPÄRRAR ──────────────────────────────────────────────────────────────

  · Rör inte Shopify. Shopify-MCP:n är förbjuden i den här fasen.
  · En PAUSED kampanj med spend > 0 kr är ett beslut — aktivera den aldrig.
  · En annons som redan är live stängs aldrig av i efterhand.
  · Gå INTE tillbaka och rätta slutkorten i NO, US, GB, CA, AU eller NZ.
    Åtta norska annonser ligger live med Bäverbutikens logga just nu; Axel
    har sagt att de får ligga.
```

---

## Det som INTE ingår i prompten, men Axel bör veta

- **Finland har en kampanj men ingen marknad i annonstabellen.**
  `CARASHELL_FI_Kattopeite Asuntovaunu | Launch 2026-09-18` står PAUSED i
  OPS-kontot, men `FI` finns inte i `factory/opsmarknader.mjs` och inte i
  någon `annonsmarknader`. Den byggdes alltså för hand och har ingen daglig
  rutin som fyller den. Ska Finland ha samma automatik som NO/US/DK är det
  ett eget, litet jobb — säg till.
- **Luckan som släppte igenom loggan:** `tools/ops-spegla.mjs` letar bara
  efter "Bäverbutiken" i COPY och BRIEFTEXT, aldrig i bildrutorna. Det är
  därför loggan följde med till Norge utan att någon spärr sa ifrån.
