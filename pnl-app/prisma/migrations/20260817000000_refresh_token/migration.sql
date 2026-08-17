-- Sessionslagringen v10 skriver refresh-token-fält för utgående offline-nycklar.
ALTER TABLE "Session" ADD COLUMN "refreshToken" TEXT;
ALTER TABLE "Session" ADD COLUMN "refreshTokenExpires" TIMESTAMP(3);
