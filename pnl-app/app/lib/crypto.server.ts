/**
 * Kryptering av tredjepartstokens i vila.
 *
 * Meta-token ger full läsåtkomst till ett annonskonto. I en publik app är det
 * andra handlares konton som ligger i vår databas — deras nycklar i vårt
 * förvar. Läcker databasen ska raderna vara obrukbara utan nyckeln, och
 * nyckeln bor i miljön, inte i databasen.
 *
 * AES-256-GCM: autentiserad kryptering, så manipulerad text upptäcks vid
 * dekryptering istället för att tolkas som en giltig token.
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

const PREFIX = "enc:v1:";

/**
 * Nyckel ur miljön. Godtar valfri sträng och härleder 32 byte ur den, så att
 * en slarvigt satt variabel inte tyst ger svagare kryptering än väntat.
 */
function key(): Buffer | null {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw || raw.length < 16) return null;
  return createHash("sha256").update(raw).digest();
}

/** True när miljön är rustad att kryptera. Publika installationer kräver det. */
export function encryptionAvailable(): boolean {
  return key() !== null;
}

/**
 * Krypterar. Saknas nyckel returneras värdet oförändrat — en butik som redan
 * kör ska inte sluta fungera för att variabeln inte hunnit sättas, och
 * `encryptionAvailable()` finns för att kunna säga ifrån på rätt ställe.
 */
export function encrypt(plain: string): string {
  const k = key();
  if (!k || !plain) return plain;
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", k, iv);
  const data = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  const tag = c.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, data]).toString("base64");
}

/**
 * Dekrypterar. Värden utan prefix lämnas orörda — de skrevs innan
 * krypteringen fanns och måste fortsätta fungera tills de skrivs om.
 */
export function decrypt(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (!stored.startsWith(PREFIX)) return stored; // klartext från tiden före
  const k = key();
  if (!k) {
    console.error("Krypterad token men ingen TOKEN_ENCRYPTION_KEY satt.");
    return null;
  }
  try {
    const buf = Buffer.from(stored.slice(PREFIX.length), "base64");
    const d = createDecipheriv("aes-256-gcm", k, buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
  } catch (e) {
    // Fel nyckel eller manipulerad rad. Att returnera skräp vore värre.
    console.error("Kunde inte dekryptera token:", (e as Error).message);
    return null;
  }
}
