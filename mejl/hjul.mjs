// Lyckohjulet: sidan /pages/din-gratisprodukt på baverbutiken.se.
//
// Kunden kommer hit från orderbekräftelsen (knappen går via
// /discount/<kod>?redirect=/pages/<handle>?produkt=<det kunden köpte>),
// snurrar hjulet, vinner en av gratisprodukterna, lägger den i korgen och
// får förslag på hur 299 kr nås — först EN TILL av det hen köpte, sedan
// komplementen ur samma karta som mejlet använder. Knappen "Till kassan"
// lägger på koden igen och går till kassan.
//
// Byggs som en Shopify-sida (write_content) med allt inline: HTML, <style>,
// <script>. Inga temafiler — sidan överlever temabyten och GemPages. Liquid
// renderas INTE i page.content, så produkterna läses levande i webbläsaren
// ur /collections/<kollektion>/products.json (variant-id, pris, bild, i
// lager) med det inbakade som reserv. Vinsten sparas i localStorage; det
// är per webbläsare, inte per kund — koden i Shopify (en gång per kund) är
// det som faktiskt håller gränsen.
//
// ⚠️ Rabatten är "1 ur kollektionen" — vilken som helst av vinsterna blir
// gratis i kassan, så hjulet är upplevelse, inte kontroll. Rabatten dras
// först i kassan efter e-posten, inte i varukorgen; sidan säger det.

import { kortnamn, bildLiten, gemensamtPrefix } from './mallar.mjs';

const esk = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Datan sidan bakar in. Komprimerad, för den ligger i en Shopify-sidkropp:
// katalogen är en array och kartan pekar med index i stället för handles
// (handles är ~45 tecken och nämns tre gånger var). Bildernas gemensamma
// CDN-prefix skrivs en gång. Samma knep som i mejlmallarna.
//   katalogpost: [handle, kortnamn, pris, bildsuffix, variant_id, en_variant]
export function hjulData({ konfig: k, copy, produkter, alla = [], storsaljare = [] }) {
  const e = k.erbjudande;
  const h = k.hjul;
  const km = produkter.komplement;
  const minsta = e.minsta_kop_sek;
  const gratis = new Set(e.gratisprodukter);
  const perHandle = new Map(alla.map((p) => [p.handle, p]));
  // Katalogen = komplementens produkter + storsäljarna. Storsäljarna kommer
  // ur ordrarna (senaste sju dagarna) och kan sakna i komplementkartan.
  const poster = new Map();
  for (const [handle, p] of km.katalog) poster.set(handle, { ...p, pris: p.pris });
  const topp = [];
  for (const s of storsaljare) {
    const p = perHandle.get(s.handle);
    if (!p || !p.bild || gratis.has(s.handle) || Number(p.pris) < minsta) continue;
    if (!(p.lagerpolicy === 'CONTINUE' || p.lager > 0)) continue;
    if (!poster.has(s.handle)) {
      poster.set(s.handle, { kortnamn: kortnamn(p.titel), bild: bildLiten(p.bild), pris: p.pris, url: p.url, variant_id: p.variant_id ?? null, en_variant: p.en_variant !== false });
    }
    topp.push(s.handle);
    if (topp.length >= (h.storsaljare_antal ?? 12)) break;
  }
  const bilder = [...poster.values()].map((p) => p.bild ?? '');
  const cdn = gemensamtPrefix([...bilder, ...produkter.gratis.map((p) => bildLiten(p.bild) ?? '')]);
  const handles = [...poster.keys()];
  const index = new Map(handles.map((handle, i) => [handle, i]));
  const katalog = handles.map((handle) => {
    const p = poster.get(handle);
    const kopbar = p.en_variant && p.variant_id;
    return [handle, p.kortnamn, Math.round(p.pris), (p.bild ?? '').slice(cdn.length), kopbar ? String(p.variant_id) : '', kopbar ? 1 : 0];
  });
  // Kartan filtreras till produkter som själva når 299 kr — rubriken är
  // "Så når du 299 kr", och en vara för 189 kr gör inte det (Axel
  // 2026-09-13). Produkter under gränsen finns kvar i mejlet.
  const karta = {};
  for (const [handle, v] of km.karta) {
    const lista = v.lista.map((x) => index.get(x)).filter((i) => i !== undefined && katalog[i][2] >= minsta);
    if (lista.length) karta[handle] = lista;
  }
  const vinster = produkter.gratis.map((p) => [
    p.handle,
    kortnamn(p.titel),
    Math.round(p.pris),
    (bildLiten(p.bild) ?? '').slice(cdn.length),
    String(p.variant_id ?? ''),
  ]);
  return {
    kod: e.kod,
    minsta: e.minsta_kop_sek,
    kollektion: e.kollektion_handle,
    ls: h.localstorage_nyckel,
    varv: h.varv,
    snurrtid: h.snurrtid_ms,
    perVisning: h.forslag_per_visning ?? 4,
    bas: k.butik.url,
    cdn,
    vinster,
    // fallback = storsäljarna (≥ 299 kr, senaste sju dagarna). Saknas de
    // (offline utan cache) tas mejlets fallback, filtrerad på priset.
    komplement: {
      karta,
      katalog,
      storsaljare: topp.map((x) => index.get(x)),
      fallback: topp.length
        ? topp.map((x) => index.get(x))
        : km.fallback.map((x) => index.get(x)).filter((i) => i !== undefined && katalog[i][2] >= minsta),
    },
    copy: copy.hjul,
  };
}

