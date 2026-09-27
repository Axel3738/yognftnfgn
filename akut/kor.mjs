#!/usr/bin/env node
// akut/kor.mjs — Akutlarmet: EN körning. Mäter det som bara Axel kan påverka,
// jämför med minnet, och postar det nya i Slack #urgent (Axels beställning
// 2026-09-27: "legit akuta grejer som ingen kan påverka förutom jag … jag
// kommer att kolla den varje dag. Discorden vägrar jag kolla").
//
//   node akut/kor.mjs                 skarpt: mät → posta (nyckel i miljön) eller skriv att-posta.json → minnet
//   node akut/kor.mjs --torr          mät och visa, skriv ingenting
//   node akut/kor.mjs --json          samma, maskinläsbart på stdout
//   node akut/kor.mjs --dagligt       tvinga de dagliga kontrollerna (tvister, utbetalningar)
//   node akut/kor.mjs --postat m1 m2  kvittera meddelanden som sessionen postat via Slack-connectorn
//   node akut/kor.mjs --postat alla   kvittera alla i akut/output/att-posta.json
//
// Vad som mäts (kontroller.mjs har reglerna, konfig.json trösklarna):
//   butikerna svarar · annonskontona är aktiva och under taket · pengar brinner
//   i dag · pixeln ser köpen · stonebite.org + kundtjänstboten · rutinerna kör ·
//   Meta-/Notion-/Shopify-nycklarna lever · chargeback-graden · utbetalningarna
//
// Minnet (akut/data/larm.json) committas: ett larm postas EN gång, ett tillstånd
// får "✅ Löst" när det är över. Det som inte kunde mätas står som notering i
// rapporten — aldrig som "allt är lugnt".

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasYaml } from '../factory/yaml.mjs';
import { rutinlage } from '../stonebite/kallor/rutiner.mjs';
import { upptackButiker, hamtaAllaTvister } from '../stonebite/kallor/shopify.mjs';
import { domAllt, verksamhetForButik, stockholmTimme, klockan, VERKSAMHETSNAMN } from './kontroller.mjs';
import { grupperaMeddelanden } from './text.mjs';
import { hamtaSajter, hamtaMetaKonton, hamtaHalsa, kollaNotion, hamtaUtbetalningar } from './hamta.mjs';
import { slackVag, postaSlack } from './slack.mjs';
import { lasMinne, sparaMinne, rensa, redanPostat, olosta, markeraPostat, markeraLost, butikerIDrift, slaIhopButiker } from './minne.mjs';

export const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const UTDATA = (rot = ROT) => join(rot, 'akut', 'output');
export const ATT_POSTA = (rot = ROT) => join(UTDATA(rot), 'att-posta.json');

export function lasKonfig(rot = ROT) {
  return JSON.parse(readFileSync(join(rot, 'akut', 'konfig.json'), 'utf8'));
}
export function lasSnapshot(rot = ROT) {
  const fil = join(rot, 'stonebite', 'data', 'snapshot.json');
  if (!existsSync(fil)) return null;
  try { return JSON.parse(readFileSync(fil, 'utf8')); } catch { return null; }
}
export function lasVarumarken(rot = ROT) {
  try { return JSON.parse(readFileSync(join(rot, 'stonebite', 'varumarken.json'), 'utf8')).varumarken ?? []; } catch { return []; }
}

/** Marknadsdomäner ur factory/butiker/<id>.yaml (CaraShell: carashell.com för USA). Tom lista utan fil. */
export function marknadsdomaner(rot, butikId) {
  const fil = join(rot, 'factory', 'butiker', `${butikId}.yaml`);
  if (!existsSync(fil)) return [];
  try {
    const b = lasYaml(readFileSync(fil, 'utf8'))?.butik ?? {};
    return (b.marknader ?? []).filter((m) => m?.doman).map((m) => ({ land: String(m.land ?? '').toUpperCase(), url: `https://${String(m.doman).replace(/^https?:\/\//, '').replace(/\/$/, '')}` }));
  } catch { return []; }
}

