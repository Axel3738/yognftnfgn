#!/usr/bin/env node
// Genererar ett arbetsschema som .ics-kalender med notiser (VALARM).
// Importera arbetsschema.ics i Google/Apple Kalender -> notiser i mobilen,
// varje arbetsblock, varje dag. Kör: `node schema/generate.mjs`.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// KONFIG – ändra här och kör om skriptet.
// ---------------------------------------------------------------------------

// Vilka veckodagar arbetsschemat gäller (MO,TU,WE,TH,FR,SA,SU).
const ARBETSDAGAR = ["MO", "TU", "WE", "TH", "FR"];

// Det återkommande dagsschemat. tid = "HH:MM", min = längd i minuter,
// notis = true om blocket ska pinga mobilen när det börjar.
const DAGSSCHEMA = [
  { tid: "08:00", min: 30,  namn: "☀️ Morgonrutin + planera dagen", notis: true,
    beskrivning: "Vad är dagens ETT viktigaste? Skriv ner det innan du börjar." },
  { tid: "08:30", min: 90,  namn: "🎯 Djupfokus 1 (dagens viktigaste)", notis: true,
    beskrivning: "Mobil på flyg. En sak. Inga notiser, inga flikar. Kör." },
  { tid: "10:00", min: 15,  namn: "💧 Paus – rör på dig + vatten", notis: true,
    beskrivning: "Upp ur stolen. Fönster öppet. Inte skärm." },
  { tid: "10:15", min: 90,  namn: "🎯 Djupfokus 2", notis: true,
    beskrivning: "Fortsätt där du var. Bygg vidare på vinnaren." },
  { tid: "11:45", min: 45,  namn: "🍽️ Lunch (riktig mat, borta från skärmen)", notis: true,
    beskrivning: "Äter du ordentligt orkar du eftermiddagen. Ingen jobbmobil." },
  { tid: "12:30", min: 90,  namn: "🎯 Djupfokus 3", notis: true,
    beskrivning: "Efter-lunch-blocket. Ta det tyngsta nu medan du är mätt." },
  { tid: "14:00", min: 20,  namn: "🚶 Paus – ut och gå", notis: true,
    beskrivning: "Frisk luft 20 min. Hjärnan jobbar vidare i bakgrunden." },
  { tid: "14:20", min: 90,  namn: "🎯 Djupfokus 4", notis: true,
    beskrivning: "Sista långa blocket. Landa det du började på." },
  { tid: "15:50", min: 15,  namn: "☕ Kort paus", notis: true,
    beskrivning: "Sträck på dig. Vatten. Snart klart." },
  { tid: "16:05", min: 70,  namn: "🧹 Admin/analys/svara", notis: true,
    beskrivning: "Grunt arbete: analysera ads-data, svara meddelanden, städa." },
  { tid: "17:15", min: 15,  namn: "✅ Dagsavslut – logga vad du gjorde", notis: true,
    beskrivning: "Skriv 3 rader: vad blev klart, vad är nästa steg imorgon. Klart för idag." },
];

// Uppkörning + förberedelser (engångshändelser). Datum: YYYY-MM-DD.
const HANDELSER = [
  { datum: "2026-07-09", tid: "18:00", min: 60, namn: "🏍️ MC-pass: öva momenten", notis: true,
    beskrivning: "Backning, lågfart/balans, bromsprov, blickteknik. De som brukar fälla folk." },
  { datum: "2026-07-10", tid: "18:00", min: 60, namn: "🏍️ MC-pass: repetera svagheterna", notis: true,
    beskrivning: "Kör bara det som kändes vingligt igår tills det sitter." },
  { datum: "2026-07-11", tid: "11:00", min: 75, namn: "🏍️ MC-pass: genrep hela uppkörningen", notis: true,
    beskrivning: "Kör igenom som om det vore skarpt läge. Fullt utrustad." },
  { datum: "2026-07-12", tid: "21:30", min: 30, namn: "😴 Förbered inför uppkörningen", notis: true,
    beskrivning: "Lägg fram kläder/hjälm/handskar. Sov ut – utvilad hjärna kör bättre än en trött." },
  { datum: "2026-07-13", tid: "07:30", min: 60, namn: "🏍️🎯 UPPKÖRNING IDAG – ändra tiden!", notis: true,
    beskrivning: "Ät ordentlig frukost. Kom i GOD tid. Andas lugnt. Du har övat – lita på det. (Ändra denna tid till din faktiska uppkörningstid.)" },
];

// ---------------------------------------------------------------------------
// Generator – rör inte om du inte vet vad du gör.
// ---------------------------------------------------------------------------

function addMinutes(hhmm, min) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + min;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}${mm}00`;
}
const stamp = (hhmm) => hhmm.replace(":", "") + "00";
const uid = (s) => `${s}@grillkliniken-schema`;

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Stockholm",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

function alarm(namn) {
  return [
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${namn}`,
    "TRIGGER:PT0S",
    "END:VALARM",
  ];
}

function recurringEvent(block, idx) {
  const base = "20260709"; // torsdag – giltig startdag
  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid("dag-" + idx)}`,
    "DTSTAMP:20260709T060000Z",
    `DTSTART;TZID=Europe/Stockholm:${base}T${stamp(block.tid)}`,
    `DTEND;TZID=Europe/Stockholm:${base}T${addMinutes(block.tid, block.min)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${ARBETSDAGAR.join(",")}`,
    `SUMMARY:${block.namn}`,
    `DESCRIPTION:${block.beskrivning}`,
  ];
  if (block.notis) lines.push(...alarm(block.namn));
  lines.push("END:VEVENT");
  return lines;
}

function singleEvent(ev, idx) {
  const d = ev.datum.replace(/-/g, "");
  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid("handelse-" + idx)}`,
    "DTSTAMP:20260709T060000Z",
    `DTSTART;TZID=Europe/Stockholm:${d}T${stamp(ev.tid)}`,
    `DTEND;TZID=Europe/Stockholm:${d}T${addMinutes(ev.tid, ev.min)}`,
    `SUMMARY:${ev.namn}`,
    `DESCRIPTION:${ev.beskrivning}`,
  ];
  if (ev.notis) lines.push(...alarm(ev.namn));
  lines.push("END:VEVENT");
  return lines;
}

const out = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Grillkliniken//Arbetsschema//SV",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  "X-WR-CALNAME:Arbetsschema + Uppkörning",
  "X-WR-TIMEZONE:Europe/Stockholm",
  ...VTIMEZONE,
  ...DAGSSCHEMA.flatMap(recurringEvent),
  ...HANDELSER.flatMap(singleEvent),
  "END:VCALENDAR",
];

// ICS kräver CRLF radbrytningar.
const ics = out.join("\r\n") + "\r\n";
const target = join(HERE, "arbetsschema.ics");
writeFileSync(target, ics, "utf8");

const effektivMin = DAGSSCHEMA.filter((b) => b.namn.includes("Djupfokus") || b.namn.includes("Admin"))
  .reduce((s, b) => s + b.min, 0);
console.log(`Skrev ${target}`);
console.log(`Arbetsdagar: ${ARBETSDAGAR.join(", ")}`);
console.log(`Effektiv arbetstid/dag: ${(effektivMin / 60).toFixed(1)} h (${DAGSSCHEMA.length} block totalt)`);
console.log(`Engångshändelser (uppkörning m.m.): ${HANDELSER.length}`);
