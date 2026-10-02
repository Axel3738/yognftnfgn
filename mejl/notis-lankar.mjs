// Shopifys EGNA notiser (orderbekräftelse, levererat, annullering, återbetalning,
// presentkort, kundkonto …) länkar loggan och "Besök vår butik" till {{ shop.url }}
// på alla språk. Det här skriptet byter den länken mot språkets egen adress på
// matstrumpor.com i ÖVERSÄTTNINGARNA, och rättar den engelska betalraden
// "(ending in …)" i de japanska mallarna. Noll beroenden.
//
//   node mejl/notis-lankar.mjs matstrumpor                        # torrt: läser, räknar, sparar före/efter
//   node mejl/notis-lankar.mjs matstrumpor --skarpt               # registrerar det som ändras, läser tillbaka
//   node mejl/notis-lankar.mjs matstrumpor --skarpt --bara 126544118099[,…]   # bara de mallarna (prov)
//
// Varför (sajtgranskningen 2026-10-01, matstrumpor/marknader/granskning/SAJT-2026-10-01.md):
// - S-015: {{ shop.url }} är butikens huvuddomän, https://matstrumpor.se (API:t, shop.url).
//   Där får en utlandskund svenska, och en kund i Europa dessutom landet Sverige och SEK
//   (Globalping från IT, PT, AT, BE). Allt utland går via matstrumpor.com (Axels regel
//   2026-09-29), och de tre fraktmejlen gör det sedan 2026-09-30 (bygg-butik.mjs → hemFranSida).
// - S-019: fyra japanska mallar (Shopifys äldre korta: annullering 126543987027, återbetalning
//   126544052563, faktura 126543626579, kvitto 126544511315) har betalraden
//   "<kort> (ending in <siffror>)" på engelska. Den blir "<kort>（末尾 <siffror>）".
//   Kinesiskan får "（末碼 …）" om raden dyker upp där. Talet fyra (4, 四, ４) skrivs aldrig i en
//   japansk eller kinesisk kundtext — testet stoppar det.
// - Samma regel i Shopifys egen text (uppföljningen 2026-10-02): kortraden säger "下4桁" på
//   japanska och "末四碼" på kinesiska, också i orderbekräftelsen. Den blir "末尾" resp. "末碼"
//   (FYRA nedan, bara utanför Liquid). Annan fyra i kundtexten rörs inte, den listas.
//
// Hur:
// - Adressen per språk = mejl_sprak[].sida i sparning/butiker.json utan /pages/<handle>, samma
//   regel som loggan i fraktmejlen: https://matstrumpor.com/de, engelskan i roten
//   (https://matstrumpor.com), zh-TW på /zh-tw, pt-PT på /pt-pt. Ingen ?country= (landet följer
//   kunden). Varje körning jämförs adresserna med Shopifys egna rootUrls (webPresences): en
//   adress som inte är Shopifys för språket, eller som ligger på huvuddomänen, stoppar allt.
// - Bara utskriftstaggen byts: {{ shop.url }} och {{shop.url}} (och {{- shop.url -}}, med
//   blankstegen som Liquid hade tagit bort) blir adressen som ren text; {{ shop.url | filter }}
//   får adressen som citerad sträng. {% if shop.url %} står kvar — villkoret är sant med båda
//   adresserna. All annan användning (assign, jämförelse, inne i {% liquid %}, utanför Liquid)
//   räknas som osäker: den översättningen hoppas och rapporteras, hellre än en gissning.
// - translationsRegister med huvudtextens AKTUELLA digest, läst för varje mall precis före
//   registreringen. En översättning märkt outdated hoppas och rapporteras. Shopifys
//   standardöversättningar (updatedAt null) skrivs över — samma väg som fraktmejlen
//   (notis-oversattning.mjs) och levererad-notiserna (levererad-oversattning.mjs).
// - Svenska huvudmallen skrivs aldrig (går inte via API). De tre fraktmallarna
//   (mejl/butiker/<id>.json → shopify_mallar) ägs av notis-oversattning.mjs och timrutinen;
//   de rörs inte, rapporten säger bara om de bär shop.url.
// - Tillbakaläsning efter registreringen: varje översättning ska vara exakt den önskade
//   texten, inte inaktuell och utan shop.url utanför villkoren (och utan "ending in" på ja/zh-TW).
// - Torrt sparas före/efter för varje översättning som ändras i mejl/output/notis-lankar/
//   (gitignorerad, ~50 MB per körning): <mall>/<locale>.<key>.fore.liquid / .efter.liquid och
//   andringar.txt med varje ändrad rad. Skarpt sparas förekopian INNAN något skrivs — den är
//   reserven om en översättning måste läggas tillbaka — och efterkopian är det Shopify svarade.
//
// ⚠️ En registrerad översättning är vår och står still: Shopify uppdaterar den inte längre
// när de ändrar sin standardmall. Klistras den svenska mallen om i admin märks översättningen
// outdated (den skickas ändå, men med vår gamla text). Skriptet går att köra igen — det gör
// ingenting när allt redan är bytt.
// ⚠️ Krockar inte med levererad-oversattning.mjs: båda byter exakta strängar i Shopifys
// nuvarande text och läser den varje gång, så ordningen spelar ingen roll.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';
import { lasFraga, saknadeSprak } from './notis-oversattning.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const alias = (locale) => `l_${locale.replace(/[^a-z0-9]/gi, '_')}`;
const NYCKLAR = ['title', 'body_html'];

