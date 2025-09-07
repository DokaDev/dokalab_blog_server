/*
  Warnings:

  - You are about to drop the column `uploaded_at` on the `post_attachment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."post_attachment_is_committed_uploaded_at_idx";

-- DropIndex
DROP INDEX "public"."post_attachment_uploaded_at_idx";

-- AlterTable
ALTER TABLE "public"."post_attachment" DROP COLUMN "uploaded_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "post_attachment_created_at_idx" ON "public"."post_attachment"("created_at");

-- CreateIndex
CREATE INDEX "post_attachment_is_committed_created_at_idx" ON "public"."post_attachment"("is_committed", "created_at");
