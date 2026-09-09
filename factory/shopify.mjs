// Shopify-kopplingen: officiella Admin GraphQL API:t via inbyggd fetch.
// Noll beroenden. Tokens läses ENBART ur miljön (factory/.env) — aldrig hårdkodade.
//
// Kräver:  SHOPIFY_STORE_DOMAIN  (ex: min-butik.myshopify.com)
//          SHOPIFY_ADMIN_TOKEN   (Admin API access token från en custom app)
//
// Exportkontraktet står i factory/KEDJAN.md. Det här är EN modul för alla
// Admin-anrop (produkt, sidor, meny, kollektion, teman, frakt, metafält) —
// förenad 2026-09-09 ur tre grenar (TackleBay, DryTrek, TankGuard). De rena
// hjälparna (`valjArbetstema`, `matchaProduktfiler`, `tolkaFraktprofil`,
// `byggFraktprofilInput`, `hittaUserErrors`, `filstamUrUrl`) är exporterade
// så logiken går att testa utan nätverk.

const API_VERSION = () => process.env.SHOPIFY_API_VERSION || '2025-07';

export function kravEnv() {
  const saknas = ['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_ADMIN_TOKEN'].filter(
    (n) => !process.env[n]
  );
  if (saknas.length > 0) {
    throw new Error(
      `Saknade miljövariabler: ${saknas.join(', ')}. ` +
        'Kopiera factory/.env.example till factory/.env och fyll i.'
    );
  }
}

// ---- userErrors: ett ställe som kastar, så inget steg kan svälja dem ----
//
// Varje mutation i Admin-API:t lägger sina fel i `userErrors` på payloaden
// (toppnivån i `data`). Hittas en icke-tom sådan kastar `graphql` — anroparen
// behöver inte kolla själv. Fältet kan heta `field` (de flesta), `filename`
// (themeFilesUpsert) eller bära en `code` (rabattkoder).
export function hittaUserErrors(data) {
  const ut = [];
  if (!data || typeof data !== 'object') return ut;
  for (const [operation, payload] of Object.entries(data)) {
    const fel = payload?.userErrors;
    if (!Array.isArray(fel) || fel.length === 0) continue;
    for (const f of fel) {
      const falt = Array.isArray(f.field) ? f.field.join('.') : f.field ?? f.filename ?? null;
      ut.push({ operation, falt, kod: f.code ?? null, meddelande: f.message ?? String(f) });
    }
  }
  return ut;
}

const felText = (fel) =>
  fel.map((f) => `  • ${f.operation}${f.falt ? ` (${f.falt})` : ''}: ${f.meddelande}`).join('\n');

