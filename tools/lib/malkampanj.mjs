// malkampanj.mjs — ägarens UTTRYCKLIGA målkampanj för en marknad.
//
// Bakgrunden (mätt 2026-09-30 i Magiborsten UK): CaraShell hade två ACTIVE
// USA-kampanjer. Den gamla `1 CARASHELL_US_Taköverdrag … – kopia` landar på
// lagerrensningssidan; den nya `Taköverdrag 5 reasons USA TEST` (Axels, byggd
// 2026-09-27) landar på listiclen rv-roof-cover-5-reasons. 28–30/9 gav den
// gamla ~24 300 kr / 15 köp, den nya ~18 700 kr / 19 köp. Axels order samma
// dag: "byter mainkampanj i USA … då börjar vi bara ladda upp till den nya".
// Kön hittade aldrig den nya — den letar kampanjen på namnbasen
// `CARASHELL_US_Taköverdrag`, och Axels kampanj heter något annat.
//
// Regeln här: finns `malkampanj.<MARKNAD>` på produktens post i
// factory/produkter/register.json vinner den över namnsökningen. Är målet
// borta, på fel konto eller PAUSED med spend (ett beslut) laddas INGET upp —
// kön faller aldrig tyst tillbaka på den gamla kampanjen. `adset_id` låser
// alla annonser till ett adset (kampanjen har ett adset, inte ett per koncept).
//
// Byt mål: node factory/register.mjs … eller ändra posten för hand, med datum
// och Axels ord i `motivering`.

/** Ren: registrets mål för marknaden, eller null. */
export function malkampanjFor(post, marknad) {
  const r = post?.malkampanj?.[String(marknad ?? '').toUpperCase()];
  if (!r?.kampanj_id) return null;
  return { kampanj_id: String(r.kampanj_id), adset_id: r.adset_id ? String(r.adset_id) : null };
}

/**
 * Läser målet live och dömer det. `kampanjUtfall` är meta-lib:s (injiceras,
 * så domen går att testa utan nät). Returnerar samma form som kön
 * (`valjMalkampanj`): { kampanj, skal, varning? }.
 */
export async function domFastMal(fast, konto, kampanjUtfall) {
  const u = await kampanjUtfall(fast.kampanj_id);
  const vad = `registrets målkampanj ${fast.kampanj_id}`;
  if (u.utfall === 'SAKNAS') return { kampanj: null, skal: `${vad} gick inte att läsa (${u.fel}) — laddar inte upp, faller aldrig tillbaka på en annan kampanj` };
  if (String(u.kampanj.account_id) !== String(konto)) return { kampanj: null, skal: `${vad} ligger på konto ${u.kampanj.account_id}, inte ${konto}` };
  if (u.utfall === 'AVVECKLAD') return { kampanj: null, skal: `${vad} "${u.kampanj.name}" är PAUSED med ${Math.round(u.spend)} kr spend — ett beslut; byt målet i registret` };
  const namn = u.kampanj.name ?? '';
  return {
    kampanj: { id: String(u.kampanj.id), namn, bas: namn.split(' | ')[0].trim(), status: u.kampanj.status, utfall: u.utfall, fast: true },
    skal: null,
    varning: `målkampanjen kommer ur registret (malkampanj), inte ur namnsökningen: "${namn}"`,
  };
}
