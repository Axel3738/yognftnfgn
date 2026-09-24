# Bildskörd batch 11–13 — klistra in det här i Cowork PÅ DIN DATOR

Molnet är blockerat av AliExpress och Temu; din dator är det inte. Skörden körs här,
molnsessionen bygger gallerierna efteråt. Offerten: MASTER-arket, batch 11–13
(https://docs.google.com/spreadsheets/d/1zxPXYeyx228RVQ16-vrN19m-K2jKdq4x5snQ2KXAaj8).

---

Två saker kräver att Axel sitter vid datorn (lärdom 2026-09-24):
- **Temu-länkarna** (rcdrift, bordsfotboll, magnetblock) visar en inloggningsruta i Chrome-fönstret —
  Axel loggar in eller stänger rutan, annars blir det 0 bilder eller bara Temus rekommendationer.
- **`git push`** kräver GitHub-inloggning på datorn — ett webbläsarfönster öppnas första gången.

Dra ner senaste från git först. Kör sedan, från repo-roten:

```
git pull
cd temu/kaching-cli
```

Ett Chrome-fönster öppnas per produkt. Kommer en slider-captcha eller inloggningsruta:
lös/stäng den i fönstret, skörden fortsätter själv. Kör produkterna en i taget
(AliExpress-sidor via `ali-bilder.mjs`, Temu-sidor via `temu-bilder.mjs`):

```
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012175923346.html' bathuv
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005013106730364.html' kamadohuv
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012470643036.html' kajakhuv
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005007987144485.html' varmesulor
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005010439326565.html' krukvaxthuv
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005010360604942.html' bikupsjacka
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005010585659348.html' maskinhylla
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012582663728.html' ljusslingevindor
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012077981896.html' makitahallare
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012434201685.html' fonstertermomatta
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012053186779.html' varmemuff
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005010434731652.html' laktarponcho
node temu-bilder.mjs 'https://www.temu.com/se/g-601104005758727.html' rcdrift
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012964334132.html' vedklyvshuv
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005013078903398.html' scooterkapell
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012440559009.html' cykelhallarskydd
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005009382324430.html' poolpumphuv
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012337155910.html' tradansikte
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005011850496209.html' regnkedja
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005013031048503.html' snosmaltmatta
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005010360834099.html' rullknivslip
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005013105983191.html' highlandcow
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012944140041.html' adelstenskalender
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005010545161282.html' takachuv
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005012384664996.html' krukbarrem
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005009881212347.html' buskjacka
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005010368324954.html' sorkkorgar
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005013149476732.html' husbilskalender
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005008743247722.html' slangboxhuv
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005009285428265.html' lovsilar
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005006151587411.html' regntunnehuv
node ali-bilder.mjs 'https://www.aliexpress.com/item/1005010029349245.html' elcykeljacka
node temu-bilder.mjs 'https://www.temu.com/se/g-601100052778320.html' bordsfotboll
node temu-bilder.mjs 'https://www.temu.com/se/g-601103521999665.html' magnetblock
```

När allt är kört:

1. Öppna `temu/bildskord/<mappnamn>/` och titta igenom filerna. AliExpress lastar in
   MÅNGA andra produkters bilder ("Liknande produkter") — släng allt som inte är
   produkten. Behåll GIF:ar och videor.
2. `git add temu/bildskord && git commit -m "bildskörd batch 11-13" && git push`
3. Säg till i molnsessionen att skörden är pushad.

Inte med i listan (byggs inte): dammvärmaren (bara US-version), minikedjesågen (ingen quote),
hönsluckan (ingen quote), fågelholken (MOQ 500), RC-bilen 1:16 (finns redan i butiken —
bilderna på alla tre färgerna ligger redan där).

Regler: rör inte `profile-*`-mapparna, och skörda bara produkter vi säljer.
