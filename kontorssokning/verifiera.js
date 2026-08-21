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
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const SAMTIDIGA = 4;
const PAUS_MS = 400; // artighet mot värdarna

const ENTITETER = { '&aring;': 'å', '&auml;': 'ä', '&ouml;': 'ö', '&Aring;': 'Å', '&Auml;': 'Ä', '&Ouml;': 'Ö', '&amp;': '&', '&nbsp;': ' ', '&quot;': '"', '&#39;': "'" };

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
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '');

// Gatunamn + nummer räcker — orten står ofta i en annan del av sidan.
export function adressnyckel(adress) {
  const forsta = String(adress || '').split(',')[0].trim();
  return platta(forsta);
}

export function adressFinns(text, adress) {
  const nyckel = adressnyckel(adress);
  if (nyckel.length < 4) return null;
  if (platta(text).includes(nyckel)) return true;
  // Fall tillbaka på enbart gatunamnet utan nummer (annonser skriver "12 C" vs "12C")
  const utanNummer = platta(String(adress || '').split(',')[0].replace(/[\d\s]+[a-zA-Z]?$/, ''));
  if (utanNummer.length >= 5 && platta(text).includes(utanNummer)) return 'delvis';
  return false;
}

export function ytaFinns(text, kvm) {
  if (kvm == null) return null;
  const platt = text.replace(/ /g, ' ');
  const tal = [...platt.matchAll(/(\d[\d\s.,]*)\s*(?:kvm|m²|m2|kvadratmeter)/gi)]
    .map((m) => parseFloat(m[1].replace(/[\s.]/g, '').replace(',', '.')))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!tal.length) return null;
  if (tal.some((n) => Math.abs(n - kvm) <= Math.max(2, kvm * 0.05))) return true;
  return false;
}

async function hamta(url) {
  const styr = new AbortController();
  const timer = setTimeout(() => styr.abort(), 25000);
  try {
    const svar = await fetch(url, {
      redirect: 'follow',
      signal: styr.signal,
      headers: { 'User-Agent': UA, 'Accept-Language': 'sv-SE,sv;q=0.9', Accept: 'text/html,application/xhtml+xml' },
    });
    const html = await svar.text();
    return { status: svar.status, slutUrl: svar.url, html };
  } catch (fel) {
    return { status: 0, slutUrl: url, html: '', fel: String(fel.message || fel) };
  } finally {
    clearTimeout(timer);
  }
}

const BOTSPARR = /verifierar att du är|är du en robot|just a moment|checking your browser|enable javascript and cookies|attention required/i;

export async function granska(objekt) {
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

  const text = textifiera(html);
  if (BOTSPARR.test(text) || /\/clearance/.test(slutUrl)) {
    return { lage: 'ej_kontrollerbar', notering: 'sidan visar bot-skydd i stället för innehåll — kolla manuellt', kontrollerad: url };
  }
  if (text.length < 400) {
    return { lage: 'ej_kontrollerbar', notering: 'sidan gav nästan inget innehåll (JS-renderad?)', kontrollerad: url };
  }

  const adr = adressFinns(text, objekt.adress);
  const yta = ytaFinns(text, objekt.kvm);
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
    notering: delar.join(', '),
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
