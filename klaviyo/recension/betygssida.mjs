// Betygssidan: fem stjärnor som kunden klickar i mejlet → den här sidan tänder
// stjärnorna med en liten animation och skickar vidare till Judge.me:s formulär.
//
// Axels beställning 2026-09-27 kväll (K15): "5 stjärnor och jag kan länka på varje
// så de bara trycker på en av stjärnorna sen kommer dom till recensionsformuläret …
// en animation när man trycker på stjärnan och nån rörelse så det syns att man
// interagerar med den". Ett mejl kan inte köra skript, så rörelsen bor HÄR:
// mejlets fem stjärnor är fem länkar hit med ?s=1…5, sidan tänder stjärnorna,
// säger "Tack! N av 5." och öppnar formuläret. Utan ?s= fungerar sidan som en egen
// betygssida med fem klickbara stjärnor.
//
//   node klaviyo/recension/betygssida.mjs --brand matstrumpor            # torrt: bygger, visar vad som skulle skrivas
//   node klaviyo/recension/betygssida.mjs --brand matstrumpor --skarpt   # temafiler + sida + tillbakaläsning som kund
//   node klaviyo/recension/betygssida.mjs --brand matstrumpor --kolla    # läser bara den publika sidan
//
// Två temafiler på det publicerade temat (layout/betyg.liquid utan header/footer/
// meny men med content_for_header så pixlarna följer med, templates/page.betyg.liquid)
// och sidan /pages/<handle> med mallen "betyg" — samma mönster som listicle/butik.mjs.
// Nycklar: butikens Shopify-app via sparning/butik.mjs (write_themes + write_content).
//
// ⛔ Ingen review gating: alla fem stjärnor går till SAMMA formulär (brandfilens
// butiksrecension.judgeme_lank). Talet i ?s= styr bara animationen och texten.
// Loggen: klaviyo/konto/<brand>/betygssida.jsonl (committas).

import { readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROT } from '../mallar.mjs';
import { lasBrand } from '../ladda-upp.mjs';

export const MALLSUFFIX = 'betyg';
export const LAYOUT_FIL = 'layout/betyg.liquid';
export const MALL_FIL = 'templates/page.betyg.liquid';

const esk = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsStrang = (s) => JSON.stringify(String(s ?? ''));