// Språkets egen adress: spårningssidan utan /pages/<handle>.
export function hemAdresser(reg) {
  const rader = reg.mejl_sprak ?? [];
  if (!rader.length) throw new Error(`${reg.id}: sparning/butiker.json bär ingen mejl_sprak — inga språk att rätta.`);
  const slut = `/pages/${reg.handle}`;
  const ut = {};
  for (const r of rader) {
    if (!r.locale || !r.sida) throw new Error(`${reg.id}: en mejl_sprak-rad saknar locale eller sida (${JSON.stringify(r)}).`);
    if (!r.sida.endsWith(slut)) throw new Error(`${reg.id}/${r.locale}: ${r.sida} slutar inte på ${slut} — adressen går inte att härleda.`);
    ut[r.locale] = r.sida.slice(0, -slut.length);
  }
  return ut;
}

const ADRESS = /^https:\/\/([a-z0-9.-]+)(\/[a-z0-9-]+)?$/i;
const utanSnedstreck = (u) => String(u ?? '').replace(/\/+$/, '');

// Adresserna mot Shopifys egna rootUrls. Tom lista = allt stämmer.
export function kontrolleraAdresser(adresser, shopUrl, webPresences = []) {
  const fel = [];
  const primar = ADRESS.exec(utanSnedstreck(shopUrl))?.[1]?.toLowerCase() ?? null;
  const vardar = new Set();
  for (const [locale, url] of Object.entries(adresser)) {
    const m = ADRESS.exec(url);
    if (!m) { fel.push(`${locale}: "${url}" är inte https://<domän>[/<mapp>]`); continue; }
    const host = m[1].toLowerCase();
    vardar.add(host);
    if (primar && host === primar) fel.push(`${locale}: ${url} ligger på huvuddomänen ${primar} — där får utlandet svenska`);
  }
  if (vardar.size > 1) fel.push(`adresserna ligger på flera domäner (${[...vardar].join(', ')})`);
  const host = [...vardar][0];
  const narvaro = webPresences.find((w) => w?.domain?.host?.toLowerCase() === host);
  if (!narvaro) {
    fel.push(`Shopify har ingen webbnärvaro för ${host}`);
    return fel;
  }
  for (const [locale, url] of Object.entries(adresser)) {
    const rot = narvaro.rootUrls?.find((r) => r.locale === locale)?.url;
    if (!rot) fel.push(`${locale}: ${host} bär inte språket i Shopify (rootUrls)`);
    else if (utanSnedstreck(rot) !== url) fel.push(`${locale}: ${url} men Shopifys rootUrl är ${rot}`);
  }
  return fel;
}

