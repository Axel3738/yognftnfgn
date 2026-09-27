// konkurrenter/skicka.mjs — det ENDA stället ett brev lämnar huset. Går via
// verksamhetens supportbrevlåda på Loopia (kundtjanst/brevlada.mjs →
// skickaNytt), samma väg som autosvaret, så avsändaren är butikens riktiga
// adress och svaret landar hos VA:n.
//
// Spärrarna, i ordning (alla ger ett fel i klartext, inget skickas):
//   1. `ja` måste vara sant — utan det visas bara brevet.
//   2. KONKURRENTER_INGEN_SANDNING=1 i miljön stoppar precis före sändningen
//      (samma idé som SPARNING_INGEN_PUBLICERING: testerna kan köra hela
//      vägen utan att något går ut).
//   3. Ärendet måste vara `ny` (första brevet) eller `skickad`/`pamind`
//      (påminnelsen). Ett brev till samma ärende går aldrig två gånger.
//   4. Brevet måste klara kontrolleraBrev (mottagare, egna domäner, tomt).
//   5. Brevlådan måste finnas i miljön (KUNDTJANST_MAIL_PASS_<ID>).

import { oppnaBrevlada } from '../kundtjanst/brevlada.mjs';
import { kontrolleraBrev } from './brev.mjs';
import { STATUS } from './arenden.mjs';

export const SPARR_ENV = 'KONKURRENTER_INGEN_SANDNING';

/** Får det här brevet gå för det här ärendet? Lista med fel, tom = ja. Ren. */
export function kontrolleraForeSandning(arende, brev, { paminnelse = false, egna = [] } = {}) {
  const fel = [];
  if (!arende) return ['ärendet finns inte'];
  if (!paminnelse && arende.status !== STATUS.NY) fel.push(`ärendet är ${arende.status} — första brevet går bara från "ny"${arende.brev?.skickat ? ` (skickat ${arende.brev.skickat.nar})` : ''}`);
  if (paminnelse && ![STATUS.SKICKAD, STATUS.PAMIND].includes(arende.status)) fel.push(`påminnelsen går bara efter ett skickat brev — ärendet är ${arende.status}`);
  if (paminnelse && arende.status === STATUS.PAMIND) fel.push('påminnelsen är redan skickad — nästa steg är eskalering (Axels beslut)');
  if (!arende.styrka) fel.push('ärendet har ingen styrka (inga bevis) — inget brev');
  fel.push(...kontrolleraBrev(brev, { egna }));
  return fel;
}

/**
 * Skickar brevet (eller sparar det som utkast i Drafts med `utkast: true`).
 * Returnerar { skickat, utkast, kvitto } eller { skickat: false, orsak }.
 * `oppna` går att byta i testerna (falsk brevlåda).
 */
export async function skickaBrev(arende, brev, { brand, ja = false, utkast = false, paminnelse = false, egna = [], env = process.env, oppna = oppnaBrevlada, logg = () => {}, nu = () => new Date().toISOString() } = {}) {
  const fel = kontrolleraForeSandning(arende, brev, { paminnelse, egna });
  if (fel.length) return { skickat: false, utkast: false, orsak: fel.join('; '), fel };
  if (!ja) return { skickat: false, utkast: false, orsak: 'inget --ja — brevet visades bara' };
  if (env[SPARR_ENV] === '1') return { skickat: false, utkast: false, sparr: true, orsak: `${SPARR_ENV}=1 — stannade precis före sändningen` };
  if (!brand) return { skickat: false, utkast: false, orsak: 'ingen avsändarbrevlåda (verksamhetens `avsandare` saknas i konfig.json)' };

  let brevlada;
  try { brevlada = oppna(brand, { env, logg }); }
  catch (e) { return { skickat: false, utkast: false, orsak: `brevlådan för ${brand} går inte att öppna: ${e.message}` }; }
  try {
    const r = await brevlada.skickaNytt({ till: brev.mottagare, amne: brev.amne, text: brev.text, utkast });
    const kvitto = { nar: nu(), till: brev.mottagare, fran: r.fran, amne: brev.amne, sprak: brev.sprak, typ: r.typ, utkastUid: r.utkastUid ?? null, paminnelse, meddelande: r.meddelande ?? null };
    logg(r.typ === 'utkast' ? `  utkast sparat i Drafts (uid ${r.utkastUid ?? '?'}) — inget skickat` : `  skickat till ${brev.mottagare} från ${r.fran}`);
    return { skickat: r.typ === 'skickat', utkast: r.typ === 'utkast', kvitto };
  } catch (e) {
    return { skickat: false, utkast: false, orsak: `sändningen misslyckades: ${e.message}` };
  } finally {
    await brevlada.loggaUt?.().catch?.(() => {});
  }
}
