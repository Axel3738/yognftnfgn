// Tunn klient mot Shopify Admin GraphQL. Inga beroenden — inbyggda fetch.
// Hanterar Shopifys två sätt att säga nej: HTTP 429 och THROTTLED i svaret.

import { API_VERSION, referenser, BUTIKER } from './butiker.mjs';

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

export class Butik {
  constructor(nyckel) {
    const { shop, token } = referenser(nyckel);
    this.nyckel = nyckel;
    this.konfig = BUTIKER[nyckel];
    this.url = `https://${shop}/admin/api/${API_VERSION}/graphql.json`;
    this.token = token;
  }

  async fraga(query, variables = {}, forsok = 0) {
    let svar;
    try {
      svar = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.token,
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch (e) {
      if (forsok < 4) {
        await sov(2000 * 2 ** forsok);
        return this.fraga(query, variables, forsok + 1);
      }
      throw new Error(`${this.konfig.namn}: nätverksfel — ${e.message}`);
    }

    if (svar.status === 429 || svar.status >= 500) {
      if (forsok < 5) {
        await sov(2000 * 2 ** forsok);
        return this.fraga(query, variables, forsok + 1);
      }
      throw new Error(`${this.konfig.namn}: HTTP ${svar.status} efter 5 försök`);
    }
    if (svar.status === 401 || svar.status === 403) {
      throw new Error(
        `${this.konfig.namn}: HTTP ${svar.status} — token nekad.\n` +
        `  Kontrollera SHOPIFY_TOKEN_${this.konfig.env} och att appen har rätt scopes ` +
        `(write_products, read_products, write_publications).`
      );
    }
    if (!svar.ok) throw new Error(`${this.konfig.namn}: HTTP ${svar.status}`);

    const data = await svar.json();

    if (data.errors) {
      const strypt = data.errors.some((e) => /throttl/i.test(e.message || ''));
      if (strypt && forsok < 5) {
        await sov(3000 * 2 ** forsok);
        return this.fraga(query, variables, forsok + 1);
      }
      throw new Error(`${this.konfig.namn}: ${data.errors.map((e) => e.message).join(' · ')}`);
    }
    return data.data;
  }

  /** Kör en mutation och kastar om Shopify lagt fel i userErrors. */
  async mutera(query, variables, falt) {
    const data = await this.fraga(query, variables);
    const nod = data[falt];
    const fel = nod?.userErrors || nod?.mediaUserErrors || [];
    if (fel.length) {
      throw new Error(`${this.konfig.namn} · ${falt}: ${fel.map((f) => f.message).join(' · ')}`);
    }
    return nod;
  }

  /** REGEL 1: verifiera att vi står i rätt butik innan något skrivs. */
  async verifiera() {
    const d = await this.fraga(`{ shop { name myshopifyDomain currencyCode primaryDomain { host } } }`);
    const s = d.shop;
    const faktiskValuta = s.currencyCode;
    if (faktiskValuta !== this.konfig.valuta) {
      throw new Error(
        `STOPP — fel butik.\n` +
        `  Väntade ${this.konfig.namn} (${this.konfig.valuta})\n` +
        `  Fick    ${s.name} / ${s.primaryDomain?.host} (${faktiskValuta})\n` +
        `  Kontrollera SHOPIFY_SHOP_${this.konfig.env}.`
      );
    }
    return s;
  }

  /** Hela katalogen: id, titel, status och alla SKU:er. Sidbläddrar till slutet. */
  async inventera() {
    const produkter = [];
    let efter = null;
    for (;;) {
      const d = await this.fraga(
        `query($efter: String) {
           products(first: 100, after: $efter) {
             edges { node {
               id title handle status templateSuffix
               variants(first: 100) { edges { node { id sku } } }
             } }
             pageInfo { hasNextPage endCursor }
           }
         }`,
        { efter }
      );
      for (const e of d.products.edges) {
        const n = e.node;
        produkter.push({
          id: n.id, titel: n.title, handle: n.handle, status: n.status,
          mall: n.templateSuffix,
          skuer: n.variants.edges.map((v) => v.node.sku).filter(Boolean),
        });
      }
      if (!d.products.pageInfo.hasNextPage) break;
      efter = d.products.pageInfo.endCursor;
    }
    const skuIndex = new Map();
    for (const p of produkter) for (const s of p.skuer) skuIndex.set(s, p);
    return { produkter, skuIndex };
  }

  /** Butikens alla försäljningskanaler. */
  async kanaler() {
    const d = await this.fraga(`{ publications(first: 50) { edges { node { id name } } } }`);
    return d.publications.edges.map((e) => e.node);
  }
}
