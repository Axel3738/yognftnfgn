// Deterministisk granskning av objekten i objekt.json.
//
//   node kontorssokning/verifiera.js            # granskar alla
//   node kontorssokning/verifiera.js --topp 15  # bara de 15 högst rankade
//
// Det här är skyddet mot påhittade objekt. För varje objekt hämtas käll-URL:en på
// riktigt och tre saker kontrolleras mot sidans faktiska innehåll:
//   1. svarar sidan 200 (annonsen finns kvar)?
//   2. står adressen på sidan?
//   3. står ytan på sidan?
// Resultatet skrivs tillbaka i objekt.json som fältet granskning.
//
// En sida som inte går att hämta betyder inte att objektet är påhittat — det kan
// vara bot-skydd. Därför skiljs "ej_kontrollerbar" från "avviker".

import { readFileSync, writeFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const korCurl = promisify(execFile);
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const SAMTIDIGA = 4;
const PAUS_MS = 400; // artighet mot värdarna

const ENTITETER = { '&aring;': 'å', '&auml;': 'ä', '&ouml;': 'ö', '&Aring;': 'Å', '&Auml;': 'Ä', '&Ouml;': 'Ö', '&amp;': '&', '&nbsp;': ' ', '&quot;': '"', '&#39;': "'" };

// Reservläge för JS-renderade sidor (Next.js m.fl.): innehållet ligger i en
// JSON-blob inuti en script-tagg. Då behålls skripten och JSON-escaper avkodas.
export function textifieraDjupt(html) {
  let t = html.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  t = t.replace(/\\"/g, '"').replace(/<[^>]+>/g, ' ');
  t = t.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  t = t.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d));
  for (const [e, c] of Object.entries(ENTITETER)) t = t.split(e).join(c);
  return t.replace(/\s+/g, ' ');
}

export function textifiera(html) {
  let t = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  t = t.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  t = t.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d));
  for (const [e, c] of Object.entries(ENTITETER)) t = t.split(e).join(c);
  return t.replace(/\s+/g, ' ');
}

const platta = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // é -> e, ü -> u
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '');

// Gatunamn + nummer räcker — orten står ofta i en annan del av sidan.
export function adressnyckel(adress) {
  const utanParentes = String(adress || '').replace(/\([^)]*\)/g, ' ');
  const forsta = utanParentes.split(',')[0].trim();
  return platta(forsta);
}

export function adressFinns(text, adress) {
  const nyckel = adressnyckel(adress);
  if (nyckel.length < 4) return null;
  if (platta(text).includes(nyckel)) return true;
  // Fall tillbaka på enbart gatunamnet utan nummer (annonser skriver "12 C" vs "12C")
  const utanNummer = platta(String(adress || '').replace(/\([^)]*\)/g, ' ').split(',')[0].replace(/[\d\s]+[a-zA-Z]?$/, ''));
  if (utanNummer.length >= 5 && platta(text).includes(utanNummer)) return 'delvis';
  return false;
}

export function ytaFinns(text, kvm, intervall) {
  if (kvm == null) return null;
  const platt = text.replace(/ /g, ' ');
  const tal = [...platt.matchAll(/(\d[\d\s.,]*)\s*(?:kvm|kvadratmeter|m\s*[²2])/gi)]
    .map((m) => parseFloat(m[1].replace(/[\s.]/g, '').replace(',', '.')))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!tal.length) return null;
  if (tal.some((n) => Math.abs(n - kvm) <= Math.max(2, kvm * 0.05))) return true;
  // Annonser som anger ett spann ("900-1870 kvm") har inte mittvärdet på sidan.
  // Då räcker det att någon av ändpunkterna står där.
  if (Array.isArray(intervall) && intervall.length === 2) {
    const [lag, hog] = intervall;
    const traff = (v) => tal.some((n) => Math.abs(n - v) <= Math.max(2, v * 0.05));
    if (traff(lag) || traff(hog)) return true;
  }
  return false;
}

// Hämtar med curl, inte med Nodes inbyggda fetch. Vissa fastighetssajter
// (bl.a. alvstranden.se) sitter bakom en brandvägg som avvisar fetch på
// TLS-fingeravtrycket och svarar "Request Rejected" — curl släpps igenom.
async function hamta(url) {
  try {
    const { stdout } = await korCurl(
      'curl',
      [
        '-sS', '-L', '--compressed', '--max-time', '25', '--max-redirs', '5',
        '-A', UA,
        '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        '-H', 'Accept-Language: sv-SE,sv;q=0.9,en;q=0.8',
        '-w', '\n__STATUS__%{http_code}__URL__%{url_effective}',
        url,
      ],
      { maxBuffer: 20 * 1024 * 1024, timeout: 30000 }
    );
    const m = stdout.match(/\n__STATUS__(\d+)__URL__(.*)$/s);
    if (!m) return { status: 0, slutUrl: url, html: '', fel: 'oväntat svar från curl' };
    return { status: Number(m[1]), slutUrl: m[2].trim(), html: stdout.slice(0, m.index) };
  } catch (fel) {
    return { status: 0, slutUrl: url, html: '', fel: String(fel.message || fel).split('\n')[0] };
  }
}

