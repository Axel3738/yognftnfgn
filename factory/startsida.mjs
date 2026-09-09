// startsida.mjs — bygger butikens startsida (templates/index.json).
//
//   node factory/startsida.mjs <butik-id> <produkt-handle> [--locale nb]
//
// VARFÖR STEGET FINNS: bas-zip:ens templates/index.json pekar på MATSTRUMPOR
// (`produkt.product = "sushi-strumpor"`, `sortiment.collection =
// "strumporna"`). Ingen kod i fabriken rörde filen — startsidan byggdes för
// hand varje gång, och missades det fick butiken en startsida som pekade på
// en produkt som inte finns (PROCESS.md, "Regler som bevisats den hårda
// vägen"). Nu byggs den av fabriken.
//
// Innehållet kommer ur factory/startsidor/<butik-id>.json: ett copyblock per
// språk plus bildhandles. Ingen text står i koden.
//
// TVÅ SEKTIONER UR BASMALLEN ÄR MEDVETET BORTA:
//   sortiment (featured-collection) — en enproduktsbutik har ingen kollektion.
//   omdomen (ms-review-slider)      — sektionen ritar recensioner ur temat.
//     En butik utan riktiga recensioner får INTE visa den. Sätt
//     "visa_omdomen": true i konfigen först när det finns äkta omdömen.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { laddaEnv } from './env.mjs';
import { graphql, hamtaUtkastTema, skrivTemafiler, verifieraTemafiler } from './shopify.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