// Stilen, avgränsad till #bb-hjul så temats .rte inte tar över.
function stil(k) {
  const rod = k.butik.farg_rod;
  return `
#bb-hjul{--bbh-rod:${rod};--bbh-svart:#000;--bbh-ram:#e8e8e1;--bbh-gra:#6b6b6b;max-width:640px;margin:0 auto;padding:0 0 32px;text-align:center;font-family:inherit;color:#000}
#bb-hjul *{box-sizing:border-box}
#bb-hjul h2{font-family:Impact,'Anton','Arial Narrow','Arial Black',sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:.5px;font-size:30px;line-height:1.1;margin:0 0 8px}
#bb-hjul p{margin:0 0 12px;line-height:1.5}
#bb-hjul .bbh-etikett{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--bbh-rod);margin:0 0 6px}
#bb-hjul .bbh-intro{font-size:17px;max-width:46ch;margin:0 auto 20px}
#bb-hjul .bbh-scen{position:relative;margin:0 auto 20px;width:min(100%,360px)}
#bb-hjul .bbh-pil{position:absolute;left:50%;top:-6px;transform:translateX(-50%);width:0;height:0;border-left:16px solid transparent;border-right:16px solid transparent;border-top:28px solid var(--bbh-svart);z-index:2;filter:drop-shadow(0 2px 0 #fff)}
#bb-hjul .bbh-hjul{width:100%;aspect-ratio:1;border-radius:50%;border:6px solid var(--bbh-svart);background:#fff;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.18)}
#bb-hjul .bbh-hjul svg{display:block;width:100%;height:100%;transform:rotate(0deg);transition:transform ${k.hjul.snurrtid_ms}ms cubic-bezier(.17,.67,.12,1)}
#bb-hjul .bbh-hjul svg.bbh-still{transition:none}
#bb-hjul .bbh-nav{position:absolute;left:50%;top:50%;width:64px;height:64px;transform:translate(-50%,-50%);border-radius:50%;background:#fff;border:5px solid var(--bbh-svart);display:flex;align-items:center;justify-content:center;font-family:Impact,'Anton','Arial Black',sans-serif;font-size:14px;letter-spacing:1px;text-transform:uppercase;z-index:1}
#bb-hjul .bbh-knapp{display:inline-block;width:100%;max-width:360px;padding:16px 24px;margin:0 auto;background:var(--bbh-rod);color:#fff;border:0;border-radius:0;font-family:Impact,'Anton','Arial Narrow','Arial Black',sans-serif;font-size:22px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;text-decoration:none;line-height:1.2}
#bb-hjul .bbh-knapp:hover,#bb-hjul .bbh-knapp:focus-visible{background:#b81616;color:#fff;text-decoration:none;outline:3px solid var(--bbh-svart);outline-offset:2px}
#bb-hjul .bbh-knapp[disabled]{opacity:.55;cursor:default}
#bb-hjul .bbh-knapp--sek{background:var(--bbh-svart)}
#bb-hjul .bbh-knapp--sek:hover{background:#222}
#bb-hjul .bbh-status{font-size:14px;color:var(--bbh-gra);margin:10px 0 0}
#bb-hjul .bbh-vinst{background:var(--bbh-svart);color:#fff;padding:26px 20px 24px;margin:24px 0}
#bb-hjul .bbh-vinst h2{color:#fff}
#bb-hjul .bbh-vinst p{color:#d9d9d9}
#bb-hjul .bbh-vinst-kort{display:flex;gap:16px;align-items:center;justify-content:center;background:#fff;color:#000;padding:14px;margin:14px auto 16px;max-width:420px;text-align:left}
#bb-hjul .bbh-vinst-kort img{width:96px;height:96px;object-fit:cover;border:1px solid var(--bbh-ram);flex:0 0 auto}
#bb-hjul .bbh-vinst-kort p{color:#000;margin:0}
#bb-hjul .bbh-pris s{color:var(--bbh-gra)}
#bb-hjul .bbh-pris strong{color:var(--bbh-rod);font-size:20px}
#bb-hjul .bbh-korg{font-size:15px;font-weight:700;color:#fff;margin:14px 0 0}
#bb-hjul .bbh-forklaring{font-size:15px;line-height:1.5;color:#fff;background:var(--bbh-rod);padding:12px 16px;margin:12px auto 0;max-width:420px}
#bb-hjul .bbh-knapp--tunn{background:#fff;color:var(--bbh-svart);border:2px solid var(--bbh-svart);font-size:18px;padding:12px 20px;margin-bottom:14px}
#bb-hjul .bbh-knapp--tunn:hover{background:var(--bbh-ram);color:var(--bbh-svart)}
#bb-hjul .bbh-kvar{margin:28px 0 8px}
#bb-hjul .bbh-kort-rad{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0 20px}
#bb-hjul .bbh-kort{border:1px solid var(--bbh-ram);padding:10px 8px 12px;display:flex;flex-direction:column;gap:6px;align-items:center;background:#fff}
#bb-hjul .bbh-kort img{width:100%;max-width:120px;aspect-ratio:1;object-fit:cover;border:1px solid var(--bbh-ram)}
#bb-hjul .bbh-kort .bbh-etikett{margin:0}
#bb-hjul .bbh-kort .bbh-namn{font-size:13px;line-height:1.3;margin:0;flex:1}
#bb-hjul .bbh-kort .bbh-kortpris{font-size:14px;font-weight:700;margin:0}
#bb-hjul .bbh-kort .bbh-liten{width:100%;padding:9px 6px;font-size:14px;background:var(--bbh-svart);color:#fff;border:0;font-weight:700;cursor:pointer;text-decoration:none;display:block;line-height:1.2}
#bb-hjul .bbh-kort .bbh-liten:hover{background:var(--bbh-rod)}
#bb-hjul .bbh-finstilt{font-size:12px;color:var(--bbh-gra);max-width:60ch;margin:20px auto 0}
#bb-hjul .bbh-fel{color:var(--bbh-rod);font-weight:700}
@media (max-width:560px){#bb-hjul .bbh-kort-rad{grid-template-columns:repeat(2,1fr)}#bb-hjul h2{font-size:26px}}
@media (prefers-reduced-motion:reduce){#bb-hjul .bbh-hjul svg{transition-duration:400ms}}
`;
}

