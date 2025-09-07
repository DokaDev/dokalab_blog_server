/*
  Warnings:

  - The values [DELETED] on the enum `post_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."post_status_new" AS ENUM ('PUBLISHED', 'DRAFT');
ALTER TABLE "public"."post" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."post" ALTER COLUMN "status" TYPE "public"."post_status_new" USING ("status"::text::"public"."post_status_new");
ALTER TYPE "public"."post_status" RENAME TO "post_status_old";
ALTER TYPE "public"."post_status_new" RENAME TO "post_status";
DROP TYPE "public"."post_status_old";
ALTER TABLE "public"."post" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
