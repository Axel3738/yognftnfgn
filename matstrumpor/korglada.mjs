// korglada.mjs — varukorgslådan ska öppnas vid FÖRSTA köpet i en ny session (Matstrumpor).
//
// Felet (Axel 2026-10-01): första gången en kund lägger något i varukorgen i en ny
// session kastas hon till /cart-sidan i stället för att lådan glider ut. Andra gången
// fungerar det.
//
// Orsaken, mätt i Chromium och med rena HTTP-anrop samma kväll (hela mätningen i
// matstrumpor/README.md → "Varukorgslådan vid första köpet"):
//
//   1. Paketväljaren (assets/ms-paket.js) la rabattkoden FÖRST (/discount/<kod>), sedan
//      varorna (/cart/add.js), ritade lådan och kontrollerade sist att koden låg kvar i
//      vagnen (kontrollera). Saknades den togs reservvägen laddaOm(): en riktig
//      sidladdning till /discount/<kod>?redirect=/cart — alltså varukorgssidan.
//   2. I samma klick skriver A/B-motorn (assets/ms-ab.js) sin stämpel i vagnen TVÅ gånger:
//      ett fetch-anrop på klicket och en sendBeacon på submit, båda POST /cart/update.js.
//      Shopify skriver hela vagnen: en skrivning som läste vagnen före rabattkoden och
//      avslutade efter den skrev tillbaka vagnen UTAN koden. Lost update.
//   3. I en ny session är koden ny för vagnen, så skrivningen från /discount är den som
//      försvinner → kontrollera hittar den inte → /cart. Andra gången ligger koden redan i
//      vagnen innan någon läser, och ingenting går förlorat.
//
//   Mätt: lådans svar på /discount visade koden på vagnen (applicable: false, tom vagn);
//   ms-ab:s update.js svarade 400 ms senare med discount_codes [] ; /cart.js efter add.js:
//   4 varor, 898 kr, inga koder → navigation till /cart, där koden lades på igen: 499 kr.
//   Svep med rena anrop: update.js startad 0–400 ms efter /discount → koden borta 3 av 3;
//   startad 800 ms efter (när rabattskrivningen hunnit landa) → koden kvar.
//
// Rättningen, två filer, samma som fabriken gjorde för OPS-butikerna 2026-09-09
// (factory/tema/assets/ms-paket.js — Matstrumpors kopia fick aldrig den):
//
//   ms-paket.js  kop(): A/B-stämpeln inväntas → varorna → koden → lådan hämtas färsk ur
//                Shopifys sektions-API (/?sections=cart-drawer,cart-icon-bubble) och ritas.
//                fastKod() läser tillbaka vagnen och gör ett försök till om koden saknas.
//                kontrollera() står kvar som sista nät (den enda vägen till /cart).
//   ms-ab.js     stampCart() lämnar tillbaka den PÅGÅENDE skrivningen (MS.ab.stamp), så
//                add.js väntar på den riktiga stämpeln; ingen beacon när klicket redan
//                stämplat; MS.ab.stamp exponeras åt ms-paket.js.
//
//   node matstrumpor/korglada.mjs                 # torrt: läser MAIN, visar vad som byts, skriver output/korglada/
//   node matstrumpor/korglada.mjs --skarpt        # skriver de två filerna (original säkerhetskopierade), läser tillbaka
//   node matstrumpor/korglada.mjs --tema <gid> …  # mot ett annat tema (provkopian)
//   node matstrumpor/korglada.mjs --kundvy [--tema <gid>]   # Chromium, ny session: klick → lådan? koden? pris? två gånger
//
// Idempotent: en fil som redan bär rättningen rörs inte. Exakta träffar — träffar
// sökningen fel antal gånger stannar skriptet, det byter aldrig "nästan rätt".

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
export const ROT = join(HAR, '..');
export const ORIGINAL = join(HAR, 'korglada', 'original');
const OUTPUT = join(HAR, 'output', 'korglada');

export const PAKET_FIL = 'assets/ms-paket.js';
export const AB_FIL = 'assets/ms-ab.js';
export const BUTIK_ID = 'matstrumpor';
export const PROV_URL = 'https://matstrumpor.se/products/sushi-strumpor?country=SE';

