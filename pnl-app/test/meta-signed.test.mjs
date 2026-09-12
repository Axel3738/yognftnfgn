// Tester för signed_request från Meta. Körs med `npm test` (Node ≥ 22.6).
//
// Signaturen är HELA skyddet på /meta/deletion och /meta/deauth: rutterna är
// oautentiserade med flit (Facebook ringer dem), och en accepterad förfalskad
// begäran hade låtit vem som helst koppla bort en handlares annonskostnad.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const { lasSignedRequest } = await import("../app/lib/meta-signed.server.ts");

const HEMLIGHET = "test-app-secret";
const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function bygg(nyttolast, hemlighet = HEMLIGHET) {
  const del = b64url(JSON.stringify(nyttolast));
  const sig = b64url(createHmac("sha256", hemlighet).update(del).digest());
  return `${sig}.${del}`;
}

test("giltig begäran läses", () => {
  const raw = bygg({ algorithm: "HMAC-SHA256", user_id: "1234567890", issued_at: 1757000000 });
  const data = lasSignedRequest(raw, HEMLIGHET);
  assert.equal(data?.user_id, "1234567890");
  assert.equal(data?.issued_at, 1757000000);
});

test("fel hemlighet avvisas", () => {
  const raw = bygg({ algorithm: "HMAC-SHA256", user_id: "1" }, "nagon-annans-secret");
  assert.equal(lasSignedRequest(raw, HEMLIGHET), null);
});

test("ändrad nyttolast avvisas", () => {
  const raw = bygg({ algorithm: "HMAC-SHA256", user_id: "1" });
  const [sig] = raw.split(".");
  const falsk = `${sig}.${b64url(JSON.stringify({ algorithm: "HMAC-SHA256", user_id: "999" }))}`;
  assert.equal(lasSignedRequest(falsk, HEMLIGHET), null);
});

test("annan algoritm avvisas även med rätt signatur", () => {
  const raw = bygg({ algorithm: "AES-256", user_id: "1" });
  assert.equal(lasSignedRequest(raw, HEMLIGHET), null);
});

test("trasiga format avvisas utan att kasta", () => {
  for (const raw of ["", ".", "abc", "a.b.c", "..", "%%%.%%%"]) {
    assert.equal(lasSignedRequest(raw, HEMLIGHET), null, `borde avvisas: ${JSON.stringify(raw)}`);
  }
});

test("tom hemlighet avvisar allt", () => {
  const raw = bygg({ algorithm: "HMAC-SHA256", user_id: "1" });
  assert.equal(lasSignedRequest(raw, ""), null);
});

test("kortare signatur än väntat avvisas utan att kasta", () => {
  const raw = bygg({ algorithm: "HMAC-SHA256", user_id: "1" });
  const [, del] = raw.split(".");
  assert.equal(lasSignedRequest(`${b64url("kort")}.${del}`, HEMLIGHET), null);
});
