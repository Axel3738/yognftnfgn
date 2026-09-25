// Varifrån kommer köpen? Nya mot återkommande kunder, och vilka köp mejlen fick.
//
//   node klaviyo/aterkop.mjs [--brand baverbutiken] [--dagar 30] [--json]
//
// Läs-bart. Källan är Klaviyos egna Placed Order-händelser (Shopify-integrationen)
// med relationen `attributions` — den säger vilket flöde eller vilken kampanj
// Klaviyo gav köpet, enligt kontots attributionsinställning (klick, 5 dagar,
// mätt 2026-09-25). Attributionen ligger INTE i event_properties; den kommer
// bara med `include=attributions` (mätt 2026-09-25: 0 av 183 händelser bar den
// i egenskaperna, 1 hade den som relation — F02 Y9QRkG).
//
// "Återkommande" = profilen har ett tidigare Placed Order i Klaviyo. Klaviyos
// historik börjar när Shopify-integrationen backfyllde (Bäverbutiken:
// 2025-11-30), så en kund vars förra köp är äldre räknas som ny. Talet är
// alltså ett golv, och rapporten skriver ut var historiken börjar.
//
// Övergiven kassa: Started Checkout i fönstret, hur många av de profilerna som
// sedan köpte inom 5 dagar, och hur många av de köpen F02 fick.

import { KlaviyoKlient, nyckelFranEnv, kontrolleraKonto } from './klient.mjs';
import { lasBrand } from './ladda-upp.mjs';

const DYGN = 86400000;
const ATERHAMTNING_DAGAR = 5;
const DIREKT_MS = 3600000;

/** Ren analys: händelser in, tal ut. Testbar utan nät. */
export function analysera({ ordrar, kassor = [], fran, till, flodNamn = {}, kampanjNamn = {}, kassaFloden = [] }) {
  const t0 = +new Date(fran), t1 = +new Date(till);
  const sorterade = [...ordrar].sort((a, b) => +new Date(a.tid) - +new Date(b.tid));
  const forstaKop = new Map();
  for (const o of sorterade) if (!forstaKop.has(o.profil)) forstaKop.set(o.profil, +new Date(o.tid));
  const iFonster = sorterade.filter((o) => +new Date(o.tid) >= t0 && +new Date(o.tid) < t1);

  const tom = () => ({ ordrar: 0, intakt: 0 });
  const sum = { alla: tom(), nya: tom(), aterkommande: tom() };
  const kalla = new Map(); // nyckel → { typ, id, namn, nya, aterkommande }
  const utanMejl = { nya: tom(), aterkommande: tom() };
  for (const o of iFonster) {
    const grupp = forstaKop.get(o.profil) < +new Date(o.tid) ? 'aterkommande' : 'nya';
    for (const k of ['alla', grupp]) { sum[k].ordrar++; sum[k].intakt += o.varde; }
    if (!o.flode && !o.kampanj) { utanMejl[grupp].ordrar++; utanMejl[grupp].intakt += o.varde; continue; }
    const typ = o.flode ? 'Flöde' : 'Kampanj';
    const id = o.flode ?? o.kampanj;
    const nyckel = `${typ}:${id}`;
    if (!kalla.has(nyckel)) kalla.set(nyckel, { typ, id, namn: (o.flode ? flodNamn[id] : kampanjNamn[id]) ?? id, nya: tom(), aterkommande: tom() });
    const k = kalla.get(nyckel);
    k[grupp].ordrar++; k[grupp].intakt += o.varde;
  }
  const franMejl = (g) => ({ ordrar: sum[g].ordrar - utanMejl[g].ordrar, intakt: sum[g].intakt - utanMejl[g].intakt });

  // Övergiven kassa: en start per profil (den första i fönstret).
  const startPerProfil = new Map();
  for (const k of kassor) {
    const t = +new Date(k.tid);
    if (t < t0 || t >= t1) continue;
    if (!startPerProfil.has(k.profil) || t < startPerProfil.get(k.profil)) startPerProfil.set(k.profil, t);
  }
  // Övergiven = inget köp inom en timme efter att kassan startades.
  // Återvunnen = köp inom 5 dagar efter det. Flödets köp räknas för sig.
  let direkt = 0, overgivna = 0, atervunna = 0;
  for (const [profil, t] of startPerProfil) {
    const kop = sorterade.find((o) => o.profil === profil && +new Date(o.tid) >= t && +new Date(o.tid) - t <= ATERHAMTNING_DAGAR * DYGN);
    if (kop && +new Date(kop.tid) - t <= DIREKT_MS) { direkt++; continue; }
    overgivna++;
    if (kop) atervunna++;
  }
  const flodKop = iFonster.filter((o) => o.flode && kassaFloden.includes(o.flode));
  return {
    fran, till,
    historikFran: sorterade[0]?.tid ?? null,
    summa: sum,
    franMejl: { nya: franMejl('nya'), aterkommande: franMejl('aterkommande') },
    utanMejl,
    kallor: [...kalla.values()].sort((a, b) => (b.nya.intakt + b.aterkommande.intakt) - (a.nya.intakt + a.aterkommande.intakt)),
    kassa: { profiler: startPerProfil.size, direkt, overgivna, atervunna, viaFlodet: flodKop.length, intaktFlodet: flodKop.reduce((x, o) => x + o.varde, 0) },
  };
}

