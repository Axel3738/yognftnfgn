// Bygger de tre fraktmejlen (Leveransbekräftelse, Leveransuppdatering, Ute
// för leverans) för en annan butik än Bäverbutiken — samma mallar som
// mejl/mallar.mjs, utan gratisprodukt-blocket, med butikens logga, färger,
// språk, paketprefix och spårningssida. Noll beroenden.
//
//   node mejl/bygg-butik.mjs carashell
//   node mejl/bygg-butik.mjs --alla          # alla butiker i sparning/butiker.json utom Bäverbutiken
//
// Skriver mejl/output/butiker/<id>/:
//   <mall>.liquid                 det Cowork klistrar in i Shopify
//   <mall>.amne.txt               ämnesraden
//   forhandsvisning/<mall>.html   mejlet med exempeldata
//   COWORK-PROMPT.md              uppgiften till Cowork, med teckenantal och råfil-länkar
//   PROMPT.txt                    samma prompt utan huvudet — råfilen på GitHub går att kopiera rakt in i Cowork
//
// Bakgrund (2026-09-20 kväll): Cowork lappade Shopifys standardmall i
// CaraShell (bytte länkar, lät Shop-knappen stå) och Axel dömde "tvääär fula,
// fulare än originalet". Bäverbutikens mallar byggs helt av mallar.mjs och
// klistras in som EN mall — den vägen gäller nu för alla butiker.
//
// Källorna: sparning/butiker.json (namn, url, support, prefix, sida,
// leveranslöfte, språk) + mejl/butiker/<id>.json (färger, logga, typsnitt)
// + mejl/sprak/<kod>.json (orden och copyn på butikens språk; svenska tar
// copyn ur mejl/copy.json).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { byggMall, MALLAR } from './mallar.mjs';
import { allaButiker, lasButik } from '../sparning/butik.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const FRAKTMALLAR = ['fraktbekraftelse', 'fraktuppdatering', 'ute_for_leverans'];
const RAW = 'https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/butiker';

export function lasSprak(kod, rot = ROT) {
  return JSON.parse(readFileSync(join(rot, 'sprak', `${kod}.json`), 'utf8'));
}

// Konfig + copy för en butik, i det format byggMall vill ha.
export function butikIndata(id, { rot = ROT, register = undefined, sprakKod = null, sida = null, hemFranSida = false } = {}) {
  const reg = lasButik(id, register);
  if (reg.standard) throw new Error('Bäverbutiken byggs med mejl/bygg.mjs, inte här.');
  const brand = JSON.parse(readFileSync(join(rot, 'butiker', `${id}.json`), 'utf8'));
  const sprak = lasSprak(sprakKod ?? reg.sprak, rot);
  const basCopy = JSON.parse(readFileSync(join(rot, 'copy.json'), 'utf8'));
  const support = reg.support;
  if (!support) throw new Error(`${id}: supportadress saknas i sparning/butiker.json — mejlets sidfot behöver den.`);
  const [min, max] = reg.leverans_dagar ?? [7, 14];

  // Loggans länk följer språkets egen adress i Shopifys översättningar (`mejl_sprak`, granskningen G-D04,
  // 2026-09-30): en tysk kund fick knappen till matstrumpor.com/de men loggan till matstrumpor.se. Adressen är
  // spårningssidans utan /pages/<handle>. Bara i översättningarna (`hemFranSida`): CaraShells marknadsgrenar
  // (`mejl_marknader`) är inklistrade för hand och ska se ut som de gör live tills någon klistrar om dem.
  const hem = hemFranSida && sida && sida.endsWith(`/pages/${reg.handle}`) ? sida.slice(0, -`/pages/${reg.handle}`.length) : reg.url;
  const konfig = {
    butik: {
      namn: reg.namn,
      url: hem,
      support,
      farg_rod: brand.farg_rod,
      farg_svart: brand.farg_svart,
      farg_ram: brand.farg_ram,
      font_rubrik: brand.font_rubrik,
      rubrik_versaler: brand.rubrik_versaler,
      rubrik_fet: brand.rubrik_fet,
      sidhuvud_farg: brand.sidhuvud_farg,
      logga_url: brand.logga_url,
      logga_bredd: brand.logga_bredd,
      logga_hojd: brand.logga_hojd,
    },
    // fonster: false ⇒ ingen "Beräknad leverans"-ruta i fraktbekräftelsen
    // (brandfilens `leveransfonster`, Axels order 2026-09-21: fönstret står
    // aldrig i ett mejl som bär spårningslänken).
    frakt: { leverans_dagar_min: min, leverans_dagar_max: max, fonster: brand.leveransfonster !== false },
    sparning: { sida: sida ?? `${reg.url}/pages/${reg.handle}`, prefix: reg.prefix },
    sprak: { kod: sprak.kod, ord: sprak.ord ?? {}, manader: sprak.manader ?? undefined, dagsuffix: sprak.dagsuffix ?? '', halsning: sprak.halsning ?? undefined, adressformat: sprak.adressformat ?? undefined },
    // Inget erbjudande: blocket byggs bara när konfigen bär `erbjudande`.
  };
  const copy = {};
  for (const m of FRAKTMALLAR) {
    copy[m] = sprak.mallar?.[m] ?? basCopy[m];
    if (!copy[m]) throw new Error(`${id}: copy för ${m} saknas (mejl/sprak/${sprak.kod}.json eller mejl/copy.json).`);
  }
  copy.sidfot = { fragor: String(sprak.sidfot).replace('{{support}}', support) };
  return { konfig, copy, produkter: null, reg, brand, sprak };
}

