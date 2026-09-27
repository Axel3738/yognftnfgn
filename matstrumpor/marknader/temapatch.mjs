// temapatch.mjs — locale-grenar runt den hårdkodade svenska kundtexten i
// temats egna ms-*.liquid. Ren logik, testad utan nät (test/temapatch.test.mjs).
//
// Varför: translationsRegister når JSON-inställningar och locale-filer, aldrig
// text som står rakt i Liquid. "Låda", "gratis", "Verifierat köp" och
// trust-radens "Fri frakt i Sverige" hade annars stått på svenska på /nb, /da,
// /fi och /en (mätt 2026-09-27 med en skanning av alla 156 liquid-filer).
//
// Formen: `{% case request.locale.iso_code %}{% when 'nb' %}…{% else %}<svenskan>{% endcase %}`
// på EN rad (ingen whitespace-styrning, så inget ord klistras ihop), svenskan
// alltid i else-grenen. Saknas ett språk i översättningen faller det språket på
// svenskan — aldrig en tom sträng, aldrig ett påhittat ord.
//
// Undantag: ms-sista-dag visar sina datumlöften BARA på svenska (löftet är
// mätt för Sverige), och ms-trust-row får sin fallback-lista per språk.

const LOCALES = ['nb', 'da', 'fi', 'en'];

