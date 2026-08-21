// Den rena logiken bakom uppladdningen: bygga produktmallen, koppla in ms-head,
// slå ihop settings_schema. Ligger separat för att den går att testa utan att
// röra Shopify — och den är den enda delen där ett fel gör produktsidan tom.

// Temats egen köpknapp heter olika i olika teman. Vi letar, vi antar inte.
export const KNAPP_MÖNSTER = /buy[-_]?buttons?|product[-_]form|add[-_]?to[-_]?cart/i;

// Ordningen i köpblocket. Står i docs/uppladdning.md steg 6 — ändra där först.
export const FÖRE_KNAPPEN = ['ms-points', 'ms-bundle'];
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

// Bygger templates/product.json. Vägrar hellre än gissar: pekar mallen på en
// blocktyp temat inte känner igen blir produktsidan tom, och det syns inte som
// ett felmeddelande någonstans.
export function byggMall({ mall, huvudId, tarEmotTemablock, sektionsfil = 'produktsektionen' }) {
  if (!tarEmotTemablock) {
    throw new Error(
      `Sektionen ${sektionsfil} tar inte emot temablock ("@theme" saknas i dess schema).\n` +
      'Läggs våra block in ändå blir produktsidan tom. Steg 6 måste göras för hand:\n' +
      'antingen med ett bastema som stöder temablock (Horizon), eller genom att\n' +
      'lägga ms-* som egna sektioner i stället för block.',
    );
  }

  const ny = structuredClone(mall);
  const sektion = ny.sections[huvudId];
  if (!sektion) throw new Error(`Mallen har ingen sektion "${huvudId}".`);
  sektion.blocks ??= {};

  // Rensa våra egna block först, så en omkörning inte dubblerar dem.
  const våra = new Set([...FÖRE_KNAPPEN, ...EFTER_KNAPPEN]);
  for (const id of Object.keys(sektion.blocks)) {
    if (våra.has(sektion.blocks[id].type)) delete sektion.blocks[id];
  }
  const ordning = (sektion.block_order ?? Object.keys(sektion.blocks)).filter(id => sektion.blocks[id]);

  const knapp = ordning.findIndex(id => KNAPP_MÖNSTER.test(sektion.blocks[id].type ?? ''));
  if (knapp === -1) throw new Error('Hittade ingen köpknapp i block_order — vägrar gissa var blocken ska ligga.');

  const läggTill = typ => {
    sektion.blocks[typ] = { type: typ, settings: {} };
    return typ;
  };
  sektion.block_order = [
    ...ordning.slice(0, knapp),
    ...FÖRE_KNAPPEN.map(läggTill),
    ordning[knapp],
    ...EFTER_KNAPPEN.map(läggTill),
    ...ordning.slice(knapp + 1),
  ];

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
