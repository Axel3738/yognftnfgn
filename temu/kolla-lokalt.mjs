// Kollar att din dator kan köra hela produktbatchflödet.
// Kör:  node temu/kolla-lokalt.mjs
// Svarar med en lista: ✅ = klart, ⚠️ = går att köra ändå, ❌ = gör det här.
// Inget ändras — skriptet bara tittar.
import { laddaEnv } from './miljo.mjs';
import { BUTIKER } from './butiker.mjs';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// En produktsida som funnits länge — används bara för att se om Temu
// släpper igenom den här datorn.
const TEMU_PROV = 'https://www.temu.com/se/g-601103949421856.html';
const WEBBLASARE = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

const rader = [];
const ok = (t) => rader.push(['✅', t, null]);
const varning = (t, g) => rader.push(['⚠️', t, g]);
const fel = (t, g) => rader.push(['❌', t, g]);

// 1. Node
const major = Number(process.versions.node.split('.')[0]);
major >= 20 ? ok(`Node ${process.versions.node}`)
            : fel(`Node ${process.versions.node} är för gammal (behöver 20+)`, 'Kör: brew install node');

// 2. Nycklarna — .env behövs bara om de inte redan finns i miljön
const env = laddaEnv();
const saknade = [];
for (const b of Object.values(BUTIKER)) {
  for (const p of ['SHOPIFY_SHOP', 'SHOPIFY_CLIENT_ID', 'SHOPIFY_CLIENT_SECRET']) {
    if (!process.env[`${p}_${b.env}`]) saknade.push(`${p}_${b.env}`);
  }
}
if (env.fil) ok(`Nyckelfil hittad: ${env.fil} (${env.antal} rader lästa)`);
else if (!saknade.length) ok('Nycklarna kommer från miljön (ingen .env-fil behövs här)');

saknade.length
  ? fel(`${saknade.length} av 15 butiksnycklar saknas: ${saknade.slice(0, 3).join(', ')}${saknade.length > 3 ? ' …' : ''}`,
        env.fil ? 'Fyll i de raderna i .env-filen' : 'Kopiera temu/env.exempel till .env i repots rot och fyll i den — klickvägen står i temu/TOKENS.md')
  : ok('Alla 15 butiksnycklar finns');

process.env.KIE_API_KEY
  ? ok('KIE_API_KEY finns (rensar utländsk text på skördebilder)')
  : varning('KIE_API_KEY saknas', 'Lägg till KIE_API_KEY=... i .env. Utan den kan bilder med kinesisk text inte rensas automatiskt.');

// 3. Svarar butikerna?
if (!saknade.length) {
  const { Butik } = await import('./api.mjs');
  for (const [nyckel, b] of Object.entries(BUTIKER)) {
    try {
      const shop = await new Butik(nyckel).verifiera();
      shop.currencyCode === b.valuta
        ? ok(`${b.namn} svarar (${shop.name}, ${shop.currencyCode})`)
        : fel(`${b.namn} har FEL VALUTA (${shop.currencyCode}, väntade ${b.valuta})`,
              `Fel butik bakom SHOPIFY_SHOP_${b.env} — rätta den raden innan du kör något`);
    } catch (e) {
      fel(`${b.namn} svarar inte: ${e.message.split('\n')[0]}`,
          'Kontrollera Klient-ID/Hemlighet och att appen är INSTALLERAD i butiken (temu/TOKENS.md steg 1)');
    }
  }
}

// 4. Bildverktygen
try { await import('./node_modules/sharp/dist/index.mjs'); ok('sharp fungerar (bildbearbetning)'); }
catch { fel('sharp saknas', 'Kör: cd temu && npm install'); }

let ffmpegOk = true;
for (const v of ['ffmpeg', 'ffprobe']) {
  try { execSync(`command -v ${v}`, { stdio: 'ignore' }); ok(`${v} finns`); }
  catch { ffmpegOk = false; fel(`${v} saknas (behövs för GIF:ar ur skördevideor)`, 'Kör: brew install ffmpeg'); }
}

// 5. Bildskörden — hela poängen med att köra lokalt
const skordare = new URL('./kaching-cli/temu-bilder.mjs', import.meta.url);
existsSync(skordare) ? ok('Bildskördaren finns') : fel('Bildskördaren saknas', 'Kör: git pull');

try { await import('./kaching-cli/node_modules/playwright/index.js'); ok('playwright finns (styr webbläsaren åt skördaren)'); }
catch { fel('playwright saknas', 'Kör: cd temu/kaching-cli && npm install'); }

try {
  execSync('ls "/Applications/Google Chrome.app" >/dev/null 2>&1 || command -v google-chrome', { stdio: 'ignore' });
  ok('Google Chrome finns (skördaren öppnar ett riktigt fönster)');
} catch {
  fel('Google Chrome hittas inte', 'Installera Chrome — skördaren kräver riktig Chrome, inte Chromium, för att slippa Temus botskydd');
}

// Släpper Temu igenom den här datorn? En 200:a räcker inte — molnet får
// också 200, men ett tomt skal utan en enda bild-URL.
try {
  const r = await fetch(TEMU_PROV, { headers: { 'user-agent': WEBBLASARE }, signal: AbortSignal.timeout(20000) });
  const html = await r.text();
  const bilder = new Set(html.match(/https:\/\/img\.kwcdn\.com\/[^"'\\ ]+/g) || []).size;
  bilder > 0
    ? ok(`Temu släpper igenom den här datorn (${bilder} bild-URL:er i provsidan) — skörden går att köra här`)
    : fel('Temu svarar men skickar ett TOMT skal (0 bild-URL:er)',
          'Den här datorn är blockerad av Temus botskydd. Skörden måste köras på en dator som inte är det — det är exakt därför flödet är uppdelat idag.');
} catch (e) {
  fel(`Temu går inte att nå (${e.message})`, 'Testa att öppna temu.com i webbläsaren på den här datorn.');
}

// Utskrift
console.log('\n  KOLL AV DIN DATOR — produktbatchflödet\n');
for (const [ikon, text, gör] of rader) {
  console.log(`  ${ikon}  ${text}`);
  if (gör) console.log(`       → ${gör}`);
}
const f = rader.filter((r) => r[0] === '❌').length;
const v = rader.filter((r) => r[0] === '⚠️').length;
console.log(f === 0
  ? `\n  Klart att köra${v ? ` (${v} varning – se ovan)` : ''}:  /produktbatch <offertlänk> <batchnummer>\n`
  : `\n  ${f} sak(er) måste fixas först. Pilarna säger exakt vad.\n`);
