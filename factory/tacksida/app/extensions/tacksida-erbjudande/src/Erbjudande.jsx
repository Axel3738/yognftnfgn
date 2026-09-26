// Erbjudandekortet — delas av tacksidan (Tack.jsx) och orderstatussidan
// (Order.jsx). Preact + Shopifys webbkomponenter (api 2026-07).
//
// Vad som händer:
//  1. Inställningarna läses (kassaredigeraren); tomt fält ⇒ STANDARD nedan.
//  2. Produkterna hämtas via Storefront API i kundens land + språk, så titel,
//     bild och pris kommer i rätt valuta och på rätt språk (samma källa som
//     kassan). Produkter som redan ligger i ordern visas inte.
//  3. Knappen är en cart-permalink: ny kassa med varan, rabattkoden pålagd,
//     e-post och leveransadress förifyllda ur ordern, och cart-attribut som
//     märker ordern (kalla=tacksida) så take-raten går att mäta.
//  4. På orderstatussidan gömmer sig kortet när `giltig_timmar` gått sedan
//     tacksidan visades (Storage API) — tacksidan visar det alltid.
//
// Aldrig: ändra den lagda ordern (går inte på tacksidan), visa ett pris
// kassan inte ger (procenten räknas på Storefront-priset i kundens valuta,
// samma tal som rabattkoden drar av), eller påstå något om produkten som
// inte står i produkten (texterna är butikens egna, per språk i locales/).
import { useEffect, useState } from 'preact/hooks';

import { STANDARD, installningar, erbjudandeFor, tolkaMarknadsdomaner, adressFor, numId, byggLank, erbjudandepris, tomt, varde } from './logik.js';

const SEDD_NYCKEL = 'tacksida_sedd';

const FRAGA = `query tacksida($h1: String!, $h2: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
  p1: product(handle: $h1) { ...Falt }
  p2: product(handle: $h2) { ...Falt }
}
fragment Falt on Product {
  id handle title availableForSale
  featuredImage { url(transform: { maxWidth: 320, maxHeight: 320, crop: CENTER }) altText }
  variants(first: 1) { nodes { id availableForSale price { amount currencyCode } compareAtPrice { amount currencyCode } } }
}`;

async function hamtaProdukter(inst, land, sprak) {
  const variables = { h1: inst.produkt_1, h2: tomt(inst.produkt_2) ? inst.produkt_1 : inst.produkt_2 };
  if (land) variables.country = String(land).toUpperCase();
  if (sprak) variables.language = String(sprak).split('-')[0].toUpperCase();
  const svar = await shopify.query(FRAGA, { variables });
  if (svar?.errors?.length && !svar?.data) throw new Error(svar.errors.map((e) => e.message).join('; '));
  const lista = [svar?.data?.p1, tomt(inst.produkt_2) ? null : svar?.data?.p2].filter(Boolean);
  return lista.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
}

function formatPris(belopp, valuta) {
  try {
    return shopify.i18n.formatCurrency(Number(belopp), { currency: valuta });
  } catch {
    return `${belopp} ${valuta}`;
  }
}

const t = (nyckel, vars) => {
  try {
    return shopify.i18n.translate(nyckel, vars);
  } catch {
    return nyckel;
  }
};