/** `oversattningar` = { nb: {nyckel: text}, da: …, fi: …, en: … } där nyckeln är `liquid.<fil>.<n>`. */
export function grenFor(sv, nyckel, oversattningar, { citat = false } = {}) {
  const esc = (s) => (citat ? String(s).replace(/'/g, "\\'") : String(s));
  const delar = [];
  for (const l of LOCALES) {
    const t = oversattningar?.[l]?.[nyckel];
    if (typeof t !== 'string' || !t.trim() || t === sv) continue;
    delar.push(`{% when '${l}' %}${esc(t)}`);
  }
  if (delar.length === 0) return null; // inget att byta — svenskan står kvar
  return `{% case request.locale.iso_code %}${delar.join('')}{% else %}${esc(sv)}{% endcase %}`;
}

// Byter EXAKT `sok` mot `ersatt` i texten före `{% schema %}` (schemat är
// adminens etiketter och får aldrig Liquid). Kräver att antalet träffar är
// exakt `antal` — annars kastar den: en patch som träffar fel antal gånger är
// fel patch, inte en nästan rätt.
export function bytExakt(kod, sok, ersatt, antal) {
  const schemaIx = kod.indexOf('{% schema %}');
  const kropp = schemaIx === -1 ? kod : kod.slice(0, schemaIx);
  const schema = schemaIx === -1 ? '' : kod.slice(schemaIx);
  const traffar = kropp.split(sok).length - 1;
  if (traffar !== antal) throw new Error(`"${sok.slice(0, 40)}" hittades ${traffar} gånger, väntade ${antal}`);
  return kropp.split(sok).join(ersatt) + schema;
}

const liquidNyckel = (fil, n) => `liquid.${fil.replace(/^.*\//, '').replace(/\.(liquid|json)$/, '')}.${n}`;

/**
 * Patchar EN fil. `kod` är filens innehåll, `ov` översättningarna per locale.
 * Returnerar { kod, byten: [namn…], hoppade: [namn…] }. Idempotent: en fil som
 * redan bär `request.locale.iso_code` för nyckeln rörs inte igen.
 */
export function patchaFil(fil, kod, ov) {
  const byten = [];
  const hoppade = [];
  const N = (n) => liquidNyckel(fil, n);
  const redan = (mark) => kod.includes(mark);
  const gren = (n, sv, opts) => grenFor(sv, N(n), ov, opts);
  const byt = (namn, sok, ersatt, antal) => {
    if (!ersatt) { hoppade.push(`${namn}: ingen översättning`); return; }
    if (redan(ersatt)) { hoppade.push(`${namn}: redan patchad`); return; }
    kod = bytExakt(kod, sok, ersatt, antal);
    byten.push(namn);
  };

  switch (fil) {
    case 'snippets/ms-paket.liquid': {
      byt('valj_paket', 'aria-label="Välj paket"', `aria-label="${gren('valj_paket', 'Välj paket')}"`, 1);
      byt('lada', '<span class="ms-paket__lada-etikett">Låda {{ n }}', `<span class="ms-paket__lada-etikett">${gren('lada', 'Låda')} {{ n }}`, 1);
      byt('gratis', '{% if n > betalda %} · gratis{% endif %}', `{% if n > betalda %} · ${gren('gratis', 'gratis')}{% endif %}`, 1);
      byt('gratis_per_sushilada', "{% render 'ms-icon', name: 'gift' %} Gratis per sushilåda", `{% render 'ms-icon', name: 'gift' %} ${gren('gratis_per_sushilada', 'Gratis per sushilåda')}`, 1);
      byt('atpinnar_i_tra', '<span>Ätpinnar i trä · <span data-ms-paket-gava-antal>', `<span>${gren('atpinnar_i_tra', 'Ätpinnar i trä')} · <span data-ms-paket-gava-antal>`, 1);
      byt('par', '{{ gantal }}</span> par</span>', `{{ gantal }}</span> ${gren('par', 'par')}</span>`, 1);
      byt('varde', 'class="ms-paket__gava-varde">värde ', `class="ms-paket__gava-varde">${gren('varde', 'värde')} `, 2);
      byt('gratis_pa_kopet', "{% render 'ms-icon', name: 'gift' %} Gratis på köpet", `{% render 'ms-icon', name: 'gift' %} ${gren('gratis_pa_kopet', 'Gratis på köpet')}`, 1);
      break;
    }
    case 'snippets/ms-sista-dag.liquid': {
      // Löftet är mätt för Sverige. Alla andra språk: ingen rad alls.
      const sok = "{%- if rad != '' -%}";
      const ersatt = "{%- if rad != '' and request.locale.iso_code == 'sv' -%}";
      if (redan(ersatt)) hoppade.push('sista_dag: redan patchad');
      else { kod = bytExakt(kod, sok, ersatt, 1); byten.push('sista_dag_bara_sv'); }
      break;
    }
    case 'snippets/ms-trust-row.liquid': {
      const sok = "  assign fallback = 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning'\n";
      const rader = [];
      for (const l of LOCALES) {
        const a = ov?.[l]?.[N('fri_frakt')], b = ov?.[l]?.[N('oppet_kop')], c = ov?.[l]?.[N('trygg_betalning')];
        if (!a || !b || !c) continue;
        rader.push(`    when '${l}'\n      assign fallback = '${[`truck:${a}`, `refresh:${b}`, `lock:${c}`].join('|').replace(/'/g, "\\'")}'`);
      }
      if (rader.length === 0) { hoppade.push('trust_row: ingen översättning'); break; }
      const block = `${sok}  case request.locale.iso_code\n${rader.join('\n')}\n  endcase\n`;
      if (redan('  case request.locale.iso_code\n    when')) hoppade.push('trust_row: redan patchad');
      else { kod = bytExakt(kod, sok, block, 1); byten.push('trust_row_fallback'); }
      break;
    }
    case 'snippets/ms-bundle-picker.liquid': {
      // Liquid-tilldelningar: grenen skrivs som case-block runt tilldelningen.
      const tilldela = (namn, variabel, sok, sv) => {
        const rader = LOCALES.map((l) => [l, ov?.[l]?.[N(namn)]]).filter(([, t]) => t && t !== sv);
        if (rader.length === 0) { hoppade.push(`${namn}: ingen översättning`); return; }
        const block = `${sok}\n  case request.locale.iso_code\n${rader.map(([l, t]) => `    when '${l}'\n      assign ${variabel} = ${variabel} | replace: '${sv}', '${String(t).replace(/'/g, "\\'")}'`).join('\n')}\n  endcase`;
        if (redan(block)) { hoppade.push(`${namn}: redan patchad`); return; }
        kod = bytExakt(kod, sok, block, 1);
        byten.push(namn);
      };
      tilldela('popularast', 'flag_text', "  assign flag_text = popular_text | default: 'Populärast'", 'Populärast');
      tilldela('st', 'unit', "  assign unit = unit_word | default: 'st'", 'st');
      {
        // aria-label står i en {{ }}-utmatning, och Liquid tillåter inga {% %}-taggar inuti en
        // sådan — Shopify avvisade hela themeFilesUpsert 2026-09-27 ("Variable … was not
        // properly terminated"). Därför en variabel som tilldelas på raden före elementet.
        const sok = "aria-label=\"{{ heading | default: 'Välj paket' | escape }}\"";
        const ny = 'aria-label="{{ heading | default: valj_paket | escape }}"';
        const rader = LOCALES.map((l) => [l, ov?.[l]?.[N('valj_paket')]]).filter(([, t]) => t && t !== 'Välj paket');
        if (redan(ny)) hoppade.push('valj_paket: redan patchad');
        else if (rader.length === 0) hoppade.push('valj_paket: ingen översättning');
        else {
          const block = `{%- assign valj_paket = 'Välj paket' -%}{%- case request.locale.iso_code -%}${rader.map(([l, t]) => `{%- when '${l}' -%}{%- assign valj_paket = '${String(t).replace(/'/g, "\\'")}' -%}`).join('')}{%- endcase -%}\n`;
          kod = bytExakt(kod, sok, ny, 1);
          const radstart = kod.lastIndexOf('\n', kod.indexOf(ny)) + 1;
          kod = kod.slice(0, radstart) + block + kod.slice(radstart);
          byten.push('valj_paket');
        }
      }
      byt('spara', '<span class="ms-bundle__flag">Spara {{ saving }}%</span>', `<span class="ms-bundle__flag">${gren('spara', 'Spara')} {{ saving }}%</span>`, 1);
      break;
    }
    case 'sections/ms-compare.liquid': {
      byt('egenskap', '<span class="ms-sr">Egenskap</span>', `<span class="ms-sr">${gren('egenskap', 'Egenskap')}</span>`, 1);
      byt('ja', '<span class="ms-sr">Ja</span>', `<span class="ms-sr">${gren('ja', 'Ja')}</span>`, 2);
      byt('nej', '<span class="ms-sr">Nej</span>', `<span class="ms-sr">${gren('nej', 'Nej')}</span>`, 2);
      break;
    }
    case 'sections/ms-reviews.liquid':
    case 'sections/ms-review-slider.liquid': {
      // Indraget mellan ikonen och texten skiljer mellan de två filerna (mätt 2026-09-27:
      // ms-reviews 16 blanksteg, ms-review-slider annat) — matcha valfritt blanksteg och
      // behåll det. Schemats "Märk som verifierat köp" träffas inte: ingen ikon före.
      const g = gren('verifierat_kop', 'Verifierat köp');
      if (!g) { hoppade.push('verifierat_kop: ingen översättning'); break; }
      if (redan(g)) { hoppade.push('verifierat_kop: redan patchad'); break; }
      const re = /(\{% render 'ms-icon', name: 'check-circle' %\})(\s+)Verifierat köp/;
      if (!re.test(kod)) throw new Error(`${fil}: "Verifierat köp" efter check-circle-ikonen hittades inte`);
      kod = kod.replace(re, (_, ikon, blank) => `${ikon}${blank}${g}`);
      byten.push('verifierat_kop');
      break;
    }
    case 'snippets/ms-delivery-estimate.liquid': {
      // "Beräknad leverans" kommer som parameter ur product.json (patchaMallJson) — här är
      // bara reservvärdet och ordet "arbetsdagar" i intervallet.
      byt('arbetsdagar', '{{ mn }}–{{ mx }} arbetsdagar</span>', `{{ mn }}–{{ mx }} ${gren('arbetsdagar', 'arbetsdagar')}</span>`, 1);
      break;
    }
    case 'assets/ms-cro.js':
      return patchaJs(kod);
    default:
      throw new Error(`temapatch känner inte filen ${fil}`);
  }
  return { kod, byten, hoppade };
}

