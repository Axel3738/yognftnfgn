// Värva-en-vän-kortet — delas av tacksidan (Tack.jsx) och orderstatussidan
// (Order.jsx). Preact + Shopifys webbkomponenter (api 2026-07).
//
// Kunden får en länk med sitt eget bekräftelsenummer (matstrumpor.se/?van=…).
// Temats skript (assets/ms-varva.js) lägger vännens rabattkod i varukorgen och
// märker ordern; matstrumpor/varva.mjs betalar ut krediten när vännens första
// paket har skickats. Beloppen och länkarna kommer ur data.js, som byggs ur
// matstrumpor/varva/konfig.json — kortet räknar aldrig ut ett belopp själv.
//
// Aldrig: visa kortet i en valuta eller på ett språk som saknar belopp eller
// länk (då syns inget), eller skriva rabattkoden i länken.
import { useState } from 'preact/hooks';

import { DATA } from './data.js';
import { varde, kortFor, fyll, decimaler, nummerFor } from './logik.js';

const EXEMPEL = 'EXEMPEL1';

const t = (nyckel) => {
  try {
    const s = shopify.i18n.translate(nyckel);
    return typeof s === 'string' && s !== nyckel ? s : '';
  } catch {
    return '';
  }
};

function pengar(belopp, valuta) {
  const d = decimaler(belopp);
  try {
    return shopify.i18n.formatCurrency(Number(belopp), { currency: valuta, minimumFractionDigits: d, maximumFractionDigits: d });
  } catch {
    return `${belopp} ${valuta}`;
  }
}

export function Kort({ plats }) {
  const [kopierad, setKopierad] = useState(false);
  // Läses i komponenten, inte i extension(): värdena är signaler, och kortet ritas
  // om när Shopify fyller i dem.
  const order = plats === 'orderstatus' ? varde(shopify.order) : null;
  // I redigerarna finns ingen riktig order. Då visas kortet med ett
  // exempelnummer, annars syns det inte när blocket läggs in (logik.js nummerFor).
  const nummer = nummerFor({
    plats,
    bekraftelse: plats === 'tack' ? varde(shopify.orderConfirmation) : null,
    order,
    iRedigeraren: Boolean(shopify.extension?.editor),
    exempel: EXEMPEL,
  });
  const avbruten = Boolean(order?.cancelledAt);
  const sprak = varde(shopify.localization?.language)?.isoCode;
  const valuta = varde(shopify.localization?.currency)?.isoCode;
  const kort = kortFor({ data: DATA, sprak, valuta, nummer, avbruten });
  if (!kort) return null;

  const vars = { van: pengar(kort.van, kort.valuta), kredit: pengar(kort.kredit, kort.valuta) };
  const rubrik = fyll(t('rubrik'), vars);
  if (!rubrik) return null;

  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <s-heading>{rubrik}</s-heading>
        <s-text>{fyll(t('text'), vars)}</s-text>
        <s-text-field label={t('lank')} value={kort.url} readOnly></s-text-field>
        <s-clipboard-item id="varva-lank" text={kort.url} oncopy={() => setKopierad(true)}></s-clipboard-item>
        <s-button commandFor="varva-lank" command="--copy" variant="primary">
          {kopierad ? t('kopierad') : t('kopiera')}
        </s-button>
        <s-text color="subdued">{fyll(t('villkor'), vars)}</s-text>
      </s-stack>
    </s-section>
  );
}