/** Byter EXAKT `sok` mot `ersatt`, kräver exakt `antal` träffar (annars fel — aldrig "nästan rätt"). */
export function bytExakt(kod, sok, ersatt, antal = 1) {
  const traffar = kod.split(sok).length - 1;
  if (traffar !== antal) throw new Error(`"${sok.slice(0, 50).replace(/\n/g, '⏎')}" hittades ${traffar} gånger, väntade ${antal}`);
  return kod.split(sok).join(ersatt);
}

// ---------------------------------------------------------------------------
// ms-paket.js
// ---------------------------------------------------------------------------

export const PAKET_MARKE = 'fastKod(rutt, kod)';

const PAKET_SOK_HUVUD = `    kop(ev) {
      if (ev.target !== this.form || !this.vald || this.inaktiv()) return;
      ev.preventDefault();
      ev.stopPropagation();
`;
const PAKET_NY_HUVUD = `    kop(ev) {
      if (ev.target !== this.form || !this.vald || this.inaktiv()) return;
      // Samma submit hanteras bara en gång, hur många paketväljare sidan än bär:
      // A/B-syskonen lyssnar på SAMMA nod (document), och stopPropagation når dem inte.
      if (ev.msPaketHanterad) return;
      ev.msPaketHanterad = true;
      ev.preventDefault();
      ev.stopImmediatePropagation();
`;

const PAKET_SOK_FLODE = `      var koden = kod
        ? fetch(rutt + 'discount/' + encodeURIComponent(kod) + '?redirect=' + encodeURIComponent(rutt + 'cart.js'),
                { credentials: 'same-origin' })
        : Promise.resolve();

      koden.then(function () {
        var lada = document.querySelector('cart-drawer');
        var kropp = { items: varor };
        if (lada && lada.getSectionsToRender) {
          kropp.sections = lada.getSectionsToRender().map(function (s) { return s.id; }).join(',');
          kropp.sections_url = window.location.pathname;
        }
        return fetch(rutt + 'cart/add.js', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(kropp)
        }).then(function (svar) {
          if (!svar.ok) {
            return svar.json().then(function (d) {
              throw new Error(d.description || d.message || msPaketText('fel_lagga_i', 'Kunde inte lägga i varukorgen.'));
            });
          }
          return svar.json();
        }).then(function (data) {
          aterstall();
          if (lada && lada.renderContents && data.sections) {
            try {
              lada.renderContents(data);
              // Var kundvagnen tom när sidan laddades är lådan märkt is-empty
              // på själva <cart-drawer>. Temats omritning tar bara bort märket
              // från insidan, och CSS:en gömmer då hela produktlistan
              // (.is-empty .cart__contents { display: none }) — kunden ser
              // summan men inte varorna. Drabbar exakt första köpet i en tom
              // vagn, därför städas märket här.
              lada.classList.remove('is-empty');
              var inre = lada.querySelector('.drawer__inner');
              if (inre) inre.classList.remove('is-empty');
              self.kontrollera(rutt, kod, laddaOm);
              return;
            } catch (e) { /* lådan gick inte att rita — ta reservvägen */ }
          }
          laddaOm();
        });
      }).catch(function (e) {
        aterstall();
        if (fel) {
          fel.textContent = e.message || msPaketText('fel_forsok_igen', 'Det gick inte att lägga i varukorgen. Försök igen.');
          fel.hidden = false;
        }
      });
    }
`;

