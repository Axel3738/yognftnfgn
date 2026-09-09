// Mail-brevlådan: ett Apps Script som lämnar ut supportmailen som JSON.
//
// VARFÖR DEN BEHÖVS: containern som kör veckorutinen når bara HTTPS på port
// 443. IMAP mot Loopia (port 993/143) är stängt — mätt 2026-09-09, både
// direkt och tunnlat genom proxyn. Det här scriptet kör hos Google, där
// mailen går att läsa, och svarar över HTTPS som rutinen kan nå.
//
// FÖRUTSÄTTNING: supportmailen måste landa i den Gmail-brevlåda som
// distribuerar scriptet. Loopia-mailen till kundsupport@baverbutiken.se
// vidarebefordras dit (Loopias kundzon → E-post → kontot → Vidarebefordring).
// Originalet ligger kvar i Loopia — vidarebefordring tar inget bort.
//
// INSTALLATION (en gång, ~3 minuter):
//   1. Gå till script.google.com → Nytt projekt.
//   2. Radera allt i rutan, klistra in HELA den här filen.
//      Döp projektet till "Kundvakten brevlåda".
//   3. Byt NYCKEL nedan till en egen hemlighet.
//   4. Klicka Distribuera → Ny distribution → typ "Webbapp".
//      - Kör som: "Jag" (ditt konto)
//      - Vem har åtkomst: "Alla"   ← krävs; skyddet är nyckeln
//   5. Godkänn behörigheterna, kopiera webbappens URL.
//      URL:en läggs i miljön som MAIL_BREVLADA_URL och nyckeln som
//      MAIL_BREVLADA_KEY.
//
// ⚠️ UPPDATERING av en redan installerad brevlåda: klistra in den nya koden
// och gör Distribuera → Hantera distributioner → pennan → Version "Ny
// version". En sparad ändring utan ny version körs INTE av webbappen.

const NYCKEL = 'byt-mig-innan-du-distribuerar';

// Vilken etikett eller sökning som räknas som supportmail. Står mailen i
// inkorgen räcker to:-sökningen; använder du en Gmail-etikett, sätt den här.
const SOKNING = 'to:kundsupport@baverbutiken.se';

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.key !== NYCKEL) return svara({ ok: false, fel: 'fel nyckel' });

  try {
    const dagar = Math.min(parseInt(p.dagar, 10) || 7, 60);
    const trad = GmailApp.search(`${SOKNING} newer_than:${dagar}d`, 0, 200);
    const mail = [];

    for (const t of trad) {
      const meddelanden = t.getMessages();
      // Ett svar från oss i tråden betyder att kunden har fått svar. Det är
      // vad rutinen behöver för att kunna larma om obesvarade kunder.
      const besvarad = meddelanden.some((m) => isFranOss(m.getFrom()));

      for (const m of meddelanden) {
        if (isFranOss(m.getFrom())) continue; // våra egna svar är inte ärenden
        mail.push({
          id: m.getId(),
          tradId: t.getId(),
          datum: m.getDate().toISOString(),
          fran: adressAv(m.getFrom()),
          amne: m.getSubject() || '',
          // Bara ren text, kapad. Rapporten behöver ärendetypen, inte hela
          // brevet — och kortare svar går snabbare att hämta.
          text: (m.getPlainBody() || '').slice(0, 2000),
          besvarad: besvarad,
        });
      }
    }

    return svara({ ok: true, antal: mail.length, dagar: dagar, mail: mail });
  } catch (fel) {
    return svara({ ok: false, fel: String(fel) });
  }
}

// Adresser på våra egna domäner räknas som svar från butiken, inte som ärenden.
function isFranOss(fran) {
  const a = adressAv(fran).toLowerCase();
  return (
    a.indexOf('@baverbutiken.se') !== -1 ||
    a.indexOf('@stonebite.org') !== -1 ||
    a.indexOf('@beverbutikken.no') !== -1
  );
}

// Plockar ut ren adress ur "Namn Namnsson <adress@exempel.se>".
function adressAv(fran) {
  const m = String(fran || '').match(/<([^>]+)>/);
  return m ? m[1] : String(fran || '');
}

function svara(objekt) {
  return ContentService.createTextOutput(JSON.stringify(objekt)).setMimeType(
    ContentService.MimeType.JSON
  );
}