// Skriptet. Ren ES5-ish JavaScript utan mallsträngar så det kan ligga i en
// JS-mallsträng här utan att behöva eskapas. Läser datan ur #bbh-data.
function skript() {
  return String.raw`
(function () {
  var rot = document.getElementById('bb-hjul');
  if (!rot) return;
  var D = JSON.parse(document.getElementById('bbh-data').textContent);
  var C = D.copy;
  var $ = function (id) { return document.getElementById(id); };
  var fyll = function (t, o) { return String(t || '').replace(/\{\{(\w+)\}\}/g, function (_, k) { return o[k] != null ? o[k] : ''; }); };
  var kr = function (n) { return Math.round(n).toLocaleString('sv-SE') + ' kr'; };
  var minne = { las: function () { try { return JSON.parse(localStorage.getItem(D.ls) || 'null'); } catch (e) { return null; } },
                spara: function (v) { try { localStorage.setItem(D.ls, JSON.stringify(v)); } catch (e) {} },
                glom: function () { try { localStorage.removeItem(D.ls); } catch (e) {} } };
  // Packa upp den komprimerade datan: [handle, namn, pris, bildsuffix, variant, en_variant]
  var bild = function (suffix) { return suffix.indexOf('http') === 0 ? suffix : D.cdn + suffix; };
  var vinster = D.vinster.map(function (a) { return { h: a[0], n: a[1], p: a[2], b: bild(a[3]), v: a[4], slut: false }; });
  var kat = D.komplement.katalog.map(function (a) { return { h: a[0], n: a[1], p: a[2], b: bild(a[3]), v: a[4], ev: a[5] === 1 }; });
  var svg = $('bbh-svg'), knappSnurra = $('bbh-snurra'), status = $('bbh-status');
  var N = vinster.length, A = 360 / N, snurrar = false, vunnen = null;

  // Levande produktdata ur kollektionen: pris, bild, variant, i lager.
  function uppdateraVinster() {
    return fetch('/collections/' + D.kollektion + '/products.json?limit=50', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.products) return;
        var per = {};
        j.products.forEach(function (p) { per[p.handle] = p; });
        vinster.forEach(function (v) {
          var p = per[v.h]; if (!p || !p.variants || !p.variants[0]) return;
          v.v = String(p.variants[0].id);
          v.p = Math.round(parseFloat(p.variants[0].price));
          v.slut = p.variants[0].available === false;
          if (p.images && p.images[0] && p.images[0].src) v.b = p.images[0].src.replace(/(\.[a-z0-9]+)(\?.*)?$/i, '_240x240$1$2');
        });
      }).catch(function () {});
  }

  // Hjulet: N tårtbitar, varannan svart och röd, bild + kort namn i varje.
  function rita() {
    var NS = 'http://www.w3.org/2000/svg', cx = 200, cy = 200, R = 196;
    var defs = document.createElementNS(NS, 'defs');
    svg.appendChild(defs);
    vinster.forEach(function (v, i) {
      var a0 = (i * A - A / 2 - 90) * Math.PI / 180, a1 = ((i + 1) * A - A / 2 - 90) * Math.PI / 180;
      var x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0), x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', 'M' + cx + ' ' + cy + ' L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z');
      path.setAttribute('fill', i % 2 ? '#dd1d1d' : '#000');
      path.setAttribute('stroke', '#fff'); path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', 'rotate(' + (i * A) + ' ' + cx + ' ' + cy + ')');
      // Bara produktbilden i varje tårtbit. Namn i bitarna blev oläsbara:
      // texten följer rotationen och står upp och ner på nedre halvan
      // (mätt i förhandsvisningen 2026-09-13). Vinstens namn står i rutan
      // under hjulet i stället, där det finns plats att läsa det.
      // Bilderna ligger på radie 138 med r 32: avståndet mellan grannar blir
      // 2·138·sin(180/N) ≈ 85 px vid tio bitar, alltså ingen överlappning.
      var r = 32, my = cy - 138;
      var clip = document.createElementNS(NS, 'clipPath'); clip.setAttribute('id', 'bbh-c' + i);
      var circ = document.createElementNS(NS, 'circle'); circ.setAttribute('cx', cx); circ.setAttribute('cy', my); circ.setAttribute('r', r);
      clip.appendChild(circ); defs.appendChild(clip);
      var platta = document.createElementNS(NS, 'circle');
      platta.setAttribute('cx', cx); platta.setAttribute('cy', my); platta.setAttribute('r', r); platta.setAttribute('fill', '#fff');
      g.appendChild(platta);
      var img = document.createElementNS(NS, 'image');
      img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', v.b); img.setAttribute('href', v.b);
      img.setAttribute('x', cx - r); img.setAttribute('y', my - r); img.setAttribute('width', r * 2); img.setAttribute('height', r * 2);
      img.setAttribute('preserveAspectRatio', 'xMidYMid slice'); img.setAttribute('clip-path', 'url(#bbh-c' + i + ')');
      g.appendChild(img);
      var ring = document.createElementNS(NS, 'circle'); ring.setAttribute('cx', cx); ring.setAttribute('cy', my); ring.setAttribute('r', r);
      ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', '#fff'); ring.setAttribute('stroke-width', '3'); g.appendChild(ring);
      var titel = document.createElementNS(NS, 'title'); titel.textContent = v.n; g.appendChild(titel);
      svg.appendChild(g);
    });
  }

  function vinkelFor(i) { return D.varv * 360 + (360 - i * A) % 360; }

  function valjVinnare() {
    var kand = vinster.map(function (v, i) { return v.slut ? -1 : i; }).filter(function (i) { return i >= 0; });
    if (!kand.length) kand = vinster.map(function (_, i) { return i; });
    var r = 0;
    if (window.crypto && crypto.getRandomValues) { var b = new Uint32Array(1); crypto.getRandomValues(b); r = b[0] / 4294967296; } else r = Math.random();
    return kand[Math.floor(r * kand.length)];
  }

  function snurra() {
    if (snurrar) return;
    snurrar = true; knappSnurra.disabled = true;
    status.hidden = false; status.textContent = C.snurrar;
    var i = valjVinnare();
    var slump = (Math.random() - 0.5) * (A * 0.6);
    svg.classList.remove('bbh-still');
    svg.style.transform = 'rotate(' + (vinkelFor(i) + slump) + 'deg)';
    var klar = false;
    var done = function () { if (klar) return; klar = true; snurrar = false; vinn(i, false); };
    svg.addEventListener('transitionend', done, { once: true });
    setTimeout(done, D.snurrtid + 400);
  }

  function vinn(i, redan) {
    vunnen = vinster[i];
    minne.spara({ h: vunnen.h, v: vunnen.v, n: vunnen.n, p: vunnen.p, datum: new Date().toISOString().slice(0, 10) });
    knappSnurra.hidden = true; status.hidden = true;
    var V = $('bbh-vinst');
    $('bbh-vinst-rubrik').textContent = fyll(redan ? C.redan_rubrik : C.vann_rubrik, { produkt: vunnen.n });
    $('bbh-vinst-bild').src = vunnen.b; $('bbh-vinst-bild').alt = vunnen.n;
    $('bbh-vinst-namn').textContent = vunnen.n;
    $('bbh-vinst-pris').textContent = kr(vunnen.p);
    $('bbh-vinst-text').textContent = fyll(redan ? C.redan_text : C.vann_text, { produkt: vunnen.n, pris: kr(vunnen.p) });
    V.hidden = false;
    $('bbh-kvar').hidden = false;
    byggForslag();
    korgStatus();
    if (!redan) V.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function laggIKorg(variant, namn, egenskaper) {
    return fetch('/cart/add.js', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: [{ id: Number(variant), quantity: 1, properties: egenskaper || {} }] }) })
      .then(function (r) { if (r.status === 422) throw new Error('slut'); if (!r.ok) throw new Error('fel'); return r.json(); });
  }

  // Rabattkoden läggs på EFTER att korgen har varor — /discount fäster inte på
  // en tom korg (mätt i fabriken 2026-09-09). ?redirect=/cart.js gör att
  // omdirigeringen landar på korgen som JSON, några hundra byte i stället för
  // en hel sida. Koden ligger sedan på korgen; kassan tar den därifrån.
  function laggPaKod() {
    return fetch('/discount/' + encodeURIComponent(D.kod) + '?redirect=' + encodeURIComponent('/cart.js'), { credentials: 'same-origin' })
      .catch(function () { return null; });
  }

  // Temats egen varukorgslåda (Impulse): händelsen ajaxProduct:added bygger om
  // lådan ur /cart.js och öppnar den, precis som temats vanliga köpknapp.
  // Bubblan med antalet i sidhuvudet följer med. Så ser kunden vinsten i
  // korgen på riktigt, inte bara i vår text (Axel 2026-09-13).
  function visaTemaKorg() {
    try { document.dispatchEvent(new CustomEvent('ajaxProduct:added', { detail: { product: null } })); } catch (e) {}
  }

  function korgStatus(just) {
    return fetch('/cart.js', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (c) {
      var ovrigt = 0, harVinst = false;
      (c.items || []).forEach(function (it) {
        if (vunnen && String(it.variant_id) === String(vunnen.v)) harVinst = true; else ovrigt += it.final_line_price / 100;
      });
      var el = $('bbh-korg');
      var lagg = $('bbh-lagg');
      lagg.textContent = harVinst ? C.knapp_lagg_klar : C.knapp_lagg;
      lagg.disabled = harVinst;
      el.className = 'bbh-korg';
      var rader = [];
      if (just === 'vinst') rader.push(fyll(C.korg_tillagd, { produkt: vunnen.n }));
      rader.push(ovrigt >= D.minsta
        ? fyll(C.korg_klar, { produkt: vunnen.n })
        : fyll(C.korg_under, { summa: kr(ovrigt), kvar: kr(D.minsta - ovrigt), produkt: vunnen.n }));
      el.textContent = rader.join(' ');
      // Förklaringen: vinsten står till fullt pris i korgen tills gränsen är
      // nådd. Kunder som inte vet det tar bort den (Axel 2026-09-13).
      var f = $('bbh-forklaring');
      f.textContent = fyll(C.korg_forklaring, { produkt: vunnen.n });
      f.hidden = !(harVinst && ovrigt < D.minsta);
      return c;
    }).catch(function () {});
  }

  // Förslagen: EN TILL av det kunden köpte, sedan komplementen som själva når
  // gränsen, sedan storsäljarna. Fyra åt gången, "Visa fler" tar nästa fyra.
  var forslagsKo = [], forslagVisade = 0;
  function byggForslag() {
    var param = new URLSearchParams(location.search).get('produkt') || '';
    var K = D.komplement, sedda = {}, enTill = -1;
    for (var j = 0; j < kat.length; j++) if (kat[j].h === param) { enTill = j; break; }
    var harKarta = param && Object.prototype.hasOwnProperty.call(K.karta, param);
    var storsaljare = {};
    K.storsaljare.forEach(function (i) { storsaljare[i] = true; });
    forslagsKo = []; forslagVisade = 0;
    var laggTill = function (i, etikett) {
      if (!kat[i] || sedda[i]) return;
      if (vunnen && kat[i].h === vunnen.h) return;
      if (kat[i].h === param && etikett !== C.en_till) return;
      sedda[i] = true;
      forslagsKo.push({ i: i, etikett: etikett || (storsaljare[i] ? C.storsaljare_etikett : null) });
    };
    if (enTill >= 0) laggTill(enTill, C.en_till);
    if (harKarta) K.karta[param].forEach(function (i) { laggTill(i, null); });
    K.fallback.forEach(function (i) { laggTill(i, null); });
    $('bbh-kvar-rubrik').textContent = C.kvar_rubrik;
    $('bbh-kvar-text').textContent = harKarta ? C.kvar_text : C.kvar_text_fallback;
    $('bbh-kort').innerHTML = '';
    visaFler();
    $('bbh-kassa').href = '/discount/' + encodeURIComponent(D.kod) + '?redirect=%2Fcheckout';
  }

  function visaFler() {
    var rad = $('bbh-kort');
    var slut = Math.min(forslagVisade + D.perVisning, forslagsKo.length);
    for (var n = forslagVisade; n < slut; n++) rad.appendChild(kort(forslagsKo[n].i, forslagsKo[n].etikett));
    forslagVisade = slut;
    $('bbh-fler').hidden = forslagVisade >= forslagsKo.length;
  }

  function kort(i, etikett) {
    var p = kat[i];
    var d = document.createElement('div'); d.className = 'bbh-kort';
    var url = D.bas + '/products/' + p.h;
    d.innerHTML = '<p class="bbh-etikett">' + (etikett || '&nbsp;') + '</p>' +
      '<a href="' + url + '"><img src="' + p.b + '" alt="" width="120" height="120" loading="lazy"></a>' +
      '<p class="bbh-namn">' + p.n + '</p><p class="bbh-kortpris">' + kr(p.p) + '</p>';
    if (p.ev && p.v !== '') {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'bbh-liten'; b.textContent = C.knapp_lagg_till;
      b.addEventListener('click', function () {
        b.disabled = true; b.textContent = '…';
        laggIKorg(p.v, p.n)
          .then(function () { return laggPaKod(); })
          .then(function () { b.textContent = C.lagd; visaTemaKorg(); return korgStatus('forslag'); })
          .catch(function () { b.disabled = false; b.textContent = C.knapp_lagg_till; });
      });
      d.appendChild(b);
    } else {
      var a = document.createElement('a'); a.className = 'bbh-liten'; a.href = url; a.textContent = C.knapp_se; d.appendChild(a);
    }
    return d;
  }

  $('bbh-fler').addEventListener('click', visaFler);

  $('bbh-lagg').addEventListener('click', function () {
    var b = $('bbh-lagg'); b.disabled = true;
    laggIKorg(vunnen.v, vunnen.n, { _gratishjul: vunnen.n })
      .then(function () { return laggPaKod(); })
      .then(function () { visaTemaKorg(); return korgStatus('vinst'); })
      .catch(function (e) {
        b.disabled = false;
        var el = $('bbh-korg'); el.className = 'bbh-korg bbh-fel';
        if (e.message === 'slut') { el.textContent = C.fel_slut; minne.glom(); vinster[vinster.indexOf(vunnen)].slut = true; vunnen = null; $('bbh-vinst').hidden = true; $('bbh-kvar').hidden = true; knappSnurra.hidden = false; knappSnurra.disabled = false; svg.classList.add('bbh-still'); svg.style.transform = 'rotate(0deg)'; }
        else el.textContent = C.fel_allmant;
      });
  });
  knappSnurra.addEventListener('click', snurra);

  rita();
  uppdateraVinster().then(function () {
    var m = minne.las();
    var i = m ? vinster.map(function (v) { return v.h; }).indexOf(m.h) : -1;
    if (i >= 0 && !vinster[i].slut) {
      svg.classList.add('bbh-still');
      svg.style.transform = 'rotate(' + vinkelFor(i) + 'deg)';
      vinn(i, true);
    } else if (m) { minne.glom(); }
  });
})();
`;
}