/** Brandfilens butiksrecension-block, kontrollerat. */
export function recensionKonfig(brand) {
  const r = brand.butiksrecension;
  if (!r?.judgeme_lank || !/^https:\/\//.test(r.judgeme_lank)) throw new Error('brandfilen saknar butiksrecension.judgeme_lank (https-adress) — inget att bygga.');
  const sida = String(r.betygssida ?? '/pages/betyg');
  const m = /^\/pages\/([a-z0-9-]+)$/.exec(sida);
  if (!m) throw new Error(`butiksrecension.betygssida måste vara "/pages/<handle>", inte "${sida}".`);
  return {
    mal: r.judgeme_lank,
    valjKnapp: r.valj_knapp ?? 'Eller skriv en butiksrecension',
    handle: m[1],
    sida,
    rubrik: r.rubrik ?? 'Hur många stjärnor får vi?',
  };
}

const STJARNA = 'M12 2.5l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17.3l-6 3.3 1.3-6.6L2.4 9.4l6.7-.8z';

/**
 * Sidans innehåll (page.content), layouten och sidmallen. Ren funktion.
 *   byggBetygssida(brand, stil) → { body, layout, mall, mal, handle, titel }
 * `stil` = mejl/butiker/<id>.json (färger, font, logga).
 */
export function byggBetygssida(brand, stil) {
  const k = recensionKonfig(brand);
  const orange = stil?.farg_rod ?? '#dd821d';
  const svart = stil?.farg_svart ?? '#121212';
  const fontNamn = stil?.font_webb?.namn ?? null;
  const fontCss = stil?.font_webb?.css ?? null;
  const fontStack = `${fontNamn ? `'${fontNamn}',` : ''}${stil?.font_rubrik ?? "'Trebuchet MS',Verdana,Arial,sans-serif"}`;
  const logga = stil?.logga_url ?? null;
  const titel = 'Tack för ditt betyg';

  const stjarnor = [1, 2, 3, 4, 5]
    .map((n) => `<a class="betyg-stjarna" href="${esk(k.mal)}" data-n="${n}" aria-label="${n} av 5"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${STJARNA}"/></svg></a>`)
    .join('\n    ');

  const body = `<!-- Betygssidan — skrivs av klaviyo/recension/betygssida.mjs (repot yognftnfgn), ändra i repot. Alla fem stjärnor går till samma formulär. -->
<div class="betyg" data-betyg data-mal="${esk(k.mal)}" data-valj="${esk(k.valjKnapp)}">
  ${logga ? `<img class="betyg-logga" src="${esk(logga)}" alt="${esk(brand.namn ?? '')}" width="120">` : ''}
  <h1 class="betyg-rubrik" id="betyg-rubrik">${esk(k.rubrik)}</h1>
  <div class="betyg-stjarnor" role="group" aria-label="Betyg 1 till 5">
    ${stjarnor}
  </div>
  <p class="betyg-skala"><span>1 = dålig</span><span>5 = bra</span></p>
  <div class="betyg-streck" aria-hidden="true"></div>
  <p class="betyg-status" id="betyg-status" aria-live="polite"></p>
  <p class="betyg-tips">Klicka på en stjärna. Efter det öppnas formuläret där du skriver några rader.</p>
  <p class="betyg-reserv"><a href="${esk(k.mal)}">Öppnas inget? Klicka här, så kommer du till formuläret.</a></p>
</div>
<style>
.betyg-sida{margin:0;background:#f3ede2;color:${svart};font-family:${fontStack};-webkit-font-smoothing:antialiased}
.betyg{max-width:520px;margin:0 auto;padding:40px 20px 56px;text-align:center}
.betyg-logga{display:block;width:120px;height:auto;margin:0 auto 22px}
.betyg-rubrik{font-size:26px;line-height:1.2;font-weight:400;margin:0 0 22px}
.betyg-stjarnor{display:flex;justify-content:center;gap:6px;margin:0 0 10px}
.betyg-stjarna{display:block;width:58px;height:58px;padding:4px;box-sizing:border-box;border-radius:50%;text-decoration:none;color:inherit;transition:transform .15s ease;-webkit-tap-highlight-color:transparent}
.betyg-stjarna svg{display:block;width:100%;height:100%;overflow:visible}
.betyg-stjarna path{fill:#fff;stroke:${orange};stroke-width:1.6;stroke-linejoin:round;transition:fill .18s ease}
.betyg-stjarna.ar-hover path{fill:#f2c48a}
.betyg-stjarna.ar-tand path{fill:${orange}}
.betyg-stjarna.ar-tand{animation:betyg-pop .55s cubic-bezier(.34,1.56,.64,1) both}
.betyg-stjarna.ar-vald{animation:betyg-pop-stor .7s cubic-bezier(.34,1.56,.64,1) both}
.betyg-stjarna.ar-vald svg{filter:drop-shadow(0 6px 14px rgba(221,130,29,.45))}
@keyframes betyg-pop{0%{transform:scale(.6) rotate(-14deg)}60%{transform:scale(1.28) rotate(6deg)}100%{transform:scale(1) rotate(0)}}
@keyframes betyg-pop-stor{0%{transform:scale(.6) rotate(-14deg)}55%{transform:scale(1.45) rotate(8deg)}100%{transform:scale(1.12) rotate(0)}}
.har-betyg .betyg-stjarna{pointer-events:none}
.har-betyg .betyg-tips{display:none}
.betyg-skala{display:flex;justify-content:space-between;max-width:300px;margin:0 auto 22px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b6259}
.betyg-streck{width:0;height:4px;background:${orange};border-radius:2px;margin:0 auto 22px;transition:width 1.4s linear}
.har-betyg .betyg-streck{width:120px}
.betyg-status{font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;margin:0 0 14px;min-height:1.5em}
.betyg-tips,.betyg-reserv{font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#6b6259;margin:10px 0 0}
.betyg-reserv a{color:${orange}}
@media (prefers-reduced-motion: reduce){.betyg-stjarna,.betyg-stjarna path,.betyg-streck{animation:none!important;transition:none!important}}
</style>
<script>
(function () {
  var rot = document.querySelector('[data-betyg]');
  if (!rot) return;
  var mal = rot.getAttribute('data-mal');
  var valj = rot.getAttribute('data-valj');
  var stjarnor = [].slice.call(rot.querySelectorAll('.betyg-stjarna'));
  var status = document.getElementById('betyg-status');
  var rubrik = document.getElementById('betyg-rubrik');
  var lugn = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var skickad = false;
  function tand(n) {
    stjarnor.forEach(function (a, i) {
      var on = i < n;
      a.classList.remove('ar-hover');
      a.classList.toggle('ar-tand', on);
      a.classList.toggle('ar-vald', i === n - 1);
      a.style.animationDelay = lugn ? '0ms' : (i * 110) + 'ms';
    });
  }
  function ge(n) {
    if (skickad) return;
    skickad = true;
    rot.classList.add('har-betyg');
    tand(n);
    rubrik.textContent = 'Tack! ' + n + ' av 5.';
    status.textContent = 'Nu öppnas formuläret. Välj "' + valj + '" och sätt stjärnorna en gång till där.';
    setTimeout(function () { window.location.replace(mal); }, lugn ? 250 : 1500);
  }
  stjarnor.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); ge(i + 1); });
    a.addEventListener('mouseenter', function () { if (!skickad) stjarnor.forEach(function (b, j) { b.classList.toggle('ar-hover', j <= i); }); });
    a.addEventListener('mouseleave', function () { stjarnor.forEach(function (b) { b.classList.remove('ar-hover'); }); });
  });
  var m = /[?&]s=([1-5])(?:&|$)/.exec(window.location.search);
  if (m) ge(Number(m[1]));
})();
</script>`;

  const layout = `{%- comment -%}
  layout/betyg.liquid — skrivs av klaviyo/recension/betygssida.mjs (repot yognftnfgn), ändra inte här.
  Betygssidan utan header, footer och meny: kunden kommer från ett mejl, ser stjärnorna
  tändas och skickas vidare till recensionsformuläret. {{ content_for_header }} behålls
  (pixlarna, kundens integritetsval). Temats CSS och JS laddas inte; stilen ligger i sidan.
{%- endcomment -%}
<!doctype html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="{{ canonical_url }}">
  {%- if settings.favicon != blank -%}
    <link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 32, height: 32 }}">
  {%- endif -%}
  <title>{{ page_title }}</title>
${fontCss ? `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${esk(fontCss)}">
` : ''}  {{ content_for_header }}
</head>
<body class="betyg-sida">
  {{ content_for_layout }}
</body>
</html>
`;

  const mall = `{%- comment -%}
  templates/page.betyg.liquid — skrivs av klaviyo/recension/betygssida.mjs, ändra inte här.
  Sidmallen "betyg": layouten utan header/footer + sidans innehåll (stjärnorna, stilen, skriptet).
{%- endcomment -%}
{% layout '${MALLSUFFIX}' %}
{{ page.content }}
`;

  return { body, layout, mall, mal: k.mal, handle: k.handle, sida: k.sida, titel, valjKnapp: k.valjKnapp };
}

/** Den publika sidan som kunden ser den. → { ok, fel: [] } */
export function granskaPublik(html, { mal }) {
  const h = String(html ?? '');
  const fel = [];
  if (!h.includes('data-betyg')) fel.push('betygssidan saknas i HTML:en (ingen data-betyg)');
  if (!h.includes(`data-mal="${esk(mal)}"`)) fel.push('målet (Judge.me-länken) står inte i sidan');
  const antal = (h.match(/class="betyg-stjarna"/g) ?? []).length;
  if (antal !== 5) fel.push(`${antal} stjärnor i stället för 5`);
  const hrefs = [...h.matchAll(/class="betyg-stjarna" href="([^"]+)"/g)].map((m) => m[1]);
  if (hrefs.length && new Set(hrefs).size !== 1) fel.push('stjärnorna pekar på olika mål (review gating)');
  if (/id="shopify-section-/.test(h)) fel.push('temasektioner renderas (header/footer kvar) — mallen används inte');
  if (/<header[\s>]/i.test(h)) fel.push('en <header> finns på sidan');
  if (/<nav[\s>]/i.test(h)) fel.push('en <nav> (meny) finns på sidan');
  if (!/class="betyg-sida"/.test(h)) fel.push('layouten betyg används inte (ingen body.betyg-sida)');
  return { ok: fel.length === 0, fel };
}

// ------------------------------------------------------------ Shopify

async function lasTemafiler(klient, temaId, namn) {
  const d = await klient.graphql(
    `query betygTemafiler($id: ID!, $namn: [String!]) { theme(id: $id) { files(filenames: $namn, first: 10) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
    { id: temaId, namn }
  );
  const ut = {};
  for (const f of d.theme?.files?.nodes ?? []) ut[f.filename] = f.body?.content ?? null;
  return ut;
}

async function liveTema(klient) {
  const d = await klient.graphql('{ themes(first: 5, roles: [MAIN]) { nodes { id name role } } }');
  const tema = (d.themes?.nodes ?? []).find((t) => t.role === 'MAIN');
  if (!tema) throw new Error(`${klient.shop}: hittar inget publicerat tema (role MAIN).`);
  return tema;
}

async function hittaSida(klient, handle) {
  const d = await klient.graphql(`query betygSida($q: String!) { pages(first: 10, query: $q) { nodes { id handle title templateSuffix isPublished } } }`, { q: `handle:${handle}` });
  return (d.pages?.nodes ?? []).find((s) => s.handle === handle) ?? null;
}

export async function publicera({ brand, stil, klient, skarpt = false, logg = console.log, fetchFn = fetch }) {
  const bygge = byggBetygssida(brand, stil);
  const k = await klient.kolla();
  const saknar = ['write_themes', 'write_content'].filter((s) => !k.scopes.includes(s));
  if (saknar.length) throw new Error(`Appen "${k.app}" i ${klient.shop} saknar ${saknar.join(' + ')} — betygssidan går inte att lägga in.`);
  logg(`Butik: ${k.namn} (${klient.shop}) · app "${k.app}" · mål ${bygge.mal}`);

  const tema = await liveTema(klient);
  const onskade = { [LAYOUT_FIL]: bygge.layout, [MALL_FIL]: bygge.mall };
  const fore = await lasTemafiler(klient, tema.id, Object.keys(onskade));
  const attSkriva = Object.keys(onskade).filter((n) => (fore[n] ?? null) !== onskade[n]);
  logg(`Tema: "${tema.name}" (publicerat) · ${Object.keys(onskade).length - attSkriva.length} temafiler redan rätt, ${attSkriva.length} att skriva${attSkriva.length ? `: ${attSkriva.join(', ')}` : ''}`);
  const befintlig = await hittaSida(klient, bygge.handle);
  const url = `${brand.butik_url.replace(/\/$/, '')}${bygge.sida}`;
  logg(`Sida: ${befintlig ? `finns (${befintlig.title}, mall ${befintlig.templateSuffix || 'standard'}) — ${skarpt ? 'uppdateras' : 'skulle uppdateras'}` : `finns inte — ${skarpt ? 'skapas' : 'skulle skapas'}`} · ${url}`);
  if (!skarpt) return { torr: true, bygge, url, attSkriva, sidaFanns: Boolean(befintlig) };

  if (attSkriva.length) {
    await klient.graphql(
      `mutation betygTemafilerUpp($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: $themeId, files: $files) { upsertedThemeFiles { filename } userErrors { filename message } }
      }`,
      { themeId: tema.id, files: attSkriva.map((filename) => ({ filename, body: { type: 'TEXT', value: onskade[filename] } })) }
    );
    const efter = await lasTemafiler(klient, tema.id, attSkriva);
    const fel = attSkriva.filter((n) => efter[n] !== onskade[n]);
    if (fel.length) throw new Error(`Temafilerna lästes inte tillbaka lika: ${fel.join(', ')}.`);
    logg(`   ✓ ${attSkriva.length} temafil(er) skrivna och lästa tillbaka`);
  }

  const page = { title: bygge.titel, body: bygge.body, isPublished: true, templateSuffix: MALLSUFFIX };
  let sida;
  if (befintlig) {
    const d = await klient.graphql(
      `mutation betygSidaUpp($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { page { id handle templateSuffix isPublished } userErrors { field message } } }`,
      { id: befintlig.id, page }
    );
    sida = d.pageUpdate.page;
  } else {
    const d = await klient.graphql(
      `mutation betygSidaNy($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle templateSuffix isPublished } userErrors { field message } } }`,
      { page: { ...page, handle: bygge.handle } }
    );
    sida = d.pageCreate.page;
  }
  if (sida.handle !== bygge.handle) throw new Error(`Shopify gav sidan handlen "${sida.handle}" i stället för "${bygge.handle}" — adressen är upptagen.`);
  if (sida.templateSuffix !== MALLSUFFIX) throw new Error(`Sidan fick mallen "${sida.templateSuffix}", inte "${MALLSUFFIX}".`);
  logg(`   ✓ sidan ${befintlig ? 'uppdaterad' : 'skapad'}: ${url} (mall page.${MALLSUFFIX}, publicerad)`);

  const kontroll = await kollaPublik({ brand, bygge, fetchFn, logg });
  if (!kontroll.ok) throw new Error(`Sidan ligger uppe men ser inte rätt ut: ${kontroll.fel.join('; ')}`);
  return { torr: false, bygge, url, attSkriva, sida, kontroll };
}

/** Läser sidan som kund (med ?s=4 så skriptet har något att tända) och granskar den. */
export async function kollaPublik({ brand, bygge, fetchFn = fetch, logg = console.log }) {
  const url = `${brand.butik_url.replace(/\/$/, '')}${bygge.sida}?s=4&country=SE`;
  const svar = await fetchFn(url, { headers: { accept: 'text/html', 'accept-language': 'sv' }, redirect: 'follow' });
  const html = await svar.text();
  const g = svar.status === 200 ? granskaPublik(html, { mal: bygge.mal }) : { ok: false, fel: [`HTTP ${svar.status}`] };
  if (g.ok) logg(`   ✓ ${url} svarar som kund: fem stjärnor, samma mål för alla, ingen header, ingen meny`);
  else for (const f of g.fel) logg(`   ❌ ${url}: ${f}`);
  return { ...g, url, status: svar.status, tecken: html.length };
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const brand = lasBrand(arg('--brand') ?? 'matstrumpor');
  const stil = brand.stil_fran ? JSON.parse(readFileSync(join(ROT, brand.stil_fran), 'utf8')) : {};
  const bygge = byggBetygssida(brand, stil);
  if (argv.includes('--kolla')) {
    const k = await kollaPublik({ brand, bygge });
    if (!k.ok) process.exit(1);
    return;
  }
  const butikId = brand.shopify?.butik;
  if (!butikId) throw new Error('brandfilen saknar shopify.butik (butikens id i sparning/butiker.json).');
  (await import('../../mejl/shopify.mjs')).kravProxy();
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const klient = await skapaKlient(lasButik(butikId));
  const skarpt = argv.includes('--skarpt');
  const ut = await publicera({ brand, stil, klient, skarpt });
  if (!skarpt) { console.log('Torrt: inget skrivet. Kör med --skarpt.'); return; }
  const loggDir = join(ROT, 'klaviyo', 'konto', brand.id);
  mkdirSync(loggDir, { recursive: true });
  appendFileSync(join(loggDir, 'betygssida.jsonl'), JSON.stringify({
    tid: new Date().toISOString(), url: ut.url, mal: bygge.mal, temafiler_skrivna: ut.attSkriva, sida: ut.sida, kontroll: { ok: ut.kontroll.ok, status: ut.kontroll.status, tecken: ut.kontroll.tecken },
  }) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
