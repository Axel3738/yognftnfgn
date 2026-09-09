// Husets metod för språkversionerade bilder, steg 2: sharp lägger skarp
// vektortext ovanpå en bild (kie.ai klarar inte svenska/norska — den får
// bara RENSA text; text som ligger på en enfärgad platta behöver inte ens
// kie: plattan målas över här och den nya texten läggs på).
//
//   node factory/bildtext.mjs <in.jpg> <ut.jpg> --spec <spec.json>
//
// spec.json = [{ "x", "y", "w", "h", "text", "size", "fill", "bg", "radius" }, …]
// Koordinater i källbildens pixlar (mät med en rutnätsöverlagring). "bg"
// målar en platta (t.ex. vit) under texten; utelämna bg när kie redan
// rensat bakgrunden. Typsnitt: DejaVu Sans Bold (finns i containern).
// sharp bor i pipeline/node_modules — `cd pipeline && npm install` en gång.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));

function sharpModul() {
  try {
    return createRequire(join(FACTORY_ROT, '..', 'pipeline', 'package.json'))('sharp');
  } catch {
    throw new Error('sharp saknas — kör `cd pipeline && npm install`.');
  }
}

const eskapa = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;');

export function overlaySvg(bredd, hojd, spec) {
  const delar = spec.map((r) => {
    const platta = r.bg
      ? `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.radius ?? 0}" fill="${r.bg}"/>`
      : '';
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    return `${platta}<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
      font-family="${r.font ?? 'DejaVu Sans, Liberation Sans, Arial, sans-serif'}" font-weight="${r.weight ?? 'bold'}"
      font-size="${r.size ?? Math.round(r.h * 0.55)}" fill="${r.fill ?? '#111111'}">${eskapa(r.text)}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${bredd}" height="${hojd}" viewBox="0 0 ${bredd} ${hojd}">${delar.join('')}</svg>`;
}

export async function laggTextPaBild(inFil, utFil, spec) {
  const sharp = sharpModul();
  const bild = sharp(inFil);
  const { width, height } = await bild.metadata();
  const svg = Buffer.from(overlaySvg(width, height, spec));
  await bild.composite([{ input: svg, top: 0, left: 0 }]).toFile(utFil);
  return { width, height, utFil };
}

async function huvud() {
  const arg = process.argv.slice(2);
  const [inFil, utFil] = arg.filter((a) => !a.startsWith('--') && arg[arg.indexOf(a) - 1] !== '--spec');
  const specFil = arg.includes('--spec') ? arg[arg.indexOf('--spec') + 1] : null;
  if (!inFil || !utFil || !specFil) {
    console.error('Användning: node factory/bildtext.mjs <in> <ut> --spec <spec.json>');
    process.exit(1);
  }
  const spec = JSON.parse(readFileSync(specFil, 'utf8'));
  const r = await laggTextPaBild(inFil, utFil, spec);
  console.log(`✅ ${r.utFil} (${r.width}×${r.height}, ${spec.length} textrutor)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
