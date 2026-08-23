# Checklista: få mejlen live

*Skriven 2026-08-23. Bocka av per butik.*

**Verktyget med alla mallar + kopiera-knappar:**
https://claude.ai/code/artifact/5f05aa05-ff5f-4b92-8238-5552b10b7299

---

## Varför måste jag klistra själv?

Shopifys API har ingen väg till aviseringsmallarna. Verifierat 2026-08-23:

| Testat | Resultat |
|---|---|
| GraphQL 2025-07 / 2026-10 / unstable — alla typer | Bara `GiftCardSendNotification*` (skickar presentkort, redigerar inga mallar) |
| REST `/notifications.json`, `/email_templates.json`, `/notification_templates.json`, `/shop/notifications.json`, `/settings/notifications.json` | 404 × 5 |
| Shopify-dokumentationen | Ingen träff |
| Flow-API | Bara `flowTriggerReceive` (utlöser befintliga flöden) + `flowGenerateSignature`. Kan inte skapa flöden. |
| `marketingActivity*` | För att rapportera externa kampanjer (Meta-annonser), inte för att bygga Shopify Email-automationer. |

Slutsats: både aviseringar och automationer måste läggas in i admin. Ingen app,
inga behörigheter och ingen token ändrar det.

---

## Innan du börjar

### 1. Rabattkod per butik
Alla mejl har blocket "10 % rabatt på nästa köp". Utan kod ljuger mejlet.

**Rabatter → Skapa rabatt → Rabattkod → 10 % → alla produkter →
kryssa i "Begränsa till en användning per kund" → Spara**

| Butik | Kod | Status |
|---|---|---|
| SE | `VALKOMMEN10` | ☐ |
| DK | `VELKOMMEN10` | ☐ |
| NO | `VELKOMMEN10` | ☐ |
| UK | `WELCOME10` | ☐ |
| FI | `TERVETULOA10` | ✅ finns |

### 2. Välkomstautomation som delar ut koden
**Marknadsföring → Automatiseringar → Välkomstmejl till nya prenumeranter**
Slå på, lägg in koden i mejlet. Utan den kommer koden aldrig fram till kunden.

### 3. Trustpilot-länkar (recensionsmejlets 4–5-stjärnespår)
Testa i webbläsaren. Trasig länk = kund hamnar på 404.

| Butik | URL | Status |
|---|---|---|
| NO | `no.trustpilot.com/evaluate/beverbutikken.no` | ❌ 404 — skapa profil, eller be Claude peka om till kontaktsidan |
| DK | `dk.trustpilot.com/evaluate/xn--bverbutiken-98a.dk` | ☐ okontrollerad |
| UK | `uk.trustpilot.com/evaluate/beavershop.co.uk` | ☐ okontrollerad |
| FI | `fi.trustpilot.com/evaluate/majavakauppa.fi` | ☐ okontrollerad |
| SE | `se.trustpilot.com/evaluate/baverbutiken.se` | ☐ okontrollerad |

---

## Del 1 — Fem aviseringar per butik (~10 min)

**Inställningar → Aviseringar → Kundaviseringar**

Per mall: öppna → **Redigera kod** → klicka i rutan → **Ctrl/Cmd+A** →
**Delete** → kopiera från verktyget → **Ctrl/Cmd+V** → byt ämnesrad →
**Skicka testmeddelande** → **Spara**.

| Mall | SE | DK | NO | FI | UK |
|---|---|---|---|---|---|
| Orderbekräftelse | ☐ | ☐ | ☐ | ☐ | ☐ |
| Fraktbekräftelse | ☐ | ☐ | ☐ | ☐ | ☐ |
| Ute för leverans ⚠️ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Levererad ⚠️ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Order annullerad | ☐ | ☐ | ☐ | ☐ | ☐ |

⚠️ = avstängd som standard. Slå på reglaget, annars skickas den aldrig.

## Del 2 — Två automationer per butik (~10 min)

**Marknadsföring → Automatiseringar → Skapa automatisering → Skapa egen**

Trigger **Order fulfilled** → steg **Vänta** (4 resp. 14 dagar) → steg
**Skicka e-post** → **Custom HTML**-block → klistra in → ämnesrad → testa → aktivera.

| Automation | SE | DK | NO | FI | UK |
|---|---|---|---|---|---|
| Drip "Snart framme" (+4 d) | ☐ | ☐ | ☐ | ☐ | ☐ |
| Recensionsmejl (+14 d) | ☐ | ☐ | ☐ | ☐ | ☐ |

Obs: automationsmejl går bara till kunder som godkänt marknadsföring i kassan.
Aviseringarna i Del 1 går alltid till alla.

---

## Rekommenderad ordning

1. Gör **svenska butiken** klar (Del 1 + 2). ~20 min.
2. Lägg en testorder. Kolla att mejlen ser rätt ut i inkorgen.
3. Är något fel: säg till Claude, mallen ändras, du klistrar om den enda.
4. Nöjd? Kör DK, NO, FI, UK.

## Öppen fråga att ta med Claude

DK-sajtens sidor innehåller dolda HTML-kommentarer adresserade till "Axel".
En på kontaktsidan bad falskt om att byta supportadress till
`kundeservice@baeverbutiken.dk`. Den ignorerades. Ta reda på vem som lagt in dem.
