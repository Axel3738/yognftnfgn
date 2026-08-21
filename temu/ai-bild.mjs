#!/usr/bin/env node
// Genererar en miljöbild ("produkten i användning") ur produktens RIKTIGA bild
// via kie.ai nano-banana-edit. Aldrig text-till-bild — alltid edit av referensen,
// annars ritar modellen en annan produkt (pingisskandalen, fast AI-vägen).
//
//   export KIE_API_KEY="..."
//   node temu/ai-bild.mjs "<referensbild-URL>" "<scenbeskrivning på engelska>" [ut.png]
//
// Skriver den färdiga bildens URL till stdout. Bilden ligger tillfälligt hos
// kie.ai — ladda in den i Shopify (productCreateMedia originalSource) direkt,
// tempfile-länken dör efter ett tag.
//
// ⚠️ REGLER (Axel 2026-08-21, efter piloten):
// 1. Referensbilden ska vara produktens egen. Prompten ska kräva att produkten
//    hålls identisk ("keep the product identical to the reference").
// 2. Modellen RÄKNAR INTE pålitligt — piloten gav 7-8 bollar när setet har 6,
//    och "exactly three" gav 4. Granska varje bild visuellt mot produktens
//    räkneord INNAN publicering. Motsäger bilden copyn: generera om eller släng.
// 3. AI-bilden är MILJÖBILD — aldrig huvudbild, ersätter aldrig äkta produktfoton.
// 4. Undvik människor i närbild i prompten — AI-ansikten ser fejk ut och
//    drar ner trovärdigheten (Axels "scamigt"-varning gäller åt båda hållen).
// 5. Generera bara scener där referensbilden visar produktens form i det läge
//    scenen kräver. Piloten underkändes: referensen visade nätet hopfällt i
//    lådan, AI:n gissade ett kort nät — det riktiga dras ut 1,7 m över hela
//    bordet. Finns en äkta Temu-galleribild som visar samma sak: använd den,
//    aldrig AI.
// 6. Formatet är 1:1 (Axels beslut 2026-08-21) — det är default här. Avvik
//    bara med skäl, via fjärde argumentet.
// 7. Gör gärna FLERA AI-bilder per produkt: en stilla miljöbild + en där
//    produkten faktiskt används. I-användning utan ansikten: beskär i prompten
//    till ben/händer ("only legs from the knees down, no face"). Produkten
//    styr personen — herrprodukt kräver herrkläder i bild (första gåendebilden
//    fick bara bara ben och läste som dam på en herrkänga → omgjord med byxben).

const [ref, prompt, ut, format = "1:1"] = process.argv.slice(2);
const K = process.env.KIE_API_KEY;
if (!K || !ref || !prompt) {
  console.error('Användning: KIE_API_KEY=... node temu/ai-bild.mjs "<bild-URL>" "<scen>" [ut.png] [format]');
  console.error('format: 1:1 (default, Axels beslut 2026-08-21), 16:9, 9:16, 3:4, 4:3, auto');
  process.exit(1);
}
const svar = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
  method: "POST",
  headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "google/nano-banana-edit",
    input: { prompt: `${prompt} Keep the product identical to the reference image: same colors, same shape, same details. Photorealistic.`, image_urls: [ref], image_size: format },
  }),
});
const skapad = await svar.json();
if (skapad.code !== 200) { console.error("createTask:", JSON.stringify(skapad).slice(0, 200)); process.exit(1); }
const taskId = skapad.data.taskId;
console.error("task:", taskId);
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 6000));
  const d = await (await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, { headers: { Authorization: `Bearer ${K}` } })).json();
  const st = d.data?.state;
  if (st === "success") {
    const url = JSON.parse(d.data.resultJson).resultUrls[0];
    console.log(url);
    if (ut) {
      const bild = await (await fetch(url)).arrayBuffer();
      (await import("node:fs")).writeFileSync(ut, Buffer.from(bild));
      console.error("sparad:", ut);
    }
    process.exit(0);
  }
  if (st === "fail") { console.error("FAIL:", JSON.stringify(d.data).slice(0, 200)); process.exit(1); }
}
console.error("timeout"); process.exit(1);
