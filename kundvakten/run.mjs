// Kundvakten — veckorutinen.
//
// Läser Shopify (tvister, ordrar, volym) och supportmailen, rankar
// chargeback-risken per produkt och listar det som går att stoppa innan det
// blir en chargeback.
//
// LÄS-BARA. Rutinen ändrar ingenting i butiken och rör inte annonskontot.
//
//   node kundvakten/run.mjs --torr            # räkna och visa, skriv ingen fil
//   node kundvakten/run.mjs                   # skriv rapporten till korningar/
//   node kundvakten/run.mjs --rutin           # som ovan + Discord-notis
//   node kundvakten/run.mjs --in data.json    # räkna på sparad data i stället
//   node kundvakten/run.mjs --dagar 30        # annat fönster än 90 dagar

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FONSTER } from './konfig.mjs';
import * as shopify from './shopify.mjs';
import { hamtaMail, berikaMail } from './mail.mjs';
import { rankaProdukter, butikensRate, forvarningar } from './risk.mjs';
import { toppArenden } from './kategorisering.mjs';
import { byggRapport, byggDiscordtext } from './rapport.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const KORNINGAR = join(HAR, 'korningar');

function flagga(namn) {
  return process.argv.includes(`--${namn}`);
}

function flaggvarde(namn, standard = null) {
  const i = process.argv.indexOf(`--${namn}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : standard;
}

// Förra körningens ärendefördelning, för trendpilarna. Saknas den blir
// trenden tom — aldrig påhittad.
function foregaendeArenden() {
  try {
    const filer = readdirSync(KORNINGAR)
      .filter((f) => f.endsWith('.json'))
      .sort();
    if (filer.length === 0) return {};
    const forra = JSON.parse(readFileSync(join(KORNINGAR, filer.at(-1)), 'utf8'));
    return Object.fromEntries((forra.arenden || []).map((a) => [a.id, a.antal]));
  } catch {
    return {};
  }
}

async function hamtaShopifydata(dagar, inFil) {
  if (inFil) {
    const data = JSON.parse(readFileSync(inFil, 'utf8'));
    return {
      disputes: data.disputes || [],
      ordrar: data.ordrar || [],
      ordervolym: data.ordervolym || [],
      totaltAntalOrdrar: data.totaltAntalOrdrar || 0,
    };
  }
  const [disputes, ordrar, ordervolym, totaltAntalOrdrar] = await Promise.all([
    shopify.hamtaDisputes(),
    shopify.hamtaOrdrar(dagar),
    shopify.hamtaOrdervolym(dagar),
    shopify.hamtaTotaltAntalOrdrar(dagar),
  ]);
  return { disputes, ordrar, ordervolym, totaltAntalOrdrar };
}

async function main() {
  const dagar = Number(flaggvarde('dagar', FONSTER.jamforelse_dagar));
  const inFil = flaggvarde('in');
  const torr = flagga('torr');
  const rutin = flagga('rutin');
  const datum = new Date().toISOString().slice(0, 10);

  // 1. Shopify. Går den inte att läsa finns ingen rapport att skriva — då är
  //    det ett fel, inte en tom rapport.
  const { disputes, ordrar, ordervolym, totaltAntalOrdrar } =
    await hamtaShopifydata(dagar, inFil);

  // 2. Mailen. Går den inte att läsa fortsätter körningen, men rapporten
  //    säger det rakt ut högst upp. Tyst överhoppning är förbjuden.
  let mail = [];
  let mailStatus = { ok: true };
  try {
    mail = berikaMail(await hamtaMail({ dagar: FONSTER.vecka_dagar }));
  } catch (fel) {
    mailStatus = { ok: false, fel: fel.message };
  }

  // 3. Räkna.
  const fonsterDisputes = disputes.filter(
    (d) =>
      new Date(d.orderSkapad) >= new Date(Date.now() - dagar * 24 * 60 * 60 * 1000)
  );
  const produkter = rankaProdukter(fonsterDisputes, ordervolym);
  const butik = butikensRate(fonsterDisputes, totaltAntalOrdrar);
  const larm = forvarningar({ disputes, ordrar, mail });
  const arenden = toppArenden(mail, foregaendeArenden());

  // 4. Skriv.
  const markdown = byggRapport({
    datum,
    butik,
    produkter,
    larm,
    arenden,
    mailStatus,
    fonsterDagar: dagar,
  });

  console.log(markdown);

  if (torr) {
    console.log('\n(--torr: ingen fil skriven)');
    return;
  }

  mkdirSync(KORNINGAR, { recursive: true });
  writeFileSync(join(KORNINGAR, `${datum}.md`), `${markdown}\n`);
  writeFileSync(
    join(KORNINGAR, `${datum}.json`),
    `${JSON.stringify(
      {
        datum,
        fonsterDagar: dagar,
        butik,
        produkter,
        arenden,
        larm: larm.map(({ typ, allvar, order, text }) => ({ typ, allvar, order, text })),
        mailStatus,
      },
      null,
      2
    )}\n`
  );
  console.log(`\nSkrivet: kundvakten/korningar/${datum}.md`);

  if (rutin && process.env.DISCORD_WEBHOOK_URL) {
    const text = byggDiscordtext({ datum, butik, larm, produkter });
    const svar = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.slice(0, 1900) }),
    });
    console.log(`Discord: ${svar.status}`);
  }
}

main().catch((fel) => {
  console.error(`Kundvakten avbröt: ${fel.message}`);
  process.exit(1);
});
