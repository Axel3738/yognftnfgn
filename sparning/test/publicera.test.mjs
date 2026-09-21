// Tester för sparning/publicera.mjs — publiceringen av spårningssidan.
//
// publicera.mjs är ett körbart skript utan exporter: allt ligger på toppnivå,
// så en `import` av filen hade publicerat sidan. Testerna kör därför skriptet
// som en egen process i en KOPIA av sparning/ i en temp-mapp, med en egen
// lage.json. Ingenting i repot rörs, och inget anrop går till Shopify eller
// 17TRACK: alla skarpa körningar här är sådana som ska avbryta FÖRE första
// mutationen.
//
// Kör: node --test sparning/test/publicera.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SPARNING = dirname(dirname(fileURLToPath(import.meta.url)));
const REPO = dirname(SPARNING);

// Filerna publicera.mjs drar in: direkt (paketdata, sprak, status), dynamiskt
// (sida) och i sin tur (uppacka, fraser.json).
// ⚠️ Varje ny modul i sparning/ som publicera.mjs (direkt eller indirekt)
// importerar MÅSTE stå här — annars faller testet på ERR_MODULE_NOT_FOUND i
// temp-kopian, inte på det den mäter. steg.mjs och kontroll.mjs lades till
// 2026-09-19 med sammanfattningsvyn.
// butik.mjs, oversatt.mjs, butiker.json och sprak/ lades till 2026-09-20 med
// flerbutiksstödet (Axels order: samma system i alla butiker).
const FILER = ['publicera.mjs', 'paketdata.mjs', 'sprak.mjs', 'status.mjs', 'sida.mjs', 'uppacka.mjs', 'steg.mjs', 'delsteg.mjs', 'bavernummer.mjs', 'sistabiten.mjs', 'kontroll.mjs', 'fraser.json', 'konfig.json', 'butik.mjs', 'oversatt.mjs', 'butiker.json'];
const SPRAKFILER = ['nb.json', 'da.json', 'fi.json'];

// En kopia av sparning/ med egen lagefil. `konfigAndringar` skrivs ovanpå
// konfigurationens `sida`-block.
function bygg(lage, konfigAndringar = {}, bokforing = {}) {
  const rot = mkdtempSync(join(tmpdir(), 'spar-pub-'));
  mkdirSync(join(rot, 'sparning'));
  mkdirSync(join(rot, 'mejl'));
  for (const f of FILER) copyFileSync(join(SPARNING, f), join(rot, 'sparning', f));
  mkdirSync(join(rot, 'sparning', 'sprak'));
  for (const f of SPRAKFILER) copyFileSync(join(SPARNING, 'sprak', f), join(rot, 'sparning', 'sprak', f));
  // mejl/konfig.json läses för löftet om spårningen; mejl/shopify.mjs laddas
  // dynamiskt i en skarp körning (men anropas aldrig i testerna).
  for (const f of ['konfig.json', 'shopify.mjs']) {
    const kalla = join(REPO, 'mejl', f);
    if (existsSync(kalla)) copyFileSync(kalla, join(rot, 'mejl', f));
  }
  const konfig = JSON.parse(readFileSync(join(rot, 'sparning', 'konfig.json'), 'utf8'));
  konfig.sida = { ...konfig.sida, ...konfigAndringar };
  // Nollställ bokföringen i kopian. Den riktiga konfig.json bär datum och url
  // från senaste skarpa publiceringen, och utan det här mätte testet
  // "bokfördes ingenting" mot den siffran i stället för mot noll — det gick
  // grönt ända tills sidan publicerades på riktigt första gången (2026-09-19).
  konfig.lage = { ...Object.fromEntries(Object.keys(konfig.lage ?? {}).map((k) => [k, null])), ...bokforing };
  writeFileSync(join(rot, 'sparning', 'konfig.json'), JSON.stringify(konfig, null, 2));
  writeFileSync(join(rot, 'sparning', 'lage.json'), JSON.stringify(lage, null, 1));
  return rot;
}

