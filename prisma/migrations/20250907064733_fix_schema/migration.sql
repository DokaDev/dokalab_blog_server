/*
  Warnings:

  - You are about to drop the column `is_committed` on the `post_attachment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."post_attachment_is_committed_created_at_idx";

-- DropIndex
DROP INDEX "public"."post_attachment_is_committed_idx";

-- AlterTable
ALTER TABLE "public"."post_attachment" DROP COLUMN "is_committed";

-- CreateIndex
CREATE INDEX "post_attachment_expires_at_idx" ON "public"."post_attachment"("expires_at");
