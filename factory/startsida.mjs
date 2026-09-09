// Startsidan och sidfotens bolagsblock — byggda UR KONFIGEN, aldrig ärvda.
//
// Bakgrunden (factory/FLERPRODUKT.md punkt 2, Axels bakläxa 2026-09-09):
// bas-zip:ens `templates/index.json` bär Matstrumpors startsida — hero
// "Strumpor som ser ut som mat", kollektionen `strumporna`, produkten
// `sushi-strumpor` — och `sections/footer-group.json` bär deras bolagsblock
// med `kundsupport@matstrumpor.se`. Ingen kod rörde filerna, så varje ny
// OPS-butik startade med källbutikens text tills en människa råkade se den.
// DryTrek nådde förhandsvisning med "Kilometer fyra. Fortfarande torr strumpa."
//
// Här skrivs båda filerna om från butikskonfigens `startsida:`-block.
//
// Flerproduktsbutik: startsidan visar KOLLEKTIONEN (sektionen `sortiment`),
// inte en enskild produkt. Enproduktsbutik får i stället `featured-product`.

const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);

// Ett stycke per rad. Repots YAML-läsare stödjer inte flerradiga block (| och >),
// så texten skrivs som en LISTA av stycken i konfigen — en sträng funkar också.
function tillHtml(varde) {
  const stycken = Array.isArray(varde) ? lista(varde) : lista(String(varde ?? '').split('\n'));
  return stycken.map((r) => `<p>${String(r).trim()}</p>`).join('');
}

