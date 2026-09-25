// motor.mjs — räknar ut vad varje person tjänat på sina bonusuppdrag.
// REN logik: inga filer, inget nät, inga nycklar. Därför går den att testa,
// och därför kan samma funktion användas både av körningen och av sajten.
//
// Tre principer, hämtade ur commission-modulens dyrköpta erfarenheter:
//
//   1. HELLRE OKOPPLAD ÄN FEL PERSON. Matchar en recension två personers namn
//      betalas den till ingen — den hamnar i "otilldelat" så en människa kan
//      avgöra. Att betala fel person kostar mer förtroende än att betala sent.
//   2. INGEN UTBETALNING UTAN UNDERLAG. Varje krona pekar på ett bevis: en
//      recension, en tvist, en Notion-rad, en spendrad. Finns inget underlag
//      finns ingen rad.
//   3. ANSPRÅK VERIFIERAS MOT DATAN. En VA som säger "jag svarade på tvist
//      #5763" får betalt först när tvistdatan säger att den faktiskt är
//      besvarad. Anspråket pekar ut PERSONEN, datan avgör OM det hänt.

export const VECKA = 7 * 86_400_000;

/**
 * Har personen den här rollen? En människa kan bära flera: Josh redigerar
 * video OCH gör produkttest (25 rader i Notion, mätt 2026-09-21). Utan stöd
 * för det faller halva hans arbete mellan stolarna i bonusen.
 * `roll` styr vad man SER på sajten; `extraRoller` vad man kan TJÄNA på.
 */
export function harRollen(person, roll) {
  if (!person || !roll) return false;
  return person.roll === roll || (person.extraRoller ?? []).includes(roll);
}

export function rollerFor(person) {
  return [...new Set([person?.roll, ...(person?.extraRoller ?? [])].filter(Boolean))];
}

/**
 * Svarar personen för butiken? `brands: ["*"]` betyder alla butiker — Mechile
 * är ensam på kundtjänsten (Axel 2026-09-21: "hon är ansvarig för allt") och
 * en handskriven lista hade missat varje ny OPS-butik tyst.
 */
export function svararFor(person, brand) {
  const b = person?.brands ?? [];
  return b.includes('*') || (Boolean(brand) && b.includes(brand));
}

// ------------------------------------------------------------- hjälpare

/** Alla namn en person kan kännas igen på, små bokstäver. */
export function namnformer(person) {
  const ut = new Set();
  const lagg = (v) => {
    const t = String(v ?? '').trim().toLowerCase();
    if (t.length >= 3) ut.add(t);
  };
  lagg(person?.namn);
  lagg(person?.fornamn ?? String(person?.namn ?? '').split(/\s+/)[0]);
  for (const a of person?.alias ?? []) lagg(a);
  return [...ut];
}

/** Står namnet i texten som ett eget ord? "Anna" i "Annabelle" räknas inte. */
export function namnetStarIText(namn, text) {
  const n = String(namn ?? '').trim().toLowerCase();
  const t = String(text ?? '').toLowerCase();
  if (n.length < 3 || !t) return false;
  const escapat = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Ordgräns som funkar med å, ä, ö (\b gör det inte i alla lägen).
  return new RegExp(`(^|[^\\p{L}])${escapat}([^\\p{L}]|$)`, 'u').test(t);
}

/**
 * Vem syns i texten? Returnerar EN person, eller null när ingen eller flera
 * matchar. Flera namn i samma recension ⇒ ingen betalning (regel 1).
 */
export function personIText(text, personer) {
  const traffar = personer.filter((p) => namnformer(p).some((n) => namnetStarIText(n, text)));
  return traffar.length === 1 ? traffar[0] : null;
}

