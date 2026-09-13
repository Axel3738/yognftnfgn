// Mejlmallarna för Bäverbutiken — Shopifys kundnotiser (Inställningar →
// Notiser) i husets stil: svart/rött/vitt, Anton som rubriktypsnitt, tabell-
// layout som funkar i Gmail/Outlook/Apple Mail.
//
// Varje mall byggs i TVÅ lägen från samma kod:
//   'liquid'  → texten Axel klistrar in i Shopify (Liquid-taggar för order,
//               kund, rader, frakt osv.)
//   'exempel' → färdig HTML med exempeldata, så mejlet går att titta på utan
//               att lägga en testorder.
// Poängen är att förhandsvisningen aldrig kan skilja sig från det som skickas:
// samma funktion, bara olika värden på platshållarna.
//
// Texten kommer ur mejl/copy.json, erbjudandet och produkterna ur
// mejl/konfig.json + Shopify (bygg.mjs). Här finns bara struktur.
//
// Liquid-objekten per notis (Shopifys dokumenterade variabler):
//   order-notiser:  name, customer, billing_address, shipping_address,
//                   line_items (line.title, line.quantity, line.final_line_price,
//                   line | img_url), subtotal_price, total_discounts,
//                   shipping_methods, total_price, order_status_url
//   frakt-notiser:  fulfillment.tracking_url / tracking_company /
//                   tracking_number / fulfillment_line_items (line.line_item)
//   övergiven kassa: url, line_items, customer
//   återbetalning:  amount, refund_line_items (line.line_item, line.quantity)

const esk = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const kr = (n) => `${Math.round(Number(n)).toLocaleString('sv-SE').replace(/ | /g, ' ')} kr`;

