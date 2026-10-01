// Shopify-anmälan: vårt material på en annan Shopify-butiks egen sida.
//
// MatSokker 2026-10-01: Axel skrev "Vi måste också göra en DMCA via Shopify eftersom de har snott
// våra UGC videos och skit och lagt på sin hemsida". Sessionen mätte sajten. GIF:en på produktsidan
// (gif2_800x800.gif, 500 × 500) är en kvadrat beskuren ur vår svenska Nathalie-film: 20 av 26 rutor
// identiska (≤ 6/64, 7 olika sekunder), mätt med `--shopify`. Den andra GIF:en fanns inte i någon av
// våra 243 filmer och anmäls inte.
//
// Shopifys formulär (SHOPIFY_FORMULAR) kräver inloggning, och ingen session når det. Därför bygger det
// här texterna och bevisbilden, Axel säger Ja i granskningsappen, och Cowork fyller i formuläret i hans
// Chrome (shopifyCowork). Samma regel som för Meta: bara det som MÄTTS som vårt anmäls.
import { execFileSync } from 'node:child_process';
import { dHash, avstand, kontrastAv, MAX_AVSTAND, KONTRAST_MIN } from './klipp.mjs';

export const SHOPIFY_FORMULAR = 'https://www.shopify.com/legal/tools/report-an-issue/dmca';
// Shopifys egna försäkringar är DMCA:s två (17 U.S.C. § 512(c)(3)(A)(v)–(vi)); formulärets ordalydelse kan skilja sig något.
export const SHOPIFY_FORSAKRINGAR = [
  'I have a good faith belief that use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.',
  'I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.',
];
export const BESKARNINGAR = ['topp', 'mitt', 'botten'];
export const TRAFF_MIN = 3;    // minst tre identiska rutor …
export const SEKUNDER_MIN = 2; // … ur minst två olika sekunder hos dem …
export const ANDEL_MIN = 0.3;  // … och minst 30 % av deras rutor (MatSokkers GIF 2: 20 av 26 = 77 %)

/** Kvadratens läge i en stående film: ffmpeg-crop-uttrycket. Ren. */
export function cropUttryck(beskarning) {
  const y = beskarning === 'topp' ? '0' : beskarning === 'botten' ? 'ih-min(iw\\,ih)' : '(ih-min(iw\\,ih))/2';
  return `crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:${y}`;
}

/** Rutor ur en fil (GIF eller film) som 9 × 8-hashar; `beskarning` = kvadrat ur topp/mitt/botten, null = hela bilden. */
export function rutorBeskurna(ffmpeg, fil, { beskarning = null, fps = 4, maxSek = 180 } = {}) {
  const vf = `${beskarning ? `${cropUttryck(beskarning)},` : ''}fps=${fps},scale=9:8:flags=area,format=gray`;
  const raw = execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', fil, '-t', String(maxSek), '-vf', vf, '-f', 'rawvideo', '-'], { maxBuffer: 64 * 1024 * 1024 });
  const ut = [];
  for (let i = 0; i < Math.floor(raw.length / 72); i++) { const g = raw.subarray(i * 72, i * 72 + 72); ut.push({ i, t: i / fps, hash: dHash(g), kontrast: kontrastAv(g) }); }
  return ut;
}

/** Deras rutor mot en av våra filmer: bästa motsvarighet per ruta, och träffarna inom maxAvstand. Platta rutor räknas inte. Ren. */
export function raknaTraffar(deras, vara, { maxAvstand = MAX_AVSTAND, kontrastMin = KONTRAST_MIN } = {}) {
  const dRutor = deras.filter((r) => r.kontrast >= kontrastMin);
  const vRutor = vara.filter((r) => r.kontrast >= kontrastMin);
  const traffar = [];
  for (const d of dRutor) {
    let b = null;
    for (const v of vRutor) { const x = avstand(d.hash, v.hash); if (!b || x < b.avstand) b = { i: d.i, t: d.t, egenI: v.i, egenT: v.t, avstand: x }; }
    if (b && b.avstand <= maxAvstand) traffar.push(b);
  }
  const sekunder = new Set(traffar.map((x) => Math.floor(x.t))).size;
  return { traffar, antal: dRutor.length, andel: dRutor.length ? traffar.length / dRutor.length : 0, sekunder };
}

/** Bevisad? Samma tre villkor för varje bild. Ren. */
export const arBevisad = (m) => Boolean(m) && m.traffar.length >= TRAFF_MIN && m.sekunder >= SEKUNDER_MIN && m.andel >= ANDEL_MIN;

