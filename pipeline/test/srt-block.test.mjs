// Tester för srt-block.mjs — att en godkänd text flyttas till nya block utan att skrivas om.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { justera, jamfor } from '../srt-block.mjs';

const srt = (...b) => b.map(([a, e, t], i) => `${i + 1}\n${a} --> ${e}\n${t}\n`).join('\n');
const GODKAND = srt(['00:00:00,100', '00:00:02,000', 'Ett.'], ['00:00:02,300', '00:00:05,000', 'Två tre.'], ['00:00:05,400', '00:00:09,000', 'Fyra.']);

test('justera: nya block som är hela följder av godkända block fogas ihop ordagrant', () => {
  const nya = srt(['00:00:00,100', '00:00:05,000', 'HeyGens text'], ['00:00:05,400', '00:00:09,000', 'HeyGens text']);
  const r = justera(GODKAND, nya);
  assert.equal(r.ok, true);
  assert.equal(r.srt, srt(['00:00:00,100', '00:00:05,000', 'Ett. Två tre.'], ['00:00:05,400', '00:00:09,000', 'Fyra.']));
});

test('justera: en ny gräns mitt i ett godkänt block, en annan start eller block över stoppar', () => {
  assert.match(justera(GODKAND, srt(['00:00:00,100', '00:00:03,000', 'x'], ['00:00:03,000', '00:00:09,000', 'y'])).skal, /slutar inte/);
  assert.match(justera(GODKAND, srt(['00:00:00,120', '00:00:09,000', 'x'])).skal, /börjar inte/);
  assert.match(justera(GODKAND, srt(['00:00:00,100', '00:00:05,000', 'x'])).skal, /blev över/);
});

test('jamfor: samma ord i annan blockindelning är identiskt, ett ändrat ord syns med sammanhang', () => {
  const ny = srt(['00:00:00,100', '00:00:03,000', 'Ett. Två'], ['00:00:03,000', '00:00:09,000', 'tre. Fyra.']);
  assert.deepEqual(jamfor(GODKAND, ny), []);
  const andrad = srt(['00:00:00,100', '00:00:09,000', 'Ett. Två tre! Fyra.']);
  assert.deepEqual(jamfor(GODKAND, andrad), [{ bort: 'tre.', till: 'tre!', efter: 'Ett. Två' }]);
});
