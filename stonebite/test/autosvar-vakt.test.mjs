// Vakten som håller autosvarets minutserver igång på Railway.
//
// Axels krav 2026-09-22: arga kunder ska få svar inom 60 sekunder, så boten
// måste snurra hela tiden — inte en gång i timmen. Testerna startar ingen
// riktig process: spawn, timer och klockan är fejk. Det som bevisas:
//   • inget startar utan AUTOSVAR_BRANDS
//   • torrt om inte skarpt står uttryckligen
//   • flaggorna är exakt de en människa hade skrivit
//   • loggen pekar på volymen, aldrig på containern
//   • saknat mejllösenord ⇒ vakten startar inte och säger vilket
//   • dör processen startas den om, med växande paus, aldrig två samtidigt

import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { vaktKonfig, vaktArgv, startaVakt, loggmappFor, OMSTART_MIN_S, OMSTART_MAX_S, LANGT_LIV_MS } from '../autosvar-vakt.mjs';

const ROT = '/repo';
const BAS = { STONEBITE_DATA: '/data', KUNDTJANST_MAIL_PASS_BAVERBUTIKEN: 'x' };

function fejk() {
  const startade = [];
  const timers = [];
  let klocka = 1_000_000;
  const spawnFn = (cmd, argv, opts) => {
    const barn = new EventEmitter();
    barn.kill = (sig) => { barn.dodad = sig; };
    startade.push({ cmd, argv, opts, barn });
    return barn;
  };
  const timer = (fn, ms) => { timers.push({ fn, ms }); };
  const nu = () => klocka;
  return { spawnFn, timer, nu, startade, timers, tick: (ms) => { klocka += ms; }, logg: [] };
}

test('utan AUTOSVAR_BRANDS händer ingenting — sajten är som förut', () => {
  assert.equal(vaktKonfig({}, ROT), null);
  assert.equal(vaktKonfig({ AUTOSVAR_BRANDS: ' , ' }, ROT), null);
  assert.equal(startaVakt({ env: {}, rot: ROT, spawnFn: () => { throw new Error('får inte startas'); } }), null);
});

test('konfigurationen: torrt som standard, skarpt bara uttryckligen, loggen på volymen, minst 30 s', () => {
  const k = vaktKonfig({ ...BAS, AUTOSVAR_BRANDS: 'baverbutiken' }, ROT);
  assert.deepEqual(k, { brands: ['baverbutiken'], lage: 'torr', loop: 60, loggmapp: '/data/autosvar/logg', discord: false, saknar: [] });
  assert.equal(vaktKonfig({ ...BAS, AUTOSVAR_BRANDS: 'baverbutiken', AUTOSVAR_LAGE: 'ja' }, ROT).lage, 'torr', '"ja" är inte skarpt');
  assert.equal(vaktKonfig({ ...BAS, AUTOSVAR_BRANDS: 'baverbutiken', AUTOSVAR_LAGE: 'Skarpt' }, ROT).lage, 'skarpt');
  assert.equal(vaktKonfig({ ...BAS, AUTOSVAR_BRANDS: 'baverbutiken', AUTOSVAR_LOOP: '5' }, ROT).loop, 30, 'aldrig tätare än 30 s — brevlådan ska inte hamras');
  assert.equal(vaktKonfig({ ...BAS, AUTOSVAR_BRANDS: 'baverbutiken', AUTOSVAR_LOGGMAPP: '/annan/logg' }, ROT).loggmapp, '/annan/logg');
  assert.equal(loggmappFor({}, ROT), '/repo/stonebite/data/autosvar/logg', 'utan volym: repots datamapp, aldrig kundtjanst/autosvar/logg (den är gitens)');
  assert.deepEqual(vaktKonfig({ ...BAS, AUTOSVAR_BRANDS: 'Baverbutiken, carashell,baverbutiken', KUNDTJANST_MAIL_PASS_CARASHELL: 'y' }, ROT).brands, ['baverbutiken', 'carashell']);
});

