// Mejlbilderna: en egen bild per mejl i stället för samma produktbild överst i
// alla (Axels dom 2026-09-29: "det är bara samma bild i alla mejl, och ingen vill
// riktigt se det där. Så alla kommer unsubscribea … du kan bara göra nya bilder
// också med API:n").
//
//   node klaviyo/mejlbilder.mjs --brand matstrumpor --kolla
//       vilka kampanjer som saknar egen bild, vilka bilder som inte är godkända eller
//       saknar Spoks-id, och om två mejl nära varandra har samma bild
//   node klaviyo/mejlbilder.mjs --brand matstrumpor --generera [--bara a,b] [--varianter 2] [--om]
//       kie.ai (google/nano-banana-edit, butikens produktfoton som referens) →
//       klaviyo/output/<brand>/mejlbilder/<namn>/<taskId>-<n>.jpg. Inget godkänns här.
//   node klaviyo/mejlbilder.mjs --brand matstrumpor --godkann <namn> <fil>
//       sessionen har TITTAT på bilden: den läggs i Shopify Files (butikens CDN)
//       och skrivs in i registret, utan Spoks-id tills den laddats upp där
//   node klaviyo/mejlbilder.mjs --brand matstrumpor --befintlig
//       planens befintliga bilder (butikens egna i Shopify Files) → registret
//   node klaviyo/mejlbilder.mjs --brand matstrumpor --synka
//       planens alt-text och länk → registret (url och Spoks-id rörs inte)
//   node klaviyo/mejlbilder.mjs --brand matstrumpor --spoks-lista
//       upload_media-anropen för bilder utan Spoks-id (max 10 per anrop)
//   node klaviyo/mejlbilder.mjs --brand matstrumpor --spoks <namn> <fileId>
//       Spoks-id:t upload_media gav → registret
//
// Planen (motiv, prompt, referensfoton) står i klaviyo/innehall/<brand>/bildplan.json,
// registret (url, alt, länk, Spoks-id) i klaviyo/konto/<brand>/bilder.json.
// Innehållet pekar på registret med  "bild": "bild:<namn>"  i hero-blocket, och
// mallar.mjs + spoks-paket.mjs slår upp bilden där. En bild som inte finns i
// registret stoppar bygget: ett mejl ska aldrig gå ut med en tom ruta överst.

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROT, bildNamn, lasBildregister } from './mallar.mjs';

export { bildNamn, lasBildregister };

// ---------------------------------------------------------------------------
// Rena hjälpare (testade utan nät)
// ---------------------------------------------------------------------------

export const planFil = (brandId, rot = ROT) => join(rot, 'klaviyo', 'innehall', brandId, 'bildplan.json');
export const registerFil = (brandId, rot = ROT) => join(rot, 'klaviyo', 'konto', brandId, 'bilder.json');

// Hero-bilden i ett mejl (första hero-blocket), eller null.
export function heroBild(mejl) {
  const h = (mejl?.block ?? []).find((b) => b.typ === 'hero' && b.bild);
  return h ? String(h.bild) : null;
}

// Bildens länk: hero-blockets egen bild_lank, annars hero-knappens länk (så bild
// och knapp går till samma ställe), annars registrets länk.
export function bildLank(b, post) {
  return b?.bild_lank ?? b?.knapp?.lank ?? post?.lank ?? null;
}

// Kampanjer som delar hero-bild inom `dagar` dygn från varandra. Räknar bara
// kampanjer planerade från och med `fran` och inte parkerade, så gamla skickade
// mejl inte stoppar bygget. Gäller även produktbilder (produkt:<handle>) —
// det var just den upprepningen Axel dömde ut.
export function samma(kampanjer, { dagar = 21, fran = null } = {}) {
  const lista = kampanjer
    .filter((k) => k.planerad && !Number.isNaN(Date.parse(k.planerad)))
    .filter((k) => !k.parkerad && k.status_plan !== 'parkerad')
    .filter((k) => !fran || String(k.planerad) >= fran)
    .map((k) => ({ id: k.id, t: Date.parse(k.planerad), bild: heroBild(k) }))
    .filter((k) => k.bild)
    .sort((a, b) => a.t - b.t);
  const ut = [];
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      const d = (lista[j].t - lista[i].t) / 86_400_000;
      if (d >= dagar) break;
      if (lista[i].bild === lista[j].bild) ut.push({ a: lista[i].id, b: lista[j].id, bild: lista[i].bild, dagar: Math.round(d * 10) / 10 });
    }
  }
  return ut;
}

