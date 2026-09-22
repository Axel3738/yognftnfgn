// vy/influencers.mjs — den publika sidan /influencers: det ENDA bolaget
// erbjuder andra. Axels beslut 2026-09-22: "jag vill inte sälja några jävla
// tjänster eller mentorskap eller någonting. Jag vill bara ha information om
// mitt företag." Konsultsidan (/tjanster, tolv områden) togs bort samma dag;
// adressen svarar 301 hit.
//
// Erbjudandet med Axels ord: butiker som redan kör e-handel och vill ha
// influencers mejlar vilken butik de har och vilken produkt de säljer, och
// får samma dag kontaktuppgifter till mikroinfluencers (5 000–20 000 kr per
// samarbete, "jävligt high performing"). Betalning: fast pris i förskott
// ELLER 10 % av det de totalt lägger på influencers — kunden väljer.
//
// Samma regler som startsidan: allt kommer ur profil.json (blocket
// `influencers`), inga kundnamn, inga påhittade resultat och inte ett ord om
// vilka butiker vi driver. Beloppen står BARA i profilen (`pris.fast`,
// `pris.andel`) — ett tomt belopp ⇒ det alternativet ritas inte, hellre tomt
// än påhittat. Kontakten går till kontakt.epost.

import { esc, attr } from './delar.mjs';
import { publiktSkal } from './layout.mjs';
import { rutor, bild, publikaFotlankar, prisalternativ, influencerPunkter } from './publik.mjs';

export function influencerSida({ profil, inloggad = false, nonce = '' }) {
  const bolag = profil?.bolag ?? {};
  const inf = profil?.influencers ?? {};
  const kontakt = profil?.kontakt ?? {};
  const bilder = profil?.bilder ?? {};
  const epost = String(kontakt.epost ?? '').trim();
  const amne = encodeURIComponent(inf.mejl_amne ?? 'Mikroinfluencers');
  const mejl = epost ? `mailto:${epost}?subject=${amne}` : '';
  const punkter = influencerPunkter(inf);
  const steg = (inf.sa_gar_det_till ?? []).filter((s) => s?.titel);
  const pris = prisalternativ(inf.pris);

  const innehall = `
<section class="hero hero-liten">
  <div class="aura" aria-hidden="true"><span class="orb orb-1"></span><span class="orb orb-2"></span></div>
  <div class="omslag intro">
    <p class="chip" style="--n:0"><span class="puls" aria-hidden="true"></span>${esc(inf.etikett ?? 'Mikroinfluencers')}</p>
    <h1 style="--n:1">${esc(inf.rubrik ?? 'Mikroinfluencers för er butik')}</h1>
    ${inf.ingress ? `<p class="ingress" style="--n:2">${esc(inf.ingress)}</p>` : ''}
    <div class="hero-knappar" style="--n:3">
      ${mejl ? `<a class="knapp glod" href="${attr(mejl)}">Skriv till oss</a>` : ''}
      ${pris.length ? '<a class="knapp tyst" href="#pris">Vad kostar det?</a>' : ''}
    </div>
  </div>
</section>

${bilder.influencers?.fil ? `<section class="sektion tunn"><div class="omslag avslojas">
  ${bild(bilder.influencers, { klass: 'bred', lat: false, bredd: 1248, hojd: 702 })}
</div></section>` : ''}

${punkter.length ? `<section class="sektion" id="vad-ni-far"><div class="omslag">
  <p class="sektion-etikett avslojas">Vad ni får</p>
  <h2 class="avslojas" style="--n:1;margin-bottom:34px">Kontaktuppgifter till mikroinfluencers som passar er produkt.</h2>
  ${rutor(punkter, { kolumner: punkter.length === 3 ? 'rutnat-3' : 'rutnat-2' })}
</div></section>` : ''}

${steg.length ? `<section class="sektion morkt" id="sa-gar-det-till"><div class="omslag">
  <p class="sektion-etikett avslojas">Så går det till</p>
  <h2 class="avslojas" style="--n:1;margin-bottom:40px">Tre steg. Ett mejl från er.</h2>
  <div class="stegrad">
    ${steg.map((s, i) => `<div class="steg avslojas" style="--n:${i}">
      <div class="steg-nr">${esc(s.steg ?? String(i + 1))}</div>
      <h3>${esc(s.titel)}</h3>
      <p>${esc(s.text ?? '')}</p>
    </div>`).join('')}
  </div>
</div></section>` : ''}

${pris.length ? `<section class="sektion" id="pris"><div class="omslag">
  <p class="sektion-etikett avslojas">Pris</p>
  <h2 class="avslojas" style="--n:1;margin-bottom:34px">${esc(inf.pris?.rubrik ?? 'Två sätt att betala.')}</h2>
  <div class="prisval">
    ${pris.map((p, i) => `<div class="pris avslojas" style="--n:${i}">
      <div class="pris-etikett">${esc(p.etikett)}</div>
      <div class="pris-varde">${esc(p.varde)}</div>
      ${p.text ? `<p>${esc(p.text)}</p>` : ''}
    </div>`).join('')}
  </div>
  ${inf.avgransning ? `<p class="pris-not avslojas" style="--n:2">${esc(inf.avgransning)}</p>` : ''}
</div></section>` : ''}

<section class="sektion" id="kontakt"><div class="omslag">
  <div class="kontaktruta avslojas">
    <div>
      <h2>${esc(inf.kontakt_rubrik ?? 'Vill ni ha kontakterna?')}</h2>
      ${inf.kontakt_text ? `<p class="ingress">${esc(inf.kontakt_text)}</p>` : ''}
    </div>
    ${epost ? `<div class="kontakt-knappar">
      <a class="knapp glod" href="${attr(mejl)}">${esc(epost)}</a>
      <span class="mini">${esc(bolag.namn ?? 'Stonebite Ecom AB')}${bolag.orgnr ? ` · Org.nr ${esc(bolag.orgnr)}` : ''}</span>
    </div>` : ''}
  </div>
</div></section>`;

  return publiktSkal({
    titel: `Mikroinfluencers — ${bolag.namn ?? 'Stonebite Ecom AB'}`,
    beskrivning: inf.ingress ?? 'Kontaktuppgifter till mikroinfluencers för butiker som redan kör e-handel.',
    innehall,
    fot: profil?.publik_fot ?? bolag.namn ?? '',
    fotLankar: publikaFotlankar(profil),
    inloggad,
    nonce,
    stig: '/influencers',
  });
}