// Var shop.url står kvar i en text: villkoren {% if/elsif/unless shop.url %} är ofarliga,
// allt annat (en utskrift, en assign, en jämförelse, text utanför Liquid) är osäkert.
const VILLKOR = /^\{%-?\s*(?:if|elsif|unless)\s+shop\.url\s*-?%\}$/;
const SHOP_URL = /(?<![\w.])shop\.url\b/;
export function sokShopUrl(text) {
  let villkor = 0;
  const osakra = [];
  for (const m of text.matchAll(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g)) {
    if (!SHOP_URL.test(m[0])) continue;
    if (VILLKOR.test(m[0])) villkor++;
    else osakra.push(m[0].replace(/\s+/g, ' ').slice(0, 120));
  }
  const utanTaggar = text.replace(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g, ' ');
  for (const m of utanTaggar.matchAll(new RegExp(`.{0,40}${SHOP_URL.source}.{0,40}`, 'g'))) {
    osakra.push(`(utanför Liquid) ${m[0].replace(/\s+/g, ' ')}`);
  }
  return { villkor, osakra };
}

// Byter utskriftstaggen {{ shop.url }} mot adressen. Liquids whitespace control följer med:
// {{- tar bort blanksteg före taggen, -}} efter, precis som Liquid hade gjort vid utskicket.
const UTSKRIFT = /\{\{(-?)\s*shop\.url\s*(-?)\}\}/g;
const UTSKRIFT_FILTER = /\{\{-?\s*shop\.url\s*\|(?:(?!\}\})[\s\S])*\}\}/g;
export function bytShopUrl(text, url) {
  if (!ADRESS.test(url)) throw new Error(`Ogiltig adress "${url}" — vill ha https://<domän>[/<mapp>].`);
  let ut = '';
  let pos = 0;
  let lankar = 0;
  const re = new RegExp(UTSKRIFT.source, 'g');
  let m;
  while ((m = re.exec(text))) {
    let fore = text.slice(pos, m.index);
    if (m[1]) fore = fore.replace(/\s+$/, '');
    ut += fore + url;
    pos = m.index + m[0].length;
    if (m[2]) pos += /^\s*/.exec(text.slice(pos))[0].length;
    re.lastIndex = pos;
    lankar++;
  }
  ut += text.slice(pos);
  // shop.url är en sträng, så en citerad sträng beter sig likadant genom varje filter.
  let filter = 0;
  ut = ut.replace(UTSKRIFT_FILTER, (tagg) => {
    filter++;
    return tagg.replace('shop.url', `"${url}"`);
  });
  return { text: ut, lankar, filter, ...sokShopUrl(ut) };
}

// "(ending in {{ … }})" → "（末尾 {{ … }}）" på japanska, "（末碼 {{ … }}）" på kinesiska.
// Blanksteget före parentesen försvinner (helbreddsparentes efter kortets namn).
export const SLUTSIFFROR = { ja: '末尾', 'zh-TW': '末碼' };
const ENDING = /[ \t]*\(ending (?:in|with) ([^()]*?\{\{[^()]*?\}\}[^()]*?)\)/g;
export function rattaSlutsiffror(text, locale) {
  const ord = SLUTSIFFROR[locale];
  if (!ord) return { text, antal: 0 };
  let antal = 0;
  const ut = text.replace(ENDING, (_, inre) => {
    antal++;
    return `（${ord} ${inre.trim()}）`;
  });
  return { text: ut, antal };
}

