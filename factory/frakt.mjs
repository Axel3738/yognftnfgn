// Fraktupplägget i butiken, härlett ur butikskonfigen.
//
// Ren logik utan nätverk: `byggFraktplan` säger hur zonerna SKA se ut,
// `byggFraktatgarder` jämför med hur de ser ut nu och returnerar skillnaden.
// Ops kör sedan skillnaden mot Shopify. Ingen fraktsiffra står i koden.

const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const tal = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export const FRI_FRAKT = 'Fri frakt';

// EU:s 27 länder (ISO 3166-1 alpha-2). Hemlandet plockas bort ur EU-zonen
// när det är ett EU-land — ett land får bara ligga i EN zon i Shopify.
export const EU_LANDER = Object.freeze([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

// Huvudmarknadens landskod: butik.land först, annars namnet.
const LANDSKOD = { sverige: 'SE', norge: 'NO', danmark: 'DK', finland: 'FI', tyskland: 'DE', storbritannien: 'GB' };
export function huvudmarknadensLand(butik) {
  const b = butik?.butik ?? {};
  const kod = text(b.land);
  if (kod && /^[A-Za-z]{2}$/.test(kod)) return kod.toUpperCase();
  return LANDSKOD[String(text(b.huvudmarknad) ?? 'Sverige').toLowerCase()] ?? 'SE';
}

// Zonerna butiken ska ha. Huvudmarknaden först — den är hemmamarknad och
// den enda som får expressfrakt.
export function byggFraktplan(butik) {
  const b = butik?.butik ?? {};
  const f = butik?.frakt ?? {};
  const valuta = text(b.valuta) ?? 'SEK';
  const huvudmarknad = text(b.huvudmarknad) ?? 'Sverige';
  const fri = f.fri_globalt !== false;

  const standard = fri
    ? { namn: FRI_FRAKT, pris: 0, valuta, villkor: null }
    : {
        namn: 'Standardfrakt',
        pris: tal(f.standardpris) ?? 0,
        valuta,
        villkor: tal(f.fri_over) > 0 ? { friOver: f.fri_over } : null,
      };

  const hemland = huvudmarknadensLand(butik);
  const hemma = { zon: huvudmarknad, huvudmarknad: true, lander: [hemland], metoder: [standard] };
  if (f.express?.aktiv) {
    hemma.metoder.push({
      namn: text(f.express.namn) ?? 'Express',
      pris: tal(f.express.pris) ?? 0,
      valuta,
      villkor: null,
    });
  }

  // Fri frakt globalt betyder att övriga zoner får samma standardmetod.
  // Länderna per zon följer med, så zonen kan SKAPAS när den saknas
  // (TackleBay 2026-09-10: trialbutiken hade Domestic=PH + International,
  // och steget sa "för hand" fast deliveryProfileUpdate kan skapa zoner).
  const ovriga = [
    { zon: 'EU (Europeiska Unionen)', lander: EU_LANDER.filter((l) => l !== hemland) },
    { zon: 'Internationell', lander: ['*'] },
  ].map(({ zon, lander }) => ({
    zon,
    huvudmarknad: false,
    lander,
    metoder: [{ ...standard, villkor: null }],
  }));

  return [hemma, ...ovriga];
}

// Skillnaden mellan hur zonerna ser ut nu och hur planen säger att de ska se ut.
// `befintliga` är [{ zon, metoder: [{ id, namn, pris, rateId }] }].
export function byggFraktatgarder(befintliga, plan) {
  const nuvarande = new Map((befintliga ?? []).map((z) => [z.zon, z.metoder ?? []]));
  const attUppdatera = [];
  const attSkapa = [];
  const attTaBort = [];
  const saknadeZoner = [];
  const attSkapaZoner = [];
  const attTaBortZoner = [];

  for (const zon of plan) {
    const metoder = nuvarande.get(zon.zon);
    if (!metoder) {
      saknadeZoner.push(zon.zon);
      attSkapaZoner.push({ zon: zon.zon, lander: zon.lander ?? [], metoder: zon.metoder });
      continue;
    }
    const kvar = [...metoder];
    for (const onskad of zon.metoder) {
      // Matcha på namn först, annars återanvänd en metod som blir över.
      const i = kvar.findIndex((m) => m.namn === onskad.namn);
      const traff = i !== -1 ? kvar.splice(i, 1)[0] : kvar.shift();
      if (!traff) {
        attSkapa.push({ zon: zon.zon, metod: onskad });
      } else if (traff.villkorad) {
        // En metod med villkor ("fri frakt över X") går inte att uppdatera via
        // deliveryProfileUpdate — Shopify avvisar den (mätt 2026-09-08). Riv
        // och bygg om i stället, ALLTID — även när namn och pris råkar
        // stämma, för villkoret i sig är fel mot planen (planen har inga
        // villkorade metoder utom friOver). Så hamnar zonen rätt oavsett hur
        // butiken var förkonfad.
        // (DryTrek och TankGuard löste det var för sig; auto-mergen lade
        // båda varianterna ovanpå varandra — förenat 2026-09-09.)
        attTaBort.push({ zon: zon.zon, id: traff.id, namn: traff.namn });
        attSkapa.push({ zon: zon.zon, metod: onskad });
      } else if (traff.namn !== onskad.namn || Number(traff.pris) !== onskad.pris) {
        attUppdatera.push({ zon: zon.zon, id: traff.id, rateId: traff.rateId, metod: onskad });
      }
    }
    for (const overbliven of kvar) {
      attTaBort.push({ zon: zon.zon, id: overbliven.id, namn: overbliven.namn });
    }
  }

  // Ska zoner skapas frigörs länderna först: en butiksskapad zon som inte
  // står i planen (trialens "Domestic"/"International") bär dem, och ett land
  // får bara ligga i EN zon. Rivs BARA när planen faktiskt saknar zoner —
  // en butik som redan är rätt lämnas orörd.
  if (attSkapaZoner.length > 0) {
    const planerade = new Set(plan.map((z) => z.zon));
    for (const z of befintliga ?? []) {
      if (!planerade.has(z.zon)) attTaBortZoner.push({ zon: z.zon, id: z.zonId ?? null });
    }
  }

  return {
    attUppdatera,
    attSkapa,
    attTaBort,
    saknadeZoner,
    attSkapaZoner,
    attTaBortZoner,
    orort: attUppdatera.length + attSkapa.length + attTaBort.length + attSkapaZoner.length === 0,
  };
}

// Raderna som visas för kund. Samma källa som zonerna, så sidan aldrig kan
// säga något annat än kassan.
export function fraktraderForKund(butik, leveranstid) {
  const plan = byggFraktplan(butik);
  const hemma = plan.find((z) => z.huvudmarknad) ?? plan[0];
  const valuta = hemma?.metoder?.[0]?.valuta ?? 'SEK';
  const enhet = valuta === 'SEK' || valuta === 'NOK' || valuta === 'DKK' ? 'kr' : valuta;
  const fri = butik?.frakt?.fri_globalt !== false;

  const rader = [];
  const tid = text(leveranstid) ?? text(butik?.frakt?.leveranstid);
  if (tid) rader.push(`Leveranstid: ${tid}`);
  rader.push(fri ? 'Fri frakt till alla länder' : `Frakt: ${butik.frakt.standardpris} ${enhet}`);
  if (!fri && tal(butik?.frakt?.fri_over) > 0) {
    rader.push(`Fri frakt över ${butik.frakt.fri_over} ${enhet}`);
  }
  for (const m of hemma.metoder.slice(1)) {
    const bitar = [m.pris === 0 ? 'fri frakt' : `${m.pris} ${enhet}`];
    const t = text(butik?.frakt?.express?.tid);
    if (t) bitar.push(t);
    rader.push(`${m.namn}: ${bitar.join(', ')}`);
  }
  return rader;
}
