// arkiv.mjs — Matstrumpors arkiv: EN rad per test, skrivet av koden.
//
// Axels fråga 2026-10-01: "har vi ett egeninbyggt arkiv för allt vi testar —
// annonser, koncept och variationer — som själv lagrar all data och håller koll
// på hur många variationer den gör?" Svaret var nej: loggen skrevs för hand,
// Meta-siffrorna låg i en gitignorerad mapp och dog med containern, och ingen
// kod räknade variationer eller kedjor. Det här är Evolves Growth Guide
// ("Ad Roadmap", docs/os/evolve/EVOLVE-GAP-ANALYS.md avsnitt 1) byggd på det
// vi redan har:
//
//   matstrumpor/arkiv/matningar.jsonl   ← --hamta skriver EN rad per annons och
//                                         avläsning (bara tillägg, små diffar)
//   matstrumpor/logg.jsonl              ← ETIKETT, LARDOM, BRIEF, UPPLADDAD, OMDOPT
//   products/matstrumpor/batch-0N/**/brief.md  ← VARIABELTAGGAR (komponenterna)
//   ⇒ products/matstrumpor/arkiv.md (committas) + arkiv.json (gitignorerad,
//     ~170 kB härledd data — byggs om av --arkiv)
//
// Ingenting här räknas i huvudet: siffrorna är Metas (via --hamta), etiketterna
// koden i etikett.mjs, vinstbidraget ekonomi.mjs. Saknas ett tal står det null
// med orsak, aldrig 0.
//
// Ren logik utom laggTillMatningar/lasMatningar (en fil) och lasTaggar (läser
// brief.md). Testad i test/arkiv.test.mjs.

import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tolka, foralderNamn } from './namn.mjs';
import { RANG, gallandeEtiketter, hitRate, ETIKETT } from './etikett.mjs';
import { konceptStatus } from './lardom.mjs';
import { brytpunkter, vinstbidrag } from './ekonomi.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const MATNINGSFIL = join(ROT, 'arkiv', 'matningar.jsonl');
export const ARKIV_JSON = join(ROT, '..', 'products', 'matstrumpor', 'arkiv.json');
export const ARKIV_MD = join(ROT, '..', 'products', 'matstrumpor', 'arkiv.md');

/** Mätfälten som sparas per avläsning — det Evolve tittar på (kolumnerna i
 *  "How To See Ads Performance + Our Columns"), inget mer. */
export const MATFALT = ['spend_sek', 'kop', 'roas', 'cpa_sek', 'impressions', 'cpm_sek', 'klick', 'ctr_lank', 'lpv', 'konv_lpv', 'hook_rate', 'hold_rate', 'hook_till_hold', 'snitt_speltid_s'];

/** Raderna en avläsning ger arkivet: annonser med spend de senaste 14 dagarna.
 *  Ren. */
export function matningsrader(jobb) {
  return (jobb?.annonser ?? [])
    .filter((a) => (a.spend_sek ?? 0) > 0)
    .map((a) => {
      const rad = { datum: jobb.datum, marknad: a.marknad ?? jobb.marknad ?? 'SE', id: a.id, namn: a.namn, adset: a.adset ?? null, adset_id: a.adset_id ?? null, d0: a.d0 ?? null, status: a.effective_status ?? null, fonster: a.fonster ?? 'last_14d' };
      for (const f of MATFALT) rad[f] = a[f] ?? null;
      return rad;
    });
}

export function lasMatningar(fil = MATNINGSFIL) {
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}

/** Lägger avläsningens rader i matningar.jsonl — en gång per annons och dag. */
export function laggTillMatningar(jobb, fil = MATNINGSFIL) {
  const finns = new Set(lasMatningar(fil).map((r) => `${r.datum}|${r.id}`));
  const nya = matningsrader(jobb).filter((r) => !finns.has(`${r.datum}|${r.id}`));
  if (!nya.length) return 0;
  mkdirSync(dirname(fil), { recursive: true });
  appendFileSync(fil, nya.map((r) => JSON.stringify(r)).join('\n') + '\n');
  return nya.length;
}

