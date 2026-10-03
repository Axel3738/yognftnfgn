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
// EXTRA MÅLKAMPANJER (`malkampanj.<MARKNAD>.ocksa`, 2026-10-03): Axels beslut
// "de engelska ska ju läggas i Australienkampanjen … vi kör bara samma i USA
// och Australien, men vi anpassar dem lite mer för USA". Samma engelska
// creative och copy laddas alltså upp EN gång till, i varje extra kampanj på
// samma konto, under landets eget namn (`CaraShellRoof_AU_OB_111_H1`) —
// kontots dubblettspärr går på namnet, och Axels egna AU-kopior heter redan
// `_US_`. Länk, sida och adset ärvs ur den extra kampanjen själv (AU-länk med
// ?country=AU, adset per koncept som klon av ett AU-syskon). Raden blir
// Approved först när huvudmålet OCH varje extra mål bär annonsen. Gäller bara
// NYA rader ur SE-ACTIVE to be translated — Approved-rader utan AU-kopia är
// inte eftersläpande (Axel vill ha nya vinnare dit, inte 80 gamla).
//
// Byt mål: node factory/register.mjs malkampanj-ocksa … eller ändra posten för
// hand, med datum och Axels ord i `motivering`.

/** Ren: registrets mål för marknaden, eller null. `ocksa` är de extra målen. */
export function malkampanjFor(post, marknad) {
  const r = post?.malkampanj?.[String(marknad ?? '').toUpperCase()];
  if (!r?.kampanj_id) return null;
  return { kampanj_id: String(r.kampanj_id), adset_id: r.adset_id ? String(r.adset_id) : null, ocksa: ocksaUr(r) };
}

/** Ren: de extra målen ur en registerpost, normaliserade. Skräp hoppas. */
export function ocksaUr(r) {
  return (Array.isArray(r?.ocksa) ? r.ocksa : [])
    .filter((o) => o && o.kampanj_id && o.land)
    .map((o) => ({
      land: String(o.land).toUpperCase(),
      namnkod: String(o.namnkod ?? o.land).toUpperCase(),
      kampanj_id: String(o.kampanj_id),
      kampanj_namn: o.kampanj_namn ?? null,
      adset_id: o.adset_id ? String(o.adset_id) : null,
    }));
}

/**
 * Ren: är kampanjen ett av registrets mål för marknaden? Huvudmålet ⇒
 * { huvud: true, ocksa: null }; ett extra mål ⇒ { huvud: false, ocksa: {…} };
 * annars null. Används av uppladdaren: registrets mål ÄR marknadens per
 * definition, oavsett vad kampanjen heter.
 */
export function arMalkampanj(fast, kampanjId) {
  if (!fast) return null;
  const id = String(kampanjId ?? '');
  if (id === fast.kampanj_id) return { huvud: true, ocksa: null };
  const o = (fast.ocksa ?? []).find((x) => x.kampanj_id === id);
  return o ? { huvud: false, ocksa: o } : null;
}

/**
 * Ren: landets namn på en annons — prefix + `_<KOD>_` + resten, som
 * opsmarknader.marknadsNamn men för en kod som inte är en egen OPS-marknad
 * (AU ligger i USA-marknaden i Shopify). Ett namn som redan bär koden lämnas
 * orört; ett namn som bär huvudmarknadens kod byts (US → AU). Utan "_": null.
 */
export function landsNamn(namn, kod, huvudkod = 'US') {
  const k = String(kod ?? '').toUpperCase();
  const h = String(huvudkod ?? '').toUpperCase();
  const n = String(namn ?? '').split(/\s+[–—-]\s+/)[0].trim();
  const i = n.indexOf('_');
  if (!k || i <= 0) return null;
  const prefix = n.slice(0, i);
  const rest = n.slice(i + 1);
  if (new RegExp(`^${k}_`, 'i').test(rest)) return n;
  if (h && new RegExp(`^${h}_`, 'i').test(rest)) return `${prefix}_${k}_${rest.slice(h.length + 1)}`;
  return `${prefix}_${k}_${rest}`;
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

/**
 * Dömer de extra målen live, ett i taget, med samma regler som huvudmålet.
 * Ett extra mål som inte går att ladda upp i STOPPAR ALDRIG huvudmålet — det
 * står med sitt skäl, och raden blir inte Approved förrän det är löst.
 */
export async function domOcksa(fast, konto, kampanjUtfall) {
  const ut = [];
  for (const o of fast?.ocksa ?? []) {
    const d = await domFastMal({ kampanj_id: o.kampanj_id }, konto, kampanjUtfall);
    ut.push({ ...o, kampanj: d.kampanj, skal: d.skal });
  }
  return ut;
}
