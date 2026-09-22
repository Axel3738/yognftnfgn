// vy/tjanster.mjs — den publika sidan /tjanster: vi driver e-handel och kan
// hjälpa andra med sin (Axels beslut 2026-09-21: "att vi också kan bedriva
// konsulttjänster inom all möjliga grejer, liksom inom e-handel").
//
// Samma regler som startsidan: allt kommer ur profil.json (blocket
// `tjanster`), inga kundnamn, inga priser, inga påhittade resultat och inte
// ett ord om vilka butiker vi driver. Kontakten går till kontakt.epost.

import { esc, attr } from './delar.mjs';
import { publiktSkal } from './layout.mjs';
import { rutor, bild, publikaFotlankar } from './publik.mjs';

export function tjansterSida({ profil, inloggad = false, nonce = '' }) {
  const bolag = profil?.bolag ?? {};
  const tj = profil?.tjanster ?? {};
  const kontakt = profil?.kontakt ?? {};
  const bilder = profil?.bilder ?? {};
  const epost = String(kontakt.epost ?? '').trim();
  const amne = encodeURIComponent('Hjälp med vår e-handel');
  const mejl = epost ? `mailto:${epost}?subject=${amne}` : '';
  const steg = (tj.sa_jobbar_vi ?? []).filter((s) => s?.titel);

  const innehall = `
<section class="hero hero-liten">
  <div class="aura" aria-hidden="true"><span class="orb orb-1"></span><span class="orb orb-2"></span></div>
  <div class="omslag intro">
    <p class="chip" style="--n:0"><span class="puls" aria-hidden="true"></span>${esc(tj.etikett ?? 'Tjänster')}</p>
    <h1 style="--n:1">${esc(tj.rubrik ?? 'Konsult inom e-handel')}</h1>
    ${tj.ingress ? `<p class="ingress" style="--n:2">${esc(tj.ingress)}</p>` : ''}
    <div class="hero-knappar" style="--n:3">
      ${mejl ? `<a class="knapp glod" href="${attr(mejl)}">Skriv till oss</a>` : ''}
      <a class="knapp tyst" href="#sa-jobbar-vi">Så jobbar vi</a>
    </div>
  </div>
</section>

${bilder.tjanster?.fil ? `<section class="sektion tunn"><div class="omslag avslojas">
  ${bild(bilder.tjanster, { klass: 'bred', lat: false, bredd: 1248, hojd: 702 })}
</div></section>` : ''}

<section class="sektion" id="omraden"><div class="omslag">
  <p class="sektion-etikett avslojas">Vad vi kan hjälpa med</p>
  <h2 class="avslojas" style="--n:1;margin-bottom:34px">Det vi gör i våra egna butiker varje dag.</h2>
  ${rutor(tj.omraden, { kolumner: 'rutnat-4' })}
</div></section>

${steg.length ? `<section class="sektion morkt" id="sa-jobbar-vi"><div class="omslag">
  <p class="sektion-etikett avslojas">Så jobbar vi</p>
  <h2 class="avslojas" style="--n:1;margin-bottom:40px">Tre steg. Inga luddiga mål.</h2>
  <div class="stegrad">
    ${steg.map((s, i) => `<div class="steg avslojas" style="--n:${i}">
      <div class="steg-nr">${esc(s.steg ?? String(i + 1))}</div>
      <h3>${esc(s.titel)}</h3>
      <p>${esc(s.text ?? '')}</p>
    </div>`).join('')}
  </div>
</div></section>` : ''}

<section class="sektion" id="kontakt"><div class="omslag">
  <div class="kontaktruta avslojas">
    <div>
      <h2>${esc(tj.kontakt_rubrik ?? 'Vill ni prata?')}</h2>
      ${tj.kontakt_text ? `<p class="ingress">${esc(tj.kontakt_text)}</p>` : ''}
    </div>
    ${epost ? `<div class="kontakt-knappar">
      <a class="knapp glod" href="${attr(mejl)}">${esc(epost)}</a>
      <span class="mini">${esc(bolag.namn ?? 'Stonebite Ecom AB')}${bolag.orgnr ? ` · Org.nr ${esc(bolag.orgnr)}` : ''}</span>
    </div>` : ''}
  </div>
</div></section>`;

  return publiktSkal({
    titel: `Tjänster — ${bolag.namn ?? 'Stonebite Ecom AB'}`,
    beskrivning: tj.ingress ?? 'Konsulttjänster inom e-handel från ett bolag som driver egna butiker.',
    innehall,
    fot: profil?.publik_fot ?? bolag.namn ?? '',
    fotLankar: publikaFotlankar(profil),
    inloggad,
    nonce,
    stig: '/tjanster',
  });
}
