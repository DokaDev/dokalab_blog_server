/*
  Warnings:

  - A unique constraint covering the columns `[board_id,post_number]` on the table `post` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."post_content_idx";

-- AlterTable
ALTER TABLE "public"."board" ALTER COLUMN "slug" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."post_attachment" ADD COLUMN     "committed_at" TIMESTAMP(3),
ADD COLUMN     "is_committed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "post_id" INTEGER;

-- CreateIndex
CREATE INDEX "post_status_idx" ON "public"."post"("status");

-- CreateIndex
CREATE INDEX "post_published_at_idx" ON "public"."post"("published_at");

-- CreateIndex
CREATE INDEX "post_board_id_status_idx" ON "public"."post"("board_id", "status");

-- CreateIndex
CREATE INDEX "post_board_id_published_at_idx" ON "public"."post"("board_id", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "post_board_id_post_number_key" ON "public"."post"("board_id", "post_number");

-- CreateIndex
CREATE INDEX "post_attachment_post_id_idx" ON "public"."post_attachment"("post_id");

-- CreateIndex
CREATE INDEX "post_attachment_is_committed_idx" ON "public"."post_attachment"("is_committed");

-- CreateIndex
CREATE INDEX "post_attachment_uploadState_idx" ON "public"."post_attachment"("uploadState");

-- CreateIndex
CREATE INDEX "post_attachment_uploaded_at_idx" ON "public"."post_attachment"("uploaded_at");

-- CreateIndex
CREATE INDEX "post_attachment_is_committed_uploaded_at_idx" ON "public"."post_attachment"("is_committed", "uploaded_at");

-- AddForeignKey
ALTER TABLE "public"."post_attachment" ADD CONSTRAINT "post_attachment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