// ⚠️ MILJÖN SKALAS AV FRÅN VARJE SHOPIFY-NYCKEL FÖRE VARJE KÖRNING.
//
// Testerna nedan kör publicera.mjs SKARPT (utan --torr) för att mäta att
// spärrarna avbryter i rätt läge. Kopian bär den RIKTIGA konfig.json — samma
// butik, samma handle `spara` — så en skarp körning som slipper förbi en
// spärr publicerar på riktigt. Ett test gör det med flit: "första
// publiceringen får vara tom" släpper igenom ett paketminne med ETT
// låtsasnummer, och kommentaren där antog att "utan nycklar faller körningen
// senare (Shopify)".
//
// Det antagandet höll inte. 2026-09-21 21:44 UTC låg
// https://baverbutiken.se/pages/spara live med exakt ett paket —
// `YT0000000000000`, testets eget nummer — och varje kund som slog upp sitt
// paketnummer fick "Vi hittar inte det numret". Nycklarna finns i den här
// containern och i rutinernas, så `npm test` publicerade över kundernas sida.
//
// Spärren sitter i publicera.mjs, inte här: `SPARNING_INGEN_PUBLICERING=1`
// låter körningen gå precis som en skarp — samma klient, samma spärrar, samma
// utskrifter — men stannar exakt före pageCreate/pageUpdate.
//
// ⚠️ Två vägar som INTE fungerar, båda provade när den här spärren skrevs:
// att TA BORT nycklarna ur miljön (butik.mjs kräver att de finns och kastar
// innan spärrarna hinner köra) och att ge dem FALSKA värden (token-anropet
// ligger före spärrarna, så körningen dör på "app_not_installed"). I båda
// fallen mätte testerna något annat än det de handlar om.
function utanAttKunnaPublicera() {
  return { ...process.env, SPARNING_INGEN_PUBLICERING: '1' };
}

