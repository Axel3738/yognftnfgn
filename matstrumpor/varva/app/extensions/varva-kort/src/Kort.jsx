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
import { TEXTER } from './texter.js';
import { varde, kortFor, fyll, decimaler, nummerFor, texterFor, orsakUtanKort } from './logik.js';

const EXEMPEL = 'EXEMPEL1';

// Shopifys översättning först. Kundkontots orderstatussida kan sakna
// i18n-hjälparna (typerna säger det), och då tar texter.js över.
const tFor = (sprak) => (nyckel) => {
  try {
    const s = shopify.i18n.translate(nyckel);
    if (typeof s === 'string' && s && s !== nyckel) return s;
  } catch {
    // reserven nedan
  }
  return texterFor(TEXTER, sprak)?.[nyckel] ?? '';
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
  let order = null;
  try {
    // Läses i komponenten, inte i extension(): värdena är signaler, och kortet ritas
    // om när Shopify fyller i dem.
    order = plats === 'orderstatus' ? varde(shopify.order) : null;
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
    const sprak = varde(shopify.localization?.language)?.isoCode ?? varde(shopify.localization?.extensionLanguage)?.isoCode;
    const valuta = varde(shopify.localization?.currency)?.isoCode ?? varde(shopify.cost?.totalAmount)?.currencyCode;
    const kort = kortFor({ data: DATA, sprak, valuta, nummer, avbruten });
    const t = tFor(sprak);
    const vars = kort ? { van: pengar(kort.van, kort.valuta), kredit: pengar(kort.kredit, kort.valuta) } : null;
    const rubrik = vars ? fyll(t('rubrik'), vars) : '';

    if (!kort || !rubrik) {
      // Bara på orderstatussidan och bara för en order UTAN bekräftelsenummer,
      // alltså förhandsvisningen: en rad som säger vad som saknades. En riktig
      // kund har alltid ett nummer (Shopify: alla ordrar från 2024) och ser
      // aldrig raden.
      const orsak = orsakUtanKort({ plats, order, nummer, sprak, valuta, kort, rubrik, data: DATA });
      return orsak ? <s-text color="subdued">{orsak}</s-text> : null;
    }

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
  } catch (fel) {
    if (plats === 'orderstatus' && !order?.confirmationNumber) {
      return <s-text color="subdued">{`Värva en vän (förhandsvisning): fel ${String(fel?.message ?? fel).slice(0, 160)}`}</s-text>;
    }
    return null;
  }
}
