// juridiskt.mjs — Matstrumpors juridiska meddelande (Shopifys policy LEGAL_NOTICE) på alla språk.
//
// Sajtgranskningen 2026-10-01, S-005: sidan sa "Företagsnamn: Matstrumpor.se" och tomma
// "Momsregistreringsnummer:" och "Organisationsnummer:", på svenska på alla 14 språk (ingen
// översättning fanns). Här står bolaget, org.nr och momsnumret, och varje språk får sin egen text.
//
// Fakta, mätta 2026-10-02:
//   - Momsnumret SE559576240101 är giltigt i EU:s VIES för STONEBITE ECOM AB.
//     ⛔ VIES visar bolagets gamla registrerade adress (Axels privata bostad). Den skrivs ALDRIG här:
//     adressen är kontoret, Stenkolsgatan 1B (CLAUDE.md → "Bolagets adress").
//   - Org.nr 559576-2401 (Bolagsverket), telefonnumret och e-posten stod redan i policyn.
// Vad ett fullständigt Impressum (DE/AT) och 特定商取引法に基づく表記 (JP) ska innehålla därutöver
// (företrädare, pris, frakt, retur …) är Axels beslut, granskningens S-033.
//
//   node matstrumpor/marknader/juridiskt.mjs            # torrt: visar texterna
//   node matstrumpor/marknader/juridiskt.mjs --skarpt   # skriver policyn + 13 översättningar, läser tillbaka

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = dirname(fileURLToPath(import.meta.url));

export const FAKTA = {
  bolag: 'STONEBITE ECOM AB',
  butik: 'Matstrumpor',
  telefon: '+46793404407',
  epost: 'kundsupport@matstrumpor.se',
  gata: 'Stenkolsgatan 1B, 417 07',
  orgnr: '559576-2401',
  moms: 'SE559576240101',
};

// Etiketter och ord per språk. Ordningen är Shopifys mall: namn, telefon, e-post, adress, moms, org.nr.
export const SPRAK = {
  sv: { namn: 'Företagsnamn', tel: 'Telefonnummer', epost: 'E-post', adr: 'Fysisk adress', moms: 'Momsregistreringsnummer', org: 'Organisationsnummer', stad: 'Göteborg', land: 'Sverige', reg: 'Bolagsverket' },
  en: { namn: 'Company name', tel: 'Phone number', epost: 'Email', adr: 'Physical address', moms: 'VAT registration number', org: 'Company registration number', stad: 'Gothenburg', land: 'Sweden', reg: 'Bolagsverket, Sweden' },
  nb: { namn: 'Firmanavn', tel: 'Telefonnummer', epost: 'E-post', adr: 'Fysisk adresse', moms: 'MVA-nummer', org: 'Organisasjonsnummer', stad: 'Göteborg', land: 'Sverige', reg: 'Bolagsverket, Sverige' },
  da: { namn: 'Virksomhedsnavn', tel: 'Telefonnummer', epost: 'E-mail', adr: 'Fysisk adresse', moms: 'Momsnummer', org: 'Registreringsnummer', stad: 'Göteborg', land: 'Sverige', reg: 'Bolagsverket, Sverige' },
  fi: { namn: 'Yrityksen nimi', tel: 'Puhelinnumero', epost: 'Sähköposti', adr: 'Käyntiosoite', moms: 'ALV-numero', org: 'Yritystunnus', stad: 'Göteborg', land: 'Ruotsi', reg: 'Bolagsverket, Ruotsi' },
  de: { namn: 'Firmenname', tel: 'Telefon', epost: 'E-Mail', adr: 'Anschrift', moms: 'Umsatzsteuer-Identifikationsnummer', org: 'Registernummer', stad: 'Göteborg', land: 'Schweden', reg: 'Bolagsverket, Schweden' },
  fr: { namn: 'Raison sociale', tel: 'Téléphone', epost: 'E-mail', adr: 'Adresse', moms: 'Numéro de TVA intracommunautaire', org: 'Numéro d’immatriculation', stad: 'Göteborg', land: 'Suède', reg: 'Bolagsverket, Suède', kolon: '\u00a0: ' },
  nl: { namn: 'Bedrijfsnaam', tel: 'Telefoonnummer', epost: 'E-mail', adr: 'Vestigingsadres', moms: 'Btw-identificatienummer', org: 'Registratienummer', stad: 'Göteborg', land: 'Zweden', reg: 'Bolagsverket, Zweden' },
  es: { namn: 'Razón social', tel: 'Teléfono', epost: 'Correo electrónico', adr: 'Dirección', moms: 'Número de IVA intracomunitario', org: 'Número de registro', stad: 'Göteborg', land: 'Suecia', reg: 'Bolagsverket, Suecia' },
  it: { namn: 'Ragione sociale', tel: 'Telefono', epost: 'E-mail', adr: 'Indirizzo', moms: 'Numero di identificazione IVA', org: 'Numero di registrazione', stad: 'Göteborg', land: 'Svezia', reg: 'Bolagsverket, Svezia' },
  pl: { namn: 'Nazwa firmy', tel: 'Telefon', epost: 'E-mail', adr: 'Adres', moms: 'Numer VAT UE', org: 'Numer rejestrowy', stad: 'Göteborg', land: 'Szwecja', reg: 'Bolagsverket, Szwecja' },
  'pt-PT': { namn: 'Denominação social', tel: 'Telefone', epost: 'E-mail', adr: 'Morada', moms: 'Número de IVA intracomunitário', org: 'Número de registo', stad: 'Göteborg', land: 'Suécia', reg: 'Bolagsverket, Suécia' },
  ja: { namn: '販売業者', tel: '電話番号', epost: 'メールアドレス', adr: '所在地', moms: 'VAT番号', org: '法人登録番号', stad: 'Göteborg', land: 'スウェーデン', reg: 'スウェーデン会社登記局 Bolagsverket', kolon: '：', parentes: ['（', '）'] },
  'zh-TW': { namn: '公司名稱', tel: '電話', epost: '電子郵件', adr: '地址', moms: '增值稅號', org: '公司登記號碼', stad: 'Göteborg', land: '瑞典', reg: '瑞典公司註冊局 Bolagsverket', kolon: '：', parentes: ['（', '）'] },
};

