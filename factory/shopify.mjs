// Shopify-kopplingen: officiella Admin GraphQL API:t via inbyggd fetch.
// Noll beroenden. Tokens läses ENBART ur miljön (factory/.env) — aldrig hårdkodade.
//
// Kräver:  SHOPIFY_STORE_DOMAIN  (ex: min-butik.myshopify.com)
//          SHOPIFY_ADMIN_TOKEN   (Admin API access token från en custom app)

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

export async function graphql(query, variables = {}) {
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
  return data.data;
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

// Läser en produkt via handle — används för att se vad som redan ligger uppe.
export async function hamtaProduktViaHandle(handle) {
  const data = await graphql(
    `query opsFactoryProdukt($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) {
        id legacyResourceId handle title status
        media(first: 1) { nodes { id } }
        variants(first: 50) { nodes { id title price compareAtPrice sku } }
      }
    }`,
    { handle }
  );
  return data.productByIdentifier ?? null;
}

// Skapar/uppdaterar hela produkten i ett anrop (productSet är idempotent på
// handle vid nykörning av samma fil). Produkten skapas som DRAFT — publiceras
// aldrig live av det här skriptet.
export async function skapaProdukt(input) {
  const mutation = `
    mutation opsFactoryProduktSet($input: ProductSetInput!) {
      productSet(input: $input, synchronous: true) {
        product { id legacyResourceId handle title status onlineStorePreviewUrl }
        userErrors { field message }
      }
    }`;
  const data = await graphql(mutation, { input });
  const fel = data.productSet?.userErrors ?? [];
  if (fel.length > 0) {
    throw new Error(
      `Shopify avvisade produkten:\n${fel.map((f) => `  • ${f.field?.join('.') ?? '?'}: ${f.message}`).join('\n')}`
    );
  }
  return data.productSet.product;
}

// Skriver en av butikens policyer (retur, frakt, köpvillkor).
// Policyer är inte publicering — de får finnas innan LAUNCH.
export async function skrivPolicy(type, body) {
  const data = await graphql(
    `mutation opsFactoryPolicy($shopPolicy: ShopPolicyInput!) {
      shopPolicyUpdate(shopPolicy: $shopPolicy) {
        shopPolicy { type }
        userErrors { field message }
      }
    }`,
    { shopPolicy: { type, body } }
  );
  const fel = data.shopPolicyUpdate?.userErrors ?? [];
  if (fel.length > 0) {
    throw new Error(`Kunde inte skriva ${type}: ${fel.map((f) => f.message).join('; ')}`);
  }
  return data.shopPolicyUpdate.shopPolicy;
}

// Skapar eller uppdaterar en vanlig sida (returpolicy, frakt, villkor, kontakt).
// Sidor är inte publicering av butiken — de får finnas innan LAUNCH.
export async function skrivSida(handle, title, body) {
  // pageByHandle togs bort ur Admin-API:t i 2025-07 (mätt 2026-09-09: fältet
  // finns inte på QueryRoot och hela sidsteget stannade). Slås upp med
  // pages(query:) i stället — samma svar, stöds i alla versioner vi kör.
  const befintlig = await graphql(
    `query opsFactorySida($fraga: String!) {
      pages(first: 1, query: $fraga) { nodes { id handle } }
    }`,
    { fraga: `handle:${handle}` }
  );
  const traff = (befintlig.pages?.nodes ?? []).find((n) => n.handle === handle) ?? null;

  if (traff?.id) {
    const data = await graphql(
      `mutation opsFactorySidaUppdatera($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) { page { id handle } userErrors { field message } }
      }`,
      { id: traff.id, page: { title, body } }
    );
    const fel = data.pageUpdate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`Kunde inte uppdatera sidan ${handle}: ${fel.map((f) => f.message).join('; ')}`);
    return data.pageUpdate.page;
  }

  const data = await graphql(
    `mutation opsFactorySidaSkapa($page: PageCreateInput!) {
      pageCreate(page: $page) { page { id handle } userErrors { field message } }
    }`,
    { page: { title, handle, body } }
  );
  const fel = data.pageCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Kunde inte skapa sidan ${handle}: ${fel.map((f) => f.message).join('; ')}`);
  return data.pageCreate.page;
}

// Skriver produktens opf-metafält. Sektionerna i temat läser dem.
export async function skrivMetafalt(produktId, falt) {
  if (falt.length === 0) return [];
  const data = await graphql(
    `mutation opsFactoryMetafalt($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { key }
        userErrors { field message }
      }
    }`,
    { metafields: falt.map((f) => ({ ...f, ownerId: produktId })) }
  );
  const fel = data.metafieldsSet?.userErrors ?? [];
  if (fel.length > 0) {
    throw new Error(`Metafält avvisades: ${fel.map((f) => f.message).join('; ')}`);
  }
  return data.metafieldsSet.metafields;
}

// Temat som sektionerna läggs i. Live-temat rörs ALDRIG — Shopify blockerar
// dessutom skrivningar mot MAIN. Saknas ett utkasttema returneras null.
// ⚠️ ANVÄND `hamtaArbetstema()` I NYA STEG, inte den här.
//
// "Utkasttemat" var en säker definition så länge OPS-temat alltid låg som
// utkast. I det ögonblick temat publiceras byter rollerna plats: OPS-temat
// blir MAIN och Shopifys default-tema (Horizon) blir UNPUBLISHED — och då
// pekar den här funktionen på DEFAULT-TEMAT. Mätt 2026-09-09 på DryTrek:
// efter publiceringen skrev startsidesteget mot Horizon och
// nb-registreringen hittade noll strängar.
export async function hamtaUtkastTema() {
  const data = await graphql(`
    query opsFactoryTeman { themes(first: 20) { nodes { id name role } } }`);
  const teman = data.themes?.nodes ?? [];
  return teman.find((t) => t.role === 'UNPUBLISHED') ?? null;
}

// Temat fabriken ska skriva i: OPS-temat, oavsett om det ligger som utkast
// eller är publicerat. Känns igen på namnet (byggs alltid som "<Brand> – CRO
// (utkast)"), med utkastet som reserv för en butik som ännu inte fått ett.
export async function hamtaArbetstema() {
  const data = await graphql(`
    query opsFactoryArbetstema { themes(first: 20) { nodes { id name role } } }`);
  const teman = data.themes?.nodes ?? [];
  const cro = teman.filter((t) => /\bcro\b/i.test(t.name));
  if (cro.length > 0) {
    // Är OPS-temat publicerat är det DET kunden ser — skriv där.
    return cro.find((t) => t.role === 'MAIN') ?? cro[0];
  }
  return teman.find((t) => t.role === 'UNPUBLISHED') ?? null;
}

export async function skrivTemafiler(temaId, filer) {
  const data = await graphql(
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
  );
  const fel = data.themeFilesUpsert?.userErrors ?? [];
  if (fel.length > 0) {
    throw new Error(`Temafiler avvisades: ${fel.map((f) => `${f.filename}: ${f.message}`).join('; ')}`);
  }
  return data.themeFilesUpsert.upsertedThemeFiles;
}

// Läser tillbaka uppladdade temafiler och jämför storleken i byte.
// Finns för att escaper kan förvanskas på vägen genom JSON till Shopifys API
// (en CSS-escape blev en gång dubblerad och renderades som text på sidan).
export async function verifieraTemafiler(temaId, filer) {
  const namn = Object.keys(filer);
  const data = await graphql(
    `query opsFactoryVerifiera($id: ID!, $filenames: [String!]) {
      theme(id: $id) { files(first: 50, filenames: $filenames) { nodes { filename size } } }
    }`,
    { id: temaId, filenames: namn }
  );
  const uppe = new Map((data.theme?.files?.nodes ?? []).map((f) => [f.filename, Number(f.size)]));
  const avvikande = [];
  for (const [filnamn, innehall] of Object.entries(filer)) {
    const forvantat = Buffer.byteLength(innehall, 'utf8');
    const faktiskt = uppe.get(filnamn);
    if (faktiskt === undefined) avvikande.push(`${filnamn}: saknas i temat`);
    else if (faktiskt !== forvantat) {
      avvikande.push(`${filnamn}: ${faktiskt} byte i temat, ${forvantat} lokalt`);
    }
  }
  return avvikande;
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

// Läser sidfotsmenyn. null om den inte finns.
export async function hamtaMeny(handle) {
  const data = await graphql(
    // Ingen $handle-variabel: menus() filtrerar inte på handle, listan gås
    // igenom nedan. Admin-API 2025-07 avvisar en deklarerad men oanvänd
    // variabel med "Variable $handle is declared but not used" (mätt
    // 2026-09-09) — tidigare versioner släppte igenom den.
    `query opsFactoryMeny {
      menus(first: 20) { nodes { id handle title items { title url } } }
    }`
  );
  return (data.menus?.nodes ?? []).find((m) => m.handle === handle) ?? null;
}

// Skapar eller uppdaterar en meny så att den innehåller exakt dessa länkar.
export async function skrivMeny(handle, title, lankar) {
  const items = lankar.map((l) => ({ title: l.titel, type: 'HTTP', url: l.url }));
  const befintlig = await hamtaMeny(handle);

  if (befintlig) {
    const har = new Set(befintlig.items.map((i) => `${i.title}|${i.url}`));
    const vill = new Set(lankar.map((l) => `${l.titel}|${l.url}`));
    const samma = har.size === vill.size && [...vill].every((x) => har.has(x));
    if (samma) return { ...befintlig, orord: true };
    const data = await graphql(
      `mutation opsFactoryMenyUppdatera($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
        menuUpdate(id: $id, title: $title, items: $items) {
          menu { id handle }
          userErrors { field message }
        }
      }`,
      { id: befintlig.id, title, items }
    );
    const fel = data.menuUpdate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`Menyn ${handle}: ${fel.map((f) => f.message).join('; ')}`);
    return data.menuUpdate.menu;
  }

  const data = await graphql(
    `mutation opsFactoryMenySkapa($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
      menuCreate(title: $title, handle: $handle, items: $items) {
        menu { id handle }
        userErrors { field message }
      }
    }`,
    { title, handle, items }
  );
  const fel = data.menuCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Menyn ${handle}: ${fel.map((f) => f.message).join('; ')}`);
  return data.menuCreate.menu;
}

