// Bygger animerade GIF:er till produktbeskrivningarna på Bäverbutiken.se.
//
// Axel vill ha GIF i beskrivningen, inte stillbilder. Den här filen gör en
// korsfadeande bildspels-GIF av produktbilderna.
//
// Allt sker i ren JS (sharp + gifenc). Ingen ffmpeg — den ffmpeg som följer med
// Playwright i den här miljön saknar både GIF-encoder och alla filter vi behöver
// (verifierat 2026-08-12: 13 filter, ingen fps/xfade/palettegen).
//
// Knepet som håller filstorleken nere: en stillastående bild behöver bara EN
// bildruta med lång fördröjning. Bara övergångarna kostar rutor. Tre bilder blir
// därför ~15 rutor i stället för ~60.
//
//   node temu/gif.mjs --ut=temu/tmp/problem.gif bild1.jpg bild2.jpg bild3.jpg
//   node temu/gif.mjs --ut=x.gif --bredd=700 --hall=1400 --overgang=500 a.jpg b.jpg
//
// URL:er går bra som indata — de laddas ner först.

import sharp from 'sharp';
// gifenc är CommonJS — måste plockas ur default-exporten.
import gifenc from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = gifenc;
import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

// Över ~4 MB blir produktsidan seg på mobil. Då skalar vi ner i stället.
const MAX_BYTES = 4 * 1024 * 1024;

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** Hämtar en bild som Buffer, från URL eller disk. */
export async function hamtaBild(kalla) {
  if (!/^https?:\/\//i.test(kalla)) {
    if (!existsSync(kalla)) throw new Error(`Filen finns inte: ${kalla}`);
    return readFileSync(kalla);
  }
  // Temus CDN svarar inte utan vettig user-agent och referer.
  const svar = await fetch(kalla, { headers: { 'User-Agent': UA, Referer: 'https://www.temu.com/' } });
  if (!svar.ok) throw new Error(`Kunde inte hämta ${kalla}: HTTP ${svar.status}`);
  return Buffer.from(await svar.arrayBuffer());
}

/** Skalar in bilden i en kvadrat med vit bakgrund och ger råa RGBA-pixlar. */
async function tillRuta(buf, storlek, bakgrund) {
  const { data } = await sharp(buf)
    .resize(storlek, storlek, { fit: 'contain', background: bakgrund })
    .flatten({ background: bakgrund })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data; // Uint8Array, storlek*storlek*4
}

/** Blandar två rutor: t=0 ger a, t=1 ger b. */
function blanda(a, b, t) {
  const ut = new Uint8ClampedArray(a.length);
  const inv = 1 - t;
  for (let i = 0; i < a.length; i += 4) {
    ut[i] = a[i] * inv + b[i] * t;
    ut[i + 1] = a[i + 1] * inv + b[i + 1] * t;
    ut[i + 2] = a[i + 2] * inv + b[i + 2] * t;
    ut[i + 3] = 255;
  }
  return ut;
}

/**
 * Korsfadeat bildspel som animerad GIF.
 *
 * @param {string[]} bilder  filsökvägar eller URL:er, i visningsordning
 * @param {string}   ut      sökväg att skriva GIF:en till
 */
export async function bildspelGif(bilder, ut, val = {}) {
  const {
    // 560 px räcker gott: beskrivningsspalten är sällan bredare än ~700 px, och
    // varje extra hundra pixlar kostar ~40 % i filstorlek.
    bredd = 560,
    hall = 1300, // ms som varje bild står stilla
    overgang = 420, // ms som övergången tar
    overgangsrutor = 4, // antal mellanrutor per övergång
    farger = 96,
    bakgrund = { r: 255, g: 255, b: 255 },
  } = val;

  if (!bilder?.length) throw new Error('Inga bilder angivna.');

  const rutor = [];
  for (const b of bilder) rutor.push(await tillRuta(await hamtaBild(b), bredd, bakgrund));

  const enc = GIFEncoder();
  const skriv = (pixlar, delay) => {
    // Egen palett per ruta ger märkbart renare resultat än en delad palett,
    // särskilt när produktbilderna har olika bakgrunder.
    const palett = quantize(pixlar, farger, { format: 'rgb565' });
    const index = applyPalette(pixlar, palett, 'rgb565');
    enc.writeFrame(index, bredd, bredd, { palette: palett, delay });
  };

  if (rutor.length === 1) {
    // En enda bild kan inte korsfadeas. Vi skriver den ändå, men flaggar det
    // uppåt så att leveransen kan säga rakt ut att det blev en stillbild.
    skriv(rutor[0], hall);
    enc.finish();
    mkdirSync(dirname(ut), { recursive: true });
    writeFileSync(ut, Buffer.from(enc.bytes()));
    return { ut, animerad: false, bilder: 1, rutor: 1, bytes: statSync(ut).size };
  }

  let antalRutor = 0;
  for (let i = 0; i < rutor.length; i++) {
    skriv(rutor[i], hall); // bilden står stilla — en enda ruta räcker
    antalRutor++;
    const nasta = rutor[(i + 1) % rutor.length]; // sista tonar tillbaka till första
    for (let s = 1; s <= overgangsrutor; s++) {
      skriv(blanda(rutor[i], nasta, s / (overgangsrutor + 1)), Math.round(overgang / overgangsrutor));
      antalRutor++;
    }
  }
  enc.finish();

  mkdirSync(dirname(ut), { recursive: true });
  writeFileSync(ut, Buffer.from(enc.bytes()));
  const bytes = statSync(ut).size;

  // För stor: skala ner hellre än att lämna en trög produktsida efter oss.
  if (bytes > MAX_BYTES && bredd > 480) {
    return bildspelGif(bilder, ut, { ...val, bredd: 520, farger: 96, overgangsrutor: 4 });
  }
  return { ut, animerad: true, bilder: rutor.length, rutor: antalRutor, bytes };
}

