// Lägger kalendrarnas nya gallerier + GIF i butiken och bygger om beskrivningen i Bäverbutikens ordning.
//   node temu/kalendrar/galleri-bygg.mjs <se|no> [--skarp] [--tvinga] [id …]
//
// Underlag (skrivs av huvudsessionen från workflow-körningen 2026-09-29):
//   temu/kalendrar/galleri.json  — per kalender: bilder [{fil, alt_sv, alt_no, ai, kalla}] i ordning (första = hero),
//                                   gif {ok, fil}; filerna ligger i <SCRATCH>/advent/galleri/<id>/
//   temu/kalendrar/bullets.json  — funktionslistan med utfallet i fetstil (orden kontrollerade mot live-texten)
//
// Galleriet: planens bilder i planens ordning, GIF:en SIST (CLAUDE.md). Media som inte finns i planen tas bort —
// men bara när alla nya är READY. Idempotent på alt-text. Filerna döps till kalender-<id>-NN.jpg vid uppladdningen.
// Beskrivningen byggs om från det som ligger LIVE (inte ur copy.json) så att manuella ändringar följer med:
//   problem → GIF (annars bild 1) → lösning → bild 2 → funktioner (fetstil) + specar → bild 3 → FAQ → AI-rad → garanti.
// Garantiblocket rörs inte (SE har "Ångerrätt" sedan 2026-09-21 — Axels beslut väntar, se README).
// Har Axel redigerat galleriet själv (Canva-filnamn "Namnlosdesign…") hoppas produkten över utan --tvinga.
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const GAL = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent/galleri';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const land = process.argv[2], skarp = process.argv.includes('--skarp'), tvinga = process.argv.includes('--tvinga');
const bara = process.argv.slice(3).filter((a) => !a.startsWith('--'));
if (!['se', 'no'].includes(land)) { console.error('Användning: node temu/kalendrar/galleri-bygg.mjs <se|no> [--skarp] [--tvinga] [id …]'); process.exit(1); }
const PLAN = JSON.parse(readFileSync(path.join(HÄR, 'galleri.json'), 'utf8'));
const BULLETS = existsSync(path.join(HÄR, 'bullets.json')) ? JSON.parse(readFileSync(path.join(HÄR, 'bullets.json'), 'utf8')) : {};
const ALT = land === 'no' ? 'alt_no' : 'alt_sv';
const GIF_ALT = land === 'no' ? 'Produktet i bevegelse (AI-illustrasjon)' : 'Produkten i rörelse (AI-illustration)';
const AI_RAD = land === 'no' ? 'Livsstilsbildene og animasjonen er AI-genererte illustrasjoner.' : 'Livsstilsbilderna och animationen är AI-genererade illustrationer.';

