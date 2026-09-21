// vy/publik.mjs — sidan vem som helst ser på stonebite.org.
//
// Den berättar vad bolaget gör och inget annat: inga siffror om försäljning,
// inga kundnamn, inga butiksdetaljer som konkurrenter kan använda. Allt som
// står här kommer ur stonebite/profil.json — tomma fält ritas inte alls,
// så sidan kan aldrig påstå något som ingen fyllt i.

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

function varumarken(lista) {
  if (!lista?.length) return '';
  return `<div class="brands">${lista.map((m) => `
    <article class="brand">
      <span class="brand-land">${esc(m.land ?? '')}</span>
      <span class="brand-namn">${esc(m.namn)}</span>
      ${m.text ? `<p>${esc(m.text)}</p>` : ''}
      ${m.url ? `<a class="lank" href="${attr(m.url)}" rel="noopener">${esc(String(m.url).replace(/^https?:\/\//, ''))}</a>` : ''}
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

  // Siffrorna räknas ur listan av varumärken — alltså ur samma fakta som
  // står längre ned på sidan. Inga tal som ingen kan kontrollera.
  const marken = profil?.varumarken ?? [];
  const lander = new Set(marken.flatMap((m) => String(m.land ?? '').split(',').map((l) => l.trim()).filter(Boolean)));
  const siffror = [
    marken.length ? { etikett: 'Varumärken', varde: String(marken.length) } : null,
    lander.size ? { etikett: 'Länder vi säljer i', varde: String(lander.size) } : null,
    ...(profil?.siffror ?? []).filter((s) => String(s.varde ?? '').trim() && String(s.etikett ?? '').trim()),
  ].filter(Boolean);

  const innehall = `
<section class="hero"><div class="omslag">
  <h1>${esc(hero.rubrik ?? 'Stonebite')}</h1>
  ${hero.underrad ? `<p class="ingress">${esc(hero.underrad)}</p>` : ''}
  <div class="hero-knappar">
    <a class="knapp" href="#varumarken">Se våra butiker</a>
    <a class="knapp tyst" href="/logga-in">Logga in</a>
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

<section class="sektion" id="varumarken"><div class="omslag">
  <p class="sektion-etikett">Varumärken</p>
  <h2 style="margin-bottom:34px">Butikerna vi driver.</h2>
  ${varumarken(profil?.varumarken)}
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
