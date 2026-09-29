// plan-varme.mjs — Värmesulorna + Värmesitsen: förstabatch (veckokvoten) + fars dag-blocket
// (omgång 4, BOF), 2026-09-29 kväll. Axels fråga samma kväll: "När får dom hubbar då??????"
//
// Bägge stod som `forsta_batch` i rondens annonsbehov 2026-09-29 (Värmesulorna 4 127 kr,
// 45,5 % vinst, veckokvot 3 · Värmesitsen 3 927 kr, 25,0 % vinst, veckokvot 2). Rutinen
// väntade på dag 7-etiketterna (2/3 oktober) för att varje brief ska peka på en lärdom;
// ägaren beställde hubbarna nu, så lärdomen för föräldern skrivs FÖRTIDA (dag 4–5, märkt
// preliminär i products/<id>/lardomar.md) och briefen pekar på den. Etiketten dag 7 får
// bekräfta eller riva den.
//
// Videorna är inte transkriberade (ffmpeg saknas i rutinens container) — källan är Joshs
// Drive-fil med EDITOR PICKS, som i ATV-Kapellets batch #1. Ingen påhittad sekund.
// Copyn skrivs av sonnet (regel 6): copy/varme/<nyckel>.json.

export const DATUM = '2026-09-29';
const CDN = 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/';

