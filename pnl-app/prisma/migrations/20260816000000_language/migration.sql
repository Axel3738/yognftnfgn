-- Språkval per butik. Nya installationer får engelska; alla rader som redan
-- finns är ägarens svenska butiker och ska förbli svenska.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en';
UPDATE "ShopSettings" SET "language" = 'sv';
