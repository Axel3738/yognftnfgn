# Fixa två buggar i skrapkorts-popupen

**Till dig som redan installerat skrapkortet i en butik.** Ge den här filen till
Claude Code (eller följ den själv). Den byter INTE ut hela sektionen — dina egna
texter, färger och inställningar rörs inte. Bara två saker rättas.

Filen du ska ändra heter oftast `sections/skrapkort.liquid` — leta efter
sektionen som innehåller `SKRAPA HÄR`. Klassnamnen börjar med `sk-` (heter de
`ms-` i din fil: byt `sk-` mot `ms-` i alla sökningar nedan).

---

## Bugg 1 — popupen kom tillbaka på varje ny sida

**Symtom:** kunden ser popupen på startsidan, klickar vidare till en produkt och
möts av samma popup igen. Och igen.

**Orsak:** minnet skrevs bara när popupen *stängdes*. Kunden som ser den och
klickar vidare stänger aldrig något — då sparades ingenting.

### 1a. Lägg till en besöksspärr

**Hitta:**

```js
    var NYCKEL = 'sk-skrapkort';
    var VILA_MS = Number(ruta.dataset.vilodagar || 3) * 86400000;
```

**Lägg till direkt efter `var NYCKEL`-raden:**

```js
    var BESOK = 'sk-skrapkort-besok';
```

**och lägg till dessa två funktioner efter `function spara(...)`-raden:**

```js
    // Besöksspärren lever i sessionStorage: den följer med mellan sidbyten
    // i samma flik men nollas när kunden kommer tillbaka en annan gång.
    function visadIBesoket() { try { return sessionStorage.getItem(BESOK) === '1'; } catch (e) { return false; } }
    function markeraBesok() { try { sessionStorage.setItem(BESOK, '1'); } catch (e) { /* privat läge */ } }
```

### 1b. Skriv minnet när popupen ÖPPNAS

**Hitta** (inuti `function oppna(...)`):

```js
      ruta.showModal();
```

**Lägg till direkt efter den raden** (efter `ruta.focus();` om den finns):

```js
      // Minnet skrivs HÄR, i samma stund som kunden får se popupen — inte
      // först när den stängs. Kunden som bara klickar vidare till nästa sida
      // stänger aldrig något, och utan den här raden mötte samma popup hen
      // på varje ny sida i butiken.
      markeraBesok();
      var f = minns();
      if (f !== 'klar' && f !== 'skrapad' && f.indexOf('vila:') !== 0) spara('visad:' + Date.now());
```

### 1c. Låt spärren stoppa popupen

**Hitta:**

```js
    if (lage === 'klar') return;
    if (lage.indexOf('vila:') === 0) {
      var sedan = Number(lage.slice(5));
      if (Date.now() - sedan < VILA_MS) return;
    }
```

**Ersätt med:**

```js
    // Sedd en gång under besöket = klart för i dag. Gäller ALLA lägen, så
    // popupen aldrig möter samma kund två gånger på en shoppingrunda.
    if (visadIBesoket()) return;

    if (lage === 'klar') return;
    if (lage.indexOf('vila:') === 0) {
      var sedan = Number(lage.slice(5));
      if (Date.now() - sedan < VILA_MS) return;
    }
    // Sedd men obesvarad i ett tidigare besök: vila lika länge som ett nej.
    if (lage.indexOf('visad:') === 0) {
      var sett = Number(lage.slice(6));
      if (Date.now() - sett < VILA_MS) return;
    }
```

⚠️ **Viktigt:** de här raderna måste ligga EFTER kontrollerna av
`data-sk-postad` och `data-sk-fel`. Annars får kunden som just skrivit in sin
mejl aldrig se sin rabattkod.

---

## Bugg 2 — sista bokstaven hoppar ner på egen rad

**Symtom:** rubriken bryts mitt i ett ord, typ `VÄLKOMSTRABAT` / `T`.

**Orsak:** de flesta Shopify-teman sätter `word-break: break-word` på rubriker.
Så fort ordet är en aning för brett kapas det mitt itu. Rubriken räknade dessutom
sin storlek på skärmens bredd (`vw`) i stället för rutans.

### 2a. Gör rutan till en mätbar behållare

**Hitta:**

```css
  .sk-skrap__steg { max-width: 520px; width: 100%; }
```

