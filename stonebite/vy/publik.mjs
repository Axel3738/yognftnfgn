// vy/publik.mjs — sidan vem som helst ser på stonebite.org.
//
// Den berättar vad bolaget gör och inget annat: inga siffror om försäljning,
// inga kundnamn, inga butiksdetaljer som konkurrenter kan använda. Allt som
// står här kommer ur stonebite/profil.json — tomma fält ritas inte alls,
// så sidan kan aldrig påstå något som ingen fyllt i.
//
// ⚠️ BUTIKERNA NÄMNS ALDRIG HÄR (Axels order 2026-09-21, sidan hade legat
// live med alla elva namn och domäner i en lista, och han sa det igen samma
// kväll: "jag vill verkligen inte att det ska stå någonting om någon av våra
// … eller vad några av våra butiker heter"). En konkurrent som läser
// stonebite.org ska inte få veta vilka butiker vi driver, hur många de är
// eller vilka domäner de ligger på — det är en färdig kopieringslista.
// `profil.varumarken` finns kvar i filen men renderas BARA inloggad, på
// sidan Butiker. Bygg aldrig tillbaka listan, antalet eller de härledda
// siffrorna ("Varumärken 11", "Länder vi säljer i 6") på den publika sidan.
// Ett test i `test/server.test.mjs` hämtar `/` och `/tjanster` och letar
// efter varje butiksnamn och varje domän ur profil.json — det ska förbli
// rött om någon försöker igen.
//
// Tre grenar visas (Axels beslut 2026-09-21): e-handeln, YouTube-kanalen och
// konsulttjänsterna. YouTube står som en egen verksamhet med flit — bolaget
// lägger tid, utrustning och resor på den, och sidan ska visa det.

import { esc, attr } from './delar.mjs';
import { publiktSkal } from './layout.mjs';

/** Rutnät av rutor som scrollas fram en i taget (`--n` styr fördröjningen). */
export function rutor(punkter, { kolumner = null } = {}) {
  if (!punkter?.length) return '';
  const klass = kolumner ?? (punkter.length >= 4 ? 'rutnat-4' : punkter.length === 3 ? 'rutnat-3' : 'rutnat-2');
  return `<div class="rutnat ${klass}">${punkter.map((p, i) => `
    <article class="ruta avslojas" style="--n:${i}">
      <h3>${esc(p.titel)}</h3>
      <p>${esc(p.text)}</p>
    </article>`).join('')}</div>`;
}

/** En bild i ram med glöd bakom. Tom fil ⇒ ingenting. */
export function bild(b, { klass = '', lat = true, bredd = null, hojd = null } = {}) {
  if (!b?.fil) return '';
  const matt = bredd && hojd ? ` width="${bredd}" height="${hojd}"` : '';
  return `<figure class="bild-ram ${klass}" data-tilt>
    <img src="${attr(b.fil)}" alt="${attr(b.alt ?? '')}"${matt}${lat ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>
  </figure>`;
}

/** Det rullande bandet under heron: orden ur profil.hero.band, två varv. */
function band(ord) {
  const lista = (ord ?? []).filter(Boolean);
  if (!lista.length) return '';
  const varv = lista.map((o) => `<span class="band-ord">${esc(o)}</span><span class="band-prick" aria-hidden="true"></span>`).join('');
  return `<div class="band" aria-hidden="true"><div class="band-spar">${varv}${varv}</div></div>`;
}

/** Sidfotens länkar — YouTube-kanalen bara om adressen är ifylld. */
export function publikaFotlankar(profil) {
  const yt = profil?.youtube?.url;
  return [
    yt ? { titel: 'YouTube', url: yt, extern: true } : null,
    { titel: 'Tjänster', url: '/tjanster' },
    profil?.kontakt?.epost ? { titel: 'Kontakt', url: `mailto:${profil.kontakt.epost}` } : null,
  ].filter(Boolean);
}