/** ISO-vecka som nyckel: "2026-W38". Bonusar per vecka räknas på den. */
export function veckonyckel(datum) {
  const d = new Date(datum);
  if (Number.isNaN(d.getTime())) return null;
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dag);
  const arsstart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const vecka = Math.ceil(((t - arsstart) / 86_400_000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(vecka).padStart(2, '0')}`;
}

export function iPerioden(datum, period) {
  const d = String(datum ?? '');
  if (!d || !period?.fran || !period?.till) return false;
  return d.slice(0, 10) >= period.fran && d.slice(0, 10) <= period.till;
}

// ------------------------------------------------------- uppdragen ett för ett

/** Recensioner: 4–5 stjärnor där personens namn står i texten. */
function recensionsrader(uppdrag, personer, matningar, period) {
  const rader = [];
  const otilldelat = [];
  for (const r of matningar.recensioner ?? []) {
    if (!iPerioden(r.datum, period)) continue;
    if (Number(r.betyg) < 4) continue;
    const person = personIText(r.text, personer);
    const bevis = {
      vad: `${r.betyg}★ ${r.kalla ?? 'recension'}${r.butik ? ` · ${r.butik}` : ''}`,
      av: r.kund ?? '',
      datum: String(r.datum ?? '').slice(0, 10),
      text: String(r.text ?? '').slice(0, 140),
      lank: r.lank ?? '',
    };
    if (!person) {
      otilldelat.push({ uppdrag: uppdrag.id, orsak: 'inget (eller flera) namn i texten', bevis });
      continue;
    }
    rader.push({ personId: person.id, belopp: uppdrag.belopp, bevis, vecka: veckonyckel(r.datum) });
  }
  return { rader, otilldelat };
}

/** Streak: N recensioner samma vecka ger en extra klumpsumma. */
function streakrader(uppdrag, recensionsTraffar) {
  const perPersonVecka = new Map();
  for (const t of recensionsTraffar) {
    if (!t.vecka) continue;
    const nyckel = `${t.personId}|${t.vecka}`;
    perPersonVecka.set(nyckel, (perPersonVecka.get(nyckel) ?? 0) + 1);
  }
  const krav = uppdrag.krav?.antal_per_vecka ?? 3;
  const rader = [];
  for (const [nyckel, antal] of perPersonVecka) {
    if (antal < krav) continue;
    const [personId, vecka] = nyckel.split('|');
    rader.push({
      personId,
      belopp: uppdrag.belopp,
      bevis: { vad: `${antal} recensioner under ${vecka}`, datum: vecka, text: '', lank: '' },
    });
  }
  return { rader, otilldelat: [] };
}

/**
 * Tvister. Datan säger VAD som hänt; anspråket säger VEM som gjorde det.
 * Utan anspråk betalas ingen — Shopify vet inte vem som svarade.
 */
function tvistrader(uppdrag, personer, matningar, insatser, period) {
  const tvister = new Map((matningar.tvister ?? []).map((t) => [String(t.order ?? '').trim(), t]));
  const rader = [];
  const otilldelat = [];

  for (const i of insatser ?? []) {
    if (i.uppdrag !== uppdrag.id) continue;
    if (i.status !== 'godkand') continue;
    if (!iPerioden(i.datum, period)) continue;
    const t = tvister.get(String(i.referens ?? '').trim());
    if (!t) {
      otilldelat.push({ uppdrag: uppdrag.id, orsak: `tvisten ${i.referens} finns inte i datan`, bevis: { vad: i.referens, datum: i.datum } });
      continue;
    }
    const villkorUppfyllt = uppdrag.id === 'tvist_vunnen'
      ? t.utfall === 'won'
      : Boolean(t.besvarad);
    if (!villkorUppfyllt) {
      otilldelat.push({
        uppdrag: uppdrag.id,
        orsak: uppdrag.id === 'tvist_vunnen' ? `tvisten ${i.referens} är inte vunnen (${t.utfall ?? 'oavgjord'})` : `tvisten ${i.referens} är inte besvarad`,
        bevis: { vad: i.referens, datum: i.datum },
      });
      continue;
    }
    rader.push({
      personId: i.personId,
      belopp: uppdrag.belopp,
      bevis: {
        vad: `Tvist ${t.order}${t.typ ? ` (${t.typ})` : ''}${t.belopp ? ` · ${Math.round(t.belopp)} ${t.valuta ?? 'SEK'}` : ''}`,
        datum: String(i.datum ?? '').slice(0, 10),
        text: uppdrag.id === 'tvist_vunnen' ? 'Vunnen' : 'Besvarad före deadline',
        lank: '',
      },
    });
  }
  return { rader, otilldelat };
}

/** Klarar EN veckorad (en butik, en vecka) uppdragets krav? Ger { uppfyllt, text }. */
function veckoradDom(uppdrag, m) {
  if (uppdrag.krav?.obesvarade_under !== undefined) {
    return { uppfyllt: Number(m.obesvarade) < uppdrag.krav.obesvarade_under, text: `${m.obesvarade} obesvarade (krav: under ${uppdrag.krav.obesvarade_under})` };
  }
  if (uppdrag.krav?.median_timmar_under !== undefined) {
    const ok = m.medianTimmar !== null && m.medianTimmar !== undefined && Number(m.medianTimmar) < uppdrag.krav.median_timmar_under;
    return { uppfyllt: ok, text: `median ${m.medianTimmar} h (krav: under ${uppdrag.krav.median_timmar_under} h)` };
  }
  if (uppdrag.krav?.risk_under !== undefined) {
    return { uppfyllt: Number(m.risk) < uppdrag.krav.risk_under, text: `risk ${m.risk} (krav: under ${uppdrag.krav.risk_under})` };
  }
  if (uppdrag.id === 'sop_tackning') {
    return { uppfyllt: m.sopSaknas === 0, text: m.sopSaknas === 0 ? 'alla topp-ärenden har en rutin' : `${m.sopSaknas} ärendetyper saknar rutin` };
  }
  return { uppfyllt: false, text: '' };
}

/**
 * Veckomått ur kundtjänstrapporten: tom inkorg, svarstid, risk, SOP.
 *
 * `omfang` i regeln säger hur ofta det betalas:
 *   vecka        en gång per person och vecka, när ALLA personens butiker klarar
 *                kravet (Axel 2026-09-21: "svarstid på alla inkorgar under 12 h").
 *                Utan det hade Mechile — som svarar för allt — fått veckobonusen
 *                gånger antalet butiker, och en missad butik hade drunknat.
 *   brand-manad  en gång per butik och period, dömd på butikens SISTA rad
 *                ("vid månadens sista körning").
 *   manad        en gång per person och period, när varje rad för personens
 *                butiker klarar kravet ("hela månaden").
 * Ingen omfang ⇒ vecka. Rader som klarar kravet men saknar ansvarig hamnar i
 * otilldelat, en per butik och vecka, så pengarna ingen fick syns.
 */
function kundtjanstrader(uppdrag, personer, matningar, period) {
  const rader = [];
  const otilldelat = [];
  const omfang = uppdrag.omfang ?? 'vecka';
  const iProgrammet = personer.filter((p) => (uppdrag.roller ?? []).some((r) => harRollen(p, r)));

  let underlag = (matningar.kundtjanst ?? []).filter((m) => iPerioden(m.datum, period));
  if (omfang === 'brand-manad') {
    // Sista raden per butik vinner — det är den som gäller när månaden stängs.
    const sista = new Map();
    for (const m of underlag) {
      const fore = sista.get(m.brand);
      if (!fore || String(m.datum ?? '') >= String(fore.datum ?? '')) sista.set(m.brand, m);
    }
    underlag = [...sista.values()];
  }

  const domda = underlag.map((m) => ({ ...m, ...veckoradDom(uppdrag, m), vecka: m.vecka ?? veckonyckel(m.datum) }));

  // Klarade rader utan någon som svarar för butiken — en människa ska se dem.
  for (const m of domda) {
    if (!m.uppfyllt) continue;
    if (iProgrammet.some((p) => svararFor(p, m.brand))) continue;
    otilldelat.push({
      uppdrag: uppdrag.id,
      orsak: `ingen är tilldelad ${m.brand}`,
      bevis: { vad: `${m.brand} ${m.vecka ?? ''}`.trim(), datum: String(m.datum ?? '').slice(0, 10), text: m.text, lank: '' },
    });
  }

  for (const p of iProgrammet) {
    const mina = domda.filter((m) => svararFor(p, m.brand));
    if (!mina.length) continue;

    // Grupperna som var och en kan ge EN utbetalning.
    const grupper = new Map();
    for (const m of mina) {
      const nyckel = omfang === 'vecka' ? m.vecka : omfang === 'brand-manad' ? m.brand : period?.namn ?? 'perioden';
      if (!grupper.has(nyckel)) grupper.set(nyckel, []);
      grupper.get(nyckel).push(m);
    }

    for (const [nyckel, grupp] of grupper) {
      if (!grupp.every((m) => m.uppfyllt)) continue;
      const senaste = grupp.reduce((a, b) => (String(a.datum ?? '') >= String(b.datum ?? '') ? a : b));
      const butiker = [...new Set(grupp.map((m) => m.brand))];
      rader.push({
        personId: p.id,
        belopp: uppdrag.belopp,
        bevis: {
          vad: omfang === 'brand-manad' ? `${nyckel} ${period?.namn ?? ''}`.trim() : `${nyckel} · ${butiker.length} ${butiker.length === 1 ? 'butik' : 'butiker'}`,
          datum: String(senaste.datum ?? '').slice(0, 10),
          text: grupp.map((m) => `${m.brand}: ${m.text}`).join(' · ').slice(0, 300),
          lank: '',
        },
      });
    }
  }
  return { rader, otilldelat };
}

/**
 * Produkttest. Trappan i kallor.mjs säger var produkten står; regeln säger
 * vilket steg som betalar (`krav.steg`, annars uppdragets eget id). Sedan
 * 2026-09-21 betalar bara 'produkt_fardig' (= steget produkt_godkand, Ads review
 * eller längre) — 15 dollar, Axels beslut.
 */
function produkttestrader(uppdrag, personer, matningar, period) {
  const rader = [];
  const otilldelat = [];
  const steg = uppdrag.krav?.steg ?? uppdrag.id;
  for (const p of matningar.produkttest ?? []) {
    if (!p.steg?.includes(steg)) continue;
    if (!iPerioden(p.datum, period)) continue;
    const person = personer.find((x) => (x.notionNamn && x.notionNamn === p.ansvarig) || x.namn === p.ansvarig);
    const bevis = { vad: p.produkt, datum: String(p.datum ?? '').slice(0, 10), text: `${p.status ?? ''}${p.typ ? ` · ${p.typ}` : ''}`.trim(), lank: p.lank ?? '' };
    if (!person) {
      otilldelat.push({ uppdrag: uppdrag.id, orsak: p.ansvarig ? `"${p.ansvarig}" har inget konto` : 'ingen Ansvarig i Notion', bevis });
      continue;
    }
    rader.push({ personId: person.id, belopp: uppdrag.belopp, bevis });
  }
  return { rader, otilldelat };
}

/** Redigerarnas andel av spenden — räknad av commission-körningen. */
function commissionrader(uppdrag, personer, matningar) {
  const rader = [];
  const otilldelat = [];
  for (const c of matningar.commission ?? []) {
    const person = personer.find((p) => p.id === c.personId || p.commissionId === c.personId);
    const bevis = { vad: `${c.annonser ?? 0} annonser`, datum: c.datum ?? '', text: 'Andel av annonsspenden', lank: '' };
    if (!person) {
      otilldelat.push({ uppdrag: uppdrag.id, orsak: `"${c.namn ?? c.personId}" har inget konto på sajten`, bevis, summa: c.usd });
      continue;
    }
    rader.push({ personId: person.id, belopp: Number(c.usd) || 0, bevis, redanRaknad: true });
  }
  return { rader, otilldelat };
}

/**
 * Vilken halva av månaden en rad hör till: 'forsta' (1–15), 'andra' (16–sista)
 * eller 'manad' (commission och rader utan datum — de går inte att dela ärligt).
 */
export function halvaFor(rad, uppdrag = {}) {
  if (rad.redanRaknad || uppdrag.kalla === 'commission') return 'manad';
  const m = /^\d{4}-\d{2}-(\d{2})/.exec(String(rad.bevis?.datum ?? ''));
  if (!m) return 'manad';
  return Number(m[1]) <= 15 ? 'forsta' : 'andra';
}

// ------------------------------------------------------------ huvudräkningen

/**
 * @param regler    bonus/regler.json
 * @param personer  [{ id, namn, roll, brands[], notionNamn, commissionId, alias[] }]
 * @param matningar { recensioner, tvister, kundtjanst, produkttest, commission }
 * @param insatser  inrapporterade insatser (godkända räknas)
 * @param period    { fran: 'YYYY-MM-DD', till: 'YYYY-MM-DD', namn }
 */
export function raknaUt({ regler, personer = [], matningar = {}, insatser = [], period }) {
  const perPerson = new Map(personer.map((p) => [p.id, {
    id: p.id, namn: p.namn, roll: p.roll, extraRoller: p.extraRoller ?? [], valuta: regler.valuta ?? 'USD',
    summa: 0, rader: [], program: null, programs: [], halvor: { forsta: 0, andra: 0, manad: 0 },
  }]));
  const otilldelat = [];
  let recensionsTraffar = [];

  for (const [programId, program] of Object.entries(regler.program ?? {})) {
    const iProgrammet = personer.filter((p) => (program.roller ?? []).some((r) => harRollen(p, r)));
    for (const p of iProgrammet) {
      const rad = perPerson.get(p.id);
      if (!rad) continue;
      if (!rad.program) rad.program = { id: programId, namn: program.namn };
      if (!rad.programs.some((x) => x.id === programId)) rad.programs.push({ id: programId, namn: program.namn });
    }

    for (const uppdrag of program.uppdrag ?? []) {
      const u = { ...uppdrag, roller: program.roller ?? [] };
      let resultat = { rader: [], otilldelat: [] };

      switch (u.kalla) {
        case 'recensioner':
          resultat = u.id === 'recension_streak'
            ? streakrader(u, recensionsTraffar)
            : recensionsrader(u, iProgrammet, matningar, period);
          if (u.id !== 'recension_streak') recensionsTraffar = resultat.rader;
          break;
        case 'tvister':
          resultat = tvistrader(u, iProgrammet, matningar, insatser, period);
          break;
        case 'kundtjanst':
          resultat = kundtjanstrader(u, personer, matningar, period);
          break;
        case 'produkttest':
          resultat = produkttestrader(u, iProgrammet, matningar, period);
          break;
        case 'commission':
          resultat = commissionrader(u, iProgrammet, matningar);
          break;
        case 'team':
          continue; // räknas sist, när teamets summor är kända
        default:
          break;
      }

      for (const r of resultat.rader) {
        const person = perPerson.get(r.personId);
        if (!person) continue;
        const fanns = person.rader.find((x) => x.uppdrag === u.id);
        const post = fanns ?? { uppdrag: u.id, namn: u.namn, enhet: u.enhet, antal: 0, summa: 0, bevis: [] };
        post.antal += 1;
        post.summa += Number(r.belopp) || 0;
        // Halvmånaderna (Josh 2026-09-24: "our pay cycle is bi-weekly — 1st–15th
        // and 16th–31st"). En rad hamnar i den halva dess bevisdatum ligger i.
        // Commission är en andel av HELA månadens spend och har inget eget
        // datum per annons — den delas aldrig, den står som 'manad'.
        const halva = halvaFor(r, u);
        post.halvor = post.halvor ?? { forsta: 0, andra: 0, manad: 0 };
        post.halvor[halva] += Number(r.belopp) || 0;
        person.halvor[halva] += Number(r.belopp) || 0;
        if (post.bevis.length < 25) post.bevis.push(r.bevis);
        if (!fanns) person.rader.push(post);
        person.summa += Number(r.belopp) || 0;
      }
      otilldelat.push(...resultat.otilldelat.map((o) => ({ ...o, program: programId })));
    }
  }

  // Andelsuppdrag (Head of support får del av teamets bonus) räknas sist.
  // Chefens EGNA rader räknas aldrig in — Mechile är både VA och Head of
  // support (2026-09-21), och tio procent på sig själv är ingen teambonus.
  for (const [, program] of Object.entries(regler.program ?? {})) {
    for (const uppdrag of program.uppdrag ?? []) {
      if (uppdrag.kalla !== 'team') continue;
      for (const chef of [...perPerson.values()].filter((p) => (program.roller ?? []).some((r) => p.roll === r || (p.extraRoller ?? []).includes(r)))) {
        const team = [...perPerson.values()].filter((p) => p.id !== chef.id && harRollen(p, 'va'));
        const teamsumma = team.reduce((s, p) => s + p.summa, 0);
        if (teamsumma <= 0) continue;
        const summa = teamsumma * (Number(uppdrag.belopp) || 0);
        chef.rader.push({
          uppdrag: uppdrag.id, namn: uppdrag.namn, enhet: uppdrag.enhet, antal: team.length, summa,
          bevis: team.filter((p) => p.summa > 0).map((p) => ({ vad: p.namn, text: `tjänade ${p.summa.toFixed(2)}`, datum: '', lank: '' })),
        });
        chef.summa += summa;
        chef.halvor.manad += summa;
      }
    }
  }

  const avrunda = (h) => Object.fromEntries(Object.entries(h).map(([k, v]) => [k, Math.round(v * 100) / 100]));
  const ut = [...perPerson.values()]
    .map((p) => ({ ...p, summa: Math.round(p.summa * 100) / 100, halvor: avrunda(p.halvor) }))
    .sort((a, b) => b.summa - a.summa);

  return {
    period,
    valuta: regler.valuta ?? 'USD',
    personer: ut,
    summa: Math.round(ut.reduce((s, p) => s + p.summa, 0) * 100) / 100,
    otilldelat,
    raknat: new Date().toISOString(),
  };
}

/** Uppdragen en viss roll kan tjäna på — det sidan visar som "dina uppdrag". */
export function uppdragForRoll(regler, roll) {
  const roller = Array.isArray(roll) ? roll : [roll];
  const ut = [];
  for (const [id, program] of Object.entries(regler?.program ?? {})) {
    if (!(program.roller ?? []).some((r) => roller.includes(r))) continue;
    ut.push({
      programId: id,
      namn: program.namn,
      beskrivning: program.beskrivning,
      en: program.en ?? null,
      uppdrag: program.uppdrag ?? [],
    });
  }
  return ut;
}
