// Klaviyo-innehållet → Spoks-block. Samma källa (innehall/<brand>/), nytt mål.
//
//   node klaviyo/spoks/konvertera.mjs [--brand baverbutiken]
//
// Skriver klaviyo/spoks/<brand>/payload/<mejl-id>.json ({ emailTitle,
// emailDescription, blocks }) och klaviyo/spoks/<brand>/plan.json (flödenas
// startvillkor och steg, kampanjernas datum och målgrupp). Själva uppladdningen
// görs av sessionen med Spoks-MCP:n (create_flow, add_flow_step,
// update_draft_campaign, draft_campaign) — det finns inget publikt Spoks-API.
//
// Tre saker Spoks inte kan och som därför ändras här:
// - Kundens eget paket (länken sparning:) — Spoks personalisering har bara
//   kontaktfält, inget ordernummer. Knappen går till spårningssidan, där kunden
//   skriver in numret ur fraktmejlet.
// - "Det här fick du hem" (skickade_rader) — Spoks har inget orderradsblock.
//   Blocket utgår.
// - Alla stjärnor i recensionsmejlet leder fortfarande till SAMMA sida.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = path.dirname(fileURLToPath(import.meta.url));
const ROT = path.join(HAR, '..', '..');

const arg = (n, std) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : std; };
const brandId = arg('--brand', 'baverbutiken');
const brand = JSON.parse(fs.readFileSync(path.join(ROT, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
const produktIds = JSON.parse(fs.readFileSync(path.join(HAR, brandId, 'produkter.json'), 'utf8'));
const recCache = JSON.parse(fs.readFileSync(path.join(ROT, 'klaviyo', 'output', brandId, 'recensioner.json'), 'utf8')).recensioner ?? {};
const erbjudande = JSON.parse(fs.readFileSync(path.join(ROT, 'mejl', 'konfig.json'), 'utf8')).erbjudande;
const bas = brand.butik_url.replace(/\/$/, '');
const grundare = 'Axel';

export function fornamn(text) {
  return String(text ?? '')
    .replace(/, \{\{fornamn\}\}/g, '')
    .replace(/ \{\{fornamn\}\}/g, " {{ contact.first_name | default: 'där' }}")
    .replace(/^\{\{fornamn\}\}, (.)/, (_, c) => c.toUpperCase())
    .replace(/\{\{fornamn\}\}, /g, '')
    .replace(/\{\{fornamn\}\}/g, "{{ contact.first_name | default: 'där' }}");
}

function lank(spec) {
  const s = String(spec ?? '').trim();
  const [typ, ...rest] = s.split(':');
  const v = rest.join(':');
  if (typ === 'produkt') return `${bas}/products/${v}`;
  if (typ === 'kollektion') return `${bas}/collections/${v}`;
  if (typ === 'sparning') return brand.sparningssida;
  if (typ === 'sida') return `${bas}${v.startsWith('/') ? '' : '/'}${v}`;
  if (typ === 'url') return v;
  if (/^https:\/\//.test(s)) return s;
  return bas;
}

const handleUr = (spec) => (/^produkt:(.+)$/.exec(String(spec ?? '').trim()) ?? [])[1] ?? null;
const pid = (h, varn) => { const id = produktIds[h]; if (!id) varn.push(`Produkten ${h} finns inte i Spoks.`); return id; };
const synlig = (pris = true) => ({ isImageVisible: true, isTitleVisible: true, isPriceVisible: pris, isButtonVisible: true, isDescriptionVisible: false, isOriginalPriceVisible: pris });
const produkter = (ids, knapp, perRad) => ({
  type: 'products', selectionMode: 'manual', products: ids.map((id) => ({ id, button: knapp })),
  dynamicProductsCount: null, dynamicCriteria: null, productVisibilitySettings: synlig(), buttonText: null, alignment: 'center', productsPerRow: perRad,
});
const stycken = (text, alignment = 'left') => String(text ?? '').split(/\n{2,}/).filter((x) => x.trim()).map((t) => ({ type: 'regular', text: fornamn(t.trim()), alignment }));

export function konverteraBlock(b, varn) {
  switch (b.typ) {
    case 'hero': {
      const ut = [];
      if (b.rubrik) ut.push({ type: 'h1', text: fornamn(b.rubrik), alignment: 'center' });
      if (b.text) ut.push(...stycken(b.text, 'center'));
      const h = handleUr(b.bild);
      if (h) { const id = pid(h, varn); if (id) ut.push(produkter([id], 'Se produkten', 1)); }
      if (b.knapp) ut.push({ type: 'link', text: b.knapp.text, url: lank(b.knapp.lank), style: 'button' });
      return ut;
    }
    case 'text':
      return [...(b.rubrik ? [{ type: 'h2', text: fornamn(b.rubrik) }] : []), ...stycken(b.text)];
    case 'punkter':
      return [...(b.rubrik ? [{ type: 'h2', text: fornamn(b.rubrik) }] : []), ...(b.punkter ?? []).map((p) => ({ type: 'list', text: fornamn(p) }))];
    case 'produkt': {
      const id = pid(b.handle, varn);
      return [...(id ? [produkter([id], b.knapp ?? 'Till produkten', 1)] : []), ...(b.text ? stycken(b.text) : [])];
    }
    case 'produktrad': {
      const ids = (b.handles ?? []).map((h) => pid(h, varn)).filter(Boolean);
      if (!ids.length) return [];
      return [...(b.rubrik ? [{ type: 'h2', text: fornamn(b.rubrik), alignment: 'center' }] : []), produkter(ids, 'Se produkten', Math.min(ids.length, 3))];
    }
    case 'citat': {
      const lista = (recCache[b.handle] ?? []).slice(0, Math.min(Number(b.antal ?? 2) || 2, 2));
      if (!lista.length) { varn.push(`Inga recensioner för ${b.handle}, citatet utgår.`); return []; }
      return lista.flatMap((r) => [{ type: 'quote', text: `"${r.text}"\n${/^anonym/i.test(r.namn ?? '') || !r.namn ? 'Verifierad kund' : `${r.namn}, verifierad kund`}` }]);
    }
    case 'knapp':
      return [{ type: 'link', text: b.text, url: lank(b.lank), style: 'button' }];
    case 'grundare':
      return [{ type: 'quote', text: `${fornamn(b.text)}\n${grundare}, grundare` }];
    case 'fakta':
      return [{
        type: 'columns', stackedOnMobile: true, verticalAlignment: 'top',
        columns: [
          { flex: 1, blocks: [{ type: 'regular', text: '**Ångerrätt**', alignment: 'center' }, { type: 'regular', text: brand.angerratt_text, alignment: 'center' }] },
          { flex: 1, blocks: [{ type: 'regular', text: '**Spåra paketet**', alignment: 'center' }, { type: 'regular', text: `[Följ det hela vägen](${brand.sparningssida})`, alignment: 'center' }] },
        ],
      }];
    case 'erbjudande': {
      const min = `${erbjudande.minsta_kop_sek} kr`;
      return [{
        type: 'section', blocks: [
          { type: 'h2', text: 'Din kundgåva', alignment: 'center' },
          ...(b.text ? stycken(b.text, 'center') : []),
          { type: 'regular', text: `Snurra hjulet och vinn en produkt gratis, som blir din vid nästa köp på minst ${min}.`, alignment: 'center' },
          { type: 'regular', text: `Din gåvokod: **${erbjudande.kod}**`, alignment: 'center' },
          { type: 'link', text: 'Snurra hjulet', url: `${bas}/pages/din-gratisprodukt`, style: 'button' },
          { type: 'regular', text: `Gäller vid nästa köp på minst ${min}, ett snurr per kund, och kombineras inte med andra koder.`, alignment: 'center' },
        ],
      }];
    }
    case 'dynamisk':
      if (b.kalla === 'checkout_rader') return [{ type: 'abandonedCart', buttonText: 'Tillbaka till kassan' }];
      if (b.kalla === 'visad_produkt') return [{ ...produkter([], null, 1), selectionMode: 'dynamic', products: undefined, dynamicCriteria: 'recently_viewed', dynamicProductsCount: 1, buttonText: 'Titta igen' }];
      varn.push(`Dynamiskt block ${b.kalla} finns inte i Spoks, blocket utgår.`);
      return [];
    case 'stjarnor': {
      const u = lank(b.lank);
      const sep = u.includes('?') ? '&' : '?';
      return [
        ...(b.rubrik ? [{ type: 'h2', text: b.rubrik, alignment: 'center' }] : []),
        { type: 'h1', text: [1, 2, 3, 4, 5].map((n) => `[★](${u}${sep}stars=${n})`).join(' '), alignment: 'center' },
        ...(b.text ? [{ type: 'regular', text: b.text, alignment: 'center' }] : []),
      ];
    }
    default:
      varn.push(`Okänd blocktyp ${b.typ}, blocket utgår.`);
      return [];
  }
}

export function konverteraMejl(m) {
  const varn = [];
  const blocks = (m.block ?? []).flatMap((b) => konverteraBlock(b, varn)).map((b) => {
    if (b.type === 'products' && b.selectionMode === 'dynamic') delete b.products;
    return b;
  });
  return {
    id: m.id,
    emailTitle: fornamn(m.amnesrader?.[0]?.text ?? ''),
    emailDescription: fornamn(m.forhandstext ?? ''),
    amnesrader: (m.amnesrader ?? []).map((a) => fornamn(a.text)),
    blocks,
    varningar: varn,
  };
}

function main() {
  const inn = path.join(ROT, 'klaviyo', 'innehall', brandId);
  const ut = path.join(HAR, brandId, 'payload');
  fs.mkdirSync(ut, { recursive: true });
  const plan = { floden: [], kampanjer: [] };
  for (const f of fs.readdirSync(path.join(inn, 'floden')).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(inn, 'floden', f), 'utf8'));
    const steg = [];
    for (const s of d.steg) {
      if (s.typ === 'vanta') steg.push({ typ: 'vanta', dagar: s.enhet === 'hours' ? s.varde / 24 : s.varde });
      else {
        const p = konverteraMejl(s.mejl);
        fs.writeFileSync(path.join(ut, `${p.id}.json`), JSON.stringify(p, null, 2) + '\n');
        steg.push({ typ: 'mejl', id: p.id, namn: p.emailTitle });
        if (p.varningar.length) console.log(`${p.id}: ${p.varningar.join(' | ')}`);
      }
    }
    plan.floden.push({ id: d.id, namn: d.namn, trigger: d.trigger, filter: d.filter ?? [], steg });
  }
  for (const f of fs.readdirSync(path.join(inn, 'kampanjer')).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(inn, 'kampanjer', f), 'utf8'));
    const m = d.mejl ?? d;
    const p = konverteraMejl({ ...m, id: m.id ?? d.id });
    fs.writeFileSync(path.join(ut, `${p.id}.json`), JSON.stringify(p, null, 2) + '\n');
    if (p.varningar.length) console.log(`${p.id}: ${p.varningar.join(' | ')}`);
    plan.kampanjer.push({ id: d.id, namn: d.namn, planerad: d.planerad ?? d.skickas, segment: d.segment ?? d.malgrupp, mejl: p.id });
  }
  fs.writeFileSync(path.join(HAR, brandId, 'plan.json'), JSON.stringify(plan, null, 2) + '\n');
  console.log(`${plan.floden.length} flöden, ${plan.kampanjer.length} kampanjer → ${path.relative(ROT, ut)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
