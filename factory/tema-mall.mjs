// Temats innehåll utöver opf-sektionerna: startsidan, annonsraden, sidfoten,
// temainställningarna (logga, favicon, A/B-test, app-inbäddningar) och
// produktmallens A/B-paketblock. Allt genereras ur butiks- + produktfilen,
// så nästa butik får samma struktur utan att någon rör JSON i editorn.
//
// Strukturen är matstrumpor-cro-v5:s (samma zip som HeimGuard byggdes på):
//   hero → USP-rad → produkten → berättelse → statement → omdömen →
//   trygghet → FAQ → garanti
// Bevisad ordning från HeimGuards startsida 2026-09-05..07. Ren logik utan
// nätverk — ops.mjs skriver filerna och verifierar dem.

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const eskapa = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Filnamnen i Files som temat pekar på (shopify://shop_images/<fil>).
export function temabilder(butiksId) {
  return {
    logga: `${butiksId}-logga.png`,
    favicon: `${butiksId}-favicon.png`,
    hero: `${butiksId}-hero.jpg`,
    trygghet: `${butiksId}-trygghet.jpg`,
  };
}

// "6–10 arbetsdagar" → { min: 6, max: 10 }
export function leveransdagar(leveranstid) {
  const m = String(leveranstid ?? '').match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) return { min: Number(m[1]), max: Number(m[2]) };
  const e = String(leveranstid ?? '').match(/(\d+)/);
  return e ? { min: Number(e[1]), max: Number(e[1]) } : { min: 5, max: 10 };
}

// Trygghetsraden under köpknappen och USP-raden på startsidan — samma källa
// som fraktzonerna och returvillkoren, så de kan inte säga olika saker.
// Alltid svensk lag, aldrig egna köplöften (Axels beslut 2026-09-08):
// raden säger "14 dagars ångerrätt", oavsett vad konfigen råkar ha.
export function angerrattRad(butik) {
  const dagar = Number(butik?.retur?.angerratt_dagar) || 14;
  return `${dagar} dagars ångerrätt`;
}

export function trustPunkter(butik) {
  const land = text(butik?.butik?.huvudmarknad) ?? 'Sverige';
  const fri = butik?.frakt?.fri_globalt !== false;
  return [
    fri ? `truck:Fri frakt i ${land}` : 'truck:Snabb leverans',
    `refresh:${angerrattRad(butik)}`,
    'lock:Trygg betalning',
  ];
}

export function uspPunkter(butik, p) {
  const bas = trustPunkter(butik).map((x) => x.replace('Fri frakt i ', 'Fri frakt i hela ').replace('lock:Trygg betalning', 'lock:Trygg betalning med Klarna'));
  const usp = text(p?.vinkel?.usp);
  return usp ? [...bas, `shield:${usp}`] : bas;
}

// Två paketblock (A synligt, B hidden tills ms-ab.js lottar) — samma
// custom_liquid som temats egna ms_paket-block, plus test-attributet.
// section_id får en suffix så A och B inte delar radioknappsnamn.
export function paketBlock(test, produktUttryck = 'product') {
  const rad = (variant) =>
    `{% assign sid = section.id | append: '-${variant}' %}` +
    `<div {% render 'ms-ab-attrs', test: '${test}', variant: '${variant}' %}>` +
    `{% render 'ms-paket', product: ${produktUttryck}, variant: '${variant}', section_id: sid %}</div>`;
  if (!text(test)) {
    return { ms_paket: { type: 'custom_liquid', settings: { custom_liquid: `{% render 'ms-paket', product: ${produktUttryck}, section_id: section.id %}` } } };
  }
  return {
    ms_paket_a: { type: 'custom_liquid', settings: { custom_liquid: rad('a') } },
    ms_paket_b: { type: 'custom_liquid', settings: { custom_liquid: rad('b') } },
  };
}

