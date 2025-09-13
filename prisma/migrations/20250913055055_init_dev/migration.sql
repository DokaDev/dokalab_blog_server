-- CreateEnum
CREATE TYPE "public"."post_status" AS ENUM ('PUBLISHED', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."attachment_upload_state" AS ENUM ('PENDING', 'READY');

-- CreateTable
CREATE TABLE "public"."board_group" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT,

    CONSTRAINT "board_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."board" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "board_group_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post" (
    "id" SERIAL NOT NULL,
    "post_number" INTEGER,
    "title" VARCHAR(256) NOT NULL,
    "content" TEXT NOT NULL,
    "status" "public"."post_status" NOT NULL DEFAULT 'DRAFT',
    "board_id" INTEGER NOT NULL,
    "read_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_attachment" (
    "id" SERIAL NOT NULL,
    "uploadState" "public"."attachment_upload_state" NOT NULL DEFAULT 'PENDING',
    "original_filename" VARCHAR(256) NOT NULL,
    "mime_type" VARCHAR(128) NOT NULL,
    "size" INTEGER NOT NULL,
    "post_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upload_expires_at" TIMESTAMP(3) NOT NULL,
    "commit_expires_at" TIMESTAMP(3),
    "committed_at" TIMESTAMP(3),

    CONSTRAINT "post_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_slug_key" ON "public"."board"("slug");

-- CreateIndex
CREATE INDEX "board_board_group_id_idx" ON "public"."board"("board_group_id");

-- CreateIndex
CREATE INDEX "post_board_id_idx" ON "public"."post"("board_id");

-- CreateIndex
CREATE INDEX "post_status_idx" ON "public"."post"("status");

-- CreateIndex
CREATE INDEX "post_published_at_idx" ON "public"."post"("published_at");

-- CreateIndex
CREATE INDEX "post_board_id_status_idx" ON "public"."post"("board_id", "status");

-- CreateIndex
CREATE INDEX "post_board_id_published_at_idx" ON "public"."post"("board_id", "published_at");

-- CreateIndex
CREATE INDEX "post_title_idx" ON "public"."post"("title");

-- CreateIndex
CREATE INDEX "post_post_number_idx" ON "public"."post"("post_number");

-- CreateIndex
CREATE UNIQUE INDEX "post_board_id_post_number_key" ON "public"."post"("board_id", "post_number");

-- CreateIndex
CREATE INDEX "post_attachment_post_id_idx" ON "public"."post_attachment"("post_id");

-- CreateIndex
CREATE INDEX "post_attachment_uploadState_idx" ON "public"."post_attachment"("uploadState");

-- CreateIndex
CREATE INDEX "post_attachment_created_at_idx" ON "public"."post_attachment"("created_at");

-- CreateIndex
CREATE INDEX "post_attachment_upload_expires_at_idx" ON "public"."post_attachment"("upload_expires_at");

-- CreateIndex
CREATE INDEX "post_attachment_commit_expires_at_idx" ON "public"."post_attachment"("commit_expires_at");

-- AddForeignKey
ALTER TABLE "public"."board" ADD CONSTRAINT "board_board_group_id_fkey" FOREIGN KEY ("board_group_id") REFERENCES "public"."board_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_attachment" ADD CONSTRAINT "post_attachment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