/**
 * Långsam inzoomning på EN bild ("Ken Burns").
 *
 * Finns för att de flesta Temu-produkter i butiken bara har en enda bild. En
 * stillbild i beskrivningen drar ingen blick; den här ger rörelse utan att vi
 * hittar på bildmaterial som inte finns.
 *
 * Håll den liten — den ska inte konkurrera med produktbilderna i galleriet.
 */
export async function kenBurnsGif(bild, ut, val = {}) {
  const {
    bredd = 460,
    rutor = 14,
    delay = 90,
    zoom = 1.16, // slutzoom; 1.0 = ingen rörelse
    farger = 64,
    riktning = 'in',
    bakgrund = { r: 255, g: 255, b: 255 },
  } = val;

  const kalla = await hamtaBild(bild);
  // Jobba från en kvadrat i högre upplösning så att inzoomningen inte blir grynig.
  const arbetsBredd = Math.round(bredd * zoom * 1.05);
  const { data: full, info } = await sharp(kalla)
    .resize(arbetsBredd, arbetsBredd, { fit: 'contain', background: bakgrund })
    .flatten({ background: bakgrund })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const enc = GIFEncoder();
  for (let i = 0; i < rutor; i++) {
    const t = rutor === 1 ? 0 : i / (rutor - 1);
    const f = riktning === 'ut' ? zoom - (zoom - 1) * t : 1 + (zoom - 1) * t;
    // Beskär en allt mindre ruta ur mitten och skala upp den till målstorleken.
    const sida = Math.max(8, Math.round(info.width / f));
    const vanster = Math.round((info.width - sida) / 2);
    const topp = Math.round((info.height - sida) / 2);

    const { data } = await sharp(full, { raw: { width: info.width, height: info.height, channels: info.channels } })
      .extract({ left: vanster, top: topp, width: sida, height: sida })
      .resize(bredd, bredd, { fit: 'fill' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const palett = quantize(data, farger, { format: 'rgb565' });
    enc.writeFrame(applyPalette(data, palett, 'rgb565'), bredd, bredd, { palette: palett, delay });
  }
  enc.finish();

  mkdirSync(dirname(ut), { recursive: true });
  writeFileSync(ut, Buffer.from(enc.bytes()));
  const bytes = statSync(ut).size;
  if (bytes > MAX_BYTES && bredd > 380) {
    return kenBurnsGif(bild, ut, { ...val, bredd: 400, rutor: 12, farger: 48 });
  }
  return { ut, animerad: true, typ: 'kenburns', bilder: 1, rutor, bytes };
}

// ---- CLI ----------------------------------------------------------------
if (process.argv[1]?.endsWith('gif.mjs')) {
  const argv = process.argv.slice(2);
  const flaggor = Object.fromEntries(
    argv
      .filter((a) => a.startsWith('--'))
      .map((a) => {
        const [k, v = 'true'] = a.replace(/^--/, '').split('=');
        return [k, v];
      })
  );
  const filer = argv.filter((a) => !a.startsWith('--'));

  if (!filer.length) {
    console.error('Användning: node temu/gif.mjs --ut=fil.gif <bilder eller URL:er>');
    process.exit(1);
  }

  try {
    const ut = flaggor.ut || 'temu/tmp/ut.gif';
    // En enda bild kan inte korsfadeas — då blir Ken Burns rätt val automatiskt.
    const kenBurns = flaggor.kenburns === 'true' || filer.length === 1;
    const res = kenBurns
      ? await kenBurnsGif(filer[0], ut, {
          bredd: flaggor.bredd ? +flaggor.bredd : undefined,
          zoom: flaggor.zoom ? +flaggor.zoom : undefined,
          farger: flaggor.farger ? +flaggor.farger : undefined,
        })
      : await bildspelGif(filer, ut, {
          bredd: flaggor.bredd ? +flaggor.bredd : undefined,
          hall: flaggor.hall ? +flaggor.hall : undefined,
          overgang: flaggor.overgang ? +flaggor.overgang : undefined,
          farger: flaggor.farger ? +flaggor.farger : undefined,
        });
    console.log(JSON.stringify({ ...res, kb: Math.round(res.bytes / 1024) }, null, 2));
  } catch (e) {
    console.error('GIF misslyckades:', e.message);
    process.exit(1);
  }
}
