// Klaviyo-mejlen ur block (kontraktet: klaviyo/ARKITEKTUR.md → "Innehållsformatet").
//
// Samma designsystem som Shopify-notiserna i mejl/mallar.mjs: 600 px bred
// tabell, inline-CSS, en liten @media-regel under 480 px, gömd förhandstext,
// svart sidhuvud med den vita loggan, Impact i versaler för rubriker och röd
// (#dd1d1d) knapp. Blocken här är egna — notismallarna är byggda för Shopifys
// Liquid och deras order-objekt — men stilsträngarna är desamma.
//
// Varje mejl byggs i TVÅ lägen ur samma kod, precis som notiserna:
//   'klaviyo' → HTML:en som laddas upp som mall. Klaviyos mallspråk (Django-
//               likt): {{ first_name|default:'' }}, {% unsubscribe %},
//               {{ organization.full_address }}, händelsevariabler i flöden.
//   'exempel' → samma HTML med exempelvärden ("Anna", två riktiga produkter i
//               de dynamiska blocken), så Axel kan titta utan Klaviyo.
//
// Klaviyos taggar, med källa (lästa 2026-09-24):
//   {{ first_name|default:'…' }}, {% unsubscribe 'text' %},
//   {% manage_preferences 'text' %}, {{ organization.name }},
//   {{ organization.full_address }}
//     https://help.klaviyo.com/hc/en-us/articles/4408802648731
//   {% unsubscribe_link %} (bara adressen, används i textversionen)
//     https://help.klaviyo.com/hc/en-us/articles/115006054267
// Händelsevariablerna står vid DYNAMISKA längre ner, var och en med källa
// eller märkt "verifieras med template-render".

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kr, bildLiten, kortnamn } from '../mejl/mallar.mjs';

export const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const esk = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// "mejl/konfig.json#butik" → objektet under nyckeln (punkter = djupare nivåer).
export function lasRef(ref, rot = ROT) {
  if (!ref) return null;
  const [fil, nyckel] = String(ref).split('#');
  const data = JSON.parse(readFileSync(join(rot, fil), 'utf8'));
  return nyckel ? nyckel.split('.').reduce((o, k) => o?.[k], data) : data;
}

// Stilen och erbjudandet brandfilen pekar på. Hjulets sida ligger bredvid
// erbjudandet i samma konfig (`hjul.handle`).
export function laddaBrandResurser(brand, rot = ROT) {
  const stil = lasRef(brand.stil_fran, rot);
  let erbjudande = null;
  if (brand.erbjudande_fran) {
    erbjudande = { ...lasRef(brand.erbjudande_fran, rot) };
    const [fil] = brand.erbjudande_fran.split('#');
    const hjul = lasRef(`${fil}#hjul`, rot);
    if (hjul?.handle) erbjudande.hjul_handle = hjul.handle;
  }
  return { stil, erbjudande };
}

export const EXEMPEL_FORNAMN = 'Anna';

// ---------------------------------------------------------------------------
// Text och länkar
// ---------------------------------------------------------------------------

// {{fornamn}} i copyn. Klaviyo-läget: `first_name` med tom fallback, och
// mellanslaget/kommatecknet runt namnet följer bara med när namnet finns —
// annars blir "Hej {{fornamn}}," till "Hej ," hos den som saknar förnamn.
export function ersattFornamn(text, lage) {
  const t = String(text ?? '');
  if (lage !== 'klaviyo') return t.split('{{fornamn}}').join(EXEMPEL_FORNAMN);
  // Ordningen spelar roll: "Hej {{fornamn}}, vi…" ska bli "Hej, vi…" utan namn,
  // så mellanslaget FÖRE namnet tas först; "{{fornamn}}, du…" först på raden
  // tappar hela "namn, " utan namn.
  return t
    .replace(/ \{\{fornamn\}\}/g, "{% if first_name %} {{ first_name|default:'' }}{% endif %}")
    .replace(/\{\{fornamn\}\}, /g, "{% if first_name %}{{ first_name|default:'' }}, {% endif %}")
    .replace(/\{\{fornamn\}\}/g, "{{ first_name|default:'' }}");
}

// Copy → HTML-säker text med förnamnet insatt. Eskapningen sker FÖRE
// ersättningen, så mallspråket (enkla citattecken) inte eskapas sönder.
const kundtext = (text, lage) => ersattFornamn(esk(text), lage);

