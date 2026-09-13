// Sidan Axel klistrar mallarna från: varje mall med ämnesrad, kopiera-knapp
// och förhandsvisning, plus klickschemat för rabattkoden. Publiceras som
// Artifact av /mejl. Självbärande HTML — förhandsvisningarna ligger inbakade
// som srcdoc, inget laddas utifrån utom typsnitten.
//
// Sidan är skriven för Axel (dyslexi): stora rubriker, en handling per rad,
// exakt vad knappen heter. Atkinson Hyperlegible som brödtext av samma skäl.

const esk = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const kr = (n) => `${Math.round(Number(n)).toLocaleString('sv-SE').replace(/ | /g, ' ')} kr`;

export function byggSida({ liquid, exempel, konfig, produkter, byggd }) {
  const e = konfig.erbjudande;
  const lage = konfig.lage ?? {};
  const inklistrade = lage.inklistrade ?? {};
  const hoppade = lage.hoppade_over ?? {};
  const perId = new Map(exempel.map((m) => [m.id, m]));

  const mallar = liquid
    .map((m, i) => {
      const ex = perId.get(m.id);
      const klar = inklistrade[m.id];
      const hopp = hoppade[m.id];
      return `
    <section class="mall" id="mall-${m.id}">
      <header class="mall-huvud">
        <span class="nr">${i + 1}</span>
        <div>
          <h3>${esk(m.shopify.split(' / ')[0])}</h3>
          <p class="dampad">Heter i Shopify: <strong>${esk(m.shopify)}</strong></p>
          ${hopp ? `<p class="dampad">⏭ Hoppas över: ${esk(hopp)}</p>` : ''}
        </div>
        <label class="klar"><input type="checkbox" id="klar-${m.id}" data-klar="${m.id}"${klar ? ' checked' : ''}> Inklistrad${klar ? ` ${esk(klar)}` : ''}</label>
      </header>
      <div class="rad">
        <div class="etikett">Ämnesrad</div>
        <code class="amne" id="amne-${m.id}">${esk(m.amne)}</code>
        <button type="button" class="kopiera" data-mal="amne-${m.id}">Kopiera ämnesraden</button>
      </div>
      <div class="rad">
        <div class="etikett">Mallens kod</div>
        <p class="dampad">${(m.html.length / 1024).toFixed(0)} kB. Ersätt ALLT i rutan "E-postbrödtext (HTML)" med det här.</p>
        <button type="button" class="kopiera stor" data-mal="liquid-${m.id}">Kopiera hela mallen</button>
        <script type="text/plain" id="liquid-${m.id}">${m.html.replace(/<\/script/gi, '<\\/script')}</script>
      </div>
      <details class="forhands"${i === 0 ? ' open' : ''}>
        <summary>Så här ser mejlet ut (exempeldata)</summary>
        <iframe title="Förhandsvisning: ${esk(m.shopify)}" loading="lazy" srcdoc="${esk(ex.html)}"></iframe>
      </details>
    </section>`;
    })
    .join('\n');

  const gratisLista = produkter.gratis.map((p) => `<li>${esk(p.kortnamn)} <span class="dampad">(${kr(p.pris)})</span></li>`).join('');
  const dyraLista = produkter.dyra.map((p) => `<li>${esk(p.kortnamn)} <span class="dampad">(${kr(p.pris)})</span></li>`).join('');

  return `<title>Bäverbutikens mejl</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap">
<style>
  :root {
    --grund: #f3f1ec; --panel: #ffffff; --blak: #151515; --dampad: #5f5d58;
    --ram: #dcd9d1; --rod: #dd1d1d; --rod-mjuk: #fbe9e9; --gron: #1f7a3a; --gron-mjuk: #e5f3e9;
    --kod: #f7f5f0;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --grund: #171614; --panel: #201f1c; --blak: #f1efe9; --dampad: #a5a29a;
      --ram: #35332e; --rod: #ff4a4a; --rod-mjuk: #3a1b1b; --gron: #6fd08c; --gron-mjuk: #1c2f22;
      --kod: #17171a;
    }
  }
  :root[data-theme="dark"] {
    --grund: #171614; --panel: #201f1c; --blak: #f1efe9; --dampad: #a5a29a;
    --ram: #35332e; --rod: #ff4a4a; --rod-mjuk: #3a1b1b; --gron: #6fd08c; --gron-mjuk: #1c2f22;
    --kod: #17171a;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--grund); color: var(--blak);
    font-family: "Atkinson Hyperlegible", "Segoe UI", Arial, sans-serif; font-size: 18px; line-height: 1.55;
    padding-block: 32px 80px; padding-inline: 20px;
  }
  main { max-width: 760px; margin: 0 auto; display: grid; gap: 28px; }
  h1, h2, h3 { font-family: Anton, "Arial Narrow", Impact, sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.02em; margin: 0; text-wrap: balance; }
  h1 { font-size: clamp(40px, 8vw, 64px); line-height: 1; }
  h2 { font-size: 28px; line-height: 1.1; }
  h3 { font-size: 22px; line-height: 1.15; }
  p { margin: 0; max-width: 64ch; }
  .dampad { color: var(--dampad); }
  .topp { display: grid; gap: 12px; }
  .topp .status { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 16px; color: var(--dampad); }
  .lage { display: grid; gap: 10px; }
  .lage-rad { display: flex; gap: 12px; align-items: flex-start; padding: 12px 16px; border-left: 4px solid var(--gron); background: var(--gron-mjuk); }
  .lage-rad.att-gora { border-left-color: var(--rod); background: var(--rod-mjuk); }
  .lage-rad .ikon { font-weight: 700; flex: 0 0 auto; }
  .steg { display: grid; gap: 14px; }
  .steg-kort { background: var(--panel); border: 1px solid var(--ram); padding: 20px 22px; display: grid; grid-template-columns: 44px 1fr; gap: 6px 14px; }
  .steg-kort .nr { font-family: Anton, "Arial Narrow", Impact, sans-serif; font-size: 30px; line-height: 1; color: var(--rod); }
  .steg-kort h3 { grid-column: 2; }
  .steg-kort .inne { grid-column: 2; display: grid; gap: 10px; }
  .klick { display: grid; gap: 6px; margin: 0; padding-left: 22px; }
  .klick li { padding-left: 4px; }
  .klick strong { font-weight: 700; }
  .falt { width: 100%; border-collapse: collapse; font-size: 16px; }
  .falt th, .falt td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--ram); vertical-align: top; }
  .falt th { font-weight: 700; width: 40%; color: var(--dampad); }
  .kodbit { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; background: var(--kod); border: 1px solid var(--ram); padding: 2px 8px; font-size: 0.95em; }
  .mall { background: var(--panel); border: 1px solid var(--ram); display: grid; }
  .mall-huvud { display: grid; grid-template-columns: 44px 1fr auto; gap: 4px 14px; align-items: start; padding: 18px 22px; border-bottom: 1px solid var(--ram); }
  .mall-huvud .nr { font-family: Anton, "Arial Narrow", Impact, sans-serif; font-size: 30px; line-height: 1; color: var(--rod); }
  .mall-huvud p { font-size: 15px; }
  .klar { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; color: var(--dampad); padding-top: 4px; white-space: nowrap; cursor: pointer; }
  .klar input { width: 20px; height: 20px; accent-color: var(--gron); }
  .mall:has(input[data-klar]:checked) { border-color: var(--gron); }
  .mall:has(input[data-klar]:checked) .mall-huvud { background: var(--gron-mjuk); }
  .rad { padding: 16px 22px; border-bottom: 1px solid var(--ram); display: grid; gap: 8px; }
  .etikett { font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dampad); font-weight: 700; }
  .amne { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 15px; background: var(--kod); border: 1px solid var(--ram); padding: 10px 12px; overflow-x: auto; white-space: nowrap; }
  .kopiera {
    justify-self: start; font: inherit; font-weight: 700; font-size: 16px; cursor: pointer;
    background: var(--panel); color: var(--blak); border: 2px solid var(--blak); padding: 8px 16px;
  }
  .kopiera.stor { background: var(--rod); border-color: var(--rod); color: #fff; font-family: Anton, "Arial Narrow", Impact, sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.06em; font-size: 20px; padding: 12px 26px; }
  .kopiera:focus-visible { outline: 3px solid var(--rod); outline-offset: 2px; }
  .kopiera.klart { background: var(--gron); border-color: var(--gron); color: #fff; }
  .forhands summary { padding: 14px 22px; cursor: pointer; font-weight: 700; }
  .forhands iframe { display: block; width: 100%; height: 900px; border: 0; border-top: 1px solid var(--ram); background: #f2f2f2; }
  .rutnat { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .rutnat ul { margin: 6px 0 0; padding-left: 20px; font-size: 16px; }
  footer { font-size: 15px; color: var(--dampad); }
  @media (max-width: 560px) {
    .mall-huvud { grid-template-columns: 44px 1fr; }
    .klar { grid-column: 2; }
    .rutnat { grid-template-columns: 1fr; }
    .forhands iframe { height: 700px; }
  }
  @media (prefers-reduced-motion: no-preference) { .kopiera { transition: background 0.15s, color 0.15s; } }
</style>

<main>
  <header class="topp">
    <p class="dampad">Bäverbutiken.se · byggd ${esk(byggd)} UTC</p>
    <h1>Bäverbutikens mejl</h1>
    <p>Åtta kundmejl i butikens stil, med erbjudandet <strong>köp igen → välj en gratisprodukt</strong> i orderbekräftelsen och leverans-klart-mejlet.</p>
  </header>

  <section class="lage" aria-label="Läget">
    <div class="lage-rad"><span class="ikon">✅</span><p>Klart via API: kollektionen <a href="${esk(konfig.butik.url)}/collections/${esk(e.kollektion_handle)}">${esk(konfig.butik.url)}/collections/${esk(e.kollektion_handle)}</a> är live med de fyra gratisprodukterna. Mallarna nedan är byggda på butikens riktiga produkter och priser.</p></div>
    ${
      lage.rabattkod_skapad
        ? `<div class="lage-rad"><span class="ikon">✅</span><p>Rabattkoden <strong>${esk(e.kod)}</strong> är skapad och aktiv (${esk(lage.rabattkod_skapad)}, ${esk(lage.rabattkod_av ?? '')}). Köpvillkoret är kollektionen <strong>${esk(e.kop_kollektion_titel)}</strong> (automatisk, pris över 0 kr) eftersom Shopify inte tillåter "Alla produkter" i Köp X få Y.</p></div>`
        : ''
    }
    ${
      Object.keys(inklistrade).length
        ? `<div class="lage-rad"><span class="ikon">✅</span><p>${Object.keys(inklistrade).length} av ${liquid.length} mallar inklistrade och sparade under Inställningar → Notiser.${lage.testmejl_skickat ? ` Testmejl på Orderbekräftelse skickat ${esk(lage.testmejl_skickat)}.` : ''}${Object.keys(hoppade).length ? ` Hoppades över: ${Object.keys(hoppade).map((id) => esk(liquid.find((m) => m.id === id)?.shopify.split(' / ')[0] ?? id)).join(', ')} (se mallen längst ner).` : ''}</p></div>`
        : ''
    }
    ${
      lage.inklistrade_v1 && !Object.keys(inklistrade).length
        ? `<div class="lage-rad att-gora"><span class="ikon">🔁</span><p>En äldre version av mallarna (v1, utan erbjudandet överst, urgency och logga) klistrades in i ${Object.keys(lage.inklistrade_v1).length} mallar ${esk(Object.values(lage.inklistrade_v1)[0])}. Mallarna nedan är v2 och ska klistras in igen, över de gamla.</p></div>`
        : ''
    }
    <div class="lage-rad att-gora"><span class="ikon">👉</span><p>${
      [
        lage.rabattkod_skapad ? null : 'rabattkoden (steg 1)',
        Object.keys(inklistrade).length >= liquid.length - Object.keys(hoppade).length ? null : `${liquid.length - Object.keys(hoppade).length} inklistringar (steg 2)`,
      ].filter(Boolean).length
        ? `Kvar för dig: ${[
            lage.rabattkod_skapad ? null : 'rabattkoden (steg 1)',
            Object.keys(inklistrade).length >= liquid.length - Object.keys(hoppade).length ? null : `${liquid.length - Object.keys(hoppade).length} inklistringar (steg 2)`,
          ].filter(Boolean).join(' och ')}. Shopify har inget API för det, så det är dina klick eller Coworks.`
        : 'Kvar för dig: steg 4, koppla om Shopify på claude.ai. Gör gärna också det riktiga köptestet under steg 1.'
    }</p></div>
  </section>

  <section class="steg" aria-labelledby="gor">
    <h2 id="gor">Gör så här</h2>

    <article class="steg-kort">
      <span class="nr">1</span>
      <h3>Skapa rabattkoden ${esk(e.kod)}</h3>
      <div class="inne">
        <ol class="klick">
          <li>Öppna Shopify admin → <strong>Rabatter</strong> → knappen <strong>Skapa rabatt</strong>.</li>
          <li>Välj <strong>Köp X få Y</strong> (Buy X get Y).</li>
          <li>Under "Metod": välj <strong>Rabattkod</strong> och skriv <span class="kodbit">${esk(e.kod)}</span>.</li>
          <li>Fyll i fälten enligt tabellen nedan.</li>
          <li>Klicka <strong>Spara rabatt</strong>.</li>
        </ol>
        <table class="falt">
          <tr><th>Kunden köper</th><td><strong>Minsta inköpsbelopp</strong> ${e.minsta_kop_sek} kr · Valfria artiklar från <strong>Specifika kollektioner</strong> → <strong>${esk(e.kop_kollektion_titel)}</strong> (Shopify tillåter inte "Alla produkter" här; finns kollektionen inte: Produkter → Kollektioner → Skapa kollektion → Automatisk → villkor <em>Pris är större än 0</em>, döp den till ${esk(e.kop_kollektion_titel)})</td></tr>
          <tr><th>Kunden får</th><td>Antal <strong>${e.gratis_antal}</strong> · Alla produkter från <strong>Specifika kollektioner</strong> → sök fram <strong>${esk(e.kollektion_titel)}</strong></td></tr>
          <tr><th>Med rabatterat värde</th><td><strong>Gratis</strong></td></tr>
          <tr><th>Max antal användningar per order</th><td>Bocka i, skriv <strong>1</strong></td></tr>
          <tr><th>Kundberättigande</th><td><strong>Specifika kundsegment</strong> → välj <strong>Kunder som har köpt minst en gång</strong> (Shopifys standardsegment; finns det inte: Kunder → Segment → Skapa segment → <span class="kodbit">number_of_orders > 0</span>, döp det till "Har handlat")</td></tr>
          <tr><th>Maximalt antal rabattanvändningar</th><td>Bocka i <strong>Begränsa till en användning per kund</strong></td></tr>
          <tr><th>Kombinationer</th><td>Låt allt vara <strong>avbockat</strong></td></tr>
          <tr><th>Aktiva datum</th><td>Startdatum <strong>idag</strong>, inget slutdatum</td></tr>
        </table>
        <p class="dampad">Testa: öppna <a href="${esk(konfig.butik.url)}/discount/${esk(e.kod)}?redirect=%2Fcollections%2F${esk(e.kollektion_handle)}">${esk(konfig.butik.url)}/discount/${esk(e.kod)}?redirect=/collections/${esk(e.kollektion_handle)}</a> inloggad som en kund som handlat förut, lägg valfri vara för minst ${e.minsta_kop_sek} kr plus en gratisprodukt i korgen — gratisproduktens pris ska bli 0 kr i kassan.</p>
      </div>
    </article>

    <article class="steg-kort">
      <span class="nr">2</span>
      <h3>Klistra in de åtta mallarna</h3>
      <div class="inne">
        <p>Samma fem klick för varje mall. Bocka i "Inklistrad" här på sidan när en är klar, så tappar du inte räkningen.</p>
        <ol class="klick">
          <li>Shopify admin → <strong>Inställningar</strong> (kugghjulet längst ner till vänster) → <strong>Notiser</strong> → <strong>Kundnotiser</strong>.</li>
          <li>Klicka på mallens namn (står vid varje mall nedan).</li>
          <li>Klicka <strong>Redigera kod</strong>.</li>
          <li>Fältet <strong>E-postämne</strong>: markera allt, klistra in ämnesraden (knappen "Kopiera ämnesraden").</li>
          <li>Rutan <strong>E-postbrödtext (HTML)</strong>: klicka i rutan, tryck <strong>Ctrl+A</strong> (Mac: Cmd+A), tryck <strong>Delete</strong>, klistra in (knappen "Kopiera hela mallen"). Klicka <strong>Spara</strong>.</li>
        </ol>
        <p class="dampad">Övergiven kassa: ligger den under <strong>Marknadsföring → Automatiseringar</strong> i din butik i stället för under Notiser, hoppa över den mallen — då sköter Shopify Email det mejlet.</p>
      </div>
    </article>

    <article class="steg-kort">
      <span class="nr">3</span>
      <h3>Skicka ett testmejl</h3>
      <div class="inne">
        <ol class="klick">
          <li>Inne på <strong>Orderbekräftelse</strong>: klicka <strong>Skicka testmejl</strong> (uppe till höger).</li>
          <li>Öppna mejlet i din inkorg. Kolla att koden <span class="kodbit">${esk(e.kod)}</span> och de fyra gratisprodukterna syns, och att knappen "Välj min gratisprodukt" öppnar kollektionen med koden pålagd.</li>
        </ol>
      </div>
    </article>

    <article class="steg-kort">
      <span class="nr">4</span>
      <h3>Koppla om Shopify på claude.ai</h3>
      <div class="inne">
        <p>Shopify-connectorn har gått ut. Kopplas den om kan nästa session skapa rabattkoder och läsa ordrar själv i stället för att be dig klicka.</p>
        <ol class="klick">
          <li>claude.ai → <strong>Inställningar</strong> → <strong>Connectors</strong> → <strong>Shopify</strong> → <strong>Anslut igen</strong>, välj butiken <strong>Bäverbutiken.se</strong>.</li>
        </ol>
      </div>
    </article>
  </section>

  <section class="rutnat" aria-label="Produkterna i mejlen">
    <div><h3>Välj en gratis</h3><ul>${gratisLista}</ul></div>
    <div><h3>Visas bredvid</h3><ul>${dyraLista}</ul></div>
  </section>

  <section class="steg" aria-labelledby="mallarna">
    <h2 id="mallarna">Mallarna</h2>
${mallar}
  </section>

  <footer>
    <p>Byggd av <span class="kodbit">node mejl/bygg.mjs</span> i repot. Byter en gratisprodukt eller ett pris: kör <span class="kodbit">/mejl</span> igen och klistra in på nytt — priserna i mejlet är inbakade, inte levande.</p>
  </footer>
</main>

<script>
  (function () {
    function kopiera(text) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
      return new Promise(function (ok, fel) {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy') ? ok() : fel(new Error('copy')); } catch (e) { fel(e); }
        document.body.removeChild(ta);
      });
    }
    document.querySelectorAll('.kopiera').forEach(function (knapp) {
      var ursprung = knapp.textContent;
      knapp.addEventListener('click', function () {
        var mal = document.getElementById(knapp.getAttribute('data-mal'));
        var text = mal.tagName === 'SCRIPT' ? mal.textContent.replace(/<\\\\\\/script/gi, '</script') : mal.textContent;
        kopiera(text).then(function () {
          knapp.textContent = 'Kopierat ✓'; knapp.classList.add('klart');
          setTimeout(function () { knapp.textContent = ursprung; knapp.classList.remove('klart'); }, 2000);
        }, function () {
          knapp.textContent = 'Gick inte — markera texten själv';
        });
      });
    });
    document.querySelectorAll('input[data-klar]').forEach(function (box) {
      var nyckel = 'mejl-klar-' + box.getAttribute('data-klar');
      // Förbockat ur konfigens lage vinner tills tittaren själv ändrat rutan.
      try { var sparat = localStorage.getItem(nyckel); if (sparat !== null) box.checked = sparat === '1'; } catch (e) {}
      box.addEventListener('change', function () {
        try { localStorage.setItem(nyckel, box.checked ? '1' : '0'); } catch (e) {}
      });
    });
  })();
</script>
`;
}