const PAKET_NY_FLODE = `      var lada = document.querySelector('cart-drawer');

      /* ORDNINGEN ÄR MÄTT, INTE VALD (2026-10-01, matstrumpor/korglada.mjs).

         Förut låg koden först, "så att vagnen är rabatterad när lådan ritas".
         Men i samma klick skriver ms-ab.js sin A/B-stämpel i vagnen, och Shopify
         skriver hela vagnen: en stämpel som lästes före koden och landade efter
         den raderade koden. kontrollera() hittade den inte och reservvägen
         kastade kunden till /cart — vid exakt det första köpet i en ny session.

         Nu: 0. stämpeln inväntas, 1. varorna, 2. koden (när inget annat skriver),
         3. lådan hämtas färsk ur sektions-API:t med det rabatterade priset i sig.
         Ett anrop till, men siffran i lådan är den kassan tar. */
      var stampel = (window.MS && window.MS.ab && typeof window.MS.ab.stamp === 'function')
        ? window.MS.ab.stamp().catch(function () { return null; })
        : Promise.resolve();

      stampel.then(function () {
        // 1. Varorna i vagnen.
        return fetch(rutt + 'cart/add.js', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ items: varor })
        }).then(function (svar) {
          if (!svar.ok) {
            return svar.json().then(function (d) {
              throw new Error(d.description || d.message || msPaketText('fel_lagga_i', 'Kunde inte lägga i varukorgen.'));
            });
          }
          return svar.json();
        });
      }).then(function () {
        // 2. Rabattkoden — NU, när vagnen har varor och stämpeln är skriven.
        return self.fastKod(rutt, kod);
      }).then(function () {
        // 3. Lådan, färsk, med det rabatterade priset.
        return self.hamtaLada(rutt, lada);
      }).then(function (sektioner) {
        aterstall();
        if (lada && sektioner && sektioner['cart-drawer']) {
          try {
            lada.renderContents({ sections: sektioner });
            // Var kundvagnen tom när sidan laddades är lådan märkt is-empty
            // på själva <cart-drawer>. Temats omritning tar bara bort märket
            // från insidan, och CSS:en gömmer då hela produktlistan
            // (.is-empty .cart__contents { display: none }) — kunden ser
            // summan men inte varorna. Drabbar exakt första köpet i en tom
            // vagn, därför städas märket här.
            lada.classList.remove('is-empty');
            var inre = lada.querySelector('.drawer__inner');
            if (inre) inre.classList.remove('is-empty');
            self.kontrollera(rutt, kod, laddaOm);
            return;
          } catch (e) { /* lådan gick inte att rita — ta reservvägen */ }
        }
        laddaOm();
      }).catch(function (e) {
        aterstall();
        if (fel) {
          fel.textContent = e.message || msPaketText('fel_forsok_igen', 'Det gick inte att lägga i varukorgen. Försök igen.');
          fel.hidden = false;
        }
      });
    }

    /* Rabattkoden på vagnen via /discount/<kod>?redirect=/cart.js — svaret är vagnen
       som JSON. Saknas koden där görs ETT försök till efter en kort paus: en sen
       skrivning (en pixel, en stämpel) kan ha skrivit över den. Lovar inget —
       kontrollera() avgör sist. Utan kod: ingenting. */
    fastKod(rutt, kod, forsok) {
      if (!kod) return Promise.resolve(null);
      var self = this;
      var url = rutt + 'discount/' + encodeURIComponent(kod) + '?redirect=' + encodeURIComponent(rutt + 'cart.js');
      return fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (vagn) {
          var finns = !!vagn && (vagn.discount_codes || []).some(function (d) { return d.code === kod; });
          if (finns || (forsok || 0) >= 1) return vagn;
          return new Promise(function (r) { setTimeout(r, 600); })
            .then(function () { return self.fastKod(rutt, kod, (forsok || 0) + 1); });
        })
        .catch(function () { return null; });
    }

    /* Lådans HTML ur Shopifys sektions-API, hämtad EFTER koden. null = rita inte om. */
    hamtaLada(rutt, lada) {
      if (!lada || !lada.renderContents || !lada.getSectionsToRender) return Promise.resolve(null);
      var idn = lada.getSectionsToRender().map(function (s) { return s.id; }).join(',');
      return fetch(rutt + '?sections=' + idn, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    }
`;

/** Patchar assets/ms-paket.js. Idempotent. Returnerar { kod, byten, hoppade }. */
export function patchaPaket(kod) {
  const byten = [];
  const hoppade = [];
  if (kod.includes(PAKET_MARKE)) { hoppade.push('ms-paket.js: redan patchad'); return { kod, byten, hoppade }; }
  kod = bytExakt(kod, PAKET_SOK_HUVUD, PAKET_NY_HUVUD, 1);
  byten.push('kop: samma submit en gång (stopImmediatePropagation)');
  kod = bytExakt(kod, PAKET_SOK_FLODE, PAKET_NY_FLODE, 1);
  byten.push('kop: stämpel → varor → kod → lådan ur sektions-API:t (+ fastKod, hamtaLada)');
  return { kod, byten, hoppade };
}

// ---------------------------------------------------------------------------
// ms-ab.js
// ---------------------------------------------------------------------------

export const AB_MARKE = 'stampLofte';

const AB_SOK_FLAGGA = `  var stamped = false;
`;
const AB_NY_FLAGGA = `  var stamped = false;
  var stampLofte = null; // skrivningen som pågår — den som väntar (ms-paket.js) väntar på den
`;

