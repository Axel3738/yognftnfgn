// Genererar butikens köpvillkor ur produktfilen.
//
// Utan retur-, frakt- och köpvillkor godkänner varken Meta eller Shopify Payments
// butiken. Texterna byggs av det som FAKTISKT står i produktfilen — leveranstid,
// fraktpris, garanti — plus det som är lag i Sverige (14 dagars ångerrätt enligt
// distansavtalslagen, 3 års reklamationsrätt enligt konsumentköplagen).
//
// ⚠️ Inget här är juridisk rådgivning. Texterna är branschstandard och ska läsas
// igenom av Axel innan butiken går live. Saknas företagsuppgifter i produktfilen
// märks luckorna ut som [FYLL I] i stället för att gissas.

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

const LUCKA = '[FYLL I]';

function foretag(p) {
  return {
    namn: text(p.brand?.org_namn) ?? text(p.brand?.namn) ?? LUCKA,
    epost: text(p.brand?.kontakt_epost) ?? LUCKA,
    orgnr: text(p.brand?.orgnr) ?? LUCKA,
    adress: text(p.brand?.adress) ?? LUCKA,
  };
}

function pris(belopp, valuta) {
  if (typeof belopp !== 'number') return null;
  return belopp === 0 ? 'fri frakt' : `${belopp} ${valuta === 'SEK' ? 'kr' : valuta}`;
}

// Returvillkoren kommer ur butikskonfigen. Faller tillbaka på svensk lag
// (distansavtalslagen 14 dagar, konsumentköplagen 3 år) när inget är satt.
function retur(p) {
  const r = p.retur ?? {};
  const num = (v, standard) => (typeof v === 'number' && v > 0 ? v : standard);
  return {
    oppetKop: num(r.oppet_kop_dagar, null),
    angerratt: num(r.angerratt_dagar, 14),
    reklamationAr: num(r.reklamation_ar, 3),
    aterbetalning: num(r.aterbetalning_dagar, 14),
    returfraktKund: (r.returfrakt_betalas_av ?? 'kund') === 'kund',
  };
}

// Hur många dagars öppet köp butiken lovar. Konfigen först, garantitexten som
// reserv för produktfiler som ännu inte flyttat över till butikskonfigen.
export function oppetKop(p) {
  const konfig = p.retur?.oppet_kop_dagar;
  if (typeof konfig === 'number' && konfig > 0) return konfig;
  for (const rad of lista(p.garantier)) {
    const m = String(rad).match(/(\d+)\s*dag/i);
    if (m) return Number(m[1]);
  }
  return null;
}

export function returpolicy(p) {
  const f = foretag(p);
  const r = retur(p);
  const dagar = oppetKop(p);
  const eget = dagar && dagar > r.angerratt;
  // Rubriken nämner öppet köp bara när butiken faktiskt ger mer än lagen
  // (Axels beslut 2026-09-08: svensk lag, inga egna köplöften).
  return `<h2>${eget ? 'Ångerrätt och öppet köp' : 'Ångerrätt'}</h2>
<p>Du har enligt distansavtalslagen ${r.angerratt} dagars ångerrätt från den dag du tog emot varan.${
    eget ? ` Vi ger dig utöver det ${dagar} dagars öppet köp.` : ''
  }</p>
<p>Varan ska returneras i väsentligen oförändrat skick. ${
    r.returfraktKund
      ? 'Du ansvarar för returfrakten om inget annat avtalats.'
      : 'Vi betalar returfrakten.'
  }</p>

<h2>Så gör du en retur</h2>
<ol>
  <li>Mejla ${f.epost} och uppge ditt ordernummer.</li>
  <li>Du får en returinstruktion inom två arbetsdagar.</li>
  <li>Skicka tillbaka varan enligt instruktionen.</li>
</ol>
<p>Återbetalning sker till samma betalsätt inom ${r.aterbetalning} dagar från det att vi tagit emot returen.</p>

<h2>Reklamation</h2>
<p>Är varan felaktig har du enligt konsumentköplagen rätt att reklamera i upp till ${r.reklamationAr} år. Kontakta ${f.epost} med bilder på felet.</p>

<h2>Kontakt</h2>
<p>${f.namn}${f.orgnr !== LUCKA ? `, org.nr ${f.orgnr}` : ''}<br>${f.epost}</p>`;
}

