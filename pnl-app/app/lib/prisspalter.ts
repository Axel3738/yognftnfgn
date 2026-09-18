/**
 * Leverantörsprislistor har nästan alltid delpriser och en summa bredvid
 * varandra, utan rubriker: vara | frakt | totalt. AI:n ser tre namnlösa
 * talkolumner och lägger fram dem som tre alternativ — och då står handlaren
 * med ett val han omöjligt kan göra. *(Axel 2026-09-18: "det var jävligt
 * svårt att förstå vilken vikt jag ska välja i såna fall.")*
 *
 * Men talen avslöjar sig själva. I Axels amerikanska prislista gällde
 * `kolumn1 + kolumn2 = kolumn3` i alla nio cellerna, exakt. Den kolumnen är
 * summan, och summan är inköpskostnaden — resten är dess delar.
 *
 * Den här filen räknar, den gissar inte: hittas ingen exakt summarelation
 * lämnas alternativen kvar åt handlaren. Ren funktion utan beroenden, så den
 * går att testa mot riktiga siffror (`test/prisspalter.test.mjs`).
 */

export type SpaltRad = {
  product: string;
  variant: string;
  market?: string;
  unit_cost: number;
  tiers?: { units: number; total: number }[];
};

export type Spalt = { rows: SpaltRad[] };

/** Samma rad i två kolumner ska kännas igen som samma rad. */
function nyckel(r: SpaltRad): string {
  const n = (s: string) => (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return `${n(r.product)}|${n(r.variant)}|${n(r.market ?? "")}`;
}

/**
 * Hur nära två tal måste ligga för att räknas som lika. Källan är avrundad
 * till ören, och summan av två avrundade tal kan ligga två ören fel — men
 * inte mer. Marginalen är alltså till för avrundning, inte för gissningar:
 * den relativa delen finns bara för listor som avrundar till hela enheter.
 */
function likaNog(summa: number, total: number): boolean {
  return Math.abs(summa - total) <= Math.max(0.03, Math.abs(total) * 0.0005);
}

/**
 * Fingeravtryck på en kolumn, så samma läsning inte räknas två gånger när
 * modellens egen rows läggs bredvid dess choices.
 */
export function fingeravtryck(rows: SpaltRad[]): string {
  return rows
    .map((r) => {
      const steg = (r.tiers ?? [])
        .map((t) => `${Math.round(Number(t.units))}:${Number(t.total).toFixed(2)}`)
        .sort()
        .join(",");
      return `${nyckel(r)}=${Number(r.unit_cost).toFixed(2)}[${steg}]`;
    })
    .sort()
    .join(";");
}

/**
 * Är delkolumnerna bara samma kolumn gånger en faktor? Då bevisar `A + B = C`
 * ingenting: en tabell med styckpris | 2-pack | 3-pack uppfyller `k + 2k = 3k`
 * i varje cell, och att skriva 3-packspriset som styckpris vore tre gånger
 * fel. En äkta uppdelning i vara och frakt har olika förhållande på olika
 * rader (i Axels lista 1,83 / 1,65 / 1,62); en proportionell har exakt samma.
 */
function proportionella(celler: number[][]): boolean {
  if (celler.length < 2) return true; // för lite underlag för att skilja dem åt
  for (let i = 1; i < celler[0].length; i++) {
    const kvoter = celler.map((d) => d[i] / d[0]);
    const min = Math.min(...kvoter);
    const max = Math.max(...kvoter);
    if (min > 0 && max / min - 1 > 0.005) return false; // varierar → äkta delning
  }
  return true;
}

/** Alla belopp i en kolumn, per rad: styckpriset och varje flerpackstotal. */
function celler(rows: SpaltRad[]): Map<string, Map<string, number>> {
  const ut = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const k = nyckel(r);
    if (ut.has(k)) return new Map(); // två rader om samma sak — ge upp direkt
    const tal = new Map<string, number>([["1", r.unit_cost]]);
    for (const t of r.tiers ?? []) {
      const u = Math.round(Number(t.units));
      if (u >= 2 && Number.isFinite(t.total)) tal.set(String(u), t.total);
    }
    ut.set(k, tal);
  }
  return ut;
}

/**
 * Är en av kolumnerna exakt de andra ihopräknade? Då är den totalen.
 *
 * Kräver minst tre kolumner (två delar plus en summa — med bara två går det
 * inte att avgöra vilken som är vilken), samma rader och samma packstorlekar
 * i alla kolumner, och att varje delbelopp är större än noll. Minst två
 * olika rader och minst tre celler måste stämma, så ett ensamt
 * sammanträffande inte räcker — och delarna får inte vara proportionella
 * mot varandra, för då är det en antalstabell och inte en uppdelning.
 *
 * @returns Kolumnens index plus ett exempel att visa handlaren, eller null.
 */
export function hittaSummaspalt(
  spalter: Spalt[],
): { index: number; delar: number[]; summa: number } | null {
  if (spalter.length < 3) return null;

  const tabeller = spalter.map((s) => celler(s.rows));
  if (tabeller.some((t) => t.size === 0)) return null;

  /* Samma raduppsättning i alla kolumner — annars jämför vi äpplen och päron. */
  const nycklar = [...tabeller[0].keys()];
  if (!nycklar.length) return null;
  if (tabeller.some((t) => t.size !== nycklar.length || nycklar.some((k) => !t.has(k)))) return null;

  const traffar: { index: number; delar: number[]; summa: number }[] = [];

  if (nycklar.length < 2) return null; // en enda rad är inget bevis

  for (let c = 0; c < tabeller.length; c++) {
    const andra = tabeller.filter((_, i) => i !== c);
    const delceller: number[][] = [];
    let exempel: { delar: number[]; summa: number } | null = null;
    let stammer = true;

    for (const k of nycklar) {
      const total = tabeller[c].get(k)!;
      const delTabeller = andra.map((t) => t.get(k)!);
      /* Samma packstorlekar överallt, annars går raden inte att jämföra. */
      const antal = [...total.keys()];
      if (delTabeller.some((d) => d.size !== total.size || antal.some((a) => !d.has(a)))) {
        stammer = false;
        break;
      }
      for (const a of antal) {
        const t = total.get(a)!;
        const delar = delTabeller.map((d) => d.get(a)!);
        if (!delar.every((d) => Number.isFinite(d) && d > 0) || !Number.isFinite(t)) {
          stammer = false;
          break;
        }
        if (!likaNog(delar.reduce((s, d) => s + d, 0), t)) {
          stammer = false;
          break;
        }
        delceller.push(delar);
        if (!exempel) exempel = { delar, summa: t };
      }
      if (!stammer) break;
    }

    if (stammer && delceller.length >= 3 && exempel && !proportionella(delceller)) {
      traffar.push({ index: c, delar: exempel.delar, summa: exempel.summa });
    }
  }

  /* Med positiva tal kan bara en kolumn vara summan. Blir det ändå flera är
     något lurt (nollor, dubbletter) — då skriver vi hellre ingenting. */
  return traffar.length === 1 ? traffar[0] : null;
}