const AB_SOK_STAMP = `    if (stamped || !Object.keys(assigned).length) return Promise.resolve();
    stamped = true;
    return fetch(window.Shopify && window.Shopify.routes && window.Shopify.routes.root
        ? window.Shopify.routes.root + 'cart/update.js'
        : '/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ attributes: attributesPayload() })
    }).catch(function () { stamped = false; });
  }
`;
const AB_NY_STAMP = `    //
    // Pågår skrivningen lämnas SAMMA löfte tillbaka: den som väntar in stämpeln
    // (fetch-kroken före /cart/add, ms-paket.js) väntar då på den riktiga
    // skrivningen, inte på ett löfte som redan är uppfyllt. Två skrivningar mot
    // samma vagn i samma sekund slog ut paketväljarens rabattkod
    // (mätt 2026-10-01, matstrumpor/korglada.mjs).
    if (!Object.keys(assigned).length) return Promise.resolve();
    if (stamped) return stampLofte || Promise.resolve();
    stamped = true;
    stampLofte = fetch(window.Shopify && window.Shopify.routes && window.Shopify.routes.root
        ? window.Shopify.routes.root + 'cart/update.js'
        : '/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ attributes: attributesPayload() })
    }).then(function () { stampLofte = null; }, function () { stamped = false; stampLofte = null; });
    return stampLofte;
  }
`;

const AB_SOK_BEACON = `    if (!Object.keys(assigned).length || !navigator.sendBeacon) return;
`;
const AB_NY_BEACON = `    // Har klicket redan stämplat (stampCart) skickas ingen beacon: det vore en
    // andra skrivning mot samma vagn i samma sekund, och den raderade rabattkoden.
    if (stamped || !Object.keys(assigned).length || !navigator.sendBeacon) return;
`;

const AB_SOK_API = `    of: function (id) { return assigned[id] || null; },
    apply: applyVisibility
  };
`;
const AB_NY_API = `    of: function (id) { return assigned[id] || null; },
    apply: applyVisibility,
    stamp: stampCart
  };
`;

/** Patchar assets/ms-ab.js. Idempotent. Returnerar { kod, byten, hoppade }. */
export function patchaAb(kod) {
  const byten = [];
  const hoppade = [];
  if (kod.includes(AB_MARKE)) { hoppade.push('ms-ab.js: redan patchad'); return { kod, byten, hoppade }; }
  kod = bytExakt(kod, AB_SOK_FLAGGA, AB_NY_FLAGGA, 1);
  kod = bytExakt(kod, AB_SOK_STAMP, AB_NY_STAMP, 1);
  byten.push('stampCart: samma pågående löfte tillbaka');
  kod = bytExakt(kod, AB_SOK_BEACON, AB_NY_BEACON, 1);
  byten.push('beaconStamp: ingen beacon när klicket redan stämplat');
  kod = bytExakt(kod, AB_SOK_API, AB_NY_API, 1);
  byten.push('MS.ab.stamp exponerad');
  return { kod, byten, hoppade };
}

export const PATCHAR = { [PAKET_FIL]: patchaPaket, [AB_FIL]: patchaAb };

/** Giltig JavaScript? (parsas, körs inte) */
export function giltigJs(kod) {
  try { new Function(kod); return true; } catch { return false; }
}

// ---------------------------------------------------------------------------
// Tema-I/O (bara i CLI)
// ---------------------------------------------------------------------------

async function klient() {
  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  return skapaKlient(lasButik(BUTIK_ID));
}

async function valjTema(k, gid) {
  const th = await k.graphql('{ themes(first: 20) { nodes { id name role } } }');
  const tema = gid ? th.themes.nodes.find((t) => t.id === gid || t.id.endsWith(`/${gid}`)) : th.themes.nodes.find((t) => t.role === 'MAIN');
  if (!tema) throw new Error(`temat ${gid ?? 'MAIN'} finns inte i butiken`);
  return tema;
}

async function lasFiler(k, temaId, filer) {
  const d = await k.graphql('query($id: ID!, $f: [String!]) { theme(id: $id) { files(first: 10, filenames: $f) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }', { id: temaId, f: filer });
  return Object.fromEntries(d.theme.files.nodes.map((n) => [n.filename, n.body?.content ?? null]));
}

const paus = (ms) => new Promise((r) => setTimeout(r, ms));