// ---- Temats JavaScript: pris och datum i kundens språk och valuta ---------------
//
// ms-cro.js räknade om paketpriset med butikens money_format ("{{amount}} kr") och
// svensk sifferformatering, och skrev leveransdatumet med Intl 'sv-SE'. På /en
// hade en amerikan sett "59 kr" när hon bytte variant och "onsdag 7 oktober" som
// datum. Patchen: språket ur <html lang>, och i en annan valuta än butikens
// formateras beloppet med Intl.NumberFormat i den aktiva valutan
// (Shopify.currency.active är storefrontens eget globala objekt).
const JS_SOK_SPRAK = "  var TZ = 'Europe/Stockholm';\n";
const JS_NY_SPRAK = "  var TZ = 'Europe/Stockholm';\n  // Kundens språk ur <html lang> (sv, nb, da, fi, en) — Intl vill ha en riktig tagg.\n  var LANG = (document.documentElement.lang || 'sv-SE').replace(/^sv$/, 'sv-SE').replace(/^nb$/, 'nb-NO').replace(/^da$/, 'da-DK').replace(/^fi$/, 'fi-FI').replace(/^en$/, 'en-US');\n";
const JS_SOK_MONEY = "    var text = kr.toLocaleString('sv-SE', {\n      minimumFractionDigits: visaOren ? 2 : 0,\n      maximumFractionDigits: visaOren ? 2 : 0\n    });\n    return f.replace(/\\{\\{\\s*amount[a-z_]*\\s*\\}\\}/gi, text);";
const JS_NY_MONEY = "    // Annan valuta än butikens (marknaderna): formatera i kundens valuta och språk —\n    // butikens format säger \"kr\" och hade skrivit \"59 kr\" om 59 dollar.\n    var aktiv = (window.Shopify && Shopify.currency && Shopify.currency.active) || null;\n    var butikens = (window.Shopify && Shopify.shop && Shopify.shop.currency) || 'SEK';\n    if (aktiv && aktiv !== 'SEK' && aktiv !== butikens) {\n      try {\n        return new Intl.NumberFormat(LANG, { style: 'currency', currency: aktiv, minimumFractionDigits: visaOren ? 2 : 0, maximumFractionDigits: 2 }).format(kr);\n      } catch (e) { /* okänd valuta: fall tillbaka på butikens format */ }\n    }\n    var text = kr.toLocaleString(LANG, {\n      minimumFractionDigits: visaOren ? 2 : 0,\n      maximumFractionDigits: visaOren ? 2 : 0\n    });\n    return f.replace(/\\{\\{\\s*amount[a-z_]*\\s*\\}\\}/gi, text);";
const JS_SOK_DATUM = "    return new Intl.DateTimeFormat('sv-SE', withWeekday";
const JS_NY_DATUM = "    return new Intl.DateTimeFormat(LANG, withWeekday";

