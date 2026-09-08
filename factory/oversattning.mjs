// Översättningsunderlaget: ALLA kundsynliga strängar butiken bär, med
// stabila nycklar, så en subagent kan översätta dem och marknader.mjs
// registrera dem via translationsRegister — utan att någon läser Shopify.
//
//   node factory/oversattning.mjs factory/butiker/<butik>.yaml factory/produkter/<id>.yaml
//
// Skriver factory/output/<id>/oversattning-sv.json (källan). Översättningen
// levereras som oversattning-<locale>.json med EXAKT samma nycklar; en
// nyckel som saknas i översättningen registreras inte (svenskan syns då
// på /nb — trippelkollen fångar det). Nycklarna är resursvägar:
//   produkt.title, produkt.body_html, metafalt.opf.<key>, sida.<handle>.title|body,
//   meny.<handle>.<i>, index.<sektion>.<block>.<setting>, header.…, footer.…,
//   paket.<handle>.<falt>, bonus.title|body_html
// Ren logik utan nätverk.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { sammanfoga } from './butik.mjs';
import { byggMetafalt } from './metafalt.mjs';
import { byggPolicyer, kontaktsida } from './policyer.mjs';
import { byggKortBeskrivning, kundUnderrubrik } from './sida.mjs';
import { byggIndex, byggHeaderGroup, byggFooterGroup, trustPunkter, uspPunkter } from './tema-mall.mjs';
import { byggPaketplan } from './paket.mjs';
import { byggBonusBeskrivning } from './bonus.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);

// Plockar ut varje textinställning ur en JSON-mall (index/header/footer) —
// samma nycklar som Shopify använder i translatableContent för temafiler:
// sections.<id>.blocks.<bid>.settings.<key> / sections.<id>.settings.<key>.
function malltexter(prefix, mallJson) {
  const mall = typeof mallJson === 'string' ? JSON.parse(mallJson) : mallJson;
  const ut = {};
  const HOPPA = new Set(['custom_liquid', 'image', 'product', 'menu', 'link', 'button_link', 'button_link_1', 'button_link_2', 'icon', 'color_scheme', 'section_color_scheme']);
  for (const [sid, sek] of Object.entries(mall.sections ?? {})) {
    for (const [k, v] of Object.entries(sek.settings ?? {})) {
      if (typeof v === 'string' && v.trim() && !HOPPA.has(k) && !v.startsWith('shopify://')) ut[`${prefix}.sections.${sid}.settings.${k}`] = v;
    }
    for (const [bid, block] of Object.entries(sek.blocks ?? {})) {
      for (const [k, v] of Object.entries(block.settings ?? {})) {
        if (typeof v === 'string' && v.trim() && !HOPPA.has(k) && !v.startsWith('shopify://') && !v.startsWith('{{')) ut[`${prefix}.sections.${sid}.blocks.${bid}.settings.${k}`] = v;
      }
    }
  }
  return ut;
}

