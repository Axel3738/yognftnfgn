/**
 * `signed_request` från Meta — formatet Facebook använder när DE ringer OSS.
 *
 * Två callbacks kräver det: "Deauthorize" (användaren tog bort appen på
 * Facebook) och "Data Deletion Request" (användaren begärde radering). Båda
 * är oautentiserade rutter som vem som helst kan POSTa till — signaturen är
 * hela skyddet, så den verifieras innan ett enda tecken av innehållet tros på.
 *
 * Formatet: "<base64url(signatur)>.<base64url(JSON)>". Signaturen är
 * HMAC-SHA256 över den andra delen SOM TEXT (inte över den avkodade JSON:en)
 * med appens secret som nyckel.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export interface SignedRequest {
  algorithm?: string;
  /** Facebook-användarens app-scoped id — samma form som metaUserId. */
  user_id?: string;
  issued_at?: number;
}

const fromBase64Url = (s: string): Buffer =>
  Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

/**
 * Returnerar innehållet bara när signaturen stämmer. Null vid allt annat —
 * fel format, fel algoritm, fel signatur, otolkbar JSON. Anroparen ska svara
 * 400 utan att avslöja vilket av felen det var.
 */
export function lasSignedRequest(raw: string, appSecret: string): SignedRequest | null {
  if (!raw || !appSecret) return null;
  const delar = raw.split(".");
  if (delar.length !== 2) return null;
  const [sig, nyttolast] = delar;

  const vantad = createHmac("sha256", appSecret).update(nyttolast).digest();
  const given = fromBase64Url(sig);
  /* Längdkoll först: timingSafeEqual kastar på olika längd. */
  if (given.length !== vantad.length || !timingSafeEqual(given, vantad)) return null;

  try {
    const data = JSON.parse(fromBase64Url(nyttolast).toString("utf8")) as SignedRequest;
    /* Metas egen dokumentation säger att andra algoritmer ska avvisas. */
    if (data?.algorithm && data.algorithm.toUpperCase() !== "HMAC-SHA256") return null;
    return data;
  } catch {
    return null;
  }
}

/** `signed_request` ur en POST — Meta skickar den som formulärfält. */
export async function signedRequestUrKropp(request: Request): Promise<string> {
  const typ = request.headers.get("content-type") ?? "";
  if (typ.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return String((body as any)?.signed_request ?? "");
  }
  const form = await request.formData().catch(() => null);
  return String(form?.get("signed_request") ?? "");
}