export function fraktpolicy(p) {
  const s = p.shipping ?? {};
  const valuta = p.ekonomi?.valuta ?? 'SEK';
  const kostnad = pris(s.kostnad, valuta);
  const gratis = s.gratis_over > 0 ? pris(s.gratis_over, valuta) : null;
  // Varje fraktsätt som finns i kassan ska stå på sidan — annars möts kunden
  // av ett pris som policyn inte nämner.
  const extra = lista(s.alternativ).map((a) => {
    const delar = [text(a.namn) ?? 'Alternativ frakt'];
    const p = pris(a.pris, valuta);
    if (p) delar.push(p);
    if (text(a.tid)) delar.push(a.tid);
    return `<li>${delar.join(': ').replace(/:(?=[^:]*$)/, ',')}</li>`;
  });

  const rader = [
    s.kostnad === 0 ? '<li>Fri frakt</li>' : `<li>Frakt: ${kostnad ?? 'anges i kassan'}</li>`,
    ...(gratis ? [`<li>Fri frakt vid köp över ${gratis}</li>`] : []),
    ...extra,
  ];

  return `<h2>Leveranstid</h2>
<p>${text(s.tid) ? `Normal leveranstid är ${s.tid} från det att ordern lagts.` : `Leveranstid anges vid köp.`} Orderbekräftelse skickas direkt på mejl, och spårningsnummer när paketet lämnat lagret.</p>

<h2>Fraktkostnad</h2>
<ul>
  ${rader.join('\n  ')}
</ul>

<h2>Om leveransen dröjer</h2>
<p>Har paketet inte kommit fram inom angiven tid, mejla ${foretag(p).epost} med ditt ordernummer så löser vi det. Uteblivet paket ersätts eller återbetalas.</p>

<h2>Ej uthämtat paket</h2>
<p>Paket som inte hämtas ut returneras till oss. Vi återbetalar varans pris med avdrag för frakten tur och retur.</p>`;
}

export function kopvillkor(p) {
  const f = foretag(p);
  const valuta = p.ekonomi?.valuta ?? 'SEK';
  return `<h2>Om oss</h2>
<p>Den här butiken drivs av ${f.namn}${f.orgnr !== LUCKA ? ` (org.nr ${f.orgnr})` : ''}. ${
    f.adress !== LUCKA ? `Adress: ${f.adress}.` : ''
  } Kontakt: ${f.epost}.</p>

<h2>Priser och betalning</h2>
<p>Alla priser anges i ${valuta} inklusive eventuell skatt. Betalning sker med de betalsätt som visas i kassan. Vi reserverar oss för prisfel och slutförsäljning.</p>

<h2>Beställning</h2>
<p>Avtal ingås när du fått orderbekräftelse på mejl. Vi förbehåller oss rätten att neka en beställning, till exempel vid uppenbart felaktigt pris.</p>

<h2>Ångerrätt</h2>
<p>Se vår returpolicy. Du har alltid minst ${retur(p).angerratt} dagars ångerrätt enligt distansavtalslagen.</p>

<h2>Personuppgifter</h2>
<p>Vi behandlar dina uppgifter enligt vår integritetspolicy. Du har rätt att få veta vilka uppgifter vi har om dig och att få dem raderade.</p>

<h2>Tvist</h2>
<p>Vid tvist följer vi ${text(p.policyText?.tvistlosning) ?? 'Allmänna reklamationsnämndens'} rekommendationer.${
      p.policyText?.visa_odr_lank === false
        ? ''
        : ' Du kan även vända dig till EU:s plattform för tvistlösning på ec.europa.eu/odr.'
    }</p>`;
}

export function kontaktsida(p) {
  const f = foretag(p);
  const s = p.shipping ?? {};
  return `<h2>Kontakta oss</h2>
<p>Mejla ${f.epost} så svarar vi inom ${text(p.policyText?.svarstid) ?? 'en arbetsdag'}.</p>
<p>Har du en pågående order, skriv ditt ordernummer i ämnesraden så går det snabbare.</p>

<h2>Vanliga ärenden</h2>
<ul>
  <li>Var är mitt paket? ${text(s.tid) ? `Normal leveranstid är ${s.tid}.` : 'Se fraktpolicyn.'}</li>
  <li>Jag vill returnera. Se vår returpolicy.</li>
  <li>Varan är trasig. Mejla oss bilder så löser vi det direkt.</li>
</ul>

<h2>Företagsuppgifter</h2>
<p>${f.namn}${f.orgnr !== LUCKA ? `<br>Org.nr ${f.orgnr}` : ''}${
    f.adress !== LUCKA ? `<br>${f.adress}` : ''
  }<br>${f.epost}</p>`;
}

// Allt på en gång, i det format Shopifys shopPolicyUpdate vill ha.
// `handle` är sidan samma text läggs på — Shopifys officiella policyfält kräver
// scopet write_legal_policies, sidorna klarar sig på write_content.
export function byggPolicyer(p) {
  return [
    { type: 'REFUND_POLICY', namn: 'Returpolicy', handle: 'returpolicy', body: returpolicy(p) },
    { type: 'SHIPPING_POLICY', namn: 'Fraktpolicy', handle: 'fraktpolicy', body: fraktpolicy(p) },
    { type: 'TERMS_OF_SERVICE', namn: 'Köpvillkor', handle: 'kopvillkor', body: kopvillkor(p) },
  ];
}

// Vilka företagsuppgifter som saknas och därför står som [FYLL I] i texterna.
export function saknadeUppgifter(p) {
  const f = foretag(p);
  return Object.entries({
    'brand.kontakt_epost': f.epost,
    'brand.org_namn': f.namn,
    'brand.orgnr': f.orgnr,
    'brand.adress': f.adress,
  })
    .filter(([, varde]) => varde === LUCKA)
    .map(([falt]) => falt);
}