const stycken = (text) =>
  String(text ?? '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

// Länkspråket i innehållsfilerna → riktig adress. Ingen UTM här: Klaviyo
// lägger på den själv (brandfilens `utm` är kontots inställning).
export function lank(spec, ctx) {
  const s = String(spec ?? '').trim();
  const bas = ctx.brand.butik_url.replace(/\/$/, '');
  const [typ, ...rest] = s.split(':');
  const varde = rest.join(':');
  if (typ === 'produkt') {
    const p = ctx.produkt(varde);
    return p?.url ?? `${bas}/products/${varde}`;
  }
  if (typ === 'kollektion') return `${bas}/collections/${varde}`;
  // "sparning:" = kundens eget paket på butikens spårningssida. Klaviyos
  // mallspråk saknar sha256 (mätt 2026-09-25), så bävernumret går inte att
  // räkna fram här. Fraktbolagets nummer skickas base64-kodat som ?k= och
  // sidan byter det mot bävernumret (sparning/sida.mjs). Bara i flöden som
  // triggas av Fulfilled Order — där bär händelsen fulfillments.
  if (typ === 'sparning') {
    const sida = `${bas}${(varde || '/pages/spara').startsWith('/') ? '' : '/'}${varde || '/pages/spara'}`;
    if (ctx.lage === 'exempel') return `${sida}?k=WVQyNjI2MTAwNzA4Njc0Njkw`;
    return `${sida}{% if event.extra.fulfillments.0.tracking_number %}?k={{ event.extra.fulfillments.0.tracking_number|base64_encode|urlencode }}{% endif %}`;
  }
  if (typ === 'sida') return `${bas}${varde.startsWith('/') ? '' : '/'}${varde}`;
  if (typ === 'url' && /^https:\/\//.test(varde)) return varde;
  if (/^https:\/\//.test(s)) return s;
  ctx.varningar.push(`Okänd länk "${s}", knappen pekar på butikens startsida.`);
  return bas;
}

// ---------------------------------------------------------------------------
// Stil (samma strängar som mejl/mallar.mjs stil())
// ---------------------------------------------------------------------------

export function stilFran(butik) {
  return {
    rubrik: `font-family: ${butik.font_rubrik}; text-transform: uppercase;`,
    brod: 'font-family: Arial,Helvetica,sans-serif;',
    rod: butik.farg_rod ?? '#dd1d1d',
    svart: butik.farg_svart ?? '#000000',
    ram: butik.farg_ram ?? '#e8e8e1',
    gra: '#6b6b6b',
  };
}

// ---------------------------------------------------------------------------
// Byggstenar
// ---------------------------------------------------------------------------

const rad = (inre, padding = '0 32px 8px') => `
          <tr>
            <td style="padding: ${padding};">${inre}
            </td>
          </tr>`;

function knappHtml(s, text, href, { liten = false } = {}) {
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="kl-knapp" align="center">
                <tr>
                  <td align="center" bgcolor="${s.rod}">
                    <a href="${href}" target="_blank" style="display: inline-block; ${s.rubrik} font-size: ${liten ? 15 : 18}px; letter-spacing: 1px; color: #ffffff; text-decoration: none; padding: ${liten ? '12px 32px' : '16px 44px'};">${esk(text)}</a>
                  </td>
                </tr>
              </table>`;
}

function rubrikHtml(s, text, lage, { storlek = 30, farg = null, align = 'center' } = {}) {
  return `<p class="kl-rubrik" align="${align}" style="${s.rubrik} font-size: ${storlek}px; line-height: 1.15; color: ${farg ?? s.svart}; margin: 0;">${kundtext(text, lage)}</p>`;
}

function styckenHtml(s, text, lage, { farg = null, storlek = 15, align = 'left' } = {}) {
  return stycken(text)
    .map((st, i) => `<p align="${align}" style="${s.brod} font-size: ${storlek}px; line-height: 1.6; color: ${farg ?? s.svart}; margin: ${i ? 12 : 0}px 0 0;">${kundtext(st, lage).replace(/\n/g, '<br>')}</p>`)
    .join('\n              ');
}

function prisHtml(s, p, { storlek = 15 } = {}) {
  if (!p) return '';
  const jf = p.jamforpris && p.jamforpris > p.pris ? ` <span style="color: ${s.gra}; text-decoration: line-through; font-weight: normal;">${kr(p.jamforpris)}</span>` : '';
  return `<p style="${s.brod} font-size: ${storlek}px; font-weight: bold; color: ${s.rod}; margin: 6px 0 0;">${kr(p.pris)}${jf}</p>`;
}

function produktbild(s, url, bredd, alt = '') {
  return `<img src="${esk(url)}" alt="${esk(alt)}" width="${bredd}" style="display: block; width: 100%; max-width: ${bredd}px; height: auto; border: 1px solid ${s.ram}; margin: 0 auto;">`;
}

function kort(s, { href, bild, namn, pris, bredd = 33 }) {
  return `
                  <td class="kl-kort" width="${bredd}%" valign="top" align="center" style="padding: 8px 6px;">
                    <a href="${href}" target="_blank" style="text-decoration: none;">
                      ${bild ? produktbild(s, bild, 150, namn) : ''}
                      <p style="${s.brod} font-size: 13px; line-height: 1.4; color: ${s.svart}; margin: 8px 0 0;">${namn}</p>
                      ${pris ?? ''}
                    </a>
                  </td>`;
}

// ---------------------------------------------------------------------------
// De dynamiska blocken (bara flöden, bara klaviyo-läget har mallspråk)
// ---------------------------------------------------------------------------

// Checkout Started (Shopify):
//   {% for item in event.extra.line_items %}, item.product.title,
//   item.quantity — https://help.klaviyo.com/hc/en-us/articles/115002779411
//   event.extra.line_items.0.product.title / .line_price / .product.images.0.src
//     — https://help.klaviyo.com/hc/en-us/articles/115002779071
//   event.extra.responsive_checkout_url
//     — https://help.klaviyo.com/hc/en-us/articles/115005253188
//   event.extra.checkout_url (reserv om responsive saknas)
//     — https://help.klaviyo.com/hc/en-us/articles/115002779411
//   |floatformat:0 på priset: Django-filter, verifieras med template-render.
// Viewed Product:
//   event.ImageURL, event.URL, event.Price, event.Name
//     — https://help.klaviyo.com/hc/en-us/articles/115002775252
//   event.ProductName (namnet i Klaviyos spårningsexempel,
//     https://developers.klaviyo.com/en/docs/guide-to-integrating-a-platform-without-a-pre-built-klaviyo-integration)
//     — vilket av Name/ProductName Shopify-appen skickar verifieras med
//     template-render; mallen tar ProductName och faller på Name.
// Placed Order:
//   event.extra.line_items med item.title, item.quantity, item.line_price,
//   item.product.images.0.src — samma form som kassan men INTE bekräftad i
//   Klaviyos artiklar för Placed Order: verifieras med template-render.
const DYNAMISKA = {
  checkout_rader: {
    rubrik: 'Det här ligger kvar i din varukorg',
    loop: 'event.extra.line_items',
    titel: '{{ item.product.title }}',
    bild: 'item.product.images.0.src',
    antal: '{{ item.quantity }}',
    pris: "{{ item.line_price|floatformat:0 }} kr",
    knappText: 'Tillbaka till kassan',
    knappHref: '{% if event.extra.responsive_checkout_url %}{{ event.extra.responsive_checkout_url }}{% else %}{{ event.extra.checkout_url }}{% endif %}',
  },
  order_rader: {
    rubrik: 'Det här beställde du',
    loop: 'event.extra.line_items',
    titel: '{{ item.title }}',
    bild: 'item.product.images.0.src',
    antal: '{{ item.quantity }}',
    pris: "{{ item.line_price|floatformat:0 }} kr",
    knappText: null,
  },
};

function dynamiskRadHtml(s, { bild, titel, antal, pris, bildVillkor }) {
  const img = `<img src="${bild}" alt="" width="80" height="80" style="display: block; width: 80px; height: 80px; object-fit: cover; border: 1px solid ${s.ram};">`;
  return `
                <tr>
                  <td width="92" valign="middle" style="padding: 10px 0;">${bildVillkor ? `{% if ${bildVillkor} %}${img}{% endif %}` : img}</td>
                  <td valign="middle" style="padding: 10px 0 10px 12px;">
                    <p style="${s.brod} font-size: 14px; font-weight: bold; color: ${s.svart}; margin: 0;">${titel}</p>
                    <p style="${s.brod} font-size: 13px; color: ${s.gra}; margin: 2px 0 0;">Antal: ${antal}</p>
                  </td>
                  <td align="right" valign="middle" style="${s.brod} font-size: 14px; color: ${s.svart}; white-space: nowrap; padding: 10px 0;">${pris}</td>
                </tr>`;
}

function exempelProdukter(ctx) {
  const anvanda = [...ctx.handles].map((h) => ctx.produkt(h)).filter((p) => p?.bild);
  const reserv = ctx.produktlista.filter((p) => p.bild && p.kopbar !== false);
  return [...anvanda, ...reserv].filter((p, i, a) => a.indexOf(p) === i).slice(0, 2);
}

function dynamiskBlock(b, ctx) {
  const { s, lage } = ctx;
  if (b.kalla === 'visad_produkt') {
    if (lage === 'klaviyo') {
      const namn = '{% if event.ProductName %}{{ event.ProductName }}{% else %}{{ event.Name }}{% endif %}';
      return rad(`
              <a href="{{ event.URL }}" target="_blank" style="text-decoration: none;">
                {% if event.ImageURL %}<img src="{{ event.ImageURL }}" alt="" width="300" style="display: block; width: 100%; max-width: 300px; height: auto; border: 1px solid ${s.ram}; margin: 0 auto;">{% endif %}
                <p align="center" style="${s.brod} font-size: 16px; font-weight: bold; color: ${s.svart}; margin: 12px 0 0;">${namn}</p>
                {% if event.Price %}<p align="center" style="${s.brod} font-size: 15px; font-weight: bold; color: ${s.rod}; margin: 6px 0 0;">{{ event.Price|floatformat:0 }} kr</p>{% endif %}
              </a>${knappHtml(s, 'Titta igen', '{{ event.URL }}')}`, '16px 32px 16px');
    }
    const p = exempelProdukter(ctx)[0];
    if (!p) return '';
    return rad(`
              <a href="${esk(p.url)}" target="_blank" style="text-decoration: none;">
                ${produktbild(s, bildLiten(p.bild, 600), 300, p.titel)}
                <p align="center" style="${s.brod} font-size: 16px; font-weight: bold; color: ${s.svart}; margin: 12px 0 0;">${esk(p.titel)}</p>
                <p align="center" style="${s.brod} font-size: 15px; font-weight: bold; color: ${s.rod}; margin: 6px 0 0;">${kr(p.pris)}</p>
              </a>${knappHtml(s, 'Titta igen', esk(p.url))}`, '16px 32px 16px');
  }
  const d = DYNAMISKA[b.kalla];
  if (!d) {
    ctx.varningar.push(`Okänd dynamisk källa "${b.kalla}", blocket utgår.`);
    return '';
  }
  let rader;
  let href = d.knappHref;
  if (lage === 'klaviyo') {
    rader = `{% for item in ${d.loop} %}${dynamiskRadHtml(s, { bild: `{{ ${d.bild} }}`, bildVillkor: d.bild, titel: d.titel, antal: d.antal, pris: d.pris })}{% endfor %}`;
  } else {
    const ex = exempelProdukter(ctx);
    rader = ex.map((p) => dynamiskRadHtml(s, { bild: esk(bildLiten(p.bild)), titel: esk(p.titel), antal: 1, pris: kr(p.pris) })).join('');
    href = esk(ctx.brand.butik_url);
  }
  const rubrik = `<p style="${s.rubrik} font-size: 16px; color: ${s.svart}; letter-spacing: 0.5px; margin: 0 0 4px;">${esk(d.rubrik)}</p>`;
  return rad(`
              ${rubrik}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid ${s.ram}; border-bottom: 1px solid ${s.ram};">${rader}
              </table>${d.knappText ? `
              <div style="height: 20px; line-height: 20px; font-size: 0;">&nbsp;</div>${knappHtml(s, d.knappText, href)}` : ''}`, '20px 32px 12px');
}

// ---------------------------------------------------------------------------
// Blocken
// ---------------------------------------------------------------------------

function handleUr(spec) {
  const m = /^produkt:(.+)$/.exec(String(spec ?? '').trim());
  return m ? m[1] : null;
}

const BLOCK = {
  hero(b, ctx) {
    const { s, lage } = ctx;
    const h = handleUr(b.bild);
    const p = h ? ctx.produkt(h) : null;
    let bild = '';
    if (h && p?.bild) bild = `<a href="${esk(p.url)}" target="_blank">${produktbild(s, bildLiten(p.bild, 600), 536, p.titel)}</a>`;
    else if (b.bild && /^https:\/\//.test(b.bild)) bild = produktbild(s, b.bild, 536);
    else if (b.bild) ctx.varningar.push(`Hero-bilden "${b.bild}" gick inte att hitta.`);
    return (
      (bild ? rad(bild, '24px 32px 0') : '') +
      (b.rubrik ? rad(rubrikHtml(s, b.rubrik, lage), '28px 32px 8px') : '') +
      (b.text ? rad(styckenHtml(s, b.text, lage, { align: 'center' }), '8px 32px 4px') : '') +
      (b.knapp ? rad(knappHtml(s, b.knapp.text, esk(lank(b.knapp.lank, ctx))), '20px 32px 12px') : '')
    );
  },
  text(b, ctx) {
    const { s, lage } = ctx;
    return (
      (b.rubrik ? rad(rubrikHtml(s, b.rubrik, lage, { storlek: 20, align: 'left' }), '24px 32px 6px') : '') +
      rad(styckenHtml(s, b.text, lage), '8px 32px 8px')
    );
  },
  punkter(b, ctx) {
    const { s, lage } = ctx;
    const rader = (b.punkter ?? [])
      .map(
        (t) => `
                <tr>
                  <td width="22" valign="top" style="padding: 9px 0 0;"><div style="width: 8px; height: 8px; background-color: ${s.rod}; font-size: 0; line-height: 0;">&nbsp;</div></td>
                  <td style="${s.brod} font-size: 15px; line-height: 1.5; color: ${s.svart}; padding: 3px 0;">${kundtext(t, lage)}</td>
                </tr>`
      )
      .join('');
    return (
      (b.rubrik ? rad(rubrikHtml(s, b.rubrik, lage, { storlek: 20, align: 'left' }), '24px 32px 6px') : '') +
      rad(`
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rader}
              </table>`, '4px 32px 12px')
    );
  },
  produkt(b, ctx) {
    const { s, lage } = ctx;
    const p = ctx.produkt(b.handle);
    if (!p) {
      ctx.varningar.push(`Produkten "${b.handle}" finns inte i Shopify-datan, blocket utgår.`);
      return '';
    }
    return rad(`
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid ${s.ram};">
                <tr>
                  <td class="kl-stapla" width="45%" valign="middle" style="padding: 16px;">
                    <a href="${esk(p.url)}" target="_blank">${p.bild ? produktbild(s, bildLiten(p.bild, 480), 220, p.titel) : ''}</a>
                  </td>
                  <td class="kl-stapla" valign="middle" style="padding: 16px 16px 16px 4px;">
                    <p style="${s.brod} font-size: 16px; font-weight: bold; line-height: 1.35; color: ${s.svart}; margin: 0;">${esk(kortnamn(p.titel))}</p>
                    ${prisHtml(s, p)}
                    ${b.text ? `<div style="margin-top: 10px;">${styckenHtml(s, b.text, lage, { storlek: 14 })}</div>` : ''}
                    <div style="height: 14px; line-height: 14px; font-size: 0;">&nbsp;</div>${knappHtml(s, b.knapp ?? 'Till produkten', esk(p.url), { liten: true })}
                  </td>
                </tr>
              </table>`, '16px 32px 12px');
  },
  produktrad(b, ctx) {
    const { s, lage } = ctx;
    const bredd = Math.floor(100 / Math.max(1, Math.min((b.handles ?? []).length, 4)));
    const kortHtml = (b.handles ?? [])
      .map((h) => {
        const p = ctx.produkt(h);
        if (!p) {
          ctx.varningar.push(`Produkten "${h}" i produktraden finns inte i Shopify-datan, kortet utgår.`);
          return '';
        }
        return kort(s, { href: esk(p.url), bild: p.bild ? bildLiten(p.bild, 300) : null, namn: esk(kortnamn(p.titel)), pris: prisHtml(s, p, { storlek: 13 }), bredd });
      })
      .join('');
    if (!kortHtml) return '';
    return (
      (b.rubrik ? rad(rubrikHtml(s, b.rubrik, lage, { storlek: 20 }), '24px 32px 6px') : '') +
      rad(`
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>${kortHtml}
                </tr>
              </table>`, '4px 26px 12px')
    );
  },
  citat(b, ctx) {
    const { s } = ctx;
    const antal = Math.min(Number(b.antal ?? 2) || 2, 2);
    const lista = (ctx.recensioner?.[b.handle] ?? []).slice(0, antal);
    if (!lista.length) {
      ctx.varningar.push(`Inga riktiga recensioner (4-5 stjärnor) för "${b.handle}", citatblocket utgår.`);
      return '';
    }
    const inre = lista
      .map(
        (r, i) => `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7f7f7" style="border-left: 4px solid ${s.rod};${i ? ' margin-top: 12px;' : ''}">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="${s.brod} font-size: 15px; color: ${s.rod}; letter-spacing: 2px; margin: 0 0 6px;">${'&#9733;'.repeat(Math.round(r.betyg))}</p>
                    <p style="${s.brod} font-size: 14px; line-height: 1.6; color: ${s.svart}; font-style: italic; margin: 0;">&#8220;${esk(r.text)}&#8221;</p>
                    <p style="${s.brod} font-size: 13px; color: ${s.gra}; margin: 8px 0 0;">${esk(r.namn)}, verifierad kund</p>
                  </td>
                </tr>
              </table>`
      )
      .join('');
    return rad(inre, '16px 32px 12px');
  },
  knapp(b, ctx) {
    return rad(knappHtml(ctx.s, b.text, esk(lank(b.lank, ctx))), '20px 32px 12px');
  },
  grundare(b, ctx) {
    const { s, lage } = ctx;
    const namn = ctx.stil.grundare ?? 'Axel';
    return rad(`
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7f7f7" style="border-left: 4px solid ${s.rod};">
                <tr>
                  <td style="padding: 18px 20px;">
                    ${styckenHtml(s, b.text, lage, { storlek: 14 })}
                    <p style="${s.brod} font-size: 13px; color: ${s.gra}; margin: 10px 0 0;">${esk(namn)}, grundare</p>
                  </td>
                </tr>
              </table>`, '16px 32px 12px');
  },
  fakta(b, ctx) {
    const { s, brand } = ctx;
    const celler = [
      // Leveranstiden står aldrig i ett mejl som bär spårningslänken — sidan
      // visar beräknad leverans själv (CLAUDE.md, Axels order 2026-09-21 + 2026-09-25).
      ['Ångerrätt', brand.angerratt_text, null],
      ['Spåra paketet', 'Följ det hela vägen', brand.sparningssida],
    ]
      .filter(([, v]) => v)
      .map(
        ([etikett, v, href]) => `
                  <td class="kl-kort" width="33%" valign="top" align="center" style="padding: 12px 6px;">
                    <p style="${s.brod} font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: ${s.rod}; margin: 0 0 4px;">${esk(etikett)}</p>
                    <p style="${s.brod} font-size: 13px; line-height: 1.4; color: ${s.svart}; margin: 0;">${href ? `<a href="${esk(href)}" target="_blank" style="color: ${s.svart};">${esk(v)}</a>` : esk(v)}</p>
                  </td>`
      )
      .join('');
    return rad(`
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid ${s.ram}; border-bottom: 1px solid ${s.ram};">
                <tr>${celler}
                </tr>
              </table>`, '20px 32px 12px');
  },
  // Köp igen → vinn en gratisprodukt på lyckohjulet (mejl/konfig.json →
  // erbjudande, Axels beslut 2026-09-13). Villkoren och beloppen kommer ur
  // konfigen, aldrig ur copyn; copyns `text` är bara ingressen.
  erbjudande(b, ctx) {
    const { s, lage, erbjudande: e, brand } = ctx;
    if (!e?.kod) {
      ctx.varningar.push('Erbjudandet saknas i brandets konfig (erbjudande_fran), blocket utgår.');
      return '';
    }
    const vinster = (e.gratisprodukter ?? []).map((h) => ctx.produkt(h)).filter((p) => p?.bild);
    const maxVarde = vinster.length ? Math.max(...vinster.map((p) => p.pris)) : null;
    const hjulUrl = `${brand.butik_url.replace(/\/$/, '')}/pages/${e.hjul_handle ?? e.kollektion_handle ?? 'din-gratisprodukt'}`;
    const villkor = erbjudandeVillkor(e, maxVarde);
    const perRad = 5;
    const rader = [];
    for (let i = 0; i < vinster.length; i += perRad) rader.push(vinster.slice(i, i + perRad));
    const vinstHtml = rader
      .map(
        (r) => `
                <tr>${r
                  .map(
                    (p) => `
                  <td class="kl-vinst" width="20%" valign="top" align="center" style="padding: 6px 3px;">
                    <img src="${esk(bildLiten(p.bild))}" alt="" width="72" height="72" style="display: block; border: 1px solid ${s.ram}; margin: 0 auto;">
                    <p style="${s.brod} font-size: 11px; line-height: 1.3; color: ${s.gra}; margin: 5px 0 0;">${esk(kortnamn(p.titel))}</p>
                  </td>`
                  )
                  .join('')}${'<td width="20%"></td>'.repeat(perRad - r.length)}
                </tr>`
      )
      .join('');
    return (
      rad(`
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${s.svart}">
                <tr>
                  <td align="center" style="padding: 26px 24px 22px;">
                    <p style="${s.brod} font-size: 12px; font-weight: bold; color: ${s.rod}; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">Din kundgåva</p>
                    <p class="kl-rubrik" style="${s.rubrik} font-size: 30px; line-height: 1.1; color: #ffffff; margin: 0;">Snurra hjulet, vinn en gratis produkt</p>
                    ${b.text ? `<div style="margin: 12px 0 0;">${styckenHtml(s, b.text, lage, { farg: '#d9d9d9', align: 'center' })}</div>` : ''}
                    <p style="${s.brod} font-size: 14px; line-height: 1.6; color: #ffffff; margin: 12px 0 18px;">${esk(villkor.kort)}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 18px;">
                      <tr>
                        <td style="border: 2px dashed #ffffff; padding: 10px 22px;">
                          <span style="${s.brod} font-size: 12px; color: #d9d9d9; letter-spacing: 1px; text-transform: uppercase;">Din gåvokod:</span>
                          <span style="${s.rubrik} font-size: 24px; color: #ffffff; letter-spacing: 3px; padding-left: 8px;">${esk(e.kod)}</span>
                        </td>
                      </tr>
                    </table>${knappHtml(s, 'Snurra hjulet', esk(hjulUrl))}
                  </td>
                </tr>
              </table>`, '20px 32px 8px') +
      (vinstHtml
        ? rad(`<p style="${s.rubrik} font-size: 16px; color: ${s.svart}; margin: 0 0 4px;">Det här kan du vinna</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${vinstHtml}
              </table>`, '12px 28px 4px')
        : '') +
      rad(`<p style="${s.brod} font-size: 11px; line-height: 1.5; color: ${s.gra}; margin: 0;">${esk(villkor.finstilt)}</p>`, '4px 32px 12px')
    );
  },
  dynamisk: dynamiskBlock,
};

// ---------------------------------------------------------------------------
// format: "rentext" — ett personligt mejl från Axel (ARKITEKTUR.md, mejlnivå).
// Ingen hero, inga produktkort, ingen svart logga-rad: brödtext i Arial 16px,
// högst en länk, signaturen "Axel, <butik>" och samma juridiska sidfot.
// Klaviyo rekommenderar ren text för välkomst E1, efter köp E1 och sunset.
// ---------------------------------------------------------------------------

export const RENTEXT_BLOCK = ['text', 'knapp', 'grundare', 'fakta', 'erbjudande'];
const RT_BROD = 'font-family: Arial,Helvetica,sans-serif; font-size: 16px; line-height: 1.6;';

function rtStycken(s, text, lage) {
  return stycken(text)
    .map((st) => `<p style="${RT_BROD} color: ${s.svart}; margin: 0 0 16px;">${kundtext(st, lage).replace(/\n/g, '<br>')}</p>`)
    .join('\n              ');
}

function rtLank(s, text, href) {
  return `<p style="${RT_BROD} margin: 0 0 16px;"><a href="${href}" target="_blank" style="color: ${s.svart}; font-weight: bold; text-decoration: underline;">${esk(text)}</a></p>`;
}

const RENTEXT = {
  text(b, ctx) {
    const { s, lage } = ctx;
    return rad(
      (b.rubrik ? `<p style="${RT_BROD} font-weight: bold; color: ${s.svart}; margin: 0 0 8px;">${kundtext(b.rubrik, lage)}</p>` : '') + rtStycken(s, b.text, lage),
      '0 32px 0'
    );
  },
  knapp(b, ctx) {
    return rad(rtLank(ctx.s, b.text, esk(lank(b.lank, ctx))), '0 32px 0');
  },
  // Hela mejlet är redan från Axel: grundarblocket blir vanliga stycken.
  grundare(b, ctx) {
    return rad(rtStycken(ctx.s, b.text, ctx.lage), '0 32px 0');
  },
  fakta(b, ctx) {
    const { s, brand } = ctx;
    const rader = [
      brand.angerratt_text ? `Ångerrätt: ${esk(brand.angerratt_text)}` : null,
      brand.sparningssida ? `Spåra paketet: <a href="${esk(brand.sparningssida)}" target="_blank" style="color: ${s.svart};">${esk(brand.sparningssida.replace(/^https:\/\//, ''))}</a>` : null,
    ].filter(Boolean);
    return rad(`<p style="${RT_BROD} color: ${s.svart}; margin: 0 0 16px;">${rader.join('<br>')}</p>`, '0 32px 0');
  },
  erbjudande(b, ctx) {
    const { s, lage, erbjudande: e, brand } = ctx;
    if (!e?.kod) {
      ctx.varningar.push('Erbjudandet saknas i brandets konfig (erbjudande_fran), blocket utgår.');
      return '';
    }
    const vinster = (e.gratisprodukter ?? []).map((h) => ctx.produkt(h)).filter((p) => p?.bild);
    const maxVarde = vinster.length ? Math.max(...vinster.map((p) => p.pris)) : null;
    const hjulUrl = `${brand.butik_url.replace(/\/$/, '')}/pages/${e.hjul_handle ?? e.kollektion_handle ?? 'din-gratisprodukt'}`;
    const v = erbjudandeVillkor(e, maxVarde);
    return rad(
      (b.text ? rtStycken(s, b.text, lage) : '') +
      `<p style="${RT_BROD} color: ${s.svart}; margin: 0 0 16px;">${esk(v.kort)} Din gåvokod: <strong>${esk(e.kod)}</strong></p>` +
      rtLank(s, 'Snurra hjulet', esk(hjulUrl)) +
      `<p style="font-family: Arial,Helvetica,sans-serif; font-size: 12px; line-height: 1.5; color: ${s.gra}; margin: 0 0 16px;">${esk(v.finstilt)}</p>`,
      '0 32px 0'
    );
  },
};

export function signatur(ctx) {
  return `${ctx.stil.grundare ?? 'Axel'}, ${ctx.brand.namn}`;
}

function rentextDokument(ctx, { titel, forhandstext, rader }) {
  const { s, brand, lage } = ctx;
  const avreg = lage === 'klaviyo' ? "{% unsubscribe 'Avregistrera dig' %}" : `<a href="#" style="color: ${s.gra};">Avregistrera dig</a>`;
  const org = lage === 'klaviyo' ? '{{ organization.name }}, {{ organization.full_address }}' : `${esk(brand.namn)}, (adressen hämtas ur Klaviyo)`;
  const utfyllnad = '&#847;&zwnj;&nbsp;'.repeat(60);
  return `<!DOCTYPE html>
<html lang="${esk(brand.sprak ?? 'sv')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${kundtext(titel, lage)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${kundtext(forhandstext, lage)}${utfyllnad}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
    <tr>
      <td align="left" style="padding: 24px 0 8px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">${rader}
          <tr>
            <td style="padding: 0 32px 24px;"><p style="${RT_BROD} color: ${s.svart}; margin: 0;">${esk(signatur(ctx))}</p></td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 28px; border-top: 1px solid ${s.ram};">
              <p style="font-family: Arial,Helvetica,sans-serif; font-size: 12px; line-height: 1.7; color: ${s.gra}; margin: 0;">${esk(varforText(brand))}</p>
              <p style="font-family: Arial,Helvetica,sans-serif; font-size: 12px; line-height: 1.7; color: ${s.gra}; margin: 4px 0 0;">${avreg}</p>
              <p style="font-family: Arial,Helvetica,sans-serif; font-size: 12px; line-height: 1.7; color: ${s.gra}; margin: 4px 0 0;">${org}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Villkoren i klartext ur konfigen. Samma formuleringar som notiserna
// (mejl/copy.json → upsell), men beloppen läses ur konfigen och Shopify.
export function erbjudandeVillkor(e, maxVarde = null) {
  const min = kr(e.minsta_kop_sek);
  const antal = e.gratis_antal ?? 1;
  const vad = antal === 1 ? 'en produkt' : `${antal} produkter`;
  return {
    kort: `Snurra hjulet och vinn ${vad} gratis${maxVarde ? `, värde upp till ${kr(maxVarde)}` : ''}, som blir din vid nästa köp på minst ${min}.`,
    finstilt: `Gäller vid nästa köp på minst ${min}${e.en_gang_per_kund ? ', ett snurr per kund' : ''}, och kombineras inte med andra koder.`,
  };
}

// ---------------------------------------------------------------------------
// Sidfot, dokument, textversion
// ---------------------------------------------------------------------------

export function varforText(brand) {
  return brand.sidfot_varfor ?? `Du får det här för att du har sagt ja till nyhetsbrev från ${brand.namn}.`;
}

function sidfot(ctx) {
  const { s, brand, stil, lage } = ctx;
  const avreg = lage === 'klaviyo' ? "{% unsubscribe 'Avregistrera dig' %}" : `<a href="#" style="color: ${s.gra};">Avregistrera dig</a>`;
  const inst = lage === 'klaviyo' ? "{% manage_preferences 'Ändra dina inställningar' %}" : `<a href="#" style="color: ${s.gra};">Ändra dina inställningar</a>`;
  const org = lage === 'klaviyo' ? '{{ organization.name }}, {{ organization.full_address }}' : `${esk(brand.namn)}, (adressen hämtas ur Klaviyo)`;
  return {
    iKortet: `
          <tr>
            <td align="center" bgcolor="${s.svart}" style="padding: 22px 32px;">
              <p style="${s.rubrik} font-size: 15px; color: #ffffff; letter-spacing: 1px; margin: 0 0 6px;">${esk(stil.namn ?? brand.namn)}</p>
              <p style="${s.brod} font-size: 12px; line-height: 1.6; color: #d9d9d9; margin: 0;">Frågor? Svara på mejlet eller skriv till <a href="mailto:${esk(brand.avsandare?.reply_to_email)}" style="color: #ffffff;">${esk(brand.avsandare?.reply_to_email)}</a></p>
            </td>
          </tr>`,
    underKortet: `
    <tr>
      <td align="center" style="padding: 4px 24px 28px;">
        <p style="${s.brod} font-size: 12px; line-height: 1.7; color: ${s.gra}; margin: 0;">${esk(varforText(brand))}</p>
        <p style="${s.brod} font-size: 12px; line-height: 1.7; color: ${s.gra}; margin: 4px 0 0;">${avreg} &nbsp;&middot;&nbsp; ${inst}</p>
        <p style="${s.brod} font-size: 12px; line-height: 1.7; color: ${s.gra}; margin: 4px 0 0;">${org}</p>
      </td>
    </tr>`,
  };
}

function mobilStil() {
  return `
    @media only screen and (max-width: 480px) {
      .kl-yttre { padding: 8px 0 !important; }
      .kl-kort { display: inline-block !important; width: 48% !important; box-sizing: border-box !important; }
      .kl-vinst { display: inline-block !important; width: 32% !important; box-sizing: border-box !important; }
      .kl-stapla { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .kl-knapp { width: 100% !important; }
      .kl-rubrik { font-size: 24px !important; }
    }`;
}

function dokument(ctx, { titel, forhandstext, rader }) {
  const { s, brand, stil } = ctx;
  const logga = stil.logga_url
    ? `<img src="${esk(stil.logga_url)}" alt="${esk(brand.namn)}" width="${stil.logga_bredd ?? 240}" height="${stil.logga_hojd ?? 80}" style="display: block; margin: 0 auto; max-width: 100%; height: auto; border: 0;">`
    : `<span style="${s.rubrik} font-size: 26px; color: #ffffff;">${esk(brand.namn)}</span>`;
  const fot = sidfot(ctx);
  // Utfyllnaden efter förhandstexten hindrar Gmail/Apple Mail från att dra in
  // mejlets första rader i förhandsvisningen när förhandstexten är kort.
  const utfyllnad = '&#847;&zwnj;&nbsp;'.repeat(60);
  return `<!DOCTYPE html>
<html lang="${esk(brand.sprak ?? 'sv')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${kundtext(titel, ctx.lage)}</title>
  <style>${mobilStil()}</style>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f2f2;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${kundtext(forhandstext, ctx.lage)}${utfyllnad}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f2f2">
    <tr>
      <td align="center" class="kl-yttre" style="padding: 24px 12px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width: 600px; width: 100%; border: 1px solid ${s.ram};">
          <tr>
            <td align="center" bgcolor="${s.svart}" style="padding: 16px 24px;">
              <a href="${esk(brand.butik_url)}" target="_blank" style="text-decoration: none;">${logga}</a>
            </td>
          </tr>${rader}
          <tr><td style="padding: 0 0 12px;"></td></tr>${fot.iKortet}
        </table>
      </td>
    </tr>${fot.underKortet}
  </table>
</body>
</html>
`;
}

// Textversionen (multipart/alternative). Samma innehåll i samma ordning,
// länkarna utskrivna. Mallspråket är detsamma som i HTML:en.
function textversion(mejl, ctx) {
  const { lage, brand } = ctx;
  const t = (x) => ersattFornamn(x, lage);
  const ut = [];
  for (const b of mejl.block ?? []) {
    const p = b.handle ? ctx.produkt(b.handle) : null;
    switch (b.typ) {
      case 'hero':
        if (b.rubrik) ut.push(t(b.rubrik).toUpperCase());
        if (b.text) ut.push(t(b.text));
        if (b.knapp) ut.push(`${b.knapp.text}: ${lank(b.knapp.lank, { ...ctx, varningar: [] })}`);
        break;
      case 'text':
        if (b.rubrik) ut.push(t(b.rubrik).toUpperCase());
        ut.push(t(b.text));
        break;
      case 'punkter':
        if (b.rubrik) ut.push(t(b.rubrik).toUpperCase());
        ut.push((b.punkter ?? []).map((x) => `* ${t(x)}`).join('\n'));
        break;
      case 'produkt':
        if (p) ut.push(`${kortnamn(p.titel)}, ${kr(p.pris)}${b.text ? `\n${t(b.text)}` : ''}\n${b.knapp ?? 'Till produkten'}: ${p.url}`);
        break;
      case 'produktrad': {
        const rader = (b.handles ?? []).map((h) => ctx.produkt(h)).filter(Boolean).map((x) => `* ${kortnamn(x.titel)}, ${kr(x.pris)}: ${x.url}`);
        if (rader.length) ut.push([b.rubrik ? t(b.rubrik).toUpperCase() : null, ...rader].filter(Boolean).join('\n'));
        break;
      }
      case 'citat':
        for (const r of (ctx.recensioner?.[b.handle] ?? []).slice(0, Math.min(Number(b.antal ?? 2) || 2, 2))) ut.push(`"${r.text}"\n${r.namn}, verifierad kund`);
        break;
      case 'knapp':
        ut.push(`${b.text}: ${lank(b.lank, { ...ctx, varningar: [] })}`);
        break;
      case 'grundare':
        ut.push(mejl.format === 'rentext' ? t(b.text) : `${t(b.text)}\n${ctx.stil.grundare ?? 'Axel'}, grundare`);
        break;
      case 'fakta':
        ut.push(`Ångerrätt: ${brand.angerratt_text}\nSpåra paketet: ${brand.sparningssida}`);
        break;
      case 'erbjudande': {
        const e = ctx.erbjudande;
        if (!e?.kod) break;
        const v = erbjudandeVillkor(e);
        ut.push(`DIN KUNDGÅVA\n${b.text ? `${t(b.text)}\n` : ''}${v.kort}\nDin gåvokod: ${e.kod}\nSnurra hjulet: ${brand.butik_url}/pages/${e.hjul_handle ?? 'din-gratisprodukt'}\n${v.finstilt}`);
        break;
      }
      case 'dynamisk':
        if (lage !== 'klaviyo') {
          ut.push(exempelProdukter(ctx).map((x) => `* ${x.titel}, ${kr(x.pris)}`).join('\n'));
        } else if (b.kalla === 'visad_produkt') {
          ut.push('{% if event.ProductName %}{{ event.ProductName }}{% else %}{{ event.Name }}{% endif %}\nTitta igen: {{ event.URL }}');
        } else if (DYNAMISKA[b.kalla]) {
          const d = DYNAMISKA[b.kalla];
          ut.push(`${d.rubrik}:\n{% for item in ${d.loop} %}* ${d.titel}, ${d.antal} st\n{% endfor %}${d.knappText ? `${d.knappText}: ${d.knappHref}` : ''}`);
        }
        break;
      default:
        break;
    }
  }
  if (mejl.format === 'rentext') ut.push(signatur(ctx));
  ut.push('--');
  ut.push(varforText(brand));
  ut.push(lage === 'klaviyo' ? 'Avregistrera dig: {% unsubscribe_link %}' : 'Avregistrera dig: (länken sätts av Klaviyo)');
  ut.push(lage === 'klaviyo' ? '{{ organization.name }}, {{ organization.full_address }}' : `${brand.namn}, (adressen hämtas ur Klaviyo)`);
  return ut.filter((x) => x && String(x).trim()).join('\n\n') + '\n';
}

// Alla handles ett mejl pekar på (bilder, länkar, produktblock, citat).
export function handlesI(mejl) {
  const ut = new Set();
  for (const b of mejl.block ?? []) {
    for (const h of [handleUr(b.bild), handleUr(b.knapp?.lank), handleUr(b.lank), b.handle, ...(b.handles ?? [])]) if (h) ut.add(h);
  }
  return ut;
}

// ---------------------------------------------------------------------------
// Ingången
// ---------------------------------------------------------------------------

export function byggMejl(mejl, { brand, stil = null, erbjudande = undefined, produkter = [], recensioner = {}, lage = 'klaviyo' } = {}) {
  if (!brand) throw new Error('byggMejl: brand saknas.');
  if (lage !== 'klaviyo' && lage !== 'exempel') throw new Error(`byggMejl: okänt läge "${lage}".`);
  const res = stil && erbjudande !== undefined ? { stil, erbjudande } : laddaBrandResurser(brand);
  const st = stil ?? res.stil ?? {};
  const lista = Array.isArray(produkter) ? produkter : [...(produkter?.values?.() ?? [])];
  const perHandle = new Map(lista.map((p) => [p.handle, p]));
  const varningar = [];
  const ctx = {
    brand,
    stil: st,
    erbjudande: erbjudande !== undefined ? erbjudande : res.erbjudande,
    s: stilFran(st),
    lage,
    recensioner: recensioner ?? {},
    produktlista: lista,
    produkt: (h) => perHandle.get(h) ?? null,
    handles: handlesI(mejl),
    varningar,
  };
  const rentext = mejl.format === 'rentext';
  if (mejl.format && !rentext) varningar.push(`Okänt format "${mejl.format}", mejlet byggs som vanligt.`);
  const bibliotek = rentext ? RENTEXT : BLOCK;
  let rader = '';
  for (const b of mejl.block ?? []) {
    const f = bibliotek[b.typ];
    if (!f) {
      varningar.push(rentext ? `Blocktypen "${b.typ}" finns inte i ett rentext-mejl, blocket utgår.` : `Okänd blocktyp "${b.typ}", blocket utgår.`);
      continue;
    }
    rader += f(b, ctx);
  }
  const html = (rentext ? rentextDokument : dokument)(ctx, { titel: mejl.amnesrader?.[0]?.text ?? mejl.namn ?? '', forhandstext: mejl.forhandstext ?? '', rader });
  const text = textversion(mejl, ctx);
  return { html, text, varningar: [...new Set(varningar)] };
}
