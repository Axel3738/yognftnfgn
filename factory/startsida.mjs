// Startsidan (templates/index.json) och sidfotens bolagsblock — byggda UR
// KONFIGEN (`butiker/<id>.yaml`, blocket `startsida:`), aldrig ärvda.
//
// Bakgrunden (factory/FLERPRODUKT.md punkt 2, Axels bakläxa 2026-09-09):
// bas-zip:ens `templates/index.json` bär Matstrumpors startsida — hero
// "Strumpor som ser ut som mat", kollektionen `strumporna`, produkten
// `sushi-strumpor`, fyra riktiga Matstrumpor-recensioner — och
// `sections/footer-group.json` bär deras bolagsblock med
// `kundsupport@matstrumpor.se`. Ingen kod rörde filerna, så varje ny
// OPS-butik startade med källbutikens text tills en människa råkade se den.
//
// Förenad 2026-09-09 (KEDJAN.md): TackleBay-versionen (butik.startsida,
// kollektion vs featured-product, riktiga omdömen, footer-group) + DryTrek-
// versionen (galleri med tre bilder, hero/trygghet-bilder som handles,
// produktetikett). Copyn som förr låg i `startsidor/<id>.json` bor nu i
// `butiker/<id>.yaml`, så en butik går att bygga om ur samma kedja.
//
// TRE REGLER SOM INTE FÅR BRYTAS:
//   1. Inga butiksspecifika fallbacks. Accentfärgen kommer ur
//      butik.branding, marknadstexten ur butik.marknader, allt annat ur
//      butik.startsida eller neutrala defaults. (KEDJAN.md regel 7.)
//   2. Bilder skrivs bara som `shopify://shop_images/<lagrat namn.ext>`.
//      Handlen kommer från ops.mjs (som laddar upp via filer.mjs) i
//      `alternativ.bilder`. Ett filnamn eller en URL i konfigen skrivs
//      ALDRIG rakt in i temat — tom sträng ger temats egen platshållare,
//      aldrig källbutikens foto och aldrig en trasig referens.
//   3. Omdömen är ENDAST riktiga recensioner ur produktfilerna. Finns inga
//      döljer sektionen sig. Påhittade omdömen skrivs aldrig.
//
// Flerproduktsbutik: startsidan visar KOLLEKTIONEN (sektionen `sortiment`),
// inte en enskild produkt. Enproduktsbutik får i stället `featured-product`.

const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const tal = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// Ett stycke per rad. Repots YAML-läsare stödjer inte flerradiga block (| och >),
// så texten skrivs som en LISTA av stycken i konfigen — en sträng funkar också.
// Rader som redan är HTML-stycken (<p>…</p>) lämnas som de är.
export function tillHtml(varde) {
  const stycken = Array.isArray(varde) ? lista(varde) : lista(String(varde ?? '').split('\n'));
  return stycken
    .map((r) => String(r).trim())
    .filter((r) => r !== '')
    .map((r) => (/^<p[\s>]/i.test(r) ? r : `<p>${r}</p>`))
    .join('');
}

// En bild får bara in i temat som en riktig Files-handle. Allt annat
// (filnamn, käll-URL, tomt) blir temats platshållare.
export const arBildhandle = (v) => /^shopify:\/\/shop_images\/.+\.[a-z0-9]+$/i.test(String(v ?? '').trim());
const bildHandle = (...kandidater) => {
  for (const k of kandidater) if (arBildhandle(k)) return String(k).trim();
  return '';
};

// Länderna butiken skickar till, i klartext: huvudmarknaden först, sedan
// varje rad i butik.marknader. Norge ska SYNAS (Axels beslut 2026-09-08).
const LANDNAMN = { SE: 'Sverige', NO: 'Norge', DK: 'Danmark', FI: 'Finland', DE: 'Tyskland', GB: 'Storbritannien', UK: 'Storbritannien' };
export function marknadsnamn(butik) {
  const b = butik?.butik ?? {};
  const lander = [
    text(b.huvudmarknad) ?? LANDNAMN[String(b.land ?? '').toUpperCase()] ?? null,
    ...lista(b.marknader).map((m) => LANDNAMN[String(m?.land ?? '').toUpperCase()] ?? text(m?.land)),
  ].filter(Boolean);
  return [...new Set(lander)];
}

