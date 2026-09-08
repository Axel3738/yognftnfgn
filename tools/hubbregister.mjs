// hubbregister.mjs — vilken butik hör den här hubben, det här prefixet och det
// här annonskontot till?
//
// Repot hade kopplingarna utspridda på fyra ställen (products/products.json,
// commission/hubbar.json, products/prefix-alias.json, market-expansion/*) och
// INGEN av dem bar annonskontot per hub. Det gick så länge det fanns exakt en
// verksamhet per konto. Det gäller inte längre: OPS-fabriken och Bäverbutikens
// danska annonser delar konto 915422744950975, och OPS-butiken säljer SAMMA
// produkt som Bäverbutiken. Utan register kan en leverans hamna i fel konto,
// och fel konto kostar riktiga pengar.
//
// Registret binder: hub → butik → teamspace → annonskonto → sida/pixel →
// prefix → landningssida. Datan står i commission/hubbar.json (samma fil som
// commission redan använder som golv — den behöll sin gamla roll oförändrad).
//
// Använd modulen så här:
//
//   import { laddaRegister } from './hubbregister.mjs';
//   const reg = laddaRegister();
//   const butik = reg.butik('baverbutiken');          // → { annonskonto, sida, ... }
//   reg.butikForPrefix('heimguard');                  // → OPS-butiken
//   reg.butikForHubb({ namn: 'Boat cover 420D creative hub' });
//
// ⚠️ Registret RIVER ALDRIG en spärr. Det ersätter bara det hårdkodade
// konto-id:t med "kontot som butikens register anger" — en okänd butik, en
// butik utan konto eller ett prefix som pekar på två butiker är alltid ett
// avbrott, aldrig en gissning.

import { readFileSync } from 'node:fs';

const ROT = new URL('..', import.meta.url).pathname;

/** Butiken som rutiner utan --butik kör mot. Samma konto som före registret. */
export const STANDARDBUTIK = 'baverbutiken';

export class RegisterFel extends Error {}

/** Prefixnyckeln: gemener, utan efterföljande understreck.
 *  "Enginecover_" → "enginecover", "HeimGuard" → "heimguard". */
export const prefixnyckel = (s) =>
  String(s ?? '').trim().replace(/_+$/, '').toLowerCase() || null;

/** Prefixet ur ett annonsnamn: "Rodholder_PD_11_H1" → "rodholder".
 *  Namn utan understreck (Grillklinikens "235 H1") har inget prefix. */
export function prefixAvAnnons(namn) {
  const forsta = String(namn ?? '').trim().split(/\s+[–—-]\s+/)[0].trim();
  return prefixnyckel((forsta.match(/^([A-Za-zÀ-ÿ0-9-]+)_/) || [])[1] ?? null);
}

