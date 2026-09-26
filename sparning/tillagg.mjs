// Tilläggen under paketet på spårningssidan: samma två produkter och samma
// rabattkoder som tacksidan (factory/tacksida/), visade för kunden som redan
// har beställt och nu kollar var paketet är.
//
// Varför här också, och inte bara på tacksidan: tacksidan ligger inuti
// Shopifys kassa och kan bara nås av en app (checkout UI extension), och den
// appen kräver ett App Automation Token från jobb-Gmailens Dev Dashboard
// (factory/tacksida/README.md). Spårningssidan är vår egen sida och byggs om
// varje timme av rutinen — här kommer erbjudandet ut utan ett enda klick.
//
// Facit är tacksidans filer, aldrig en kopia här:
//   factory/tacksida/produkter.json     namn, kortnamn, en mening — på fem språk
//   factory/tacksida/erbjudande.json    rabattkod + procent per produkt
//   factory/tacksida/produkter.lage.json variant-id:n i butiken (skrivs av produkter.mjs)
// Priset står INTE här: sidan hämtar det i kundens webbläsare ur
// /products/<handle>.js, i kundens egen valuta, och räknar av procenten som
// Shopify gör (trunkerat till hela ören, factory/tacksida/README.md).
//
// Prislagen (PIL 7 a §): inget överstruket pris, inget "du sparar", ingen
// procent i texten — bara "<pris> för dig som beställt hos oss". Samma regel
// som kortet i kassan; visa_ordinarie_pris är avstängt tills 2026-10-26.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const HAR = dirname(fileURLToPath(import.meta.url));
export const TACKSIDA_MAPP = join(HAR, '..', 'factory', 'tacksida');

const SPRAK = ['sv', 'nb', 'en', 'fi', 'da'];

// Läser tacksidans tre filer och bygger raderna sidan behöver. Kastar med
// klartext när något saknas — hellre ingen ruta än en ruta med fel produkt.
export function lasTillagg(butikId, { mapp = TACKSIDA_MAPP } = {}) {
  const spec = lasJson(join(mapp, 'produkter.json'));
  const erbj = lasJson(join(mapp, 'erbjudande.json'));
  const lage = lasJson(join(mapp, 'produkter.lage.json'));
  return byggTillagg(butikId, { spec, erbj, lage });
}

export function byggTillagg(butikId, { spec, erbj, lage }) {
  if (!spec?.produkter?.length) throw new Error('tacksidans produkter.json saknar produkter');
  if (erbj?.butik && erbj.butik !== butikId) throw new Error(`erbjudande.json gäller ${erbj.butik}, inte ${butikId}`);
  if (lage?.butik && lage.butik !== butikId) throw new Error(`produkter.lage.json gäller ${lage.butik}, inte ${butikId}`);
  const ut = [];
  for (const e of erbj?.erbjudanden ?? []) {
    const p = spec.produkter.find((x) => x.id === e.produkt);
    const l = lage?.produkter?.[e.produkt];
    if (!p || !l?.variant_legacy_id) throw new Error(`tillägget ${e.produkt} saknar produkt eller variant-id i butiken`);
    if (l.status && l.status !== 'ACTIVE') continue; // en avpublicerad produkt visas aldrig
    const procent = Number(e.rabatt_procent);
    if (!Number.isFinite(procent) || procent <= 0 || procent >= 100) throw new Error(`tillägget ${e.produkt}: orimlig procent ${e.rabatt_procent}`);
    if (!/^[A-Z0-9_-]{3,40}$/.test(String(e.rabattkod ?? ''))) throw new Error(`tillägget ${e.produkt}: rabattkoden ser fel ut`);
    ut.push({
      handle: String(p.handle),
      variant: String(l.variant_legacy_id),
      kod: String(e.rabattkod),
      procent,
      namn: perSprak(p.kortnamn, p.titel_sv),
      rad: perSprak(p.en_mening, ''),
    });
  }
  return ut;
}

// { sv, nb, en, fi, da } — saknas ett språk faller det tillbaka på svenskan,
// aldrig på tomt (då hade kortet stått utan namn).
function perSprak(obj, reservSv) {
  const sv = obj?.sv ?? reservSv ?? '';
  const ut = {};
  for (const k of SPRAK) ut[k] = String(obj?.[k] ?? sv);
  return ut;
}

function lasJson(fil) {
  if (!existsSync(fil)) throw new Error(`${fil} saknas`);
  return JSON.parse(readFileSync(fil, 'utf8'));
}

// Priset kunden får, räknat som Shopify räknar: rabatten trunkeras till hela
// ören och dras från priset. Samma formel som kortet i kassan
// (factory/tacksida/app/…/logik.js erbjudandepris) — de två får aldrig säga
// olika. `pris` i valutans enheter (539), `procent` i procent (34.88).
export function tillaggspris(pris, procent) {
  const b = Number(pris);
  if (!Number.isFinite(b) || b <= 0) return null;
  const rabatt = Math.floor(b * procent + 1e-6) / 100;
  return Math.round((b - rabatt) * 100) / 100;
}