/** Annonskontona ur varumarken.json, ett per id (delade konton står under flera varumärken). */
export function annonskontonUr(varumarken = []) {
  const ut = new Map();
  for (const vm of varumarken) {
    for (const k of vm.konton ?? []) {
      const id = String(k.id);
      if (!ut.has(id)) ut.set(id, { id, namn: k.namn ?? id, verksamhet: vm.id });
    }
  }
  return [...ut.values()];
}

/** Sajterna som mäts: butiker i drift (+ deras marknadsdomäner) + konfig.sajter_extra. Ren. */
export function byggSajtlista({ iDrift = {}, konfig = {}, varumarken = [], marknader = () => [] } = {}) {
  const ut = [];
  const sedda = new Set();
  const lagg = (s) => {
    const nyckel = String(s.url).replace(/\/$/, '').toLowerCase();
    if (!s.url || sedda.has(nyckel)) return;
    sedda.add(nyckel);
    ut.push(s);
  };
  for (const [id, b] of Object.entries(iDrift)) {
    const verksamhet = verksamhetForButik(varumarken, { id, shop: b.shop }) ?? null;
    if (b.url) lagg({ id, namn: b.namn ?? id, url: b.url, verksamhet });
    for (const m of marknader(id)) lagg({ id: `${id}-${m.land.toLowerCase()}`, namn: `${b.namn ?? id} (${m.land})`, url: m.url, verksamhet });
  }
  for (const s of konfig.sajter_extra ?? []) lagg({ id: s.id, namn: s.namn, url: s.url, verksamhet: s.verksamhet ?? null });
  return ut;
}

function skrivJson(fil, data) {
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, `${JSON.stringify(data, null, 1)}\n`);
}

/**
 * Hela körningen. `hamtare` och `posta` byts ut i tester. Svarar med allt
 * rapporten behöver; skriver minnet och att-posta.json om inte torr.
 */