/** VARIABELTAGGAR-raden ur en brief.md, eller {} om filen saknas. */
export async function lasTaggar(briefFil, repoRot = join(ROT, '..')) {
  if (!briefFil) return {};
  const fil = join(repoRot, briefFil);
  if (!existsSync(fil)) return {};
  const { taggarUr } = await import('../tools/briefgranskning.mjs');
  return taggarUr(readFileSync(fil, 'utf8'))?.taggar ?? {};
}

/** Vem som syns i bild (konfig.kreatorer). Ordningen: annonsens eget namn,
 *  briefens `kreator`/`talare`, förälderns namn för en omklippning av förälderns
 *  råfil. null = okänt. Ren. */
export function kreatorFor(namn, { brief = null, taggar = {}, foralder = null } = {}, konfig) {
  const lista = Object.entries(konfig.kreatorer ?? {}).filter(([k]) => k !== 'comment');
  const traff = (text) => {
    const s = String(text ?? '').toLowerCase();
    if (!s) return null;
    for (const [kreator, ord] of lista) if (ord.some((o) => s.includes(String(o).toLowerCase()))) return kreator;
    return null;
  };
  return traff(namn) ?? traff(brief?.kreator) ?? traff(taggar.talare) ?? traff(foralder) ?? null;
}

/** Arkivet. Ren — all I/O görs av anroparen.
 *  logg: alla loggrader · matningar: alla mätrader · taggar: Map annonsnamn → VARIABELTAGGAR */
