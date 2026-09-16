// Logiken bakom one-size.mjs, utan Shopify — så den går att testa utan butik.
//
// Målet: varje strumpa i butiken ska ha alternativet "Storlek" med det enda
// värdet "One Size". Då visar Dawns variantväljare "Storlek: One Size" under
// valet av 3 eller 5 par, och samma rad följer med i varukorgen, kassan och
// orderbekräftelsen. Kunden ska aldrig behöva undra vilken storlek hen köper.
//
// Variant-id:n rörs ALDRIG. Paketnivåerna (metaobjekten), rabattkoderna och
// Meta-katalogen pekar på dem. Båda mutationerna nedan behåller varianterna
// och ändrar bara alternativen på dem.

export const ALTERNATIV = 'Storlek';
export const VÄRDE = 'One Size';

// Shopifys "inga alternativ"-läge: ett alternativ som heter Title med värdet
// Default Title. Det ska bytas ut, inte få sällskap.
const STANDARD_ALTERNATIV = 'title';
const STANDARD_VÄRDE = 'default title';

export const PRODUKTFÄLT = `
  id title handle status isGiftCard
  options { id name position values optionValues { id name } }
  variants(first: 100) { nodes { id title selectedOptions { name value } } }`;

export const FRÅGA_ALLA = `query($efter: String) {
  products(first: 50, after: $efter) {
    pageInfo { hasNextPage endCursor }
    nodes { ${PRODUKTFÄLT} }
  }
}`;

export const FRÅGA_EN = `query($id: ID!) { product(id: $id) { ${PRODUKTFÄLT} } }`;

// LEAVE_AS_IS: inga nya varianter, de som finns får det första värdet (One Size).
export const MUTATION_LÄGG_TILL = `mutation($productId: ID!, $options: [OptionCreateInput!]!) {
  productOptionsCreate(productId: $productId, options: $options, variantStrategy: LEAVE_AS_IS) {
    userErrors { field message code }
  }
}`;

// Döper om Title → Storlek och Default Title → One Size på samma variant.
export const MUTATION_DÖP_OM = `mutation($productId: ID!, $option: OptionUpdateInput!, $varden: [OptionValueUpdateInput!]) {
  productOptionUpdate(productId: $productId, option: $option, optionValuesToUpdate: $varden, variantStrategy: LEAVE_AS_IS) {
    userErrors { field message code }
  }
}`;

const norm = s => String(s ?? '').trim().toLowerCase();
const varianterAv = p => p.variants?.nodes ?? p.variants ?? [];

// Presentkortet och ätpinnarna (gåvan) ska inte ha någon storlek.
export function ärStrumpa(p) {
  return !p.isGiftCard && /strump/i.test(p.title ?? '');
}

// Sant bara när VARJE variant har Storlek = One Size och Title inte ligger kvar.
export function harOneSize(p) {
  const varianter = varianterAv(p);
  if (!varianter.length) return false;
  if ((p.options ?? []).some(o => norm(o.name) === STANDARD_ALTERNATIV)) return false;
  return varianter.every(v =>
    (v.selectedOptions ?? []).some(o => norm(o.name) === norm(ALTERNATIV) && norm(o.value) === norm(VÄRDE)));
}

