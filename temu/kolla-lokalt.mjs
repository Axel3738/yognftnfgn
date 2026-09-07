// Kollar att din dator kan köra hela produktbatchflödet.
// Kör:  node temu/kolla-lokalt.mjs
// Svarar med en lista: ✅ = klart, ⚠️ = går att köra ändå, ❌ = gör det här.
// Inget ändras — skriptet bara tittar.
import { laddaEnv } from './miljo.mjs';
import { BUTIKER } from './butiker.mjs';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

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
major >= 20 ? ok(`Node ${process.versions.node} (${process.platform === 'win32' ? 'Windows' : process.platform === 'darwin' ? 'Mac' : process.platform})`)
            : fel(`Node ${process.versions.node} är för gammal (behöver 20+)`,
                  process.platform === 'win32' ? 'Kör: winget install OpenJS.NodeJS.LTS' : 'Kör: brew install node');

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
  : varning('KIE_API_KEY är tom', 'Fyll i raden KIE_API_KEY= i .env. Utan den kan bilder med utländsk text inte rensas automatiskt.');

// 3. Svarar butikerna?
if (!saknade.length) {
  const { Butik } = await import('./api.mjs');
  for (const [nyckel, b] of Object.entries(BUTIKER)) {
    let sista;
    for (let försök = 0; försök < 2; försök++) {
      try {
        const shop = await new Butik(nyckel).verifiera();   // kastar själv vid fel valuta
        ok(`${b.namn} svarar (${shop.name}, ${shop.currencyCode})`); sista = null; break;
      } catch (e) { sista = e; if (!/fetch failed|ECONN|ENOTFOUND|ETIMEDOUT/i.test(e.message + (e.cause?.message || ''))) break; await sov(1500); }
    }
    if (sista) {
      const orsak = sista.cause?.message ? `${sista.message.split('\n')[0]} (${sista.cause.message})` : sista.message.split('\n')[0];
      const nät = /fetch failed|ECONN|ENOTFOUND|ETIMEDOUT/i.test(orsak);
      fel(`${b.namn} svarar inte: ${orsak}`,
          nät ? 'Ser ut som ett nätverksfel — kolla wifi/VPN och kör kollen igen'
              : /valuta|currency/i.test(orsak) ? `Fel butik bakom SHOPIFY_SHOP_${b.env} — rätta den raden innan du kör något`
              : 'Kontrollera Klient-ID/Hemlighet och att appen är INSTALLERAD i butiken (temu/TOKENS.md steg 1)');
    }
  }
}

// 4. Bildverktygen
try { await import('./node_modules/sharp/dist/index.mjs'); ok('sharp fungerar (bildbearbetning)'); }
catch { fel('sharp saknas', 'Gå till temu-mappen och kör: npm install'); }

const WIN = process.platform === 'win32';
const finnsIPath = (v) => {
  try { execSync(WIN ? `where ${v}` : `command -v ${v}`, { stdio: 'ignore' }); return true; }
  catch { return false; }
};
for (const v of ['ffmpeg', 'ffprobe']) {
  finnsIPath(v)
    ? ok(`${v} finns`)
    : fel(`${v} saknas (behövs för GIF:ar ur skördevideor)`,
          WIN ? 'Kör: winget install Gyan.FFmpeg   (starta om terminalen efteråt)' : 'Kör: brew install ffmpeg');
}

// 4b. Claude Code, git-identitet och GitHub-inloggning
finnsIPath('claude') ? ok('Claude Code finns (claude)') : fel('Claude Code saknas', 'Kör: npm install -g @anthropic-ai/claude-code');
try {
  const namn = execSync('git config --global user.name', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  const mejl = execSync('git config --global user.email', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  namn && mejl ? ok(`git vet vem du är (${namn})`) : fel('git saknar namn/mejl', 'Kör raderna i steg 4b i SETUP-LOKALT.md');
} catch { fel('git saknar namn/mejl', 'Kör raderna i steg 4b i SETUP-LOKALT.md'); }
try { execSync('gh auth status', { stdio: 'ignore' }); ok('Inloggad på GitHub (gh) — skördebilderna kan pushas'); }
catch { fel('Inte inloggad på GitHub', finnsIPath('gh') ? 'Kör: gh auth login' : (WIN ? 'Kör: winget install --id GitHub.cli -e   och sedan   gh auth login' : 'Kör: brew install gh && gh auth login')); }

// 5. Bildskörden — hela poängen med att köra lokalt
const skordare = new URL('./kaching-cli/temu-bilder.mjs', import.meta.url);
existsSync(skordare) ? ok('Bildskördaren finns') : fel('Bildskördaren saknas', 'Kör: git pull');

try { await import('./kaching-cli/node_modules/playwright/index.js'); ok('playwright finns (styr webbläsaren åt skördaren)'); }
catch { fel('playwright saknas', `Kör: cd temu${WIN ? '\\' : '/'}kaching-cli  och sedan  npm install`); }

const CHROME = WIN
  ? ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
     'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
     `${process.env.LOCALAPPDATA || ''}\\Google\\Chrome\\Application\\chrome.exe`]
  : ['/Applications/Google Chrome.app', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'];
CHROME.some((f) => f && existsSync(f)) || finnsIPath(WIN ? 'chrome' : 'google-chrome')
  ? ok('Google Chrome finns (skördaren öppnar ett riktigt fönster)')
  : fel('Google Chrome hittas inte',
        WIN ? 'Kör: winget install Google.Chrome' : 'Kör: brew install --cask google-chrome');

// Släpper Temu igenom den här datorn? En 200:a räcker inte — molnet får
// också 200, men ett tomt skal utan en enda bild-URL.
try {
  const r = await fetch(TEMU_PROV, { headers: { 'user-agent': WEBBLASARE }, signal: AbortSignal.timeout(20000) });
  const html = await r.text();
  // Bara PRODUKT-bilder räknas: Temus tomma skal innehåller ändå ~40 UI-ikoner på kwcdn
  const bilder = new Set(html.match(/https:\/\/[a-z0-9.-]*kwcdn\.com\/product\/[^"'\\ ]+/g) || []).size;
  bilder > 0
    ? ok(`Temu-provet gick igenom (${bilder} bild-URL:er i provsidan) — kör skördaren på riktigt för att vara säker`)
    : fel('Temu-provet gav ett TOMT skal (0 bild-URL:er)',
          'Provet är en förenkling (en enkel hämtning, inte riktig Chrome). Kör det riktiga testet: ' + (WIN ? 'Set-Location temu\\kaching-cli; node temu-bilder.mjs "' + TEMU_PROV + '" prov' : 'cd temu/kaching-cli && node temu-bilder.mjs "' + TEMU_PROV + '" prov') + ' . Ger även det inga bilder är datorn blockerad — kör då MOLNLÄGET (Cowork-prompt + zip) som förut.');
} catch (e) {
  fel(`Temu går inte att nå (${e.message})`, 'Testa att öppna temu.com i webbläsaren. Går inte det heller: kör MOLNLÄGET (Cowork-prompt + zip) som förut.');
}

// 6. Notion finns bara i molnet
varning('Notion-korten görs inte lokalt', 'Notion-kopplingen finns bara i molnsessionen. Be den skapa korten när batchen är klar (produktbatch.md Fas 5).');

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