export async function korAkut({
  rot = ROT, env = process.env, nu = new Date(), torr = false, dagligt = null, posta = null, hamtare = {}, logg = () => {},
} = {}) {
  const konfig = lasKonfig(rot);
  const trosklar = { ...konfig.trosklar };
  const varumarken = lasVarumarken(rot);
  const snapshot = lasSnapshot(rot);
  const minne = lasMinne(rot);
  const noteringar = [];
  if (!snapshot) noteringar.push('stonebite/data/snapshot.json saknas — butiker, ordrar och pixelkollen kan inte mätas (kör /stonebite)');
  const butiker = snapshot?.butiker ?? [];
  const snapshotAlder = snapshot?.byggd ? Math.round((nu.getTime() - Date.parse(snapshot.byggd)) / 60_000) : null;
  if (snapshotAlder !== null && snapshotAlder > 180) noteringar.push(`snapshoten är ${Math.round(snapshotAlder / 60)} h gammal (byggd ${snapshot.byggd}) — ordrar och butiksläge är från då`);

  // Butiker i drift: snapshotens (ordrar senaste 7 dygnen) + minnets (14 dagar).
  const iDrift = slaIhopButiker(minne.butiker, butikerIDrift(butiker, { byggd: snapshot?.byggd ?? null, nu, minOrdrar: trosklar.butik_i_drift_ordrar_7d ?? 1 }), { nu, dagar: trosklar.butik_i_drift_minne_dagar ?? 14 });
  const sajter = byggSajtlista({ iDrift, konfig, varumarken, marknader: (id) => marknadsdomaner(rot, id) });
  const konton = annonskontonUr(varumarken);
  const korDagligt = dagligt ?? (stockholmTimme(nu) === Number(konfig.dagliga_kontroller_timme ?? 7));

  const h = {
    sajter: hamtare.sajter ?? ((lista) => hamtaSajter(lista, { forsok: trosklar.sajt_forsok, pausMs: trosklar.sajt_paus_ms, timeout: trosklar.sajt_timeout_ms })),
    meta: hamtare.meta ?? ((lista) => (env.META_ACCESS_TOKEN ? hamtaMetaKonton(lista, { env, logg }) : Promise.resolve(null))),
    halsa: hamtare.halsa ?? ((k) => hamtaHalsa(k, { timeout: trosklar.sajt_timeout_ms })),
    notion: hamtare.notion ?? (() => kollaNotion({ env })),
    rutiner: hamtare.rutiner ?? ((r) => rutinlage(r, { nu })),
    upptack: hamtare.upptack ?? ((r) => upptackButiker(r, env)),
    tvister: hamtare.tvister ?? ((lista) => hamtaAllaTvister(lista, { env, nu, logg })),
    utbetalningar: hamtare.utbetalningar ?? ((lista) => hamtaUtbetalningar(lista, { env, logg, verksamhetFor: (b) => verksamhetForButik(varumarken, b) })),
  };

  logg(`Akutlarmet ${klockan(nu)} svensk tid — ${sajter.length} sajter, ${konton.length} annonskonton${korDagligt ? ', dagliga kontroller' : ''}`);
  const [sajtsvar, metasvar, halsa, notion] = await Promise.all([
    h.sajter(sajter).catch((e) => { noteringar.push(`sajtkollen kraschade: ${e.message}`); return []; }),
    h.meta(konton).catch((e) => { noteringar.push(`Meta gick inte att läsa: ${e.message}`); return null; }),
    h.halsa(konfig.halsa).catch((e) => { noteringar.push(`/halsa gick inte att läsa: ${e.message}`); return null; }),
    h.notion().catch((e) => ({ status: null, fel: e.message })),
  ]);
  if (metasvar === null && !noteringar.some((n) => n.startsWith('Meta'))) noteringar.push('META_ACCESS_TOKEN saknas i miljön — annonskonton, pengar och pixel mäts inte');
  for (const k of metasvar ?? []) if (k.fel && Number(k.fel.kod) !== 190) noteringar.push(`Meta ${k.namn} (${k.id}) inte mätt: ${k.fel.message}`);
  for (const s of sajtsvar) if (s.resultat?.ok) logg(`  ${s.url}: ${s.resultat.status} på försök ${s.resultat.forsok}`); else logg(`  ${s.url}: ${s.resultat?.status ?? s.resultat?.fel} (${s.resultat?.forsok} försök)`);

  let rutiner = null;
  try { rutiner = h.rutiner(rot); } catch (e) { noteringar.push(`rutinvakten kraschade: ${e.message}`); }

  let tvister = null;
  let utbetalningar = [];
  if (korDagligt) {
    let upptackta = [];
    try { upptackta = h.upptack(rot).filter((b) => !b.av); } catch (e) { noteringar.push(`butikerna gick inte att upptäcka: ${e.message}`); }
    try { tvister = await h.tvister(upptackta); } catch (e) { noteringar.push(`tvisterna gick inte att läsa: ${e.message}`); }
    try { utbetalningar = await h.utbetalningar(upptackta); } catch (e) { noteringar.push(`utbetalningarna gick inte att läsa: ${e.message}`); }
    for (const u of utbetalningar) if (u.status !== 'ok') logg(`  utbetalningar ${u.id}: hoppad — ${u.orsak}`);
  }

  const dom = domAllt({ sajter: sajtsvar, konton: metasvar ?? [], butiker, halsa, rutiner, notion, tvister, utbetalningar },
    { nu, trosklar, varumarken, rutinkonton: konfig.rutinkonton ?? {}, minne, dagligt: korDagligt });
  noteringar.push(...dom.noteringar);
  // Avstängda larmtyper (konfig.kontroller_av): mäts, men postas aldrig.
  const avstangda = new Set(konfig.kontroller_av ?? []);
  if (avstangda.size) {
    const bort = dom.larm.filter((l) => avstangda.has(l.typ));
    dom.larm = dom.larm.filter((l) => !avstangda.has(l.typ));
    if (bort.length) noteringar.push(`${bort.length} larm av avstängd typ (${[...new Set(bort.map((l) => l.typ))].join(', ')}) postas inte — kontroller_av i akut/konfig.json`);
  }

  // Nytt = inte redan postat (tillstånd: inte olöst; händelse: inte alls).
  // Löst = ett postat tillstånd vars nyckel den här körningen mätte som frisk.
  const nya = dom.larm.filter((l) => !redanPostat(minne.skickade, l));
  const redan = dom.larm.length - nya.length;
  const losta = olosta(minne.skickade).filter((s) => dom.friska.has(s.nyckel));
  const meddelanden = grupperaMeddelanden(nya, losta, { nu });

  const sammanfattning = {
    tid: nu.toISOString(), klockan: klockan(nu), dagligt: korDagligt,
    sajter: { matta: sajtsvar.length, svarar: sajtsvar.filter((s) => s.resultat?.ok).length },
    meta: { konton: (metasvar ?? []).length, lasta: (metasvar ?? []).filter((k) => !k.fel).length, kampanjerIdag: (metasvar ?? []).reduce((s, k) => s + (k.kampanjer?.length ?? 0), 0) },
    backend: halsa?.svar?.ok ? `ok, autosvar ${halsa.svar.json?.autosvar?.kor ? 'kör' : 'av'} (${halsa.svar.json?.autosvar?.omstarter ?? '?'} omstarter)` : `inte ok (${halsa?.svar?.status ?? halsa?.svar?.fel ?? 'inget svar'})`,
    rutiner: rutiner?.summering ?? null,
    notion: notion?.status === 200 ? 'ok' : `${notion?.status ?? notion?.fel ?? '?'}`,
    larm: { totalt: dom.larm.length, nya: nya.length, redan, losta: losta.length, meddelanden: meddelanden.length },
    noteringar,
  };

  const resultat = { sammanfattning, larm: dom.larm, nya, losta, meddelanden, postade: [], fel: [], attPosta: [], torr };
  if (torr) return resultat;

  // Posta: injicerad postare, annars nyckeln i miljön, annars sessionen via connectorn.
  const postare = posta ?? (slackVag(env) ? (m) => postaSlack(m, { env, konfig }) : null);
  for (const m of meddelanden) {
    if (!postare) { resultat.attPosta.push(m); continue; }
    try {
      const svar = await postare(m);
      kvittera(minne, m, { nu });
      resultat.postade.push({ id: m.id, slag: m.slag, nycklar: m.nycklar, ts: svar?.ts ?? null, vag: svar?.vag ?? 'injicerad' });
      logg(`  ✅ postat ${m.id} (${m.slag}): ${m.text.split('\n')[0]}`);
    } catch (e) {
      resultat.fel.push({ id: m.id, fel: e.message });
      resultat.attPosta.push(m);
      logg(`  ❌ ${m.id}: ${e.message}`);
    }
  }

  minne.butiker = iDrift;
  minne.senasteKorning = nu.toISOString();
  minne.skickade = rensa(minne.skickade, { nu, dagar: trosklar.behall_dagar ?? 30 });
  sparaMinne(minne, rot);

  // Det sessionen ska posta med connectorn (tomt ⇒ filen tas bort, så en gammal kö aldrig postas igen).
  if (resultat.attPosta.length) skrivJson(ATT_POSTA(rot), { skapad: nu.toISOString(), kanalId: konfig.slack?.kanalId ?? null, kanal: konfig.slack?.kanal ?? null, meddelanden: resultat.attPosta });
  else if (existsSync(ATT_POSTA(rot))) rmSync(ATT_POSTA(rot));
  skrivJson(join(UTDATA(rot), 'senaste.json'), { sammanfattning, larm: dom.larm, nya: nya.map((l) => l.nyckel), losta: losta.map((l) => l.nyckel), postade: resultat.postade, fel: resultat.fel });
  return resultat;
}

