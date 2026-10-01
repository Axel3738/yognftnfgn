// Fakturornas rena delar: multipart-tolkningen, registret och zippen — utan server.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tolkaMultipart, sparaFaktura, lasFakturor, taBortFaktura, byggZip, giltigManad, sakerPersonNyckel, perPerson, nedladdningsnamn, fakturaSokvag } from '../fakturor.mjs';

test('tolkaMultipart: fält och fil ur en riktig webbläsarkropp, bytes orörda', () => {
  const b = '----Gräns123';
  const bin = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xff, 0x0d, 0x0a, 0x2d, 0x2d]);
  const kropp = Buffer.concat([
    Buffer.from(`--${b}\r\nContent-Disposition: form-data; name="manad"\r\n\r\n2026-09\r\n`),
    Buffer.from(`--${b}\r\nContent-Disposition: form-data; name="fil"; filename="fakt ura.pdf"\r\nContent-Type: application/pdf\r\n\r\n`),
    bin,
    Buffer.from(`\r\n--${b}--\r\n`),
  ]);
  const { falt, filer } = tolkaMultipart(kropp, `multipart/form-data; boundary=${b}`);
  assert.equal(falt.manad, '2026-09');
  assert.equal(filer.length, 1);
  assert.equal(filer[0].filnamn, 'fakt ura.pdf');
  assert.equal(filer[0].typ, 'application/pdf');
  assert.ok(filer[0].data.equals(bin), 'nollbyte, 0xff och CRLF inne i filen överlever');
  assert.throws(() => tolkaMultipart(kropp, 'text/plain'), /boundary/);
});

test('sparaFaktura/lasFakturor/taBortFaktura: filen på disk, raden i registret, borttagen försvinner ur listan', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'fakturor-'));
  const register = join(mapp, 'fakturor.jsonl');
  const filmapp = join(mapp, 'filer');
  const nu = new Date('2026-10-01T12:00:00Z');
  const rad = sparaFaktura({ personId: 'jasper', personNamn: 'Jasper Tomboc', kontoId: 'k1', manad: '2026-09', filnamn: 'Faktura sept.PDF', data: Buffer.from('%PDF-1.4 x'), anteckning: 'lön', nu }, { register, mapp: filmapp });
  assert.equal(rad.manad, '2026-09');
  assert.equal(rad.typ, 'application/pdf');
  assert.ok(rad.id.startsWith('2026-10-01-'));
  assert.ok(existsSync(join(filmapp, rad.fil)));
  assert.equal(readFileSync(fakturaSokvag(rad, filmapp), 'utf8'), '%PDF-1.4 x');
  assert.equal(nedladdningsnamn(rad), '2026-09 Jasper Tomboc - Faktura sept.PDF');
  assert.throws(() => sparaFaktura({ personId: 'jasper', manad: '2026-13', filnamn: 'a.pdf', data: Buffer.from('x') }, { register, mapp: filmapp }), /månad/);
  assert.throws(() => sparaFaktura({ personId: 'jasper', manad: '2026-09', filnamn: 'a.exe', data: Buffer.from('x') }, { register, mapp: filmapp }), /PDF eller bild/);
  assert.throws(() => sparaFaktura({ personId: 'jasper', manad: '2026-09', filnamn: 'a.pdf', data: Buffer.alloc(0) }, { register, mapp: filmapp }), /Ingen fil/);
  assert.equal(lasFakturor(register).length, 1);
  taBortFaktura(rad.id, { av: 'Axel' }, register);
  assert.equal(lasFakturor(register).length, 0);
  assert.equal(lasFakturor(register, { medBorttagna: true }).length, 1);
  assert.ok(existsSync(join(filmapp, rad.fil)), 'filen raderas aldrig från disk');
  assert.throws(() => taBortFaktura('finns-inte', {}, register), /finns inte/);
});

test('giltigManad/sakerPersonNyckel/perPerson: bara ÅÅÅÅ-MM, ofarliga mappnamn, grupperat nyast först', () => {
  assert.equal(giltigManad('2026-09'), '2026-09');
  assert.equal(giltigManad('2026-9'), null);
  assert.equal(giltigManad('../2026-09'), null);
  assert.equal(sakerPersonNyckel('Jasper Tomboc/../x'), 'jasper-tomboc-x');
  assert.equal(sakerPersonNyckel(''), null);
  const g = perPerson([
    { id: 'a', personNyckel: 'jasper', personNamn: 'Jasper', manad: '2026-09', uppladdad: '2026-10-01' },
    { id: 'b', personNyckel: 'jerzee', personNamn: 'Jerzee', manad: '2026-08', uppladdad: '2026-09-01' },
    { id: 'c', personNyckel: 'jasper', personNamn: 'Jasper', manad: '2026-08', uppladdad: '2026-09-02' },
  ]);
  assert.deepEqual(g.map((x) => x.namn), ['Jasper', 'Jerzee']);
  assert.equal(g[0].senaste.id, 'a');
  assert.deepEqual(g[0].manader, ['2026-09', '2026-08']);
});

test('byggZip: en zip som unzip faktiskt packar upp', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'zip-'));
  const zip = byggZip([
    { namn: '2026-09 Jasper - faktura.pdf', data: Buffer.from('%PDF-1.4 jasper'), tid: new Date('2026-10-01T10:00:00') },
    { namn: 'åäö.txt', data: Buffer.from('hej'), tid: new Date() },
  ]);
  const fil = join(mapp, 'f.zip');
  writeFileSync(fil, zip);
  const lista = execFileSync('python3', ['-c', `import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); print(z.testzip()); print('|'.join(z.namelist())); print(z.read(z.namelist()[0]).decode())`, fil]).toString();
  assert.match(lista, /^None\n/, 'testzip hittar inga trasiga CRC');
  assert.match(lista, /2026-09 Jasper - faktura\.pdf\|åäö\.txt/);
  assert.match(lista, /%PDF-1\.4 jasper/);
});