export function byggIndex(copy, { produktHandle, bilder, farger }) {
  const sections = {
    hero: {
      type: 'image-banner',
      blocks: {
        h: { type: 'heading', settings: { heading: copy.hero_heading, heading_size: 'h1' } },
        t: { type: 'text', settings: { text: copy.hero_text, text_style: 'body' } },
        b: {
          type: 'buttons',
          settings: {
            button_label_1: copy.hero_knapp,
            button_link_1: `shopify://products/${produktHandle}`,
            button_style_secondary_1: false,
            button_label_2: '',
            button_link_2: '',
            button_style_secondary_2: true,
          },
        },
      },
      block_order: ['h', 't', 'b'],
      settings: {
        image: bilder.hero,
        image_overlay_opacity: 20,
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
    ms_usp: { type: 'ms-usp-bar', settings: { visible: true, items: copy.usp_items.join('|') } },
    produkt: {
      type: 'featured-product',
      blocks: {
        etikett: { type: 'text', settings: { text: copy.produkt_etikett, text_style: 'uppercase' } },
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
      },
      block_order: ['etikett', 'titel', 'pris', 'varianter', 'paket', 'kop'],
      settings: {
        product: produktHandle,
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
    },
    ms_marquee: {
      type: 'ms-marquee',
      settings: {
        items: copy.marquee_items.join('|'),
        speed: 26,
        background: farger.accent,
        text_color: farger.accent_text,
      },
    },
    berattelse: {
      type: 'rich-text',
      blocks: {
        h: { type: 'heading', settings: { heading: copy.berattelse_heading, heading_size: 'h1' } },
        t: { type: 'text', settings: { text: copy.berattelse_text } },
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
    },
    galleri: {
      type: 'multicolumn',
      blocks: {
        g1: { type: 'column', settings: { image: bilder.galleri_1, title: copy.galleri_1, text: '', link_label: '', link: '' } },
        g2: { type: 'column', settings: { image: bilder.galleri_2, title: copy.galleri_2, text: '', link_label: '', link: '' } },
        g3: { type: 'column', settings: { image: bilder.galleri_3, title: copy.galleri_3, text: '', link_label: '', link: '' } },
      },
      block_order: ['g1', 'g2', 'g3'],
      settings: {
        title: copy.galleri_titel,
        heading_size: 'h1',
        image_width: 'full',
        image_ratio: 'portrait',
        button_label: '',
        button_link: '',
        columns_desktop: 3,
        column_alignment: 'center',
        background_style: 'none',
        columns_mobile: '1',
        swipe_on_mobile: true,
        padding_top: 36,
        padding_bottom: 36,
      },
    },
    trygghet: {
      type: 'image-with-text',
      blocks: {
        h: { type: 'heading', settings: { heading: copy.trygghet_heading, heading_size: 'h2' } },
        t: { type: 'text', settings: { text: copy.trygghet_text, text_style: 'body' } },
      },
      block_order: ['h', 't'],
      settings: {
        image: bilder.trygghet,
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
      blocks: Object.fromEntries(
        copy.faq.map((f, i) => [`q${i + 1}`, { type: 'qa', settings: { q: f.fraga, a: f.svar } }])
      ),
      block_order: copy.faq.map((_, i) => `q${i + 1}`),
      settings: { heading: copy.faq_rubrik ?? 'Vanliga frågor' },
    },
    ms_guarantee: {
      type: 'ms-guarantee-section',
      settings: { title: copy.garanti_titel, body: copy.garanti_text, icon: 'seal' },
    },
    statement: {
      type: 'rich-text',
      blocks: {
        h: { type: 'heading', settings: { heading: copy.statement_heading, heading_size: 'h1' } },
        b: {
          type: 'button',
          settings: {
            button_label: copy.statement_knapp,
            button_link: `shopify://products/${produktHandle}`,
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
    },
  };

  return {
    sections,
    order: [
      'hero', 'ms_usp', 'produkt', 'ms_marquee', 'berattelse',
      'galleri', 'trygghet', 'ms_faq', 'ms_guarantee', 'statement',
    ],
  };
}

if (process.argv[1] && process.argv[1].endsWith('startsida.mjs')) {
  laddaEnv();
  const [butikId, produktHandle] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!butikId || !produktHandle) {
    throw new Error('Användning: node factory/startsida.mjs <butik-id> <produkt-handle>');
  }
  const konf = JSON.parse(readFileSync(join(ROT, 'startsidor', `${butikId}.json`), 'utf8'));

  // Produkten måste finnas OCH vara ACTIVE — en DRAFT-produkt ger 404 i
  // kundvyn och "Exempel på produktnamn" i sektionen.
  const p = await graphql(
    `query opsFactoryStartProdukt($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) { id handle status }
    }`,
    { handle: produktHandle }
  );
  if (!p.productByIdentifier) throw new Error(`Produkten ${produktHandle} finns inte i butiken.`);
  if (p.productByIdentifier.status !== 'ACTIVE') {
    throw new Error(`Produkten ${produktHandle} är ${p.productByIdentifier.status} — startsidan skulle visa en exempelprodukt. Aktivera den först.`);
  }

  const tema = await hamtaUtkastTema();
  if (!tema) throw new Error('Inget utkasttema i butiken — kör factory/tema-upload.mjs först.');

  const mall = byggIndex(konf.sv, {
    produktHandle,
    bilder: konf.bilder,
    farger: konf.farger,
  });
  const innehall = JSON.stringify(mall, null, 2);

  // Båda tar { filnamn: innehåll }. verifieraTemafiler jämför byte för byte
  // och returnerar avvikelserna som textrader — tom lista = allt stämmer.
  const filer = { 'templates/index.json': innehall };
  await skrivTemafiler(tema.id, filer);
  const avvikelser = await verifieraTemafiler(tema.id, filer);
  if (avvikelser.length > 0) throw new Error(`Startsidan skrevs inte rätt: ${avvikelser.join('; ')}`);

  console.log(`✅ Startsidan skriven till "${tema.name}"`);
  console.log(`   ${mall.order.length} sektioner: ${mall.order.join(', ')}`);
  console.log(`   produkten: ${produktHandle} (${p.productByIdentifier.status})`);
  console.log('   ⚠️ Utan riktiga recensioner ritas ingen omdömessektion — med flit.');
}
