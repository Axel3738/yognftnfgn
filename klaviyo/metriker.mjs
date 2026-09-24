// Metrik-id slås upp på NAMN i kontot, aldrig hårdkodat (ARKITEKTUR.md järnregel 5).
//
// GET /api/metrics (spec 2026-07-15: ingen page[size], paginering via links.next).
// Kassametriken heter olika beroende på integrationens ålder — båda namnen provas.

/** Nyckel → namnen i den ordning de provas. */
export const KANDA_METRIKER = {
  placed_order: ['Placed Order'],
  started_checkout: ['Started Checkout', 'Checkout Started'],
  viewed_product: ['Viewed Product'],
  active_on_site: ['Active on Site'],
  added_to_cart: ['Added to Cart'],
  ordered_product: ['Ordered Product'],
  opened_email: ['Opened Email'],
  clicked_email: ['Clicked Email'],
  received_email: ['Received Email'],
};

/** Metrikerna som Shopify-integrationen ska ha skapat. Saknas de är integrationen inte kopplad. */
export const SHOPIFY_METRIKER = ['placed_order', 'started_checkout', 'viewed_product', 'ordered_product'];

export async function hamtaMetriker(klient) {
  const data = await klient.allaSidor('/api/metrics');
  return data.map((m) => ({
    id: m.id,
    namn: m.attributes?.name ?? null,
    integration: m.attributes?.integration?.name ?? m.attributes?.integration?.key ?? null,
  }));
}

/**
 * Provar namnen i ordning. Första namnet med EXAKT en träff vinner.
 * Kastar vid flera träffar på ett namn (vet inte vilken) och när inget namn träffar.
 */
export function metrikId(metriker, namnLista) {
  const namn = Array.isArray(namnLista) ? namnLista : [namnLista];
  for (const n of namn) {
    const traffar = metriker.filter((m) => m.namn === n);
    if (traffar.length === 1) return traffar[0].id;
    if (traffar.length > 1) {
      const e = new Error(`Metriken "${n}" finns ${traffar.length} gånger i kontot (${traffar.map((t) => `${t.id}${t.integration ? ' från ' + t.integration : ''}`).join(', ')}). Motorn väljer inte själv — säg vilken som gäller.`);
      e.kod = 'METRIK_FLERA';
      throw e;
    }
  }
  const e = new Error(`Ingen metrik heter ${namn.map((n) => `"${n}"`).join(' eller ')} i kontot. Är Shopify-integrationen kopplad i Klaviyo (Integrations → Shopify)?`);
  e.kod = 'METRIK_SAKNAS';
  throw e;
}

/**
 * Alla kända metriker på en gång: { ids: { nyckel: id }, saknas: [{ nyckel, orsak }] }.
 * Kastar inte — den som behöver en saknad metrik stoppar själv med orsaken.
 */
export function metrikIds(metriker) {
  const ids = {};
  const saknas = [];
  for (const [nyckel, namn] of Object.entries(KANDA_METRIKER)) {
    try { ids[nyckel] = metrikId(metriker, namn); } catch (e) { saknas.push({ nyckel, namn, orsak: e.message, kod: e.kod }); }
  }
  return { ids, saknas };
}

/** Torrkörning utan nyckel: platshållare i stället för id, så planen går att läsa. */
export function platshallarIds() {
  return Object.fromEntries(Object.entries(KANDA_METRIKER).map(([k, n]) => [k, `<metrik:${n[0]}>`]));
}
