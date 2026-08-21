// Den rena logiken bakom uppladdningen: bygga produktmallen, koppla in ms-head,
// slå ihop settings_schema. Ligger separat för att den går att testa utan att
// röra Shopify — och den är den enda delen där ett fel gör produktsidan tom.

// Temats egen köpknapp heter olika i olika teman. Vi letar, vi antar inte.
export const KNAPP_MÖNSTER = /buy[-_]?buttons?|product[-_]form|add[-_]?to[-_]?cart/i;

// Ordningen i köpblocket. Står i docs/uppladdning.md steg 6 — ändra där först.
// Säljpunkterna sitter direkt under priset (där ögat är), paketväljaren direkt
// före knappen (där valet ska göras). Mellan dem ligger temats egna block.
export const PRIS_MÖNSTER = /price/i;
export const EFTER_PRISET = ['ms-points'];
export const FÖRE_KNAPPEN = ['ms-bundle'];
export const EFTER_KNAPPEN = ['ms-trust', 'ms-delivery', 'ms-pay', 'ms-faq', 'ms-guarantee'];
export const SEKTIONER_UNDER = ['ms-compare', 'ms-reviews', 'ms-faq-section'];
export const SIST_I_MALLEN = 'ms-sticky-atc';

export function plockaSchema(liquid) {
  const m = liquid.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

// Hittar sektionen som faktiskt innehåller köpknappen. Namnet på produktsektionen
// skiljer sig mellan Horizon och Dawn, så vi går på innehåll före namn.
export function hittaProduktsektion(mall) {
  const poster = Object.entries(mall.sections ?? {});
  const viaKnapp = poster.find(([, s]) =>
    Object.values(s.blocks ?? {}).some(b => KNAPP_MÖNSTER.test(b.type ?? '')));
  if (viaKnapp) return viaKnapp;
  return poster.find(([, s]) => /main[-_]product|product[-_]information/i.test(s.type ?? '')) ?? null;
}

export function kopplaInHead(layout) {
  if (layout.includes("render 'ms-head'") || layout.includes('render "ms-head"')) return null;
  if (!layout.includes('</head>')) throw new Error('layout/theme.liquid saknar </head> — kan inte koppla in ms-head.');
  return layout.replace('</head>', "  {% render 'ms-head' %}\n</head>");
}

export function slåIhopInställningar(rå, fragment) {
  const nuvarande = JSON.parse(rå);
  const namn = new Set(fragment.map(f => f.name));
  // Ta bort en tidigare version av vår egen grupp, behåll theme_info först.
  const kvar = nuvarande.filter(g => !namn.has(g.name));
  return JSON.stringify([...kvar, ...fragment], null, 2);
}

// Render-anropen som används när temat inte tar emot temablock. Speglar
// blocks/ms-*.liquid: samma snippet, samma standardvärden.
export const RENDER = {
  'ms-points': "{% render 'ms-sales-points', points: 'En storlek passar alla|Levereras i presentförpackning|Premiumkvalitet som håller', icon: 'check-circle' %}",
  'ms-bundle': "{% render 'ms-bundle-picker', product: product, heading: 'Välj ditt paket', mode: 'auto', unit_word: 'par', popular_index: 0, popular_text: 'Populärast', tiers: '1,2,3', discount_percent: 0, section_id: section.id %}",
  'ms-trust': "{% render 'ms-trust-row', items: 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning' %}",
  'ms-delivery': "{% render 'ms-delivery-estimate', min_days: 5, max_days: 10, cutoff_hour: 0, text: 'Beräknad leverans' %}",
  'ms-pay': "{% render 'ms-payment-icons', label: 'Trygg betalning med' %}",
  'ms-faq': "{% render 'ms-faq', pairs: 'Passar de alla?::En storlek passar de flesta, ungefär strl 36–44.|Hur snabbt kommer de?::5–10 arbetsdagar med fri frakt inom Sverige.' %}",
  'ms-guarantee': "{% render 'ms-guarantee', title: '30 dagars öppet köp', body: '<p>Inte nöjd? Hör av dig inom 30 dagar så löser vi det. Inget krångel.</p>', icon: 'seal' %}",
};

// Bygger templates/product.json. Vägrar hellre än gissar: pekar mallen på en
// blocktyp temat inte känner igen blir produktsidan tom, och det syns inte som
// ett felmeddelande någonstans.
//
// Två vägar in i köprutan, och vilken som gäller avgörs av temat:
//   temablock     sektionen har "@theme" i sitt schema (Horizon) → blocks/ms-*
//   custom_liquid sektionen har Dawns egen custom_liquid-lucka  → RENDER ovan
// Dawn tar INTE emot temablock (verifierat 2026-08-21: main-product listar
// bara @app), men dess custom_liquid renderar {% render %} utan problem.
export function byggMall({ mall, huvudId, tarEmotTemablock, blockTyper = [], sektionsfil = 'produktsektionen' }) {
  const viaCustomLiquid = !tarEmotTemablock && blockTyper.includes('custom_liquid');
  if (!tarEmotTemablock && !viaCustomLiquid) {
    throw new Error(
      `Sektionen ${sektionsfil} tar varken emot temablock ("@theme") eller custom_liquid.\n` +
      'Läggs våra block in ändå blir produktsidan tom. Steg 6 måste göras för hand:\n' +
      'antingen med ett bastema som stöder temablock (Horizon), eller genom att\n' +
      'lägga ms-* som egna sektioner i stället för block.',
    );
  }

  const ny = structuredClone(mall);
  const sektion = ny.sections[huvudId];
  if (!sektion) throw new Error(`Mallen har ingen sektion "${huvudId}".`);
  sektion.blocks ??= {};

  // Rensa våra egna block först, så en omkörning inte dubblerar dem. Via
  // custom_liquid heter blocken inte ms-* i temat, så de känns igen på id:t.
  const våra = new Set([...EFTER_PRISET, ...FÖRE_KNAPPEN, ...EFTER_KNAPPEN]);
  const vårtId = typ => typ.replace(/-/g, '_');
  const våraIdn = new Set([...våra].map(vårtId));
  for (const id of Object.keys(sektion.blocks)) {
    if (våra.has(sektion.blocks[id].type) || våraIdn.has(id)) delete sektion.blocks[id];
  }
  const ordning = (sektion.block_order ?? Object.keys(sektion.blocks)).filter(id => sektion.blocks[id]);

  const knapp = ordning.findIndex(id => KNAPP_MÖNSTER.test(sektion.blocks[id].type ?? ''));
  if (knapp === -1) throw new Error('Hittade ingen köpknapp i block_order — vägrar gissa var blocken ska ligga.');

  const läggTill = typ => {
    const id = viaCustomLiquid ? vårtId(typ) : typ;
    sektion.blocks[id] = viaCustomLiquid
      ? { type: 'custom_liquid', settings: { custom_liquid: RENDER[typ] } }
      : { type: typ, settings: {} };
    return id;
  };
  // Säljpunkterna hakas på priset. Hittas inget prisblock hamnar de i stället
  // ihop med paketväljaren före knappen — hellre en rad för långt ner än att
  // gissa fram en plats mitt i temats egna block.
  const pris = ordning.findIndex(id => PRIS_MÖNSTER.test(sektion.blocks[id].type ?? ''));
  const efterPriset = pris !== -1 && pris < knapp ? pris : knapp - 1;

  sektion.block_order = ordning.flatMap((id, i) => {
    const rad = [];
    if (i === knapp) rad.push(...FÖRE_KNAPPEN.map(läggTill));
    rad.push(id);
    if (i === efterPriset) rad.push(...EFTER_PRISET.map(läggTill));
    if (i === knapp) rad.push(...EFTER_KNAPPEN.map(läggTill));
    return rad;
  });

  // Sektionerna under köpblocket, och sticky-knappen allra sist i mallen.
  const våraSektioner = [...SEKTIONER_UNDER, SIST_I_MALLEN];
  ny.order = (ny.order ?? []).filter(id => !våraSektioner.includes(id));
  for (const typ of våraSektioner) ny.sections[typ] = { type: typ, settings: {} };

  const efterHuvud = ny.order.indexOf(huvudId) + 1;
  ny.order = [
    ...ny.order.slice(0, efterHuvud),
    ...SEKTIONER_UNDER,
    ...ny.order.slice(efterHuvud),
    SIST_I_MALLEN,
  ];

  return ny;
}