/** Skriv in ett postat meddelande i minnet: nya larm som skickade, lösta som lösta. */
export function kvittera(minne, meddelande, { nu = new Date() } = {}) {
  if (meddelande.slag === 'lost') {
    for (const n of meddelande.nycklar) markeraLost(minne, n, { nu });
  } else {
    for (const p of meddelande.poster) markeraPostat(minne, p, { nu, text: meddelande.text.split('\n')[0] });
  }
  return minne;
}

/** --postat: kvittera meddelanden ur att-posta.json som sessionen postat själv. */
export function kvitteraFran({ rot = ROT, ids = [], nu = new Date() } = {}) {
  const fil = ATT_POSTA(rot);
  if (!existsSync(fil)) return { kvitterade: [], kvar: 0, orsak: 'akut/output/att-posta.json finns inte — inget att kvittera' };
  const ko = JSON.parse(readFileSync(fil, 'utf8'));
  const alla = ids.includes('alla');
  const minne = lasMinne(rot);
  const kvitterade = [];
  const kvar = [];
  for (const m of ko.meddelanden ?? []) {
    if (alla || ids.includes(m.id)) { kvittera(minne, m, { nu }); kvitterade.push(m.id); } else kvar.push(m);
  }
  sparaMinne(minne, rot);
  if (kvar.length) skrivJson(fil, { ...ko, meddelanden: kvar });
  else rmSync(fil);
  return { kvitterade, kvar: kvar.length, orsak: null };
}