// Produktmallen: paketblocken (A/B), trygghetsraden, leveransdagarna och
// Judge.me-widgeten i temats Appyta (ms-app-slot) i stället för rå apps-sektion.
// custom_liquid-block kan inte översättas via translationsRegister — texten
// locale-branchas i Liquid i stället (HeimGuard-lärdom 2026-09-07). `nb` är
// översättningsmappen (nyckel → norsk text) från oversattning-nb.json.
function localeBranch(svLiquid, nbLiquid) {
  if (!nbLiquid || nbLiquid === svLiquid) return svLiquid;
  return `{% if request.locale.iso_code == 'nb' %}${nbLiquid}{% else %}${svLiquid}{% endif %}`;
}

export function patchaProduktTemplate(json, butik, p, nb = {}) {
  const mall = typeof json === 'string' ? JSON.parse(json.replace(/\/\*[\s\S]*?\*\//, '').trim()) : json;
  const main = mall.sections.main;
  const test = text(p.offer?.paket?.test) ?? '';
  const blocks = { ...main.blocks };
  let order = [...(main.block_order ?? [])];

  // Paketblocken ersätter temats enkla ms_paket på samma plats.
  for (const id of ['ms_paket', 'ms_paket_a', 'ms_paket_b']) delete blocks[id];
  const nya = paketBlock(test);
  Object.assign(blocks, nya);
  const plats = Math.max(order.indexOf('ms_paket'), order.indexOf('ms_paket_a'));
  order = order.filter((id) => !['ms_paket', 'ms_paket_a', 'ms_paket_b'].includes(id));
  const efterPris = plats !== -1 ? plats : order.indexOf('variant_picker') + 1;
  order.splice(efterPris, 0, ...Object.keys(nya));

  if (blocks.ms_trust) {
    const sv = trustPunkter(butik);
    const no = sv.map((x, i) => (nb[`liquid.trust.${i}`] ? `${x.split(':')[0]}:${nb[`liquid.trust.${i}`]}` : x));
    const rad = (punkter) => `{% render 'ms-trust-row', items: '${punkter.join('|')}' %}`;
    blocks.ms_trust = { type: 'custom_liquid', settings: { custom_liquid: localeBranch(rad(sv), rad(no)) } };
  }
  if (blocks.ms_delivery) {
    const d = leveransdagar(p.shipping?.tid ?? butik?.frakt?.leveranstid);
    const rad = (t) => `{% render 'ms-delivery-estimate', min_days: ${d.min}, max_days: ${d.max}, cutoff_hour: 0, text: '${t}' %}`;
    blocks.ms_delivery = {
      type: 'custom_liquid',
      settings: { custom_liquid: localeBranch(rad('Beräknad leverans'), rad(nb['liquid.delivery.text'] ?? 'Beräknad leverans')) },
    };
  }
  mall.sections.main = { ...main, blocks, block_order: order };

  // Judge.me i Appyta (Axels ursprungsmönster) — widgeten stylas aldrig av temat.
  for (const [id, sek] of Object.entries(mall.sections)) {
    if (sek.type === 'apps' && /judge/i.test(id)) {
      mall.sections[id] = { ...sek, type: 'ms-app-slot', settings: { visible: true, eyebrow: '', heading: '', width: 1100, ab_test: '', ab_variant: '' } };
    }
  }
  return `${JSON.stringify(mall, null, 2)}\n`;
}

export function byggIndex(butik, p) {
  const id = butik.butik.id;
  const bilder = temabilder(id);
  const handle = p.produkt.id;
  const produktLank = `shopify://products/${handle}`;
  const b = p.beskrivning ?? {};
  const test = text(p.offer?.paket?.test) ?? '';
  const statement = String(lista(p.benefits)[0] ?? p.produkt.namn).split(/\s[–-]\s/)[0];
  const omdomen = lista(p.reviews).slice(0, 6);
  // Garantiblocket säger bara vad lagen ger: ångerrätten. Inga egna löften.
  const angerratt = angerrattRad(butik);
  const garantiKort = angerratt;
  const garantiRest = `Ångra köpet inom ${Number(butik?.retur?.angerratt_dagar) || 14} dagar från att du tog emot varan – enligt distansavtalslagen.`;
  const mail = butik.butik.supportmail;
  const fri = butik?.frakt?.fri_globalt !== false;

  const sections = {
    hero: {
      type: 'image-banner',
      blocks: {
        h: { type: 'heading', settings: { heading: text(b.problem_rubrik) ?? p.produkt.namn, heading_size: 'h1' } },
        t: { type: 'text', settings: { text: text(p.vinkel?.underrubrik) ?? '', text_style: 'body' } },
        b: { type: 'buttons', settings: { button_label_1: 'Köp nu', button_link_1: produktLank, button_style_secondary_1: false, button_label_2: '', button_link_2: '', button_style_secondary_2: true } },
      },
      block_order: ['h', 't', 'b'],
      settings: {
        image: `shopify://shop_images/${bilder.hero}`,
        image_overlay_opacity: 10,
        image_height: 'medium',
        image_behavior: 'none',
        desktop_content_position: 'middle-center',
        desktop_content_alignment: 'center',
        show_text_box: true,
        color_scheme: 'scheme-1',
        stack_images_on_mobile: false,
        mobile_content_alignment: 'center',
        show_text_below: true,
      },
    },
    ms_usp: { type: 'ms-usp-bar', settings: { visible: true, items: uspPunkter(butik, p).join('|') } },
    produkt: {
      type: 'featured-product',
      blocks: {
        etikett: { type: 'text', settings: { text: butik.butik.brand, text_style: 'uppercase' } },
        titel: { type: 'title', settings: { heading_size: 'h1' } },
        pris: { type: 'price', settings: {} },
        varianter: { type: 'variant_picker', settings: { picker_type: 'button', swatch_shape: 'circle' } },
        ...paketBlock(test, 'section.settings.product'),
        kop: { type: 'buy_buttons', settings: { show_dynamic_checkout: false, show_gift_card_recipient: false } },
      },
      block_order: ['etikett', 'titel', 'pris', 'varianter', ...Object.keys(paketBlock(test)), 'kop'],
      settings: {
        product: handle,
        color_scheme: 'scheme-1',
        secondary_background: false,
        media_size: 'medium',
        constrain_to_viewport: true,
        media_fit: 'contain',
        media_position: 'left',
        image_zoom: 'lightbox',
        hide_variants: true,
        enable_video_looping: false,
        padding_top: 36,
        padding_bottom: 36,
      },
    },
    berattelse: {
      type: 'rich-text',
      blocks: {
        h: { type: 'heading', settings: { heading: text(b.losning_rubrik) ?? p.produkt.namn, heading_size: 'h1' } },
        t: { type: 'text', settings: { text: `<p>${eskapa(b.problem_text)}</p><p>${eskapa(b.losning_text)}</p>` } },
      },
      block_order: ['h', 't'],
      settings: { desktop_content_position: 'center', content_alignment: 'center', color_scheme: 'scheme-1', full_width: true, padding_top: 44, padding_bottom: 28 },
    },
    statement: {
      type: 'rich-text',
      blocks: {
        h: { type: 'heading', settings: { heading: statement, heading_size: 'h1' } },
        b: { type: 'button', settings: { button_label: 'Köp nu', button_link: produktLank, button_style_secondary: false } },
      },
      block_order: ['h', 'b'],
      settings: { desktop_content_position: 'center', content_alignment: 'center', color_scheme: 'scheme-2', full_width: true, padding_top: 52, padding_bottom: 52 },
    },
    omdomen: {
      type: 'ms-review-slider',
      blocks: Object.fromEntries(
        omdomen.map((r, i) => [
          `r${i + 1}`,
          { type: 'review', settings: { stars: Math.max(1, Math.min(5, Number(r.betyg) || 5)), title: text(r.titel) ?? '', body: text(r.text) ?? '', name: text(r.namn) ?? '', verified: false } },
        ])
      ),
      block_order: omdomen.map((_, i) => `r${i + 1}`),
      settings: { visible: true, eyebrow: 'Ur recensionerna', heading: 'Vad kunderna säger', ab_test: '', ab_variant: '' },
    },
    trygghet: {
      type: 'image-with-text',
      blocks: {
        h: { type: 'heading', settings: { heading: 'Handla tryggt hos oss', heading_size: 'h2' } },
        t: {
          type: 'text',
          settings: {
            text: `<p>${fri ? 'Fri frakt på alla ordrar' : 'Snabb leverans'} och ${angerratt} enligt distansavtalslagen.</p><p>Betala som du vill – Klarna, kort, Apple Pay eller Google Pay.</p>`,
            text_style: 'body',
          },
        },
      },
      block_order: ['h', 't'],
      settings: {
        image: `shopify://shop_images/${bilder.trygghet}`,
        height: 'adapt',
        desktop_image_width: 'medium',
        layout: 'text_first',
        image_behavior: 'none',
        content_layout: 'no-overlap',
        desktop_content_position: 'middle',
        desktop_content_alignment: 'left',
        mobile_content_alignment: 'left',
        section_color_scheme: 'scheme-1',
        color_scheme: 'scheme-1',
        padding_top: 36,
        padding_bottom: 36,
      },
    },
    ms_faq: {
      type: 'ms-faq-section',
      blocks: Object.fromEntries(lista(p.faq).map((f, i) => [`q${i + 1}`, { type: 'qa', settings: { q: String(f.fraga ?? ''), a: `<p>${eskapa(f.svar)}</p>` } }])),
      block_order: lista(p.faq).map((_, i) => `q${i + 1}`),
      settings: { visible: true, heading: 'Vanliga frågor' },
    },
    ms_guarantee: {
      type: 'ms-guarantee-section',
      settings: { visible: true, title: garantiKort, body: `<p>${eskapa(garantiRest)} Mejla ${eskapa(mail)} så får du en returinstruktion.</p>`, icon: 'seal' },
    },
  };
  return `${JSON.stringify({ sections, order: ['hero', 'ms_usp', 'produkt', 'berattelse', 'statement', 'omdomen', 'trygghet', 'ms_faq', 'ms_guarantee'] }, null, 2)}\n`;
}

export function byggHeaderGroup(befintlig, butik, p) {
  const grupp = JSON.parse(String(befintlig).replace(/\/\*[\s\S]*?\*\//, '').trim());
  const punkter = uspPunkter(butik, p).map((x) => x.split(':').slice(1).join(':')).slice(0, 3);
  const blocks = Object.fromEntries(punkter.map((t, i) => [`a${i + 1}`, { type: 'announcement', settings: { text: t, link: '' } }]));
  const bar = grupp.sections['announcement-bar'];
  grupp.sections['announcement-bar'] = {
    ...bar,
    blocks,
    block_order: Object.keys(blocks),
    settings: { ...bar.settings, enable_country_selector: true, enable_language_selector: true },
  };
  const header = grupp.sections.header;
  grupp.sections.header = { ...header, settings: { ...header.settings, menu: 'main-menu', enable_country_selector: true, enable_language_selector: true } };
  return `${JSON.stringify(grupp, null, 2)}\n`;
}

// Sidfoten: företagsuppgifterna ur butiksfilen, inga nyhetsbrev, inga
// cookie-/skrapkortssektioner (Axels beslut 2026-09-06 för HeimGuard).
export function byggFooterGroup(befintlig, butik) {
  const grupp = JSON.parse(String(befintlig).replace(/\/\*[\s\S]*?\*\//, '').trim());
  const b = butik.butik;
  const footer = grupp.sections.footer;
  const blocks = { ...footer.blocks };
  if (blocks.foretaget) {
    blocks.foretaget = {
      type: 'text',
      settings: {
        heading: 'Företaget',
        subtext: `<p>${eskapa(b.brand)} drivs av<br/>${eskapa(b.bolagsnamn)}<br/>Org.nr ${eskapa(b.orgnr)}</p><p>${eskapa(b.supportmail)}</p>`,
      },
    };
  }
  grupp.sections = {
    footer: {
      ...footer,
      blocks,
      settings: { ...footer.settings, newsletter_enable: false, enable_follow_on_shop: false, enable_country_selector: true, enable_language_selector: true },
    },
  };
  grupp.order = ['footer'];
  return `${JSON.stringify(grupp, null, 2)}\n`;
}

// Inställningarna: logga/favicon ur Files, brandtexten, A/B-testet, och BARA
// de app-inbäddningar butiken faktiskt har (Judge.me) — Matstrumpors Klaviyo
// åker ut. Appinbäddningar bor i settings_data och dör i varje klon
// (PROCESS.md) — därför sätts judgeme_core här varje gång.
export const JUDGEME_EMBED = 'shopify://apps/judge-me-reviews/blocks/judgeme_core/61ccd3b1-a9f2-4160-9fe9-4fec8413e5d8';

export function settingsTillagg(butik, p) {
  const id = butik.butik.id;
  const bilder = temabilder(id);
  const test = text(p?.offer?.paket?.test) ?? '';
  return {
    logo: `shopify://shop_images/${bilder.logga}`,
    logo_width: 90,
    favicon: `shopify://shop_images/${bilder.favicon}`,
    brand_image: `shopify://shop_images/${bilder.logga}`,
    brand_image_width: 90,
    brand_headline: '',
    brand_description: `<p>${eskapa(text(butik.branding?.positionering) ?? butik.butik.brand)}</p>`,
    social_facebook_link: '',
    social_instagram_link: '',
    social_tiktok_link: '',
    social_youtube_link: '',
    social_twitter_link: '',
    social_pinterest_link: '',
    social_snapchat_link: '',
    social_tumblr_link: '',
    social_vimeo_link: '',
    ms_ab_tests: test,
    ms_ab_cookie_days: 30,
    blocks: { judgeme_karna: { type: JUDGEME_EMBED, disabled: false, settings: {} } },
  };
}

// ms-head läser settings.ms_ab_tests men zip:ens settings_schema saknar
// fältet (mätt 2026-09-08) — utan schemat ignoreras värdet. Läggs till
// idempotent som egen grupp sist.
export function settingsSchemaMedAb(schemaText) {
  const schema = JSON.parse(String(schemaText));
  if (schema.some((g) => (g.settings ?? []).some((s) => s.id === 'ms_ab_tests'))) return null;
  schema.push({
    name: 'OPS A/B-test',
    settings: [
      { type: 'textarea', id: 'ms_ab_tests', label: 'Aktiva tester', info: 'Ett test per rad: id (50/50) eller id:90:10 (viktat). Rad som börjar med # är avstängd. Utfallet stämplas som orderattribut "AB <id>".' },
      { type: 'range', id: 'ms_ab_cookie_days', label: 'Kakans livslängd (dagar)', min: 1, max: 90, step: 1, default: 30 },
    ],
  });
  return `${JSON.stringify(schema, null, 2)}\n`;
}

// Språkmärkta galleribilder: alt som börjar med [SV]/[NO] visas bara för
// sitt språk (omärkt = alla). Dawns slider hoppar själv över dolda bilder.
export const GALLERIFILTER_MARKE = 'opf-gallerifilter';
export function msHeadGallerifilter() {
  return `
{%- comment -%} ${GALLERIFILTER_MARKE}: språkmärkta galleribilder ([SV]/[NO] i alt) döljs för fel språk. {%- endcomment -%}
{%- assign opf_dolj = '[NO]' -%}{%- if request.locale.iso_code == 'nb' -%}{%- assign opf_dolj = '[SV]' -%}{%- endif -%}
<style>.product__media-item:has(img[alt^="{{ opf_dolj }}"]),.thumbnail-list__item:has(img[alt^="{{ opf_dolj }}"]),.product__media-list li:has(img[alt^="{{ opf_dolj }}"]){display:none!important}</style>
`;
}