// Bestämmer vad som ska göras med en produkt. Vägrar hellre än gissar: allt
// som inte är ett rent "lägg till" eller "döp om" hoppas över med ett skäl.
export function planera(p) {
  const grund = { id: p.id, titel: p.title, varianter: varianterAv(p).map(v => v.title) };

  if (!ärStrumpa(p)) return { ...grund, åtgärd: 'hoppa', skäl: p.isGiftCard ? 'presentkort' : 'ingen strumpa' };
  if (harOneSize(p)) return { ...grund, åtgärd: 'klar', skäl: `har redan ${ALTERNATIV}: ${VÄRDE}` };

  const alternativ = p.options ?? [];

  const samma = alternativ.find(o => norm(o.name) === norm(ALTERNATIV));
  if (samma) {
    return { ...grund, åtgärd: 'hoppa', skäl: `har redan alternativet ${samma.name} med värdena ${(samma.values ?? []).join(', ')} — vad som ska hända med dem är Axels beslut` };
  }
  const bärVärdet = alternativ.find(o => (o.values ?? []).some(v => norm(v) === norm(VÄRDE)));
  if (bärVärdet) {
    return { ...grund, åtgärd: 'hoppa', skäl: `värdet ${VÄRDE} ligger redan under alternativet ${bärVärdet.name}` };
  }

  if (alternativ.length === 1 && norm(alternativ[0].name) === STANDARD_ALTERNATIV) {
    const o = alternativ[0];
    const värde = (o.optionValues ?? []).find(v => norm(v.name) === STANDARD_VÄRDE) ?? o.optionValues?.[0];
    if (!värde?.id) return { ...grund, åtgärd: 'hoppa', skäl: 'hittar inget id på Default Title-värdet' };
    return { ...grund, åtgärd: 'döp-om', alternativId: o.id, värdeId: värde.id };
  }

  if (alternativ.length >= 3) return { ...grund, åtgärd: 'hoppa', skäl: 'har redan tre alternativ, Shopify tillåter inte fler' };

  return { ...grund, åtgärd: 'lägg-till', position: alternativ.length + 1 };
}

export function variabler(plan) {
  if (plan.åtgärd === 'lägg-till') {
    return { productId: plan.id, options: [{ name: ALTERNATIV, position: plan.position, values: [{ name: VÄRDE }] }] };
  }
  if (plan.åtgärd === 'döp-om') {
    return { productId: plan.id, option: { id: plan.alternativId, name: ALTERNATIV }, varden: [{ id: plan.värdeId, name: VÄRDE }] };
  }
  return null;
}

export function beskriv(plan) {
  const v = plan.varianter.length ? ` (varianter: ${plan.varianter.join(', ')})` : '';
  switch (plan.åtgärd) {
    case 'lägg-till': return `✚ ${plan.titel} — lägger till ${ALTERNATIV}: ${VÄRDE} som alternativ ${plan.position}${v}`;
    case 'döp-om': return `✎ ${plan.titel} — döper om Title/Default Title till ${ALTERNATIV}/${VÄRDE}`;
    case 'klar': return `✔ ${plan.titel} — ${plan.skäl}`;
    default: return `– ${plan.titel} — hoppar över: ${plan.skäl}`;
  }
}

// Utför en plan mot butiken och läser sedan tillbaka produkten för att
// verifiera. Det är avläsningen som avgör om det lyckades — inte att
// mutationen svarade utan fel. gql skickas in så det går att testa med en låtsasbutik.
export async function utför(plan, gql) {
  const steg = [];

  const kör = async delplan => {
    const mutation = delplan.åtgärd === 'döp-om' ? MUTATION_DÖP_OM : MUTATION_LÄGG_TILL;
    const d = await gql(mutation, variabler(delplan));
    const svar = d.productOptionUpdate ?? d.productOptionsCreate ?? {};
    const fel = svar.userErrors ?? [];
    steg.push(`${delplan.åtgärd}: ${fel.length ? fel.map(f => [f.code, f.message].filter(Boolean).join(' ')).join('; ') : 'ok'}`);
    return fel.length === 0;
  };

  let gick = await kör(plan);
  // Går standardalternativet inte att döpa om: lägg till Storlek som första
  // alternativ i stället. Shopify byter då ut Title/Default Title. Avläsningen
  // nedan avslöjar om Title ändå blev kvar.
  if (!gick && plan.åtgärd === 'döp-om') gick = await kör({ ...plan, åtgärd: 'lägg-till', position: 1 });

  const efter = (await gql(FRÅGA_EN, { id: plan.id })).product ?? {};
  const ok = gick && harOneSize(efter);
  if (!ok && gick) steg.push(`avläsning: ${ALTERNATIV}: ${VÄRDE} saknas fortfarande på minst en variant`);

  return {
    ok,
    steg,
    alternativ: (efter.options ?? []).map(o => `${o.name}: ${(o.values ?? []).join(' / ')}`),
    varianter: varianterAv(efter).map(v => v.title),
  };
}
