-- Vad en påbörjad Facebook-inloggning är till för. Null = en handlare kopplar
-- sin butik (allt som fanns förut). "granskning" = Metas granskare testar
-- flödet på /meta/granska, och då sparas ingenting.
ALTER TABLE "MetaLoginState" ADD COLUMN IF NOT EXISTS "syfte" TEXT;