// En butik med flera marknader (registret → mejl_marknader, CaraShell:
// NO → norska, US/GB/CA/AU/NZ → engelska, FI → finska) får EN mall per
// notis som väljer språk själv på leveranslandet — Shopify har ingen mall
// per marknad. Varje gren är en hel mall på sitt språk med marknadens egen
// adress till spårningssidan; allt annat land får butikens språk.
export function byggButik(id, opts = {}) {
  const bas = butikIndata(id, opts);
  const marknader = Array.isArray(bas.reg.mejl_marknader) ? bas.reg.mejl_marknader : [];
  const varianter = marknader.map((m) => ({
    lander: (m.lander ?? []).map((l) => String(l).toUpperCase()),
    kod: m.sprak,
    indata: butikIndata(id, { ...opts, sprakKod: m.sprak, sida: m.sida ?? null }),
  }));
  for (const v of varianter) {
    if (!v.lander.length) throw new Error(`${id}: mejl_marknader-rad utan länder (språk ${v.kod}).`);
    if (v.kod === bas.sprak.kod) throw new Error(`${id}: mejl_marknader får inte bära butikens eget språk (${v.kod}) — det är else-grenen.`);
  }
  const liquid = FRAKTMALLAR.map((m) => {
    const grund = byggMall(m, { ...bas, lage: 'liquid' });
    if (!varianter.length) return grund;
    const grenar = varianter.map((v) => ({ v, mall: byggMall(m, { ...v.indata, lage: 'liquid' }) }));
    const when = (v) => `{% when ${v.lander.map((l) => `'${l}'`).join(' or ')} %}`;
    const html =
      `{% case shipping_address.country_code %}` +
      grenar.map(({ v, mall }) => `${when(v)}${mall.html}`).join('') +
      `{% else %}${grund.html}{% endcase %}`;
    const amne =
      `{% case shipping_address.country_code %}` +
      grenar.map(({ v, mall }) => `${when(v)}${mall.amne}`).join('') +
      `{% else %}${grund.amne}{% endcase %}`;
    return { ...grund, html, amne, sprak: [bas.sprak.kod, ...varianter.map((v) => v.kod)] };
  });
  const oversattningar = byggOversattningar(id, bas, opts);
  if (oversattningar.length && varianter.length) {
    throw new Error(`${id}: mejl_sprak och mejl_marknader samtidigt — välj en väg (språket per order ELLER landet i en mall).`);
  }
  const exempel = FRAKTMALLAR.map((m) => byggMall(m, { ...bas, lage: 'exempel' }));
  const exempelExtra = [
    ...varianter.flatMap((v) => FRAKTMALLAR.map((m) => ({ ...byggMall(m, { ...v.indata, lage: 'exempel' }), kod: v.kod }))),
    ...oversattningar.flatMap((o) => FRAKTMALLAR.map((m) => ({ ...byggMall(m, { ...o.indata, lage: 'exempel' }), kod: o.locale }))),
  ];
  return { ...bas, liquid, exempel, exempelExtra, varianter, oversattningar };
}