// Talet fyra på kortraden i Shopifys egen text (repots regel: aldrig 4, 四 eller ４ i en japansk
// eller kinesisk kundtext). Japanskan skriver "下4桁" (de fyra sista siffrorna) på fyra sätt,
// kinesiskan "末四碼". Bytena görs bara utanför Liquid-taggarna, i den här ordningen:
//   ギフトカード (下4桁が1234)    → ギフトカード (末尾 1234)
//   Visa (カード番号下4桁: 1234)  → Visa (カード番号末尾: 1234)
//   下4桁1234 (kundrutan, kvitton, prenumerationer) → 末尾 1234
//   (末四碼：1234) / 無法從末四碼為 1234 的卡片 → (末碼：1234) / 無法從末碼為 1234 的卡片
export const FYRA = {
  ja: [['カード番号下4桁:', 'カード番号末尾:'], ['下4桁が', '末尾 '], ['下4桁', '末尾 ']],
  'zh-TW': [['末四碼', '末碼']],
};
const LIQUID_DELAR = /(\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\})/;
export function rattaFyra(text, locale) {
  const byt = FYRA[locale];
  if (!byt) return { text, antal: 0 };
  let antal = 0;
  const ut = text
    .split(LIQUID_DELAR)
    .map((del, i) => {
      if (i % 2) return del; // en Liquid-tagg: rörs aldrig
      let s = del;
      for (const [gammal, ny] of byt) {
        const n = s.split(gammal).length - 1;
        if (n) {
          s = s.split(gammal).join(ny);
          antal += n;
        }
      }
      return s;
    })
    .join('');
  return { text: ut, antal };
}

// Kundtexten: utan stil, kommentarer, Liquid och HTML-taggar (attributen följer med taggen).
function kundtext(text) {
  return text
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, ' ')
    .replace(/\{%[\s\S]*?%\}/g, '\n')
    .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    .replace(/<[^>]+>/g, '\n');
}

// Rader i kundtexten som fortfarande bär talet fyra — bara rapport.
export function fyrorKvar(text) {
  const ut = kundtext(text)
    .split('\n')
    .map((r) => r.replace(/\s+/g, ' ').trim())
    .filter((r) => /[4四４]/.test(r));
  return [...new Set(ut)];
}

// Hela ändringen för en översättning.
export function nyText(text, locale, url) {
  const a = bytShopUrl(text, url);
  const b = rattaSlutsiffror(a.text, locale);
  const c = rattaFyra(b.text, locale);
  return { text: c.text, andrad: c.text !== text, lankar: a.lankar, filter: a.filter, villkor: a.villkor, osakra: a.osakra, slutsiffror: b.antal, fyra: c.antal };
}

