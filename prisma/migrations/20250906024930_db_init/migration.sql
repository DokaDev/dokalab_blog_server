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
    "slug" VARCHAR(40) NOT NULL,
    "description" TEXT,
    "board_group_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "content" TEXT NOT NULL,
    "board_id" INTEGER NOT NULL,
    "read_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_slug_key" ON "public"."board"("slug");

-- CreateIndex
CREATE INDEX "board_board_group_id_idx" ON "public"."board"("board_group_id");

-- CreateIndex
CREATE INDEX "post_board_id_idx" ON "public"."post"("board_id");

-- CreateIndex
CREATE INDEX "post_title_idx" ON "public"."post"("title");

-- AddForeignKey
ALTER TABLE "public"."board" ADD CONSTRAINT "board_board_group_id_fkey" FOREIGN KEY ("board_group_id") REFERENCES "public"."board_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