// Exempeldatan förhandsvisningen renderas med. Riktiga produkter ur butiken,
// påhittad kund — det ska synas att det är ett exempel.
export const EXEMPEL = {
  fornamn: 'Johan',
  ordernummer: '#4821',
  fraktbolag: 'PostNord',
  belopp: 599,
  rader: [
    { titel: 'Axelbälte för Trimmer – Justerbart Nylonbälte', antal: 1, pris: 599, bild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/e0eacffe518545679195983f7a434ba3-goods_compact_cropped.jpg?v=1782032083' },
    { titel: 'Bävertratt - Tanka snabbt utan spill', antal: 2, pris: 298, bild: 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/Namnlosdesign_15_compact_cropped.png?v=1775245506' },
  ],
  delsumma: 897,
  rabatt: 0,
  frakt: [{ titel: 'Standard', pris: 0 }],
  totalt: 897,
  adress: { namn: 'Johan Bergström', gata: 'Verkstadsvägen 12', postnr: '432 41', ort: 'Varberg' },
  sparningsnummer: 'UA123456789SE',
};

// ---------------------------------------------------------------------------
// Platshållare → Liquid eller exempelvärde
// ---------------------------------------------------------------------------

// ⚠️ Enkla citattecken i Liquid-filtren, aldrig dubbla: texten går genom
// esk() (HTML-eskapning) på väg in i mallen, och dubbla citattecken blir
// &quot; — vilket bryter fallbacken. Mätt 2026-09-12 vid inklistringen:
// fyra mallar hade `default: &quot;fraktbolaget&quot;` och rättades för hand
// i Shopify. Testet "ingen &quot; inuti Liquid-taggar" vaktar det nu.
const LIQUID = {
  '{{förnamn}}': '{{ fornamn }}',
  '{{ordernummer}}': '{{ name }}',
  '{{fraktbolag}}': "{{ fulfillment.tracking_company | default: 'fraktbolaget' }}",
  '{{belopp}}': '{{ amount | money }}',
  '{{slutdatum}}': '{{ slutdatum }}',
};

export const MANADER = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

// Sista dag för erbjudandet: orderdag + giltig_dagar, som "20 september".
// Exempel-läget räknar i JavaScript från i dag; Liquid-läget räknar i Shopify
// vid utskick (se `slutdatumLiquid`) från orderns created_at.
export function exempelSlutdatum(dagar, nu = new Date()) {
  const d = new Date(nu.getTime() + dagar * 86400 * 1000);
  return `${d.getDate()} ${MANADER[d.getMonth()]}`;
}

// Liquid som sätter `slutdatum` = orderdag + N dagar med svensk månad.
// Utgår från orderns `created_at` (finns i alla ordernotiser, även frakt- och
// leveransmejlen), så alla mejl om samma order visar samma sista dag. Före
// 2026-09-13 stod här 'now' = utskickstiden, och fraktmejlet tre dagar senare
// lovade tre dagar mer än orderbekräftelsen — det var det Axel såg som att
// datumet "sköts upp". 'now' är kvar bara som reserv om created_at saknas.
// date: '%s' ger unix-sekunder som sträng; plus gör tal av den och
// date-filtret tar tal. Månaden mappas för hand — Shopify ger engelska namn.
export function slutdatumLiquid(dagar) {
  const sek = dagar * 86400;
  const fall = MANADER.map((m, i) => `{% when '${String(i + 1).padStart(2, '0')}' %}{% assign slut_man = '${m}' %}`).join('');
  return (
    `{% if created_at %}{% assign start_ts = created_at | date: '%s' %}{% else %}{% assign start_ts = 'now' | date: '%s' %}{% endif %}` +
    `{% assign slut_ts = start_ts | plus: ${sek} %}` +
    `{% assign slut_dag = slut_ts | date: '%-d' %}` +
    `{% assign slut_mm = slut_ts | date: '%m' %}` +
    `{% case slut_mm %}${fall}{% else %}{% assign slut_man = '' %}{% endcase %}` +
    `{% assign slutdatum = slut_dag | append: ' ' | append: slut_man %}`
  );
}

// Ämnesraden har ingen assign-rad, så förnamnet måste falla tillbaka i Liquid.
// "{{förnamn}}, " (med kommatecken) försvinner helt när namn saknas, så raden
// blir "#4821 är mottagen" i stället för ", #4821 är mottagen".
const LIQUID_AMNE = {
  '{{förnamn}}, ': '{% if customer.first_name != blank %}{{ customer.first_name }}, {% endif %}',
  ...LIQUID,
  '{{förnamn}}': "{{ customer.first_name | default: 'Hej' }}",
};

export function ersatt(text, lage, tabell = LIQUID) {
  let ut = String(text ?? '');
  for (const [nyckel, liquid] of Object.entries(tabell)) {
    const exempel = {
      '{{förnamn}}, ': `${EXEMPEL.fornamn}, `,
      '{{förnamn}}': EXEMPEL.fornamn,
      '{{ordernummer}}': EXEMPEL.ordernummer,
      '{{fraktbolag}}': EXEMPEL.fraktbolag,
      '{{belopp}}': kr(EXEMPEL.belopp),
      '{{slutdatum}}': EXEMPEL.slutdatum ?? exempelSlutdatum(30),
    }[nyckel];
    ut = ut.split(nyckel).join(lage === 'liquid' ? liquid : exempel);
  }
  return ut;
}

// Skarvar text med e-postadresser till klickbara länkar (rött, husets färg).
function lankaMejl(text, k) {
  return esk(text).replace(
    /([a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,})/gi,
    `<a href="mailto:$1" style="color: ${k.butik.farg_rod};">$1</a>`
  );
}

// ---------------------------------------------------------------------------
// Byggstenar (tabell-HTML)
// ---------------------------------------------------------------------------

function stil(k) {
  return {
    rubrik: `font-family: ${k.butik.font_rubrik}; text-transform: uppercase;`,
    brod: 'font-family: Arial,Helvetica,sans-serif;',
    rod: k.butik.farg_rod,
    svart: k.butik.farg_svart,
    ram: k.butik.farg_ram,
    gra: '#6b6b6b',
  };
}

// Sidhuvudet: butikens riktiga logga när konfigen har en (vit text på
// transparent ⇒ svart bakgrund), annars namnet i text.
function sidhuvud(k, s) {
  const b = k.butik;
  const inre = b.logga_url
    ? `<img src="${b.logga_url}" alt="${esk(b.namn)}" width="${b.logga_bredd ?? 240}" height="${b.logga_hojd ?? 80}" style="display: block; margin: 0 auto; max-width: 100%; height: auto; border: 0;">`
    : `<span style="${s.rubrik} font-size: 26px; letter-spacing: 1px; color: #ffffff;">${esk(b.namn)}</span>`;
  return `
          <tr>
            <td align="center" bgcolor="${s.svart}" style="padding: 16px 24px;">
              <a href="${b.url}" style="text-decoration: none;">${inre}</a>
            </td>
          </tr>`;
}

function rubrikOchIntro(k, s, rubrik, intro, lage) {
  return `
          <tr>
            <td align="center" style="padding: 36px 32px 8px;">
              <span style="${s.rubrik} font-size: 30px; line-height: 1.15; color: ${s.svart};">${esk(rubrik)}</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 8px 32px 4px;">
              <p style="${s.brod} font-size: 15px; line-height: 1.6; color: ${s.svart}; margin: 0;">
                ${lage === 'liquid' ? '{% if fornamn != blank %}Hej {{ fornamn }}!{% else %}Hej!{% endif %}' : `Hej ${esk(EXEMPEL.fornamn)}!`}
                ${lankaMejl(ersatt(intro, lage), k)}
              </p>
            </td>
          </tr>`;
}

function knapp(s, text, href, { liten = false } = {}) {
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${s.rod}">
                    <a href="${href}" target="_blank" style="display: inline-block; ${s.rubrik} font-size: ${liten ? 15 : 18}px; letter-spacing: 1px; color: #ffffff; text-decoration: none; padding: ${liten ? '12px 32px' : '16px 44px'};">${esk(text)}</a>
                  </td>
                </tr>
              </table>`;
}

function knappRad(s, text, href) {
  return `
          <tr>
            <td align="center" style="padding: 24px 32px 8px;">${knapp(s, text, href)}
            </td>
          </tr>`;
}

function avdelare(s) {
  return `
          <tr>
            <td style="padding: 0 32px;"><div style="border-top: 1px solid ${s.ram}; font-size: 0; line-height: 0;">&nbsp;</div></td>
          </tr>`;
}

function litenRubrik(s, text, { topp = 28 } = {}) {
  return `
          <tr>
            <td style="padding: ${topp}px 32px 8px;">
              <span style="${s.rubrik} font-size: 16px; color: ${s.svart}; letter-spacing: 0.5px;">${esk(text)}</span>
            </td>
          </tr>`;
}

function stycke(k, s, text, { farg = null, storlek = 14, topp = 0 } = {}) {
  return `
          <tr>
            <td style="padding: ${topp}px 32px 8px;">
              <p style="${s.brod} font-size: ${storlek}px; line-height: 1.6; color: ${farg ?? s.svart}; margin: 0;">${lankaMejl(text, k)}</p>
            </td>
          </tr>`;
}

// Tidslinjen "vad händer nu" — numrerad för att stegen faktiskt sker i ordning.
function tidslinje(s, steg) {
  const rader = steg
    .map(
      (t, i) => `
                <tr>
                  <td width="34" valign="top" style="padding: 8px 0;">
                    <div align="center" style="width: 24px; height: 24px; background-color: ${s.rod}; color: #ffffff; line-height: 24px; ${s.rubrik} font-size: 13px;">${i + 1}</div>
                  </td>
                  <td style="${s.brod} font-size: 14px; line-height: 1.5; color: ${s.svart}; padding: 8px 0;">${esk(t)}</td>
                </tr>`
    )
    .join('');
  return `
          <tr>
            <td style="padding: 4px 32px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rader}
              </table>
            </td>
          </tr>`;
}

// En orderrad: bild, titel, antal, pris. `f` är fältuppslaget för läget.
function orderRad(s, f) {
  const bild = f.bild ? `<img src="${f.bild}" alt="" width="60" height="60" style="display: block; border: 1px solid ${s.ram};">` : '';
  return `
                <tr>
                  <td width="72" valign="middle" style="padding: 10px 0;">
                    ${f.bildVillkor ? `{% if ${f.bildVillkor} %}${bild}{% endif %}` : bild}
                  </td>
                  <td valign="middle" style="padding: 10px 0 10px 12px;">
                    <p style="${s.brod} font-size: 14px; color: ${s.svart}; font-weight: bold; margin: 0;">${f.titel}</p>
                    <p style="${s.brod} font-size: 13px; color: ${s.gra}; margin: 2px 0 0;">Antal: ${f.antal}</p>
                  </td>
                  ${f.pris !== null ? `<td align="right" valign="middle" style="white-space: nowrap; padding: 10px 0;"><p style="${s.brod} font-size: 14px; color: ${s.svart}; margin: 0;">${f.pris}</p></td>` : ''}
                </tr>`;
}

// Orderrader i tre varianter: orderns line_items, fraktens fulfillment_line_items,
// återbetalningens refund_line_items. Exempelläget använder samma två rader.
function orderRader(s, lage, kalla) {
  const KALLOR = {
    order: {
      loop: 'line_items',
      falt: { bild: "{{ line | img_url: 'compact_cropped' }}", bildVillkor: 'line.image', titel: '{{ line.title }}', antal: '{{ line.quantity }}', pris: '{{ line.final_line_price | money }}' },
    },
    frakt: {
      loop: 'fulfillment.fulfillment_line_items',
      falt: { bild: "{{ line.line_item | img_url: 'compact_cropped' }}", bildVillkor: 'line.line_item.image', titel: '{{ line.line_item.title }}', antal: '{{ line.quantity }}', pris: null },
    },
    aterbetalning: {
      loop: 'refund_line_items',
      falt: { bild: "{{ line.line_item | img_url: 'compact_cropped' }}", bildVillkor: 'line.line_item.image', titel: '{{ line.line_item.title }}', antal: '{{ line.quantity }}', pris: null },
    },
  };
  const kk = KALLOR[kalla];
  let rader;
  if (lage === 'liquid') {
    rader = `{% for line in ${kk.loop} %}${orderRad(s, kk.falt)}{% endfor %}`;
  } else {
    rader = EXEMPEL.rader
      .map((r) => orderRad(s, { bild: r.bild, titel: esk(r.titel), antal: r.antal, pris: kk.falt.pris === null ? null : kr(r.pris) }))
      .join('');
  }
  return `
          <tr>
            <td style="padding: 0 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rader}
              </table>
            </td>
          </tr>`;
}

function summaRad(s, etikett, varde, { rod = false, stor = false } = {}) {
  const f = stor ? `${s.rubrik} font-size: 16px; color: ${s.svart}; padding: 8px 0 0;` : `${s.brod} font-size: 13px; padding: 2px 0;`;
  return `
                <tr>
                  <td style="${f} ${stor ? '' : `color: ${s.gra};`}">${esk(etikett)}</td>
                  <td align="right" style="${f} ${stor ? '' : `color: ${rod ? s.rod : s.svart};`}">${varde}</td>
                </tr>`;
}

function summering(s, lage) {
  let rader;
  if (lage === 'liquid') {
    rader =
      summaRad(s, 'Delsumma', '{{ subtotal_price | money }}') +
      `{% if total_discounts > 0 %}${summaRad(s, 'Rabatt', '-{{ total_discounts | money }}', { rod: true })}{% endif %}` +
      `{% for shipping_method in shipping_methods %}${summaRad(s, 'Frakt ({{ shipping_method.title }})', '{{ shipping_method.price | money }}')}{% endfor %}` +
      summaRad(s, 'Totalt', '{{ total_price | money }}', { stor: true });
  } else {
    rader =
      summaRad(s, 'Delsumma', kr(EXEMPEL.delsumma)) +
      (EXEMPEL.rabatt > 0 ? summaRad(s, 'Rabatt', `-${kr(EXEMPEL.rabatt)}`, { rod: true }) : '') +
      EXEMPEL.frakt.map((f) => summaRad(s, `Frakt (${f.titel})`, kr(f.pris))).join('') +
      summaRad(s, 'Totalt', kr(EXEMPEL.totalt), { stor: true });
  }
  return `
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid ${s.ram};">${rader}
              </table>
            </td>
          </tr>`;
}

function leveransadress(s, lage) {
  const a = EXEMPEL.adress;
  const inre =
    lage === 'liquid'
      ? `{{ shipping_address.name }}<br>{{ shipping_address.address1 }}{% if shipping_address.address2 != blank %}<br>{{ shipping_address.address2 }}{% endif %}<br>{{ shipping_address.zip }} {{ shipping_address.city }}`
      : `${esk(a.namn)}<br>${esk(a.gata)}<br>${a.postnr} ${esk(a.ort)}`;
  const block = `${avdelare(s)}
          <tr>
            <td style="padding: 20px 32px;">
              <span style="${s.rubrik} font-size: 16px; color: ${s.svart}; letter-spacing: 0.5px;">Levereras till</span>
              <p style="${s.brod} font-size: 14px; line-height: 1.6; color: ${s.svart}; margin: 8px 0 0;">${inre}</p>
            </td>
          </tr>`;
  return lage === 'liquid' ? `{% if shipping_address %}${block}{% endif %}` : block;
}

function grundarhalsning(k, s, text) {
  return `
          <tr>
            <td style="padding: 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7f7f7" style="border-left: 4px solid ${s.rod};">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="${s.brod} font-size: 14px; line-height: 1.6; color: ${s.svart}; font-style: italic; margin: 0;">&#8220;${lankaMejl(text, k)}&#8221;</p>
                    <p style="${s.brod} font-size: 13px; color: ${s.gra}; margin: 8px 0 0;">— ${esk(k.butik.grundare)}, grundare</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function faq(k, s, rubrik, par) {
  const rader = par
    .map(
      ([f, sv], i) => `
              <p style="${s.brod} font-size: 14px; line-height: 1.5; color: ${s.svart}; margin: ${i === 0 ? 10 : 12}px 0 0;"><strong>${esk(f)}</strong></p>
              <p style="${s.brod} font-size: 13px; line-height: 1.6; color: ${s.gra}; margin: 2px 0 0;">${lankaMejl(sv, k)}</p>`
    )
    .join('');
  return `${litenRubrik(s, rubrik)}
          <tr>
            <td style="padding: 0 32px 24px;">${rader}
            </td>
          </tr>`;
}

// Erbjudandet: svart box med koden + knappen, sedan de fyra gratisprodukterna
// och de tre dyraste. Helt statisk HTML — Shopifys notis-Liquid når inte
// butikens produkter, så bygg.mjs bakar in dem vid varje körning.
export function erbjudandeBlock(k, s, copy, produkter, lage = 'liquid') {
  const e = k.erbjudande;
  const u = { ...copy.upsell, urgency: ersatt(copy.upsell.urgency, lage), finstilt: ersatt(copy.upsell.finstilt, lage) };
  const lank = `${k.butik.url}/discount/${e.kod}?redirect=%2Fcollections%2F${e.kollektion_handle}`;
  const gratis = produkter.gratis
    .map(
      (p) => `
                  <td width="25%" valign="top" align="center" style="padding: 8px 4px;">
                    <a href="${p.url}" style="text-decoration: none;">
                      <img src="${p.bild}" alt="" width="96" height="96" style="display: block; border: 1px solid ${s.ram}; margin: 0 auto;">
                      <p style="${s.brod} font-size: 12px; line-height: 1.4; color: ${s.svart}; margin: 8px 0 0;">${esk(p.kortnamn)}</p>
                      <p style="${s.brod} font-size: 12px; color: ${s.gra}; margin: 2px 0 0;"><s>${kr(p.pris)}</s> <strong style="color: ${s.rod};">0 kr</strong></p>
                    </a>
                  </td>`
    )
    .join('');
  const dyra = produkter.dyra
    .map(
      (p) => `
                  <td width="33%" valign="top" align="center" style="padding: 8px 4px;">
                    <a href="${p.url}" style="text-decoration: none;">
                      <img src="${p.bild}" alt="" width="160" height="160" style="display: block; border: 1px solid ${s.ram}; margin: 0 auto; max-width: 100%;">
                      <p style="${s.brod} font-size: 13px; line-height: 1.4; color: ${s.svart}; margin: 8px 0 0;">${esk(p.kortnamn)}</p>
                      <p style="${s.rubrik} font-size: 18px; color: ${s.rod}; margin: 4px 0 0;">${kr(p.pris)}</p>
                      ${p.jamforpris && p.jamforpris > p.pris ? `<p style="${s.brod} font-size: 12px; color: ${s.gra}; margin: 0;"><s>${kr(p.jamforpris)}</s></p>` : ''}
                    </a>
                  </td>`
    )
    .join('');
  // Blocket ligger ÖVERST i mejlet (Axels beslut 2026-09-12: "man ska bli
  // catchad direkt"), med en röd urgency-rad som bär sista datumet.
  return `
          <!-- Erbjudandet: köp igen → välj en gratisprodukt -->
          <tr>
            <td style="padding: 20px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${s.svart}">
                <tr>
                  <td align="center" style="padding: 26px 24px 8px;">
                    ${u.forrubrik ? `<p style="${s.brod} font-size: 12px; font-weight: bold; color: ${s.rod}; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">${esk(u.forrubrik)}</p>` : ''}
                    <p style="${s.rubrik} font-size: 32px; line-height: 1.1; color: #ffffff; letter-spacing: 0.5px; margin: 0;">${esk(u.rubrik)}</p>
                    <p style="${s.brod} font-size: 15px; line-height: 1.6; color: #d9d9d9; margin: 12px 0 18px;">${esk(u.text)}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 18px;">
                      <tr>
                        <td style="border: 2px dashed #ffffff; padding: 10px 22px;">
                          <span style="${s.brod} font-size: 12px; color: #d9d9d9; letter-spacing: 1px; text-transform: uppercase;">${esk(u.kod_etikett)}</span>
                          <span style="${s.rubrik} font-size: 24px; color: #ffffff; letter-spacing: 3px; padding-left: 8px;">${esk(e.kod)}</span>
                        </td>
                      </tr>
                    </table>${knapp(s, u.knapp, lank)}
                  </td>
                </tr>
                ${u.urgency ? `<tr>
                  <td align="center" bgcolor="${s.rod}" style="padding: 12px 24px; margin-top: 20px;">
                    <p style="${s.brod} font-size: 14px; font-weight: bold; line-height: 1.5; color: #ffffff; margin: 0;">&#9203; ${esk(u.urgency)}</p>
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>${litenRubrik(s, u.valj_rubrik, { topp: 20 })}
          <tr>
            <td style="padding: 0 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>${gratis}
                </tr>
              </table>
            </td>
          </tr>${litenRubrik(s, u.dyra_rubrik, { topp: 16 })}${stycke(k, s, u.dyra_text, { farg: s.gra, storlek: 13 })}
          <tr>
            <td style="padding: 0 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>${dyra}
                </tr>
              </table>
            </td>
          </tr>${stycke(k, s, u.finstilt, { farg: s.gra, storlek: 11, topp: 4 })}
          <tr><td style="padding: 0 0 12px;"></td></tr>${avdelare(s)}`;
}

function sidfot(k, s, copy) {
  return `
          <tr>
            <td align="center" bgcolor="${s.svart}" style="border-top: 1px solid #2a2a2a; padding: 24px 32px;">
              <p style="${s.rubrik} font-size: 15px; color: #ffffff; letter-spacing: 1px; margin: 0 0 8px;">${esk(k.butik.namn)}</p>
              <p style="${s.brod} font-size: 12px; line-height: 1.6; color: #d9d9d9; margin: 0;">${esk(copy.sidfot.fragor).replace(/([a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,})/gi, '<a href="mailto:$1" style="color: #ffffff;">$1</a>')}</p>
            </td>
          </tr>`;
}

// Hela dokumentet runt innehållsraderna.
function dokument(k, s, lage, { titel, preheader, rader }) {
  const assign =
    lage === 'liquid'
      ? `{% assign fornamn = customer.first_name | default: billing_address.first_name | default: shipping_address.first_name %}\n${slutdatumLiquid(k.erbjudande.giltig_dagar ?? 30)}\n`
      : '';
  return `${assign}<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esk(titel)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f2f2;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${esk(ersatt(preheader, lage))}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f2f2">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width: 600px; width: 100%; border: 1px solid ${s.ram};">${rader}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Mallarna
// ---------------------------------------------------------------------------

// id = filnamn, shopify = notisens namn i admin (svenska / engelska), var = var
// den ligger, erbjudande = om gratisprodukt-blocket ska med.
export const MALLAR = [
  { id: 'orderbekraftelse', shopify: 'Orderbekräftelse / Order confirmation', erbjudande: true },
  { id: 'fraktbekraftelse', shopify: 'Leveransbekräftelse / Shipping confirmation', erbjudande: true },
  { id: 'fraktuppdatering', shopify: 'Leveransuppdatering / Shipping update', erbjudande: false },
  { id: 'ute_for_leverans', shopify: 'Ute för leverans / Out for delivery', erbjudande: false },
  { id: 'levererad', shopify: 'Levererad / Delivered', erbjudande: true },
  { id: 'overgiven_kassa', shopify: 'Övergiven kassa / Abandoned checkout', erbjudande: false },
  { id: 'aterbetalning', shopify: 'Återbetalning / Refund notification', erbjudande: false },
  { id: 'avbruten_order', shopify: 'Order annullerad / Order cancelled', erbjudande: false },
];

const SPARNING_LIQUID = '{{ fulfillment.tracking_url | default: order_status_url }}';
const SPARNING_EXEMPEL = 'https://baverbutiken.se/orders/exempel';

function sparningsInfo(s, lage) {
  const inre =
    lage === 'liquid'
      ? `{% if fulfillment.tracking_number %}Spårningsnummer: <strong>{{ fulfillment.tracking_number }}</strong>{% if fulfillment.tracking_company %} ({{ fulfillment.tracking_company }}){% endif %}{% endif %}`
      : `Spårningsnummer: <strong>${EXEMPEL.sparningsnummer}</strong> (${EXEMPEL.fraktbolag})`;
  return `
          <tr>
            <td align="center" style="padding: 8px 32px 4px;">
              <p style="${s.brod} font-size: 13px; color: ${s.gra}; margin: 0;">${inre}</p>
            </td>
          </tr>`;
}

export function byggMall(id, { konfig: k, copy, produkter, lage }) {
  const s = stil(k);
  const c = copy[id];
  const meta = MALLAR.find((m) => m.id === id);
  if (!c || !meta) throw new Error(`Okänd mall: ${id}`);
  EXEMPEL.slutdatum = exempelSlutdatum(k.erbjudande.giltig_dagar ?? 30);
  const erbj = meta.erbjudande ? erbjudandeBlock(k, s, copy, produkter, lage) : '';
  const ordUrl = lage === 'liquid' ? '{{ order_status_url }}' : SPARNING_EXEMPEL;
  const sparUrl = lage === 'liquid' ? SPARNING_LIQUID : SPARNING_EXEMPEL;
  let rader = sidhuvud(k, s) + rubrikOchIntro(k, s, c.rubrik, c.intro, lage);

  // Erbjudandet ligger direkt efter hälsningen i de mallar som bär det —
  // före orderknappen, tidslinjen och orderraderna (Axel 2026-09-12).
  switch (id) {
    case 'orderbekraftelse':
      rader +=
        erbj +
        knappRad(s, c.knapp, ordUrl) +
        litenRubrik(s, c.steg_rubrik) +
        tidslinje(s, [c.steg1, c.steg2, c.steg3]) +
        avdelare(s) +
        litenRubrik(s, 'Din order', { topp: 24 }) +
        orderRader(s, lage, 'order') +
        summering(s, lage) +
        leveransadress(s, lage) +
        grundarhalsning(k, s, c.grundare) +
        faq(k, s, c.faq_rubrik, c.faq);
      break;
    case 'fraktbekraftelse':
      rader +=
        knappRad(s, c.knapp, sparUrl) +
        sparningsInfo(s, lage) +
        stycke(k, s, c.tips, { farg: s.gra, storlek: 13, topp: 8 }) +
        erbj +
        litenRubrik(s, 'I paketet', { topp: 24 }) +
        orderRader(s, lage, 'frakt') +
        leveransadress(s, lage);
      break;
    case 'fraktuppdatering':
    case 'ute_for_leverans':
      rader += knappRad(s, c.knapp, sparUrl) + sparningsInfo(s, lage) + avdelare(s) + litenRubrik(s, 'I paketet', { topp: 24 }) + orderRader(s, lage, 'frakt');
      break;
    case 'levererad':
      rader +=
        stycke(k, s, c.problem, { topp: 8 }) +
        erbj +
        litenRubrik(s, 'I paketet', { topp: 24 }) +
        orderRader(s, lage, 'frakt') +
        avdelare(s) +
        stycke(k, s, c.recension_text, { topp: 20 }) +
        `
          <tr>
            <td style="padding: 4px 32px 24px;">${knapp(s, c.recension_knapp, ordUrl, { liten: true })}
            </td>
          </tr>`;
      break;
    case 'overgiven_kassa':
      rader +=
        knappRad(s, c.knapp, lage === 'liquid' ? '{{ url }}' : `${k.butik.url}/checkouts/exempel`) +
        stycke(k, s, c.trygghet, { farg: s.gra, storlek: 13, topp: 8 }) +
        avdelare(s) +
        litenRubrik(s, 'I din kundvagn', { topp: 24 }) +
        orderRader(s, lage, 'order') +
        `
          <tr><td style="padding: 0 0 24px;"></td></tr>`;
      break;
    case 'aterbetalning':
      rader +=
        avdelare(s) +
        litenRubrik(s, 'Återbetalade varor', { topp: 24 }) +
        (lage === 'liquid' ? '{% if refund_line_items.size > 0 %}' : '') +
        orderRader(s, lage, 'aterbetalning') +
        (lage === 'liquid' ? '{% endif %}' : '') +
        `
          <tr><td style="padding: 0 0 24px;"></td></tr>`;
      break;
    case 'avbruten_order':
      rader +=
        avdelare(s) +
        litenRubrik(s, 'Din order', { topp: 24 }) +
        orderRader(s, lage, 'order') +
        `
          <tr><td style="padding: 0 0 24px;"></td></tr>`;
      break;
  }

  rader += sidfot(k, s, copy);
  const html = dokument(k, s, lage, { titel: c.rubrik, preheader: c.preheader[0], rader });
  return {
    id,
    shopify: meta.shopify,
    amne: ersatt(c.amne[0], lage, LIQUID_AMNE),
    amne_alternativ: c.amne.slice(1).map((a) => ersatt(a, lage, LIQUID_AMNE)),
    html,
  };
}

export function byggAlla(indata) {
  return MALLAR.map((m) => byggMall(m.id, indata));
}

// ---------------------------------------------------------------------------
// Produktval — ren logik, testas utan nätverk.
// ---------------------------------------------------------------------------

// Kortnamn i mejlet: delen före " – " / " - " (butikens titlar är
// "Produkt – Undertitel"), max ~40 tecken.
export function kortnamn(titel) {
  const t = String(titel ?? '').split(/\s[–-]\s/)[0].trim();
  return t.length > 42 ? `${t.slice(0, 40).trim()}…` : t;
}

// Gratisprodukterna i konfigens ordning, de dyraste = högst pris bland köpbara,
// publicerade produkter som inte själva är gratisprodukter. `dyra_override`
// (handles) vinner över prisordningen när Axel vill styra listan för hand.
export function valjProdukter(alla, konfig) {
  const e = konfig.erbjudande;
  const perHandle = new Map(alla.map((p) => [p.handle, p]));
  const gratis = e.gratisprodukter.map((h) => {
    const p = perHandle.get(h);
    if (!p) throw new Error(`Gratisprodukten "${h}" finns inte bland aktiva produkter.`);
    return { ...p, kortnamn: kortnamn(p.titel) };
  });
  let dyra;
  if (Array.isArray(e.dyra_override) && e.dyra_override.length > 0) {
    dyra = e.dyra_override.map((h) => {
      const p = perHandle.get(h);
      if (!p) throw new Error(`dyra_override: "${h}" finns inte bland aktiva produkter.`);
      return p;
    });
  } else {
    dyra = alla
      .filter((p) => !e.gratisprodukter.includes(p.handle))
      .filter((p) => p.bild && p.url)
      .filter((p) => !e.dyra_krav_lager || p.lager > 0)
      .sort((a, b) => b.pris - a.pris || a.titel.localeCompare(b.titel, 'sv'))
      .slice(0, e.dyra_antal);
  }
  return { gratis, dyra: dyra.map((p) => ({ ...p, kortnamn: kortnamn(p.titel) })) };
}