const b = new Butik(land); const shop = await b.verifiera();
if ((land === 'se' && shop.currencyCode !== 'SEK') || (land === 'no' && shop.currencyCode !== 'NOK')) throw new Error(`Fel butik: ${shop.name}`);
console.log(`${shop.name} — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);

async function väntaMedia(pid, ids) {
  for (let i = 0; ; i++) {
    await sov(3000);
    const s = await b.fraga(`query($id:ID!){product(id:$id){media(first:50){nodes{id status alt ... on MediaImage{image{url}}}}}}`, { id: pid });
    const rel = s.product.media.nodes.filter((n) => ids.includes(n.id));
    if (rel.length === ids.length && rel.every((n) => n.status === 'READY')) return;
    if (rel.some((n) => n.status === 'FAILED')) throw new Error('media FAILED');
    if (i > 60) throw new Error('media tog för lång tid');
  }
}
async function laddaUpp(pid, filer) {   // [{fil, alt, gif, namn}]
  for (let start = 0; start < filer.length; start += 8) {
    const del = filer.slice(start, start + 8);
    const st = await b.mutera(`mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
      { input: del.map((f) => ({ filename: f.namn, mimeType: f.gif ? 'image/gif' : 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(f.fil).length) })) }, 'stagedUploadsCreate');
    for (let i = 0; i < del.length; i++) { const r = await fetch(st.stagedTargets[i].url, { method: 'PUT', headers: { 'content-type': del[i].gif ? 'image/gif' : 'image/jpeg' }, body: readFileSync(del[i].fil) }); if (!r.ok) throw new Error(`PUT ${del[i].fil}: ${r.status}`); }
    const cm = await b.mutera(`mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
      { productId: pid, media: st.stagedTargets.map((t, i) => ({ mediaContentType: 'IMAGE', originalSource: t.resourceUrl, alt: del[i].alt })) }, 'productCreateMedia');
    await väntaMedia(pid, cm.media.map((m) => m.id));
  }
}
const ren = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/[–—,:;-]/g, ' ').replace(/\s+/g, ' ').trim();
const img = (m, gif) => `<p><img src="${m.url}" alt="${esc(m.alt)}" loading="lazy" style="max-width:100%;height:auto${gif ? ';border-radius:8px' : ''}"></p>`;

for (const [id, f] of Object.entries(FAKTA)) {
  if (bara.length && !bara.includes(id)) continue;
  const plan = PLAN[id]; if (!plan) { console.log(`- ${id}: ingen plan`); continue; }
  const Q = `query($q:String!){products(first:2,query:$q){nodes{id title handle updatedAt descriptionHtml media(first:50){nodes{id alt status ... on MediaImage{image{url}}}}}}}`;
  const p = (await b.fraga(Q, { q: `sku:${f.sku}` })).products.nodes[0];
  if (!p) { console.log(`- ${id}: finns inte i ${land.toUpperCase()}`); continue; }
  const canva = p.media.nodes.filter((m) => /namnlosdesign|namnl%C3%B6sdesign|canva/i.test(m.image?.url || ''));
  if (canva.length && !tvinga) { console.log(`! ${id}: Axel har egna bilder i galleriet (${canva.length} Canva-filer) — hoppar, kör med --tvinga om han sagt till`); continue; }

  const nya = plan.bilder.map((x, i) => ({ fil: path.join(GAL, id, x.fil), alt: x[ALT], ai: x.ai, namn: `kalender-${id}-${String(i + 1).padStart(2, '0')}.jpg` }));
  // GIF:en är AI-märkt om inte planen säger ai:false (golf 2026-09-29: bildspel av riktiga foton — då egen alt och ingen AI-rad)
  const gifAi = plan.gif?.ai !== false;
  const gif = plan.gif?.ok && existsSync(path.join(GAL, id, plan.gif.fil || 'video.gif')) ? { fil: path.join(GAL, id, plan.gif.fil || 'video.gif'), alt: gifAi ? GIF_ALT : plan.gif[ALT], gif: true, namn: `kalender-${id}.gif` } : null;
  if (gif && !gif.alt) { console.log(`! ${id}: GIF utan AI saknar ${ALT}`); continue; }
  const saknasFil = [...nya, ...(gif ? [gif] : [])].filter((x) => !existsSync(x.fil));
  if (saknasFil.length) { console.log(`! ${id}: filer saknas — ${saknasFil.map((x) => x.fil).join(', ')}`); continue; }
  const dubbelAlt = nya.map((x) => x.alt).filter((a, i, all) => all.indexOf(a) !== i);
  if (dubbelAlt.length) { console.log(`! ${id}: samma alt-text två gånger (${dubbelAlt[0]}) — idempotensen kräver unika`); continue; }
  const alla = [...nya, ...(gif ? [gif] : [])];
  const attLadda = alla.filter((x) => !p.media.nodes.some((m) => m.alt === x.alt));
  const bort = p.media.nodes.filter((m) => !alla.some((x) => x.alt === m.alt));

  // bullets: bara om orden är oförändrade mot live-texten
  const h0 = p.descriptionHtml;
  const ul0 = h0.match(/<ul>([\s\S]*?)<\/ul>/);
  const liveLi = ul0 ? [...ul0[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1].trim()) : [];
  const fet = (BULLETS[id] || {})[land === 'no' ? 'no' : 'sv'];
  const fetOk = fet && fet.length === liveLi.length && fet.every((x, i) => ren(x) === ren(liveLi[i]));
  if (fet && !fetOk) console.log(`  ! ${id}: bullets.json stämmer inte ord för ord mot live-listan — behåller den gamla`);

  console.log(`${skarp ? '~' : '·'} ${id}: ${p.title}\n    ${p.media.nodes.length} befintliga → ${nya.length} bilder${gif ? ' + GIF' : ' (ingen GIF)'} · ${attLadda.length} nya · ${bort.length} tas bort · bullets ${fetOk ? 'fetstil' : 'oförändrade'}`);
  if (!skarp) continue;

  if (attLadda.length) await laddaUpp(p.id, attLadda);
  let media = (await b.fraga(`query($id:ID!){product(id:$id){media(first:50){nodes{id alt status ... on MediaImage{image{url}}}}}}`, { id: p.id })).product.media.nodes;
  const planM = alla.map((x) => media.find((m) => m.alt === x.alt));
  if (planM.some((m) => !m || m.status !== 'READY')) throw new Error(`${id}: alla planens medier är inte READY — tar inte bort något`);
  if (bort.length) await b.mutera(`mutation($productId:ID!,$mediaIds:[ID!]!){productDeleteMedia(productId:$productId,mediaIds:$mediaIds){deletedMediaIds mediaUserErrors{field message}}}`, { productId: p.id, mediaIds: bort.map((m) => m.id) }, 'productDeleteMedia');
  await sov(1500);
  media = (await b.fraga(`query($id:ID!){product(id:$id){media(first:50){nodes{id alt ... on MediaImage{image{url}}}}}}`, { id: p.id })).product.media.nodes;
  const moves = planM.map((m, i) => ({ id: m.id, newPosition: String(i) })).filter((mv, i) => media[i]?.id !== mv.id);
  if (moves.length) await b.mutera(`mutation($id:ID!,$moves:[MoveInput!]!){productReorderMedia(id:$id,moves:$moves){userErrors{field message}}}`, { id: p.id, moves }, 'productReorderMedia');
  const byAlt = (alt) => media.find((m) => m.alt === alt);
  const bildM = nya.map((x) => ({ ...byAlt(x.alt), url: byAlt(x.alt).image.url, alt: x.alt }));
  const gifM = gif ? { url: byAlt(gif.alt).image.url, alt: gif.alt } : null;

  // beskrivningen: live-HTML utan gamla bilder/AI-rad, delad på <h3>
  let h = h0.replace(/<p>\s*<img[^>]*>\s*<\/p>/g, '').replace(/<p><em>Livsstils[^<]*<\/em><\/p>/g, '');
  if (fetOk) h = h.replace(/<ul>[\s\S]*?<\/ul>/, `<ul>\n${fet.map((x) => `<li>${x}</li>`).join('\n')}\n</ul>`);
  const delar = h.split(/(?=<h3>)/).filter((s) => s.trim());
  const fi = delar.findIndex((s) => s.includes('<ul>'));
  if (delar.length < 4 || fi < 2) throw new Error(`${id}: oväntad beskrivningsstruktur (${delar.length} block, funktioner på ${fi})`);
  const A = gifM ? img(gifM, true) : img(bildM[0]);
  const B = bildM[1] ? img(bildM[1]) : '';
  const C = bildM[2] ? img(bildM[2]) : (bildM[0] ? img(bildM[0]) : '');
  const harAi = (!!gifM && gifAi) || nya.some((x) => x.ai);
  const ny = delar.map((s, i) => s + (i === 0 ? A : i === 1 ? B : i === fi ? C : '') + (i === delar.length - 2 && harAi ? `<p><em>${AI_RAD}</em></p>` : '')).join('');
  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`, { input: { id: p.id, descriptionHtml: ny } }, 'productUpdate');
  await sov(1500);
  const q = (await b.fraga(`query($id:ID!){product(id:$id){media(first:50){nodes{status alt}} descriptionHtml}}`, { id: p.id })).product;
  console.log(`    ✔ ${q.media.nodes.length} media (${q.media.nodes.filter((m) => m.status === 'READY').length} READY), ${(q.descriptionHtml.match(/<img/g) || []).length} bilder i texten`);
}