// Prompten som skickas till kie.ai: motivet, produkterna ur referensfotona och
// den gemensamma stilen (ingen text, inga ansikten, produkten som den ser ut).
export function byggPrompt(plan, bild) {
  const produkter = (bild.ref ?? []).map((r) => plan.produkter?.[r]).filter(Boolean);
  if ((bild.ref ?? []).length !== produkter.length) {
    const saknas = bild.ref.filter((r) => !plan.produkter?.[r]);
    throw new Error(`${bild.namn}: referensen ${saknas.join(', ')} saknar beskrivning i planens "produkter".`);
  }
  return [
    String(bild.prompt ?? '').trim(),
    produkter.length ? `The product${produkter.length > 1 ? 's are' : ' is'} ${produkter.join('; and ')}.` : '',
    String(plan.stil ?? '').trim(),
  ].filter(Boolean).join(' ');
}

// Standardlänk ur första referensfotot, när planen inte säger något.
const REF_LANK = {
  'sushi-lada': 'produkt:sushi-strumpor',
  'sushi-tallrik': 'produkt:sushi-strumpor',
  'sushi-strumpor': 'produkt:sushi-strumpor',
  'pizza-lada': 'produkt:pizza-strumpor',
  'pizza-strumpor': 'produkt:pizza-strumpor',
  burgare: 'produkt:hamburger-strumpor',
  donut: 'produkt:donut-strumpor',
};
export function standardLank(bild) {
  if (bild.lank) return bild.lank;
  const refs = bild.ref ?? [];
  const lankar = [...new Set(refs.map((r) => REF_LANK[r]).filter(Boolean))];
  if (lankar.length === 1) return lankar[0];
  if (lankar.length > 1) return 'kollektion:alla-produkter';
  return null;
}

// Kontrollen: planen mot registret mot innehållet.
export function kolla({ plan, register, kampanjer, dagar = 21, fran = null }) {
  const rader = [];
  const planerade = new Map((plan?.bilder ?? []).map((b) => [b.namn, b]));
  for (const [namn, b] of planerade) {
    const r = register[namn];
    if (!r?.url) rader.push({ typ: 'ej_godkand', namn, text: `${namn}: inte godkänd än (${b.befintlig ? 'kör --befintlig' : 'generera, titta, --godkann'}).` });
    else if (!r.spoks_id) rader.push({ typ: 'ej_spoks', namn, text: `${namn}: saknar Spoks-id (upload_media, sedan --spoks ${namn} <fileId>).` });
  }
  const aktuella = kampanjer.filter((k) => !k.parkerad && k.status_plan !== 'parkerad' && (!fran || String(k.planerad ?? '') >= fran));
  for (const k of aktuella) {
    const h = heroBild(k);
    const n = bildNamn(h);
    if (!h) rader.push({ typ: 'ingen_bild', namn: k.id, text: `${k.id}: ingen hero-bild.` });
    else if (!n) rader.push({ typ: 'produktbild', namn: k.id, text: `${k.id}: hero är fortfarande ${h}.` });
    else if (!register[n]?.url) rader.push({ typ: 'saknas_i_register', namn: k.id, text: `${k.id}: bild:${n} finns inte i registret.` });
  }
  for (const d of samma(kampanjer, { dagar, fran })) rader.push({ typ: 'samma', namn: `${d.a}+${d.b}`, text: `${d.a} och ${d.b} har samma bild (${d.bild}) ${d.dagar} dygn isär.` });
  return rader;
}

// ---------------------------------------------------------------------------
// Filerna
// ---------------------------------------------------------------------------

export function lasPlan(brandId, rot = ROT) {
  const fil = planFil(brandId, rot);
  if (!existsSync(fil)) throw new Error(`Ingen bildplan: ${fil}`);
  const plan = JSON.parse(readFileSync(fil, 'utf8'));
  const namn = new Set();
  for (const b of plan.bilder ?? []) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(b.namn ?? '')) throw new Error(`Bildnamnet "${b.namn}" duger inte (bara a-z, 0-9 och -).`);
    if (namn.has(b.namn)) throw new Error(`Bildnamnet "${b.namn}" står två gånger i planen.`);
    namn.add(b.namn);
    if (!b.befintlig && !b.prompt) throw new Error(`${b.namn}: varken "befintlig" eller "prompt".`);
    if (!b.alt) throw new Error(`${b.namn}: saknar "alt" (texten som visas när bilder är avstängda).`);
  }
  return plan;
}