/** Policyns HTML på ett språk. */
export function text(locale) {
  const s = SPRAK[locale];
  if (!s) throw new Error(`juridiskt: inget språk ${locale}`);
  const k = s.kolon ?? ': ';
  const [pv, ph] = s.parentes ?? [' (', ')'];
  const rader = [
    [s.namn, `${FAKTA.bolag}${pv}${FAKTA.butik}${ph}`],
    [s.tel, FAKTA.telefon],
    [s.epost, FAKTA.epost],
    [s.adr, `${FAKTA.gata} ${s.stad}, ${s.land}`],
    [s.moms, FAKTA.moms],
    [s.org, `${FAKTA.orgnr}${pv}${s.reg}${ph}`],
  ];
  return rader.map(([e, v]) => `<p>${e}${k}${v}</p>`).join(' ');
}

async function huvud() {
  const skarpt = process.argv.includes('--skarpt');
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const KONFIG = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
  const k = await skapaKlient(lasButik(KONFIG.butik));
  const lasPolicy = async () => (await k.graphql(`{ shop { shopPolicies { id type body } } }`)).shop.shopPolicies.find((p) => p.type === 'LEGAL_NOTICE');
  const pol = await lasPolicy();
  const sv = text('sv');
  console.log(`Nu:  ${pol.body}\nNy:  ${sv}`);
  for (const l of Object.keys(SPRAK).filter((x) => x !== 'sv')) console.log(`${l.padEnd(5)} ${text(l)}`);
  if (!skarpt) { console.log('\ntorrt — --skarpt skriver'); return; }
  if (/sjöhed|harestad/i.test(Object.keys(SPRAK).map(text).join(' '))) throw new Error('den gamla adressen får aldrig stå i en policy');

  if (pol.body.trim() !== sv) {
    const r = await k.graphql(`mutation($p: ShopPolicyInput!) { shopPolicyUpdate(shopPolicy: $p) { shopPolicy { id body } userErrors { field message } } }`, { p: { type: 'LEGAL_NOTICE', body: sv } });
    if (r.shopPolicyUpdate.userErrors.length) throw new Error(JSON.stringify(r.shopPolicyUpdate.userErrors));
  }
  const efter = await lasPolicy();
  if (efter.body.trim() !== sv) throw new Error('policyn läste tillbaka fel');
  console.log('✅ policyn (svenska) skriven och tillbakaläst');

  const res = await k.graphql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key value digest } } }`, { id: efter.id });
  const kropp = res.translatableResource.translatableContent.find((c) => c.key === 'body');
  for (const locale of Object.keys(SPRAK).filter((x) => x !== 'sv')) {
    let fel = null;
    for (let forsok = 1; forsok <= 2; forsok++) {
      const r = await k.graphql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { field message } } }`,
        { id: efter.id, t: [{ locale, key: 'body', value: text(locale), translatableContentDigest: kropp.digest }] }).catch((e) => ({ fel: e.message }));
      fel = r.fel || (r.translationsRegister.userErrors.length ? JSON.stringify(r.translationsRegister.userErrors) : null);
      if (!fel) break;
    }
    if (fel) throw new Error(`${locale}: ${fel}`);
    const las = await k.graphql(`query($id: ID!, $l: String!) { translatableResource(resourceId: $id) { translations(locale: $l) { key value outdated } } }`, { id: efter.id, l: locale });
    const t = las.translatableResource.translations.find((x) => x.key === 'body');
    const ok = t && t.value === text(locale) && !t.outdated;
    console.log(`${ok ? '✅' : '❌'} ${locale}`);
    if (!ok) process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
