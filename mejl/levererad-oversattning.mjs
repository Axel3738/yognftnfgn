// Rättar Shopifys EGNA översättningar av de två "levererad"-notiserna, byte för
// byte, utan att skriva om hela mallen. Noll beroenden.
//
//   node mejl/levererad-oversattning.mjs matstrumpor            # torrt: visar vad som byts
//   node mejl/levererad-oversattning.mjs matstrumpor --skarpt   # registrerar, läser tillbaka
//
// Varför ett eget verktyg: våra tre fraktmallar ägs av notis-oversattning.mjs
// (hela mallen byggs ur mejl/sprak). De två levererad-notiserna ("En
// försändelse … har levererats", "Ordern … har levererats") är Shopifys egna
// mallar med Shopifys egna översättningar, och de går ut när spårningsrutinen
// skriver ett DELIVERED-event. Granskningen 2026-09-30 hittade fel i dem:
// den kinesiska grenen för en hel order säger 「您的訂單已取消。」 ("Din order har
// avbrutits"), den japanska ämnesraden säger 発送 ("skickats") och norskan har
// två stavfel. Här byts bara de uppräknade meningarna i Shopifys nuvarande
// text; allt annat i mallen står kvar som Shopify skrev det.
//
// Byten står i mejl/levererad/<butik>.json: [gammal, ny, antal] där antal är
// hur många gånger den gamla texten ska finnas (null = alla, minst en). Finns
// den gamla inte men den nya gör det, är bytet redan gjort — skriptet går att
// köra igen. Stämmer inget av det stoppar skriptet och rör ingenting.
//
// ⚠️ Registrerar vi en översättning blir den vår (updatedAt sätts). Ändrar
// någon den SVENSKA levererad-mallen i admin märks översättningen `outdated`;
// kör då skriptet igen (det läser huvudtextens digest varje gång).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const alias = (locale) => `l_${locale.replace(/[^a-z0-9]/gi, '_')}`;

export function lasRattningar(butik) {
  return JSON.parse(readFileSync(join(ROT, 'levererad', `${butik}.json`), 'utf8'));
}

// Ett byte på en text. Kastar hellre än att gissa.
export function bytText(text, byt, etikett = '') {
  let ut = text;
  const gjort = [];
  for (const [gammal, ny, antal] of byt) {
    const n = ut.split(gammal).length - 1;
    if (n === 0) {
      if (ny && ut.includes(ny)) { gjort.push({ gammal, lage: 'redan' }); continue; }
      throw new Error(`${etikett}: "${gammal}" finns inte, och inte heller "${ny}" — Shopifys text har ändrats, läs den innan något byts.`);
    }
    if (antal != null && n !== antal) throw new Error(`${etikett}: "${gammal}" finns ${n} gånger, väntade ${antal} — stoppar.`);
    ut = ut.split(gammal).join(ny);
    gjort.push({ gammal, lage: 'bytt', antal: n });
  }
  return { text: ut, gjort, andrad: ut !== text };
}

export async function kor(butik, { skarpt = false, klient = null, logg = console.log } = {}) {
  const r = lasRattningar(butik);
  const k = klient ?? (await skapaKlient(lasButik(butik)));
  const locales = [...new Set(r.rattningar.map((x) => x.locale))];
  const fraga = `query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } ${locales.map((l) => `${alias(l)}: translations(locale: "${l}") { key value outdated updatedAt }`).join(' ')} } }`;
  const rapport = { butik, lage: skarpt ? 'skarpt' : 'torr', tid: new Date().toISOString(), rader: [] };
  let fel = 0;

  for (const [mallNamn, resurs] of Object.entries(r.mallar)) {
    const las = async () => (await k.graphql(fraga, { id: resurs })).translatableResource;
    const nu = await las();
    if (!nu) throw new Error(`${butik}/${mallNamn}: ${resurs} finns inte i Shopify.`);
    const digest = Object.fromEntries(nu.translatableContent.map((c) => [c.key, c.digest]));
    // Alla byten per språk och nyckel i den här mallen, i filens ordning.
    const perNyckel = new Map();
    for (const x of r.rattningar.filter((x) => x.mall === mallNamn || x.mall === '*')) {
      const id = `${x.locale}|${x.key}`;
      perNyckel.set(id, [...(perNyckel.get(id) ?? []), ...x.byt]);
    }
    const attRegistrera = [];
    for (const [id, byt] of perNyckel) {
      const [locale, key] = id.split('|');
      const befintlig = (nu[alias(locale)] ?? []).find((t) => t.key === key);
      if (!befintlig?.value) throw new Error(`${butik}/${mallNamn}/${locale}/${key}: ingen översättning att rätta (Shopify svarade tomt).`);
      const res = bytText(befintlig.value, byt, `${mallNamn}/${locale}/${key}`);
      rapport.rader.push({ mall: mallNamn, locale, key, gjort: res.gjort, andrad: res.andrad });
      logg(`${mallNamn} ${locale} ${key}: ${res.gjort.map((g) => `${g.lage === 'redan' ? '✓ redan' : `byts ×${g.antal}`} "${g.gammal.slice(0, 40)}"`).join(', ')}`);
      if (res.andrad) attRegistrera.push({ locale, key, value: res.text, translatableContentDigest: digest[key] });
    }
    if (skarpt && attRegistrera.length) {
      const svar = await k.graphql(
        `mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { field message } translations { locale key } } }`,
        { id: resurs, t: attRegistrera },
      );
      const ue = svar.translationsRegister?.userErrors ?? [];
      if (ue.length) throw new Error(`${mallNamn}: ${ue.map((e) => e.message).join('; ')}`);
      // Tillbakaläsning: exakt vår text, och inte märkt som inaktuell.
      const efter = await las();
      for (const t of attRegistrera) {
        const las2 = (efter[alias(t.locale)] ?? []).find((x) => x.key === t.key);
        const ok = las2?.value === t.value && !las2?.outdated;
        if (!ok) fel++;
        logg(`   ${ok ? '✅' : '❌'} ${mallNamn} ${t.locale} ${t.key} tillbakaläst`);
      }
    }
  }
  rapport.fel = fel;
  return rapport;
}

const arDirekt = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (arDirekt) {
  const args = process.argv.slice(2);
  const butik = args.find((a) => !a.startsWith('--')) ?? 'matstrumpor';
  const skarpt = args.includes('--skarpt');
  const rapport = await kor(butik, { skarpt });
  if (skarpt) {
    const mapp = join(ROT, 'output', 'butiker', butik, 'levererad');
    mkdirSync(mapp, { recursive: true });
    writeFileSync(join(mapp, 'lage.json'), JSON.stringify(rapport, null, 2) + '\n');
  }
  console.log(rapport.fel ? `❌ ${rapport.fel} översättningar lästes inte tillbaka rätt.` : `${skarpt ? '✅ registrerat och tillbakaläst' : 'Torrt — inget skrivet. Kör med --skarpt.'}`);
  process.exit(rapport.fel ? 1 : 0);
}
