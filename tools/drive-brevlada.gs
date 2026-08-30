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