async function kor({ skarpt, temaGid, logg = console.log }) {
  const k = await klient();
  const tema = await valjTema(k, temaGid);
  logg(`tema: ${tema.name} (${tema.id}, ${tema.role})`);
  const filer = Object.keys(PATCHAR);
  const innehall = await lasFiler(k, tema.id, filer);
  const stampel = new Date().toISOString().replace(/[:.]/g, '-');
  const ut = join(OUTPUT, stampel);
  const skriv = [];
  for (const fil of filer) {
    const kod = innehall[fil];
    if (typeof kod !== 'string') throw new Error(`${fil} saknas i temat`);
    const r = PATCHAR[fil](kod);
    for (const h of r.hoppade) logg(`  ${fil}: ${h}`);
    for (const b of r.byten) logg(`  ${fil}: ${b}`);
    if (!r.byten.length) continue;
    if (!giltigJs(r.kod)) throw new Error(`${fil}: resultatet är inte giltig JavaScript — skriver inte`);
    mkdirSync(join(ut, 'original', dirname(fil)), { recursive: true });
    mkdirSync(join(ut, 'ny', dirname(fil)), { recursive: true });
    writeFileSync(join(ut, 'original', fil), kod);
    writeFileSync(join(ut, 'ny', fil), r.kod);
    skriv.push({ filename: fil, body: { type: 'TEXT', value: r.kod } });
  }
  if (!skriv.length) { logg('inget att skriva — temat bär redan rättningen'); return { skrivna: [] }; }
  logg(`original + nya filer i ${ut}`);
  if (!skarpt) { logg(`torrt: ${skriv.length} fil(er) skulle skrivas (${skriv.map((s) => s.filename).join(', ')}). Kör med --skarpt.`); return { skrivna: [], torrt: skriv.map((s) => s.filename) }; }
  const u = await k.graphql('mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }', { id: tema.id, files: skriv });
  const fel = u.themeFilesUpsert?.userErrors ?? [];
  if (fel.length) throw new Error(`themeFilesUpsert: ${fel.map((f) => `${f.filename}: ${f.message}`).join('; ')}`);
  // Tillbakaläsning — Shopify kan svara med förra versionen en kort stund (upp till tre läsningar).
  let kvar = [];
  for (let forsok = 1; forsok <= 3; forsok++) {
    const efter = await lasFiler(k, tema.id, skriv.map((s) => s.filename));
    kvar = skriv.filter((s) => efter[s.filename] !== s.body.value).map((s) => s.filename);
    if (!kvar.length) break;
    if (forsok < 3) await paus(5000);
  }
  if (kvar.length) throw new Error(`${kvar.join(', ')} läses inte tillbaka identiskt efter skrivningen (tre försök)`);
  logg(`✅ ${skriv.length} fil(er) skrivna och tillbakalästa: ${skriv.map((s) => s.filename).join(', ')}`);
  return { skrivna: skriv.map((s) => s.filename) };
}

// ---------------------------------------------------------------------------
// Kundvyn: ny session i Chromium, klicka köpknappen två gånger
// ---------------------------------------------------------------------------