async function allaHandelser(klient, metrikId, franIso, medAttribution) {
  const ut = [];
  const params = {
    filter: `equals(metric_id,"${metrikId}"),greater-or-equal(datetime,${franIso})`,
    'page[size]': 200,
    sort: 'datetime',
    'fields[event]': 'datetime,event_properties',
  };
  if (medAttribution) params.include = 'attributions';
  let svar = await klient.get('/api/events', params);
  for (;;) {
    const attr = new Map((svar.included ?? []).filter((x) => x.type === 'attribution').map((x) => [x.id, x.relationships]));
    for (const e of svar.data ?? []) {
      const p = e.attributes.event_properties ?? {};
      const a = (e.relationships?.attributions?.data ?? []).map((r) => attr.get(r.id)).find(Boolean);
      ut.push({
        tid: e.attributes.datetime,
        profil: e.relationships?.profile?.data?.id ?? null,
        varde: Number(p.$value) || 0,
        flode: a?.flow?.data?.id ?? null,
        kampanj: a?.campaign?.data?.id ?? null,
      });
    }
    const nasta = svar.links?.next;
    if (!nasta) break;
    svar = await klient.get(nasta);
  }
  return ut.filter((x) => x.profil);
}

const kr = (x) => `${Math.round(x).toLocaleString('sv-SE')} kr`;
const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)} %` : '–');

export function textRapport(r, brandNamn) {
  const s = r.summa;
  const rader = [];
  rader.push(`${brandNamn}: varifrån kom köpen? ${r.fran.slice(0, 10)} till ${r.till.slice(0, 10)}.`);
  rader.push(`Klaviyos orderhistorik börjar ${String(r.historikFran).slice(0, 10)}. "Ny" = inget tidigare köp sedan dess (golv, inte exakt).`);
  rader.push('');
  rader.push(`Alla köp: ${s.alla.ordrar} ordrar, ${kr(s.alla.intakt)}`);
  rader.push(`  Nya kunder:          ${s.nya.ordrar} ordrar, ${kr(s.nya.intakt)}. Från mejl: ${r.franMejl.nya.ordrar} (${pct(r.franMejl.nya.ordrar, s.nya.ordrar)}), ${kr(r.franMejl.nya.intakt)}`);
  rader.push(`  Återkommande kunder: ${s.aterkommande.ordrar} ordrar, ${kr(s.aterkommande.intakt)}. Från mejl: ${r.franMejl.aterkommande.ordrar} (${pct(r.franMejl.aterkommande.ordrar, s.aterkommande.ordrar)}), ${kr(r.franMejl.aterkommande.intakt)}`);
  rader.push('');
  rader.push('Köp som Klaviyo gav ett mejl (klick, 5 dagar):');
  if (!r.kallor.length) rader.push('  inga ännu');
  for (const k of r.kallor) {
    rader.push(`  ${k.typ} ${k.namn}: nya ${k.nya.ordrar} (${kr(k.nya.intakt)}), återkommande ${k.aterkommande.ordrar} (${kr(k.aterkommande.intakt)})`);
  }
  rader.push('');
  const k = r.kassa;
  rader.push(`Kassan: ${k.profiler} personer började i kassan. ${k.direkt} köpte inom en timme. ${k.overgivna} lämnade kassan (övergiven).`);
  rader.push(`  Av de övergivna kom ${k.atervunna} tillbaka och köpte inom 5 dagar (${pct(k.atervunna, k.overgivna)}).`);
  rader.push(`  Köp som Klaviyo gav flödet för övergiven kassa: ${k.viaFlodet}, ${kr(k.intaktFlodet)}.`);
  rader.push('Ingen dom under 3 köp per rad (ANALYSMETOD).');
  return rader.join('\n');
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const brand = lasBrand(arg('--brand') ?? 'baverbutiken');
  const dagar = Number(arg('--dagar') ?? 30);
  const nyckel = nyckelFranEnv(brand);
  if (!nyckel?.nyckel) throw new Error(`Nyckeln saknas: ${brand.nyckel_env.join(' eller ')}.`);
  const klient = new KlaviyoKlient({ nyckel: nyckel.nyckel, logg: (t) => console.error(t) });
  await kontrolleraKonto(klient, brand);

  const metriker = (await klient.allaSidor('/api/metrics')).map((m) => ({ id: m.id, namn: m.attributes.name }));
  const id = (namn) => metriker.find((m) => m.namn === namn)?.id;
  const order = id('Placed Order'), kassa = id('Started Checkout') ?? id('Checkout Started');
  if (!order) throw new Error('Placed Order finns inte i kontot.');

  const till = new Date().toISOString();
  const fran = new Date(Date.now() - dagar * DYGN).toISOString();
  const ordrar = await allaHandelser(klient, order, '2000-01-01T00:00:00Z', true);
  const kassor = kassa ? await allaHandelser(klient, kassa, fran, false) : [];

  const flodNamn = Object.fromEntries((await klient.allaSidor('/api/flows')).map((f) => [f.id, f.attributes.name]));
  const kampanjer = await klient.allaSidor('/api/campaigns', { filter: 'equals(messages.channel,"email")' }).catch(() => []);
  const kampanjNamn = Object.fromEntries(kampanjer.map((c) => [c.id, c.attributes.name]));
  const kassaFloden = Object.entries(flodNamn).filter(([, n]) => /checkout|kassa/i.test(n)).map(([i]) => i);

  const r = analysera({ ordrar, kassor, fran, till, flodNamn, kampanjNamn, kassaFloden });
  if (argv.includes('--json')) console.log(JSON.stringify(r, null, 2));
  else console.log(textRapport(r, brand.namn));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