// Neutrala defaults — härledda ur butikens egna villkor, aldrig ur någon
// annan butiks text. Används bara för fält som startsida:-blocket inte sätter.
function defaults(butik) {
  const lander = marknadsnamn(butik);
  const fri = butik?.frakt?.fri_globalt !== false;
  const dagar = tal(butik?.retur?.angerratt_dagar) ?? 14;
  const med = lander.join(' & ');
  const och = lander.length > 1 ? `${lander.slice(0, -1).join(', ')} och ${lander.at(-1)}` : (lander[0] ?? '');
  const fraktKort = fri ? (med ? `Fri frakt – ${med}` : 'Fri frakt') : (med ? `Frakt till ${med}` : 'Snabb leverans');
  const fraktLang = fri ? (och ? `Fri frakt till ${och}` : 'Fri frakt') : (och ? `Vi skickar till ${och}` : 'Snabb leverans');
  const angerratt = `${dagar} dagars ångerrätt`;
  const supportmail = text(butik?.butik?.supportmail);
  return {
    usp: [`truck:${fraktKort}`, `shield:${angerratt}`],
    marquee: [fraktLang, angerratt, 'Trygg betalning'],
    heroKnapp: 'Handla nu',
    sortimentRubrik: text(butik?.butik?.kollektion?.titel) ?? 'Sortimentet',
    statementKnapp: 'Se sortimentet',
    omdomenEyebrow: 'Verifierade köp',
    omdomenRubrik: 'Vad kunderna säger',
    trygghetRubrik: 'Handla tryggt hos oss',
    trygghetText: [`${fraktLang}.`, `${angerratt} från att paketet kommer fram.`],
    faqRubrik: 'Vanliga frågor',
    garantiRubrik: angerratt,
    garantiText: [
      `Ångrar du dig har du ${dagar} dagar på dig från att paketet kommer fram.${supportmail ? ` Hör av dig till ${supportmail} så löser vi det.` : ''}`,
    ],
  };
}

// Tolkar tredje argumentet: kontraktets { hero, bilder, kollektion } — eller
// en ren sträng (kollektionshandle) som ops.mjs skickade före kontraktet.
function lasAlternativ(butik, alternativ) {
  const a = typeof alternativ === 'string' ? { kollektion: alternativ } : (alternativ ?? {});
  const bilder = a.bilder ?? {};
  return {
    kollektion: text(a.kollektion) ?? text(butik?.butik?.kollektion?.handle) ?? 'sortimentet',
    hero: a.hero ?? bilder.hero ?? null,
    trygghet: bilder.trygghet ?? null,
    galleri: lista(bilder.galleri),
  };
}