export function byggArkiv({ konfig, logg = [], matningar = [], taggar = new Map(), idag }) {
  const omdopt = logg.filter((r) => r.kod === 'OMDOPT');
  const nyttNamn = new Map(omdopt.map((o) => [o.fran, o.till]));
  const etikettrader = logg.filter((r) => r.kod === 'ETIKETT');
  const galler = gallandeEtiketter(etikettrader);
  const briefer = logg.filter((r) => r.kod === 'BRIEF').map((b) => ({ ...b, annons: nyttNamn.get(b.annons) ?? b.annons }));
  const briefPer = new Map(briefer.map((b) => [b.annons, b]));
  const uppladdad = new Map(logg.filter((r) => r.kod === 'UPPLADDAD').map((r) => [r.annons, r]));
  const lardomPer = new Map(logg.filter((r) => r.kod === 'LARDOM' && r.annons).map((r) => [r.annons, r.id ?? `L-${r.annons}`]));
  // 3:2:2 (2026-10-02): domen per adset (dom.mjs, loggad som ADSET_DOM av
  // --dom-alla --logga) och testadseten uppladdaren byggt (ADSET_SKAPAD).
  const adsetDom = new Map();
  for (const r of logg.filter((x) => x.kod === 'ADSET_DOM' && x.adset_id)) {
    const nu = adsetDom.get(r.adset_id);
    if (!nu || String(r.datum) >= String(nu.datum)) adsetDom.set(r.adset_id, r);
  }
  const adsetSkapad = new Map(logg.filter((r) => r.kod === 'ADSET_SKAPAD' && r.adset_id).map((r) => [r.adset_id, r]));

  // Senaste mätningen per annons, och den högsta 14-dagarsspenden den haft.
  const senast = new Map();
  const topp = new Map();
  for (const m of matningar) {
    const nu = senast.get(m.namn);
    if (!nu || m.datum >= nu.datum) senast.set(m.namn, m);
    if ((m.spend_sek ?? 0) > (topp.get(m.namn)?.spend_sek ?? -1)) topp.set(m.namn, m);
  }

  let bryt = null;
  try { bryt = brytpunkter(konfig); } catch { bryt = null; }

  const namnen = new Set([...galler.keys(), ...uppladdad.keys(), ...briefPer.keys(), ...senast.keys()]);
  const kanda = [...namnen];
  const annonser = [];
  for (const namn of [...namnen].sort()) {
    const t = tolka(namn);
    const brief = briefPer.get(namn) ?? null;
    const tg = taggar.get(namn) ?? {};
    const foralderTxt = t?.foralder ? foralderNamn(t.foralder, kanda, konfig) : (brief?.parent && brief.parent !== 'ingen' ? brief.parent : null);
    const typ = t?.typ ?? (brief?.brieftyp === 'I' ? 'ITER' : brief?.brieftyp === 'IM' ? 'IMIT' : brief?.brieftyp === 'N' ? 'IDEA' : null);
    const m = senast.get(namn) ?? null;
    const sv = (m?.marknad ?? t?.land ?? 'SE') === 'SE';
    const vb = m && sv && bryt ? vinstbidrag({ namn, kop: m.kop, spend_sek: m.spend_sek, roas: m.roas }, bryt) : null;
    const etik = etikettrader.filter((r) => r.annons === namn).map((r) => ({ vecka: r.vecka ?? 1, etikett: r.etikett, datum: r.datum }));
    annonser.push({
      namn,
      id: m?.id ?? uppladdad.get(namn)?.annons_id ?? null,
      marknad: m?.marknad ?? t?.land ?? 'SE',
      vinkel: t?.vinkel ?? tg.vinkel ?? null,
      format: t?.format ?? null,
      lopnummer: t?.nummer ?? null,
      hook: t?.hook ?? null,
      version: t?.version ?? null,
      typ: typ ?? 'okänd',
      koncept: brief?.koncept ?? tg.koncept ?? null,
      foralder: foralderTxt,
      iteration: t?.iteration ?? (brief?.iteration ? Number(brief.iteration) : null),
      playbook: brief?.playbook ?? tg.playbook ?? null,
      kalla: brief?.kalla ?? tg.kalla ?? null,
      kreator: kreatorFor(namn, { brief, taggar: tg, foralder: foralderTxt }, konfig),
      komponenter: { avatar: tg.avatar ?? null, awareness: tg.awareness ?? null, begar: tg.begar ?? null, mekanism: tg.mekanism ?? null, tro: tg.tro ?? null, urgency: tg.urgency ?? null, positionering: tg.positionering ?? null, valens: tg.valens ?? null, hook_typ: tg['hook-typ'] ?? null },
      batch: brief?.batch ?? null,
      brief: brief?.notion_url ?? null,
      adset: m?.adset ?? uppladdad.get(namn)?.adset ?? null,
      adset_id: m?.adset_id ?? uppladdad.get(namn)?.adset_id ?? null,
      adset_roll: adsetDom.get(m?.adset_id ?? uppladdad.get(namn)?.adset_id ?? '')?.roll ?? (adsetSkapad.has(uppladdad.get(namn)?.adset_id ?? '') ? 'test' : null),
      adset_dom: adsetDom.get(m?.adset_id ?? uppladdad.get(namn)?.adset_id ?? '')?.dom ?? null,
      d0: m?.d0 ?? null,
      status: m?.status ?? null,
      etikett: galler.get(namn)?.etikett ?? null,
      etiketter: etik,
      lardom: lardomPer.get(namn) ?? null,
      senaste_matning: m ? Object.fromEntries(['datum', ...MATFALT].map((f) => [f, m[f] ?? null])) : null,
      hogsta_14d_spend_sek: topp.get(namn)?.spend_sek ?? null,
      vinstbidrag_14d_sek: vb ? vb.vinstbidrag_sek : null,
      vinstbidrag_orsak: vb ? null : (!m ? 'ingen mätning med spend' : !sv ? 'break-even per marknad saknas (cogs.json)' : 'break-even saknas'),
    });
  }

  // Varianter per löpnummer (hookvarianter + versioner av samma annons).
  const perNummer = {};
  for (const a of annonser) {
    if (a.lopnummer === null || a.marknad !== 'SE') continue;
    const k = String(a.lopnummer).padStart(3, '0');
    (perNummer[k] ??= []).push(a.namn);
  }
  const varianter = Object.entries(perNummer).filter(([, l]) => l.length > 1).map(([nr, l]) => ({ lopnummer: nr, antal: l.length, namn: l })).sort((a, b) => b.antal - a.antal);

  // Kedjor: förälder → barn (iterationer), med etikett.
  const kedjor = {};
  for (const a of annonser) {
    if (!a.foralder) continue;
    (kedjor[a.foralder] ??= { foralder: a.foralder, foralder_etikett: galler.get(a.foralder)?.etikett ?? null, barn: [] }).barn.push({ namn: a.namn, iteration: a.iteration, playbook: a.playbook, etikett: a.etikett });
  }

  // Koncept: antal iterationer och taket (lardom.mjs konceptStatus).
  const koncepten = [...new Set(briefer.map((b) => b.koncept).filter(Boolean))].sort();
  const koncept = koncepten.map((k) => {
    const rader = briefer.filter((b) => b.koncept === k);
    const s = konceptStatus(k, rader, etikettrader, { kalla: rader[0]?.kalla ?? null });
    return { koncept: k, briefer: rader.length, med_utfall: s.med_utfall, foralder: s.foralder, beslut: s.beslut, motivering: s.motivering };
  });

  // Per variabel (ANALYSMETOD 6b): etiketterna över tid + senaste 14 dagarna.
  const dimensioner = ['typ', 'vinkel', 'format', 'kreator', 'marknad', 'kalla', 'playbook'];
  const perVariabel = {};
  for (const d of dimensioner) {
    const grupper = {};
    for (const a of annonser) {
      const v = a[d] ?? 'okänd';
      const g = (grupper[v] ??= { annonser: 0, etiketter: {}, spend_14d_sek: 0, kop_14d: 0, vinstbidrag_14d_sek: 0, _lista: [] });
      g.annonser++;
      if (a.etikett) g.etiketter[a.etikett] = (g.etiketter[a.etikett] ?? 0) + 1;
      g._lista.push({ etikett: a.etikett });
      g.spend_14d_sek += a.senaste_matning?.spend_sek ?? 0;
      g.kop_14d += a.senaste_matning?.kop ?? 0;
      g.vinstbidrag_14d_sek += a.vinstbidrag_14d_sek ?? 0;
    }
    for (const g of Object.values(grupper)) {
      const h = hitRate(g._lista.filter((x) => x.etikett).map((x) => ({ etikett: x.etikett })));
      g.hit_rate = h.text;
      g.hit_kort = h.alla ? `${h.traff}/${h.alla} · ${h.traff}/${h.levererade} med leverans` : '—';
      g.spend_14d_sek = r0(g.spend_14d_sek);
      g.vinstbidrag_14d_sek = r0(g.vinstbidrag_14d_sek);
      delete g._lista;
    }
    perVariabel[d] = grupper;
  }

  // Adseten: testadseten uppladdaren byggt + varje adset kungen dömt, med sina
  // annonser. Det är 3:2:2-arkivet — beslutet fattas här, inte per annons.
  const adsetIds = new Set([...adsetSkapad.keys(), ...adsetDom.keys()]);
  const adsets = [...adsetIds].map((id) => {
    const d = adsetDom.get(id) ?? null;
    const sk = adsetSkapad.get(id) ?? null;
    return {
      adset_id: id,
      adset: d?.adset ?? sk?.adset_namn ?? null,
      roll: d?.roll ?? (sk ? 'test' : null),
      skapad: sk?.datum ?? null,
      koncept: sk?.koncept ?? null,
      dom: d?.dom ?? null,
      dom_datum: d?.datum ?? null,
      dagar: d?.dagar ?? null,
      spend_sek: d?.spend_sek ?? null,
      kop: d?.kop ?? null,
      roas: d?.roas ?? null,
      andel: d?.andel ?? null,
      annonser: annonser.filter((a) => a.adset_id === id).map((a) => a.namn),
    };
  }).sort((x, y) => (y.spend_sek ?? 0) - (x.spend_sek ?? 0));

  const etiketterade = annonser.filter((a) => a.etikett).map((a) => ({ etikett: a.etikett }));
  return {
    skrivet: idag,
    kalla: 'matstrumpor/arkiv.mjs — logg.jsonl + arkiv/matningar.jsonl + VARIABELTAGGAR i brief.md. Siffrorna ur Meta via --hamta, etiketterna ur etikett.mjs, vinstbidraget ur ekonomi.mjs (bara Sverige; break-even per marknad saknas).',
    annonser_totalt: annonser.length,
    etiketterade: etiketterade.length,
    hit_rate: hitRate(etiketterade).text,
    breakthroughs: annonser.filter((a) => a.etikett === ETIKETT.BREAKTHROUGH).map((a) => a.namn),
    per_variabel: perVariabel,
    koncept,
    kedjor: Object.values(kedjor),
    varianter,
    adsets,
    annonser,
  };
}