const BOTSPARR = /verifierar att du är|request rejected|är du en robot|just a moment|checking your browser|enable javascript and cookies|attention required/i;

// Manuella granskningsdomar för sajter som inte går att nå automatiskt.
let RATTELSER = null;
function rattelseFor(objekt) {
  if (RATTELSER === null) {
    try {
      RATTELSER = JSON.parse(readFileSync(join(HAR, 'rattelser.json'), 'utf8'));
    } catch {
      RATTELSER = {};
    }
  }
  for (const u of objekt.kalla_url || []) {
    if (RATTELSER[u]?.granskning) return RATTELSER[u].granskning;
  }
  return null;
}

export async function granska(objekt) {
  const manuell = rattelseFor(objekt);
  if (manuell) return manuell;
  const url = objekt.kalla_url?.[0];
  if (!url) return { lage: 'ej_kontrollerbar', notering: 'ingen käll-URL', kontrollerad: null };

  const { status, slutUrl, html, fel } = await hamta(url);
  if (fel) return { lage: 'ej_kontrollerbar', notering: `hämtning misslyckades: ${fel}`, kontrollerad: url };
  if (status === 404 || status === 410) {
    return { lage: 'borttagen', notering: `annonsen svarar ${status} — troligen avpublicerad`, kontrollerad: url };
  }
  if (status !== 200) {
    return { lage: 'ej_kontrollerbar', notering: `svarade HTTP ${status}`, kontrollerad: url };
  }

  let text = textifiera(html);
  let djupt = false;
  if (text.length < 400 && html.length > 2000) {
    text = textifieraDjupt(html); // JS-renderad sida
    djupt = true;
  }
  if (BOTSPARR.test(text) || /\/clearance/.test(slutUrl)) {
    return { lage: 'ej_kontrollerbar', notering: 'sidan visar bot-skydd i stället för innehåll — kolla manuellt', kontrollerad: url };
  }
  if (text.length < 400) {
    return { lage: 'ej_kontrollerbar', notering: 'sidan gav nästan inget innehåll (JS-renderad?)', kontrollerad: url };
  }

  const adr = adressFinns(text, objekt.adress);
  const yta = ytaFinns(text, objekt.kvm, objekt.kvm_intervall);
  const delar = [];
  if (adr === true) delar.push('adress ✓');
  else if (adr === 'delvis') delar.push('gatunamn ✓ (nummer avviker)');
  else if (adr === false) delar.push('adress ✗');
  if (yta === true) delar.push('yta ✓');
  else if (yta === false) delar.push('yta ✗');
  else delar.push('yta ej läsbar');

  const traffar = (adr === true || adr === 'delvis' ? 1 : 0) + (yta === true ? 1 : 0);
  if (adr === false && yta === false) {
    return { lage: 'avviker', notering: `sidan lever men ${delar.join(', ')}`, kontrollerad: url };
  }
  if (traffar === 0) {
    return { lage: 'ej_kontrollerbar', notering: `sidan lever men gick inte att matcha (${delar.join(', ')})`, kontrollerad: url };
  }
  return {
    lage: traffar === 2 ? 'bekraftad' : 'delvis_bekraftad',
    notering: delar.join(', ') + (djupt ? ' (läst ur sidans JSON-data, JS-renderad sida)' : ''),
    kontrollerad: url,
  };
}

async function kor(objekt) {
  const resultat = new Array(objekt.length);
  let nasta = 0;
  const arbetare = Array.from({ length: SAMTIDIGA }, async () => {
    while (nasta < objekt.length) {
      const i = nasta++;
      resultat[i] = await granska(objekt[i]);
      process.stdout.write(`\r  granskat ${resultat.filter(Boolean).length}/${objekt.length}   `);
      await new Promise((r) => setTimeout(r, PAUS_MS));
    }
  });
  await Promise.all(arbetare);
  process.stdout.write('\n');
  return resultat;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fil = join(HAR, 'objekt.json');
  const alla = JSON.parse(readFileSync(fil, 'utf8'));
  const toppIdx = process.argv.indexOf('--topp');
  const urval = toppIdx > -1 ? alla.slice(0, Number(process.argv[toppIdx + 1]) || 15) : alla;

  console.log(`Granskar ${urval.length} objekt mot deras käll-URL:er...`);
  const domar = await kor(urval);
  for (let i = 0; i < urval.length; i++) urval[i].granskning = domar[i];

  const rakna = domar.reduce((a, d) => ((a[d.lage] = (a[d.lage] || 0) + 1), a), {});
  writeFileSync(fil, JSON.stringify(alla, null, 2) + '\n');

  console.log('\nResultat:');
  for (const [lage, n] of Object.entries(rakna).sort((a, b) => b[1] - a[1])) console.log(`  ${lage.padEnd(18)} ${n}`);
  const problem = urval.filter((o) => ['avviker', 'borttagen'].includes(o.granskning.lage));
  if (problem.length) {
    console.log('\nAtt titta närmare på:');
    for (const o of problem) console.log(`  [${o.granskning.lage}] ${o.adress} — ${o.granskning.notering}`);
  }
}
