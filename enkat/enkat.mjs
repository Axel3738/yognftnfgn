// enkat/enkat.mjs — köparenkäten: mallarna och de rena funktionerna.
//
// Axels beslut A 2026-10-01: bara Matstrumpor, ingen belöning, tre fritextfrågor
// direkt efter köpet (docs/os/evolve/ENKAT.md). Svaren går med Shopifys vanliga
// kontaktformulär till supportlådan, avsända från en fast noreply-adress, så att
// autosvaret aldrig svarar på dem (kundtjanst/arenden.mjs arSystem). Läsaren
// (las.mjs) känner igen enkäten på markören, aldrig på ämnet eller svenska
// etiketter, eftersom Shopifys notis skiftar språk.
//
// Allt här är rent: inga nät-anrop, inga filer utom konfigen.

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { maskaKontakt } from '../kommentarer/maska.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));

export function lasKonfig(fil = join(HAR, 'konfig.json')) {
  return JSON.parse(readFileSync(fil, 'utf8'));
}

/** Frågorna som gäller just nu: reservfrågan ersätter sin plats när den är aktiv. */
export function aktivaFragor(k) {
  return k.fragor.map((f) => (k.reserv?.aktiv && f.nr === k.reserv.ersatter ? { ...f, text: k.reserv.text, reserv: true } : f));
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Temafilen templates/page.<suffix>.liquid. Shopifys kontaktformulär, svensk
 * text, ingen e-post från kunden: contact[email] är butikens noreply-adress.
 * Kanal och produkt kommer ur länkens k= och p= och tvättas till [a-z0-9-].
 */
export function byggMall(k) {
  const fragor = aktivaFragor(k);
  const falt = fragor.map((f) => `
      <div class="enkat__fraga">
        <label for="Enkat${f.nr}"><strong>${f.nr}.</strong> ${esc(f.text)}</label>
        <textarea id="Enkat${f.nr}" name="contact[${esc(f.falt)}]" rows="3" maxlength="1500"></textarea>
      </div>`).join('');
  return `{%- comment -%}
  ${k.version} köparenkäten — byggd av enkat/publicera.mjs. Ändra konfigen, inte den här filen.
  Axels beslut A 2026-10-01: en butik, ingen belöning (docs/os/evolve/ENKAT.md).
{%- endcomment -%}
<div class="page-width page-width--narrow enkat" style="padding-top:2rem;padding-bottom:3rem">
  {%- form 'contact', id: 'EnkatForm' -%}
    {%- if form.posted_successfully? -%}
      <h1 class="h2">Tack för dina svar!</h1>
      <p>De hjälper oss att förstå vilka som handlar hos oss och varför. Ha en fin dag.</p>
    {%- else -%}
      <h1 class="h2">${esc(k.titel)}</h1>
      <p>Svara med egna ord, så kort eller långt du vill. Alla frågor är frivilliga, och det tar ungefär en minut.</p>
      {%- if form.errors -%}<p class="form__message" role="alert">Något gick fel. Försök igen om en stund.</p>{%- endif -%}
      <input type="hidden" name="contact[email]" value="${esc(k.noreply)}">
      <input type="hidden" name="contact[Enkat]" value="${esc(k.version)}">
      <input type="hidden" name="contact[Kanal]" id="EnkatKanal" value="">
      <input type="hidden" name="contact[Produkt]" id="EnkatProdukt" value="">${falt}
      <p class="enkat__gdpr" style="font-size:0.85em;opacity:0.8">Vi frågar inte efter namn eller e-post. Skriv inga namn och inget om din hälsa. Vi sparar svaren i högst ${k.gallring_manader} månader och använder dem för att förbättra våra produkter och annonser. Avidentifierade citat utan namn kan sparas längre. Det är STONEBITE ECOM AB, Stenkolsgatan 1B, 417 07 Göteborg, som frågar. {% if shop.privacy_policy %}<a href="{{ shop.privacy_policy.url }}">Läs mer i vår integritetspolicy</a>.{% endif %}</p>
      <button type="submit" class="button">Skicka svaren</button>
    {%- endif -%}
  {%- endform -%}
  <p style="margin-top:2rem">Frågor om din order? <a href="/pages/contact">Skriv till oss här</a>.</p>
</div>
<style>.enkat__fraga{margin:1.5rem 0}.enkat__fraga label{display:block;margin-bottom:.5rem}.enkat__fraga textarea{width:100%;padding:.75rem;font:inherit}</style>
<script>
  (function () {
    var q = new URLSearchParams(location.search);
    var tvatta = function (v) { return String(v || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60); };
    var k = document.getElementById('EnkatKanal'); if (k) k.value = tvatta(q.get('k'));
    var p = document.getElementById('EnkatProdukt'); if (p) p.value = tvatta(q.get('p'));
  })();
</script>
`;
}

/**
 * Rutan i orderbekräftelsen. Ingen belöning, inget säljande, inget butiksnamn:
 * mejlet är transaktionellt och ska förbli det. Länken bär bara kanal och
 * produktens handle, aldrig e-post eller ordernummer.
 */
export function byggRuta(k) {
  return `{%- comment -%}${k.version} köparenkäten — enkat/orderbekraftelse.mjs (docs/os/evolve/ENKAT.md){%- endcomment -%}
{% unless hide_online_store_links %}{% if shop.url %}
          <table class="row content">
  <tr>
    <td class="content__cell">
      <center>
        <table class="container"{% if buyer_email_rtl == true %} dir="rtl"{% endif %}>
          <tr>
            <td>
              <h3>${esc(k.titel)}</h3>
              <p>Varför valde du just det här? Svara med egna ord, det tar en minut och hjälper oss att bli bättre.</p>
              <table class="button main-action-cell">
                <tr>
                  <td class="button__cell"><a href="{{ shop.url }}/pages/${esc(k.handle)}?k=ob&amp;p={{ line_items.first.product.handle | url_encode }}" class="button__text">Svara på frågorna</a></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </td>
  </tr>
</table>
{% endif %}{% endunless %}
`;
}

/** Lägg rutan före ankaret. Kastar om ankaret inte finns exakt en gång eller rutan redan finns. */
export function infogaRuta(mall, k) {
  if (mall.includes(`${k.version} köparenkäten`)) throw new Error('Rutan finns redan i mallen.');
  const delar = mall.split(k.orderbekraftelse_ankare);
  if (delar.length !== 2) throw new Error(`Ankaret ${k.orderbekraftelse_ankare} finns ${delar.length - 1} gånger, väntat 1.`);
  // Ankaret står indraget på sin rad; lägg rutan före radens indrag.
  const fore = delar[0].replace(/[ \t]*$/, '');
  const indrag = delar[0].slice(fore.length);
  return `${fore}${byggRuta(k)}\n${indrag}${k.orderbekraftelse_ankare}${delar[1]}`;
}

/**
 * Shopifys notis: "Etikett:\nvärde\n\nEtikett:\nvärde". Ger { etikett: värde }.
 * Etiketten är en rad som slutar med kolon och är kort; allt fram till nästa
 * etikett är värdet.
 */
export function tolkaFalt(text) {
  const rader = String(text ?? '').replace(/\r\n/g, '\n').split('\n');
  const ut = {};
  let nu = null;
  for (const rad of rader) {
    const m = rad.match(/^\s*([^:\n]{1,40}):\s*$/);
    if (m) { nu = m[1].trim(); ut[nu] = ''; continue; }
    if (nu) ut[nu] += (ut[nu] ? '\n' : '') + rad;
  }
  for (const n of Object.keys(ut)) ut[n] = ut[n].trim();
  return ut;
}

/** Är mejlet ett enkätsvar? Markören står i kroppen, oavsett språk. */
export function arEnkat(text, k) {
  return new RegExp(`(^|\\n)\\s*${k.version.replace(/[-]/g, '\\-')}\\s*(\\n|$)`).test(String(text ?? ''));
}

/** Plocka ut svaret ur notisens fält. */
export function svarUr(falt, k) {
  const tvatta = (v) => String(v ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
  const svar = {};
  for (const f of k.fragor) svar[`f${f.nr}`] = String(falt[f.falt] ?? '').trim();
  return { kanal: tvatta(falt.Kanal), produkt: tvatta(falt.Produkt), svar, tomt: Object.values(svar).every((v) => !v) };
}

// Ett orderärende i ett enkätsvar ska aldrig gömmas i enkätmappen: det stannar
// i inkorgen hos VA:n. Hellre ett falskt larm än en kund som ingen ser.
const PROBLEM = /(inte (fått|kommit|levererat)|ej (fått|levererat|kommit)|aldrig (fått|kommit)|var är (mitt|min|ordern|paketet)|vart är|när kommer|spårning|spåra|paketet|trasig|söndrig|skadad|fel (storlek|vara|färg|antal)|retur|returnera|återbetal|pengarna tillbaka|reklamation|klagomål|bluff|lurad|svindel|avbeställ|ångra|order ?(nr|nummer)|#\s?\d{3,})/i;

export function arProblem(svar) {
  return PROBLEM.test(Object.values(svar ?? {}).join('\n'));
}

/** Spam: länkar i svaren. */
export function arSpam(svar) {
  return /https?:\/\/|www\./i.test(Object.values(svar ?? {}).join('\n'));
}

/**
 * Stryk butikens namn och persondata ur ett svar innan det citeras någonstans.
 * Butikens namn står aldrig i en annons. Ordernummer och långa tal tas bort.
 */
export function stryk(text, k) {
  let t = maskaKontakt(String(text ?? ''));
  for (const ord of k.butiksord) t = t.replace(new RegExp(`\\b${ord}\\b`, 'gi'), '[butiken]');
  t = t.replace(/\bMS-[A-Z0-9]{4,}\b/gi, '[nummer]').replace(/#\s?\d{3,}/g, '[nummer]').replace(/\b\d{4,}\b/g, '[nummer]');
  return t.replace(/[ \t]+/g, ' ').trim();
}

/** 16 tecken av sha256(Message-ID): stabilt även om mejlet flyttas. */
export function svarsId(messageId) {
  return createHash('sha256').update(String(messageId ?? '')).digest('hex').slice(0, 16);
}

/** ISO-vecka "2026-W40". Ett svar får aldrig ett datum eller klockslag i repot. */
export function vecka(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dag);
  const ar = t.getUTCFullYear();
  const v = Math.ceil(((t - Date.UTC(ar, 0, 1)) / 86400000 + 1) / 7);
  return `${ar}-W${String(v).padStart(2, '0')}`;
}