// Läser fraktzonerna i den form frakt.mjs jämför mot.
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
  const profil = data.deliveryProfiles?.nodes?.[0];
  if (!profil) return null;
  const grupp = profil.profileLocationGroups?.[0];
  return {
    profilId: profil.id,
    gruppId: grupp?.locationGroup?.id,
    // ⚠️ En färsk butik kan ha villkorade fraktrader ("fri frakt över X").
    // Shopify returnerar dem som EXTRA metodrader vars id är basmetodens id
    // med "?source=RateRangeCondition&source_id=…" på slutet — samma metod,
    // en gång per villkor. Försöker man uppdatera basmetoden svarar API:t
    // "cannot be updated because it uses new configurations that are only
    // available through Shopify's updated APIs" (mätt 2026-09-09 på DryTrek,
    // Sverige-zonens "Normal" 65 kr med en 0-krona-rad över ett belopp).
    // Därför: släpp de syntetiska raderna, och märk basmetoden `villkorad`
    // så den raderas och byggs om i stället för att uppdateras.
    zoner: (grupp?.locationGroupZones?.nodes ?? []).map((z) => {
      const rader = z.methodDefinitions?.nodes ?? [];
      const basId = (id) => String(id).split('?')[0];
      const villkorade = new Set(
        rader.filter((m) => String(m.id).includes('?source=')).map((m) => basId(m.id))
      );
      return {
        zonId: z.zone.id,
        zon: z.zone.name,
        metoder: rader
          .filter((m) => !String(m.id).includes('?source='))
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

// Utför skillnaden som frakt.mjs räknat fram. Rör bara det som avviker.
export async function tillampaFraktatgarder(fraktlage, atgarder) {
  if (atgarder.orort) return { andrade: 0 };
  const zonId = new Map(fraktlage.zoner.map((z) => [z.zon, z.zonId]));

  const perZon = new Map();
  const zonPost = (zon) => {
    if (!perZon.has(zon)) perZon.set(zon, { id: zonId.get(zon), skapa: [], uppdatera: [] });
    return perZon.get(zon);
  };
  for (const u of atgarder.attUppdatera) {
    zonPost(u.zon).uppdatera.push({
      id: u.id,
      name: u.metod.namn,
      active: true,
      rateDefinition: {
        ...(u.rateId ? { id: u.rateId } : {}),
        price: { amount: u.metod.pris.toFixed(1), currencyCode: u.metod.valuta },
      },
    });
  }
  for (const s of atgarder.attSkapa) {
    zonPost(s.zon).skapa.push({
      name: s.metod.namn,
      active: true,
      rateDefinition: { price: { amount: s.metod.pris.toFixed(1), currencyCode: s.metod.valuta } },
    });
  }

  const profile = {
    methodDefinitionsToDelete: atgarder.attTaBort.map((x) => x.id),
    locationGroupsToUpdate: [
      {
        id: fraktlage.gruppId,
        zonesToUpdate: [...perZon.values()]
          .filter((z) => z.id)
          .map((z) => ({
            id: z.id,
            ...(z.uppdatera.length > 0 ? { methodDefinitionsToUpdate: z.uppdatera } : {}),
            ...(z.skapa.length > 0 ? { methodDefinitionsToCreate: z.skapa } : {}),
          })),
      },
    ],
  };

  const data = await graphql(
    `mutation opsFactoryFraktUppdatera($id: ID!, $profile: DeliveryProfileInput!) {
      deliveryProfileUpdate(id: $id, profile: $profile) {
        profile { id }
        userErrors { field message }
      }
    }`,
    { id: fraktlage.profilId, profile }
  );
  const fel = data.deliveryProfileUpdate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Frakten: ${fel.map((f) => f.message).join('; ')}`);
  return {
    andrade:
      atgarder.attUppdatera.length + atgarder.attSkapa.length + atgarder.attTaBort.length,
  };
}

// ---- Nedanstående körs ENBART av LAUNCH. Aldrig av BUILD. ----

// Sätter produkten ACTIVE och publicerar den i Online Store-kanalen.
// Saknas scopet read_publications rapporteras det i stället för att krascha.
export async function publiceraProdukt(produktId) {
  const uppdatering = await graphql(
    `mutation opsFactoryAktivera($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id status }
        userErrors { field message }
      }
    }`,
    { input: { id: produktId, status: 'ACTIVE' } }
  );
  const fel = uppdatering.productUpdate?.userErrors ?? [];
  if (fel.length > 0) {
    throw new Error(`Kunde inte aktivera produkten: ${fel.map((f) => f.message).join('; ')}`);
  }

  let kanal = null;
  try {
    const pub = await graphql(`
      query opsFactoryKanaler { publications(first: 20) { nodes { id name } } }`);
    kanal = (pub.publications?.nodes ?? []).find((k) => /online store/i.test(k.name)) ?? null;
  } catch (e) {
    return { status: 'ACTIVE', publicerad: false, notis: `Kanalen kunde inte läsas: ${e.message}` };
  }
  if (!kanal) {
    return { status: 'ACTIVE', publicerad: false, notis: 'Online Store-kanalen hittades inte.' };
  }

  const publicering = await graphql(
    `mutation opsFactoryPublicera($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }`,
    { id: produktId, input: [{ publicationId: kanal.id }] }
  );
  const pubFel = publicering.publishablePublish?.userErrors ?? [];
  if (pubFel.length > 0) {
    return { status: 'ACTIVE', publicerad: false, notis: pubFel.map((f) => f.message).join('; ') };
  }
  return { status: 'ACTIVE', publicerad: true, kanal: kanal.name };
}