/** Hubbnamn jämförs skiftlägesokänsligt och utan extra blanksteg. */
const hubbnyckel = (s) => String(s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

/** Notion-id jämförs alltid utan bindestreck — samma id skrivs på båda sätten. */
const idnyckel = (s) => String(s ?? '').replace(/-/g, '').toLowerCase() || null;

function las(sokvag, standard = null) {
  try {
    return JSON.parse(readFileSync(sokvag, 'utf8'));
  } catch (e) {
    if (standard !== null) return standard;
    throw new RegisterFel(`Kunde inte läsa ${sokvag}: ${e.message}`);
  }
}

/**
 * Läser hubbregistret.
 *
 * Prefixen kommer från tre håll och läggs ihop i den här ordningen:
 *   1. `butiker[*].prefix` — butikens egna prefix. Det enda som binder en
 *      annons till rätt butik när flera butiker delar annonskonto.
 *   2. `hubbar[*].prefix`  — hubbens prefix, ärver hubbens butik.
 *   3. products.json `creative_prefix` + prefix-alias.json `kontots_prefix` —
 *      knyts till butiken som äger produktens `ad_account_id`. Så följer
 *      Bäverbutikens fyra skalningsprodukter med utan dubbelskrivning.
 *
 * Samma prefix på två olika butiker är ett AVBROTT, inte en gissning:
 * då går det inte att veta vilket konto en leverans hör hemma i.
 *
 * @param {string} [rot] Repo-roten. Bara för tester.
 */
export function laddaRegister(rot = ROT) {
  const fil = `${rot}commission/hubbar.json`;
  const data = las(fil);

  const butiker = new Map();
  for (const [id, b] of Object.entries(data.butiker ?? {})) {
    if (!b.annonskonto) {
      throw new RegisterFel(`Butiken "${id}" i ${fil} saknar annonskonto. En butik utan konto kan inte användas — fyll i det eller ta bort butiken.`);
    }
    butiker.set(id, { id, ...b, prefix: (b.prefix ?? []).map(prefixnyckel).filter(Boolean) });
  }
  if (!butiker.size) throw new RegisterFel(`${fil} har inga butiker. Registret är tomt — rutinerna vet då inte vilket konto något hör till.`);
  if (!butiker.has(STANDARDBUTIK)) {
    throw new RegisterFel(`Standardbutiken "${STANDARDBUTIK}" saknas i ${fil}. Utan den vet rutinerna utan --butik inte vilket konto de kör mot.`);
  }

  const hubbar = (data.hubbar ?? []).map((h) => ({
    ...h,
    butik: h.butik ?? null,
    prefix: (h.prefix ?? []).map(prefixnyckel).filter(Boolean),
  }));

  // Hubbar per id och per namn. Namnet är reservvägen: Notion-raderna bär
  // hubbens titel, inte alltid dess id.
  const hubbPaId = new Map();
  const hubbPaNamn = new Map();
  for (const h of hubbar) {
    if (h.butik && !butiker.has(h.butik)) {
      throw new RegisterFel(`Hubben "${h.namn}" pekar på butiken "${h.butik}" som inte finns i ${fil}.`);
    }
    if (h.id) hubbPaId.set(idnyckel(h.id), h);
    if (h.namn) hubbPaNamn.set(hubbnyckel(h.namn), h);
  }

  // ---- prefixkartan
  const prefix = new Map();
  const satt = (p, butikId, kalla) => {
    if (!p || !butikId) return;
    const gammal = prefix.get(p);
    if (gammal && gammal.butik !== butikId) {
      throw new RegisterFel(
        `Annonsprefixet "${p}" pekar på två butiker: "${gammal.butik}" (${gammal.kalla}) och "${butikId}" (${kalla}).\n`
        + '  Det går då inte att veta vilket annonskonto en leverans hör hemma i. Rätta prefixen i commission/hubbar.json.');
    }
    if (!gammal) prefix.set(p, { butik: butikId, kalla });
  };

  for (const b of butiker.values()) for (const p of b.prefix) satt(p, b.id, `butiken ${b.id}`);
  for (const h of hubbar) for (const p of h.prefix) satt(p, h.butik, `hubben ${h.namn}`);

  // products.json och prefix-alias.json: prefixen knyts till butiken som äger
  // kontot. Saknas kontot i registret hoppas prefixet över — det är inte ett
  // fel, bara en produkt i ett konto ingen butik gör anspråk på.
  const kontoTillButik = new Map();
  for (const b of butiker.values()) {
    if (!kontoTillButik.has(b.annonskonto)) kontoTillButik.set(b.annonskonto, []);
    kontoTillButik.get(b.annonskonto).push(b);
  }
  /** Butiken som ensam äger ett konto. Delar två butiker konto (OPS + DK) går
   *  det inte att härleda butiken ur kontot — då måste prefixet stå explicit. */
  const ensamPaKonto = (konto) => {
    const lista = kontoTillButik.get(String(konto)) ?? [];
    return lista.length === 1 ? lista[0] : null;
  };

  const produkter = las(`${rot}products/products.json`, { products: [] }).products ?? [];
  for (const p of produkter) {
    const b = ensamPaKonto(p.ad_account_id);
    if (b && p.creative_prefix) satt(prefixnyckel(p.creative_prefix), b.id, `products.json (${p.id})`);
  }
  const alias = las(`${rot}products/prefix-alias.json`, { alias: {} }).alias ?? {};
  for (const [nyckel, a] of Object.entries(alias)) {
    const b = ensamPaKonto(a.ad_account_id ?? butiker.get(STANDARDBUTIK).annonskonto);
    if (!b) continue;
    satt(prefixnyckel(nyckel), b.id, 'prefix-alias.json');
    if (a.kontots_prefix) satt(prefixnyckel(a.kontots_prefix), b.id, 'prefix-alias.json');
  }

  const register = {
    fil,
    butiker,
    hubbar,
    prefix,

    /** Butiken med id:t. Okänd butik = avbrott, aldrig tyst fallback. */
    butik(id) {
      const b = butiker.get(String(id ?? '').trim());
      if (!b) {
        throw new RegisterFel(
          `Okänd butik "${id}". Finns i hubbregistret: ${[...butiker.keys()].join(', ')}.`);
      }
      return b;
    },

    /** Butiken utan att kasta — null när den inte finns. */
    kanskeButik(id) {
      return butiker.get(String(id ?? '').trim()) ?? null;
    },

    /** Alla butiker som kör på ett annonskonto. Fler än en betyder delat konto. */
    butikerPaKonto(konto) {
      return kontoTillButik.get(String(konto)) ?? [];
    },

    /** Butiken ett annonsprefix hör till, eller null. */
    butikForPrefix(p) {
      const post = prefix.get(prefixnyckel(p));
      return post ? butiker.get(post.butik) : null;
    },

    /** Butiken ett annonsNAMN hör till, via sitt prefix. Null = okänt prefix. */
    butikForAnnons(namn) {
      return register.butikForPrefix(prefixAvAnnons(namn));
    },

    /** Hubben, slagen upp på id först och på namn i andra hand. */
    hubb({ id = null, namn = null } = {}) {
      return (id ? hubbPaId.get(idnyckel(id)) : null) ?? (namn ? hubbPaNamn.get(hubbnyckel(namn)) : null) ?? null;
    },

    /** Butiken en hub hör till. Null = hubben står inte i registret ännu. */
    butikForHubb(hubb) {
      const h = register.hubb(hubb);
      return h?.butik ? butiker.get(h.butik) : null;
    },

    /** Hubbarna som hör till en butik. */
    hubbarForButik(butikId) {
      return hubbar.filter((h) => h.butik === String(butikId));
    },
  };
  return register;
}

/** Registret laddas en gång per process — filen ändras inte under en körning. */
let cache = null;
export function register() {
  if (!cache) cache = laddaRegister();
  return cache;
}