// En butik med språk i Shopify (registret → mejl_sprak, Matstrumpor sedan
// 2026-09-29) får en HEL mall per språk, som registreras som Shopifys egen
// översättning av notisen (translatableResource EMAIL_TEMPLATE, nycklarna
// title + body_html — mejl/notis-oversattning.mjs). Shopify skickar då
// notisen på det språk kunden handlade på ("If translations are available
// for an email notification, then a customer is automatically sent email
// notifications in the language that they placed their order in",
// help.shopify.com → Languages → Notifications, läst 2026-09-29). Det är
// orderns språk, inte leveranslandet — en belgare som handlade på franska
// får franska. Varje språk länkar till spårningssidan i sin språkmapp.
export function byggOversattningar(id, bas, opts = {}) {
  const rader = Array.isArray(bas.reg.mejl_sprak) ? bas.reg.mejl_sprak : [];
  const sett = new Set();
  return rader.map((r) => {
    if (!r.locale || !r.sprak) throw new Error(`${id}: mejl_sprak-rad utan locale eller sprak.`);
    if (r.sprak === bas.sprak.kod) throw new Error(`${id}: mejl_sprak får inte bära butikens eget språk (${r.sprak}) — det är huvudmallen.`);
    if (sett.has(r.locale)) throw new Error(`${id}: locale ${r.locale} två gånger i mejl_sprak.`);
    sett.add(r.locale);
    const mapp = r.mapp ?? r.sprak;
    const sida = r.sida ?? `${bas.reg.url}/${mapp}/pages/${bas.reg.handle}`;
    const indata = butikIndata(id, { ...opts, sprakKod: r.sprak, sida, hemFranSida: true });
    const mallar = FRAKTMALLAR.map((m) => byggMall(m, { ...indata, lage: 'liquid' }));
    return { locale: r.locale, kod: r.sprak, sida, indata, mallar };
  });
}