// Kör en fråga eller mutation. Kastar på HTTP-fel, GraphQL-fel och userErrors.
// `tillatUserErrors: true` stänger av den sista spärren — för en anropare som
// själv vill läsa userErrors ur svaret (t.ex. en granskning som bokför dem).
export async function graphql(query, variables = {}, { tillatUserErrors = false } = {}) {
  kravEnv();
  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION()}/graphql.json`;
  const svar = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!svar.ok) {
    throw new Error(`Shopify svarade ${svar.status}: ${(await svar.text()).slice(0, 500)}`);
  }
  const data = await svar.json();
  if (data.errors) {
    throw new Error(`GraphQL-fel: ${JSON.stringify(data.errors).slice(0, 500)}`);
  }
  if (!tillatUserErrors) {
    const fel = hittaUserErrors(data.data);
    if (fel.length > 0) throw new Error(`Shopify avvisade anropet:\n${felText(fel)}`);
  }
  return data.data;
}

// Ger ett fel ett svenskt sammanhang ("Kunde inte skapa sidan frakt: …") utan
// att tappa Shopifys ursprungliga text.
async function medKontext(text, fn) {
  try {
    return await fn();
  } catch (e) {
    throw new Error(`${text}: ${e.message}`);
  }
}

// Connection-check: läser butikens grunddata. Går det igenom är kopplingen grön.
export async function kontrolleraAnslutning() {
  const data = await graphql(`
    query opsFactoryButik {
      shop {
        name
        myshopifyDomain
        currencyCode
        primaryDomain { url host sslEnabled }
        shopPolicies { type body }
      }
    }`);
  return data.shop;
}

// ---- Produkten ----

// Filnamnet i en URL: 'https://cdn/x/Foto%20A.jpg?v=1' → 'Foto A.jpg'.
export function filnamnUrUrl(url) {
  const sista = String(url ?? '').split('?')[0].split('#')[0].split('/').pop() ?? '';
  try {
    return decodeURIComponent(sista);
  } catch {
    return sista;
  }
}

// Filstammen — det Shopify matchar en uppladdad bild på. Shopify skriver om
// namnet vid uppladdning (gemener, mellanslag och specialtecken blir `_`) och
// lägger ett `_<suffix>` när namnet redan är upptaget, så jämförelsen görs
// på normaliserad stam utan ändelse.
export function filstamUrUrl(url) {
  return filnamnUrUrl(url)
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '_');
}

function tolkaMedia(media) {
  return (media?.nodes ?? []).map((m) => {
    const url = m.image?.url ?? null;
    return {
      id: m.id,
      filnamn: url ? filnamnUrUrl(url) : null,
      filstam: url ? filstamUrUrl(url) : null,
    };
  });
}

// Läser en produkt via handle — används för att se vad som redan ligger uppe.
// Svarar { id, status, handle, title, media:[{ id, filnamn, filstam }],
// variants } eller null. Media-listan gör productSet idempotent (se nedan).
export async function hamtaProduktViaHandle(handle) {
  const data = await graphql(
    `query opsFactoryProdukt($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) {
        id legacyResourceId handle title status
        media(first: 50) { nodes { id ... on MediaImage { image { url } } } }
        variants(first: 50) { nodes { id title price compareAtPrice sku } }
      }
    }`,
    { handle }
  );
  const p = data.productByIdentifier;
  if (!p) return null;
  return { ...p, media: tolkaMedia(p.media) };
}

// Byter ut nya filreferenser mot befintliga media-id:n när samma bild redan
// ligger i galleriet (matchat på filstam, med Shopifys `_suffix` inräknat).
// Då uppdateras alt-texten i stället för att bilden laddas upp en gång till.
// Varje media-id används högst en gång.
export function matchaProduktfiler(files, media) {
  if (!Array.isArray(files)) return files;
  const lediga = (media ?? []).filter((m) => m.filstam);
  const anvanda = new Set();
  return files.map((f) => {
    if (!f || f.id || !f.originalSource) return f;
    const stam = filstamUrUrl(f.originalSource);
    if (!stam) return f;
    const traff = lediga.find(
      (m) => !anvanda.has(m.id) && (m.filstam === stam || m.filstam.startsWith(`${stam}_`))
    );
    if (!traff) return f;
    anvanda.add(traff.id);
    return { id: traff.id, ...(f.alt !== undefined ? { alt: f.alt } : {}) };
  });
}

// Skapar eller uppdaterar hela produkten i ett anrop. Idempotent på handle:
// productSet utan id försöker SKAPA och svarar "Handle already in use" vid
// omkörning (mätt 2026-09-08 och 2026-09-09) — därför slås produkten upp
// först och får sitt id, och befintliga galleribilder refereras med media-id.
//
// Statusen bevaras vid omkörning: finns produkten behålls den status den har
// i butiken (har Axel satt DRAFT är det ett beslut). `status` i andra
// argumentet tvingar en status, `id` hoppar över uppslagningen på handle.
// Svarar { id, handle, status, variantIds, … }.
export async function skapaProdukt(input, { id = null, status = null } = {}) {
  const befintlig = input?.handle ? await hamtaProduktViaHandle(input.handle) : null;
  const produktId = id ?? input?.id ?? befintlig?.id ?? null;
  const slutStatus = status ?? befintlig?.status ?? input?.status ?? null;

  const sammansatt = { ...input };
  if (produktId) sammansatt.id = produktId;
  if (slutStatus) sammansatt.status = slutStatus;
  if (befintlig) sammansatt.files = matchaProduktfiler(sammansatt.files, befintlig.media);

  const data = await medKontext('Shopify avvisade produkten', () =>
    graphql(
      `mutation opsFactoryProduktSet($input: ProductSetInput!) {
        productSet(input: $input, synchronous: true) {
          product {
            id legacyResourceId handle title status onlineStorePreviewUrl
            variants(first: 50) { nodes { id } }
          }
          userErrors { field message }
        }
      }`,
      { input: sammansatt }
    )
  );
  const produkt = data.productSet?.product;
  if (!produkt) throw new Error('Shopify svarade utan produkt på productSet.');
  const { variants, ...rest } = produkt;
  return { ...rest, variantIds: (variants?.nodes ?? []).map((v) => v.id) };
}

// ---- Policyer, sidor, metafält ----

// Skriver en av butikens policyer (retur, frakt, köpvillkor).
// Policyer är inte publicering — de får finnas innan LAUNCH.
export async function skrivPolicy(type, body) {
  const data = await medKontext(`Kunde inte skriva ${type}`, () =>
    graphql(
      `mutation opsFactoryPolicy($shopPolicy: ShopPolicyInput!) {
        shopPolicyUpdate(shopPolicy: $shopPolicy) {
          shopPolicy { type }
          userErrors { field message }
        }
      }`,
      { shopPolicy: { type, body } }
    )
  );
  return data.shopPolicyUpdate.shopPolicy;
}

// Skapar eller uppdaterar en vanlig sida (returpolicy, frakt, villkor, kontakt).
// Anropas `skrivSida(handle, { title, body })` (kontraktet) eller
// `skrivSida(handle, title, body)` (äldre form) — båda fungerar.
// Sidor är inte publicering av butiken — de får finnas innan LAUNCH.
export async function skrivSida(handle, titleEllerSida, body) {
  const sida =
    titleEllerSida && typeof titleEllerSida === 'object'
      ? { title: titleEllerSida.title ?? titleEllerSida.titel, body: titleEllerSida.body }
      : { title: titleEllerSida, body };

  // `pageByHandle` togs bort ur QueryRoot i 2025-07 (mätt 2026-09-08 på
  // TankGuard och 2026-09-09 på DryTrek/TackleBay: hela sidsteget stannade).
  // Sidan slås upp med en sökfråga mot `pages` och matchas EXAKT på handle —
  // sökningen kan ge prefixträffar, därför tas tio och rätt plockas ut.
  const befintlig = await graphql(
    `query opsFactorySida($q: String!) {
      pages(first: 10, query: $q) { nodes { id handle } }
    }`,
    { q: `handle:${handle}` }
  );
  const traff = (befintlig.pages?.nodes ?? []).find((s) => s.handle === handle) ?? null;

  if (traff?.id) {
    const data = await medKontext(`Kunde inte uppdatera sidan ${handle}`, () =>
      graphql(
        `mutation opsFactorySidaUppdatera($id: ID!, $page: PageUpdateInput!) {
          pageUpdate(id: $id, page: $page) { page { id handle } userErrors { field message } }
        }`,
        { id: traff.id, page: sida }
      )
    );
    return data.pageUpdate.page;
  }

  const data = await medKontext(`Kunde inte skapa sidan ${handle}`, () =>
    graphql(
      `mutation opsFactorySidaSkapa($page: PageCreateInput!) {
        pageCreate(page: $page) { page { id handle } userErrors { field message } }
      }`,
      { page: { ...sida, handle } }
    )
  );
  return data.pageCreate.page;
}

// Skriver metafält på en ägare (produkt, variant, butik …). Sektionerna i
// temat läser produktens opf-fält.
export async function skrivMetafalt(agareId, falt) {
  if (!Array.isArray(falt) || falt.length === 0) return [];
  const data = await medKontext('Metafält avvisades', () =>
    graphql(
      `mutation opsFactoryMetafalt($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { key }
          userErrors { field message }
        }
      }`,
      { metafields: falt.map((f) => ({ ...f, ownerId: agareId })) }
    )
  );
  return data.metafieldsSet.metafields;
}

// ---- Teman ----

async function hamtaTeman() {
  const data = await graphql(`
    query opsFactoryTeman { themes(first: 50) { nodes { id name role } } }`);
  return data.themes?.nodes ?? [];
}

// Temat som sektionerna läggs i. Saknas ett utkasttema returneras null.
// ⚠️ ANVÄND `hamtaArbetstema()` I KEDJAN, inte den här (KEDJAN.md regel 1).
//
// "Utkasttemat" var en säker definition så länge OPS-temat alltid låg som
// utkast. I det ögonblick temat publiceras byter rollerna plats: OPS-temat
// blir MAIN och Shopifys default-tema (Horizon) blir UNPUBLISHED — och då
// pekar den här funktionen på DEFAULT-TEMAT. Mätt 2026-09-08 på TankGuard
// och 2026-09-09 på DryTrek: startsidesteget skrev mot Horizon och
// nb-registreringen hittade noll strängar. Behålls bara för äldre anrop.
export async function hamtaUtkastTema() {
  const teman = await hamtaTeman();
  return teman.find((t) => t.role === 'UNPUBLISHED') ?? null;
}

const CRO = /\bcro\b/i;
const numeriskt = (gid) => String(gid ?? '').split('/').pop();

// Ren logik bakom hamtaArbetstema: id först (fullt gid eller bara numret),
// annars CRO-temat som är MAIN, annars CRO-temat som är UNPUBLISHED, annars null.
export function valjArbetstema(teman, temaId = null) {
  const lista = Array.isArray(teman) ? teman : [];
  if (temaId) {
    const eget = lista.find((t) => t.id === temaId || numeriskt(t.id) === numeriskt(temaId));
    if (eget) return eget;
  }
  const cro = lista.filter((t) => CRO.test(String(t.name ?? '')));
  return (
    cro.find((t) => t.role === 'MAIN') ??
    cro.find((t) => t.role === 'UNPUBLISHED') ??
    null
  );
}

// Arbetstemat = det tema fabriken själv byggde. Id:t står i state
// (`arbetstemaId`, skrivet av tema-upload) och vinner alltid. Saknas id, eller
// finns temat inte längre, känns OPS-temat igen på "CRO" i namnet — publicerat
// (MAIN) först, för då är det DET kunden ser. Hittas inget kastar funktionen:
// att gissa "första UNPUBLISHED" är det som skrev mot fel tema (se ovan).
// API:t skriver fint mot MAIN (verifierat 2026-09-08) — under trialen skyddar
// lösenordssidan kunden.
export async function hamtaArbetstema(temaId = null) {
  const teman = await hamtaTeman();
  const tema = valjArbetstema(teman, temaId);
  if (tema) return tema;
  const lista = teman.map((t) => `${t.name} (${t.role}, ${numeriskt(t.id)})`).join(', ') || 'inga teman';
  throw new Error(
    `Hittar inget arbetstema${temaId ? ` (id ${numeriskt(temaId)} finns inte)` : ''} och inget CRO-tema. ` +
      `Teman i butiken: ${lista}. Kör tema-upload först.`
  );
}

export async function skrivTemafiler(temaId, filer) {
  const data = await medKontext('Temafiler avvisades', () =>
    graphql(
      `mutation opsFactoryTemafiler($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: $themeId, files: $files) {
          upsertedThemeFiles { filename }
          userErrors { filename message }
        }
      }`,
      {
        themeId: temaId,
        files: Object.entries(filer).map(([filename, value]) => ({
          filename,
          body: { type: 'TEXT', value },
        })),
      }
    )
  );
  return data.themeFilesUpsert.upsertedThemeFiles;
}

// Läser tillbaka uppladdade temafiler och jämför storleken i byte.
// Finns för att escaper kan förvanskas på vägen genom JSON till Shopifys API
// (en CSS-escape blev en gång dubblerad och renderades som text på sidan).
//
// Svarar { ok, fel:[] } enligt kontraktet. Objektet ÄR samtidigt fel-listan
// (en array med `ok` och `fel` som egenskaper), så äldre anrop som mäter
// `avvikande.length` / `avvikande.join` fortsätter att stoppa på avvikelse i
// stället för att tyst bli gröna under övergången.
export async function verifieraTemafiler(temaId, filer) {
  const namn = Object.keys(filer);
  const data = await graphql(
    `query opsFactoryVerifiera($id: ID!, $filenames: [String!]) {
      theme(id: $id) { files(first: 50, filenames: $filenames) { nodes { filename size } } }
    }`,
    { id: temaId, filenames: namn }
  );
  const uppe = new Map((data.theme?.files?.nodes ?? []).map((f) => [f.filename, Number(f.size)]));
  const fel = [];
  for (const [filnamn, innehall] of Object.entries(filer)) {
    const forvantat = Buffer.byteLength(innehall, 'utf8');
    const faktiskt = uppe.get(filnamn);
    if (faktiskt === undefined) fel.push(`${filnamn}: saknas i temat`);
    else if (faktiskt !== forvantat) {
      fel.push(`${filnamn}: ${faktiskt} byte i temat, ${forvantat} lokalt`);
    }
  }
  return Object.assign([...fel], { ok: fel.length === 0, fel });
}

export async function hamtaTemafil(temaId, filnamn) {
  const data = await graphql(
    `query opsFactoryTemafil($id: ID!, $filenames: [String!]) {
      theme(id: $id) {
        files(first: 1, filenames: $filenames) {
          nodes { body { ... on OnlineStoreThemeFileBodyText { content } } }
        }
      }
    }`,
    { id: temaId, filenames: [filnamn] }
  );
  return data.theme?.files?.nodes?.[0]?.body?.content ?? null;
}

// ---- Menyer ----

// Läser en meny på handle. null om den inte finns.
export async function hamtaMeny(handle) {
  // Ingen variabel i frågan: menus() filtrerar inte på handle, listan gås
  // igenom här. Admin-API 2025-07 avvisar en deklarerad men oanvänd variabel
  // ("Variable $handle is declared but not used", mätt 2026-09-08/09) —
  // tidigare versioner släppte igenom den.
  const data = await graphql(`
    query opsFactoryMeny {
      menus(first: 50) { nodes { id handle title items { title url } } }
    }`);
  return (data.menus?.nodes ?? []).find((m) => m.handle === handle) ?? null;
}

const MENYTITLAR = { 'main-menu': 'Main menu', footer: 'Footer menu' };
const menytitel = (handle) =>
  MENYTITLAR[handle] ?? String(handle).replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

// Menyrader tål både { titel, url } (fabrikens form) och { title, url }.
export function tolkaMenyrader(rader) {
  return (rader ?? []).map((l) => ({ titel: l.titel ?? l.title, url: l.url }));
}

// Skapar eller uppdaterar en meny så att den innehåller exakt dessa länkar.
// Anropas `skrivMeny(handle, rader)` (kontraktet, titeln härleds ur handle)
// eller `skrivMeny(handle, title, rader)` (äldre form).
export async function skrivMeny(handle, titleEllerRader, lankar) {
  const rader = tolkaMenyrader(Array.isArray(titleEllerRader) ? titleEllerRader : lankar);
  const title = Array.isArray(titleEllerRader) ? menytitel(handle) : titleEllerRader ?? menytitel(handle);
  const items = rader.map((l) => ({ title: l.titel, type: 'HTTP', url: l.url }));
  const befintlig = await hamtaMeny(handle);

  if (befintlig) {
    const har = new Set(befintlig.items.map((i) => `${i.title}|${i.url}`));
    const vill = new Set(rader.map((l) => `${l.titel}|${l.url}`));
    const samma = har.size === vill.size && [...vill].every((x) => har.has(x));
    if (samma) return { ...befintlig, orord: true };
    const data = await medKontext(`Menyn ${handle}`, () =>
      graphql(
        `mutation opsFactoryMenyUppdatera($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
          menuUpdate(id: $id, title: $title, items: $items) {
            menu { id handle }
            userErrors { field message }
          }
        }`,
        { id: befintlig.id, title, items }
      )
    );
    return data.menuUpdate.menu;
  }

  const data = await medKontext(`Menyn ${handle}`, () =>
    graphql(
      `mutation opsFactoryMenySkapa($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
        menuCreate(title: $title, handle: $handle, items: $items) {
          menu { id handle }
          userErrors { field message }
        }
      }`,
      { title, handle, items }
    )
  );
  return data.menuCreate.menu;
}

// ---- Kollektionen: butikens sortiment, startsidans `sortiment`-sektion ----
//
// En flerproduktsbutik visar en KOLLEKTION på startsidan i stället för en
// enskild produkt (factory/FLERPRODUKT.md). Kollektionen är manuell — inga
// regler — så ordningen är den fabriken sätter, inte Shopifys gissning.

export async function hamtaKollektion(handle) {
  const data = await graphql(
    `query opsFactoryKollektion($q: String!) {
      collections(first: 10, query: $q) { nodes { id handle title } }
    }`,
    { q: `handle:${handle}` }
  );
  return (data.collections?.nodes ?? []).find((k) => k.handle === handle) ?? null;
}

// Anropas `skrivKollektion({ handle, titel, produktIds, beskrivning })`
// (kontraktet) eller `skrivKollektion(handle, titel, produktIds, beskrivning)`.
export async function skrivKollektion(handleEllerInput, titel, produktIds, beskrivning = '') {
  const k =
    handleEllerInput && typeof handleEllerInput === 'object'
      ? {
          handle: handleEllerInput.handle,
          titel: handleEllerInput.titel ?? handleEllerInput.title,
          produktIds: handleEllerInput.produktIds ?? handleEllerInput.products ?? [],
          beskrivning: handleEllerInput.beskrivning ?? handleEllerInput.descriptionHtml ?? '',
        }
      : { handle: handleEllerInput, titel, produktIds: produktIds ?? [], beskrivning };
  const befintlig = await hamtaKollektion(k.handle);
  const input = {
    handle: k.handle,
    title: k.titel,
    descriptionHtml: k.beskrivning,
    products: k.produktIds,
    sortOrder: 'MANUAL',
  };

  if (befintlig) {
    const data = await medKontext(`Kollektionen ${k.handle}`, () =>
      graphql(
        `mutation opsFactoryKollektionUppdatera($input: CollectionInput!) {
          collectionUpdate(input: $input) {
            collection { id handle title }
            userErrors { field message }
          }
        }`,
        { input: { ...input, id: befintlig.id } }
      )
    );
    return { ...data.collectionUpdate.collection, skapad: false };
  }

  const data = await medKontext(`Kollektionen ${k.handle}`, () =>
    graphql(
      `mutation opsFactoryKollektionSkapa($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection { id handle title }
          userErrors { field message }
        }
      }`,
      { input }
    )
  );
  return { ...data.collectionCreate.collection, skapad: true };
}

// ---- Publicering i Online Store ----

async function hamtaOnlineStoreKanal() {
  const pub = await graphql(`
    query opsFactoryKanaler { publications(first: 20) { nodes { id name } } }`);
  return (pub.publications?.nodes ?? []).find((k) => /online store/i.test(k.name)) ?? null;
}

// Publicerar vad som helst publicerbart (produkt, kollektion) i Online Store.
// Utan det syns kollektionen inte i kundvyn ens när den finns. Kastar aldrig —
// saknas kanalen eller scopet rapporteras det som { publicerad:false, notis }.
export async function publiceraIButiken(id) {
  try {
    const kanal = await hamtaOnlineStoreKanal();
    if (!kanal) return { publicerad: false, notis: 'Online Store-kanalen hittades inte.' };
    await graphql(
      `mutation opsFactoryPublicera($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) { userErrors { field message } }
      }`,
      { id, input: [{ publicationId: kanal.id }] }
    );
    return { publicerad: true, kanal: kanal.name };
  } catch (e) {
    return { publicerad: false, notis: e.message };
  }
}

// ---- Frakt ----

// Ren logik bakom hamtaFraktzoner: gör om en deliveryProfile-nod till den
// form frakt.mjs jämför mot.
//
// ⚠️ En färsk butik kan ha villkorade fraktrader ("fri frakt över X").
// Shopify returnerar dem som EXTRA metodrader vars id är basmetodens id med
// "?source=RateRangeCondition&source_id=…" på slutet — samma metod, en gång
// per villkor. De kan varken uppdateras eller raderas själva ("could not be
// found", mätt 2026-09-08), och basmetoden går inte att UPPDATERA via
// deliveryProfileUpdate ("cannot be updated because it uses new
// configurations that are only available through Shopify's updated APIs",
// mätt 2026-09-08 på TankGuard och 2026-09-09 på DryTrek). Därför: släpp de
// syntetiska raderna och märk basmetoden `villkorad`, så frakt.mjs river
// och bygger om den i stället för att uppdatera.
export function tolkaFraktprofil(profil) {
  if (!profil) return null;
  const grupp = profil.profileLocationGroups?.[0];
  const basId = (id) => String(id).split('?')[0];
  const arVillkorsrad = (m) => String(m.id).includes('?source=');
  return {
    profilId: profil.id,
    gruppId: grupp?.locationGroup?.id,
    zoner: (grupp?.locationGroupZones?.nodes ?? []).map((z) => {
      const rader = z.methodDefinitions?.nodes ?? [];
      const villkorade = new Set(rader.filter(arVillkorsrad).map((m) => basId(m.id)));
      return {
        zonId: z.zone.id,
        zon: z.zone.name,
        metoder: rader
          .filter((m) => !arVillkorsrad(m))
          .map((m) => ({
            id: m.id,
            namn: m.name,
            pris: Number(m.rateProvider?.price?.amount ?? 0),
            rateId: m.rateProvider?.id ?? null,
            villkorad: villkorade.has(basId(m.id)),
          })),
      };
    }),
  };
}

// Läser fraktzonerna i den form frakt.mjs jämför mot. null utan fraktprofil.
export async function hamtaFraktzoner() {
  const data = await graphql(`
    query opsFactoryFrakt {
      deliveryProfiles(first: 5) {
        nodes {
          id
          profileLocationGroups {
            locationGroup { id }
            locationGroupZones(first: 10) {
              nodes {
                zone { id name }
                methodDefinitions(first: 10) {
                  nodes {
                    id name active
                    rateProvider { ... on DeliveryRateDefinition { id price { amount } } }
                  }
                }
              }
            }
          }
        }
      }
    }`);
  return tolkaFraktprofil(data.deliveryProfiles?.nodes?.[0] ?? null);
}

// Ren logik bakom tillampaFraktatgarder: åtgärderna ur frakt.mjs →
// DeliveryProfileInput. Villkorade metoder står i attTaBort + attSkapa
// (rivs och byggs om i samma anrop); bara zoner med något att göra tas med.
export function byggFraktprofilInput(fraktlage, atgarder) {
  const zonId = new Map((fraktlage?.zoner ?? []).map((z) => [z.zon, z.zonId]));
  const pris = (metod) => ({
    price: { amount: Number(metod.pris).toFixed(1), currencyCode: metod.valuta },
  });

  const perZon = new Map();
  const zonPost = (zon) => {
    if (!perZon.has(zon)) perZon.set(zon, { id: zonId.get(zon), skapa: [], uppdatera: [] });
    return perZon.get(zon);
  };
  for (const u of atgarder.attUppdatera ?? []) {
    zonPost(u.zon).uppdatera.push({
      id: u.id,
      name: u.metod.namn,
      active: true,
      rateDefinition: { ...(u.rateId ? { id: u.rateId } : {}), ...pris(u.metod) },
    });
  }
  for (const s of atgarder.attSkapa ?? []) {
    zonPost(s.zon).skapa.push({ name: s.metod.namn, active: true, rateDefinition: pris(s.metod) });
  }

  return {
    methodDefinitionsToDelete: (atgarder.attTaBort ?? []).map((x) => x.id),
    locationGroupsToUpdate: [
      {
        id: fraktlage.gruppId,
        zonesToUpdate: [...perZon.values()]
          .filter((z) => z.id && (z.uppdatera.length > 0 || z.skapa.length > 0))
          .map((z) => ({
            id: z.id,
            ...(z.uppdatera.length > 0 ? { methodDefinitionsToUpdate: z.uppdatera } : {}),
            ...(z.skapa.length > 0 ? { methodDefinitionsToCreate: z.skapa } : {}),
          })),
      },
    ],
  };
}

// Utför skillnaden som frakt.mjs räknat fram. Rör bara det som avviker.
// Anropas `tillampaFraktatgarder(atgarder)` (kontraktet — läget läses då
// här) eller `tillampaFraktatgarder(fraktlage, atgarder)` (äldre form).
export async function tillampaFraktatgarder(fraktlageEllerAtgarder, kanskeAtgarder) {
  const atgarder = kanskeAtgarder ?? fraktlageEllerAtgarder;
  if (!atgarder || atgarder.orort) return { andrade: 0 };
  const fraktlage = kanskeAtgarder ? fraktlageEllerAtgarder : await hamtaFraktzoner();
  if (!fraktlage) throw new Error('Ingen fraktprofil hittades i butiken.');

  const profile = byggFraktprofilInput(fraktlage, atgarder);
  await medKontext('Frakten', () =>
    graphql(
      `mutation opsFactoryFraktUppdatera($id: ID!, $profile: DeliveryProfileInput!) {
        deliveryProfileUpdate(id: $id, profile: $profile) {
          profile { id }
          userErrors { field message }
        }
      }`,
      { id: fraktlage.profilId, profile }
    )
  );
  return {
    andrade:
      (atgarder.attUppdatera?.length ?? 0) +
      (atgarder.attSkapa?.length ?? 0) +
      (atgarder.attTaBort?.length ?? 0),
  };
}

// ---- Nedanstående körs ENBART av LAUNCH. Aldrig av BUILD. ----

// Sätter produkten ACTIVE och publicerar den i Online Store-kanalen.
// Saknas scopet read_publications rapporteras det i stället för att krascha.
export async function publiceraProdukt(produktId) {
  await medKontext('Kunde inte aktivera produkten', () =>
    graphql(
      `mutation opsFactoryAktivera($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id status }
          userErrors { field message }
        }
      }`,
      { input: { id: produktId, status: 'ACTIVE' } }
    )
  );
  const pub = await publiceraIButiken(produktId);
  return { status: 'ACTIVE', ...pub };
}
