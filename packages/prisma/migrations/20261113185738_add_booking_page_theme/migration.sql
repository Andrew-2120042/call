-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "pageButtonShape" TEXT NOT NULL DEFAULT 'pill',
ADD COLUMN     "pageTheme" TEXT NOT NULL DEFAULT 'paper';