test('flaggorna är exakt de en människa hade skrivit', () => {
  const k = vaktKonfig({ ...BAS, AUTOSVAR_BRANDS: 'baverbutiken' }, ROT);
  assert.deepEqual(vaktArgv(k), ['kundtjanst/autosvar.mjs', '--brand', 'baverbutiken', '--torr', '--loop', '60']);
  assert.deepEqual(vaktArgv({ ...k, lage: 'skarpt', discord: true, loop: 90 }), ['kundtjanst/autosvar.mjs', '--brand', 'baverbutiken', '--skarpt', '--loop', '90', '--discord']);
});

test('saknat mejllösenord ⇒ vakten startar inte och säger vilken variabel', () => {
  const f = fejk();
  const v = startaVakt({ env: { STONEBITE_DATA: '/data', AUTOSVAR_BRANDS: 'baverbutiken' }, rot: ROT, spawnFn: f.spawnFn, timer: f.timer, nu: f.nu, logg: (m) => f.logg.push(m) });
  assert.equal(f.startade.length, 0);
  assert.deepEqual(v.status().saknar, ['KUNDTJANST_MAIL_PASS_BAVERBUTIKEN']);
  assert.equal(v.status().kor, false);
  assert.match(f.logg[0], /startar INTE — mejllösenordet saknas i miljön: KUNDTJANST_MAIL_PASS_BAVERBUTIKEN/);
});

test('startar minutservern med loggen på volymen, och startar om med växande paus när den dör', () => {
  const f = fejk();
  const env = { ...BAS, AUTOSVAR_BRANDS: 'baverbutiken', HTTPS_PROXY: 'http://proxy' };
  const v = startaVakt({ env, rot: ROT, spawnFn: f.spawnFn, timer: f.timer, nu: f.nu, logg: (m) => f.logg.push(m) });
  assert.equal(f.startade.length, 1);
  const forsta = f.startade[0];
  assert.equal(forsta.cmd, process.execPath);
  assert.deepEqual(forsta.argv, ['kundtjanst/autosvar.mjs', '--brand', 'baverbutiken', '--torr', '--loop', '60']);
  assert.equal(forsta.opts.cwd, ROT);
  assert.equal(forsta.opts.env.AUTOSVAR_LOGGMAPP, '/data/autosvar/logg', 'barnet skriver på volymen');
  assert.equal(forsta.opts.env.NODE_USE_ENV_PROXY, '1', 'autosvar.mjs får inte starta om sig självt bakom proxyn — två processer vore ett dubbelsvar');
  assert.equal(v.status().kor, true);
  assert.match(f.logg[0], /minutservern igång — TORR, var 60:e sekund, baverbutiken, logg \/data\/autosvar\/logg/);

  // Dör direkt: paus 60 s (30 × 2), sedan 120, 240 … aldrig över 600.
  f.tick(5_000); forsta.barn.emit('exit', 1, null);
  assert.equal(v.status().kor, false);
  assert.equal(v.status().omstarter, 1);
  assert.deepEqual(v.status().senasteUtgang.kod, 1);
  assert.equal(f.timers.at(-1).ms, 60_000);
  assert.equal(f.startade.length, 1, 'ingen ny process förrän pausen gått — aldrig två samtidigt');
  f.timers.at(-1).fn();
  assert.equal(f.startade.length, 2);
  f.tick(5_000); f.startade[1].barn.emit('exit', null, 'SIGKILL');
  assert.equal(f.timers.at(-1).ms, 120_000);
  f.timers.at(-1).fn();
  for (let i = 0; i < 6; i++) { f.tick(1_000); f.startade.at(-1).barn.emit('exit', 1, null); f.timers.at(-1).fn(); }
  assert.equal(f.timers.at(-1).ms, OMSTART_MAX_S * 1000, 'pausen stannar på taket');

  // Levde länge ⇒ pausen börjar om från minimum.
  f.tick(LANGT_LIV_MS + 1); f.startade.at(-1).barn.emit('exit', 0, null);
  assert.equal(f.timers.at(-1).ms, OMSTART_MIN_S * 1000);

  // stopp(): barnet får SIGTERM och ingen omstart schemaläggs.
  f.timers.at(-1).fn();
  const sista = f.startade.at(-1);
  const antalTimers = f.timers.length;
  v.stopp();
  assert.equal(sista.barn.dodad, 'SIGTERM');
  sista.barn.emit('exit', null, 'SIGTERM');
  assert.equal(f.timers.length, antalTimers, 'efter stopp startas inget om');
});