/** arkiv.md — det Axel läser. Svenska, korta tabeller. Ren. */
export function arkivMarkdown(a) {
  const ut = [];
  ut.push('# Matstrumpors arkiv: allt vi testat', '');
  ut.push(`Byggt ${a.skrivet} av \`node matstrumpor/kor.mjs --arkiv\` — skriv aldrig i den här filen för hand, den byggs om varje rond.`, '');
  ut.push(`**${a.annonser_totalt} annonser**, ${a.etiketterade} med etikett. Hit rate (breakthrough + spend winner): ${a.hit_rate}.`, '');
  ut.push(`Breakthroughs: ${a.breakthroughs.length ? a.breakthroughs.join(', ') : 'inga'}.`, '');
  const tabell = (rubrik, grupper) => {
    ut.push(`## Per ${rubrik}`, '', '| Värde | Annonser | Etiketter | Hit rate | Spend 14 d | Köp 14 d | Vinstbidrag 14 d |', '|---|---|---|---|---|---|---|');
    for (const [v, g] of Object.entries(grupper).sort((x, y) => y[1].spend_14d_sek - x[1].spend_14d_sek)) {
      const et = Object.entries(g.etiketter).sort((x, y) => (RANG[y[0]] ?? -1) - (RANG[x[0]] ?? -1)).map(([e, n]) => `${e} ${n}`).join(', ') || '—';
      ut.push(`| ${v === 'okänd' ? 'okänd (före namnregeln)' : v} | ${g.annonser} | ${et} | ${g.hit_kort ?? g.hit_rate} | ${g.spend_14d_sek} kr | ${g.kop_14d} | ${g.vinstbidrag_14d_sek} kr |`);
    }
    ut.push('');
  };
  tabell('typ (IDEA = ny idé, ITER = iteration, IMIT = imitation)', a.per_variabel.typ);
  tabell('kreatör', a.per_variabel.kreator);
  tabell('vinkel', a.per_variabel.vinkel);
  tabell('format', a.per_variabel.format);
  tabell('marknad', a.per_variabel.marknad);
  tabell('iteration ur playbooken', a.per_variabel.playbook);
  ut.push('## Adseten (3:2:2: domen per adset, aldrig per annons)', '');
  if (!(a.adsets ?? []).length) ut.push('Inga adsets dömda än — första domen kommer i kungens nästa rond (`--dom-alla --logga`).', '');
  else {
    ut.push('| Adset | Roll | Dom | Dömd | Dag | Spend | Köp | ROAS | Andel | Annonser |', '|---|---|---|---|---|---|---|---|---|---|');
    for (const x of a.adsets) ut.push(`| ${x.adset ?? x.adset_id} | ${x.roll ?? '—'} | ${x.dom ?? '—'} | ${x.dom_datum ?? '—'} | ${x.dagar ?? '—'} | ${x.spend_sek ?? '—'} kr | ${x.kop ?? '—'} | ${x.roas ?? '—'} | ${x.andel === null || x.andel === undefined ? '—' : `${Math.round(x.andel * 100)} %`} | ${x.annonser.length} |`);
    ut.push('');
  }
  ut.push('## Koncepten och taket (tre försök med utfall)', '', '| Koncept | Briefer | Med utfall | Förälderns etikett | Beslut | Varför |', '|---|---|---|---|---|---|');
  for (const k of a.koncept) ut.push(`| ${k.koncept} | ${k.briefer} | ${k.med_utfall} | ${k.foralder} | ${k.beslut} | ${k.motivering} |`);
  ut.push('', '## Kedjorna: förälder och iterationer', '');
  for (const k of a.kedjor) {
    ut.push(`- **${k.foralder}** (${k.foralder_etikett ?? 'ingen etikett'}): ${k.barn.length} iterationer`);
    for (const b of k.barn.sort((x, y) => (x.iteration ?? 0) - (y.iteration ?? 0))) ut.push(`  - ${b.iteration ? `#${b.iteration} ` : ''}${b.namn}${b.playbook ? ` · ${b.playbook}` : ''} · ${b.etikett ?? 'ingen etikett än'}`);
  }
  ut.push('', '## Varianter av samma annons (hookar och versioner)', '');
  for (const v of a.varianter) ut.push(`- ${v.lopnummer}: ${v.antal} varianter`);
  ut.push('');
  return ut.join('\n');
}

const r0 = (v) => Math.round(v);
