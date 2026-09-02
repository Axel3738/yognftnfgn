// Drive-brevlådan: ett Apps Script som tar emot filer och lägger dem i en Drive-mapp.
// Körs som Axels konto — därför kan rutinen ladda upp videor utan API-nycklar.
//
// INSTALLATION (en gång, ~2 minuter):
//   1. Gå till script.google.com → Nytt projekt.
//   2. Radera allt i rutan, klistra in HELA den här filen. Döp projektet till "Drive-brevlådan".
//   3. Klicka Distribuera → Ny distribution → typ "Webbapp".
//      - Kör som: "Jag" (ditt konto)
//      - Vem har åtkomst: "Alla"   ← krävs; skyddet är den hemliga nyckeln nedan
//   4. Godkänn behörigheterna, kopiera webbappens URL och klistra in den i chatten.
//
// SÄKERHET: byt NYCKEL till valfri egen hemlighet innan du distribuerar.
// Anrop utan rätt nyckel avvisas. URL:en + nyckeln läggs i environmentet som
// DRIVE_UPLOAD_URL och DRIVE_UPLOAD_KEY.
//
// ⚠️ UPPDATERING av en redan installerad brevlåda: klistra in den nya koden och
// gör Distribuera → **Hantera distributioner** → pennan → Version "Ny version".
// En sparad ändring utan ny version körs INTE av webbappen — URL:en svarar kvar
// med den gamla koden, och nya actions ser ut att saknas.
//
// VEM den körs som avgör vad den får göra: valet "Kör som: Jag" gör att alla
// anrop utförs av kontot som distribuerade. Ska brevlådan flytta mappar i
// Products/LAUNCHED måste den distribueras av det konto som äger de mapparna
// (axel.odhner@stonebite.org per 2026-09-01), inte av ett annat Google-konto.

const NYCKEL = 'beverbutiken-no-2026';

function doPost(e) {
  const p = e.parameter;
  if (p.key !== NYCKEL) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, fel: 'fel nyckel' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const mapp = DriveApp.getFolderById(p.folderId);
  const blob = Utilities.newBlob(Utilities.base64Decode(e.postData.contents), p.mimeType || 'video/mp4', p.name);
  const fil = mapp.createFile(blob);
  return ContentService.createTextOutput(JSON.stringify({ ok: true, id: fil.getId(), namn: fil.getName() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// doGet = mapphantering utan filkropp. Nattrutinen har inga mcp__*-verktyg (bara
// Bash), så connectorn finns inte att flytta med — den här vägen körs med curl.
// Webbappen kör som Axels konto och har därför organiseringsrätt i Products och
// LAUNCHED oavsett vem som äger själva produktmappen (redigerarna äger sina egna).
//
//   ?key=…&action=lista&folderId=<mapp>          → undermappar med id och namn
//   ?key=…&action=flytta&fileId=<mapp>&till=<mapp>
function doGet(e) {
  const p = e.parameter;
  const svar = (o) => ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
  if (p.key !== NYCKEL) return svar({ ok: false, fel: 'fel nyckel' });

  try {
    if (p.action === 'lista') {
      const it = DriveApp.getFolderById(p.folderId).getFolders();
      const ut = [];
      while (it.hasNext()) { const m = it.next(); ut.push({ id: m.getId(), namn: m.getName() }); }
      return svar({ ok: true, mappar: ut });
    }

    if (p.action === 'flytta') {
      if (!p.fileId || !p.till) return svar({ ok: false, fel: 'kräver fileId och till' });
      const mapp = DriveApp.getFolderById(p.fileId);
      const mal = DriveApp.getFolderById(p.till);
      // Redan på plats? Svara ok utan att röra något — rutinen kör om varje natt.
      const foraldrar = mapp.getParents();
      while (foraldrar.hasNext()) {
        if (foraldrar.next().getId() === mal.getId()) {
          return svar({ ok: true, namn: mapp.getName(), redan: true });
        }
      }
      mapp.moveTo(mal);
      // Läs tillbaka: moveTo kastar inte alltid vid nekad rättighet.
      const efter = mapp.getParents();
      const nu = efter.hasNext() ? efter.next().getId() : null;
      if (nu !== mal.getId()) return svar({ ok: false, fel: 'flytten gick inte igenom', hamnade_i: nu });
      return svar({ ok: true, namn: mapp.getName(), redan: false });
    }

    return svar({ ok: false, fel: 'okänd action: ' + (p.action || '(saknas)') });
  } catch (err) {
    return svar({ ok: false, fel: String(err && err.message ? err.message : err) });
  }
}