export function Erbjudande({ plats }) {
  const [lage, setLage] = useState({ status: 'laddar', produkter: [] });
  const inst = installningar(varde(shopify.settings));

  useEffect(() => {
    let avbruten = false;
    (async () => {
      try {
        // Giltighet på orderstatussidan: göm när tiden gått sedan tacksidan.
        if (plats === 'orderstatus') {
          const sedd = Number(await shopify.storage.read(SEDD_NYCKEL).catch(() => null));
          if (sedd && Date.now() - sedd > inst.giltig_timmar * 3600 * 1000) {
            if (!avbruten) setLage({ status: 'gommer', produkter: [] });
            return;
          }
        } else {
          shopify.storage.write(SEDD_NYCKEL, Date.now()).catch(() => {});
        }

        const land = varde(shopify.localization?.country)?.isoCode;
        const sprak = varde(shopify.localization?.language)?.isoCode;
        const produkter = await hamtaProdukter(inst, land, sprak);

        // Det kunden redan köpt visas inte.
        const rader = varde(shopify.lines) ?? [];
        const koptaProdukter = new Set(rader.map((r) => r?.merchandise?.product?.id).filter(Boolean));
        const kvar = produkter.filter((p) => p.availableForSale && !koptaProdukter.has(p.id) && p.variants?.nodes?.[0]?.availableForSale);

        if (!avbruten) setLage({ status: kvar.length ? 'klar' : 'gommer', produkter: kvar });
      } catch (e) {
        if (!avbruten) setLage({ status: 'fel', produkter: [], fel: String(e?.message ?? e) });
      }
    })();
    return () => {
      avbruten = true;
    };
  }, [plats]);

  if (lage.status === 'gommer' || lage.status === 'fel') return null;
  if (lage.status === 'laddar') {
    return (
      <s-section>
        <s-skeleton-paragraph lines="2" accessibilityLabel={t('laddar')}></s-skeleton-paragraph>
      </s-section>
    );
  }

  const sprak = varde(shopify.localization?.language)?.isoCode;
  const marknad = varde(shopify.localization?.market)?.handle;
  const { bas, prefix } = adressFor({ storefrontUrl: shopify.shop?.storefrontUrl, marknadHandle: marknad, sprak, inst });
  const email = varde(shopify.buyerIdentity?.email);
  const adress = varde(shopify.shippingAddress);
  const order = varde(shopify.orderConfirmation) ?? varde(shopify.order);
  const orderNamn = order?.name ?? order?.number ?? null;

  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <s-stack direction="block" gap="small-200">
          <s-heading>{t('rubrik')}</s-heading>
          <s-text color="subdued">{t('underrubrik')}</s-text>
        </s-stack>
        {lage.produkter.map((p) => {
          const v = p.variants.nodes[0];
          const valuta = v.price.currencyCode;
          const ord = Number(v.price.amount);
          const { kod, procent } = erbjudandeFor(inst, p.handle);
          const nu = erbjudandepris(ord, procent);
          const spar = Math.round((ord - nu) * 100) / 100;
          const lank = byggLank({ bas, prefix, variantId: v.id, kod, plats, orderNamn, email, adress });
          return (
            <s-box key={p.id} padding="base" border="base" borderRadius="base" background="subdued">
              <s-grid gridTemplateColumns="96px 1fr" gap="base" alignItems="center">
                {p.featuredImage ? (
                  <s-image src={p.featuredImage.url} alt={p.featuredImage.altText ?? p.title} aspectRatio="1/1" objectFit="cover" borderRadius="base" inlineSize="fill"></s-image>
                ) : (
                  <s-box></s-box>
                )}
                <s-stack direction="block" gap="small-200">
                  <s-text type="strong">{p.title}</s-text>
                  <s-text color="subdued">{t(`produkt.${p.handle}`) === `produkt.${p.handle}` ? '' : t(`produkt.${p.handle}`)}</s-text>
                  {inst.visa_ordinarie_pris && procent > 0 ? (
                    <s-stack direction="inline" gap="small-200" alignItems="center">
                      <s-text type="redundant" color="subdued">{formatPris(ord, valuta)}</s-text>
                      <s-text type="strong">{formatPris(nu, valuta)}</s-text>
                      <s-badge tone="success">{t('spar', { belopp: formatPris(spar, valuta) })}</s-badge>
                    </s-stack>
                  ) : (
                    <s-text type="strong">{t('pris_for_dig', { pris: formatPris(nu, valuta) })}</s-text>
                  )}
                </s-stack>
              </s-grid>
              <s-box paddingBlockStart="base">
                <s-button href={lank} variant="primary">
                  {t('knapp', { pris: formatPris(nu, valuta) })}
                </s-button>
              </s-box>
            </s-box>
          );
        })}
        <s-text color="subdued">{t('villkor')}</s-text>
      </s-stack>
    </s-section>
  );
}