export async function kundvy({ temaGid, url = PROV_URL, logg = console.log } = {}) {
  const { startaWebblasare } = await import('../konkurrenter/adlibrary.mjs');
  let previewId = null;
  if (temaGid) {
    const k = await klient();
    const tema = await valjTema(k, temaGid);
    if (tema.role === 'MAIN') logg('temat är MAIN — ingen förhandsvisning behövs');
    else previewId = tema.id.split('/').pop();
  }
  const sidUrl = previewId ? `${url}${url.includes('?') ? '&' : '?'}preview_theme_id=${previewId}` : url;
  const { browser, ctx } = await startaWebblasare({ locale: 'sv-SE' });
  const fynd = [];
  try {
    const sida = await ctx.newPage();
    await sida.setViewportSize({ width: 390, height: 844 });
    const fel = [];
    sida.on('pageerror', (e) => fel.push(String(e).slice(0, 200)));
    const navigeringar = [];
    sida.on('framenavigated', (f) => { if (f === sida.mainFrame()) navigeringar.push(f.url()); });
    await sida.goto(sidUrl, { waitUntil: 'networkidle', timeout: 90_000 });
    const temaNu = await sida.evaluate(() => (window.Shopify && Shopify.theme && Shopify.theme.id) || null);
    logg(`sidan laddad: ${sida.url()} (tema ${temaNu})`);
    if (previewId && String(temaNu) !== String(previewId)) throw new Error(`förhandsvisningen gav tema ${temaNu}, inte ${previewId}`);
    const harRattning = await sida.evaluate(() => !!(window.MS && window.MS.ab && typeof window.MS.ab.stamp === 'function'));
    logg(`ms-ab.js bär MS.ab.stamp: ${harRattning}`);
    const vald = await sida.evaluate(() => {
      const p = [...document.querySelectorAll('ms-paket')].filter((e) => !e.hidden && !e.closest('[hidden]'))[0];
      const i = p && p.querySelector('.ms-paket__input:checked');
      return i ? { antal: i.dataset.antal, kod: i.dataset.kod } : null;
    });
    logg(`vald paketnivå: ${JSON.stringify(vald)}`);
    const kod = vald?.kod || '';
    for (let varv = 1; varv <= 2; varv++) {
      const fore = sida.url();
      navigeringar.length = 0;
      const knapp = sida.locator('form[action*="/cart/add"] [type="submit"]:visible, form[action*="/cart/add"] [name="add"]:visible').first();
      await knapp.scrollIntoViewIfNeeded();
      await knapp.click();
      // Lådan får upp till 8 s på sig (fyra anrop i följd på mobilnät).
      let oppen = false;
      for (let i = 0; i < 40 && !oppen; i++) {
        await sida.waitForTimeout(200);
        if (sida.url() !== fore) break;
        oppen = await sida.evaluate(() => { const d = document.querySelector('cart-drawer'); return !!d && d.classList.contains('active'); }).catch(() => false);
      }
      await sida.waitForTimeout(1500); // kontrollera() hinner köra (och navigera, om den vill)
      const navigerade = sida.url() !== fore || navigeringar.length > 0;
      const vagn = await sida.evaluate(async () => { const r = await fetch('/cart.js', { headers: { Accept: 'application/json' } }); return r.json(); }).catch(() => null);
      const koden = (vagn?.discount_codes || []).find((d) => d.code === kod) || null;
      const synligtPris = await sida.evaluate(() => { const e = document.querySelector('cart-drawer .totals__total-value, cart-drawer [data-ms-total], cart-drawer .totals'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }).catch(() => null);
      const rad = { varv, lada_oppen: oppen, navigerade, url: sida.url(), antal: vagn?.item_count ?? null, total: vagn?.total_price ?? null, kod: koden, synligt_pris: synligtPris, sidfel: [...fel] };
      fynd.push(rad);
      const ok = oppen && !navigerade && (!kod || (koden && koden.applicable));
      logg(`${ok ? '✅' : '❌'} klick ${varv}: låda ${oppen ? 'öppen' : 'INTE öppen'}, ${navigerade ? 'NAVIGERADE till ' + sida.url() : 'ingen navigation'}, vagn ${rad.antal} varor / ${rad.total} öre, kod ${koden ? `${koden.code} applicable=${koden.applicable}` : 'SAKNAS'}, lådans summa "${synligtPris ?? '-'}"${fel.length ? `, sidfel: ${fel.join(' | ')}` : ''}`);
      if (navigerade) await sida.goto(sidUrl, { waitUntil: 'networkidle', timeout: 90_000 });
      else await sida.evaluate(() => { const d = document.querySelector('cart-drawer'); if (d && d.close) d.close(); });
      fel.length = 0;
    }
  } finally {
    await browser.close();
  }
  const alltOk = fynd.length === 2 && fynd.every((f) => f.lada_oppen && !f.navigerade && (!f.kod || f.kod.applicable));
  return { ok: alltOk, fynd };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = process.argv.slice(2);
  const temaIx = arg.indexOf('--tema');
  const temaGid = temaIx !== -1 ? arg[temaIx + 1] : null;
  const skarpt = arg.includes('--skarpt');
  try {
    if (arg.includes('--kundvy')) {
      const r = await kundvy({ temaGid });
      console.log(r.ok ? '\n✅ Kundvyn: lådan öppnades utan navigation vid båda klicken, koden på vagnen.' : '\n❌ Kundvyn: se raderna ovan.');
      process.exit(r.ok ? 0 : 1);
    }
    await kor({ skarpt, temaGid });
  } catch (e) {
    console.error(`FEL: ${e.message}`);
    process.exit(1);
  }
}
