// annonsvakt/meta.mjs — läsningen ur Meta. LÄS-BARA: bara GET, aldrig en
// statusändring, aldrig en budget. Klienten är kommentarer/meta.mjs:s
// (backoff på kod 17, timeout så ett tappat socket inte blir en tyst död).
//
// Fyra anrop per konto (mätt 2026-09-27: 7 konton på ~1 minut utan
// mellanrum; med klientens backoff blir en strypning minuter, inte ett fel):
//   1. annonser med problemstatus (DISAPPROVED, WITH_ISSUES, PENDING_REVIEW,
//      PENDING_BILLING_INFO) — filtreringen är Metas, listan blir kort
//   2. kampanjer ACTIVE/WITH_ISSUES (issues_info + dagsbudget)
//   3. adsets ACTIVE/WITH_ISSUES (issues_info + dagsbudget)
//   4. insights level=ad, date_preset=today (spend, köp, ROAS)
// `locale=en_US` på objektanropen så Metas feltexter kommer på engelska —
// Discord är engelskt, och svenskdetektorn hade stoppat "Annonsen levereras
// inte".

import { skapaKlient } from '../kommentarer/meta.mjs';

export { skapaKlient };

export const KONTOFALT = 'account_id,name,currency,account_status,disable_reason,amount_spent,balance,spend_cap,timezone_name';
export const PROBLEMSTATUS = Object.freeze(['DISAPPROVED', 'WITH_ISSUES', 'PENDING_REVIEW', 'PENDING_BILLING_INFO']);
export const ANNONSFALT = 'id,name,status,effective_status,ad_review_feedback,issues_info,updated_time,preview_shareable_link,campaign{id,name,status,effective_status},adset{id,name,status,effective_status}';
export const KAMPANJFALT = 'id,name,status,effective_status,issues_info,daily_budget,lifetime_budget,updated_time';
export const ADSETFALT = 'id,name,status,effective_status,issues_info,daily_budget,campaign_id,updated_time';
export const INSIGHTSFALT = 'ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,actions,purchase_roas';

const q = (o) => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : String(v))}`).join('&');

/** Är felet token:en själv (ogiltig/utgången), inte ett konto? Kod 190 = OAuth-token, 102 = sessionsnyckel. */
export function arTokenFel(e) {
  const kod = Number(e?.meta?.code);
  return kod === 190 || kod === 102;
}

export function normaliseraKonto(k) {
  return {
    id: String(k.account_id ?? k.id ?? '').replace(/^act_/, ''),
    namn: k.name ?? null,
    valuta: k.currency ?? null,
    account_status: Number(k.account_status),
    disable_reason: Number(k.disable_reason ?? 0),
    tidszon: k.timezone_name ?? null,
    // balance och amount_spent kommer i minsta enhet (öre/cent)
    balance: k.balance != null ? Number(k.balance) / 100 : null,
  };
}

const kortFel = (e) => String(e?.meta?.message ?? e?.message ?? 'okänt fel').split(' Refer to ')[0].split('\n')[0];

/**
 * Kontona: `me/adaccounts` + varje konto i facit som listan missade, ett i
 * taget (`me/adaccounts` listar inte allt token:en når — "nya kungen" saknades
 * i listan men svarade på act_<id>, mätt 2026-09-25/26). Ett facitkonto som
 * inte svarar hamnar i `olasta` med Metas orsak.
 * @returns {Promise<{konton: Array, olasta: Array, tokenFel: string|null}>}
 */
export async function lasKonton(klient, { facit = [] } = {}) {
  let lista;
  try {
    lista = await klient.allaSidor(`me/adaccounts?${q({ fields: KONTOFALT, limit: 100 })}`);
  } catch (e) {
    if (arTokenFel(e)) return { konton: [], olasta: [], tokenFel: kortFel(e) };
    throw e;
  }
  const konton = lista.map(normaliseraKonto);
  const olasta = [];
  for (const f of facit) {
    const id = String(f.id);
    if (konton.some((k) => k.id === id)) continue;
    try {
      const k = await klient.get(`act_${id}?${q({ fields: KONTOFALT })}`);
      konton.push({ ...normaliseraKonto(k), utanforListan: true });
    } catch (e) {
      if (arTokenFel(e)) return { konton: [], olasta: [], tokenFel: kortFel(e) };
      olasta.push({ id, namn: f.namn ?? null, fel: kortFel(e) });
    }
  }
  return { konton, olasta, tokenFel: null };
}

/** Allt vakten läser i ett konto. Kastar vid fel — anroparen skriver lasfel. */
export async function lasKonto(klient, konto) {
  const act = `act_${konto.id}`;
  const annonser = await klient.allaSidor(`${act}/ads?${q({ fields: ANNONSFALT, filtering: [{ field: 'effective_status', operator: 'IN', value: PROBLEMSTATUS }], limit: 200, locale: 'en_US' })}`);
  const kampanjer = await klient.allaSidor(`${act}/campaigns?${q({ fields: KAMPANJFALT, filtering: [{ field: 'effective_status', operator: 'IN', value: ['ACTIVE', 'WITH_ISSUES'] }], limit: 200, locale: 'en_US' })}`);
  const adsets = await klient.allaSidor(`${act}/adsets?${q({ fields: ADSETFALT, filtering: [{ field: 'effective_status', operator: 'IN', value: ['ACTIVE', 'WITH_ISSUES'] }], limit: 200, locale: 'en_US' })}`);
  const idag = await klient.allaSidor(`${act}/insights?${q({ level: 'ad', date_preset: 'today', fields: INSIGHTSFALT, limit: 500 })}`);
  return { annonser, kampanjer, adsets, idag };
}

/** Token:ens rättigheter — för --kolla. */
export async function lasRattigheter(klient) {
  const j = await klient.get('me/permissions');
  return (j.data ?? []).filter((p) => p.status === 'granted').map((p) => p.permission);
}