// Sektionerna, i den ordning kunden möter dem. Ordningen är bas-temats —
// den är CRO-testad och ändras inte per butik. Sektioner utan innehåll
// (statement, galleri, FAQ) utelämnas hellre än att ritas tomma.
function byggSektioner(butik, produkter, alt) {
  const s = butik?.startsida ?? {};
  const d = defaults(butik);
  const brand = text(butik?.butik?.brand) ?? 'Butiken';
  const flera = produkter.length > 1;
  const malLank = flera ? `shopify://collections/${alt.kollektion}` : `shopify://products/${produkter[0]?.produkt?.id ?? ''}`;
  const farger = butik?.branding?.farger ?? {};
  const ordning = [];
  const sektioner = {};

  sektioner.hero = {
    type: 'image-banner',
    blocks: {
      h: { type: 'heading', settings: { heading: text(s.hero?.rubrik) ?? brand, heading_size: 'h1' } },
      t: { type: 'text', settings: { text: text(s.hero?.text) ?? '', text_style: 'body' } },
      b: {
        type: 'buttons',
        settings: {
          button_label_1: text(s.hero?.knapp) ?? d.heroKnapp,
          button_link_1: malLank,
          button_style_secondary_1: false,
          button_label_2: '',
          button_link_2: '',
          button_style_secondary_2: true,
        },
      },
    },
    block_order: ['h', 't', 'b'],
    settings: {
      // Handlen från ops.mjs vinner; en handle som redan står i konfigen
      // duger; allt annat = temats platshållare (regel 2 ovan).
      image: bildHandle(alt.hero, s.hero?.bild),
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
  };
  ordning.push('hero');

  sektioner.ms_usp = {
    type: 'ms-usp-bar',
    settings: { visible: true, items: (lista(s.usp).length > 0 ? lista(s.usp) : d.usp).join('|') },
  };
  ordning.push('ms_usp');

  // Accentfärgen ur butik.branding — saknas den får temat sin egen default,
  // aldrig en annan butiks hex.
  const marquee = {
    type: 'ms-marquee',
    settings: { items: (lista(s.marquee).length > 0 ? lista(s.marquee) : d.marquee).join('|'), speed: 26 },
  };
  if (text(farger.accent)) marquee.settings.background = text(farger.accent);
  if (text(farger.accent_text)) marquee.settings.text_color = text(farger.accent_text);
  sektioner.ms_marquee = marquee;
  ordning.push('ms_marquee');

  // Sortimentet: flera produkter → kollektion. En produkt → featured-product.
  if (flera) {
    sektioner.sortiment = {
      type: 'featured-collection',
      settings: {
        collection: alt.kollektion,
        products_to_show: Math.max(4, produkter.length),
        title: text(s.sortiment_rubrik) ?? d.sortimentRubrik,
        heading_size: 'h1',
        columns_desktop: Math.min(4, Math.max(2, produkter.length)),
        enable_desktop_slider: false,
        full_width: false,
        show_view_all: false,
        view_all_style: 'solid',
        color_scheme: 'scheme-1',
        image_ratio: 'square',
        image_shape: 'default',
        show_secondary_image: true,
        show_vendor: false,
        show_rating: false,
        columns_mobile: '2',
        swipe_on_mobile: true,
        padding_top: 40,
        padding_bottom: 40,
      },
    };
    ordning.push('sortiment');
  } else {
    // Etiketten ("Bästsäljaren" i källan) sätts bara ur konfigen — annars
    // utelämnas blocket (AVBRANDNING.md: aldrig källbutikens ord).
    const etikett = text(s.produkt_etikett);
    const blocks = {
      ...(etikett ? { etikett: { type: 'text', settings: { text: etikett, text_style: 'uppercase' } } } : {}),
      titel: { type: 'title', settings: { heading_size: 'h1' } },
      pris: { type: 'price', settings: {} },
      varianter: { type: 'variant_picker', settings: { picker_type: 'button', swatch_shape: 'circle' } },
      paket: {
        type: 'custom_liquid',
        settings: {
          custom_liquid: "{% render 'ms-paket', product: section.settings.product, section_id: section.id %}",
        },
      },
      kop: { type: 'buy_buttons', settings: { show_dynamic_checkout: false, show_gift_card_recipient: false } },
    };
    sektioner.produkt = {
      type: 'featured-product',
      blocks,
      block_order: Object.keys(blocks),
      settings: {
        // Produktens handle = produktfilens id (build-store.mjs).
        product: produkter[0]?.produkt?.id ?? '',
        color_scheme: 'scheme-1',
        secondary_background: false,
        media_size: 'medium',
        constrain_to_viewport: true,
        media_fit: 'contain',
        media_position: 'left',
        image_zoom: 'lightbox',
        hide_variants: false,
        enable_video_looping: false,
        padding_top: 36,
        padding_bottom: 36,
      },
    };
    ordning.push('produkt');
  }

  sektioner.berattelse = {
    type: 'rich-text',
    blocks: {
      h: { type: 'heading', settings: { heading: text(s.berattelse?.rubrik) ?? brand, heading_size: 'h1' } },
      t: { type: 'text', settings: { text: tillHtml(s.berattelse?.text) } },
    },
    block_order: ['h', 't'],
    settings: {
      desktop_content_position: 'center',
      content_alignment: 'center',
      color_scheme: 'scheme-1',
      full_width: true,
      padding_top: 44,
      padding_bottom: 28,
    },
  };
  ordning.push('berattelse');

  // Galleriet (DryTrek: produktens tre fästpunkter — den bevisade vinkeln).
  // Bara när konfigen har kolumner. Bildhandles ur ops.mjs i samma ordning.
  const kolumner = lista(s.galleri?.kolumner).filter((k) => text(k?.titel) || arBildhandle(k?.bild));
  if (kolumner.length > 0) {
    const blocks = Object.fromEntries(
      kolumner.map((k, i) => [
        `g${i + 1}`,
        {
          type: 'column',
          settings: {
            image: bildHandle(alt.galleri[i], k.bild),
            title: text(k.titel) ?? '',
            text: tillHtml(k.text),
            link_label: '',
            link: '',
          },
        },
      ])
    );
    sektioner.galleri = {
      type: 'multicolumn',
      blocks,
      block_order: Object.keys(blocks),
      settings: {
        title: text(s.galleri?.rubrik) ?? '',
        heading_size: 'h1',
        image_width: 'full',
        image_ratio: 'portrait',
        button_label: '',
        button_link: '',
        columns_desktop: Math.min(3, kolumner.length),
        column_alignment: 'center',
        background_style: 'none',
        columns_mobile: '1',
        swipe_on_mobile: true,
        padding_top: 36,
        padding_bottom: text(s.galleri?.markning) ? 8 : 36,
      },
    };
    ordning.push('galleri');
    // Märkningen ("Miljöbilderna är AI-genererade") sätts bara när konfigen
    // säger det — den är sann för vissa butiker och en lögn för andra.
    if (text(s.galleri?.markning)) {
      sektioner.galleri_markning = {
        type: 'custom-liquid',
        settings: {
          custom_liquid: `<p style="text-align:center;font-size:1.2rem;color:rgba(18,18,18,.55);margin:0">${text(s.galleri.markning)}</p>`,
          color_scheme: 'scheme-1',
          padding_top: 0,
          padding_bottom: 28,
        },
      };
      ordning.push('galleri_markning');
    }
  }

  if (text(s.statement?.rubrik)) {
    sektioner.statement = {
      type: 'rich-text',
      blocks: {
        h: { type: 'heading', settings: { heading: text(s.statement.rubrik), heading_size: 'h1' } },
        b: {
          type: 'button',
          settings: {
            button_label: text(s.statement?.knapp) ?? (flera ? d.statementKnapp : d.heroKnapp),
            button_link: malLank,
            button_style_secondary: false,
          },
        },
      },
      block_order: ['h', 'b'],
      settings: {
        desktop_content_position: 'center',
        content_alignment: 'center',
        color_scheme: 'scheme-2',
        full_width: true,
        padding_top: 52,
        padding_bottom: 52,
      },
    };
    ordning.push('statement');
  }

  // Omdömena: ENDAST riktiga recensioner ur produktfilerna (regel 3).
  const omdomen = produkter
    .flatMap((p) => lista(p?.reviews))
    .filter((r) => text(r?.namn) && text(r?.text))
    .slice(0, 6);
  sektioner.omdomen = {
    type: 'ms-review-slider',
    blocks: Object.fromEntries(
      omdomen.map((r, i) => [
        `r${i + 1}`,
        {
          type: 'review',
          settings: {
            stars: Number(r.betyg) || 5,
            title: text(r.titel) ?? '',
            body: text(r.text),
            name: text(r.namn),
            verified: true,
          },
        },
      ])
    ),
    block_order: omdomen.map((_, i) => `r${i + 1}`),
    settings: {
      visible: omdomen.length > 0,
      eyebrow: text(s.omdomen?.eyebrow) ?? d.omdomenEyebrow,
      heading: text(s.omdomen?.rubrik) ?? d.omdomenRubrik,
      ab_test: '',
      ab_variant: '',
    },
  };
  ordning.push('omdomen');

  sektioner.trygghet = {
    type: 'image-with-text',
    blocks: {
      h: { type: 'heading', settings: { heading: text(s.trygghet?.rubrik) ?? d.trygghetRubrik, heading_size: 'h2' } },
      t: { type: 'text', settings: { text: tillHtml(s.trygghet?.text ?? d.trygghetText), text_style: 'body' } },
    },
    block_order: ['h', 't'],
    settings: {
      image: bildHandle(alt.trygghet, s.trygghet?.bild),
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
  };
  ordning.push('trygghet');

  const fragor = lista(s.faq).filter((f) => text(f?.fraga));
  if (fragor.length > 0) {
    sektioner.ms_faq = {
      type: 'ms-faq-section',
      blocks: Object.fromEntries(
        fragor.map((f, i) => [`q${i + 1}`, { type: 'qa', settings: { q: text(f.fraga), a: tillHtml(f.svar) } }])
      ),
      block_order: fragor.map((_, i) => `q${i + 1}`),
      settings: { visible: true, heading: text(s.faq_rubrik) ?? d.faqRubrik },
    };
    ordning.push('ms_faq');
  }

  sektioner.ms_guarantee = {
    type: 'ms-guarantee-section',
    settings: {
      visible: true,
      title: text(s.garanti?.rubrik) ?? d.garantiRubrik,
      body: tillHtml(s.garanti?.text ?? d.garantiText),
      icon: 'seal',
    },
  };
  ordning.push('ms_guarantee');

  return { sektioner, ordning };
}

// byggStartsida(butik, produkter, { hero, bilder, kollektion }) → index.json
//   hero       'shopify://shop_images/<fil.ext>' från ops.mjs (via filer.mjs)
//   bilder     { hero?, trygghet?, galleri?: [handle, …] } — samma form för alla
//   kollektion handle; default butik.butik.kollektion.handle
// En ren sträng som tredje argument läses som kollektionshandle (äldre ops.mjs).
export function byggStartsida(butik, produkter, alternativ = {}) {
  const alt = lasAlternativ(butik, alternativ);
  const { sektioner, ordning } = byggSektioner(butik, lista(produkter), alt);
  return `${JSON.stringify({ sections: sektioner, order: ordning }, null, 2)}\n`;
}

// Bilderna konfigen pekar på som ops.mjs ska ladda upp FÖRE startsidan
// byggs: { hero, trygghet, galleri: [] } med råvärdet (URL eller filnamn).
// Handles som redan står i konfigen behöver ingen uppladdning och hoppas över.
export function bilderAttLaddaUpp(butik) {
  const s = butik?.startsida ?? {};
  const ra = (v) => (text(v) && !arBildhandle(v) ? text(v) : null);
  return {
    hero: ra(s.hero?.bild),
    trygghet: ra(s.trygghet?.bild),
    galleri: lista(s.galleri?.kolumner).map((k) => ra(k?.bild)),
  };
}

// Shopifys tema-JSON får bära ett /* … */-block överst (Dawn lägger dit en
// "rör inte den här filen"-notis). JSON.parse kvävs på det.
function lasTemaJson(ra) {
  return JSON.parse(String(ra).replace(/^﻿/, '').replace(/^\s*\/\*[\s\S]*?\*\//, '').trim());
}

// Sidfotens bolagsblock: samma uppgifter som köpvillkoren, aldrig
// källbutikens. Bara blocket `foretaget` rörs — resten av filen lämnas
// byte för byte (av-brandningen av ms-cookies/ms-skrapkort är avbranda.mjs).
export function byggFooterGroup(befintlig, butik) {
  const b = butik?.butik ?? {};
  const data = lasTemaJson(befintlig);
  const foretaget = data?.sections?.footer?.blocks?.foretaget;
  if (foretaget) {
    foretaget.settings = {
      ...foretaget.settings,
      subtext: [
        `<p>${text(b.brand) ?? ''} drivs av<br/>${text(b.bolagsnamn) ?? ''}<br/>Org.nr ${text(b.orgnr) ?? ''}</p>`,
        `<p>${text(b.supportmail) ?? ''}</p>`,
      ].join(''),
    };
  }
  return `${JSON.stringify(data, null, 2)}\n`;
}

// Produktmallens supportmejl — samma källtext, samma fix.
export function bytSupportmejl(innehall, gammalt, nytt) {
  return String(innehall).split(gammalt).join(nytt);
}

export function startsideRader(butik, produkter, alternativ = {}) {
  const s = butik?.startsida ?? {};
  const alt = lasAlternativ(butik, alternativ);
  const p = lista(produkter);
  const bilder = bilderAttLaddaUpp(butik);
  const vantar = [bilder.hero && 'hero', bilder.trygghet && 'trygghet', ...bilder.galleri.map((x, i) => x && `galleri ${i + 1}`)].filter(Boolean);
  return [
    `hero: "${text(s.hero?.rubrik) ?? '(butikens namn)'}"${bildHandle(alt.hero, s.hero?.bild) ? ' med bild' : ' (temats platshållare tills bilden är uppladdad)'}`,
    p.length > 1
      ? `sortiment: kollektionen ${alt.kollektion} med ${p.length} produkter`
      : `produkt: ${p[0]?.produkt?.id ?? '(ingen produkt)'}`,
    `${lista(s.faq).length} frågor, ${p.flatMap((x) => lista(x?.reviews)).length} riktiga omdömen, ${lista(s.galleri?.kolumner).length} galleribilder`,
    ...(vantar.length > 0 ? [`bilder som ops.mjs laddar upp via filer.mjs först: ${vantar.join(', ')}`] : []),
    'sidfotens bolagsblock skrivs om till butikens egna uppgifter',
  ];
}