// ---------------------------------------------------------------- CLI

function skrivRapport(r) {
  const s = r.sammanfattning;
  console.log(`\nAkutlarmet ${s.klockan} svensk tid${r.torr ? ' (torrt)' : ''}`);
  console.log(`  Sajter: ${s.sajter.svarar} av ${s.sajter.matta} svarar`);
  console.log(`  Meta: ${s.meta.lasta} av ${s.meta.konton} konton lästa · ${s.meta.kampanjerIdag} kampanjer med spend i dag`);
  console.log(`  Backend: ${s.backend}`);
  console.log(`  Rutiner: ${s.rutiner ? `${s.rutiner.ok} ok · ${s.rutiner.sen} sena · ${s.rutiner.saknas} saknas · ${s.rutiner.avstangd} avstängda · ${s.rutiner.omatbar} omätbara` : 'inte mätta'}`);
  console.log(`  Notion: ${s.notion}`);
  console.log(`  Dagliga kontroller (tvister, utbetalningar): ${s.dagligt ? 'körda' : 'hoppade (körs i 07-körningen eller med --dagligt)'}`);
  console.log(`  Larm: ${s.larm.nya} nya · ${s.larm.losta} lösta · ${s.larm.redan} redan postade`);
  for (const m of r.meddelanden) console.log(`\n--- ${m.id} (${m.slag}) ---\n${m.text}`);
  if (r.postade.length) console.log(`\nPostade i Slack: ${r.postade.map((p) => `${p.id} (${p.vag})`).join(', ')}`);
  if (r.attPosta.length) console.log(`\nATT POSTA via Slack-connectorn: ${r.attPosta.length} meddelanden i akut/output/att-posta.json — kvittera med: node akut/kor.mjs --postat ${r.attPosta.map((m) => m.id).join(' ')}`);
  for (const f of r.fel) console.log(`  ❌ ${f.id}: ${f.fel}`);
  for (const n of s.noteringar) console.log(`  ⚠️ ${n}`);
  if (!r.meddelanden.length) console.log('\nInget nytt att posta.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--postat');
  if (i > -1) {
    const ids = argv.slice(i + 1).filter((a) => !a.startsWith('--'));
    if (!ids.length) { console.error('Ange meddelande-id:n efter --postat (eller "alla").'); process.exit(2); }
    const r = kvitteraFran({ ids });
    console.log(r.orsak ?? `Kvitterade ${r.kvitterade.join(', ') || 'inget'} · ${r.kvar} kvar att posta.`);
    process.exit(0);
  }
  const torr = argv.includes('--torr');
  const json = argv.includes('--json');
  const dagligt = argv.includes('--dagligt') ? true : null;
  korAkut({ torr, dagligt, logg: json ? () => {} : console.log })
    .then((r) => {
      if (json) console.log(JSON.stringify({ ...r, meddelanden: r.meddelanden.map(({ poster: _, ...m }) => m) }, null, 1));
      else skrivRapport(r);
      process.exit(0);
    })
    .catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