export function patchaJs(kod) {
  const byten = [];
  const hoppade = [];
  if (kod.includes('var LANG = ')) hoppade.push('sprak: redan patchad');
  else { kod = bytExakt(kod, JS_SOK_SPRAK, JS_NY_SPRAK, 1); byten.push('sprak'); }
  if (kod.includes('Intl.NumberFormat(LANG')) hoppade.push('money: redan patchad');
  else { kod = bytExakt(kod, JS_SOK_MONEY, JS_NY_MONEY, 1); byten.push('money'); }
  if (kod.includes('Intl.DateTimeFormat(LANG')) hoppade.push('datum: redan patchad');
  else { kod = bytExakt(kod, JS_SOK_DATUM, JS_NY_DATUM, 1); byten.push('datum'); }
  return { kod, byten, hoppade };
}

// ---- JSON-mallarnas custom_liquid-block ---------------------------------------
//
// product.json och index.json bär custom_liquid-block med svensk text som
// translationsRegister inte når (custom_liquid är inte translatable —
// mätt 2026-09-27: product.json hade 16 översättningsbara fält, inget av dem
// blocken ms_trust/ms_delivery/ms_storlek). Grenen skrivs in i själva
// Liquid-strängen i JSON-filen, svenskan i else. Shopifys tema-JSON får bära
// en /* … */-kommentar överst; den bevaras.

const MALLBYTEN = {
  'templates/product.json': [
    { namn: 'ms_trust', sok: "items: 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning'", typ: 'trust' },
    { namn: 'ms_delivery_text', sok: "text: 'Beräknad leverans'", nyckel: 'liquid.ms-delivery-estimate.beraknad_leverans', sv: 'Beräknad leverans', form: 'param' },
    { namn: 'ms_storlek', sok: '<p class="ms-storlek">Passar strl 36–44 · stretchigt material</p>', nyckel: 'liquid.product.ms_storlek', sv: 'Passar strl 36–44 · stretchigt material', form: 'html' },
  ],
  'templates/index.json': [
    { namn: 'ugc_markning', sok: 'Miljöbilderna är AI-genererade illustrationer.', nyckel: 'liquid.index.ugc_markning', sv: 'Miljöbilderna är AI-genererade illustrationer.', form: 'html' },
  ],
};