// Prompten till Cowork: samma metod som Bäverbutikens (mejl/COWORK-PROMPT.md)
// — hela mallen byts, verifieras mot serverns mall-data, teckenantal i tecken.
export function coworkPrompt({ reg, brand, sprak, liquid, copy, oversattningar = [] }) {
  const id = reg.id;
  const sida = `${reg.url}/pages/${reg.handle}`;
  const rader = liquid
    .map((m, i) => {
      const meta = MALLAR.find((x) => x.id === m.id);
      const amne = m.amne.startsWith('{% case') ? '(hela raden ur råfilens ämnesrad, se nedan)' : m.amne;
      const kontroll = m.sprak ? `\`${reg.prefix}\`, \`sha256\` och \`country_code\`` : `\`${reg.prefix}\` och \`sha256\``;
      return `| ${i + 1} | **${meta.shopify}** | \`${amne}\` | ${kontroll} | **${m.html.length.toLocaleString('sv-SE').replace(/ /g, ' ')}** | ${RAW}/${id}/${m.id}.liquid |`;
    })
    .join('\n');
  const meny = brand.meny_klar
    ? `### B. Menylänken\n\nRedan gjord — **${sprak.menyrad}** ligger i huvudmenyn och sidfotsmenyn. Rör inte menyerna.\n`
    : `### B. Menylänken

1. **Onlinebutik** → **Navigering** → **Huvudmeny** (Main menu).
2. Finns redan en rad som länkar till \`/pages/${reg.handle}\`: rör den inte. Annars **Lägg till menyalternativ**, Namn: \`${sprak.menyrad}\`, Länk: \`/pages/${reg.handle}\`, **Lägg till**, **Spara menyn**. Raden sist.
3. Samma i **Sidfotsmeny** (Footer menu) — heter den något annat, ta den meny sidfoten på ${reg.url.replace('https://', '')} faktiskt visar.
4. Kontrollera i kundens vy: öppna ${reg.url} i en ny flik, ladda om, se att **${sprak.menyrad}** syns i huvudmenyn och sidfoten och landar på "${reg.titel}".

Skapa aldrig en ny meny, ta aldrig bort en rad, ändra inga andra namn.
`;
  const flersprak = liquid.some((m) => m.sprak);
  const amnesrader = flersprak
    ? `\n⚠️ **Ämnesraderna är Liquid** (mallen väljer språk på leveranslandet): kopiera HELA raden ur \`${RAW}/${id}/<mall>.amne.txt\` in i fältet E-postämne — den börjar med \`{% case shipping_address.country_code %}\` och slutar med \`{% endcase %}\`. Språken i mallen: ${liquid[0].sprak.join(', ')}.\n`
    : '';
  const avsandare = brand.byt_avsandare
    ? `\n### 0. Avsändaradressen — FÖRST

**Inställningar** → **Notiser** → **Avsändarens e-post** (Sender email): byt till **${brand.byt_avsandare}** och spara. Shopify visar då "ej verifierad" och skickar ett verifieringsmejl till den adressen — Axel klickar länken i inkorgen ${brand.byt_avsandare}. Rapportera "verifieringsmejlet skickat" och vänta på Axels "klickat" innan du går vidare till A. **Står adressen redan på ${brand.byt_avsandare} och är verifierad: rapportera det och gå direkt till A.** Ändra inget annat på sidan.
`
    : '';
  return `# Cowork-prompt: fraktmejlen${brand.meny_klar ? '' : ' + menylänken'} i ${reg.namn} (${reg.url.replace('https://', '')})

Byggd av \`node mejl/bygg-butik.mjs ${id}\`. Hela mallen byts — inte enskilda
rader — så mejlet ser ut som Bäverbutikens (Axels dom 2026-09-20 på den
lappade Shopify-mallen: "tvääär fula"). Länkarna pekar på \`main\`: pusha
först, annars klistrar Cowork in en gammal version. Delen under linjen är prompten.

---

Du jobbar i Chrome i mitt inloggade Shopify-konto för butiken **${reg.namn}**
(${reg.url.replace('https://', '')}, ${reg.myshopify}). Uppgifter: **A.** byta ut koden i
**tre kundnotiser**${brand.meny_klar ? '' : ', **B.** lägga in menylänken'}, sedan **C.** ett testmejl. Rör ingenting annat i
Shopify: inga andra mallar, inga inställningar, inga rabatter, inga produkter.

⚠️ **Datorn är en Windows-dator, inte en Mac.** Klicka alltid först inne i
kodfältet innan du markerar eller kopierar — kortkommandon som når Shopifys
sida öppnar dialoger ("Lägg till produktserie", "Lägg till sida"). Öppnas en
sådan dialog: stäng den utan att spara.

⚠️ **Urklippet är inte att lita på.** Metoden som fungerat (Bäverbutiken
2026-09-20): hämta råfilen direkt i Shopify-sidan, skriv in den via
kodrutans eget API, och verifiera mot serverns mall-data — inget urklipp,
inga kortkommandon. **Klistra aldrig in en halv mall.**

Kontrollera först att ${sida} svarar och visar rubriken "${reg.titel}".
Gör den inte det: stoppa och rapportera.

${brand.byt_avsandare ? '' : `⚠️ **Avsändaradressen.** Visar Shopify en gul banner i mallens redigerare —
"Innan du kan redigera aviseringar måste du granska och verifiera din
avsändares e-postadress" (fälten utgråade) — så är det tillåtet och väntat
att lösa den: klicka bannerns länk (Inställningar → Aviseringar →
avsändaradressen) och klicka **Skicka verifiering** / **Verifiera**. Det
går ett mejl till **${reg.support}** med en länk som Axel klickar — stanna
där, rapportera, och fortsätt med A när Axel sagt att länken är klickad.
Ändra inte adressen, byt inte avsändare. (Hände i Majavakauppa och
CaraShell 2026-09-20.)
`}

${avsandare}
### A. De tre mallarna
${amnesrader}
Gör så här för en mall i taget, uppifrån och ner i tabellen:

1. Hämta mallens råfil (kolumnen "Mallens kod"). Det är en ren textfil.
2. Shopify-admin → **Inställningar** → **Notiser** → **Kundaviseringar** → mallens namn → **Redigera kod**.
3. Fältet **E-postämne**: jämför med ämnesraden i tabellen${flersprak ? ' (råfilen `<mall>.amne.txt`)' : ''}, tecken för tecken. Skiljer den sig: byt till tabellens rad.
4. Rutan **E-postbrödtext (HTML)**: ersätt HELA innehållet med råfilen.
5. **Innan du sparar:** rätt teckenantal (tabellen) och att texten i kolumnen "Kontrollera" finns.
6. **Spara**.
7. **Kontrollera mot servern, inte mot redigeraren:** läs mallens innehåll och \`updatedAt\` ur Shopifys mall-data för sidan och jämför med råfilen. Stämmer det inte: säg till, klistra inte om i blindo. Klicka aldrig "Ignorera" på "Osparade ändringar" utan att först ha läst vad servern har.

| # | Mall i Shopify | Ämnesrad | Kontrollera | Tecken | Mallens kod |
|---|---|---|---|---|---|
${rader}

⚠️ Bredvid "Ute för leverans" ligger "Order ute för lokal leverans" — ta INTE
det — id:t i adressfältet är markören: shipment_out_for_delivery är rätt, local_out_for_delivery fel (båda heter "Out for delivery" internt; CaraShell 2026-09-21). Rör inte "Levererad". Talen är tecken, inte byte (å/ä/ö väger två byte i
Shopifys räknare).

${oversattningar.length ? oversattningsDel(reg, oversattningar) : ''}${meny}
### C. Testmejlet

**Leveransbekräftelse** → **Skicka testmejl**. Bara den. Öppna mejlet: en
enda knapp **${copy.fraktbekraftelse.knapp}**, länken börjar med
\`${sida}?nummer=${reg.prefix}\`. (Sidan säger att den inte hittar numret för
testmejlets påhittade spårningsnummer — det är väntat.)
${oversattningar.length ? testmejlPerSprak(reg, oversattningar) : ''}
### Rapportera tillbaka

1. Vilka mallar som sparades och verifierades mot servern, teckenantal per mall.
2. Om kontrolltexten saknades, och i vilken mall.
${brand.meny_klar ? '' : '3. Menyerna: vilka två menyer som fick raden, och vad du såg i kundens vy.\n'}${brand.meny_klar ? '3' : '4'}. Testmejlet: gick det, till vilken adress, knappens text.
${oversattningar.length ? `${brand.meny_klar ? '4' : '5'}. Testmejl per språk: vilka språk som gick och vad knappen hette — eller "ingen språkväljare".\n` : ''}${brand.meny_klar ? (oversattningar.length ? '5' : '4') : oversattningar.length ? '6' : '5'}. Allt som såg konstigt ut.

Om Shopify vägrar spara: spara inte om, skriv exakt vad felmeddelandet sa.
`;
}