**Ersätt med:**

```css
  /* Rubriken mäts mot RUTAN, inte skärmen — därför container-enheter. */
  .sk-skrap__steg { max-width: 520px; width: 100%; container-type: inline-size; }
```

### 2b. Förbjud brytning mitt i ord

**Hitta:**

```css
    font-size: clamp(1.7em, 6vw, 2.6em);
    line-height: 1.1;
    text-transform: uppercase;
    letter-spacing: .04em;
```

**Ersätt med:**

```css
    /* cqw = procent av rutans bredd. Med vw räknade rubriken på skärmen och
       tog ingen hänsyn till att rutan är smalare — då sprack långa ord. */
    font-size: clamp(1.35em, 7.6cqw, 2.5em);
    line-height: 1.1;
    text-transform: uppercase;
    letter-spacing: .02em;
    /* Temat sätter word-break: break-word på rubriker. Det kapar långa ord
       mitt itu så sista bokstaven hamnar ensam på egen rad
       ("VÄLKOMSTRABAT / T"). Ord bryts aldrig — de får hellre krympa. */
    word-break: normal;
    overflow-wrap: normal;
    hyphens: none;
    text-wrap: balance;
```

### 2c. Krymp rubriken om ett ord ändå är för brett

**Hitta:**

```js
    function steg(namn) {
      ruta.querySelectorAll('[data-sk-steg]').forEach(function (el) {
        el.hidden = el.dataset.skSteg !== namn;
      });
    }
```

**Ersätt med:**

```js
    function steg(namn) {
      ruta.querySelectorAll('[data-sk-steg]').forEach(function (el) {
        el.hidden = el.dataset.skSteg !== namn;
      });
      passaRubrik();
    }

    // Sista skyddet mot fula radbrytningar: ord får aldrig kapas mitt itu
    // (det sköter CSS), men ett riktigt långt ord i ett brett typsnitt kan
    // ändå bli bredare än rutan. Då krymps rubriken tills den ryms, i stället
    // för att svämma över kanten. Max sex steg — sen är det texten som är fel.
    var passar = false, passningar = 0;
    function passaRubrik() {
      // Stängd dialog har bredden noll — mäter man då krymper rubriken i
      // onödan innan den ens visats. Taket är en spärr mot evighetsloopar
      // i teman vi aldrig sett.
      if (!ruta.open || passar || passningar > 30) return;
      var h = ruta.querySelector('[data-sk-steg]:not([hidden]) .sk-skrap__rubrik');
      if (!h) return;
      passar = true;
      passningar++;
      h.style.fontSize = '';
      for (var i = 0; i < 6 && h.scrollWidth > h.clientWidth + 1; i++) {
        h.style.fontSize = (parseFloat(getComputedStyle(h).fontSize) * 0.92) + 'px';
      }
      passar = false;
    }
    window.addEventListener('resize', passaRubrik);
    // Butikens typsnitt laddas asynkront och är ofta bredare än reservtypsnittet.
    // Slår det in efter att vi mätt växer texten och svämmar över kanten.
    // ResizeObserver duger inte: rubriken är alltid 100 % bred, så dess EGEN
    // storlek ändras aldrig — bara textens. Därför några efterkontroller.
    function passaSnart() {
      passaRubrik();
      [150, 600, 1500].forEach(function (ms) { setTimeout(passaRubrik, ms); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(passaRubrik);
    }
```

**Och i `function oppna(...)`, efter `ruta.focus();`, lägg till:**

```js
      passaSnart();
```

---

## Testa efteråt

1. **Öppna butiken i ett inkognitofönster.** Popupen ska komma efter några sekunder.
2. **Klicka vidare till en produktsida utan att röra popupen.** Den ska INTE komma
   tillbaka. Klicka runt på fler sidor — fortfarande tyst.
3. **Titta på rubriken** i både mobilbredd och på dator. Inget ord ska vara kapat
   mitt itu, och texten ska inte gå utanför kanten.
4. **Skrapa fram rabatten och skriv in en mejladress.** Rabattkoden ska visas —
   den delen ska fungera precis som förut.

Vill du testa om popupen från början i samma webbläsare: öppna konsolen
(F12 → Console) och kör `localStorage.clear(); sessionStorage.clear();`
och ladda om sidan.