// Det som ska vara sant om en översättning efter registreringen.
export function kontrolleraEfter(text, locale) {
  const fel = sokShopUrl(text).osakra.map((x) => `shop.url kvar: ${x}`);
  if (SLUTSIFFROR[locale] && /\(ending (?:in|with) /i.test(text)) fel.push('"(ending in" kvar');
  for (const [gammal] of FYRA[locale] ?? []) if (kundtext(text).includes(gammal)) fel.push(`"${gammal}" kvar`);
  return fel;
}

// Engelska rader kvar i en japansk eller kinesisk mall — bara rapport, inget byts.
const VARUMARKEN = new Set(['Shop', 'Pay', 'Cash', 'WeChat', 'Alipay', 'CNY', 'Matstrumpor', 'kundsupport', 'matstrumpor', 'se', 'com', 'notifications', 'png', 'Visa', 'Mastercard', 'PayPal', 'Klarna', 'Apple', 'Google', 'SKU', 'ID', 'QR', 'PDF', 'URL']);
export function engelskaRader(text) {
  const s = kundtext(text).replace(/&[a-z]+;|&#\d+;/gi, ' ');
  const ut = [];
  for (const rad of s.split('\n')) {
    const ord = (rad.match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !VARUMARKEN.has(w));
    if (ord.length) ut.push(rad.replace(/\s+/g, ' ').trim());
  }
  return [...new Set(ut)];
}

// Registreringarna i lagom stora anrop: en orderbekräftelse är ~230 000 tecken per språk.
export function delaIBatcher(lista, { maxTecken = 300_000, maxAntal = 13 } = {}) {
  const ut = [];
  let nu = [];
  let tecken = 0;
  for (const x of lista) {
    const n = String(x.value ?? '').length;
    if (nu.length && (tecken + n > maxTecken || nu.length >= maxAntal)) {
      ut.push(nu);
      nu = [];
      tecken = 0;
    }
    nu.push(x);
    tecken += n;
  }
  if (nu.length) ut.push(nu);
  return ut;
}

// De ändrade raderna, för ögat (andringar.txt).
export function andradeRader(fore, efter, bredd = 90) {
  const a = fore.split('\n');
  const b = efter.split('\n');
  if (a.length !== b.length) return [`(radantalet ändrades ${a.length} → ${b.length})`];
  const ut = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    let s = 0;
    while (s < a[i].length && a[i][s] === b[i][s]) s++;
    const fran = Math.max(0, s - 30);
    ut.push(`  rad ${i + 1}\n    − ${a[i].slice(fran, fran + bredd).trim()}\n    + ${b[i].slice(fran, fran + bredd + 20).trim()}`);
  }
  return ut;
}

const TILLFALLIGT = /INTERNAL_SERVER_ERROR|THROTTLED|Throttled|Internal error|\b50[234]\b/;
const vanta = (ms) => new Promise((r) => setTimeout(r, ms));
// Shopifys tillfälliga fel får ETT nytt försök (mätt 2026-09-27: translationsRegister svarade
// "Internal error" mitt i en annars felfri körning, matstrumpor/marknader/bygg.mjs).
async function medForsok(fn, { forsok = 2, paus = 5000 } = {}) {
  for (let n = 1; ; n++) {
    try {
      return await fn();
    } catch (e) {
      if (n >= forsok || !TILLFALLIGT.test(e.message)) throw e;
      await vanta(paus * n);
    }
  }
}

const REGISTRERA = 'mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { field message } translations { locale key } } }';

export async function kor(id, { skarpt = false, bara = null, klient = null, logg = console.log, utRot = join(ROT, 'output', 'notis-lankar') } = {}) {
  const reg = lasButik(id);
  const adresser = hemAdresser(reg);
  const locales = Object.keys(adresser);
  const brand = JSON.parse(readFileSync(join(ROT, 'butiker', `${id}.json`), 'utf8'));
  const egna = new Set(Object.values(brand.shopify_mallar ?? {}));
  const k = klient ?? (await skapaKlient(reg));
  const stampel = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const korning = join(utRot, id, `${stampel}-${skarpt ? 'skarpt' : 'torr'}`);
  mkdirSync(korning, { recursive: true });

  // Adresserna mot Shopifys egna rootUrls — och butikens språk mot registret.
  const wp = await medForsok(() => k.graphql('{ shop { url } webPresences(first: 25) { nodes { domain { host } rootUrls { locale url } } } shopLocales(published: true) { locale primary } }'));
  const adressfel = kontrolleraAdresser(adresser, wp.shop?.url, wp.webPresences?.nodes ?? []);
  if (adressfel.length) throw new Error(`Adresserna stämmer inte med Shopify — inget rört:\n  ${adressfel.join('\n  ')}`);
  logg(`Huvuddomän (shop.url): ${wp.shop.url}`);
  logg(`Adresser: ${locales.map((l) => `${l} ${adresser[l]}`).join(' · ')}`);
  const saknade = saknadeSprak(wp.shopLocales, locales);
  if (saknade.length) logg(`⚠️ Publicerade språk utan rad i mejl_sprak (rörs inte, länkarna går kvar till ${wp.shop.url}): ${saknade.join(', ')}`);

  // Alla notiser, sida för sida.
  const resurser = [];
  let efter = null;
  do {
    const d = await medForsok(() => k.graphql('query($a: String) { translatableResources(first: 50, after: $a, resourceType: EMAIL_TEMPLATE) { pageInfo { hasNextPage endCursor } nodes { resourceId } } }', { a: efter }));
    resurser.push(...d.translatableResources.nodes.map((n) => n.resourceId));
    efter = d.translatableResources.pageInfo.hasNextPage ? d.translatableResources.pageInfo.endCursor : null;
  } while (efter);
  const valda = bara?.length ? resurser.filter((r) => bara.some((b) => r === b || r.endsWith(`/${b}`))) : resurser;
  if (bara?.length && valda.length !== bara.length) throw new Error(`--bara: ${bara.length} mallar angivna, ${valda.length} finns bland Shopifys ${resurser.length} notiser.`);

  const rapport = { butik: id, tid: new Date().toISOString(), lage: skarpt ? 'skarpt' : 'torr', huvuddoman: wp.shop.url, adresser, saknade_sprak: saknade, notiser: resurser.length, fraktmallar: {}, mallar: {}, rader: [], engelska: {}, fyror: {}, summa: {} };
  const summa = { andras: 0, oforandrad: 0, inaktuell: 0, osaker: 0, saknas: 0, lankar: 0, filter: 0, slutsiffror: 0, fyra: 0, registrerade: 0, lika: 0, avviker: 0, fel: 0 };
  const andringar = [];
  const fraga = lasFraga(locales);
  const las = async (resurs) => (await medForsok(() => k.graphql(fraga, { id: resurs }))).translatableResource;
  let felIRad = 0;

  for (const resurs of valda) {
    const nr = resurs.split('/').pop();
    const r = await las(resurs);
    if (!r) throw new Error(`${resurs} finns inte i Shopify (translatableResource svarade null).`);
    const bas = Object.fromEntries(r.translatableContent.map((c) => [c.key, c]));
    const titel = bas.title?.value ?? '';

    // Fraktmallarna ägs av notis-oversattning.mjs: bara en rad om shop.url.
    if (egna.has(resurs)) {
      const n = locales.reduce((s, l) => s + (r[alias(l)] ?? []).reduce((t, x) => t + (x.value?.match(/shop\.url/g)?.length ?? 0), 0), 0);
      rapport.fraktmallar[nr] = { titel, shop_url: n };
      for (const l of Object.keys(FYRA).filter((x) => locales.includes(x))) {
        const kvar = (r[alias(l)] ?? []).flatMap((x) => fyrorKvar(x.value ?? ''));
        if (kvar.length) rapport.fyror[`${nr} ${l}`] = kvar;
      }
      logg(`${nr} "${titel}" — fraktmall (notis-oversattning.mjs), rörs inte: ${n ? `⚠️ shop.url ×${n}` : 'ingen shop.url'}`);
      continue;
    }

    const rad = { titel, sprak: {} };
    const attRegistrera = [];
    const onskat = new Map();
    for (const locale of locales) {
      const befintliga = r[alias(locale)] ?? [];
      for (const key of NYCKLAR) {
        if (!bas[key]) continue;
        const t = befintliga.find((x) => x.key === key);
        const post = { key };
        if (!t?.value) {
          post.status = 'saknas';
        } else {
          const ny = nyText(t.value, locale, adresser[locale]);
          Object.assign(post, { lankar: ny.lankar, filter: ny.filter, slutsiffror: ny.slutsiffror, fyra: ny.fyra, villkor: ny.villkor, shopify: t.updatedAt == null });
          if (!ny.andrad) post.status = 'oforandrad';
          else if (t.outdated) post.status = 'inaktuell';
          else if (ny.osakra.length) Object.assign(post, { status: 'osaker', osakra: ny.osakra });
          else {
            post.status = 'andras';
            attRegistrera.push({ locale, key, value: ny.text, translatableContentDigest: bas[key].digest });
            onskat.set(`${locale}|${key}`, ny.text);
            const mapp = join(korning, nr);
            mkdirSync(mapp, { recursive: true });
            writeFileSync(join(mapp, `${locale}.${key}.fore.liquid`), t.value);
            if (!skarpt) writeFileSync(join(mapp, `${locale}.${key}.efter.liquid`), ny.text);
            andringar.push(`${nr} ${locale} ${key} — länkar ${ny.lankar}${ny.filter ? `, filter ${ny.filter}` : ''}${ny.slutsiffror ? `, slutsiffror ${ny.slutsiffror}` : ''}${ny.fyra ? `, kortraden ${ny.fyra}` : ''}`, ...andradeRader(t.value, ny.text));
          }
          if (SLUTSIFFROR[locale]) {
            if (key === 'body_html') {
              const eng = engelskaRader(ny.text);
              if (eng.length) rapport.engelska[`${nr} ${locale}`] = eng;
            }
            const kvar = fyrorKvar(ny.text);
            if (kvar.length) rapport.fyror[`${nr} ${locale}${key === 'title' ? '/title' : ''}`] = kvar;
          }
        }
        summa[post.status]++;
        if (post.status === 'andras') {
          summa.lankar += post.lankar;
          summa.filter += post.filter;
          summa.slutsiffror += post.slutsiffror;
          summa.fyra += post.fyra;
        }
        if (key === 'body_html' || post.status !== 'oforandrad') rad.sprak[key === 'body_html' ? locale : `${locale}/title`] = post;
      }
    }

    if (skarpt && attRegistrera.length) {
      const batcher = delaIBatcher(attRegistrera);
      const registrerade = [];
      for (const batch of batcher) {
        try {
          await medForsok(() => k.graphql(REGISTRERA, { id: resurs, t: batch }));
          registrerade.push(...batch);
          felIRad = 0;
        } catch (e) {
          summa.fel += batch.length;
          felIRad++;
          for (const x of batch) Object.assign(rad.sprak[x.key === 'body_html' ? x.locale : `${x.locale}/title`], { status: 'fel', fel: e.message.replace(/\s+/g, ' ').slice(0, 300) });
          logg(`   ❌ ${nr} ${batch.map((x) => x.locale).join(',')}: ${e.message.replace(/\s+/g, ' ').slice(0, 200)}`);
          if (felIRad >= 3) throw new Error(`Tre registreringar i rad misslyckades — stoppar. Senaste: ${e.message.slice(0, 300)}`);
        }
      }
      summa.registrerade += registrerade.length;
      // Tillbakaläsning: exakt vår text, aktuell, och utan shop.url utanför villkoren.
      if (registrerade.length) {
        const r2 = await las(resurs);
        for (const x of registrerade) {
          const t2 = (r2[alias(x.locale)] ?? []).find((y) => y.key === x.key);
          const post = rad.sprak[x.key === 'body_html' ? x.locale : `${x.locale}/title`];
          const fel = [];
          if (t2?.value !== onskat.get(`${x.locale}|${x.key}`)) fel.push('texten är inte den registrerade');
          if (t2?.outdated) fel.push('märkt outdated');
          fel.push(...kontrolleraEfter(t2?.value ?? '', x.locale));
          post.efter = fel.length ? 'avviker' : 'lika';
          if (fel.length) post.efter_fel = fel;
          summa[fel.length ? 'avviker' : 'lika']++;
          const mapp = join(korning, nr);
          writeFileSync(join(mapp, `${x.locale}.${x.key}.efter.liquid`), t2?.value ?? '');
          if (fel.length) writeFileSync(join(mapp, `${x.locale}.${x.key}.onskad.liquid`), onskat.get(`${x.locale}|${x.key}`));
        }
      }
    }

    rapport.mallar[nr] = rad;
    const kort = Object.entries(rad.sprak)
      .map(([l, p]) => {
        if (p.status === 'andras') return `${l} ${p.lankar}${p.filter ? `+f${p.filter}` : ''}${p.slutsiffror ? `+s${p.slutsiffror}` : ''}${p.fyra ? `+k${p.fyra}` : ''}${p.efter ? (p.efter === 'lika' ? '✓' : '✗') : ''}`;
        if (p.status === 'oforandrad') return null;
        return `${l} ${p.status}`;
      })
      .filter(Boolean);
    const loggrad = `${nr} "${titel.slice(0, 60)}" — ${kort.length ? kort.join(' · ') : 'inget att byta'}`;
    rapport.rader.push(loggrad);
    logg(loggrad);
  }

  rapport.summa = summa;
  writeFileSync(join(korning, 'andringar.txt'), `${andringar.join('\n')}\n`);
  writeFileSync(join(korning, 'rapport.json'), `${JSON.stringify(rapport, null, 1)}\n`);
  rapport.korning = korning;
  return rapport;
}

const arDirekt = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (arDirekt) {
  const args = process.argv.slice(2);
  const ix = args.indexOf('--bara');
  const bara = ix > -1 ? String(args[ix + 1] ?? '').split(',').map((s) => s.trim()).filter(Boolean) : null;
  if (ix > -1 && !bara.length) throw new Error('--bara vill ha mallnummer, t.ex. --bara 126544118099,126543987027');
  const id = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--bara') ?? 'matstrumpor';
  const skarpt = args.includes('--skarpt');
  const rapport = await kor(id, { skarpt, bara });
  const s = rapport.summa;
  console.log('');
  console.log(`Notiser i Shopify: ${rapport.notiser} (fraktmallar som inte rörs: ${Object.keys(rapport.fraktmallar).length}).`);
  console.log(`Översättningar: ${s.andras} ändras (${s.lankar} länkar${s.filter ? `, ${s.filter} med filter` : ''}, ${s.slutsiffror} betalrader "ending in", ${s.fyra} kortrader med talet fyra), ${s.oforandrad} oförändrade, ${s.inaktuell} inaktuella (hoppade), ${s.osaker} osäkra (hoppade), ${s.saknas} saknas.`);
  const eng = Object.entries(rapport.engelska);
  if (eng.length) {
    console.log('Engelska rader kvar i ja/zh-TW (rörs inte):');
    for (const [nyckel, rader] of eng) console.log(`  ${nyckel}: ${rader.map((x) => `"${x.slice(0, 50)}"`).join(', ')}`);
  }
  const fyror = Object.entries(rapport.fyror);
  console.log(fyror.length ? 'Talet fyra kvar i ja/zh-TW-kundtext (rörs inte, efter bytet):' : 'Talet fyra kvar i ja/zh-TW-kundtext: inget.');
  for (const [nyckel, rader] of fyror) console.log(`  ${nyckel}: ${rader.map((x) => `"${x.slice(0, 60)}"`).join(', ')}`);
  console.log(`Före/efter: ${rapport.korning}`);
  // Läget (litet, committas): en rad per mall. Hela strukturen per språk står i körningens
  // rapport.json bredvid före/efter-kopiorna (gitignorerad).
  if (skarpt && s.registrerade) {
    const ut = join(ROT, 'output', 'butiker', id, 'notis-lankar');
    mkdirSync(ut, { recursive: true });
    const { korning, mallar, ...kort } = rapport;
    writeFileSync(join(ut, 'lage.json'), `${JSON.stringify(kort, null, 1)}\n`);
  }
  const fel = s.fel + s.avviker;
  console.log(
    skarpt
      ? fel
        ? `❌ ${s.fel} misslyckades, ${s.avviker} lästes inte tillbaka rätt (av ${s.registrerade} registrerade).`
        : s.registrerade
          ? `✅ ${s.registrerade} översättningar registrerade, alla lästa tillbaka lika, aktuella och utan shop.url.`
          : '✅ Inget att byta — allt var redan gjort.'
      : 'Torrt — inget skrivet i Shopify. Kör med --skarpt för att registrera.',
  );
  process.exit(fel ? 1 : 0);
}