// Översättningarna läggs via API (mejl/notis-oversattning.mjs), inte av
// Cowork — prompten säger det rakt ut så att ingen klistrar in en
// översättning i admin (där går bara huvudspråket att redigera).
function oversattningsDel(reg, oversattningar) {
  const lista = oversattningar.map((o) => `${o.locale}`).join(', ');
  return `### Översättningarna (${oversattningar.length} språk) — rör dem inte

Mallarna på ${lista} ligger redan i Shopify som notisernas **översättningar**
(lagda via API av sessionen, lästa tillbaka). Shopify skickar själv mejlet på
det språk kunden handlade på. Du klistrar BARA in de svenska mallarna ovan.
Öppna inte Translate & Adapt och ändra inga översättningar. Att översättningarna
blir "inaktuella" när du sparat den svenska mallen är väntat — spårningsrutinen
lägger in dem igen inom en timme.

`;
}

function testmejlPerSprak(reg, oversattningar) {
  const rader = oversattningar
    .map((o) => {
      const m = o.mallar.find((x) => x.id === 'fraktbekraftelse');
      const knapp = o.indata.copy.fraktbekraftelse.knapp;
      return `| ${o.locale} | \`${m.amne}\` | **${knapp}** | \`${o.sida}?nummer=${reg.prefix}\` |`;
    })
    .join('\n');
  return `
**Testmejl per språk.** Finns det i redigeraren för Leveransbekräftelse en
språkväljare (förhandsvisning eller testmejl på ett annat språk): skicka ett
testmejl per språk i tabellen, ett i taget, till butikens egen adress
**${reg.support}** — aldrig till någon annan. Kontrollera ämnesraden, knappens
text och att länken börjar som i tabellen. Finns ingen språkväljare: skicka
inget mer, skriv "ingen språkväljare" i rapporten (sessionen har redan läst
tillbaka varje språk ur Shopify och provat länkarna som kund).

| Språk | Ämnesrad | Knappen | Länken börjar med |
|---|---|---|---|
${rader}
`;
}