// Sektionerna som ALLTID finns, i den ordning kunden möter dem.
// Ordningen är bas-temats — den är CRO-testad och ändras inte per butik.
function byggSektioner(butik, produkter, kollektionHandle) {
  const s = butik?.startsida ?? {};
  const brand = text(butik?.butik?.brand) ?? 'Butiken';
  const flera = produkter.length > 1;

  const sektioner = {
    ms_usp: {
      type: 'ms-usp-bar',
      settings: {
        items: lista(s.usp).join('|') || 'truck:Fri frakt – Sverige & Norge|shield:14 dagars ångerrätt',
      },
    },
    hero: {
      type: 'image-banner',
      blocks: {
        h: {
          type: 'heading',
          settings: { heading: text(s.hero?.rubrik) ?? brand, heading_size: 'h1' },
        },
        t: {
          type: 'text',
          settings: { text: text(s.hero?.text) ?? '', text_style: 'body' },
        },
        b: {
          type: 'buttons',
          settings: {
            button_label_1: text(s.hero?.knapp) ?? 'Handla nu',
            button_link_1: `shopify://collections/${kollektionHandle}`,
            button_style_secondary_1: false,
            button_label_2: '',
            button_link_2: '',
            button_style_secondary_2: true,
          },
        },
      },
      block_order: ['h', 't', 'b'],
      settings: {
        // Bilden sätts av bildsteget när butikens egna bilder ligger uppe.
        // Tom sträng = temat visar sitt eget platshållarmönster, aldrig
        // källbutikens foto.
        image: text(s.hero?.bild) ?? '',
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
    ms_marquee: {
      type: 'ms-marquee',
      settings: {
        items: lista(s.marquee).join('|') || 'Fri frakt i Sverige och Norge|14 dagars ångerrätt|Trygg betalning med Klarna',
        speed: 26,
        background: text(butik?.branding?.farger?.accent) ?? '#D9A441',
        text_color: text(butik?.branding?.farger?.accent_text) ?? '#FFFFFF',
      },
    },
  };

  // Sortimentet: flera produkter → kollektion. En produkt → featured-product.
  if (flera) {
    sektioner.sortiment = {
      type: 'featured-collection',
      settings: {
        collection: kollektionHandle,
        products_to_show: Math.max(4, produkter.length),
        title: text(s.sortiment_rubrik) ?? 'Hela sortimentet',
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
  } else {
    sektioner.produkt = {
      type: 'featured-product',
      blocks: {
        etikett: { type: 'text', settings: { text: 'Bästsäljaren', text_style: 'uppercase' } },
        titel: { type: 'title', settings: { heading_size: 'h1' } },
        pris: { type: 'price', settings: {} },
        varianter: { type: 'variant_picker', settings: { picker_type: 'button', swatch_shape: 'circle' } },
        paket: {
          type: 'custom_liquid',
          settings: {
            custom_liquid: "{% render 'ms-paket', product: section.settings.product, section_id: section.id %}",
          },
        },
        kop: {
          type: 'buy_buttons',
          settings: { show_dynamic_checkout: false, show_gift_card_recipient: false },
        },
      },
      block_order: ['etikett', 'titel', 'pris', 'varianter', 'paket', 'kop'],
      settings: {
        product: produkter[0].produkt.id,
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
  }

  sektioner.berattelse = {
    type: 'rich-text',
    blocks: {
      h: {
        type: 'heading',
        settings: { heading: text(s.berattelse?.rubrik) ?? brand, heading_size: 'h1' },
      },
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

  sektioner.statement = {
    type: 'rich-text',
    blocks: {
      h: {
        type: 'heading',
        settings: { heading: text(s.statement?.rubrik) ?? '', heading_size: 'h1' },
      },
      b: {
        type: 'button',
        settings: {
          button_label: text(s.statement?.knapp) ?? 'Se sortimentet',
          button_link: `shopify://collections/${kollektionHandle}`,
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

  // Omdömena: ENDAST riktiga recensioner ur produktfilerna. Finns inga
  // lämnas sektionen tom och döljer sig — påhittade omdömen skrivs aldrig.
  const omdomen = produkter
    .flatMap((p) => lista(p.reviews))
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
            body: r.text,
            name: r.namn,
            verified: true,
          },
        },
      ])
    ),
    block_order: omdomen.map((_, i) => `r${i + 1}`),
    settings: {
      visible: omdomen.length > 0,
      eyebrow: 'Verifierade köp',
      heading: 'Vad kunderna säger',
      ab_test: '',
      ab_variant: '',
    },
  };

  sektioner.trygghet = {
    type: 'image-with-text',
    blocks: {
      h: {
        type: 'heading',
        settings: { heading: text(s.trygghet?.rubrik) ?? 'Handla tryggt hos oss', heading_size: 'h2' },
      },
      t: { type: 'text', settings: { text: tillHtml(s.trygghet?.text), text_style: 'body' } },
    },
    block_order: ['h', 't'],
    settings: {
      image: text(s.trygghet?.bild) ?? '',
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

  const fragor = lista(s.faq);
  sektioner.ms_faq = {
    type: 'ms-faq-section',
    blocks: Object.fromEntries(
      fragor.map((f, i) => [
        `q${i + 1}`,
        { type: 'qa', settings: { q: text(f.fraga) ?? '', a: tillHtml(f.svar) } },
      ])
    ),
    block_order: fragor.map((_, i) => `q${i + 1}`),
    settings: { heading: text(s.faq_rubrik) ?? 'Vanliga frågor' },
  };

  sektioner.ms_guarantee = {
    type: 'ms-guarantee-section',
    settings: {
      title: text(s.garanti?.rubrik) ?? '14 dagars ångerrätt',
      body: tillHtml(s.garanti?.text),
      icon: 'seal',
    },
  };

  return sektioner;
}

export function byggStartsida(butik, produkter, kollektionHandle) {
  const sektioner = byggSektioner(butik, produkter, kollektionHandle);
  const sortimentsblock = produkter.length > 1 ? 'sortiment' : 'produkt';
  const ordning = [
    'hero',
    'ms_usp',
    'ms_marquee',
    sortimentsblock,
    'berattelse',
    'statement',
    'omdomen',
    'trygghet',
    'ms_faq',
    'ms_guarantee',
  ];
  return `${JSON.stringify({ sections: sektioner, order: ordning }, null, 2)}\n`;
}

// Shopifys tema-JSON får bära ett /* … */-block överst (Dawn lägger dit en
// "rör inte den här filen"-notis). JSON.parse kvävs på det.
function lasTemaJson(ra) {
  return JSON.parse(String(ra).replace(/^﻿/, '').replace(/^\s*\/\*[\s\S]*?\*\//, '').trim());
}

// Sidfotens bolagsblock: samma uppgifter som köpvillkoren, aldrig källbutikens.
export function byggFooterGroup(befintlig, butik) {
  const b = butik?.butik ?? {};
  const data = lasTemaJson(befintlig);
  const foretaget = data?.sections?.footer?.blocks?.foretaget;
  if (foretaget) {
    foretaget.settings.subtext = [
      `<p>${b.brand} drivs av<br/>${b.bolagsnamn}<br/>Org.nr ${b.orgnr}</p>`,
      `<p>${b.supportmail}</p>`,
    ].join('');
  }
  return `${JSON.stringify(data, null, 2)}\n`;
}

// Produktmallens supportmejl — samma källtext, samma fix.
export function bytSupportmejl(innehall, gammalt, nytt) {
  return String(innehall).split(gammalt).join(nytt);
}

export function startsideRader(butik, produkter, kollektionHandle) {
  const s = butik?.startsida ?? {};
  return [
    `hero: "${text(s.hero?.rubrik) ?? '(butikens namn)'}"`,
    produkter.length > 1
      ? `sortiment: kollektionen ${kollektionHandle} med ${produkter.length} produkter`
      : `produkt: ${produkter[0].produkt.id}`,
    `${lista(s.faq).length} frågor, ${produkter.flatMap((p) => lista(p.reviews)).length} riktiga omdömen`,
    'sidfotens bolagsblock skrivs om till butikens egna uppgifter',
  ];
}
