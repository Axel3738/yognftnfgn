// Produktfilens säljinnehåll som Shopify-metafält.
//
// Varför metafält och inte HTML i beskrivningen: temats sektioner läser fälten
// och renderar dem med butikens egen typografi, riktig köpknapp och riktig
// variantväljare. Samma sektioner fungerar för nästa produkt utan att någon
// rör temat — det är hela poängen med fabriken.
//
// Fälten speglar den fasta beskrivningsstrukturen (Axels beslut 2026-09-05):
// problem/emotion + gif → lösningen + media → funktioner → bild → garanti.
// Recensioner är INTE ett metafält längre — de ägs av Judge.me och importeras
// via judgeme.mjs → tools/judgeme-import.mjs.
//
// Namespace: opf (OPS Factory). Alla fält ligger på produkten.

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
// Shopifys url-typ kräver en riktig URL — allt annat avvisas av API:t.
const url = (v) => {
  const t = text(v);
  return t && /^https?:\/\//.test(t) ? t : null;
};

// Shopifys list-typer vill ha värdet som en JSON-array i en sträng.
const jsonLista = (arr) => JSON.stringify(arr.map(String));

export function byggMetafalt(p, _hjalp = {}) {
  const valuta = p.ekonomi?.valuta ?? 'SEK';
  const enhet = ['SEK', 'NOK', 'DKK'].includes(valuta) ? 'kr' : valuta;
  const s = p.shipping ?? {};
  const b = p.beskrivning ?? {};
  const m = p.media ?? {};

  // Butikskonfigen har redan räknat fram kundraderna ur fraktzonerna.
  // Faller tillbaka på produktens egna fält för filer som inte gått genom den.
  const fraktrader = lista(p.fraktrader);
  if (fraktrader.length === 0) {
    if (text(s.tid)) fraktrader.push(`Leveranstid: ${s.tid}`);
    if (typeof s.kostnad === 'number') {
      fraktrader.push(s.kostnad === 0 ? 'Fri frakt' : `Frakt: ${s.kostnad} ${enhet}`);
    }
    if (s.gratis_over > 0) fraktrader.push(`Fri frakt över ${s.gratis_over} ${enhet}`);
    for (const a of lista(s.alternativ)) {
      const namn = text(a.namn);
      if (!namn) continue;
      const bitar = [];
      if (typeof a.pris === 'number') bitar.push(a.pris === 0 ? 'fri frakt' : `${a.pris} ${enhet}`);
      if (text(a.tid)) bitar.push(a.tid);
      fraktrader.push(bitar.length > 0 ? `${namn}: ${bitar.join(', ')}` : namn);
    }
  }

  const falt = [
    // Blocken 1–4: beskrivningens berättelse med media.
    ['problem_rubrik', 'single_line_text_field', text(b.problem_rubrik)],
    ['problem_text', 'multi_line_text_field', text(b.problem_text)],
    ['gif_problem', 'url', url(m.gif_problem)],
    ['losning_rubrik', 'single_line_text_field', text(b.losning_rubrik)],
    ['losning_text', 'multi_line_text_field', text(b.losning_text)],
    ['media_losning', 'url', url(m.media_losning)],
    // Block 5–7.
    ['benefits', 'list.single_line_text_field', jsonLista(lista(p.benefits))],
    ['features', 'list.single_line_text_field', jsonLista(lista(p.features))],
    ['bild_lifestyle', 'url', url(m.bild_lifestyle)],
    ['garantier', 'list.single_line_text_field', jsonLista(lista(p.garantier))],
    // Stödfält som garanti-kortet och framtida trustkomponenter läser.
    ['frakt', 'list.single_line_text_field', jsonLista(fraktrader)],
    [
      'faq',
      'json',
      JSON.stringify(
        lista(p.faq).map((f) => ({ fraga: String(f.fraga ?? ''), svar: String(f.svar ?? '') }))
      ),
    ],
  ];

  // Tomma fält skickas inte alls — annars renderar temat tomma rubriker.
  return falt
    .filter(([, , varde]) => varde !== null && varde !== '[]' && varde !== '')
    .map(([key, type, value]) => ({ namespace: 'opf', key, type, value }));
}

// Snittbetyget ur produktfilens recensioner (underlag till Judge.me-importen).
// Null när recensioner saknas.
export function snittbetyg(p) {
  const betyg = lista(p.reviews)
    .map((r) => Number(r.betyg))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (betyg.length === 0) return null;
  return {
    snitt: Math.round((betyg.reduce((a, b) => a + b, 0) / betyg.length) * 10) / 10,
    antal: betyg.length,
  };
}
