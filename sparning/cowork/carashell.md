# Cowork-prompt: spårningen i CaraShell (carashell.se)

Sidan **https://carashell.se/pages/spara** är publicerad (2026-09-20 kväll,
140 paket) och rutinen `/sparning carashell` bygger om den varje timme.
Det som återstår är klick i Shopify-admin utan API: mejlmallarna och
menyn. Axel klistrar inte in något själv — den här texten är uppgiften,
kopierad rakt in i Cowork. Delen under linjen är prompten.

---

Du jobbar i Chrome i min inloggade Shopify-admin för butiken **CaraShell**
(carashell.se, yitrbk-m3.myshopify.com). Två uppgifter: **A.** peka
fraktmejlens spårningsknapp på butikens egen spårningssida, **B.** lägga in
länken **Spåra paket** i huvudmenyn och sidfoten. Sedan **C.** ett testmejl.
Rör ingenting annat i Shopify: inga andra mallar, inga inställningar, inga
rabatter, inga produkter, inga andra menyrader.

⚠️ **Datorn är en Mac. Använd Cmd, aldrig Ctrl.** Ctrl+A och Ctrl+C tolkas
som Shopifys egna kortkommandon och öppnar dialoger ("Lägg till produktserie",
"Lägg till sida"). Öppnas en sådan dialog: stäng den utan att spara.

⚠️ **Kontrollera alltid mot servern, inte mot redigeraren.** Shopify sparar
osparade utkast i webbläsaren och lägger tillbaka dem efter F5. Läs mallens
innehåll ur Shopifys egen mall-data efter sparning och jämför. Klicka aldrig
"Ignorera" på raden "Osparade ändringar" utan att först ha läst vad servern har.

Kontrollera först att https://carashell.se/pages/spara svarar och visar
rubriken "Spåra ditt paket". Gör den inte det: stoppa och rapportera.

### A. Fraktmejlen (tre kundnotiser)

Gå till **Inställningar** → **Notiser** → **Kundaviseringar**. Öppna en
mall i taget: **Leveransbekräftelse** (Shipping confirmation),
**Leveransuppdatering** (Shipping update) och **Ute för leverans** (Out for
delivery). ⚠️ Inte "Order ute för lokal leverans", inte "Levererad".

I varje mall: klicka **Redigera kod**. Gör tre byten i brödtexten
(E-postbrödtext HTML):

1. Varje förekomst av `{{ fulfillment.tracking_url }}` byts mot exakt:

   `https://carashell.se/pages/spara?nummer={{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'CS-' }}`

2. Varje ställe där fraktbolagets nummer skrivs ut som text —
   `{{ fulfillment.tracking_number }}`, eller en slinga
   `{% for tracking_number in fulfillment.tracking_numbers %} … {{ tracking_number }} … {% endfor %}` —
   byts numret mot exakt:

   `{{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'CS-' }}`

   Står texten "Spårningsnummer" eller "Tracking number" intill: byt till
   **Ditt paketnummer**. Fraktbolagets namn (`{{ fulfillment.tracking_company }}`)
   ska tas bort där det står — kunden ska inte se var paketet kommer ifrån.

3. Finns en länk till `{{ fulfillment.tracking_url }}` kvar någonstans i
   mallen efter steg 1 (sök i koden): byt den också.

Rör inga andra rader. Ämnesraden rörs inte. Klicka **Spara**, läs sedan
mallen ur serverns mall-data och kontrollera att `pages/spara?nummer=` och
`sha256` finns och att `tracking_url` INTE finns kvar.

Om en mall inte innehåller `tracking_url` eller `tracking_number` alls: rör
den inte och skriv det i rapporten.

### B. Menylänken

1. **Onlinebutik** → **Navigering**.
2. Öppna **Huvudmeny** (Main menu). Finns redan en rad som pekar på
   `/pages/spara`: rör den inte. Annars **Lägg till menyalternativ**,
   Namn: `Spåra paket`, Länk: `/pages/spara` (eller Sidor → **Spåra ditt
   paket**). **Lägg till**, sedan **Spara menyn**. Raden ska ligga sist.
3. Samma sak i **Sidfotsmeny** (Footer menu) — heter sidfotsmenyn något
   annat, ta den meny butikens sidfot faktiskt visar (öppna carashell.se
   och jämför).
4. Kontrollera i kundens vy: öppna https://carashell.se i en ny flik,
   ladda om, se att **Spåra paket** syns i huvudmenyn och sidfoten och att
   klicket landar på "Spåra ditt paket".

Skapa aldrig en ny meny, ta aldrig bort en rad, ändra inga andra namn.
(Butiken har fler språk — norska på /nb, engelska på carashell.com, finska
på /fi. Menyradens namn får stå på svenska tills vidare; översätt den inte.)

### C. Testmejlet

Gå in på **Leveransbekräftelse** och klicka **Skicka testmejl** uppe till
höger. Bara den mallen.

### Rapportera tillbaka

1. Vilka av de tre mallarna som ändrades och verifierades mot servern, och
   om någon saknade `tracking_url`.
2. Om `Ditt paketnummer` och `sha256` finns i varje ändrad mall.
3. Menyerna: vilka två menyer som fick raden, och vad du såg i kundens vy.
4. Om testmejlet gick iväg, och till vilken adress.
5. Allt som såg konstigt ut, även småsaker.

Om Shopify vägrar spara: spara inte om, skriv exakt vad felmeddelandet sa.
