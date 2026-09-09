// Brand-steget: varje butik brandas från noll ur sin egen brand-config.
//
// OPS Factory återanvänder temats STRUKTUR mellan butiker — aldrig dess
// visuella identitet (Axels beslut 2026-09-05). Brand-configen bor i
// butikskonfigen (`branding:`) och skrivs när butiken skapas, utifrån
// vem som köper, vilket problem de löser, vilken emotion som driver köpet
// och vilken sorts brand målgruppen förväntar sig att lita på.
//
// Härifrån genereras ALLA visuella tokens:
//   byggBrandCss()       → assets/opf-brand.css — överstyr konverteringslagrets
//                          ms-tokens och bastemats hårdkodade knappfärg.
//                          Laddas SIST i ms-head, efter ms-tema.css.
//   byggSettingsPatch()  → settings_data.json: färgscheman, typsnitt, radier.
//   brandRader()         → dry-run-utskriften.
//
// Utan branding i butiksfilen används NEUTRAL — grå och avsiktligt tråkig,
// så en obrandad butik syns direkt i stället för att ärva förra butikens look.

const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const tal = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// Neutral, medvetet karaktärslös. Ingen butik ska vilja launcha med den.
export const NEUTRAL = {
  farger: {
    bakgrund: '#FFFFFF',
    yta: '#F5F5F5',
    yta_djup: '#EBEBEB',
    mork: '#2A2A2A',
    text: '#1A1A1A',
    text_pa_mork: '#F5F5F5',
    linje: '#DDDDDD',
    linje_stark: '#BBBBBB',
    accent: '#3A3A3A',
    accent_text: '#FFFFFF',
    god: '#3A3A3A',
    varning: '#8A5A00',
  },
  typografi: { rubriker: 'assistant_n4', brodtext: 'assistant_n4' },
  form: { knapp_radius: 4, kort_radius: 4, input_radius: 4, badge_radius: 4 },
};

export function hamtaTokens(branding) {
  const b = branding ?? {};
  return {
    farger: { ...NEUTRAL.farger, ...Object.fromEntries(
      Object.entries(b.farger ?? {}).filter(([, v]) => text(v))
    ) },
    typografi: { ...NEUTRAL.typografi, ...Object.fromEntries(
      Object.entries(b.typografi ?? {}).filter(([, v]) => text(v))
    ) },
    form: { ...NEUTRAL.form, ...Object.fromEntries(
      Object.entries(b.form ?? {}).filter(([, v]) => tal(v) !== null)
    ) },
    stil: b.stil ?? {},
    positionering: text(b.positionering),
    tonalitet: text(b.tonalitet),
    kansla: text(b.kansla),
  };
}