export const PRODUKTER = [
  {
    nyckel: 'varmesulorna', prefix: 'Värmesulorna', produkt: 'the heated insoles with remote', minne: 'varmesulorna',
    kampanj: { id: '120250377836130291', namn: 'Värmesulorna med Fjärrkontroll | BE ROAS 1.64 | Launch 2026-09-26' },
    hub: '3ea270ab-908c-81fc-b44f-e26f3734a33f', hubnamn: 'Heated insoles creative hub', datakalla: '7ff270ab-908c-821b-990e-074e579f3062',
    drive: { produkt: '1QZwRqQ_AYLPUDdkWv6w8Ye4LBX4fpyfe', batch: '1dGgv_oE-1M43ZdWDavSDBBqvaDMtanNf', batchNamn: 'Batch #1' },
    landning: 'https://baverbutiken.se/products/varmesulor-med-fjarrkontroll-varma-fotter-pa-passet',
    pris: 869, jamfor: 1139, prisText: '869 kr, ord. 1 139 kr', prisNot: 'one variant, the insoles are cut to size 41–46',
    siffror: ['869', '1 139', '41', '46', '3', '2000', '4', '10', '8', '19'],
    be: { roas: 1.52, aov: 1083, cpa: 712 },
    forälder: { namn: 'Värmesulorna_PD_1_H2', ad: '120250377855700291', video: '4393577100957766', driveFil: '1gBcR0Fd7E6T7byu6J62CTSDJxWEUcuev', langd: null, spend: 5369, kop: 24, roas: 4.88, cpa: 224, vb: 11728,
      beskrivning: 'the product demo (live copy "Kalla fötter förstör hela dagen. Inte längre.") — 71 % of the campaign\'s spend in its first four days, 24 of the campaign\'s 25 purchases, CTR 2.5 %, 618 LPV, thruplay 8 % of plays' },
    benchmark: 'Värmesulorna_PD_1_H2 is itself the top spender and the benchmark; its siblings PD_1_H1 (64 kr) and PD_1_H3 (420 kr, 0 purchases) carry the identical text — only the video\'s opening differs',
    avatar: 'jagaren-som-star-stilla-pa-passet', begar: 'njutning', mekanism: 'tre-varmelagen-styrda-med-fjarren-utan-att-rora-en-fot', tro: 'att-varmesulor-inte-passar-i-mina-skor',
    slutbild: `${CDN}varmesulor-hero.jpg?v=1790193523`,
    bild: { foto: 'The product hero photo: the two insoles with the keyring remote, no people.', ref: 'none — the product has no static with 3 purchases; composition as the other FD statics', parentBild: null },
    extraRegler: [
      'The page\'s only facts: three heat levels (hög, medel, låg); the keyring remote; cut to size 41–46 along the printed lines; charged with an ordinary USB cable; battery 2000 mAh "enligt leverantören"; 4–10 hours per charge "enligt leverantören". Never "8 timmar" (the live copy\'s number, not the page\'s), never "vattentät", never a temperature, never "tusentals svenskar", never a star or a customer quote.',
      'The parent\'s live copy and captions carry "Upp till 8 timmars värme", a five-star quote and "Testa själv idag" — none of it may be visible or read.',
      'The page\'s boot picture (ai-stovel.jpg) is an AI illustration: use the Drive footage or the hero photo, never the illustration as proof.',
    ],
    hook: {
      H1: { bild: 'Close-up: the remote on its keyring in a hand, thumb on the button; the insoles in the boots below. First frame: the thumb on the remote.', effekt: 'cut-in', mekanik: 'cut-in', kalla: 'DRIVE 1gBcR0Fd7E6T7byu6J62CTSDJxWEUcuev [EDITOR PICKS: the parent\'s remote-in-hand shot]', ref: 'parent — the remote beat' },
      H2: { bild: 'Top-down: the two insoles laid out, the printed cut lines 41–46 visible at the toe. First frame: the insoles with the lines.', effekt: 'zoom-in 1 s', mekanik: 'zoom-in', kalla: 'DRIVE 1gBcR0Fd7E6T7byu6J62CTSDJxWEUcuev [EDITOR PICKS: the shot of the insoles laid flat; if the lines are not in frame: NEW FOOTAGE — top-down close-up of the toe with the printed lines]', ref: 'parent — the product beat' },
    },
    rader: [
      { bild: 'Close-up: scissors cut the insole along the printed line at the toe.', effekt: 'none', kalla: 'DRIVE 1gBcR0Fd7E6T7byu6J62CTSDJxWEUcuev [EDITOR PICKS: the cutting shot; if none: NEW FOOTAGE — scissors along the printed line, top-down]', ref: 'parent — fit beat', frihet: 'b-roll order free' },
      { bild: 'Medium: a hand slides the insole into a boot, then the boot goes on.', effekt: 'none', kalla: 'DRIVE 1gBcR0Fd7E6T7byu6J62CTSDJxWEUcuev [EDITOR PICKS: the insole-into-boot shot]', ref: 'parent — demo beat', frihet: 'b-roll order free' },
      { bild: 'Wide, outdoors: a person stands still in boots on cold ground (a forest edge), hands in pockets, the remote visible on the keyring.', effekt: 'slow-mo 0.67× 3 s', mekanik: 'slow-mo', kalla: 'DRIVE 1gBcR0Fd7E6T7byu6J62CTSDJxWEUcuev [EDITOR PICKS: the standing-still outdoor shot]', ref: 'parent — the scene', frihet: 'crop free' },
    ],
    bof: { invandning: 'passar de i mina skor?', svar: 'klipps efter din skostorlek längs de tryckta linjerna, 41 till 46; styrs med fjärrkontrollen utan att röra en fot', tro: 'att-varmesulor-inte-passar-i-mina-skor', siffrorExtra: [],
      h3: 'rader:2', rad2: 'rader:0', rad3: 'hook:H1', klippNot: { rad3: 'in H1 this is the same take as the hook: continue it without a cut (the press is the second half of the take)' }, fakta: 'klipps längs tryckta linjer, storlek 41 till 46 · tre värmelägen: hög, medel, låg · fjärrkontroll i nyckelringsformat · laddas med vanlig USB-kabel · 2000 mAh enligt leverantören · 4 till 10 timmar per laddning enligt leverantören' },
    // Förstabatchen — veckokvot 3. Mix: levande vinnare (24 köp, 4 dygn) ⇒ 2 vidarebyggen + 1 ny vinkel.
    batch: [
      { namn: 'Värmesulorna_PD_1_H4', typ: 'I', koncept: 'pd-varma-fotter-pa-passet', iteration: 1, hooktyp: 'sidans-egen-scen-kylan-kryper-uppat', mekanik: 'cut-in', avatar: 'jagaren-som-star-stilla-pa-passet', tro: 'att-kylan-i-tarna-hor-till-passet', kalla: 'egen-data',
        hookbild: 'Wide, outdoors: a person stands still in boots at a forest edge, breath visible, hands in pockets. First frame: the boots on the cold ground, then up to the face.', hookkalla: 'DRIVE 1gBcR0Fd7E6T7byu6J62CTSDJxWEUcuev [EDITOR PICKS: the parent\'s standing-still outdoor shot; if it does not exist: NEW FOOTAGE — boots on frosty ground, tilt up]',
        make: 'Värmesulorna_PD_1_H2\'s footage and demo kept from second 3 onward. One variable changes: the hook 0–3 s moves from the parent\'s opening to the page\'s own scene (standing still on the hunting stand, the cold creeping up from the toes), as a statement. Every body line is the page\'s own (three levels, the keyring remote, cut to 41–46, USB).',
        hypotes: 'PD_1_H2 carries 24 of 25 purchases while PD_1_H1/H3 with the IDENTICAL text carry 0 — the video\'s first three seconds are the load-bearing component (preliminary lesson, day 4). This iteration swaps only the hook and reads whether the page\'s own scene (the hunter standing still) holds or lifts the parent\'s CTR 2.5 % and purchase rate.',
        isolerad: 'the hook line and its picture (0–3 s); rows 2–5 are the parent\'s footage with the page\'s facts.' },
      { namn: 'Värmesulorna_PD_1_H5', typ: 'I', koncept: 'pd-varma-fotter-pa-passet', iteration: 2, hooktyp: 'mekanismen-forst-fjarren-utan-att-rora-en-fot', mekanik: 'freeze', avatar: 'jagaren-som-star-stilla-pa-passet', tro: 'att-man-maste-ta-av-skorna-for-att-justera', kalla: 'egen-data',
        hookbild: 'Close-up: a gloved thumb presses the keyring remote; the boots stay planted in the snow below. First frame: frozen on the thumb over the button, then the press.', hookkalla: 'DRIVE 1gBcR0Fd7E6T7byu6J62CTSDJxWEUcuev [EDITOR PICKS: the parent\'s remote-in-hand shot; freeze the first frame 0.5 s]',
        make: 'Värmesulorna_PD_1_H2\'s footage and demo kept from second 3 onward. One variable changes: the hook 0–3 s opens on the mechanism (the remote pressed without moving a foot) instead of the problem. Body lines are the page\'s own.',
        hypotes: 'The parent\'s live copy leads with the problem ("Kalla fötter förstör hela dagen"). The remote is the one thing no plain heated insole has and the page\'s own headline ("Tre värmelägen du styr utan att röra en fot"); opening on it reads whether a mechanism-first hook beats the problem-first hook on the same footage (manuslistan\'s second move on a winner).',
        isolerad: 'the hook (0–3 s), mechanism-first against the parent\'s problem-first; rows 2–5 shared with PD_1_H4.' },
      { namn: 'Värmesulorna_PD_3_H1', typ: 'N', koncept: 'pd-star-stilla-pa-jobbet', iteration: 0, hooktyp: 'ny-avatar-den-som-star-stilla-pa-jobbet', mekanik: 'cut-in', avatar: 'den-som-star-stilla-pa-jobbet', tro: 'att-varmesulor-ar-for-jagare', kalla: 'rutin',
        hookbild: 'Medium: a person in work boots stands still on a concrete floor at a loading bay, arms crossed, cold breath. First frame: the boots on concrete, a pallet behind.', hookkalla: 'NEW FOOTAGE: work boots on a concrete floor, static, cold light; fallback: the parent\'s outdoor standing-still shot cropped to the boots',
        make: 'A new 16-second concept on the same product: the same demo beats as PD_1_H2 (cut to size, insole into boot, the remote) but the person and the place are the workday — standing still at a loading bay, a market stall — not the hunting stand. Body lines are the page\'s own.',
        hypotes: 'Guess (no data yet): the page and the winner speak to the hunter on the stand; the mechanism (standing still for hours in the cold) is the same for anyone who works outdoors or on a cold floor, a larger audience. This reads whether a new avatar with the winner\'s demo widens reach without dropping purchase rate. Marked as a guess — no live ad carries this avatar yet.',
        isolerad: 'the avatar (the person and the place) — the demo beats and the offer are the parent\'s.' },
    ],
  },
  {
    nyckel: 'varmesitsen', prefix: 'Varmesits', produkt: 'the heated seat cushion (45 × 90 cm)', minne: 'varmesitsen',
    kampanj: { id: '120250365205900291', namn: 'Värmesitsen 45 × 90 cm | BE ROAS 1.63 | Launch 2026-09-25' },
    hub: '3ea270ab-908c-81cf-a1e4-f281af5ba113', hubnamn: 'Heated seat cushion creative hub', datakalla: 'a92270ab-908c-8208-90cd-87592dc36847',
    drive: { produkt: '1DMvztMNqnPhzk5r3zGbu3jO4W42uBkka', batch: '1hPwwyPc_3dwacDhuwuF0hscQiXOIqXjz', batchNamn: 'Batch #1' },
    landning: 'https://baverbutiken.se/products/varmesits-45-90-cm-4-varmezoner-usb-driven',
    pris: 599, jamfor: 779, prisText: '599 kr, ord. 779 kr', prisNot: 'one variant',
    siffror: ['599', '779', '45', '90', '4', '3', '8', '19'],
    be: { roas: 1.52, aov: 789, cpa: 519 },
    forälder: { namn: 'Varmesits_PD_3', ad: '120250365214170291', video: '1074896685416448', driveFil: '1wO5qDBMWDc3HgRx3wzGnUJnI73u27y7r', langd: null, spend: 4550, kop: 11, roas: 1.91, cpa: 414, vb: 1158,
      beskrivning: 'the product demo (live copy "Står du och fryser på sidlinjen? Lägg den här i stolen, så blir det varmt direkt.") — 93 % of the campaign\'s spend in its first five days, all 11 purchases, CTR 3.5 %, 513 LPV, thruplay 10 % of plays' },
    benchmark: 'Varmesits_PD_3 is itself the top spender and the benchmark; ROAS 1.91 against break-even 1.52 — above break-even but thin (CPA 414 kr against 519 kr), so the batch\'s job is a better opening, not a bigger budget',
    avatar: 'laktarforaldern-som-fryser-pa-sidlinjen', begar: 'njutning', mekanism: 'fyra-varmezoner-over-sits-och-rygg-tre-lagen-med-en-knapp', tro: 'att-en-varmesits-behover-ett-eluttag',
    slutbild: `${CDN}b10-varmesits-hero-se.jpg?v=1789216342`,
    bild: { foto: 'The product hero photo: the black seat cushion with its four heat zones, no people.', ref: 'none — the product has no static with 3 purchases; composition as the other FD statics', parentBild: null },
    extraRegler: [
      'The page\'s only facts: 45 × 90 cm, covers seat and back, 4 heat zones, 3 levels chosen with a button on the cushion, powered by USB, powerbank NOT included. Never "viks ihop och ryms i väskan" (the live copy\'s line, not the page\'s), never a wattage, a temperature or a time, never "fler och fler", never a star or a customer quote.',
      'The page\'s lifestyle pictures are AI-generated illustrations: use the Drive footage or the hero photo, never the illustrations as proof.',
      'The parent\'s captions carry "funkar med powerbank" and "viks ihop" — cut from the clean clips; say "powerbank ingår inte" wherever power is mentioned.',
    ],
    hook: {
      H1: { bild: 'Medium: the cushion laid over a folding chair on a sideline, a hand presses the button on the cushion. First frame: the button under the thumb.', effekt: 'cut-in', mekanik: 'cut-in', kalla: 'DRIVE 1wO5qDBMWDc3HgRx3wzGnUJnI73u27y7r [EDITOR PICKS: the parent\'s button-press shot]', ref: 'parent — the button beat' },
      H2: { bild: 'Close-up: the USB plug goes into a powerbank in a jacket pocket, the cable runs to the cushion. First frame: the plug and the powerbank.', effekt: 'zoom-in 1 s', mekanik: 'zoom-in', kalla: 'DRIVE 1wO5qDBMWDc3HgRx3wzGnUJnI73u27y7r [EDITOR PICKS: the USB/powerbank shot; if none: NEW FOOTAGE — the plug into a powerbank, close-up]', ref: 'parent — the power beat' },
    },
    rader: [
      { bild: 'Medium from behind: a person sits down on the cushion in a folding chair; the cushion covers seat and back up to the shoulder blades.', effekt: 'none', kalla: 'DRIVE 1wO5qDBMWDc3HgRx3wzGnUJnI73u27y7r [EDITOR PICKS: the sit-down shot]', ref: 'parent — demo beat', frihet: 'b-roll order free' },
      { bild: 'Close-up: the cushion flat, the four stitched heat zones visible over seat and back.', effekt: 'slow-mo 0.67× 3 s', kalla: `CDN ${CDN}b10-varmesits-detalj-se.jpg?v=1789216341 (the page\'s detail photo; the flat cushion from the Drive file if it exists)`, ref: '—', frihet: 'crop free' },
      { bild: 'Wide: the person sits still on the cushion in the cold (a sideline), hands around a cup.', effekt: 'none', kalla: 'DRIVE 1wO5qDBMWDc3HgRx3wzGnUJnI73u27y7r [EDITOR PICKS: the sitting-still wide shot]', ref: 'parent — the scene', frihet: 'crop free' },
    ],
    bof: { invandning: 'hur får den ström ute?', svar: 'via USB från en powerbank (ingår inte); tre lägen väljs med knappen på sitsen; fyra värmezoner över sits och rygg, 45 × 90 cm', tro: 'att-en-varmesits-behover-ett-eluttag', siffrorExtra: [],
      h3: 'rader:1', rad2: 'hook:H2', rad3: 'rader:0', klippNot: { rad2: 'in H2 this is the same take as the hook: continue it without a cut (the cable running to the cushion is the second half of the take)' }, fakta: '45 × 90 cm, täcker sits och rygg · 4 värmezoner · 3 lägen, väljs med en knapp på sitsen · drivs via USB · powerbank ingår inte · bilsätet, kontorsstolen eller campingstolen (sidans scener)' },
    // Förstabatchen — veckokvot 2. Levande vinnare över break-even ⇒ 1 vidarebygg + 1 ny vinkel.
    batch: [
      { namn: 'Varmesits_PD_3_H2', typ: 'I', koncept: 'pd-sitt-varmt-pa-sidlinjen', iteration: 1, hooktyp: 'sidans-egen-scen-den-kalla-sitsen', mekanik: 'freeze', avatar: 'laktarforaldern-som-fryser-pa-sidlinjen', tro: 'att-kylan-i-stolen-hor-till', kalla: 'egen-data',
        hookbild: 'Medium: a person lowers onto a bare folding chair on a sideline and flinches at the cold seat. First frame: frozen on the empty cold chair, then the sit-down.', hookkalla: 'DRIVE 1wO5qDBMWDc3HgRx3wzGnUJnI73u27y7r [EDITOR PICKS: the parent\'s sit-down shot before the cushion; if none: NEW FOOTAGE — a bare folding chair in cold light, a person sits and flinches]',
        make: 'Varmesits_PD_3\'s footage and demo kept from second 3 onward. One variable changes: the hook 0–3 s moves from the parent\'s question ("Står du och fryser på sidlinjen?") to the page\'s own scene as a statement (the cold seat felt through the whole body before you have even sat down). Body lines are the page\'s own (seat and back, four zones, three levels with a button, USB, powerbank not included).',
        hypotes: 'PD_3 carries all 11 purchases on 93 % of spend, ROAS 1.91 against break-even 1.52 — above the line but thin. Its hook is a question; the copy rules say a hook is a statement. This iteration keeps the footage and swaps only the hook to a statement built on the page\'s scene, and reads whether the opening lifts CTR (3.5 %) and purchase rate (2.1 % of LPV) — preliminary lesson, day 5.',
        isolerad: 'the hook line and its picture (0–3 s); rows 2–5 are the parent\'s footage with the page\'s facts.' },
      { namn: 'Varmesits_PD_4_H1', typ: 'N', koncept: 'pd-bilsatet-pa-morgonen', iteration: 0, hooktyp: 'ny-avatar-bilforaren-pa-morgonen', mekanik: 'cut-in', avatar: 'bilforaren-med-iskallt-sate-pa-morgonen', tro: 'att-satesvarme-kraver-en-nyare-bil', kalla: 'rutin',
        hookbild: 'Medium, inside a car at dawn: frost on the windscreen, a person sits down on the driver\'s seat with the cushion over it and presses the button. First frame: the frosted windscreen from inside.', hookkalla: 'NEW FOOTAGE: a car seat with the cushion on it, frost on the glass, dawn light; fallback: the parent\'s button-press shot with a caption carrying the scene',
        make: 'A new 16-second concept on the same product: the page\'s first scene — the car seat that is ice cold in the morning — with the same demo beats as PD_3 (cushion over the seat, button, seat and back warm). Body lines are the page\'s own; the cushion runs off a powerbank via USB (powerbank not included).',
        hypotes: 'The page\'s own opening line names the car seat first ("Bilsätet, kontorsstolen eller campingstolen är iskall när du sätter dig på morgonen"); the winner speaks only to the sideline. A driver without seat heating is a different, larger avatar with the same mechanism. Reads whether the page\'s first scene converts as well as the sideline scene. Source: the page (no live ad carries the car avatar).',
        isolerad: 'the avatar and the scene (the car at dawn) — the demo beats and the offer are the parent\'s.' },
    ],
  },
];

