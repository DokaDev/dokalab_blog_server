/*
  Warnings:

  - You are about to drop the column `expires_at` on the `post_attachment` table. All the data in the column will be lost.
  - Added the required column `uploade_expires_at` to the `post_attachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."post_attachment_expires_at_idx";

-- AlterTable
ALTER TABLE "public"."post_attachment" DROP COLUMN "expires_at",
ADD COLUMN     "commit_expires_at" TIMESTAMP(3),
ADD COLUMN     "uploade_expires_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "post_attachment_uploade_expires_at_idx" ON "public"."post_attachment"("uploade_expires_at");

-- CreateIndex
CREATE INDEX "post_attachment_commit_expires_at_idx" ON "public"."post_attachment"("commit_expires_at");