export function skrivButik(id, { rot = ROT } = {}) {
  const b = byggButik(id, { rot });
  const ut = join(rot, 'output', 'butiker', id);
  mkdirSync(join(ut, 'forhandsvisning'), { recursive: true });
  for (const m of b.liquid) {
    writeFileSync(join(ut, `${m.id}.liquid`), m.html);
    writeFileSync(join(ut, `${m.id}.amne.txt`), `${m.amne}\n`);
  }
  for (const m of b.exempel) writeFileSync(join(ut, 'forhandsvisning', `${m.id}.html`), m.html);
  for (const m of b.exempelExtra ?? []) writeFileSync(join(ut, 'forhandsvisning', `${m.id}.${m.kod}.html`), m.html);
  // Översättningarna (mejl_sprak) — det mejl/notis-oversattning.mjs registrerar i Shopify.
  for (const o of b.oversattningar ?? []) {
    mkdirSync(join(ut, 'oversattningar', o.locale), { recursive: true });
    for (const m of o.mallar) {
      writeFileSync(join(ut, 'oversattningar', o.locale, `${m.id}.liquid`), m.html);
      writeFileSync(join(ut, 'oversattningar', o.locale, `${m.id}.amne.txt`), `${m.amne}\n`);
    }
  }
  const prompt = coworkPrompt(b);
  writeFileSync(join(ut, 'COWORK-PROMPT.md'), prompt);
  // PROMPT.txt = bara delen under linjen, så Axel kan öppna råfilen, Ctrl+A, Ctrl+C och klistra in i Cowork.
  writeFileSync(join(ut, 'PROMPT.txt'), prompt.split('\n---\n').slice(1).join('\n---\n').replace(/^\n+/, ''));
  return { ...b, ut };
}

const arDirekt = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (arDirekt) {
  const args = process.argv.slice(2);
  const ids = args.includes('--alla')
    ? allaButiker().filter((x) => !x.standard).map((x) => x.id)
    : args.filter((a) => !a.startsWith('--'));
  if (!ids.length) {
    console.error('Ange butik-id (sparning/butiker.json) eller --alla.');
    process.exit(1);
  }
  for (const id of ids) {
    const b = skrivButik(id);
    console.log(`✅ ${b.reg.namn} (${b.sprak.kod}, ${b.reg.prefix}): ${b.liquid.map((m) => `${m.id} ${m.html.length} tecken`).join(', ')} → mejl/output/butiker/${id}/`);
  }
}
