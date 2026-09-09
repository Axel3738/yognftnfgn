// logga.mjs — loggan och faviconen in i temat.
//
//   laddaUppLogga(temaId, { logga, favicon?, bredd? }) → { logo, favicon, bredd }
//
//   node factory/logga.mjs <logga.png> [--favicon <fil.png>] [--bredd 140] [--tema <id>]
//
// Loggan VISAS i chatten innan den sätts (Axels krav 2026-09-08) — det här
// skriptet kör bara det Axel redan godkänt. Varianterna görs av
// logga-generera.mjs; uppladdningen till Files görs av filer.mjs.
//
// Varför steget finns (Axels bakläxa 2026-09-09 på DryTrek — butiken nådde
// granskning utan logga): `settings.logo` pekade fortfarande på BAS-TEMATS
// logga, en fil som inte ens finns i den nya butiken, och headern föll
// tillbaka på ren text. ⚠️ Av-brandningen städade `brand_image` men inte
// `logo` — två olika inställningar, samma fel. `settings.favicon` var osatt
// och fliken visade Shopifys default.
//
// Temat är alltid `hamtaArbetstema(temaId)` (KEDJAN.md regel 1), aldrig
// "första UNPUBLISHED". Efter skrivningen läses settings_data.json tillbaka
// ur samma tema och VÄRDET jämförs — Shopify skriver om filen vid mottagning,
// så en byte-jämförelse (verifieraTemafiler) larmar falskt här.

import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { laddaEnv } from './env.mjs';
import { hamtaArbetstema, hamtaTemafil, skrivTemafiler } from './shopify.mjs';
import { laddaUppBild, arUrl } from './filer.mjs';

// Dawns/CRO-temats logo_width när ingen anges och temat saknar värde.
export const STANDARDBREDD = 140;

// settings_data.json får ha en /* kommentar */ överst — bort med den först.
export function lasSettings(text) {
  if (text === null || text === undefined) throw new Error('Temat har ingen config/settings_data.json.');
  return JSON.parse(String(text).replace(/^\s*\/\*[\s\S]*?\*\//, '').trim());
}

// Ren logik: sätter logo/favicon/logo_width i `current` och lämnar allt annat
// orört. bredd null = behåll temats, annars standard.
export function sattLoggaISettings(settings, { logo, favicon = null, bredd = null }) {
  if (!logo) throw new Error('Ingen logga att sätta.');
  const current = settings?.current ?? {};
  const nyBredd = Number(bredd) > 0 ? Number(bredd) : Number(current.logo_width) > 0 ? Number(current.logo_width) : STANDARDBREDD;
  return {
    ...settings,
    current: {
      ...current,
      logo,
      logo_width: nyBredd,
      ...(favicon ? { favicon } : {}),
    },
  };
}

export function serialiseraSettings(settings) {
  return `${JSON.stringify(settings, null, 2)}\n`;
}

// Loggan (och faviconen) upp i Files och in i temats inställningar.
// `logga`/`favicon` är lokala filer eller URL:er. Saknas favicon används
// loggan även där — fliken ska aldrig visa Shopifys default.
export async function laddaUppLogga(temaId, { logga, favicon = null, bredd = null, filnamn = null } = {}) {
  if (!logga) throw new Error('laddaUppLogga: ingen logga angiven.');
  if (!arUrl(logga) && !existsSync(logga)) throw new Error(`Loggan saknas: ${logga}`);
  if (favicon && !arUrl(favicon) && !existsSync(favicon)) throw new Error(`Faviconen saknas: ${favicon}`);

  const tema = await hamtaArbetstema(temaId);

  const l = await laddaUppBild(logga, { alt: 'Logga', filnamn });
  const f = favicon ? await laddaUppBild(favicon, { alt: 'Favicon' }) : l;

  const fil = 'config/settings_data.json';
  const settings = lasSettings(await hamtaTemafil(tema.id, fil));
  const nya = sattLoggaISettings(settings, { logo: l.handle, favicon: f.handle, bredd });
  await skrivTemafiler(tema.id, { [fil]: serialiseraSettings(nya) });

  // Tillbakaläsning på värde, inte byte (se filhuvudet).
  const efter = lasSettings(await hamtaTemafil(tema.id, fil));
  const fel = [];
  if (efter.current?.logo !== l.handle) fel.push(`logo: temat säger ${JSON.stringify(efter.current?.logo)}`);
  if (efter.current?.favicon !== f.handle) fel.push(`favicon: temat säger ${JSON.stringify(efter.current?.favicon)}`);
  if (fel.length > 0) throw new Error(`Loggan fastnade inte i "${tema.name}": ${fel.join('; ')}`);

  return { logo: l.handle, favicon: f.handle, bredd: efter.current.logo_width, temaId: tema.id, temaNamn: tema.name };
}

async function huvud() {
  laddaEnv();
  const argv = process.argv.slice(2);
  const varde = (flagga) => (argv.includes(flagga) ? argv[argv.indexOf(flagga) + 1] : null);
  const flaggvarden = new Set(['--favicon', '--bredd', '--tema'].map(varde).filter(Boolean));
  const logga = argv.find((a) => !a.startsWith('--') && !flaggvarden.has(a));
  if (!logga) {
    console.error('Användning: node factory/logga.mjs <logga.png> [--favicon <fil.png>] [--bredd 140] [--tema <id>]');
    process.exit(1);
  }
  const r = await laddaUppLogga(varde('--tema'), {
    logga,
    favicon: varde('--favicon'),
    bredd: varde('--bredd') ? Number(varde('--bredd')) : null,
  });
  console.log(`✅ Logga: ${r.logo}`);
  console.log(`✅ Favicon: ${r.favicon}`);
  console.log(`✅ Satt i temat "${r.temaNamn}" — bredd ${r.bredd}px, tillbakaläst.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