function kor(rot, flaggor = []) {
  const r = spawnSync(process.execPath, [join(rot, 'sparning', 'publicera.mjs'), ...flaggor], {
    cwd: rot,
    encoding: 'utf8',
    timeout: 120000,
    env: utanAttKunnaPublicera(),
  });
  return { kod: r.status, ut: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

const iso = (dagarSedan) => new Date(Date.now() - dagarSedan * 86400000).toISOString();

// Ett paketminne med färdiga svenska skanningar, ett paket utan skanningar
// och ett paket vars enda skanning är äldre än fönstret.
function lageMedSkanningar() {
  return {
    paket: {
      YT2624700707772213: {
        bolag: 'YunExpress',
        status: 'IN_TRANSIT',
        handelser: [
          { tid: iso(1), text: 'Paketet har lämnat terminalen', plats: 'Malmö' },
          { tid: iso(3), text: 'Vi har fått uppgifterna om paketet', plats: null },
        ],
      },
      YT0000000000000: { bolag: 'YunExpress', status: 'CONFIRMED' },
      YT9999999999999: {
        bolag: 'YunExpress',
        status: 'DELIVERED',
        handelser: [{ tid: iso(80), text: 'Paketet är levererat', plats: 'Göteborg' }],
      },
    },
  };
}

test('torrkörning bygger sidan och skriver inget till Shopify', () => {
  const rot = bygg(lageMedSkanningar());
  const { kod, ut } = kor(rot, ['--torr']);
  assert.equal(kod, 0, ut);
  assert.match(ut, /inget skrivet till Shopify/);

  const kropp = readFileSync(join(rot, 'sparning', 'output', 'sida.html'), 'utf8');
  // Datan i sidan ska gå att tolka, och bära numret OCH den svenska texten.
  const m = kropp.match(/id="bb-spar-data"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(m, 'datablocket saknas i sidkroppen');
  const data = JSON.parse(m[1].replace(/<\\\//g, '</'));
  assert.ok(data.k.YT2624700707772213, 'paketet saknas i datan');
  assert.ok(data.f.includes('Paketet har lämnat terminalen'), 'frasen saknas i ordboken');
  // Det gamla paketet ska ha fallit ur fönstret, det utan skanningar vara kvar.
  assert.ok(!data.k.YT9999999999999, 'paketet utanför fönstret följde med');
  assert.ok(data.k.YT0000000000000, 'paketet utan skanningar föll bort');
  assert.ok(existsSync(join(rot, 'sparning', 'output', 'forhandsvisning.html')));
  // Sidan publicerades aldrig ⇒ ingenting bokfört.
  const konfig = JSON.parse(readFileSync(join(rot, 'sparning', 'konfig.json'), 'utf8'));
  assert.equal(konfig.lage.sida_publicerad, null);
});

test('sidan bär en versionsstämpel som skiljer körningarna åt', () => {
  // Tillbakaläsningen jämför `byggd` (minuten bygget stämplade) för att veta
  // att kundens vy är DEN HÄR versionen och inte en CDN-kopia av gårdagens —
  // paketen ligger kvar mellan körningarna, så ett känt nummer bevisar inget
  // om ålder. Stämpeln måste alltså finnas och vara färsk.
  const rot = bygg(lageMedSkanningar());
  const { kod, ut } = kor(rot, ['--torr']);
  assert.equal(kod, 0, ut);
  const kropp = readFileSync(join(rot, 'sparning', 'output', 'sida.html'), 'utf8');
  const data = JSON.parse(kropp.match(/id="bb-spar-data"[^>]*>([\s\S]*?)<\/script>/)[1].replace(/<\\\//g, '</'));
  assert.equal(typeof data.byggd, 'number');
  const EPOK = 1767225600; // 2026-01-01T00:00:00Z, se sparning/uppacka.mjs
  const alderMinuter = (Date.now() / 1000 - (EPOK + data.byggd * 60)) / 60;
  assert.ok(Math.abs(alderMinuter) < 5, `byggd ligger ${alderMinuter.toFixed(1)} minuter fel`);
});

test('storleken i rapporten är sidans byte, inte antal tecken', () => {
  // Sidan är full av å/ä/ö, och de väger två byte i UTF-8 men ett i
  // String.length. kB ska räknas på det som faktiskt skickas.
  const rot = bygg(lageMedSkanningar());
  const { kod, ut } = kor(rot, ['--torr']);
  assert.equal(kod, 0, ut);
  const kropp = readFileSync(join(rot, 'sparning', 'output', 'sida.html'), 'utf8');
  const vantat = (Buffer.byteLength(kropp, 'utf8') / 1024).toFixed(0);
  const rad = ut.match(/^Sidan: (\d+) kB/m);
  assert.ok(rad, ut);
  assert.equal(rad[1], vantat);
});

test('rapporten böjer svenskan: "1 händelse", inte "1 händelser"', () => {
  const rot = bygg({
    paket: {
      YT2624700707772213: {
        bolag: 'YunExpress',
        status: 'IN_TRANSIT',
        handelser: [{ tid: iso(1), text: 'Paketet har lämnat terminalen', plats: 'Malmö' }],
      },
    },
  });
  const { kod, ut } = kor(rot, ['--torr']);
  assert.equal(kod, 0, ut);
  assert.match(ut, /1 händelse,/);
  assert.doesNotMatch(ut, /1 händelser/);
  assert.doesNotMatch(ut, /1 fraser|1 platser|1 okända fraser/);
});

test('textrutan räknas som markör och nämns i rapporten', () => {
  // Sidans skript läser bb-spar-copy i första raden. Saknas den i kundens vy
  // kastar skriptet och kunden ser en tom ruta — därför ska den kontrolleras
  // vid tillbakaläsningen, inte bara markören och datan.
  const rot = bygg(lageMedSkanningar());
  const { kod, ut } = kor(rot, ['--torr']);
  assert.equal(kod, 0, ut);
  assert.match(ut, /Markörer:.*id="bb-spar-copy"/);
});

test('skarp körning avbryter när paketminnet saknar skanningar — om sidan redan är publicerad', () => {
  const rot = bygg({ paket: { YT0000000000000: { bolag: 'YunExpress', status: 'CONFIRMED' } } }, {}, { sida_publicerad: '2026-09-19' });
  const { kod, ut } = kor(rot);
  assert.equal(kod, 1, ut);
  assert.match(ut, /Inga händelser i sparning\/lage\.json/);
  assert.match(ut, /En tom sida publiceras inte/);
  assert.doesNotMatch(ut, /Uppdaterad|Skapad|Publikt/);
});

test('första publiceringen får vara tom: utan bokförd sida stoppar inte spärren', () => {
  // Bæverbutiken 2026-09-20: 1 order, 0 skanningar, men mejlens knapp och
  // menylänken behöver en sida att landa på från dag ett. Utan nycklar
  // faller körningen senare (Shopify), men spärren mot tom sida ska ha
  // släppt igenom.
  const rot = bygg({ paket: { YT0000000000000: { bolag: 'YunExpress', status: 'CONFIRMED' } } });
  const { ut } = kor(rot);
  assert.match(ut, /första får vara tom/);
  assert.doesNotMatch(ut, /En tom sida publiceras inte/);
});

test('skarp körning avbryter när FÖNSTRET åt upp alla skanningar', () => {
  // Regressionen: spärren mot en tom sida läste bara paketminnet, medan
  // fönstret sitter EFTER den. En lagefil med skanningar som alla är äldre än
  // fönstret gav därför en sida utan en enda skanning — och eftersom inget
  // paket hade någon skanning fanns inget känt nummer att leta efter i
  // kundens vy, så tillbakaläsningen hade godkänt den tomma sidan.
  const rot = bygg(lageMedSkanningar());
  const { kod, ut } = kor(rot, ['--fonster', '0.0001']);
  assert.equal(kod, 1, ut);
  assert.match(ut, /Efter fönstret/);
  assert.match(ut, /Inget publicerat/);
  assert.doesNotMatch(ut, /Uppdaterad|Skapad|Publikt/);
});

test('torrkörning säger till om fönstret tömt sidan, men bygger ändå', () => {
  const rot = bygg(lageMedSkanningar());
  const { kod, ut } = kor(rot, ['--torr', '--fonster', '0.0001']);
  assert.equal(kod, 0, ut);
  assert.match(ut, /En skarp körning hade avbrutit här/);
});

test('--fonster utan dugligt värde avbryter', () => {
  const rot = bygg(lageMedSkanningar());
  for (const flaggor of [['--torr', '--fonster'], ['--torr', '--fonster', '0'], ['--torr', '--fonster', 'fem']]) {
    const { kod, ut } = kor(rot, flaggor);
    assert.equal(kod, 1, ut);
    assert.match(ut, /--fonster vill ha ett antal dagar större än noll/);
  }
});

test('sida.fonster_dagar i konfigen granskas lika hårt som flaggan', () => {
  const rot = bygg(lageMedSkanningar(), { fonster_dagar: 0 });
  const { kod, ut } = kor(rot, ['--torr']);
  assert.equal(kod, 1, ut);
  assert.match(ut, /sida\.fonster_dagar/);
});

test('råa 17TRACK-händelser i lagefilen översätts till svenska', () => {
  const rot = bygg({
    paket: {
      YT2626100708674690: {
        bolag: '4PX',
        status17: 'InTransit',
        handelser: [
          {
            time_iso: iso(2),
            time_utc: iso(2).replace('T', ' ').slice(0, 19),
            description: 'Shipment information received',
            location: 'SHENZHEN',
            sub_status: 'InfoReceived_1',
            stage: 'InfoReceived',
          },
        ],
      },
    },
  });
  const { kod, ut } = kor(rot, ['--torr']);
  assert.equal(kod, 0, ut);
  assert.match(ut, /bar råa 17TRACK-händelser/);
  const kropp = readFileSync(join(rot, 'sparning', 'output', 'sida.html'), 'utf8');
  const data = JSON.parse(kropp.match(/id="bb-spar-data"[^>]*>([\s\S]*?)<\/script>/)[1].replace(/<\\\//g, '</'));
  assert.equal(data.f.length, 1);
  // Ingen engelska når kunden: frasen ska vara översatt av sparning/sprak.mjs.
  assert.doesNotMatch(data.f[0], /shipment|information received/i);
});

test('en halvskriven lage.json ger en mening, inte en stackdump', () => {
  const rot = bygg(lageMedSkanningar());
  writeFileSync(join(rot, 'sparning', 'lage.json'), '{ "paket": { "YT26247007077722');
  const { kod, ut } = kor(rot, ['--torr']);
  assert.equal(kod, 1, ut);
  assert.match(ut, /går inte att läsa/);
  assert.doesNotMatch(ut, /at JSON\.parse|node:internal/);
});

test('en trasig post i lagefilen kraschar inte publiceringen', () => {
  const lage = lageMedSkanningar();
  lage.paket.YT1111111111111 = null;
  lage.paket.YT2222222222222 = { bolag: null, status: 'HITTEPÅ', handelser: [{ tid: 'inte en tid', text: 'x' }] };
  const rot = bygg(lage);
  const { kod, ut } = kor(rot, ['--torr']);
  assert.equal(kod, 0, ut);
  assert.match(ut, /Okänd status/);
});

test('nödbromsen: SPARNING_INGEN_PUBLICERING=1 stannar före mutationen', () => {
  // Regressionen som kostade kunderna en kväll: testerna körde skriptet
  // skarpt mot den RIKTIGA butiken och en av dem publicerade en sida med ett
  // enda låtsaspaket. Spärren måste därför gå att bevisa, inte bara finnas.
  //
  // Körningen nedan har allt den behöver för att lyckas — ett paketminne med
  // riktiga skanningar och en redan publicerad sida, alltså ingen spärr som
  // avbryter — och ska ändå sluta utan en enda skrivning.
  // Eget paketminne: `lageMedSkanningar()` fastnar i kontrollen (landet
  // "Sverige" går inte att hitta i dess historik), och då hade testet mätt
  // kontrollen i stället för nödbromsen.
  const lage = {
    paket: {
      YT2624700707772213: {
        bolag: 'YunExpress',
        status: 'DELIVERED',
        handelser: [
          { tid: iso(1), text: 'Paketet är levererat', plats: 'Malmö', land: 'Sverige' },
          { tid: iso(4), text: 'Paketet har lämnat terminalen', plats: 'Stockholm', land: 'Sverige' },
        ],
      },
    },
  };
  const rot = bygg(lage, {}, { sida_publicerad: '2026-09-19' });
  const { kod, ut } = kor(rot);
  assert.equal(kod, 0, ut);
  assert.match(ut, /SPARNING_INGEN_PUBLICERING=1: sidan byggdes men skrevs ALDRIG/);
  assert.doesNotMatch(ut, /Uppdaterad: gid|Skapad: gid|Publikt:/, 'något skrevs mot Shopify');
  // Sidan byggdes på riktigt — spärren stoppar mutationen, inte arbetet.
  assert.ok(existsSync(join(rot, 'sparning', 'output', 'sida.html')));
  const konfig = JSON.parse(readFileSync(join(rot, 'sparning', 'konfig.json'), 'utf8'));
  assert.equal(konfig.lage.sida_publicerad, '2026-09-19', 'bokföringen rördes');
});
