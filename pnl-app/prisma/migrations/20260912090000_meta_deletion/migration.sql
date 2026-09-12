-- Kvitto på Metas Data Deletion Request Callback. Krävs för att Meta-appen
-- ska få gå Live, och därmed för att handlare utan roll i appen ska kunna
-- logga in med Facebook. Inget användar-id i klartext — bara en hash.
CREATE TABLE IF NOT EXISTS "MetaDeletion" (
  "code"        TEXT NOT NULL,
  "userHash"    TEXT NOT NULL,
  "shops"       INTEGER NOT NULL DEFAULT 0,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "MetaDeletion_pkey" PRIMARY KEY ("code")
);