export function valideraBranding(branding) {
  const varningar = [];
  if (!branding) {
    varningar.push('branding saknas i butikskonfigen — neutrala (trista) tokens används');
    return varningar;
  }
  for (const falt of ['positionering', 'tonalitet', 'kansla']) {
    if (!text(branding[falt])) varningar.push(`branding.${falt} saknas`);
  }
  for (const falt of ['accent', 'mork', 'text']) {
    const v = branding.farger?.[falt];
    if (!text(v)) varningar.push(`branding.farger.${falt} saknas`);
    else if (!/^#[0-9a-fA-F]{6}$/.test(v.trim())) varningar.push(`branding.farger.${falt} är ingen hex-färg`);
  }
  for (const falt of ['logo', 'favicon', 'bilder', 'ikoner', 'cta', 'trust', 'rubrikstil']) {
    if (!text(branding.stil?.[falt])) varningar.push(`branding.stil.${falt} saknas`);
  }
  return varningar;
}

// "#1A2B3C" → "26, 43, 60" (Dawns knappar räknar i rgb-tripletter).
export function hexTillRgb(hex) {
  const h = String(hex).replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ');
}

// Recensionsstjärnornas färg — samma i VARJE butik, oavsett brand-config
// (Axels beslut 2026-09-07). Sätts i JUDGE.ME-APPENS inställningar
// (Settings → Review Widget → star color), ALDRIG som CSS i temat —
// Axels uttryckliga besked samma kväll. Judge.mes settings-API är läs-bara
// (GET /api/v1/settings funkar med privata token, PUT/POST/PATCH ger 404,
// verifierat 2026-09-07), så fältet är ett klick i checklistan per butik.
// Konstanten finns så checklistan och dokumentationen säger samma hex.
export const STJARNFARG = '#00B77F';

export function byggBrandCss(branding) {
  const t = hamtaTokens(branding);
  const f = t.farger;
  const form = t.form;
  return `/* opf-brand.css — genererad ur butikens brand-config (factory/branding.mjs).
   Laddas SIST i ms-head så den överstyr både konverteringslagret (ms-cro)
   och bastema-anpassningen (ms-tema). Redigeras aldrig för hand. */

.ms,
.ms-scope {
  --ms-accent: ${f.accent};
  --ms-accent-ink: ${f.accent_text};
  --ms-ink: ${f.text};
  --ms-ink-soft: color-mix(in srgb, ${f.text} 66%, ${f.bakgrund});
  --ms-ink-faint: color-mix(in srgb, ${f.text} 44%, ${f.bakgrund});
  --ms-surface: ${f.bakgrund};
  --ms-surface-2: ${f.yta};
  --ms-surface-3: ${f.yta_djup};
  --ms-line: ${f.linje};
  --ms-line-strong: ${f.linje_stark};
  --ms-good: ${f.god};
  --ms-warn: ${f.varning};
  --ms-radius: ${form.kort_radius}px;
  --ms-radius-sm: ${form.badge_radius}px;
  --ms-ring: 0 0 0 3px color-mix(in srgb, ${f.accent} 32%, transparent);
}

/* Bastemats köpknapp — ms-tema.css hårdkodar förra butikens accent. */
.product-form__submit.button,
.product-form__submit.button--secondary {
  --color-button: ${hexTillRgb(f.accent)};
  --color-button-text: ${hexTillRgb(f.accent_text)};
}

/* Judge.me lämnas HELT orörd (Axels beslut 2026-09-07): appens egen widget
   som den är. Färger, font och stjärnor ställs i Judge.mes inställningar,
   aldrig med CSS härifrån. Stjärnfärgen som ska in där: ${STJARNFARG}. */
`;
}

// Färgschemana och formen i settings_data.json. Mappningen är fast:
//   scheme-1 vit bas · scheme-2 ljus yta · scheme-3 mörk (annonsrad, rea-badge)
//   scheme-4 mörkast (slutsåld-badge) · scheme-5 djup yta · scheme-6 sidfot (mörk)
export function byggSettingsPatch(branding) {
  const t = hamtaTokens(branding);
  const f = t.farger;
  const form = t.form;
  const schema = (background, textFarg, button, buttonLabel, sekundar) => ({
    settings: {
      background,
      background_gradient: '',
      text: textFarg,
      button,
      button_label: buttonLabel,
      secondary_button_label: sekundar,
      shadow: textFarg,
    },
  });
  return {
    // Varukorgen ska ALLTID vara lådan, aldrig sidan eller notisen.
    // Axels bakläxa 2026-09-09 (HeimGuard + TankGuard, båda live och
    // spenderande): första "lägg i varukorgen" skickade kunden till /cart.
    // Orsaken sitter i product-form.js rad 11 och 64 — hittar den varken
    // <cart-notification> eller <cart-drawer> i DOM:en faller formuläret
    // tillbaka på en vanlig POST med redirect. Layouten renderar lådan bara
    // när settings.cart_type == 'drawer', så värdet måste sättas explicit
    // här i stället för att ärvas från vilket tema klonen råkade utgå från.
    cart_type: 'drawer',
    type_header_font: t.typografi.rubriker,
    type_body_font: t.typografi.brodtext,
    buttons_radius: form.knapp_radius,
    inputs_radius: form.input_radius,
    card_corner_radius: form.kort_radius,
    collection_card_corner_radius: form.kort_radius,
    blog_card_corner_radius: form.kort_radius,
    text_boxes_radius: form.kort_radius,
    media_radius: form.kort_radius,
    popup_corner_radius: form.kort_radius,
    drawer_border_thickness: 1,
    variant_pills_radius: form.knapp_radius,
    badge_corner_radius: form.badge_radius,
    color_schemes: {
      'scheme-1': schema(f.bakgrund, f.text, f.accent, f.accent_text, f.accent),
      'scheme-2': schema(f.yta, f.text, f.accent, f.accent_text, f.accent),
      'scheme-3': schema(f.mork, f.text_pa_mork, f.accent, f.accent_text, f.text_pa_mork),
      'scheme-4': schema(f.text, f.text_pa_mork, f.accent, f.accent_text, f.text_pa_mork),
      'scheme-5': schema(f.yta_djup, f.text, f.mork, f.text_pa_mork, f.text),
      'scheme-6': schema(f.mork, f.text_pa_mork, f.accent, f.accent_text, f.text_pa_mork),
    },
  };
}

// Ser till att ms-head laddar brand-CSS:en sist. Idempotent.
export function laggInBrandCss(msHead) {
  const rad = "{{ 'opf-brand.css' | asset_url | stylesheet_tag }}";
  if (String(msHead).includes('opf-brand.css')) return String(msHead);
  const ankare = "{{ 'ms-tema.css' | asset_url | stylesheet_tag }}";
  if (String(msHead).includes(ankare)) {
    return String(msHead).replace(ankare, `${ankare}\n${rad}`);
  }
  return `${msHead}\n${rad}\n`;
}

export function brandRader(branding) {
  const t = hamtaTokens(branding);
  return [
    `positionering: ${t.positionering ?? '(saknas — neutral)'}`,
    `tonalitet: ${t.tonalitet ?? '(saknas)'}`,
    `känsla: ${t.kansla ?? '(saknas)'}`,
    `accent ${t.farger.accent} · mörk ${t.farger.mork} · yta ${t.farger.yta}`,
    `typsnitt: ${t.typografi.rubriker} / ${t.typografi.brodtext}`,
    `radier: knapp ${t.form.knapp_radius}px, kort ${t.form.kort_radius}px`,
    ...(t.stil.logo ? [`logo: ${t.stil.logo}`] : []),
    ...(t.stil.favicon ? [`favicon: ${t.stil.favicon}`] : []),
  ];
}