export function byggUnderlag(butik, rap) {
  const p = sammanfoga(butik, rap);
  const ut = {};

  ut['produkt.title'] = p.produkt.namn;
  ut['produkt.body_html'] = byggKortBeskrivning(p);
  ut['produkt.meta_title'] = `${p.produkt.namn} – ${p.brand.namn}`.slice(0, 70);
  ut['produkt.variant.Grön'] = lista(p.varianter)[0]?.namn ?? '';
  ut['produkt.underrubrik'] = kundUnderrubrik(p.vinkel);
  for (const m of byggMetafalt(p, { kundUnderrubrik })) {
    if (m.type === 'url') continue;
    ut[`metafalt.opf.${m.key}`] = m.value;
  }
  for (const s of byggPolicyer(p)) {
    ut[`sida.${s.handle}.title`] = s.namn;
    ut[`sida.${s.handle}.body`] = s.body;
  }
  ut['sida.contact.title'] = 'Kontakt';
  ut['sida.contact.body'] = kontaktsida(p);
  ut['meny.main-menu.0'] = 'Hem';
  ut['meny.main-menu.1'] = p.produkt.namn.split(/\s[–-]\s/)[0];
  ut['meny.main-menu.2'] = 'Kontakt';
  byggPolicyer(p).forEach((s, i) => { ut[`meny.footer.${i}`] = s.namn; });
  ut[`meny.footer.${byggPolicyer(p).length}`] = 'Kontakt';

  Object.assign(ut, malltexter('index', byggIndex(butik, p)));
  const tomHeader = { sections: { 'announcement-bar': { type: 'announcement-bar', blocks: {}, settings: {} }, header: { type: 'header', settings: {} } }, order: [] };
  Object.assign(ut, malltexter('header', byggHeaderGroup(JSON.stringify(tomHeader), butik, p)));
  const tomFooter = { sections: { footer: { type: 'footer', blocks: { foretaget: { type: 'text', settings: {} } }, settings: {} } }, order: [] };
  Object.assign(ut, malltexter('footer', byggFooterGroup(JSON.stringify(tomFooter), butik)));
  // Temats fasta strängar som inte kommer ur konfigen (sidfotens rubriker,
  // Dela-knappen) — kunden ser dem, så de ska med i underlaget.
  ut['tema.footer.snabblankar'] = 'Snabblänkar';
  ut['tema.footer.information'] = 'Information';
  ut['tema.footer.nyhetsbrev'] = 'Missa inga nyheter';
  ut['tema.share'] = 'Dela';
  // custom_liquid-block översätts inte av Shopify — texterna locale-branchas i
  // temat. De står här ändå så subagenten ger oss orden till Liquid-grenen.
  trustPunkter(butik).forEach((x, i) => { ut[`liquid.trust.${i}`] = x.split(':').slice(1).join(':'); });
  ut['liquid.delivery.text'] = 'Beräknad leverans';

  if (p.offer?.paket?.nivaer) {
    for (const post of byggPaketplan(p).poster) {
      ut[`paket.${post.handle}.rubrik`] = post.rubrik;
      if (post.underrubrik) ut[`paket.${post.handle}.underrubrik`] = post.underrubrik;
      if (post.bricka) ut[`paket.${post.handle}.bricka`] = post.bricka;
      if (post.gratisAntal > 0 && post.gratisText) ut[`paket.${post.handle}.gratis_text`] = post.gratisText;
    }
  }
  const bonus = p.offer?.bonus_produkt;
  if (bonus?.titel) {
    ut['bonus.title'] = bonus.titel;
    // Samma text som bonus.mjs skriver: garantin ur RÅA produktfilen (inte
    // den sammanfogade), annars matchar inte värdet i butiken.
    ut['bonus.body_html'] = byggBonusBeskrivning(bonus, lista(rap.garantier)[0]);
    ut['bonus.meta_title'] = `${bonus.titel} – ${p.brand.namn}`.slice(0, 70);
  }
  // Recensionerna: en delmängd översätts och importeras som EGNA norska
  // recensioner med norska namn (PROCESS.md fas 3) — subagenten får dem här.
  lista(p.reviews).slice(0, 6).forEach((r, i) => {
    ut[`recension.${i}.titel`] = r.titel ?? '';
    ut[`recension.${i}.text`] = r.text ?? '';
  });
  return ut;
}

async function huvud() {
  const [butiksfil, produktfil] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!butiksfil || !produktfil) {
    console.error('Användning: node factory/oversattning.mjs factory/butiker/<butik>.yaml factory/produkter/<id>.yaml');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const rap = lasYaml(readFileSync(produktfil, 'utf8'));
  const ut = byggUnderlag(butik, rap);
  const mapp = join(FACTORY_ROT, 'output', rap.produkt.id);
  mkdirSync(mapp, { recursive: true });
  const fil = join(mapp, 'oversattning-sv.json');
  writeFileSync(fil, `${JSON.stringify(ut, null, 2)}\n`);
  console.log(`✅ ${Object.keys(ut).length} strängar → ${fil}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
