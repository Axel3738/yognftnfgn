// vy/publik.mjs — sidan vem som helst ser på stonebite.org.
//
// Den berättar vad bolaget gör och inget annat: inga siffror om försäljning,
// inga kundnamn, inga butiksdetaljer som konkurrenter kan använda. Allt som
// står här kommer ur stonebite/profil.json — tomma fält ritas inte alls,
// så sidan kan aldrig påstå något som ingen fyllt i.
//
// ⚠️ BUTIKERNA NÄMNS ALDRIG HÄR (Axels order 2026-09-21, sidan hade legat
// live med alla elva namn och domäner i en lista). En konkurrent som läser
// stonebite.org ska inte få veta vilka butiker vi driver, hur många de är
// eller vilka domäner de ligger på — det är en färdig kopieringslista.
// `profil.varumarken` finns kvar i filen men renderas BARA inloggad, på
// sidan Butiker. Bygg aldrig tillbaka listan, antalet eller de härledda
// siffrorna ("Varumärken 11", "Länder vi säljer i 6") på den publika sidan.
// Ett test i `test/server.test.mjs` hämtar `/` och letar efter varje
// butiksnamn och varje domän ur profil.json — det ska förbli rött om någon
// försöker igen.

import { esc, attr } from './delar.mjs';
import { publiktSkal } from './layout.mjs';

function rutor(punkter) {
  if (!punkter?.length) return '';
  const kolumner = punkter.length >= 4 ? 'rutnat-4' : punkter.length === 3 ? 'rutnat-3' : 'rutnat-2';
  return `<div class="rutnat ${kolumner}">${punkter.map((p) => `
    <article class="ruta">
      <h3>${esc(p.titel)}</h3>
      <p>${esc(p.text)}</p>
    </article>`).join('')}</div>`;
}

/**
 * @param profil stonebite/profil.json
 * @param fakta  { butiker, marknader } räknade ur snapshoten — bara sanna tal
 */
export function publikSida({ profil, fakta = null, inloggad = false, nonce = '' }) {
  const bolag = profil?.bolag ?? {};
  const hero = profil?.hero ?? {};
  const kontakt = profil?.kontakt ?? {};

  // Bara siffror någon skrivit in för hand i profil.json. Antalet butiker och
  // antalet länder räknades förut ur varumärkeslistan — det säger en
  // konkurrent hur stor verksamheten är och togs bort med listan.
  const siffror = (profil?.siffror ?? [])
    .filter((s) => String(s.varde ?? '').trim() && String(s.etikett ?? '').trim());

  const innehall = `
<section class="hero"><div class="omslag">
  <h1>${esc(hero.rubrik ?? 'Stonebite')}</h1>
  ${hero.underrad ? `<p class="ingress">${esc(hero.underrad)}</p>` : ''}
  <div class="hero-knappar">
    <a class="knapp" href="/logga-in">Logga in</a>
    <a class="knapp tyst" href="#vad-vi-gor">Vad vi gör</a>
  </div>
</div></section>

${siffror.length ? `<section class="sektion" style="border-top:1px solid var(--linje)"><div class="omslag">
  <div class="rutnat ${siffror.length >= 3 ? 'rutnat-3' : 'rutnat-2'}">
    ${siffror.map((s) => `<div class="ruta"><div class="etikett" style="font-size:11px;text-transform:uppercase;letter-spacing:.13em;color:var(--ink-3);font-weight:600">${esc(s.etikett)}</div><div style="font-size:40px;font-weight:600;letter-spacing:-.04em;margin-top:8px">${esc(s.varde)}</div></div>`).join('')}
  </div>
</div></section>` : ''}

<section class="sektion" id="vad-vi-gor"><div class="omslag">
  <p class="sektion-etikett">Vad vi gör</p>
  <h2 style="margin-bottom:34px">Vi äger hela kedjan — från produkten till paketet som knackar på dörren.</h2>
  ${rutor(profil?.vad_vi_gor)}
</div></section>

<section class="sektion" id="bolaget"><div class="omslag">
  <p class="sektion-etikett">Bolaget</p>
  <h2>${esc(bolag.namn ?? 'Stonebite Ecom AB')}</h2>
  <div class="rutnat rutnat-3" style="margin-top:34px">
    ${bolag.orgnr ? `<div class="ruta"><h3>Organisationsnummer</h3><p>${esc(bolag.orgnr)}</p></div>` : ''}
    ${bolag.adress ? `<div class="ruta"><h3>Adress</h3><p>${esc(bolag.adress)}${bolag.land ? `<br>${esc(bolag.land)}` : ''}</p></div>` : ''}
    ${kontakt.epost ? `<div class="ruta"><h3>Kontakt</h3><p><a href="mailto:${attr(kontakt.epost)}" style="border-bottom:1px solid var(--linje-stark)">${esc(kontakt.epost)}</a>${kontakt.telefon ? `<br>${esc(kontakt.telefon)}` : ''}</p></div>` : ''}
  </div>
</div></section>`;

  return publiktSkal({
    titel: `${bolag.namn ?? 'Stonebite Ecom AB'} — e-handel i Norden`,
    beskrivning: hero.underrad ?? 'Stonebite Ecom AB driver egna e-handelsbutiker i Norden och USA.',
    innehall,
    fot: profil?.publik_fot ?? bolag.namn ?? '',
    inloggad,
    nonce,
  });
}