// FD_3: samma klippordning som plan-bof.mjs (H1 = hook 1, H2 = hook 2, H3 = tredje klippet; två kroppsrader; slutkort).
function klipp(p, ref) {
  const [typ, i] = ref.split(':');
  const k = typ === 'hook' ? p.hook[i] : p.rader[Number(i)];
  return { bild: k.bild, effekt: k.effekt, mekanik: k.mekanik ?? (k.effekt === 'none' ? 'none' : k.effekt.split(' ')[0]), kalla: k.kalla, ref: k.ref, frihet: k.frihet ?? 'none' };
}
for (const p of PRODUKTER) {
  const b = p.bof;
  p.fd3 = { hook: { H1: klipp(p, 'hook:H1'), H2: klipp(p, b.h2 ?? 'hook:H2'), H3: klipp(p, b.h3) }, rader: [klipp(p, b.rad2), klipp(p, b.rad3)].map((k, i) => (b.klippNot?.[`rad${i + 2}`] ? { ...k, frihet: `${k.frihet}; ${b.klippNot[`rad${i + 2}`]}` } : k)) };
}
export const BILDKONCEPT = [
  { nr: 1, tagg: 'invandningen', jobb: 'answer the objection (the product-aware buyer\'s doubt) in the headline, the page\'s fact in the sub-line' },
  { nr: 2, tagg: 'priset-forst', jobb: 'the price itself is the headline (sale price against compare-at), the sub-line says what he gets' },
  { nr: 3, tagg: 'sista-dagen', jobb: 'the order deadline (19 October) is the headline, the sub-line ties it to Father\'s Day and the product' },
  { nr: 4, tagg: 'vad-han-far', jobb: 'what he gets: the contents/size/fact list from the page as the headline and sub-line' },
];
