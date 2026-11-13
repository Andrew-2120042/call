-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "pageButtonShape" SET DEFAULT 'rounded',
ALTER COLUMN "pageTheme" SET DEFAULT 'fog';

-- Move owners from the earlier theme names onto the closest new theme.
UPDATE "users" SET "pageTheme" = CASE "pageTheme"
  WHEN 'paper' THEN 'fog'
  WHEN 'lilac' THEN 'sky'
  WHEN 'mint' THEN 'pine'
  WHEN 'sun' THEN 'butter'
  WHEN 'plum' THEN 'ink'
  WHEN 'blue' THEN 'ink'
  ELSE "pageTheme" END;
