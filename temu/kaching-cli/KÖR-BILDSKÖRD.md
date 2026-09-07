# Bildskörd — klistra in det här i Cowork PÅ DIN DATOR

Molnet är blockerat av Temu; din dator är det inte. Skörden körs härifrån,
molnsessionen bygger galleriet efteråt.

---

Dra ner senaste från git först (`git pull`). Kör sedan, från repo-roten:

```
cd temu/kaching-cli
node temu-bilder.mjs '<TEMU-URL FRÅN MOLNSESSIONEN>' <mappnamn>
```

Ett Chrome-fönster öppnas — kommer en captcha, lös den, skörden fortsätter
själv. När skriptet är klart:

1. Öppna `temu/bildskord/<mappnamn>/` och titta igenom filerna.
   Släng bilder som hör till ANDRA produkter ("liknande produkter"-sektionen
   smiter ibland med) och rena skräpbilder. Behåll GIF:ar och videor.
2. `git add temu/bildskord/<mappnamn> && git commit -m "bildskörd <mappnamn>" && git push`
3. Säg till i molnsessionen att skörden är pushad.

Första körningen: `<mappnamn>` = **grilloverdrag** och URL:en är Temu-länken
till grillöverdraget (molnsessionen har den).

Regler: rör inte `profile/`-mappen, och skörda bara produkter vi säljer.