function youtubeSektion(yt, bildYt) {
  if (!yt?.rubrik && !yt?.text) return '';
  const url = String(yt.url ?? '').trim();
  const format = (yt.format ?? []).filter((f) => f?.titel);
  return `
<section class="sektion" id="youtube"><div class="omslag">
  <div class="delad">
    <div class="delad-bild avslojas">
      ${url ? `<a class="spela" href="${attr(url)}" target="_blank" rel="noopener" aria-label="Öppna YouTube-kanalen">` : ''}
      ${bild(bildYt, { klass: 'bred', bredd: 1248, hojd: 702 })}
      ${url ? `<span class="spela-knapp" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg></span></a>` : ''}
    </div>
    <div class="delad-text">
      <p class="sektion-etikett avslojas">${esc(yt.etikett ?? 'YouTube')}</p>
      <h2 class="avslojas" style="--n:1">${esc(yt.rubrik ?? '')}</h2>
      ${yt.text ? `<p class="ingress avslojas" style="--n:2">${esc(yt.text)}</p>` : ''}
      ${url ? `<div class="hero-knappar avslojas" style="--n:3">
        <a class="knapp glod" href="${attr(url)}" target="_blank" rel="noopener">${esc(yt.knapp ?? 'Till kanalen')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
        </a>
      </div>` : ''}
    </div>
  </div>
  ${format.length ? `<div style="margin-top:40px">${rutor(format, { kolumner: 'rutnat-3' })}</div>` : ''}
</div></section>`;
}

function tjansterTeaser(tj) {
  if (!tj?.rubrik) return '';
  const tre = (tj.omraden ?? []).slice(0, 3);
  return `
<section class="sektion morkt" id="tjanster"><div class="omslag">
  <div class="delad">
    <div class="delad-text">
      <p class="sektion-etikett avslojas">${esc(tj.etikett ?? 'Tjänster')}</p>
      <h2 class="avslojas" style="--n:1">${esc(tj.rubrik)}</h2>
      ${tj.ingress ? `<p class="ingress avslojas" style="--n:2">${esc(tj.ingress)}</p>` : ''}
      <div class="hero-knappar avslojas" style="--n:3">
        <a class="knapp ljus" href="/tjanster">Se tjänsterna</a>
      </div>
    </div>
    <ul class="punktlista avslojas" style="--n:2">
      ${tre.map((o) => `<li><b>${esc(o.titel)}</b><span>${esc(o.text)}</span></li>`).join('')}
    </ul>
  </div>
</div></section>`;
}

/**
 * @param profil stonebite/profil.json
 * @param fakta  { butiker, marknader } räknade ur snapshoten — används inte längre
 *               publikt (antalet butiker är hemligt), parametern står kvar för API:ets skull
 */
export function publikSida({ profil, fakta = null, inloggad = false, nonce = '' }) {
  void fakta;
  const bolag = profil?.bolag ?? {};
  const hero = profil?.hero ?? {};
  const kontakt = profil?.kontakt ?? {};
  const bilder = profil?.bilder ?? {};

  // Bara siffror någon skrivit in för hand i profil.json. Antalet butiker och
  // antalet länder räknades förut ur varumärkeslistan — det säger en
  // konkurrent hur stor verksamheten är och togs bort med listan.
  const siffror = (profil?.siffror ?? [])
    .filter((s) => String(s.varde ?? '').trim() && String(s.etikett ?? '').trim());

  const innehall = `
<section class="hero hero-stor">
  <div class="aura" aria-hidden="true"><span class="orb orb-1"></span><span class="orb orb-2"></span><span class="orb orb-3"></span></div>
  <div class="omslag hero-rutnat">
    <div class="intro">
      ${hero.overrad ? `<p class="chip" style="--n:0"><span class="puls" aria-hidden="true"></span>${esc(hero.overrad)}</p>` : ''}
      <h1 style="--n:1">${esc(hero.rubrik ?? 'Stonebite')}</h1>
      ${hero.underrad ? `<p class="ingress" style="--n:2">${esc(hero.underrad)}</p>` : ''}
      <div class="hero-knappar" style="--n:3">
        <a class="knapp glod" href="#vad-vi-gor">Vad vi gör</a>
        <a class="knapp tyst" href="/tjanster">Tjänster</a>
        ${profil?.youtube?.url ? `<a class="knapp tyst" href="${attr(profil.youtube.url)}" target="_blank" rel="noopener">YouTube</a>` : ''}
      </div>
    </div>
    <div class="hero-bild">
      ${bild(bilder.hero, { klass: 'svav', lat: false, bredd: 1248, hojd: 832 })}
    </div>
  </div>
  ${band(hero.band)}
</section>

${siffror.length ? `<section class="sektion"><div class="omslag">
  <div class="rutnat ${siffror.length >= 3 ? 'rutnat-3' : 'rutnat-2'}">
    ${siffror.map((s, i) => `<div class="ruta avslojas" style="--n:${i}"><div class="etikett" style="font-size:11px;text-transform:uppercase;letter-spacing:.13em;color:var(--ink-3);font-weight:600">${esc(s.etikett)}</div><div style="font-size:40px;font-weight:600;letter-spacing:-.04em;margin-top:8px">${esc(s.varde)}</div></div>`).join('')}
  </div>
</div></section>` : ''}

<section class="sektion" id="vad-vi-gor"><div class="omslag">
  <p class="sektion-etikett avslojas">Vad vi gör</p>
  <h2 class="avslojas" style="--n:1;margin-bottom:34px">Vi äger hela kedjan — från produkten till paketet som knackar på dörren.</h2>
  ${rutor(profil?.vad_vi_gor)}
  ${bilder.paket?.fil || bilder.varlden?.fil ? `<div class="bildrad">
    ${bilder.paket?.fil ? `<div class="avslojas" style="--n:0">${bild(bilder.paket, { bredd: 1024, hojd: 1280 })}<p class="bildtext">Paketet som knackar på dörren. Spårning kunden förstår, mejl när något händer.</p></div>` : ''}
    ${bilder.varlden?.fil ? `<div class="avslojas" style="--n:1">${bild(bilder.varlden, { bredd: 1024, hojd: 1280 })}<p class="bildtext">Fem länder i drift. Samma maskin, landets språk och valuta.</p></div>` : ''}
  </div>` : ''}
</div></section>

${youtubeSektion(profil?.youtube, bilder.youtube)}

${tjansterTeaser(profil?.tjanster)}

<section class="sektion" id="bolaget"><div class="omslag">
  <p class="sektion-etikett avslojas">Bolaget</p>
  <h2 class="avslojas" style="--n:1">${esc(bolag.namn ?? 'Stonebite Ecom AB')}</h2>
  <div class="rutnat rutnat-3" style="margin-top:34px">
    ${bolag.orgnr ? `<div class="ruta avslojas" style="--n:0"><h3>Organisationsnummer</h3><p>${esc(bolag.orgnr)}</p></div>` : ''}
    ${bolag.adress ? `<div class="ruta avslojas" style="--n:1"><h3>Adress</h3><p>${esc(bolag.adress)}${bolag.land ? `<br>${esc(bolag.land)}` : ''}</p></div>` : ''}
    ${kontakt.epost ? `<div class="ruta avslojas" style="--n:2"><h3>Kontakt</h3><p><a href="mailto:${attr(kontakt.epost)}" style="border-bottom:1px solid var(--linje-stark)">${esc(kontakt.epost)}</a>${kontakt.telefon ? `<br>${esc(kontakt.telefon)}` : ''}</p></div>` : ''}
  </div>
</div></section>`;

  return publiktSkal({
    titel: `${bolag.namn ?? 'Stonebite Ecom AB'} — e-handel, film och konsult`,
    beskrivning: hero.underrad ?? 'Stonebite Ecom AB driver egna e-handelsbutiker i Norden och USA.',
    innehall,
    fot: profil?.publik_fot ?? bolag.namn ?? '',
    fotLankar: publikaFotlankar(profil),
    inloggad,
    nonce,
    stig: '/',
  });
}