function skrivRegister(brandId, bilder, rot = ROT) {
  const fil = registerFil(brandId, rot);
  const gammal = existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : {};
  const ut = {
    om: gammal.om ?? 'Mejlbildernas register: namn → url (butikens Shopify-CDN), alt, länk och Spoks-id. Skrivs av node klaviyo/mejlbilder.mjs, aldrig för hand. Innehållet pekar hit med "bild": "bild:<namn>".',
    bilder: Object.fromEntries(Object.entries(bilder).sort(([a], [b]) => a.localeCompare(b))),
  };
  mkdirSync(join(rot, 'klaviyo', 'konto', brandId), { recursive: true });
  writeFileSync(fil, JSON.stringify(ut, null, 2) + '\n');
}

const idag = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Kommandona
// ---------------------------------------------------------------------------

async function generera(brandId, { bara = null, varianter = 1, om = false, parallellt = 4 } = {}) {
  const { genereraBild } = await import('../bildannonser/kie.mjs');
  const plan = lasPlan(brandId);
  const register = lasBildregister(brandId);
  const ut = join(ROT, 'klaviyo', 'output', brandId, 'mejlbilder');
  mkdirSync(ut, { recursive: true });
  const logg = join(ut, 'generering.jsonl');
  const jobb = [];
  for (const b of plan.bilder) {
    if (b.befintlig) continue;
    if (bara && !bara.includes(b.namn)) continue;
    if (!bara && !om && register[b.namn]?.url) continue;
    for (let n = 1; n <= varianter; n++) jobb.push({ b, n });
  }
  console.log(`${jobb.length} bilder att generera (${parallellt} åt gången).`);
  const resultat = [];
  let i = 0;
  async function arbetare() {
    while (i < jobb.length) {
      const { b, n } = jobb[i++];
      const prompt = byggPrompt(plan, b);
      const referensBilder = (b.ref ?? []).map((r) => plan.referenser[r]);
      try {
        const r = await genereraBild({ prompt, referensBilder, bildformat: b.format ?? '4:3', filformat: 'jpeg' }, { timeoutMs: 600000 });
        const mapp = join(ut, b.namn);
        mkdirSync(mapp, { recursive: true });
        for (const [k, url] of r.urler.entries()) {
          const svar = await fetch(url);
          if (!svar.ok) throw new Error(`nedladdningen gav ${svar.status}`);
          const fil = join(mapp, `${r.taskId}-${n}${r.urler.length > 1 ? `-${k + 1}` : ''}.jpg`);
          writeFileSync(fil, Buffer.from(await svar.arrayBuffer()));
          appendFileSync(logg, JSON.stringify({ tid: new Date().toISOString(), namn: b.namn, taskId: r.taskId, modell: r.modell, url, fil, prompt }) + '\n');
          resultat.push({ namn: b.namn, fil });
          console.log(`✅ ${b.namn}: ${fil}`);
        }
      } catch (e) {
        console.error(`❌ ${b.namn}: ${e.message}`);
        resultat.push({ namn: b.namn, fel: e.message });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(parallellt, jobb.length) }, arbetare));
  const fel = resultat.filter((r) => r.fel);
  console.log(`\n${resultat.length - fel.length} bilder klara${fel.length ? `, ${fel.length} fel` : ''}. Titta på varje bild innan --godkann.`);
  return resultat;
}

async function godkann(brandId, namn, fil) {
  const plan = lasPlan(brandId);
  const b = plan.bilder.find((x) => x.namn === namn);
  if (!b) throw new Error(`"${namn}" finns inte i bildplanen.`);
  if (!existsSync(fil)) throw new Error(`Filen finns inte: ${fil}`);
  const brand = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
  if (!brand.shopify?.butik) throw new Error(`brand.shopify.butik saknas för ${brandId} — bilden kan inte läggas i butikens Shopify Files.`);
  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  const { tillShopify } = await import('../matstrumpor/thumbnails.mjs');
  // Filnamnet blir bildens namn i Shopify Files, så den går att hitta igen.
  const tmp = join(ROT, 'klaviyo', 'output', brandId, 'mejlbilder', `mejl-${namn}.jpg`);
  writeFileSync(tmp, readFileSync(fil));
  const klient = await skapaKlient(lasButik(brand.shopify.butik));
  const url = await tillShopify(klient, tmp);
  const loggrad = existsSync(join(ROT, 'klaviyo', 'output', brandId, 'mejlbilder', 'generering.jsonl'))
    ? readFileSync(join(ROT, 'klaviyo', 'output', brandId, 'mejlbilder', 'generering.jsonl'), 'utf8').trim().split('\n').map((r) => JSON.parse(r)).reverse().find((r) => r.fil === fil)
    : null;
  const register = lasBildregister(brandId);
  register[namn] = {
    url,
    alt: b.alt,
    lank: standardLank(b),
    kalla: loggrad ? `kie.ai ${loggrad.modell}, task ${loggrad.taskId}` : `egen fil ${basename(fil)}`,
    godkand: idag(),
  };
  skrivRegister(brandId, register);
  console.log(`✅ ${namn} godkänd: ${url}\n   Nästa: upload_media i Spoks, sedan --spoks ${namn} <fileId>.`);
  return url;
}