// Hela sidkroppen (det som skrivs till Shopify som page.body).
export function byggHjulsida(indata) {
  const { konfig: k, copy } = indata;
  const c = copy.hjul;
  // Hela indatan vidare: alla + storsaljare behövs för förslagen. Att bara
  // plocka ut tre fält här gav en tom storsäljarlista på den publicerade
  // sidan 2026-09-13, fast loggen sa tolv.
  const data = hjulData(indata);
  const json = JSON.stringify(data).replace(/<\//g, '<\\/');
  return `<div id="bb-hjul">
<style>${stil(k)}</style>
<p class="bbh-etikett">${esk(c.forrubrik)}</p>
<p class="bbh-intro">${esk(c.intro)}</p>
<div class="bbh-scen">
  <div class="bbh-pil" aria-hidden="true"></div>
  <div class="bbh-hjul"><svg id="bbh-svg" viewBox="0 0 400 400" role="img" aria-label="${esk(c.titel)}"></svg></div>
  <div class="bbh-nav" aria-hidden="true">${esk(k.butik.namn.split('.')[0].slice(0, 5))}</div>
</div>
<button type="button" id="bbh-snurra" class="bbh-knapp">${esk(c.knapp_snurra)}</button>
<p id="bbh-status" class="bbh-status" hidden></p>
<div id="bbh-vinst" class="bbh-vinst" hidden>
  <h2 id="bbh-vinst-rubrik"></h2>
  <div class="bbh-vinst-kort"><img id="bbh-vinst-bild" src="" alt="" width="96" height="96"><div><p id="bbh-vinst-namn"></p><p class="bbh-pris"><s id="bbh-vinst-pris"></s> <strong>0 kr</strong></p></div></div>
  <p id="bbh-vinst-text"></p>
  <button type="button" id="bbh-lagg" class="bbh-knapp">${esk(c.knapp_lagg)}</button>
  <p id="bbh-korg" class="bbh-korg"></p>
  <p id="bbh-forklaring" class="bbh-forklaring" hidden></p>
</div>
<div id="bbh-kvar" class="bbh-kvar" hidden>
  <h2 id="bbh-kvar-rubrik"></h2>
  <p id="bbh-kvar-text"></p>
  <div id="bbh-kort" class="bbh-kort-rad"></div>
  <button type="button" id="bbh-fler" class="bbh-knapp bbh-knapp--tunn" hidden>${esk(c.knapp_visa_fler)}</button>
  <a id="bbh-kassa" class="bbh-knapp bbh-knapp--sek" href="${esk(k.butik.url)}/discount/${esk(k.erbjudande.kod)}?redirect=%2Fcheckout">${esk(c.knapp_kassa)}</a>
</div>
<p class="bbh-finstilt">${esk(c.finstilt)}</p>
<script type="application/json" id="bbh-data">${json}</script>
<script>${skript()}</script>
</div>`;
}

// Fristående förhandsvisning (för skärmdump utan Shopify): samma kropp i ett
// tomt dokument. Produkt- och korganropen misslyckas lokalt och sidan faller
// tillbaka på det inbakade — det är avsikten.
export function byggHjulForhandsvisning(indata) {
  const c = indata.copy.hjul;
  return `<!DOCTYPE html>
<html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esk(c.titel)}</title>
<style>body{margin:0;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;background:#f7f7f7}h1{text-align:center;font-family:Impact,'Arial Black',sans-serif;text-transform:uppercase;font-weight:400;font-size:40px;margin:0 0 16px}.rte{background:#fff;padding:24px 16px;max-width:760px;margin:0 auto}</style></head>
<body><h1>${esk(c.titel)}</h1><div class="rte">${byggHjulsida(indata)}</div>
<script>
  // Bara i förhandsvisningen: ?auto=1 snurrar hjulet direkt, så vinstrutan
  // och förslagen går att se på en skärmdump. Ligger aldrig i Shopify-sidan.
  if (location.search.indexOf('auto') >= 0) {
    setTimeout(function () { var b = document.getElementById('bbh-snurra'); if (b) b.click(); }, 600);
  }
</script>
</body></html>`;
}