/** Tre par spridda över deras tid: en ruta per vald sekund, bästa avståndet inom sekunden. Ren. */
export function valjBildpar(traffar, antal = 3) {
  const perSek = new Map();
  for (const x of traffar) { const s = Math.floor(x.t); const b = perSek.get(s); if (!b || x.avstand < b.avstand) perSek.set(s, x); }
  const sek = [...perSek.keys()].sort((a, b) => a - b);
  if (sek.length <= antal) return sek.map((s) => perSek.get(s));
  const val = [];
  for (let k = 0; k < antal; k++) val.push(perSek.get(sek[Math.round((k * (sek.length - 1)) / (antal - 1))]));
  return [...new Map(val.map((x) => [x.i, x])).values()];
}

const datumEn = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : null);

/**
 * Anmälans fält på engelska (Shopify läser engelska) + vad som saknas. `matt` = raknaTraffar för bästa
 * filmen, `film` = { namn, skapad }, `original` = länkar till vår annons i annonsbiblioteket. Ren.
 */
export function byggShopifyAnmalan({ arende, konfig, sida, fil, film, matt, beskarning = null, original = [], bevisbildUrl = null, nu = new Date().toISOString() }) {
  const f = konfig?.brev?.foretag ?? {};
  const u = konfig?.anmalan?.undertecknare ?? {};
  const prod = arende?.var?.produkt ?? {};
  const butik = arende?.deras?.doman ? `https://${arende.deras.doman}` : null;
  const publicerad = datumEn(film?.skapad);
  const dom = String(prod.butik ?? prod.url ?? '').replace(/^https?:\/\//, '').split('/')[0] || null;
  const butikText = arende?.verksamhet ? `${arende.verksamhet}${dom ? ` (${dom})` : ''}` : (dom ?? '');
  const verk = `An advertising video made for our store ${butikText} for our product "${prod.titel ?? prod.handle ?? ''}"${film?.namn ? ` (our ad "${film.namn}"${publicerad ? `, published by us on ${publicerad}` : ''})` : ''}. The animated image on the reported page is cut from this video: ${matt?.traffar?.length ?? 0} of its ${matt?.antal ?? 0} sampled frames are identical to frames of our video (perceptual-hash distance at most ${MAX_AVSTAND}/64${beskarning ? `, compared as a square crop of our vertical video` : ''}), as shown side by side on the evidence image.`.replace(/ {2,}/g, ' ');
  const originalUrls = [...new Set([...(original ?? []), prod.url].filter(Boolean))];
  const falt = {
    foretag: f.namn ? `${f.namn}${f.orgnr ? ` (reg. no. ${f.orgnr})` : ''}` : null,
    rollTillVerket: "I'm authorised to act on behalf of the copyright owner",
    namn: u.namn ?? null,
    titel: u.roll ?? null,
    epost: u.epost ?? konfig?.brev?.avsandare?.mail ?? null,
    telefon: u.telefon || null,
    adress: u.adress ?? (f.adress ? `${f.adress}, Sweden` : null),
    land: 'Sweden',
    butik,
    sidor: [sida, fil].filter(Boolean),
    verk,
    original: originalUrls,
    bevis: bevisbildUrl,
    signatur: u.namn ?? null,
  };
  const an = { arende: arende?.id ?? null, formular: SHOPIFY_FORMULAR, byggd: nu, sida, fil, film: film?.namn ?? null, filmSkapad: film?.skapad ?? null, beskarning, matt: matt ? { traffar: matt.traffar.length, antal: matt.antal, andel: Math.round(matt.andel * 100) / 100, sekunder: matt.sekunder } : null, bevisbildUrl, falt, forsakringar: SHOPIFY_FORSAKRINGAR };
  return { ...an, fel: kontrolleraShopify(an) };
}

/** Det som stoppar anmälan: saknade fält och ett mått som inte räcker. Ren. */
export function kontrolleraShopify(an) {
  const f = an?.falt ?? {};
  const fel = [];
  for (const [k, namn] of [['foretag', 'rättighetshavaren'], ['namn', 'ditt namn'], ['epost', 'e-posten'], ['adress', 'adressen'], ['butik', 'butiken som anmäls'], ['verk', 'beskrivningen av vårt verk'], ['signatur', 'underskriften']]) if (!f[k]) fel.push(`${namn} saknas`);
  if (!f.sidor?.length) fel.push('sidan med vårt material saknas');
  if (!f.original?.length) fel.push('länken till vårt original saknas');
  if (!an?.matt || an.matt.traffar < TRAFF_MIN || an.matt.andel < ANDEL_MIN || an.matt.sekunder < SEKUNDER_MIN) fel.push(`måttet räcker inte (${an?.matt?.traffar ?? 0} identiska rutor av ${an?.matt?.antal ?? 0}, krav ${TRAFF_MIN} ur ${SEKUNDER_MIN} sekunder och ${Math.round(ANDEL_MIN * 100)} %)`);
  return fel;
}

/** Fälten i klartext (filen bredvid JSON:en och Cowork-promptens block). Ren. */
export function shopifyText(an) {
  const f = an.falt;
  return [
    `Rights owner (company): ${f.foretag}`,
    `Your relationship to the copyright owner: ${f.rollTillVerket}`,
    `Full name: ${f.namn}${f.titel ? ` (${f.titel})` : ''}`,
    `Email: ${f.epost}`,
    `Phone: ${f.telefon ?? '(none given)'}`,
    `Address: ${f.adress}`,
    `Country: ${f.land}`,
    `Store being reported: ${f.butik}`,
    `URL(s) of the infringing content:\n${f.sidor.join('\n')}`,
    `Description of the copyrighted work:\n${f.verk}`,
    `URL(s) of the original work:\n${f.original.join('\n')}`,
    `Evidence image: ${f.bevis ?? '(not uploaded)'}`,
    `Electronic signature: ${f.signatur}`,
    `Statements:\n${an.forsakringar.map((x) => `- ${x}`).join('\n')}`,
  ].join('\n');
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tidSek = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;

/**
 * Bevisbilden (HTML → PNG i Chromium, som Meta-anmälans): våra rutor till vänster, deras till höger,
 * tiderna och avståndet under varje par. `par[].egen/deras` = data-URI:er. Ren.
 */
export function shopifyBevisHtml({ sida, bild, film, par, matt, beskarning = null, butik = null }) {
  const rader = par.map((p, k) => `<div class="par"><figure><img src="${p.egen}" alt=""><figcaption>Ours · ${esc(tidSek(p.egenT))}</figcaption></figure><figure><img src="${p.deras}" alt=""><figcaption>Theirs · ${esc(tidSek(p.t))}</figcaption></figure><p class="avst">Pair ${String.fromCharCode(65 + k)} · perceptual-hash distance ${p.avstand}/64</p></div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:28px;font:15px/1.45 Arial,Helvetica,sans-serif;color:#111;background:#fff;width:1144px}
h1{font-size:22px;margin:0 0 6px}p{margin:4px 0}.liten{color:#555;font-size:13px;word-break:break-all}
.huvud{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:16px 0 10px;font-weight:bold}
.par{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:0 0 18px;padding:12px;border:1px solid #ddd;border-radius:8px}
figure{margin:0}img{width:100%;display:block;border-radius:4px}figcaption{font-size:13px;color:#333;margin-top:4px}
.avst{grid-column:1/3;font-size:13px;color:#333}.dom{margin:14px 0;padding:10px 12px;background:#f4f4f4;border-radius:6px}
</style></head><body>
<h1>Copyright evidence: our video on ${esc(butik ?? sida)}</h1>
<p class="liten">Their page: ${esc(sida)}<br>Their file: ${esc(bild)}</p>
<div class="dom">${matt.traffar.length} of the ${matt.antal} sampled frames of their animated image are identical to frames of our video "${esc(film.namn)}"${film.skapad ? `, published by us on ${esc(datumEn(film.skapad))}` : ''}${beskarning ? ' (compared as a square crop of our vertical video)' : ''}. Three of them, from different moments, are shown below.</div>
<div class="huvud"><div>Our video: ${esc(film.namn)}</div><div>Their page</div></div>
${rader}
</body></html>`;
}

/** Cowork-avsnittet för EN Shopify-anmälan (läggs efter Meta-anmälningarna i samma prompt). Ren. */
export function shopifyCowork({ arende, an }) {
  const f = an.falt;
  return `===== ${arende} · SHOPIFY-ANMÄLAN (butiken ${f.butik}) =====
Axel har godkänt den här anmälan i granskningsappen. Den gäller bara sidorna nedan.
1. Öppna ${an.formular} och klicka Continue. Kräver Shopify inloggning: Axel loggar in med sitt eget Shopify-konto. Skapa aldrig ett nytt konto och skriv aldrig in ett lösenord själv.
2. Välj det som betyder upphovsrättsintrång (copyright / DMCA) och, om det frågas, att butiken säljer på Shopify.
3. Fyll i fälten med EXAKT texterna nedan. Fält som inte finns nedan: lämna tomma om de är frivilliga. Kräver formuläret något som inte står här (till exempel ett telefonnummer): STANNA och fråga Axel. Allt du skriver här kan Shopify skicka vidare till butiken.
4. Bevisbilden: står det ett fält för länkar eller beskrivning, räcker länken nedan. Ladda aldrig upp någon annan fil.
5. Kryssa i försäkringarna bara om de säger samma sak som raderna under "Statements". Underskriften är namnet nedan.
6. Visar Shopify en säkerhetskontroll: STANNA och låt Axel göra den.
7. Skicka in. Skriv upp Shopifys bekräftelse eller ärendenummer, eller "inget nummer".

${shopifyText(an)}`;
}