function befintlig(brandId) {
  const plan = lasPlan(brandId);
  const register = lasBildregister(brandId);
  let n = 0;
  for (const b of plan.bilder) {
    if (!b.befintlig) continue;
    const r = register[b.namn];
    if (r?.url === b.befintlig && r.alt === b.alt && r.lank === standardLank(b)) continue;
    // Samma url behåller sitt Spoks-id; ny url måste laddas upp i Spoks igen.
    register[b.namn] = { url: b.befintlig, alt: b.alt, lank: standardLank(b), kalla: 'butikens egen bild i Shopify Files', godkand: r?.godkand ?? idag(), ...(r?.url === b.befintlig && r.spoks_id ? { spoks_id: r.spoks_id } : {}) };
    n++;
  }
  skrivRegister(brandId, register);
  console.log(`${n} befintliga bilder skrivna i registret.`);
}

// Alt-text och länk följer planen även efter godkännandet (url och Spoks-id rörs
// inte): en rättad länk i planen ska inte kräva en ny bild.
function synka(brandId) {
  const plan = lasPlan(brandId);
  const register = lasBildregister(brandId);
  let n = 0;
  for (const b of plan.bilder) {
    const r = register[b.namn];
    if (!r) continue;
    const lank = standardLank(b);
    if (r.alt === b.alt && r.lank === lank) continue;
    register[b.namn] = { ...r, alt: b.alt, lank };
    n++;
    console.log(`• ${b.namn}: alt/länk uppdaterad (${lank ?? 'ingen länk'})`);
  }
  skrivRegister(brandId, register);
  console.log(`${n} bilder uppdaterade i registret.`);
}

function spoksLista(brandId) {
  const register = lasBildregister(brandId);
  const utan = Object.entries(register).filter(([, r]) => r.url && !r.spoks_id);
  const batchar = [];
  for (let i = 0; i < utan.length; i += 10) batchar.push(utan.slice(i, i + 10).map(([namn, r]) => ({ imageUrl: r.url, name: `mejl-${namn}` })));
  console.log(JSON.stringify(batchar, null, 2));
  console.error(`${utan.length} bilder utan Spoks-id i ${batchar.length} anrop.`);
}

function spoks(brandId, namn, fileId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(fileId ?? ''))) throw new Error(`"${fileId}" ser inte ut som ett Spoks fileId (uuid).`);
  const register = lasBildregister(brandId);
  if (!register[namn]?.url) throw new Error(`"${namn}" är inte godkänd än.`);
  register[namn].spoks_id = fileId;
  skrivRegister(brandId, register);
  console.log(`✅ ${namn}: Spoks-id ${fileId}`);
}

async function kontroll(brandId) {
  const { lasInnehall } = await import('./bygg.mjs');
  const brand = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
  const regler = brand.bildregler ?? {};
  const plan = existsSync(planFil(brandId)) ? lasPlan(brandId) : { bilder: [] };
  const { kampanjer } = lasInnehall(join(ROT, 'klaviyo', 'innehall', brandId));
  const rader = kolla({ plan, register: lasBildregister(brandId), kampanjer, dagar: regler.unik_hero_dagar ?? 21, fran: regler.fran ?? null });
  if (!rader.length) console.log('✅ Varje kampanj har en egen, godkänd bild med Spoks-id.');
  for (const r of rader) console.log(`• ${r.text}`);
  return rader;
}

function arg(namn) {
  const i = process.argv.indexOf(namn);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const brandId = arg('--brand') ?? 'baverbutiken';
  const a = process.argv;
  if (a.includes('--generera')) {
    const bara = arg('--bara')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null;
    const r = await generera(brandId, { bara, varianter: Number(arg('--varianter') ?? 1), om: a.includes('--om') });
    if (r.some((x) => x.fel)) process.exitCode = 1;
  } else if (a.includes('--godkann')) {
    const i = a.indexOf('--godkann');
    await godkann(brandId, a[i + 1], a[i + 2]);
  } else if (a.includes('--befintlig')) {
    befintlig(brandId);
  } else if (a.includes('--synka')) {
    synka(brandId);
  } else if (a.includes('--spoks-lista')) {
    spoksLista(brandId);
  } else if (a.includes('--spoks')) {
    const i = a.indexOf('--spoks');
    spoks(brandId, a[i + 1], a[i + 2]);
  } else {
    const rader = await kontroll(brandId);
    if (rader.length) process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