/** Patchar en JSON-mall (som text — JSON.parse/stringify hade tappat kommentaren och ordningen). */
export function patchaMallJson(fil, kod, ov, liquidTexter = {}) {
  const spec = MALLBYTEN[fil];
  if (!spec) throw new Error(`temapatch känner inte mallen ${fil}`);
  const byten = [];
  const hoppade = [];
  // JSON-strängen: citattecken och backslash måste escapas som JSON gör.
  const json = (s) => JSON.stringify(s).slice(1, -1);
  for (const b of spec) {
    let ersatt = null;
    if (b.typ === 'trust') {
      const rader = [];
      for (const l of LOCALES) {
        const a = ov?.[l]?.['liquid.ms-trust-row.fri_frakt'], c = ov?.[l]?.['liquid.ms-trust-row.oppet_kop'], d = ov?.[l]?.['liquid.ms-trust-row.trygg_betalning'];
        if (!a || !c || !d) continue;
        rader.push(`{% when '${l}' %}${[`truck:${a}`, `refresh:${c}`, `lock:${d}`].join('|')}`);
      }
      if (rader.length === 0) { hoppade.push(`${b.namn}: ingen översättning`); continue; }
      // items-parametern måste vara ett Liquid-uttryck — en case-sats går inte i ett render-argument.
      // Därför: tilldela variabeln före render och skicka variabeln.
      const tilldelning = `{% case request.locale.iso_code %}${rador(rader)}{% else %}truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning{% endcase %}`;
      const ny = `{% capture ms_trust_items %}${tilldelning}{% endcapture %}{% render 'ms-trust-row', items: ms_trust_items %}`;
      const gammal = "{% render 'ms-trust-row', items: 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning' %}";
      const sokJson = json(gammal), nyJson = json(ny);
      if (kod.includes(nyJson)) { hoppade.push(`${b.namn}: redan patchad`); continue; }
      if (!kod.includes(sokJson)) throw new Error(`${fil}: hittar inte trust-blocket att patcha`);
      kod = kod.split(sokJson).join(nyJson);
      byten.push(b.namn);
      continue;
    }
    const gren = grenFor(b.sv, b.nyckel, ov, { citat: b.form === 'param' });
    if (!gren) { hoppade.push(`${b.namn}: ingen översättning`); continue; }
    if (b.form === 'param') {
      // render-argument: capture först, skicka variabeln.
      const gammal = `{% render 'ms-delivery-estimate', min_days: 5, max_days: 10, cutoff_hour: 0, text: 'Beräknad leverans' %}`;
      const ny = `{% capture ms_delivery_text %}${grenFor(b.sv, b.nyckel, ov)}{% endcapture %}{% render 'ms-delivery-estimate', min_days: 5, max_days: 10, cutoff_hour: 0, text: ms_delivery_text %}`;
      const sokJson = json(gammal), nyJson = json(ny);
      if (kod.includes(nyJson)) { hoppade.push(`${b.namn}: redan patchad`); continue; }
      if (!kod.includes(sokJson)) throw new Error(`${fil}: hittar inte leveransblocket att patcha`);
      kod = kod.split(sokJson).join(nyJson);
      byten.push(b.namn);
      continue;
    }
    ersatt = gren;
    const sokJson = json(b.sok), nyJson = json(b.sok.replace(b.sv, ersatt));
    if (kod.includes(nyJson)) { hoppade.push(`${b.namn}: redan patchad`); continue; }
    const n = kod.split(sokJson).length - 1;
    if (n !== 1) throw new Error(`${fil}: "${b.sv.slice(0, 30)}" hittades ${n} gånger, väntade 1`);
    kod = kod.split(sokJson).join(nyJson);
    byten.push(b.namn);
  }
  return { kod, byten, hoppade };
}
const rador = (rader) => rader.join('');

/** Räknar svenska ord som ännu står kvar utanför schema/kommentarer — en grov leak-koll efter patchen. */
export function svenskaKvar(kod) {
  const schemaIx = kod.indexOf('{% schema %}');
  let s = schemaIx === -1 ? kod : kod.slice(0, schemaIx);
  s = s.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '');
  // else-grenarna i våra case-block bär svenskan med flit — räkna inte dem.
  s = s.replace(/\{% else %\}[^{]*\{% endcase %\}/g, '');
  const traffar = [...s.matchAll(/(Fri frakt i Sverige|Verifierat köp|Välj paket|Gratis på köpet|Gratis per sushilåda|Ätpinnar i trä|Populärast|Slutsåld|Trygg betalning|öppet köp)/g)].map((m) => m[1]);
  return traffar;
}
