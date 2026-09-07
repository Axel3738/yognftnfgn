// Fraktupplägget i butiken, härlett ur butikskonfigen.
//
// Ren logik utan nätverk: `byggFraktplan` säger hur zonerna SKA se ut,
// `byggFraktatgarder` jämför med hur de ser ut nu och returnerar skillnaden.
// Ops kör sedan skillnaden mot Shopify. Ingen fraktsiffra står i koden.

const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const tal = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export const FRI_FRAKT = 'Fri frakt';

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

  const hemma = { zon: huvudmarknad, huvudmarknad: true, metoder: [standard] };
  if (f.express?.aktiv) {
    hemma.metoder.push({
      namn: text(f.express.namn) ?? 'Express',
      pris: tal(f.express.pris) ?? 0,
      valuta,
      villkor: null,
    });
  }

  // Fri frakt globalt betyder att övriga zoner får samma standardmetod.
  const ovriga = ['EU (Europeiska Unionen)', 'Internationell'].map((zon) => ({
    zon,
    huvudmarknad: false,
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

  for (const zon of plan) {
    const metoder = nuvarande.get(zon.zon);
    if (!metoder) {
      saknadeZoner.push(zon.zon);
      continue;
    }
    const kvar = [...metoder];
    for (const onskad of zon.metoder) {
      // Matcha på namn först, annars återanvänd en metod som blir över.
      const i = kvar.findIndex((m) => m.namn === onskad.namn);
      const traff = i !== -1 ? kvar.splice(i, 1)[0] : kvar.shift();
      if (!traff) {
        attSkapa.push({ zon: zon.zon, metod: onskad });
      } else if (traff.namn !== onskad.namn || Number(traff.pris) !== onskad.pris) {
        attUppdatera.push({ zon: zon.zon, id: traff.id, rateId: traff.rateId, metod: onskad });
      }
    }
    for (const overbliven of kvar) {
      attTaBort.push({ zon: zon.zon, id: overbliven.id, namn: overbliven.namn });
    }
  }

  return {
    attUppdatera,
    attSkapa,
    attTaBort,
    saknadeZoner,
    orort: attUppdatera.length + attSkapa.length + attTaBort.length === 0,
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
