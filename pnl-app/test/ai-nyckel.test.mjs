// Vilken Claude-nyckel appen kör på. Körs med `npm test`.
//
// Ordningen är butikens egen nyckel först, serverns som reserv. Vänds den
// betalar Axel för handlarens användning trots att handlaren kopplat sitt
// eget konto — och det syns ingenstans förrän fakturan kommer.
import { test } from "node:test";
import assert from "node:assert/strict";

const { serNyckelUt, maskera } = await import("../app/lib/ai-nyckel.ts");

test("en riktig nyckel godtas", () => {
  assert.equal(serNyckelUt("sk-ant-api03-aaaaaaaaaaaaaaaaaaaa"), true);
  assert.equal(serNyckelUt("  sk-ant-api03-aaaaaaaaaaaaaaaaaaaa  "), true);
});

test("det som inte är en nyckel avvisas", () => {
  assert.equal(serNyckelUt(""), false);
  assert.equal(serNyckelUt("sk-ant-"), false, "för kort");
  assert.equal(serNyckelUt("hej jag vill koppla claude"), false);
  assert.equal(serNyckelUt("sk-proj-aaaaaaaaaaaaaaaaaaaaaa"), false, "annan leverantörs nyckel");
});

test("en nyckel med blanksteg mitt i är en felklistring", () => {
  assert.equal(serNyckelUt("sk-ant-api03-aaaa bbbb-cccccccccc"), false);
});

test("maskeringen lämnar bara de fyra sista tecknen", () => {
  assert.equal(maskera("sk-ant-api03-abcdefgh1234"), "1234");
  assert.equal(maskera("  sk-ant-api03-abcdefgh1234  "), "1234");
});
